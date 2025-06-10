// activityScoreCalculator.ts

import type { ArtistData, About, Series, Exhibition, Project, Award } from '../data';

export function calculateActivityScore(artist: ArtistData, about: About, series?: Series[]): number {
  let score = 0;
  const nowYear = new Date().getFullYear();

  // 📅 최근 활동 점수 (최대 10점)
  const currentYear = nowYear;
  const recentExhibitions = about.exhibition.filter((e: Exhibition) => Number(e.year) === currentYear).length;
  const exhibitionScore = Math.min(recentExhibitions * 2, 4);
  const recentAwards = about.awards.filter((a: Award) => Number(a.year) === currentYear).length;
  const awardScore = Math.min(recentAwards * 2, 3);
  const recentProjects = about.project.filter((p: Project) => Number(p.year) === currentYear).length;
  const projectScore = Math.min(recentProjects * 2, 3);
  score += exhibitionScore + awardScore + projectScore; // 총 최대 10점

  // 🎨 전체 전시 횟수 (최대 28점)
  score += Math.min(about.exhibition.length, 28);

  // 🧍‍♀️ 개인전 횟수 (2점 * n, 최대 17점)
  const soloCount = about.exhibition.filter((e: Exhibition) => e.type === 'solo').length;
  score += Math.min(soloCount * 2, 17);

  // 🏅 수상 이력 (1점 * n, 최대 5점)
  score += Math.min(about.awards.length, 5);

  // 📁 프로젝트 (0.5점 * n, 최대 5점)
  score += Math.min(about.project.length / 2, 5);

  // 🎓 교육 이력 (0.5점 * n, 최대 2점)
  score += Math.min(about.education.length / 2, 2);

  // 🖼️ 작품 수 (최대 31점)
  const workCount = series?.flatMap(s => s.works || []).length || 0;
  score += Math.min(workCount, 31);

  // 📱 인스타그램 여부 (있으면 0.3점)
  if (artist.instagram && artist.instagram.includes('instagram')) {
    score += 0.3;
  }

  // 🌐 홈페이지 여부 (있으면 0.7점)
  if (artist.homepage && artist.homepage.startsWith('https://')) {
    score += 0.7;
  }

  return Math.min(score, 99);
}
