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
    <div className="app-shell" style={{ maxWidth: '1040px' }}>

      {/* ── UNIFIED SYSTEMIC PAGE HEADER ── */}
      <div className="app-page-header">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <div className="app-header-tag" style={{ background: '#f0f9ff', color: '#0284c7', borderColor: '#bae6fd' }}>
              <FileText size={13} />
              <span>SỔ TAY GHI CHÚ • MẸO NHỚ CÁ NHÂN</span>
            </div>
            <h1 className="app-header-title">
              Sổ Tay Ghi Chú
            </h1>
            <p className="app-header-subtitle">
              Mẹo nhớ, ví dụ thực tế và giải thích ngữ cảnh cá nhân được lưu giữ trong quá trình học tập.
            </p>
          </div>

          <div className="d-flex align-items-center gap-2.5 flex-wrap ms-auto">
            <div className="position-relative" style={{ minWidth: '200px' }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <Input
                type="text"
                placeholder="Tìm trong ghi chú..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="form-control-sm rounded-pill ps-4 border"
                style={{ fontSize: '12.5px', height: '36px' }}
              />
            </div>
            <span className="badge rounded-pill px-3 py-2 fw-bold" style={{ background: '#f0f9ff', border: '1px solid #bae6fd', color: '#0369a1', fontSize: '12px' }}>
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
            {search ? 'Thử từ khóa khác.' : 'Khi học từ vựng, bấm biểu tượng ghi chú để thêm mẹo nhớ và ghi chú cá nhân vào sổ tay.'}
          </p>
          <Button color="primary" className="fw-bold px-4 rounded-pill" onClick={() => onNavigate('lessons')}>
            <BookOpen size={16} className="me-1" /> Đến danh sách bài học
          </Button>
        </div>
      ) : (
        <Row className="g-3 g-md-4">
          {filtered.map(item => (
            <Col md={6} key={item.vocabulary_id}>
              <div className="app-surface-card h-100 p-3.5 d-flex flex-column gap-2.5" style={{ borderLeft: '4px solid #3b82f6' }}>
                {/* Top */}
                <div className="d-flex justify-content-between align-items-center">
                  <span className="badge rounded-pill px-2.5 py-1 fw-bold" style={{ background: '#eff6ff', color: '#2563eb', fontSize: '11.5px', border: '1px solid #bfdbfe', cursor: 'pointer' }}
                    onClick={() => { if (onSelectLesson) onSelectLesson(item.lesson_number); onNavigate('lessons'); }}>
                    Bài {item.lesson_number}
                  </span>
                  <div className="d-flex gap-1.5">
                    <button type="button" className="app-icon-btn" style={{ width: 32, height: 32 }}
                      onClick={() => speakJapanese(item.clean_kana || item.kana)}>
                      <Volume2 size={15} />
                    </button>
                    <button type="button" className="app-icon-btn" style={{ width: 32, height: 32, color: '#0ea5e9' }}
                      onClick={() => openEdit(item)}>
                      <Edit3 size={15} />
                    </button>
                    <button type="button" className="app-icon-btn" style={{ width: 32, height: 32, color: '#ef4444' }}
                      onClick={() => handleDelete(item)}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Word */}
                <div className="d-flex align-items-baseline gap-2 flex-wrap">
                  {item.kanji && (
                    <span style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', fontFamily: 'Noto Sans JP,sans-serif' }}>{item.kanji}</span>
                  )}
                  <span style={{ fontSize: '15px', fontWeight: 700, color: '#2563eb', fontFamily: 'Noto Sans JP,sans-serif' }}>
                    {item.clean_kana || item.kana}
                  </span>
                  <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>[{item.romaji}]</span>
                </div>

                {/* Meaning */}
                <div style={{ fontSize: '13px', color: '#475569' }}>
                  <strong>Nghĩa:</strong> {item.clean_vietnamese || item.vietnamese}
                </div>

                {/* Note Content */}
                <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 10, padding: '12px 14px', marginTop: 'auto' }}>
                  <div className="d-flex align-items-center gap-1.5" style={{ fontSize: '11px', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                    <FileText size={12} />
                    <span>Ghi chú của bạn</span>
                  </div>
                  <div style={{ fontSize: '13.5px', color: '#0c4a6e', whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>
                    {item.content}
                  </div>
                </div>
              </div>
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
    </div>
  );
};

export default NotesPage;
