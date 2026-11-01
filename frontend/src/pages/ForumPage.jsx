import React, { useState, useEffect, useMemo } from 'react';
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
  Zap,
  RotateCw,
  X,
  Network,
  FolderTree,
  ChevronDown,
  Compass,
  Radio,
  ArrowUpRight
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
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshedTime, setLastRefreshedTime] = useState('Vừa xong');

  // Auto Crawl & Continuous Ingestion state
  const [isCrawling, setIsCrawling] = useState(false);
  const [crawlToast, setCrawlToast] = useState(null);
  const [crawlerStatus, setCrawlerStatus] = useState({
    totalArticles: 95,
    activeSources: 15,
    lastUpdated: 'Vừa xong'
  });

  // Pagination state (Báo Mới list browsing)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Centers directory state
  const [selectedCity, setSelectedCity] = useState('all');
  const [centerSearch, setCenterSearch] = useState('');
  const [copiedCenterPhone, setCopiedCenterPhone] = useState(null);

  // Poll Survey State
  const [selectedVote, setSelectedVote] = useState('N3');
  const [hasVoted, setHasVoted] = useState(false);
  const [voteStats, setVoteStats] = useState({
    N5: 38,
    N4: 31,
    N3: 24,
    N2: 12,
    N1: 5
  });

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
  const [commentAuthor, setCommentAuthor] = useState(user?.username || '');
  const [commentText, setCommentText] = useState('');
  const [commentRating, setCommentRating] = useState(5);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState(false);

  // Review state
  const [reviewAuthor, setReviewAuthor] = useState(user?.username || '');
  const [reviewCenter, setReviewCenter] = useState('Khóa học tiếng Nhật N5 - HYPER');
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // AI Summary state
  const [aiSummary, setAiSummary] = useState(null);
  const [loadingAiSummary, setLoadingAiSummary] = useState(false);

  // Rotating Editorial Sponsor Ads state
  const [activeLeaderAdIndex, setActiveLeaderAdIndex] = useState(0);
  const [floatingAdDismissed, setFloatingAdDismissed] = useState(false);

  // High-End Editorial Ad Creatives (VnExpress & Báo Mới Standard)
  const webappAds = [
    {
      id: 'ad_starter',
      sponsorName: 'TÀI TRỢ CHUYÊN MÔN',
      title: 'Học Tiếng Nhật Cùng Trợ Lý AI Sensei & Flashcard 3D',
      desc: 'Nền tảng học thông minh HYPER JLPT với 1.500 từ vựng N5, âm thanh bản xứ Tokyo chuẩn cao độ và thuật toán Vườn Cây Bonsai ghi nhớ ngắt quãng.',
      buttonText: 'Vào học ngay (Miễn phí 100%)',
      badge: 'Miễn phí 100%',
      targetTab: 'lessons',
      image: '/hyper_logo.png'
    },
    {
      id: 'ad_flashcard',
      sponsorName: 'CÔNG NGHỆ HỌC TẬP',
      title: 'Flashcard 3D Lật Thẻ Đa Chiều Chuẩn Phát Âm Tokyo',
      desc: 'Ghi nhớ chữ Hán Kanji và từ vựng nhanh gấp 3 lần nhờ hiệu ứng lật thẻ thị giác, tự động phân tích nghĩa và phát âm giọng bản xứ.',
      buttonText: 'Trải nghiệm Flashcard 3D',
      badge: 'Phương pháp mới',
      targetTab: 'flashcard',
      image: '/hyper_logo.png'
    },
    {
      id: 'ad_quiz',
      sponsorName: 'KHẢO THÍ JLPT',
      title: 'Bộ Đề Thi Thử Trắc Nghiệm JLPT N5 Bấm Giờ 2026',
      desc: 'Chấm điểm tức thì, áp lực đồng hồ đếm ngược phòng thi thực tế và AI Sensei phân tích nguyên nhân từng câu trả lời sai.',
      buttonText: 'Làm đề thi thử ngay',
      badge: 'Bám sát đề thi thật',
      targetTab: 'quiz',
      image: '/hyper_logo.png'
    },
    {
      id: 'ad_typing',
      sponsorName: 'KỸ NĂNG VĂN PHÒNG',
      title: 'Luyện Gõ Phím Romaji - Hiragana Chuẩn Công Sở Nhật Bản',
      desc: 'Rèn luyện phản xạ gõ phím máy tính nhanh chóng để soạn thảo email, văn bản và báo cáo kinh doanh thực chiến cho kỹ sư và du học sinh.',
      buttonText: 'Luyện gõ phím ngay',
      badge: 'Thực chiến công việc',
      targetTab: 'practice',
      image: '/hyper_logo.png'
    },
    {
      id: 'ad_bonsai',
      sponsorName: 'KHOA HỌC TRÍ NHỚ',
      title: 'Vườn Cây Bonsai Tri Thức: Nhớ Từ Vựng Không Bao Giờ Quên',
      desc: 'Mô phỏng đường cong lãng quên Ebbinghaus, nhắc nhở tưới nước ôn tập đúng thời điểm vàng để từ vựng in sâu vào tiềm thức vĩnh viễn.',
      buttonText: 'Chăm sóc Bonsai',
      badge: 'Thuật toán SRS',
      targetTab: 'garden',
      image: '/hyper_logo.png'
    }
  ];

  const categories = [
    { id: 'all', label: 'Báo Mới Hôm Nay' },
    { id: 'hot', label: 'Tin Nóng 24H' },
    { id: 'Kỳ thi JLPT', label: 'Kỳ thi JLPT' },
    { id: 'Trung tâm Nhật ngữ', label: 'Trung tâm Nhật ngữ' },
    { id: 'Chính sách Visa', label: 'Chính sách Visa & Việc làm' },
    { id: 'Du học & Học bổng', label: 'Du học & Học bổng' },
    { id: 'Phương pháp học', label: 'Phương pháp học' },
    { id: 'Văn hóa Nhật', label: 'Văn hóa & Đời sống' },
    { id: 'centers', label: 'Tra cứu Trung tâm' },
    { id: 'sitemap_explorer', label: 'Sơ đồ liên kết' }
  ];

  const cities = [
    { id: 'all', label: 'Toàn quốc' },
    { id: 'Đà Nẵng', label: 'Đà Nẵng' },
    { id: 'Hà Nội', label: 'Hà Nội' },
    { id: 'Quảng Nam', label: 'Quảng Nam' },
    { id: 'TP. Hồ Chí Minh', label: 'TP. Hồ Chí Minh' },
    { id: 'Các tỉnh khác', label: 'Các tỉnh khác' }
  ];

  const todayNewsDate = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Rotate sponsored leader ads every 8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveLeaderAdIndex((prev) => (prev + 1) % webappAds.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [webappAds.length]);

  // Live status update & news polling every 45s
  useEffect(() => {
    fetchCrawlerStatus();
    const interval = setInterval(() => {
      fetchArticles(false);
      fetchCrawlerStatus();
      setLastRefreshedTime('Vừa cập nhật 1 phút trước');
    }, 45000);
    return () => clearInterval(interval);
  }, [selectedCategory]);

  const fetchCrawlerStatus = async () => {
    try {
      const res = await forumService.getStatus();
      if (res.data?.success) {
        setCrawlerStatus(res.data);
      }
    } catch {
      // Keep existing status
    }
  };

  const fetchArticles = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setRefreshing(true);
    try {
      const isHotOnly = selectedCategory === 'hot';
      const categoryParam =
        selectedCategory === 'all' || selectedCategory === 'hot' || selectedCategory === 'centers' || selectedCategory === 'sitemap_explorer'
          ? undefined
          : selectedCategory;

      const res = await forumService.getArticles({
        category: categoryParam,
        search: searchQuery || undefined,
        sort: isHotOnly ? 'hot' : 'newest',
        all: 'true'
      });
      setArticles(res.data?.data || []);
      setLastRefreshedTime('Vừa xong');
    } catch (err) {
      console.error('Fetch articles error:', err);
    } finally {
      if (showLoading) setLoading(false);
      setRefreshing(false);
    }
  };

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
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    fetchCenters();
  }, [selectedCity, centerSearch]);

  useEffect(() => {
    fetchReviews();
  }, []);

  // Trigger continuous auto-crawling
  const handleTriggerAutoCrawl = async () => {
    setIsCrawling(true);
    try {
      sounds.playSuccess();
      const res = await forumService.crawlNews(3);
      if (res.data?.success) {
        confetti({ particleCount: 40, spread: 70, origin: { y: 0.15 } });
        setCrawlToast(res.data.message);
        if (res.data.data?.length) {
          setArticles((prev) => [...res.data.data, ...prev]);
        }
        fetchCrawlerStatus();
        setTimeout(() => setCrawlToast(null), 5000);
      }
    } catch (err) {
      console.error('Auto crawl error:', err);
    } finally {
      setIsCrawling(false);
    }
  };

  // Article selection & reader actions
  const handleOpenArticle = (art) => {
    sounds.playSelect();
    setSelectedArticle(art);
    setAiSummary(null);
    setIsPlayingAudio(false);
    stopSpeaking();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    sounds.playFlip();
    setSelectedArticle(null);
    setIsPlayingAudio(false);
    stopSpeaking();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Audio Speech Reader
  const handleToggleAudio = () => {
    if (!selectedArticle) return;
    if (isPlayingAudio) {
      stopSpeaking();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      const textToRead = selectedArticle.title + '. ' + selectedArticle.summary + '. ' + selectedArticle.content;
      speakBilingualText(
        textToRead,
        'vi-VN',
        () => setIsPlayingAudio(false),
        () => setIsPlayingAudio(false)
      );
    }
  };

  // Bookmark Toggle
  const handleToggleBookmark = (id, e) => {
    e?.stopPropagation();
    sounds.playSelect();
    setBookmarkedIds((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((item) => item !== id) : [...prev, id];
      localStorage.setItem('nihongo_bookmarked_news', JSON.stringify(next));
      return next;
    });
  };

  // Copy Article Link
  const handleCopyArticleLink = () => {
    sounds.playSuccess();
    const url = window.location.origin + '/forum/' + (selectedArticle?.slug || selectedArticle?.id);
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // AI Summary Generation
  const handleGenerateAiSummary = async () => {
    if (!selectedArticle) return;
    setLoadingAiSummary(true);
    try {
      sounds.playFlip();
      const prompt =
        'Bạn là Thư ký Báo chí cấp cao của Báo Mới Nhật Ngữ. Hãy tóm tắt bài viết sau thành 3 ý chính then chốt ngắn gọn, chuẩn xác, mang tính thời sự cao nhất:\\n\\nTiêu đề: ' +
        selectedArticle.title +
        '\\n\\nNội dung: ' +
        selectedArticle.content;
      const response = await askAi(prompt);
      setAiSummary(response);
    } catch {
      setAiSummary('Không thể tạo tóm tắt lúc này. Vui lòng thử lại sau.');
    } finally {
      setLoadingAiSummary(false);
    }
  };

  // Handle Comment Submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedArticle) return;
    setSubmittingComment(true);
    try {
      sounds.playSuccess();
      const res = await forumService.addComment(selectedArticle.id, {
        author: commentAuthor,
        content: commentText,
        rating: commentRating
      });
      if (res.data?.success) {
        setSelectedArticle((prev) => ({
          ...prev,
          comments: [res.data.data, ...(prev.comments || [])]
        }));
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

  // Vote in Poll
  const handleVotePoll = (level) => {
    if (hasVoted) return;
    sounds.playSuccess();
    setSelectedVote(level);
    setHasVoted(true);
    setVoteStats((prev) => ({
      ...prev,
      [level]: (prev[level] || 0) + 1
    }));
    confetti({ particleCount: 25, spread: 50, origin: { y: 0.8 } });
  };

  // Copy Center Phone
  const handleCopyPhone = (phone, id, e) => {
    e.stopPropagation();
    sounds.playSuccess();
    navigator.clipboard.writeText(phone);
    setCopiedCenterPhone(id);
    setTimeout(() => setCopiedCenterPhone(null), 2000);
  };

  // Filtered Articles & Spotlight Hierarchy
  const filteredArticles = useMemo(() => {
    return articles;
  }, [articles]);

  const featuredArticle = filteredArticles[0] || null;
  const secondaryFeatured = filteredArticles.slice(1, 3);
  const remainingArticles = filteredArticles.slice(3);

  // Pagination for remaining stream articles
  const totalPages = Math.ceil(remainingArticles.length / itemsPerPage);
  const paginatedArticles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return remainingArticles.slice(start, start + itemsPerPage);
  }, [remainingArticles, currentPage, itemsPerPage]);

  const currentLeaderAd = webappAds[activeLeaderAdIndex];

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-800 font-sans selection:bg-rose-100 selection:text-rose-900 pb-20">
      {/* ── 1. TOAST NOTIFICATION: AUTO-CRAWLER RESULT ── */}
      {crawlToast && (
        <div className="fixed top-4 right-4 z-50 max-w-md p-4 rounded-2xl bg-white border border-emerald-300 shadow-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 size={18} />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-slate-900 mb-0">Hệ Thống Báo Mới Tự Động</p>
            <p className="text-xs text-slate-600 mb-0 leading-relaxed">{crawlToast}</p>
          </div>
        </div>
      )}

      {/* ── 2. TOP MASTHEAD & EDITORIAL STATUS BAR (BAOMOI / VNEXPRESS) ── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        {/* Top Mini Ticker Bar */}
        <div className="border-b border-slate-100 py-1.5 px-4 sm:px-6 text-[11px] text-slate-500 bg-slate-50/70">
          <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-700 capitalize">{todayNewsDate}</span>
              <span className="hidden sm:inline text-slate-300">|</span>
              <span className="hidden sm:flex items-center gap-1 font-medium text-slate-600">
                <Sun size={12} className="text-amber-500" />
                <span>Tokyo 18°C</span>
              </span>
              <span className="hidden sm:inline text-slate-300">|</span>
              <span className="hidden md:flex items-center gap-1 font-medium text-slate-600">
                <DollarSign size={12} className="text-emerald-600" />
                <span>1 JPY = 168.50 VND</span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Live Crawler Status Indicator */}
              <div className="flex items-center gap-1.5 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>{crawlerStatus.totalArticles || articles.length} Bài Viết Chính Thống</span>
              </div>

              {/* Trigger Continuous Ingestion Button */}
              <button
                type="button"
                onClick={handleTriggerAutoCrawl}
                disabled={isCrawling}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-[10.5px] font-black cursor-pointer transition-all disabled:opacity-50"
                title="Hệ thống tự động tìm kiếm, tra cứu và nạp bài viết mới nhất"
              >
                <RotateCw size={11} className={isCrawling ? 'animate-spin text-rose-600' : 'text-rose-600'} />
                <span>{isCrawling ? 'Đang quét tin...' : 'Tự động quét tin mới'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Logo & Ecosystem Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div
              onClick={() => {
                setSelectedCategory('all');
                setSelectedArticle(null);
              }}
              className="cursor-pointer group flex items-center gap-2.5"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-serif font-black text-xl tracking-tight shadow-xs">
                H
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-serif mb-0 leading-none group-hover:text-rose-700 transition-colors">
                  BÁO MỚI NHẬT NGỮ
                </h1>
                <p className="text-[10px] text-slate-500 font-semibold tracking-wide uppercase mt-0.5 mb-0">
                  Cổng Thông Tin Báo Chí & Năng Lực Tiếng Nhật Toàn Diện
                </p>
              </div>
            </div>
          </div>

          {/* Quick Ecosystem WebApp Link Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                sounds.playFlip();
                setActiveTab('lessons');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-black shadow-xs transition-all cursor-pointer"
            >
              <Sparkles size={13} className="text-rose-200" />
              <span className="hidden sm:inline">Vào Học Ngay Trên WebApp</span>
              <span className="sm:hidden">Học WebApp</span>
            </button>
          </div>
        </div>

        {/* Categories Sticky Navigation Bar */}
        <div className="border-t border-slate-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-1">
            <nav className="flex items-center space-x-1 shrink-0">
              {categories.map((c) => {
                const isActive = selectedCategory === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      sounds.playSelect();
                      setSelectedCategory(c.id);
                      setSelectedArticle(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-rose-50 text-rose-800 font-black border border-rose-200/90 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {c.id === 'hot' && <Flame size={13} className="text-rose-600" />}
                    {c.id === 'centers' && <Building size={13} className="text-emerald-600" />}
                    {c.id === 'sitemap_explorer' && <Network size={13} className="text-rose-600" />}
                    <span>{c.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Quick Search Input */}
            <div className="relative shrink-0 max-w-[200px] hidden md:block">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm tin tức, kỳ thi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-7 pr-3 py-1 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>
          </div>
        </div>
      </header>

      {/* ── 3. ROTATING EDITORIAL LEADERBOARD SPONSOR AD (CLEAN & PRESTIGE) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
              <img src="/hyper_logo.png" alt="HYPER" className="h-6 w-auto object-contain" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  {currentLeaderAd.sponsorName}
                </span>
                <span className="text-[10px] font-bold text-rose-700">{currentLeaderAd.badge}</span>
              </div>
              <p className="text-xs font-bold text-slate-900 mb-0 leading-tight">
                {currentLeaderAd.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
            <span className="text-[11px] text-slate-500 hidden lg:inline max-w-sm truncate">
              {currentLeaderAd.desc}
            </span>
            <button
              type="button"
              onClick={() => {
                sounds.playFlip();
                setActiveTab(currentLeaderAd.targetTab);
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-black shadow-xs transition-all cursor-pointer shrink-0"
            >
              {currentLeaderAd.buttonText}
            </button>
          </div>
        </div>
      </div>

      {/* ── 4. MAIN EDITORIAL CONTENT CONTAINER ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* CASE A: READING SPECIFIC FULL ARTICLE */}
        {selectedArticle ? (
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Interactive Breadcrumbs (SƠ ĐỒ LIÊN KẾT ĐẦU BÀI BÁO) */}
            <div className="flex items-center flex-wrap gap-1.5 text-xs text-slate-500 pb-2 border-b border-slate-100">
              <button
                type="button"
                onClick={handleBackToList}
                className="hover:text-rose-700 font-semibold cursor-pointer"
              >
                Trang chủ Báo chí
              </button>
              <span>/</span>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory(selectedArticle.category);
                  setSelectedArticle(null);
                }}
                className="hover:text-rose-700 font-semibold cursor-pointer"
              >
                {selectedArticle.category}
              </button>
              <span>/</span>
              <span className="text-slate-900 font-bold truncate max-w-md">
                {selectedArticle.title}
              </span>
            </div>

            {/* Top Navigation & Tool Controls */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <button
                type="button"
                onClick={handleBackToList}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                <ChevronLeft size={14} />
                <span>Quay lại luồng tin</span>
              </button>

              <div className="flex items-center gap-2">
                {/* Font Size Selector (Aa-, Aa+) */}
                <div className="flex items-center rounded-xl border border-slate-200 bg-white p-0.5 text-xs font-bold text-slate-600">
                  <button
                    type="button"
                    onClick={() => setReaderFontSize('sm')}
                    className={'px-2 py-1 rounded-lg cursor-pointer ' + (readerFontSize === 'sm' ? 'bg-slate-100 text-slate-900' : '')}
                    title="Cỡ chữ nhỏ"
                  >
                    Aa-
                  </button>
                  <button
                    type="button"
                    onClick={() => setReaderFontSize('base')}
                    className={'px-2 py-1 rounded-lg cursor-pointer ' + (readerFontSize === 'base' ? 'bg-slate-100 text-slate-900' : '')}
                    title="Cỡ chữ chuẩn"
                  >
                    Aa
                  </button>
                  <button
                    type="button"
                    onClick={() => setReaderFontSize('lg')}
                    className={'px-2 py-1 rounded-lg cursor-pointer ' + (readerFontSize === 'lg' ? 'bg-slate-100 text-slate-900' : '')}
                    title="Cỡ chữ lớn"
                  >
                    Aa+
                  </button>
                </div>

                {/* Audio Speech Reader Button */}
                <button
                  type="button"
                  onClick={handleToggleAudio}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    isPlayingAudio
                      ? 'bg-rose-50 text-rose-800 border-rose-300 animate-pulse'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                  title={isPlayingAudio ? 'Dừng đọc bài báo' : 'Nghe đọc bài báo song ngữ'}
                >
                  {isPlayingAudio ? <VolumeX size={14} className="text-rose-600" /> : <Volume2 size={14} />}
                  <span>{isPlayingAudio ? 'Đang đọc...' : 'Nghe đọc'}</span>
                </button>

                {/* Bookmark Button */}
                <button
                  type="button"
                  onClick={(e) => handleToggleBookmark(selectedArticle.id, e)}
                  className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                    bookmarkedIds.includes(selectedArticle.id)
                      ? 'bg-rose-50 text-rose-700 border-rose-300'
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                  }`}
                  title="Lưu bài viết"
                >
                  <Bookmark size={14} className={bookmarkedIds.includes(selectedArticle.id) ? 'fill-rose-600' : ''} />
                </button>

                {/* Copy Link Button */}
                <button
                  type="button"
                  onClick={handleCopyArticleLink}
                  className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 transition-all cursor-pointer"
                  title="Sao chép liên kết bài viết"
                >
                  {copiedLink ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            {/* Article Headline & Metadata */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-rose-700">
                <span>{selectedArticle.category}</span>
                <span className="text-slate-300">/</span>
                <span className="text-slate-400 font-medium capitalize">
                  {selectedArticle.publishedAt} ({selectedArticle.publishedTime || 'Vừa xong'})
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black text-slate-900 tracking-tight leading-snug">
                {selectedArticle.title}
              </h1>

              {/* Author & Official Source Credit */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700">
                    <User size={15} />
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900 block">{selectedArticle.author}</span>
                    <span className="text-slate-500 text-[11px] block">{selectedArticle.authorRole || 'Nhà báo chuyên đề'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-500">
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <ShieldCheck size={13} className="text-rose-600" />
                    <span>Nguồn: {selectedArticle.sourceName}</span>
                  </span>
                  {selectedArticle.sourceUrl && (
                    <a
                      href={selectedArticle.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-rose-700 hover:text-rose-800 font-bold flex items-center gap-0.5"
                      title="Mở liên kết nguồn chính thống"
                    >
                      <ExternalLink size={12} />
                    </a>
                  )}
                  <span>/</span>
                  <span className="flex items-center gap-1">
                    <Eye size={13} />
                    <span>{selectedArticle.views.toLocaleString()}</span>
                  </span>
                </div>
              </div>

              {/* Lead Summary */}
              <p className="text-base sm:text-lg font-serif font-medium text-slate-700 leading-relaxed border-l-4 border-rose-600 pl-4 py-1 italic bg-rose-50/20 rounded-r-xl">
                {selectedArticle.summary}
              </p>

              {/* High-Resolution Hero Image with Caption */}
              <div className="space-y-2">
                <div className="rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs">
                  <img
                    src={selectedArticle.imageUrl || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80'}
                    alt={selectedArticle.imageAlt || selectedArticle.title}
                    className="w-full h-auto max-h-[480px] object-cover"
                  />
                </div>
                <p className="text-[11.5px] text-slate-500 text-center italic mb-0">
                  {selectedArticle.imageCaption || ('Ảnh tư liệu kiểm chứng: ' + selectedArticle.title)}
                </p>
              </div>

              {/* AI Summary Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/50 border border-rose-200/90 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black text-rose-800 uppercase tracking-wider">
                    <Sparkles size={14} className="text-rose-600" />
                    <span>TÓM TẮT BỞI AI SENSEI</span>
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

              {/* Article Main Body with Custom Font Size */}
              <div
                className={`prose max-w-none leading-relaxed text-slate-700 space-y-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs ${
                  readerFontSize === 'sm'
                    ? 'text-sm'
                    : readerFontSize === 'lg'
                    ? 'text-lg leading-loose'
                    : 'text-base leading-relaxed'
                }`}
              >
                {selectedArticle.content.split('\\n\\n').map((para, idx) => (
                  <p key={idx} className="whitespace-pre-line leading-relaxed mb-4">
                    {para}
                  </p>
                ))}

                {/* QUẢNG CÁO WEB APP SỐ 2: EDITORIAL SPONSOR BOX IN ARTICLE */}
                <div className="my-8 p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 not-prose">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 p-1 border border-slate-200 flex items-center justify-center shrink-0">
                      <img src="/hyper_logo.png" alt="HYPER" className="h-8 w-auto object-contain" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9.5px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          TÀI TRỢ BỞI HYPER JAPANESE
                        </span>
                        <span className="text-[10px] font-bold text-rose-700">Miễn phí 100%</span>
                      </div>
                      <h4 className="text-sm font-black text-slate-900 mb-0">
                        Thực Hành Từ Vựng & Làm Đề Thi Thử Trên WebApp HYPER
                      </h4>
                      <p className="text-xs text-slate-500 mb-0">
                        Áp dụng ngay kiến thức vừa đọc vào lật thẻ Flashcard 3D và làm bài trắc nghiệm bấm giờ!
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playFlip();
                      setActiveTab('lessons');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-black text-xs shrink-0 shadow-xs cursor-pointer transition-all"
                  >
                    Vào luyện bài học ngay
                  </button>
                </div>
              </div>

              {/* Tags */}
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

            {/* SƠ ĐỒ LIÊN KẾT BÀI VIẾT & HỆ THỐNG PHÂN TẦNG NỘI DUNG */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Network size={16} className="text-rose-700" />
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider mb-0">
                    Sơ Đồ Phân Tầng Liên Kết Bài Viết (Content Hierarchy Graph)
                  </h4>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                  Chuẩn Cấu Trúc SEO Google
                </span>
              </div>

              {/* Diagram Hierarchy */}
              <div className="space-y-3 pt-1">
                {/* Node Level 1: Root */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleBackToList}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-black shadow-xs transition-all cursor-pointer"
                  >
                    <Globe size={13} className="text-rose-400" />
                    <span>Gốc: Trang Chủ Báo Chí HYPER</span>
                  </button>
                  <span className="text-slate-300 font-bold">/</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory(selectedArticle.category);
                      setSelectedArticle(null);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold transition-all cursor-pointer"
                  >
                    <FolderTree size={13} className="text-rose-600" />
                    <span>Chuyên mục: {selectedArticle.category}</span>
                  </button>
                </div>

                {/* Node Level 2: Active Article */}
                <div className="ml-3 sm:ml-5 pl-3 sm:pl-4 border-l-2 border-rose-200 space-y-3">
                  <div className="p-3.5 bg-rose-50/50 rounded-xl border border-rose-200/80">
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-rose-700 mb-1">
                      <BookOpen size={12} />
                      <span>Bài viết bạn đang xem</span>
                    </div>
                    <p className="text-xs sm:text-sm font-extrabold text-slate-900 mb-0 leading-snug">
                      {selectedArticle.title}
                    </p>
                  </div>

                  {/* Node Level 3: Extended Branches */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    {/* Branch A: Related Articles */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center gap-1.5 text-[10.5px] font-black text-slate-700 uppercase">
                        <Newspaper size={12} className="text-blue-600" />
                        <span>Bài viết cùng chuyên mục</span>
                      </div>
                      <div className="space-y-1.5">
                        {articles
                          .filter((a) => a.id !== selectedArticle.id)
                          .slice(0, 2)
                          .map((rel) => (
                            <button
                              key={rel.id}
                              type="button"
                              onClick={() => {
                                handleOpenArticle(rel);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="w-full text-left p-1.5 rounded-lg bg-white hover:bg-rose-50 text-[11px] font-medium text-slate-700 hover:text-rose-700 border border-slate-200 line-clamp-1 cursor-pointer transition-all"
                              title={rel.title}
                            >
                              {rel.title}
                            </button>
                          ))}
                      </div>
                    </div>

                    {/* Branch B: Centers Directory */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center gap-1.5 text-[10.5px] font-black text-slate-700 uppercase">
                        <Building size={12} className="text-emerald-600" />
                        <span>Tra cứu trung tâm tiếng Nhật</span>
                      </div>
                      <div className="space-y-1.5">
                        {['Đà Nẵng', 'Hà Nội', 'TP. Hồ Chí Minh'].map((city) => (
                          <button
                            key={city}
                            type="button"
                            onClick={() => {
                              setSelectedCategory('centers');
                              setSelectedCity(city);
                              setSelectedArticle(null);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="w-full text-left p-1.5 rounded-lg bg-white hover:bg-emerald-50 text-[11px] font-medium text-slate-700 hover:text-emerald-800 border border-slate-200 flex items-center justify-between cursor-pointer transition-all"
                          >
                            <span>Tại {city}</span>
                            <ChevronRight size={12} className="text-slate-400" />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Branch C: WebApp Learning Tools */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center gap-1.5 text-[10.5px] font-black text-slate-700 uppercase">
                        <Zap size={12} className="text-amber-600" />
                        <span>Liên kết WebApp HYPER</span>
                      </div>
                      <div className="space-y-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            sounds.playFlip();
                            setActiveTab('flashcard');
                          }}
                          className="w-full text-left p-1.5 rounded-lg bg-white hover:bg-amber-50 text-[11px] font-medium text-slate-700 hover:text-amber-800 border border-slate-200 flex items-center justify-between cursor-pointer transition-all"
                        >
                          <span>Lật thẻ Flashcard 3D</span>
                          <Award size={12} className="text-amber-500" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            sounds.playFlip();
                            setActiveTab('practice');
                          }}
                          className="w-full text-left p-1.5 rounded-lg bg-white hover:bg-amber-50 text-[11px] font-medium text-slate-700 hover:text-amber-800 border border-slate-200 flex items-center justify-between cursor-pointer transition-all"
                        >
                          <span>Luyện đề thi thử JLPT</span>
                          <CheckCircle2 size={12} className="text-emerald-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reader Comments Section */}
            <div className="pt-6 border-t border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare size={17} className="text-rose-600" />
                <h3 className="text-lg font-black text-slate-900 mb-0">
                  Bình Luận Bạn Đọc ({selectedArticle.comments?.length || 0})
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
                    <span>{submittingComment ? 'Đang gửi...' : 'Gửi bình luận'}</span>
                  </button>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-3">
                {selectedArticle.comments?.map((c) => (
                  <div key={c.id} className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{c.author}</span>
                      <div className="flex items-center gap-1 text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={11} className={c.rating >= s ? 'fill-amber-400' : 'text-slate-200'} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 mb-0">{c.content}</p>
                    <span className="text-[10px] text-slate-400 block pt-1">{c.createdAt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : selectedCategory === 'sitemap_explorer' ? (
          /* CASE B: INTERACTIVE SƠ ĐỒ LIÊN KẾT HỆ THỐNG TOÀN DIỆN */
          <div className="space-y-8 max-w-5xl mx-auto">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-black">
                <Network size={14} className="text-rose-600" />
                <span>SƠ ĐỒ LIÊN KẾT BÁO CHÍ & TRA CỨU</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">
                Mạng Lưới Sơ Đồ Liên Kết Toàn Bộ Nội Dung Hệ Thống
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Cấu trúc phân tầng liên kết chuẩn SEO giúp người đọc và công cụ tìm kiếm Google dễ dàng tiếp cận mọi bài viết, kỳ thi, danh bạ trung tâm và ứng dụng học tập.
              </p>
            </div>

            {/* Tree Nodes Map */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Branch 1: JLPT Exams & Schedules */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-rose-700 font-black text-sm uppercase">
                  <Award size={18} />
                  <span>KỲ THI JLPT & LỊCH THI</span>
                </div>
                <div className="space-y-2">
                  {[
                    'Lịch thi JLPT 2026 đợt 1 và đợt 2',
                    'Thủ tục đăng ký hồ sơ online không qua trung gian',
                    'Thang điểm chuẩn hóa IRT và cách tính điểm liệt',
                    'Chiến thuật thi nghe Choukai N5 - N1',
                    'Quy định vật dụng phòng thi và nhận chứng chỉ'
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedCategory('Kỳ thi JLPT');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-rose-50 text-xs font-semibold text-slate-700 hover:text-rose-800 transition-all flex items-center justify-between border border-transparent hover:border-rose-200 cursor-pointer"
                    >
                      <span className="truncate pr-2">{item}</span>
                      <ChevronRight size={13} className="text-slate-400 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Branch 2: Japanese Language Centers by Province */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-emerald-700 font-black text-sm uppercase">
                  <Building size={18} />
                  <span>TRA CỨU TRUNG TÂM THEO TỈNH</span>
                </div>
                <div className="space-y-2">
                  {[
                    'Trung tâm tiếng Nhật tại Đà Nẵng (Đông Du, Sakura, Jellyfish)',
                    'Trung tâm tiếng Nhật tại Hà Nội (Riki, Mina, Dungmori)',
                    'Trung tâm tiếng Nhật tại TP. Hồ Chí Minh (Đông Du, Sakae)',
                    'Trung tâm tiếng Nhật tại Quảng Nam, Hội An, Tam Kỳ',
                    'Trung tâm tiếng Nhật tại các tỉnh thành khác'
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedCategory('centers');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-xs font-semibold text-slate-700 hover:text-emerald-800 transition-all flex items-center justify-between border border-transparent hover:border-emerald-200 cursor-pointer"
                    >
                      <span className="truncate pr-2">{item}</span>
                      <ChevronRight size={13} className="text-slate-400 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Branch 3: WebApp JLPT Ecosystem Tools */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-amber-700 font-black text-sm uppercase">
                  <Zap size={18} />
                  <span>LIÊN KẾT HỆ SINH THÁI WEBAPP</span>
                </div>
                <div className="space-y-2">
                  {[
                    { title: 'Bài học Minna no Nihongo N5 (25 bài)', tab: 'lessons' },
                    { title: 'Flashcard 3D lật thẻ âm thanh bản xứ', tab: 'flashcard' },
                    { title: 'Luyện đề thi thử JLPT N5 có bấm giờ', tab: 'quiz' },
                    { title: 'Luyện gõ phím Romaji - Hiragana', tab: 'practice' },
                    { title: 'Vườn Cây Bonsai rèn chuỗi học SRS', tab: 'garden' },
                    { title: 'Trợ lý AI Sensei giải thích ngữ pháp', tab: 'ai-sensei' }
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        sounds.playFlip();
                        setActiveTab(item.tab);
                      }}
                      className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50 text-xs font-semibold text-slate-700 hover:text-amber-800 transition-all flex items-center justify-between border border-transparent hover:border-amber-200 cursor-pointer"
                    >
                      <span className="truncate pr-2">{item.title}</span>
                      <Award size={13} className="text-amber-500 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : selectedCategory === 'centers' ? (
          /* CASE C: DIRECTORY OF JAPANESE LANGUAGE CENTERS */
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-serif">
                  Danh Bạ Trung Tâm Tiếng Nhật Uy Tín Toàn Quốc
                </h2>
                <p className="text-xs text-slate-500 mt-1 mb-0">
                  Tra cứu thông tin chính xác, địa chỉ, số hotline và đánh giá chất lượng đào tạo tại Đà Nẵng, Hà Nội, TP.HCM, Quảng Nam...
                </p>
              </div>

              {/* City Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                {cities.map((city) => (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => {
                      sounds.playSelect();
                      setSelectedCity(city.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      selectedCity === city.id
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {city.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Centers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {centers.map((c) => (
                <div
                  key={c.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-rose-300 hover:shadow-sm transition-all flex flex-col justify-between"
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

                    <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                      <div className="flex items-start gap-2">
                        <MapPin size={13} className="text-rose-600 shrink-0 mt-0.5" />
                        <span className="text-slate-700 font-medium">{c.address}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Phone size={13} className="text-emerald-600 shrink-0" />
                          <span className="font-bold text-slate-800">{c.hotline}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleCopyPhone(c.hotline, c.id, e)}
                          className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-[11px] font-bold text-slate-600 border border-slate-200 cursor-pointer flex items-center gap-1"
                        >
                          {copiedCenterPhone === c.id ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                          <span>{copiedCenterPhone === c.id ? 'Đã sao chép' : 'Sao chép SĐT'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* CASE D: STANDARD BAOMOI / VNEXPRESS EDITORIAL HOMEPAGE */
          <div className="space-y-8">
            {/* 1. TOP SPOTLIGHT HEADLINE EDITORIAL GRID (12-COLUMNS) */}
            {featuredArticle && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-8 border-b border-slate-200">
                {/* Main Hero Story (7 cols) */}
                <div
                  onClick={() => handleOpenArticle(featuredArticle)}
                  className="lg:col-span-7 space-y-3 cursor-pointer group"
                >
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs">
                    <img
                      src={featuredArticle.imageUrl || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80'}
                      alt={featuredArticle.title}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded bg-rose-700 text-white font-black text-[10px] uppercase tracking-wider shadow-sm">
                        TIÊU ĐIỂM BÁO CHÍ
                      </span>
                      <span className="px-2.5 py-1 rounded bg-slate-900/85 backdrop-blur-md text-white font-bold text-[10px]">
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
                      <span className="font-bold text-slate-700">{featuredArticle.sourceName}</span>
                      <span>/</span>
                      <span>{featuredArticle.publishedTime || 'Vừa xong'}</span>
                      <span>/</span>
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
                        <span className="text-slate-300">/</span>
                        <span className="text-slate-400 font-normal">{art.publishedTime || 'Vừa xong'}</span>
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

            {/* 2. MAIN BODY: 2-COLUMN BAOMOI STREAM & SIDEBAR WIDGETS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Chronological Articles Stream (8 cols) */}
              <div className="lg:col-span-8 space-y-6">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Newspaper size={17} className="text-rose-700" />
                    <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight mb-0">
                      DÒNG SỰ KIỆN & TIN TỨC CHÍNH THỐNG
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    Trang {currentPage} / {totalPages || 1} ({filteredArticles.length} bài viết)
                  </span>
                </div>

                {/* Stream of Articles (Baomoi horizontal cards) */}
                <div className="divide-y divide-slate-200/80">
                  {paginatedArticles.map((art) => (
                    <article
                      key={art.id}
                      onClick={() => handleOpenArticle(art)}
                      className="py-4 sm:py-5 first:pt-0 cursor-pointer group flex flex-col-reverse sm:flex-row items-start justify-between gap-4"
                    >
                      {/* Left: Article Text & Meta */}
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                          <div className="flex items-center gap-1.5 text-xs font-black uppercase text-rose-700">
                            <span className="text-slate-400 font-normal">Trang chủ /</span>
                            <span>{art.category}</span>
                            <span className="text-slate-300">/</span>
                            <span className="text-slate-400 font-normal lowercase">
                              {art.publishedTime || 'Vừa xong'}
                            </span>
                          </div>
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 group-hover:bg-rose-50 group-hover:text-rose-700 text-[10.5px] font-bold text-slate-500 border border-slate-200 group-hover:border-rose-200 transition-all"
                            title="Bài viết có sơ đồ liên kết phân tầng chi tiết"
                          >
                            <Network size={11} className="text-rose-600" />
                            <span>Sơ đồ liên kết</span>
                          </span>
                        </div>

                        <h4 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-rose-700 transition-colors leading-snug">
                          {art.title}
                        </h4>

                        <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed mb-0">
                          {art.summary}
                        </p>

                        <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                          <span className="font-semibold text-slate-600">{art.sourceName}</span>
                          <span>/</span>
                          <span>{art.readTime}</span>
                          <span>/</span>
                          <span>{art.views.toLocaleString()} lượt xem</span>
                        </div>
                      </div>

                      {/* Right: Crisp Image Thumbnail */}
                      <div className="w-full sm:w-44 aspect-video sm:aspect-4/3 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                        <img
                          src={art.imageUrl || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=400&q=80'}
                          alt={art.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </article>
                  ))}
                </div>

                {/* Numbered Pagination Bar */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-6 border-t border-slate-200 flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playSelect();
                        setCurrentPage((prev) => Math.max(1, prev - 1));
                        window.scrollTo({ top: 350, behavior: 'smooth' });
                      }}
                      disabled={currentPage === 1}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 disabled:opacity-40 cursor-pointer flex items-center gap-1"
                    >
                      <ChevronLeft size={14} />
                      <span>Trang trước</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => {
                              sounds.playSelect();
                              setCurrentPage(pageNum);
                              window.scrollTo({ top: 350, behavior: 'smooth' });
                            }}
                            className={`w-8 h-8 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                              currentPage === pageNum
                                ? 'bg-rose-700 text-white font-black shadow-xs'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      {totalPages > 5 && <span className="text-xs text-slate-400">...</span>}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        sounds.playSelect();
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1));
                        window.scrollTo({ top: 350, behavior: 'smooth' });
                      }}
                      disabled={currentPage === totalPages}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 disabled:opacity-40 cursor-pointer flex items-center gap-1"
                    >
                      <span>Trang tiếp theo</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column: Widgets Sidebar (4 cols) */}
              <div className="lg:col-span-4 space-y-6">
                {/* WIDGET 1: TIN NÓNG 24H ĐỌC NHIỀU */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Flame size={16} className="text-rose-600" />
                    <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider mb-0">
                      TIN NÓNG 24H ĐỌC NHIỀU NHẤT
                    </h4>
                  </div>
                  <div className="space-y-3">
                    {articles.slice(0, 5).map((hot, idx) => (
                      <div
                        key={hot.id}
                        onClick={() => handleOpenArticle(hot)}
                        className="flex items-start gap-3 cursor-pointer group pb-2.5 border-b border-slate-100 last:border-0 last:pb-0"
                      >
                        <span className="font-serif font-black text-xl text-rose-700/80 w-6 shrink-0 leading-none">
                          0{idx + 1}
                        </span>
                        <div className="space-y-1">
                          <h5 className="text-xs font-bold text-slate-800 group-hover:text-rose-700 transition-colors line-clamp-2 leading-snug mb-0">
                            {hot.title}
                          </h5>
                          <span className="text-[10.5px] text-slate-400 block">{hot.views.toLocaleString()} lượt xem</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* WIDGET 2: TRA CỨU TRUNG TÂM THEO TỈNH THÀNH */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Building size={16} className="text-emerald-600" />
                    <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider mb-0">
                      TRA CỨU TRUNG TÂM TIẾNG NHẬT
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {['Đà Nẵng', 'Hà Nội', 'TP. Hồ Chí Minh', 'Quảng Nam'].map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => {
                          sounds.playSelect();
                          setSelectedCategory('centers');
                          setSelectedCity(city);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 font-bold text-slate-700 border border-slate-200/80 transition-all text-left flex items-center justify-between cursor-pointer"
                      >
                        <span>{city}</span>
                        <ChevronRight size={12} className="text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* WIDGET 3: SƠ ĐỒ LIÊN KẾT NHANH */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <FolderTree size={16} className="text-rose-600" />
                    <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider mb-0">
                      SƠ ĐỒ LIÊN KẾT HỆ THỐNG
                    </h4>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playSelect();
                        setSelectedCategory('Kỳ thi JLPT');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full p-2 rounded-lg bg-slate-50 hover:bg-rose-50 hover:text-rose-700 cursor-pointer transition-colors flex items-center justify-between text-left font-semibold text-slate-700"
                    >
                      <span>Lịch thi JLPT 2026 chính thức</span>
                      <ChevronRight size={12} className="text-slate-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playSelect();
                        setSelectedCategory('Chính sách Visa');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full p-2 rounded-lg bg-slate-50 hover:bg-rose-50 hover:text-rose-700 cursor-pointer transition-colors flex items-center justify-between text-left font-semibold text-slate-700"
                    >
                      <span>Chính sách Visa Tokutei Ginou 2026</span>
                      <ChevronRight size={12} className="text-slate-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playSelect();
                        setSelectedCategory('sitemap_explorer');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full mt-2 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs text-center cursor-pointer transition-all block"
                    >
                      Xem toàn bộ sơ đồ liên kết hệ thống
                    </button>
                  </div>
                </div>

                {/* WIDGET 4: KHẢO SÁT Ý KIẾN BẠN ĐỌC */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Radio size={16} className="text-blue-600" />
                    <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider mb-0">
                      KHẢO SÁT Ý KIẾN BẠN ĐỌC
                    </h4>
                  </div>
                  <p className="text-xs font-bold text-slate-800 mb-0">
                    Mục tiêu kỳ thi JLPT năm 2026 của bạn là gì?
                  </p>
                  <div className="space-y-2">
                    {['N5', 'N4', 'N3', 'N2', 'N1'].map((lvl) => {
                      const count = voteStats[lvl] || 0;
                      const totalVotes = Object.values(voteStats).reduce((a, b) => a + b, 0);
                      const pct = Math.round((count / (totalVotes || 1)) * 100);
                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => handleVotePoll(lvl)}
                          className="w-full p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left text-xs font-bold text-slate-700 flex items-center justify-between cursor-pointer transition-all"
                        >
                          <span>Chứng chỉ {lvl}</span>
                          <span className="text-[11px] text-slate-500">{pct}%</span>
                        </button>
                      );
                    })}
                  </div>
                  {hasVoted && (
                    <p className="text-[11px] text-emerald-600 font-bold mb-0 text-center">
                      Cảm ơn bạn đã tham gia bình chọn!
                    </p>
                  )}
                </div>

                {/* WIDGET 5: QUẢNG CÁO WEBAPP NATIVE CARD (CLEAN & MINIMAL) */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 p-1 border border-slate-200 flex items-center justify-center shrink-0">
                      <img src="/hyper_logo.png" alt="HYPER" className="h-5 w-auto object-contain" />
                    </div>
                    <div>
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        HỌC TẬP THỰC CHIẾN
                      </span>
                      <h5 className="text-xs font-black text-slate-900 mb-0">Luyện Đề Thi Thử Bấm Giờ</h5>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-0">
                    Làm quen với áp lực phòng thi thật, AI Sensei chấm điểm tức thì và phân tích lỗi sai ngữ pháp.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playFlip();
                      setActiveTab('quiz');
                    }}
                    className="w-full py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-black text-xs text-center shadow-xs transition-all cursor-pointer block"
                  >
                    Làm đề thi thử miễn phí ngay
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── 5. FLOATING SLIDE-IN SPONSOR TOAST (CLEAN & NON-INTRUSIVE) ── */}
      {!floatingAdDismissed && !selectedArticle && (
        <div className="fixed bottom-4 left-4 z-40 max-w-xs sm:max-w-sm p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
              <img src="/hyper_logo.png" alt="HYPER" className="h-5 w-auto object-contain" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] font-black uppercase text-rose-700">TÀI TRỢ BỞI HYPER JAPANESE</span>
              <p className="text-xs font-bold text-slate-900 mb-0 leading-tight">
                Lật Thẻ Flashcard 3D & Ôn Tập Từ Vựng Mỗi Ngày
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => {
                sounds.playFlip();
                setActiveTab('flashcard');
              }}
              className="px-2.5 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-black text-[11px] shadow-xs cursor-pointer"
            >
              Học ngay
            </button>
            <button
              type="button"
              onClick={() => setFloatingAdDismissed(true)}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              title="Đóng thông báo"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
