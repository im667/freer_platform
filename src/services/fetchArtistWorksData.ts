import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase.ts';
import type { WorksData } from '../data.ts';

export async function fetchWorksDataByArtistId(artistId: string): Promise<WorksData | null> {
  try {
    const docRef = doc(db, 'domain', artistId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    const raw = docSnap.data();
    const works = raw?.works;

    return {
      series: Array.isArray(works?.series) ? works.series : [],
      worksTab: Array.isArray(works?.worksTab) ? works.worksTab : [],
    };
  } catch (error) {
    console.error('🔥 작품 데이터 가져오기 실패:', error);
    return null;
  }
}
