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
import { Search, Volume2, Star, BookOpen, X } from 'lucide-react';
import { vocabService, speakJapanese } from '../services/api';
import { useApp } from '../context/AppContext';

const SearchModal = ({ isOpen, toggle, onSelectLesson }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
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
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" centered>
      <ModalHeader toggle={toggle} className="border-bottom pb-2">
        <div className="d-flex align-items-center" style={{ gap: '8px' }}>
          <Search size={20} className="text-primary" />
          <span className="fw-bold">Tra cứu từ vựng N5 (Minna no Nihongo)</span>
        </div>
      </ModalHeader>
      <ModalBody className="p-3">
        <InputGroup className="mb-3 shadow-sm">
          <Input
            type="text"
            placeholder="Tìm theo Kanji, Hiragana, Romaji hoặc nghĩa Tiếng Việt (VD: 先生, gakusei, học sinh...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
            className="py-2"
          />
          {searchTerm && (
            <Button color="light" onClick={() => setSearchTerm('')}>
              <X size={16} />
            </Button>
          )}
        </InputGroup>

        {loading && (
          <div className="text-center py-4">
            <Spinner color="primary" size="sm" />
            <span className="ms-2 text-muted small">Đang tìm kiếm trong 1589 từ...</span>
          </div>
        )}

        {!loading && searchTerm && results.length === 0 && (
          <div className="text-center py-4 text-muted">
            <p className="mb-1">Không tìm thấy từ vựng nào khớp với "<strong>{searchTerm}</strong>"</p>
            <small>Thử tìm bằng Romaji hoặc gõ ít từ hơn.</small>
          </div>
        )}

        <ListGroup flush style={{ maxHeight: '450px', overflowY: 'auto' }}>
          {results.map((item) => {
            const isFav = isFavorite(item.id, item.is_favorite);
            return (
              <ListGroupItem
                key={item.id}
                className="d-flex justify-content-between align-items-center py-2 px-2 border-bottom"
              >
                <div style={{ flex: 1 }}>
                  <div className="d-flex align-items-baseline" style={{ gap: '8px' }}>
                    {item.kanji && (
                      <span className="fs-5 fw-bold text-dark">{item.kanji}</span>
                    )}
                    <span className="fs-6 fw-semibold text-primary">{item.kana}</span>
                    <span className="text-muted small">({item.romaji})</span>
                    <Badge
                      color="secondary"
                      pill
                      className="ms-2"
                      style={{ cursor: 'pointer', fontSize: '11px' }}
                      onClick={() => {
                        toggle();
                        if (onSelectLesson) onSelectLesson(item.lesson_number);
                      }}
                    >
                      Bài {item.lesson_number}
                    </Badge>
                  </div>
                  <div className="text-secondary small mt-1">{item.vietnamese}</div>
                </div>

                <div className="d-flex align-items-center" style={{ gap: '6px' }}>
                  <Button
                    color="light"
                    size="sm"
                    className="p-1 rounded-circle"
                    onClick={() => speakJapanese(item.kana)}
                    title="Nghe phát âm"
                  >
                    <Volume2 size={18} className="text-primary" />
                  </Button>
                  <Button
                    color="light"
                    size="sm"
                    className="p-1 rounded-circle"
                    onClick={() => toggleFavorite(item)}
                    title="Yêu thích"
                  >
                    <Star
                      size={18}
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
