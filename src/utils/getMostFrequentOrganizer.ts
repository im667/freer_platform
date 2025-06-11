import type { Exhibition } from '../data'

export function getMostFrequentOrganizer(data?: Exhibition[]): string {
  if (!Array.isArray(data) || data.length === 0) {
    return '-';
  }

  const countMap: Record<string, number> = {};

  const filtered = data.filter(item => !!item.organizers);

  if (filtered.length <= 2) {
    return '-';
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

  return normalizeOrganizer(mostFrequent)
}


function normalizeOrganizer(organizer?: string): string {
  if (!organizer) return '-';

  // 영어 → 한글 매핑
  const englishToKorean: Record<string, string> = {
    seoul: "서울",
    busan: "부산",
    gwangju: "광주",
    jeonju: "전주",
    daejeon: "대전",
    daegu: "대구",
    ulsan: "울산",
    gangwon: "강원",
    gyeonggi: "경기",
    chungnam: "충남",
    chungbuk: "충북",
    gyeongnam: "경남",
    gyeongbuk: "경북",
    jeonnam: "전남",
    jeonbuk: "전북",
    jeju: "제주",
    gunsan: "군산",
    yangsan: "양산",
  };

  

  // 소문자 처리
  const lower = organizer.toLowerCase();
  const mapped = englishToKorean[lower];

   if (lower.includes('대한민국') || lower === 'korea' || lower === 'republic of korea') {
    return '국내';
  }

   // ✅ 주요 해외 도시 축약어
  const foreignCityAbbreviations: Record<string, string> = {
    'new york': 'NY',
    'newyork': 'NY',
    'london': 'LD',
    'tokyo': 'TY',
    'paris': 'PR',
    'berlin': 'BL',
    'shanghai': 'SH',
    'beijing': 'BJ',
    'hong kong': 'HK',
    'los angeles': 'LA',
    'la': 'LA',
    'san francisco': 'SF',
    'moscow': 'MS',
    'sydney': 'SY',
    'toronto': 'TO',
    'singapore': 'SG',
    'bangkok': 'BK',
    'dubai': 'DB'
  };

  for (const [city, abbr] of Object.entries(foreignCityAbbreviations)) {
    if (lower.includes(city)) {
      return abbr;
    }
  }
  const korean = mapped || organizer; // 매핑 없으면 원래 값 유지

  // 2글자 잘라서 반환 (예외 없이)
  return korean.slice(0, 2);
}