/**
 * HYPER JAPAN - Unified Garden & Gamification Water Reward Service
 * Automatically awards water drops (sương thần) and records study activity
 * from Flashcard, Quiz, Typing Practice, Word Match, and Lessons.
 */

export const awardGardenWater = (amount = 10, reason = '', vocabItems = []) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    // 1. Get current drops
    let currentDrops = 160;
    const rawGlobal = localStorage.getItem('hyper_water_drops');
    if (rawGlobal !== null) {
      currentDrops = parseInt(rawGlobal, 10) || 0;
    } else {
      const questKey = `hyper_quests_${today}`;
      const rawQuest = localStorage.getItem(questKey);
      if (rawQuest) {
        try {
          const q = JSON.parse(rawQuest);
          if (typeof q.dewDrops === 'number') currentDrops = q.dewDrops;
        } catch {}
      }
    }

    const newDrops = Math.max(0, currentDrops + amount);
    localStorage.setItem('hyper_water_drops', String(newDrops));

    // 2. Sync today's quest state
    const questKey = `hyper_quests_${today}`;
    const rawQuest = localStorage.getItem(questKey);
    let quests = {
      wateredCount: 0,
      wateredTarget: 3,
      wateredClaimed: false,
      perfectSession: false,
      perfectClaimed: false,
      plantedToday: false,
      plantedClaimed: false,
      matchPlayed: false,
      matchClaimed: false,
      dewDrops: newDrops
    };

    if (rawQuest) {
      try {
        quests = { ...quests, ...JSON.parse(rawQuest) };
      } catch {}
    }

    quests.dewDrops = newDrops;
    if (reason.toLowerCase().includes('nối từ') || reason.toLowerCase().includes('wordmatch')) {
      quests.matchPlayed = true;
      localStorage.setItem('hyper_match_played_today', today);
    }
    localStorage.setItem(questKey, JSON.stringify(quests));

    // 3. Automatically record activity into Garden SRS plants
    if (vocabItems && Array.isArray(vocabItems) && vocabItems.length > 0) {
      const GUEST_STORAGE_KEY = 'hyper_guest_garden_srs';
      const rawGarden = localStorage.getItem(GUEST_STORAGE_KEY);
      let plants = [];
      if (rawGarden) {
        try {
          plants = JSON.parse(rawGarden) || [];
        } catch {}
      }

      const plantMap = new Map();
      plants.forEach(p => {
        const id = Number(p.vocab_id || p.id);
        if (id) plantMap.set(id, p);
      });

      const now = new Date();
      vocabItems.forEach(v => {
        if (!v) return;
        const id = Number(v.id || v.vocab_id);
        if (!id) return;

        if (plantMap.has(id)) {
          const existing = plantMap.get(id);
          existing.last_reviewed_at = now.toISOString();
          existing.correct_count = (existing.correct_count || 0) + 1;
        } else {
          const cleanK = v.clean_kana || v.kana || '';
          const hasKj = Boolean(v.kanji && /[\u4E00-\u9FAF\u3400-\u4DBF]/.test(v.kanji));
          plantMap.set(id, {
            id,
            vocab_id: id,
            level: 1,
            next_review_date: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
            last_reviewed_at: now.toISOString(),
            word: hasKj ? v.kanji : cleanK,
            kanji: hasKj ? v.kanji : '',
            reading: hasKj ? cleanK : '',
            romaji: v.romaji || '',
            meaning: v.clean_vietnamese || v.vietnamese || '',
            lesson_number: v.lesson_number || 1,
            correct_count: 1,
            wrong_count: 0
          });
        }
      });

      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(Array.from(plantMap.values())));
    }

    // 4. Notify app components via window event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('garden-water-awarded', {
          detail: { amount, newTotal: newDrops, reason }
        })
      );
    }

    return newDrops;
  } catch (err) {
    console.warn('awardGardenWater error:', err);
    return 0;
  }
};

export const getGardenWater = () => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const questKey = `hyper_quests_${today}`;
    const rawQuest = localStorage.getItem(questKey);
    if (rawQuest) {
      try {
        const q = JSON.parse(rawQuest);
        if (typeof q.dewDrops === 'number') return q.dewDrops;
      } catch {}
    }
    const val = localStorage.getItem('hyper_water_drops');
    return val !== null ? parseInt(val, 10) : 160;
  } catch {
    return 160;
  }
};
