export interface ArtistData {
  id: string
  name: string
  introduction: string
  instagram: string
  homepage: string
  genre: string
  metrics: {
    exhibitionCount: number,              // 개인전 횟수
      auctionSuccessRate: number,       // 낙찰률
      avgAuctionPrice: number,     // 평균 낙찰가
      pressMentions: number,                // 언론 보도 수
      searchTrend: number,             // 검색량 증가율
      activeRate: number               // 활동 지속율
  }
}


export interface ArtistTableData {
  id: string
  name: string
  genre: string
  exhibitionCount: number
}


/* Works */
export interface WorkItem {
  name: string;
  description: string;
  file_name: string;
  url: string;
  path: string;
}

export interface WorksData {
  series: Series[];
  worksTab: WorkItem[];
}

export interface Series {
  name?: string;
  works: WorkItem[];
  year: number;
}

/* About */
export interface About {
  id: string;
  name: string;
  introduction: string;
  project: Project[];
  exhibition: Exhibition[];
  education: Education[];
  awards: Award[];
}

export interface Exhibition {
  year: string;
  city: string;
  organizers: string;
  name: string;
  type: 'solo' | 'group';
}

export interface Education {
  subject: string;
  degrees: string;
}

export interface Award {
  organizers: string;
  year: string;
  content: string;
}

export interface Project {
  name: string;
  year: string;
  organizers: string;
  spaces?: string; // 일부 항목에만 존재함
}
