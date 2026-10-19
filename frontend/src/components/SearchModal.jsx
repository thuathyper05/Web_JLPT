import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  Input,
  ListGroup,
  ListGroupItem,
  Badge,
  Button,
  Spinner
} from 'reactstrap';
import { Search, Volume2, Star, X, Filter, Sparkles, BookOpen, Globe, PenTool } from 'lucide-react';
import { vocabService, speakJapanese } from '../services/api';
import { useApp } from '../context/AppContext';
import { sounds } from '../services/sounds';

const QUICK_SUGGESTIONS = [
  { text: 'わたし', type: 'vocab' },
  { text: '先生', type: 'vocab' },
  { text: '行きます', type: 'vocab' },
  { text: 'テレビ', type: 'katakana' },
  { text: 'コーヒー', type: 'katakana' },
  { text: 'ホテル', type: 'katakana' },
  { text: '日', type: 'kanji' },
  { text: '本', type: 'kanji' },
  { text: '人', type: 'kanji' },
  { text: '経済', type: 'dict' },
  { text: '政治', type: 'dict' },
  { text: '法律', type: 'dict' }
];

const JLPT_COLORS = {
  N1: { bg: '#fef2f2', border: '#fca5a5', text: '#dc2626' },
  N2: { bg: '#fff7ed', border: '#fdba74', text: '#ea580c' },
  N3: { bg: '#fefce8', border: '#fde047', text: '#ca8a04' },
  N4: { bg: '#f0fdf4', border: '#86efac', text: '#16a34a' },
  N5: { bg: '#eff6ff', border: '#93c5fd', text: '#2563eb' },
  COMMON: { bg: '#f5f3ff', border: '#d8b4fe', text: '#7c3aed' },
  'N1-N5': { bg: '#f8fafc', border: '#cbd5e1', text: '#475569' }
};

const SearchModal = ({ isOpen, toggle, onSelectLesson }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [vocabResults, setVocabResults] = useState([]);
  const [kanjiResults, setKanjiResults] = useState([]);
  const [dictResults, setDictResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'vocab', 'kanji', 'katakana', 'dict'
  const [filterLesson, setFilterLesson] = useState('all');
  const { toggleFavorite, isFavorite } = useApp();

  useEffect(() => {
    if (!searchTerm.trim()) {
      setVocabResults([]);
      setKanjiResults([]);
      setDictResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await vocabService.search(searchTerm.trim());
        const data = res.data;
        if (Array.isArray(data)) {
          setVocabResults(data);
          setKanjiResults([]);
          setDictResults([]);
        } else if (data) {
          setVocabResults(data.vocabularies || []);
          setKanjiResults(data.kanji || []);
          setDictResults(data.dictionary || []);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const katakanaVocab = vocabResults.filter(v => /[\u30A0-\u30FF]/.test(v.clean_kana || v.kana || ''));

  const displayedVocab = vocabResults.filter(item => {
    if (filterLesson !== 'all' && item.lesson_number !== parseInt(filterLesson, 10)) {
      return false;
    }
    if (activeTab === 'katakana') {
      return /[\u30A0-\u30FF]/.test(item.clean_kana || item.kana || '');
    }
    if (activeTab === 'kanji' || activeTab === 'dict') {
      return false;
    }
    return true;
  });

  const displayedKanji = (activeTab === 'all' || activeTab === 'kanji') ? kanjiResults : [];
  const displayedDict = (activeTab === 'all' || activeTab === 'dict') ? dictResults : [];

  const totalResultsCount = (
    (activeTab === 'all' ? vocabResults.length + kanjiResults.length + dictResults.length : 0) +
    (activeTab === 'vocab' ? vocabResults.length : 0) +
    (activeTab === 'kanji' ? kanjiResults.length : 0) +
    (activeTab === 'katakana' ? katakanaVocab.length : 0) +
    (activeTab === 'dict' ? dictResults.length : 0)
  );

  const availableLessons = Array.from(new Set(vocabResults.map(r => r.lesson_number)))
    .filter(Boolean)
    .sort((a, b) => a - b);

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      size="lg"
      centered
      className="spotlight-search-modal jlpt-modal"
    >
      <ModalHeader toggle={toggle} className="border-bottom pb-2 pt-3 px-3 px-sm-4 bg-white">
        <div className="d-flex align-items-center gap-2.5">
          <div className="bg-primary bg-opacity-10 text-primary p-2 rounded-3 d-flex align-items-center justify-content-center">
            <Search size={18} strokeWidth={2.5} />
          </div>
          <div>
            <h6 className="fw-bold mb-0 text-navy-dark fs-6">Đại Từ Điển Tiếng Nhật N1 – N5</h6>
            <span className="text-muted small" style={{ fontSize: '11.5px' }}>
              Tra cứu toàn bộ Từ vựng Minna no Nihongo, Hán tự Kanji & 170.000+ từ điển JLPT N1-N5
            </span>
          </div>
        </div>
      </ModalHeader>

      <ModalBody className="p-3 p-sm-4">
        {/* Spotlight Command Bar */}
        <div className="d-flex align-items-center bg-light border rounded-4 px-3 py-1 mb-3 transition-all focus-within-shadow">
          <Search size={18} className="text-muted flex-shrink-0 me-2" />
          <input
            type="text"
            className="form-control border-0 bg-transparent shadow-none px-0 py-2 fs-6 spotlight-search-input"
            placeholder="Gõ từ cần tra (VD: 先生, terebi, gakusei, 経済, 日, ăn, đi...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
          {searchTerm ? (
            <button
              type="button"
              className="btn btn-sm btn-link text-muted p-1 text-decoration-none"
              onClick={() => setSearchTerm('')}
              title="Xóa tìm kiếm"
            >
              <X size={16} />
            </button>
          ) : (
            <span className="badge bg-white text-muted border border-slate-200 fw-medium small px-2 py-1 d-none d-sm-inline-block">
              ESC
            </span>
          )}
        </div>

        {/* Dynamic Category Tabs */}
        {(vocabResults.length > 0 || kanjiResults.length > 0 || dictResults.length > 0) && (
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3 px-1">
            <div className="d-flex align-items-center gap-1.5 flex-wrap">
              <button
                type="button"
                className={`btn btn-sm py-1 px-2.5 rounded-pill fw-semibold text-xs transition-all ${
                  activeTab === 'all'
                    ? 'btn-primary shadow-xs'
                    : 'btn-outline-secondary bg-white text-dark border-slate-200'
                }`}
                onClick={() => setActiveTab('all')}
              >
                Tất cả ({vocabResults.length + kanjiResults.length + dictResults.length})
              </button>
              {vocabResults.length > 0 && (
                <button
                  type="button"
                  className={`btn btn-sm py-1 px-2.5 rounded-pill fw-semibold text-xs transition-all ${
                    activeTab === 'vocab'
                      ? 'btn-primary shadow-xs'
                      : 'btn-outline-secondary bg-white text-dark border-slate-200'
                  }`}
                  onClick={() => setActiveTab('vocab')}
                >
                  Minna N5 ({vocabResults.length})
                </button>
              )}
              {kanjiResults.length > 0 && (
                <button
                  type="button"
                  className={`btn btn-sm py-1 px-2.5 rounded-pill fw-semibold text-xs transition-all ${
                    activeTab === 'kanji'
                      ? 'btn-primary shadow-xs'
                      : 'btn-outline-secondary bg-white text-dark border-slate-200'
                  }`}
                  onClick={() => setActiveTab('kanji')}
                >
                  Hán tự Kanji ({kanjiResults.length})
                </button>
              )}
              {katakanaVocab.length > 0 && (
                <button
                  type="button"
                  className={`btn btn-sm py-1 px-2.5 rounded-pill fw-semibold text-xs transition-all ${
                    activeTab === 'katakana'
                      ? 'btn-primary shadow-xs'
                      : 'btn-outline-secondary bg-white text-dark border-slate-200'
                  }`}
                  onClick={() => setActiveTab('katakana')}
                >
                  Katakana ({katakanaVocab.length})
                </button>
              )}
              {dictResults.length > 0 && (
                <button
                  type="button"
                  className={`btn btn-sm py-1 px-2.5 rounded-pill fw-semibold text-xs transition-all ${
                    activeTab === 'dict'
                      ? 'btn-primary shadow-xs'
                      : 'btn-outline-secondary bg-white text-dark border-slate-200'
                  }`}
                  onClick={() => setActiveTab('dict')}
                >
                  Từ điển N1–N5 ({dictResults.length})
                </button>
              )}
            </div>

            {availableLessons.length > 1 && activeTab !== 'kanji' && activeTab !== 'dict' && (
              <div className="d-flex align-items-center gap-1.5">
                <Filter size={13} className="text-muted" />
                <Input
                  type="select"
                  bsSize="sm"
                  value={filterLesson}
                  onChange={(e) => setFilterLesson(e.target.value)}
                  className="w-auto py-1 px-2 small rounded-pill border-slate-200"
                >
                  <option value="all">Tất cả bài</option>
                  {availableLessons.map(num => (
                    <option key={num} value={num}>Bài {num < 10 ? `0${num}` : num}</option>
                  ))}
                </Input>
              </div>
            )}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="text-center py-5">
            <Spinner color="primary" size="sm" />
            <span className="ms-2 text-muted small fw-medium">Đang tra cứu từ điển toàn quốc N1–N5...</span>
          </div>
        )}

        {/* Empty Search Suggestion State */}
        {!loading && !searchTerm && (
          <div className="py-4 px-2 text-center">
            <div className="d-inline-flex align-items-center justify-content-center p-3 rounded-circle bg-primary bg-opacity-10 text-primary mb-3">
              <Globe size={24} />
            </div>
            <h6 className="fw-bold text-dark mb-1">Gợi ý tra nhanh toàn cấp độ</h6>
            <p className="text-muted small mb-3">
              Bấm vào từ khóa để xem kết quả chi tiết từ kho từ điển N1 – N5:
            </p>
            <div className="d-flex flex-wrap justify-content-center gap-2">
              {QUICK_SUGGESTIONS.map(s => (
                <button
                  key={s.text}
                  type="button"
                  className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold text-xs hover-lift ${
                    s.type === 'kanji'
                      ? 'btn-outline-info bg-white'
                      : s.type === 'katakana'
                      ? 'btn-outline-warning bg-white text-dark'
                      : s.type === 'dict'
                      ? 'btn-outline-danger bg-white text-dark'
                      : 'btn-outline-primary bg-white'
                  }`}
                  onClick={() => setSearchTerm(s.text)}
                >
                  {s.text}
                </button>
              ))}
            </div>
            <div className="mt-4 pt-3 border-top text-muted small d-flex align-items-center justify-content-center gap-2">
              <BookOpen size={14} />
              <span>Kho dữ liệu tích hợp: 1.512 từ vựng Minna no Nihongo, 80 Kanji & 170.000+ từ JLPT N1-N5</span>
            </div>
          </div>
        )}

        {/* No Results Found */}
        {!loading && searchTerm && totalResultsCount === 0 && (
          <div className="text-center py-5 text-muted">
            <p className="mb-1 fw-bold text-dark fs-6">Không tìm thấy từ khớp với "{searchTerm}"</p>
            <small>Gợi ý: Thử tìm theo phiên âm Romaji, Hiragana, Katakana, chữ Hán hoặc từ khóa tiếng Việt ngắn hơn.</small>
          </div>
        )}

        {/* Results List */}
        {!loading && totalResultsCount > 0 && (
          <ListGroup flush className="search-results-list" style={{ maxHeight: '460px', overflowY: 'auto' }}>
            {/* 1. KANJI RESULTS CARDS */}
            {displayedKanji.map((kj) => (
              <ListGroupItem
                key={`kj-${kj.id}`}
                className="py-2.5 px-3 border rounded-3 mb-2 bg-white hover-shadow transition-all"
                style={{ borderColor: '#ddd6fe', borderLeft: '4px solid #7c3aed' }}
              >
                <div className="d-flex justify-content-between align-items-start">
                  <div className="d-flex align-items-center gap-2.5 flex-wrap">
                    <span className="fs-3 fw-black text-purple-700 font-monospace" style={{ color: '#6d28d9' }}>
                      {kj.kanji}
                    </span>
                    <Badge color="primary" pill className="bg-purple-100 text-purple-700 border border-purple-200" style={{ fontSize: '11px' }}>
                      Hán Việt: {kj.han_viet}
                    </Badge>
                    <Badge color="light" pill className="text-muted border" style={{ fontSize: '10.5px' }}>
                      {kj.stroke_count} nét
                    </Badge>
                    <Badge color="light" pill className="text-muted border" style={{ fontSize: '10.5px' }}>
                      {kj.level || 'N5'}
                    </Badge>
                  </div>
                  <Button
                    color="light"
                    size="sm"
                    className="p-1.5 rounded-circle border text-primary audio-btn hover-squish"
                    onClick={() => speakJapanese(kj.kanji)}
                    title="Nghe phát âm Hán tự"
                  >
                    <Volume2 size={14} />
                  </Button>
                </div>
                <div className="mt-1 text-dark small fw-medium">
                  <strong>Nghĩa:</strong> {kj.meaning}
                </div>
                <div className="d-flex gap-3 text-muted small mt-1 flex-wrap" style={{ fontSize: '11.5px' }}>
                  {kj.onyomi && <span><strong>Onyomi:</strong> <span className="font-monospace text-primary">{kj.onyomi}</span></span>}
                  {kj.kunyomi && <span><strong>Kunyomi:</strong> <span className="font-monospace text-success">{kj.kunyomi}</span></span>}
                </div>
                {Array.isArray(kj.examples) && kj.examples.length > 0 && (
                  <div className="mt-1.5 pt-1.5 border-top d-flex flex-wrap gap-1.5">
                    {kj.examples.slice(0, 3).map((ex, i) => (
                      <span
                        key={i}
                        className="badge bg-light text-secondary border font-monospace px-2 py-0.5 cursor-pointer"
                        style={{ fontSize: '11px' }}
                        onClick={() => speakJapanese(ex.w || ex.k)}
                        title={`Bấm để nghe: ${ex.w} (${ex.k})`}
                      >
                        {ex.w} ({ex.k}): {ex.m}
                      </span>
                    ))}
                  </div>
                )}
              </ListGroupItem>
            ))}

            {/* 2. MINNA NO NIHONGO VOCABULARY RESULTS CARDS */}
            {displayedVocab.map((item) => {
              const isFav = isFavorite(item.id, item.is_favorite);
              const cleanMeaning = item.clean_vietnamese || item.vietnamese;
              const cleanK = item.clean_kana || item.kana;
              const hasKanji = item.kanji && item.kanji !== '–' && item.kanji !== '-' && item.kanji.trim() !== '';
              const isKatakana = /[\u30A0-\u30FF]/.test(cleanK);

              return (
                <ListGroupItem
                  key={`vocab-${item.id}`}
                  className="d-flex justify-content-between align-items-center py-2.5 px-3 border rounded-3 mb-2 bg-white hover-shadow transition-all"
                  style={{ borderColor: 'var(--slate-200)' }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="d-flex align-items-baseline gap-2 flex-wrap">
                      {hasKanji && (
                        <span className="fs-5 fw-bold text-dark font-monospace">{item.kanji}</span>
                      )}
                      <span className={`fs-6 fw-bold font-monospace ${isKatakana ? 'text-amber-700' : 'text-primary'}`} style={{ color: isKatakana ? '#d97706' : undefined }}>
                        {cleanK}
                      </span>
                      {isKatakana && (
                        <Badge color="warning" pill className="bg-amber-50 text-amber-800 border border-amber-200" style={{ fontSize: '10px' }}>
                          Katakana
                        </Badge>
                      )}
                      {item.romaji && (
                        <span className="text-muted small fst-italic">[{item.romaji}]</span>
                      )}
                      <Badge
                        color="secondary"
                        pill
                        className="ms-1 cursor-pointer bg-slate-100 text-slate-700 border border-slate-200 hover-lift"
                        style={{ fontSize: '11px' }}
                        onClick={() => {
                          toggle();
                          if (onSelectLesson) onSelectLesson(item.lesson_number);
                        }}
                        title="Chuyển đến học bài này"
                      >
                        Bài {item.lesson_number}
                      </Badge>
                    </div>
                    <div className="text-secondary small mt-0.5 text-truncate">{cleanMeaning}</div>
                    {item.usage_note && (
                      <div className="text-muted small" style={{ fontSize: '11px' }}>
                        {item.usage_note}
                      </div>
                    )}
                  </div>

                  <div className="d-flex align-items-center gap-1.5 flex-shrink-0 ms-2">
                    <Button
                      color="light"
                      size="sm"
                      className="p-2 rounded-circle border text-primary audio-btn hover-squish"
                      onClick={() => speakJapanese(cleanK)}
                      title="Nghe phát âm chuẩn Tokyo"
                    >
                      <Volume2 size={15} />
                    </Button>
                    <Button
                      color="light"
                      size="sm"
                      className="p-2 rounded-circle border text-warning hover-squish"
                      onClick={() => {
                        sounds.playFlip();
                        toggleFavorite(item);
                      }}
                      title="Lưu vào yêu thích"
                    >
                      <Star
                        size={15}
                        className={isFav ? 'text-warning fill-warning' : 'text-muted'}
                        fill={isFav ? '#f59e0b' : 'none'}
                      />
                    </Button>
                  </div>
                </ListGroupItem>
              );
            })}

            {/* 3. GLOBAL N1-N5 DICTIONARY RESULTS CARDS */}
            {displayedDict.map((item) => {
              const isFav = isFavorite(item.id, false);
              const badgeStyle = JLPT_COLORS[item.jlpt] || JLPT_COLORS.COMMON;

              return (
                <ListGroupItem
                  key={`dict-${item.id}`}
                  className="d-flex justify-content-between align-items-center py-2.5 px-3 border rounded-3 mb-2 bg-white hover-shadow transition-all"
                  style={{ borderColor: 'var(--slate-200)', borderLeft: `4px solid ${badgeStyle.text}` }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="d-flex align-items-baseline gap-2 flex-wrap">
                      {item.kanji && (
                        <span className="fs-5 fw-bold text-dark font-monospace">{item.kanji}</span>
                      )}
                      <span className="fs-6 fw-bold text-primary font-monospace">{item.kana}</span>
                      <Badge
                        pill
                        style={{
                          backgroundColor: badgeStyle.bg,
                          borderColor: badgeStyle.border,
                          color: badgeStyle.text,
                          fontSize: '11px',
                          borderWidth: 1,
                          borderStyle: 'solid'
                        }}
                      >
                        JLPT {item.jlpt}
                      </Badge>
                      {item.is_common && (
                        <Badge color="light" pill className="text-muted border" style={{ fontSize: '10px' }}>
                          Phổ biến
                        </Badge>
                      )}
                    </div>
                    <div className="text-secondary small mt-0.5" style={{ fontSize: '12.5px', lineHeight: '1.4' }}>
                      {item.meaning}
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-1.5 flex-shrink-0 ms-2">
                    <Button
                      color="light"
                      size="sm"
                      className="p-2 rounded-circle border text-primary audio-btn hover-squish"
                      onClick={() => speakJapanese(item.kana || item.kanji)}
                      title="Nghe phát âm Tokyo"
                    >
                      <Volume2 size={15} />
                    </Button>
                    <Button
                      color="light"
                      size="sm"
                      className="p-2 rounded-circle border text-warning hover-squish"
                      onClick={() => {
                        sounds.playFlip();
                        toggleFavorite(item);
                      }}
                      title="Lưu vào yêu thích"
                    >
                      <Star
                        size={15}
                        className={isFav ? 'text-warning fill-warning' : 'text-muted'}
                        fill={isFav ? '#f59e0b' : 'none'}
                      />
                    </Button>
                  </div>
                </ListGroupItem>
              );
            })}
          </ListGroup>
        )}
      </ModalBody>
    </Modal>
  );
};

export default SearchModal;
