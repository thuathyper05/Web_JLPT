import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { kanjiService, speakJapanese } from '../services/api';
import { sounds } from '../services/sounds';
import { KANJI_TOPICS, getKanjiMnemonicInfo, TOPIC_STYLES } from '../data/kanjiTopics.js';
import { generateKanjiQuiz, generateJlptMockExam } from '../services/kanjiQuizGenerator.js';
import KanjiStrokeCanvas from '../components/KanjiStrokeCanvas.jsx';
import KanjiFlashcardMode from '../components/KanjiFlashcardMode.jsx';
import KanjiWritingStudio from '../components/KanjiWritingStudio.jsx';
import ConfusingKanjiStudio from '../components/ConfusingKanjiStudio.jsx';
import {
  PenTool,
  Search,
  Volume2,
  Sparkles,
  X,
  BookOpen,
  RotateCcw,
  Compass,
  Layers,
  ListChecks,
  CheckCircle2,
  XCircle,
  Trophy,
  Award,
  Hash,
  Calendar,
  Users,
  Activity,
  Building,
  Filter,
  Flame,
  Check,
  ChevronRight,
  GraduationCap,
  Timer,
  Edit3,
  GitCompare
} from 'lucide-react';

const TOPIC_ICON_MAP = {
  Hash: Hash,
  Calendar: Calendar,
  Users: Users,
  Compass: Compass,
  Activity: Activity,
  Building: Building,
  Sparkles: Sparkles
};

export default function KanjiPage() {
  const { currentLevel, askAi, guestProgress, recordWordProgress } = useApp();

  // Dữ liệu Kanji từ API
  const [kanjiList, setKanjiList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Chế độ xem: 'roadmap', 'vault', 'writing', 'confusing', 'flashcard', 'practice'
  const [activeTab, setActiveTab] = useState('roadmap');

  // Bộ lọc & Tìm kiếm trong Kho chữ Hán (Vault)
  const [search, setSearch] = useState('');
  const [selectedTopicFilter, setSelectedTopicFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  // Modal chi tiết chữ Hán
  const [selectedKanji, setSelectedKanji] = useState(null);
  const [detailModalTab, setDetailModalTab] = useState('mnemonic');

  // Trạng thái bài tập & thi thử JLPT
  const [quizState, setQuizState] = useState('setup');
  const [quizSettings, setQuizSettings] = useState({
    count: 10,
    topicId: 'all',
    mode: 'all'
  });
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [isMockExam, setIsMockExam] = useState(false);

  const activeLevel = currentLevel || 'N5';

  // Tải danh sách Kanji theo cấp độ hiện tại
  useEffect(function () {
    let isMounted = true;
    async function fetchKanji() {
      setLoading(true);
      try {
        const res = await kanjiService.getKanji({ level: activeLevel });
        const list = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
        if (isMounted) {
          setKanjiList(list);
        }
      } catch (err) {
        console.error('Fetch kanji error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchKanji();
    return function () {
      isMounted = false;
    };
  }, [activeLevel]);

  // Lấy trạng thái của Kanji
  function getKanjiStatus(item) {
    if (!item) return 'unlearned';
    const keyWithId = item.id ? String(item.id) : null;
    const keyWithChar = 'kanji_' + item.kanji;
    const safeProgress = guestProgress && typeof guestProgress === 'object' ? guestProgress : {};

    const progressEntry = (keyWithId && safeProgress[keyWithId]) || safeProgress[keyWithChar] || safeProgress[item.kanji];
    if (progressEntry && progressEntry.status) {
      return progressEntry.status;
    }
    return 'unlearned';
  }

  // Thống kê & Chỉ số sẵn sàng thi đậu JLPT
  const stats = useMemo(function () {
    const total = kanjiList.length;
    let masteredCount = 0;
    let reviewCount = 0;

    for (let i = 0; i < kanjiList.length; i++) {
      const st = getKanjiStatus(kanjiList[i]);
      if (st === 'mastered') masteredCount++;
      else if (st === 'needs_review') reviewCount++;
    }

    const unlearnedCount = Math.max(0, total - masteredCount - reviewCount);
    const masteryRate = total > 0 ? Math.round((masteredCount / total) * 100) : 0;

    let readinessGrade = 'Khởi động';
    let readinessColor = 'text-rose-600 bg-rose-50 border-rose-200';
    if (masteryRate >= 80) {
      readinessGrade = 'Vững vàng đỗ cao';
      readinessColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
    } else if (masteryRate >= 50) {
      readinessGrade = 'Đạt chuẩn cơ bản';
      readinessColor = 'text-amber-700 bg-amber-50 border-amber-200';
    }

    return {
      total: total,
      mastered: masteredCount,
      review: reviewCount,
      unlearned: unlearnedCount,
      rate: masteryRate,
      grade: readinessGrade,
      badgeClass: readinessColor
    };
  }, [kanjiList, guestProgress]);

  // Danh sách đã lọc và sắp xếp
  const filteredKanjiList = useMemo(function () {
    let result = kanjiList.slice();

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(function (item) {
        if (!item) return false;
        return (
          (item.kanji && item.kanji.includes(q)) ||
          (item.han_viet && item.han_viet.toLowerCase().includes(q)) ||
          (item.meaning && item.meaning.toLowerCase().includes(q)) ||
          (item.onyomi && item.onyomi.toLowerCase().includes(q)) ||
          (item.kunyomi && item.kunyomi.toLowerCase().includes(q))
        );
      });
    }

    if (selectedTopicFilter !== 'all') {
      const topicObj = KANJI_TOPICS.find(function (t) {
        return t.id === selectedTopicFilter;
      });
      if (topicObj && topicObj.chars) {
        result = result.filter(function (item) {
          return topicObj.chars.indexOf(item.kanji) !== -1;
        });
      }
    }

    if (statusFilter !== 'all') {
      result = result.filter(function (item) {
        return getKanjiStatus(item) === statusFilter;
      });
    }

    if (sortBy === 'strokes_asc') {
      result.sort(function (a, b) {
        return (a.stroke_count || a.stroke || 1) - (b.stroke_count || b.stroke || 1);
      });
    } else if (sortBy === 'strokes_desc') {
      result.sort(function (a, b) {
        return (b.stroke_count || b.stroke || 1) - (a.stroke_count || a.stroke || 1);
      });
    } else if (sortBy === 'han_viet') {
      result.sort(function (a, b) {
        return (a.han_viet || '').localeCompare(b.han_viet || '', 'vi');
      });
    }

    return result;
  }, [kanjiList, search, selectedTopicFilter, statusFilter, sortBy, guestProgress]);

  // Thống kê từng chủ đề
  const topicStats = useMemo(function () {
    const map = {};
    for (let t = 0; t < KANJI_TOPICS.length; t++) {
      const topic = KANJI_TOPICS[t];
      const charsInLevel = kanjiList.filter(function (k) {
        return topic.chars.indexOf(k.kanji) !== -1;
      });

      let mastered = 0;
      let review = 0;
      for (let c = 0; c < charsInLevel.length; c++) {
        const st = getKanjiStatus(charsInLevel[c]);
        if (st === 'mastered') mastered++;
        else if (st === 'needs_review') review++;
      }

      const totalChars = charsInLevel.length;
      const percent = totalChars > 0 ? Math.round((mastered / totalChars) * 100) : 0;

      map[topic.id] = {
        total: totalChars,
        mastered: mastered,
        review: review,
        percent: percent,
        items: charsInLevel
      };
    }
    return map;
  }, [kanjiList, guestProgress]);

  function openDetail(item) {
    sounds.playFlip();
    setSelectedKanji(item);
    setDetailModalTab('mnemonic');
    speakJapanese(item.kanji);
  }

  function handleMarkStatus(item, newStatus) {
    if (!item) return;
    const wordKey = item.id ? item.id : 'kanji_' + item.kanji;
    if (newStatus === 'mastered') {
      sounds.playCorrect();
    } else {
      sounds.playFlip();
    }
    if (typeof recordWordProgress === 'function') {
      recordWordProgress(wordKey, newStatus);
    }
  }

  function handleStartQuiz(customTopicId, forceExam) {
    sounds.playFlip();
    const targetTopicId = customTopicId || quizSettings.topicId;

    let questions = [];
    if (forceExam) {
      setIsMockExam(true);
      questions = generateJlptMockExam(kanjiList, 15);
    } else {
      setIsMockExam(false);
      let targetTopicChars = null;
      if (targetTopicId !== 'all') {
        const topicObj = KANJI_TOPICS.find(function (t) {
          return t.id === targetTopicId;
        });
        if (topicObj) {
          targetTopicChars = topicObj.chars;
        }
      }

      questions = generateKanjiQuiz(kanjiList, {
        count: quizSettings.count,
        topicChars: targetTopicChars,
        quizMode: quizSettings.mode
      });
    }

    if (questions.length === 0) {
      alert('Không đủ dữ liệu Kanji để tạo bài tập cho cấu hình này. Hãy chọn thêm chủ đề hoặc cấp độ khác.');
      return;
    }

    setQuizQuestions(questions);
    setQuizIndex(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setQuizScore(0);
    setQuizState('playing');
    setActiveTab('practice');
  }

  function handleSelectAnswer(option) {
    if (isAnswerSubmitted) return;

    const currentQ = quizQuestions[quizIndex];
    if (!currentQ) return;

    setSelectedAnswer(option);
    setIsAnswerSubmitted(true);

    const isCorrect = option === currentQ.correctAnswer;
    if (isCorrect) {
      sounds.playCorrect();
      setQuizScore(function (prev) {
        return prev + 1;
      });
      if (currentQ.targetItem) {
        handleMarkStatus(currentQ.targetItem, 'mastered');
      }
    } else {
      sounds.playWrong();
      if (currentQ.targetItem) {
        handleMarkStatus(currentQ.targetItem, 'needs_review');
      }
    }
  }

  function handleNextQuestion() {
    sounds.playFlip();
    if (quizIndex < quizQuestions.length - 1) {
      setQuizIndex(function (prev) {
        return prev + 1;
      });
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
    } else {
      sounds.playLevelUp();
      setQuizState('result');
    }
  }

  function handleJumpToTopicVault(topicId) {
    setSelectedTopicFilter(topicId);
    setStatusFilter('all');
    setSearch('');
    setActiveTab('vault');
    sounds.playFlip();
  }

  const selectedKanjiMnemonic = useMemo(function () {
    if (!selectedKanji) return null;
    return getKanjiMnemonicInfo(selectedKanji.kanji, selectedKanji.han_viet, selectedKanji.meaning);
  }, [selectedKanji]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20 animate-in fade-in duration-300">
      {/* ════════════════════ 1. HEADER & CHỈ SỐ SẴN SÀNG JLPT ════════════════════ */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-pink-100 shadow-sm relative overflow-hidden">
        <div className="absolute right-4 top-2 text-pink-100/40 font-jp font-black text-8xl sm:text-9xl pointer-events-none select-none">
          漢
        </div>

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 text-pink-700 font-extrabold text-[11px] uppercase tracking-wider">
              <PenTool size={13} className="text-pink-600" />
              <span>CHỮ HÁN KANJI - CHUẨN JLPT {activeLevel}</span>
            </div>

            <div className={'px-3 py-1 rounded-full border text-xs font-black flex items-center gap-1.5 ' + stats.badgeClass}>
              <GraduationCap size={15} />
              <span>Độ sẵn sàng thi JLPT: {stats.grade} ({stats.rate}%)</span>
            </div>
          </div>

          <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug mb-1.5">
            Chinh Phục Chữ Hán Kanji JLPT {activeLevel}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mb-6">
            Lộ trình học chiết tự tượng hình, giải nghĩa 214 bộ thủ, phòng tập viết nét trên canvas, bí quyết phân biệt chữ dễ nhầm và bộ đề thi mô phỏng JLPT thật.
          </p>

          {/* 4 Khối thống kê tiến độ học tập */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-pink-50">
            <div className="p-3 rounded-2xl bg-pink-50/50 border border-pink-100 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tổng Kanji</span>
              <span className="text-lg sm:text-xl font-black text-slate-800">{stats.total} chữ</span>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-center">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block flex items-center justify-center gap-1">
                <CheckCircle2 size={11} />
                <span>Đã thuộc</span>
              </span>
              <span className="text-lg sm:text-xl font-black text-emerald-700">
                {stats.mastered} <span className="text-xs font-semibold text-emerald-500">({stats.rate}%)</span>
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-100 text-center">
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block flex items-center justify-center gap-1">
                <Flame size={11} />
                <span>Cần ôn</span>
              </span>
              <span className="text-lg sm:text-xl font-black text-amber-700">{stats.review} chữ</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Chưa học</span>
              <span className="text-lg sm:text-xl font-black text-slate-600">{stats.unlearned} chữ</span>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════ 2. THANH ĐIỀU HƯỚNG 6 CHẾ ĐỘ CHUYÊN SÂU ════════════════════ */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-pink-50/70 border border-pink-100 shadow-sm overflow-x-auto">
        <button
          type="button"
          onClick={function () {
            sounds.playFlip();
            setActiveTab('roadmap');
          }}
          className={'flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ' + (activeTab === 'roadmap' ? 'bg-white text-pink-700 shadow-sm border border-pink-200' : 'text-slate-600 hover:text-pink-600')}
        >
          <Compass size={15} className={activeTab === 'roadmap' ? 'text-pink-600' : 'text-slate-400'} />
          <span>1. Lộ Trình</span>
        </button>

        <button
          type="button"
          onClick={function () {
            sounds.playFlip();
            setActiveTab('vault');
          }}
          className={'flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ' + (activeTab === 'vault' ? 'bg-white text-pink-700 shadow-sm border border-pink-200' : 'text-slate-600 hover:text-pink-600')}
        >
          <Layers size={15} className={activeTab === 'vault' ? 'text-pink-600' : 'text-slate-400'} />
          <span>2. Kho Hán Tự ({filteredKanjiList.length})</span>
        </button>

        <button
          type="button"
          onClick={function () {
            sounds.playFlip();
            setActiveTab('writing');
          }}
          className={'flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ' + (activeTab === 'writing' ? 'bg-white text-pink-700 shadow-sm border border-pink-200' : 'text-slate-600 hover:text-pink-600')}
        >
          <Edit3 size={15} className={activeTab === 'writing' ? 'text-pink-600' : 'text-slate-400'} />
          <span>3. Tập Viết Nét</span>
        </button>

        <button
          type="button"
          onClick={function () {
            sounds.playFlip();
            setActiveTab('confusing');
          }}
          className={'flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ' + (activeTab === 'confusing' ? 'bg-white text-pink-700 shadow-sm border border-pink-200' : 'text-slate-600 hover:text-pink-600')}
        >
          <GitCompare size={15} className={activeTab === 'confusing' ? 'text-pink-600' : 'text-slate-400'} />
          <span>4. Chữ Dễ Nhầm</span>
        </button>

        <button
          type="button"
          onClick={function () {
            sounds.playFlip();
            setActiveTab('flashcard');
          }}
          className={'flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ' + (activeTab === 'flashcard' ? 'bg-white text-pink-700 shadow-sm border border-pink-200' : 'text-slate-600 hover:text-pink-600')}
        >
          <Sparkles size={15} className={activeTab === 'flashcard' ? 'text-pink-600' : 'text-slate-400'} />
          <span>5. Flashcard</span>
        </button>

        <button
          type="button"
          onClick={function () {
            sounds.playFlip();
            setActiveTab('practice');
          }}
          className={'flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ' + (activeTab === 'practice' ? 'bg-white text-pink-700 shadow-sm border border-pink-200' : 'text-slate-600 hover:text-pink-600')}
        >
          <ListChecks size={15} className={activeTab === 'practice' ? 'text-pink-600' : 'text-slate-400'} />
          <span>6. Luyện Đề JLPT</span>
        </button>
      </div>

      {/* ════════════════════ TAB 1: LỘ TRÌNH HÁN TỰ (ROADMAP) ════════════════════ */}
      {activeTab === 'roadmap' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-pink-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-bold">
              <Compass size={16} className="text-pink-600" />
              <span>Lộ trình {KANJI_TOPICS.length} chặng chủ đề thiết yếu cho JLPT {activeLevel}</span>
            </div>
            <div className="text-slate-400">
              Nhấp vào chữ để xem chi tiết chiết tự hoặc chọn chặng để giải bài tập ngay
            </div>
          </div>

          <div className="space-y-4">
            {KANJI_TOPICS.map(function (topic, topicIndex) {
              const currentTopicStat = topicStats[topic.id] || { total: 0, mastered: 0, percent: 0, items: [] };
              const IconComp = TOPIC_ICON_MAP[topic.iconName] || BookOpen;
              const style = TOPIC_STYLES[topic.id] || TOPIC_STYLES.numbers;

              return (
                <div
                  key={topic.id}
                  className="p-5 sm:p-6 rounded-3xl bg-white border border-pink-100 shadow-sm hover:shadow-lotus-sm transition-all relative overflow-hidden"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={'w-11 h-11 rounded-2xl flex items-center justify-center ' + style.bgLight + ' border ' + style.border}>
                        <IconComp size={20} className={style.text} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-100">
                            Chặng {topicIndex + 1}
                          </span>
                          <h3 className="text-base sm:text-lg font-black text-slate-900">
                            {topic.name}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {topic.desc}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-black text-slate-800">
                        {currentTopicStat.mastered} / {currentTopicStat.total} chữ
                      </div>
                      <div className="text-[11px] font-bold text-emerald-600">
                        {currentTopicStat.percent}% hoàn thành
                      </div>
                    </div>
                  </div>

                  <div className="w-full h-2 rounded-full bg-pink-50 overflow-hidden mb-4">
                    <div
                      className={'h-full rounded-full transition-all duration-500 ' + style.progress}
                      style={{ width: currentTopicStat.percent + '%' }}
                    />
                  </div>

                  {currentTopicStat.items.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                      Chủ đề này chưa có chữ Hán nào trong cấp độ {activeLevel}.
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5 mb-4">
                      {currentTopicStat.items.map(function (kItem) {
                        const kStatus = getKanjiStatus(kItem);
                        const isMastered = kStatus === 'mastered';
                        const isReview = kStatus === 'needs_review';

                        return (
                          <button
                            key={kItem.id || kItem.kanji}
                            type="button"
                            onClick={function () { openDetail(kItem); }}
                            className={'p-2.5 rounded-2xl border transition-all text-center flex flex-col items-center justify-between cursor-pointer group relative ' + (isMastered ? 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-400' : isReview ? 'bg-amber-50/50 border-amber-200 hover:border-amber-400' : 'bg-white border-pink-100 hover:border-pink-300 hover:shadow-sm')}
                          >
                            {isMastered && (
                              <div className="absolute top-1 right-1 text-emerald-600">
                                <Check size={10} strokeWidth={3} />
                              </div>
                            )}
                            {isReview && (
                              <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-500" />
                            )}

                            <span className="text-2xl sm:text-3xl font-black font-jp text-slate-800 group-hover:text-pink-600 group-hover:scale-110 transition-transform my-0.5">
                              {kItem.kanji}
                            </span>
                            <span className="text-[10px] font-bold text-amber-700 truncate max-w-full">
                              {kItem.han_viet || '—'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-pink-50 text-xs">
                    <button
                      type="button"
                      onClick={function () { handleJumpToTopicVault(topic.id); }}
                      className="text-pink-600 font-extrabold flex items-center gap-1 hover:text-pink-700 cursor-pointer"
                    >
                      <span>Xem toàn bộ chữ trong chủ đề này</span>
                      <ChevronRight size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={function () {
                        setQuizSettings(function (prev) {
                          return { ...prev, topicId: topic.id };
                        });
                        handleStartQuiz(topic.id, false);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-pink-50 border border-pink-200 text-pink-700 font-extrabold hover:bg-pink-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <ListChecks size={13} className="text-pink-600" />
                      <span>Luyện bài tập chặng này</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ════════════════════ TAB 2: KHO HÁN TỰ (VAULT) ════════════════════ */}
      {activeTab === 'vault' && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-white border border-pink-100 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm Kanji, Hán Việt, On, Kun, nghĩa..."
                  value={search}
                  onChange={function (e) { setSearch(e.target.value); }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-pink-200 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500 bg-pink-50/30 focus:bg-white transition-all"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 hidden sm:inline">Sắp xếp:</span>
                <select
                  value={sortBy}
                  onChange={function (e) { setSortBy(e.target.value); }}
                  className="px-3 py-2 rounded-xl border border-pink-200 text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-pink-400 cursor-pointer"
                >
                  <option value="default">Thứ tự bài học</option>
                  <option value="strokes_asc">Số nét (Ít đến Nhiều)</option>
                  <option value="strokes_desc">Số nét (Nhiều đến Ít)</option>
                  <option value="han_viet">Âm Hán Việt (A - Z)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-pink-50 text-xs">
              <span className="font-bold text-slate-400 mr-1 flex items-center gap-1">
                <Filter size={13} />
                <span>Trạng thái:</span>
              </span>

              {[
                { id: 'all', label: 'Tất cả (' + kanjiList.length + ')' },
                { id: 'mastered', label: 'Đã thuộc (' + stats.mastered + ')' },
                { id: 'needs_review', label: 'Cần ôn (' + stats.review + ')' },
                { id: 'unlearned', label: 'Chưa học (' + stats.unlearned + ')' }
              ].map(function (btn) {
                const isSelected = statusFilter === btn.id;
                return (
                  <button
                    key={btn.id}
                    type="button"
                    onClick={function () { setStatusFilter(btn.id); }}
                    className={'px-3 py-1 rounded-full font-bold transition-all cursor-pointer ' + (isSelected ? 'bg-pink-600 text-white shadow-sm' : 'bg-pink-50 text-slate-600 hover:bg-pink-100')}
                  >
                    {btn.label}
                  </button>
                );
              })}

              <div className="w-full sm:w-auto sm:ml-auto flex items-center gap-1.5 pt-2 sm:pt-0">
                <span className="font-bold text-slate-400">Chủ đề:</span>
                <select
                  value={selectedTopicFilter}
                  onChange={function (e) { setSelectedTopicFilter(e.target.value); }}
                  className="px-2.5 py-1 rounded-xl border border-pink-200 text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-pink-400 cursor-pointer"
                >
                  <option value="all">Tất cả chủ đề</option>
                  {KANJI_TOPICS.map(function (t) {
                    return (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-pink-100 shadow-sm space-y-3">
              <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-400">Đang tải dữ liệu Hán tự {activeLevel}...</p>
            </div>
          ) : filteredKanjiList.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-pink-100 shadow-sm space-y-3">
              <PenTool size={36} className="mx-auto text-slate-300" />
              <h3 className="text-base font-bold text-slate-700">Không tìm thấy Chữ Hán phù hợp</h3>
              <p className="text-xs text-slate-400">
                Không có kết quả nào thỏa mãn bộ lọc hiện tại.
              </p>
              <button
                type="button"
                onClick={function () {
                  setSearch('');
                  setSelectedTopicFilter('all');
                  setStatusFilter('all');
                }}
                className="px-4 py-2 rounded-xl bg-pink-50 text-pink-600 font-bold text-xs inline-flex items-center gap-1.5 hover:bg-pink-100 transition-colors"
              >
                <RotateCcw size={14} />
                <span>Đặt lại bộ lọc</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredKanjiList.map(function (item, idx) {
                const kStatus = getKanjiStatus(item);
                const isMastered = kStatus === 'mastered';
                const isReview = kStatus === 'needs_review';

                return (
                  <div
                    key={item.id || idx}
                    onClick={function () { openDetail(item); }}
                    className={'p-5 rounded-2xl bg-white border shadow-sm hover:shadow-lotus hover:border-pink-300 hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between relative group ' + (isMastered ? 'border-emerald-200/90' : isReview ? 'border-amber-200/90' : 'border-pink-100/90')}
                  >
                    <div className="absolute top-3 right-3 text-[10px] font-bold text-slate-400 bg-pink-50/60 px-2 py-0.5 rounded-full border border-pink-100">
                      {item.stroke_count || item.stroke || 1} nét
                    </div>

                    {isMastered && (
                      <div className="absolute top-3 left-3 text-emerald-600 flex items-center gap-0.5 text-[10px] font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 size={11} />
                        <span>Đã thuộc</span>
                      </div>
                    )}
                    {isReview && (
                      <div className="absolute top-3 left-3 text-amber-600 flex items-center gap-0.5 text-[10px] font-extrabold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <Flame size={11} />
                        <span>Cần ôn</span>
                      </div>
                    )}

                    <div className="text-center my-3 pt-2">
                      <div className="text-5xl font-black font-jp text-slate-900 mb-2 group-hover:scale-110 group-hover:text-pink-600 transition-all">
                        {item.kanji}
                      </div>

                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-extrabold text-[11px] mb-1.5">
                        {item.han_viet || '—'}
                      </span>

                      <div className="text-xs font-bold text-slate-800 truncate px-1">
                        {item.meaning || '—'}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-pink-50 text-[11px] text-slate-500 space-y-0.5">
                      <div className="truncate">
                        <strong className="text-slate-600">On:</strong> {item.onyomi || '—'}
                      </div>
                      <div className="truncate">
                        <strong className="text-slate-600">Kun:</strong> {item.kunyomi || '—'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════ TAB 3: PHÒNG TẬP VIẾT NÉT TƯƠNG TÁC ════════════════════ */}
      {activeTab === 'writing' && (
        <KanjiWritingStudio
          kanjiList={filteredKanjiList}
          onMasterWord={handleMarkStatus}
        />
      )}

      {/* ════════════════════ TAB 4: PHÂN BIỆT CÁC CẶP CHỮ DỄ NHẦM ════════════════════ */}
      {activeTab === 'confusing' && (
        <ConfusingKanjiStudio />
      )}

      {/* ════════════════════ TAB 5: FLASHCARD LẬT THẺ TỐC ĐỘ ════════════════════ */}
      {activeTab === 'flashcard' && (
        <KanjiFlashcardMode
          kanjiList={filteredKanjiList}
          guestProgress={guestProgress}
          onMarkStatus={handleMarkStatus}
          onClose={function () { setActiveTab('vault'); }}
        />
      )}

      {/* ════════════════════ TAB 6: LUYỆN ĐỀ CHUẨN JLPT KANJI ════════════════════ */}
      {activeTab === 'practice' && (
        <div className="space-y-4">
          {quizState === 'setup' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-pink-100 shadow-sm max-w-2xl mx-auto space-y-6">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-3xl bg-pink-100 text-pink-600 flex items-center justify-center mx-auto shadow-lotus-sm">
                  <GraduationCap size={28} />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  Luyện Đề Thi Chữ Hán Chuẩn JLPT {activeLevel}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  Cấu trúc sát 100% đề thi quốc tế gồm 3 Mondai: 漢字読み (Cách đọc), 表記 (Cách viết), và 文脈規定 (Ngữ cảnh từ ghép).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lotus space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Timer size={18} />
                    <span className="font-black text-sm">Đề Thi Thử JLPT Kanji (15 câu)</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase bg-white/20 px-2 py-0.5 rounded-full">
                    Đủ 3 Mondai
                  </span>
                </div>
                <p className="text-xs text-pink-100">
                  Tập hợp ngẫu nhiên các câu hỏi Mondai 1, 2, 3 từ toàn bộ kho Kanji {activeLevel} giúp đánh giá chính xác năng lực thực chiến.
                </p>
                <button
                  type="button"
                  onClick={function () { handleStartQuiz(null, true); }}
                  className="w-full mt-2 py-2.5 rounded-xl bg-white text-pink-700 font-black text-xs hover:bg-pink-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Timer size={15} />
                  <span>Bắt Đầu Làm Đề Thi Thử Ngay</span>
                </button>
              </div>

              <div className="pt-2 border-t border-pink-100 space-y-4">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">
                  Hoặc tự tùy chỉnh bài tập theo nhu cầu:
                </span>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700 block">Số lượng câu hỏi:</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[5, 10, 20].map(function (c) {
                      const isSelected = quizSettings.count === c;
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={function () {
                            setQuizSettings(function (prev) {
                              return { ...prev, count: c };
                            });
                          }}
                          className={'py-2.5 rounded-2xl font-black text-xs transition-all border ' + (isSelected ? 'bg-pink-600 text-white border-pink-600 shadow-lotus-sm' : 'bg-pink-50/50 text-slate-700 border-pink-200 hover:bg-pink-100')}
                        >
                          {c} câu hỏi
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700 block">Dạng bài tập:</label>
                  <select
                    value={quizSettings.mode}
                    onChange={function (e) {
                      const val = e.target.value;
                      setQuizSettings(function (prev) {
                        return { ...prev, mode: val };
                      });
                    }}
                    className="w-full p-3 rounded-2xl border border-pink-200 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="all">Tất cả dạng bài (Mondai 1, 2, 3 và nghĩa)</option>
                    <option value="jlpt_yomikata">Mondai 1: Cách đọc chữ Hán (漢字読み)</option>
                    <option value="jlpt_hyouki">Mondai 2: Cách viết Hán tự từ Hiragana (表記)</option>
                    <option value="compound">Mondai 3: Ngữ cảnh từ ghép Hán tự (文脈規定)</option>
                    <option value="han_viet">Luyện âm Hán Việt</option>
                    <option value="meaning">Luyện ý nghĩa tiếng Việt</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700 block">Phạm vi chủ đề:</label>
                  <select
                    value={quizSettings.topicId}
                    onChange={function (e) {
                      const val = e.target.value;
                      setQuizSettings(function (prev) {
                        return { ...prev, topicId: val };
                      });
                    }}
                    className="w-full p-3 rounded-2xl border border-pink-200 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="all">Toàn bộ Kanji {activeLevel} ({kanjiList.length} chữ)</option>
                    {KANJI_TOPICS.map(function (t) {
                      return (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={function () { handleStartQuiz(null, false); }}
                  className="w-full py-3.5 rounded-2xl bg-pink-600 text-white font-black text-sm shadow-lotus hover:bg-pink-700 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <ListChecks size={18} />
                  <span>Bắt Đầu Làm Bài Tập Tùy Chỉnh</span>
                </button>
              </div>
            </div>
          )}

          {quizState === 'playing' && quizQuestions.length > 0 && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="p-4 rounded-2xl bg-white border border-pink-100 shadow-sm flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-black text-pink-600">
                    Câu {quizIndex + 1} / {quizQuestions.length}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 font-extrabold text-[10px]">
                    {quizQuestions[quizIndex].modeLabel}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 size={13} />
                    <span>Đúng: {quizScore}</span>
                  </span>

                  <button
                    type="button"
                    onClick={function () { setQuizState('setup'); }}
                    className="text-slate-400 hover:text-slate-700 cursor-pointer font-bold"
                  >
                    Thoát
                  </button>
                </div>
              </div>

              <div className="w-full h-2 rounded-full bg-pink-100/60 overflow-hidden">
                <div
                  className="h-full bg-pink-600 rounded-full transition-all duration-300"
                  style={{ width: ((quizIndex + 1) / quizQuestions.length) * 100 + '%' }}
                />
              </div>

              {quizQuestions[quizIndex] && (
                <div className="p-6 sm:p-8 rounded-3xl bg-white border border-pink-100 shadow-sm text-center space-y-5">
                  <p className="text-xs sm:text-sm font-bold text-slate-500">
                    {quizQuestions[quizIndex].prompt}
                  </p>

                  <div className="py-2">
                    {quizQuestions[quizIndex].isDisplayLargeKanji ? (
                      <div className="text-6xl sm:text-7xl font-black font-jp text-slate-900 tracking-wider">
                        {quizQuestions[quizIndex].displayQuestion}
                      </div>
                    ) : (
                      <div className="text-2xl sm:text-3xl font-black font-jp text-pink-700 bg-pink-50/70 p-4 rounded-2xl border border-pink-100 inline-block max-w-full leading-relaxed">
                        {quizQuestions[quizIndex].displayQuestion}
                      </div>
                    )}

                    {quizQuestions[quizIndex].subQuestion && (
                      <p className="text-xs font-bold text-slate-400 mt-2">
                        {quizQuestions[quizIndex].subQuestion}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={function () {
                        speakJapanese(quizQuestions[quizIndex].kanjiChar || quizQuestions[quizIndex].displayQuestion);
                      }}
                      className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-pink-50 text-pink-700 text-xs font-bold hover:bg-pink-100 transition-colors cursor-pointer"
                    >
                      <Volume2 size={13} />
                      <span>Nghe phát âm</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {quizQuestions[quizIndex].options.map(function (opt, optIdx) {
                      const isChosen = selectedAnswer === opt;
                      const isCorrectOpt = opt === quizQuestions[quizIndex].correctAnswer;

                      let btnStyle = 'bg-white border-pink-200 text-slate-800 hover:border-pink-400 hover:bg-pink-50/40';

                      if (isAnswerSubmitted) {
                        if (isCorrectOpt) {
                          btnStyle = 'bg-emerald-500 text-white border-emerald-600 shadow-md font-black';
                        } else if (isChosen && !isCorrectOpt) {
                          btnStyle = 'bg-rose-500 text-white border-rose-600 shadow-md font-black';
                        } else {
                          btnStyle = 'bg-slate-50 text-slate-400 border-slate-200 opacity-60';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          disabled={isAnswerSubmitted}
                          onClick={function () { handleSelectAnswer(opt); }}
                          className={'p-4 rounded-2xl border-2 text-sm sm:text-base font-extrabold transition-all cursor-pointer flex items-center justify-center ' + btnStyle}
                        >
                          <span className="font-jp">{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {isAnswerSubmitted && quizQuestions[quizIndex].explanation && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-pink-50/60 border border-pink-200 text-left space-y-2.5 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                          <BookOpen size={14} className="text-pink-600" />
                          <span>Giải thích chi tiết:</span>
                        </span>
                        <span className="text-xs font-black text-pink-700">
                          {quizQuestions[quizIndex].explanation.kanji} - {quizQuestions[quizIndex].explanation.han_viet}
                        </span>
                      </div>

                      <div className="text-xs text-slate-700 space-y-1">
                        <div>
                          <strong>Nghĩa:</strong> {quizQuestions[quizIndex].explanation.meaning}
                        </div>
                        <div>
                          <strong>Âm On:</strong> {quizQuestions[quizIndex].explanation.onyomi} | <strong>Âm Kun:</strong> {quizQuestions[quizIndex].explanation.kunyomi}
                        </div>
                        {quizQuestions[quizIndex].explanation.mnemonic && (
                          <div className="p-2.5 rounded-xl bg-white/90 border border-pink-100 text-[11px] text-pink-900 leading-relaxed">
                            <strong className="text-pink-700 flex items-center gap-1 mb-0.5">
                              <Sparkles size={12} />
                              <span>Mẹo nhớ tượng hình:</span>
                            </strong>
                            {quizQuestions[quizIndex].explanation.mnemonic}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={handleNextQuestion}
                        className="w-full mt-2 py-3 rounded-xl bg-pink-600 text-white font-black text-xs shadow-lotus hover:bg-pink-700 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>
                          {quizIndex < quizQuestions.length - 1 ? 'Câu tiếp theo' : 'Xem tổng kết kết quả'}
                        </span>
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {quizState === 'result' && (
            <div className="p-6 sm:p-10 rounded-3xl bg-white border border-pink-100 shadow-sm max-w-lg mx-auto text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mx-auto shadow-lotus">
                <Trophy size={40} className="text-amber-500" />
              </div>

              <div>
                <span className="text-[11px] font-extrabold uppercase px-3 py-1 rounded-full bg-pink-50 text-pink-700 border border-pink-100">
                  {isMockExam ? 'Kết quả đề thi thử JLPT' : 'Hoàn thành bài luyện tập'}
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-2">
                  Tổng Kết Năng Lực Kanji
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Bạn đã hoàn thành {quizQuestions.length} câu hỏi chuẩn cấu trúc JLPT.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-pink-50/60 border border-pink-100 grid grid-cols-2 gap-3 text-center">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Số câu đúng</span>
                  <span className="text-2xl font-black text-emerald-600">
                    {quizScore} / {quizQuestions.length}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tỷ lệ chính xác</span>
                  <span className="text-2xl font-black text-pink-600">
                    {quizQuestions.length > 0 ? Math.round((quizScore / quizQuestions.length) * 100) : 0}%
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center gap-2 text-amber-800 text-xs font-black">
                <Award size={18} className="text-amber-600" />
                <span>Thưởng +{quizScore * 10} XP vào tiến độ học tập và chuỗi ngày!</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={function () { handleStartQuiz(null, isMockExam); }}
                  className="flex-1 py-3 rounded-2xl bg-pink-600 text-white font-black text-xs shadow-lotus hover:bg-pink-700 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RotateCcw size={14} />
                  <span>{isMockExam ? 'Làm đề thi khác' : 'Làm bài tập mới'}</span>
                </button>

                <button
                  type="button"
                  onClick={function () {
                    setActiveTab('vault');
                    setQuizState('setup');
                  }}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 text-slate-700 font-black text-xs hover:bg-slate-200 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Layers size={14} />
                  <span>Về Kho Chữ Hán</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════ MODAL CHI TIẾT KANJI & CHIẾT TỰ ════════════════════ */}
      {selectedKanji && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in"
          onClick={function () { setSelectedKanji(null); }}
        >
          <div
            className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-pink-100 overflow-hidden relative animate-in zoom-in-95 flex flex-col max-h-[90vh]"
            onClick={function (e) { e.stopPropagation(); }}
          >
            <button
              type="button"
              onClick={function () { setSelectedKanji(null); }}
              className="absolute top-4 right-4 z-20 text-slate-400 hover:text-slate-800 p-1.5 rounded-full bg-white/80 border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="p-6 pb-3 text-center border-b border-pink-50 relative bg-gradient-to-b from-pink-50/40 to-white">
              <span className="px-3 py-1 rounded-full bg-pink-100 text-pink-700 font-extrabold text-[11px]">
                Kanji {activeLevel} - {selectedKanji.stroke_count || selectedKanji.stroke || 1} nét
              </span>

              <h2 className="text-6xl sm:text-7xl font-black font-jp text-slate-900 my-2">
                {selectedKanji.kanji}
              </h2>

              <div className="text-xl sm:text-2xl font-black text-amber-600 mb-0.5">
                {selectedKanji.han_viet}
              </div>

              <p className="text-xs sm:text-sm font-bold text-slate-700 mb-3">
                {selectedKanji.meaning}
              </p>

              <div className="flex flex-wrap justify-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={function () { speakJapanese(selectedKanji.kanji); }}
                  className="px-3.5 py-1.5 rounded-full bg-pink-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-lotus-sm hover:bg-pink-700 transition-colors cursor-pointer"
                >
                  <Volume2 size={14} />
                  <span>Nghe phát âm</span>
                </button>

                <button
                  type="button"
                  onClick={function () {
                    askAi('explain_kanji', selectedKanji, 'AI: Phân tích chữ Hán ' + selectedKanji.kanji);
                  }}
                  className="px-3.5 py-1.5 rounded-full border border-pink-200 text-pink-700 bg-pink-50 font-bold text-xs flex items-center gap-1.5 hover:bg-pink-100 transition-colors cursor-pointer"
                >
                  <Sparkles size={14} className="text-pink-600" />
                  <span>AI Sensei phân tích</span>
                </button>
              </div>

              <div className="flex justify-center gap-2 pt-2 border-t border-pink-100/60">
                {getKanjiStatus(selectedKanji) === 'mastered' ? (
                  <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-black flex items-center gap-1">
                    <CheckCircle2 size={13} />
                    <span>Đã thuộc lòng (+15 XP)</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={function () { handleMarkStatus(selectedKanji, 'mastered'); }}
                    className="px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs font-black transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <CheckCircle2 size={13} />
                    <span>Đánh dấu Đã thuộc (+15 XP)</span>
                  </button>
                )}

                {getKanjiStatus(selectedKanji) === 'needs_review' ? (
                  <span className="px-3 py-1 rounded-xl bg-amber-100 text-amber-800 text-xs font-black flex items-center gap-1">
                    <Flame size={13} />
                    <span>Đang cần ôn tập</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={function () { handleMarkStatus(selectedKanji, 'needs_review'); }}
                    className="px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 text-xs font-black transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Flame size={13} />
                    <span>Cần ôn tập</span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex border-b border-pink-100 bg-pink-50/50 px-4 text-xs font-black">
              <button
                type="button"
                onClick={function () { setDetailModalTab('mnemonic'); }}
                className={'py-2.5 px-4 border-b-2 transition-all ' + (detailModalTab === 'mnemonic' ? 'border-pink-600 text-pink-700' : 'border-transparent text-slate-500 hover:text-pink-600')}
              >
                Chiết Tự & Mẹo Nhớ
              </button>

              <button
                type="button"
                onClick={function () { setDetailModalTab('stroke'); }}
                className={'py-2.5 px-4 border-b-2 transition-all ' + (detailModalTab === 'stroke' ? 'border-pink-600 text-pink-700' : 'border-transparent text-slate-500 hover:text-pink-600')}
              >
                Tập Viết Nét Bút Thuận
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              {detailModalTab === 'mnemonic' ? (
                <>
                  <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-pink-50/50 border border-pink-100 text-center">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Âm On</span>
                      <span className="text-sm font-black font-jp text-pink-600">
                        {selectedKanji.onyomi || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Âm Kun</span>
                      <span className="text-sm font-black font-jp text-emerald-600">
                        {selectedKanji.kunyomi || '—'}
                      </span>
                    </div>
                  </div>

                  {selectedKanjiMnemonic && selectedKanjiMnemonic.radicals && (
                    <div className="space-y-1.5">
                      <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                        <BookOpen size={14} className="text-pink-600" />
                        <span>Bộ thủ cấu thành (Radicals):</span>
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedKanjiMnemonic.radicals.map(function (rad, radIdx) {
                          return (
                            <div
                              key={radIdx}
                              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs flex items-center gap-2.5"
                            >
                              <span className="text-xl font-black font-jp text-pink-600">
                                {rad.char}
                              </span>
                              <div>
                                <strong className="text-slate-800 block">{rad.name}</strong>
                                <span className="text-[11px] text-slate-500">{rad.meaning}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {selectedKanjiMnemonic && selectedKanjiMnemonic.mnemonic && (
                    <div className="p-4 rounded-2xl bg-pink-50/80 border border-pink-200 space-y-1">
                      <span className="text-xs font-black text-pink-800 flex items-center gap-1.5">
                        <Sparkles size={14} className="text-pink-600" />
                        <span>Mẹo nhớ tượng hình:</span>
                      </span>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        {selectedKanjiMnemonic.mnemonic}
                      </p>
                    </div>
                  )}

                  {selectedKanjiMnemonic && selectedKanjiMnemonic.origin && (
                    <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200/60 leading-relaxed">
                      <strong className="text-slate-700">Nguồn gốc: </strong>
                      {selectedKanjiMnemonic.origin}
                    </div>
                  )}

                  {selectedKanji.examples && selectedKanji.examples.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                        <BookOpen size={14} className="text-pink-600" />
                        <span>Từ ghép thông dụng trong đời sống:</span>
                      </span>

                      <div className="space-y-1.5">
                        {selectedKanji.examples.map(function (ex, exIdx) {
                          const w = typeof ex === 'string' ? ex : (ex.word || ex.w || '');
                          const k = typeof ex === 'object' ? (ex.reading || ex.k || '') : '';
                          const m = typeof ex === 'object' ? (ex.meaning || ex.m || '') : '';

                          return (
                            <div
                              key={exIdx}
                              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs"
                            >
                              <div>
                                <strong className="font-jp text-slate-900 mr-2 text-sm">{w}</strong>
                                {k && <span className="text-pink-600 font-jp mr-2">({k})</span>}
                                {m && <span className="text-slate-500">{m}</span>}
                              </div>
                              <button
                                type="button"
                                onClick={function () { speakJapanese(k || w); }}
                                className="text-pink-600 hover:text-pink-700 p-1.5 rounded-lg hover:bg-pink-100 transition-colors cursor-pointer"
                              >
                                <Volume2 size={14} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <KanjiStrokeCanvas
                  kanjiChar={selectedKanji.kanji}
                  strokeCount={selectedKanji.stroke_count || selectedKanji.stroke}
                  strokeTip={selectedKanjiMnemonic ? selectedKanjiMnemonic.strokeOrderTip : ''}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
