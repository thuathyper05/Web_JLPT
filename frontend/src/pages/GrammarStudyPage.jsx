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
  Spinner
} from 'reactstrap';
import {
  BookOpen,
  Volume2,
  Search,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Info,
  HelpCircle,
  Layers,
  CheckSquare
} from 'lucide-react';
import { grammarService, speakJapanese } from '../services/api';
import { sounds } from '../services/sounds';
import { useApp } from '../context/AppContext';

export default function GrammarStudyPage({ initialLesson = 1, onNavigate }) {
  const { recordStudyTick } = useApp();
  const [selectedLesson, setSelectedLesson] = useState(initialLesson);
  const [grammarList, setGrammarList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [masteredMap, setMasteredMap] = useState(() => {
    try {
      const saved = localStorage.getItem('hyper_mastered_grammar');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('hyper_mastered_grammar', JSON.stringify(masteredMap));
    } catch {}
  }, [masteredMap]);

  useEffect(() => {
    const fetchGrammar = async () => {
      setLoading(true);
      try {
        const res = await grammarService.getLessonGrammar(selectedLesson);
        if (res.data?.success && Array.isArray(res.data.data)) {
          setGrammarList(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching grammar:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGrammar();
  }, [selectedLesson]);

  const toggleMastered = (id) => {
    sounds.playCorrect?.();
    setMasteredMap(prev => {
      const next = { ...prev, [id]: !prev[id] };
      if (next[id] && typeof recordStudyTick === 'function') {
        recordStudyTick('grammar_mastered', 20);
      }
      return next;
    });
  };

  const filteredList = grammarList.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title?.toLowerCase().includes(q) ||
      item.structure?.toLowerCase().includes(q) ||
      item.meaning?.toLowerCase().includes(q) ||
      item.usage_notes?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="app-shell" style={{ maxWidth: '1040px' }}>
      {/* ── 1. HEADER SECTION ── */}
      <div className="app-page-header mb-4">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3 pb-1">
          <div>
            <div className="app-header-tag">
              <BookOpen size={13} />
              <span>BUNPOU (文法) • NGỮ PHÁP MINNA NO NIHONGO</span>
            </div>
            <h1 className="app-header-title">
              Ngữ Pháp Bài {selectedLesson < 10 ? `0${selectedLesson}` : selectedLesson}
            </h1>
            <p className="app-header-subtitle">
              Hệ thống mẫu câu chuẩn kèm công thức, lưu ý bẫy đề thi và ví dụ thực tế phát âm chuẩn Tokyo.
            </p>
          </div>

          {/* Quick Lesson Switcher */}
          <div className="d-flex align-items-center gap-2 flex-shrink-0 ms-auto">
            <span className="small text-muted fw-semibold" style={{ fontSize: '12px' }}>
              Chọn bài:
            </span>
            <Input
              type="select"
              value={selectedLesson}
              onChange={(e) => {
                sounds.playFlip?.();
                setSelectedLesson(parseInt(e.target.value));
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

        {/* Search Bar */}
        <div className="position-relative w-100" style={{ maxWidth: '380px' }}>
          <Input
            type="text"
            placeholder="Tìm mẫu câu, công thức, từ khóa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-control-sm rounded-pill pe-4"
            style={{ fontSize: '13px', background: '#ffffff', height: '38px', paddingLeft: '14px' }}
          />
          <Search size={14} className="position-absolute top-50 end-0 translate-middle-y me-3 text-muted" />
        </div>
      </div>

      {/* ── 2. GRAMMAR CARDS LIST ── */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner color="primary" />
          <p className="mt-2 text-muted small">Đang tải cấu trúc ngữ pháp Bài {selectedLesson}...</p>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="p-4 rounded-4 bg-white border text-center my-4 shadow-xs">
          <p className="text-muted mb-0">Không tìm thấy mẫu câu nào phù hợp với từ khóa.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3.5">
          {filteredList.map((item, idx) => {
            const isMastered = Boolean(masteredMap[item.id]);
            const examples = Array.isArray(item.examples) ? item.examples : [];

            return (
              <div
                key={item.id || idx}
                className="app-surface-card p-3.5 p-md-4 rounded-4 border bg-white shadow-xs transition-all"
                style={{
                  borderColor: isMastered ? '#bbf7d0' : '#e2e8f0',
                  boxShadow: isMastered ? '0 2px 10px rgba(16, 185, 129, 0.08)' : '0 1px 3px rgba(15, 23, 42, 0.04)'
                }}
              >
                {/* Header Row: Title & Action */}
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2.5 pb-2 border-bottom border-slate-100">
                  <div className="d-flex align-items-center gap-2">
                    <span
                      className="badge rounded-pill fw-bold text-white px-2.5 py-1"
                      style={{
                        background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
                        fontSize: '11px'
                      }}
                    >
                      Mẫu {item.order_num || idx + 1}
                    </span>
                    <h5 className="fw-black text-navy-dark mb-0" style={{ fontSize: '15px' }}>
                      {item.title}
                    </h5>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleMastered(item.id)}
                    className={`btn btn-sm rounded-pill px-3 py-1 d-inline-flex align-items-center gap-1.5 border transition-all ${
                      isMastered ? 'btn-success text-white shadow-xs' : 'btn-light text-secondary'
                    }`}
                    style={{ fontSize: '11.5px', fontWeight: 600 }}
                  >
                    <CheckCircle2 size={13} />
                    <span>{isMastered ? 'Đã hiểu rõ' : 'Đánh dấu đã hiểu'}</span>
                  </button>
                </div>

                {/* Structure Formula Pill */}
                <div className="mb-3">
                  <div className="small fw-bold text-muted mb-1" style={{ fontSize: '11.5px' }}>
                    Cấu trúc công thức:
                  </div>
                  <div
                    className="p-2.5 rounded-3 fw-bold font-monospace text-navy-dark"
                    style={{
                      background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
                      border: '1px solid #bfdbfe',
                      fontSize: '13.5px',
                      wordBreak: 'break-word'
                    }}
                  >
                    {item.structure}
                  </div>
                </div>

                {/* Meaning & Usage */}
                <div className="mb-3">
                  <div className="small fw-bold text-muted mb-1" style={{ fontSize: '11.5px' }}>
                    Ý nghĩa & Cách dùng:
                  </div>
                  <div className="text-secondary" style={{ fontSize: '13px', lineHeight: '1.6' }}>
                    {item.meaning}
                  </div>
                </div>

                {/* Usage Notes / Traps */}
                {item.usage_notes && (
                  <div
                    className="p-2.5 rounded-3 mb-3 small d-flex align-items-start gap-2"
                    style={{
                      background: 'var(--warning-subtle, #fefce8)',
                      border: '1px solid var(--warning-border, #fef08a)',
                      color: '#854d0e',
                      fontSize: '12px'
                    }}
                  >
                    <Info size={15} className="flex-shrink-0 mt-0.5" />
                    <div style={{ lineHeight: '1.5' }}>
                      <strong>Lưu ý bẫy đề thi:</strong> {item.usage_notes}
                    </div>
                  </div>
                )}

                {/* Example Sentences */}
                {examples.length > 0 && (
                  <div>
                    <div className="small fw-bold text-muted mb-1.5" style={{ fontSize: '11.5px' }}>
                      Câu ví dụ thực tế:
                    </div>
                    <div className="d-flex flex-column gap-2">
                      {examples.map((ex, exIdx) => (
                        <div
                          key={exIdx}
                          className="p-2.5 rounded-3 border d-flex justify-content-between align-items-center gap-2"
                          style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}
                        >
                          <div className="min-w-0">
                            <div className="fw-bold text-navy-dark" style={{ fontSize: '13.5px' }}>
                              {ex.jp}
                            </div>
                            {ex.kana && ex.kana !== ex.jp && (
                              <div className="small text-muted font-monospace" style={{ fontSize: '11.5px' }}>
                                {ex.kana}
                              </div>
                            )}
                            <div className="small text-secondary mt-0.5" style={{ fontSize: '12px' }}>
                              {ex.vi}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => speakJapanese(ex.jp || ex.kana)}
                            className="btn btn-sm btn-light border rounded-circle p-1 text-primary flex-shrink-0 d-flex align-items-center justify-content-center"
                            style={{ width: '32px', height: '32px' }}
                            title="Nghe phát âm chuẩn Tokyo"
                            aria-label="Nghe câu ví dụ"
                          >
                            <Volume2 size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
