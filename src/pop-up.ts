
import type { WorkItem,NewsItem } from './data.ts';
import { getMostFrequentOrganizer } from './utils/getMostFrequentOrganizer.ts';

export function openPopup(artist: any, artwork:WorkItem[]) {
  const popupContent = document.getElementById('popup-content') as HTMLDivElement
  const mostOrganizer = getMostFrequentOrganizer(artist?.metrics?.exhibitions ?? [])
  const popupStyle = document.createElement('link');
    popupStyle.rel = 'stylesheet';
    popupStyle.href = '/pop-up.css';  // 경로 다시 확인!
    document.head.appendChild(popupStyle);

  popupContent.innerHTML = `
    <h2>${artist.name}</h2>
    <strong>주 활동지역 | </strong><span>${mostOrganizer}</span>
    <div class="detail-grid">
      <div><span>장르</span><strong>${artist.genre}</strong></div>
      <div><span>활동지수</span><strong>${artist.metrics.activeRate}</strong></div>
      <div><span>인스타그램</span><strong>${renderInstagramLink(artist.instagram)}</strong></div>
      <div><span>작가페이지</span><strong><a href="${artist.homepage}" target="_blank" rel="noopener noreferrer">바로가기</a></strong></div>
   
    </div>
    <div class="artwork-sections">
       <section>
        <h3>Preview</h3>
        <div class="artworks"></div>
      </section>
    </div>
      <section>
        <h3>작품 활동 추이</h3>
        <div class="gray-box">승인 후 열람 가능합니다.
        <a href="https://walla.my/survey/HsuMI2aoIly5VY7pWZnI" target="_blank" class="subscribe-button">사전 신청하기</a>
        </div>
      </section>
      <section>
        <h3>언급도 변화 추이</h3>
        <div class="gray-box">승인 후 열람 가능합니다.
        <a href="https://walla.my/survey/HsuMI2aoIly5VY7pWZnI" target="_blank" class="subscribe-button">사전 신청하기</a>
        </div>
      </section>
      <section>
        <h3>보도 자료</h3>
        <div class="artist-news">
        <span class="artist-news-info">동명이인의 작가가 노출될 수 있습니다.</span>
        </div>
      </section>
       
    </div>
  `

   const artworkContainer = popupContent.querySelector('.artworks') as HTMLDivElement;
  if (artworkContainer && artwork && artwork.length > 0) {
    artworkContainer.innerHTML = artwork
      .slice(0, 3)
      .map(work => `
        <div class="thumbnail-wrapper">
          <img src="${work.url}" alt="${work.name}" class="popup-thumbnail" />
          <div class="caption">${work.name || 'untitled'}</div>
        </div>
      `)
      .join('');
  } 

  if (!artwork || artwork.length === 0) {
  artworkContainer.innerHTML = `<p>등록된 작품이 없습니다.</p>`;
}

  const popup = document.getElementById('popup')
  popup?.classList.remove('hidden')

  const closeBtn = document.getElementById('popup-close')
  closeBtn?.addEventListener('click', () => {
    popup?.classList.add('hidden')
  })



  const newsContainer = popupContent.querySelector('.artist-news') as HTMLDivElement;
    if (newsContainer) {
      const keyword = `${artist.name} 작가 미술 ${mostOrganizer}`
      const newsCount = 10
      fetchArtistNews(keyword, newsCount).then(newsItems => {
        if (newsItems.length === 0) {
          newsContainer.innerHTML += `<p>관련 뉴스가 없습니다.</p>`;
        } else {
          newsContainer.innerHTML += `
            <ul class="news-links">
              ${newsItems.map(item => `
                <li class="news-item"><a href="${item.link}" target="_blank" rel="noopener noreferrer"><span class="news-title">${item.title}<span></a></li>
              `).join('')}
            </ul>
          `;
        }
      });
    }

}

function renderInstagramLink(instagram?: string): string {
  const value = instagram?.trim() ?? "";

  // 진짜 인스타그램 URL인지 확인 (정확한 외부 인스타 링크만)
  const isValid = value.toLowerCase().includes("instagram");

  if (!isValid) return "등록되지 않았습니다.";

  // 프로토콜 없으면 붙이기
  const hasProtocol = value.startsWith("http");
  const href = hasProtocol ? value : `https://${value}`;

  return `<a href="${href}" target="_blank" rel="noopener noreferrer">바로가기</a>`;
}

async function fetchArtistNews(name: string, newsCount: number): Promise<NewsItem[]> {
  try {
    const res = await fetch(`https://us-central1-freer-bfd55.cloudfunctions.net/naverNews?query=${encodeURIComponent(name)}&display=${newsCount}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    // title과 link 함께 추출
    return json.items?.map((item: any) => ({
      title: item.title.replace(/<[^>]*>/g, ""), // HTML 태그 제거
      link: item.link,
    })) ?? [];
  } catch (err) {
    console.error("🧨 뉴스 불러오기 실패:", err);
    return [];
  }
}
