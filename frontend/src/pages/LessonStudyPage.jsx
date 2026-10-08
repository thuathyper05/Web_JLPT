import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Badge,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
  Label,
  Spinner
} from 'reactstrap';
import {
  BookOpen,
  Volume2,
  Star,
  FileText,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Layers,
  CheckSquare,
  Keyboard,
  List,
  Eye,
  EyeOff,
  Search,
  Sparkles,
  Info,
  RotateCcw
} from 'lucide-react';
import { vocabService, lessonService, speakJapanese } from '../services/api';
import { useApp } from '../context/AppContext';
import { sounds } from '../services/sounds';

const LessonStudyPage = ({ selectedLesson = 1, onSelectLesson, onNavigate }) => {
  const { toggleFavorite, isFavorite, updateProgress, saveNote, getNote } = useApp();

  const [currentLessonNum, setCurrentLessonNum] = useState(selectedLesson);
  const [lessonInfo, setLessonInfo] = useState(null);
  const [vocabularies, setVocabularies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // View mode: 'step_by_step' | 'table_view'
  const [viewMode, setViewMode] = useState('step_by_step');
  const [autoPlayAudio, setAutoPlayAudio] = useState(true);

  // Filter & Search for table mode
  const [statusFilter, setStatusFilter] = useState('all');
  const [tableSearch, setTableSearch] = useState('');

  // Note Modal state
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [noteTargetVocab, setNoteTargetVocab] = useState(null);
  const [noteContent, setNoteContent] = useState('');

  // Hide/Show columns in table mode for self-testing
  const [hideMeaning, setHideMeaning] = useState(false);
  const [hideKana, setHideKana] = useState(false);

  useEffect(() => {
    setCurrentLessonNum(selectedLesson);
    setCurrentIndex(0);
  }, [selectedLesson]);

  useEffect(() => {
    const fetchLessonVocabs = async () => {
      setLoading(true);
      try {
        const [lRes, vRes] = await Promise.all([
          lessonService.getLessonById(currentLessonNum),
          vocabService.getVocabularies({ lesson: currentLessonNum })
        ]);
        setLessonInfo(lRes.data);
        setVocabularies(vRes.data);
        setCurrentIndex(0);
      } catch (err) {
        console.error('Error fetching lesson vocab:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLessonVocabs();
  }, [currentLessonNum]);

  const currentWord = vocabularies[currentIndex];

  // Auto-play audio when switching word in Step-by-Step mode
  useEffect(() => {
    if (viewMode === 'step_by_step' && currentWord && autoPlayAudio && !loading) {
      speakJapanese(currentWord.clean_kana || currentWord.kana);
    }
  }, [currentIndex, viewMode, currentWord, autoPlayAudio, loading]);

  // Keyboard navigation for Step-by-Step
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (viewMode !== 'step_by_step' || noteModalOpen) return;
      if (e.key === 'ArrowRight') handleNextWord();
      if (e.key === 'ArrowLeft') handlePrevWord();
      if (e.key === ' ' && currentWord) {
        e.preventDefault();
        speakJapanese(currentWord.clean_kana || currentWord.kana);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, vocabularies, viewMode, noteModalOpen, currentWord]);

  const handleNextWord = () => {
    sounds.playFlip();
    if (currentIndex < vocabularies.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevWord = () => {
    sounds.playFlip();
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const openNoteModal = (vocab) => {
    setNoteTargetVocab(vocab);
    setNoteContent(getNote(vocab.id, vocab.user_note));
    setNoteModalOpen(true);
  };

  const handleSaveNote = async () => {
    if (noteTargetVocab) {
      sounds.playCorrect();
      await saveNote(noteTargetVocab.id, noteContent);
      setVocabularies(prev => prev.map(v => v.id === noteTargetVocab.id ? { ...v, user_note: noteContent } : v));
    }
    setNoteModalOpen(false);
  };

  const handleStatusChange = async (status) => {
    if (!currentWord) return;
    if (status === 'mastered') sounds.playCorrect();
    else if (status === 'needs_review') sounds.playWrong();
    else sounds.playFlip();

    await updateProgress(currentWord.id, status, status === 'mastered');
    setVocabularies(prev => prev.map(v => v.id === currentWord.id ? { ...v, user_status: status } : v));
  };

  const filteredTableVocabs = vocabularies.filter(v => {
    if (statusFilter !== 'all' && v.user_status !== statusFilter) return false;
    if (tableSearch.trim()) {
      const q = tableSearch.toLowerCase();
      const cleanM = v.clean_vietnamese || v.vietnamese;
      const cleanK = v.clean_kana || v.kana;
      return (
        cleanM?.toLowerCase().includes(q) ||
        cleanK?.toLowerCase().includes(q) ||
        v.kanji?.toLowerCase().includes(q) ||
        v.romaji?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner color="primary" />
        <p className="mt-2 text-muted small">Đang tải nội dung Bài {currentLessonNum}...</p>
      </Container>
    );
  }

  return (
    <Container className="py-3 py-md-4">
      {/* ── Top Header & Mode Navigation ── */}
      <div className="page-header-box mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <div
              className="d-flex align-items-center justify-content-center rounded-3 text-white shadow-sm flex-shrink-0"
              style={{
                width: '46px',
                height: '46px',
                background: 'linear-gradient(135deg, #1e3a8a, #2563eb)'
              }}
            >
              <BookOpen size={24} />
            </div>
            <div>
              <h5 className="fw-bold mb-0 text-navy-dark">
                Bài {currentLessonNum < 10 ? `0${currentLessonNum}` : currentLessonNum}: {lessonInfo?.title}
              </h5>
              <small className="text-muted">
                {vocabularies.length} từ vựng chuẩn Minna no Nihongo N5
              </small>
            </div>
          </div>

          {/* Quick Learning Shortcuts */}
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <Button
              color="light"
              size="sm"
              className="rounded-pill px-3 py-1.5 fw-semibold border text-primary shadow-xs"
              onClick={() => onNavigate('flashcard')}
              title="Luyện Flashcard 3D"
            >
              <Layers size={14} className="me-1" /> Flashcard
            </Button>
            <Button
              color="light"
              size="sm"
              className="rounded-pill px-3 py-1.5 fw-semibold border text-danger shadow-xs"
              onClick={() => onNavigate('quiz')}
              title="Làm trắc nghiệm ABCD"
            >
              <CheckSquare size={14} className="me-1" /> Trắc nghiệm
            </Button>
            <Button
              color="light"
              size="sm"
              className="rounded-pill px-3 py-1.5 fw-semibold border text-warning shadow-xs text-dark"
              onClick={() => onNavigate('practice')}
              title="Luyện gõ không gợi ý"
            >
              <Keyboard size={14} className="me-1" /> Luyện gõ
            </Button>
          </div>
        </div>

        {/* Lesson Switcher & View Mode Selector */}
        <div className="mt-3 pt-3 border-top d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <span className="small text-muted fw-bold">Chuyển bài:</span>
            <Input
              type="select"
              value={currentLessonNum}
              onChange={(e) => {
                const nextL = parseInt(e.target.value);
                setCurrentLessonNum(nextL);
                if (onSelectLesson) onSelectLesson(nextL);
              }}
              className="w-auto fw-bold form-control-sm rounded-pill"
            >
              {Array.from({ length: 25 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  Bài {n < 10 ? `0${n}` : n}
                </option>
              ))}
            </Input>
          </div>

          <div className="d-flex align-items-center gap-2">
            {viewMode === 'step_by_step' && (
              <Button
                color="light"
                size="sm"
                onClick={() => setAutoPlayAudio(!autoPlayAudio)}
                className={`rounded-pill px-2.5 py-1 border small ${
                  autoPlayAudio ? 'text-primary fw-bold' : 'text-muted'
                }`}
                title="Tự động phát âm khi chuyển từ"
              >
                🔊 Tự phát âm: {autoPlayAudio ? 'Bật' : 'Tắt'}
              </Button>
            )}

            <div className="segmented-control">
              <button
                type="button"
                onClick={() => setViewMode('step_by_step')}
                className={`segmented-item ${viewMode === 'step_by_step' ? 'active' : ''}`}
              >
                <span>📖 Từng từ</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table_view')}
                className={`segmented-item ${viewMode === 'table_view' ? 'active' : ''}`}
              >
                <span>📋 Toàn bộ bảng</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MODE 1: STEP-BY-STEP WORD CARD ── */}
      {viewMode === 'step_by_step' && currentWord && (
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div className="d-flex justify-content-between align-items-center mb-2 px-1 text-muted small">
            <span>Từ số {currentIndex + 1} / {vocabularies.length}</span>
            <span className="d-none d-sm-inline">Dùng phím mũi tên <strong>Trái / Phải</strong> hoặc <strong>Phím Cách</strong></span>
          </div>

          <Card className="jlpt-card border-0 shadow-sm p-4 p-md-5 rounded-4 mb-3 position-relative">
            {/* Top Tools */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <Badge color="primary" pill className="px-3 py-1.5 fw-bold">
                Bài {currentLessonNum} • #{currentWord.order_num || currentIndex + 1}
              </Badge>

              <div className="d-flex align-items-center gap-1.5">
                <Button
                  color="light"
                  size="sm"
                  className="rounded-circle border p-2 text-warning"
                  onClick={() => toggleFavorite(currentWord)}
                  title="Đánh dấu yêu thích"
                >
                  <Star size={17} fill={isFavorite(currentWord.id, currentWord.is_favorite) ? '#f59e0b' : 'transparent'} />
                </Button>
                <Button
                  color="light"
                  size="sm"
                  className="rounded-circle border p-2 text-info"
                  onClick={() => openNoteModal(currentWord)}
                  title="Ghi chú cá nhân"
                >
                  <FileText size={17} />
                </Button>
              </div>
            </div>

            {/* Main Word Display */}
            <div className="text-center my-3">
              {currentWord.kanji && currentWord.kanji !== '–' && currentWord.kanji !== '-' && (
                <h1 className="fw-black text-navy-dark display-5 font-monospace mb-1 tracking-tight">
                  {currentWord.kanji}
                </h1>
              )}

              <div className="d-flex align-items-center justify-content-center gap-2 mb-1">
                <h2 className="text-primary fw-bold display-6 mb-0 font-monospace">
                  {currentWord.clean_kana || currentWord.kana}
                </h2>
                <Button
                  color="light"
                  size="sm"
                  className="p-1.5 rounded-circle border text-primary audio-btn"
                  onClick={() => speakJapanese(currentWord.clean_kana || currentWord.kana)}
                  title="Nghe phát âm chuẩn Tokyo"
                >
                  <Volume2 size={20} />
                </Button>
              </div>

              <div className="text-muted fst-italic small mb-4">
                [{currentWord.romaji}]
              </div>

              {/* Clean Vietnamese Meaning */}
              <div
                className="p-3 rounded-3 fw-bold text-dark fs-5 mb-3"
                style={{ background: 'var(--slate-50)', border: '1px solid var(--slate-200)' }}
              >
                {currentWord.clean_vietnamese || currentWord.vietnamese}
              </div>

              {/* Usage Note Callout */}
              {currentWord.usage_note && (
                <div
                  className="p-3 rounded-3 text-start small mb-3"
                  style={{ background: 'var(--warning-subtle)', border: '1px solid var(--warning-border)', color: '#92400e' }}
                >
                  <div className="d-flex align-items-center gap-1 fw-bold mb-1">
                    <Info size={14} /> Chú thích ngữ pháp & ngữ cảnh:
                  </div>
                  <div>{currentWord.usage_note}</div>
                </div>
              )}

              {/* Personal Note Callout */}
              {(currentWord.user_note || getNote(currentWord.id)) && (
                <div
                  className="p-2.5 rounded-3 text-start small mb-3"
                  style={{ background: 'var(--info-subtle)', border: '1px solid var(--info-border)', color: '#0369a1' }}
                >
                  📝 <strong>Ghi chú của bạn:</strong> {currentWord.user_note || getNote(currentWord.id)}
                </div>
              )}
            </div>

            {/* Status Memory Assessment Bar */}
            <div className="pt-3 border-top text-center">
              <span className="small text-muted d-block mb-2 fw-semibold">Đánh giá ghi nhớ:</span>
              <div className="d-flex justify-content-center gap-2">
                <Button
                  color={currentWord.user_status === 'needs_review' ? 'danger' : 'light'}
                  size="sm"
                  className={`rounded-pill px-3 py-1.5 fw-bold border ${
                    currentWord.user_status === 'needs_review' ? 'text-white shadow-xs' : 'text-danger'
                  }`}
                  onClick={() => handleStatusChange('needs_review')}
                >
                  <XCircle size={14} className="me-1" /> Chưa nhớ
                </Button>
                <Button
                  color={currentWord.user_status === 'learning' ? 'warning' : 'light'}
                  size="sm"
                  className={`rounded-pill px-3 py-1.5 fw-bold border ${
                    currentWord.user_status === 'learning' ? 'text-dark shadow-xs' : 'text-secondary'
                  }`}
                  onClick={() => handleStatusChange('learning')}
                >
                  <HelpCircle size={14} className="me-1" /> Đang học
                </Button>
                <Button
                  color={currentWord.user_status === 'mastered' ? 'success' : 'light'}
                  size="sm"
                  className={`rounded-pill px-3 py-1.5 fw-bold border ${
                    currentWord.user_status === 'mastered' ? 'text-white shadow-xs' : 'text-success'
                  }`}
                  onClick={() => handleStatusChange('mastered')}
                >
                  <CheckCircle2 size={14} className="me-1" /> Đã thuộc
                </Button>
              </div>
            </div>
          </Card>

          {/* Navigation Controls */}
          <div className="d-flex justify-content-between align-items-center">
            <Button
              color="light"
              className="rounded-pill px-4 py-2 fw-bold border shadow-xs d-flex align-items-center gap-1.5"
              disabled={currentIndex === 0}
              onClick={handlePrevWord}
            >
              <ChevronLeft size={16} />
              <span>Từ trước</span>
            </Button>

            <span className="fw-bold small text-muted">
              {currentIndex + 1} / {vocabularies.length}
            </span>

            <Button
              color="primary"
              className="rounded-pill px-4 py-2 fw-bold shadow-xs d-flex align-items-center gap-1.5"
              disabled={currentIndex === vocabularies.length - 1}
              onClick={handleNextWord}
            >
              <span>Từ tiếp theo</span>
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* ── MODE 2: TABLE LIST VIEW ── */}
      {viewMode === 'table_view' && (
        <Card className="jlpt-card border-0 shadow-sm rounded-4">
          <CardBody className="p-3">
            {/* Filter and Search Bar */}
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <Button
                  color={hideMeaning ? 'warning' : 'light'}
                  size="sm"
                  onClick={() => setHideMeaning(!hideMeaning)}
                  className={`rounded-pill border small ${hideMeaning ? 'fw-bold text-dark' : 'text-muted'}`}
                >
                  {hideMeaning ? <EyeOff size={14} className="me-1" /> : <Eye size={14} className="me-1" />}
                  {hideMeaning ? 'Đang che nghĩa' : 'Che nghĩa tự kiểm tra'}
                </Button>
                <Button
                  color={hideKana ? 'warning' : 'light'}
                  size="sm"
                  onClick={() => setHideKana(!hideKana)}
                  className={`rounded-pill border small ${hideKana ? 'fw-bold text-dark' : 'text-muted'}`}
                >
                  {hideKana ? <EyeOff size={14} className="me-1" /> : <Eye size={14} className="me-1" />}
                  {hideKana ? 'Đang che Kana' : 'Che cách đọc'}
                </Button>
              </div>

              <div className="position-relative">
                <Input
                  type="text"
                  placeholder="Tìm từ trong bài..."
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  className="form-control-sm rounded-pill pe-4"
                  style={{ minWidth: '220px' }}
                />
                <Search size={14} className="position-absolute top-50 end-0 translate-middle-y me-2 text-muted" />
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '50px' }} className="text-center">STT</th>
                    <th style={{ width: '160px' }}>Chữ Hán (Kanji)</th>
                    <th style={{ minWidth: '180px' }}>Cách đọc (Kana)</th>
                    <th style={{ minWidth: '240px' }}>Nghĩa Tiếng Việt</th>
                    <th style={{ width: '70px' }} className="text-center">Nghe</th>
                    <th style={{ width: '60px' }} className="text-center">Lưu</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTableVocabs.map((item, idx) => {
                    const cleanMeaning = item.clean_vietnamese || item.vietnamese;
                    const cleanK = item.clean_kana || item.kana;
                    const fav = isFavorite(item.id, item.is_favorite);

                    return (
                      <tr key={item.id}>
                        <td className="text-center text-muted small">{idx + 1}</td>
                        <td className="fw-bold fs-5 text-navy-dark font-monospace">
                          {item.kanji && item.kanji !== '–' && item.kanji !== '-' ? item.kanji : '—'}
                        </td>
                        <td>
                          {hideKana ? (
                            <span className="badge bg-secondary opacity-50 px-3 py-1 cursor-pointer">
                              Nhấn để xem
                            </span>
                          ) : (
                            <div>
                              <span className="fw-bold text-primary fs-6 font-monospace">{cleanK}</span>
                              <small className="text-muted d-block fst-italic">[{item.romaji}]</small>
                            </div>
                          )}
                        </td>
                        <td>
                          {hideMeaning ? (
                            <span className="badge bg-secondary opacity-50 px-3 py-1 cursor-pointer">
                              Nhấn để xem
                            </span>
                          ) : (
                            <div>
                              <span className="fw-bold text-dark">{cleanMeaning}</span>
                              {item.usage_note && (
                                <small className="text-muted d-block mt-1" style={{ fontSize: '11px' }}>
                                  💡 {item.usage_note}
                                </small>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="text-center">
                          <Button
                            color="light"
                            size="sm"
                            className="p-1.5 rounded-circle border text-primary audio-btn"
                            onClick={() => speakJapanese(cleanK)}
                            title="Nghe phát âm"
                          >
                            <Volume2 size={15} />
                          </Button>
                        </td>
                        <td className="text-center">
                          <Button
                            color="light"
                            size="sm"
                            className="p-1.5 rounded-circle border text-warning"
                            onClick={() => toggleFavorite(item)}
                            title="Lưu yêu thích"
                          >
                            <Star size={15} fill={fav ? '#f59e0b' : 'transparent'} />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}

      {/* ── Note Editor Modal ── */}
      <Modal isOpen={noteModalOpen} toggle={() => setNoteModalOpen(false)} centered className="jlpt-modal">
        <ModalHeader toggle={() => setNoteModalOpen(false)} className="border-0 pb-1">
          <div className="d-flex align-items-center gap-2">
            <FileText size={18} className="text-primary" />
            <span className="fw-bold text-navy-dark">
              Ghi chú: {noteTargetVocab?.clean_kana || noteTargetVocab?.kana}
            </span>
          </div>
        </ModalHeader>
        <ModalBody className="pt-2 pb-0">
          <FormGroup>
            <Label className="small text-muted fw-bold">Mẹo nhớ, ví dụ và ngữ cảnh của bạn:</Label>
            <Input
              type="textarea"
              rows={4}
              placeholder="VD: Lưu ý trợ từ ni, hay dùng trong câu xin phép..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              className="rounded-3"
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter className="border-0 pt-2">
          <Button color="light" size="sm" onClick={() => setNoteModalOpen(false)}>Hủy</Button>
          <Button color="primary" size="sm" className="fw-bold px-3" onClick={handleSaveNote}>Lưu ghi chú</Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
};

export default LessonStudyPage;
