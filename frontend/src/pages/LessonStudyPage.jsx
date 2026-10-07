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
  Spinner,
  ButtonGroup
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
  Filter,
  Search,
  Sparkles
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

  // Filter for table mode: 'all' | 'unlearned' | 'mastered' | 'needs_review'
  const [statusFilter, setStatusFilter] = useState('all');
  const [tableSearch, setTableSearch] = useState('');

  // Note Modal state
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [noteTargetVocab, setNoteTargetVocab] = useState(null);
  const [noteContent, setNoteContent] = useState('');

  // Hide/Show columns in table mode
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
      return (
        v.vietnamese?.toLowerCase().includes(q) ||
        v.kana?.toLowerCase().includes(q) ||
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
        <p className="mt-2 text-muted">Đang tải dữ liệu Bài học {currentLessonNum}...</p>
      </Container>
    );
  }

  return (
    <Container className="py-3 py-md-4">
      {/* Lesson Selector Header */}
      <div className="bg-white p-3 p-md-4 rounded-4 shadow-sm border mb-3">
        <Row className="align-items-center g-3">
          <Col md={7}>
            <div className="d-flex align-items-center gap-2 mb-1">
              <Badge color="primary" pill className="px-3 py-1 fs-6">
                Bài {currentLessonNum < 10 ? `0${currentLessonNum}` : currentLessonNum}
              </Badge>
              <span className="text-muted small fw-medium">
                ({vocabularies.length} từ vựng N5 tiêu chuẩn)
              </span>
            </div>
            <h4 className="fw-bold text-navy-dark mb-1">
              {lessonInfo?.title}
            </h4>
            <p className="text-muted small mb-0">
              {lessonInfo?.description}
            </p>
          </Col>

          <Col md={5} className="d-flex flex-column align-items-md-end gap-2">
            <div className="d-flex align-items-center gap-2 w-100 justify-content-md-end">
              <Label for="lesson-select" className="small text-muted mb-0 fw-semibold text-nowrap">
                Chọn bài:
              </Label>
              <Input
                id="lesson-select"
                type="select"
                value={currentLessonNum}
                onChange={(e) => {
                  const num = parseInt(e.target.value);
                  setCurrentLessonNum(num);
                  if (onSelectLesson) onSelectLesson(num);
                }}
                className="w-auto fw-bold"
              >
                {Array.from({ length: 25 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    Bài {n < 10 ? `0${n}` : n}
                  </option>
                ))}
              </Input>

              {/* View mode toggle */}
              <ButtonGroup size="sm">
                <Button
                  color={viewMode === 'step_by_step' ? 'primary' : 'outline-secondary'}
                  onClick={() => setViewMode('step_by_step')}
                  title="Học từng từ một"
                  className="fw-semibold px-2"
                >
                  <BookOpen size={16} className="me-1" />
                  <span className="d-none d-sm-inline">Từng từ</span>
                </Button>
                <Button
                  color={viewMode === 'table_view' ? 'primary' : 'outline-secondary'}
                  onClick={() => setViewMode('table_view')}
                  title="Xem toàn bộ danh sách bảng"
                  className="fw-semibold px-2"
                >
                  <List size={16} className="me-1" />
                  <span className="d-none d-sm-inline">Bảng từ</span>
                </Button>
              </ButtonGroup>
            </div>

            {/* Quick action buttons */}
            <div className="d-flex gap-2">
              <Button
                color="info"
                outline
                size="sm"
                className="d-flex align-items-center gap-1 fw-semibold"
                onClick={() => {
                  if (onSelectLesson) onSelectLesson(currentLessonNum);
                  onNavigate('flashcard');
                }}
              >
                <Layers size={14} /> Flashcard
              </Button>
              <Button
                color="success"
                outline
                size="sm"
                className="d-flex align-items-center gap-1 fw-semibold"
                onClick={() => {
                  if (onSelectLesson) onSelectLesson(currentLessonNum);
                  onNavigate('quiz');
                }}
              >
                <CheckSquare size={14} /> Trắc nghiệm
              </Button>
              <Button
                color="warning"
                outline
                size="sm"
                className="d-flex align-items-center gap-1 text-dark fw-semibold"
                onClick={() => {
                  if (onSelectLesson) onSelectLesson(currentLessonNum);
                  onNavigate('practice');
                }}
              >
                <Keyboard size={14} /> Luyện gõ
              </Button>
            </div>
          </Col>
        </Row>
      </div>

      {/* MODE 1: STEP-BY-STEP LEARNING */}
      {viewMode === 'step_by_step' && currentWord && (
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          <Card className="jlpt-card border-0 shadow-lg mb-3">
            <CardBody className="p-4 p-md-5 text-center">
              {/* Card top bar */}
              <div className="d-flex justify-content-between align-items-center mb-4">
                <Badge color="light" className="text-secondary border px-3 py-1 fs-7">
                  Từ {currentIndex + 1} / {vocabularies.length}
                </Badge>

                <div className="d-flex gap-2">
                  <Button
                    color="light"
                    size="sm"
                    className="rounded-circle p-2"
                    onClick={() => openNoteModal(currentWord)}
                    title="Ghi chú cá nhân"
                  >
                    <FileText size={18} className="text-info" />
                  </Button>
                  <Button
                    color="light"
                    size="sm"
                    className="rounded-circle p-2"
                    onClick={() => {
                      sounds.playFlip();
                      toggleFavorite(currentWord);
                    }}
                    title="Yêu thích"
                  >
                    <Star
                      size={18}
                      className={isFavorite(currentWord.id, currentWord.is_favorite) ? 'text-warning fill-warning' : 'text-muted'}
                      fill={isFavorite(currentWord.id, currentWord.is_favorite) ? '#f59e0b' : 'none'}
                    />
                  </Button>
                </div>
              </div>

              {/* Vocab display */}
              <div className="my-3">
                {currentWord.kanji && (
                  <h1 className="display-3 fw-bold text-dark mb-2 font-monospace">
                    {currentWord.kanji}
                  </h1>
                )}
                <h2 className={`fw-bold text-primary mb-2 ${!currentWord.kanji ? 'display-4' : ''}`}>
                  {currentWord.kana}
                </h2>
                <div className="text-muted fs-5 mb-3 fst-italic">
                  [{currentWord.romaji}]
                </div>

                <Button
                  color="primary"
                  className="rounded-pill px-4 py-2 my-2 shadow-sm audio-btn d-inline-flex align-items-center gap-2 fw-semibold"
                  onClick={() => speakJapanese(currentWord.kana)}
                >
                  <Volume2 size={20} />
                  <span>Phát âm</span>
                </Button>

                <div className="bg-light p-3 rounded-3 mt-3 mx-auto" style={{ maxWidth: '500px' }}>
                  <div className="text-muted small mb-1 fw-semibold">Nghĩa tiếng Việt:</div>
                  <div className="fs-4 fw-bold text-navy-dark">
                    {currentWord.vietnamese}
                  </div>
                </div>

                {getNote(currentWord.id, currentWord.user_note) && (
                  <div className="alert alert-info mt-3 mx-auto text-start py-2 px-3 small border-0" style={{ maxWidth: '500px' }}>
                    <strong>Ghi chú:</strong> {getNote(currentWord.id, currentWord.user_note)}
                  </div>
                )}
              </div>

              {/* Status toggles */}
              <div className="mt-4 pt-3 border-top d-flex justify-content-center gap-2 flex-wrap">
                <Button
                  color={currentWord.user_status === 'mastered' ? 'success' : 'outline-success'}
                  size="sm"
                  className="d-flex align-items-center gap-1 px-3 py-2 rounded-pill fw-semibold"
                  onClick={() => handleStatusChange('mastered')}
                >
                  <CheckCircle2 size={16} /> Đã nhớ
                </Button>
                <Button
                  color={currentWord.user_status === 'needs_review' ? 'danger' : 'outline-danger'}
                  size="sm"
                  className="d-flex align-items-center gap-1 px-3 py-2 rounded-pill fw-semibold"
                  onClick={() => handleStatusChange('needs_review')}
                >
                  <XCircle size={16} /> Chưa nhớ / Cần ôn
                </Button>
                <Button
                  color={currentWord.user_status === 'learning' ? 'secondary' : 'outline-secondary'}
                  size="sm"
                  className="d-flex align-items-center gap-1 px-3 py-2 rounded-pill fw-semibold"
                  onClick={() => handleStatusChange('learning')}
                >
                  <HelpCircle size={16} /> Đang học
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Navigation Controls */}
          <div className="d-flex justify-content-between align-items-center">
            <Button
              color="secondary"
              outline
              disabled={currentIndex === 0}
              onClick={handlePrevWord}
              className="d-flex align-items-center gap-2 px-3 py-2"
            >
              <ChevronLeft size={18} /> Từ trước
            </Button>

            <span className="text-muted small">
              Phím mũi tên hoặc nút bấm để chuyển từ
            </span>

            <Button
              color="primary"
              disabled={currentIndex === vocabularies.length - 1}
              onClick={handleNextWord}
              className="d-flex align-items-center gap-2 px-3 py-2"
            >
              Từ tiếp theo <ChevronRight size={18} />
            </Button>
          </div>
        </div>
      )}

      {/* MODE 2: TABLE VIEW WITH SEARCH & FILTERS */}
      {viewMode === 'table_view' && (
        <Card className="jlpt-card border-0 shadow-sm">
          <CardBody className="p-3">
            <Row className="g-2 mb-3 align-items-center justify-content-between">
              <Col sm={4}>
                <Input
                  type="text"
                  placeholder="Lọc từ trong bài này..."
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  bsSize="sm"
                />
              </Col>
              <Col sm={8} className="d-flex justify-content-sm-end gap-2 flex-wrap">
                <Button
                  size="sm"
                  color={hideKana ? 'warning' : 'outline-secondary'}
                  onClick={() => setHideKana(!hideKana)}
                  className="d-flex align-items-center gap-1"
                >
                  {hideKana ? <EyeOff size={14} /> : <Eye size={14} />}
                  <span>{hideKana ? 'Hiện Kana' : 'Ẩn Kana'}</span>
                </Button>
                <Button
                  size="sm"
                  color={hideMeaning ? 'warning' : 'outline-secondary'}
                  onClick={() => setHideMeaning(!hideMeaning)}
                  className="d-flex align-items-center gap-1"
                >
                  {hideMeaning ? <EyeOff size={14} /> : <Eye size={14} />}
                  <span>{hideMeaning ? 'Hiện Nghĩa' : 'Ẩn Nghĩa'}</span>
                </Button>
              </Col>
            </Row>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '45px' }} className="text-center">STT</th>
                    <th style={{ width: '130px' }}>Kanji</th>
                    <th style={{ width: '170px' }}>Kana</th>
                    <th style={{ width: '140px' }}>Romaji</th>
                    <th>Nghĩa Tiếng Việt</th>
                    <th style={{ width: '110px' }} className="text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTableVocabs.map((item, idx) => (
                    <tr key={item.id}>
                      <td className="text-center text-muted small">{idx + 1}</td>
                      <td className="fw-bold text-dark fs-6 font-monospace">
                        {item.kanji || '–'}
                      </td>
                      <td className="text-primary fw-semibold">
                        {hideKana ? (
                          <span className="badge bg-light text-muted">Đã ẩn</span>
                        ) : (
                          item.kana
                        )}
                      </td>
                      <td className="text-muted small fst-italic">{item.romaji}</td>
                      <td>
                        {hideMeaning ? (
                          <span className="badge bg-light text-muted">Đã ẩn</span>
                        ) : (
                          <span className="fw-medium text-dark">{item.vietnamese}</span>
                        )}
                      </td>
                      <td className="text-center">
                        <div className="d-flex justify-content-center gap-1">
                          <Button
                            color="light"
                            size="sm"
                            className="p-1 rounded-circle"
                            onClick={() => speakJapanese(item.kana)}
                            title="Nghe phát âm"
                          >
                            <Volume2 size={16} className="text-primary" />
                          </Button>
                          <Button
                            color="light"
                            size="sm"
                            className="p-1 rounded-circle"
                            onClick={() => {
                              sounds.playFlip();
                              toggleFavorite(item);
                            }}
                            title="Yêu thích"
                          >
                            <Star
                              size={16}
                              className={isFavorite(item.id, item.is_favorite) ? 'text-warning fill-warning' : 'text-muted'}
                              fill={isFavorite(item.id, item.is_favorite) ? '#f59e0b' : 'none'}
                            />
                          </Button>
                          <Button
                            color="light"
                            size="sm"
                            className="p-1 rounded-circle"
                            onClick={() => openNoteModal(item)}
                            title="Ghi chú"
                          >
                            <FileText size={16} className="text-info" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Note Modal */}
      <Modal isOpen={noteModalOpen} toggle={() => setNoteModalOpen(!noteModalOpen)} centered>
        <ModalHeader toggle={() => setNoteModalOpen(!noteModalOpen)}>
          Ghi chú: {noteTargetVocab?.kanji || noteTargetVocab?.kana}
        </ModalHeader>
        <ModalBody>
          <p className="text-muted small mb-2">
            Nghĩa: <strong>{noteTargetVocab?.vietnamese}</strong>
          </p>
          <FormGroup>
            <Label for="noteText" className="small fw-semibold">Nội dung ghi chú cá nhân:</Label>
            <Input
              id="noteText"
              type="textarea"
              rows={4}
              placeholder="Nhập mẹo nhớ, ví dụ hoặc lưu ý cách dùng..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setNoteModalOpen(false)}>Hủy</Button>
          <Button color="primary" onClick={handleSaveNote}>Lưu ghi chú</Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
};

export default LessonStudyPage;
