import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Container, Spinner, Progress, Modal, ModalBody, Row, Col, Input } from 'reactstrap';
import { 
  Leaf, Star, RefreshCw, Plus, ChevronLeft, CheckCircle2, 
  XCircle, Volume2, BookOpen, Sparkles, Info, X, 
  ChevronRight, Trophy, Droplets, Sun, Award, Check, Layers,
  Flame, Zap, Clock, ShieldCheck, HeartPulse, Search, Sprout
} from 'lucide-react';
import { srsService, vocabService, lessonService, speakJapanese } from '../services/api';
import { sounds } from '../services/sounds';
import { useApp } from '../context/AppContext';
import { getGardenWater, deductGardenWater, awardGardenWater } from '../services/gardenRewards';
import confetti from 'canvas-confetti';

// ── 4 BOTANICAL GROWTH STAGES (EBBINGHAUS SRS INTERVALS) ──
const STAGES = {
  1: {
    level: 1,
    name: 'Hạt Mầm Nở',
    badgeText: 'Mầm Non 🌱',
    color: '#10b981',
    bgColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    pct: 25,
    intervalDays: 1,
    nextText: 'Ôn lại sau 24 giờ',
    desc: 'Hạt giống vừa nảy mầm non trong đất mùn, đang bén rễ đầu tiên.'
  },
  2: {
    level: 2,
    name: 'Chồi Non Bén Rễ',
    badgeText: 'Lá Xanh 🌿',
    color: '#059669',
    bgColor: '#d1fae5',
    borderColor: '#6ee7b7',
    pct: 50,
    intervalDays: 3,
    nextText: 'Ôn lại sau 3 ngày',
    desc: 'Cây đã đâm chồi nảy lộc, rễ bám sâu vào lòng đất kiến thức.'
  },
  3: {
    level: 3,
    name: 'Tán Lá Xanh Mướt',
    badgeText: 'Cây Lớn 🌳',
    color: '#2563eb',
    bgColor: '#eff6ff',
    borderColor: '#bfdbfe',
    pct: 75,
    intervalDays: 7,
    nextText: 'Ôn lại sau 7 ngày',
    desc: 'Tán lá vươn cao đón ánh nắng, kiến thức dần trở thành phản xạ tự nhiên.'
  },
  4: {
    level: 4,
    name: 'Bonsai Quả Vàng',
    badgeText: 'Bonsai Vàng ⭐',
    color: '#f59e0b',
    bgColor: '#fffbeb',
    borderColor: '#fde68a',
    pct: 100,
    intervalDays: 30,
    nextText: 'Khắc sâu vĩnh viễn',
    desc: 'Cây đại thụ trĩu quả vàng hoàng kim — Từ vựng đã khắc sâu vào trí nhớ dài hạn!'
  }
};

const OVERDUE_STAGE = {
  name: 'Đất Khô Cần Tưới',
  badgeText: 'Cần Tưới Gấp 🥀',
  color: '#ef4444',
  bgColor: '#fef2f2',
  borderColor: '#fecaca',
  pct: 15,
  desc: 'Đất đang bị khô cằn do đến hạn ôn tập. Hãy tưới nước ngay để hồi sinh cây!'
};

const hasRealKanji = (str) => /[\u4E00-\u9FAF\u3400-\u4DBF]/.test(str || '');

// ── HIGH-PERFORMANCE BOTANICAL VECTOR PLANT ILLUSTRATION (MEMOIZED) ──
export const BotanicalPlantVisual = React.memo(({ level = 1, isOverdue = false, size = 44, className = '' }) => {
  if (isOverdue) {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M18 42L22 58H42L46 42H18Z" fill="#a8a29e" stroke="#78716c" strokeWidth="2" strokeLinejoin="round"/>
        <rect x="16" y="38" width="32" height="5" rx="2" fill="#78716c"/>
        <path d="M19 42Q32 40 45 42" stroke="#57534e" strokeWidth="2"/>
        <path d="M32 40Q31 28 22 24" stroke="#ca8a04" strokeWidth="3" strokeLinecap="round"/>
        <path d="M22 24Q14 26 16 34Q22 32 22 24Z" fill="#a16207" stroke="#854d0e" strokeWidth="1.5"/>
        <circle cx="38" cy="30" r="3" fill="#ef4444" opacity="0.8"/>
      </svg>
    );
  }
  if (level === 1) {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M18 42L22 58H42L46 42H18Z" fill="#ea580c" stroke="#c2410c" strokeWidth="2" strokeLinejoin="round"/>
        <rect x="16" y="38" width="32" height="5" rx="2" fill="#c2410c"/>
        <ellipse cx="32" cy="41" rx="14" ry="2.5" fill="#451a03"/>
        <path d="M32 40Q32 26 32 20" stroke="#22c55e" strokeWidth="3" strokeLinecap="round"/>
        <path d="M32 26Q20 22 18 14Q28 14 32 24" fill="#4ade80" stroke="#16a34a" strokeWidth="1.5"/>
        <path d="M32 24Q44 20 46 12Q36 12 32 22" fill="#22c55e" stroke="#15803d" strokeWidth="1.5"/>
        <circle cx="41" cy="14" r="2.2" fill="#38bdf8" stroke="#0284c7" strokeWidth="0.8"/>
      </svg>
    );
  }
  if (level === 2) {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M16 40L21 58H43L48 40H16Z" fill="#0284c7" stroke="#0369a1" strokeWidth="2" strokeLinejoin="round"/>
        <rect x="14" y="36" width="36" height="5" rx="2" fill="#0369a1"/>
        <ellipse cx="32" cy="39" rx="16" ry="3" fill="#292524"/>
        <path d="M32 38Q32 22 32 14" stroke="#16a34a" strokeWidth="3" strokeLinecap="round"/>
        <path d="M32 30Q24 25 18 20" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M32 26Q40 21 46 16" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M18 20Q12 12 19 8Q25 14 18 20Z" fill="#22c55e" stroke="#15803d" strokeWidth="1.5"/>
        <path d="M46 16Q52 8 45 4Q39 10 46 16Z" fill="#4ade80" stroke="#16a34a" strokeWidth="1.5"/>
        <path d="M32 14Q27 4 32 2Q37 4 32 14Z" fill="#15803d" stroke="#14532d" strokeWidth="1.5"/>
      </svg>
    );
  }
  if (level === 3) {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M14 44L18 58H46L50 44H14Z" fill="#2563eb" stroke="#1d4ed8" strokeWidth="2" strokeLinejoin="round"/>
        <rect x="12" y="40" width="40" height="5" rx="2" fill="#1d4ed8"/>
        <ellipse cx="32" cy="43" rx="18" ry="3" fill="#1c1917"/>
        <path d="M32 42C30 32 37 25 31 16" stroke="#78350f" strokeWidth="3.5" strokeLinecap="round"/>
        <circle cx="31" cy="14" r="13" fill="#16a34a" stroke="#15803d" strokeWidth="2"/>
        <circle cx="23" cy="16" r="8" fill="#22c55e"/>
        <circle cx="39" cy="16" r="8" fill="#22c55e"/>
        <circle cx="31" cy="8" r="7" fill="#4ade80"/>
        <circle cx="26" cy="13" r="2.5" fill="#f472b6"/>
        <circle cx="36" cy="12" r="2.5" fill="#f472b6"/>
      </svg>
    );
  }
  // Level 4: Golden Bonsai
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M16 42L20 58H44L48 42H16Z" fill="#d97706" stroke="#b45309" strokeWidth="2" strokeLinejoin="round"/>
      <rect x="14" y="38" width="36" height="5" rx="2" fill="#f59e0b" stroke="#b45309" strokeWidth="1.5"/>
      <ellipse cx="32" cy="41" rx="16" ry="3" fill="#1c1917"/>
      <path d="M32 41C31 30 35 25 32 18" stroke="#78350f" strokeWidth="5" strokeLinecap="round"/>
      <circle cx="32" cy="16" r="14" fill="#15803d" stroke="#166534" strokeWidth="2"/>
      <circle cx="23" cy="18" r="9" fill="#16a34a"/>
      <circle cx="41" cy="18" r="9" fill="#16a34a"/>
      <circle cx="32" cy="9" r="8" fill="#22c55e"/>
      <circle cx="26" cy="16" r="3.2" fill="#fbbf24" stroke="#d97706" strokeWidth="1"/>
      <circle cx="37" cy="15" r="3.2" fill="#fbbf24" stroke="#d97706" strokeWidth="1"/>
      <circle cx="32" cy="22" r="3.2" fill="#f59e0b" stroke="#b45309" strokeWidth="1"/>
      <circle cx="32" cy="8" r="2.8" fill="#fbbf24" stroke="#d97706" strokeWidth="1"/>
      <path d="M47 8L48 5L49 8L52 9L49 10L48 13L47 10L44 9Z" fill="#fde047"/>
    </svg>
  );
});

const GUEST_STORAGE_KEY = 'hyper_guest_garden_srs';

const GardenPage = ({ onNavigate }) => {
  const { user } = useApp();
  const [view, setView] = useState('garden'); // 'garden' | 'review'
  const [loading, setLoading] = useState(true);
  const [gardenItems, setGardenItems] = useState([]);
  const [filterLevel, setFilterLevel] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [waterDrops, setWaterDrops] = useState(() => getGardenWater());
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 16;

  // Modals
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [plantModalOpen, setPlantModalOpen] = useState(false);
  const [seedModalOpen, setSeedModalOpen] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [selectedLessonToPlant, setSelectedLessonToPlant] = useState(1);
  const [seedingLoading, setSeedingLoading] = useState(false);

  // Review session state
  const [reviewItems, setReviewItems] = useState([]);
  const [reviewIdx, setReviewIdx] = useState(0);
  const [reviewFlipped, setReviewFlipped] = useState(false);
  const [reviewResults, setReviewResults] = useState([]);
  const [wateringSplash, setWateringSplash] = useState(false);

  // Listen to cross-app watering awards
  useEffect(() => {
    const handleWaterEvent = (e) => {
      if (e.detail && typeof e.detail.newTotal === 'number') {
        setWaterDrops(e.detail.newTotal);
      }
    };
    window.addEventListener('garden-water-awarded', handleWaterEvent);
    return () => window.removeEventListener('garden-water-awarded', handleWaterEvent);
  }, []);

  // Fetch Lessons for Seeding Modal
  useEffect(() => {
    lessonService.getLessons()
      .then(res => {
        if (res.data && Array.isArray(res.data)) {
          setLessons(res.data);
        }
      })
      .catch(() => {});
  }, []);

  // Load Garden Plants from Backend or Guest LocalStorage
  const loadGarden = useCallback(async () => {
    setLoading(true);
    try {
      if (user) {
        // Logged-in: Fetch from PostgreSQL API
        const res = await srsService.getGarden();
        if (res.data && res.data.items) {
          setGardenItems(res.data.items);
        } else {
          setGardenItems([]);
        }
      } else {
        // Guest mode: Read LocalStorage
        const raw = localStorage.getItem(GUEST_STORAGE_KEY);
        let items = [];
        if (raw) {
          try {
            items = JSON.parse(raw) || [];
          } catch {}
        }

        // If guest garden is completely empty, auto-seed Lesson 1 so it's welcoming
        if (items.length === 0) {
          try {
            const vRes = await vocabService.getVocabularies({ lesson: 1 });
            const list = vRes.data?.vocabularies || vRes.data || [];
            if (Array.isArray(list) && list.length > 0) {
              const now = new Date();
              items = list.slice(0, 15).map((v, i) => {
                const isKj = Boolean(v.kanji && hasRealKanji(v.kanji));
                const clnK = v.clean_kana || v.kana || '';
                return {
                  id: v.id,
                  vocab_id: v.id,
                  level: 1,
                  word: isKj ? v.kanji : clnK,
                  kanji: isKj ? v.kanji : '',
                  reading: isKj ? clnK : '',
                  meaning: v.clean_vietnamese || v.vietnamese || '',
                  lesson_number: v.lesson_number || 1,
                  next_review_date: new Date(now.getTime() - (i % 3 === 0 ? 3600000 : -86400000)).toISOString(),
                  last_reviewed_at: now.toISOString(),
                  correct_count: 1,
                  wrong_count: 0
                };
              });
              localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(items));
            }
          } catch {}
        }

        const now = new Date();
        const evaluated = items.map(item => ({
          ...item,
          is_due: item.level < 4 && (!item.next_review_date || new Date(item.next_review_date) <= now),
          is_overdue: item.level < 4 && item.next_review_date && (now - new Date(item.next_review_date)) > 24 * 60 * 60 * 1000
        }));
        setGardenItems(evaluated);
      }
    } catch (err) {
      console.warn('loadGarden error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadGarden();
  }, [loadGarden]);

  // Statistics
  const stats = useMemo(() => {
    const total = gardenItems.length;
    const due = gardenItems.filter(i => i.is_due).length;
    const overdue = gardenItems.filter(i => i.is_overdue).length;
    const l1 = gardenItems.filter(i => i.level === 1).length;
    const l2 = gardenItems.filter(i => i.level === 2).length;
    const l3 = gardenItems.filter(i => i.level === 3).length;
    const l4 = gardenItems.filter(i => i.level === 4).length;
    return { total, due, overdue, l1, l2, l3, l4 };
  }, [gardenItems]);

  // Filtered & Searched Items
  const filteredItems = useMemo(() => {
    let list = gardenItems;
    if (filterLevel === 'due') {
      list = list.filter(i => i.is_due);
    } else if (filterLevel === 'overdue') {
      list = list.filter(i => i.is_overdue);
    } else if (['1', '2', '3', '4'].includes(filterLevel)) {
      list = list.filter(i => i.level === parseInt(filterLevel));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(i => 
        (i.word && i.word.toLowerCase().includes(q)) ||
        (i.reading && i.reading.toLowerCase().includes(q)) ||
        (i.meaning && i.meaning.toLowerCase().includes(q))
      );
    }
    return list;
  }, [gardenItems, filterLevel, searchQuery]);

  // Pagination for zero-lag silky smooth 60fps rendering
  const totalPages = Math.ceil(filteredItems.length / pageSize) || 1;
  const pagedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  // Handle Seeding Lesson
  const handleSeedLesson = async () => {
    setSeedingLoading(true);
    try {
      if (user) {
        await srsService.addLessonToGarden(selectedLessonToPlant);
      } else {
        const vRes = await vocabService.getVocabularies({ lesson: selectedLessonToPlant });
        const list = vRes.data?.vocabularies || vRes.data || [];
        const raw = localStorage.getItem(GUEST_STORAGE_KEY);
        const existing = raw ? JSON.parse(raw) : [];
        const map = new Map(existing.map(p => [p.vocab_id || p.id, p]));
        const now = new Date();
        list.forEach(v => {
          if (!map.has(v.id)) {
            const isKj = Boolean(v.kanji && hasRealKanji(v.kanji));
            const clnK = v.clean_kana || v.kana || '';
            map.set(v.id, {
              id: v.id,
              vocab_id: v.id,
              level: 1,
              word: isKj ? v.kanji : clnK,
              kanji: isKj ? v.kanji : '',
              reading: isKj ? clnK : '',
              meaning: v.clean_vietnamese || v.vietnamese || '',
              lesson_number: v.lesson_number || selectedLessonToPlant,
              next_review_date: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
              last_reviewed_at: now.toISOString(),
              correct_count: 1,
              wrong_count: 0
            });
          }
        });
        localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(Array.from(map.values())));
      }
      awardGardenWater(25, 'Gieo mầm bài học mới');
      sounds.playLevelUp?.();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      await loadGarden();
      setSeedModalOpen(false);
    } catch (err) {
      console.warn('Seed lesson error:', err);
    } finally {
      setSeedingLoading(false);
    }
  };

  // Start Watering Review Session
  const startWateringSession = (itemsToReview = null) => {
    let list = itemsToReview;
    if (!list) {
      list = gardenItems.filter(i => i.is_due);
    }
    if (list.length === 0) {
      // If no due plants, review 10 lowest level plants
      list = [...gardenItems].sort((a, b) => a.level - b.level).slice(0, 10);
    }
    if (list.length === 0) return;

    sounds.playFlip?.();
    setReviewItems(list);
    setReviewIdx(0);
    setReviewFlipped(false);
    setReviewResults([]);
    setView('review');
  };

  // Answer Watering Review Card
  const handleReviewAnswer = async (isCorrect) => {
    const cur = reviewItems[reviewIdx];
    if (!cur) return;

    if (isCorrect) {
      sounds.playCorrect?.();
      deductGardenWater(5);
      setWateringSplash(true);
      setTimeout(() => setWateringSplash(false), 700);
    } else {
      sounds.playWrong?.();
    }

    const newLevel = isCorrect ? Math.min(4, cur.level + 1) : Math.max(1, cur.level - 1);
    const stageInfo = STAGES[newLevel];
    const now = new Date();
    const nextDate = new Date(now.getTime() + stageInfo.intervalDays * 24 * 60 * 60 * 1000).toISOString();

    // Update in local array & database
    try {
      if (user) {
        await srsService.recordReview({ vocab_id: cur.vocab_id || cur.id, correct: isCorrect });
      } else {
        const raw = localStorage.getItem(GUEST_STORAGE_KEY);
        if (raw) {
          const plants = JSON.parse(raw);
          const found = plants.find(p => (p.vocab_id || p.id) === (cur.vocab_id || cur.id));
          if (found) {
            found.level = newLevel;
            found.next_review_date = nextDate;
            found.last_reviewed_at = now.toISOString();
            if (isCorrect) found.correct_count = (found.correct_count || 0) + 1;
            else found.wrong_count = (found.wrong_count || 0) + 1;
            localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(plants));
          }
        }
      }
    } catch {}

    setReviewResults(prev => [...prev, { item: cur, isCorrect, newLevel }]);

    // Move to next card after brief transition
    setTimeout(() => {
      if (reviewIdx < reviewItems.length - 1) {
        setReviewIdx(prev => prev + 1);
        setReviewFlipped(false);
      } else {
        // Complete session
        sounds.playComplete?.();
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
        loadGarden();
        setView('garden');
      }
    }, 450);
  };

  // Inspect Single Plant
  const handleInspectPlant = (plant) => {
    sounds.playFlip?.();
    setSelectedPlant(plant);
    setPlantModalOpen(true);
  };

  // Water Single Plant Directly from Modal
  const handleWaterSinglePlant = async () => {
    if (!selectedPlant) return;
    if (waterDrops < 5) {
      alert('Bình nước của bạn chưa đủ 5 giọt nước! Hãy làm bài trắc nghiệm, luyện gõ hoặc lật thẻ Flashcard để nạp thêm nước.');
      return;
    }
    deductGardenWater(5);
    sounds.playCorrect?.();
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });

    const newLevel = Math.min(4, selectedPlant.level + 1);
    const stageInfo = STAGES[newLevel];
    const now = new Date();
    const nextDate = new Date(now.getTime() + stageInfo.intervalDays * 24 * 60 * 60 * 1000).toISOString();

    if (user) {
      try {
        await srsService.recordReview({ vocab_id: selectedPlant.vocab_id || selectedPlant.id, correct: true });
      } catch {}
    } else {
      const raw = localStorage.getItem(GUEST_STORAGE_KEY);
      if (raw) {
        const plants = JSON.parse(raw);
        const found = plants.find(p => (p.vocab_id || p.id) === (selectedPlant.vocab_id || selectedPlant.id));
        if (found) {
          found.level = newLevel;
          found.next_review_date = nextDate;
          found.last_reviewed_at = now.toISOString();
          found.correct_count = (found.correct_count || 0) + 1;
          localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(plants));
        }
      }
    }

    setPlantModalOpen(false);
    await loadGarden();
  };

  // ── RENDER REVIEW / WATERING SESSION ──
  if (view === 'review') {
    const currentCard = reviewItems[reviewIdx];
    const currentStage = currentCard ? (currentCard.is_overdue ? OVERDUE_STAGE : STAGES[currentCard.level]) : STAGES[1];
    const progressPct = reviewItems.length > 0 ? Math.round(((reviewIdx + 1) / reviewItems.length) * 100) : 0;

    return (
      <Container className="py-3 py-md-4" style={{ maxWidth: '640px' }}>
        {/* Header Bar */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <button
            type="button"
            onClick={() => { setView('garden'); loadGarden(); }}
            className="btn btn-sm btn-light rounded-pill px-3 py-1.5 fw-bold border d-flex align-items-center gap-1 shadow-xs"
          >
            <ChevronLeft size={16} />
            <span>Vườn Cây</span>
          </button>

          <div className="d-flex align-items-center gap-1.5 text-primary fw-bold" style={{ fontSize: '13px' }}>
            <Droplets size={16} />
            <span>Tưới cây {reviewIdx + 1} / {reviewItems.length}</span>
          </div>

          <div className="d-flex align-items-center gap-1 px-2.5 py-1 rounded-pill bg-light border" style={{ fontSize: '12px' }}>
            <Droplets size={13} className="text-info" />
            <span className="fw-black text-navy-dark">{waterDrops} Giọt</span>
          </div>
        </div>

        {/* Progress Bar */}
        <Progress value={progressPct} color="primary" style={{ height: '5px', borderRadius: '4px' }} className="mb-4" />

        {/* Zen Watering Card */}
        {currentCard && (
          <div
            className={`p-4 p-md-5 rounded-4 bg-white border text-center position-relative shadow-sm transition-all ${
              wateringSplash ? 'pulse-correct' : ''
            }`}
            style={{
              borderColor: 'var(--slate-200)',
              minHeight: '380px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: reviewFlipped ? 'default' : 'pointer'
            }}
            onClick={() => {
              if (!reviewFlipped) {
                sounds.playFlip?.();
                setReviewFlipped(true);
              }
            }}
          >
            {/* Top Stage Chip */}
            <div className="d-flex justify-content-between align-items-center">
              <span
                className="badge px-3 py-1 rounded-pill fw-bold"
                style={{ background: currentStage.bgColor, color: currentStage.color, border: `1px solid ${currentStage.borderColor}` }}
              >
                {currentStage.badgeText} • Cấp {currentCard.level}/4
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  speakJapanese(currentCard.reading || currentCard.word);
                }}
                className="btn btn-sm btn-light rounded-circle border p-1 text-primary audio-btn"
                style={{ width: 34, height: 34 }}
                title="Nghe phát âm chuẩn Tokyo"
              >
                <Volume2 size={16} />
              </button>
            </div>

            {/* Plant Vector Visual */}
            <div className="my-3">
              <BotanicalPlantVisual level={currentCard.level} isOverdue={currentCard.is_overdue} size={76} />
            </div>

            {/* Prompt Display */}
            <div>
              <h1
                className="fw-black text-navy-dark mb-1 font-monospace"
                style={{
                  fontSize: 'clamp(2.2rem, 7vw, 3.4rem)',
                  fontFamily: "'Noto Sans JP', 'Hiragino Sans', sans-serif"
                }}
              >
                {currentCard.word}
              </h1>

              {currentCard.reading && currentCard.reading !== currentCard.word && (
                <div className="fw-bold font-monospace text-muted mb-2" style={{ fontSize: '1.25rem' }}>
                  {currentCard.reading}
                </div>
              )}
            </div>

            {/* Flipped Meaning State */}
            {reviewFlipped ? (
              <div className="animate-fade-in my-3 p-3 rounded-3 bg-light border">
                <h4 className="fw-black text-primary mb-0">{currentCard.meaning}</h4>
                {currentCard.example_jp && (
                  <div className="mt-2 text-muted small">
                    <div className="fw-semibold text-dark">{currentCard.example_jp}</div>
                    <div>{currentCard.example_vi}</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-muted small my-3 user-select-none">
                👆 Chạm vào thẻ để xem nghĩa & kiểm tra trí nhớ
              </div>
            )}

            {/* Action Buttons */}
            {reviewFlipped ? (
              <div className="d-flex justify-content-center gap-2.5 mt-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleReviewAnswer(false)}
                  className="btn btn-danger rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-1.5 shadow-xs"
                >
                  <XCircle size={16} />
                  <span>Chưa thuộc (Cần ôn)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleReviewAnswer(true)}
                  className="btn btn-success rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-1.5 shadow-xs"
                >
                  <CheckCircle2 size={16} />
                  <span>Đã nhớ vững (Tưới nước 🌱)</span>
                </button>
              </div>
            ) : (
              <div className="pt-2">
                <span className="badge bg-light text-secondary border px-3 py-1 rounded-pill">
                  Đánh giá sau khi lật thẻ
                </span>
              </div>
            )}
          </div>
        )}
      </Container>
    );
  }

  // ── RENDER MAIN ZEN GARDEN DASHBOARD ──
  return (
    <Container className="py-2.5 py-md-4" style={{ maxWidth: '1180px' }}>
      {/* ── 1. TOKYO HYDRAULIC RESERVOIR (BÌNH NƯỚC TRI THỨC 3D) ── */}
      <div
        className="p-3.5 p-md-4 mb-3.5 rounded-4 text-white shadow-sm position-relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #091224 0%, #0f172a 50%, #1e3a8a 100%)',
          border: '1px solid rgba(255, 255, 255, 0.12)'
        }}
      >
        <Row className="align-items-center g-3">
          <Col xs={12} md={7}>
            <div className="d-flex align-items-center gap-2 mb-1.5">
              <span className="badge bg-primary bg-opacity-30 border border-primary text-info fw-bold px-2.5 py-1 rounded-pill">
                HỆ THỐNG LẶP LẠI NGẮT QUÃNG • EBBINGHAUS SRS
              </span>
            </div>
            <h3 className="fw-black mb-1.5 text-white tracking-tight">
              Vườn Cây Trí Nhớ Bonsai
            </h3>
            <p className="text-white text-opacity-75 small mb-0" style={{ maxWidth: '580px', lineHeight: '1.5' }}>
              Mỗi từ vựng là một mầm cây lớn dần qua 4 giai đoạn. Nước tưới cây được tích lũy <strong>tự động</strong> khi bạn học bài, làm trắc nghiệm, lật Flashcard hoặc luyện gõ trên toàn hệ thống.
            </p>
          </Col>

          {/* Water Reservoir Widget */}
          <Col xs={12} md={5}>
            <div
              className="p-3 rounded-4 bg-white bg-opacity-10 border border-white border-opacity-20 backdrop-blur"
              style={{ backdropFilter: 'blur(16px)' }}
            >
              <div className="d-flex justify-content-between align-items-center mb-1.5">
                <div className="d-flex align-items-center gap-1.5">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle bg-info text-dark shadow-xs"
                    style={{ width: 30, height: 30 }}
                  >
                    <Droplets size={16} />
                  </div>
                  <span className="fw-bold text-white small">Bình Nước Tri Thức</span>
                </div>
                <span className="fw-black text-warning fs-5">{waterDrops} Giọt</span>
              </div>

              <Progress
                value={Math.min(100, Math.round((waterDrops / 200) * 100))}
                color="info"
                style={{ height: '6px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.2)' }}
                className="mb-2"
              />

              <div className="d-flex justify-content-between align-items-center small text-white text-opacity-70" style={{ fontSize: '11px' }}>
                <span>Tưới 1 cây: 5 giọt nước</span>
                <span>Học bài để nạp thêm nước</span>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* ── 2. METRIC STATS ROW (4 EQUAL BOXES) ── */}
      <Row className="g-2.5 mb-3.5">
        <Col xs={6} md={3}>
          <div className="p-3 rounded-4 bg-white border shadow-xs d-flex align-items-center gap-2.5">
            <div className="p-2.5 rounded-3 bg-light text-primary flex-shrink-0">
              <Sprout size={20} />
            </div>
            <div>
              <small className="text-muted d-block fw-semibold" style={{ fontSize: '11px' }}>Tổng Cây Trồng</small>
              <span className="fw-black text-navy-dark fs-5">{stats.total} Cây</span>
            </div>
          </div>
        </Col>

        <Col xs={6} md={3}>
          <div className="p-3 rounded-4 bg-white border shadow-xs d-flex align-items-center gap-2.5" style={{ borderColor: stats.due > 0 ? '#fecaca' : 'var(--slate-200)' }}>
            <div className="p-2.5 rounded-3 bg-danger bg-opacity-10 text-danger flex-shrink-0">
              <Droplets size={20} />
            </div>
            <div>
              <small className="text-danger d-block fw-semibold" style={{ fontSize: '11px' }}>Cần Tưới Hôm Nay</small>
              <span className="fw-black text-danger fs-5">{stats.due} Cây</span>
            </div>
          </div>
        </Col>

        <Col xs={6} md={3}>
          <div className="p-3 rounded-4 bg-white border shadow-xs d-flex align-items-center gap-2.5">
            <div className="p-2.5 rounded-3 bg-success bg-opacity-10 text-success flex-shrink-0">
              <Leaf size={20} />
            </div>
            <div>
              <small className="text-muted d-block fw-semibold" style={{ fontSize: '11px' }}>Đang Lớn Lên</small>
              <span className="fw-black text-success fs-5">{stats.l1 + stats.l2 + stats.l3} Cây</span>
            </div>
          </div>
        </Col>

        <Col xs={6} md={3}>
          <div className="p-3 rounded-4 bg-white border shadow-xs d-flex align-items-center gap-2.5">
            <div className="p-2.5 rounded-3 bg-warning bg-opacity-10 text-warning flex-shrink-0">
              <Star size={20} />
            </div>
            <div>
              <small className="text-muted d-block fw-semibold" style={{ fontSize: '11px' }}>Bonsai Vàng ⭐</small>
              <span className="fw-black text-warning fs-5">{stats.l4} Cây</span>
            </div>
          </div>
        </Col>
      </Row>

      {/* ── 3. ACTION CONTROLS & SEEDING BAR ── */}
      <div className="p-3 rounded-4 bg-white border shadow-xs mb-3.5">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2.5">
          <div className="d-flex align-items-center gap-2 flex-wrap">
            {/* Primary Action Button: Water Due Plants */}
            <button
              type="button"
              disabled={stats.due === 0}
              onClick={() => startWateringSession()}
              className={`btn btn-sm rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-1.5 shadow-xs ${
                stats.due > 0 ? 'btn-primary text-white' : 'btn-light text-muted border'
              }`}
              style={{ fontSize: '13px' }}
            >
              <Droplets size={16} />
              <span>
                {stats.due > 0 ? `Tưới Nước Cho Cây Đến Hạn (${stats.due} Cây)` : 'Tất Cả Cây Đều Đang Khỏe Mạnh 🌱'}
              </span>
            </button>

            {/* Seeding New Lesson Button */}
            <button
              type="button"
              onClick={() => setSeedModalOpen(true)}
              className="btn btn-sm btn-light border rounded-pill px-3.5 py-2 fw-semibold text-dark d-flex align-items-center gap-1.5 shadow-xs"
              style={{ fontSize: '13px' }}
            >
              <Plus size={15} className="text-primary" />
              <span>Gieo Mầm Bài Mới</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="position-relative flex-grow-1 flex-md-grow-0" style={{ maxWidth: '300px', width: '100%' }}>
            <Input
              type="text"
              placeholder="Tìm theo Kanji, Kana, nghĩa..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="form-control-sm rounded-pill ps-4 border"
              style={{ fontSize: '12.5px', height: '36px' }}
            />
            <Search size={14} className="position-absolute text-muted" style={{ left: '12px', top: '11px' }} />
          </div>
        </div>

        {/* Filter Chips Bar */}
        <div className="d-flex align-items-center gap-1.5 mt-3 pt-2.5 border-top border-slate-100 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {[
            { id: 'all', label: `Tất cả (${stats.total})` },
            { id: 'due', label: `Cần tưới ngay (${stats.due})`, highlight: stats.due > 0 },
            { id: '1', label: `Mầm non (${stats.l1})` },
            { id: '2', label: `Lá xanh (${stats.l2})` },
            { id: '3', label: `Cây lớn (${stats.l3})` },
            { id: '4', label: `Bonsai vàng ⭐ (${stats.l4})` },
          ].map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                setFilterLevel(f.id);
                setCurrentPage(1);
              }}
              className={`btn btn-sm rounded-pill px-3 py-1 fw-bold border flex-shrink-0 ${
                filterLevel === f.id
                  ? 'btn-primary text-white shadow-xs'
                  : f.highlight
                  ? 'btn-danger text-white shadow-xs'
                  : 'btn-light text-muted'
              }`}
              style={{ fontSize: '12px' }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 4. ZEN BONSAI SHELVES GRID (16 POTS PER PAGE) ── */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner color="primary" />
          <p className="mt-2 text-muted small">Đang chăm sóc vườn cây Bonsai...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-5 text-center bg-white rounded-4 border shadow-xs">
          <Sprout size={44} className="text-muted mb-2 opacity-50" />
          <h6 className="fw-bold text-navy-dark">Không tìm thấy chậu cây nào</h6>
          <p className="text-muted small mb-3">Bạn có thể gieo thêm hạt giống từ 25 bài học Minna no Nihongo vào vườn.</p>
          <button
            type="button"
            onClick={() => setSeedModalOpen(true)}
            className="btn btn-sm btn-primary rounded-pill px-3.5 py-1.5 fw-bold"
          >
            Gieo Mầm Ngay 🌱
          </button>
        </div>
      ) : (
        <>
          <Row className="g-2.5">
            {pagedItems.map((plant) => {
              const stage = plant.is_overdue ? OVERDUE_STAGE : STAGES[plant.level] || STAGES[1];
              return (
                <Col xs={6} sm={4} md={3} key={plant.id || plant.vocab_id}>
                  <div
                    onClick={() => handleInspectPlant(plant)}
                    className="p-3 rounded-4 bg-white border shadow-xs position-relative transition-all"
                    style={{
                      cursor: 'pointer',
                      borderColor: plant.is_due ? 'var(--danger-border)' : 'var(--slate-200)',
                      background: plant.is_due ? '#fffdfd' : '#ffffff'
                    }}
                  >
                    {/* Top Status Badge */}
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span
                        className="badge px-2 py-0.5 rounded-pill fw-bold"
                        style={{
                          fontSize: '10px',
                          background: stage.bgColor,
                          color: stage.color,
                          border: `1px solid ${stage.borderColor}`
                        }}
                      >
                        {stage.badgeText}
                      </span>

                      {plant.is_due && (
                        <span className="badge bg-danger text-white rounded-pill px-1.5 py-0.5 animate-pulse" style={{ fontSize: '9px' }}>
                          💧 Khát
                        </span>
                      )}
                    </div>

                    {/* Plant Vector Visual */}
                    <div className="text-center my-2">
                      <BotanicalPlantVisual level={plant.level} isOverdue={plant.is_overdue} size={46} />
                    </div>

                    {/* Word Display */}
                    <div className="text-center">
                      <div
                        className="fw-black text-navy-dark font-monospace text-truncate"
                        style={{
                          fontSize: '16px',
                          fontFamily: "'Noto Sans JP', 'Hiragino Sans', sans-serif"
                        }}
                      >
                        {plant.word}
                      </div>

                      {plant.reading && plant.reading !== plant.word && (
                        <div className="small text-muted font-monospace text-truncate" style={{ fontSize: '11px' }}>
                          {plant.reading}
                        </div>
                      )}

                      <div className="small text-dark text-truncate mt-1 fw-semibold" style={{ fontSize: '12px' }}>
                        {plant.meaning}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-2.5 pt-1.5 border-top border-slate-100">
                      <div className="d-flex justify-content-between align-items-center mb-1 small text-muted" style={{ fontSize: '9.5px' }}>
                        <span>Cấp {plant.level}/4</span>
                        <span>{stage.pct}%</span>
                      </div>
                      <Progress
                        value={stage.pct}
                        color={plant.level === 4 ? 'warning' : 'success'}
                        style={{ height: '3.5px', borderRadius: '3px' }}
                      />
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center align-items-center gap-2 mt-4">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="btn btn-sm btn-light rounded-pill px-3 py-1 fw-bold border shadow-xs"
                style={{ fontSize: '12px' }}
              >
                <ChevronLeft size={14} className="me-1" />
                <span>Trang trước</span>
              </button>

              <span className="text-muted small fw-bold px-2">
                Trang {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="btn btn-sm btn-light rounded-pill px-3 py-1 fw-bold border shadow-xs"
                style={{ fontSize: '12px' }}
              >
                <span>Trang sau</span>
                <ChevronRight size={14} className="ms-1" />
              </button>
            </div>
          )}
        </>
      )}

      {/* ── 5. SEEDING MODAL (GIEO MẦM BÀI HỌC) ── */}
      <Modal isOpen={seedModalOpen} toggle={() => setSeedModalOpen(false)} centered className="jlpt-modal">
        <ModalBody className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-black mb-0 text-navy-dark">Gieo Mầm Bài Học Vào Vườn 🌱</h5>
            <button
              type="button"
              onClick={() => setSeedModalOpen(false)}
              className="btn btn-sm btn-light rounded-circle p-1"
              style={{ width: 30, height: 30 }}
            >
              <X size={16} />
            </button>
          </div>

          <p className="text-muted small mb-3">
            Chọn bài học Minna no Nihongo để gieo các từ vựng thành mầm cây non. Mỗi bài gieo thành công được thưởng ngay <strong>+25 Giọt Nước</strong>.
          </p>

          {/* 25 Lessons Grid Picker */}
          <div
            className="p-2.5 rounded-3 bg-light border mb-3"
            style={{
              maxHeight: '260px',
              overflowY: 'auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))',
              gap: '6px'
            }}
          >
            {Array.from({ length: 25 }, (_, i) => i + 1).map(num => (
              <button
                key={num}
                type="button"
                onClick={() => setSelectedLessonToPlant(num)}
                className={`btn btn-sm rounded-3 py-2 fw-bold text-center border ${
                  selectedLessonToPlant === num ? 'btn-primary text-white shadow-xs' : 'btn-white bg-white text-dark'
                }`}
                style={{ fontSize: '12px' }}
              >
                Bài {num < 10 ? `0${num}` : num}
              </button>
            ))}
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              onClick={() => setSeedModalOpen(false)}
              className="btn btn-sm btn-light rounded-pill px-3 py-1.5 fw-semibold"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={seedingLoading}
              onClick={handleSeedLesson}
              className="btn btn-sm btn-primary rounded-pill px-4 py-1.5 fw-bold shadow-xs"
            >
              {seedingLoading ? <Spinner size="sm" /> : <Sprout size={14} className="me-1" />}
              <span>Gieo Bài {selectedLessonToPlant} Vào Vườn</span>
            </button>
          </div>
        </ModalBody>
      </Modal>

      {/* ── 6. PLANT INSPECTION MODAL (XEM CHI TIẾT CÂY & TƯỚI LẺ) ── */}
      <Modal isOpen={plantModalOpen} toggle={() => setPlantModalOpen(false)} centered className="jlpt-modal">
        {selectedPlant && (
          <ModalBody className="p-4 text-center">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span
                className="badge px-3 py-1 rounded-pill fw-bold"
                style={{
                  background: (selectedPlant.is_overdue ? OVERDUE_STAGE : STAGES[selectedPlant.level]).bgColor,
                  color: (selectedPlant.is_overdue ? OVERDUE_STAGE : STAGES[selectedPlant.level]).color,
                  border: `1px solid ${(selectedPlant.is_overdue ? OVERDUE_STAGE : STAGES[selectedPlant.level]).borderColor}`
                }}
              >
                {(selectedPlant.is_overdue ? OVERDUE_STAGE : STAGES[selectedPlant.level]).name} • Cấp {selectedPlant.level}/4
              </span>

              <button
                type="button"
                onClick={() => setPlantModalOpen(false)}
                className="btn btn-sm btn-light rounded-circle p-1"
                style={{ width: 30, height: 30 }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Plant Vector Visual */}
            <div className="my-3">
              <BotanicalPlantVisual level={selectedPlant.level} isOverdue={selectedPlant.is_overdue} size={84} />
            </div>

            {/* Word details */}
            <h2
              className="fw-black text-navy-dark mb-1 font-monospace"
              style={{ fontFamily: "'Noto Sans JP', 'Hiragino Sans', sans-serif" }}
            >
              {selectedPlant.word}
            </h2>

            {selectedPlant.reading && selectedPlant.reading !== selectedPlant.word && (
              <div className="text-primary fw-bold fs-5 font-monospace mb-1">
                {selectedPlant.reading}
              </div>
            )}

            <h5 className="fw-bold text-dark mt-2 mb-3">{selectedPlant.meaning}</h5>

            <div className="d-flex justify-content-center gap-2 mb-3">
              <button
                type="button"
                onClick={() => speakJapanese(selectedPlant.reading || selectedPlant.word)}
                className="btn btn-sm btn-light border rounded-pill px-3 py-1 text-primary fw-semibold d-flex align-items-center gap-1"
                style={{ fontSize: '12px' }}
              >
                <Volume2 size={14} />
                <span>Nghe phát âm Tokyo</span>
              </button>
            </div>

            {/* Stage info description */}
            <div className="p-3 rounded-3 bg-light border text-start small mb-3">
              <div className="fw-bold text-dark mb-1">Chu kỳ sinh trưởng Ebbinghaus:</div>
              <div className="text-muted">
                {(selectedPlant.is_overdue ? OVERDUE_STAGE : STAGES[selectedPlant.level]).desc}
              </div>
              <div className="text-primary fw-semibold mt-1">
                Lịch tưới kế tiếp: {(selectedPlant.is_overdue ? OVERDUE_STAGE : STAGES[selectedPlant.level]).nextText}
              </div>
            </div>

            {/* Water Single Plant Button */}
            <div className="d-flex justify-content-center gap-2">
              <button
                type="button"
                onClick={handleWaterSinglePlant}
                className="btn btn-primary rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-1.5 shadow-xs"
              >
                <Droplets size={16} />
                <span>Tưới Riêng Cây Này (Dùng 5 Giọt Nước)</span>
              </button>
            </div>
          </ModalBody>
        )}
      </Modal>
    </Container>
  );
};

export default GardenPage;
