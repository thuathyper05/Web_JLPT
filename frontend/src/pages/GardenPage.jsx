import React, { useState, useEffect, useCallback } from 'react';
import { Container, Spinner, Progress } from 'reactstrap';
import { 
  Leaf, Star, RefreshCw, Plus, ChevronLeft, CheckCircle, 
  XCircle, Volume2, BookOpen, Sparkles, Info, X, 
  ChevronRight, Trophy, Flower2, TreePine, LogIn, AlertCircle
} from 'lucide-react';
import { srsService, vocabService, lessonService, speakJapanese } from '../services/api';
import { sounds } from '../services/sounds';
import { useApp } from '../context/AppContext';
import confetti from 'canvas-confetti';

// SRS Growth config
const LEVELS = [
  { level: 1, emoji: '🌱', label: 'Mầm mới', color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0', desc: 'Vừa thêm vào vườn' },
  { level: 2, emoji: '🌿', label: 'Lá non', color: '#059669', bg: '#d1fae5', border: '#6ee7b7', desc: 'Ôn sau 3 ngày' },
  { level: 3, emoji: '🌸', label: 'Nở hoa', color: '#ec4899', bg: '#fdf2f8', border: '#f9a8d4', desc: 'Ôn sau 7 ngày' },
  { level: 4, emoji: '⭐', label: 'Đã thuộc', color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', desc: 'Thuộc vĩnh viễn' },
];

const OVERDUE_CONFIG = { emoji: '🥀', label: 'Cần tưới', color: '#ef4444', bg: '#fef2f2', border: '#fecaca' };

const getLevelConfig = (item) => {
  if (item.is_overdue) return OVERDUE_CONFIG;
  return LEVELS.find(l => l.level === item.level) || LEVELS[0];
};

const GUEST_STORAGE_KEY = 'hyper_guest_garden_srs';

const GardenPage = ({ onNavigate }) => {
  const { user } = useApp();
  const [view, setView] = useState('garden'); // garden | add | review | done
  const [loading, setLoading] = useState(true);
  const [gardenItems, setGardenItems] = useState([]);
  const [stats, setStats] = useState({});
  const [filterLevel, setFilterLevel] = useState('all');
  const [lessons, setLessons] = useState([]);
  const [addLesson, setAddLesson] = useState(1);
  const [addLoading, setAddLoading] = useState(false);
  const [addResult, setAddResult] = useState(null);

  // Review session
  const [dueItems, setDueItems] = useState([]);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [reviewFlipped, setReviewFlipped] = useState(false);
  const [reviewAnswered, setReviewAnswered] = useState(false);
  const [reviewResults, setReviewResults] = useState([]);
  const [reviewDone, setReviewDone] = useState(false);

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
        // Guest mode with localStorage
        const raw = getGuestItems();
        const { items: processed, stats: s } = calculateStats(raw);
        setGardenItems(processed);
        setStats(s);
      }
    } catch (err) {
      console.error('[Garden] load error:', err);
      // Fallback to guest mode
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

  const startReview = async () => {
    try {
      let due = [];
      if (user) {
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
        // Guest mode update
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
        sounds.playCorrect?.();
        if (newLevel === 4) {
          confetti({ particleCount: 80, spread: 80, origin: { y: 0.5 }, colors: ['#f59e0b', '#fde68a', '#ffffff'] });
        }
      } else {
        sounds.playWrong?.();
      }

      setTimeout(() => {
        if (reviewIndex + 1 >= dueItems.length) {
          setReviewDone(true);
          setView('done');
          loadGarden();
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
        // Guest mode add
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

  // ─── REVIEW SCREEN ───
  if (view === 'review') {
    const currentItem = dueItems[reviewIndex];
    const levelCfg = LEVELS.find(l => l.level === currentItem?.level) || LEVELS[0];
    const progress = dueItems.length > 0 ? Math.round(((reviewIndex) / dueItems.length) * 100) : 0;

    return (
      <div className="garden-page">
        <Container className="py-3 py-md-4" style={{ maxWidth: 560 }}>
          {/* Header */}
          <div className="d-flex align-items-center justify-content-between mb-3">
            <button className="garden-back-btn" onClick={() => { setView('garden'); loadGarden(); }}>
              <ChevronLeft size={18} /> Vườn cây
            </button>
            <span className="garden-review-count">{reviewIndex + 1} / {dueItems.length}</span>
          </div>

          <Progress value={progress} className="mb-4" style={{ height: 6, borderRadius: 999 }} color="success" />

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
                <div className="garden-review-stage-badge" style={{ background: levelCfg.bg, color: levelCfg.color, border: `1px solid ${levelCfg.border}` }}>
                  {levelCfg.emoji} {levelCfg.label}
                </div>
                <div className="garden-review-jp">{currentItem.word}</div>
                {currentItem.reading && (
                  <div className="garden-review-reading">{currentItem.reading}</div>
                )}
                <div className="garden-review-hint">👆 Chạm vào thẻ để xem nghĩa</div>
              </div>

              {reviewFlipped && (
                <div className="garden-review-back">
                  <div className="garden-review-meaning">{currentItem.meaning}</div>
                  <button
                    type="button"
                    className="garden-speak-btn"
                    onClick={(e) => { e.stopPropagation(); speakJapanese(currentItem.word || currentItem.reading); }}
                  >
                    <Volume2 size={16} /> Nghe phát âm
                  </button>
                </div>
              )}
            </div>
          )}

          {reviewFlipped && !reviewAnswered && (
            <div className="garden-answer-btns mt-4">
              <button className="garden-wrong-btn" onClick={() => handleReviewAnswer(false)}>
                <XCircle size={20} /> Chưa nhớ (Cây lùi 1 bậc)
              </button>
              <button className="garden-correct-btn" onClick={() => handleReviewAnswer(true)}>
                <CheckCircle size={20} /> Đã nhớ! (Cây lớn lên 🌱)
              </button>
            </div>
          )}

          {reviewAnswered && (
            <div className="garden-answered-feedback mt-3 text-center">
              {reviewResults[reviewResults.length - 1]?.correct ? (
                <span style={{ color: '#10b981', fontWeight: 700 }}>✅ Tuyệt vời! Cây đã được tưới và lớn thêm một bậc</span>
              ) : (
                <span style={{ color: '#ef4444', fontWeight: 700 }}>❌ Cần ôn lại — cây sẽ được nhắc lại sớm hơn</span>
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
        <Container className="py-5 text-center" style={{ maxWidth: 480 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🌸</div>
          <h2 className="fw-bold mb-1" style={{ color: '#0f172a' }}>Tưới Nước Hoàn Tất!</h2>
          <p className="text-muted mb-4" style={{ fontSize: 14 }}>Các mầm cây trong vườn của bạn đã được hấp thu kiến thức mới.</p>

          <div className="garden-done-stats">
            <div className="garden-done-stat">
              <CheckCircle size={22} color="#10b981" />
              <div className="garden-done-val">{correct}/{total}</div>
              <div className="garden-done-key">Nhớ đúng</div>
            </div>
            <div className="garden-done-stat">
              <Star size={22} color="#f59e0b" />
              <div className="garden-done-val">{accuracy}%</div>
              <div className="garden-done-key">Chính xác</div>
            </div>
            {mastered > 0 && (
              <div className="garden-done-stat">
                <Trophy size={22} color="#8b5cf6" />
                <div className="garden-done-val">{mastered}</div>
                <div className="garden-done-key">Thuộc vĩnh viễn ⭐</div>
              </div>
            )}
          </div>

          <div className="d-flex flex-column gap-2.5 mt-4">
            <button className="garden-primary-btn" onClick={() => setView('garden')}>
              <Leaf size={18} /> Quay lại Vườn Cây
            </button>
            {stats.due_count > 0 && (
              <button className="garden-secondary-btn" onClick={startReview}>
                <RefreshCw size={18} /> Ôn tiếp ({stats.due_count} từ cần tưới)
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
        <Container className="py-4" style={{ maxWidth: 560 }}>
          <button className="garden-back-btn mb-3" onClick={() => setView('garden')}>
            <ChevronLeft size={18} /> Vườn cây
          </button>

          <h3 className="fw-bold mb-1" style={{ color: '#0f172a' }}>🌱 Trồng Từ Vựng Vào Vườn</h3>
          <p className="text-muted mb-4" style={{ fontSize: 14 }}>Chọn một bài học Minna no Nihongo để gieo các hạt mầm từ vựng mới.</p>

          <div className="garden-add-card mb-4">
            <label className="wm-label mb-2">Chọn bài học cần trồng:</label>
            <div className="wm-lesson-grid mb-3">
              {Array.from({ length: 25 }, (_, i) => i + 1).map(num => (
                <button
                  key={num}
                  onClick={() => setAddLesson(num)}
                  className={`wm-lesson-btn ${addLesson === num ? 'active' : ''}`}
                >
                  {num}
                </button>
              ))}
            </div>

            <button
              className="garden-primary-btn w-100"
              onClick={handleAddLesson}
              disabled={addLoading}
            >
              {addLoading ? <Spinner size="sm" /> : <Plus size={18} />}
              Trồng Toàn Bộ Bài {addLesson} Vào Vườn 🌱
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
            <Info size={16} />
            <span>Thuật toán lặp lại ngắt quãng (SRS) sẽ tự động lên lịch nhắc bạn tưới nước sau <strong>1 ngày</strong>, <strong>3 ngày</strong>, <strong>7 ngày</strong> và <strong>30 ngày</strong> để khắc sâu vào trí nhớ dài hạn.</span>
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
      <Container className="py-3 py-md-4" style={{ maxWidth: 960 }}>
        {/* Guest Banner if not logged in */}
        {!user && (
          <div className="garden-guest-banner mb-3 d-flex align-items-center justify-content-between p-2.5 px-3 rounded-3">
            <div className="d-flex align-items-center gap-2">
              <AlertCircle size={16} className="text-warning flex-shrink-0" />
              <span className="small text-secondary">
                Bạn đang dùng <strong>Vườn cây cục bộ</strong>. Đăng nhập để lưu tiến độ an toàn trên cloud.
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

        {/* Header */}
        <div className="garden-header">
          <div>
            <div className="d-flex align-items-center gap-2">
              <h2 className="garden-title mb-0">🌱 Vườn Cây Trí Nhớ</h2>
              <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-2.5 py-1" style={{ fontSize: '11px' }}>
                SRS Thuộc Vĩnh Viễn
              </span>
            </div>
            <p className="garden-desc mt-1 mb-0">
              Mỗi từ vựng là một mầm cây lớn dần theo thời gian ôn tập. Tưới nước đúng hạn để cây đơm hoa kết trái!
            </p>
          </div>

          <div className="garden-header-actions">
            {dueCount > 0 && (
              <button className="garden-water-btn" onClick={startReview}>
                <span className="garden-water-badge">{dueCount}</span>
                💧 Tưới nước ({dueCount} cây)
              </button>
            )}
            <button className="garden-add-btn" onClick={() => setView('add')}>
              <Plus size={16} /> Gieo mầm mới
            </button>
          </div>
        </div>

        {/* Growth Stages Explainer Cards */}
        <div className="garden-stats-bar">
          {LEVELS.map(lvl => (
            <div key={lvl.level} className="garden-stat-pill" style={{ borderColor: lvl.border, background: lvl.bg }}>
              <span style={{ fontSize: '18px' }}>{lvl.emoji}</span>
              <div className="d-flex flex-column">
                <span style={{ color: lvl.color, fontWeight: 800, fontSize: '15px', lineHeight: 1.1 }}>
                  {stats[`level${lvl.level}`] || 0}
                </span>
                <span style={{ color: '#64748b', fontSize: '10.5px' }}>{lvl.label}</span>
              </div>
            </div>
          ))}
          {(stats.overdue_count || 0) > 0 && (
            <div className="garden-stat-pill" style={{ borderColor: '#fecaca', background: '#fef2f2' }}>
              <span style={{ fontSize: '18px' }}>🥀</span>
              <div className="d-flex flex-column">
                <span style={{ color: '#ef4444', fontWeight: 800, fontSize: '15px', lineHeight: 1.1 }}>
                  {stats.overdue_count}
                </span>
                <span style={{ color: '#ef4444', fontSize: '10.5px' }}>Cần tưới ngay</span>
              </div>
            </div>
          )}
        </div>

        {/* Filter tabs */}
        <div className="garden-filter-tabs">
          {[
            { key: 'all', label: 'Tất cả mầm', count: totalInGarden },
            { key: 'due', label: '💧 Cần tưới', count: dueCount },
            { key: 'overdue', label: '🥀 Héo', count: stats.overdue_count || 0 },
            ...LEVELS.map(l => ({ key: String(l.level), label: `${l.emoji} ${l.label}`, count: stats[`level${l.level}`] || 0 }))
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilterLevel(tab.key)}
              className={`garden-filter-tab ${filterLevel === tab.key ? 'active' : ''}`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && <span className="garden-tab-count">{tab.count}</span>}
            </button>
          ))}
        </div>

        {/* Garden Grid */}
        {loading ? (
          <div className="d-flex flex-column align-items-center justify-content-center py-5">
            <Spinner color="success" />
            <span className="small text-muted mt-2">Đang chăm sóc khu vườn...</span>
          </div>
        ) : totalInGarden === 0 ? (
          <div className="garden-empty">
            <div className="garden-empty-icon">🌱</div>
            <h5 className="fw-bold mb-2 text-dark">Khu vườn hiện đang trống</h5>
            <p className="text-muted mb-4" style={{ fontSize: 14, maxWidth: 420, margin: '0 auto' }}>
              Hãy gieo hạt từ vựng bài học đầu tiên vào vườn. Mỗi ngày vào tưới nước để từ ngữ ăn sâu vào tiềm thức vĩnh viễn!
            </p>
            <button className="garden-primary-btn" onClick={() => setView('add')}>
              <Plus size={18} /> Gieo mầm từ vựng ngay
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="garden-empty py-4">
            <div className="garden-empty-icon" style={{ fontSize: 36 }}>🔍</div>
            <p className="text-muted small">Không tìm thấy từ vựng nào trong mục phân loại này.</p>
          </div>
        ) : (
          <div className="garden-grid">
            {filteredItems.map(item => {
              const cfg = getLevelConfig(item);
              return (
                <div
                  key={item.id}
                  className="garden-plant-card"
                  style={{ borderColor: cfg.border, background: cfg.bg }}
                >
                  <div className="d-flex align-items-center justify-content-between mb-1.5">
                    <span className="garden-plant-emoji">{cfg.emoji}</span>
                    <div className="d-flex align-items-center gap-1">
                      {item.is_overdue && (
                        <span className="badge bg-danger text-white rounded-pill" style={{ fontSize: '9px', padding: '2px 6px' }}>
                          Cần tưới!
                        </span>
                      )}
                      {item.is_due && !item.is_overdue && (
                        <span className="badge bg-primary text-white rounded-pill" style={{ fontSize: '9px', padding: '2px 6px' }}>
                          💧 Hôm nay
                        </span>
                      )}
                      <button
                        type="button"
                        className="garden-speak-icon"
                        onClick={() => speakJapanese(item.word || item.reading)}
                        title="Nghe phát âm chuẩn Tokyo"
                      >
                        <Volume2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="garden-plant-word">{item.word}</div>
                  {item.reading && item.reading !== item.word && (
                    <div className="garden-plant-reading">{item.reading}</div>
                  )}
                  <div className="garden-plant-meaning">{item.meaning}</div>

                  <div className="garden-plant-footer mt-2">
                    <span className="garden-plant-badge" style={{ color: cfg.color }}>
                      {cfg.label}
                    </span>
                    <span className="text-muted" style={{ fontSize: '10px' }}>
                      B.{item.lesson_number || 1}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state for due items but garden has plants */}
        {totalInGarden > 0 && dueCount === 0 && !loading && (
          <div className="garden-all-good mt-3">
            <span>✨</span>
            <span>Khu vườn đang rất xanh tươi! Tất cả cây đã được tưới nước đầy đủ hôm nay.</span>
          </div>
        )}
      </Container>
    </div>
  );
};

export default GardenPage;
