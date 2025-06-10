import './result-style.css'
import { openPopup } from './pop-up'
import type { ArtistData } from './data'
import { fetchFirebaseArtists } from './services/firebaseService'
import { fetchArtistAbouts } from './services/firbaseAboutService' 

async function fetchArtistData(): Promise<ArtistData[]> {
  const res = await fetch('/data/artists.json')
  if (!res.ok) throw new Error('데이터 로딩 실패')
  return await res.json()
}


document.addEventListener('DOMContentLoaded', async () => {
  const [jsonData,firebaseAboutData] = await Promise.all([
    fetchArtistData(),
    fetchArtistAbouts(),
  ])
 const firebaseData = await fetchFirebaseArtists(firebaseAboutData);
  const allData: ArtistData[] = [...jsonData, ...firebaseData]
  const popupStyle = document.createElement('link');
  popupStyle.rel = 'stylesheet';
  popupStyle.href = '/pop-up.css';
  document.head.appendChild(popupStyle);

  const params = new URLSearchParams(window.location.search)
  const keyword = params.get('query')?.trim() || ''
  const isGenre = ['미술', '디자인', '공예', '사진', '미디어'].includes(keyword)
  const PAGE_SIZE = 10
  let currentPage = 1
  let isPullingUp = false
  let startY = 0

  const currentKeyword = isGenre ? '' : keyword
  const currentGenre = isGenre ? keyword : ''

  const genreAliasMap: Record<string, string[]> = {
  '미술': ['서양화', '한국화', '미술', '시각예술','일러스트','만화','판화','조각', '입체', '오브제','설치','퍼포먼스','기획자'],
  '디자인': ['시각','산업','패션','3D모델링','캐릭터','UX/UI','건축','인테리어','조경','가구','게임','차량'],
  '공예': ['도자','목공예','석공예','섬유(직물,뜨개질,자수,터프팅)','칠공예','칠보','전톡 악기','금속','캔들','마크라메','플로리스트','테라리움','미니어처','유리','종이','가죽','보석','업사이클링','캘리그래피','퀼트','인형','레진','3D프린팅'],
  '사진': ['인물','풍경','다큐멘터리','패션','스포츠','건축','제품','웨딩','광고','음식','천체','자연','야생동물','여행','보도'],
  '미디어': ['영상','뮤직비디오','단편 영화','장편 영화','다큐멘터리','애니메이션','광고','제품','웨딩','모션 그래픽','VR/AR','드론'],
}

const searchGenres = genreAliasMap[currentGenre] || [currentGenre]

const filteredList = allData.filter((a) => {
  const matchName = currentKeyword === '' || a.name.includes(currentKeyword)
  const matchGenre =
    currentGenre === '' ||
    (Array.isArray(a.genre)
      ? a.genre.some((g) => searchGenres.includes(g))
      : searchGenres.includes(a.genre))

  return matchName && matchGenre
}).sort((a, b) => b.metrics.activeRate - a.metrics.activeRate);

  const totalMatched = filteredList.length

  const resultArea = document.querySelector('.search-area') as HTMLDivElement

  const summaryMarkup = `
  <div class="result-summary-wrapper">
    <p class="result-summary">‘${keyword}’ 검색결과 <strong>${totalMatched}건</strong></p>
    <a href="https://freer.it/about" target="_blank" class="register-button">작가 등록 신청하기</a>
  </div>
`

  const tabMarkup = `
  <div class="top-area">
   <div class="logo-wrapper">
    <a href="/" class="logo-link">
      <img src="./src/image/logo.png" alt="FREER 로고" class="logo" />
    </a>
  </div>
    <div class="tabs">
      <button class="tab ${!isGenre ? 'active' : ''}" data-tab="name">작가명</button>
      <button class="tab ${isGenre ? 'active' : ''}" data-tab="category">카테고리</button>
      <button class="tab" data-tab="taste">취향</button>
    </div>
    </div>
  `

  const categoryButtonsMarkup = `
    <div class="category-buttons">
      <button class="category-button ${keyword === '미술' ? 'active' : ''}">미술</button>
      <button class="category-button ${keyword === '디자인' ? 'active' : ''}">디자인</button>
      <button class="category-button ${keyword === '공예' ? 'active' : ''}">공예</button>
      <button class="category-button ${keyword === '사진' ? 'active' : ''}">사진</button>
      <button class="category-button ${keyword === '미디어' ? 'active' : ''}">미디어</button>
    </div>
  `

  const inputMarkup = `
    <div class="search-bar-wrapper">
      <input class="input" type="text" value="${keyword}" />
      <button class="search-button">검색</button>
    </div>
  `

  const tableWrapper = document.createElement('div')
  tableWrapper.innerHTML = `
    ${tabMarkup}
    <div class="tabContent">
      ${isGenre ? categoryButtonsMarkup : inputMarkup}
    </div>
      ${summaryMarkup}
    <table class="artist-table">
      <thead>
        <tr>
          <th>이름</th>
          <th>장르</th>
          <th>활동지수</th>
          <th>상세</th>
        </tr>
      </thead>
      <tbody id="artistTableBody"></tbody>
    </table>
    <div id="popup" class="popup hidden">
      <div class="popup-inner">
        <button id="popup-close" class="popup-close">×</button>
        <div id="popup-content"></div>
      </div>
    </div>
  `

  resultArea.appendChild(tableWrapper)

  async function renderTableChunk() {
  const tbody = document.getElementById('artistTableBody') as HTMLTableSectionElement;
  const nextChunk = filteredList.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  for (const item of nextChunk) {
    const score = item.metrics.activeRate;
    const scoreClass = score >= 50 ? 'score-high' : 'score-low';

    const row = `
      <tr>
        <td><span class="pill">${item.name}</span></td>
        <td><span class="pill">${item.genre}</span></td>
        <td><span class="pill ${scoreClass}">${score}</span></td>
        <td><button class="pill detail-button" data-id="${item.id}">자세히</button></td>
      </tr>
    `;
    tbody.insertAdjacentHTML('beforeend', row);
  }
}


  renderTableChunk()

  window.addEventListener('touchstart', (e) => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1) {
      startY = e.touches[0].clientY
      isPullingUp = true
    }
  })

  window.addEventListener('touchmove', (e) => {
    if (!isPullingUp) return

    const deltaY = e.touches[0].clientY - startY

    if (deltaY < -10) {
      tryLoadNextPage()
      isPullingUp = false
    }
  })

  window.addEventListener('touchend', () => {
    isPullingUp = false
  })

  let isScrolling = false
  window.addEventListener('wheel', (e) => {
    if (isScrolling) return
    const atBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 1
    const scrollingDown = e.deltaY > 0

    if (atBottom && scrollingDown) {
      isScrolling = true
      tryLoadNextPage()
      setTimeout(() => (isScrolling = false), 500)
    }
  })

  function tryLoadNextPage() {
    const maxItems = filteredList.length
    const currentlyShown = currentPage * PAGE_SIZE

    if (currentlyShown < maxItems) {
      currentPage++
      renderTableChunk()
    }
  }

  document.querySelector('.search-button')?.addEventListener('click', () => {
    const input = document.querySelector('.input') as HTMLInputElement
    const keyword = input.value.trim()
    if (keyword) {
      window.location.href = `/result.html?query=${encodeURIComponent(keyword)}`
    }
  })

  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      const tabType = tab.getAttribute('data-tab')

      if (tabType === 'taste') {
        alert('취향 탭은 아직 준비 중입니다.')
        return
      }

      const newQuery = tabType === 'category' ? '미술' : '홍길동'
      window.location.href = `/result.html?query=${encodeURIComponent(newQuery)}`
    })
  })

  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement
    if (target.classList.contains('category-button')) {
      const genre = target.textContent?.trim()
      if (genre) {
        window.location.href = `/result.html?query=${encodeURIComponent(genre)}`
      }
    }

    if (target.classList.contains('detail-button')) {
      const id = target.getAttribute('data-id') || ''
      const artist = allData.find((a) => a.id === id)
    
      if (artist) {
        openPopup(artist)
      }
    }
  })
})
