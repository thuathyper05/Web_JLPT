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
  VolumeX,
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
import { awardGardenWater } from '../services/gardenRewards';
import { sounds } from '../services/sounds';

const hasRealKanji = (str) => /[\u4E00-\u9FAF\u3400-\u4DBF]/.test(str || '');

const LessonStudyPage = ({ selectedLesson = 1, onSelectLesson, onNavigate }) => {
  const { toggleFavorite, isFavorite, updateProgress, saveNote, getNote } = useApp();

  const [currentLessonNum, setCurrentLessonNum] = useState(selectedLesson);
  const [lessonInfo, setLessonInfo] = useState(null);
  const [vocabularies, setVocabularies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [wordAnim, setWordAnim] = useState('');
  const [floatingXp, setFloatingXp] = useState(false);

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
        const rawVocabs = Array.isArray(vRes.data) ? vRes.data : (vRes.data?.data || []);

        let guestProg = {};
        try {
          const raw = localStorage.getItem('guest_progress');
          if (raw) guestProg = JSON.parse(raw);
        } catch {}

        const mergedVocabs = rawVocabs.map(v => {
          const g = guestProg[v.id];
          return {
            ...v,
            user_status: g?.status || v.user_status || 'learning'
          };
        });

        setVocabularies(mergedVocabs);
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
    if (currentIndex < vocabularies.length - 1) {
      sounds.playFlip();
      setWordAnim('slide-next');
      setCurrentIndex(prev => prev + 1);
      setTimeout(() => setWordAnim(''), 300);
    }
  };

  const handlePrevWord = () => {
    if (currentIndex > 0) {
      sounds.playFlip();
      setWordAnim('slide-prev');
      setCurrentIndex(prev => prev - 1);
      setTimeout(() => setWordAnim(''), 300);
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

  const [isRatingLocked, setIsRatingLocked] = useState(false);

  const handleStatusChange = (status) => {
    if (!currentWord || isRatingLocked) return;
    setIsRatingLocked(true);

    if (status === 'mastered') {
      sounds.playCorrect();
      setFloatingXp(true);
      setTimeout(() => setFloatingXp(false), 850);
    } else if (status === 'needs_review') {
      sounds.playWrong();
    } else {
      sounds.playFlip();
    }

    // Optimistic local update
    setVocabularies(prev => prev.map(v => v.id === currentWord.id ? { ...v, user_status: status } : v));

    // Background server sync without blocking UI
    updateProgress(currentWord.id, status, status === 'mastered').catch(() => {});
    if (typeof awardGardenWater === 'function') {
      awardGardenWater(2, 'Học từ vựng bài học', [currentWord]);
    }

    // In step-by-step mode, smoothly auto-advance to next word with fluid animation
    setWordAnim('slide-next');
    setTimeout(() => {
      if (viewMode === 'step_by_step' && currentIndex < vocabularies.length - 1) {
        sounds.playFlip();
        setCurrentIndex(prev => prev + 1);
      }
      setIsRatingLocked(false);
      setTimeout(() => setWordAnim(''), 120);
    }, 280);
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
    <div className="app-shell" style={{ maxWidth: '1040px' }}>
      {/* ── 1. UNIFIED SYSTEMIC PAGE HEADER ── */}
      <div className="app-page-header">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3 pb-1">
          <div>
            <div className="app-header-tag">
              <BookOpen size={13} />
              <span>MINNA NO NIHONGO • BÀI {currentLessonNum < 10 ? `0${currentLessonNum}` : currentLessonNum}</span>
            </div>
            <h1 className="app-header-title">
              Bài {currentLessonNum}: {lessonInfo?.title || 'Từ vựng & Mẫu câu'}
            </h1>
            <p className="app-header-subtitle">
              Trọn bộ {vocabularies.length} từ vựng Minna no Nihongo tích hợp phát âm chuẩn Tokyo và ngữ cảnh thực tế.
            </p>
          </div>

          {/* Quick Lesson Switcher Dropdown */}
          <div className="d-flex align-items-center gap-2 flex-shrink-0 ms-auto">
            <span className="small text-muted fw-semibold" style={{ fontSize: '12px' }}>
              Chọn bài:
            </span>
            <Input
              type="select"
              value={currentLessonNum}
              onChange={(e) => {
                const nextL = parseInt(e.target.value);
                setCurrentLessonNum(nextL);
                if (onSelectLesson) onSelectLesson(nextL);
              }}
              className="form-select-sm rounded-pill fw-bold border py-1.5 px-3 shadow-xs"
              style={{
                width: 'auto',
                minWidth: '110px',
                fontSize: '13px',
                background: '#ffffff',
                borderColor: '#cbd5e1'
              }}
            >
              {Array.from({ length: 25 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  Bài {n < 10 ? `0${n}` : n}
                </option>
              ))}
            </Input>
          </div>
        </div>

        {/* Row 3: Action Toolbar (Streamlined & 100% Responsive) */}
        <div className="d-flex justify-content-between align-items-center gap-3 pt-3 border-top border-slate-200 border-opacity-70 flex-wrap">
          {/* Segmented View Mode & Audio Toggle */}
          <div className="d-flex align-items-center gap-2 flex-nowrap">
            <div className="segmented-control" style={{ padding: '2px' }}>
              <button
                type="button"
                onClick={() => setViewMode('step_by_step')}
                className={`segmented-item py-1 px-2.5 ${viewMode === 'step_by_step' ? 'active' : ''}`}
                style={{ fontSize: '12px' }}
              >
                <span className="d-inline-flex align-items-center gap-1"><BookOpen size={13} /> Từng từ</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table_view')}
                className={`segmented-item py-1 px-2.5 ${viewMode === 'table_view' ? 'active' : ''}`}
                style={{ fontSize: '12px' }}
              >
                <span className="d-inline-flex align-items-center gap-1"><List size={13} /> Danh sách</span>
              </button>
            </div>

            {viewMode === 'step_by_step' && (
              <button
                type="button"
                onClick={() => setAutoPlayAudio(!autoPlayAudio)}
                className={`btn btn-sm rounded-pill border py-1 px-2.5 flex-shrink-0 ${
                  autoPlayAudio ? 'btn-primary text-white' : 'btn-light text-muted'
                }`}
                style={{ fontSize: '11.5px', whiteSpace: 'nowrap' }}
                title="Tự động phát âm giọng Tokyo khi chuyển từ"
              >
                {autoPlayAudio ? (
                  <span className="d-inline-flex align-items-center gap-1"><Volume2 size={13} /> Bật</span>
                ) : (
                  <span className="d-inline-flex align-items-center gap-1"><VolumeX size={13} /> Tắt</span>
                )}
              </button>
            )}
          </div>

          {/* Quick Learning Links (Desktop/Tablet only) */}
          <div className="d-none d-md-flex align-items-center gap-2 ms-auto">
            <button
              type="button"
              className="btn btn-sm btn-light border rounded-pill px-3 py-1 fw-semibold text-primary d-inline-flex align-items-center gap-1.5 hover-lift shadow-xs"
              onClick={() => onNavigate('flashcard')}
              style={{ fontSize: '12px' }}
              title="Luyện Flashcard 3D"
            >
              <Layers size={13} />
              <span>Flashcard</span>
            </button>
            <button
              type="button"
              className="btn btn-sm btn-light border rounded-pill px-3 py-1 fw-semibold text-danger d-inline-flex align-items-center gap-1.5 hover-lift shadow-xs"
              onClick={() => onNavigate('quiz')}
              style={{ fontSize: '12px' }}
              title="Làm trắc nghiệm ABCD"
            >
              <CheckSquare size={13} />
              <span>Trắc nghiệm</span>
            </button>
            <button
              type="button"
              className="btn btn-sm btn-light border rounded-pill px-3 py-1 fw-semibold text-dark d-inline-flex align-items-center gap-1.5 hover-lift shadow-xs"
              onClick={() => onNavigate('practice')}
              style={{ fontSize: '12px' }}
              title="Luyện gõ phản xạ"
            >
              <Keyboard size={13} />
              <span>Luyện gõ</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── MODE 1: STEP-BY-STEP WORD CARD ── */}
      {viewMode === 'step_by_step' && currentWord && (
        <div style={{ maxWidth: '640px', margin: '0 auto', width: '100%' }}>
          <div className="d-flex justify-content-between align-items-center mb-2.5 px-1 text-muted small w-100">
            <span>Từ số {currentIndex + 1} / {vocabularies.length}</span>
            <span className="d-none d-sm-inline">Dùng phím mũi tên <strong>Trái / Phải</strong> hoặc <strong>Phím Cách</strong></span>
          </div>

          <div className={`app-surface-card p-3.5 p-sm-4 p-md-5 mb-4 position-relative overflow-hidden ${wordAnim ? `word-card-${wordAnim}` : ''}`} style={{ width: '100%', maxWidth: '100%' }}>
            {/* Floating +10 XP badge */}
            {floatingXp && (
              <div className="floating-xp-badge">
                +10 XP · Đã Thành Thạo!
              </div>
            )}
            {/* Top Tools */}
            <div className="d-flex justify-content-between align-items-center mb-2.5 w-100">
              <Badge color="primary" pill className="px-2.5 py-1 fw-bold" style={{ fontSize: '11.5px' }}>
                Bài {currentLessonNum} • #{currentWord.order_num || currentIndex + 1}
              </Badge>

              <div className="d-flex align-items-center gap-1">
                <Button
                  color="light"
                  size="sm"
                  className="rounded-circle border p-1 text-warning d-flex align-items-center justify-content-center"
                  style={{ width: 32, height: 32 }}
                  onClick={() => toggleFavorite(currentWord)}
                  title="Đánh dấu yêu thích"
                >
                  <Star size={15} fill={isFavorite(currentWord.id, currentWord.is_favorite) ? '#f59e0b' : 'transparent'} />
                </Button>
                <Button
                  color="light"
                  size="sm"
                  className="rounded-circle border p-1 text-info d-flex align-items-center justify-content-center"
                  style={{ width: 32, height: 32 }}
                  onClick={() => openNoteModal(currentWord)}
                  title="Ghi chú cá nhân"
                >
                  <FileText size={15} />
                </Button>
              </div>
            </div>

              {/* Main Word Display */}
              <div className="text-center my-2 my-md-3 w-100 overflow-hidden">
                {currentWord.kanji && hasRealKanji(currentWord.kanji) ? (
                  <h1 className="zen-kanji-title mb-1.5">
                    {currentWord.kanji}
                  </h1>
                ) : (
                  <h1
                    className="zen-kanji-title mb-1.5 font-monospace"
                    style={{
                      fontSize: 'clamp(2rem, 7vw, 3.2rem)',
                      color: /[\u30A0-\u30FF]/.test(currentWord.clean_kana || currentWord.kana || currentWord.kanji || '') ? '#b45309' : '#0f172a'
                    }}
                  >
                    {(!hasRealKanji(currentWord.kanji) && /[\u30A0-\u30FF]/.test(currentWord.kanji || ''))
                      ? currentWord.kanji
                      : (currentWord.clean_kana || currentWord.kana)}
                  </h1>
                )}

                <div className="d-flex align-items-center justify-content-center gap-2 mb-1.5 flex-wrap">
                  {currentWord.kanji && hasRealKanji(currentWord.kanji) ? (
                    <div className="zen-kana-sub font-monospace text-center">
                      {currentWord.clean_kana || currentWord.kana}
                    </div>
                  ) : /[\u30A0-\u30FF]/.test(currentWord.clean_kana || currentWord.kana || currentWord.kanji || '') ? (
                    <span className="badge bg-amber-50 text-amber-800 border border-amber-200 fw-bold px-2.5 py-1" style={{ fontSize: '11px' }}>
                      Từ mượn Katakana
                    </span>
                  ) : null}
                  <Button
                    color="light"
                    size="sm"
                    className="p-1 rounded-circle border text-primary audio-btn d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: 34, height: 34 }}
                    onClick={() => speakJapanese((!hasRealKanji(currentWord.kanji) && /[\u30A0-\u30FF]/.test(currentWord.kanji || '')) ? currentWord.kanji : (currentWord.clean_kana || currentWord.kana))}
                    title="Nghe phát âm chuẩn Tokyo"
                  >
                    <Volume2 size={16} />
                  </Button>
                </div>

              {/* Clean Vietnamese Meaning */}
              <div
                className="p-2.5 p-md-3 rounded-3 fw-bold text-dark mb-2.5 zen-meaning-display"
                style={{
                  background: 'var(--slate-50)',
                  border: '1px solid var(--slate-200)',
                  wordBreak: 'break-word',
                  overflowWrap: 'anywhere'
                }}
              >
                {currentWord.clean_vietnamese || currentWord.vietnamese}
              </div>

              {/* Usage Note Callout */}
              {currentWord.usage_note && (
                <div
                  className="p-2.5 rounded-3 text-start small mb-2.5"
                  style={{
                    background: 'var(--warning-subtle)',
                    border: '1px solid var(--warning-border)',
                    color: '#92400e',
                    fontSize: '11.5px',
                    wordBreak: 'break-word',
                    overflowWrap: 'anywhere'
                  }}
                >
                  <div className="d-flex align-items-center gap-1 fw-bold mb-0.5">
                    <Info size={13} className="flex-shrink-0" /> Chú thích:
                  </div>
                  <div>{currentWord.usage_note}</div>
                </div>
              )}

              {/* Personal Note Callout */}
              {(currentWord.user_note || getNote(currentWord.id)) && (
                <div
                  className="p-2 rounded-3 text-start small mb-2.5"
                  style={{
                    background: 'var(--info-subtle)',
                    border: '1px solid var(--info-border)',
                    color: '#0369a1',
                    fontSize: '11.5px',
                    wordBreak: 'break-word',
                    overflowWrap: 'anywhere'
                  }}
                >
                  <span className="d-inline-flex align-items-center gap-1 fw-bold me-1">
                    <FileText size={13} className="text-primary" /> Ghi chú:
                  </span>
                  {currentWord.user_note || getNote(currentWord.id)}
                </div>
              )}
            </div>

            {/* Status Memory Assessment Bar */}
            <div className="pt-2.5 border-top text-center w-100">
              <span className="small text-muted d-block mb-1.5 fw-semibold" style={{ fontSize: '11px' }}>Đánh giá ghi nhớ:</span>
              <div className="d-flex justify-content-between align-items-center gap-1 gap-sm-2 w-100" style={{ minWidth: 0 }}>
                <Button
                  color={currentWord.user_status === 'needs_review' ? 'danger' : 'light'}
                  size="sm"
                  disabled={isRatingLocked}
                  className={`flex-fill rounded-pill py-1.5 px-1 px-sm-2 fw-bold border d-flex align-items-center justify-content-center ${
                    currentWord.user_status === 'needs_review' ? 'text-white shadow-xs' : 'text-danger'
                  } ${isRatingLocked ? 'opacity-75 pe-none' : ''}`}
                  style={{ fontSize: 'clamp(10.5px, 2.9vw, 12px)', minWidth: 0 }}
                  onClick={() => handleStatusChange('needs_review')}
                >
                  <XCircle size={12} className="me-1 flex-shrink-0" />
                  <span className="text-truncate">Cần Ôn Lại</span>
                </Button>
                <Button
                  color={currentWord.user_status === 'learning' ? 'warning' : 'light'}
                  size="sm"
                  disabled={isRatingLocked}
                  className={`flex-fill rounded-pill py-1.5 px-1 px-sm-2 fw-bold border d-flex align-items-center justify-content-center ${
                    currentWord.user_status === 'learning' ? 'text-dark shadow-xs' : 'text-secondary'
                  } ${isRatingLocked ? 'opacity-75 pe-none' : ''}`}
                  style={{ fontSize: 'clamp(10.5px, 2.9vw, 12px)', minWidth: 0 }}
                  onClick={() => handleStatusChange('learning')}
                >
                  <HelpCircle size={12} className="me-1 flex-shrink-0" />
                  <span className="text-truncate">Đang Rèn Luyện</span>
                </Button>
                <Button
                  color={currentWord.user_status === 'mastered' ? 'success' : 'light'}
                  size="sm"
                  disabled={isRatingLocked}
                  className={`flex-fill rounded-pill py-1.5 px-1 px-sm-2 fw-bold border d-flex align-items-center justify-content-center ${
                    currentWord.user_status === 'mastered' ? 'text-white shadow-xs' : 'text-success'
                  } ${isRatingLocked ? 'opacity-75 pe-none' : ''}`}
                  style={{ fontSize: 'clamp(10.5px, 2.9vw, 12px)', minWidth: 0 }}
                  onClick={() => handleStatusChange('mastered')}
                >
                  <CheckCircle2 size={12} className="me-1 flex-shrink-0" />
                  <span className="text-truncate">Đã Thành Thạo</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="d-flex justify-content-between align-items-center w-100 gap-2" style={{ minWidth: 0 }}>
            <Button
              color="light"
              className="rounded-pill px-2.5 px-sm-4 py-1.5 py-md-2 fw-bold border shadow-xs d-flex align-items-center gap-1 flex-shrink-0"
              style={{ fontSize: '12px' }}
              disabled={currentIndex === 0}
              onClick={handlePrevWord}
            >
              <ChevronLeft size={14} />
              <span>Từ trước</span>
            </Button>

            <span className="fw-bold small text-muted text-center flex-grow-1" style={{ fontSize: '11.5px' }}>
              {currentIndex + 1} / {vocabularies.length}
            </span>

            <Button
              color="primary"
              className="rounded-pill px-2.5 px-sm-4 py-1.5 py-md-2 fw-bold shadow-xs d-flex align-items-center gap-1 flex-shrink-0"
              style={{ fontSize: '12px' }}
              disabled={currentIndex === vocabularies.length - 1}
              onClick={handleNextWord}
            >
              <span>Từ tiếp</span>
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}

      {/* ── MODE 2: TABLE LIST VIEW ── */}
      {viewMode === 'table_view' && (
        <Card className="jlpt-card border-0 shadow-sm rounded-4 overflow-hidden" style={{ width: '100%', maxWidth: '100%' }}>
          <CardBody className="p-2 p-sm-3">
            {/* Filter and Search Bar */}
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-stretch align-items-sm-center gap-2 mb-3 w-100">
              <div className="d-flex align-items-center gap-1.5 w-100 w-sm-auto flex-wrap">
                <Button
                  color={hideMeaning ? 'warning' : 'light'}
                  size="sm"
                  onClick={() => setHideMeaning(!hideMeaning)}
                  className={`rounded-pill border py-1 px-2.5 small flex-fill flex-sm-grow-0 ${hideMeaning ? 'fw-bold text-dark' : 'text-muted'}`}
                  style={{ fontSize: '11.5px', whiteSpace: 'nowrap' }}
                >
                  {hideMeaning ? <EyeOff size={13} className="me-1" /> : <Eye size={13} className="me-1" />}
                  {hideMeaning ? 'Hiện nghĩa' : 'Che nghĩa'}
                </Button>
                <Button
                  color={hideKana ? 'warning' : 'light'}
                  size="sm"
                  onClick={() => setHideKana(!hideKana)}
                  className={`rounded-pill border py-1 px-2.5 small flex-fill flex-sm-grow-0 ${hideKana ? 'fw-bold text-dark' : 'text-muted'}`}
                  style={{ fontSize: '11.5px', whiteSpace: 'nowrap' }}
                >
                  {hideKana ? <EyeOff size={13} className="me-1" /> : <Eye size={13} className="me-1" />}
                  {hideKana ? 'Hiện Kana' : 'Che Kana'}
                </Button>
              </div>

              <div className="position-relative w-100 w-sm-auto flex-grow-1" style={{ maxWidth: '320px', minWidth: 0 }}>
                <Input
                  type="text"
                  placeholder="Tìm từ trong bài..."
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  className="form-control-sm rounded-pill pe-4 w-100"
                  style={{ fontSize: '13px' }}
                />
                <Search size={14} className="position-absolute top-50 end-0 translate-middle-y me-2 text-muted" />
              </div>
            </div>

            {/* Desktop Table (>= 768px) */}
            <div className="d-none d-md-block table-responsive w-100">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '50px' }} className="text-center">STT</th>
                    <th style={{ width: '160px' }}>Chữ Hán (Kanji)</th>
                    <th style={{ minWidth: '180px' }}>Cách đọc / Từ vựng</th>
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
                    const hasKj = Boolean(item.kanji && hasRealKanji(item.kanji));
                    const isKatakana = /[\u30A0-\u30FF]/.test(cleanK) || (!hasKj && /[\u30A0-\u30FF]/.test(item.kanji || ''));
                    const effectiveWord = (!hasKj && /[\u30A0-\u30FF]/.test(item.kanji || '')) ? item.kanji : cleanK;

                    return (
                      <tr key={item.id}>
                        <td className="text-center text-muted small">{idx + 1}</td>
                        <td className="fw-bold fs-5 text-navy-dark font-monospace">
                          {hasKj ? (
                            item.kanji
                          ) : (
                            <span className="text-muted opacity-50">—</span>
                          )}
                        </td>
                        <td>
                          {hideKana ? (
                            <span className="badge bg-secondary opacity-50 px-3 py-1 cursor-pointer">
                              Nhấn để xem
                            </span>
                          ) : (
                            <div>
                              <div className="d-flex align-items-center gap-1.5 flex-wrap">
                                <span className={`fw-bold fs-6 font-monospace ${isKatakana ? 'text-amber-800' : 'text-primary'}`}>
                                  {effectiveWord}
                                </span>
                                {isKatakana && (
                                  <span
                                    className="badge bg-amber-50 text-amber-800 border border-amber-200 fw-bold px-1.5 py-0.5"
                                    style={{ fontSize: '10px' }}
                                  >
                                    Katakana
                                  </span>
                                )}
                              </div>
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
                                  <span style={{ color: '#0284c7', fontWeight: 600, marginRight: 4 }}>Ghi chú:</span>
                                  {item.usage_note}
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
                            onClick={() => speakJapanese(effectiveWord)}
                            title="Nghe phát âm chuẩn Tokyo"
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

            {/* Mobile Vocabulary Card List (< 768px) */}
            <div className="d-md-none d-flex flex-column gap-2" style={{ width: '100%', maxWidth: '100%' }}>
              {filteredTableVocabs.length === 0 ? (
                <div className="text-center py-4 text-muted small">Không tìm thấy từ vựng phù hợp</div>
              ) : (
                filteredTableVocabs.map((item, idx) => {
                  const cleanMeaning = item.clean_vietnamese || item.vietnamese;
                  const cleanK = item.clean_kana || item.kana;
                  const fav = isFavorite(item.id, item.is_favorite);
                  const hasKj = Boolean(item.kanji && hasRealKanji(item.kanji));
                  const isKatakana = /[\u30A0-\u30FF]/.test(cleanK) || (!hasKj && /[\u30A0-\u30FF]/.test(item.kanji || ''));
                  const effectiveWord = (!hasKj && /[\u30A0-\u30FF]/.test(item.kanji || '')) ? item.kanji : cleanK;

                  return (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-3 bg-white border shadow-xs d-flex flex-column gap-1.5"
                      style={{
                        borderColor: 'var(--slate-200)',
                        width: '100%',
                        maxWidth: '100%',
                        overflow: 'hidden'
                      }}
                    >
                      {/* Top Row: STT, Kanji, Kana & Audio, Star */}
                      <div className="d-flex justify-content-between align-items-center w-100 gap-1.5">
                        <div className="d-flex align-items-center gap-1.5 min-w-0 flex-grow-1 flex-wrap">
                          <span className="badge bg-light text-secondary border fw-bold flex-shrink-0" style={{ fontSize: '10.5px' }}>
                            #{idx + 1}
                          </span>
                          {hasKj && (
                            <span
                              className="fw-black text-navy-dark fs-5 font-monospace"
                              style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                            >
                              {item.kanji}
                            </span>
                          )}
                          {hideKana ? (
                            <span
                              className="badge bg-secondary opacity-50 px-2 py-0.5 cursor-pointer flex-shrink-0"
                              style={{ fontSize: '11px' }}
                              onClick={() => setHideKana(false)}
                            >
                              Xem Kana
                            </span>
                          ) : (
                            <span
                              className={`fw-bold font-monospace ${isKatakana ? 'text-amber-800' : 'text-primary'}`}
                              style={{
                                fontSize: '14px',
                                wordBreak: 'break-word',
                                overflowWrap: 'anywhere'
                              }}
                            >
                              {effectiveWord}
                            </span>
                          )}
                          {isKatakana && (
                            <span className="badge bg-amber-50 text-amber-800 border border-amber-200 fw-bold px-1.5 py-0.5" style={{ fontSize: '9.5px' }}>
                              Katakana
                            </span>
                          )}
                          <span className="text-muted small fst-italic" style={{ fontSize: '11px' }}>[{item.romaji}]</span>
                        </div>

                        <div className="d-flex align-items-center gap-1 flex-shrink-0">
                          <button
                            type="button"
                            className="btn btn-sm btn-light rounded-circle border p-1 text-primary audio-btn d-flex align-items-center justify-content-center"
                            style={{ width: 30, height: 30 }}
                            onClick={() => speakJapanese(effectiveWord)}
                            title="Nghe phát âm chuẩn Tokyo"
                          >
                            <Volume2 size={14} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-light rounded-circle border p-1 text-warning d-flex align-items-center justify-content-center"
                            style={{ width: 30, height: 30 }}
                            onClick={() => toggleFavorite(item)}
                            title="Lưu yêu thích"
                          >
                            <Star size={14} fill={fav ? '#f59e0b' : 'transparent'} />
                          </button>
                        </div>
                      </div>

                      {/* Meaning Row */}
                      <div style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                        {hideMeaning ? (
                          <span
                            className="badge bg-secondary opacity-50 px-2 py-0.5 cursor-pointer"
                            style={{ fontSize: '11px' }}
                            onClick={() => setHideMeaning(false)}
                          >
                            Nhấn xem nghĩa
                          </span>
                        ) : (
                          <span className="fw-bold text-dark" style={{ fontSize: '13px' }}>
                            {cleanMeaning}
                          </span>
                        )}
                        {item.usage_note && (
                          <div className="text-muted small mt-0.5" style={{ fontSize: '11px' }}>
                            <span style={{ color: '#0284c7', fontWeight: 600, marginRight: 4 }}>Ghi chú:</span>
                            {item.usage_note}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
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
    </div>
  );
};

export default LessonStudyPage;
