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
import { Search, Volume2, Star, X, Filter } from 'lucide-react';
import { vocabService, speakJapanese } from '../services/api';
import { useApp } from '../context/AppContext';
import { sounds } from '../services/sounds';

const SearchModal = ({ isOpen, toggle, onSelectLesson }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterLesson, setFilterLesson] = useState('all');
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
        setResults(res.data);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const displayedResults = results.filter(item => {
    if (filterLesson === 'all') return true;
    return item.lesson_number === parseInt(filterLesson);
  });

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" centered className="jlpt-modal">
      <ModalHeader toggle={toggle} className="border-bottom pb-2">
        <div className="d-flex align-items-center gap-2">
          <div className="bg-primary bg-opacity-10 text-primary p-2 rounded-circle">
            <Search size={18} />
          </div>
          <div>
            <h6 className="fw-bold mb-0 text-navy-dark">Tra cứu từ vựng N5 thông minh</h6>
            <small className="text-muted d-block" style={{ fontSize: '11px' }}>
              Tìm kiếm theo Kanji, Hiragana, Katakana, Romaji hoặc nghĩa Tiếng Việt
            </small>
          </div>
        </div>
      </ModalHeader>
      <ModalBody className="p-3">
        <InputGroup className="mb-3 shadow-xs border rounded-3 overflow-hidden">
          <Input
            type="text"
            placeholder="Nhập từ cần tìm (VD: 先生, gakusei, học sinh, ikimasu...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
            className="py-2.5 border-0 shadow-none fs-6"
          />
          {searchTerm && (
            <Button color="light" className="border-0 text-muted" onClick={() => setSearchTerm('')}>
              <X size={16} />
            </Button>
          )}
        </InputGroup>

        {/* Filter bar by lesson */}
        {results.length > 0 && (
          <div className="d-flex justify-content-between align-items-center mb-2 px-1">
            <span className="small text-muted fw-semibold">
              Tìm thấy <strong className="text-primary">{displayedResults.length}</strong> từ vựng phù hợp:
            </span>
            <div className="d-flex align-items-center gap-1">
              <Filter size={13} className="text-muted" />
              <Input
                type="select"
                bsSize="sm"
                value={filterLesson}
                onChange={(e) => setFilterLesson(e.target.value)}
                className="w-auto py-0 px-2 small rounded-pill"
              >
                <option value="all">Tất cả bài</option>
                {Array.from(new Set(results.map(r => r.lesson_number))).sort((a,b)=>a-b).map(num => (
                  <option key={num} value={num}>Bài {num < 10 ? `0${num}` : num}</option>
                ))}
              </Input>
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-4">
            <Spinner color="primary" size="sm" />
            <span className="ms-2 text-muted small">Đang tìm kiếm trong 1,589 từ...</span>
          </div>
        )}

        {!loading && searchTerm && results.length === 0 && (
          <div className="text-center py-5 text-muted">
            <p className="mb-1 fw-bold text-dark">Không tìm thấy từ vựng nào khớp với "{searchTerm}"</p>
            <small>Gợi ý: Thử gõ không dấu hoặc dùng từ khóa ngắn hơn.</small>
          </div>
        )}

        <ListGroup flush style={{ maxHeight: '420px', overflowY: 'auto' }}>
          {displayedResults.map((item) => {
            const isFav = isFavorite(item.id, item.is_favorite);
            const cleanMeaning = item.clean_vietnamese || item.vietnamese;
            const cleanK = item.clean_kana || item.kana;

            return (
              <ListGroupItem
                key={item.id}
                className="d-flex justify-content-between align-items-center py-2.5 px-3 border-bottom rounded-3 mb-1 bg-white hover-shadow transition-all"
                style={{ borderColor: 'var(--slate-200)' }}
              >
                <div style={{ flex: 1 }}>
                  <div className="d-flex align-items-baseline gap-2 flex-wrap">
                    {item.kanji && item.kanji !== '–' && item.kanji !== '-' && (
                      <span className="fs-5 fw-bold text-dark font-monospace">{item.kanji}</span>
                    )}
                    <span className="fs-6 fw-bold text-primary font-monospace">{cleanK}</span>
                    <span className="text-muted small fst-italic">[{item.romaji}]</span>
                    <Badge
                      color="secondary"
                      pill
                      className="ms-1 cursor-pointer"
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
                  <div className="text-secondary small mt-0.5">{cleanMeaning}</div>
                  {item.usage_note && (
                    <div className="text-muted small" style={{ fontSize: '11px' }}>
                      💡 {item.usage_note}
                    </div>
                  )}
                </div>

                <div className="d-flex align-items-center gap-1 flex-shrink-0 ms-2">
                  <Button
                    color="light"
                    size="sm"
                    className="p-1.5 rounded-circle border text-primary audio-btn"
                    onClick={() => speakJapanese(cleanK)}
                    title="Nghe phát âm"
                  >
                    <Volume2 size={15} />
                  </Button>
                  <Button
                    color="light"
                    size="sm"
                    className="p-1.5 rounded-circle border text-warning"
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
      </ModalBody>
    </Modal>
  );
};

export default SearchModal;
