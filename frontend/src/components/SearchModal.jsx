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
import { Search, Volume2, Star, X, Filter, Sparkles, BookOpen, PenTool, Hash } from 'lucide-react';
import { vocabService, speakJapanese } from '../services/api';
import { useApp } from '../context/AppContext';
import { sounds } from '../services/sounds';

const QUICK_SUGGESTIONS = [
  { text: 'わたし', type: 'vocab' },
  { text: '先生', type: 'vocab' },
  { text: '行きます', type: 'vocab' },
  { text: '食べます', type: 'vocab' },
  { text: 'テレビ', type: 'katakana' },
  { text: 'コーヒー', type: 'katakana' },
  { text: 'ホテル', type: 'katakana' },
  { text: '日', type: 'kanji' },
  { text: '本', type: 'kanji' },
  { text: '人', type: 'kanji' },
  { text: '学', type: 'kanji' }
];

const SearchModal = ({ isOpen, toggle, onSelectLesson }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [vocabResults, setVocabResults] = useState([]);
  const [kanjiResults, setKanjiResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'vocab', 'kanji', 'katakana'
  const [filterLesson, setFilterLesson] = useState('all');
  const { toggleFavorite, isFavorite } = useApp();

  useEffect(() => {
    if (!searchTerm.trim()) {
      setVocabResults([]);
      setKanjiResults([]);
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
        } else if (data) {
          setVocabResults(data.vocabularies || []);
          setKanjiResults(data.kanji || []);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 160);

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
    if (activeTab === 'kanji') {
      return false;
    }
    return true;
  });

  const displayedKanji = (activeTab === 'all' || activeTab === 'kanji') ? kanjiResults : [];

  const totalResultsCount = (activeTab === 'all'
    ? vocabResults.length + kanjiResults.length
    : activeTab === 'vocab'
    ? vocabResults.length
    : activeTab === 'kanji'
    ? kanjiResults.length
    : katakanaVocab.length);

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
            <h6 className="fw-bold mb-0 text-navy-dark fs-6">Từ Điển & Tra Cứu Toàn Diện N5</h6>
            <span className="text-muted small" style={{ fontSize: '11.5px' }}>
              Tra cứu Từ vựng Minna no Nihongo, Katakana & Hán tự Kanji N5
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
            placeholder="Gõ từ cần tra (VD: 先生, terebi, gakusei, học sinh, ăn, 日, học...)"
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
        {(vocabResults.length > 0 || kanjiResults.length > 0) && (
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
                Tất cả ({vocabResults.length + kanjiResults.length})
              </button>
              <button
                type="button"
                className={`btn btn-sm py-1 px-2.5 rounded-pill fw-semibold text-xs transition-all ${
                  activeTab === 'vocab'
                    ? 'btn-primary shadow-xs'
                    : 'btn-outline-secondary bg-white text-dark border-slate-200'
                }`}
                onClick={() => setActiveTab('vocab')}
              >
                Từ vựng ({vocabResults.length})
              </button>
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
                  Chữ Hán Kanji ({kanjiResults.length})
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
            </div>

            {availableLessons.length > 1 && activeTab !== 'kanji' && (
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
            <span className="ms-2 text-muted small fw-medium">Đang tra cứu từ điển N5...</span>
          </div>
        )}

        {/* Empty Search Suggestion State */}
        {!loading && !searchTerm && (
          <div className="py-4 px-2 text-center">
            <div className="d-inline-flex align-items-center justify-content-center p-3 rounded-circle bg-primary bg-opacity-10 text-primary mb-3">
              <Sparkles size={24} />
            </div>
            <h6 className="fw-bold text-dark mb-1">Gợi ý tra nhanh</h6>
            <p className="text-muted small mb-3">
              Bấm vào từ khóa để xem kết quả chi tiết từ kho từ điển:
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
              <span>Kho dữ liệu tích hợp: 1,512 từ vựng Minna no Nihongo & 80 Chữ Hán N5</span>
            </div>
          </div>
        )}

        {/* No Results Found */}
        {!loading && searchTerm && totalResultsCount === 0 && (
          <div className="text-center py-5 text-muted">
            <p className="mb-1 fw-bold text-dark fs-6">Không tìm thấy từ khớp với "{searchTerm}"</p>
            <small>Gợi ý: Thử tìm theo phiên âm Romaji, Hiragana, Katakana, âm Hán Việt hoặc từ khóa tiếng Việt ngắn hơn.</small>
          </div>
        )}

        {/* Results List */}
        {!loading && totalResultsCount > 0 && (
          <ListGroup flush className="search-results-list" style={{ maxHeight: '440px', overflowY: 'auto' }}>
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

            {/* 2. VOCABULARY RESULTS CARDS */}
            {displayedVocab.map((item) => {
              const isFav = isFavorite(item.id, item.is_favorite);
              const cleanMeaning = item.clean_vietnamese || item.vietnamese;
              const cleanK = item.clean_kana || item.kana;
              const hasKanji = item.kanji && item.kanji !== '–' && item.kanji !== '-' && item.kanji.trim() !== '';
              const isKatakana = /[\u30A0-\u30FF]/.test(cleanK);

              return (
                <ListGroupItem
                  key={item.id}
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
          </ListGroup>
        )}
      </ModalBody>
    </Modal>
  );
};

export default SearchModal;
