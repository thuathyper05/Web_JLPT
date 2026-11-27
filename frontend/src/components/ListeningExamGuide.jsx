import React from 'react';
import { ListChecks, MessageCircleQuestion, Zap, Clock } from 'lucide-react';

// Thẻ hướng dẫn nhanh các dạng bài Choukai, bấm vào để lọc đúng dạng bài
// ZERO ARROWS RULE: Không dùng ký tự mũi tên

const MONDAI_GUIDE = [
  {
    id: 'mondai1',
    icon: ListChecks,
    name: 'Mondai 1',
    jp: '課題理解',
    tone: 'from-pink-500 to-rose-500',
    soft: 'bg-pink-50 border-pink-200 text-pink-800',
    what: 'Nghe để biết nhân vật phải làm gì tiếp theo.',
    tip: 'Nghe câu hỏi trước, chú ý từ chỉ thứ tự như まず, それから, そのあと.',
    time: 'Có 15 giây đọc phương án'
  },
  {
    id: 'mondai2',
    icon: MessageCircleQuestion,
    name: 'Mondai 2',
    jp: 'ポイント理解',
    tone: 'from-violet-500 to-fuchsia-500',
    soft: 'bg-violet-50 border-violet-200 text-violet-800',
    what: 'Nghe để nắm điểm mấu chốt như lý do hoặc nguyên nhân.',
    tip: 'Bẫy hay gặp là lời đính chính sau でも, しかし, 実は.',
    time: 'Có câu hỏi đọc trước khi nghe'
  },
  {
    id: 'mondai4',
    icon: Zap,
    name: 'Mondai 4',
    jp: '即時応答',
    tone: 'from-amber-500 to-orange-500',
    soft: 'bg-amber-50 border-amber-200 text-amber-800',
    what: 'Nghe một câu ngắn và chọn câu đáp lại phù hợp.',
    tip: 'Không có hình ảnh, chỉ có âm thanh. Loại ngay đáp án sai ngữ cảnh.',
    time: 'Chỉ nghe một lần, phản xạ nhanh'
  }
];

export default function ListeningExamGuide({ active, onSelect }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {MONDAI_GUIDE.map(function (m) {
        const Icon = m.icon;
        const isActive = active === m.id;
        return (
          <button
            key={m.id}
            type="button"
            aria-pressed={isActive}
            onClick={function () { onSelect(isActive ? 'all' : m.id); }}
            className={
              'text-left rounded-2xl border p-4 space-y-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 ' +
              (isActive ? 'bg-white border-pink-400 shadow-md ring-2 ring-pink-200' : 'bg-white border-slate-200 hover:border-pink-300 hover:shadow-sm')
            }
          >
            <div className="flex items-center gap-3">
              <span className={'w-10 h-10 rounded-xl bg-gradient-to-br text-white flex items-center justify-center shadow-sm shrink-0 ' + m.tone}>
                <Icon size={20} />
              </span>
              <div className="min-w-0">
                <span className="block text-sm font-black text-slate-900 leading-tight">{m.name}</span>
                <span className="block text-[11px] font-jp font-bold text-slate-500">{m.jp}</span>
              </div>
            </div>
            <p className="text-xs font-bold text-slate-700 leading-snug">{m.what}</p>
            <p className="text-[11px] text-slate-500 leading-snug">{m.tip}</p>
            <span className={'inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-1 rounded-full border ' + m.soft}>
              <Clock size={11} />
              <span>{m.time}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
