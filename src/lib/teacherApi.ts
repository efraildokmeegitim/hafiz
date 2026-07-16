import { db } from './firebase';
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { UserProfile } from './auth';

export const getStudentsForTeacher = async (teacherId: string): Promise<UserProfile[]> => {
  try {
    const q = query(collection(db, "users"), where("role", "==", "student"), where("teacherId", "==", teacherId));
    const querySnapshot = await getDocs(q);
    const students: UserProfile[] = [];
    querySnapshot.forEach((doc) => {
      students.push(doc.data() as UserProfile);
    });
    return students;
  } catch (error) {
    console.error("Error fetching students:", error);
    return [];
  }
};

export const joinClass = async (studentUid: string, classCode: string) => {
  try {
    // Sınıf kodu aslında hocanın uid'si olsun şimdilik
    const teacherRef = doc(db, "users", classCode);
    const teacherSnap = await getDoc(teacherRef);
    if (!teacherSnap.exists() || teacherSnap.data().role !== "teacher") {
      throw new Error("Geçersiz sınıf kodu veya hoca bulunamadı.");
    }
    
    const studentRef = doc(db, "users", studentUid);
    await updateDoc(studentRef, {
      teacherId: classCode
    });
    return true;
  } catch (error) {
    console.error("Error joining class:", error);
    throw error;
  }
};
