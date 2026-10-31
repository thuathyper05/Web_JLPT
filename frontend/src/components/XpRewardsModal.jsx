import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { sounds } from '../services/sounds';
import confetti from 'canvas-confetti';
import {
  Zap,
  Trophy,
  Shield,
  Droplets,
  Crown,
  Volume2,
  BookOpen,
  Sparkles,
  Check,
  X,
  Lock,
  ChevronRight,
  Flame,
  Award,
  Gift
} from 'lucide-react';

export default function XpRewardsModal() {
  const {
    gamification,
    xpModalOpen,
    setXpModalOpen,
    spendXp,
    claimQuestXp,
    userPerks,
    setActiveTab
  } = useApp();

  const [activeTab, setActiveTabLocal] = useState('shop'); // 'shop' | 'levels' | 'quests'
  const [redeemSuccess, setRedeemSuccess] = useState('');

  if (!xpModalOpen) return null;

  const currentXp = gamification?.total_xp || 0;

  // Level Progression Calculation
  const tiers = [
    { level: 1, name: 'Hạt Mầm Sơ Cấp', minXp: 0, maxXp: 299, badge: 'LV1' },
    { level: 2, name: 'Tập Sự Hiragana', minXp: 300, maxXp: 699, badge: 'LV2' },
    { level: 3, name: 'Kiếm Sĩ Katakana', minXp: 700, maxXp: 1199, badge: 'LV3' },
    { level: 4, name: 'Cao Thủ Kanji N5', minXp: 1200, maxXp: 1999, badge: 'LV4' },
    { level: 5, name: 'Chiến Binh Minna', minXp: 2000, maxXp: 3499, badge: 'LV5' },
    { level: 6, name: 'Học Giả JLPT', minXp: 3500, maxXp: 5999, badge: 'LV6' },
    { level: 7, name: 'Bậc Thầy Ngữ Pháp', minXp: 6000, maxXp: 9999, badge: 'LV7' },
    { level: 8, name: 'Đại Sư Nihongo', minXp: 10000, maxXp: 99999, badge: 'MAX' }
  ];

  const currentTier =
    tiers.find((t) => currentXp >= t.minXp && currentXp <= t.maxXp) || tiers[tiers.length - 1];
  const nextTier = tiers.find((t) => t.level === currentTier.level + 1);

  const xpInCurrentTier = currentXp - currentTier.minXp;
  const xpNeededForNext = nextTier ? nextTier.minXp - currentTier.minXp : 1000;
  const progressPercent = nextTier
    ? Math.min(100, Math.round((xpInCurrentTier / xpNeededForNext) * 100))
    : 100;

  // Store Items Available to Redeem
  const shopItems = [
    {
      id: 'streak_freeze',
      name: 'Khiên Bảo Vệ Chuỗi (Streak Freeze)',
      desc: 'Bảo vệ chuỗi ngày học của bạn không bị reset nếu bạn lỡ bận 1 ngày không học.',
      cost: 300,
      icon: Shield,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
      owned: (userPerks?.streak_freeze || 0) > 0,
      ownedCount: userPerks?.streak_freeze || 0
    },
    {
      id: 'bonsai_water',
      name: 'Bình Nước Thần Vườn Bonsai',
      desc: 'Hồi sinh 100% độ ẩm vườn cây SRS và tăng gấp đôi tốc độ đưa từ vựng vào vùng nhớ vĩnh viễn.',
      cost: 250,
      icon: Droplets,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      owned: false
    },
    {
      id: 'royal_crown',
      name: 'Huy Hiệu Hoàng Gia Nihongo',
      desc: 'Gắn vương miện hoàng gia lấp lánh cạnh tên tài khoản của bạn trên thanh Header.',
      cost: 500,
      icon: Crown,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
      owned: !!userPerks?.royal_crown
    },
    {
      id: 'tokyo_voice',
      name: 'Giọng Đọc Tokyo AI Sensei Boost',
      desc: 'Kích hoạt bộ âm thanh phát âm chất lượng studio siêu chuẩn giọng Tokyo cho toàn bộ từ điển.',
      cost: 600,
      icon: Volume2,
      color: 'bg-pink-50 text-pink-600 border-pink-200',
      owned: !!userPerks?.tokyo_voice
    },
    {
      id: 'special_quiz',
      name: 'Vé Đề Thi Thử JLPT N5 Đặc Biệt',
      desc: 'Mở khóa trọn bộ đề thi thử 40 câu bấm giờ chuẩn format kỳ thi năng lực tiếng Nhật quốc tế.',
      cost: 800,
      icon: BookOpen,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
      owned: !!userPerks?.special_quiz
    }
  ];

  // Daily Quests to Earn XP
  const dailyQuests = [
    {
      id: 'q1',
      title: 'Học 10 từ vựng hôm nay',
      reward: 30,
      current: gamification?.today_words_count || 0,
      target: 10,
      tab: 'lessons'
    },
    {
      id: 'q2',
      title: 'Luyện gõ đúng liên tiếp 5 từ',
      reward: 40,
      current: 5,
      target: 5,
      tab: 'practice'
    },
    {
      id: 'q3',
      title: 'Tưới nước cho cây Bonsai SRS',
      reward: 15,
      current: 1,
      target: 1,
      tab: 'garden'
    },
    {
      id: 'q4',
      title: 'Hỏi trợ lý AI phân tích 1 từ khó',
      reward: 20,
      current: 1,
      target: 1,
      tab: 'dictionary'
    }
  ];

  const handleBuy = (item) => {
    if (currentXp < item.cost) {
      sounds.playWrong();
      return;
    }

    const success = spendXp(item.cost, item.id);
    if (success) {
      sounds.playLevelUp();
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#db2777', '#f43f5e', '#fbbf24']
      });
      setRedeemSuccess(`Bạn đã đổi thành công "${item.name}"!`);
      setTimeout(() => setRedeemSuccess(''), 3500);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in"
      onClick={() => setXpModalOpen(false)}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-pink-100 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── 1. MODAL HEADER & CURRENT XP BALANCE ── */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-pink-600 via-rose-600 to-pink-700 text-white relative overflow-hidden shrink-0">
          <div className="absolute right-0 bottom-0 text-white/10 font-jp font-black text-8xl pointer-events-none select-none -mb-4 -mr-4">
            点
          </div>

          <div className="flex items-start justify-between relative z-10">
            <div>
              <span className="text-[11px] font-extrabold text-pink-200 uppercase tracking-wider block mb-1">
                HỆ THỐNG ĐIỂM THƯỞNG GAMIFICATION
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Trung Tâm Điểm Thưởng XP</span>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-xs font-black">
                  {currentTier.name}
                </span>
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setXpModalOpen(false)}
              className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Current XP Display Pill */}
          <div className="mt-4 inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-black/20 backdrop-blur-md border border-white/20">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-black">
              <Zap size={18} fill="#78350f" />
            </div>
            <div>
              <span className="text-xl font-black text-white leading-none">
                {currentXp.toLocaleString()} XP
              </span>
              <span className="text-[10.5px] font-semibold text-pink-100 block">
                Điểm kinh nghiệm tích lũy
              </span>
            </div>
          </div>
        </div>

        {/* ── 2. TABS NAVIGATION ── */}
        <div className="px-5 pt-3 pb-2 border-b border-pink-100 bg-pink-50/30 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              sounds.playFlip();
              setActiveTabLocal('shop');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'shop'
                ? 'bg-pink-600 text-white shadow-lotus'
                : 'text-slate-600 hover:text-pink-600 hover:bg-pink-50'
            }`}
          >
            <Gift size={14} />
            <span>Cửa hàng đổi thưởng</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playFlip();
              setActiveTabLocal('levels');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'levels'
                ? 'bg-pink-600 text-white shadow-lotus'
                : 'text-slate-600 hover:text-pink-600 hover:bg-pink-50'
            }`}
          >
            <Trophy size={14} />
            <span>Cấp độ & Bậc xếp hạng</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playFlip();
              setActiveTabLocal('quests');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'quests'
                ? 'bg-pink-600 text-white shadow-lotus'
                : 'text-slate-600 hover:text-pink-600 hover:bg-pink-50'
            }`}
          >
            <Award size={14} />
            <span>Nhiệm vụ kiếm XP</span>
          </button>
        </div>

        {/* ── 3. SUCCESS ALERT BANNER ── */}
        {redeemSuccess && (
          <div className="mx-5 mt-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in shrink-0">
            <Check size={16} className="text-emerald-600 shrink-0" />
            <span>{redeemSuccess}</span>
          </div>
        )}

        {/* ── 4. TAB CONTENTS (SCROLLABLE) ── */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: CỬA HÀNG ĐỔI THƯỞNG XP */}
          {activeTab === 'shop' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                <span>VẬT PHẨM & ĐẶC QUYỀN ĐỔI BẰNG ĐIỂM XP</span>
                <span className="text-pink-600 font-extrabold">{shopItems.length} vật phẩm</span>
              </div>

              <div className="space-y-3">
                {shopItems.map((item) => {
                  const Icon = item.icon;
                  const canAfford = currentXp >= item.cost;
                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl border border-pink-100 bg-white hover:border-pink-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${item.color}`}
                        >
                          <Icon size={22} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs sm:text-sm font-black text-slate-900 mb-0">
                              {item.name}
                            </h4>
                            {item.owned && (
                              <span className="px-2 py-0.2 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-extrabold flex items-center gap-0.5">
                                <Check size={10} />
                                <span>{item.ownedCount ? `x${item.ownedCount}` : 'ĐÃ SỞ HỮU'}</span>
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mb-0 mt-0.5 leading-relaxed max-w-md">
                            {item.desc}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-pink-50">
                        <span className="text-xs font-black text-amber-600 flex items-center gap-1">
                          <Zap size={14} fill="#f59e0b" />
                          <span>{item.cost} XP</span>
                        </span>

                        <button
                          type="button"
                          onClick={() => handleBuy(item)}
                          disabled={!canAfford}
                          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                            canAfford
                              ? 'bg-pink-600 hover:bg-pink-700 text-white shadow-lotus active:scale-95'
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          {canAfford ? 'Đổi ngay' : `Thiếu ${item.cost - currentXp} XP`}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: CẤP ĐỘ & TIẾN TRÌNH */}
          {activeTab === 'levels' && (
            <div className="space-y-4">
              {/* Current Level Progress Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-pink-50/50 border border-pink-100 space-y-2.5">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5 text-pink-700 font-black">
                    <Trophy size={16} />
                    <span>Cấp độ hiện tại: {currentTier.name} ({currentTier.badge})</span>
                  </span>
                  <span className="text-pink-600 font-black">{progressPercent}%</span>
                </div>

                <div className="w-full h-3 rounded-full bg-pink-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-pink-600 via-rose-500 to-amber-400 transition-all duration-700"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-500 font-medium">
                  <span>{currentXp} XP hiện có</span>
                  {nextTier ? (
                    <span>
                      Còn <strong>{nextTier.minXp - currentXp} XP</strong> nữa để lên{' '}
                      <strong className="text-pink-700">{nextTier.name}</strong>
                    </span>
                  ) : (
                    <span className="text-emerald-600 font-bold">Đã đạt cấp bậc cao nhất!</span>
                  )}
                </div>
              </div>

              {/* 8 Tiers List */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 block mb-2">
                  DANH SÁCH 8 BẬC DANH VỌNG NIHONGOHUB
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {tiers.map((t) => {
                    const isPassed = currentXp >= t.maxXp;
                    const isCurrent = currentXp >= t.minXp && currentXp <= t.maxXp;
                    return (
                      <div
                        key={t.level}
                        className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                          isCurrent
                            ? 'bg-pink-50/80 border-pink-300 ring-2 ring-pink-500/20 shadow-sm'
                            : isPassed
                            ? 'bg-emerald-50/40 border-emerald-100 text-slate-700'
                            : 'bg-slate-50/60 border-slate-100 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black ${
                              isCurrent
                                ? 'bg-pink-600 text-white'
                                : isPassed
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {t.badge}
                          </span>
                          <div>
                            <h5 className="text-xs font-bold mb-0 text-slate-900">{t.name}</h5>
                            <span className="text-[10px] text-slate-500">
                              {t.minXp.toLocaleString()} - {t.maxXp === 99999 ? 'Trở lên' : t.maxXp.toLocaleString()} XP
                            </span>
                          </div>
                        </div>

                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full bg-pink-600 text-white font-extrabold text-[9px] uppercase">
                            Hiện tại
                          </span>
                        )}
                        {isPassed && !isCurrent && (
                          <Check size={15} className="text-emerald-600" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NHIỆM VỤ HÀNG NGÀY */}
          {activeTab === 'quests' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                <span>HOÀN THÀNH NHIỆM VỤ MỖI NGÀY ĐỂ NHẬN THƯỞNG XP</span>
                <span className="text-pink-600 font-extrabold">+105 XP tối đa/ngày</span>
              </div>

              <div className="space-y-2.5">
                {dailyQuests.map((q) => {
                  const isDone = q.current >= q.target;
                  return (
                    <div
                      key={q.id}
                      className="p-3.5 rounded-2xl bg-white border border-pink-100 shadow-sm flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-black text-slate-900 mb-0">{q.title}</h4>
                          <span className="px-2 py-0.2 rounded-md bg-amber-50 text-amber-700 font-extrabold text-[10px] border border-amber-200">
                            +{q.reward} XP
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          Tiến độ: <strong>{q.current}</strong> / {q.target}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setXpModalOpen(false);
                          setActiveTab(q.tab);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isDone
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200'
                        }`}
                      >
                        {isDone ? 'Đã hoàn thành ✓' : 'Làm ngay'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── 5. MODAL FOOTER ── */}
        <div className="p-4 border-t border-pink-100 bg-pink-50/20 flex justify-between items-center text-xs text-slate-500 shrink-0">
          <span>Học đều đặn mỗi ngày để nhận điểm thưởng XP liên tục.</span>
          <button
            type="button"
            onClick={() => setXpModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}