import React, { useState } from 'react';
import { Modal, ModalBody, Badge } from 'reactstrap';
import { ChevronDown, CheckCircle2, Clock, Sparkles, X, GraduationCap, Award, ShieldCheck } from 'lucide-react';
import { sounds } from '../services/sounds';

const LevelSelector = ({ currentLevel = 'N5', onChangeLevel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notice, setNotice] = useState('');

  const toggle = () => {
    sounds.playFlip?.();
    setNotice('');
    setIsOpen(!isOpen);
  };

  const levels = [
    {
      id: 'N5',
      name: 'JLPT N5',
      sub: 'Sơ cấp 1 (Minna I)',
      status: 'ready',
      badge: 'Đầy đủ 100%',
      badgeColor: 'success',
      desc: '25 Bài học đầy đủ • 1,589 Từ vựng • 80+ Kanji • Flashcard 3D • Trắc nghiệm • Luyện gõ'
    },
    {
      id: 'N4',
      name: 'JLPT N4',
      sub: 'Sơ cấp 2 (Minna II)',
      status: 'dev',
      badge: 'Đang phát triển',
      badgeColor: 'warning',
      desc: '25 Bài tiếp theo (Bài 26 - 50) • 300+ Kanji • Đang biên soạn nội dung'
    },
    {
      id: 'N3',
      name: 'JLPT N3',
      sub: 'Trung cấp',
      status: 'dev',
      badge: 'Đang phát triển',
      badgeColor: 'secondary',
      desc: '650+ Kanji • Cầu nối ngữ pháp & từ vựng trung cấp'
    },
    {
      id: 'N2',
      name: 'JLPT N2',
      sub: 'Trung - Thượng cấp',
      status: 'dev',
      badge: 'Đang phát triển',
      badgeColor: 'secondary',
      desc: '1,000+ Kanji • Đọc hiểu tin tức & Thương mại'
    },
    {
      id: 'N1',
      name: 'JLPT N1',
      sub: 'Thượng cấp',
      status: 'dev',
      badge: 'Đang phát triển',
      badgeColor: 'secondary',
      desc: '2,000+ Kanji • Trình độ cao cấp chuyên sâu'
    }
  ];

  const handleSelect = (lvl) => {
    if (lvl.status === 'ready') {
      sounds.playCorrect?.();
      setNotice('');
      if (onChangeLevel) onChangeLevel(lvl.id);
      setIsOpen(false);
    } else {
      sounds.playWrong?.();
      setNotice(`Cấp độ ${lvl.id} đang trong giai đoạn phát triển! Hiện tại hệ thống đang hỗ trợ hoàn thiện 100% giáo trình N5.`);
    }
  };

  return (
    <>
      {/* Sleek, Luxury Level Trigger Pill (Ultra-compact & harmonious on all devices) */}
      <button
        type="button"
        onClick={toggle}
        className="level-pill-btn d-flex align-items-center gap-1 text-decoration-none flex-shrink-0"
        title="Chọn cấp độ JLPT mục tiêu"
        style={{
          height: '28px',
          padding: '0 7px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.22)',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.04) 100%)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.16)',
          cursor: 'pointer',
          transition: 'all 0.18s ease'
        }}
      >
        <span
          className="rounded-circle d-inline-block flex-shrink-0"
          style={{
            width: '5.5px',
            height: '5.5px',
            backgroundColor: '#10b981',
            boxShadow: '0 0 7px #10b981'
          }}
        />
        <span
          className="fw-black text-white"
          style={{
            fontSize: '11px',
            letterSpacing: '0.03em',
            fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
          }}
        >
          {currentLevel || 'N5'}
        </span>
        <ChevronDown size={10} className="text-white text-opacity-75 flex-shrink-0" />
      </button>

      {/* Modern Centered Level Selection Modal */}
      <Modal
        isOpen={isOpen}
        toggle={toggle}
        centered
        className="jlpt-modal"
        style={{ maxWidth: '440px' }}
      >
        <ModalBody className="p-0 overflow-hidden rounded-4 border-0 shadow-2xl">
          {/* Header Banner */}
          <div
            className="p-3.5 text-white d-flex justify-content-between align-items-center position-relative"
            style={{
              background: 'linear-gradient(135deg, #091224 0%, #1e3a8a 100%)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <div className="d-flex align-items-center gap-2.5">
              <div
                className="d-flex align-items-center justify-content-center rounded-circle"
                style={{ width: 34, height: 34, background: 'rgba(255, 255, 255, 0.12)' }}
              >
                <GraduationCap size={18} className="text-white" />
              </div>
              <div>
                <h6 className="fw-bold mb-0 text-white" style={{ fontSize: '14px' }}>
                  Cấp Độ JLPT Mục Tiêu
                </h6>
                <small className="text-white text-opacity-70" style={{ fontSize: '11px' }}>
                  Chọn cấp độ ôn luyện của bạn
                </small>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={toggle}
              style={{ fontSize: '10px' }}
              aria-label="Đóng"
            />
          </div>

          {/* Development Notice Alert */}
          {notice && (
            <div
              className="p-2.5 mx-3 mt-3 mb-0 rounded-3 small d-flex align-items-center gap-2"
              style={{
                backgroundColor: '#fffbeb',
                border: '1px solid #fcd34d',
                color: '#92400e',
                fontSize: '12px',
                animation: 'pageFadeIn 0.2s ease'
              }}
            >
              <Clock size={16} className="text-warning flex-shrink-0" />
              <div>{notice}</div>
            </div>
          )}

          {/* Level List */}
          <div className="p-3 bg-light d-flex flex-column gap-2">
            {levels.map((lvl) => {
              const isSelected = currentLevel === lvl.id;
              const isReady = lvl.status === 'ready';

              return (
                <div
                  key={lvl.id}
                  onClick={() => handleSelect(lvl)}
                  className={`p-2.5 rounded-3 bg-white border transition-all d-flex align-items-start justify-content-between gap-2 ${
                    isReady ? 'cursor-pointer hover-shadow' : 'opacity-75'
                  }`}
                  style={{
                    cursor: isReady ? 'pointer' : 'not-allowed',
                    borderColor: isSelected ? '#10b981' : '#e2e8f0',
                    borderWidth: isSelected ? '2px' : '1px',
                    boxShadow: isSelected ? '0 4px 12px rgba(16, 185, 129, 0.15)' : 'none'
                  }}
                >
                  <div className="d-flex align-items-start gap-2.5">
                    <div
                      className="d-flex align-items-center justify-content-center text-white fw-bold rounded-2 flex-shrink-0"
                      style={{
                        width: '36px',
                        height: '36px',
                        fontSize: '13px',
                        background: isReady ? 'linear-gradient(135deg, #059669, #10b981)' : '#64748b'
                      }}
                    >
                      {lvl.id}
                    </div>

                    <div>
                      <div className="d-flex align-items-center gap-1.5">
                        <span className="fw-bold text-dark small">{lvl.name}</span>
                        <span className="text-muted" style={{ fontSize: '11px' }}>({lvl.sub})</span>
                      </div>
                      <p className="text-muted mb-0 mt-0.5" style={{ fontSize: '11px', lineHeight: '1.3' }}>
                        {lvl.desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex-shrink-0 text-end">
                    {isReady ? (
                      <Badge color="success" pill style={{ fontSize: '10px' }}>
                        {isSelected ? '✓ Đang học' : 'Sẵn sàng'}
                      </Badge>
                    ) : (
                      <Badge color="warning" pill style={{ fontSize: '10px' }}>
                        <Clock size={9} className="me-0.5" /> Đang phát triển
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ModalBody>
      </Modal>
    </>
  );
};

export default LevelSelector;
