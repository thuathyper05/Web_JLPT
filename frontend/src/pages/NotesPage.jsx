import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, CardBody, Button, Badge, Input, Spinner,
  Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label
} from 'reactstrap';
import { FileText, Volume2, Trash2, Edit3, Search, BookOpen, PenLine, Save } from 'lucide-react';
import { noteService, vocabService, speakJapanese } from '../services/api';
import { useApp } from '../context/AppContext';
import { sounds } from '../services/sounds';

const NotesPage = ({ onNavigate, onSelectLesson }) => {
  const { user, guestNotes, saveNote } = useApp();
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => { fetchNotes(); }, [user, guestNotes]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      if (user) {
        const res = await noteService.getNotes();
        setNotes(res.data);
      } else {
        const vocabIds = Object.keys(guestNotes).filter(id => guestNotes[id]?.trim());
        if (!vocabIds.length) { setNotes([]); return; }
        const res = await vocabService.getVocabularies({});
        const matched = res.data
          .filter(v => vocabIds.includes(String(v.id)))
          .map(v => ({
            note_id: v.id, vocabulary_id: v.id, content: guestNotes[v.id],
            kanji: v.kanji, kana: v.kana, clean_kana: v.clean_kana,
            romaji: v.romaji, vietnamese: v.vietnamese, clean_vietnamese: v.clean_vietnamese,
            lesson_number: v.lesson_number
          }));
        setNotes(matched);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleDelete = async (note) => {
    if (!window.confirm('Bạn có chắc muốn xóa ghi chú này?')) return;
    sounds.playWrong();
    if (user) await noteService.deleteNote(note.note_id || note.vocabulary_id);
    else await saveNote(note.vocabulary_id, '');
    setNotes(prev => prev.filter(n => n.vocabulary_id !== note.vocabulary_id));
  };

  const openEdit = (note) => {
    sounds.playFlip();
    setEditingItem(note); setEditContent(note.content); setEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (editingItem) {
      sounds.playCorrect();
      await saveNote(editingItem.vocabulary_id, editContent);
      setNotes(prev => prev.map(n => n.vocabulary_id === editingItem.vocabulary_id ? { ...n, content: editContent } : n));
    }
    setEditModal(false);
  };

  const filtered = notes.filter(n => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return n.content?.toLowerCase().includes(q) || n.vietnamese?.toLowerCase().includes(q) ||
      n.kana?.toLowerCase().includes(q) || n.kanji?.toLowerCase().includes(q);
  });

  if (loading) return (
    <Container className="text-center py-5">
      <Spinner color="info" />
      <p className="mt-2 text-muted">Đang tải ghi chú cá nhân...</p>
    </Container>
  );

  return (
    <Container className="py-3 py-md-4">

      {/* ── Header ── */}
      <div className="page-header-box mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(14,165,233,.28)' }}>
              <FileText size={24} color="#fff" />
            </div>
            <div>
              <h4 className="fw-bold mb-0 text-navy-dark" style={{ fontSize: 18 }}>Sổ Tay Ghi Chú</h4>
              <p className="text-muted small mb-0">Mẹo nhớ, ví dụ thực tế và giải thích ngữ cảnh cá nhân</p>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <div className="position-relative">
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <Input type="text" placeholder="Tìm trong ghi chú..." value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: 32, borderRadius: 999, fontSize: 13, minWidth: 180 }} />
            </div>
            <span style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 999, padding: '4px 12px', fontSize: 13, fontWeight: 700, color: '#0369a1' }}>
              {notes.length} ghi chú
            </span>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      {filtered.length === 0 ? (
        <div className="jlpt-card p-5 text-center">
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <PenLine size={32} color="#0ea5e9" />
          </div>
          <h5 className="fw-bold text-navy-dark">
            {search ? 'Không tìm thấy ghi chú nào' : 'Chưa có ghi chú nào'}
          </h5>
          <p className="text-muted mb-4" style={{ maxWidth: 420, margin: '8px auto 20px' }}>
            {search ? 'Thử từ khóa khác.' : 'Khi học từ vựng, nhấn 📝 để thêm mẹo nhớ và ghi chú cá nhân vào sổ tay.'}
          </p>
          <Button color="primary" className="fw-bold px-4 rounded-pill" onClick={() => onNavigate('lessons')}>
            <BookOpen size={16} className="me-1" /> Đến danh sách bài học
          </Button>
        </div>
      ) : (
        <Row className="g-3">
          {filtered.map(item => (
            <Col md={6} key={item.vocabulary_id}>
              <Card style={{ border: '1px solid #e0edf8', borderLeft: '4px solid #3b82f6', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,.04)' }}>
                <CardBody className="p-3 d-flex flex-column gap-2">
                  {/* Top */}
                  <div className="d-flex justify-content-between align-items-center">
                    <span style={{ background: '#eff6ff', color: '#2563eb', fontSize: 11.5, fontWeight: 700, borderRadius: 999, padding: '3px 10px', cursor: 'pointer' }}
                      onClick={() => { if (onSelectLesson) onSelectLesson(item.lesson_number); onNavigate('lessons'); }}>
                      Bài {item.lesson_number}
                    </span>
                    <div className="d-flex gap-1">
                      <button type="button" style={{ background: '#eff6ff', border: 'none', borderRadius: 8, padding: '5px 7px', cursor: 'pointer' }}
                        onClick={() => speakJapanese(item.clean_kana || item.kana)}>
                        <Volume2 size={14} color="#2563eb" />
                      </button>
                      <button type="button" style={{ background: '#f0f9ff', border: 'none', borderRadius: 8, padding: '5px 7px', cursor: 'pointer' }}
                        onClick={() => openEdit(item)}>
                        <Edit3 size={14} color="#0ea5e9" />
                      </button>
                      <button type="button" style={{ background: '#fef2f2', border: 'none', borderRadius: 8, padding: '5px 7px', cursor: 'pointer' }}
                        onClick={() => handleDelete(item)}>
                        <Trash2 size={14} color="#ef4444" />
                      </button>
                    </div>
                  </div>

                  {/* Word */}
                  <div className="d-flex align-items-baseline gap-2">
                    {item.kanji && (
                      <span style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', fontFamily: 'Noto Sans JP,sans-serif' }}>{item.kanji}</span>
                    )}
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#2563eb', fontFamily: 'Noto Sans JP,sans-serif' }}>
                      {item.clean_kana || item.kana}
                    </span>
                    <span style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>[{item.romaji}]</span>
                  </div>

                  {/* Meaning */}
                  <div style={{ fontSize: 13, color: '#475569' }}>
                    <strong>Nghĩa:</strong> {item.clean_vietnamese || item.vietnamese}
                  </div>

                  {/* Note Content */}
                  <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 10, padding: '10px 14px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                      ✏️ Ghi chú của bạn
                    </div>
                    <div style={{ fontSize: 13.5, color: '#0c4a6e', whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>
                      {item.content}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* ── Edit Modal ── */}
      <Modal isOpen={editModal} toggle={() => setEditModal(false)} centered className="jlpt-modal">
        <ModalHeader toggle={() => setEditModal(false)} className="border-0 pb-1">
          <div className="d-flex align-items-center gap-2">
            <Edit3 size={18} color="#0ea5e9" />
            <span className="fw-bold text-navy-dark">
              Sửa ghi chú: {editingItem?.kanji || editingItem?.clean_kana || editingItem?.kana}
            </span>
          </div>
        </ModalHeader>
        <ModalBody className="pt-2 pb-0">
          <FormGroup>
            <Label className="small fw-semibold text-muted">Nội dung ghi chú cá nhân:</Label>
            <Input type="textarea" rows={5} value={editContent} onChange={e => setEditContent(e.target.value)}
              placeholder="Mẹo nhớ, ví dụ câu, ngữ cảnh sử dụng..." style={{ borderRadius: 12, resize: 'vertical' }} />
          </FormGroup>
        </ModalBody>
        <ModalFooter className="border-0 pt-1">
          <Button color="light" onClick={() => setEditModal(false)}>Hủy</Button>
          <Button color="primary" className="fw-bold d-flex align-items-center gap-1" onClick={handleSaveEdit}>
            <Save size={15} /> Lưu thay đổi
          </Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
};

export default NotesPage;
