import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Container, Spinner, Progress, Modal, ModalBody } from 'reactstrap';
import { 
  Leaf, Star, RefreshCw, Plus, ChevronLeft, CheckCircle2, 
  XCircle, Volume2, BookOpen, Sparkles, Info, X, 
  ChevronRight, Trophy, Flower2, TreePine, LogIn, AlertCircle,
  Droplets, Sun, Award, Check, Layers, SlidersHorizontal, Heart,
  Flame, Zap, Clock, ShieldCheck, HeartPulse, Activity, Gift, Sprout
} from 'lucide-react';
import { srsService, vocabService, lessonService, speakJapanese } from '../services/api';
import { sounds } from '../services/sounds';
import { useApp } from '../context/AppContext';
import confetti from 'canvas-confetti';

// ── Realistic SRS Botanical Stages ──
const STAGES = {
  1: {
    level: 1,
    name: 'Hạt Nảy Mầm',
    icon: Leaf,
    badgeText: 'Mầm Non 🌱',
    color: '#10b981',
    bgColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    pct: 25,
    hydrationText: 'Đang mọc rễ',
    nextText: 'Ôn sau 1 ngày',
    desc: 'Hạt giống vừa nảy mầm non trong đất mùn phì nhiêu'
  },
  2: {
    level: 2,
    name: 'Nhánh Lá Xanh',
    icon: TreePine,
    badgeText: 'Lá Xanh 🌿',
    color: '#059669',
    bgColor: '#d1fae5',
    borderColor: '#6ee7b7',
    pct: 50,
    hydrationText: 'Tươi tốt khỏe mạnh',
    nextText: 'Ôn sau 3 ngày',
    desc: 'Cây đã phát triển nhánh lá xanh mướt, rễ bám sâu vào lòng đất'
  },
  3: {
    level: 3,
    name: 'Hoa Nở Rực Rỡ',
    icon: Flower2,
    badgeText: 'Nở Hoa 🌸',
    color: '#ec4899',
    bgColor: '#fdf2f8',
    borderColor: '#f9a8d4',
    pct: 75,
    hydrationText: 'Thấm nhuần tri thức',
    nextText: 'Ôn sau 7 ngày',
    desc: 'Những nụ hoa anh đào bung nở rạng rỡ, tỏa ngát hương thơm'
  },
  4: {
    level: 4,
    name: 'Cây Quả Vàng',
    icon: Star,
    badgeText: 'Quả Vàng ⭐',
    color: '#f59e0b',
    bgColor: '#fffbeb',
    borderColor: '#fde68a',
    pct: 100,
    hydrationText: 'Thuộc Vĩnh Viễn',
    nextText: 'Đã hoàn thành',
    desc: 'Cây đại thụ trĩu quả vàng hoàng kim — Từ vựng đã khắc sâu vào trí nhớ dài hạn!'
  }
};

const OVERDUE_STAGE = {
  name: 'Cần Tưới Nước Gấp',
  icon: AlertCircle,
  badgeText: 'Héo Úa 🥀',
  color: '#ef4444',
  bgColor: '#fef2f2',
  borderColor: '#fecaca',
  pct: 15,
  hydrationText: 'Khát nước nghiêm trọng',
  nextText: 'Cần cấp cứu ngay',
  desc: 'Cây đang bị thiếu nước do quá hạn ôn tập. Hãy tưới nước ngay để hồi sinh!'
};

const getStageInfo = (item) => {
  if (item.is_overdue) return OVERDUE_STAGE;
  return STAGES[item.level] || STAGES[1];
};

const GUEST_STORAGE_KEY = 'hyper_guest_garden_srs';

const GardenPage = ({ onNavigate }) => {
  const { user } = useApp();
  const [view, setView] = useState('garden'); // 'garden' | 'add' | 'review' | 'done' | 'quests'
  const [loading, setLoading] = useState(true);
  const [gardenItems, setGardenItems] = useState([]);
  const [stats, setStats] = useState({});
  const [filterLevel, setFilterLevel] = useState('all');
  const [lessons, setLessons] = useState([]);
  
  // Multi-lesson seed planting state
  const [selectedPlantLessons, setSelectedPlantLessons] = useState(() => new Set([1]));
  const [addLoading, setAddLoading] = useState(false);
  const [addResult, setAddResult] = useState(null);

  // Selected plant inspection modal
  const [selectedPlant, setSelectedPlant] = useState(null);

  // Watering rain animation state
  const [isWateringRain, setIsWateringRain] = useState(false);

  // Review session state
  const [dueItems, setDueItems] = useState([]);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [reviewFlipped, setReviewFlipped] = useState(false);
  const [reviewAnswered, setReviewAnswered] = useState(false);
  const [reviewResults, setReviewResults] = useState([]);
  const [reviewDone, setReviewDone] = useState(false);

  // Daily Quests State with Claimable Drops
  const [dailyQuests, setDailyQuests] = useState(() => {
    const today = new Date().toISOString().slice(0, 10);
    const saved = localStorage.getItem(`hyper_quests_${today}`);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      wateredCount: 0,
      wateredTarget: 3,
      wateredClaimed: false,
      perfectSession: false,
      perfectClaimed: false,
      plantedToday: false,
      plantedClaimed: false,
      matchPlayed: false,
      matchClaimed: false,
      dewDrops: 150
    };
  });

  const saveQuests = (newQuests) => {
    const today = new Date().toISOString().slice(0, 10);
    setDailyQuests(newQuests);
    try {
      localStorage.setItem(`hyper_quests_${today}`, JSON.stringify(newQuests));
    } catch {}
  };

  // Helper for guest data
  const getGuestItems = () => {
    try {
      const data = localStorage.getItem(GUEST_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  const saveGuestItems = (items) => {
    try {
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save guest garden', e);
    }
  };

  const calculateStats = (items) => {
    const now = new Date();
    const processed = items.map(row => ({
      ...row,
      is_due: row.level < 4 && row.next_review_date && new Date(row.next_review_date) <= now,
      is_overdue: row.level < 4 && row.next_review_date && (now - new Date(row.next_review_date)) > 24 * 60 * 60 * 1000
    }));

    const computedStats = {
      total: processed.length,
      level1: processed.filter(i => i.level === 1).length,
      level2: processed.filter(i => i.level === 2).length,
      level3: processed.filter(i => i.level === 3).length,
      level4: processed.filter(i => i.level === 4).length,
      due_count: processed.filter(i => i.is_due).length,
      overdue_count: processed.filter(i => i.is_overdue).length
    };

    return { items: processed, stats: computedStats };
  };

  const loadGarden = useCallback(async () => {
    setLoading(true);
    try {
      if (user) {
        const res = await srsService.getGarden();
        setGardenItems(res.data?.items || []);
        setStats(res.data?.stats || {});
      } else {
        const raw = getGuestItems();
        const { items: processed, stats: s } = calculateStats(raw);
        setGardenItems(processed);
        setStats(s);
      }
    } catch (err) {
      console.error('[Garden] load error:', err);
      const raw = getGuestItems();
      const { items: processed, stats: s } = calculateStats(raw);
      setGardenItems(processed);
      setStats(s);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadGarden();
    lessonService.getLessons().then(r => setLessons(r.data || [])).catch(() => {});
  }, [loadGarden]);

  // Compute Gardener Rank
  const gardenerRank = useMemo(() => {
    const total = stats.total || 0;
    const mastered = stats.level4 || 0;
    if (mastered >= 30 || total >= 200) return { title: 'Thần Nông Trí Nhớ 👑', badge: 'Huyền Thoại', color: '#8b5cf6' };
    if (mastered >= 15 || total >= 100) return { title: 'Chủ Vườn Bách Thảo 🌳', badge: 'Bậc Thầy', color: '#2563eb' };
    if (mastered >= 5 || total >= 50) return { title: 'Nghệ Nhân Hoa Cỏ 🌸', badge: 'Tinh Anh', color: '#ec4899' };
    if (total >= 15) return { title: 'Chăm Sóc Mầm Xanh 🌿', badge: 'Chuyên Cần', color: '#059669' };
    return { title: 'Tập Sự Vườn Ươm 🌱', badge: 'Khởi Đầu', color: '#10b981' };
  }, [stats]);

  // Start Watering Review Session
  const startReview = async (specificPlant = null) => {
    try {
      sounds.playWater?.();
      setIsWateringRain(true);
      setTimeout(() => setIsWateringRain(false), 1400);

      let due = [];
      if (specificPlant) {
        due = [specificPlant];
      } else if (user) {
        const res = await srsService.getDue({ limit: 20 });
        due = res.data?.items || [];
      } else {
        const now = new Date();
        due = gardenItems.filter(i => i.level < 4 && i.next_review_date && new Date(i.next_review_date) <= now).slice(0, 20);
      }

      if (due.length === 0) {
        setView('garden');
        return;
      }

      setDueItems(due);
      setReviewIndex(0);
      setReviewFlipped(false);
      setReviewAnswered(false);
      setReviewResults([]);
      setReviewDone(false);
      setSelectedPlant(null);
      setView('review');
    } catch (err) {
      console.error('[Garden] startReview error:', err);
    }
  };

  const handleReviewAnswer = async (correct) => {
    if (reviewAnswered) return;
    setReviewAnswered(true);

    const item = dueItems[reviewIndex];
    try {
      let newLevel = item.level;
      if (user) {
        const res = await srsService.recordReview({ vocab_id: item.vocab_id || item.id, correct });
        newLevel = res.data?.new_level || (correct ? Math.min(item.level + 1, 4) : Math.max(item.level - 1, 1));
      } else {
        newLevel = correct ? Math.min(item.level + 1, 4) : Math.max(item.level - 1, 1);
        const daysMap = { 1: 1, 2: 3, 3: 7, 4: 30 };
        const nextReview = newLevel === 4 ? null : new Date(Date.now() + (daysMap[newLevel] || 3) * 24 * 60 * 60 * 1000).toISOString();
        const currentGuest = getGuestItems();
        const updated = currentGuest.map(g => {
          if ((g.vocab_id || g.id) === (item.vocab_id || item.id)) {
            return {
              ...g,
              level: newLevel,
              next_review_date: nextReview,
              last_reviewed_at: new Date().toISOString(),
              correct_count: (g.correct_count || 0) + (correct ? 1 : 0),
              wrong_count: (g.wrong_count || 0) + (correct ? 0 : 1)
            };
          }
          return g;
        });
        saveGuestItems(updated);
      }

      setReviewResults(prev => [...prev, { ...item, correct, new_level: newLevel }]);

      if (correct) {
        sounds.playWater?.();
        if (newLevel === 4) {
          sounds.playLevelUp?.();
          confetti({ particleCount: 90, spread: 80, origin: { y: 0.5 }, colors: ['#f59e0b', '#fde68a', '#ffffff'] });
        }
      } else {
        sounds.playWrong?.();
      }

      setTimeout(() => {
        if (reviewIndex + 1 >= dueItems.length) {
          setReviewDone(true);
          setView('done');
          loadGarden();

          // Update quest progress
          const allCorrect = [...reviewResults, { correct }].every(r => r.correct);
          const currentWatered = dailyQuests.wateredCount + dueItems.length;
          saveQuests({
            ...dailyQuests,
            wateredCount: currentWatered,
            perfectSession: allCorrect || dailyQuests.perfectSession
          });
        } else {
          setReviewIndex(i => i + 1);
          setReviewFlipped(false);
          setReviewAnswered(false);
        }
      }, 700);
    } catch (err) {
      console.error('[Garden] review answer error:', err);
    }
  };

  // Instant Revive with Dew Drops
  const handleInstantRevive = (plant) => {
    if (dailyQuests.dewDrops < 40) {
      alert('Bạn cần ít nhất 40 Giọt Sương Thần để hồi sinh cây này! Hãy hoàn thành nhiệm vụ để nhận thêm sương.');
      return;
    }

    sounds.playLevelUp?.();
    const updatedDew = dailyQuests.dewDrops - 40;
    saveQuests({ ...dailyQuests, dewDrops: updatedDew });

    // Mark plant as hydrated
    const nextDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
    if (!user) {
      const current = getGuestItems();
      const updated = current.map(p => {
        if ((p.vocab_id || p.id) === (plant.vocab_id || plant.id)) {
          return { ...p, level: Math.max(p.level, 1), next_review_date: nextDate };
        }
        return p;
      });
      saveGuestItems(updated);
    }
    setSelectedPlant(null);
    loadGarden();
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.5 } });
  };

  // Multi-lesson planting logic
  const handleTogglePlantLesson = (num) => {
    setSelectedPlantLessons(prev => {
      const next = new Set(prev);
      if (next.has(num)) {
        if (next.size > 1) next.delete(num);
      } else {
        next.add(num);
      }
      return next;
    });
  };

  const handlePlantSelectedLessons = async () => {
    setAddLoading(true);
    setAddResult(null);
    try {
      const lessonArray = Array.from(selectedPlantLessons);
      let totalAdded = 0;
      let totalWords = 0;

      for (const lesNum of lessonArray) {
        if (user) {
          const res = await srsService.addLessonToGarden(lesNum);
          totalAdded += res.data?.added || 0;
          totalWords += res.data?.total || 0;
        } else {
          const vocabRes = await vocabService.getVocabularies({ lesson: lesNum });
          const vocabs = Array.isArray(vocabRes.data) ? vocabRes.data : (vocabRes.data?.data || []);
          const currentGuest = getGuestItems();
          const existingIds = new Set(currentGuest.map(g => g.vocab_id || g.id));
          const now = new Date();
          const nextDate = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString();

          vocabs.forEach(v => {
            if (!existingIds.has(v.id)) {
              currentGuest.push({
                id: v.id,
                vocab_id: v.id,
                level: 1,
                next_review_date: nextDate,
                last_reviewed_at: now.toISOString(),
                word: v.kanji || v.clean_kana || v.kana || '',
                reading: v.kanji ? (v.clean_kana || v.kana || '') : '',
                meaning: v.clean_vietnamese || v.vietnamese || '',
                lesson_number: v.lesson_number || lesNum
              });
              totalAdded++;
            }
          });
          totalWords += vocabs.length;
          saveGuestItems(currentGuest);
        }
      }

      setAddResult({ success: true, added: totalAdded, total: totalWords });
      loadGarden();
      saveQuests({ ...dailyQuests, plantedToday: true });
      sounds.playLevelUp?.();
    } catch (err) {
      console.error('[Garden] add lesson error:', err);
      setAddResult({ success: false });
    } finally {
      setAddLoading(false);
    }
  };

  // Claim Quest Reward
  const claimQuestReward = (type, dropAmount) => {
    sounds.playLevelUp?.();
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    const newDew = dailyQuests.dewDrops + dropAmount;
    if (type === 'water') {
      saveQuests({ ...dailyQuests, wateredClaimed: true, dewDrops: newDew });
    } else if (type === 'perfect') {
      saveQuests({ ...dailyQuests, perfectClaimed: true, dewDrops: newDew });
    } else if (type === 'plant') {
      saveQuests({ ...dailyQuests, plantedClaimed: true, dewDrops: newDew });
    } else if (type === 'match') {
      saveQuests({ ...dailyQuests, matchClaimed: true, dewDrops: newDew });
    }
  };

  const filteredItems = gardenItems.filter(item => {
    if (filterLevel === 'all') return true;
    if (filterLevel === 'due') return item.is_due;
    if (filterLevel === 'overdue') return item.is_overdue;
    return item.level === parseInt(filterLevel);
  });

  // ─── REVIEW / WATERING SCREEN ───
  if (view === 'review') {
    const currentItem = dueItems[reviewIndex];
    const stage = getStageInfo(currentItem);
    const StageIcon = stage.icon;
    const progress = dueItems.length > 0 ? Math.round(((reviewIndex) / dueItems.length) * 100) : 0;

    return (
      <div className="garden-page">
        <Container className="py-3 py-md-4" style={{ maxWidth: 580 }}>
          {/* Header */}
          <div className="d-flex align-items-center justify-content-between mb-3">
            <button 
              type="button" 
              className="garden-back-btn" 
              onClick={() => { setView('garden'); loadGarden(); }}
            >
              <ChevronLeft size={18} /> Vườn cây
            </button>
            <div className="d-flex align-items-center gap-1.5">
              <Droplets size={16} className="text-info" />
              <span className="garden-review-count">Đang tưới {reviewIndex + 1} / {dueItems.length} cây</span>
            </div>
          </div>

          <Progress value={progress} className="mb-4" style={{ height: 7, borderRadius: 999 }} color="success" />

          {currentItem && (
            <div
              className={`garden-review-card ${reviewFlipped ? 'flipped' : ''}`}
              onClick={() => {
                if (!reviewFlipped) {
                  sounds.playFlip?.();
                  setReviewFlipped(true);
                }
              }}
            >
              <div className="garden-review-front">
                <div 
                  className="garden-review-stage-badge d-inline-flex align-items-center gap-1.5"
                  style={{ background: stage.bgColor, color: stage.color, border: `1.5px solid ${stage.borderColor}` }}
                >
                  <StageIcon size={14} />
                  <span>{stage.name} (Cấp {currentItem.level}/4)</span>
                </div>
                <div className="garden-review-jp">{currentItem.word}</div>
                {currentItem.reading && currentItem.reading !== currentItem.word && (
                  <div className="garden-review-reading">{currentItem.reading}</div>
                )}
                <div className="garden-review-hint">👆 Chạm vào chậu cây để xem nghĩa</div>
              </div>

              {reviewFlipped && (
                <div className="garden-review-back">
                  <div className="garden-review-meaning">{currentItem.meaning}</div>
                  <button
                    type="button"
                    className="garden-speak-btn"
                    onClick={(e) => { e.stopPropagation(); speakJapanese(currentItem.word || currentItem.reading); }}
                  >
                    <Volume2 size={16} /> Nghe phát âm Tokyo
                  </button>
                </div>
              )}
            </div>
          )}

          {reviewFlipped && !reviewAnswered && (
            <div className="garden-answer-btns mt-4">
              <button type="button" className="garden-wrong-btn" onClick={() => handleReviewAnswer(false)}>
                <XCircle size={18} /> Chưa nhớ (Cây lùi bậc)
              </button>
              <button type="button" className="garden-correct-btn" onClick={() => handleReviewAnswer(true)}>
                <CheckCircle2 size={18} /> Đã nhớ! (Cây lớn lên 🌱)
              </button>
            </div>
          )}

          {reviewAnswered && (
            <div className="garden-answered-feedback mt-3 text-center">
              {reviewResults[reviewResults.length - 1]?.correct ? (
                <span style={{ color: '#10b981', fontWeight: 800 }}>
                  💧 Cây đã hấp thụ dưỡng chất và sinh trưởng thêm một bậc!
                </span>
              ) : (
                <span style={{ color: '#ef4444', fontWeight: 800 }}>
                  ⚠️ Cây cần thêm thời gian củng cố — sẽ nhắc lại sớm hơn!
                </span>
              )}
            </div>
          )}
        </Container>
      </div>
    );
  }

  // ─── DONE SCREEN ───
  if (view === 'done') {
    const correct = reviewResults.filter(r => r.correct).length;
    const total = reviewResults.length;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    const mastered = reviewResults.filter(r => r.new_level === 4).length;

    return (
      <div className="garden-page">
        <Container className="py-5 text-center" style={{ maxWidth: 520 }}>
          <div className="mb-3">
            <div className="garden-done-big-pot d-inline-flex p-3 rounded-circle bg-success bg-opacity-10 text-success">
              <Flower2 size={56} />
            </div>
          </div>
          <h2 className="fw-black mb-1 text-dark">Tưới Nước Hoàn Tất!</h2>
          <p className="text-muted mb-4" style={{ fontSize: 14 }}>
            Khu vườn vừa được cung cấp đủ dưỡng chất. Các nếp nhăn từ vựng đã được khắc sâu bền vững!
          </p>

          <div className="garden-done-stats">
            <div className="garden-done-stat">
              <CheckCircle2 size={22} color="#10b981" />
              <div className="garden-done-val">{correct}/{total}</div>
              <div className="garden-done-key">Cây lớn thêm bậc</div>
            </div>
            <div className="garden-done-stat">
              <Sun size={22} color="#f59e0b" />
              <div className="garden-done-val">{accuracy}%</div>
              <div className="garden-done-key">Độ ghi nhớ sâu</div>
            </div>
            {mastered > 0 && (
              <div className="garden-done-stat">
                <Trophy size={22} color="#8b5cf6" />
                <div className="garden-done-val">{mastered}</div>
                <div className="garden-done-key">Quả vàng vĩnh viễn ⭐</div>
              </div>
            )}
          </div>

          <div className="d-flex flex-column gap-2.5 mt-4">
            <button type="button" className="garden-primary-btn" onClick={() => setView('garden')}>
              <Leaf size={18} /> Ngắm nhìn Vườn Cây
            </button>
            {stats.due_count > 0 && (
              <button type="button" className="garden-secondary-btn" onClick={() => startReview()}>
                <RefreshCw size={18} /> Tưới tiếp ({stats.due_count} cây đang đợi)
              </button>
            )}
          </div>
        </Container>
      </div>
    );
  }

  // ─── ADD SCREEN (MULTI-LESSON SUPPORT) ───
  if (view === 'add') {
    return (
      <div className="garden-page">
        <Container className="py-3 py-md-4" style={{ maxWidth: 640 }}>
          <button type="button" className="garden-back-btn mb-3" onClick={() => setView('garden')}>
            <ChevronLeft size={18} /> Vườn cây
          </button>

          <div className="d-flex align-items-center gap-2 mb-1">
            <Sprout size={24} className="text-success" />
            <h3 className="fw-black mb-0 text-dark">Gieo Mầm Tri Thức</h3>
            <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-2.5 py-1 small fw-bold">
              SRS Khoa Học
            </span>
          </div>
          <p className="text-muted mb-3.5" style={{ fontSize: 14 }}>
            Chọn một bài học hoặc nhiều bài cùng lúc để gieo hạt mầm từ vựng vào vườn.
          </p>

          <div className="garden-add-card mb-4">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <label className="wm-label mb-0">Chọn Các Bài Cần Gieo Mầm:</label>
              <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-2.5 py-1 small fw-bold">
                Đã chọn {selectedPlantLessons.size} bài
              </span>
            </div>

            {/* Quick Presets */}
            <div className="d-flex gap-1.5 flex-wrap mb-3">
              {[
                { label: 'Bài 1–5', list: [1, 2, 3, 4, 5] },
                { label: 'Bài 6–10', list: [6, 7, 8, 9, 10] },
                { label: 'Bài 11–15', list: [11, 12, 13, 14, 15] },
                { label: 'Tất cả 25 bài', list: Array.from({ length: 25 }, (_, i) => i + 1) }
              ].map(p => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setSelectedPlantLessons(new Set(p.list))}
                  className="btn btn-sm btn-outline-secondary rounded-pill px-2.5 py-0.5 small"
                  style={{ fontSize: '11px' }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* 25 Lesson Grid Buttons */}
            <div className="wm-lesson-grid mb-3">
              {Array.from({ length: 25 }, (_, i) => i + 1).map(num => {
                const isSelected = selectedPlantLessons.has(num);
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleTogglePlantLesson(num)}
                    className={`wm-lesson-btn ${isSelected ? 'active' : ''}`}
                  >
                    <span>{num}</span>
                    {isSelected && <span className="wm-lesson-check-dot">✓</span>}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className="garden-primary-btn w-100"
              onClick={handlePlantSelectedLessons}
              disabled={addLoading}
            >
              {addLoading ? <Spinner size="sm" /> : <Plus size={18} />}
              Gieo Toàn Bộ {selectedPlantLessons.size} Bài Đã Chọn Vào Vườn 🌱
            </button>

            {addResult && (
              <div className={`garden-add-result mt-3 ${addResult.success ? 'success' : 'error'}`}>
                {addResult.success
                  ? `✅ Thành công! Đã gieo ${addResult.added} mầm cây mới vào vườn (Tổng số từ trong bài: ${addResult.total})`
                  : '❌ Có lỗi xảy ra, vui lòng thử lại'}
              </div>
            )}
          </div>

          <div className="garden-add-info">
            <ShieldCheck size={18} className="flex-shrink-0 text-primary" />
            <span>
              Lộ trình tưới nước khoa học: <strong>Sau 1 ngày</strong> (Cấp 1 🌱) ➔ <strong>Sau 3 ngày</strong> (Cấp 2 🌿) ➔ <strong>Sau 7 ngày</strong> (Cấp 3 🌸) ➔ <strong>Sau 30 ngày</strong> (Cấp 4 ⭐ Thuộc vĩnh viễn).
            </span>
          </div>
        </Container>
      </div>
    );
  }

  // ─── DAILY QUESTS SCREEN ───
  if (view === 'quests') {
    return (
      <div className="garden-page">
        <Container className="py-3 py-md-4" style={{ maxWidth: 640 }}>
          <button type="button" className="garden-back-btn mb-3" onClick={() => setView('garden')}>
            <ChevronLeft size={18} /> Vườn cây
          </button>

          <div className="d-flex align-items-center justify-content-between mb-3.5">
            <div>
              <div className="d-flex align-items-center gap-2">
                <Award size={24} className="text-warning" />
                <h3 className="fw-black mb-0 text-dark">Nhiệm Vụ Nuôi Cây</h3>
              </div>
              <p className="text-muted small mb-0">Hoàn thành mỗi ngày để tích lũy Giọt Sương Thần 💧</p>
            </div>
            <div className="d-flex align-items-center gap-1.5 px-3 py-1.5 rounded-pill shadow-xs" style={{ background: '#eff6ff', border: '1.5px solid #bfdbfe' }}>
              <Droplets size={16} className="text-primary" />
              <span className="fw-black text-primary fs-6">{dailyQuests.dewDrops} Giọt</span>
            </div>
          </div>

          <div className="d-flex flex-column gap-3 mb-4">
            {/* Quest 1: Watering */}
            <div className="garden-quest-card p-3 rounded-4 border bg-white">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="d-flex align-items-center gap-2.5">
                  <div className="garden-quest-icon rounded-3 p-2 text-info" style={{ background: '#f0f9ff' }}>
                    <Droplets size={20} />
                  </div>
                  <div>
                    <div className="fw-bold text-dark" style={{ fontSize: '14px' }}>Tưới Nước Buổi Sáng</div>
                    <div className="text-muted small">Tưới ít nhất 3 cây đến hạn trong ngày</div>
                  </div>
                </div>
                <span className="badge bg-light text-secondary rounded-pill px-2.5 py-1 small">
                  {Math.min(dailyQuests.wateredCount, 3)} / 3 cây
                </span>
              </div>
              <Progress value={(Math.min(dailyQuests.wateredCount, 3) / 3) * 100} style={{ height: 6, borderRadius: 999 }} color="info" className="mb-2" />
              <div className="d-flex justify-content-between align-items-center pt-1">
                <small className="text-muted fw-semibold" style={{ fontSize: '11px' }}>Phần thưởng: +30 Giọt Sương Thần</small>
                {dailyQuests.wateredClaimed ? (
                  <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-2.5 py-1 fw-bold">✓ Đã nhận</span>
                ) : dailyQuests.wateredCount >= 3 ? (
                  <button type="button" className="btn btn-sm btn-success rounded-pill px-3 py-1 fw-bold shadow-xs" onClick={() => claimQuestReward('water', 30)}>
                    <Gift size={13} className="me-1" /> Nhận thưởng
                  </button>
                ) : (
                  <button type="button" className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 fw-bold" onClick={() => startReview()}>
                    Tưới ngay
                  </button>
                )}
              </div>
            </div>

            {/* Quest 2: Perfect Session */}
            <div className="garden-quest-card p-3 rounded-4 border bg-white">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="d-flex align-items-center gap-2.5">
                  <div className="garden-quest-icon rounded-3 p-2 text-warning" style={{ background: '#fffbeb' }}>
                    <Sun size={20} />
                  </div>
                  <div>
                    <div className="fw-bold text-dark" style={{ fontSize: '14px' }}>Tắm Nắng Trí Tuệ</div>
                    <div className="text-muted small">Đạt độ chính xác 100% trong 1 phiên tưới cây</div>
                  </div>
                </div>
                <span className="badge bg-light text-secondary rounded-pill px-2.5 py-1 small">
                  {dailyQuests.perfectSession ? '1 / 1' : '0 / 1'}
                </span>
              </div>
              <Progress value={dailyQuests.perfectSession ? 100 : 0} style={{ height: 6, borderRadius: 999 }} color="warning" className="mb-2" />
              <div className="d-flex justify-content-between align-items-center pt-1">
                <small className="text-muted fw-semibold" style={{ fontSize: '11px' }}>Phần thưởng: +50 Giọt Sương Thần</small>
                {dailyQuests.perfectClaimed ? (
                  <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-2.5 py-1 fw-bold">✓ Đã nhận</span>
                ) : dailyQuests.perfectSession ? (
                  <button type="button" className="btn btn-sm btn-warning text-dark rounded-pill px-3 py-1 fw-bold shadow-xs" onClick={() => claimQuestReward('perfect', 50)}>
                    <Gift size={13} className="me-1" /> Nhận thưởng
                  </button>
                ) : (
                  <button type="button" className="btn btn-sm btn-outline-warning text-dark rounded-pill px-3 py-1 fw-bold" onClick={() => startReview()}>
                    Làm bài ngay
                  </button>
                )}
              </div>
            </div>

            {/* Quest 3: Seed Planting */}
            <div className="garden-quest-card p-3 rounded-4 border bg-white">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="d-flex align-items-center gap-2.5">
                  <div className="garden-quest-icon rounded-3 p-2 text-success" style={{ background: '#ecfdf5' }}>
                    <Sprout size={20} />
                  </div>
                  <div>
                    <div className="fw-bold text-dark" style={{ fontSize: '14px' }}>Gieo Mầm Tri Thức</div>
                    <div className="text-muted small">Gieo hạt ít nhất 1 bài từ vựng Minna vào vườn</div>
                  </div>
                </div>
                <span className="badge bg-light text-secondary rounded-pill px-2.5 py-1 small">
                  {dailyQuests.plantedToday ? '1 / 1' : '0 / 1'}
                </span>
              </div>
              <Progress value={dailyQuests.plantedToday ? 100 : 0} style={{ height: 6, borderRadius: 999 }} color="success" className="mb-2" />
              <div className="d-flex justify-content-between align-items-center pt-1">
                <small className="text-muted fw-semibold" style={{ fontSize: '11px' }}>Phần thưởng: +40 Giọt Sương Thần</small>
                {dailyQuests.plantedClaimed ? (
                  <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-2.5 py-1 fw-bold">✓ Đã nhận</span>
                ) : dailyQuests.plantedToday ? (
                  <button type="button" className="btn btn-sm btn-success rounded-pill px-3 py-1 fw-bold shadow-xs" onClick={() => claimQuestReward('plant', 40)}>
                    <Gift size={13} className="me-1" /> Nhận thưởng
                  </button>
                ) : (
                  <button type="button" className="btn btn-sm btn-outline-success rounded-pill px-3 py-1 fw-bold" onClick={() => setView('add')}>
                    Gieo mầm
                  </button>
                )}
              </div>
            </div>

            {/* Quest 4: Word Match Rush */}
            <div className="garden-quest-card p-3 rounded-4 border bg-white">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="d-flex align-items-center gap-2.5">
                  <div className="garden-quest-icon rounded-3 p-2 text-warning" style={{ background: '#fffbeb' }}>
                    <Zap size={20} />
                  </div>
                  <div>
                    <div className="fw-bold text-dark" style={{ fontSize: '14px' }}>Phản Xạ Nối Từ 60 Giây</div>
                    <div className="text-muted small">Chơi 1 ván Nối Từ Siêu Tốc để bồi dưỡng phản xạ</div>
                  </div>
                </div>
                <span className="badge bg-light text-secondary rounded-pill px-2.5 py-1 small">
                  0 / 1
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center pt-1">
                <small className="text-muted fw-semibold" style={{ fontSize: '11px' }}>Phần thưởng: +35 Giọt Sương Thần</small>
                <button type="button" className="btn btn-sm btn-warning text-dark rounded-pill px-3 py-1 fw-bold" onClick={() => onNavigate?.('wordmatch')}>
                  Chơi ngay ⚡
                </button>
              </div>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  // ─── MAIN GARDEN OVERVIEW ───
  const dueCount = stats.due_count || 0;
  const totalInGarden = stats.total || 0;

  return (
    <div className="garden-page">
      {/* Watering Rain Overlay Animation */}
      {isWateringRain && (
        <div className="garden-rain-overlay">
          <div className="garden-rain-droplets">
            {Array.from({ length: 20 }).map((_, i) => (
              <span key={i} className="rain-drop" style={{ left: `${(i * 5) + 2}%`, animationDelay: `${(i % 5) * 0.12}s` }}>
                💧
              </span>
            ))}
          </div>
        </div>
      )}

      <Container className="py-2.5 py-md-3" style={{ maxWidth: 980 }}>
        {/* Back to Home Button */}
        <button
          type="button"
          onClick={() => onNavigate?.('home')}
          className="garden-back-btn mb-2.5"
        >
          <ChevronLeft size={18} /> Trang chủ
        </button>

        {/* Guest Banner if not logged in */}
        {!user && (
          <div className="garden-guest-banner mb-3 d-flex align-items-center justify-content-between p-2.5 px-3 rounded-3">
            <div className="d-flex align-items-center gap-2">
              <AlertCircle size={16} className="text-warning flex-shrink-0" />
              <span className="small text-secondary">
                Bạn đang dùng <strong>Vườn cây cục bộ</strong>. Đăng nhập để đồng bộ tiến độ an toàn trên cloud.
              </span>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary rounded-pill px-2.5 py-1 small fw-semibold flex-shrink-0"
              onClick={() => onNavigate?.('home')}
            >
              Đăng nhập
            </button>
          </div>
        )}

        {/* ── Gardener Profile & Rank Card ── */}
        <div className="garden-profile-card p-3 p-md-3.5 rounded-4 mb-3 d-flex align-items-center justify-content-between flex-wrap gap-2.5">
          <div className="d-flex align-items-center gap-3">
            <div className="garden-avatar-pot">
              <TreePine size={24} className="text-white" />
            </div>
            <div>
              <div className="d-flex align-items-center gap-2">
                <h5 className="fw-black mb-0 text-dark">{gardenerRank.title}</h5>
                <span className="badge rounded-pill text-white px-2 py-0.5" style={{ background: gardenerRank.color, fontSize: '10px' }}>
                  {gardenerRank.badge}
                </span>
              </div>
              <small className="text-muted">
                Quy mô: <strong>{totalInGarden} cây</strong> trồng trong vườn • <strong>{stats.level4 || 0} quả vàng</strong> vĩnh viễn ⭐
              </small>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1.5 small fw-bold d-flex align-items-center gap-1.5"
              onClick={() => setView('quests')}
            >
              <Award size={15} className="text-warning" />
              <span>Nhiệm vụ nuôi cây</span>
            </button>
            <button
              type="button"
              className="garden-add-btn py-1.5"
              onClick={() => setView('add')}
            >
              <Plus size={15} /> Gieo mầm
            </button>
          </div>
        </div>

        {/* ── Main Garden Actions Header ── */}
        <div className="garden-header mb-3">
          <div>
            <div className="d-flex align-items-center gap-2">
              <h2 className="garden-title mb-0">Vườn Cây Trí Nhớ</h2>
              <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-2.5 py-1 d-inline-flex align-items-center gap-1" style={{ fontSize: '11px', fontWeight: 800 }}>
                <ShieldCheck size={12} /> Chuẩn SRS Khoa Học
              </span>
            </div>
            <p className="garden-desc mt-1 mb-0">
              Mỗi từ vựng là một mầm cây sinh trưởng qua 4 giai đoạn. Tưới nước đúng hạn để cây đơm quả vàng vĩnh viễn!
            </p>
          </div>

          <div className="garden-header-actions">
            {dueCount > 0 ? (
              <button 
                type="button" 
                className="garden-water-btn" 
                onClick={() => startReview()}
              >
                <span className="garden-water-badge">{dueCount}</span>
                <Droplets size={16} />
                <span>Tưới nước ngay ({dueCount} cây)</span>
              </button>
            ) : (
              <div className="garden-all-hydrated-pill">
                <Sparkles size={14} className="text-success" />
                <span>Vườn no đủ nước hôm nay</span>
              </div>
            )}
          </div>
        </div>

        {/* ── 4 Botanical Stages Cards ── */}
        <div className="garden-stats-bar">
          {Object.values(STAGES).map(st => {
            const IconComp = st.icon;
            const isActive = filterLevel === String(st.level);
            return (
              <div 
                key={st.level} 
                className={`garden-stat-pill cursor-pointer ${isActive ? 'is-active' : ''}`} 
                style={{ borderColor: st.borderColor, background: st.bgColor }}
                onClick={() => setFilterLevel(String(st.level))}
              >
                <div className="garden-stage-icon-box" style={{ color: st.color }}>
                  <IconComp size={20} />
                </div>
                <div className="d-flex flex-column min-w-0">
                  <span style={{ color: st.color, fontWeight: 900, fontSize: '15px', lineHeight: 1.1 }}>
                    {stats[`level${st.level}`] || 0}
                  </span>
                  <span className="text-truncate fw-semibold" style={{ color: '#475569', fontSize: '11px' }}>{st.badgeText}</span>
                </div>
              </div>
            );
          })}

          {(stats.overdue_count || 0) > 0 && (
            <div 
              className={`garden-stat-pill cursor-pointer ${filterLevel === 'overdue' ? 'is-active' : ''}`}
              style={{ borderColor: '#fecaca', background: '#fef2f2' }}
              onClick={() => setFilterLevel('overdue')}
            >
              <div className="garden-stage-icon-box text-danger">
                <AlertCircle size={20} />
              </div>
              <div className="d-flex flex-column min-w-0">
                <span style={{ color: '#ef4444', fontWeight: 900, fontSize: '15px', lineHeight: 1.1 }}>
                  {stats.overdue_count}
                </span>
                <span style={{ color: '#ef4444', fontSize: '11px', fontWeight: 700 }}>Héo úa 🥀</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Filter Tabs ── */}
        <div className="garden-filter-tabs">
          {[
            { key: 'all', label: 'Tất cả cây', icon: Leaf, count: totalInGarden },
            { key: 'due', label: 'Cần tưới', icon: Droplets, count: dueCount },
            { key: 'overdue', label: 'Héo úa', icon: AlertCircle, count: stats.overdue_count || 0 },
            { key: '1', label: 'Cấp 1: Mầm non', icon: Leaf, count: stats.level1 || 0 },
            { key: '2', label: 'Cấp 2: Lá xanh', icon: TreePine, count: stats.level2 || 0 },
            { key: '3', label: 'Cấp 3: Nở hoa', icon: Flower2, count: stats.level3 || 0 },
            { key: '4', label: 'Cấp 4: Quả vàng', icon: Star, count: stats.level4 || 0 }
          ].map(tab => {
            const TabIcon = tab.icon;
            const isActive = filterLevel === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilterLevel(tab.key)}
                className={`garden-filter-tab ${isActive ? 'active' : ''}`}
              >
                <TabIcon size={13} />
                <span>{tab.label}</span>
                {tab.count > 0 && <span className="garden-tab-count">{tab.count}</span>}
              </button>
            );
          })}
        </div>

        {/* ── Plant Grid Display ── */}
        {loading ? (
          <div className="d-flex flex-column align-items-center justify-content-center py-5">
            <Spinner color="success" />
            <span className="small text-muted mt-2">Đang chăm sóc khu vườn...</span>
          </div>
        ) : totalInGarden === 0 ? (
          <div className="garden-empty">
            <div className="garden-empty-icon text-success">
              <Sprout size={56} />
            </div>
            <h5 className="fw-black mb-2 text-dark">Khu vườn đang chờ bạn gieo hạt</h5>
            <p className="text-muted mb-4" style={{ fontSize: 14, maxWidth: 440, margin: '0 auto' }}>
              Hãy gieo những hạt mầm từ vựng đầu tiên. Mỗi ngày chỉ cần 3 phút tưới nước, từ vựng sẽ ăn sâu vào tiềm thức vĩnh viễn!
            </p>
            <button type="button" className="garden-primary-btn" onClick={() => setView('add')}>
              <Plus size={18} /> Gieo mầm từ vựng đầu tiên 🌱
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="garden-empty py-4">
            <div className="garden-empty-icon" style={{ fontSize: 36 }}>🔍</div>
            <p className="text-muted small">Không tìm thấy cây nào trong danh mục lọc này.</p>
          </div>
        ) : (
          <div className="garden-grid">
            {filteredItems.map(item => {
              const stage = getStageInfo(item);
              const StageIcon = stage.icon;
              const isReadyToWater = item.is_due || item.is_overdue;

              return (
                <div
                  key={item.id}
                  className={`garden-plant-card cursor-pointer ${isReadyToWater ? 'ready-to-water' : ''}`}
                  style={{ borderColor: stage.borderColor, background: stage.bgColor }}
                  onClick={() => setSelectedPlant(item)}
                >
                  {/* Top Bar: Botanical Stage Icon & Status Badge */}
                  <div className="d-flex align-items-center justify-content-between mb-1.5">
                    <div 
                      className="garden-plant-botanical-avatar rounded-circle d-flex align-items-center justify-content-center shadow-xs"
                      style={{ width: '32px', height: '32px', background: '#ffffff', color: stage.color, border: `1.5px solid ${stage.borderColor}` }}
                    >
                      <StageIcon size={17} />
                    </div>

                    <div className="d-flex align-items-center gap-1">
                      {item.is_overdue && (
                        <span className="badge bg-danger text-white rounded-pill pulse-badge d-inline-flex align-items-center gap-1" style={{ fontSize: '9px', padding: '2.5px 6px' }}>
                          <AlertCircle size={9} /> Héo!
                        </span>
                      )}
                      {item.is_due && !item.is_overdue && (
                        <span className="badge bg-info text-white rounded-pill pulse-badge d-inline-flex align-items-center gap-1" style={{ fontSize: '9px', padding: '2.5px 6px' }}>
                          <Droplets size={9} /> Cần tưới
                        </span>
                      )}
                      <button
                        type="button"
                        className="garden-speak-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          speakJapanese(item.word || item.reading);
                        }}
                        title="Nghe phát âm Tokyo"
                      >
                        <Volume2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Japanese Word */}
                  <div className="garden-plant-word">{item.word}</div>
                  {item.reading && item.reading !== item.word && (
                    <div className="garden-plant-reading">{item.reading}</div>
                  )}

                  {/* Vietnamese Meaning */}
                  <div className="garden-plant-meaning">{item.meaning}</div>

                  {/* Biological Moisture & Growth Progress */}
                  <div className="mt-2 pt-1 border-top border-black border-opacity-10">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="small fw-bold" style={{ fontSize: '10px', color: stage.color }}>
                        {stage.badgeText}
                      </span>
                      <span className="text-muted" style={{ fontSize: '9.5px' }}>
                        {item.level === 4 ? '100% Vĩnh viễn' : `Cấp ${item.level}/4`}
                      </span>
                    </div>
                    <Progress 
                      value={stage.pct} 
                      style={{ height: 4, borderRadius: 999 }} 
                      color={item.level === 4 ? 'warning' : 'success'} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* All Hydrated Status */}
        {totalInGarden > 0 && dueCount === 0 && !loading && (
          <div className="garden-all-good mt-3.5">
            <Sparkles size={18} className="text-success" />
            <span>Khu vườn đang rất xanh tươi và khỏe mạnh! Tất cả cây cối đã được chăm sóc đầy đủ hôm nay.</span>
          </div>
        )}
      </Container>

      {/* ── Plant Detail Profile Modal ── */}
      <Modal
        isOpen={Boolean(selectedPlant)}
        toggle={() => setSelectedPlant(null)}
        centered
        className="jlpt-modal"
        style={{ maxWidth: '440px' }}
      >
        {selectedPlant && (() => {
          const stage = getStageInfo(selectedPlant);
          const StageIcon = stage.icon;

          return (
            <ModalBody className="p-4 rounded-4 bg-white border-0 text-center">
              <div className="mb-2 d-flex justify-content-center">
                <div 
                  className="rounded-circle p-3 d-inline-flex align-items-center justify-content-center shadow-sm"
                  style={{ width: '72px', height: '72px', background: stage.bgColor, color: stage.color, border: `2px solid ${stage.borderColor}` }}
                >
                  <StageIcon size={36} />
                </div>
              </div>

              <div 
                className="d-inline-flex align-items-center gap-1.5 px-3 py-1 rounded-pill small fw-bold mb-2"
                style={{ background: stage.bgColor, color: stage.color, border: `1px solid ${stage.borderColor}` }}
              >
                <StageIcon size={13} />
                <span>{stage.name} (Giai đoạn {selectedPlant.level}/4)</span>
              </div>

              <h2 className="fw-black mb-1 text-dark" style={{ fontFamily: 'Noto Sans JP, sans-serif' }}>
                {selectedPlant.word}
              </h2>

              {selectedPlant.reading && (
                <div className="text-muted mb-2 fs-6">
                  {selectedPlant.reading}
                </div>
              )}

              <div className="p-3 rounded-3 bg-light border mb-3">
                <div className="fw-bold text-primary fs-5">{selectedPlant.meaning}</div>
                <small className="text-muted">Minna no Nihongo Bài {selectedPlant.lesson_number || 1}</small>
              </div>

              <div className="d-flex justify-content-center gap-2 mb-3">
                <button
                  type="button"
                  className="btn btn-outline-primary rounded-pill px-3 py-1.5 small fw-bold d-flex align-items-center gap-1.5"
                  onClick={() => speakJapanese(selectedPlant.word || selectedPlant.reading)}
                >
                  <Volume2 size={16} /> Nghe phát âm Tokyo
                </button>
              </div>

              {/* Biological Vituals Box */}
              <div className="text-start small text-secondary p-2.5 rounded-3 border bg-white mb-3 d-flex flex-column gap-1.5">
                <div className="d-flex align-items-center justify-content-between">
                  <span>• Trạng thái sức sống:</span>
                  <strong className={selectedPlant.is_overdue ? 'text-danger' : selectedPlant.is_due ? 'text-info' : 'text-success'}>
                    {stage.hydrationText}
                  </strong>
                </div>
                <div className="d-flex align-items-center justify-content-between">
                  <span>• Cột mốc tiếp theo:</span>
                  <strong className="text-dark">{stage.nextText}</strong>
                </div>
                <div className="d-flex align-items-center justify-content-between">
                  <span>• Số lần ôn đúng:</span>
                  <strong className="text-dark">{selectedPlant.correct_count || 1} lần</strong>
                </div>
              </div>

              <div className="d-flex flex-column gap-2">
                {(selectedPlant.is_due || selectedPlant.is_overdue) ? (
                  <button
                    type="button"
                    className="garden-primary-btn"
                    onClick={() => startReview(selectedPlant)}
                  >
                    <Droplets size={16} /> Tưới Nước Riêng Cho Cây Này
                  </button>
                ) : (
                  <button
                    type="button"
                    className="garden-secondary-btn"
                    onClick={() => startReview(selectedPlant)}
                  >
                    <RefreshCw size={15} /> Tưới Nước Ôn Lại Ngay
                  </button>
                )}

                {selectedPlant.is_overdue && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-warning rounded-pill py-2 fw-bold text-dark d-flex align-items-center justify-content-center gap-1.5"
                    onClick={() => handleInstantRevive(selectedPlant)}
                  >
                    <Sparkles size={14} className="text-warning" />
                    <span>Dùng 40 Giọt Sương Hồi Sinh Ngay</span>
                  </button>
                )}

                <button
                  type="button"
                  className="btn btn-link text-decoration-none text-secondary small py-1"
                  onClick={() => setSelectedPlant(null)}
                >
                  Đóng
                </button>
              </div>
            </ModalBody>
          );
        })()}
      </Modal>
    </div>
  );
};

export default GardenPage;
