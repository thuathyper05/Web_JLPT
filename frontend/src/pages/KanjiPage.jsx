import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Badge,
  Input,
  Button,
  Spinner,
  Modal,
  ModalHeader,
  ModalBody
} from 'reactstrap';
import {
  PenTool,
  Volume2,
  Search,
  Sparkles,
  Info,
  BookOpen,
  Filter,
  CheckCircle,
  Layers
} from 'lucide-react';
import { kanjiService, speakJapanese } from '../services/api';
import { sounds } from '../services/sounds';

const KanjiPage = ({ currentLevel = 'N5' }) => {
  const [kanjiList, setKanjiList] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedKanji, setSelectedKanji] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKanji();
  }, [currentLevel]);

  const fetchKanji = async () => {
    setLoading(true);
    try {
      const res = await kanjiService.getKanjiList({ level: currentLevel });
      setKanjiList(res.data);
    } catch (err) {
      console.error('Error fetching kanji:', err);
    } finally {
      setLoading(false);
    }
  };

  const openKanjiDetail = (item) => {
    sounds.playFlip();
    setSelectedKanji(item);
    setModalOpen(true);
    speakJapanese(item.kanji);
  };

  const filtered = kanjiList.filter(item => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.kanji.includes(q) ||
      item.han_viet?.toLowerCase().includes(q) ||
      item.meaning?.toLowerCase().includes(q) ||
      item.onyomi?.toLowerCase().includes(q) ||
      item.kunyomi?.toLowerCase().includes(q)
    );
  });

  return (
    <Container className="py-3 py-md-4">
      {/* Header Banner */}
      <div className="bg-white p-4 rounded-4 shadow-sm border mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <div
              className="d-flex align-items-center justify-content-center rounded-circle shadow-sm"
              style={{
                width: '54px',
                height: '54px',
                background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
                color: 'white'
              }}
            >
              <PenTool size={26} />
            </div>
            <div>
              <h4 className="fw-bold mb-1 text-navy-dark">Học Chữ Hán (Kanji {currentLevel})</h4>
              <p className="text-muted small mb-0">
                Tra cứu âm Hán Việt, Onyomi, Kunyomi, số nét và từ vựng ghép chuẩn JLPT
              </p>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <div className="position-relative">
              <Input
                type="text"
                placeholder="Tìm Kanji, Hán Việt, Nghĩa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-control-sm"
                style={{ width: '220px' }}
              />
            </div>
            <Badge color="primary" pill className="fs-6 px-3 py-2">
              {kanjiList.length} Chữ Hán
            </Badge>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner color="primary" />
          <p className="mt-2 text-muted">Đang tải bảng chữ Hán {currentLevel}...</p>
        </div>
      ) : (
        <Row className="g-2 g-md-3">
          {filtered.map((item) => (
            <Col xs={6} sm={4} md={3} lg={2} key={item.id}>
              <Card
                className="jlpt-card border-0 shadow-sm h-100 text-center hover-shadow position-relative overflow-hidden"
                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                onClick={() => openKanjiDetail(item)}
              >
                <div
                  className="position-absolute top-0 end-0 px-2 py-1 text-muted"
                  style={{ fontSize: '10px' }}
                >
                  {item.stroke_count} nét
                </div>

                <CardBody className="p-3 d-flex flex-column justify-content-between">
                  <div className="my-2">
                    <div className="display-4 fw-bold text-dark font-monospace mb-1" style={{ fontSize: '2.8rem' }}>
                      {item.kanji}
                    </div>
                    <Badge color="warning" className="text-dark fw-bold px-2 py-1 mb-2">
                      {item.han_viet}
                    </Badge>
                    <div className="text-primary fw-semibold small text-truncate" title={item.meaning}>
                      {item.meaning}
                    </div>
                  </div>

                  <div className="border-top pt-2 text-muted" style={{ fontSize: '11px' }}>
                    <div className="text-truncate"><strong>On:</strong> {item.onyomi || '—'}</div>
                    <div className="text-truncate"><strong>Kun:</strong> {item.kunyomi || '—'}</div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Detail Kanji Modal */}
      {selectedKanji && (
        <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)} centered size="md">
          <ModalHeader toggle={() => setModalOpen(!modalOpen)} className="border-0 pb-0">
            <div className="d-flex align-items-center gap-2">
              <Badge color="primary" pill>Kanji {selectedKanji.level}</Badge>
              <span className="fw-bold text-navy-dark">Chi tiết Chữ Hán</span>
            </div>
          </ModalHeader>
          <ModalBody className="p-4 pt-2">
            <div className="text-center my-3">
              <div className="display-1 fw-bold text-dark font-monospace mb-1">
                {selectedKanji.kanji}
              </div>
              <h3 className="fw-black text-warning mb-2">
                {selectedKanji.han_viet}
              </h3>
              <p className="fs-5 fw-bold text-navy-dark mb-3">
                {selectedKanji.meaning}
              </p>

              <Button
                color="primary"
                size="sm"
                className="rounded-pill px-4 py-2 d-inline-flex align-items-center gap-2 shadow-sm"
                onClick={() => speakJapanese(selectedKanji.kanji)}
              >
                <Volume2 size={18} /> Nghe phát âm chữ
              </Button>
            </div>

            <div className="bg-light p-3 rounded-3 mb-3">
              <Row className="text-center g-2">
                <Col xs={4}>
                  <small className="text-muted d-block">Số nét viết</small>
                  <strong className="fs-6 text-dark">{selectedKanji.stroke_count} nét</strong>
                </Col>
                <Col xs={4}>
                  <small className="text-muted d-block">Âm On (Onyomi)</small>
                  <strong className="fs-6 text-primary">{selectedKanji.onyomi || '—'}</strong>
                </Col>
                <Col xs={4}>
                  <small className="text-muted d-block">Âm Kun (Kunyomi)</small>
                  <strong className="fs-6 text-success">{selectedKanji.kunyomi || '—'}</strong>
                </Col>
              </Row>
            </div>

            {/* Examples of vocabulary using this Kanji */}
            {selectedKanji.examples && selectedKanji.examples.length > 0 && (
              <div>
                <h6 className="fw-bold text-navy-dark mb-2 d-flex align-items-center gap-1">
                  <BookOpen size={16} className="text-primary" />
                  <span>Từ vựng ghép thông dụng:</span>
                </h6>
                <div className="list-group">
                  {selectedKanji.examples.map((ex, idx) => (
                    <div
                      key={idx}
                      className="list-group-item d-flex justify-content-between align-items-center py-2"
                    >
                      <div>
                        <span className="fw-bold text-dark fs-6 me-2 font-monospace">{ex.w}</span>
                        <span className="text-primary fw-medium small me-2">({ex.k})</span>
                        <span className="text-secondary small">— {ex.m}</span>
                      </div>
                      <Button
                        color="light"
                        size="sm"
                        className="p-1 rounded-circle border"
                        onClick={() => speakJapanese(ex.k || ex.w)}
                      >
                        <Volume2 size={15} className="text-primary" />
                      </Button>
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
