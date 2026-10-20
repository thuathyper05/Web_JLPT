import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, CardBody, Button, Badge, Spinner, Input,
  Modal, ModalHeader, ModalBody, ModalFooter, Progress
} from 'reactstrap';
import {
  RefreshCw, Volume2, CheckCircle, BookOpen, ArrowRight, Flame, Search,
  Award, Trash2, Layers, CheckSquare, Keyboard, Filter, ChevronLeft, ChevronRight, RotateCw
} from 'lucide-react';
import { vocabService, speakJapanese } from '../services/api';
import { hasRealKanji, getEffectiveKana } from '../utils/katakanaNormalize';
import { useApp } from '../context/AppContext';
import { sounds } from '../services/sounds';

const ReviewWrongPage = ({ onNavigate }) => {
  const { user, guestProgress, clearWrongStatus, resetAllWrong } = useApp();
  const [reviewList, setReviewList] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('all');
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Quick study modal
  const [studyOpen, setStudyOpen] = useState(false);
  const [qIdx, setQIdx] = useState(0);
  const [qFlipped, setQFlipped] = useState(false);

  useEffect(() => { fetchItems(); }, [user, guestProgress]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      if (user) {
        const res = await vocabService.getVocabularies({ status: 'needs_review' });
        setReviewList(res.data);
      } else {
        const ids = Object.keys(guestProgress).filter(id => guestProgress[id]?.status === 'needs_review');
        if (!ids.length) { setReviewList([]); return; }
        const res = await vocabService.getVocabularies({});
        setReviewList(res.data.filter(v => ids.includes(String(v.id))));
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleMastered = async (id) => {
    sounds.playCorrect();
    await clearWrongStatus(id);
    setReviewList(prev => prev.filter(v => v.id !== id));
  };

  const handleResetAll = async () => {
    sounds.playComplete();
    await resetAllWrong();
    setReviewList([]);
    setConfirmOpen(false);
  };

  const filteredItems = reviewList.filter(item => {
    if (selectedLesson !== 'all' && item.lesson_number !== parseInt(selectedLesson)) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const m = item.clean_vietnamese || item.vietnamese;
    const k = item.clean_kana || item.kana;
    return m?.toLowerCase().includes(q) || k?.toLowerCase().includes(q) ||
      item.kanji?.toLowerCase().includes(q) || item.romaji?.toLowerCase().includes(q);
  });

  const qItem = filteredItems[qIdx];

  const openStudy = () => {
    if (!filteredItems.length) return;
    setQIdx(0); setQFlipped(false); setStudyOpen(true); sounds.playFlip();
    speakJapanese(filteredItems[0].clean_kana || filteredItems[0].kana);
  };
  const qNext = () => {
    sounds.playFlip(); setQFlipped(false);
    if (qIdx < filteredItems.length - 1) {
      const n = filteredItems[qIdx + 1];
      setQIdx(qIdx + 1);
      speakJapanese(n.clean_kana || n.kana);
    } else { setStudyOpen(false); }
  };
  const qMastered = async (id) => {
    await handleMastered(id);
    if (qIdx < filteredItems.length - 1) qNext();
    else setStudyOpen(false);
  };

  if (loading) return (
    <Container className="text-center py-5">
      <Spinner color="danger" />
      <p className="mt-2 text-muted">Đang tải danh sách ôn tập...</p>
    </Container>
  );

  const lessonNums = [...new Set(reviewList.map(v => v.lesson_number))].sort((a, b) => a - b);

  return (
    <div className="app-shell" style={{ maxWidth: '1040px' }}>

      {/* ── UNIFIED SYSTEMIC PAGE HEADER ── */}
      <div className="app-page-header">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <div className="app-header-tag" style={{ background: '#fef2f2', color: '#dc2626', borderColor: '#fca5a5' }}>
              <Flame size={13} />
              <span>CỦNG CỐ KIẾN THỨC • SPACING REPETITION</span>
            </div>
            <h1 className="app-header-title">
              Ôn Tập Từ Cần Ôn Lại
            </h1>
            <p className="app-header-subtitle">
              Tổng hợp toàn bộ các từ vựng bạn trả lời chưa đúng trong Flashcard, Trắc nghiệm hoặc Luyện gõ để củng cố phản xạ.
            </p>
          </div>

          <div className="d-flex align-items-center gap-2 flex-wrap ms-auto">
            {reviewList.length > 0 && (
              <>
                <button
                  type="button"
                  className="app-btn-primary"
                  style={{ height: '38px', padding: '0 16px', fontSize: '13px' }}
                  onClick={openStudy}
                >
                  <Layers size={14} />
                  <span>Luyện nhanh</span>
                </button>
                <button
                  type="button"
                  className="app-btn-secondary"
                  style={{ height: '38px', padding: '0 14px', fontSize: '13px', color: '#dc2626' }}
                  onClick={() => setConfirmOpen(true)}
                >
                  <Trash2 size={14} />
                  <span>Xóa tất cả</span>
                </button>
              </>
            )}
            <span className="badge rounded-pill px-3 py-2 fw-bold" style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', fontSize: '12px' }}>
              {reviewList.length} từ cần củng cố
            </span>
          </div>
        </div>

        {reviewList.length > 0 && (
          <div className="mt-3 pt-3 border-top border-slate-100 d-flex flex-wrap align-items-center justify-content-between gap-2.5">
            <div className="d-flex align-items-center gap-2">
              <Filter size={14} className="text-muted" />
              <Input
                type="select"
                value={selectedLesson}
                onChange={e => setSelectedLesson(e.target.value)}
                className="fw-bold form-select-sm rounded-pill border"
                style={{ fontSize: '12.5px', minWidth: '160px' }}
              >
                <option value="all">Tất cả bài ({reviewList.length})</option>
                {lessonNums.map(n => (
                  <option key={n} value={n}>Bài {n < 10 ? `0${n}` : n} ({reviewList.filter(v => v.lesson_number === n).length})</option>
                ))}
              </Input>
            </div>
            <div className="position-relative flex-grow-1 flex-md-grow-0" style={{ minWidth: '220px' }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <Input
                type="text"
                placeholder="Tìm trong danh sách sai..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="form-control-sm rounded-pill ps-4 border"
                style={{ fontSize: '12.5px', height: '36px' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Content ── */}
      {filteredItems.length === 0 ? (
        <div className="jlpt-card p-5 text-center">
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <CheckCircle size={36} color="#10b981" />
          </div>
          <h5 className="fw-bold text-navy-dark">
            {search || selectedLesson !== 'all' ? 'Không có từ nào khớp' : 'Không có từ nào bị sai!'}
          </h5>
          <p className="text-muted mb-4" style={{ maxWidth: 440, margin: '8px auto 20px' }}>
            {search || selectedLesson !== 'all'
              ? 'Thử thay đổi bộ lọc hoặc xóa từ khóa tìm kiếm.'
              : 'Tuyệt vời! Bạn chưa có từ nào bị sai. Hãy tiếp tục luyện tập để kiểm tra trí nhớ!'}
          </p>
          <div className="d-flex justify-content-center gap-2">
            <Button color="primary" className="fw-bold px-4 rounded-pill shadow-sm" onClick={() => onNavigate('quiz')}>
              <CheckSquare size={16} className="me-1" /> Làm trắc nghiệm
            </Button>
            <Button color="warning" className="fw-bold px-4 rounded-pill" onClick={() => onNavigate('practice')}>
              <Keyboard size={16} className="me-1" /> Luyện gõ
            </Button>
          </div>
        </div>
      ) : (
        <Row className="g-3 g-md-4">
          {filteredItems.map(item => {
            const meaning = item.clean_vietnamese || item.vietnamese;
            const kana = getEffectiveKana(item) || item.clean_kana || item.kana;
            const hasKj = Boolean(item.kanji && hasRealKanji(item.kanji));
            return (
              <Col md={6} lg={4} key={item.id}>
                <div className="app-surface-card h-100 p-3.5 d-flex flex-column justify-content-between" style={{ borderLeft: '4px solid #ef4444' }}>
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-2.5">
                      <span className="badge rounded-pill px-2.5 py-1 fw-bold" style={{ background: '#fef2f2', color: '#dc2626', fontSize: '11.5px', border: '1px solid #fecaca' }}>
                        Bài {item.lesson_number}
                      </span>
                      <button type="button" className="app-icon-btn" style={{ width: 32, height: 32 }}
                        onClick={() => speakJapanese(kana)} title="Nghe phát âm">
                        <Volume2 size={15} />
                      </button>
                    </div>

                    <div className="mb-2.5">
                      {hasKj && (
                        <div style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', fontFamily: 'Noto Sans JP,sans-serif', lineHeight: '1.2' }}>{item.kanji}</div>
                      )}
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#2563eb', fontFamily: 'Noto Sans JP,sans-serif' }}>{kana}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>[{item.romaji}]</div>
                    </div>

                    <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 14px', fontSize: '13.5px', fontWeight: 700, color: '#1e293b', marginBottom: 10, border: '1px solid #e2e8f0' }}>
                      {meaning}
                    </div>

                    {item.usage_note && (
                      <div style={{ fontSize: '11.5px', color: '#64748b', marginBottom: 8 }}>
                        <span style={{ color: '#0284c7', fontWeight: 600, marginRight: 4 }}>Ghi chú:</span>
                        {item.usage_note}
                      </div>
                    )}
                  </div>

                  <div className="pt-2.5 border-top border-slate-100 mt-2">
                    <Button color="success" size="sm" block
                      className="d-flex align-items-center justify-content-center gap-1.5 fw-bold rounded-pill shadow-xs py-1.5"
                      onClick={() => handleMastered(item.id)}>
                      <CheckCircle size={15} /> Đã Thành Thạo
                    </Button>
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>
      )}

      {/* ── Quick Study Modal ── */}
      <Modal isOpen={studyOpen} toggle={() => setStudyOpen(false)} centered className="jlpt-modal">
        <ModalHeader toggle={() => setStudyOpen(false)} className="border-0 pb-0">
          <div className="d-flex align-items-center gap-2">
            <Flame size={18} color="#ef4444" />
            <span className="fw-bold text-navy-dark">Luyện Nhanh Từ Sai ({qIdx + 1}/{filteredItems.length})</span>
          </div>
        </ModalHeader>
        <ModalBody className="p-4 text-center">
          {qItem && (
            <>
              <div className="mb-3">
                <Progress value={((qIdx + 1) / filteredItems.length) * 100} style={{ height: 4, borderRadius: 999 }}>
                  <div style={{ height: '100%', width: `${((qIdx + 1) / filteredItems.length) * 100}%`, background: '#ef4444', borderRadius: 999 }} />
                </Progress>
              </div>

              <div onClick={() => { setQFlipped(!qFlipped); sounds.playFlip(); }}
                style={{ cursor: 'pointer', minHeight: 200, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderRadius: 16, border: '1.5px solid', borderColor: qFlipped ? '#10b981' : '#fca5a5', background: qFlipped ? '#ecfdf5' : '#fff', padding: '20px 24px', marginBottom: 16, transition: 'all .3s ease' }}>
                {!qFlipped ? (
                  <>
                    {qItem.kanji && hasRealKanji(qItem.kanji) && (
                      <h2 className="zen-kanji-title mb-1">{qItem.kanji}</h2>
                    )}
                    <div className="zen-kana-sub mb-1">{getEffectiveKana(qItem)}</div>
                    <div style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic' }}>[{qItem.romaji}]</div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 12 }}><RotateCw size={12} style={{ marginRight: 4 }} />Chạm để xem nghĩa</div>
                  </>
                ) : (
                  <>
                    <h3 className="zen-meaning-display mb-1">{qItem.clean_vietnamese || qItem.vietnamese}</h3>
                    {qItem.usage_note && <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 8 }}><span style={{ color: '#0284c7', fontWeight: 600, marginRight: 4 }}>Ghi chú:</span>{qItem.usage_note}</div>}
                  </>
                )}
              </div>

              <div className="d-flex justify-content-center gap-2">
                <button type="button" style={{ background: '#eff6ff', border: 'none', borderRadius: 9, padding: '8px 12px', cursor: 'pointer' }}
                  onClick={() => speakJapanese(getEffectiveKana(qItem))}>
                  <Volume2 size={18} color="#2563eb" />
                </button>
                <Button color="success" className="rounded-pill fw-bold px-4 shadow-sm"
                  onClick={() => qMastered(qItem.id)}>
                  <CheckCircle size={16} className="me-1" /> Đã Thành Thạo
                </Button>
                <Button color="primary" className="rounded-pill fw-bold px-4" onClick={qNext}>
                  Tiếp theo <ArrowRight size={16} className="ms-1" />
                </Button>
              </div>
            </>
          )}
        </ModalBody>
      </Modal>

      {/* ── Confirm Reset ── */}
      <Modal isOpen={confirmOpen} toggle={() => setConfirmOpen(false)} centered>
        <ModalHeader toggle={() => setConfirmOpen(false)} className="border-0">
          Xác nhận xóa danh sách ôn tập
        </ModalHeader>
        <ModalBody>
          Bạn có chắc muốn xóa toàn bộ {reviewList.length} từ trong danh sách ôn tập sai không?
        </ModalBody>
        <ModalFooter className="border-0">
          <Button color="light" onClick={() => setConfirmOpen(false)}>Hủy</Button>
          <Button color="danger" className="fw-bold" onClick={handleResetAll}>Xác nhận xóa</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default ReviewWrongPage;
