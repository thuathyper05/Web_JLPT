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
  Heart,
  MapPin,
  Phone,
  Globe,
  Building,
  CheckCheck,
  Copy,
  Zap
} from 'lucide-react';

export default function ForumPage() {
  const { user, askAi, setActiveTab } = useApp();

  const [articles, setArticles] = useState([]);
  const [centers, setCenters] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  // Center lookup states
  const [selectedCity, setSelectedCity] = useState('all');
  const [centerSearch, setCenterSearch] = useState('');
  const [copiedCenterPhone, setCopiedCenterPhone] = useState(null);

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

  // Bookmarked articles state
  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('nihongo_bookmarked_news') || '[]');
    } catch {
      return [];
    }
  });
  const [copiedLink, setCopiedLink] = useState(false);

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
    { id: 'all', label: 'Trang chủ Báo chí' },
    { id: 'centers', label: 'Tra cứu Trung tâm' },
    { id: 'Kỳ thi & Lịch thi', label: 'Lịch thi JLPT & NAT-TEST' },
    { id: 'Kinh nghiệm JLPT', label: 'Bí kíp JLPT (N5 - N1)' },
    { id: 'Du học & Việc làm', label: 'Du học & Visa Tokutei' },
    { id: 'Phương pháp học', label: 'Phương pháp ghi nhớ SRS' },
    { id: 'Văn hóa Nhật', label: 'Văn hóa & Đời sống' },
    { id: 'Đánh giá khóa học', label: 'Review & Đánh giá' },
  ];

  const cities = [
    { id: 'all', label: 'Toàn quốc' },
    { id: 'Đà Nẵng', label: 'Đà Nẵng' },
    { id: 'Hà Nội', label: 'Hà Nội' },
    { id: 'Quảng Nam', label: 'Quảng Nam' },
    { id: 'TP. Hồ Chí Minh', label: 'TP. Hồ Chí Minh' },
    { id: 'Các tỉnh khác', label: 'Các tỉnh khác' },
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
        category: selectedCategory === 'all' || selectedCategory === 'centers' ? undefined : selectedCategory,
        search: searchQuery || undefined
      });
      setArticles(res.data?.data || []);
    } catch (err) {
      console.error('Fetch articles error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch centers
  const fetchCenters = async () => {
    try {
      const res = await forumService.getCenters({
        city: selectedCity === 'all' ? undefined : selectedCity,
        search: centerSearch || undefined
      });
      setCenters(res.data?.data || []);
    } catch (err) {
      console.error('Fetch centers error:', err);
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

  useEffect(() => {
    fetchCenters();
  }, [selectedCity, centerSearch]);

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

  const toggleBookmark = (artId) => {
    sounds.playCorrect();
    let updated;
    if (bookmarkedIds.includes(artId)) {
      updated = bookmarkedIds.filter((id) => id !== artId);
    } else {
      updated = [...bookmarkedIds, artId];
    }
    setBookmarkedIds(updated);
    localStorage.setItem('nihongo_bookmarked_news', JSON.stringify(updated));
  };

  const copyArticleLink = () => {
    sounds.playCorrect();
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyCenterPhone = (phone, id) => {
    sounds.playCorrect();
    navigator.clipboard.writeText(phone);
    setCopiedCenterPhone(id);
    setTimeout(() => setCopiedCenterPhone(null), 2000);
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

  // Submit Poll
  const handleVoteSubmit = () => {
    if (hasVoted) return;
    sounds.playCorrect();
    confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
    setHasVoted(true);
    setVoteStats((prev) => ({
      ...prev,
      [selectedVote]: prev[selectedVote] + 1
    }));
  };

  // Trigger AI Summary
  const handleGenerateAiSummary = async () => {
    if (!selectedArticle) return;
    sounds.playFlip();
    setLoadingAiSummary(true);
    try {
      const prompt = `Bạn là biên tập viên báo chí cao cấp. Hãy tóm tắt bài viết sau thành 3 ý chính then chốt ngắn gọn, súc tích dành cho học viên tiếng Nhật:\nTiêu đề: ${selectedArticle.title}\nNội dung: ${selectedArticle.content}`;
      const res = await askAi('custom', { prompt });
      if (res?.explanation || res?.reply) {
        setAiSummary(res.explanation || res.reply);
      } else {
        setAiSummary('Bài viết phân tích các quy định và bí kíp cần thiết nhất để người học tiếng Nhật đạt điểm cao trong kỳ thi thực tế.');
      }
    } catch {
      setAiSummary('Tóm tắt nhanh: Nắm vững từ vựng cốt lõi, luyện nghe thực tế hàng ngày và làm đề thi thử có bấm giờ là phương pháp tối ưu nhất.');
    } finally {
      setLoadingAiSummary(false);
    }
  };

  // Total votes calculation
  const totalVotes = Object.values(voteStats).reduce((a, b) => a + b, 0);

  // Featured Hero and Secondary Featured
  const featuredArticle = articles.find((a) => a.featured) || articles[0];
  const secondaryFeatured = articles.filter((a) => a.id !== featuredArticle?.id).slice(0, 3);
  const remainingArticles = articles.filter((a) => a.id !== featuredArticle?.id && !secondaryFeatured.some((s) => s.id === a.id));

  return (
    <div className="bg-[#fcfcfd] min-h-screen text-slate-800 antialiased font-sans">
      {/* ── 1. TOP MASTHEAD & SPONSOR BAR (QUẢNG CÁO CHUYỂN HƯỚNG GÓC TRÁI) ── */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-rose-950 text-white border-b border-rose-900/40 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          {/* Left: Prominent Sponsor WebApp Link (QUẢNG CÁO GÓC TRÁI VỀ WEB CỦA TÔI) */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                sounds.playFlip();
                setActiveTab('home');
              }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-black shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer border border-rose-400/40"
              title="Nhấn để vào Web App học tập tiếng Nhật HYPER JLPT"
            >
              <img src="/hyper_logo.png" alt="HYPER" className="h-3.5 w-auto object-contain" />
              <span className="tracking-wide">VÀO HỌC WEB APP HYPER JLPT</span>
              <ExternalLink size={12} className="text-pink-200" />
            </button>

            <span className="hidden md:inline-block text-[11px] text-pink-200/80 border-l border-white/20 pl-3">
              Bảo trợ chuyên môn bởi Nền tảng Học Tiếng Nhật HYPER Japanese
            </span>
          </div>

          {/* Right: Real-time Date, Tokyo Weather & Exchange Rate */}
          <div className="flex items-center gap-3.5 text-[11px] text-slate-300">
            <span className="hidden sm:inline-block font-medium capitalize text-pink-100">
              {todayNewsDate}
            </span>
            <div className="hidden lg:flex items-center gap-1.5 bg-white/10 px-2 py-0.5 rounded-lg border border-white/10">
              <Sun size={12} className="text-amber-300" />
              <span>Tokyo: 18°C</span>
            </div>
            <div className="hidden lg:flex items-center gap-1.5 bg-white/10 px-2 py-0.5 rounded-lg border border-white/10">
              <DollarSign size={12} className="text-emerald-300" />
              <span>1 JPY = 168.50 VND</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. NEWSPAPER BRAND HEADER & HERO SPONSOR BANNER ── */}
      <header className="bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Newspaper Title */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-md bg-rose-700 text-white font-black text-[9.5px] tracking-widest uppercase">
                  BÁO ĐIỆN TỬ
                </span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  CỔNG THÔNG TIN KHẢO THÍ & ĐỜI SỐNG NHẬT BẢN
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight font-serif">
                NHẬT BẢN <span className="text-rose-700">24H</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 mb-0">
                Lịch thi JLPT, Danh bạ Trung tâm uy tín toàn quốc, Visa Tokutei và Cẩm nang Du học Nhật Bản.
              </p>
            </div>

            {/* QUẢNG CÁO WEB APP SỐ 2: HEADER HERO AD BANNER */}
            <div
              onClick={() => {
                sounds.playFlip();
                setActiveTab('lessons');
              }}
              className="bg-gradient-to-r from-rose-50 via-pink-50 to-purple-50 p-3 sm:p-3.5 rounded-2xl border border-rose-200/90 hover:border-rose-400 transition-all cursor-pointer flex items-center gap-3 max-w-md shadow-xs group"
            >
              <div className="w-12 h-12 rounded-xl bg-white p-1 border border-pink-200 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <img src="/hyper_logo.png" alt="HYPER" className="h-8 w-auto object-contain" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[9.5px] font-black uppercase px-1.5 py-0.2 rounded bg-rose-600 text-white inline-block">
                    TÀI TRỢ CHÍNH THỨC
                  </span>
                  <span className="text-[10px] font-bold text-rose-600">Miễn phí 100%</span>
                </div>
                <h4 className="text-xs font-black text-slate-900 truncate mb-0.5">
                  Luyện 1.500 Từ Vựng N5 - N1 Cùng AI Sensei 24/7
                </h4>
                <p className="text-[11px] text-rose-700 font-bold mb-0 flex items-center gap-1">
                  <span>Trải nghiệm Web App ngay</span>
                  <ChevronRight size={12} />
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. BREAKING NEWS TICKER ── */}
        <div className="border-t border-slate-100 bg-slate-50/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center gap-3 overflow-hidden text-xs">
            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-rose-600 text-white font-black text-[10.5px] shrink-0 tracking-wider">
              <Flame size={12} className="animate-pulse" />
              <span>TIN NÓNG 24H</span>
            </div>
            <div className="truncate text-slate-700 font-medium text-[11.5px]">
              <span className="font-bold text-slate-900">JLPT 2026:</span> Công bố thời gian đăng ký thi đợt tháng 7 và tháng 12 tại Hà Nội, Đà Nẵng, Huế, TP.HCM | Nhật Bản mở rộng 16 ngành nghề Tokutei Ginou 2 | Ra mắt danh bạ trung tâm Nhật ngữ kiểm định chất lượng toàn quốc.
            </div>
          </div>
        </div>

        {/* ── 4. CATEGORY NAVIGATION BAR ── */}
        <div className="border-t border-slate-200/90 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar py-1">
            <div className="flex items-center gap-1 sm:gap-2">
              {categories.map((c) => {
                const isActive = selectedCategory === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      sounds.playFlip();
                      setSelectedCategory(c.id);
                      setSelectedArticle(null);
                    }}
                    className={`px-3 py-2 text-xs font-extrabold whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
                      isActive
                        ? 'text-rose-700 border-rose-700'
                        : 'text-slate-600 border-transparent hover:text-rose-600 hover:border-slate-300'
                    }`}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>

            {/* Quick Article Search Bar */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative my-1">
              <input
                type="text"
                placeholder="Tìm tin tức, kỳ thi, visa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1 rounded-full border border-slate-200 text-xs w-48 lg:w-60 focus:outline-none focus:ring-1 focus:ring-rose-500 bg-slate-50"
              />
              <Search size={13} className="absolute left-2.5 text-slate-400" />
            </form>
          </div>
        </div>
      </header>

      {/* ── 5. MAIN CONTENT CONTAINER ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* CASE A: READING SPECIFIC FULL ARTICLE */}
        {selectedArticle ? (
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Top Back and Navigation Bar */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <button
                type="button"
                onClick={handleBackToList}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                <ChevronLeft size={14} />
                <span>Quay lại trang tin</span>
              </button>

              <div className="flex items-center gap-2">
                {/* Audio Reader Button */}
                <button
                  type="button"
                  onClick={handleToggleArticleAudio}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
                    isPlayingAudio
                      ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-700'
                  }`}
                  title="Nghe giọng đọc bài báo song ngữ"
                >
                  {isPlayingAudio ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  <span>{isPlayingAudio ? 'Dừng đọc' : 'Nghe đọc bài báo'}</span>
                </button>

                {/* Bookmark Button */}
                <button
                  type="button"
                  onClick={() => toggleBookmark(selectedArticle.id)}
                  className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-pink-50 text-slate-600 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Lưu bài viết"
                >
                  <Bookmark
                    size={15}
                    className={bookmarkedIds.includes(selectedArticle.id) ? 'fill-rose-600 text-rose-600' : ''}
                  />
                </button>

                {/* Share Link */}
                <button
                  type="button"
                  onClick={copyArticleLink}
                  className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-pink-50 text-slate-600 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Sao chép liên kết bài viết"
                >
                  {copiedLink ? <Check size={15} className="text-emerald-600" /> : <Share2 size={15} />}
                </button>
              </div>
            </div>

            {/* Article Content Header */}
            <div>
              <div className="flex items-center gap-2 text-xs text-rose-700 font-extrabold uppercase tracking-wider mb-2">
                <span>{selectedArticle.category}</span>
                <span>|</span>
                <span className="text-slate-400 font-normal capitalize">
                  {selectedArticle.publishedAt}
                </span>
                <span>|</span>
                <span className="text-slate-400 font-normal">{selectedArticle.readTime}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight font-serif leading-snug mb-4">
                {selectedArticle.title}
              </h1>

              {/* Author & Stats Card */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200 mb-6 text-xs text-slate-600">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-sm">
                    {selectedArticle.author?.charAt(0) || 'B'}
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-900">{selectedArticle.author}</div>
                    <div className="text-[11px] text-slate-400">{selectedArticle.authorRole}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-400 text-xs">
                  <div className="flex items-center gap-1">
                    <Eye size={13} />
                    <span>{selectedArticle.views.toLocaleString()} lượt xem</span>
                  </div>
                </div>
              </div>

              {/* AI Article Summary Tool */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200/90 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-black text-rose-800 uppercase tracking-wider">
                    <Sparkles size={14} className="text-rose-600" />
                    <span>TÓM TẮT NHANH BỞI AI SENSEI</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateAiSummary}
                    disabled={loadingAiSummary}
                    className="text-[11px] font-extrabold text-rose-700 hover:text-rose-900 hover:underline cursor-pointer"
                  >
                    {loadingAiSummary ? 'Đang tóm tắt...' : 'Tóm tắt lại'}
                  </button>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed mb-0 font-medium">
                  {aiSummary || selectedArticle.summary}
                </p>
              </div>

              {/* Article Main Body */}
              <div className="prose max-w-none text-sm md:text-base leading-relaxed text-slate-700 space-y-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs">
                {selectedArticle.content.split('\n\n').map((para, idx) => (
                  <p key={idx} className="whitespace-pre-line leading-relaxed mb-4">
                    {para}
                  </p>
                ))}

                {/* QUẢNG CÁO WEB APP SỐ 3: IN-ARTICLE NATIVE AD CARD */}
                <div className="my-8 p-5 rounded-2xl bg-gradient-to-r from-rose-900 via-slate-900 to-pink-950 text-white flex flex-col sm:flex-row items-center justify-between gap-4 not-prose shadow-sm border border-rose-800/40">
                  <div className="space-y-1 text-center sm:text-left">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/30">
                      ĐỒNG HÀNH LUYỆN THI
                    </span>
                    <h3 className="text-base font-black text-white mb-0">
                      Luyện Tập Từ Vựng Bài Học Cùng WebApp HYPER JLPT
                    </h3>
                    <p className="text-xs text-pink-100/80 mb-0">
                      Áp dụng ngay kiến thức vừa đọc vào lật thẻ Flashcard 3D và trò chơi nối từ 60s!
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playFlip();
                      setActiveTab('lessons');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-black text-xs shrink-0 shadow-sm cursor-pointer transition-all hover:scale-105 active:scale-95"
                  >
                    Vào luyện bài học ngay
                  </button>
                </div>
              </div>

              {/* Tags List */}
              <div className="flex flex-wrap items-center gap-2 pt-4">
                <span className="text-xs font-bold text-slate-400">Từ khóa:</span>
                {selectedArticle.tags?.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Reader Comments Section */}
            <div className="pt-6 border-t border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare size={17} className="text-rose-600" />
                <h3 className="text-lg font-black text-slate-900 mb-0">
                  Bình Luận Độc Giả ({selectedArticle.comments?.length || 0})
                </h3>
              </div>

              {/* Comment Input Form */}
              <form onSubmit={handleCommentSubmit} className="p-4 rounded-2xl bg-white border border-slate-200 mb-6 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Họ và tên của bạn..."
                    value={commentAuthor}
                    onChange={(e) => setCommentAuthor(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500 bg-slate-50"
                  />
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="font-semibold">Đánh giá bài viết:</span>
                    <div className="flex items-center gap-1 text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setCommentRating(star)}
                          className="cursor-pointer"
                        >
                          <Star size={14} className={commentRating >= star ? 'fill-amber-400' : 'text-slate-300'} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <textarea
                  rows={3}
                  placeholder="Chia sẻ ý kiến hoặc thắc mắc của bạn về bài viết..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500 bg-slate-50"
                />

                <div className="flex items-center justify-between">
                  {commentSuccess ? (
                    <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 size={13} />
                      <span>Cảm ơn bạn đã đóng góp bình luận!</span>
                    </span>
                  ) : <span />}

                  <button
                    type="submit"
                    disabled={submittingComment || !commentText.trim()}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
                  >
                    <Send size={12} />
                    <span>Gửi bình luận</span>
                  </button>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-3">
                {selectedArticle.comments?.map((c) => (
                  <div key={c.id} className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-900">{c.author}</span>
                      <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: c.rating || 5 }).map((_, i) => (
                          <Star key={i} size={11} className="fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 leading-relaxed mb-0">{c.content}</p>
                    <div className="flex items-center justify-between text-[10.5px] text-slate-400 pt-1">
                      <span>{c.createdAt}</span>
                      <div className="flex items-center gap-1">
                        <ThumbsUp size={11} />
                        <span>{c.likes || 1} hữu ích</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : selectedCategory === 'centers' ? (
          /* CASE B: DEDICATED DIRECTORY OF JAPANESE LANGUAGE CENTERS */
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white relative overflow-hidden shadow-sm">
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold mb-2 border border-rose-400/30">
                  <Building size={13} />
                  <span>DANH BẠ TRUNG TÂM TIẾNG NHẬT TOÀN QUỐC</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
                  Tra Cứu Trung Tâm Tiếng Nhật Uy Tín & Kiểm Định Chất Lượng
                </h2>
                <p className="text-xs text-pink-100/80 mb-0 leading-relaxed">
                  Tổng hợp các cơ sở đào tạo tiếng Nhật chuẩn mực tại Đà Nẵng, Hà Nội, Quảng Nam, TP. Hồ Chí Minh và các tỉnh thành lớn. Đầy đủ thông tin học phí, thế mạnh và hotline liên hệ.
                </p>
              </div>
            </div>

            {/* City Selector Pills & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar py-0.5">
                {cities.map((city) => (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => {
                      sounds.playFlip();
                      setSelectedCity(city.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer border ${
                      selectedCity === city.id
                        ? 'bg-rose-700 text-white border-rose-700 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {city.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm theo tên hoặc địa chỉ..."
                  value={centerSearch}
                  onChange={(e) => setCenterSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500 bg-slate-50"
                />
              </div>
            </div>

            {/* Centers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {centers.map((c) => (
                <div
                  key={c.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-rose-300 hover:shadow-sm transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                            {c.city}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {c.badge}
                          </span>
                        </div>
                        <h3 className="text-base font-black text-slate-900 tracking-tight mb-0">
                          {c.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 text-amber-700 font-black text-xs shrink-0 border border-amber-200">
                        <Star size={12} className="fill-amber-400 text-amber-400" />
                        <span>{c.rating}</span>
                        <span className="text-[10px] text-amber-600/80 font-normal">({c.reviewsCount})</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed mb-0">
                      {c.description}
                    </p>

                    {/* Strengths */}
                    <div className="space-y-1">
                      <span className="text-[10.5px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        Thế mạnh đào tạo:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {c.strengths?.map((s, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold"
                          >
                            ✓ {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Address & Tuition */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                      <div className="flex items-start gap-1.5 text-slate-600">
                        <MapPin size={13} className="text-rose-600 shrink-0 mt-0.5" />
                        <span className="text-[11.5px] leading-snug">{c.address}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11.5px]">
                        <span className="text-slate-400">Học phí tham khảo:</span>
                        <span className="font-bold text-slate-800">{c.tuitionRange}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-3">
                    <button
                      type="button"
                      onClick={() => copyCenterPhone(c.phone, c.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      {copiedCenterPhone === c.id ? (
                        <>
                          <Check size={12} className="text-emerald-600" />
                          <span>Đã sao chép SĐT</span>
                        </>
                      ) : (
                        <>
                          <Phone size={12} className="text-slate-400" />
                          <span>{c.phone}</span>
                        </>
                      )}
                    </button>

                    <a
                      href={c.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors"
                    >
                      <span>Xem Website</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* QUẢNG CÁO WEB APP SỐ 4: COMBINED STUDY BANNER */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-pink-50 via-rose-50 to-purple-50 border border-pink-200/90 text-center space-y-3">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-600 text-white">
                BÍ QUYẾT THỦ KHOA
              </span>
              <h3 className="text-lg font-black text-slate-900 mb-0">
                Kết Hợp Học Tại Trung Tâm & Ôn Tập Hàng Ngày Trên WebApp HYPER JLPT
              </h3>
              <p className="text-xs text-slate-600 max-w-xl mx-auto leading-relaxed mb-0">
                Học ngữ pháp ở trung tâm, sau đó dùng Flashcard 3D và Trợ lý AI Sensei trên webapp để ôn tập từ vựng ngắt quãng (SRS) mỗi ngày 15 phút là công thức đỗ N5 - N1 nhanh nhất.
              </p>
              <button
                type="button"
                onClick={() => {
                  sounds.playFlip();
                  setActiveTab('lessons');
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                Vào học cùng WebApp miễn phí ngay
              </button>
            </div>
          </div>
        ) : (
          /* CASE C: STANDARD NEWSPAPER HOMEPAGE & EDITORIAL SPREAD */
          <div className="space-y-8">
            {/* 1. HERO TOP HEADLINE EDITORIAL GRID (12-COLUMNS) */}
            {featuredArticle && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-8 border-b border-slate-200">
                {/* Main Hero Story (7 cols) */}
                <div
                  onClick={() => handleOpenArticle(featuredArticle)}
                  className="lg:col-span-7 space-y-3 cursor-pointer group"
                >
                  <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs">
                    <img
                      src="https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80"
                      alt={featuredArticle.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white font-black text-[10px] uppercase tracking-wider shadow-sm">
                        TIÊU ĐIỂM
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white font-bold text-[10px]">
                        {featuredArticle.category}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight font-serif group-hover:text-rose-700 transition-colors leading-snug">
                      {featuredArticle.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2 line-clamp-3">
                      {featuredArticle.summary}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-400 font-medium pt-2">
                      <span>{featuredArticle.author}</span>
                      <span>|</span>
                      <span>{featuredArticle.readTime}</span>
                      <span>|</span>
                      <span>{featuredArticle.views.toLocaleString()} lượt xem</span>
                    </div>
                  </div>
                </div>

                {/* Sub-featured List (5 cols) */}
                <div className="lg:col-span-5 flex flex-col justify-between divide-y divide-slate-100">
                  {secondaryFeatured.map((art) => (
                    <div
                      key={art.id}
                      onClick={() => handleOpenArticle(art)}
                      className="py-3.5 first:pt-0 last:pb-0 space-y-1.5 cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 text-[10.5px] text-rose-700 font-black uppercase">
                        <span>{art.category}</span>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-400 font-normal">{art.readTime}</span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-rose-700 transition-colors line-clamp-2 leading-snug">
                        {art.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {art.summary}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* QUẢNG CÁO WEB APP SỐ 5: FULL-WIDTH MID-PAGE MAGAZINE SPREAD */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-rose-950 via-slate-900 to-pink-950 text-white relative overflow-hidden shadow-sm border border-rose-900/40">
              <div className="relative z-10 max-w-3xl space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-400/30">
                  <Sparkles size={13} />
                  <span>ỨNG DỤNG HỌC TIẾNG NHẬT THẾ HỆ MỚI</span>
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-snug">
                  Đỗ Kì Thi JLPT Điểm Tuyệt Đối Cùng HYPER Japanese WebApp
                </h2>
                <p className="text-xs sm:text-sm text-pink-100/80 leading-relaxed max-w-2xl">
                  Trọn bộ 25 bài học Minna no Nihongo, 1.500 từ vựng và Kanji N5 có giọng đọc bản xứ Tokyo chuẩn cao độ, Trợ lý AI Sensei giải thích ngữ pháp cá nhân hóa và Vườn Cây Bonsai rèn luyện chuỗi ngày học.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playFlip();
                      setActiveTab('lessons');
                    }}
                    className="px-5 py-2.5 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-black text-xs shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    Bắt đầu học ngay hôm nay
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playFlip();
                      setActiveTab('flashcard');
                    }}
                    className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
                  >
                    Lật thẻ Flashcard 3D
                  </button>
                </div>
              </div>
            </div>

            {/* 2. MAIN EDITORIAL BODY & SIDEBAR COLUMNS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Remaining Articles (8 cols) */}
              <div className="lg:col-span-8 space-y-6">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Newspaper size={17} className="text-rose-700" />
                    <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight mb-0">
                      TIN MỚI CẬP NHẬT
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    {remainingArticles.length} bài viết
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {remainingArticles.map((art) => (
                    <article
                      key={art.id}
                      onClick={() => handleOpenArticle(art)}
                      className="py-5 first:pt-0 space-y-2 cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 text-xs text-rose-700 font-extrabold uppercase">
                        <span>{art.category}</span>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-400 font-normal capitalize">
                          {art.publishedAt}
                        </span>
                      </div>
                      <h4 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-rose-700 transition-colors leading-snug">
                        {art.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed mb-0">
                        {art.summary}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                        <span>{art.author}</span>
                        <span>|</span>
                        <span>{art.readTime}</span>
                        <span>|</span>
                        <span>{art.views.toLocaleString()} lượt xem</span>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              {/* Right Column: Poll, Reviews, and Sticky Ad (4 cols) */}
              <div className="lg:col-span-4 space-y-6">
                {/* Interactive Reader Poll */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-black text-rose-700 uppercase tracking-wider">
                    <Award size={14} />
                    <span>KHẢO SÁT ĐỘC GIẢ</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-snug mb-0">
                    Mục tiêu chứng chỉ JLPT năm 2026 của bạn là cấp độ nào?
                  </h4>

                  <div className="space-y-2 pt-1">
                    {['N5', 'N4', 'N3', 'N2', 'N1'].map((level) => {
                      const count = voteStats[level] || 0;
                      const pct = Math.round((count / totalVotes) * 100);
                      return (
                        <div
                          key={level}
                          onClick={() => !hasVoted && setSelectedVote(level)}
                          className={`p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                            selectedVote === level
                              ? 'border-rose-500 bg-rose-50/60 font-bold text-rose-900'
                              : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span>JLPT {level}</span>
                            {hasVoted && <span className="font-extrabold">{pct}%</span>}
                          </div>
                          {hasVoted && (
                            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-rose-600 h-full rounded-full transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {!hasVoted ? (
                    <button
                      type="button"
                      onClick={handleVoteSubmit}
                      className="w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all cursor-pointer"
                    >
                      Bình chọn ngay
                    </button>
                  ) : (
                    <p className="text-[11px] text-emerald-600 font-bold text-center mb-0">
                      Cảm ơn bạn đã tham gia khảo sát độc giả!
                    </p>
                  )}
                </div>

                {/* QUẢNG CÁO WEB APP SỐ 6: STICKY SIDEBAR PROMO WIDGET */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-rose-950 text-white border border-rose-900/40 shadow-xs space-y-3">
                  <div className="flex items-center gap-2">
                    <img src="/hyper_logo.png" alt="HYPER" className="h-6 w-auto object-contain" />
                    <span className="text-[10px] font-black uppercase text-pink-300 tracking-wider">
                      ỨNG DỤNG BẢO TRỢ
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-white leading-snug mb-0">
                    Flashcard 3D & AI Sensei Giải Đề Trắc Nghiệm JLPT
                  </h4>
                  <p className="text-xs text-pink-100/80 leading-relaxed mb-0">
                    Học tiếng Nhật không còn nhàm chán với hệ thống âm thanh Tokyo sống động và trợ lý AI phân tích điểm yếu 24/7.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playFlip();
                      setActiveTab('home');
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-extrabold text-xs shadow-xs transition-all hover:scale-102 active:scale-98 cursor-pointer"
                  >
                    Vào phòng học ngay
                  </button>
                </div>

                {/* Recent Reviews Widget */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-black text-rose-700 uppercase tracking-wider">
                      <Star size={14} className="fill-rose-700 text-rose-700" />
                      <span>ĐÁNH GIÁ TỪ HỌC VIÊN</span>
                    </div>
                  </div>

                  <div className="space-y-3 divide-y divide-slate-100 text-xs">
                    {reviews.slice(0, 3).map((r) => (
                      <div key={r.id} className="pt-2.5 first:pt-0 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">{r.author}</span>
                          <div className="flex items-center gap-0.5 text-amber-400">
                            {Array.from({ length: r.rating || 5 }).map((_, i) => (
                              <Star key={i} size={10} className="fill-amber-400" />
                            ))}
                          </div>
                        </div>
                        <span className="text-[10px] text-rose-600 font-semibold block">{r.centerName}</span>
                        <p className="text-slate-600 leading-relaxed mb-0 line-clamp-2">{r.content}</p>
                      </div>
                    ))}
                  </div>

                  {/* Add review button or form */}
                  <form onSubmit={handleReviewSubmit} className="pt-2 space-y-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-700 block">Viết cảm nhận của bạn:</span>
                    <input
                      type="text"
                      placeholder="Tên của bạn..."
                      value={reviewAuthor}
                      onChange={(e) => setReviewAuthor(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500 bg-slate-50"
                    />
                    <textarea
                      rows={2}
                      placeholder="Cảm nhận về trải nghiệm học tập..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500 bg-slate-50"
                    />
                    <button
                      type="submit"
                      disabled={submittingReview || !reviewText.trim()}
                      className="w-full py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                    </button>
                    {reviewSuccess && (
                      <span className="text-[10.5px] text-emerald-600 font-bold block text-center">
                        Cảm ơn bạn đã gửi đánh giá!
                      </span>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── 6. NEWSPAPER FOOTER ── */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-12 py-10 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <h4 className="text-white font-black text-base font-serif">
              NHẬT BẢN <span className="text-rose-500">24H</span>
            </h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Cổng thông tin báo chí điện tử chuyên sâu về ngôn ngữ, văn hóa, khảo thí chứng chỉ JLPT và cơ hội việc làm tại Nhật Bản.
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="text-white font-extrabold text-xs uppercase tracking-wider">CHUYÊN MỤC CHÍNH</h5>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('Kỳ thi & Lịch thi');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Lịch thi JLPT & NAT-TEST 2026
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('centers');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Danh bạ Trung tâm Nhật ngữ uy tín
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('Du học & Việc làm');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Chính sách Visa Tokutei Ginou mới
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h5 className="text-white font-extrabold text-xs uppercase tracking-wider">ĐƠN VỊ BẢO TRỢ</h5>
            <div className="space-y-2">
              <p className="text-xs text-slate-400 mb-0">
                Nền tảng Học Tiếng Nhật HYPER Japanese NihongoHub Platform.
              </p>
              <button
                type="button"
                onClick={() => {
                  sounds.playFlip();
                  setActiveTab('home');
                }}
                className="inline-flex items-center gap-1.5 text-rose-400 hover:text-rose-300 font-bold hover:underline cursor-pointer"
              >
                <span>Vào Web App học tập</span>
                <ExternalLink size={12} />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <h5 className="text-white font-extrabold text-xs uppercase tracking-wider">LIÊN HỆ QUẢNG CÁO</h5>
            <p className="text-xs text-slate-400 leading-relaxed mb-0">
              Hotline: 0345698251<br />
              Email: thuatnguyen1204@gmail.com<br />
              Địa chỉ: Việt Nam - Nhật Bản
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 mt-8 border-t border-slate-800 text-center text-[11px] text-slate-500">
          © 2026 Nhật Bản 24h. Bảo lưu mọi quyền. Phát triển bởi HYPER NihongoHub.
        </div>
      </footer>
    </div>
  );
}
