// activityScoreCalculator.ts

import type { ArtistData, About, Series, Exhibition, Project, Award } from '../data.ts';

export function calculateActivityScore(artist: ArtistData, about: About, series?: Series[]): number {
  let score = 0;
  const nowYear = new Date().getFullYear();

  // 📅 최근 활동 점수 (최대 15점)
  const currentYear = nowYear;
  const recentExhibitions = about.exhibition.filter((e: Exhibition) => Number(e.year) === currentYear).length;
  const exhibitionScore = Math.min(recentExhibitions * 2, 6);
  const recentAwards = about.awards.filter((a: Award) => Number(a.year) === currentYear).length;
  const awardScore = Math.min(recentAwards * 2, 6);
  const recentProjects = about.project.filter((p: Project) => Number(p.year) === currentYear).length;
  const projectScore = Math.min(recentProjects * 2, 3);
  score += exhibitionScore + awardScore + projectScore; // 총 최대 10점

  // 🎨 그룹 전시 횟수 (최대 23점)
   const groupCount = about.exhibition.filter((e: Exhibition) => e.type === 'group').length;
  score += Math.min(groupCount, 23);

  // 🧍‍♀️ 개인전 횟수 (3점 * n, 최대 18점)
  const soloCount = about.exhibition.filter((e: Exhibition) => e.type === 'solo').length;
  score += Math.min(soloCount * 3, 18);

  // 🏅 수상 이력 (1.2점 * n, 최대 6점)
  score += Math.min(about.awards.length, 5);

  // 📁 프로젝트 (1점 * n, 최대 5점)
  score += Math.min(about.project.length / 2, 5);

  // 🎓 교육 이력 (1점 * n, 최대 3점)
  score += Math.min(about.education.length / 2, 3);

 // 🖼️ 작품 수 (최대 25점, title 유무에 따라 가중치 적용)
const works = series?.flatMap(s => s.works || []) ?? [];
const titledWorks = works.filter(w => typeof w.name === 'string' && w.name.trim().length > 1).length;
const untitledWorks = works.length - titledWorks;
const workScore = Math.min(titledWorks * 1.2 + untitledWorks * 0.01, 25);

score += workScore;

  // 📱 인스타그램 여부 (있으면 0.3점)
  if (artist.instagram && artist.instagram.includes('instagram')) {
    score += 0.3;
  }

  // 🌐 홈페이지 여부 (있으면 3.7점)
  if (artist.homepage && artist.homepage.startsWith('https://')) {
    score += 3.7;
  }

  return Math.round(Math.min(score, 99));
}
