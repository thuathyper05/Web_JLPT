import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { forumService } from '../services/api';
import { sounds } from '../services/sounds';
import confetti from 'canvas-confetti';
import {
  Newspaper,
  MessageSquare,
  Star,
  Share2,
  Search,
  Calendar,
  Clock,
  User,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Send,
  CheckCircle2,
  ThumbsUp,
  Flame,
  ShieldCheck,
  Award,
  BookOpen,
  Filter
} from 'lucide-react';

export default function ForumPage() {
  const { user, askAi, setActiveTab } = useApp();

  const [activeView, setActiveView] = useState('news'); // 'news' | 'reviews'
  const [articles, setArticles] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  // Comment input form state
  const [commentAuthor, setCommentAuthor] = useState(user?.username || '');
  const [commentText, setCommentText] = useState('');
  const [commentRating, setCommentRating] = useState(5);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Review input form state
  const [reviewAuthor, setReviewAuthor] = useState(user?.username || '');
  const [reviewCenter, setReviewCenter] = useState('Khóa học tiếng Nhật N5 - HYPER');
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  // AI Summary for Article State
  const [aiSummary, setAiSummary] = useState(null);
  const [loadingAiSummary, setLoadingAiSummary] = useState(false);

  const categories = [
    { id: 'all', label: 'Tất cả bài viết' },
    { id: 'Kinh nghiệm JLPT', label: 'Kinh nghiệm JLPT' },
    { id: 'Đánh giá khóa học', label: 'Đánh giá khóa học' },
    { id: 'Du học & Việc làm', label: 'Du học & Việc làm' },
    { id: 'Phương pháp học', label: 'Phương pháp học' },
    { id: 'Văn hóa Nhật', label: 'Văn hóa Nhật' },
  ];

  // Fetch articles
  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await forumService.getArticles({
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        search: searchQuery || undefined
      });
      setArticles(res.data?.data || []);
    } catch (err) {
      console.error('Fetch articles error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch reviews
  const fetchReviews = async () => {
    try {
      const res = await forumService.getReviews();
      setReviews(res.data?.data || []);
    } catch (err) {
      console.error('Fetch reviews error:', err);
    }
  };

  useEffect(() => {
    fetchArticles();
    fetchReviews();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    sounds.playFlip();
    fetchArticles();
  };

  const handleOpenArticle = async (article) => {
    sounds.playFlip();
    setSelectedArticle(article);
    setAiSummary(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Fetch full article detail with views count updated
    try {
      const res = await forumService.getArticle(article.id);
      if (res.data?.data) {
        setSelectedArticle(res.data.data);
      }
    } catch (err) {
      console.error('Get article detail error:', err);
    }
  };

  const handleCloseArticle = () => {
    sounds.playFlip();
    setSelectedArticle(null);
    setAiSummary(null);
  };

  // Submit Comment on Article
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedArticle) return;

    setSubmittingComment(true);
    try {
      const res = await forumService.addComment(selectedArticle.id, {
        author: commentAuthor.trim() || user?.username || 'Học viên',
        content: commentText.trim(),
        rating: commentRating
      });

      if (res.data?.success) {
        sounds.playCorrect();
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
        // Update local article comments list in real-time
        setSelectedArticle((prev) => ({
          ...prev,
          comments: [res.data.comment, ...(prev.comments || [])]
        }));
        setCommentText('');
      }
    } catch (err) {
      console.error('Add comment error:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Submit General Review
  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await forumService.addReview({
        author: reviewAuthor.trim() || user?.username || 'Học viên',
        centerName: reviewCenter.trim(),
        content: reviewText.trim(),
        rating: reviewRating
      });

      if (res.data?.success) {
        sounds.playCorrect();
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
        setReviews((prev) => [res.data.data, ...prev]);
        setReviewText('');
      }
    } catch (err) {
      console.error('Add review error:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  // Trigger Real Gemini AI Summary for Article
  const handleGenerateAiSummary = async () => {
    if (!selectedArticle || loadingAiSummary) return;

    sounds.playFlip();
    setLoadingAiSummary(true);
    try {
      const res = await askAi(
        'summarize_article',
        {
          title: selectedArticle.title,
          content: selectedArticle.content
        },
        `AI Tóm Tắt Tin Tức: ${selectedArticle.title}`
      );
      if (res?.data?.explanation) {
        setAiSummary(res.data.explanation);
      }
    } catch (err) {
      console.error('AI Summary error:', err);
    } finally {
      setLoadingAiSummary(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* ── 1. EDITORIAL HEADER BANNER ── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-pink-100 shadow-sm relative overflow-hidden">
        {/* Subtle Watermark */}
        <div className="absolute right-4 top-2 text-pink-100/50 font-jp font-black text-8xl pointer-events-none select-none">
          報
        </div>

        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 text-pink-700 font-extrabold text-[11px] uppercase tracking-wider border border-pink-100">
              <Newspaper size={13} className="text-pink-600" />
              <span>DIỄN ĐÀN, TIN TỨC VÀ ĐÁNH GIÁ CỘNG ĐỒNG NHẬT NGỮ</span>
            </div>

            <div className="flex items-center p-1 bg-pink-50/70 rounded-xl border border-pink-100">
              <button
                type="button"
                onClick={() => { sounds.playFlip(); setActiveView('news'); }}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeView === 'news'
                    ? 'bg-white text-pink-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Bài viết tin tức
              </button>
              <button
                type="button"
                onClick={() => { sounds.playFlip(); setActiveView('reviews'); }}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeView === 'reviews'
                    ? 'bg-white text-pink-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Đánh giá khóa học
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                {activeView === 'news'
                  ? 'Bản Tin Nhật Ngữ & Cẩm Nang Luyện Thi JLPT'
                  : 'Cộng Đồng Đánh Giá Khóa Học & Trung Tâm Tiếng Nhật'}
              </h1>
              <p className="text-xs text-slate-500 max-w-2xl mt-0.5 mb-0">
                {activeView === 'news'
                  ? 'Cập nhật chiến thuật thi cử, bí quyết du học việc làm và phương pháp học thông minh từ các chuyên gia hàng đầu.'
                  : 'Đánh giá chân thực từ học viên thực tế, chia sẻ trải nghiệm học và bình luận thời gian thực.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. VIEW 1: ARTICLE READER VIEW (WHEN AN ARTICLE IS OPEN) ── */}
      {selectedArticle ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Back button */}
          <button
            type="button"
            onClick={handleCloseArticle}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-pink-200 text-xs font-bold text-slate-700 hover:bg-pink-50 hover:text-pink-600 transition-colors cursor-pointer shadow-xs"
          >
            <ChevronLeft size={16} />
            <span>Quay lại danh sách bài viết</span>
          </button>

          {/* Article Main Body Card */}
          <article className="p-6 sm:p-10 rounded-3xl bg-white border border-pink-100 shadow-sm space-y-6">
            {/* Meta Header */}
            <div className="space-y-3 pb-6 border-b border-pink-50">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-pink-100 text-pink-700 font-extrabold text-[11px] uppercase tracking-wider">
                  {selectedArticle.category}
                </span>
                <span className="text-slate-400 text-xs flex items-center gap-1">
                  <Clock size={13} />
                  <span>{selectedArticle.readTime}</span>
                </span>
                <span className="text-slate-400 text-xs flex items-center gap-1">
                  <Calendar size={13} />
                  <span>{selectedArticle.publishedAt}</span>
                </span>
                <span className="text-slate-400 text-xs flex items-center gap-1">
                  <User size={13} />
                  <span>{selectedArticle.author}</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-snug tracking-tight">
                {selectedArticle.title}
              </h1>

              <p className="text-sm text-slate-600 font-medium leading-relaxed bg-pink-50/40 p-4 rounded-2xl border border-pink-100/60">
                {selectedArticle.summary}
              </p>
            </div>

            {/* AI Smart Summary Callout */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-pink-50/70 via-white to-rose-50/50 border border-pink-200/80 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-600 to-rose-500 text-white flex items-center justify-center shadow-xs">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <strong className="text-xs font-black text-slate-900 block">
                      AI SENSEI TÓM TẮT & BÓC TÁCH TỪ VỰNG TIẾNG NHẬT
                    </strong>
                    <span className="text-[11px] text-slate-500">
                      Tự động phân tích nội dung bài viết và lọc từ khóa quan trọng
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateAiSummary}
                  disabled={loadingAiSummary}
                  className="px-3.5 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Sparkles size={13} className={loadingAiSummary ? 'animate-spin' : ''} />
                  <span>{loadingAiSummary ? 'AI đang đọc & tóm tắt...' : 'Nhờ AI phân tích bài này'}</span>
                </button>
              </div>

              {aiSummary && (
                <div className="p-4 rounded-xl bg-white border border-pink-100 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap animate-in fade-in">
                  {aiSummary}
                </div>
              )}
            </div>

            {/* Article Long-form Content */}
            <div className="text-sm sm:text-base text-slate-800 leading-relaxed space-y-4 pt-2 whitespace-pre-line font-normal">
              {selectedArticle.content}
            </div>

            {/* Tags */}
            {selectedArticle.tags && selectedArticle.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-pink-50">
                <span className="text-xs font-bold text-slate-400">Từ khóa:</span>
                {selectedArticle.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}

            {/* ── MARKETING CTA BANNER (CONVERTING CASUAL READERS TO LEARNERS) ── */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-pink-950 text-white relative overflow-hidden shadow-lg space-y-3">
              <div className="absolute right-4 top-2 text-slate-800 font-jp font-black text-8xl opacity-20 select-none pointer-events-none">
                学
              </div>

              <div className="relative z-10 max-w-xl space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-extrabold text-[10.5px] uppercase tracking-wider border border-pink-500/30">
                  <Award size={13} />
                  <span>TRẢI NGHIỆM MIỄN PHÍ TRÊN NIHONGOHUB</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white leading-snug">
                  Chinh Phục Trọn Bộ 1.512 Từ Vựng N5 & Phản Xạ Gõ Phím Siêu Tốc
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  Ứng dụng học tiếng Nhật thế hệ mới với Flashcard 3D tự động phát âm giọng Tokyo, luyện nghe 25 bài Minna và Trợ lý AI Sensei phân tích bẫy đề thi riêng cho từng tài khoản.
                </p>
                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => { sounds.playLevelUp(); setActiveTab('lessons'); }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 text-white font-black text-xs shadow-lotus hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    Bắt đầu học thử ngay
                  </button>
                  <button
                    type="button"
                    onClick={() => { sounds.playFlip(); setActiveTab('practice'); }}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer border border-white/20"
                  >
                    Luyện gõ Romaji toàn bài
                  </button>
                </div>
              </div>
            </div>

            {/* ── REAL-TIME COMMENTS & REVIEWS SECTION ── */}
            <div className="space-y-6 pt-6 border-t border-pink-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare size={18} className="text-pink-600" />
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Bình Luận & Đánh Giá Thực Tế ({selectedArticle.comments?.length || 0})
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-medium">Cập nhật thời gian thực</span>
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="p-5 rounded-2xl bg-pink-50/30 border border-pink-100 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <input
                    type="text"
                    placeholder="Họ và tên của bạn..."
                    value={commentAuthor}
                    onChange={(e) => setCommentAuthor(e.target.value)}
                    className="px-3.5 py-2 rounded-xl border border-pink-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500 max-w-xs"
                  />

                  {/* 1-5 Star Picker */}
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-slate-500 mr-1">Đánh giá:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setCommentRating(star)}
                        className="cursor-pointer p-0.5 transition-transform hover:scale-125"
                      >
                        <Star
                          size={16}
                          className={
                            star <= commentRating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-300'
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    rows={3}
                    placeholder="Chia sẻ cảm nhận, thắc mắc hoặc kinh nghiệm của bạn về bài viết..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-pink-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingComment || !commentText.trim()}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 text-white font-bold text-xs shadow-lotus hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-40"
                  >
                    <Send size={13} />
                    <span>{submittingComment ? 'Đang gửi...' : 'Gửi bình luận ngay'}</span>
                  </button>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-3">
                {selectedArticle.comments && selectedArticle.comments.length > 0 ? (
                  selectedArticle.comments.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-full bg-pink-100 text-pink-700 font-black text-xs flex items-center justify-center">
                            {c.author.charAt(0).toUpperCase()}
                          </span>
                          <div>
                            <strong className="text-xs font-bold text-slate-900 block leading-tight">
                              {c.author}
                            </strong>
                            <span className="text-[10px] text-slate-400">{c.createdAt}</span>
                          </div>
                        </div>

                        {/* Rating stars */}
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              className={
                                i < (c.rating || 5)
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-slate-200'
                              }
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed pl-9 mb-0">
                        {c.content}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-xs text-slate-400">
                    Chưa có bình luận nào. Hãy là người đầu tiên để lại đánh giá cho bài viết này!
                  </div>
                )}
              </div>
            </div>
          </article>
        </div>
      ) : activeView === 'news' ? (
        /* ── 2B. NEWSFEED LIST VIEW ── */
        <div className="space-y-6">
          {/* Controls: Search and Category Pills */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    sounds.playFlip();
                    setSelectedCategory(cat.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-pink-600 text-white shadow-lotus'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-pink-300 hover:text-pink-600'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72 shrink-0">
              <input
                type="text"
                placeholder="Tìm tin tức, cẩm nang..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-pink-200 bg-white text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </form>
          </div>

          {/* Featured Hero Article */}
          {articles.length > 0 && selectedCategory === 'all' && (
            <div
              onClick={() => handleOpenArticle(articles[0])}
              className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-pink-50 via-white to-rose-50 border border-pink-200 shadow-sm hover:shadow-lotus transition-all cursor-pointer relative overflow-hidden group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-pink-600 to-rose-500 text-white font-extrabold text-[10.5px] uppercase tracking-wider shadow-2xs">
                      TIÊU ĐIỂM HÔM NAY
                    </span>
                    <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                      <Clock size={12} />
                      <span>{articles[0].readTime}</span>
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug group-hover:text-pink-600 transition-colors">
                    {articles[0].title}
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                    {articles[0].summary}
                  </p>

                  <div className="flex items-center gap-4 text-xs font-bold text-slate-500 pt-1">
                    <span>{articles[0].author}</span>
                    <span className="text-pink-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      <span>Đọc tiếp bài viết</span>
                      <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {articles.map((art) => (
              <div
                key={art.id}
                onClick={() => handleOpenArticle(art)}
                className="p-5 sm:p-6 rounded-3xl bg-white border border-pink-100 shadow-sm hover:border-pink-300 hover:shadow-lotus transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-700 font-extrabold text-[10.5px]">
                      {art.category}
                    </span>
                    <span className="text-slate-400 font-medium text-[11px] flex items-center gap-1">
                      <Clock size={12} />
                      <span>{art.readTime}</span>
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 group-hover:text-pink-600 transition-colors leading-snug">
                    {art.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {art.summary}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-pink-50 text-xs font-bold text-slate-400">
                  <span>{art.publishedAt}</span>
                  <span className="text-pink-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Xem chi tiết</span>
                    <ChevronRight size={13} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Write a New Review Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-pink-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-pink-50">
              <div className="flex items-center gap-2">
                <Star size={18} className="text-amber-500 fill-amber-500" />
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Gửi Đánh Giá Khóa Học / Trung Tâm Tiếng Nhật
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">Công khai thời gian thực</span>
            </div>

            <form onSubmit={handleAddReview} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tên học viên / Người đánh giá:
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Nguyễn Văn A..."
                    value={reviewAuthor}
                    onChange={(e) => setReviewAuthor(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tên khóa học hoặc trung tâm tiếng Nhật:
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Khóa học N5 HYPER, Trung tâm..."
                    value={reviewCenter}
                    onChange={(e) => setReviewCenter(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>

              {/* Star Rating Picker */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs font-bold text-slate-700">Chấm điểm chất lượng:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="cursor-pointer p-0.5 transition-transform hover:scale-125"
                    >
                      <Star
                        size={18}
                        className={
                          star <= reviewRating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-200'
                        }
                      />
                    </button>
                  ))}
                  <span className="text-xs font-extrabold text-amber-600 ml-1">
                    {reviewRating} / 5 sao
                  </span>
                </div>
              </div>

              <textarea
                rows={3}
                placeholder="Chia sẻ nhận xét thực tế về phương pháp dạy, tài liệu, phản xạ và hiệu quả đạt được..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-pink-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingReview || !reviewText.trim()}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 text-white font-black text-xs shadow-lotus hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-40"
                >
                  <Send size={13} />
                  <span>{submittingReview ? 'Đang gửi...' : 'Đăng đánh giá'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Community Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-5 sm:p-6 rounded-3xl bg-white border border-pink-100 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-extrabold text-pink-700 bg-pink-50 px-2 py-0.5 rounded-md inline-block mb-1">
                        {rev.centerName}
                      </span>
                      <h4 className="text-sm font-black text-slate-900">
                        {rev.author}
                      </h4>
                    </div>

                    {/* Star Rating */}
                    <div className="flex items-center gap-0.5 shrink-0">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={
                            i < rev.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-200'
                          }
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {rev.content}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-pink-50 text-[11px] text-slate-400">
                  <span>{rev.createdAt}</span>
                  {rev.verified && (
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                      <ShieldCheck size={13} />
                      <span>Đã xác minh học viên</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
