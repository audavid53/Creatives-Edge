import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

export const uploadSubmissionVideo = async (userId: string, dayNumber: number, blob: Blob): Promise<string> => {
  const path = `submissions/${userId}/day${dayNumber}_${Date.now()}.webm`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob, { contentType: 'video/webm' });
  return getDownloadURL(storageRef);
};

export const uploadLessonImage = async (dayNumber: number, cardId: string, blob: Blob): Promise<string> => {
  const path = `lessons/day${dayNumber}/${cardId}_${Date.now()}.png`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob, { contentType: 'image/png' });
  return getDownloadURL(storageRef);
};
