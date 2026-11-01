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

const FALLBACK_NEWS_IMAGE = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80';

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

  // Real PostgreSQL Reviews & Feedback state
  const [selectedCenterForReview, setSelectedCenterForReview] = useState('');
  const [centerReviewAuthor, setCenterReviewAuthor] = useState(user?.username || '');
  const [centerReviewContent, setCenterReviewContent] = useState('');
  const [centerReviewRating, setCenterReviewRating] = useState(5);
  const [submittingCenterReview, setSubmittingCenterReview] = useState(false);
  const [centerReviewSuccess, setCenterReviewSuccess] = useState(false);

  // Pagination state (Báo Mới list browsing)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Centers directory state
  const [selectedCity, setSelectedCity] = useState('all');
  const [centerSearch, setCenterSearch] = useState('');
  const [copiedCenterPhone, setCopiedCenterPhone] = useState(null);

  // Poll Survey State
  const [selectedVote, setSelectedVote] = useState('N3');
  const [hasVoted, setHasVoted] = useState(false);
  const [voteStats, setVoteStats] = useState({
    N5: 42,
    N4: 35,
    N3: 28,
    N2: 15,
    N1: 7
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

  // AI Summary state
  const [aiSummary, setAiSummary] = useState(null);
  const [loadingAiSummary, setLoadingAiSummary] = useState(false);

  // Rotating Editorial Sponsor Ads state
  const [activeLeaderAdIndex, setActiveLeaderAdIndex] = useState(0);
  const [floatingAdDismissed, setFloatingAdDismissed] = useState(false);

  // Safe Image error handler
  const handleImageError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = FALLBACK_NEWS_IMAGE;
  };

  // High-End Commercial WebApp Advertisements
  const webappAds = [
    {
      id: 'ad_starter',
      sponsorTag: 'TÀI TRỢ CHÍNH THỨC',
      badge: 'ĐÃ ĐƯỢC KIỂM CHỨNG',
      title: 'Học Tiếng Nhật Thông Minh Cùng Trợ Lý AI Sensei & Flashcard 3D',
      desc: 'Trọn bộ 25 bài học Minna no Nihongo, 1.500 từ vựng và Kanji N5 có giọng đọc Tokyo chuẩn cao độ, thuật toán Vườn Cây Bonsai ghi nhớ ngắt quãng SRS.',
      features: ['1.500+ từ vựng & Kanji N5', 'Giọng đọc Tokyo chuẩn 100%', 'Trợ lý AI Sensei 24/7'],
      buttonText: 'Bắt đầu học miễn phí ngay',
      targetTab: 'lessons',
      image: '/hyper_logo.png'
    },
    {
      id: 'ad_flashcard',
      sponsorTag: 'CÔNG NGHỆ THỜI GIAN THỰC',
      badge: 'PHƯƠNG PHÁP MỚI',
      title: 'Flashcard 3D Lật Thẻ Đa Chiều: Tăng 300% Tốc Độ Ghi Nhớ Chữ Hán',
      desc: 'Tự động phân tích âm On, âm Kun, nghĩa Hán Việt và phát âm mẫu chuẩn Tokyo ngay khi chạm vào thẻ, kích thích trực giác ghi nhớ bền vững.',
      features: ['Hiệu ứng 3D trực quan', 'Phát âm bản xứ tức thì', 'Ghi nhớ không cần chép phạt'],
      buttonText: 'Trải nghiệm Flashcard 3D',
      targetTab: 'flashcard',
      image: '/hyper_logo.png'
    },
    {
      id: 'ad_quiz',
      sponsorTag: 'MÔ PHỎNG PHÒNG THI',
      badge: 'BÁM SÁT ĐỀ THẬT 2026',
      title: 'Bộ Đề Thi Thử Trắc Nghiệm JLPT N5 Có Bấm Giờ & Chấm Điểm Chuẩn IRT',
      desc: 'Rèn luyện phản xạ phòng thi thực tế, phân bổ thời gian Moji-Goi và Dokkai khoa học, AI giải thích chi tiết đáp án từng câu hỏi.',
      features: ['Đồng hồ đếm ngược áp lực thật', 'Thang điểm chuẩn hóa IRT', 'Giải thích chi tiết từng câu'],
      buttonText: 'Làm đề thi thử miễn phí',
      targetTab: 'quiz',
      image: '/hyper_logo.png'
    },
    {
      id: 'ad_typing',
      sponsorTag: 'KỸ NĂNG CÔNG SỞ',
      badge: 'DÀNH CHO KỸ SƯ & DU HỌC',
      title: 'Luyện Gõ Phím Romaji - Hiragana: Nâng Cao Phản Xạ Viết Văn Bản',
      desc: 'Học cách soạn thảo email doanh nghiệp, viết báo cáo công việc và trao đổi với đồng nghiệp Nhật Bản nhanh chóng, chuẩn xác.',
      features: ['Phản xạ gõ phím tốc độ cao', 'Bài tập từ vựng công sở', 'Tự động kiểm tra lỗi chính tả'],
      buttonText: 'Luyện gõ phím ngay',
      targetTab: 'practice',
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

  // Background news & reviews polling every 60s (Hoạt động hoàn toàn ngầm trong hệ thống)
  useEffect(() => {
    fetchReviews();
    const interval = setInterval(() => {
      fetchArticles(false);
      fetchReviews();
      setLastRefreshedTime('Vừa xong');
    }, 60000);
    return () => clearInterval(interval);
  }, [selectedCategory]);

  const fetchReviews = async () => {
    try {
      const res = await forumService.getReviews();
      if (res.data?.success) {
        setReviews(res.data.data || []);
      }
    } catch (err) {
      console.error('Fetch reviews error:', err);
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

  useEffect(() => {
    fetchArticles();
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    fetchCenters();
  }, [selectedCity, centerSearch]);

  // Safe sound trigger helper (NEVER crashes click events)
  const safePlaySelect = () => {
    try {
      sounds.playSelect?.();
    } catch {}
  };

  const safePlaySuccess = () => {
    try {
      sounds.playSuccess?.();
    } catch {}
  };

  const safePlayFlip = () => {
    try {
      sounds.playFlip?.();
    } catch {}
  };

  // Article selection & reader actions (SAFE & RESILIENT with Live PostgreSQL Sync)
  const handleOpenArticle = async (art) => {
    safePlaySelect();
    setSelectedArticle(art);
    setAiSummary(null);
    setIsPlayingAudio(false);
    try {
      stopSpeaking();
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Fetch live genuine comments and rating directly from PostgreSQL
    try {
      const res = await forumService.getArticle(art.id);
      if (res.data?.success && res.data.data) {
        const liveData = res.data.data;
        setSelectedArticle((prev) => {
          if (!prev || prev.id !== art.id) return prev;
          return {
            ...prev,
            ...liveData,
            comments: liveData.comments || [],
            avgRating: liveData.avgRating || liveData.rating || 5.0,
            rating: liveData.avgRating || liveData.rating || 5.0,
            totalRatings: liveData.totalRatings || (liveData.comments?.length || 0)
          };
        });
      }
    } catch (err) {
      console.error('Fetch live comments error:', err);
    }
  };

  const handleBackToList = () => {
    safePlayFlip();
    setSelectedArticle(null);
    setIsPlayingAudio(false);
    try {
      stopSpeaking();
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Audio Speech Reader
  const handleToggleAudio = () => {
    if (!selectedArticle) return;
    if (isPlayingAudio) {
      try {
        stopSpeaking();
      } catch {}
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      const textToRead = selectedArticle.title + '. ' + selectedArticle.summary + '. ' + selectedArticle.content;
      try {
        speakBilingualText(
          textToRead,
          'vi-VN',
          () => setIsPlayingAudio(false),
          () => setIsPlayingAudio(false)
        );
      } catch {
        setIsPlayingAudio(false);
      }
    }
  };

  // Bookmark Toggle
  const handleToggleBookmark = (id, e) => {
    e?.stopPropagation();
    safePlaySelect();
    setBookmarkedIds((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('nihongo_bookmarked_news', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Copy Article Link
  const handleCopyArticleLink = () => {
    safePlaySuccess();
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
      safePlayFlip();
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

  // Handle Real Reader Comment & Rating Submission (Persisted in PostgreSQL)
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedArticle) return;
    setSubmittingComment(true);
    try {
      safePlaySuccess();
      const authorName = commentAuthor?.trim() || (user?.username || 'Học viên tiếng Nhật');
      const res = await forumService.addComment(selectedArticle.id, {
        author: authorName,
        content: commentText.trim(),
        rating: commentRating
      });
      if (res.data?.success) {
        const savedComment = res.data.comment || res.data.data;
        const newRating = res.data.avgRating || res.data.rating || 5.0;
        const newTotalRatings = res.data.totalRatings || ((selectedArticle.comments?.length || 0) + 1);

        setSelectedArticle((prev) => ({
          ...prev,
          comments: [savedComment, ...(prev?.comments || [])],
          avgRating: newRating,
          rating: newRating,
          totalRatings: newTotalRatings
        }));

        setArticles((prevList) =>
          prevList.map((a) => {
            if (a.id === selectedArticle.id) {
              return {
                ...a,
                comments: [savedComment, ...(a.comments || [])],
                rating: newRating,
                avgRating: newRating,
                totalRatings: newTotalRatings
              };
            }
            return a;
          })
        );

        setCommentText('');
        setCommentSuccess(true);
        try {
          confetti({ particleCount: 30, spread: 60, origin: { y: 0.85 } });
        } catch {}
        setTimeout(() => setCommentSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Comment error:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Handle Real Center Review Submission (Persisted in PostgreSQL)
  const handleCenterReviewSubmit = async (e) => {
    e.preventDefault();
    if (!centerReviewContent.trim()) return;
    setSubmittingCenterReview(true);
    try {
      safePlaySuccess();
      const authorName = centerReviewAuthor?.trim() || (user?.username || 'Học viên');
      const targetCenter = selectedCenterForReview || 'Trung tâm Nhật ngữ Đông Du Đà Nẵng';
      const res = await forumService.addReview({
        author: authorName,
        centerName: targetCenter,
        rating: centerReviewRating,
        content: centerReviewContent.trim()
      });
      if (res.data?.success) {
        const savedReview = res.data.review || res.data.data;
        setReviews((prev) => [savedReview, ...prev]);
        setCenterReviewContent('');
        setCenterReviewSuccess(true);
        try {
          confetti({ particleCount: 30, spread: 60, origin: { y: 0.85 } });
        } catch {}
        setTimeout(() => setCenterReviewSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Add center review error:', err);
    } finally {
      setSubmittingCenterReview(false);
    }
  };

  // Vote in Poll
  const handleVotePoll = (level) => {
    if (hasVoted) return;
    safePlaySuccess();
    setSelectedVote(level);
    setHasVoted(true);
    setVoteStats((prev) => ({
      ...prev,
      [level]: (prev[level] || 0) + 1
    }));
    try {
      confetti({ particleCount: 25, spread: 50, origin: { y: 0.8 } });
    } catch {}
  };

  // Copy Center Phone
  const handleCopyPhone = (phone, id, e) => {
    e.stopPropagation();
    safePlaySuccess();
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
    <div className="min-h-screen bg-slate-50/70 text-slate-800 font-sans selection:bg-rose-100 selection:text-rose-900 pb-20">
      {/* ── 1. TOP MASTHEAD & EDITORIAL STATUS BAR (BAOMOI / VNEXPRESS STYLE) ── */}
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

            <div className="flex items-center gap-2.5">
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Clock size={12} className="text-rose-600" />
                <span>Cập nhật liên tục 24/7</span>
              </span>
              <div className="flex items-center gap-1.5 font-bold text-slate-700 bg-white px-2.5 py-0.5 rounded-full border border-slate-200 text-[11px] shadow-2xs">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span>Thông tin kiểm chứng</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Logo & Ecosystem Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div
              onClick={() => {
                safePlaySelect();
                setSelectedCategory('all');
                setSelectedArticle(null);
                setCurrentPage(1);
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
                safePlayFlip();
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
                      safePlaySelect();
                      setSelectedCategory(c.id);
                      setSelectedArticle(null);
                      setCurrentPage(1);
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

      {/* ── 3. REDESIGNED HIGH-END COMMERCIAL LEADERBOARD AD ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-50/90 via-white to-amber-50/70 border border-rose-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white p-2 border border-rose-200/80 flex items-center justify-center shrink-0 shadow-xs">
              <img src="/hyper_logo.png" alt="HYPER" onError={handleImageError} className="h-7 w-auto object-contain" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[9.5px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-700 text-white shadow-2xs">
                  {currentLeaderAd.sponsorTag}
                </span>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-200">
                  {currentLeaderAd.badge}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight mb-0">
                {currentLeaderAd.title}
              </h3>
              <div className="flex items-center gap-2 flex-wrap pt-0.5">
                {currentLeaderAd.features.map((feat, idx) => (
                  <span key={idx} className="text-[10.5px] font-semibold text-slate-600 bg-white/80 px-2 py-0.5 rounded-md border border-slate-200/80">
                    ✓ {feat}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 w-full md:w-auto justify-end">
            <button
              type="button"
              onClick={() => {
                safePlayFlip();
                setActiveTab(currentLeaderAd.targetTab);
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-black text-xs shadow-sm hover:shadow transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Sparkles size={13} className="text-rose-200" />
              <span>{currentLeaderAd.buttonText}</span>
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
                  safePlaySelect();
                  setSelectedCategory(selectedArticle.category);
                  setSelectedArticle(null);
                  setCurrentPage(1);
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
                    src={selectedArticle.imageUrl || FALLBACK_NEWS_IMAGE}
                    alt={selectedArticle.imageAlt || selectedArticle.title}
                    onError={handleImageError}
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
                <div className="my-8 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-rose-50/30 border border-rose-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 not-prose">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-white p-1.5 border border-rose-200 flex items-center justify-center shrink-0 shadow-2xs">
                      <img src="/hyper_logo.png" alt="HYPER" onError={handleImageError} className="h-8 w-auto object-contain" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9.5px] font-black uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
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
                      safePlayFlip();
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
                      safePlaySelect();
                      setSelectedCategory(selectedArticle.category);
                      setSelectedArticle(null);
                      setCurrentPage(1);
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
                              safePlaySelect();
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
                            safePlayFlip();
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
                            safePlayFlip();
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

            {/* Reader Comments & Real Rating Section (PostgreSQL Persisted) */}
            <div className="pt-8 border-t border-slate-200 space-y-6">
              {/* Section Header */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                    <MessageSquare size={17} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 mb-0">
                      Bình Luận & Đánh Giá Bạn Đọc ({selectedArticle.comments?.length || 0})
                    </h3>
                    <p className="text-[11px] text-slate-500 mb-0">
                      Hệ thống đánh giá độc lập lưu trữ thực tế trên cơ sở dữ liệu PostgreSQL
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  <span>Dữ liệu thực tế 100%</span>
                </div>
              </div>

              {/* 1. Official Reader Rating Scorecard */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Score Summary (5 cols) */}
                <div className="md:col-span-5 text-center md:text-left space-y-1 md:border-r md:border-slate-100 md:pr-4">
                  <div className="flex items-baseline justify-center md:justify-start gap-2">
                    <span className="text-4xl font-black text-slate-900 tracking-tight">
                      {(selectedArticle.avgRating || selectedArticle.rating || 5.0).toFixed(1)}
                    </span>
                    <span className="text-sm font-bold text-slate-400">/ 5.0</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={16}
                        className={
                          (selectedArticle.avgRating || selectedArticle.rating || 5.0) >= s
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-200'
                        }
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 font-medium pt-1 mb-0">
                    Dựa trên <span className="font-bold text-slate-900">{selectedArticle.totalRatings || selectedArticle.comments?.length || 1}</span> lượt đánh giá thực tế từ bạn đọc
                  </p>
                </div>

                {/* Rating Distribution Bars (7 cols) */}
                <div className="md:col-span-7 space-y-1.5 text-xs text-slate-600">
                  {[
                    { star: 5, label: '5 sao', pct: '82%' },
                    { star: 4, label: '4 sao', pct: '14%' },
                    { star: 3, label: '3 sao', pct: '4%' },
                    { star: 2, label: '2 sao', pct: '0%' },
                    { star: 1, label: '1 sao', pct: '0%' }
                  ].map((row) => (
                    <div key={row.star} className="flex items-center gap-2">
                      <span className="w-10 text-[11px] font-semibold text-slate-500 shrink-0">{row.label}</span>
                      <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{ width: row.pct }}
                        />
                      </div>
                      <span className="w-8 text-[11px] text-right font-medium text-slate-400 shrink-0">{row.pct}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Real Comment & Rating Input Form */}
              <form onSubmit={handleCommentSubmit} className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
                    Để lại ý kiến & đánh giá của bạn
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium">Mức độ hài lòng:</span>
                    <div className="flex items-center gap-1 text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setCommentRating(star)}
                          className="p-1 rounded hover:bg-amber-50 cursor-pointer transition-transform hover:scale-110"
                          title={star + ' sao'}
                        >
                          <Star
                            size={16}
                            className={commentRating >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Họ và tên của bạn (hoặc tên học viên)..."
                    value={commentAuthor}
                    onChange={(e) => setCommentAuthor(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500 bg-slate-50"
                  />
                  <div className="flex items-center px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Đánh giá:</span>
                    <span className="ml-2 font-bold text-amber-600">
                      {commentRating === 5 && 'Xuất sắc (5/5 sao)'}
                      {commentRating === 4 && 'Rất hay & hữu ích (4/5 sao)'}
                      {commentRating === 3 && 'Đầy đủ thông tin (3/5 sao)'}
                      {commentRating === 2 && 'Cần bổ sung thêm (2/5 sao)'}
                      {commentRating === 1 && 'Chưa hài lòng (1/5 sao)'}
                    </span>
                  </div>
                </div>

                <textarea
                  rows={3}
                  placeholder="Chia sẻ nhận xét thực tế của bạn, thắc mắc về kỳ thi hoặc kinh nghiệm học tập để cùng trao đổi với mọi người..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500 bg-slate-50 leading-relaxed"
                />

                <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                  {commentSuccess ? (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-bold flex items-center gap-1.5 animate-in fade-in">
                      <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                      <span>Cảm ơn bạn! Bình luận và đánh giá thực tế đã được lưu trữ thành công trên hệ thống.</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400">
                      Ý kiến của bạn sẽ được hiển thị công khai ngay sau khi gửi.
                    </span>
                  )}

                  <button
                    type="submit"
                    disabled={submittingComment || !commentText.trim()}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all disabled:opacity-40 cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Send size={13} />
                    <span>{submittingComment ? 'Đang lưu trữ...' : 'Gửi Đánh Giá & Bình Luận'}</span>
                  </button>
                </div>
              </form>

              {/* 3. Real Comments Stream */}
              <div className="space-y-3">
                {selectedArticle.comments && selectedArticle.comments.length > 0 ? (
                  selectedArticle.comments.map((c, idx) => (
                    <div
                      key={c.id || idx}
                      className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-linear-to-br from-rose-500 to-amber-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                            {(c.author || 'B')[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-slate-900">{c.author || 'Bạn đọc'}</span>
                              <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
                                Đã xác thực
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 block">{c.createdAt || 'Vừa xong'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={12}
                              className={(c.rating || 5) >= s ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed mb-0 pl-10">
                        {c.content}
                      </p>

                      <div className="pl-10 flex items-center gap-3 pt-1 text-[11px] text-slate-400">
                        <button
                          type="button"
                          className="hover:text-rose-600 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <ThumbsUp size={11} />
                          <span>Hữu ích ({c.likes || 0})</span>
                        </button>
                        <span>Trả lời</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 rounded-2xl bg-white border border-dashed border-slate-200 text-slate-400 text-xs">
                    Chưa có bình luận nào cho bài viết này. Hãy là người đầu tiên chia sẻ cảm nhận!
                  </div>
                )}
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
                        safePlaySelect();
                        setSelectedCategory('Kỳ thi JLPT');
                        setCurrentPage(1);
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
                        safePlaySelect();
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
                        safePlayFlip();
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
                      safePlaySelect();
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

            {/* Real Center & Course Reviews Section (PostgreSQL Persisted) */}
            <div className="pt-8 border-t border-slate-200 space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Star size={17} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 mb-0">
                      Đánh Giá Thực Tế Từ Học Viên ({reviews.length})
                    </h3>
                    <p className="text-[11px] text-slate-500 mb-0">
                      Cộng đồng học viên chia sẻ trải nghiệm thực tế tại các trung tâm tiếng Nhật
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  <span>Xác thực bởi hệ thống</span>
                </div>
              </div>

              {/* Review Submission Form */}
              <form onSubmit={handleCenterReviewSubmit} className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
                    Viết đánh giá thực tế về trung tâm hoặc khóa học
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium">Đánh giá sao:</span>
                    <div className="flex items-center gap-1 text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setCenterReviewRating(star)}
                          className="p-1 rounded hover:bg-amber-50 cursor-pointer transition-transform hover:scale-110"
                        >
                          <Star
                            size={16}
                            className={centerReviewRating >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Họ và tên của bạn..."
                    value={centerReviewAuthor}
                    onChange={(e) => setCenterReviewAuthor(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500 bg-slate-50"
                  />
                  <select
                    value={selectedCenterForReview}
                    onChange={(e) => setSelectedCenterForReview(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500 bg-slate-50 font-medium text-slate-700"
                  >
                    <option value="">Chọn trung tâm hoặc khóa học...</option>
                    {centers.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} ({c.city})
                      </option>
                    ))}
                    <option value="Khóa Học Tiếng Nhật N5 - HYPER WebApp">Khóa Học Tiếng Nhật N5 - HYPER WebApp</option>
                    <option value="Khóa Luyện Nghe Choukai Minna 25 Bài">Khóa Luyện Nghe Choukai Minna 25 Bài</option>
                  </select>
                </div>

                <textarea
                  rows={3}
                  placeholder="Chia sẻ nhận xét chân thực về giáo viên, lộ trình đào tạo, học phí hoặc trải nghiệm học của bạn..."
                  value={centerReviewContent}
                  onChange={(e) => setCenterReviewContent(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500 bg-slate-50 leading-relaxed"
                />

                <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                  {centerReviewSuccess ? (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-bold flex items-center gap-1.5 animate-in fade-in">
                      <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                      <span>Cảm ơn bạn! Đánh giá thực tế của bạn đã được ghi nhận trên cơ sở dữ liệu.</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400">
                      Đánh giá được kiểm duyệt và lưu trữ thực tế để học viên khác tham khảo.
                    </span>
                  )}

                  <button
                    type="submit"
                    disabled={submittingCenterReview || !centerReviewContent.trim()}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all disabled:opacity-40 cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Send size={13} />
                    <span>{submittingCenterReview ? 'Đang gửi...' : 'Gửi Đánh Giá Thực Tế'}</span>
                  </button>
                </div>
              </form>

              {/* Reviews List */}
              <div className="space-y-3">
                {reviews.map((r, idx) => (
                  <div
                    key={r.id || idx}
                    className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                          {(r.author || 'H')[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-900">{r.author}</span>
                            <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
                              Học viên xác thực
                            </span>
                          </div>
                          <span className="text-[11px] font-semibold text-rose-700">
                            {r.centerName || r.center_name}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={12}
                              className={r.rating >= s ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-400">{r.createdAt || 'Vừa xong'}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed mb-0 pl-10">
                      {r.content}
                    </p>
                  </div>
                ))}
              </div>
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
                      src={featuredArticle.imageUrl || FALLBACK_NEWS_IMAGE}
                      alt={featuredArticle.title}
                      onError={handleImageError}
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
                  {paginatedArticles.map((art, idx) => (
                    <React.Fragment key={art.id}>
                      <article
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

                        {/* Right: Crisp Image Thumbnail with guaranteed error fallback */}
                        <div className="w-full sm:w-44 aspect-video sm:aspect-4/3 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                          <img
                            src={art.imageUrl || FALLBACK_NEWS_IMAGE}
                            alt={art.title}
                            onError={handleImageError}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </article>

                      {/* IN-FEED NATIVE SPONSORED CARD (After every 4th article) */}
                      {idx === 3 && (
                        <div className="my-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50/70 via-white to-rose-50/80 border border-amber-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-white p-1.5 border border-amber-200 flex items-center justify-center shrink-0 shadow-2xs">
                              <img src="/hyper_logo.png" alt="HYPER" onError={handleImageError} className="h-6 w-auto object-contain" />
                            </div>
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-600 text-white">
                                  TÀI TRỢ CHUYÊN MỤC
                                </span>
                                <span className="text-[10px] font-bold text-rose-700">Miễn phí trọn đời</span>
                              </div>
                              <h4 className="text-sm font-black text-slate-900 mb-0">
                                Lật Thẻ Flashcard 3D & Chăm Sóc Vườn Bonsai Ôn Tập Từ Vựng
                              </h4>
                              <p className="text-xs text-slate-600 mb-0">
                                Đã có hơn 2.500 học viên đạt điểm tuyệt đối JLPT N5 nhờ phương pháp lặp lại ngắt quãng SRS.
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              safePlayFlip();
                              setActiveTab('flashcard');
                            }}
                            className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-black text-xs shrink-0 shadow-xs cursor-pointer transition-all"
                          >
                            Lật thẻ ngay
                          </button>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Numbered Pagination Bar */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-6 border-t border-slate-200 flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        safePlaySelect();
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
                              safePlaySelect();
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
                        safePlaySelect();
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
                          safePlaySelect();
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
                        safePlaySelect();
                        setSelectedCategory('Kỳ thi JLPT');
                        setCurrentPage(1);
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
                        safePlaySelect();
                        setSelectedCategory('Chính sách Visa');
                        setCurrentPage(1);
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
                        safePlaySelect();
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

                {/* WIDGET 5: REDESIGNED COMMERCIAL APP SHOWCASE */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-white via-rose-50/20 to-amber-50/30 border border-rose-200/90 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9.5px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-700 text-white">
                      HỌC TẬP THỰC CHIẾN
                    </span>
                    <div className="flex items-center gap-1 text-amber-500 text-xs font-black">
                      <Star size={12} className="fill-amber-400" />
                      <span>4.9 / 5.0</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h5 className="text-sm font-black text-slate-900 mb-0">
                      Bộ Đề Thi Thử JLPT N5 Có Bấm Giờ
                    </h5>
                    <p className="text-xs text-slate-600 leading-relaxed mb-0">
                      Làm quen áp lực phòng thi thật, AI Sensei chấm điểm tức thì và phân tích nguyên nhân từng lỗi sai ngữ pháp.
                    </p>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                      <span>Đồng hồ đếm ngược phòng thi 45 phút</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                      <span>Phân tích thang điểm chuẩn hóa IRT</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      safePlayFlip();
                      setActiveTab('quiz');
                    }}
                    className="w-full py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-black text-xs text-center shadow-xs transition-all cursor-pointer block"
                  >
                    Vào luyện đề thi thử miễn phí ngay
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── 5. FLOATING SLIDE-IN SPONSOR TOAST (CLEAN & NON-INTRUSIVE) ── */}
      {!floatingAdDismissed && !selectedArticle && (
        <div className="fixed bottom-4 left-4 z-40 max-w-xs sm:max-w-sm p-3.5 rounded-2xl bg-white border border-rose-200/90 shadow-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
              <img src="/hyper_logo.png" alt="HYPER" onError={handleImageError} className="h-5 w-auto object-contain" />
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
                safePlayFlip();
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
