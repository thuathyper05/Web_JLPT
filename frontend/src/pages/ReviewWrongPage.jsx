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
    <Container className="py-3 py-md-4">

      {/* ── Header ── */}
      <div className="page-header-box mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#ef4444,#f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(239,68,68,.28)' }}>
              <Flame size={26} color="#fff" />
            </div>
            <div>
              <h4 className="fw-bold mb-0 text-navy-dark" style={{ fontSize: 18 }}>Ôn Tập Từ Chưa Nhớ</h4>
              <p className="text-muted small mb-0">Từ bị sai trong Flashcard, Trắc nghiệm hoặc Luyện gõ</p>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2 flex-wrap">
            {reviewList.length > 0 && (
              <>
                <Button color="primary" size="sm" className="rounded-pill px-3 fw-bold d-flex align-items-center gap-1 shadow-sm"
                  onClick={openStudy}>
                  <Layers size={15} /> Luyện nhanh
                </Button>
                <Button color="light" size="sm" className="rounded-pill px-3 fw-semibold d-flex align-items-center gap-1"
                  style={{ border: '1px solid #fca5a5', color: '#dc2626' }}
                  onClick={() => setConfirmOpen(true)}>
                  <Trash2 size={14} /> Xóa tất cả
                </Button>
              </>
            )}
            <span style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 999, padding: '4px 12px', fontSize: 13, fontWeight: 700, color: '#991b1b' }}>
              {reviewList.length} từ cần củng cố
            </span>
          </div>
        </div>

        {reviewList.length > 0 && (
          <div className="mt-3 pt-3 border-top d-flex flex-wrap align-items-center gap-2">
            <div className="d-flex align-items-center gap-2">
              <Filter size={14} className="text-muted" />
              <Input type="select" value={selectedLesson} onChange={e => setSelectedLesson(e.target.value)}
                className="fw-bold w-auto" style={{ fontSize: 13, borderRadius: 9, padding: '5px 8px' }}>
                <option value="all">Tất cả bài ({reviewList.length})</option>
                {lessonNums.map(n => (
                  <option key={n} value={n}>Bài {n < 10 ? `0${n}` : n} ({reviewList.filter(v => v.lesson_number === n).length})</option>
                ))}
              </Input>
            </div>
            <div className="position-relative ms-auto">
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <Input type="text" placeholder="Tìm trong danh sách sai..." value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: 32, borderRadius: 999, fontSize: 13, minWidth: 200 }} />
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
            {search || selectedLesson !== 'all' ? 'Không có từ nào khớp' : 'Không có từ nào bị sai! 🎉'}
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
        <Row className="g-3">
          {filteredItems.map(item => {
            const meaning = item.clean_vietnamese || item.vietnamese;
            const kana = item.clean_kana || item.kana;
            return (
              <Col md={6} lg={4} key={item.id}>
                <Card className="review-card h-100 shadow-sm" style={{ borderRadius: 12, borderLeft: '4px solid #ef4444', border: '1px solid #fee2e2' }}>
                  <CardBody className="p-3 d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span style={{ background: '#fef2f2', color: '#dc2626', fontSize: 11.5, fontWeight: 700, borderRadius: 999, padding: '3px 10px' }}>
                          Bài {item.lesson_number}
                        </span>
                        <button type="button" style={{ background: '#eff6ff', border: 'none', borderRadius: 8, padding: '5px 7px', cursor: 'pointer' }}
                          onClick={() => speakJapanese(kana)} title="Nghe phát âm">
                          <Volume2 size={14} color="#2563eb" />
                        </button>
                      </div>

                      <div className="mb-2">
                        {item.kanji && item.kanji !== '–' && item.kanji !== '-' && (
                          <div style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', fontFamily: 'Noto Sans JP,sans-serif' }}>{item.kanji}</div>
                        )}
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#2563eb', fontFamily: 'Noto Sans JP,sans-serif' }}>{kana}</div>
                        <div style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>[{item.romaji}]</div>
                      </div>

                      <div style={{ background: '#f8fafc', borderRadius: 10, padding: '8px 12px', fontSize: 13.5, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>
                        {meaning}
                      </div>

                      {item.usage_note && (
                        <div style={{ fontSize: 11.5, color: '#64748b' }}>💡 {item.usage_note}</div>
                      )}
                    </div>

                    <div className="pt-2 border-top mt-2">
                      <Button color="success" size="sm" block
                        className="d-flex align-items-center justify-content-center gap-1 fw-bold rounded-pill shadow-sm"
                        onClick={() => handleMastered(item.id)}>
                        <CheckCircle size={14} /> Đã thuộc từ này
                      </Button>
                    </div>
                  </CardBody>
                </Card>
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
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', marginBottom: 10 }}>TIẾNG NHẬT</span>
                    {qItem.kanji && qItem.kanji !== '–' && (
                      <div style={{ fontSize: 36, fontWeight: 900, color: '#0f172a', fontFamily: 'Noto Sans JP,sans-serif' }}>{qItem.kanji}</div>
                    )}
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#2563eb', fontFamily: 'Noto Sans JP,sans-serif' }}>{qItem.clean_kana || qItem.kana}</div>
                    <div style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic' }}>[{qItem.romaji}]</div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 10 }}><RotateCw size={12} style={{ marginRight: 4 }} />Chạm để xem nghĩa</div>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#059669', marginBottom: 10 }}>NGHĨA TIẾNG VIỆT</span>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#065f46' }}>{qItem.clean_vietnamese || qItem.vietnamese}</div>
                    {qItem.usage_note && <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 8 }}>💡 {qItem.usage_note}</div>}
                  </>
                )}
              </div>

              <div className="d-flex justify-content-center gap-2">
                <button type="button" style={{ background: '#eff6ff', border: 'none', borderRadius: 9, padding: '8px 12px', cursor: 'pointer' }}
                  onClick={() => speakJapanese(qItem.clean_kana || qItem.kana)}>
                  <Volume2 size={18} color="#2563eb" />
                </button>
                <Button color="success" className="rounded-pill fw-bold px-4 shadow-sm"
                  onClick={() => qMastered(qItem.id)}>
                  <CheckCircle size={16} className="me-1" /> Đã thuộc
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
    </Container>
  );
};

export default ReviewWrongPage;
