import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, CardBody, Button, Badge, Spinner, Input,
  Modal, ModalHeader, ModalBody, Progress
} from 'reactstrap';
import {
  Star, Volume2, BookOpen, Layers, Search, Filter,
  ChevronLeft, ChevronRight, RefreshCw, RotateCw, X
} from 'lucide-react';
import { favoriteService, speakJapanese } from '../services/api';
import { useApp } from '../context/AppContext';
import { sounds } from '../services/sounds';

const FavoritesPage = ({ onNavigate, onSelectLesson }) => {
  const { user, guestFavorites, toggleFavorite } = useApp();
  const [favorites, setFavorites] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('all');
  const [loading, setLoading] = useState(true);

  // Flashcard mode
  const [fcOpen, setFcOpen] = useState(false);
  const [fcIndex, setFcIndex] = useState(0);
  const [fcFlipped, setFcFlipped] = useState(false);

  useEffect(() => { fetchFavorites(); }, [user, guestFavorites]);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      if (user) {
        const res = await favoriteService.getFavorites();
        setFavorites(res.data);
      } else {
        setFavorites(guestFavorites);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleRemove = async (item) => {
    sounds.playFlip();
    await toggleFavorite(item);
    setFavorites(prev => prev.filter(v => v.id !== item.id));
  };

  const filtered = favorites.filter(item => {
    if (selectedLesson !== 'all' && item.lesson_number !== parseInt(selectedLesson)) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const m = item.clean_vietnamese || item.vietnamese;
    const k = item.clean_kana || item.kana;
    return m?.toLowerCase().includes(q) || k?.toLowerCase().includes(q) ||
      item.kanji?.toLowerCase().includes(q) || item.romaji?.toLowerCase().includes(q);
  });

  const fcWord = filtered[fcIndex];

  const openFlashcard = () => {
    if (!filtered.length) return;
    setFcIndex(0); setFcFlipped(false); setFcOpen(true); sounds.playFlip();
    speakJapanese(filtered[0].clean_kana || filtered[0].kana);
  };
  const fcNext = () => {
    sounds.playFlip(); setFcFlipped(false);
    if (fcIndex < filtered.length - 1) {
      const n = filtered[fcIndex + 1];
      setFcIndex(fcIndex + 1);
      speakJapanese(n.clean_kana || n.kana);
    } else { setFcOpen(false); }
  };
  const fcPrev = () => {
    if (fcIndex > 0) { setFcFlipped(false); sounds.playFlip(); setFcIndex(fcIndex - 1); }
  };

  if (loading) return (
    <Container className="text-center py-5">
      <Spinner color="primary" />
      <p className="mt-2 text-muted">Đang tải danh sách yêu thích...</p>
    </Container>
  );

  const lessonNums = [...new Set(favorites.map(v => v.lesson_number))].sort((a, b) => a - b);

  return (
    <Container className="py-3 py-md-4">

      {/* ── Header ── */}
      <div className="page-header-box mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-0">
          <div className="d-flex align-items-center gap-3">
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#f59e0b,#d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(245,158,11,.3)' }}>
              <Star size={26} fill="#fff" color="#fff" />
            </div>
            <div>
              <h4 className="fw-bold mb-0 text-navy-dark" style={{ fontSize: 18 }}>Từ Vựng Yêu Thích</h4>
              <p className="text-muted small mb-0">Sổ tay lưu các từ quan trọng bạn muốn ghi nhớ kỹ</p>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2 flex-wrap">
            {favorites.length > 0 && (
              <Button color="primary" size="sm" className="rounded-pill px-3 fw-bold d-flex align-items-center gap-1 shadow-sm"
                onClick={openFlashcard}>
                <Layers size={15} /> Luyện Flashcard
              </Button>
            )}
            <span style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 999, padding: '4px 12px', fontSize: 13, fontWeight: 700, color: '#92400e' }}>
              {favorites.length} từ đã lưu
            </span>
          </div>
        </div>

        {favorites.length > 0 && (
          <div className="mt-3 pt-3 border-top d-flex flex-wrap align-items-center gap-2">
            <div className="d-flex align-items-center gap-2">
              <Filter size={14} className="text-muted" />
              <Input type="select" value={selectedLesson} onChange={e => setSelectedLesson(e.target.value)}
                className="fw-bold w-auto" style={{ fontSize: 13, borderRadius: 9, padding: '5px 8px' }}>
                <option value="all">Tất cả bài ({favorites.length})</option>
                {lessonNums.map(n => (
                  <option key={n} value={n}>
                    Bài {n < 10 ? `0${n}` : n} ({favorites.filter(v => v.lesson_number === n).length})
                  </option>
                ))}
              </Input>
            </div>
            <div className="position-relative ms-auto">
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <Input type="text" placeholder="Tìm từ yêu thích..." value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: 32, borderRadius: 999, fontSize: 13, minWidth: 200 }} />
            </div>
          </div>
        )}
      </div>

      {/* ── Grid or Empty ── */}
      {filtered.length === 0 ? (
        <div className="jlpt-card p-5 text-center">
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Star size={36} color="#f59e0b" />
          </div>
          <h5 className="fw-bold text-navy-dark">
            {search || selectedLesson !== 'all' ? 'Không tìm thấy từ nào' : 'Chưa có từ yêu thích'}
          </h5>
          <p className="text-muted mb-4" style={{ maxWidth: 440, margin: '8px auto 20px' }}>
            {search || selectedLesson !== 'all'
              ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.'
              : 'Nhấn ⭐ trên bất kỳ từ vựng nào để lưu vào đây và ôn tập bất cứ lúc nào!'}
          </p>
          <Button color="primary" className="fw-bold px-4 rounded-pill shadow-sm" onClick={() => onNavigate('lessons')}>
            <BookOpen size={16} className="me-1" /> Khám phá 25 Bài học
          </Button>
        </div>
      ) : (
        <Row className="g-3">
          {filtered.map(item => {
            const meaning = item.clean_vietnamese || item.vietnamese;
            const kana = item.clean_kana || item.kana;
            return (
              <Col md={6} lg={4} key={item.id}>
                <Card className="fav-card h-100 shadow-sm" style={{ border: '1px solid #e8edf4', borderTop: '3px solid #f59e0b', borderRadius: 14 }}>
                  <CardBody className="p-3 d-flex flex-column justify-content-between">
                    <div>
                      {/* Top row */}
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span style={{ background: '#f1f5f9', color: '#475569', fontSize: 11.5, fontWeight: 700, borderRadius: 999, padding: '3px 10px', cursor: 'pointer' }}
                          onClick={() => { if (onSelectLesson) onSelectLesson(item.lesson_number); onNavigate('lessons'); }}>
                          Bài {item.lesson_number}
                        </span>
                        <div className="d-flex gap-1">
                          <button type="button" style={{ background: '#eff6ff', border: 'none', borderRadius: 8, padding: '5px 7px', cursor: 'pointer' }}
                            onClick={() => speakJapanese(kana)} title="Nghe phát âm">
                            <Volume2 size={14} color="#2563eb" />
                          </button>
                          <button type="button" style={{ background: '#fffbeb', border: 'none', borderRadius: 8, padding: '5px 7px', cursor: 'pointer' }}
                            onClick={() => handleRemove(item)} title="Bỏ yêu thích">
                            <Star size={14} fill="#f59e0b" color="#f59e0b" />
                          </button>
                        </div>
                      </div>

                      {/* Word */}
                      <div className="mb-2">
                        {item.kanji && item.kanji !== '–' && item.kanji !== '-' && (
                          <div style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', fontFamily: 'Noto Sans JP,sans-serif', lineHeight: 1.2 }}>
                            {item.kanji}
                          </div>
                        )}
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#2563eb', fontFamily: 'Noto Sans JP,sans-serif' }}>
                          {kana}
                        </div>
                        <div style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>[{item.romaji}]</div>
                      </div>

                      {/* Meaning */}
                      <div style={{ background: '#f8fafc', borderRadius: 10, padding: '8px 12px', fontSize: 13.5, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>
                        {meaning}
                      </div>

                      {item.usage_note && (
                        <div style={{ fontSize: 11.5, color: '#64748b', marginBottom: 6 }}>
                          💡 {item.usage_note}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-top d-flex justify-content-between align-items-center">
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>#{item.order_num || item.id}</span>
                      <button type="button" style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: 0 }}
                        onClick={() => { if (onSelectLesson) onSelectLesson(item.lesson_number); onNavigate('lessons'); }}>
                        Xem trong bài →
                      </button>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* ── Flashcard Modal ── */}
      <Modal isOpen={fcOpen} toggle={() => setFcOpen(false)} centered className="jlpt-modal">
        <ModalHeader toggle={() => setFcOpen(false)} className="border-0 pb-0">
          <div className="d-flex align-items-center gap-2">
            <Star size={18} fill="#f59e0b" color="#f59e0b" />
            <span className="fw-bold text-navy-dark">
              Ôn Thẻ Yêu Thích ({fcIndex + 1}/{filtered.length})
            </span>
          </div>
        </ModalHeader>
        <ModalBody className="p-4 text-center">
          {fcWord && (
            <>
              {/* Progress */}
              <div className="mb-3">
                <Progress value={((fcIndex + 1) / filtered.length) * 100} style={{ height: 4, borderRadius: 999 }}>
                  <div style={{ height: '100%', width: `${((fcIndex + 1) / filtered.length) * 100}%`, background: '#f59e0b', borderRadius: 999 }} />
                </Progress>
              </div>

              {/* Flip Card */}
              <div onClick={() => { setFcFlipped(!fcFlipped); sounds.playFlip(); }}
                style={{ cursor: 'pointer', minHeight: 200, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderRadius: 16, border: '1.5px solid', borderColor: fcFlipped ? '#10b981' : '#e2e8f0', background: fcFlipped ? 'linear-gradient(135deg,#ecfdf5,#f0fdf4)' : '#ffffff', padding: '20px 24px', marginBottom: 16, transition: 'all .3s ease' }}>
                {!fcFlipped ? (
                  <>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', marginBottom: 10 }}>TIẾNG NHẬT</span>
                    {fcWord.kanji && fcWord.kanji !== '–' && (
                      <div style={{ fontSize: 36, fontWeight: 900, color: '#0f172a', fontFamily: 'Noto Sans JP,sans-serif' }}>{fcWord.kanji}</div>
                    )}
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#2563eb', fontFamily: 'Noto Sans JP,sans-serif' }}>{fcWord.clean_kana || fcWord.kana}</div>
                    <div style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic' }}>[{fcWord.romaji}]</div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 10 }}><RotateCw size={12} style={{ marginRight: 4 }} />Chạm để xem nghĩa</div>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#059669', marginBottom: 10 }}>NGHĨA TIẾNG VIỆT</span>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#065f46' }}>{fcWord.clean_vietnamese || fcWord.vietnamese}</div>
                    {fcWord.usage_note && <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 8 }}>💡 {fcWord.usage_note}</div>}
                  </>
                )}
              </div>

              {/* Controls */}
              <div className="d-flex justify-content-center align-items-center gap-2">
                <button type="button" style={{ background: '#f1f5f9', border: 'none', borderRadius: 9, padding: '8px 12px', cursor: fcIndex === 0 ? 'not-allowed' : 'pointer', opacity: fcIndex === 0 ? .4 : 1 }}
                  onClick={fcPrev} disabled={fcIndex === 0}>
                  <ChevronLeft size={18} color="#475569" />
                </button>
                <button type="button" style={{ background: '#eff6ff', border: 'none', borderRadius: 9, padding: '8px 12px', cursor: 'pointer' }}
                  onClick={() => speakJapanese(fcWord.clean_kana || fcWord.kana)}>
                  <Volume2 size={18} color="#2563eb" />
                </button>
                <Button color="primary" className="rounded-pill fw-bold px-4 shadow-sm" onClick={fcNext}>
                  {fcIndex < filtered.length - 1 ? 'Thẻ tiếp →' : '🎉 Xong!'}
                </Button>
              </div>
            </>
          )}
        </ModalBody>
      </Modal>
    </Container>
  );
};

export default FavoritesPage;
