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
  Spinner,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
  Label
} from 'reactstrap';
import {
  FileText,
  Volume2,
  Trash2,
  Edit,
  Search,
  BookOpen
} from 'lucide-react';
import { noteService, vocabService, speakJapanese } from '../services/api';
import { useApp } from '../context/AppContext';

const NotesPage = ({ onNavigate, onSelectLesson }) => {
  const { user, guestNotes, saveNote } = useApp();
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Edit Modal
  const [editModal, setEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    fetchNotes();
  }, [user, guestNotes]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      if (user) {
        const res = await noteService.getNotes();
        setNotes(res.data);
      } else {
        // Build guest notes list
        const vocabIds = Object.keys(guestNotes).filter(id => guestNotes[id]?.trim());
        if (vocabIds.length === 0) {
          setNotes([]);
        } else {
          const res = await vocabService.getVocabularies({});
          const matched = res.data
            .filter(v => vocabIds.includes(String(v.id)))
            .map(v => ({
              note_id: v.id,
              vocabulary_id: v.id,
              content: guestNotes[v.id],
              kanji: v.kanji,
              kana: v.kana,
              romaji: v.romaji,
              vietnamese: v.vietnamese,
              lesson_number: v.lesson_number
            }));
          setNotes(matched);
        }
      }
    } catch (err) {
      console.error('Error fetching notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (note) => {
    if (window.confirm('Bạn có chắc muốn xóa ghi chú này không?')) {
      if (user) {
        await noteService.deleteNote(note.note_id || note.vocabulary_id);
      } else {
        await saveNote(note.vocabulary_id, '');
      }
      setNotes(prev => prev.filter(n => n.vocabulary_id !== note.vocabulary_id));
    }
  };

  const openEdit = (note) => {
    setEditingItem(note);
    setEditContent(note.content);
    setEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (editingItem) {
      await saveNote(editingItem.vocabulary_id, editContent);
      setNotes(prev => prev.map(n => n.vocabulary_id === editingItem.vocabulary_id ? { ...n, content: editContent } : n));
    }
    setEditModal(false);
  };

  const filteredNotes = notes.filter(n => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      n.content?.toLowerCase().includes(term) ||
      n.vietnamese?.toLowerCase().includes(term) ||
      n.kana?.toLowerCase().includes(term) ||
      n.kanji?.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner color="primary" />
        <p className="mt-2 text-muted">Đang tải danh sách ghi chú...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="bg-white p-4 rounded-4 shadow-sm border mb-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2">
          <div className="bg-info bg-opacity-10 text-info p-2 rounded-circle">
            <FileText size={24} />
          </div>
          <div>
            <h4 className="fw-bold mb-0">Sổ tay ghi chú cá nhân</h4>
            <p className="text-muted small mb-0">
              Lưu lại mẹo nhớ, ví dụ thực tế và giải thích ngữ cảnh của từng từ
            </p>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Input
            type="text"
            placeholder="Tìm kiếm trong ghi chú..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-auto"
            size="sm"
          />
          <Badge color="info" pill className="fs-6 px-3 py-2">
            {notes.length} ghi chú
          </Badge>
        </div>
      </div>

      {filteredNotes.length === 0 ? (
        <Card className="jlpt-card border-0 shadow-sm p-5 text-center">
          <div className="bg-light text-muted p-3 rounded-circle d-inline-flex mx-auto mb-3">
            <FileText size={40} />
          </div>
          <h4 className="fw-bold text-dark">Chưa có ghi chú nào</h4>
          <p className="text-muted mb-4">
            Khi học từ vựng theo bài, bấm biểu tượng văn bản 📝 để thêm ghi chú của riêng bạn.
          </p>
          <div>
            <Button color="primary" className="fw-bold px-4" onClick={() => onNavigate('lessons')}>
              Đến danh sách bài học
            </Button>
          </div>
        </Card>
      ) : (
        <Row className="g-3">
          {filteredNotes.map((item) => (
            <Col md={6} key={item.vocabulary_id}>
              <Card className="jlpt-card border-0 shadow-sm h-100">
                <CardBody className="p-3 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <Badge
                        color="secondary"
                        pill
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          if (onSelectLesson) onSelectLesson(item.lesson_number);
                          onNavigate('lessons');
                        }}
                      >
                        Bài {item.lesson_number}
                      </Badge>
                      <div className="d-flex gap-1">
                        <Button
                          color="light"
                          size="sm"
                          className="p-1 rounded-circle"
                          onClick={() => speakJapanese(item.kana)}
                        >
                          <Volume2 size={16} className="text-primary" />
                        </Button>
                        <Button
                          color="light"
                          size="sm"
                          className="p-1 rounded-circle text-info"
                          onClick={() => openEdit(item)}
                          title="Sửa"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          color="light"
                          size="sm"
                          className="p-1 rounded-circle text-danger"
                          onClick={() => handleDelete(item)}
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>

                    <div className="d-flex align-items-baseline gap-2 mb-2">
                      {item.kanji && (
                        <span className="fw-bold fs-5 text-dark font-monospace">
                          {item.kanji}
                        </span>
                      )}
                      <span className="text-primary fw-semibold fs-6">
                        {item.kana}
                      </span>
                      <span className="text-muted small">[{item.romaji}]</span>
                    </div>

                    <div className="small text-secondary mb-3">
                      <strong>Nghĩa:</strong> {item.vietnamese}
                    </div>

                    <div className="bg-light p-3 rounded border-start border-4 border-info">
                      <div className="text-muted small fw-semibold mb-1">Ghi chú của bạn:</div>
                      <div className="text-dark small" style={{ whiteSpace: 'pre-wrap' }}>
                        {item.content}
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Edit Note Modal */}
      <Modal isOpen={editModal} toggle={() => setEditModal(false)} centered>
        <ModalHeader toggle={() => setEditModal(false)}>
          Chỉnh sửa ghi chú: {editingItem?.kanji || editingItem?.kana}
        </ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label className="small fw-semibold">Nội dung ghi chú:</Label>
            <Input
              type="textarea"
              rows={4}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setEditModal(false)}>Hủy</Button>
          <Button color="primary" onClick={handleSaveEdit}>Lưu thay đổi</Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
};

export default NotesPage;
