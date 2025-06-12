import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase.ts';
import type { About } from '../data.ts';

export async function fetchArtistAbouts(): Promise<About[]> {
    const snapshot = await getDocs(collection(db, 'domain'));   
    const data: About[] = snapshot.docs.map((doc) => {
    const raw = doc.data();
    const aboutRaw = raw.about || {};

        return {
        id: raw.path || doc.id,
        name: raw?.user_info?.name || '이름없음',
        introduction : aboutRaw?.introduction || '소개없음',
        project: toArray(aboutRaw?.project),
        exhibition: toArray(aboutRaw?.exhibition),
        education: toArray(aboutRaw?.education),
        awards: toArray(aboutRaw?.awards),
        };
      });
    
      return data;
}

function toArray<T>(input: T | T[] | undefined): T[] {
  if (!input) return [];
  return Array.isArray(input) ? input : [input];
}
