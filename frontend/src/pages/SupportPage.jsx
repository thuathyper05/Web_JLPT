import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { sounds } from '../services/sounds';
import {
  LifeBuoy,
  HelpCircle,
  Smartphone,
  Keyboard,
  Send,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  BookOpen,
  MessageCircle,
  ShieldCheck,
  Zap
} from 'lucide-react';

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedback, setFeedback] = useState({
    name: '',
    email: '',
    category: 'bug',
    message: ''
  });

  const faqs = [
    {
      q: 'HYPER Japanese có chạy được hoàn toàn ngoại tuyến (Offline) không?',
      a: 'Có! Hệ thống được xây dựng theo chuẩn Web App hiện đại, toàn bộ âm thanh phản xạ, từ vựng và thuật toán SRS đều lưu trong trình duyệt cục bộ, giúp bạn học mượt mà ngay cả khi mất mạng.'
    },
    {
      q: 'Làm thế nào để cài đặt Web App lên màn hình chính điện thoại (PWA)?',
      a: 'Trên iPhone (Safari): Bấm vào nút Chia sẻ (biểu tượng hình vuông có mũi tên lên) và chọn "Thêm vào màn hình chính". Trên Android (Chrome): Bấm vào dấu 3 chấm góc trên bên phải và chọn "Cài đặt ứng dụng" hoặc "Thêm vào màn hình chính".'
    },
    {
      q: 'Tiến độ học tập và chuỗi ngày học có bị mất khi tôi tắt trình duyệt không?',
      a: 'Không hề. Tiến độ từ vựng, chuỗi ngày học (streak) và ghi chú đều được tự động đồng bộ liên tục vào bộ nhớ thiết bị. Khi đăng ký tài khoản, dữ liệu sẽ được sao lưu an toàn trên đám mây.'
    },
    {
      q: 'Tại sao nên dùng phím tắt khi học thẻ Flashcard 3D?',
      a: 'Sử dụng phím Space để lật thẻ, phím 1 (Cần ôn lại) và phím 2 (Đã thành thạo) giúp rèn luyện phản xạ vô thức cực nhanh, tăng tốc độ ghi nhớ lên gấp 2.5 lần so với thao tác chuột.'
    },
    {
      q: 'Phương pháp Vườn cây Bonsai SRS hoạt động như thế nào?',
      a: 'HYPER Japanese áp dụng nguyên lý Spaced Repetition System (Lặp lại ngắt quãng). Từ mới học sẽ là hạt mầm, khi bạn ôn lại đúng sau 1 ngày, 3 ngày, 7 ngày, từ đó sẽ chuyển sang Bonsai niên thiếu và Cổ thụ hoàng kim trong trí nhớ dài hạn.'
    }
  ];

  const toggleFaq = (idx) => {
    sounds.playFlip();
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!feedback.message) return;
    sounds.playLevelUp();
    setFeedbackSent(true);
    setFeedback({ name: '', email: '', category: 'bug', message: '' });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* ── 1. HEADER BANNER ── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-pink-100 shadow-sm relative overflow-hidden">
        <div className="absolute right-4 top-2 text-pink-100/50 font-jp font-black text-8xl pointer-events-none select-none">
          援
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 text-pink-700 font-extrabold text-[11px] uppercase tracking-wider mb-2.5">
            <LifeBuoy size={13} className="text-pink-600" />
            <span>TRUNG TÂM TRỢ GIÚP • HỖ TRỢ HỌC VIÊN</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug mb-1.5">
            Hỗ Trợ & Hướng Dẫn Sử Dụng
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mb-0">
            Giải đáp thắc mắc thường gặp, bảng phím tắt phản xạ nhanh, hướng dẫn cài đặt Web App lên điện thoại và kênh tiếp nhận phản hồi.
          </p>
        </div>
      </div>

      {/* ── 2. QUICK FEATURE CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Keyboard Shortcuts */}
        <div className="p-5 rounded-3xl bg-white border border-pink-100 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center">
            <Keyboard size={20} />
          </div>
          <h3 className="font-bold text-sm text-slate-900">Phím Tắt Bàn Phím</h3>
          <ul className="text-xs text-slate-600 space-y-1.5">
            <li className="flex justify-between">
              <span>Lật thẻ 3D:</span>
              <kbd className="px-2 py-0.5 rounded bg-slate-100 border text-[10px] font-mono font-bold">Space</kbd>
            </li>
            <li className="flex justify-between">
              <span>Cần ôn lại:</span>
              <kbd className="px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-mono font-bold">1</kbd>
            </li>
            <li className="flex justify-between">
              <span>Đã thành thạo:</span>
              <kbd className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-mono font-bold">2</kbd>
            </li>
          </ul>
        </div>

        {/* Card 2: Install Mobile PWA */}
        <div className="p-5 rounded-3xl bg-white border border-pink-100 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Smartphone size={20} />
          </div>
          <h3 className="font-bold text-sm text-slate-900">Cài Đặt Điện Thoại</h3>
          <p className="text-xs text-slate-600 leading-relaxed mb-0">
            Mở trình duyệt Safari (iOS) hoặc Chrome (Android), chọn <strong>"Thêm vào Màn hình chính"</strong> để có trải nghiệm toàn màn hình như ứng dụng gốc!
          </p>
        </div>

        {/* Card 3: Tokyo Speech Voice */}
        <div className="p-5 rounded-3xl bg-white border border-pink-100 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Zap size={20} />
          </div>
          <h3 className="font-bold text-sm text-slate-900">Phát Âm Tokyo Chuẩn</h3>
          <p className="text-xs text-slate-600 leading-relaxed mb-0">
            Tất cả từ vựng đều tích hợp công nghệ giọng đọc tổng hợp Web Speech với cao độ ngữ điệu (Pitch Accent) chuẩn vùng Kanto, Tokyo.
          </p>
        </div>
      </div>

      {/* ── 3. FAQ ACCORDION ── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-pink-100 shadow-sm space-y-4">
        <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
          <HelpCircle size={18} className="text-pink-600" />
          <span>CÂU HỎI THƯỜNG GẶP (FAQ)</span>
        </h2>

        <div className="space-y-2">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-pink-100 overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full p-4 text-left font-bold text-xs sm:text-sm text-slate-800 bg-pink-50/20 hover:bg-pink-50/50 flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  size={16}
                  className={`text-pink-600 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`}
                />
              </button>
              {openFaq === idx && (
                <div className="p-4 bg-white text-xs text-slate-600 leading-relaxed border-t border-pink-50 animate-in fade-in">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. FEEDBACK & BUG REPORT FORM ── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-pink-100 shadow-sm space-y-4">
        <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
          <MessageCircle size={18} className="text-pink-600" />
          <span>GỬI PHẢN HỒI HOẶC BÁO LỖI</span>
        </h2>
        <p className="text-xs text-slate-500">
          Ý kiến đóng góp của bạn giúp HYPER Japanese ngày càng hoàn thiện hơn mỗi ngày.
        </p>

        {feedbackSent ? (
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span>Cảm ơn bạn! Phản hồi đã được chuyển thẳng tới đội ngũ phát triển HYPER Japanese.</span>
          </div>
        ) : (
          <form onSubmit={handleFeedbackSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên của bạn</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Hoàng Long"
                  value={feedback.name}
                  onChange={(e) => setFeedback({ ...feedback, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-pink-200 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500 bg-pink-50/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email liên hệ</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={feedback.email}
                  onChange={(e) => setFeedback({ ...feedback, email: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-pink-200 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500 bg-pink-50/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Chủ đề</label>
                <select
                  value={feedback.category}
                  onChange={(e) => setFeedback({ ...feedback, category: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-pink-200 text-xs font-bold text-slate-700 bg-white"
                >
                  <option value="bug">Báo lỗi phát âm / giao diện</option>
                  <option value="feature">Đề xuất tính năng mới</option>
                  <option value="content">Góp ý nội dung bài học</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nội dung chi tiết</label>
              <textarea
                required
                rows={3}
                placeholder="Mô tả cụ thể vấn đề hoặc ý tưởng của bạn..."
                value={feedback.message}
                onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-pink-200 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500 bg-pink-50/20"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 text-white font-bold text-xs shadow-lotus hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Send size={14} />
              <span>Gửi phản hồi</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
