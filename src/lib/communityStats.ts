import { doc, getDoc, setDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Community aggregate — a single shared document so every creative can see how
 * the whole cohort is doing without reading other users' private data
 * (Firestore rules keep individual user docs private). We only ever read the
 * doc or apply atomic increments to it.
 *
 * Doc: community/aggregate
 *   totalCreatives   — creatives who have been admitted (pledged)
 *   totalCompletions — lessons completed across everyone
 */

export interface CommunityStats {
  totalCreatives: number;
  totalCompletions: number;
  /** Average lessons completed per creative. */
  avgCompletions: number;
}

const AGG_REF = () => doc(db, 'community', 'aggregate');

export const getCommunityStats = async (): Promise<CommunityStats | null> => {
  try {
    const snap = await getDoc(AGG_REF());
    if (!snap.exists()) return { totalCreatives: 0, totalCompletions: 0, avgCompletions: 0 };
    const d = snap.data();
    const totalCreatives = Number(d.totalCreatives || 0);
    const totalCompletions = Number(d.totalCompletions || 0);
    return {
      totalCreatives,
      totalCompletions,
      avgCompletions: totalCreatives > 0 ? totalCompletions / totalCreatives : 0,
    };
  } catch (err) {
    // Rules not deployed yet, offline, etc. — caller falls back gracefully.
    console.warn('Could not read community stats:', err);
    return null;
  }
};

/** Count a newly admitted creative exactly once. */
export const registerNewCreative = async (): Promise<void> => {
  try {
    await setDoc(
      AGG_REF(),
      { totalCreatives: increment(1), updatedAt: serverTimestamp() },
      { merge: true },
    );
  } catch (err) {
    console.warn('Could not register new creative:', err);
  }
};

/** Count a lesson completion across the cohort. */
export const registerCompletion = async (): Promise<void> => {
  try {
    await setDoc(
      AGG_REF(),
      { totalCompletions: increment(1), updatedAt: serverTimestamp() },
      { merge: true },
    );
  } catch (err) {
    console.warn('Could not register completion:', err);
  }
};
