import React, { useState, useEffect } from 'react';
import { CalendarCheck, Check, Circle, Timer } from 'lucide-react';

// Kế hoạch học trong ngày: tick từng nhiệm vụ, tự đặt lại mỗi ngày, lưu theo thiết bị
// ZERO ARROWS RULE: Không dùng ký tự mũi tên

function todayKey() {
  const d = new Date();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return d.getFullYear() + '-' + (m < 10 ? '0' + m : m) + '-' + (day < 10 ? '0' + day : day);
}

export default function DailyPlanCard({ storageKey, title, tasks, onGo }) {
  const list = Array.isArray(tasks) ? tasks : [];
  const [done, setDone] = useState({});

  useEffect(function () {
    try {
      const raw = localStorage.getItem(storageKey);
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed && parsed.date === todayKey() && parsed.done) {
        setDone(parsed.done);
      } else {
        setDone({});
      }
    } catch (e) {
      setDone({});
    }
  }, [storageKey]);

  function toggle(id) {
    const next = Object.assign({}, done);
    next[id] = !next[id];
    setDone(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify({ date: todayKey(), done: next }));
    } catch (e) {
      // Bỏ qua lỗi lưu trữ
    }
  }

  const doneCount = list.filter(function (t) { return done[t.id]; }).length;
  const percent = list.length > 0 ? Math.round((doneCount / list.length) * 100) : 0;
  const totalMinutes = list.reduce(function (sum, t) { return sum + (t.minutes || 0); }, 0);

  return (
    <section className="rounded-3xl bg-white border border-pink-100 shadow-sm p-4 sm:p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
            <CalendarCheck size={18} />
          </span>
          <div>
            <h2 className="text-sm sm:text-base font-black text-slate-900 leading-tight">{title}</h2>
            <span className="text-[11px] font-semibold text-slate-500 inline-flex items-center gap-1">
              <Timer size={12} />
              <span>Khoảng {totalMinutes} phút mỗi ngày</span>
            </span>
          </div>
        </div>
        <span className="text-xs font-black text-pink-700 bg-pink-50 border border-pink-100 px-2.5 py-1 rounded-full">
          {doneCount}/{list.length} hoàn thành
        </span>
      </div>

      <div className="w-full h-2 rounded-full bg-pink-100/70 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-500" style={{ width: percent + '%' }} />
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {list.map(function (t) {
          const isDone = !!done[t.id];
          return (
            <li
              key={t.id}
              className={'flex items-start gap-3 p-3 rounded-2xl border transition-colors ' + (isDone ? 'bg-emerald-50/70 border-emerald-200' : 'bg-slate-50/70 border-slate-200')}
            >
              <button
                type="button"
                aria-label={(isDone ? 'Bỏ đánh dấu: ' : 'Đánh dấu hoàn thành: ') + t.label}
                onClick={function () { toggle(t.id); }}
                className={'mt-0.5 w-6 h-6 shrink-0 rounded-full flex items-center justify-center border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 ' + (isDone ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-300 text-transparent hover:border-pink-400')}
              >
                {isDone ? <Check size={14} /> : <Circle size={14} />}
              </button>
              <div className="min-w-0 flex-1">
                <p className={'text-xs sm:text-sm font-extrabold leading-snug ' + (isDone ? 'text-emerald-800 line-through decoration-emerald-300' : 'text-slate-800')}>
                  {t.label}
                </p>
                <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{t.hint}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] font-bold text-slate-400">{t.minutes} phút</span>
                  {t.goTo && typeof onGo === 'function' ? (
                    <button
                      type="button"
                      onClick={function () { onGo(t.goTo); }}
                      className="text-[11px] font-black text-pink-600 hover:text-pink-800 underline underline-offset-2"
                    >
                      Làm ngay
                    </button>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
