import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Lock,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Calendar,
  Send,
  Zap,
  RotateCcw
} from 'lucide-react';
import { sounds } from '../services/sounds';

export default function LevelComingSoonPage() {
  const { currentLevel, setCurrentLevel, setActiveTab } = useApp();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    sounds.playCorrect();
    setSubscribed(true);
  };

  const handleBackToN5 = () => {
    sounds.playFlip();
    setCurrentLevel('N5');
    setActiveTab('home');
  };

  const roadmaps = [
    { title: 'Giai đoạn 1: Chuẩn hóa dữ liệu', time: 'Quý 1/2027', desc: 'Biên soạn 1.800 từ vựng và ngữ pháp Somatome chuyên sâu.' },
    { title: 'Giai đoạn 2: Tích hợp âm thanh & hình ảnh', time: 'Quý 2/2027', desc: 'Phát âm chuẩn Tokyo và 150 bộ thủ tượng hình minh họa.' },
    { title: 'Giai đoạn 3: Huấn luyện AI Sensei', time: 'Quý 3/2027', desc: 'Mô hình AI giải thích ngữ cảnh và tạo đề thi JLPT tự động.' },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 animate-in fade-in duration-300 text-center">
      {/* Top Banner */}
      <div className="p-8 sm:p-12 rounded-3xl bg-white border border-pink-100 shadow-lotus relative overflow-hidden space-y-6">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-pink-600 to-rose-500 text-white flex items-center justify-center shadow-lotus">
          <Lock size={36} />
        </div>

        <div className="space-y-2 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-pink-700 font-extrabold text-xs uppercase tracking-wider">
            <Sparkles size={13} className="text-pink-600" />
            <span>GIAI ĐOẠN BIÊN SOẠN & TÍCH HỢP AI</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            JLPT {currentLevel || 'N4'} Đang Trong Quá Trình Phát Triển
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Đội ngũ giáo viên bản ngữ và kỹ sư AI của NihongoHub đang hoàn thiện bộ dữ liệu từ vựng, ngữ pháp và bài thi thử cho cấp độ <strong>JLPT {currentLevel}</strong> theo tiêu chuẩn mới nhất.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-2xl mx-auto pt-2">
          <div className="p-4 rounded-2xl bg-pink-50/40 border border-pink-100">
            <h4 className="font-bold text-xs text-slate-900 mb-1">1.800+ Từ vựng {currentLevel}</h4>
            <p className="text-[11px] text-slate-500 mb-0">Tuyển tập theo giáo trình Minna Trung cấp & Shinkanzen.</p>
          </div>
          <div className="p-4 rounded-2xl bg-pink-50/40 border border-pink-100">
            <h4 className="font-bold text-xs text-slate-900 mb-1">150+ Chữ Hán Kanji</h4>
            <p className="text-[11px] text-slate-500 mb-0">Phân tách bộ thủ và thứ tự số nét thư pháp chuẩn xác.</p>
          </div>
          <div className="p-4 rounded-2xl bg-pink-50/40 border border-pink-100">
            <h4 className="font-bold text-xs text-slate-900 mb-1">AI Luyện Đề Chuẩn</h4>
            <p className="text-[11px] text-slate-500 mb-0">Hệ thống mô phỏng bài thi chính thức chấm điểm tức thì.</p>
          </div>
        </div>

        {/* Roadmap Timeline */}
        <div className="max-w-xl mx-auto pt-4 border-t border-pink-50 text-left">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4">
            LỘ TRÌNH PHÁT HÀNH DỰ KIẾN
          </h3>
          <div className="space-y-3">
            {roadmaps.map((r, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                <div className="w-6 h-6 rounded-full bg-pink-100 text-pink-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-800">{r.title}</span>
                    <span className="text-[10px] font-semibold text-pink-600 bg-pink-50 px-2 py-0.2 rounded-full border border-pink-100">
                      {r.time}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-0 mt-0.5">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Email Subscribe Form */}
        <div className="max-w-md mx-auto pt-4 border-t border-pink-50">
          {subscribed ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-600" />
              <span>Tuyệt vời! Bạn sẽ nhận được thông báo ngay khi JLPT {currentLevel} mở khóa.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Đăng ký nhận thông báo sớm & ưu đãi học thử miễn phí:
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="Nhập email của bạn..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-pink-200 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-lotus flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Send size={14} />
                  <span>Đăng ký</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Return Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleBackToN5}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-500 to-pink-500 hover:from-pink-500 hover:to-rose-600 text-white font-extrabold text-xs sm:text-sm shadow-lotus hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw size={16} />
            <span>Quay lại học JLPT N5 ngay</span>
          </button>
        </div>
      </div>
    </div>
  );
}
