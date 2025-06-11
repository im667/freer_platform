import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import type { ArtistData, About } from '../data';
import { calculateActivityScore } from '../score/activityScoreCalculator';
import { fetchWorksDataByArtistId } from './fetchArtistWorksData';
import { safeGetScore } from '../utils/safeGetScore';

export async function fetchFirebaseArtists(aboutData: About[]): Promise<ArtistData[]> {
  const snapshot = await getDocs(collection(db, 'domain'));

  const data: ArtistData[] = await Promise.all(
    snapshot.docs.map(async (doc) => {
      const raw = doc.data();
      const id = raw.path || doc.id;

      const instagramLink = raw.contact?.links?.find(
        (link: any) => link.type === 'instagram'
      )?.url || '인스타그램 계정이 등록되어있지 않습니다.';

      const cleanPath = (raw.path || '').trim().replace(/^\/+/, '');
      const homepage = encodeURI(`https://freer.it/${cleanPath}`);

      const artist: ArtistData = {
        id,
        name: raw.user_info?.name || '이름 없음',
        introduction: raw.works?.introduction || '소개없음',
        instagram: instagramLink,
        homepage: homepage,
        genre: raw.mypage?.pageSettings?.category?.subCategories || '시각예술',
        metrics: {
          exhibitionCount: raw.about?.exhibition?.length || 0,
          exhibitions: raw.about?.exhibition || '',
          auctionSuccessRate: 0,
          avgAuctionPrice: 0,
          pressMentions: 0,
          searchTrend: 0,
          activeRate: 0,
        },
      };

      const about = aboutData.find((a) => a.id === id);
      const worksData = await fetchWorksDataByArtistId(id);
      const score = about ? calculateActivityScore(artist, about, safeGetScore(worksData)) : 0;
      artist.metrics.activeRate = score;

      return artist;
    })
  );

  return data;
}
