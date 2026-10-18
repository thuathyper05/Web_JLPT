import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  Input,
  InputGroup,
  ListGroup,
  ListGroupItem,
  Badge,
  Button,
  Spinner
} from 'reactstrap';
import { Search, Volume2, Star, X, Filter, Sparkles, BookOpen } from 'lucide-react';
import { vocabService, speakJapanese } from '../services/api';
import { useApp } from '../context/AppContext';
import { sounds } from '../services/sounds';

const QUICK_SUGGESTIONS = [
  'わたし',
  '先生',
  '学生',
  '日本語',
  'ありがとう',
  '行きます',
  '食べます'
];

const SearchModal = ({ isOpen, toggle, onSelectLesson }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterLesson, setFilterLesson] = useState('all');
  const [filterType, setFilterType] = useState('all'); // 'all', 'kanji', 'kana'
  const { toggleFavorite, isFavorite } = useApp();

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await vocabService.search(searchTerm.trim());
        setResults(res.data || []);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const displayedResults = results.filter(item => {
    if (filterLesson !== 'all' && item.lesson_number !== parseInt(filterLesson, 10)) {
      return false;
    }
    const hasKanji = item.kanji && item.kanji !== '–' && item.kanji !== '-' && item.kanji.trim() !== '';
    if (filterType === 'kanji' && !hasKanji) return false;
    if (filterType === 'kana' && hasKanji) return false;
    return true;
  });

  const availableLessons = Array.from(new Set(results.map(r => r.lesson_number)))
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
            <h6 className="fw-bold mb-0 text-navy-dark fs-6">Tra Cứu Từ Vựng N5</h6>
            <span className="text-muted small" style={{ fontSize: '11.5px' }}>
              Kanji, Hiragana, Katakana, Romaji hoặc Tiếng Việt
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
            placeholder="Gõ từ cần tra (VD: 先生, gakusei, học sinh, ikimasu...)"
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

        {/* Quick Filter Chips (When search results exist) */}
        {results.length > 0 && (
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3 px-1">
            <div className="d-flex align-items-center gap-1.5 flex-wrap">
              <button
                type="button"
                className={`btn btn-sm py-1 px-2.5 rounded-pill fw-semibold text-xs transition-all ${
                  filterType === 'all'
                    ? 'btn-primary'
                    : 'btn-outline-secondary bg-white text-dark border-slate-200'
                }`}
                onClick={() => setFilterType('all')}
              >
                Tất cả ({results.length})
              </button>
              <button
                type="button"
                className={`btn btn-sm py-1 px-2.5 rounded-pill fw-semibold text-xs transition-all ${
                  filterType === 'kanji'
                    ? 'btn-primary'
                    : 'btn-outline-secondary bg-white text-dark border-slate-200'
                }`}
                onClick={() => setFilterType('kanji')}
              >
                Có Kanji
              </button>
              <button
                type="button"
                className={`btn btn-sm py-1 px-2.5 rounded-pill fw-semibold text-xs transition-all ${
                  filterType === 'kana'
                    ? 'btn-primary'
                    : 'btn-outline-secondary bg-white text-dark border-slate-200'
                }`}
                onClick={() => setFilterType('kana')}
              >
                Thuần Kana
              </button>
            </div>

            {availableLessons.length > 1 && (
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
            <span className="ms-2 text-muted small fw-medium">Đang tìm trong cơ sở dữ liệu N5...</span>
          </div>
        )}

        {/* Empty Search Suggestion State */}
        {!loading && !searchTerm && (
          <div className="py-4 px-2 text-center">
            <div className="d-inline-flex align-items-center justify-content-center p-3 rounded-circle bg-primary bg-opacity-10 text-primary mb-3">
              <Sparkles size={24} />
            </div>
            <h6 className="fw-bold text-dark mb-1">Gợi ý tìm nhanh</h6>
            <p className="text-muted small mb-3">
              Bấm vào một trong các từ khóa phổ biến để xem ngay kết quả:
            </p>
            <div className="d-flex flex-wrap justify-content-center gap-2">
              {QUICK_SUGGESTIONS.map(word => (
                <button
                  key={word}
                  type="button"
                  className="btn btn-sm btn-outline-primary bg-white rounded-pill px-3 py-1 fw-semibold text-xs hover-lift"
                  onClick={() => setSearchTerm(word)}
                >
                  {word}
                </button>
              ))}
            </div>
            <div className="mt-4 pt-3 border-top text-muted small d-flex align-items-center justify-content-center gap-2">
              <BookOpen size={14} />
              <span>Kho dữ liệu tích hợp: 1,589 từ vựng Minna No Nihongo N5</span>
            </div>
          </div>
        )}

        {/* No Results Found */}
        {!loading && searchTerm && displayedResults.length === 0 && (
          <div className="text-center py-5 text-muted">
            <p className="mb-1 fw-bold text-dark fs-6">Không tìm thấy từ vựng khớp với "{searchTerm}"</p>
            <small>Gợi ý: Thử tìm theo phiên âm Romaji, Hiragana hoặc từ khóa tiếng Việt ngắn hơn.</small>
          </div>
        )}

        {/* Results List */}
        {!loading && displayedResults.length > 0 && (
          <ListGroup flush className="search-results-list" style={{ maxHeight: '420px', overflowY: 'auto' }}>
            {displayedResults.map((item) => {
              const isFav = isFavorite(item.id, item.is_favorite);
              const cleanMeaning = item.clean_vietnamese || item.vietnamese;
              const cleanK = item.clean_kana || item.kana;
              const hasKanji = item.kanji && item.kanji !== '–' && item.kanji !== '-' && item.kanji.trim() !== '';

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
                      <span className="fs-6 fw-bold text-primary font-monospace">{cleanK}</span>
                      {item.romaji && (
                        <span className="text-muted small fst-italic">[{item.romaji}]</span>
                      )}
                      <Badge
                        color="secondary"
                        pill
                        className="ms-1 cursor-pointer bg-slate-100 text-slate-700 border border-slate-200"
                        style={{ fontSize: '11px' }}
                        onClick={() => {
                          toggle();
                          if (onSelectLesson) onSelectLesson(item.lesson_number);
                        }}
                        title="Chuyển đến bài học này"
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
