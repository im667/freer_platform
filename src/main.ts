import { fetchWorksData } from './services/workService.ts';
import { openPopup } from './pop-up.ts';
import { fetchFirebaseArtists } from './services/firebaseService.ts';
import { fetchArtistAbouts } from './services/firbaseAboutService.ts';
import type { ArtistData, ArtistThumbnail } from './data.ts'
import './style.css';


document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.tab') as NodeListOf<HTMLButtonElement>
  const tabContent = document.getElementById('tabContent') as HTMLDivElement
  const popupStyle = document.createElement('link');

  popupStyle.rel = 'stylesheet';
  popupStyle.href = '/pop-up.css';
  document.head.appendChild(popupStyle);
 

  tabs.forEach((tab) =>
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'))
      tab.classList.add('active')

      const selectedTab = tab.textContent?.trim()
      if (!tabContent) return

      if (selectedTab === '작가명') {
        tabContent.innerHTML = `<input type="text" class="input" placeholder="작가명을 입력해주세요." />`
      } else if (selectedTab === '카테고리') {
        tabContent.innerHTML = `
          <div class="category-buttons">
            <button class="category-button active">미술</button>
            <button class="category-button">디자인</button>
            <button class="category-button">공예</button>
            <button class="category-button">사진</button>
            <button class="category-button">미디어</button>
          </div>
        `
      } else {
        tabContent.innerHTML = `<p style="color: #aaa;">(취향 탭은 아직 준비 중입니다)</p>`
      }
    })
  )

  const searchButton = document.querySelector('.search-button') as HTMLButtonElement
  searchButton.addEventListener('click', () => {
  const input = document.querySelector('.input') as HTMLInputElement | null
  const keyword = input?.value.trim()

  // 현재 활성 탭이 어떤 건지 확인
  const activeTab = document.querySelector('.tab.active')?.textContent?.trim()

  if (activeTab === '작가명' && keyword) {
    window.location.href = `/result.html?query=${encodeURIComponent(keyword)}`
  } else if (activeTab === '카테고리') {
    const selectedCategory = document.querySelector('.category-button.active')?.textContent?.trim()
    if (selectedCategory) {
      window.location.href = `/result.html?query=${encodeURIComponent(selectedCategory)}`
    }
  }
})

  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement
    if (target.classList.contains('category-button')) {
      document.querySelectorAll('.category-button').forEach((btn) => btn.classList.remove('active'))
      target.classList.add('active')
      // 페이지 이동은 카테고리 기반 검색 페이지 구성 후 적용 예정
    }
  })
})



async function fetchArtistData(): Promise<ArtistData[]> {
  const res = await fetch('/data/artists.json')
  if (!res.ok) throw new Error('데이터 로딩 실패')
  return await res.json()
}
let cachedThumbnails: ArtistThumbnail[] | null = null;

// 🔷 썸네일 생성 함수 (with 캐싱)
async function getArtistThumbnails(): Promise<ArtistThumbnail[]> {
  if (cachedThumbnails) {
    console.log('🧠 캐시된 썸네일 사용');
    return cachedThumbnails;
  }

  try {
    const worksData = await fetchWorksData();
    console.log('📦 fetchWorksData 결과', worksData.slice(0, 3));
    const [jsonData, firebaseAboutData] = await Promise.all([
      fetchArtistData(),
      fetchArtistAbouts(),
    ]);
    const firebaseData = await fetchFirebaseArtists(firebaseAboutData);
    const allData: ArtistData[] = [...jsonData, ...firebaseData];

    const thumbnails: ArtistThumbnail[] = worksData
      .map((artist, index) => {
        const matchedArtist = allData.find((a) => a.id === artist.path);
        if (!matchedArtist) return null;

        const seriesArray = artist.works?.series ?? [];
        const imageCandidates = seriesArray
          .flatMap((series: any) => series.works ?? [])
          .filter((work: any) => !!work.url);

        if (imageCandidates.length === 0) {
          console.warn(`이미지 없음: artistIndex=${index}, artistPath=${artist.path}, name=${artist.user_info?.name}`);
          return null;
        }
        // 첫 후보 이미지를 기본으로 설정하고, 썸네일 렌더 시 실패 시 fallback 가능하도록
        const bestImage = imageCandidates[0];

        return {
          imageUrl: bestImage.url,
          artistIndex: index,
          artistPath: artist.path ?? '',
          artistData: matchedArtist,
          worksTab: seriesArray.flatMap((s: any) => s.works ?? []).slice(0, 3)
        };
      })
      .filter((x): x is ArtistThumbnail => x !== null)
      .sort((a, b) => b.artistData.metrics.activeRate - a.artistData.metrics.activeRate)
      .slice(0, 36);

    cachedThumbnails = thumbnails; // ✅ 캐싱 저장
    if (cachedThumbnails) {
      console.log('🧠 캐시된 썸네일 사용'); // 이게 반복 출력되는지 브라우저 콘솔에서 확인!
      return cachedThumbnails;
    }
    console.log('🆕 새로 생성된 썸네일 반환');
    return thumbnails;
  } catch (err) {
    console.error('🔥 Firestore에서 데이터를 불러오는 중 에러 발생:', err);
    return [];
  }
}

// 🔷 썸네일 렌더링 함수
function renderThumbnails(thumbnails: ArtistThumbnail[]) {
  const container = document.getElementById('thumbnail-grid');

  if (!container) return;

  container.innerHTML = '';

   thumbnails.forEach((thumb) => {
    const card = document.createElement('div');
    card.className = 'thumbnail-card';
    card.setAttribute('data-artist-id', thumb.artistData.id); // 🔥 작가 ID 설정

    const img = document.createElement('img');
    img.src = thumb.imageUrl;
    img.alt = 'thumbnail';

    img.onerror = () => {
      const fallback = thumb.worksTab.find(w => w.url !== img.src); // 다른 후보 탐색
      if (fallback) {
        img.src = fallback.url;
      } else {
        img.src = '/image/recoverImage.png'; // 진짜 없을 때
      }
    };

    card.appendChild(img);
    container.appendChild(card);
  });

  // 🔥 여기서 한 번만 이벤트 등록
  container.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const card = target.closest('.thumbnail-card') as HTMLElement;
    // const thumbnailMap = new Map(thumbnails.map(t => [t.artistData.id, t.artistData]));
    const id = card.getAttribute('data-artist-id') || '';
    const thumb = thumbnails.find(t => t.artistData.id === id);

    if (thumb) {
    openPopup(thumb.artistData, thumb.worksTab);
    console.log(thumb.artistData, thumb.worksTab);
  } else {
    console.warn(`썸네일 데이터를 찾을 수 없음: id=${id}`);
  }
    
  });
}

// 🔷 메인 함수
async function main() {
  try {
    const thumbnails = await getArtistThumbnails();
    if (!thumbnails) return;
    renderThumbnails(thumbnails);
  } catch (err) {
    console.error('🔥 에러 발생:', err);
  }
}

main();
