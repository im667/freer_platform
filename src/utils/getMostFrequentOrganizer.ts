import type { Exhibition } from '../data.ts'

// ✅ 메인 함수: 최다 organizer (중복 제거 + 정규화 포함)
export function getMostFrequentOrganizer(data?: Exhibition[]): string {
  if (!Array.isArray(data) || data.length === 0) {
    return '-';
  }

  const rawOrganizers = data
    .map(item => item.organizers)
    .filter(Boolean) as string[];

  // ✅ 전체 전시 2회 이하면 제외
  if (rawOrganizers.length <= 2) {
    return '-';
  }

  // ✅ 정규화 후 중복 제거
  const normalizedOrganizers = rawOrganizers.map(normalizeLocationName);

  // ✅ 빈도수 계산
  const countMap: Record<string, number> = {};
  normalizedOrganizers.forEach(org => {
    countMap[org] = (countMap[org] || 0) + 1;
  });

  let mostFrequent = '';
  let maxCount = 0;

  for (const [key, count] of Object.entries(countMap)) {
    if (count > maxCount) {
      maxCount = count;
      mostFrequent = key;
    }
  }

  return normalizeOrganizer(mostFrequent);
}

// ✅ organizer를 한글화 / 축약 / 축약어 적용
function normalizeOrganizer(organizer?: string): string {
  if (!organizer || organizer === '-') return '-';

  const lower = organizer.toLowerCase().trim();

  if (
    lower.includes('대한민국') ||
    lower.includes('korea') ||
    lower === 'kr'
  ) {
    return '국내';
  }

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

  const englishToKorean: Record<string, string> = {
    seoul: '서울',
    busan: '부산',
    jeonju: '전주',
    gwangju: '광주',
    daejeon: '대전',
    daegu: '대구',
    ulsan: '울산',
    incheon: '인천',
    mokpo: '목포'
  };

  const mapped = englishToKorean[lower];
  const korean = mapped || organizer;

  const koreanRegions = ['서울', '부산', '전주', '광주', '대전', '대구', '울산', '인천', '목포'];
  if (koreanRegions.includes(korean)) {
    return korean.slice(0, 2);
  }

  return korean;
}

// ✅ 장소명에서 비교용 정규화 처리
function normalizeLocationName(name: string): string {
  return name
    .replace(/대한민국|KOREA|Korea|KR|한국/gi, '')
    .replace(/프랑스|일본|중국|미국|스페인|독일|벨기에|스위스/gi, '')
    .replace(/광역시|특별시|자치시|도|시|군|구/g, '')
    .replace(/,/g, '')
    .replace(/\s+/g, '')
    .trim();
}

