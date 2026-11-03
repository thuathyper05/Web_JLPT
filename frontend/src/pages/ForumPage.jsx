import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { forumService, speakJapanese, speakBilingualText, stopSpeaking } from '../services/api';
import { sounds } from '../services/sounds';
import {
  Newspaper,
  Search,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  Eye,
  Bookmark,
  TrendingUp,
  Sun,
  ExternalLink,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Share2,
  MessageSquare,
  Send,
  CheckCircle2,
  ThumbsUp,
  Flame,
  X,
  ArrowUpRight,
  Check,
  Sparkles,
  RotateCw
} from 'lucide-react';

const FALLBACK_NEWS_IMAGE = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80';

export default function ForumPage() {
  const { user, askAi, setActiveTab } = useApp();

  const [articles, setArticles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Pagination (BaoMoi news stream)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Audio Reading state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Bookmarks state
  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('nihongo_bookmarked_news') || '[]');
    } catch {
      return [];
    }
  });
  const [copiedLink, setCopiedLink] = useState(false);

  // Reader font size state
  const [readerFontSize, setReaderFontSize] = useState('base');

  // Comments state
  const [commentAuthor, setCommentAuthor] = useState(user?.username || user?.name || '');
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Image error fallback
  const handleImageError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = FALLBACK_NEWS_IMAGE;
  };

  // Categories list (BaoMoi standard news desks)
  const categories = [
    { id: 'all', label: 'Nóng & Mới' },
    { id: 'Thời sự Nhật Bản', label: 'Thời sự Nhật Bản' },
    { id: 'Xã hội & Đời sống', label: 'Xã hội & Đời sống' },
    { id: 'Kinh tế & Việc làm', label: 'Kinh tế & Việc làm' },
    { id: 'Kỳ thi JLPT', label: 'Kỳ thi JLPT' },
    { id: 'Văn hóa & Du lịch', label: 'Văn hóa & Du lịch' },
    { id: 'Du học & Học bổng', label: 'Du học & Học bổng' }
  ];

  // Fetch articles on mount and category switch
  const fetchArticles = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
      try {
        await forumService.crawlNews(4);
      } catch (e) {
        console.warn('Crawl news warning:', e);
      }
    } else {
      setLoading(true);
    }

    try {
      const res = await forumService.getArticles({
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        q: searchQuery.trim() || undefined,
        all: true
      });
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      setArticles(list);
    } catch (err) {
      console.error('Fetch articles error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [selectedCategory]);

  // Handle Search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchArticles();
  };

  // Bookmark toggle
  const handleToggleBookmark = (id, e) => {
    e.stopPropagation();
    sounds.playFlip();
    setBookmarkedIds((prev) => {
      const isExist = prev.includes(id);
      const updated = isExist ? prev.filter((item) => item !== id) : [id, ...prev];
      try {
        localStorage.setItem('nihongo_bookmarked_news', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Audio reader for article
  const handleToggleAudio = () => {
    if (!selectedArticle) return;
    sounds.playFlip();

    if (isPlayingAudio) {
      stopSpeaking();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      const textToRead = selectedArticle.title + '. ' + selectedArticle.summary;
      speakBilingualText(textToRead, () => {
        setIsPlayingAudio(false);
      });
    }
  };

  // Share article link
  const handleShareArticle = () => {
    sounds.playFlip();
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Submit reader comment
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedArticle) return;

    setSubmittingComment(true);
    try {
      const res = await forumService.addComment(selectedArticle.id, {
        author: commentAuthor.trim() || 'Bạn đọc ẩn danh',
        content: commentText.trim(),
        rating: 5
      });

      if (res.data?.success) {
        sounds.playCorrect();
        const newComment = res.data.comment || {
          id: Date.now(),
          author: commentAuthor.trim() || 'Bạn đọc ẩn danh',
          content: commentText.trim(),
          createdAt: 'Vừa xong'
        };

        setSelectedArticle((prev) => ({
          ...prev,
          comments: [newComment, ...(prev?.comments || [])]
        }));
        setCommentText('');
      }
    } catch (err) {
      console.error('Add comment error:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Filtered articles list
  const filteredArticles = useMemo(() => {
    let list = articles;
    if (selectedCategory !== 'all') {
      list = list.filter((a) => a.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((a) =>
        (a.title && a.title.toLowerCase().includes(q)) ||
        (a.summary && a.summary.toLowerCase().includes(q)) ||
        (a.titleJp && a.titleJp.toLowerCase().includes(q))
      );
    }
    return list;
  }, [articles, selectedCategory, searchQuery]);

  // Lead spotlight vs stream
  const leadArticle = filteredArticles[0] || null;
  const secondaryArticles = filteredArticles.slice(1, 3);
  const streamArticles = filteredArticles.slice(3);

  // Pagination for stream
  const totalPages = Math.ceil(streamArticles.length / itemsPerPage);
  const pagedStreamArticles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return streamArticles.slice(start, start + itemsPerPage);
  }, [streamArticles, currentPage, itemsPerPage]);

  // Top trending articles for sidebar
  const topTrending = useMemo(() => {
    return [...articles].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
  }, [articles]);

  // Real vocab highlights from current articles
  const studyVocabList = useMemo(() => {
    const collected = [];
    for (const a of articles) {
      if (Array.isArray(a.keyVocab) && a.keyVocab.length > 0) {
        for (const v of a.keyVocab) {
          if (v.kanji && !collected.some((x) => x.kanji === v.kanji)) {
            collected.push(v);
          }
          if (collected.length >= 6) break;
        }
      }
      if (collected.length >= 6) break;
    }
    return collected;
  }, [articles]);

  const todayStr = useMemo(() => {
    return new Date().toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans pb-24 selection:bg-rose-100 selection:text-rose-900">
      {/* ── 1. BAOMOI NEWS HEADER & MASTHEAD ── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        {/* Top Mini Ticker Bar */}
        <div className="border-b border-slate-100 py-1.5 px-4 sm:px-6 text-[11px] text-slate-500 bg-slate-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-700 capitalize">{todayStr}</span>
              <span className="hidden sm:inline text-slate-300">|</span>
              <span className="hidden sm:flex items-center gap-1 font-semibold text-slate-600">
                <Sun size={12} className="text-amber-500" />
                <span>Tokyo 18°C · Nắng nhẹ</span>
              </span>
              <span className="hidden md:inline text-slate-300">|</span>
              <span className="hidden md:inline text-slate-500">
                Nguồn chính thống: NHK World, The Japan Times, Yomiuri Shimbun
              </span>
            </div>

            <div className="flex items-center gap-3 font-semibold text-rose-600">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping inline-block" />
                <span>Thời sự trực tuyến</span>
              </span>
            </div>
          </div>
        </div>

        {/* Main Newspaper Masthead */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setSelectedArticle(null);
                setSelectedCategory('all');
                setCurrentPage(1);
              }}
              className="text-left cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-rose-600 text-white font-black text-sm tracking-wider uppercase">
                  BÁO MỚI
                </span>
                <span className="font-black text-lg sm:text-2xl text-slate-900 tracking-tight font-serif">
                  HYPER JP
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden sm:block mt-0.5">
                Kênh tin tức & văn hóa Nhật Bản chính thống
              </p>
            </button>
          </div>

          {/* Search Box in Masthead */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative hidden sm:block">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm tin tức Nhật Bản, JLPT, thời sự..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
            />
          </form>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => fetchArticles(true)}
            disabled={refreshing}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-rose-600 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold shrink-0"
            title="Làm mới tin tức"
          >
            <RotateCw size={14} className={refreshing ? 'animate-spin text-rose-600' : ''} />
            <span className="hidden sm:inline">Cập nhật</span>
          </button>
        </div>

        {/* BaoMoi Category Navigation Bar */}
        <nav aria-label="Chuyên mục tin tức" className="border-t border-slate-200 overflow-x-auto scrollbar-none bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 min-w-max py-1">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id && !selectedArticle;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    sounds.playFlip();
                    setSelectedCategory(cat.id);
                    setSelectedArticle(null);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'text-rose-600 border-b-2 border-rose-600 rounded-b-none font-black'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      {/* ── 2. MAIN CONTAINER ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* ── 2.1 ARTICLE DETAIL READER VIEW ── */}
        {selectedArticle ? (
          <article className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
            {/* Top Return and Action Bar */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <button
                type="button"
                onClick={() => {
                  sounds.playFlip();
                  setSelectedArticle(null);
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <ChevronLeft size={16} />
                <span>Quay lại trang tin</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleAudio}
                  className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs ${
                    isPlayingAudio
                      ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                  title="Nghe đọc bản tin"
                >
                  {isPlayingAudio ? <VolumeX size={15} /> : <Volume2 size={15} />}
                  <span className="hidden sm:inline">{isPlayingAudio ? 'Dừng đọc' : 'Nghe đọc'}</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => handleToggleBookmark(selectedArticle.id, e)}
                  className={`p-2 rounded-xl border transition-colors cursor-pointer shadow-xs ${
                    bookmarkedIds.includes(selectedArticle.id)
                      ? 'bg-rose-50 border-rose-300 text-rose-600'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                  title="Lưu bài viết"
                >
                  <Bookmark size={15} fill={bookmarkedIds.includes(selectedArticle.id) ? 'currentColor' : 'none'} />
                </button>

                <button
                  type="button"
                  onClick={handleShareArticle}
                  className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 transition-colors cursor-pointer shadow-xs"
                  title="Chia sẻ liên kết"
                >
                  {copiedLink ? <Check size={15} className="text-emerald-600" /> : <Share2 size={15} />}
                </button>
              </div>
            </div>

            {/* Article Header */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-600">
                <span className="uppercase tracking-wider">{selectedArticle.category}</span>
                <span className="text-slate-300">/</span>
                <span className="text-slate-500 font-normal">
                  {selectedArticle.publishedAt} ({selectedArticle.publishedTime || 'Vừa xong'})
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black text-slate-900 tracking-tight leading-snug">
                {selectedArticle.title}
              </h1>

              {/* Japanese Headline Reference */}
              {selectedArticle.titleJp && (
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm font-jp text-slate-800 flex items-center justify-between gap-3 shadow-2xs">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                      Tiêu đề gốc tiếng Nhật:
                    </span>
                    <span className="font-bold block truncate">{selectedArticle.titleJp}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => speakJapanese(selectedArticle.titleJp)}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors shrink-0 cursor-pointer"
                    title="Nghe phát âm Tokyo"
                  >
                    <Volume2 size={16} />
                  </button>
                </div>
              )}

              {/* Source & Reporter Metadata */}
              <div className="py-2.5 px-3.5 rounded-2xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                    <User size={14} />
                  </div>
                  <span className="font-bold text-slate-900">{selectedArticle.author || 'Ban Biên Tập HYPER JP'}</span>
                </div>

                <div className="flex items-center gap-3 text-slate-500 font-semibold">
                  <span className="flex items-center gap-1 text-slate-800">
                    <ShieldCheck size={14} className="text-rose-600" />
                    <span>Nguồn: {selectedArticle.sourceName}</span>
                  </span>
                  {selectedArticle.sourceUrl && (
                    <a
                      href={selectedArticle.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-rose-600 hover:text-rose-700 flex items-center gap-0.5 font-bold"
                    >
                      <span>Xem bản gốc</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Eye size={14} />
                    <span>{(selectedArticle.views || 100).toLocaleString()}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Sapo / Lead Summary */}
            <div className="text-base sm:text-lg font-serif font-semibold text-slate-800 leading-relaxed border-l-4 border-rose-600 pl-4 py-1 italic bg-white p-3 rounded-r-2xl border-t border-b border-r border-slate-200 shadow-2xs">
              {selectedArticle.summary}
            </div>

            {/* Hero Image with Caption */}
            <div className="space-y-1.5">
              <div className="rounded-2xl overflow-hidden bg-slate-200 border border-slate-200 shadow-xs">
                <img
                  src={selectedArticle.imageUrl || FALLBACK_NEWS_IMAGE}
                  alt={selectedArticle.title}
                  onError={handleImageError}
                  className="w-full h-auto max-h-[460px] object-cover"
                />
              </div>
              <p className="text-xs text-slate-500 text-center italic mb-0">
                {selectedArticle.imageCaption || `Ảnh tư liệu báo chí: ${selectedArticle.sourceName}`}
              </p>
            </div>

            {/* Font Size Toggle for Reading */}
            <div className="flex justify-end items-center gap-1 text-xs text-slate-500 font-bold">
              <span>Cỡ chữ:</span>
              <button
                type="button"
                onClick={() => setReaderFontSize('sm')}
                className={`px-2 py-0.5 rounded ${readerFontSize === 'sm' ? 'bg-rose-600 text-white' : 'hover:bg-slate-200'}`}
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => setReaderFontSize('base')}
                className={`px-2 py-0.5 rounded ${readerFontSize === 'base' ? 'bg-rose-600 text-white' : 'hover:bg-slate-200'}`}
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setReaderFontSize('lg')}
                className={`px-2 py-0.5 rounded ${readerFontSize === 'lg' ? 'bg-rose-600 text-white' : 'hover:bg-slate-200'}`}
              >
                A+
              </button>
            </div>

            {/* Main Article Body */}
            <div
              className={`bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs leading-relaxed text-slate-800 space-y-4 ${
                readerFontSize === 'sm'
                  ? 'text-sm'
                  : readerFontSize === 'lg'
                  ? 'text-lg leading-loose'
                  : 'text-base leading-relaxed'
              }`}
            >
              {(selectedArticle.content || selectedArticle.summary).split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="whitespace-pre-line leading-relaxed mb-4">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Study Corner: Japanese Vocabulary & Grammar Points */}
            {(selectedArticle.keyVocab?.length > 0 || selectedArticle.grammarPoint) && (
              <div className="p-6 rounded-3xl bg-white border border-rose-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                  <h3 className="font-black text-sm text-slate-900 tracking-tight uppercase">
                    Góc Từ Vựng & Ngữ Pháp Thực Tế Trong Bài Báo
                  </h3>
                </div>

                {selectedArticle.keyVocab?.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {selectedArticle.keyVocab.map((v, i) => (
                      <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-jp font-bold text-base text-slate-900">{v.kanji}</span>
                          <span className="text-xs font-semibold text-rose-600 font-jp">{v.kana}</span>
                        </div>
                        <div className="text-xs text-slate-600 font-medium">{v.vi}</div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedArticle.grammarPoint && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <span className="font-bold text-rose-700 block">Ngữ pháp JLPT ứng dụng:</span>
                    <p className="text-slate-700 mb-0 font-medium leading-relaxed">{selectedArticle.grammarPoint}</p>
                  </div>
                )}
              </div>
            )}

            {/* Editorial Platform Ad at bottom of article */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white border border-rose-500/30 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-300">
                  Ôn tập từ vựng & kiến thức
                </span>
                <h4 className="font-serif font-black text-base text-white">
                  Muốn ghi nhớ sâu các từ vựng và ngữ pháp vừa đọc?
                </h4>
                <p className="text-xs text-slate-300">
                  Luyện tập qua Flashcard 3D thông minh và làm bài tập trắc nghiệm tự động trên HYPER JP.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  sounds.playLevelUp();
                  setActiveTab('flashcard');
                }}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 hover:from-rose-500 hover:to-pink-500 text-white font-black text-xs uppercase tracking-wider shadow-lotus flex items-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-95 transition-all"
              >
                <span>Luyện Flashcard ngay</span>
                <ArrowUpRight size={14} />
              </button>
            </div>

            {/* Comments & Discussion */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <MessageSquare size={18} className="text-rose-600" />
                  <span>Ý kiến bạn đọc ({selectedArticle.comments?.length || 0})</span>
                </h3>
              </div>

              {/* Comment Input */}
              <form onSubmit={handleSubmitComment} className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Họ và tên..."
                    value={commentAuthor}
                    onChange={(e) => setCommentAuthor(e.target.value)}
                    className="w-1/3 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                  <input
                    type="text"
                    placeholder="Chia sẻ quan điểm của bạn về bài viết này..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                  <button
                    type="submit"
                    disabled={submittingComment || !commentText.trim()}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Send size={13} />
                    <span>Gửi</span>
                  </button>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-3 pt-2">
                {selectedArticle.comments?.length > 0 ? (
                  selectedArticle.comments.map((c, i) => (
                    <div key={c.id || i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">{c.author}</span>
                        <span className="text-slate-400 text-[11px]">{c.createdAt || 'Gần đây'}</span>
                      </div>
                      <p className="text-xs text-slate-600 mb-0 leading-relaxed">{c.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic text-center py-3">
                    Chưa có bình luận nào. Hãy là người đầu tiên nêu ý kiến!
                  </p>
                )}
              </div>
            </div>
          </article>
        ) : (
          /* ── 2.2 BAOMOI CLASSIC 2-COLUMN NEWS HOME ── */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ── LEFT / MAIN STREAM (8 COLS) ── */}
            <div className="lg:col-span-8 space-y-6">
              {loading ? (
                <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
                  <div className="w-9 h-9 border-3 border-rose-200 border-t-rose-600 rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-bold text-slate-500">Đang tải bản tin chính thống từ NHK và báo chí Nhật...</p>
                </div>
              ) : filteredArticles.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
                  <Newspaper size={40} className="mx-auto text-slate-300" />
                  <h3 className="font-bold text-base text-slate-800">Không tìm thấy bài viết nào</h3>
                  <p className="text-xs text-slate-500">Hãy thử tìm kiếm từ khóa khác hoặc chọn chuyên mục khác.</p>
                </div>
              ) : (
                <>
                  {/* Tiêu điểm nổi bật (Lead Article Hero) */}
                  {leadArticle && (
                    <section aria-label="Tiêu điểm nổi bật" className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden group hover:border-slate-300 transition-all">
                      <div
                        onClick={() => {
                          sounds.playFlip();
                          setSelectedArticle(leadArticle);
                        }}
                        className="cursor-pointer"
                      >
                        <div className="relative aspect-[16/9] sm:aspect-[21/9] bg-slate-200 overflow-hidden">
                          <img
                            src={leadArticle.imageUrl || FALLBACK_NEWS_IMAGE}
                            alt={leadArticle.title}
                            onError={handleImageError}
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                          />
                          <div className="absolute top-3 left-3">
                            <span className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-black text-[11px] uppercase tracking-wider shadow-md">
                              {leadArticle.category}
                            </span>
                          </div>
                        </div>

                        <div className="p-5 sm:p-6 space-y-2">
                          <h2 className="text-xl sm:text-2xl font-serif font-black text-slate-900 group-hover:text-rose-600 transition-colors leading-snug">
                            {leadArticle.title}
                          </h2>

                          {leadArticle.titleJp && (
                            <p className="text-xs font-jp text-slate-500 line-clamp-1 italic">
                              「{leadArticle.titleJp}」
                            </p>
                          )}

                          <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                            {leadArticle.summary}
                          </p>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400 font-semibold">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-800">{leadArticle.sourceName}</span>
                              <span>·</span>
                              <span>{leadArticle.publishedTime || 'Vừa xong'}</span>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <Eye size={13} />
                                <span>{(leadArticle.views || 100).toLocaleString()}</span>
                              </span>
                              <button
                                type="button"
                                onClick={(e) => handleToggleBookmark(leadArticle.id, e)}
                                className="hover:text-rose-600 cursor-pointer"
                                title="Lưu tin"
                              >
                                <Bookmark size={14} fill={bookmarkedIds.includes(leadArticle.id) ? 'currentColor' : 'none'} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>
                  )}

                  {/* 2 Secondary Spotlight Stories */}
                  {secondaryArticles.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {secondaryArticles.map((art) => (
                        <div
                          key={art.id}
                          onClick={() => {
                            sounds.playFlip();
                            setSelectedArticle(art);
                          }}
                          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between group space-y-3"
                        >
                          <div className="aspect-[16/9] rounded-xl overflow-hidden bg-slate-100 shrink-0">
                            <img
                              src={art.imageUrl || FALLBACK_NEWS_IMAGE}
                              alt={art.title}
                              onError={handleImageError}
                              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                            />
                          </div>
                          <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                            <div>
                              <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block mb-1">
                                {art.category}
                              </span>
                              <h3 className="font-bold text-sm text-slate-900 group-hover:text-rose-600 line-clamp-2 leading-snug">
                                {art.title}
                              </h3>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold pt-2 border-t border-slate-100">
                              <span className="font-bold text-slate-700">{art.sourceName}</span>
                              <span>{art.publishedTime || 'Hôm nay'}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Dòng tin mới nhất (Chronological News Stream) */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2 pb-2 border-b-2 border-slate-900">
                      <span className="w-1.5 h-5 bg-rose-600 rounded-full" />
                      <h3 className="font-serif font-black text-base text-slate-900 uppercase tracking-wider">
                        Dòng Thời Sự Mới Nhất
                      </h3>
                    </div>

                    <div className="divide-y divide-slate-200 bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                      {pagedStreamArticles.map((art, artIdx) => (
                        <React.Fragment key={art.id}>
                          {artIdx === 2 && (
                            <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white relative overflow-hidden group border-y border-rose-500/30">
                              <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-gradient-to-b from-rose-500 via-pink-400 to-amber-400" />
                              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                <div className="space-y-1.5 flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                      <Sparkles size={11} className="text-amber-300" />
                                      Tài trợ đặc biệt · HYPER JP
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-semibold hidden xs:inline">Nền tảng học tiếng Nhật 2026</span>
                                  </div>
                                  <h4 className="font-serif font-black text-sm sm:text-base text-white leading-snug group-hover:text-rose-200 transition-colors">
                                    Vừa đọc báo vừa tra cứu từ vựng tức thì: Trải nghiệm học tiếng Nhật không gián đoạn
                                  </h4>
                                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                                    Không cần lật từ điển giấy hay chuyển app. HYPER JP hiển thị Furigana trên đầu mọi chữ Hán, trợ lý AI Sensei giải nghĩa chuyên sâu và hệ thống 130 bài Minna chuẩn quốc tế.
                                  </p>
                                  <div className="flex items-center gap-2 flex-wrap pt-1 text-[11px] font-bold text-rose-200">
                                    <span className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-lg">✓ 9.584 từ vựng N5-N1</span>
                                    <span className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-lg">✓ Phát âm bản xứ chuẩn</span>
                                    <span className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-lg">✓ Đồng bộ đa thiết bị</span>
                                  </div>
                                </div>
                                <div className="shrink-0 w-full sm:w-auto">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      sounds.playLevelUp();
                                      setActiveTab('lessons');
                                    }}
                                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 hover:from-rose-500 hover:to-pink-500 text-white font-black text-xs uppercase tracking-wider shadow-lotus flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 whitespace-nowrap"
                                  >
                                    <span>Học ngay</span>
                                    <ArrowUpRight size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                          <div
                            onClick={() => {
                              sounds.playFlip();
                              setSelectedArticle(art);
                            }}
                            className="p-4 sm:p-5 hover:bg-slate-50 transition-colors cursor-pointer flex gap-4 items-start group"
                          >
                          {/* Left: Content */}
                          <div className="flex-1 min-w-0 space-y-1.5">
                            <div className="flex items-center gap-2 text-[10px] font-bold">
                              <span className="text-rose-600 uppercase tracking-wider">{art.category}</span>
                              <span className="text-slate-300">·</span>
                              <span className="text-slate-400">{art.publishedTime || 'Vừa xong'}</span>
                            </div>

                            <h4 className="font-serif font-bold text-sm sm:text-base text-slate-900 group-hover:text-rose-600 transition-colors leading-snug line-clamp-2">
                              {art.title}
                            </h4>

                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                              {art.summary}
                            </p>

                            {/* Vocabulary Preview Pills */}
                            {art.keyVocab?.length > 0 && (
                              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                                {art.keyVocab.slice(0, 3).map((v, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-jp text-[10px] font-bold border border-slate-200"
                                  >
                                    {v.kanji}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Source & Stats Footer */}
                            <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400 font-semibold">
                              <span className="font-extrabold text-slate-700">{art.sourceName}</span>
                              <span>·</span>
                              <span className="flex items-center gap-1">
                                <Eye size={12} />
                                <span>{(art.views || 80).toLocaleString()}</span>
                              </span>
                            </div>
                          </div>

                          {/* Right: 16:9 Thumbnail */}
                          <div className="w-24 sm:w-36 aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                            <img
                              src={art.imageUrl || FALLBACK_NEWS_IMAGE}
                              alt={art.title}
                              onError={handleImageError}
                              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                            />
                          </div>
                        </div>
                      </React.Fragment>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-1.5 pt-4">
                        <button
                          type="button"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                        >
                          Trang trước
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setCurrentPage(num)}
                            className={`w-8 h-8 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                              currentPage === num
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                        <button
                          type="button"
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                        >
                          Trang sau
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* ── RIGHT / SIDEBAR (4 COLS) ── */}
            <aside aria-label="Tin đọc nhiều và góc tự học" className="lg:col-span-4 space-y-6">
              {/* ── QUẢNG CÁO CAO CẤP: NỀN TẢNG HYPER JP ── */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900 text-white p-5 border border-rose-500/30 shadow-xl space-y-4">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400" />
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <Sparkles size={11} className="text-amber-300" />
                    Tài trợ độc quyền
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">HYPER JP PRO</span>
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-serif font-black text-base text-white leading-snug">
                    Chinh Phục JLPT N5 - N1 Cùng Siêu Trợ Lý AI Sensei
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Học tiếng Nhật thế hệ mới với phương pháp lặp ngắt quãng SRS, luyện nghe Shadowing và vườn cây Bonsai tích lũy Streak mỗi ngày.
                  </p>
                </div>
                <div className="space-y-2 py-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                    <div className="w-5 h-5 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                      <Check size={12} />
                    </div>
                    <span>130 bài học Minna & Marugoto chuẩn</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                    <div className="w-5 h-5 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                      <Check size={12} />
                    </div>
                    <span>Furigana trên đầu Kanji cho mọi cấp độ</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                    <div className="w-5 h-5 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                      <Check size={12} />
                    </div>
                    <span>Đồng bộ tiến độ điện thoại và máy tính</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playLevelUp();
                    setActiveTab('lessons');
                  }}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 hover:from-rose-500 hover:to-pink-500 text-white font-black text-xs uppercase tracking-wider shadow-lotus flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
                >
                  <span>Khám phá bài học miễn phí</span>
                  <ArrowUpRight size={15} />
                </button>
                <p className="text-[10px] text-center text-slate-400 italic">
                  Không cần thẻ tín dụng · Bắt đầu chỉ với 1 chạm
                </p>
              </div>

              {/* BẢNG XẾP HẠNG ĐỌC NHIỀU 24H */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-serif font-black text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp size={16} className="text-rose-600" />
                    <span>Đọc Nhiều Nhất 24H</span>
                  </h3>
                </div>

                <div className="space-y-3">
                  {topTrending.map((art, idx) => (
                    <div
                      key={art.id}
                      onClick={() => {
                        sounds.playFlip();
                        setSelectedArticle(art);
                      }}
                      className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                    >
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                          idx === 0
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div className="space-y-0.5 min-w-0">
                        <h4 className="font-bold text-xs text-slate-900 group-hover:text-rose-600 line-clamp-2 leading-snug">
                          {art.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-semibold block">
                          {art.sourceName} · {(art.views || 90).toLocaleString()} lượt đọc
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* GÓC TỰ HỌC TIẾNG NHẬT TỪ BÁO CHÍ */}
              {studyVocabList.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="font-serif font-black text-sm text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles size={16} className="text-rose-600" />
                      <span>Học Từ Vựng Qua Báo Chí</span>
                    </h3>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Các từ vựng cốt lõi được AI Sensei tự động trích xuất trực tiếp từ các bản tin thời sự hôm nay:
                  </p>

                  <div className="space-y-2">
                    {studyVocabList.map((v, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-1.5 font-jp">
                            <span className="font-bold text-slate-900 text-sm">{v.kanji}</span>
                            <span className="text-rose-600 font-semibold text-[11px]">({v.kana})</span>
                          </div>
                          <span className="text-slate-600 text-[11px] block">{v.vi}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => speakJapanese(v.kanji || v.kana)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-100/60 transition-colors cursor-pointer shrink-0"
                          title="Nghe phát âm"
                        >
                          <Volume2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CHỦ ĐỀ ĐƯỢC QUAN TÂM (Trending Tags) */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 space-y-3">
                <h3 className="font-serif font-black text-sm text-slate-900 uppercase tracking-wider">
                  Chủ Đề Đang Được Quan Tâm
                </h3>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    'Kỳ thi JLPT 2026',
                    'Visa Kỹ năng đặc định',
                    'Tỷ giá Yên Nhật',
                    'Việc làm IT Nhật',
                    'Học bổng MEXT',
                    'Động đất & Thời tiết',
                    'Shinkansen',
                    'Văn hóa trà đạo'
                  ].map((tag, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        sounds.playFlip();
                        setSearchQuery(tag);
                        fetchArticles();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-[11px] font-bold border border-slate-200 transition-colors cursor-pointer"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
