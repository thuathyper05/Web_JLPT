import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { speakJapanese, vocabService } from '../services/api';
import { sounds } from '../services/sounds';
import confetti from 'canvas-confetti';
import SakuraPulse from '../components/SakuraPulse';
import FuriganaWord from '../components/FuriganaWord';
import { listeningTracksByLevel } from '../data/listeningTracks';
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
  Shuffle
} from 'lucide-react';

export default function ListeningPage() {
  const { currentLevel, askAi, selectedLesson: appLesson } = useApp();
  const activeLevel = currentLevel || 'N5';

  // Mode: 'dialogue' (Choukai Hội Thoại & Trắc Nghiệm) | 'vocab' (Luyện Nghe Toàn Bộ Từ Vựng)
  const [listenMode, setListenMode] = useState('dialogue');

  // Selected lesson choice
  const defaultLessonChoice = activeLevel === 'N4' ? '26' : '1';
  const [lessonChoice, setLessonChoice] = useState(defaultLessonChoice);

  // Tracks for the active level
  const levelTracks = listeningTracksByLevel[activeLevel] || listeningTracksByLevel.N5 || [];

  // Filtered tracks based on lesson choice
  const currentTracks =
    lessonChoice === 'all'
      ? levelTracks
      : levelTracks.filter((t) => String(t.lesson) === String(lessonChoice));

  // Current track index in currentTracks
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

  // Playback & Interactive States
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showFurigana, setShowFurigana] = useState(true);
  const [showTranslation, setShowTranslation] = useState(false);

  // Quiz State
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [listenCount, setListenCount] = useState(0);

  // Vocab Audio Stream States
  const [vocabList, setVocabList] = useState([]);
  const [loadingVocab, setLoadingVocab] = useState(false);
  const [activeVocabIndex, setActiveVocabIndex] = useState(0);
  const [isVocabAutoPlaying, setIsVocabAutoPlaying] = useState(false);
  const vocabTimerRef = useRef(null);

  // Update default lesson when activeLevel changes
  useEffect(() => {
    const newDefault = activeLevel === 'N4' ? '26' : '1';
    setLessonChoice(newDefault);
    setCurrentIndex(0);
    setScore(0);
  }, [activeLevel]);

  // Reset track states when changing lessonChoice or currentIndex
  useEffect(() => {
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
  }, [lessonChoice]);

  useEffect(() => {
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

  // Fetch Vocabularies for the selected lesson when in vocab mode
  useEffect(() => {
    let isMounted = true;
    const fetchLessonVocab = async () => {
      setLoadingVocab(true);
      try {
        const lessonNum = lessonChoice === 'all' ? (activeLevel === 'N4' ? 26 : 1) : parseInt(lessonChoice, 10);
        const res = await vocabService.getVocabularies({
          level: activeLevel,
          lesson_number: lessonNum
        });
        const words = res.data?.data || [];
        if (isMounted) {
          setVocabList(words);
          setActiveVocabIndex(0);
        }
      } catch (err) {
        console.error('Error fetching listening vocab:', err);
      } finally {
        if (isMounted) setLoadingVocab(false);
      }
    };

    fetchLessonVocab();
    return () => {
      isMounted = false;
    };
  }, [activeLevel, lessonChoice]);

  // Handle Vocab Auto-play Stream
  useEffect(() => {
    if (!isVocabAutoPlaying || vocabList.length === 0) {
      if (vocabTimerRef.current) clearTimeout(vocabTimerRef.current);
      return;
    }

    const currentWord = vocabList[activeVocabIndex];
    if (currentWord) {
      speakJapanese(currentWord.kanji || currentWord.kana, playbackSpeed);
    }

    // Interval to advance to next word
    vocabTimerRef.current = setTimeout(() => {
      setActiveVocabIndex((prev) => (prev + 1) % vocabList.length);
    }, Math.max(2200, 3200 / playbackSpeed));

    return () => {
      if (vocabTimerRef.current) clearTimeout(vocabTimerRef.current);
    };
  }, [isVocabAutoPlaying, activeVocabIndex, vocabList, playbackSpeed]);

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (vocabTimerRef.current) clearTimeout(vocabTimerRef.current);
    };
  }, []);

  // Handle Play Whole Dialogue Audio
  const handlePlayAudio = () => {
    if (!track) return;
    sounds.playFlip();
    setIsPlaying(true);
    setListenCount((prev) => prev + 1);

    speakJapanese(track.audioText, playbackSpeed);

    const durationMs = Math.max(2200, (track.audioText.length * 190) / playbackSpeed);
    setTimeout(() => {
      setIsPlaying(false);
    }, durationMs);
  };

  // Replay individual sentence
  const handlePlaySentence = (text) => {
    sounds.playFlip();
    speakJapanese(text, playbackSpeed);
  };

  // Handle Option Select
  const handleSelectOption = (optId) => {
    if (isAnswered || !track) return;
    setSelectedOption(optId);
    setIsAnswered(true);

    if (optId === track.correctAnswer) {
      sounds.playCorrect();
      setScore((prev) => prev + 1);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#db2777', '#f43f5e', '#fbbf24', '#34d399']
      });
    } else {
      sounds.playWrong();
    }
  };

  // Next Track
  const handleNextTrack = () => {
    sounds.playFlip();
    if (currentIndex < currentTracks.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  // Previous Track
  const handlePrevTrack = () => {
    sounds.playFlip();
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Keyboard Shortcuts (Space to Play/Replay, 1..4 for options)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (listenMode === 'dialogue') {
          handlePlayAudio();
        } else {
          setIsVocabAutoPlaying((prev) => !prev);
        }
      } else if (['Digit1', 'Digit2', 'Digit3', 'Digit4'].includes(e.code) && !isAnswered && listenMode === 'dialogue') {
        const keyMap = { Digit1: 'A', Digit2: 'B', Digit3: 'C', Digit4: 'D' };
        handleSelectOption(keyMap[e.code]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [track, isAnswered, playbackSpeed, listenMode]);

  // Lessons list options for current level
  const lessonList = React.useMemo(() => {
    if (activeLevel === 'N4') {
      return Array.from({ length: 25 }, (_, i) => i + 26);
    }
    return Array.from({ length: 25 }, (_, i) => i + 1);
  }, [activeLevel]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* ── 1. CLEAN TOP HEADER BANNER ── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-pink-100 shadow-sm relative overflow-hidden">
        {/* Subtle Watermark */}
        <div className="absolute right-4 top-2 text-pink-100/50 font-jp font-black text-8xl pointer-events-none select-none">
          聴
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 text-pink-700 font-extrabold text-[11px] uppercase tracking-wider border border-pink-100">
              <Headphones size={13} className="text-pink-600" />
              <span>CHOUKAI (聴解) - BÁM SÁT ĐỀ THI JLPT {activeLevel}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold">
              <Award size={14} className="text-amber-500" />
              <span>Điểm trắc nghiệm: <strong>{score}</strong>/{currentTracks.length}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug mb-1">
                Luyện Nghe Hội Thoại Chuẩn Giọng Tokyo (Cấp Độ {activeLevel})
              </h1>
              <p className="text-xs text-slate-500 max-w-2xl mb-0">
                Toàn bộ các bài nghe Choukai cấp độ {activeLevel} bám sát giáo trình chuẩn và đề thi JLPT. Hỗ trợ kịch bản từng vai, phát âm mẫu bản xứ và trợ lý AI Sensei phân tích bẫy nghe.
              </p>
            </div>

            {/* Lesson Selector */}
            <div className="flex items-center gap-2 shrink-0">
              <select
                value={lessonChoice}
                onChange={(e) => {
                  sounds.playFlip();
                  setLessonChoice(e.target.value);
                }}
                className="px-3.5 py-2 rounded-xl border border-pink-200 bg-white text-xs font-bold text-slate-800 cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="all">Tất cả bài học (Cấp độ {activeLevel})</option>
                {lessonList.map((n) => (
                  <option key={n} value={String(n)}>
                    Bài {n < 10 ? `0${n}` : n} - Giáo trình {activeLevel}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-2 pt-2 border-t border-pink-50">
            <button
              type="button"
              onClick={() => {
                sounds.playFlip();
                setListenMode('dialogue');
                if (vocabTimerRef.current) clearTimeout(vocabTimerRef.current);
                setIsVocabAutoPlaying(false);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                listenMode === 'dialogue'
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-pink-50 text-slate-600'
              }`}
            >
              <Radio size={14} />
              <span>Chế độ 1: Hội thoại tình huống & Đề thi</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playFlip();
                setListenMode('vocab');
                if (typeof window !== 'undefined' && window.speechSynthesis) {
                  window.speechSynthesis.cancel();
                }
              }}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                listenMode === 'vocab'
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-pink-50 text-slate-600'
              }`}
            >
              <ListMusic size={14} />
              <span>Chế độ 2: Luyện nghe toàn bộ từ vựng</span>
            </button>
          </div>

          {/* Quick Track Switcher Pills (Chỉ hiện khi ở Mode Dialogue) */}
          {listenMode === 'dialogue' && currentTracks.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pt-2 text-xs">
              <span className="text-slate-400 font-bold shrink-0 text-[11px]">BÀI NGHE:</span>
              {currentTracks.map((t, idx) => (
                <button
                  key={t.id || idx}
                  type="button"
                  onClick={() => {
                    sounds.playFlip();
                    setCurrentIndex(idx);
                  }}
                  className={`px-3 py-1 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                    currentIndex === idx
                      ? 'bg-pink-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-pink-50 text-slate-600'
                  }`}
                >
                  Bài {t.lesson < 10 ? `0${t.lesson}` : t.lesson}: {t.topic.split(':')[1] || t.topic}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── 2. MODE A: DIALOGUE & JLPT QUIZ ── */}
      {listenMode === 'dialogue' && track && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-pink-100 shadow-sm space-y-6">
          {/* Track Header & Situation Context */}
          <div className="space-y-2 border-b border-pink-50 pb-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-black text-pink-600 uppercase tracking-wider">
                {track.topic}
              </span>
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

          {/* Central Audio Playback & Speed Controls */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-pink-50/50 to-white border border-pink-200/70 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handlePlayAudio}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lotus transition-all cursor-pointer ${
                  isPlaying
                    ? 'bg-rose-500 scale-95 ring-4 ring-rose-200'
                    : 'bg-pink-600 hover:bg-pink-500 hover:scale-105 active:scale-95'
                }`}
                title="Phím Space để Nghe / Nghe lại"
              >
                {isPlaying ? <Volume2 size={24} className="animate-pulse" /> : <Play size={24} fill="white" className="ml-0.5" />}
              </button>

              <div>
                <div className="font-extrabold text-sm text-slate-900">
                  {isPlaying ? 'Đang phát âm thanh Tokyo...' : 'Nghe toàn bộ hội thoại'}
                </div>
                <div className="text-[11px] text-slate-500">
                  Giọng đọc chuẩn cao độ bản xứ | Nhấn Space để phát lại
                </div>
              </div>
            </div>

            {/* Playback Controls (Speed + View Toggles) */}
            <div className="flex items-center gap-2 flex-wrap justify-end">
              {/* Speed Controller */}
              <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 text-xs">
                <Gauge size={13} className="text-slate-400 ml-1.5 mr-1" />
                {[0.8, 1.0, 1.2].map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => {
                      sounds.playFlip();
                      setPlaybackSpeed(spd);
                    }}
                    className={`px-2 py-0.5 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                      playbackSpeed === spd
                        ? 'bg-pink-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>

              {/* View Transcript Toggle */}
              <button
                type="button"
                onClick={() => {
                  sounds.playFlip();
                  setShowTranscript(!showTranscript);
                }}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  showTranscript
                    ? 'bg-pink-600 text-white border-pink-600 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {showTranscript ? <EyeOff size={13} /> : <Eye size={13} />}
                <span>{showTranscript ? 'Ẩn kịch bản' : 'Hiện kịch bản'}</span>
              </button>
            </div>
          </div>

          {/* Transcript & Roles Section */}
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
                    onClick={() => setShowFurigana(!showFurigana)}
                    className="text-[11px] font-bold text-pink-600 hover:underline cursor-pointer"
                  >
                    {showFurigana ? 'Ẩn Furigana' : 'Hiện Furigana'}
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() => setShowTranslation(!showTranslation)}
                    className="text-[11px] font-bold text-slate-600 hover:underline cursor-pointer"
                  >
                    {showTranslation ? 'Ẩn dịch nghĩa' : 'Hiện dịch nghĩa'}
                  </button>
                </div>
              </div>

              {/* Conversation Turns */}
              <div className="space-y-2.5">
                {track.dialogue &&
                  track.dialogue.map((turn, tIdx) => {
                    const isSpeakerB = turn.role === 'B';
                    return (
                      <div
                        key={tIdx}
                        className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                          isSpeakerB
                            ? 'bg-pink-50/40 border-pink-200/70 ml-2 sm:ml-6'
                            : 'bg-white border-slate-200/80 mr-2 sm:mr-6'
                        }`}
                      >
                        {/* Role Avatar */}
                        <span
                          className={`w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center shrink-0 mt-0.5 ${
                            isSpeakerB ? 'bg-pink-600 text-white' : 'bg-slate-800 text-white'
                          }`}
                        >
                          {turn.role}
                        </span>

                        <div className="flex-1 space-y-0.5 min-w-0">
                          <div className="text-[10px] font-bold text-slate-400">
                            {turn.speaker}
                          </div>
                          <div className="font-jp font-bold text-sm sm:text-base text-slate-900">
                            {turn.kanji}
                          </div>
                          {showFurigana && turn.kana && (
                            <div className="font-jp text-xs text-pink-600 font-medium">
                              {turn.kana}
                            </div>
                          )}
                          {showTranslation && turn.vi && (
                            <div className="text-xs text-slate-600 pt-1 border-t border-slate-100 mt-1">
                              {turn.vi}
                            </div>
                          )}
                        </div>

                        {/* Sentence Replay Button */}
                        <button
                          type="button"
                          onClick={() => handlePlaySentence(turn.kanji)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-pink-600 hover:bg-white transition-colors shrink-0 cursor-pointer"
                          title="Nghe riêng câu này"
                        >
                          <Volume2 size={15} />
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* ── JLPT QUESTION & 4 OPTIONS ── */}
          <div className="space-y-3.5 pt-1">
            <div className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-pink-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                Q
              </span>
              <h4 className="text-sm sm:text-base font-black text-slate-900 leading-snug mb-0">
                {track.question}
              </h4>
            </div>

            {/* 4 Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {track.options &&
                track.options.map((opt) => {
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
                      onClick={() => handleSelectOption(opt.id)}
                      disabled={isAnswered}
                      className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${btnStyle} ${
                        isAnswered ? 'cursor-default' : 'hover:scale-[1.01] active:scale-[0.99]'
                      }`}
                      style={{ minHeight: '48px' }}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-6 h-6 rounded-lg font-black text-xs flex items-center justify-center shrink-0 ${
                            isCorrect
                              ? 'bg-emerald-600 text-white'
                              : isWrongSelected
                              ? 'bg-rose-500 text-white'
                              : 'bg-slate-100 text-slate-700'
                          }`}
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

          {/* Feedback & AI Analysis Callout */}
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

                {/* AI Sensei Analysis Button */}
                <button
                  type="button"
                  onClick={() =>
                    askAi(
                      'explain_listening',
                      {
                        question: track.question,
                        correctAnswer: track.correctAnswer,
                        audioText: track.audioText,
                        title: track.topic
                      },
                      `AI Phân Tích Choukai: ${track.topic}`
                    )
                  }
                  className="px-3 py-1 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles size={13} />
                  <span>AI Sensei phân tích bẫy nghe</span>
                </button>
              </div>

              {/* Explanation & Tip Box */}
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

              {/* Next Track Navigation */}
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

          {/* Bottom Pagination */}
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
      )}

      {/* ── 3. MODE B: LESSON VOCABULARY AUDIO STREAM ── */}
      {listenMode === 'vocab' && (
        <div className="space-y-6">
          {/* Active Word Spotlight Card */}
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
                {/* Word Display with Furigana (100% Precision Aligned) */}
                {(() => {
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

                {/* Player Controls Bar */}
                <div className="flex items-center justify-center gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playFlip();
                      setActiveVocabIndex((prev) => (prev > 0 ? prev - 1 : vocabList.length - 1));
                    }}
                    className="p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer shadow-xs"
                    title="Từ trước đó"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sounds.playFlip();
                      setIsVocabAutoPlaying((prev) => !prev);
                    }}
                    className={`px-6 py-3 rounded-2xl font-black text-xs sm:text-sm text-white flex items-center gap-2 shadow-lotus transition-all cursor-pointer ${
                      isVocabAutoPlaying
                        ? 'bg-rose-600 hover:bg-rose-500 scale-102 ring-4 ring-rose-200'
                        : 'bg-pink-600 hover:bg-pink-500 hover:scale-102'
                    }`}
                  >
                    {isVocabAutoPlaying ? <Pause size={17} /> : <Play size={17} fill="white" />}
                    <span>{isVocabAutoPlaying ? 'Tạm dừng phát chuỗi' : 'Tự động phát chuỗi từ'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
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
                    onClick={() => {
                      sounds.playFlip();
                      setActiveVocabIndex((prev) => (prev + 1) % vocabList.length);
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

          {/* Scrollable Lesson Vocab Stream Grid */}
          <div className="p-6 rounded-3xl bg-white border border-pink-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-slate-900 mb-0 flex items-center gap-2">
                <ListMusic size={16} className="text-pink-600" />
                <span>Danh Sách Toàn Bộ Từ Vựng Trong Bài ({vocabList.length} từ)</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">Nhấp vào từ để nghe tức thì</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[480px] overflow-y-auto pr-1">
              {vocabList.map((item, idx) => {
                const isActive = idx === activeVocabIndex;
                return (
                  <div
                    key={item.id || idx}
                    onClick={() => {
                      sounds.playFlip();
                      setActiveVocabIndex(idx);
                      speakJapanese(item.kanji || item.kana, playbackSpeed);
                    }}
                    className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      isActive
                        ? 'bg-pink-50 border-pink-400 ring-2 ring-pink-200 shadow-xs'
                        : 'bg-white border-slate-100 hover:border-pink-200 hover:bg-pink-50/30'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`text-[10px] font-black w-5 shrink-0 ${isActive ? 'text-pink-600' : 'text-slate-400'}`}>
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
                      onClick={(e) => {
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