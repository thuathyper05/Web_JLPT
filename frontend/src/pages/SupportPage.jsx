import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { supportService } from '../services/api';
import { sounds } from '../services/sounds';
import SakuraPulse from '../components/SakuraPulse';
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
  Zap,
  Phone,
  Mail,
  QrCode,
  Copy,
  Check,
  Heart,
  ExternalLink,
  AlertCircle,
  Clock,
  Headphones,
  Award
} from 'lucide-react';

export default function SupportPage() {
  const { user } = useApp();

  const [openFaq, setOpenFaq] = useState(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');
  const [feedbackSuccessMsg, setFeedbackSuccessMsg] = useState('');

  const [feedback, setFeedback] = useState({
    name: user?.username || '',
    email: user?.email || '',
    phone: '',
    category: 'bug',
    message: ''
  });

  // Donation state
  const [donateAmount, setDonateAmount] = useState(50000); // Default 50k VND
  const [copiedField, setCopiedField] = useState(null);

  const bankInfo = {
    bankName: 'MBBank (Ngân Hàng TMCP Quân Đội)',
    accountNumber: '0345698251',
    accountHolder: 'NGUYEN VAN THUAT',
    memo: 'Ung ho HYPER JLPT',
    phone: '0345698251',
    email: 'thuatnguyen1204@gmail.com'
  };

  const donateAmounts = [
    { label: '20.000đ', value: 20000, desc: 'Tách trà xanh' },
    { label: '50.000đ', value: 50000, desc: 'Ly cà phê sáng' },
    { label: '100.000đ', value: 100000, desc: 'Ổn định máy chủ' },
    { label: '200.000đ', value: 200000, desc: 'Duy trì AI Sensei' },
    { label: 'Tùy tâm', value: 0, desc: 'Tùy ý học viên' }
  ];

  // Dynamic VietQR code URL
  const qrUrl = `https://img.vietqr.io/image/MB-0345698251-compact2.png?amount=${donateAmount}&addInfo=${encodeURIComponent(bankInfo.memo)}&accountName=${encodeURIComponent(bankInfo.accountHolder)}`;

  const copyToClipboard = (text, fieldName) => {
    sounds.playCorrect();
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const faqs = [
    {
      q: 'Hệ thống Web App có hoạt động ngoại tuyến (Offline) được không?',
      a: 'Hoàn toàn được. Hệ thống HYPER Japanese được thiết kế tối ưu với bộ nhớ đệm Cache-First. Toàn bộ kho từ vựng bài học, thẻ Flashcard 3D và các bài tập thực hành đều được lưu trên thiết bị của bạn, giúp bạn học mượt mà bất kể đường truyền mạng.'
    },
    {
      q: 'Làm thế nào để cài đặt Web App lên màn hình chính điện thoại (PWA)?',
      a: 'Trên iPhone (Safari): Bấm vào nút Chia sẻ (biểu tượng mũi tên hướng lên ở thanh dưới) và chọn "Thêm vào Màn hình chính". Trên thiết bị Android (Chrome): Bấm vào dấu 3 chấm ở góc trên bên phải và chọn "Cài đặt ứng dụng" hoặc "Thêm vào Màn hình chính".'
    },
    {
      q: 'Tiến độ học tập và chuỗi ngày học có được lưu an toàn không?',
      a: 'Có. Khi bạn chưa đăng nhập, tiến độ được lưu trên trình duyệt máy bạn. Khi bạn đăng nhập bằng Google hoặc tài khoản học viên, toàn bộ từ vựng đã học, từ thành thạo và chuỗi ngày học liên tiếp (Streak) sẽ được đồng bộ tự động lên cơ sở dữ liệu đám mây PostgreSQL.'
    },
    {
      q: 'Làm sao để chuyển đổi cấp độ học từ N5 lên N4, N3, N2, N1?',
      a: 'Bạn chỉ cần bấm vào nhãn "Cấp độ N5" trên thanh điều hướng đầu trang. Danh sách 5 cấp độ từ N5 đến N1 sẽ hiện ra để bạn chuyển đổi tức thì. Toàn bộ từ vựng, ngữ pháp và trợ lý AI sẽ tự động đồng bộ theo cấp độ bạn chọn.'
    },
    {
      q: 'Tại sao giọng đọc âm thanh trong bài học lại phát âm chuẩn xác như vậy?',
      a: 'HYPER Japanese sử dụng công nghệ giọng đọc tổng hợp giọng bản xứ Tokyo chuẩn cao độ (Pitch Accent). Riêng ở phần hội thoại cùng AI Sensei, hệ thống ứng dụng thuật toán song ngữ thông minh tự động đọc câu tiếng Nhật bằng giọng Tokyo và phần giải thích bằng tiếng Việt chuẩn ngữ điệu.'
    },
    {
      q: 'Tôi bị quên mật khẩu tài khoản thì lấy lại bằng cách nào?',
      a: 'Tại khung đăng nhập, bạn chọn "Quên mật khẩu?", nhập địa chỉ email đã đăng ký. Hệ thống sẽ cấp mã xác thực OTP 6 chữ số gửi thẳng đến email của bạn để bạn thiết lập mật khẩu mới trong 30 giây.'
    },
    {
      q: 'Khoản đóng góp ủng hộ (Donate) của tôi sẽ được sử dụng vào mục đích gì?',
      a: 'Mọi khoản đóng góp của học viên đều được sử dụng 100% để thanh toán chi phí duy trì máy chủ tốc độ cao, bản quyền token AI Gemini hỗ trợ giải đáp 24/7 và duy trì nền tảng học tập chất lượng cao hoàn toàn miễn phí cho cộng đồng.'
    }
  ];

  const toggleFaq = (idx) => {
    sounds.playFlip();
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.message.trim()) {
      setFeedbackError('Vui lòng nhập nội dung chi tiết phản hồi của bạn.');
      return;
    }

    setFeedbackError('');
    setFeedbackSuccessMsg('');
    setFeedbackLoading(true);
    sounds.playFlip();

    try {
      const res = await supportService.sendFeedback({
        name: feedback.name,
        email: feedback.email,
        phone: feedback.phone,
        category: feedback.category,
        message: feedback.message
      });

      if (res.data?.success) {
        sounds.playLevelUp();
        setFeedbackSent(true);
        setFeedbackSuccessMsg(res.data.message || 'Phản hồi đã được chuyển thẳng tới hòm thư quản trị viên thuatnguyen1204@gmail.com!');
        setFeedback({
          name: user?.username || '',
          email: user?.email || '',
          phone: '',
          category: 'bug',
          message: ''
        });
      } else {
        setFeedbackError(res.data?.message || 'Không thể gửi phản hồi, vui lòng thử lại.');
      }
    } catch (err) {
      setFeedbackError(err.response?.data?.message || 'Lỗi kết nối máy chủ khi gửi phản hồi.');
    } finally {
      setFeedbackLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* ── 1. HEADER BANNER ── */}
      <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-pink-950 text-white relative overflow-hidden shadow-xl border border-pink-900/30">
        <div className="absolute right-4 top-2 text-white/5 font-jp font-black text-9xl pointer-events-none select-none">
          援
        </div>
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-pink-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 border border-pink-400/40 text-pink-300 text-xs font-bold mb-3 backdrop-blur-md">
            <LifeBuoy size={14} className="text-pink-400" />
            <span>TRUNG TÂM HỖ TRỢ HỌC VIÊN CHÍNH THỨC</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug mb-2.5">
            Trung Tâm Hỗ Trợ & Đồng Hành Cùng Học Viên
          </h1>
          <p className="text-xs sm:text-sm text-pink-100/80 leading-relaxed mb-6">
            Đội ngũ quản trị viên HYPER Japanese sẵn sàng hỗ trợ giải đáp mọi vướng mắc kỹ thuật, lắng nghe góp ý và đồng hành cùng bạn trên con đường chinh phục tiếng Nhật N5 đến N1.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-300">
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
              <Clock size={14} className="text-pink-400" />
              <span>Thời gian hỗ trợ: 08:00 - 22:00 Hàng ngày</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
              <Headphones size={14} className="text-emerald-400" />
              <span>Phản hồi Zalo trong vòng 15 phút</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. OFFICIAL CONTACT CHANNELS (HOTLINE, ZALO, EMAIL) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Hotline */}
        <div className="p-5 rounded-3xl bg-white border border-pink-100 shadow-sm hover:border-pink-300 hover:shadow-lotus-sm transition-all group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 group-hover:scale-105 transition-transform">
              <Phone size={20} />
            </div>
            <span className="text-[10.5px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
              Hotline 24/7
            </span>
          </div>
          <h3 className="font-extrabold text-sm text-slate-900 mb-1">Đường dây nóng hỗ trợ</h3>
          <p className="text-xs text-slate-500 mb-3">Tư vấn trực tiếp và xử lý nhanh sự cố tài khoản.</p>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <a
              href="tel:0345698251"
              className="text-base font-black text-rose-600 hover:text-rose-700 tracking-wider font-mono hover:underline"
            >
              0345698251
            </a>
            <button
              type="button"
              onClick={() => copyToClipboard('0345698251', 'hotline')}
              className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
              title="Sao chép số điện thoại"
            >
              {copiedField === 'hotline' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        {/* Zalo */}
        <div className="p-5 rounded-3xl bg-white border border-pink-100 shadow-sm hover:border-blue-300 hover:shadow-lotus-sm transition-all group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:scale-105 transition-transform">
              <MessageCircle size={20} />
            </div>
            <span className="text-[10.5px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
              Nhắn tin Zalo
            </span>
          </div>
          <h3 className="font-extrabold text-sm text-slate-900 mb-1">Kênh Zalo Trực Tuyến</h3>
          <p className="text-xs text-slate-500 mb-3">Giải đáp thắc mắc bài học và nhận tài liệu bổ trợ.</p>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <a
              href="https://zalo.me/0345698251"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-black text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
            >
              <span>Mở chat Zalo: 0345698251</span>
              <ExternalLink size={12} />
            </a>
            <button
              type="button"
              onClick={() => copyToClipboard('0345698251', 'zalo')}
              className="p-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
              title="Sao chép số Zalo"
            >
              {copiedField === 'zalo' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        {/* Email */}
        <div className="p-5 rounded-3xl bg-white border border-pink-100 shadow-sm hover:border-pink-300 hover:shadow-lotus-sm transition-all group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center border border-pink-100 group-hover:scale-105 transition-transform">
              <Mail size={20} />
            </div>
            <span className="text-[10.5px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-pink-50 text-pink-600 border border-pink-100">
              Hòm thư điện tử
            </span>
          </div>
          <h3 className="font-extrabold text-sm text-slate-900 mb-1">Email Quản Trị Viên</h3>
          <p className="text-xs text-slate-500 mb-3">Tiếp nhận khiếu nại, phản hồi nội dung và hợp tác.</p>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <a
              href="mailto:thuatnguyen1204@gmail.com"
              className="text-xs font-bold text-pink-600 hover:text-pink-700 truncate max-w-[190px] hover:underline"
            >
              thuatnguyen1204@gmail.com
            </a>
            <button
              type="button"
              onClick={() => copyToClipboard('thuatnguyen1204@gmail.com', 'email')}
              className="p-1.5 rounded-lg bg-slate-50 hover:bg-pink-50 text-slate-500 hover:text-pink-600 transition-colors cursor-pointer"
              title="Sao chép email"
            >
              {copiedField === 'email' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── 3. DONATE / BANK TRANSFER (ỦNG HỘ PHÁT TRIỂN DỰ ÁN) ── */}
      <div className="p-6 sm:p-9 rounded-3xl bg-white border border-pink-200/90 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
            <Heart size={18} fill="#db2777" />
          </div>
          <span className="text-xs font-extrabold text-pink-600 uppercase tracking-wider">
            ĐỒNG HÀNH VÀ ỦNG HỘ DỰ ÁN
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2">
          Ủng Hộ Duy Trì Nền Tảng Học Tiếng Nhật HYPER
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed mb-6">
          HYPER Japanese được phát triển với sứ mệnh mang đến công nghệ học tiếng Nhật thông minh và hoàn toàn miễn phí cho tất cả mọi người. Sự đồng hành và ủng hộ tự nguyện của bạn là nguồn động lực to lớn giúp duy trì máy chủ, chi phí API AI và nâng cấp thêm nhiều tính năng mới.
        </p>

        {/* Quick Amount Selector */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-700 mb-2">
            Chọn định mức ủng hộ tùy tâm (Mã VietQR sẽ tự cập nhật số tiền):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {donateAmounts.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  sounds.playFlip();
                  setDonateAmount(item.value);
                }}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  donateAmount === item.value
                    ? 'border-pink-500 bg-pink-50/70 text-pink-700 ring-2 ring-pink-500/20 shadow-sm'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-pink-50/30 hover:border-pink-200 text-slate-700'
                }`}
              >
                <div className="text-sm font-black">{item.label}</div>
                <div className="text-[10.5px] text-slate-400 mt-0.5">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* QR Code & Banking Details Container */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-gradient-to-br from-pink-50/40 via-rose-50/20 to-purple-50/30 p-5 sm:p-7 rounded-3xl border border-pink-100">
          {/* Left: Dynamic VietQR Display */}
          <div className="md:col-span-5 flex flex-col items-center justify-center bg-white p-5 rounded-2xl border border-pink-200/80 shadow-sm">
            <div className="relative p-2 bg-white rounded-xl border border-slate-200 shadow-inner">
              <img
                src={qrUrl}
                alt="VietQR Chuyển Khoản Ủng Hộ"
                className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-lg"
              />
            </div>
            <p className="text-[11px] text-slate-500 text-center mt-3 mb-0 flex items-center gap-1 font-medium">
              <QrCode size={13} className="text-pink-600" />
              <span>Quét mã bằng app ngân hàng bất kỳ hoặc MoMo/ZaloPay</span>
            </p>
          </div>

          {/* Right: Explicit Bank Info */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Ngân hàng thụ hưởng
                </span>
                <span className="text-sm font-black text-slate-800">
                  {bankInfo.bankName}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10.5px] font-bold text-slate-400 block uppercase">
                    Số tài khoản / SĐT nhận
                  </span>
                  <span className="text-base font-black text-rose-600 font-mono tracking-wider">
                    {bankInfo.accountNumber}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(bankInfo.accountNumber, 'stk')}
                  className="px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedField === 'stk' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  <span>{copiedField === 'stk' ? 'Đã chép' : 'Sao chép STK'}</span>
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10.5px] font-bold text-slate-400 block uppercase">
                    Chủ tài khoản
                  </span>
                  <span className="text-sm font-black text-slate-900 tracking-wide">
                    {bankInfo.accountHolder}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(bankInfo.accountHolder, 'holder')}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedField === 'holder' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  <span>{copiedField === 'holder' ? 'Đã chép' : 'Sao chép tên'}</span>
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10.5px] font-bold text-slate-400 block uppercase">
                    Nội dung chuyển khoản
                  </span>
                  <span className="text-xs font-black text-pink-700 font-mono">
                    {bankInfo.memo}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(bankInfo.memo, 'memo')}
                  className="px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedField === 'memo' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  <span>{copiedField === 'memo' ? 'Đã chép' : 'Sao chép cú pháp'}</span>
                </button>
              </div>
            </div>

            <div className="p-3 bg-pink-100/60 rounded-xl text-[11px] text-pink-800 leading-relaxed font-medium">
              Xin chân thành cảm ơn tấm lòng và sự tin yêu của bạn dành cho HYPER Japanese! Chúc bạn đạt kết quả thật cao trong các kỳ thi JLPT sắp tới!
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. QUICK GUIDELINES & SHORTCUTS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Keyboard Shortcuts */}
        <div className="p-5 rounded-3xl bg-white border border-pink-100 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center">
            <Keyboard size={20} />
          </div>
          <h3 className="font-bold text-sm text-slate-900">Phím Tắt Bàn Phím</h3>
          <ul className="text-xs text-slate-600 space-y-2">
            <li className="flex justify-between items-center">
              <span>Lật thẻ Flashcard 3D:</span>
              <kbd className="px-2 py-0.5 rounded bg-slate-100 border text-[10px] font-mono font-bold">Space</kbd>
            </li>
            <li className="flex justify-between items-center">
              <span>Đánh dấu Cần ôn lại:</span>
              <kbd className="px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-mono font-bold">Phím 1</kbd>
            </li>
            <li className="flex justify-between items-center">
              <span>Đánh dấu Đã thành thạo:</span>
              <kbd className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-mono font-bold">Phím 2</kbd>
            </li>
          </ul>
        </div>

        {/* Card 2: Install Mobile PWA */}
        <div className="p-5 rounded-3xl bg-white border border-pink-100 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Smartphone size={20} />
          </div>
          <h3 className="font-bold text-sm text-slate-900">Cài Đặt Lên Điện Thoại</h3>
          <p className="text-xs text-slate-600 leading-relaxed mb-0">
            Mở Safari (iPhone) hoặc Chrome (Android), chọn <strong>"Thêm vào Màn hình chính"</strong> để có biểu tượng ứng dụng riêng, chạy mượt toàn màn hình không có thanh URL.
          </p>
        </div>

        {/* Card 3: Tokyo Speech Voice */}
        <div className="p-5 rounded-3xl bg-white border border-pink-100 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Zap size={20} />
          </div>
          <h3 className="font-bold text-sm text-slate-900">Phát Âm Chuẩn Tokyo</h3>
          <p className="text-xs text-slate-600 leading-relaxed mb-0">
            Toàn bộ từ vựng và ví dụ đều ứng dụng bộ phát âm cao độ Pitch Accent chuẩn Tokyo. Khi hỏi AI, hệ thống tự động tách giọng đọc tiếng Nhật và tiếng Việt song song.
          </p>
        </div>
      </div>

      {/* ── 5. EXPANDED FAQS ACCORDION ── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-pink-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <HelpCircle size={18} className="text-pink-600" />
            <span>CÂU HỎI THƯỜNG GẶP (FAQ)</span>
          </h2>
          <span className="text-xs font-bold text-slate-400">7 thắc mắc phổ biến</span>
        </div>

        <div className="space-y-2.5">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-pink-100 overflow-hidden transition-all bg-white"
            >
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full p-4 text-left font-bold text-xs sm:text-sm text-slate-800 bg-pink-50/20 hover:bg-pink-50/50 flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  size={16}
                  className={`text-pink-600 transition-transform duration-200 shrink-0 ml-2 ${openFaq === idx ? 'rotate-180' : ''}`}
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

      {/* ── 6. REAL FEEDBACK FORM (DISPATCH TO thuatnguyen1204@gmail.com) ── */}
      <div className="p-6 sm:p-9 rounded-3xl bg-white border border-pink-100 shadow-sm space-y-5">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2 mb-1">
            <MessageCircle size={20} className="text-pink-600" />
            <span>GỬI PHẢN HỒI HOẶC BÁO LỖI TRỰC TIẾP</span>
          </h2>
          <p className="text-xs text-slate-500 mb-0">
            Mọi ý kiến của bạn sẽ được gửi thẳng đến hòm thư <strong className="text-pink-700">thuatnguyen1204@gmail.com</strong> và phản hồi sớm nhất.
          </p>
        </div>

        {feedbackError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
            <span>{feedbackError}</span>
          </div>
        )}

        {feedbackSuccessMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span>{feedbackSuccessMsg}</span>
          </div>
        )}

        <form onSubmit={handleFeedbackSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Họ và tên của bạn
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Nguyễn Văn Nhật"
                value={feedback.name}
                onChange={(e) => setFeedback({ ...feedback, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500 bg-pink-50/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Email nhận phản hồi <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="email@example.com"
                value={feedback.email}
                onChange={(e) => setFeedback({ ...feedback, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500 bg-pink-50/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Số điện thoại / Zalo
              </label>
              <input
                type="tel"
                placeholder="0345698251"
                value={feedback.phone}
                onChange={(e) => setFeedback({ ...feedback, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500 bg-pink-50/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Chủ đề phản hồi
            </label>
            <select
              value={feedback.category}
              onChange={(e) => setFeedback({ ...feedback, category: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="bug">Báo lỗi phát âm / giao diện</option>
              <option value="feature">Đề xuất tính năng học mới</option>
              <option value="content">Góp ý nội dung giáo trình JLPT N5 - N1</option>
              <option value="general">Góp ý chung hoặc đề xuất hợp tác</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Nội dung chi tiết <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder="Vui lòng mô tả cụ thể vấn đề bạn gặp phải hoặc ý tưởng cải tiến của bạn để chúng tôi hỗ trợ tốt nhất..."
              value={feedback.message}
              onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500 bg-pink-50/20 leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-400">
              Thông tin sẽ được mã hóa an toàn và chuyển trực tiếp tới ban quản trị.
            </span>

            <button
              type="submit"
              disabled={feedbackLoading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 text-white font-bold text-xs shadow-lotus hover:scale-105 active:scale-95 transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              <Send size={14} />
              <span>{feedbackLoading ? 'Đang gửi phản hồi...' : 'Gửi thư phản hồi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
