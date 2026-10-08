import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, CardBody, Badge, Input, Button, Spinner,
  Modal, ModalHeader, ModalBody
} from 'reactstrap';
import { PenTool, Volume2, Search, BookOpen, Info, X } from 'lucide-react';
import { kanjiService, speakJapanese } from '../services/api';
import { sounds } from '../services/sounds';

const KanjiPage = ({ currentLevel = 'N5' }) => {
  const [kanjiList, setKanjiList] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchKanji(); }, [currentLevel]);

  const fetchKanji = async () => {
    setLoading(true);
    try {
      const res = await kanjiService.getKanjiList({ level: currentLevel });
      setKanjiList(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openDetail = (item) => {
    sounds.playFlip();
    setSelected(item); setModalOpen(true);
    speakJapanese(item.kanji);
  };

  const filtered = kanjiList.filter(item => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return item.kanji.includes(q) || item.han_viet?.toLowerCase().includes(q) ||
      item.meaning?.toLowerCase().includes(q) || item.onyomi?.toLowerCase().includes(q) ||
      item.kunyomi?.toLowerCase().includes(q);
  });

  return (
    <Container className="py-3 py-md-4">

      {/* ── Header ── */}
      <div className="page-header-box mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#1e3a8a,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(37,99,235,.28)' }}>
              <PenTool size={24} color="#fff" />
            </div>
            <div>
              <h4 className="fw-bold mb-0 text-navy-dark" style={{ fontSize: 18 }}>Chữ Hán Kanji {currentLevel}</h4>
              <p className="text-muted small mb-0">Âm Hán Việt · On/Kun · Số nét · Từ ghép thực dụng</p>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <div className="position-relative">
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <Input type="text" placeholder="Tìm Kanji, Hán Việt, Nghĩa..." value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: 32, borderRadius: 999, fontSize: 13, width: 220 }} />
            </div>
            <span style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 999, padding: '4px 12px', fontSize: 13, fontWeight: 700, color: '#1d4ed8' }}>
              {kanjiList.length} Kanji
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner color="primary" />
          <p className="mt-2 text-muted">Đang tải bảng Kanji {currentLevel}...</p>
        </div>
      ) : (
        <>
          {filtered.length === 0 ? (
            <div className="jlpt-card p-5 text-center">
              <p className="text-muted">Không tìm thấy Kanji nào khớp với "{search}"</p>
            </div>
          ) : (
            <Row className="g-2 g-md-3">
              {filtered.map(item => (
                <Col xs={6} sm={4} md={3} lg={2} key={item.id}>
                  <div className="kanji-card text-center" onClick={() => openDetail(item)}
                    style={{ padding: '16px 12px', position: 'relative', overflow: 'hidden', minHeight: 140, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    {/* Stroke count badge */}
                    <div style={{ position: 'absolute', top: 6, right: 8, fontSize: 10, fontWeight: 700, color: '#94a3b8', background: '#f8fafc', borderRadius: 999, padding: '1px 6px' }}>
                      {item.stroke_count} nét
                    </div>

                    {/* Kanji char */}
                    <div>
                      <div style={{ fontSize: 'clamp(2rem, 8vw, 3rem)', fontWeight: 900, color: '#0f172a', fontFamily: 'Noto Sans JP,sans-serif', lineHeight: 1.1, marginBottom: 6 }}>
                        {item.kanji}
                      </div>
                      <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 999, padding: '2px 10px', display: 'inline-block', fontSize: 11.5, fontWeight: 800, color: '#92400e', marginBottom: 4 }}>
                        {item.han_viet}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#2563eb', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', padding: '0 4px' }} title={item.meaning}>
                        {item.meaning}
                      </div>
                    </div>

                    {/* On/Kun */}
                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 8, marginTop: 6, fontSize: 10.5, color: '#94a3b8' }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <strong style={{ color: '#64748b' }}>On:</strong> {item.onyomi || '—'}
                      </div>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <strong style={{ color: '#64748b' }}>Kun:</strong> {item.kunyomi || '—'}
                      </div>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          )}
        </>
      )}

      {/* ── Kanji Detail Modal ── */}
      {selected && (
        <Modal isOpen={modalOpen} toggle={() => setModalOpen(false)} centered size="md" className="jlpt-modal">
          <ModalHeader toggle={() => setModalOpen(false)} className="border-0 pb-0">
            <div className="d-flex align-items-center gap-2">
              <span style={{ background: '#eff6ff', color: '#2563eb', fontSize: 12, fontWeight: 700, borderRadius: 999, padding: '3px 10px' }}>
                Kanji {selected.level}
              </span>
              <span className="fw-bold text-navy-dark">Chi tiết Chữ Hán</span>
            </div>
          </ModalHeader>
          <ModalBody className="p-4 pt-2">
            {/* Big Kanji */}
            <div className="text-center mb-4">
              <div style={{ fontSize: 'clamp(4rem, 15vw, 7rem)', fontWeight: 900, color: '#0f172a', fontFamily: 'Noto Sans JP,sans-serif', lineHeight: 1, marginBottom: 8 }}>
                {selected.kanji}
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#d97706', marginBottom: 4 }}>{selected.han_viet}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 16 }}>{selected.meaning}</div>
              <Button color="primary" size="sm" className="rounded-pill px-4 fw-bold shadow-sm d-inline-flex align-items-center gap-2"
                onClick={() => speakJapanese(selected.kanji)}>
                <Volume2 size={16} /> Nghe phát âm
              </Button>
            </div>

            {/* Stats */}
            <div style={{ background: '#f8fafc', borderRadius: 14, padding: 16, marginBottom: 16 }}>
              <Row className="text-center g-2">
                <Col xs={4}>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' }}>Số nét</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{selected.stroke_count}</div>
                </Col>
                <Col xs={4}>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' }}>Âm On</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#2563eb', fontFamily: 'Noto Sans JP,sans-serif' }}>{selected.onyomi || '—'}</div>
                </Col>
                <Col xs={4}>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' }}>Âm Kun</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#059669', fontFamily: 'Noto Sans JP,sans-serif' }}>{selected.kunyomi || '—'}</div>
                </Col>
              </Row>
            </div>

            {/* Examples */}
            {selected.examples && selected.examples.length > 0 && (
              <div>
                <h6 className="fw-bold text-navy-dark mb-2 d-flex align-items-center gap-1" style={{ fontSize: 13 }}>
                  <BookOpen size={15} color="#2563eb" />
                  Từ vựng ghép thông dụng
                </h6>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {selected.examples.map((ex, idx) => (
                    <div key={idx} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontWeight: 800, color: '#0f172a', fontSize: 16, fontFamily: 'Noto Sans JP,sans-serif', marginRight: 8 }}>{ex.w}</span>
                        <span style={{ color: '#2563eb', fontSize: 13, fontFamily: 'Noto Sans JP,sans-serif', marginRight: 8 }}>({ex.k})</span>
                        <span style={{ color: '#64748b', fontSize: 13 }}>— {ex.m}</span>
                      </div>
                      <button type="button" style={{ background: '#eff6ff', border: 'none', borderRadius: 8, padding: '5px 7px', cursor: 'pointer' }}
                        onClick={() => speakJapanese(ex.k || ex.w)}>
                        <Volume2 size={14} color="#2563eb" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ModalBody>
        </Modal>
      )}
    </Container>
  );
};

export default KanjiPage;
