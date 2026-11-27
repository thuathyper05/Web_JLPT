import React, { useState, useEffect, useMemo } from 'react';
import { speakJapanese } from '../services/api';
import { sounds } from '../services/sounds';
import KanjiStrokeCanvas from './KanjiStrokeCanvas.jsx';
import { getKanjiMnemonicInfo } from '../data/kanjiTopics.js';
import {
  Eye,
  PenTool,
  Brain,
  ClipboardCheck,
  Volume2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookOpen,
  RotateCcw,
  CheckCircle2,
  Trophy,
  Flame
} from 'lucide-react';

// Phòng viết nhớ mặt chữ: quy trình 4 bước Xem, Tô, Nhớ, Tự chấm kèm sổ theo dõi chữ hay quên
// ZERO ARROWS RULE: Không dùng ký tự mũi tên

const STORAGE_KEY = 'jlpt_kanji_writing_log_v1';

const STEPS = [
  { id: 'see', label: 'Xem', icon: Eye },
  { id: 'trace', label: 'Tô', icon: PenTool },
  { id: 'recall', label: 'Nhớ', icon: Brain },
  { id: 'rate', label: 'Tự chấm', icon: ClipboardCheck }
];

function readLog() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (e) {
    return {};
  }
}

function todayKey() {
  const d = new Date();
  return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
}

export default function KanjiWritingStudio({ kanjiList, onMasterWord }) {
  const fullList = Array.isArray(kanjiList) ? kanjiList : [];
  const [log, setLog] = useState({});
  const [filter, setFilter] = useState('all');
  const [index, setIndex] = useState(0);
  const [step, setStep] = useState('see');
  const [revealed, setRevealed] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);
  const [sessionDone, setSessionDone] = useState(0);

  useEffect(function () {
    setLog(readLog());
  }, []);

  const list = useMemo(function () {
    if (filter === 'weak') {
      return fullList.filter(function (k) {
        const e = log[k.kanji];
        return e && e.lastResult !== 'good';
      });
    }
    if (filter === 'new') {
      return fullList.filter(function (k) { return !log[k.kanji]; });
    }
    return fullList;
  }, [fullList, filter, log]);

  const safeIndex = list.length > 0 ? Math.min(index, list.length - 1) : 0;
  const item = list[safeIndex] || null;

  const weakCount = fullList.filter(function (k) {
    const e = log[k.kanji];
    return e && e.lastResult !== 'good';
  }).length;
  const newCount = fullList.filter(function (k) { return !log[k.kanji]; }).length;
  const goodCount = fullList.filter(function (k) {
    const e = log[k.kanji];
    return e && e.lastResult === 'good';
  }).length;

  const todayCount = Object.keys(log).filter(function (key) {
    return log[key] && log[key].lastDay === todayKey();
  }).length;

  function goTo(i) {
    setIndex(i);
    setStep('see');
    setRevealed(false);
    setCanvasKey(function (v) { return v + 1; });
    sounds.playFlip();
  }

  function changeStep(id) {
    setStep(id);
    setRevealed(false);
    setCanvasKey(function (v) { return v + 1; });
    sounds.playFlip();
  }

  function saveResult(result) {
    if (!item) return;
    const next = Object.assign({}, log);
    const prev = next[item.kanji] || { good: 0, fail: 0 };
    next[item.kanji] = {
      good: prev.good + (result === 'good' ? 1 : 0),
      fail: prev.fail + (result === 'bad' ? 1 : 0),
      lastResult: result,
      lastDay: todayKey()
    };
    setLog(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      // Bỏ qua lỗi lưu trữ
    }
    setSessionDone(function (v) { return v + 1; });

    if (result === 'good') {
      sounds.playCorrect();
      if (typeof onMasterWord === 'function') onMasterWord(item, 'mastered');
    } else {
      sounds.playWrong();
      if (typeof onMasterWord === 'function' && result === 'bad') onMasterWord(item, 'needs_review');
    }

    if (safeIndex < list.length - 1) {
      goTo(safeIndex + 1);
    } else {
      goTo(0);
    }
  }

  if (fullList.length === 0) {
    return (
      <div className="p-10 text-center bg-white rounded-3xl border border-pink-100">
        <p className="text-sm text-slate-500">Chưa có dữ liệu chữ Hán để luyện viết.</p>
      </div>
    );
  }

  const info = item ? getKanjiMnemonicInfo(item.kanji, item.han_viet, item.meaning) : null;
  const strokeCount = item ? (item.stroke_count || item.stroke || 1) : 1;
  const stepIndex = STEPS.findIndex(function (s) { return s.id === step; });

  return (
    <div className="space-y-4">
      {/* Thống kê và bộ lọc */}
      <section className="rounded-3xl bg-white border border-pink-100 shadow-sm p-4 space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="rounded-2xl bg-pink-50 border border-pink-100 p-3 text-center">
            <span className="block text-[10px] font-bold uppercase text-slate-400">Hôm nay</span>
            <span className="text-lg font-black text-pink-700 inline-flex items-center gap-1">
              <Flame size={15} />
              {todayCount} chữ
            </span>
          </div>
          <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-3 text-center">
            <span className="block text-[10px] font-bold uppercase text-emerald-600">Viết nhớ tốt</span>
            <span className="text-lg font-black text-emerald-700">{goodCount}</span>
          </div>
          <div className="rounded-2xl bg-amber-50 border border-amber-100 p-3 text-center">
            <span className="block text-[10px] font-bold uppercase text-amber-600">Hay quên</span>
            <span className="text-lg font-black text-amber-700">{weakCount}</span>
          </div>
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3 text-center">
            <span className="block text-[10px] font-bold uppercase text-slate-400">Chưa viết</span>
            <span className="text-lg font-black text-slate-700">{newCount}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'Tất cả (' + fullList.length + ')' },
            { id: 'new', label: 'Chưa viết (' + newCount + ')' },
            { id: 'weak', label: 'Cần viết lại (' + weakCount + ')' }
          ].map(function (f) {
            const on = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={function () { setFilter(f.id); setIndex(0); setStep('see'); setRevealed(false); }}
                className={'min-h-[40px] px-3.5 rounded-xl text-xs font-extrabold transition-colors ' + (on ? 'bg-pink-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-pink-50')}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {list.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:thin]">
            {list.map(function (k, i) {
              const e = log[k.kanji];
              const dot = !e ? 'bg-slate-300' : e.lastResult === 'good' ? 'bg-emerald-500' : 'bg-amber-500';
              return (
                <button
                  key={k.kanji}
                  type="button"
                  aria-label={'Chọn chữ ' + k.kanji}
                  onClick={function () { goTo(i); }}
                  className={'relative shrink-0 w-11 h-11 rounded-xl border text-xl font-black font-jp transition-all ' + (i === safeIndex ? 'bg-pink-600 text-white border-pink-600 shadow-md' : 'bg-white text-slate-800 border-pink-100 hover:border-pink-300')}
                >
                  {k.kanji}
                  <span className={'absolute top-1 right-1 w-1.5 h-1.5 rounded-full ' + dot} />
                </button>
              );
            })}
          </div>
        )}
      </section>

      {!item ? (
        <div className="p-8 text-center bg-white rounded-3xl border border-pink-100 space-y-3">
          <Trophy size={32} className="mx-auto text-amber-500" />
          <p className="text-sm font-bold text-slate-700">Không còn chữ nào trong nhóm này. Làm tốt lắm.</p>
          <button
            type="button"
            onClick={function () { setFilter('all'); setIndex(0); }}
            className="min-h-[44px] px-5 rounded-xl bg-pink-600 text-white text-xs font-black"
          >
            Xem tất cả chữ
          </button>
        </div>
      ) : (
        <section className="rounded-3xl bg-white border border-pink-100 shadow-sm p-4 sm:p-6 space-y-5">
          {/* Thanh các bước */}
          <ol className="grid grid-cols-4 gap-2">
            {STEPS.map(function (s, i) {
              const Icon = s.icon;
              const active = s.id === step;
              const passed = i < stepIndex;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={function () { changeStep(s.id); }}
                    className={'w-full min-h-[52px] rounded-2xl border flex flex-col items-center justify-center gap-0.5 text-[11px] font-extrabold transition-all ' + (active ? 'bg-pink-600 border-pink-600 text-white shadow-md' : passed ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-pink-50')}
                  >
                    <Icon size={16} />
                    <span>{i + 1}. {s.label}</span>
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
            {/* Cột trái: thao tác theo bước */}
            <div className="space-y-3">
              {step === 'see' && (
                <div className="rounded-3xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100 p-5 text-center space-y-3">
                  <div className="text-8xl sm:text-9xl font-black font-jp text-slate-900 leading-none">{item.kanji}</div>
                  <div className="text-base font-black text-amber-700">
                    {item.han_viet} <span className="text-sm font-bold text-slate-500">{item.meaning}</span>
                  </div>
                  <p className="text-xs text-slate-600">{strokeCount} nét. Nhìn kỹ hình dạng và đọc to một lần rồi sang bước Tô.</p>
                  <button
                    type="button"
                    onClick={function () { speakJapanese(item.kanji); }}
                    className="min-h-[44px] px-5 rounded-xl bg-white border border-pink-200 text-pink-700 text-xs font-black inline-flex items-center gap-1.5"
                  >
                    <Volume2 size={15} />
                    <span>Nghe phát âm</span>
                  </button>
                </div>
              )}

              {step === 'trace' && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-600">Tô theo nét mờ. Viết đúng thứ tự từ trên xuống, trái sang phải. Tô 2 đến 3 lần.</p>
                  <KanjiStrokeCanvas key={'t' + canvasKey} kanjiChar={item.kanji} strokeCount={strokeCount} strokeTip={info ? info.strokeOrderTip : ''} />
                </div>
              )}

              {step === 'recall' && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-600">
                    Ô trống bên dưới. Dựa vào nghĩa <strong className="text-pink-700">{item.meaning}</strong> và âm Hán Việt <strong className="text-amber-700">{item.han_viet}</strong>, hãy viết lại chữ.
                  </p>
                  <KanjiStrokeCanvas key={'r' + canvasKey} kanjiChar="" strokeCount={strokeCount} strokeTip="" />
                  {revealed ? (
                    <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-center">
                      <span className="block text-[11px] font-bold text-emerald-700">Chữ mẫu để đối chiếu</span>
                      <span className="text-6xl font-black font-jp text-slate-900">{item.kanji}</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={function () { setRevealed(true); sounds.playFlip(); }}
                      className="w-full min-h-[44px] rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black inline-flex items-center justify-center gap-1.5"
                    >
                      <Eye size={15} />
                      <span>Hiện chữ mẫu để đối chiếu</span>
                    </button>
                  )}
                </div>
              )}

              {step === 'rate' && (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-600">Bạn viết lại từ trí nhớ được đến đâu? Hãy chấm thật lòng để hệ thống nhắc ôn đúng chữ.</p>
                  <button
                    type="button"
                    onClick={function () { saveResult('good'); }}
                    className="w-full min-h-[52px] rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm inline-flex items-center justify-center gap-2 shadow-sm"
                  >
                    <CheckCircle2 size={18} />
                    <span>Nhớ chắc, viết đúng hết</span>
                  </button>
                  <button
                    type="button"
                    onClick={function () { saveResult('ok'); }}
                    className="w-full min-h-[52px] rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-black text-sm inline-flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Brain size={18} />
                    <span>Còn lưng chừng, sai vài nét</span>
                  </button>
                  <button
                    type="button"
                    onClick={function () { saveResult('bad'); }}
                    className="w-full min-h-[52px] rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-sm inline-flex items-center justify-center gap-2 shadow-sm"
                  >
                    <RotateCcw size={18} />
                    <span>Quên, cần viết lại sau</span>
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  disabled={stepIndex === 0}
                  onClick={function () { changeStep(STEPS[stepIndex - 1].id); }}
                  className="min-h-[44px] px-4 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold inline-flex items-center gap-1 disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                  <span>Bước trước</span>
                </button>
                <button
                  type="button"
                  disabled={stepIndex === STEPS.length - 1}
                  onClick={function () { changeStep(STEPS[stepIndex + 1].id); }}
                  className="min-h-[44px] px-4 rounded-xl bg-pink-600 text-white text-xs font-black inline-flex items-center gap-1 disabled:opacity-40"
                >
                  <span>Bước tiếp</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Cột phải: kiến thức hỗ trợ ghi nhớ */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-center rounded-2xl bg-slate-50 border border-slate-200 p-3">
                <div>
                  <span className="block text-[10px] font-bold uppercase text-slate-400">Âm On</span>
                  <span className="font-jp font-black text-pink-700 text-sm">{item.onyomi || '-'}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase text-slate-400">Âm Kun</span>
                  <span className="font-jp font-black text-emerald-700 text-sm">{item.kunyomi || '-'}</span>
                </div>
              </div>

              {info && info.radicals && info.radicals.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-extrabold text-slate-700 inline-flex items-center gap-1.5">
                    <BookOpen size={14} className="text-pink-600" />
                    <span>Các bộ thủ tạo nên chữ</span>
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {info.radicals.map(function (rad, i) {
                      return (
                        <div key={i} className="p-2 rounded-xl bg-white border border-slate-200 flex items-center gap-2">
                          <span className="text-xl font-black font-jp text-pink-600">{rad.char}</span>
                          <div className="min-w-0">
                            <strong className="block text-[11px] text-slate-800 truncate">{rad.name}</strong>
                            <span className="block text-[10px] text-slate-500 truncate">{rad.meaning}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {info && info.mnemonic && (
                <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3.5 space-y-1">
                  <span className="text-xs font-black text-amber-800 inline-flex items-center gap-1">
                    <Sparkles size={13} />
                    <span>Mẹo nhớ mặt chữ</span>
                  </span>
                  <p className="text-xs text-amber-900 leading-relaxed">{info.mnemonic}</p>
                </div>
              )}

              {info && info.strokeOrderTip && (
                <div className="rounded-2xl bg-sky-50 border border-sky-200 p-3.5">
                  <span className="text-xs font-black text-sky-800 block mb-1">Thứ tự nét</span>
                  <p className="text-xs text-sky-900 leading-relaxed">{info.strokeOrderTip}</p>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                <span>Chữ {safeIndex + 1} / {list.length}</span>
                <span>Phiên này: {sessionDone} chữ đã chấm</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={function () { goTo(safeIndex > 0 ? safeIndex - 1 : list.length - 1); }}
                  className="flex-1 min-h-[44px] rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold"
                >
                  Chữ trước
                </button>
                <button
                  type="button"
                  onClick={function () { goTo(safeIndex < list.length - 1 ? safeIndex + 1 : 0); }}
                  className="flex-1 min-h-[44px] rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold"
                >
                  Chữ sau
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
