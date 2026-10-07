import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Badge,
  Spinner
} from 'reactstrap';
import {
  Star,
  Volume2,
  Trash2,
  BookOpen,
  Layers,
  CheckSquare
} from 'lucide-react';
import { favoriteService, vocabService, speakJapanese } from '../services/api';
import { useApp } from '../context/AppContext';

const FavoritesPage = ({ onNavigate, onSelectLesson }) => {
  const { user, guestFavorites, toggleFavorite } = useApp();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, [user, guestFavorites]);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      if (user) {
        const res = await favoriteService.getFavorites();
        setFavorites(res.data);
      } else {
        setFavorites(guestFavorites);
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (item) => {
    await toggleFavorite(item);
    setFavorites(prev => prev.filter(v => v.id !== item.id));
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner color="primary" />
        <p className="mt-2 text-muted">Đang tải danh sách từ yêu thích...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="bg-white p-4 rounded-4 shadow-sm border mb-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2">
          <div className="bg-warning bg-opacity-10 text-warning p-2 rounded-circle">
            <Star size={24} fill="#f59e0b" />
          </div>
          <div>
            <h4 className="fw-bold mb-0">Từ vựng yêu thích & Đánh dấu quan trọng</h4>
            <p className="text-muted small mb-0">
              Danh sách các từ bạn đã lưu lại để tiện tra cứu và ôn tập nhanh
            </p>
          </div>
        </div>

        <Badge color="warning" className="text-dark fs-6 px-3 py-2" pill>
          {favorites.length} từ đã lưu
        </Badge>
      </div>

      {favorites.length === 0 ? (
        <Card className="jlpt-card border-0 shadow-sm p-5 text-center">
          <div className="bg-light text-muted p-3 rounded-circle d-inline-flex mx-auto mb-3">
            <Star size={40} />
          </div>
          <h4 className="fw-bold text-dark">Chưa có từ vựng yêu thích nào</h4>
          <p className="text-muted mb-4">
            Trong lúc học bài hoặc xem từ vựng, hãy bấm biểu tượng ngôi sao ⭐ để thêm từ vào đây.
          </p>
          <div>
            <Button color="primary" className="fw-bold px-4" onClick={() => onNavigate('lessons')}>
              Khám phá bài học
            </Button>
          </div>
        </Card>
      ) : (
        <Row className="g-3">
          {favorites.map((item) => (
            <Col md={6} lg={4} key={item.id}>
              <Card className="jlpt-card border-0 shadow-sm h-100">
                <CardBody className="d-flex flex-column justify-content-between p-3">
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <Badge
                        color="primary"
                        pill
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          if (onSelectLesson) onSelectLesson(item.lesson_number);
                          onNavigate('lessons');
                        }}
                      >
                        Bài {item.lesson_number}
                      </Badge>
                      <div className="d-flex gap-1">
                        <Button
                          color="light"
                          size="sm"
                          className="p-1 rounded-circle"
                          onClick={() => speakJapanese(item.kana)}
                        >
                          <Volume2 size={16} className="text-primary" />
                        </Button>
                        <Button
                          color="light"
                          size="sm"
                          className="p-1 rounded-circle text-danger"
                          onClick={() => handleRemoveFavorite(item)}
                          title="Bỏ thích"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>

                    <div className="mb-2">
                      {item.kanji && (
                        <h4 className="fw-bold text-dark mb-1 font-monospace">
                          {item.kanji}
                        </h4>
                      )}
                      <h5 className="text-primary fw-semibold mb-0">
                        {item.kana}
                      </h5>
                      <small className="text-muted fst-italic">[{item.romaji}]</small>
                    </div>

                    <div className="bg-light p-2 rounded small text-dark fw-medium">
                      {item.vietnamese}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default FavoritesPage;
