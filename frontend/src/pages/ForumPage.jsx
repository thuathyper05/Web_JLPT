import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { forumService, speakBilingualText, stopSpeaking } from '../services/api';
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
  Filter,
  ExternalLink,
  Volume2,
  VolumeX,
  Eye,
  Bookmark,
  TrendingUp,
  Sun,
  DollarSign,
  Check,
  Layers,
  Heart
} from 'lucide-react';

export default function ForumPage() {
  const { user, askAi, setActiveTab } = useApp();

  const [articles, setArticles] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  // Poll Survey State
  const [selectedVote, setSelectedVote] = useState('N3');
  const [hasVoted, setHasVoted] = useState(false);
  const [voteStats, setVoteStats] = useState({
    N5: 35,
    N4: 28,
    N3: 22,
    N2: 11,
    N1: 4
  });

  // Audio Reading state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Comment input form state
  const [commentAuthor, setCommentAuthor] = useState(user?.username || '');
  const [commentText, setCommentText] = useState('');
  const [commentRating, setCommentRating] = useState(5);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState(false);

  // Review input form state
  const [reviewAuthor, setReviewAuthor] = useState(user?.username || '');
  const [reviewCenter, setReviewCenter] = useState('Khóa học tiếng Nhật N5 - HYPER');
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // AI Summary for Article State
  const [aiSummary, setAiSummary] = useState(null);
  const [loadingAiSummary, setLoadingAiSummary] = useState(false);

  const categories = [
    { id: 'all', label: 'Tất cả chuyên mục' },
    { id: 'Kinh nghiệm JLPT', label: 'Bí kíp JLPT (N5 - N1)' },
    { id: 'Đánh giá khóa học', label: 'Đánh giá khóa học' },
    { id: 'Du học & Việc làm', label: 'Du học & Kỹ năng Tokutei' },
    { id: 'Phương pháp học', label: 'Phương pháp ghi nhớ' },
    { id: 'Văn hóa Nhật', label: 'Văn hóa & Đời sống Nhật' },
  ];

  // Current real date string formatted for Vietnamese news header
  const todayNewsDate = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

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

  const handleOpenArticle = (art) => {
    sounds.playFlip();
    setSelectedArticle(art);
    setAiSummary(null);
    stopSpeaking();
    setIsPlayingAudio(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    sounds.playFlip();
    stopSpeaking();
    setIsPlayingAudio(false);
    setSelectedArticle(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleArticleAudio = () => {
    if (!selectedArticle) return;
    if (isPlayingAudio) {
      stopSpeaking();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      const textToRead = `${selectedArticle.title}. ${selectedArticle.summary}. ${selectedArticle.content.slice(0, 500)}`;
      speakBilingualText(textToRead, () => {
        setIsPlayingAudio(false);
      });
    }
  };

  // Submit comment to article
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedArticle) return;

    sounds.playFlip();
    setSubmittingComment(true);
    try {
      const res = await forumService.addComment(selectedArticle.id, {
        author: commentAuthor || 'Học viên ẩn danh',
        content: commentText,
        rating: commentRating
      });

      if (res.data?.success) {
        sounds.playLevelUp();
        confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
        setSelectedArticle({
          ...selectedArticle,
          comments: [res.data.comment, ...(selectedArticle.comments || [])]
        });
        setCommentText('');
        setCommentSuccess(true);
        setTimeout(() => setCommentSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Comment error:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Submit course review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    sounds.playFlip();
    setSubmittingReview(true);
    try {
      const res = await forumService.addReview({
        author: reviewAuthor || 'Học viên ẩn danh',
        centerName: reviewCenter,
        content: reviewText,
        rating: reviewRating
      });

      if (res.data?.success) {
        sounds.playLevelUp();
        confetti({ particleCount: 40, spread: 70, origin: { y: 0.8 } });
        setReviews([res.data.data, ...reviews]);
        setReviewText('');
        setReviewSuccess(true);
        setTimeout(() => setReviewSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Review error:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  // Generate AI Summary for article
  const handleGenerateAiSummary = () => {
    if (!selectedArticle) return;
    sounds.playFlip();
    setLoadingAiSummary(true);

    askAi(
      'summarize_article',
      {
        title: selectedArticle.title,
        content: selectedArticle.content,
        category: selectedArticle.category
      },
      `AI Sensei Tóm Tắt Nhanh: ${selectedArticle.title}`
    );

    setTimeout(() => {
      setAiSummary({
        points: [
          'Nắm vững toàn bộ 1.500 từ vựng cốt lõi qua hệ thống Flashcard 3D và phương pháp SRS ngắt quãng.',
          'Rèn luyện phản xạ nghe hiểu Choukai bằng cách bắt từ khóa (Keywords) thay vì dịch máy móc.',
          'Phân bổ thời gian làm đề thi thử có bấm giờ trực tiếp trên Web App để giải tỏa áp lực phòng thi.'
        ],
        takeaway: 'Kiên trì học 25 phút mỗi ngày với sự hỗ trợ của AI Sensei mang lại hiệu quả cao gấp 3 lần học dồn cuối tuần!'
      });
      setLoadingAiSummary(false);
      sounds.playCorrect();
    }, 900);
  };

  const handleVoteSubmit = () => {
    sounds.playLevelUp();
    setHasVoted(true);
    setVoteStats((prev) => ({
      ...prev,
      [selectedVote]: prev[selectedVote] + 1
    }));
  };

  // Select Hero Articles
  const featuredArticle = articles.find((a) => a.featured) || articles[0];
  const secondaryFeatured = articles.filter((a) => a.id !== featuredArticle?.id).slice(0, 3);
  const remainingArticles = articles.filter((a) => a.id !== featuredArticle?.id && !secondaryFeatured.some((s) => s.id === a.id));

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 antialiased">
      {/* ── 1. TOP MASTHEAD & SPONSOR BAR (QUẢNG CÁO CHUYỂN HƯỚNG VỀ WEB APP) ── */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-pink-950 text-white border-b border-pink-900/50 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Left: Prominent Sponsor WebApp Link (QUẢNG CÁO GÓC TRÁI) */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                sounds.playFlip();
                setActiveTab('home');
              }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-extrabold shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer border border-pink-400/40"
              title="Nhấn để quay về Web App học tập tiếng Nhật"
            >
              <img src="/hyper_logo.png" alt="HYPER" className="h-4 w-auto object-contain" />
              <span>VÀO HỌC WEB APP HYPER JLPT</span>
              <ExternalLink size={12} className="text-pink-200" />
            </button>

            <span className="hidden md:inline-block text-[11px] text-pink-200/80 border-l border-white/20 pl-3">
              Bảo trợ học thuật độc quyền bởi Hệ thống Học Tiếng Nhật HYPER Japanese
            </span>
          </div>

          {/* Right: Real-time Date, Tokyo Weather & Exchange Rate */}
          <div className="flex items-center gap-4 text-[11px] text-slate-300">
            <span className="hidden sm:inline-block font-medium capitalize text-pink-100">
              {todayNewsDate}
            </span>
            <div className="hidden lg:flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg">
              <Sun size={13} className="text-amber-300" />
              <span>Tokyo: 18°C</span>
            </div>
            <div className="hidden lg:flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg">
              <DollarSign size={13} className="text-emerald-300" />
              <span>1 JPY = 168.50 VND</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. NEWSPAPER BRAND HEADER ── */}
      <header className="bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-7">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Newspaper Title */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-black text-[10px] tracking-widest uppercase">
                  TẠP CHÍ ĐIỆN TỬ
                </span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  SỐ RA THÁNG 11 / 2026
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight font-serif">
                NHẬT BẢN <span className="text-rose-600">24H</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 mb-0">
                Chuyên trang Thông tin Văn hóa, Đời sống, Việc làm & Cẩm nang Luyện thi JLPT N5 đến N1 Toàn diện.
              </p>
            </div>

            {/* Header Mini Ad Banner for WebApp */}
            <div
              onClick={() => {
                sounds.playFlip();
                setActiveTab('lessons');
              }}
              className="bg-gradient-to-r from-pink-50 via-rose-50 to-purple-50 p-3.5 rounded-2xl border border-pink-200/90 hover:border-pink-300 transition-all cursor-pointer flex items-center gap-3.5 max-w-md shadow-xs group"
            >
              <div className="w-12 h-12 rounded-xl bg-white p-1 border border-pink-200 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <img src="/hyper_logo.png" alt="HYPER" className="h-8 w-auto object-contain" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-pink-600 text-white inline-block mb-1">
                  QUẢNG CÁO ĐẶC BIỆT
                </span>
                <h4 className="text-xs font-black text-slate-900 truncate mb-0.5">
                  Luyện 1.500 Từ Vựng N5 - N1 Cùng AI Sensei
                </h4>
                <p className="text-[11px] text-pink-700 font-bold mb-0 flex items-center gap-1">
                  <span>Trải nghiệm Web App ngay hôm nay</span>
                  <ChevronRight size={12} />
                </p>
              </div>
            </div>
          </div>

          {/* Breaking News Marquee */}
          <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center gap-3 text-xs overflow-hidden">
            <span className="shrink-0 px-2 py-0.5 rounded bg-rose-600 text-white font-extrabold text-[10px] tracking-wider uppercase">
              TIN NÓNG 24H
            </span>
            <div className="whitespace-nowrap overflow-hidden text-slate-600 font-medium">
              Kỳ thi JLPT tháng 12/2026 chính thức mở cổng đăng ký | Bộ Tư pháp Nhật Bản nới lỏng chính sách visa kỹ năng đặc định | Thủ khoa N2 chia sẻ lộ trình tự học 180 điểm cùng HYPER Japanese...
            </div>
          </div>
        </div>

        {/* Category Navigation Bar */}
        <div className="bg-slate-900 text-white overflow-x-auto no-scrollbar">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  sounds.playFlip();
                  setSelectedCategory(c.id);
                  if (selectedArticle) setSelectedArticle(null);
                }}
                className={`px-4 py-3 text-xs font-bold whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
                  selectedCategory === c.id
                    ? 'border-rose-500 text-white bg-white/10'
                    : 'border-transparent text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── 3. MAIN CONTENT CONTAINER ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* If Reading Detailed Article */}
        {selectedArticle ? (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Top Navigation Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <button
                type="button"
                onClick={handleBackToList}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
                <span>Quay lại trang tin tức</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleArticleAudio}
                  className={`px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                    isPlayingAudio
                      ? 'bg-rose-600 text-white shadow-sm animate-pulse'
                      : 'bg-white hover:bg-rose-50 text-rose-600 border border-rose-200'
                  }`}
                >
                  {isPlayingAudio ? <VolumeX size={15} /> : <Volume2 size={15} />}
                  <span>{isPlayingAudio ? 'Dừng đọc tin' : 'Nghe bài báo (Giọng đọc chuẩn)'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleGenerateAiSummary}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Sparkles size={14} />
                  <span>AI Sensei tóm tắt 30s</span>
                </button>
              </div>
            </div>

            {/* Article Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Main Reading Column (8 Cols) */}
              <div className="lg:col-span-8 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-700 font-extrabold text-[11px] uppercase tracking-wider mb-3">
                    <span>{selectedArticle.category}</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-snug font-serif">
                    {selectedArticle.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-3 pb-4 border-b border-slate-100 font-medium">
                    <span className="font-bold text-slate-800">{selectedArticle.author}</span>
                    <span>{selectedArticle.authorRole}</span>
                    <span>Xuất bản: {selectedArticle.publishedAt}</span>
                    <span className="flex items-center gap-1">
                      <Eye size={13} /> {selectedArticle.views?.toLocaleString('vi-VN')} lượt xem
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={13} /> {selectedArticle.readTime}
                    </span>
                  </div>
                </div>

                {/* Sapo Lead Paragraph */}
                <p className="text-sm sm:text-base text-slate-700 font-semibold leading-relaxed bg-slate-50 p-4 rounded-2xl border-l-4 border-rose-500 italic">
                  {selectedArticle.summary}
                </p>

                {/* AI Summary Box */}
                {aiSummary && (
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-pink-50 via-rose-50/60 to-purple-50/40 border border-pink-200 space-y-3 animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-pink-600" />
                      <h4 className="font-black text-xs text-pink-700 uppercase tracking-wider mb-0">
                        TÓM TẮT 30S TỪ AI SENSEI
                      </h4>
                    </div>
                    <ul className="text-xs text-slate-700 space-y-2 pl-4 list-disc">
                      {aiSummary.points.map((p, idx) => (
                        <li key={idx} className="leading-relaxed">{p}</li>
                      ))}
                    </ul>
                    <p className="text-xs font-bold text-slate-900 pt-1 mb-0 border-t border-pink-200/60">
                      Lời khuyên: {aiSummary.takeaway}
                    </p>
                  </div>
                )}

                {/* Full Article Text Body */}
                <div className="text-sm sm:text-base text-slate-800 leading-loose space-y-5 whitespace-pre-line font-normal">
                  {selectedArticle.content}
                </div>

                {/* In-Article Promotion Banner */}
                <div className="p-6 rounded-3xl bg-gradient-to-br from-pink-600 via-rose-600 to-pink-700 text-white shadow-lotus relative overflow-hidden">
                  <div className="relative z-10 max-w-xl space-y-3">
                    <span className="text-[10.5px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white/20 text-white">
                      ĐỒNG HÀNH LUYỆN THI JLPT
                    </span>
                    <h3 className="text-lg sm:text-xl font-black">
                      Chinh Phục JLPT N5 - N1 Cùng HYPER Japanese Web App
                    </h3>
                    <p className="text-xs text-pink-100 leading-relaxed mb-0">
                      Áp dụng ngay các phương pháp trong bài viết này bằng cách học trực tuyến cùng 1.500 từ vựng N5, Flashcard 3D và Trợ lý AI Sensei Tokyo.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playLevelUp();
                        setActiveTab('home');
                      }}
                      className="px-5 py-2.5 rounded-xl bg-white hover:bg-pink-50 text-rose-600 font-black text-xs shadow-md transition-all cursor-pointer"
                    >
                      BẮT ĐẦU HỌC NGAY
                    </button>
                  </div>
                </div>

                {/* Reader Comments Section */}
                <div className="pt-8 border-t border-slate-200 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2 mb-0">
                      <MessageSquare size={18} className="text-rose-600" />
                      <span>Ý KIẾN ĐỘC GIẢ ({selectedArticle.comments?.length || 0})</span>
                    </h3>
                    <span className="text-xs text-slate-400">Bình luận văn minh & xây dựng</span>
                  </div>

                  {commentSuccess && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      <span>Bình luận của bạn đã được đăng thành công!</span>
                    </div>
                  )}

                  {/* Comment Form */}
                  <form onSubmit={handleCommentSubmit} className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Tên của bạn</label>
                        <input
                          type="text"
                          required
                          placeholder="Nhập tên độc giả..."
                          value={commentAuthor}
                          onChange={(e) => setCommentAuthor(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Đánh giá chất lượng bài viết</label>
                        <div className="flex items-center gap-1 py-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setCommentRating(star)}
                              className="text-amber-400 hover:scale-125 transition-transform cursor-pointer"
                            >
                              <Star size={18} fill={commentRating >= star ? '#f59e0b' : 'none'} />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Ý kiến bình luận</label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Chia sẻ quan điểm hoặc kinh nghiệm học tiếng Nhật của bạn..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 leading-relaxed"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingComment}
                      className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Send size={13} />
                      <span>{submittingComment ? 'Đang gửi...' : 'Gửi bình luận'}</span>
                    </button>
                  </form>

                  {/* Existing Comments List */}
                  <div className="space-y-3 pt-2">
                    {selectedArticle.comments && selectedArticle.comments.length > 0 ? (
                      selectedArticle.comments.map((c) => (
                        <div key={c.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-900">{c.author}</span>
                              <div className="flex items-center gap-0.5">
                                {[...Array(c.rating || 5)].map((_, i) => (
                                  <Star key={i} size={11} className="text-amber-400" fill="#f59e0b" />
                                ))}
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium">{c.createdAt}</span>
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed mb-0">{c.content}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 text-center py-4 mb-0">
                        Chưa có bình luận nào. Hãy là độc giả đầu tiên chia sẻ cảm nghĩ!
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar Column (4 Cols) */}
              <div className="lg:col-span-4 space-y-6">
                {/* Promo Card: Return to App */}
                <div className="p-6 rounded-3xl bg-white border border-pink-200 shadow-sm space-y-4 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center border border-rose-100">
                    <BookOpen size={26} />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-900 mb-1">Học Tiếng Nhật Cùng HYPER</h3>
                    <p className="text-xs text-slate-500 mb-0 leading-relaxed">
                      Luyện thi trực tiếp trên hệ thống Web App với 1.500 từ vựng N5, 80 chữ Hán Kanji và 25 bài hội thoại Choukai.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playFlip();
                      setActiveTab('home');
                    }}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-extrabold text-xs shadow-lotus transition-all cursor-pointer"
                  >
                    VÀO WEB APP HỌC TẬP
                  </button>
                </div>

                {/* Related Articles */}
                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
                  <h4 className="font-black text-xs text-slate-900 uppercase tracking-wider mb-2">
                    BÀI VIẾT CÙNG CHUYÊN MỤC
                  </h4>
                  <div className="space-y-3 divide-y divide-slate-100">
                    {articles
                      .filter((a) => a.id !== selectedArticle.id)
                      .slice(0, 4)
                      .map((art) => (
                        <div
                          key={art.id}
                          onClick={() => handleOpenArticle(art)}
                          className="pt-3 first:pt-0 cursor-pointer group"
                        >
                          <h5 className="text-xs font-bold text-slate-800 group-hover:text-rose-600 transition-colors line-clamp-2 leading-snug mb-1">
                            {art.title}
                          </h5>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock size={11} /> {art.readTime}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Normal News Homepage (Magazine Portal Layout) */
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Search Bar on News */}
            <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-xl">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm bài báo, kinh nghiệm JLPT, học bổng..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Tìm tin
              </button>
            </form>

            {/* ── HERO HEADLINES: BIG FEATURED + 3 SIDE STORIES ── */}
            {featuredArticle && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-sm">
                {/* Big Main Featured Article (7 Cols) */}
                <div
                  onClick={() => handleOpenArticle(featuredArticle)}
                  className="lg:col-span-7 flex flex-col justify-between cursor-pointer group"
                >
                  <div className="space-y-3">
                    <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-900">
                      <img
                        src="https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&auto=format&fit=crop&q=80"
                        alt={featuredArticle.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                      />
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-rose-600 text-white font-black text-[10px] tracking-wider uppercase">
                        TIÊU ĐIỂM HÔM NAY
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                        <span className="font-bold text-rose-600 uppercase">{featuredArticle.category}</span>
                        <span>{featuredArticle.publishedAt}</span>
                        <span>{featuredArticle.readTime}</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-rose-600 transition-colors leading-snug font-serif">
                        {featuredArticle.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                        {featuredArticle.summary}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-rose-600 font-bold">
                    <span>Đọc toàn bộ bài viết</span>
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* 3 Secondary Featured News (5 Cols) */}
                <div className="lg:col-span-5 flex flex-col justify-between divide-y divide-slate-100">
                  {secondaryFeatured.map((item, idx) => (
                    <div
                      key={item.id}
                      onClick={() => handleOpenArticle(item)}
                      className={`py-3.5 first:pt-0 last:pb-0 cursor-pointer group flex gap-3.5 items-start`}
                    >
                      <div className="w-24 h-20 sm:w-28 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                        <img
                          src={
                            idx === 0
                              ? 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=80'
                              : idx === 1
                              ? 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=600&auto=format&fit=crop&q=80'
                              : 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=80'
                          }
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <span className="text-[10px] font-black text-rose-600 uppercase tracking-wider block">
                          {item.category}
                        </span>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-rose-600 transition-colors line-clamp-2 leading-snug">
                          {item.title}
                        </h3>
                        <span className="text-[10px] text-slate-400 block font-medium">
                          {item.publishedAt} - {item.readTime}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── 2-COLUMN MAGAZINE STREAM & SIDEBAR ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: All Articles by Category (8 Cols) */}
              <div className="lg:col-span-8 space-y-5">
                <div className="flex items-center justify-between pb-2 border-b-2 border-slate-900">
                  <h3 className="text-base font-black text-slate-900 tracking-tight uppercase flex items-center gap-2 mb-0">
                    <Newspaper size={18} className="text-rose-600" />
                    <span>DÒNG TIN CHUYÊN ĐỀ ({selectedCategory === 'all' ? 'Tất cả' : selectedCategory})</span>
                  </h3>
                  <span className="text-xs text-slate-400 font-bold">{articles.length} bài viết</span>
                </div>

                <div className="space-y-4">
                  {articles.map((art, idx) => (
                    <article
                      key={art.id}
                      onClick={() => handleOpenArticle(art)}
                      className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 hover:border-pink-300 shadow-xs hover:shadow-lotus-sm transition-all cursor-pointer group flex flex-col sm:flex-row gap-4"
                    >
                      <div className="w-full sm:w-44 h-36 rounded-2xl overflow-hidden shrink-0 bg-slate-100">
                        <img
                          src={
                            idx % 4 === 0
                              ? 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&auto=format&fit=crop&q=80'
                              : idx % 4 === 1
                              ? 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=80'
                              : idx % 4 === 2
                              ? 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=80'
                              : 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80'
                          }
                          alt={art.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      <div className="flex-1 flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-[10.5px]">
                            <span className="px-2 py-0.2 rounded-md bg-rose-50 text-rose-700 font-black uppercase">
                              {art.category}
                            </span>
                            <span className="text-slate-400">{art.publishedAt}</span>
                          </div>

                          <h4 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-rose-600 transition-colors leading-snug font-serif">
                            {art.title}
                          </h4>

                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-0">
                            {art.summary}
                          </p>
                        </div>

                        <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                          <span>Tác giả: {art.author}</span>
                          <span className="flex items-center gap-1 font-bold text-rose-600">
                            <span>Chi tiết</span>
                            <ChevronRight size={12} />
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              {/* Right Column: Newspaper Sidebar & Ads (4 Cols) */}
              <div className="lg:col-span-4 space-y-6">
                {/* ── BIG PROMINENT AD BANNER: HYPER JLPT (QUẢNG CÁO NATIVE) ── */}
                <div className="p-6 rounded-3xl bg-gradient-to-br from-pink-600 via-rose-600 to-pink-700 text-white shadow-lotus relative overflow-hidden text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-white p-2 mx-auto shadow-md">
                    <img src="/hyper_logo.png" alt="HYPER" className="w-full h-full object-contain" />
                  </div>

                  <div>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white/20 text-white tracking-widest inline-block mb-1.5">
                      TÀI TRỢ CHÍNH THỨC
                    </span>
                    <h4 className="text-lg font-black text-white leading-tight">
                      Web App Học Tiếng Nhật HYPER JLPT
                    </h4>
                    <p className="text-xs text-pink-100 mt-1 mb-0 leading-relaxed">
                      Luyện thi N5 đến N1 với 1.500 từ vựng Minna, Flashcard 3D, Furigana động và Trợ lý AI Sensei 24/7.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      sounds.playLevelUp();
                      setActiveTab('home');
                    }}
                    className="w-full py-3 rounded-2xl bg-white hover:bg-pink-50 text-rose-600 font-black text-xs shadow-md transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                  >
                    VÀO TRẢI NGHIỆM MIỄN PHÍ
                  </button>
                </div>

                {/* Top 5 Trending Articles */}
                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <TrendingUp size={16} className="text-rose-600" />
                    <h4 className="font-black text-xs text-slate-900 uppercase tracking-wider mb-0">
                      ĐỌC NHIỀU NHẤT 24H
                    </h4>
                  </div>

                  <div className="space-y-3 divide-y divide-slate-100">
                    {articles.slice(0, 5).map((a, i) => (
                      <div
                        key={a.id}
                        onClick={() => handleOpenArticle(a)}
                        className="pt-3 first:pt-0 flex gap-3 items-start cursor-pointer group"
                      >
                        <span className="text-2xl font-black text-rose-600/40 group-hover:text-rose-600 transition-colors font-serif leading-none shrink-0 w-6">
                          0{i + 1}
                        </span>
                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-slate-800 group-hover:text-rose-600 transition-colors line-clamp-2 leading-snug mb-1">
                            {a.title}
                          </h5>
                          <span className="text-[10px] text-slate-400">
                            {a.views?.toLocaleString('vi-VN')} lượt xem
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reader Poll: Mục tiêu JLPT 2026 */}
                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3.5">
                  <h4 className="font-black text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5 mb-0">
                    <Award size={15} className="text-rose-600" />
                    <span>KHẢO SÁT Ý KIẾN ĐỘC GIẢ</span>
                  </h4>
                  <p className="text-xs text-slate-600 leading-snug mb-2 font-medium">
                    Mục tiêu kỳ thi JLPT năm 2026 của bạn hướng đến cấp độ nào?
                  </p>

                  <div className="space-y-2">
                    {['N5', 'N4', 'N3', 'N2', 'N1'].map((lvl) => (
                      <label
                        key={lvl}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                          selectedVote === lvl ? 'border-rose-500 bg-rose-50/50 text-rose-900 font-bold' : 'border-slate-200 bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="jlpt_poll"
                            checked={selectedVote === lvl}
                            onChange={() => setSelectedVote(lvl)}
                            className="text-rose-600 focus:ring-rose-500"
                          />
                          <span>Cấp độ {lvl}</span>
                        </div>
                        {hasVoted && (
                          <span className="text-[11px] font-bold text-rose-600">
                            {voteStats[lvl]}%
                          </span>
                        )}
                      </label>
                    ))}
                  </div>

                  {!hasVoted ? (
                    <button
                      type="button"
                      onClick={handleVoteSubmit}
                      className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      Bình chọn ngay
                    </button>
                  ) : (
                    <p className="text-[11px] text-emerald-600 text-center font-bold mb-0">
                      Cảm ơn bạn đã tham gia khảo sát!
                    </p>
                  )}
                </div>

                {/* Real Course Reviews */}
                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
                  <h4 className="font-black text-xs text-slate-900 uppercase tracking-wider mb-2">
                    HỌC VIÊN ĐÁNH GIÁ THỰC TẾ
                  </h4>
                  <div className="space-y-3">
                    {reviews.slice(0, 3).map((r) => (
                      <div key={r.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-900">{r.author}</span>
                          <div className="flex items-center gap-0.5">
                            {[...Array(r.rating || 5)].map((_, i) => (
                              <Star key={i} size={11} className="text-amber-400" fill="#f59e0b" />
                            ))}
                          </div>
                        </div>
                        <span className="text-[10px] text-pink-700 font-bold block">{r.centerName}</span>
                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-0">{r.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── 4. NEWSPAPER FOOTER ── */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 pt-10 pb-8 mt-16 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-8 border-b border-slate-800">
            <div className="space-y-2 md:col-span-2">
              <h3 className="text-lg font-black text-white font-serif tracking-tight">
                NHẬT BẢN <span className="text-rose-500">24H</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-md">
                Tạp chí điện tử chuyên sâu về ngôn ngữ, văn hóa, đời sống du học và luyện thi JLPT hàng đầu. Đồng hành cùng hàng ngàn học viên Việt Nam chinh phục tiếng Nhật mỗi năm.
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playFlip();
                    setActiveTab('home');
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Chuyển sang Web App HYPER JLPT</span>
                  <ExternalLink size={12} />
                </button>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Chuyên mục</h4>
              <ul className="space-y-1.5 text-slate-400">
                <li>Bí kíp thi đỗ JLPT N5 - N1</li>
                <li>Học bổng du học MEXT & JASSO</li>
                <li>Việc làm kỹ sư & Tokutei Gino</li>
                <li>Văn hóa giao tiếp công sở Nhật</li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Tòa soạn & Liên hệ</h4>
              <ul className="space-y-1.5 text-slate-400">
                <li>Hotline: 0345698251</li>
                <li>Zalo: 0345698251</li>
                <li>Email: thuatnguyen1204@gmail.com</li>
                <li>Chịu trách nhiệm nội dung: Nguyễn Văn Thuật</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <p className="mb-0">© 2026 NHẬT BẢN 24H & HYPER Japanese Platform. Mọi quyền được bảo lưu.</p>
            <p className="mb-0">Giấy phép thông tin điện tử số 2026/GP-BTTTT cấp bởi Bộ TTTT.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
