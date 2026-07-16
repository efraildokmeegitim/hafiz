import { db } from './firebase';
import { collection, doc, setDoc, getDoc, updateDoc, arrayUnion, query, where, getDocs } from 'firebase/firestore';
import { UserProfile } from './auth';

export interface GroupData {
  id: string;
  name: string;
  adminId: string;
  members: string[]; // UIDs
}

// Create a new group
export const createGroup = async (name: string, adminId: string): Promise<string> => {
  const newGroupRef = doc(collection(db, "groups"));
  const groupData: GroupData = {
    id: newGroupRef.id,
    name,
    adminId,
    members: [adminId] // Admin is automatically a member
  };
  await setDoc(newGroupRef, groupData);
  return newGroupRef.id;
};

// Join a group by ID
export const joinGroup = async (groupId: string, userId: string): Promise<void> => {
  const groupRef = doc(db, "groups", groupId);
  const snap = await getDoc(groupRef);
  if (!snap.exists()) {
    throw new Error("Grup bulunamadı.");
  }
  await updateDoc(groupRef, {
    members: arrayUnion(userId)
  });
};

// Get groups a user is a member of
export const getUserGroups = async (userId: string): Promise<GroupData[]> => {
  const q = query(collection(db, "groups"), where("members", "array-contains", userId));
  const snap = await getDocs(q);
  const groups: GroupData[] = [];
  snap.forEach(d => groups.push(d.data() as GroupData));
  return groups;
};

// Get all profiles of members in a group
export const getGroupMembers = async (groupId: string): Promise<UserProfile[]> => {
  const groupRef = doc(db, "groups", groupId);
  const snap = await getDoc(groupRef);
  if (!snap.exists()) return [];
  
  const memberUids: string[] = snap.data().members || [];
  if (memberUids.length === 0) return [];
  
  // Firestore 'in' query has a max of 10 items, but we can do it in batches or just multiple fetches
  // For simplicity, we'll fetch them individually since groups might be small
  const profiles: UserProfile[] = [];
  for (const uid of memberUids) {
    const userSnap = await getDoc(doc(db, "users", uid));
    if (userSnap.exists()) {
      profiles.push(userSnap.data() as UserProfile);
    }
  }
  return profiles;
};
