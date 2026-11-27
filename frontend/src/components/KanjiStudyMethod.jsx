import React from 'react';
import {
  Eye,
  Mic2,
  PenTool,
  Repeat,
  Layers,
  CalendarDays,
  Target,
  Lightbulb,
  ListChecks,
  Edit3
} from 'lucide-react';

// Tab Phương pháp học Kanji: quy trình 5 bước, lịch ôn ngắt quãng, kế hoạch 4 tuần, mẹo thi
// ZERO ARROWS RULE: Không dùng ký tự mũi tên

const METHOD_STEPS = [
  {
    id: 'see',
    icon: Eye,
    title: 'Bước 1: Nhìn và chiết tự',
    tone: 'from-pink-500 to-rose-500',
    body: 'Tách chữ thành bộ thủ, gắn với một hình ảnh. Ví dụ 休 là người (亻) tựa cây (木) để nghỉ. Mỗi chữ chỉ cần 20 đến 30 giây.',
    goTo: 'vault',
    cta: 'Mở Kho Hán Tự'
  },
  {
    id: 'say',
    icon: Mic2,
    title: 'Bước 2: Đọc và nhớ Hán Việt',
    tone: 'from-fuchsia-500 to-pink-500',
    body: 'Đọc to âm On, âm Kun và âm Hán Việt. Âm Hán Việt giúp đoán nghĩa hàng loạt từ ghép, rất lợi thế với người Việt.',
    goTo: 'flashcard',
    cta: 'Luyện Flashcard'
  },
  {
    id: 'write',
    icon: PenTool,
    title: 'Bước 3: Viết tay đúng nét',
    tone: 'from-violet-500 to-fuchsia-500',
    body: 'Tô theo nét mờ, sau đó viết lại từ trí nhớ. Viết đúng thứ tự nét giúp nhớ mặt chữ lâu gấp nhiều lần so với chỉ nhìn.',
    goTo: 'writing',
    cta: 'Vào Tập Viết'
  },
  {
    id: 'compare',
    icon: Layers,
    title: 'Bước 4: Phân biệt chữ dễ nhầm',
    tone: 'from-amber-500 to-orange-500',
    body: 'Học theo cặp, ví dụ 末 và 未, 買 và 売. Biết điểm khác nhau giúp tránh bẫy ở Mondai 2 phần cách viết.',
    goTo: 'confusing',
    cta: 'Xem Chữ Dễ Nhầm'
  },
  {
    id: 'test',
    icon: Repeat,
    title: 'Bước 5: Kiểm tra và ôn ngắt quãng',
    tone: 'from-emerald-500 to-teal-500',
    body: 'Làm bài tập đúng dạng JLPT rồi ôn lại chữ sai theo lịch 1, 3, 7, 14, 30 ngày. Chữ nào sai hai lần liên tiếp, quay lại Bước 1.',
    goTo: 'practice',
    cta: 'Luyện Đề JLPT'
  }
];

const REVIEW_SCHEDULE = [
  { day: 'Ngày 1', note: 'Học mới' },
  { day: 'Ngày 3', note: 'Ôn lần 1' },
  { day: 'Ngày 7', note: 'Ôn lần 2' },
  { day: 'Ngày 14', note: 'Ôn lần 3' },
  { day: 'Ngày 30', note: 'Củng cố' }
];

const FOUR_WEEK_PLAN = [
  {
    week: 'Tuần 1',
    goal: 'Làm quen',
    items: ['Học 5 chữ mới mỗi ngày theo 5 bước', 'Chốt chủ đề số đếm và thời gian', 'Cuối tuần làm 1 bài tập 10 câu']
  },
  {
    week: 'Tuần 2',
    goal: 'Mở rộng',
    items: ['Tăng lên 7 chữ mới mỗi ngày', 'Ôn chữ của Tuần 1 theo lịch ngắt quãng', 'Học 2 cặp chữ dễ nhầm']
  },
  {
    week: 'Tuần 3',
    goal: 'Củng cố',
    items: ['Giữ 5 chữ mới, dành thời gian ôn chữ cũ', 'Mỗi ngày 1 lượt Phản Xạ 60 giây', 'Viết lại từ trí nhớ 10 chữ hay sai']
  },
  {
    week: 'Tuần 4',
    goal: 'Thi thử',
    items: ['Làm đề thi thử JLPT 15 câu mỗi 2 ngày', 'Xem lại giải thích các câu sai', 'Đặt mục tiêu đạt từ 80 phần trăm']
  }
];

const EXAM_TIPS = [
  { title: 'Mondai 1: Cách đọc', text: 'Chú ý âm dài, âm ngắt và biến âm đục như 学校 đọc là がっこう.' },
  { title: 'Mondai 2: Cách viết', text: 'Phương án sai thường chỉ khác một nét hoặc một bộ. Đối chiếu với tab Chữ Dễ Nhầm.' },
  { title: 'Mondai 3: Ngữ cảnh', text: 'Đọc cả câu trước khi chọn, dựa vào từ đi kèm để loại trừ phương án.' }
];

export default function KanjiStudyMethod({ onGo, level }) {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white border border-pink-100 shadow-sm p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
            <Lightbulb size={18} />
          </span>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
              Quy trình 5 bước học một chữ Hán JLPT {level}
            </h2>
            <p className="text-xs text-slate-500">Mỗi phiên khoảng 20 phút, làm đủ 5 bước để nhớ mặt chữ, âm và nghĩa.</p>
          </div>
        </div>

        <ol className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {METHOD_STEPS.map(function (s) {
            const Icon = s.icon;
            return (
              <li key={s.id} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className={'w-10 h-10 rounded-xl bg-gradient-to-br text-white flex items-center justify-center shadow-sm ' + s.tone}>
                    <Icon size={20} />
                  </span>
                  <h3 className="text-sm font-black text-slate-900 leading-snug">{s.title}</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed flex-1">{s.body}</p>
                <button
                  type="button"
                  onClick={function () { onGo(s.goTo); }}
                  className="self-start min-h-[40px] px-4 rounded-xl bg-white border border-pink-200 text-pink-700 text-xs font-black hover:bg-pink-50 transition-colors"
                >
                  {s.cta}
                </button>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="rounded-3xl bg-white border border-pink-100 shadow-sm p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CalendarDays size={18} />
          </span>
          <h2 className="text-base sm:text-lg font-black text-slate-900">Lịch ôn ngắt quãng</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {REVIEW_SCHEDULE.map(function (r, idx) {
            return (
              <div key={r.day} className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3 text-center">
                <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider block">Mốc {idx + 1}</span>
                <span className="text-sm font-black text-slate-900 block">{r.day}</span>
                <span className="text-[11px] text-slate-500">{r.note}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl bg-white border border-pink-100 shadow-sm p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
            <Target size={18} />
          </span>
          <h2 className="text-base sm:text-lg font-black text-slate-900">Kế hoạch 4 tuần</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {FOUR_WEEK_PLAN.map(function (w) {
            return (
              <div key={w.week} className="rounded-2xl border border-violet-100 bg-violet-50/40 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-violet-800">{w.week}</span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">{w.goal}</span>
                </div>
                <ul className="space-y-1.5">
                  {w.items.map(function (it) {
                    return (
                      <li key={it} className="text-xs text-slate-600 leading-snug flex gap-2">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                        <span>{it}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl bg-white border border-pink-100 shadow-sm p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <ListChecks size={18} />
          </span>
          <h2 className="text-base sm:text-lg font-black text-slate-900">Mẹo làm bài Kanji trong đề thi</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {EXAM_TIPS.map(function (t) {
            return (
              <div key={t.title} className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4">
                <h3 className="text-sm font-black text-amber-900 mb-1 flex items-center gap-1.5">
                  <Edit3 size={14} />
                  <span>{t.title}</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">{t.text}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
