import { db, auth } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export type PageStatus = "yeni" | "cig" | "has" | "tamam";

export interface PageData {
  status: PageStatus;
  updatedAt: number;
  nextReviewAt?: number;
  reviewIntervalIndex?: number;
}

export interface HafizlikState {
  cuzMethod: "osmanli" | "duz";
  pages: Record<number, PageData>; // key: 1-604
  lastStudiedAt: number | null;
  currentStreak: number;
  badges: string[];
  studyHistory: Record<string, number>; // Format: "YYYY-MM-DD" -> pages count
}

const DEFAULT_STATE: HafizlikState = {
  cuzMethod: "osmanli",
  pages: {},
  lastStudiedAt: null,
  currentStreak: 0,
  badges: [],
  studyHistory: {},
};

const STORAGE_KEY = "hafiz_app_state";

export const REVIEW_INTERVALS = [1, 3, 7, 14, 30, 90]; // Days

export const scheduleReviewForPage = (page: PageData, success: boolean) => {
  if (success) {
    const nextIndex = (page.reviewIntervalIndex ?? -1) + 1;
    const boundedIndex = Math.min(nextIndex, REVIEW_INTERVALS.length - 1);
    page.reviewIntervalIndex = boundedIndex;
    
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + REVIEW_INTERVALS[boundedIndex]);
    page.nextReviewAt = nextReviewDate.getTime();
  } else {
    page.reviewIntervalIndex = 0;
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + 1);
    page.nextReviewAt = nextReviewDate.getTime();
    page.status = "cig";
  }
};

export const getHafizlikState = (): HafizlikState => {
  if (typeof window === "undefined") return DEFAULT_STATE;
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return DEFAULT_STATE;
  try {
    const parsed = JSON.parse(data);
    // Migration for older version
    if (parsed.pages && Object.keys(parsed.pages).length > 0) {
      const firstKey = Object.keys(parsed.pages)[0];
      if (typeof parsed.pages[firstKey] === "string") {
        const newPages: Record<number, PageData> = {};
        for (const [key, val] of Object.entries(parsed.pages)) {
          newPages[parseInt(key)] = {
            status: val as PageStatus,
            updatedAt: Date.now()
          };
        }
        parsed.pages = newPages;
      }
    }
    return { ...DEFAULT_STATE, ...parsed };
  } catch (e) {
    return DEFAULT_STATE;
  }
};

export const saveHafizlikState = (state: HafizlikState): void => {
  if (typeof window === "undefined") return;
  const now = new Date();
  const todayStr = now.toDateString();
  const lastStr = state.lastStudiedAt ? new Date(state.lastStudiedAt).toDateString() : null;
  
  if (lastStr !== todayStr) {
    if (state.lastStudiedAt) {
      const yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);
      if (lastStr === yesterday.toDateString()) {
        state.currentStreak += 1;
      } else {
        state.currentStreak = 1; // reset
      }
    } else {
      state.currentStreak = 1;
    }
    state.lastStudiedAt = now.getTime();
  }

  // Check and unlock badges
  const newBadges = new Set(state.badges || []);
  const hasPagesCount = Object.values(state.pages).filter(p => p.status === 'has').length;
  
  if (hasPagesCount >= 1) newBadges.add('first_page');
  if (hasPagesCount >= 20) newBadges.add('first_juz');
  if (state.currentStreak >= 3) newBadges.add('streak_3');
  if (state.currentStreak >= 7) newBadges.add('streak_7');
  if (state.currentStreak >= 30) newBadges.add('streak_30');

  state.badges = Array.from(newBadges);
  
  if (!state.studyHistory) state.studyHistory = {};
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

  // Sync with Firestore if logged in
  const user = auth.currentUser;
  if (user) {
    const docRef = doc(db, 'users', user.uid);
    setDoc(docRef, { state }, { merge: true }).catch(err => {
      console.error("Firestore sync error:", err);
    });
  }
};

export const syncStateFromCloud = async (): Promise<HafizlikState | null> => {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data().state) {
      const cloudState = docSnap.data().state as HafizlikState;
      // Overwrite local with cloud state
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudState));
      return cloudState;
    }
  } catch (error: any) {
    if (error.message && error.message.includes("offline")) {
      console.log("Offline mode: skip cloud sync.");
    } else {
      console.error("Cloud fetch error:", error);
    }
  }
  return null;
};
