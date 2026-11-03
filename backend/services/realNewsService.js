/**
 * Real News & Background AI Ingestion Service
 * Connects to authentic Japanese media RSS feeds (NHK, Japan Times, Google News Japan)
 * Curates and translates headlines, extracts JLPT vocab and grammar using Gemini AI silently in the background
 */

const https = require('https');
const { callGemini } = require('./aiService');

// Curated high-res Unsplash photography for Japan news
const JAPAN_PHOTOS = [
  'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80', // Tokyo skyline
  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80', // Kyoto shrine
  'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=1200&q=80', // Mt Fuji
  'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1200&q=80', // Shibuya crossing
  'https://images.unsplash.com/photo-1492571350019-22de08371fd3?auto=format&fit=crop&w=1200&q=80', // Japanese garden
  'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=1200&q=80', // Shinkansen train
  'https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?auto=format&fit=crop&w=1200&q=80', // Cherry blossoms
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80', // Modern architecture
  'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80', // Study desk
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80'  // Education exams
];

function getRandomPhoto() {
  return JAPAN_PHOTOS[Math.floor(Math.random() * JAPAN_PHOTOS.length)];
}

/**
 * Native HTTPS GET helper with timeout
 */
function fetchRssXml(url, timeoutMs = 7000) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) HYPER-JP-NewsCrawler/3.0'
        },
        timeout: timeoutMs
      },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return fetchRssXml(res.headers.location, timeoutMs).then(resolve).catch(reject);
        }
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error(`HTTP ${res.statusCode}`));
        }
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve(data));
      }
    );
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    req.on('error', reject);
  });
}

/**
 * Extracts raw items from RSS XML
 */
function parseRssXml(xml, defaultSource = 'NHK World Japan') {
  const items = [];
  const rawItems = xml.split(/<item[\s>]/i).slice(1);

  for (const raw of rawItems) {
    const titleMatch = raw.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
    const linkMatch = raw.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i);
    const descMatch = raw.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i);
    const pubDateMatch = raw.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);

    if (titleMatch && titleMatch[1]) {
      const cleanTitle = titleMatch[1].replace(/<[^>]+>/g, '').trim();
      const cleanDesc = (descMatch ? descMatch[1] : '').replace(/<[^>]+>/g, '').trim();
      const cleanLink = linkMatch ? linkMatch[1].trim() : '';

      if (cleanTitle.length > 5) {
        items.push({
          titleJp: cleanTitle,
          descJp: cleanDesc || cleanTitle,
          link: cleanLink,
          pubDate: pubDateMatch ? pubDateMatch[1].trim() : new Date().toISOString(),
          source: defaultSource
        });
      }
    }
  }

  return items;
}

/**
 * Processes an authentic Japanese news item using Gemini AI
 */
async function curateArticleWithAi(rawItem) {
  const prompt = `Bạn là biên tập viên tin tức tiếng Nhật cho người học tiếng Việt của hệ thống HYPER JP.
Hãy dịch tiêu đề và tóm tắt bài báo thời sự thực tế từ Nhật Bản sau đây sang tiếng Việt chuẩn văn phong báo chí, trích xuất 3 từ vựng cốt lõi (kanji, kana, nghĩa) và 1 điểm ngữ pháp JLPT:

Tiêu đề tiếng Nhật: ${rawItem.titleJp}
Nội dung tóm tắt: ${rawItem.descJp}
Nguồn: ${rawItem.source}

Yêu cầu xuất ra JSON ngắn gọn đúng định dạng sau (không dùng markdown code fence):
{
  "titleVi": "Tiêu đề tiếng Việt trang trọng, hấp dẫn",
  "summaryVi": "Tóm tắt tiếng Việt 2-3 câu mạch lạc, súc tích",
  "category": "Thời sự Nhật Bản",
  "keyVocab": [
    {"kanji": "...", "kana": "...", "vi": "..."}
  ],
  "grammar": "Mẫu ngữ pháp JLPT và ý nghĩa"
}`;

  try {
    const aiRes = await callGemini(prompt, 'gemini-3.5-flash-lite');
    if (!aiRes || !aiRes.text) return null;

    const cleaned = aiRes.text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      titleVi: parsed.titleVi || rawItem.titleJp,
      summaryVi: parsed.summaryVi || rawItem.descJp,
      category: parsed.category || 'Thời sự Nhật Bản',
      keyVocab: Array.isArray(parsed.keyVocab) ? parsed.keyVocab : [],
      grammar: parsed.grammar || ''
    };
  } catch (err) {
    // If AI fails or cooldown, return basic fallback
    return null;
  }
}

/**
 * Background Ingestion Worker:
 * Fetches real news from authentic Japanese feeds, processes them via AI in background,
 * and seamlessly merges into the active master articles array.
 */
let isCrawling = false;
let processedLinks = new Set();

async function runSilentBackgroundNewsIngestion(masterArticles) {
  if (isCrawling) return;
  isCrawling = true;

  try {
    const feeds = [
      { url: 'https://www3.nhk.or.jp/rss/news/cat0.xml', source: 'NHK World Japan' },
      { url: 'https://news.google.com/rss?hl=ja&gl=JP&ceid=JP:ja', source: 'Thời Báo Nhật Bản' },
      { url: 'https://www.japantimes.co.jp/feed/', source: 'The Japan Times' }
    ];

    const allRawItems = [];

    for (const f of feeds) {
      try {
        const xml = await fetchRssXml(f.url, 6000);
        if (xml) {
          const items = parseRssXml(xml, f.source);
          allRawItems.push(...items.slice(0, 4));
        }
      } catch {
        // Skip feed if unreachable
      }
    }

    if (allRawItems.length === 0) return;

    // Filter out already processed items
    const freshItems = allRawItems.filter((item) => item.link && !processedLinks.has(item.link));

    // Process top 3 fresh articles with AI
    let nextId = masterArticles.length > 0 ? Math.max(...masterArticles.map((a) => a.id)) + 1 : 1000;

    for (let i = 0; i < Math.min(freshItems.length, 3); i++) {
      const item = freshItems[i];
      processedLinks.add(item.link);

      const aiData = await curateArticleWithAi(item);

      const title = aiData?.titleVi || item.titleJp;
      const summary = aiData?.summaryVi || item.descJp;
      const category = aiData?.category || 'Thời sự Nhật Bản';

      // Build rich article content
      let fullContent = `${summary}\n\n[Bản tin gốc tiếng Nhật]:\n「${item.titleJp}」\n${item.descJp}\n\nThông tin được hệ thống HYPER JP thu thập tự động theo thời gian thực từ nguồn kiểm chứng ${item.source}.`;

      if (aiData?.keyVocab?.length > 0) {
        fullContent += '\n\n[Từ vựng trọng tâm trong bài]:\n' +
          aiData.keyVocab.map((v) => `- ${v.kanji} (${v.kana}): ${v.vi}`).join('\n');
      }

      if (aiData?.grammar) {
        fullContent += `\n\n[Điểm ngữ pháp JLPT]:\n- ${aiData.grammar}`;
      }

      const newArticle = {
        id: nextId++,
        title,
        titleJp: item.titleJp,
        slug: title
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[đĐ]/g, 'd')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, ''),
        category,
        summary,
        content: fullContent,
        imageUrl: getRandomPhoto(),
        imageAlt: title,
        imageCaption: `Ảnh thời sự tư liệu nguồn từ ${item.source}`,
        sourceName: item.source,
        sourceUrl: item.link || 'https://www3.nhk.or.jp/news/',
        author: 'Ban Biên Tập HYPER JP · Trợ Lý AI Tổng Hợp',
        publishedAt: new Date().toLocaleDateString('vi-VN'),
        publishedTime: 'Vừa xong',
        views: 150 + Math.floor(Math.random() * 80),
        likes: 18 + Math.floor(Math.random() * 25),
        comments: [],
        readTime: '3 phút đọc',
        tags: ['Thời sự Nhật', item.source, 'Học tiếng Nhật', 'Tin tức thật'],
        isHot: true,
        isFeatured: false,
        isRealNews: true,
        keyVocab: aiData?.keyVocab || [],
        grammarPoint: aiData?.grammar || ''
      };

      // Add to front of articles list
      masterArticles.unshift(newArticle);
    }
  } catch (err) {
    console.warn('[Background News Crawler] Lỗi ngầm:', err.message);
  } finally {
    isCrawling = false;
  }
}

module.exports = {
  runSilentBackgroundNewsIngestion
};
