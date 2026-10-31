import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Sparkles, Lightbulb, BookOpen, CheckCircle, AlertTriangle, MessageSquare } from 'lucide-react';

export default function AiExplainModal() {
  const { aiModal, closeAiModal } = useApp();

  if (!aiModal.isOpen) return null;

  const { title, data, loading } = aiModal;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-pink-100 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-600 via-rose-500 to-pink-500 px-6 py-4.5 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h4 className="font-extrabold text-base text-white leading-tight mb-0">
                {title || 'Trợ Lý AI Phân Tích'}
              </h4>
              <span className="text-[11px] text-pink-100 font-medium">
                Gợi ý & Mẹo ghi nhớ siêu tốc chuẩn N5
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={closeAiModal}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/15 transition-colors"
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {loading ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-pink-600 animate-pulse">
                AI Sensei đang phân tích ngữ cảnh và mẹo nhớ cho bạn...
              </p>
            </div>
          ) : (
            <>
              {/* Nuance / Core Concept */}
              {(data?.nuance || data?.core_concept || data?.why_correct) && (
                <div className="p-4 rounded-2xl bg-pink-50/60 border border-pink-100">
                  <div className="flex items-center gap-2 text-pink-700 font-bold text-xs uppercase tracking-wider mb-1.5">
                    <BookOpen size={15} />
                    <span>Bản chất & Ngữ cảnh</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed mb-0">
                    {data.nuance || data.core_concept || data.why_correct}
                  </p>
                </div>
              )}

              {/* Mnemonic Story / Radical Breakdown */}
              {(data?.mnemonic || data?.mnemonic_story || data?.radical_breakdown) && (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60">
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider mb-1.5">
                    <Lightbulb size={15} className="text-amber-600" />
                    <span>Mẹo nhớ siêu tốc (Mnemonic)</span>
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed mb-0">
                    {data.mnemonic || data.mnemonic_story || data.radical_breakdown}
                  </p>
                </div>
              )}

              {/* Common Traps / Warnings */}
              {(data?.common_traps || data?.common_mistake || data?.elimination_tip) && (
                <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/60">
                  <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider mb-1.5">
                    <AlertTriangle size={15} className="text-rose-600" />
                    <span>Lưu ý bẫy đề thi & Lỗi hay gặp</span>
                  </div>
                  <p className="text-xs text-rose-900 leading-relaxed mb-0">
                    {data.common_traps || data.common_mistake || data.elimination_tip}
                  </p>
                </div>
              )}

              {/* Example with Audio Tip */}
              {data?.example && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Câu ví dụ thực tế
                  </span>
                  <div className="font-jp font-bold text-slate-900 text-sm">
                    {data.example.jp}
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    {data.example.vi}
                  </div>
                  {data.example.tip && (
                    <div className="text-[11px] text-pink-600 font-semibold mt-1">
                      💡 {data.example.tip}
                    </div>
                  )}
                </div>
              )}

              {/* Golden Rule */}
              {data?.golden_rule && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold flex items-center gap-2.5">
                  <CheckCircle size={16} className="text-emerald-600 shrink-0" />
                  <span>{data.golden_rule}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-pink-50 bg-pink-50/20 flex justify-end">
          <button
            type="button"
            onClick={closeAiModal}
            className="px-5 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-sm transition-colors"
          >
            Đã hiểu, quay lại học
          </button>
        </div>
      </div>
    </div>
  );
}
