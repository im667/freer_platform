import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import fetch from "node-fetch";

export const naverNews = onRequest(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // ⭐ CORS 허용
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Preflight 요청 처리 (OPTIONS)
  if (req.method === "OPTIONS") {
    res.status(204).send('');
    return;
  }

  const query = req.query.query 
  if (!query) {
    res.status(400).send({ error: "Missing query param" });
    return;
  }

  try {
    const response = await fetch(`https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(query)}&display=3&sort=date`, {
      headers: {
        'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID || '',
        'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET || ''

      }
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (e) {
    logger.error("🧨 뉴스 불러오기 실패", e);
    res.status(500).send({ error: "Failed to fetch news" });
  }
});
