import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import StudyHero from '../components/StudyHero.jsx';
import StudyTabs from '../components/StudyTabs.jsx';
import DailyPlanCard from '../components/DailyPlanCard.jsx';
import ListeningExamGuide from '../components/ListeningExamGuide.jsx';
import { speakJapanese, vocabService } from '../services/api';
import { sounds } from '../services/sounds';
import confetti from 'canvas-confetti';
import FuriganaWord from '../components/FuriganaWord';
import { listeningTracksByLevel } from '../data/listeningTracks';
import { LISTENING_ROADMAP_STAGES, LISTENING_METHODS } from '../data/listeningRoadmap.js';
import {
  Headphones,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Volume2,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Gauge,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Award,
  BookOpen,
  ListMusic,
  Radio,
  Compass,
  Lightbulb,
  Check,
  Flame,
  BookmarkCheck,
  Layers
} from 'lucide-react';

export default function ListeningPage() {
  const { currentLevel, askAi } = useApp();
  const activeLevel = currentLevel || 'N5';

  // Chế độ xem: 'dialogue' (Luyện nghe đề thi), 'roadmap' (Lộ trình), 'methods' (Phương pháp), 'vocab' (Chuỗi từ vựng)
  const [activeTab, setActiveTab] = useState('dialogue');

  // Lọc theo dạng câu hỏi JLPT: 'all', 'mondai1', 'mondai2', 'mondai4'
  const [mondaiFilter, setMondaiFilter] = useState('all');

  // Lựa chọn bài học
  const defaultLessonChoice = activeLevel === 'N4' ? '26' : '1';
  const [lessonChoice, setLessonChoice] = useState(defaultLessonChoice);

  // Danh sách tracks của cấp độ
  const levelTracks = listeningTracksByLevel[activeLevel] || listeningTracksByLevel.N5 || [];

  // Danh sách tracks sau khi lọc bài học
  const filteredLessonTracks = useMemo(function () {
    if (lessonChoice === 'all') return levelTracks;
    return levelTracks.filter(function (t) {
      return String(t.lesson) === String(lessonChoice);
    });
  }, [levelTracks, lessonChoice]);

  // Danh sách tracks sau khi lọc theo dạng bài Mondai
  const currentTracks = useMemo(function () {
    if (mondaiFilter === 'all') return filteredLessonTracks;
    return filteredLessonTracks.filter(function (t) {
      return t.mondaiType === mondaiFilter || (t.partName && t.partName.toLowerCase().includes(mondaiFilter));
    });
  }, [filteredLessonTracks, mondaiFilter]);

  // Vị trí track hiện tại trong currentTracks
  const [currentIndex, setCurrentIndex] = useState(0);
  const track = currentTracks[currentIndex] || currentTracks[0] || levelTracks[0] || {
    id: 1,
    lesson: 1,
    topic: 'Choukai JLPT ' + activeLevel,
    situation: 'Bài luyện nghe chuẩn JLPT ' + activeLevel,
    dialogue: [],
    question: 'Hãy lắng nghe và chọn đáp án chính xác',
    options: []
  };

  // Trạng thái phát âm thanh
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showFurigana, setShowFurigana] = useState(true);
  const [showTranslation, setShowTranslation] = useState(false);
  const [listenCount, setListenCount] = useState(0);

  // Trạng thái trắc nghiệm
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);

  // Trạng thái phát chuỗi từ vựng
  const [vocabList, setVocabList] = useState([]);
  const [loadingVocab, setLoadingVocab] = useState(false);
  const [activeVocabIndex, setActiveVocabIndex] = useState(0);
  const [isVocabAutoPlaying, setIsVocabAutoPlaying] = useState(false);
  const vocabTimerRef = useRef(null);

  // Cập nhật khi đổi cấp độ
  useEffect(function () {
    const newDefault = activeLevel === 'N4' ? '26' : '1';
    setLessonChoice(newDefault);
    setCurrentIndex(0);
    setScore(0);
  }, [activeLevel]);

  // Đặt lại trạng thái khi đổi bài hoặc chuyển track
  useEffect(function () {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setShowTranscript(false);
    setShowTranslation(false);
    setListenCount(0);
    setIsPlaying(false);
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, [lessonChoice, mondaiFilter]);

  useEffect(function () {
    setSelectedOption(null);
    setIsAnswered(false);
    setShowTranscript(false);
    setShowTranslation(false);
    setListenCount(0);
    setIsPlaying(false);
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, [currentIndex]);

  // Nạp từ vựng cho bài học khi ở tab vocab
  useEffect(function () {
    let isMounted = true;
    async function fetchLessonVocab() {
      setLoadingVocab(true);
      try {
        const lessonNum = lessonChoice === 'all' ? (activeLevel === 'N4' ? 26 : 1) : parseInt(lessonChoice, 10);
        const res = await vocabService.getVocabularies({
          level: activeLevel,
          lesson_number: lessonNum
        });
        const words = res.data && res.data.data ? res.data.data : [];
        if (isMounted) {
          setVocabList(words);
          setActiveVocabIndex(0);
        }
      } catch (err) {
        console.error('Error fetching listening vocab:', err);
      } finally {
        if (isMounted) setLoadingVocab(false);
      }
    }

    if (activeTab === 'vocab') {
      fetchLessonVocab();
    }
    return function () {
      isMounted = false;
    };
  }, [activeLevel, lessonChoice, activeTab]);

  // Tự động phát chuỗi từ vựng
  useEffect(function () {
    if (!isVocabAutoPlaying || vocabList.length === 0) {
      if (vocabTimerRef.current) clearTimeout(vocabTimerRef.current);
      return;
    }

    const currentWord = vocabList[activeVocabIndex];
    if (currentWord) {
      speakJapanese(currentWord.kanji || currentWord.kana, playbackSpeed);
    }

    vocabTimerRef.current = setTimeout(function () {
      setActiveVocabIndex(function (prev) {
        return (prev + 1) % vocabList.length;
      });
    }, Math.max(2200, 3200 / playbackSpeed));

    return function () {
      if (vocabTimerRef.current) clearTimeout(vocabTimerRef.current);
    };
  }, [isVocabAutoPlaying, activeVocabIndex, vocabList, playbackSpeed]);

  useEffect(function () {
    return function () {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (vocabTimerRef.current) clearTimeout(vocabTimerRef.current);
    };
  }, []);

  // Phát toàn bộ bài hội thoại
  function handlePlayAudio() {
    if (!track) return;
    sounds.playFlip();
    setIsPlaying(true);
    setListenCount(function (prev) {
      return prev + 1;
    });

    speakJapanese(track.audioText, playbackSpeed);

    const durationMs = Math.max(2200, (track.audioText.length * 190) / playbackSpeed);
    setTimeout(function () {
      setIsPlaying(false);
    }, durationMs);
  }

  // Tua lại hoặc nghe lại từ đầu
  function handleRewind() {
    sounds.playFlip();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    handlePlayAudio();
  }

  // Phát câu thoại riêng lẻ (Shadowing)
  function handlePlaySentence(text) {
    sounds.playFlip();
    speakJapanese(text, playbackSpeed);
  }

  // Chọn đáp án trắc nghiệm
  function handleSelectOption(optId) {
    if (isAnswered || !track) return;
    setSelectedOption(optId);
    setIsAnswered(true);

    if (optId === track.correctAnswer) {
      sounds.playCorrect();
      setScore(function (prev) {
        return prev + 1;
      });
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#db2777', '#f43f5e', '#fbbf24', '#34d399']
      });
    } else {
      sounds.playWrong();
    }
  }

  function handleNextTrack() {
    sounds.playFlip();
    if (currentIndex < currentTracks.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  }

  function handlePrevTrack() {
    sounds.playFlip();
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }

  // Phím tắt bàn phím (Space để phát lại, 1..4 để chọn đáp án)
  useEffect(function () {
    function handleKeyDown(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (activeTab === 'dialogue') {
          handlePlayAudio();
        } else if (activeTab === 'vocab') {
          setIsVocabAutoPlaying(function (prev) {
            return !prev;
          });
        }
      } else if (['Digit1', 'Digit2', 'Digit3', 'Digit4'].includes(e.code) && !isAnswered && activeTab === 'dialogue') {
        const keyMap = { Digit1: 'A', Digit2: 'B', Digit3: 'C', Digit4: 'D' };
        handleSelectOption(keyMap[e.code]);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return function () {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [track, isAnswered, playbackSpeed, activeTab]);

  const lessonList = useMemo(function () {
    if (activeLevel === 'N4') {
      return Array.from({ length: 25 }, function (_, i) {
        return i + 26;
      });
    }
    return Array.from({ length: 25 }, function (_, i) {
      return i + 1;
    });
  }, [activeLevel]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20 animate-in fade-in duration-300">
      {/* ════════════════════ 1. HERO CHOUKAI HIỆN ĐẠI ════════════════════ */}
      <StudyHero
        bigChar="聴"
        kicker={'Choukai 聴解 - JLPT ' + activeLevel}
        icon={<Headphones size={13} />}
        title={'Luyện nghe JLPT ' + activeLevel + ' giọng Tokyo'}
        subtitle="Học theo đúng cấu trúc đề thi: Mondai 1, 2, 4 kèm phân tích bẫy nghe, chép chính tả và luyện bắt chước giọng."
        ring={{ percent: currentTracks.length > 0 ? Math.round((score / currentTracks.length) * 100) : 0, label: 'Chính xác' }}
        stats={[
          { label: 'Bài nghe', value: currentTracks.length },
          { label: 'Điểm', value: score + '/' + currentTracks.length, tone: 'emerald' },
          { label: 'Cấp độ', value: activeLevel, tone: 'sky' },
          { label: 'Bài học', value: lessonChoice === 'all' ? 'Tất cả' : 'Bài ' + lessonChoice, tone: 'amber' }
        ]}
        actions={
          <select
            aria-label="Chọn bài học"
            value={lessonChoice}
            onChange={function (e) {
              sounds.playFlip();
              setLessonChoice(e.target.value);
            }}
            className="min-h-[44px] px-4 rounded-xl bg-white text-slate-800 text-xs font-bold shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-300 max-w-full"
          >
            <option value="all">Tất cả bài học (JLPT {activeLevel})</option>
            {lessonList.map(function (n) {
              return (
                <option key={n} value={String(n)}>
                  Bài {n < 10 ? '0' + n : n} - Giáo trình {activeLevel}
                </option>
              );
            })}
          </select>
        }
      />

      {/* ════════════════════ 2. THANH ĐIỀU HƯỚNG ════════════════════ */}
      <StudyTabs
        active={activeTab}
        onChange={function (id) {
          sounds.playFlip();
          if (id !== 'vocab') {
            if (vocabTimerRef.current) clearTimeout(vocabTimerRef.current);
            setIsVocabAutoPlaying(false);
          }
          if (id === 'vocab' && typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
          }
          setActiveTab(id);
        }}
        tabs={[
          { id: 'dialogue', label: 'Đề thi và hội thoại', icon: Radio, badge: currentTracks.length },
          { id: 'roadmap', label: 'Lộ trình', icon: Compass },
          { id: 'methods', label: 'Phương pháp', icon: Lightbulb },
          { id: 'vocab', label: 'Chuỗi từ vựng', icon: ListMusic }
        ]}
      />

      {activeTab === 'dialogue' && (
        <div className="space-y-4">
          <DailyPlanCard
            storageKey={'jlpt_listening_daily_plan_' + activeLevel}
            title="Kế hoạch luyện nghe hôm nay"
            tasks={[
              { id: 'blind', label: 'Nghe không xem chữ', hint: 'Nghe 1 bài hai lần, tự đoán nội dung trước khi mở phụ đề.', minutes: 5 },
              { id: 'quiz', label: 'Làm 3 câu trắc nghiệm', hint: 'Mỗi dạng Mondai một câu và đọc phần giải thích.', minutes: 6 },
              { id: 'shadow', label: 'Bắt chước từng câu', hint: 'Nghe câu riêng rồi nhại lại đúng nhịp và ngữ điệu.', minutes: 5 },
              { id: 'dictate', label: 'Chép chính tả 1 câu', hint: 'Nghe và viết ra giấy, sau đó đối chiếu với bản gốc.', minutes: 4 }
            ]}
          />
          <ListeningExamGuide active={mondaiFilter} onSelect={function (id) { sounds.playFlip(); setMondaiFilter(id); }} />
        </div>
      )}

      {/* ════════════════════ TAB 1: ĐỀ THI & HỘI THOẠI CHUẨN JLPT ════════════════════ */}
      {activeTab === 'dialogue' && track && (
        <div className="space-y-4">
          {/* Bộ lọc Mondai chuẩn đề thi JLPT */}
          <div className="flex items-center gap-2 overflow-x-auto p-2 bg-white rounded-2xl border border-pink-100 text-xs">
            <span className="text-slate-400 font-bold shrink-0 ml-1">Dạng bài thi:</span>
            {[
              { id: 'all', label: 'Tất cả bài (' + filteredLessonTracks.length + ')' },
              { id: 'mondai1', label: 'Mondai 1: Hiểu nhiệm vụ (課題理解)' },
              { id: 'mondai2', label: 'Mondai 2: Điểm mấu chốt (ポイント理解)' },
              { id: 'mondai4', label: 'Mondai 4: Phản xạ câu ngắn (即時応答)' }
            ].map(function (m) {
              const isSelected = mondaiFilter === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={function () {
                    sounds.playFlip();
                    setMondaiFilter(m.id);
                  }}
                  className={'px-3 py-1 rounded-xl font-bold transition-all shrink-0 cursor-pointer ' + (isSelected ? 'bg-pink-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-pink-50 text-slate-600')}
                >
                  {m.label}
                </button>
              );
            })}
          </div>

          {/* Quick Track Switcher Pills: Hiển thị các bài nghe của bài học đang chọn */}
          {currentTracks.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto p-2 bg-white/70 rounded-2xl border border-pink-50 text-xs">
              <span className="text-slate-400 font-bold shrink-0 text-[11px] ml-1">CÁC BÀI NGHE TRONG BÀI:</span>
              {currentTracks.map(function (t, idx) {
                const isCurrent = currentIndex === idx;
                const label = t.partName || ('Bài ' + t.lesson + ': ' + (t.topic.split(':')[1] || t.topic));
                return (
                  <button
                    key={t.id || idx}
                    type="button"
                    onClick={function () {
                      sounds.playFlip();
                      setCurrentIndex(idx);
                    }}
                    className={'px-3 py-1 rounded-xl font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ' + (isCurrent ? 'bg-pink-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-pink-50 text-slate-600')}
                  >
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Khối bài nghe chi tiết */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-pink-100 shadow-sm space-y-6">
            <div className="space-y-2 border-b border-pink-50 pb-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-pink-600 uppercase tracking-wider">
                    {track.topic}
                  </span>
                  {track.partName && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-pink-100 text-pink-800">
                      {track.partName}
                    </span>
                  )}
                </div>
                <span className="text-xs font-semibold text-slate-400">
                  Đã nghe: <strong>{listenCount}</strong> lần
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-pink-50/50 border border-pink-100/80 text-xs text-slate-700 leading-relaxed flex items-start gap-2.5">
                <BookOpen size={16} className="text-pink-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block mb-0.5 font-bold">Bối cảnh tình huống:</strong>
                  <span>{track.situation}</span>
                </div>
              </div>
            </div>

            {/* Trình phát âm thanh chính */}
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-pink-50/50 to-white border border-pink-200/70 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePlayAudio}
                  className={'w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lotus transition-all cursor-pointer ' + (isPlaying ? 'bg-rose-500 scale-95 ring-4 ring-rose-200' : 'bg-pink-600 hover:bg-pink-500 hover:scale-105 active:scale-95')}
                  title="Phím Space để Nghe / Nghe lại"
                >
                  {isPlaying ? <Volume2 size={24} className="animate-pulse" /> : <Play size={24} fill="white" className="ml-0.5" />}
                </button>

                <div>
                  <div className="font-extrabold text-sm text-slate-900">
                    {isPlaying ? 'Đang phát âm thanh Tokyo...' : 'Nghe toàn bộ hội thoại'}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Giọng chuẩn cao độ Tokyo bản xứ | Nhấn Space để phát lại
                  </div>
                </div>
              </div>

              {/* Nút tua 5s + Tốc độ + Ẩn/Hiện Kịch bản */}
              <div className="flex items-center gap-2 flex-wrap justify-end">
                <button
                  type="button"
                  onClick={handleRewind}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                  title="Tua lại từ đầu"
                >
                  <RotateCcw size={13} />
                  <span>Nghe lại</span>
                </button>

                <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 text-xs">
                  <Gauge size={13} className="text-slate-400 ml-1.5 mr-1" />
                  {[0.8, 1.0, 1.2].map(function (spd) {
                    return (
                      <button
                        key={spd}
                        type="button"
                        onClick={function () {
                          sounds.playFlip();
                          setPlaybackSpeed(spd);
                        }}
                        className={'px-2 py-0.5 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ' + (playbackSpeed === spd ? 'bg-pink-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900')}
                      >
                        {spd}x
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={function () {
                    sounds.playFlip();
                    setShowTranscript(!showTranscript);
                  }}
                  className={'px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ' + (showTranscript ? 'bg-pink-600 text-white border-pink-600 shadow-2xs' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50')}
                >
                  {showTranscript ? <EyeOff size={13} /> : <Eye size={13} />}
                  <span>{showTranscript ? 'Ẩn kịch bản' : 'Hiện kịch bản'}</span>
                </button>
              </div>
            </div>

            {/* Kịch bản hội thoại */}
            {showTranscript && (
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2 flex-wrap gap-2">
                  <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Headphones size={13} className="text-pink-600" />
                    <span>Kịch bản vai đối thoại (Dialogue Script)</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={function () { setShowFurigana(!showFurigana); }}
                      className="text-[11px] font-bold text-pink-600 hover:underline cursor-pointer"
                    >
                      {showFurigana ? 'Ẩn Furigana' : 'Hiện Furigana'}
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={function () { setShowTranslation(!showTranslation); }}
                      className="text-[11px] font-bold text-slate-600 hover:underline cursor-pointer"
                    >
                      {showTranslation ? 'Ẩn dịch nghĩa' : 'Hiện dịch nghĩa'}
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {track.dialogue &&
                    track.dialogue.map(function (turn, tIdx) {
                      const isSpeakerB = turn.role === 'B';
                      return (
                        <div
                          key={tIdx}
                          className={'flex items-start gap-3 p-3 rounded-xl border transition-all ' + (isSpeakerB ? 'bg-pink-50/40 border-pink-200/70 ml-2 sm:ml-6' : 'bg-white border-slate-200/80 mr-2 sm:mr-6')}
                        >
                          <span
                            className={'w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center shrink-0 mt-0.5 ' + (isSpeakerB ? 'bg-pink-600 text-white' : 'bg-slate-800 text-white')}
                          >
                            {turn.role}
                          </span>

                          <div className="flex-1 space-y-0.5 min-w-0">
                            <div className="text-[10px] font-bold text-slate-400">
                              {turn.speaker}
                            </div>
                            <div className="pt-0.5">
                              <FuriganaWord
                                kanji={turn.kanji}
                                kana={turn.kana}
                                romaji={turn.romaji}
                                level={currentLevel}
                                forceFurigana={showFurigana && (currentLevel === 'N5' || currentLevel === 'N4')}
                                size="base"
                              />
                            </div>
                            {showTranslation && turn.vi && (
                              <div className="text-xs text-slate-600 pt-1 border-t border-slate-100 mt-1">
                                {turn.vi}
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={function () { handlePlaySentence(turn.kanji); }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-pink-600 hover:bg-white transition-colors shrink-0 cursor-pointer"
                            title="Nghe riêng câu này để luyện Shadowing"
                          >
                            <Volume2 size={15} />
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Câu hỏi trắc nghiệm chuẩn đề JLPT */}
            <div className="space-y-3.5 pt-1">
              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-pink-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  Q
                </span>
                <h4 className="text-sm sm:text-base font-black text-slate-900 leading-snug mb-0">
                  {track.question}
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {track.options &&
                  track.options.map(function (opt) {
                    const isSelected = selectedOption === opt.id;
                    const isCorrect = isAnswered && opt.id === track.correctAnswer;
                    const isWrongSelected = isAnswered && isSelected && opt.id !== track.correctAnswer;

                    let btnStyle = 'bg-white border-slate-200 text-slate-700 hover:border-pink-300 hover:bg-pink-50/30';
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-xs ring-2 ring-emerald-300';
                    } else if (isWrongSelected) {
                      btnStyle = 'bg-rose-50 border-rose-400 text-rose-900 font-bold shadow-xs ring-2 ring-rose-200';
                    } else if (isSelected) {
                      btnStyle = 'bg-pink-50 border-pink-500 text-pink-900 font-bold';
                    }

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={function () { handleSelectOption(opt.id); }}
                        disabled={isAnswered}
                        className={'p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ' + btnStyle + ' ' + (isAnswered ? 'cursor-default' : 'hover:scale-[1.01] active:scale-[0.99]')}
                        style={{ minHeight: '48px' }}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={'w-6 h-6 rounded-lg font-black text-xs flex items-center justify-center shrink-0 ' + (isCorrect ? 'bg-emerald-600 text-white' : isWrongSelected ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-700')}
                          >
                            {opt.id}
                          </span>
                          <span className="font-semibold text-xs sm:text-sm">{opt.text}</span>
                        </div>

                        {isCorrect && <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />}
                        {isWrongSelected && <XCircle size={16} className="text-rose-600 shrink-0" />}
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Giải thích chi tiết & Bẫy nghe */}
            {isAnswered && (
              <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-3.5 animate-in fade-in duration-200">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-slate-200/70">
                  <div className="flex items-center gap-1.5">
                    {selectedOption === track.correctAnswer ? (
                      <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs sm:text-sm">
                        <CheckCircle2 size={16} className="text-emerald-600" />
                        <span>CHÍNH XÁC! TAI NGHE RẤT TINH</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-rose-700 font-bold text-xs sm:text-sm">
                        <XCircle size={16} className="text-rose-600" />
                        <span>CHƯA ĐÚNG! HÃY NGHE LẠI TỪ KHÓA BẪY</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={function () {
                      askAi(
                        'explain_listening',
                        {
                          question: track.question,
                          correctAnswer: track.correctAnswer,
                          audioText: track.audioText,
                          title: track.topic
                        },
                        'AI Phân Tích Choukai: ' + track.topic
                      );
                    }}
                    className="px-3 py-1 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Sparkles size={13} />
                    <span>AI Sensei phân tích bẫy nghe</span>
                  </button>
                </div>

                <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
                  <p className="mb-0 font-medium">{track.explanation}</p>
                  {track.tip && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2">
                      <HelpCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-[11px] uppercase tracking-wide text-amber-800 mb-0.5">
                          MẸO BẮT TỪ KHÓA JLPT CHOUKAI:
                        </strong>
                        <span>{track.tip}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-1 flex justify-end">
                  <button
                    type="button"
                    onClick={handleNextTrack}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all hover:scale-102 cursor-pointer"
                  >
                    <span>Bài nghe tiếp theo</span>
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* Phân trang dưới cùng */}
            <div className="flex items-center justify-between pt-2 border-t border-pink-50 text-xs">
              <button
                type="button"
                onClick={handlePrevTrack}
                disabled={currentIndex === 0}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold flex items-center gap-1 transition-colors disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft size={14} />
                <span>Bài trước</span>
              </button>

              <span className="font-extrabold text-slate-400">
                Bài {currentIndex + 1} / {currentTracks.length}
              </span>

              <button
                type="button"
                onClick={handleNextTrack}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Bài sau</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════ TAB 2: LỘ TRÌNH 4 GIAI ĐOẠN ════════════════════ */}
      {activeTab === 'roadmap' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-pink-100 flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5">
              <Compass size={15} className="text-pink-600" />
              <span>Lộ trình 4 giai đoạn bứt phá kỹ năng nghe hiểu JLPT</span>
            </span>
            <span className="text-slate-400">Từ số 0 đến tự tin đạt điểm cao</span>
          </div>

          <div className="space-y-4">
            {LISTENING_ROADMAP_STAGES.map(function (stageItem) {
              return (
                <div
                  key={stageItem.stage}
                  className="p-6 rounded-3xl bg-white border border-pink-100 shadow-sm space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-pink-100 text-pink-700 font-black text-sm flex items-center justify-center shrink-0">
                        {stageItem.stage}
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-900">
                          {stageItem.title}
                        </h3>
                        <span className="text-[11px] font-bold text-slate-400 block">
                          {stageItem.enTitle}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {stageItem.desc}
                  </p>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1">
                    <div>
                      <strong className="text-slate-900">Trọng tâm rèn luyện: </strong>
                      <span>{stageItem.focus}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                    <Lightbulb size={15} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-[11px] uppercase tracking-wide text-amber-800 font-extrabold mb-0.5">
                        Mẹo sư phạm:
                      </strong>
                      <span>{stageItem.tip}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ════════════════════ TAB 3: PHƯƠNG PHÁP & BẪY NGHE ════════════════════ */}
      {activeTab === 'methods' && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-white border border-pink-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-pink-50">
              <Lightbulb size={20} className="text-amber-500" />
              <h2 className="text-lg font-black text-slate-900">
                4 Phương Pháp Luyện Nghe Đỉnh Cao Chuẩn Khoa Học
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {LISTENING_METHODS.map(function (m) {
                return (
                  <div key={m.id} className="p-4 rounded-2xl bg-pink-50/50 border border-pink-100 space-y-1.5">
                    <h3 className="text-xs font-black text-pink-700">
                      {m.name}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {m.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-pink-100 shadow-sm space-y-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <BookmarkCheck size={16} className="text-emerald-600" />
              <span>Bí Quyết Tránh Bẫy Trong Phòng Thi JLPT Choukai</span>
            </h3>

            <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Đọc trước đáp án:</strong> Luôn tận dụng khoảng thời gian người đọc đề đọc hướng dẫn để lướt nhanh 4 lựa chọn in sẵn.
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Quy tắc "Không hối tiếc":</strong> Đề nghe JLPT chỉ phát 1 lần duy nhất. Nếu lỡ không nghe rõ câu nào, lập tức chọn đáp án có xác suất cao nhất và chuyển sự chú ý sang câu kế tiếp, tuyệt đối không suy nghĩ lại câu cũ.
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Bắt từ chuyển ý:</strong> Khi nghe thấy "demo", "shikashi", "yappari", hãy tập trung 200% vì câu trả lời chính xác luôn nằm ngay sau đó.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════ TAB 4: CHUỖI TỪ VỰNG ════════════════════ */}
      {activeTab === 'vocab' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-pink-100 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-pink-50 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-600 animate-ping" />
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  LUYỆN NGHE TỪ VỰNG LIÊN TỤC (BÀI {lessonChoice === 'all' ? (activeLevel === 'N4' ? 26 : 1) : lessonChoice} - {activeLevel})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">
                  Từ {activeVocabIndex + 1} / {vocabList.length || 0}
                </span>
              </div>
            </div>

            {loadingVocab ? (
              <div className="py-12 text-center text-xs text-slate-400 font-bold">
                Đang nạp danh sách từ vựng bài học từ hệ thống...
              </div>
            ) : vocabList.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 font-bold">
                Không tìm thấy từ vựng cho bài học này. Vui lòng chọn bài khác.
              </div>
            ) : (
              <div className="py-6 space-y-6">
                {(function () {
                  const currentWord = vocabList[activeVocabIndex] || {};
                  return (
                    <div className="text-center space-y-3">
                      <div className="min-h-[90px] flex items-center justify-center">
                        <FuriganaWord
                          kanji={currentWord.kanji}
                          kana={currentWord.clean_kana || currentWord.kana}
                          size="5xl"
                        />
                      </div>

                      {currentWord.romaji && (
                        <div className="text-xs font-mono font-medium text-slate-400">
                          {currentWord.romaji}
                        </div>
                      )}

                      <div className="p-3.5 rounded-2xl bg-pink-50/60 border border-pink-100 font-bold text-slate-800 text-sm sm:text-base max-w-md mx-auto">
                        {currentWord.clean_vietnamese || currentWord.vietnamese}
                      </div>
                    </div>
                  );
                })()}

                <div className="flex items-center justify-center gap-4 pt-2">
                  <button
                    type="button"
                    onClick={function () {
                      sounds.playFlip();
                      setActiveVocabIndex(function (prev) {
                        return prev > 0 ? prev - 1 : vocabList.length - 1;
                      });
                    }}
                    className="p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer shadow-xs"
                    title="Từ trước đó"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={function () {
                      sounds.playFlip();
                      setIsVocabAutoPlaying(function (prev) {
                        return !prev;
                      });
                    }}
                    className={'px-6 py-3 rounded-2xl font-black text-xs sm:text-sm text-white flex items-center gap-2 shadow-lotus transition-all cursor-pointer ' + (isVocabAutoPlaying ? 'bg-rose-600 hover:bg-rose-500 scale-102 ring-4 ring-rose-200' : 'bg-pink-600 hover:bg-pink-500 hover:scale-102')}
                  >
                    {isVocabAutoPlaying ? <Pause size={17} /> : <Play size={17} fill="white" />}
                    <span>{isVocabAutoPlaying ? 'Tạm dừng phát chuỗi' : 'Tự động phát chuỗi từ'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={function () {
                      const currentWord = vocabList[activeVocabIndex];
                      if (currentWord) {
                        sounds.playFlip();
                        speakJapanese(currentWord.kanji || currentWord.kana, playbackSpeed);
                      }
                    }}
                    className="p-3 rounded-2xl border border-pink-200 bg-pink-50 hover:bg-pink-100 text-pink-600 cursor-pointer shadow-xs"
                    title="Nghe lại phát âm Tokyo"
                  >
                    <Volume2 size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={function () {
                      sounds.playFlip();
                      setActiveVocabIndex(function (prev) {
                        return (prev + 1) % vocabList.length;
                      });
                    }}
                    className="p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer shadow-xs"
                    title="Từ tiếp theo"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 rounded-3xl bg-white border border-pink-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-slate-900 mb-0 flex items-center gap-2">
                <ListMusic size={16} className="text-pink-600" />
                <span>Danh Sách Toàn Bộ Từ Vựng Trong Bài ({vocabList.length} từ)</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">Nhấp vào từ để nghe tức thì</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[480px] overflow-y-auto pr-1">
              {vocabList.map(function (item, idx) {
                const isActive = idx === activeVocabIndex;
                return (
                  <div
                    key={item.id || idx}
                    onClick={function () {
                      sounds.playFlip();
                      setActiveVocabIndex(idx);
                      speakJapanese(item.kanji || item.kana, playbackSpeed);
                    }}
                    className={'p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ' + (isActive ? 'bg-pink-50 border-pink-400 ring-2 ring-pink-200 shadow-xs' : 'bg-white border-slate-100 hover:border-pink-200 hover:bg-pink-50/30')}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={'text-[10px] font-black w-5 shrink-0 ' + (isActive ? 'text-pink-600' : 'text-slate-400')}>
                        #{idx + 1}
                      </span>
                      <div className="min-w-0">
                        <FuriganaWord
                          kanji={item.kanji}
                          kana={item.clean_kana || item.kana}
                          size="sm"
                        />
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          {item.clean_vietnamese || item.vietnamese}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={function (e) {
                        e.stopPropagation();
                        speakJapanese(item.kanji || item.kana, playbackSpeed);
                      }}
                      className="p-1.5 rounded-lg text-pink-600 hover:bg-pink-100/70 shrink-0 ml-2"
                      title="Nghe phát âm"
                    >
                      <Volume2 size={15} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
