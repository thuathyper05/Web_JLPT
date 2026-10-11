import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Container, Spinner, Progress, Modal, ModalBody, ModalHeader } from 'reactstrap';
import { 
  Leaf, Star, RefreshCw, Plus, ChevronLeft, CheckCircle, 
  XCircle, Volume2, BookOpen, Sparkles, Info, X, 
  ChevronRight, Trophy, Flower2, TreePine, LogIn, AlertCircle,
  Droplets, Sun, Award, CheckCheck, Compass, HelpCircle, Heart
} from 'lucide-react';
import { srsService, vocabService, lessonService, speakJapanese } from '../services/api';
import { sounds } from '../services/sounds';
import { useApp } from '../context/AppContext';
import confetti from 'canvas-confetti';

// Realistic SRS Growth Stages Configuration
const LEVELS = [
  { 
    level: 1, 
    stageName: 'Mầm Mới Nhú', 
    emoji: '🌱', 
    potEmoji: '🪴',
    pct: 25,
    color: '#10b981', 
    bg: '#ecfdf5', 
    border: '#a7f3d0', 
    desc: 'Hạt mầm vừa gieo xuống đất (Ôn sau 1 ngày)',
    intervalDays: 1
  },
  { 
    level: 2, 
    stageName: 'Nhánh Lá Non', 
    emoji: '🌿', 
    potEmoji: '🪴',
    pct: 50,
    color: '#059669', 
    bg: '#d1fae5', 
    border: '#6ee7b7', 
    desc: 'Cây đã ra nhánh lá xanh tốt (Ôn sau 3 ngày)',
    intervalDays: 3
  },
  { 
    level: 3, 
    stageName: 'Cây Nở Hoa Thơm', 
    emoji: '🌸', 
    potEmoji: '🪴',
    pct: 75,
    color: '#ec4899', 
    bg: '#fdf2f8', 
    border: '#f9a8d4', 
    desc: 'Hoa anh đào nở rộ rực rỡ (Ôn sau 7 ngày)',
    intervalDays: 7
  },
  { 
    level: 4, 
    stageName: 'Đơm Quả Vàng', 
    emoji: '⭐', 
    potEmoji: '🌳',
    pct: 100,
    color: '#f59e0b', 
    bg: '#fffbeb', 
    border: '#fde68a', 
    desc: 'Cây trưởng thành trĩu quả — Đã thuộc vĩnh viễn!',
    intervalDays: 30
  },
];

const OVERDUE_CONFIG = { 
  stageName: 'Cần Tưới Nước', 
  emoji: '🥀', 
  potEmoji: '🥀',
  color: '#ef4444', 
  bg: '#fef2f2', 
  border: '#fecaca',
  desc: 'Cây đang bị khát nước, hãy tưới ngay để hồi sinh!'
};

const getLevelConfig = (item) => {
  if (item.is_overdue) return OVERDUE_CONFIG;
  return LEVELS.find(l => l.level === item.level) || LEVELS[0];
};

const GUEST_STORAGE_KEY = 'hyper_guest_garden_srs';
const GUEST_QUEST_KEY = 'hyper_garden_quests_date';

const GardenPage = ({ onNavigate }) => {
  const { user } = useApp();
  const [view, setView] = useState('garden'); // 'garden' | 'add' | 'review' | 'done' | 'quests'
  const [loading, setLoading] = useState(true);
  const [gardenItems, setGardenItems] = useState([]);
  const [stats, setStats] = useState({});
  const [filterLevel, setFilterLevel] = useState('all');
  const [lessons, setLessons] = useState([]);
  const [addLesson, setAddLesson] = useState(1);
  const [addLoading, setAddLoading] = useState(false);
  const [addResult, setAddResult] = useState(null);

  // Selected plant inspection modal
  const [selectedPlant, setSelectedPlant] = useState(null);

  // Watering animation state
  const [isWateringRain, setIsWateringRain] = useState(false);

  // Review session state
  const [dueItems, setDueItems] = useState([]);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [reviewFlipped, setReviewFlipped] = useState(false);
  const [reviewAnswered, setReviewAnswered] = useState(false);
  const [reviewResults, setReviewResults] = useState([]);
  const [reviewDone, setReviewDone] = useState(false);

  // Daily Quests State
  const [dailyQuests, setDailyQuests] = useState(() => {
    const today = new Date().toISOString().slice(0, 10);
    const saved = localStorage.getItem(`hyper_quests_${today}`);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      wateredToday: false,
      addedToday: false,
      perfectSession: false,
      dewDrops: 120
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

  // Trigger Watering Session
  const startReview = async (specificPlant = null) => {
    try {
      // Trigger watering animation sound & rain effect
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

          // Update quests
          const allCorrect = [...reviewResults, { correct }].every(r => r.correct);
          saveQuests({
            ...dailyQuests,
            wateredToday: true,
            perfectSession: allCorrect || dailyQuests.perfectSession,
            dewDrops: dailyQuests.dewDrops + (allCorrect ? 50 : 25)
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

  const handleAddLesson = async () => {
    setAddLoading(true);
    setAddResult(null);
    try {
      if (user) {
        const res = await srsService.addLessonToGarden(addLesson);
        setAddResult({ success: true, added: res.data.added, total: res.data.total });
      } else {
        const vocabRes = await vocabService.getVocabularies({ lesson: addLesson });
        const vocabs = Array.isArray(vocabRes.data) ? vocabRes.data : (vocabRes.data?.data || []);
        const currentGuest = getGuestItems();
        const existingIds = new Set(currentGuest.map(g => g.vocab_id || g.id));
        let addedCount = 0;
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
              lesson_number: v.lesson_number || addLesson
            });
            addedCount++;
          }
        });
        saveGuestItems(currentGuest);
        setAddResult({ success: true, added: addedCount, total: vocabs.length });
      }
      loadGarden();
      saveQuests({ ...dailyQuests, addedToday: true, dewDrops: dailyQuests.dewDrops + 30 });
    } catch (err) {
      console.error('[Garden] add lesson error:', err);
      setAddResult({ success: false });
    } finally {
      setAddLoading(false);
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
    const levelCfg = LEVELS.find(l => l.level === currentItem?.level) || LEVELS[0];
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
            <div className="d-flex align-items-center gap-2">
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
                <div className="garden-review-stage-badge" style={{ background: levelCfg.bg, color: levelCfg.color, border: `1.5px solid ${levelCfg.border}` }}>
                  {levelCfg.potEmoji} {levelCfg.emoji} {levelCfg.stageName} (Cấp {levelCfg.level}/4)
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
                    <Volume2 size={16} /> Nghe phát âm chuẩn Tokyo
                  </button>
                </div>
              )}
            </div>
          )}

          {reviewFlipped && !reviewAnswered && (
            <div className="garden-answer-btns mt-4">
              <button type="button" className="garden-wrong-btn" onClick={() => handleReviewAnswer(false)}>
                <XCircle size={20} /> Chưa nhớ (Cây lùi 1 bậc)
              </button>
              <button type="button" className="garden-correct-btn" onClick={() => handleReviewAnswer(true)}>
                <CheckCircle size={20} /> Đã nhớ! (Tưới nước vươn cao 🌱)
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
        <Container className="py-5 text-center" style={{ maxWidth: 500 }}>
          <div style={{ fontSize: 68, marginBottom: 12 }}>🌸✨</div>
          <h2 className="fw-black mb-1" style={{ color: '#0f172a' }}>Tưới Nước Hoàn Tất!</h2>
          <p className="text-muted mb-4" style={{ fontSize: 14 }}>
            Khu vườn vừa được cung cấp đủ dưỡng chất. Các nếp nhăn ghi nhớ trong não bộ đã được củng cố bền vững.
          </p>

          <div className="garden-done-stats">
            <div className="garden-done-stat">
              <CheckCircle size={22} color="#10b981" />
              <div className="garden-done-val">{correct}/{total}</div>
              <div className="garden-done-key">Cây hồi sinh & vươn lớn</div>
            </div>
            <div className="garden-done-stat">
              <Star size={22} color="#f59e0b" />
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

  // ─── ADD SCREEN ───
  if (view === 'add') {
    return (
      <div className="garden-page">
        <Container className="py-3 py-md-4" style={{ maxWidth: 600 }}>
          <button type="button" className="garden-back-btn mb-3" onClick={() => setView('garden')}>
            <ChevronLeft size={18} /> Vườn cây
          </button>

          <div className="d-flex align-items-center gap-2 mb-1">
            <h3 className="fw-bold mb-0 text-dark">🌱 Gieo Hạt Mầm Từ Vựng</h3>
            <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-2.5 py-1 small">
              Khởi đầu SRS
            </span>
          </div>
          <p className="text-muted mb-4" style={{ fontSize: 14 }}>
            Chọn bài học Minna no Nihongo để gieo tất cả hạt mầm vào đất. Chúng sẽ tự động nhắc nhở bạn khi đến hạn tưới!
          </p>

          <div className="garden-add-card mb-4">
            <label className="wm-label mb-2">Chọn bài học cần gieo mầm:</label>
            <div className="wm-lesson-grid mb-3">
              {Array.from({ length: 25 }, (_, i) => i + 1).map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setAddLesson(num)}
                  className={`wm-lesson-btn ${addLesson === num ? 'active' : ''}`}
                >
                  {num}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="garden-primary-btn w-100"
              onClick={handleAddLesson}
              disabled={addLoading}
            >
              {addLoading ? <Spinner size="sm" /> : <Plus size={18} />}
              Gieo Toàn Bộ Từ Vựng Bài {addLesson} Vào Vườn 🌱
            </button>

            {addResult && (
              <div className={`garden-add-result mt-3 ${addResult.success ? 'success' : 'error'}`}>
                {addResult.success
                  ? `✅ Thành công! Đã gieo ${addResult.added} mầm cây mới vào vườn (tổng ${addResult.total} từ)`
                  : '❌ Có lỗi xảy ra, vui lòng thử lại'}
              </div>
            )}
          </div>

          <div className="garden-add-info">
            <Info size={16} className="flex-shrink-0" />
            <span>
              Lộ trình sinh trưởng khoa học: <strong>1 ngày</strong> (Cấp 1 🌱) ➔ <strong>3 ngày</strong> (Cấp 2 🌿) ➔ <strong>7 ngày</strong> (Cấp 3 🌸) ➔ <strong>30 ngày</strong> (Cấp 4 ⭐ Đơm quả vàng thuộc vĩnh viễn).
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
        <Container className="py-3 py-md-4" style={{ maxWidth: 620 }}>
          <button type="button" className="garden-back-btn mb-3" onClick={() => setView('garden')}>
            <ChevronLeft size={18} /> Vườn cây
          </button>

          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <h3 className="fw-black mb-0 text-dark">📜 Nhiệm Vụ Nuôi Cây</h3>
              <p className="text-muted small mb-0">Hoàn thành mỗi ngày để tích lũy Giọt Sương Thần 💧</p>
            </div>
            <div className="d-flex align-items-center gap-1.5 px-3 py-1.5 rounded-pill" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
              <Droplets size={16} className="text-primary" />
              <span className="fw-bold text-primary">{dailyQuests.dewDrops} Giọt</span>
            </div>
          </div>

          <div className="d-flex flex-column gap-2.5 mb-4">
            {/* Quest 1 */}
            <div className="garden-quest-card p-3 rounded-4 border bg-white d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-3">
                <div className="garden-quest-icon rounded-3 p-2 text-info" style={{ background: '#f0f9ff' }}>
                  <Droplets size={22} />
                </div>
                <div>
                  <div className="fw-bold text-dark" style={{ fontSize: '14px' }}>Tưới Nước Đúng Hạn</div>
                  <div className="text-muted small">Hoàn thành ít nhất 1 phiên tưới cây hôm nay</div>
                </div>
              </div>
              <div>
                {dailyQuests.wateredToday ? (
                  <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-1.5 fw-bold">
                    ✓ Đã xong (+25💧)
                  </span>
                ) : (
                  <button 
                    type="button" 
                    className="btn btn-sm btn-primary rounded-pill px-3 py-1 fw-bold"
                    onClick={() => startReview()}
                  >
                    Tưới ngay
                  </button>
                )}
              </div>
            </div>

            {/* Quest 2 */}
            <div className="garden-quest-card p-3 rounded-4 border bg-white d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-3">
                <div className="garden-quest-icon rounded-3 p-2 text-warning" style={{ background: '#fffbeb' }}>
                  <Sun size={22} />
                </div>
                <div>
                  <div className="fw-bold text-dark" style={{ fontSize: '14px' }}>Tắm Nắng Toàn Diện</div>
                  <div className="text-muted small">Đạt độ chính xác 100% trong bài tưới cây</div>
                </div>
              </div>
              <div>
                {dailyQuests.perfectSession ? (
                  <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-1.5 fw-bold">
                    ✓ Hoàn hảo (+50💧)
                  </span>
                ) : (
                  <span className="badge bg-light text-secondary rounded-pill px-2.5 py-1 small">
                    Chưa đạt
                  </span>
                )}
              </div>
            </div>

            {/* Quest 3 */}
            <div className="garden-quest-card p-3 rounded-4 border bg-white d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-3">
                <div className="garden-quest-icon rounded-3 p-2 text-success" style={{ background: '#ecfdf5' }}>
                  <Leaf size={22} />
                </div>
                <div>
                  <div className="fw-bold text-dark" style={{ fontSize: '14px' }}>Gieo Hạt Mầm Mới</div>
                  <div className="text-muted small">Trồng thêm 1 bài từ vựng Minna vào vườn</div>
                </div>
              </div>
              <div>
                {dailyQuests.addedToday ? (
                  <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-1.5 fw-bold">
                    ✓ Đã gieo (+30💧)
                  </span>
                ) : (
                  <button 
                    type="button" 
                    className="btn btn-sm btn-outline-success rounded-pill px-3 py-1 fw-bold"
                    onClick={() => setView('add')}
                  >
                    Gieo mầm
                  </button>
                )}
              </div>
            </div>

            {/* Quest 4 */}
            <div className="garden-quest-card p-3 rounded-4 border bg-white d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-3">
                <div className="garden-quest-icon rounded-3 p-2 text-warning" style={{ background: '#fffbeb' }}>
                  <Zap size={22} />
                </div>
                <div>
                  <div className="fw-bold text-dark" style={{ fontSize: '14px' }}>Rèn Phản Xạ 60 Giây</div>
                  <div className="text-muted small">Chơi 1 ván Nối Từ Siêu Tốc để bồi dưỡng trí nhớ</div>
                </div>
              </div>
              <div>
                <button 
                  type="button" 
                  className="btn btn-sm btn-warning text-dark rounded-pill px-3 py-1 fw-bold"
                  onClick={() => onNavigate?.('wordmatch')}
                >
                  Chơi ngay
                </button>
              </div>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  // ─── GARDEN MAIN VIEW ───
  const dueCount = stats.due_count || 0;
  const totalInGarden = stats.total || 0;

  return (
    <div className="garden-page">
      {/* Watering Rain Animation Overlay */}
      {isWateringRain && (
        <div className="garden-rain-overlay">
          <div className="garden-rain-droplets">
            {Array.from({ length: 18 }).map((_, i) => (
              <span key={i} className="rain-drop" style={{ left: `${(i * 5.5) + 3}%`, animationDelay: `${(i % 5) * 0.15}s` }}>
                💧
              </span>
            ))}
          </div>
        </div>
      )}

      <Container className="py-2.5 py-md-3" style={{ maxWidth: 980 }}>
        {/* Back to Home */}
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

        {/* ── Gardener Profile & Rank Banner ── */}
        <div className="garden-profile-card p-3 p-md-3.5 rounded-4 mb-3 d-flex align-items-center justify-content-between flex-wrap gap-2.5">
          <div className="d-flex align-items-center gap-3">
            <div className="garden-avatar-pot">
              <span>🏡</span>
            </div>
            <div>
              <div className="d-flex align-items-center gap-2">
                <h5 className="fw-black mb-0 text-dark">{gardenerRank.title}</h5>
                <span className="badge rounded-pill text-white px-2 py-0.5" style={{ background: gardenerRank.color, fontSize: '10px' }}>
                  {gardenerRank.badge}
                </span>
              </div>
              <small className="text-muted">
                Quy mô: <strong>{totalInGarden} cây</strong> trồng trong vườn • <strong>{stats.level4 || 0} quả vàng</strong> đã thu hoạch
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
              <h2 className="garden-title mb-0">🌱 Vườn Cây Trí Nhớ</h2>
              <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-2.5 py-1" style={{ fontSize: '11px', fontWeight: 800 }}>
                Hệ Thống SRS
              </span>
            </div>
            <p className="garden-desc mt-1 mb-0">
              Mỗi từ vựng là một mầm cây cần chăm sóc. Tưới nước đúng hạn để cây nở hoa và đơm quả vàng vĩnh viễn!
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
                💧 Tưới nước ngay ({dueCount} cây)
              </button>
            ) : (
              <div className="garden-all-hydrated-pill">
                <span>✨ Vườn no đủ nước</span>
              </div>
            )}
          </div>
        </div>

        {/* ── 4 Growth Stages Bar ── */}
        <div className="garden-stats-bar">
          {LEVELS.map(lvl => (
            <div 
              key={lvl.level} 
              className={`garden-stat-pill cursor-pointer ${filterLevel === String(lvl.level) ? 'is-active' : ''}`} 
              style={{ borderColor: lvl.border, background: lvl.bg }}
              onClick={() => setFilterLevel(String(lvl.level))}
            >
              <span style={{ fontSize: '20px' }}>{lvl.emoji}</span>
              <div className="d-flex flex-column min-w-0">
                <span style={{ color: lvl.color, fontWeight: 900, fontSize: '15px', lineHeight: 1.1 }}>
                  {stats[`level${lvl.level}`] || 0}
                </span>
                <span className="text-truncate" style={{ color: '#64748b', fontSize: '10.5px' }}>{lvl.stageName}</span>
              </div>
            </div>
          ))}

          {(stats.overdue_count || 0) > 0 && (
            <div 
              className={`garden-stat-pill cursor-pointer ${filterLevel === 'overdue' ? 'is-active' : ''}`}
              style={{ borderColor: '#fecaca', background: '#fef2f2' }}
              onClick={() => setFilterLevel('overdue')}
            >
              <span style={{ fontSize: '20px' }}>🥀</span>
              <div className="d-flex flex-column min-w-0">
                <span style={{ color: '#ef4444', fontWeight: 900, fontSize: '15px', lineHeight: 1.1 }}>
                  {stats.overdue_count}
                </span>
                <span style={{ color: '#ef4444', fontSize: '10.5px', fontWeight: 700 }}>Cần cấp cứu!</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Filter Tabs ── */}
        <div className="garden-filter-tabs">
          {[
            { key: 'all', label: 'Tất cả cây', count: totalInGarden },
            { key: 'due', label: '💧 Cần tưới', count: dueCount },
            { key: 'overdue', label: '🥀 Cần cứu', count: stats.overdue_count || 0 },
            ...LEVELS.map(l => ({ key: String(l.level), label: `${l.emoji} ${l.stageName}`, count: stats[`level${l.level}`] || 0 }))
          ].map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilterLevel(tab.key)}
              className={`garden-filter-tab ${filterLevel === tab.key ? 'active' : ''}`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && <span className="garden-tab-count">{tab.count}</span>}
            </button>
          ))}
        </div>

        {/* ── Plant Grid Display ── */}
        {loading ? (
          <div className="d-flex flex-column align-items-center justify-content-center py-5">
            <Spinner color="success" />
            <span className="small text-muted mt-2">Đang nạp dữ liệu khu vườn...</span>
          </div>
        ) : totalInGarden === 0 ? (
          <div className="garden-empty">
            <div className="garden-empty-icon">🪴🌱</div>
            <h5 className="fw-black mb-2 text-dark">Khu vườn đang chờ bạn gieo hạt</h5>
            <p className="text-muted mb-4" style={{ fontSize: 14, maxWidth: 420, margin: '0 auto' }}>
              Hãy gieo những hạt mầm từ vựng đầu tiên. Mỗi ngày chỉ cần 3 phút tưới nước, từ ngữ sẽ ăn sâu vào tiềm thức vĩnh viễn!
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
              const cfg = getLevelConfig(item);
              const isReadyToWater = item.is_due || item.is_overdue;

              return (
                <div
                  key={item.id}
                  className={`garden-plant-card cursor-pointer ${isReadyToWater ? 'ready-to-water' : ''}`}
                  style={{ borderColor: cfg.border, background: cfg.bg }}
                  onClick={() => setSelectedPlant(item)}
                >
                  {/* Top Bar: Pot & Status Badge */}
                  <div className="d-flex align-items-center justify-content-between mb-1.5">
                    <span className="garden-plant-emoji">{cfg.potEmoji}</span>
                    <div className="d-flex align-items-center gap-1">
                      {item.is_overdue && (
                        <span className="badge bg-danger text-white rounded-pill pulse-badge" style={{ fontSize: '9px', padding: '2px 6px' }}>
                          🥀 Héo!
                        </span>
                      )}
                      {item.is_due && !item.is_overdue && (
                        <span className="badge bg-info text-white rounded-pill pulse-badge" style={{ fontSize: '9px', padding: '2px 6px' }}>
                          💧 Tưới
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

                  {/* Japanese Kanji / Kana */}
                  <div className="garden-plant-word">{item.word}</div>
                  {item.reading && item.reading !== item.word && (
                    <div className="garden-plant-reading">{item.reading}</div>
                  )}

                  {/* Vietnamese Meaning */}
                  <div className="garden-plant-meaning">{item.meaning}</div>

                  {/* Growth Progress Indicator */}
                  <div className="mt-2 pt-1 border-top border-black border-opacity-10">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="small fw-bold" style={{ fontSize: '10px', color: cfg.color }}>
                        {cfg.stageName}
                      </span>
                      <span className="text-muted" style={{ fontSize: '9.5px' }}>
                        Cấp {item.level}/4
                      </span>
                    </div>
                    <Progress 
                      value={cfg.pct || (item.level * 25)} 
                      style={{ height: 4, borderRadius: 999 }} 
                      color={item.level === 4 ? 'warning' : 'success'} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── All Plants Hydrated Celebration Card ── */}
        {totalInGarden > 0 && dueCount === 0 && !loading && (
          <div className="garden-all-good mt-3.5">
            <span style={{ fontSize: '20px' }}>✨🌿</span>
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
          const cfg = getLevelConfig(selectedPlant);
          return (
            <ModalBody className="p-4 rounded-4 bg-white border-0 text-center">
              <div className="mb-2" style={{ fontSize: '48px' }}>
                {cfg.potEmoji} {cfg.emoji}
              </div>

              <div className="d-inline-block px-3 py-1 rounded-pill small fw-bold mb-2" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                {cfg.stageName} (Cấp {selectedPlant.level}/4)
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

              <div className="text-start small text-secondary p-2.5 rounded-3 border bg-white mb-3 d-flex flex-column gap-1">
                <div>• Cột mốc tiếp theo: <strong>{cfg.desc}</strong></div>
                <div>• Số lần ôn đúng: <strong>{selectedPlant.correct_count || 1} lần</strong></div>
                <div>• Tình trạng: <strong>{selectedPlant.is_overdue ? '🥀 Cần tưới ngay' : selectedPlant.is_due ? '💧 Đến hạn hôm nay' : '✅ Đang phát triển tốt'}</strong></div>
              </div>

              <div className="d-flex flex-column gap-2">
                {(selectedPlant.is_due || selectedPlant.is_overdue) ? (
                  <button
                    type="button"
                    className="garden-primary-btn"
                    onClick={() => startReview(selectedPlant)}
                  >
                    💧 Tưới Nước Riêng Cho Cây Này
                  </button>
                ) : (
                  <button
                    type="button"
                    className="garden-secondary-btn"
                    onClick={() => startReview(selectedPlant)}
                  >
                    🌿 Tưới Nước Ôn Lại Ngay
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
