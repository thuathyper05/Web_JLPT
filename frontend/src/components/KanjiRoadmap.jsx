import React, { useState } from 'react';
import { Check, ChevronDown, ChevronUp, Flag, BookOpen, Layers, Edit3, Sparkles, ListChecks, Play } from 'lucide-react';

// Lộ trình Kanji dạng đường đi theo chặng: mỗi chặng có 4 nhiệm vụ rõ ràng và chặng hiện tại được mở sẵn
// ZERO ARROWS RULE: Không dùng ký tự mũi tên

const MISSIONS = [
  { id: 'vault', label: 'Học chữ', icon: Layers },
  { id: 'writing', label: 'Viết nhớ', icon: Edit3 },
  { id: 'flashcard', label: 'Flashcard', icon: Sparkles },
  { id: 'quiz', label: 'Kiểm tra', icon: ListChecks }
];

export default function KanjiRoadmap({
  topics,
  topicStats,
  topicStyles,
  iconMap,
  level,
  getKanjiStatus,
  onOpenDetail,
  onVault,
  onQuiz,
  onGo
}) {
  const list = Array.isArray(topics) ? topics : [];

  const statOf = function (id) {
    return topicStats[id] || { total: 0, mastered: 0, percent: 0, items: [] };
  };

  let currentIdx = list.findIndex(function (t) {
    const s = statOf(t.id);
    return s.total > 0 && s.percent < 100;
  });
  if (currentIdx < 0) currentIdx = 0;

  const [openId, setOpenId] = useState(list[currentIdx] ? list[currentIdx].id : null);

  const totalAll = list.reduce(function (sum, t) { return sum + statOf(t.id).total; }, 0);
  const masteredAll = list.reduce(function (sum, t) { return sum + statOf(t.id).mastered; }, 0);
  const overall = totalAll > 0 ? Math.round((masteredAll / totalAll) * 100) : 0;
  const nextTopic = list[currentIdx];

  function runMission(id, topic) {
    if (id === 'vault') onVault(topic.id);
    else if (id === 'quiz') onQuiz(topic.id);
    else onGo(id);
  }

  return (
    <div className="space-y-4">
      {nextTopic && (
        <section className="rounded-3xl bg-gradient-to-r from-pink-600 to-rose-600 text-white p-4 sm:p-5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-pink-100 inline-flex items-center gap-1">
              <Flag size={12} />
              <span>Chặng tiếp theo cho JLPT {level}</span>
            </span>
            <h2 className="text-lg sm:text-xl font-black leading-tight truncate">
              Chặng {currentIdx + 1}: {nextTopic.name}
            </h2>
            <p className="text-xs text-pink-100 mt-0.5">
              Tiến độ toàn lộ trình {overall}% ({masteredAll}/{totalAll} chữ đã thuộc)
            </p>
          </div>
          <button
            type="button"
            onClick={function () { onVault(nextTopic.id); }}
            className="min-h-[48px] px-5 rounded-2xl bg-white text-pink-700 text-sm font-black inline-flex items-center justify-center gap-2 shadow-sm hover:bg-pink-50"
          >
            <Play size={16} />
            <span>Học tiếp ngay</span>
          </button>
        </section>
      )}

      <ol className="relative space-y-3">
        {list.map(function (topic, i) {
          const stat = statOf(topic.id);
          const style = topicStyles[topic.id] || topicStyles.numbers;
          const Icon = iconMap[topic.iconName] || BookOpen;
          const done = stat.total > 0 && stat.percent >= 100;
          const isCurrent = i === currentIdx && !done;
          const open = openId === topic.id;
          const isLast = i === list.length - 1;

          return (
            <li key={topic.id} className="relative flex gap-3 sm:gap-4">
              {/* Trục thời gian */}
              <div className="flex flex-col items-center shrink-0">
                <span
                  className={'w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-black border-2 z-10 ' + (done ? 'bg-emerald-500 border-emerald-500 text-white' : isCurrent ? 'bg-pink-600 border-pink-600 text-white shadow-md ring-4 ring-pink-100' : 'bg-white border-slate-300 text-slate-500')}
                >
                  {done ? <Check size={18} strokeWidth={3} /> : i + 1}
                </span>
                {!isLast && <span className={'w-0.5 flex-1 mt-1 ' + (done ? 'bg-emerald-300' : 'bg-slate-200')} />}
              </div>

              <div className={'flex-1 min-w-0 rounded-3xl border bg-white shadow-sm overflow-hidden transition-all ' + (isCurrent ? 'border-pink-300' : 'border-pink-100')}>
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={function () { setOpenId(open ? null : topic.id); }}
                  className="w-full text-left p-4 flex items-center gap-3"
                >
                  <span className={'w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ' + style.bgLight + ' ' + style.border}>
                    <Icon size={20} className={style.text} />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <strong className="text-sm sm:text-base font-black text-slate-900 truncate">{topic.name}</strong>
                      {isCurrent && (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">Đang học</span>
                      )}
                      {done && (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Hoàn thành</span>
                      )}
                    </span>
                    <span className="block text-xs text-slate-500 truncate">{topic.desc}</span>
                    <span className="mt-2 flex items-center gap-2">
                      <span className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <span className={'block h-full rounded-full transition-all duration-500 ' + style.progress} style={{ width: stat.percent + '%' }} />
                      </span>
                      <span className="text-[11px] font-black text-slate-600 shrink-0">{stat.mastered}/{stat.total}</span>
                    </span>
                  </span>
                  {open ? <ChevronUp size={18} className="text-slate-400 shrink-0" /> : <ChevronDown size={18} className="text-slate-400 shrink-0" />}
                </button>

                {open && (
                  <div className="px-4 pb-4 space-y-4 border-t border-pink-50 pt-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {MISSIONS.map(function (m, mi) {
                        const MIcon = m.icon;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={function () { runMission(m.id, topic); }}
                            className="min-h-[56px] rounded-2xl border border-pink-100 bg-pink-50/50 hover:bg-pink-100 transition-colors px-3 py-2 text-left flex items-center gap-2"
                          >
                            <MIcon size={16} className="text-pink-600 shrink-0" />
                            <span className="min-w-0">
                              <span className="block text-[10px] font-bold text-slate-400">Bước {mi + 1}</span>
                              <span className="block text-xs font-black text-slate-800 truncate">{m.label}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {stat.items.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        Chặng này chưa có chữ Hán nào trong cấp độ {level}.
                      </div>
                    ) : (
                      <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 gap-2">
                        {stat.items.map(function (k) {
                          const status = getKanjiStatus(k);
                          const mastered = status === 'mastered';
                          const review = status === 'needs_review';
                          return (
                            <button
                              key={k.id || k.kanji}
                              type="button"
                              onClick={function () { onOpenDetail(k); }}
                              className={'relative rounded-xl border py-2 flex flex-col items-center transition-all hover:-translate-y-0.5 ' + (mastered ? 'bg-emerald-50 border-emerald-200' : review ? 'bg-amber-50 border-amber-200' : 'bg-white border-pink-100 hover:border-pink-300')}
                            >
                              {mastered && <Check size={10} strokeWidth={3} className="absolute top-1 right-1 text-emerald-600" />}
                              {review && <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-500" />}
                              <span className="text-2xl font-black font-jp text-slate-800 leading-none">{k.kanji}</span>
                              <span className="text-[10px] font-bold text-amber-700 truncate max-w-full px-1 mt-1">{k.han_viet || '-'}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
