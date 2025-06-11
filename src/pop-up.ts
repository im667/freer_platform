import type { Exhibition } from './data'


export function openPopup(artist: any) {
  const popupContent = document.getElementById('popup-content') as HTMLDivElement
  const mostOrganizer = getMostFrequentOrganizer(artist?.metrics?.exhibitions ?? [])
  console.log('전시',mostOrganizer)
  popupContent.innerHTML = `
    <h2>${artist.name}</h2>
    <strong>주 활동지역 | </strong><span>${mostOrganizer}</span>
    <div class="detail-grid">
      <div><span>장르</span><strong>${artist.genre}</strong></div>
      <div><span>활동지수</span><strong>${artist.metrics.activeRate}</strong></div>
      <div><span>인스타그램</span><strong>${renderInstagramLink(artist.instagram)}</strong></div>
      <div><span>평균낙찰가</span>Beta 버전 미제공</div>
      <div><span>작가페이지</span><strong><a href="${artist.homepage}" target="_blank" rel="noopener noreferrer">바로가기</a></strong></div>
      <div><span>보도자료 수</span>Beta 버전 미제공</div>
    </div>
    <div class="detail-sections">
      <section><h3>작품 활동 추이</h3><div class="gray-box">승인 후 열람 가능합니다.<a href="https://walla.my/survey/HsuMI2aoIly5VY7pWZnI" target="_blank" class="subscribe-button">사전 신청하기</a></section>
      <section><h3>언급도 변화 추이</h3><div class="gray-box">승인 후 열람 가능합니다.<a href="https://walla.my/survey/HsuMI2aoIly5VY7pWZnI" target="_blank" class="subscribe-button">사전 신청하기</a></section>
      <section><h3>경매 추이</h3><div class="gray-box">승인 후 열람 가능합니다.<a href="https://walla.my/survey/HsuMI2aoIly5VY7pWZnI" target="_blank" class="subscribe-button">사전 신청하기</a></section>
    </div>
  `

  const popup = document.getElementById('popup')
  popup?.classList.remove('hidden')

  const closeBtn = document.getElementById('popup-close')
  closeBtn?.addEventListener('click', () => {
    popup?.classList.add('hidden')
  })
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


function getMostFrequentOrganizer(data?: Exhibition[]): string {
  if (!Array.isArray(data) || data.length === 0) {
    return '전시 정보가 없습니다.';
  }

  const countMap: Record<string, number> = {};

  const filtered = data.filter(item => !!item.organizers);

  if (filtered.length === 0) {
    return '전시 정보가 없습니다.';
  }

  filtered.forEach(item => {
    const key = item.organizers!;
    countMap[key] = (countMap[key] || 0) + 1;
  });

  let mostFrequent = '';
  let maxCount = 0;

  for (const [key, count] of Object.entries(countMap)) {
    if (count > maxCount) {
      maxCount = count;
      mostFrequent = key;
    }
  }

  return mostFrequent;
}
