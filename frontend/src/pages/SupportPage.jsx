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
  Award,
  Search,
  CheckCheck
} from 'lucide-react';

export default function SupportPage() {
  const { user } = useApp();

  const [openFaq, setOpenFaq] = useState(null);
  const [faqSearch, setFaqSearch] = useState('');
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
  const [donateAmount, setDonateAmount] = useState(50000);
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
      id: 1,
      category: 'webapp',
      q: 'Hệ thống Web App có hoạt động ngoại tuyến (Offline) được không?',
      a: 'Hoàn toàn được. Hệ thống HYPER Japanese được thiết kế tối ưu với bộ nhớ đệm Cache-First. Toàn bộ kho từ vựng bài học, thẻ Flashcard 3D và các bài tập thực hành đều được lưu trên thiết bị của bạn, giúp bạn học mượt mà bất kể đường truyền mạng.'
    },
    {
      id: 2,
      category: 'pwa',
      q: 'Làm thế nào để cài đặt Web App lên màn hình chính điện thoại (PWA)?',
      a: 'Trên iPhone (Safari): Bấm vào nút Chia sẻ (biểu tượng mũi tên hướng lên ở thanh dưới) và chọn "Thêm vào Màn hình chính". Trên thiết bị Android (Chrome): Bấm vào dấu 3 chấm ở góc trên bên phải và chọn "Cài đặt ứng dụng" hoặc "Thêm vào Màn hình chính".'
    },
    {
      id: 3,
      category: 'account',
      q: 'Tiến độ học tập và chuỗi ngày học có được lưu an toàn không?',
      a: 'Có. Khi bạn chưa đăng nhập, tiến độ được lưu trên trình duyệt máy bạn. Khi bạn đăng nhập bằng Google, Facebook hoặc tài khoản học viên, toàn bộ từ vựng đã học, từ thành thạo và chuỗi ngày học liên tiếp (Streak) sẽ được đồng bộ tự động lên cơ sở dữ liệu đám mây PostgreSQL.'
    },
    {
      id: 4,
      category: 'study',
      q: 'Làm sao để chuyển đổi cấp độ học từ N5 lên N4, N3, N2, N1?',
      a: 'Bạn chỉ cần bấm vào nhãn "Cấp độ N5" trên thanh điều hướng đầu trang. Danh sách 5 cấp độ từ N5 đến N1 sẽ hiện ra để bạn chuyển đổi tức thì. Toàn bộ từ vựng, ngữ pháp và trợ lý AI sẽ tự động đồng bộ theo cấp độ bạn chọn.'
    },
    {
      id: 5,
      category: 'audio',
      q: 'Tại sao giọng đọc âm thanh trong bài học lại phát âm chuẩn xác như vậy?',
      a: 'HYPER Japanese sử dụng công nghệ giọng đọc tổng hợp giọng bản xứ Tokyo chuẩn cao độ (Pitch Accent). Riêng ở phần hội thoại cùng AI Sensei, hệ thống ứng dụng thuật toán song ngữ thông minh tự động đọc câu tiếng Nhật bằng giọng Tokyo và phần giải thích bằng tiếng Việt chuẩn ngữ điệu.'
    },
    {
      id: 6,
      category: 'security',
      q: 'Tôi bị quên mật khẩu tài khoản thì lấy lại bằng cách nào?',
      a: 'Tại khung đăng nhập, bạn chọn "Quên mật khẩu?", nhập địa chỉ email đã đăng ký. Hệ thống sẽ cấp mã xác thực OTP 6 chữ số gửi thẳng đến email của bạn để bạn thiết lập mật khẩu mới an toàn trong 30 giây.'
    },
    {
      id: 7,
      category: 'donate',
      q: 'Khoản đóng góp ủng hộ (Donate) của tôi sẽ được sử dụng vào mục đích gì?',
      a: 'Mọi khoản đóng góp của học viên đều được sử dụng 100% để thanh toán chi phí duy trì máy chủ tốc độ cao, bản quyền token AI Gemini hỗ trợ giải đáp 24/7 và duy trì nền tảng học tập chất lượng cao hoàn toàn miễn phí cho cộng đồng.'
    }
  ];

  const filteredFaqs = faqs.filter(
    (item) =>
      item.q.toLowerCase().includes(faqSearch.toLowerCase().trim()) ||
      item.a.toLowerCase().includes(faqSearch.toLowerCase().trim())
  );

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
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in slide-in-from-bottom-3 duration-500">
      {/* ── 1. COMPACT PREMIUM HEADER BANNER ── */}
      <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white relative overflow-hidden shadow-md border border-pink-900/30">
        <div className="absolute right-4 -top-6 text-white/5 font-jp font-black text-8xl pointer-events-none select-none">
          援
        </div>
        <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-pink-500/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/20 border border-pink-400/30 text-pink-300 text-xs font-bold mb-2.5 backdrop-blur-md">
            <LifeBuoy size={13} className="text-pink-400" />
            <span>TRUNG TÂM TRỢ GIÚP HỌC VIÊN CHÍNH THỨC</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug mb-1.5">
            Hỗ Trợ & Đồng Hành Cùng Học Viên HYPER JLPT
          </h1>
          <p className="text-xs text-pink-100/80 leading-relaxed mb-4 max-w-2xl">
            Đội ngũ quản trị viên HYPER Japanese sẵn sàng hỗ trợ giải đáp mọi vướng mắc kỹ thuật, lắng nghe góp ý và đồng hành cùng bạn trên con đường chinh phục tiếng Nhật N5 đến N1.
          </p>

          <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold text-slate-300">
            <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
              <Clock size={13} className="text-pink-400" />
              <span>Thời gian trực: 08:00 - 22:00 Hàng ngày</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
              <Headphones size={13} className="text-emerald-400" />
              <span>Phản hồi Zalo trong 15 phút</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. OFFICIAL CONTACT CHANNELS (COMPACT 3 CARDS) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Hotline */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-pink-300 hover:shadow-sm transition-all group">
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 group-hover:scale-105 transition-transform">
              <Phone size={17} />
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
              Hotline 24/7
            </span>
          </div>
          <h3 className="font-extrabold text-xs text-slate-900 mb-0.5">Đường dây nóng hỗ trợ</h3>
          <p className="text-[11px] text-slate-500 mb-2">Tư vấn trực tiếp và xử lý nhanh sự cố.</p>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <a
              href="tel:0345698251"
              className="text-sm font-black text-rose-600 hover:text-rose-700 tracking-wider font-mono hover:underline"
            >
              0345698251
            </a>
            <button
              type="button"
              onClick={() => copyToClipboard('0345698251', 'hotline')}
              className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
              title="Sao chép số điện thoại"
            >
              {copiedField === 'hotline' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
            </button>
          </div>
        </div>

        {/* Zalo */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-300 hover:shadow-sm transition-all group">
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:scale-105 transition-transform">
              <MessageCircle size={17} />
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
              Nhắn tin Zalo
            </span>
          </div>
          <h3 className="font-extrabold text-xs text-slate-900 mb-0.5">Kênh Zalo Trực Tuyến</h3>
          <p className="text-[11px] text-slate-500 mb-2">Giải đáp thắc mắc và gửi tài liệu.</p>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <a
              href="https://zalo.me/0345698251"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-black text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
            >
              <span>Mở chat Zalo</span>
              <ExternalLink size={12} />
            </a>
            <button
              type="button"
              onClick={() => copyToClipboard('0345698251', 'zalo')}
              className="p-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
              title="Sao chép số Zalo"
            >
              {copiedField === 'zalo' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
            </button>
          </div>
        </div>

        {/* Email */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-pink-300 hover:shadow-sm transition-all group">
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center border border-pink-100 group-hover:scale-105 transition-transform">
              <Mail size={17} />
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-pink-50 text-pink-600 border border-pink-100">
              Hòm thư điện tử
            </span>
          </div>
          <h3 className="font-extrabold text-xs text-slate-900 mb-0.5">Hòm Thư Quản Trị</h3>
          <p className="text-[11px] text-slate-500 mb-2">Tiếp nhận khiếu nại và hợp tác.</p>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <a
              href="mailto:thuatnguyen1204@gmail.com"
              className="text-xs font-black text-pink-600 hover:text-pink-700 truncate max-w-[170px] hover:underline"
              title="thuatnguyen1204@gmail.com"
            >
              thuatnguyen1204@gmail.com
            </a>
            <button
              type="button"
              onClick={() => copyToClipboard('thuatnguyen1204@gmail.com', 'email')}
              className="p-1.5 rounded-lg bg-slate-50 hover:bg-pink-50 text-slate-500 hover:text-pink-600 transition-colors cursor-pointer shrink-0 ml-1"
              title="Sao chép địa chỉ Email"
            >
              {copiedField === 'email' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── 3. DONATION / BANK TRANSFER OVERHAUL (MÃ QR THẬT MBBANK ĐÃ THAY) ── */}
      <div className="p-5 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-extrabold">
            <Heart size={13} className="text-rose-600 fill-rose-500" />
            <span>ĐỒNG HÀNH & ỦNG HỘ NỀN TẢNG</span>
          </div>
          <span className="text-[11px] font-bold text-slate-400">MBBank Chuyển Khoản 24/7</span>
        </div>

        <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mb-1.5">
          Ủng Hộ Duy Trì Nền Tảng Học Tiếng Nhật HYPER
        </h2>
        <p className="text-xs text-slate-500 max-w-2xl leading-relaxed mb-5">
          HYPER Japanese được phát triển miễn phí vì cộng đồng học tiếng Nhật. Mọi đóng góp tự nguyện giúp duy trì máy chủ tốc độ cao và chi phí API AI thông minh hỗ trợ 24/7.
        </p>

        {/* Quick Amount Selector */}
        <div className="mb-5">
          <label className="block text-xs font-bold text-slate-700 mb-2">
            Chọn định mức ủng hộ tùy tâm:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {donateAmounts.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  sounds.playFlip();
                  setDonateAmount(item.value);
                }}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  donateAmount === item.value
                    ? 'border-pink-500 bg-pink-50/70 text-pink-700 ring-2 ring-pink-500/20 shadow-xs'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-pink-50/30 hover:border-pink-200 text-slate-700'
                }`}
              >
                <div className="text-xs font-black">{item.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* QR Code & Banking Details Container */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 bg-gradient-to-br from-slate-50 via-rose-50/20 to-pink-50/30 p-4 sm:p-6 rounded-2xl border border-slate-200/90">
          {/* Left: Real Uploaded MBBank QR Display */}
          <div className="md:col-span-5 flex flex-col items-center justify-center bg-white p-4 rounded-xl border border-pink-200/80 shadow-xs">
            <div className="relative p-1.5 bg-white rounded-xl border border-slate-200 shadow-inner max-w-[240px]">
              <img
                src="/mbbank_qr.png"
                alt="Mã QR Chuyển Khoản Ngân Hàng MBBank NGUYEN VAN THUAT"
                className="w-full h-auto object-contain rounded-lg"
              />
            </div>
            <p className="text-[11px] text-slate-500 text-center mt-2.5 mb-0 flex items-center gap-1 font-semibold">
              <QrCode size={13} className="text-rose-600" />
              <span>Quét mã bằng App Ngân hàng hoặc MoMo / Napas 247</span>
            </p>
          </div>

          {/* Right: Explicit Bank Info */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-3">
            <div className="space-y-2.5">
              <div>
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
                  Ngân hàng thụ hưởng
                </span>
                <span className="text-xs sm:text-sm font-black text-slate-800">
                  {bankInfo.bankName}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    Số tài khoản / SĐT nhận
                  </span>
                  <span className="text-sm sm:text-base font-black text-rose-600 font-mono tracking-wider">
                    {bankInfo.accountNumber}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(bankInfo.accountNumber, 'accNum')}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedField === 'accNum' ? (
                    <>
                      <Check size={12} className="text-emerald-600" />
                      <span>Đã sao chép</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Sao chép</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    Tên chủ tài khoản
                  </span>
                  <span className="text-xs sm:text-sm font-black text-slate-900 tracking-wide">
                    {bankInfo.accountHolder}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(bankInfo.accountHolder, 'accHolder')}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedField === 'accHolder' ? (
                    <>
                      <Check size={12} className="text-emerald-600" />
                      <span>Đã sao chép</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Sao chép</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    Nội dung chuyển khoản
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 font-mono">
                    {bankInfo.memo}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(bankInfo.memo, 'memo')}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedField === 'memo' ? (
                    <>
                      <Check size={12} className="text-emerald-600" />
                      <span>Đã sao chép</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Sao chép</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-2">
              <ShieldCheck size={15} className="text-emerald-600 shrink-0" />
              <span>Giao dịch ngân hàng 24/7 an toàn tuyệt đối qua Napas 247 và cổng VietQR quốc gia.</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. REAL FEEDBACK FORM (DISPATCH TO thuatnguyen1204@gmail.com) ── */}
      <div className="p-5 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center border border-pink-100">
            <Send size={16} />
          </div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mb-0">
            Gửi Góp Ý & Báo Lỗi Trực Tiếp Đến Quản Trị Viên
          </h2>
        </div>
        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
          Mọi phản hồi được hệ thống đóng gói và gửi thông báo trực tiếp đến hộp thư của quản trị viên (thuatnguyen1204@gmail.com).
        </p>

        {feedbackSuccessMsg && (
          <div className="p-3.5 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{feedbackSuccessMsg}</span>
          </div>
        )}

        {feedbackError && (
          <div className="p-3.5 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
            <span>{feedbackError}</span>
          </div>
        )}

        <form onSubmit={handleFeedbackSubmit} className="space-y-3.5">
          {/* Category Selector Chips */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Danh mục phản hồi:
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'bug', label: 'Báo lỗi phát âm / giao diện' },
                { id: 'feature', label: 'Đề xuất tính năng mới' },
                { id: 'content', label: 'Góp ý từ vựng / bài học' },
                { id: 'general', label: 'Khác' }
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    sounds.playFlip();
                    setFeedback({ ...feedback, category: c.id });
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    feedback.category === c.id
                      ? 'bg-pink-600 text-white border-pink-600 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Họ và tên học viên:
              </label>
              <input
                type="text"
                placeholder="Nguyễn Văn A"
                value={feedback.name}
                onChange={(e) => setFeedback({ ...feedback, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Địa chỉ Email nhận phản hồi:
              </label>
              <input
                type="email"
                placeholder="hocvien@gmail.com"
                value={feedback.email}
                onChange={(e) => setFeedback({ ...feedback, email: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Số điện thoại / Zalo (Nếu có):
              </label>
              <input
                type="tel"
                placeholder="0345698251"
                value={feedback.phone}
                onChange={(e) => setFeedback({ ...feedback, phone: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500 bg-slate-50/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nội dung góp ý chi tiết: <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Mô tả cụ thể vấn đề hoặc ý tưởng của bạn để ban quản trị hỗ trợ tốt nhất..."
              value={feedback.message}
              onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500 bg-slate-50/50 leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400">
              * Quản trị viên cam kết bảo mật thông tin liên hệ của bạn.
            </span>
            <button
              type="submit"
              disabled={feedbackLoading || !feedback.message.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-black text-xs shadow-sm hover:from-pink-500 hover:to-rose-500 active:scale-95 transition-all disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
            >
              <Send size={13} />
              <span>{feedbackLoading ? 'Đang gửi thư...' : 'Gửi phản hồi ngay'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* ── 5. SEARCHABLE FAQs ACCORDION ── */}
      <div className="p-5 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-pink-600 uppercase tracking-wider mb-1">
              <HelpCircle size={14} />
              <span>GIẢI ĐÁP NHANH</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mb-0">
              Câu Hỏi Thường Gặp Của Học Viên
            </h2>
          </div>

          {/* Quick FAQ search */}
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm câu hỏi..."
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500 bg-slate-50/50"
            />
          </div>
        </div>

        <div className="space-y-2.5 pt-1">
          {filteredFaqs.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              Không tìm thấy câu hỏi phù hợp với từ khóa "{faqSearch}". Bạn có thể gửi câu hỏi ở mục phản hồi bên trên!
            </div>
          ) : (
            filteredFaqs.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border transition-all ${
                    isOpen ? 'border-pink-300 bg-pink-50/20 shadow-xs' : 'border-slate-200 bg-white hover:border-pink-200'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-3.5 text-left flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <span className="font-bold text-xs sm:text-sm text-slate-800 leading-snug">
                      {item.q}
                    </span>
                    <ChevronDown
                      size={15}
                      className={`text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-pink-600' : ''}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-3.5 pb-3.5 pt-0 text-xs text-slate-600 leading-relaxed border-t border-pink-100/60 mt-1 animate-in fade-in duration-200">
                      <p className="mb-0 pt-2">{item.a}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── 6. SYSTEM GUIDE & KEYBOARD SHORTCUTS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
            <Smartphone size={18} />
          </div>
          <div>
            <h4 className="font-black text-xs text-slate-900 mb-1">Cài Đặt WebApp PWA</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed mb-0">
              Nhấn "Thêm vào màn hình chính" trên Safari (iOS) hoặc Chrome (Android) để mở ứng dụng toàn màn hình không có thanh URL trình duyệt.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <Keyboard size={18} />
          </div>
          <div>
            <h4 className="font-black text-xs text-slate-900 mb-1">Phím Tắt Học Tập Nhanh</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed mb-0">
              Phím Space: Lật thẻ Flashcard 3D. Phím 1, 2, 3, 4: Chọn đáp án bài trắc nghiệm trắc nghiệm JLPT nhanh chóng.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
