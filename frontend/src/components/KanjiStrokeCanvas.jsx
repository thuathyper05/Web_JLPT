import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, Eye, EyeOff, Palette, PenTool } from 'lucide-react';

// Bảng vẽ tương tác luyện viết nét chữ Hán chuẩn ô chữ điền (田字格)
// ZERO ARROWS RULE: Sử dụng function truyền thống, tuyệt đối không dùng ký tự mũi tên

export default function KanjiStrokeCanvas({ kanjiChar, strokeCount, strokeTip }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [showWatermark, setShowWatermark] = useState(true);
  const [brushColor, setBrushColor] = useState('#1e293b'); // Đen than truyền thống
  const [brushWidth, setBrushWidth] = useState(6);

  // Kích thước ô chữ điền chuẩn
  const CANVAS_SIZE = 260;

  // Vẽ lưới nền chữ điền và chữ mẫu mờ
  function redrawGridAndWatermark() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // 1. Nền trắng kem
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // 2. Khung viền ngoài
    ctx.strokeStyle = '#fbcfe8'; // Pink 200
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.strokeRect(4, 4, CANVAS_SIZE - 8, CANVAS_SIZE - 8);

    // 3. Đường chia chữ điền đứt nét (Ngang & Dọc)
    ctx.strokeStyle = '#f472b6'; // Pink 400
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    // Trục dọc
    ctx.beginPath();
    ctx.moveTo(CANVAS_SIZE / 2, 4);
    ctx.lineTo(CANVAS_SIZE / 2, CANVAS_SIZE - 4);
    ctx.stroke();

    // Trục ngang
    ctx.beginPath();
    ctx.moveTo(4, CANVAS_SIZE / 2);
    ctx.lineTo(CANVAS_SIZE - 4, CANVAS_SIZE / 2);
    ctx.stroke();

    // Hai đường chéo nhạt
    ctx.strokeStyle = '#fce7f3'; // Pink 100
    ctx.beginPath();
    ctx.moveTo(4, 4);
    ctx.lineTo(CANVAS_SIZE - 4, CANVAS_SIZE - 4);
    ctx.moveTo(CANVAS_SIZE - 4, 4);
    ctx.lineTo(4, CANVAS_SIZE - 4);
    ctx.stroke();

    // Khôi phục nét liền
    ctx.setLineDash([]);

    // 4. Vẽ chữ mẫu mờ (Watermark Trace Guide)
    if (showWatermark && kanjiChar) {
      ctx.save();
      ctx.fillStyle = 'rgba(244, 63, 94, 0.16)'; // Hồng phấn nhạt
      ctx.font = '900 160px "Noto Sans JP", "Yu Gothic", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(kanjiChar, CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 8);
      ctx.restore();
    }
  }

  // Khởi tạo và vẽ lại khi thay đổi chữ hoặc bật tắt mẫu mờ
  useEffect(function () {
    redrawGridAndWatermark();
    setHasDrawn(false);
  }, [kanjiChar, showWatermark]);

  // Xóa toàn bộ nét đã vẽ
  function handleClear() {
    redrawGridAndWatermark();
    setHasDrawn(false);
  }

  // Lấy tọa độ từ sự kiện chuột hoặc cảm ứng
  function getCoordinates(event) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if (event.touches && event.touches.length > 0) {
      const touch = event.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
      };
    }
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    };
  }

  function startDrawing(e) {
    e.preventDefault();
    const coords = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    setIsDrawing(true);
    setHasDrawn(true);
  }

  function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const coords = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  }

  function stopDrawing() {
    setIsDrawing(false);
  }

  return (
    <div className="flex flex-col items-center bg-pink-50/40 p-4 rounded-2xl border border-pink-100">
      {/* Tiêu đề & Công cụ nhanh */}
      <div className="w-full flex items-center justify-between mb-3 text-xs">
        <span className="font-extrabold text-slate-700 flex items-center gap-1.5">
          <PenTool size={14} className="text-pink-600" />
          <span>Tập viết: {kanjiChar}</span>
          {strokeCount && (
            <span className="px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 text-[10px] font-bold">
              {strokeCount} nét
            </span>
          )}
        </span>

        <div className="flex items-center gap-1.5">
          {/* Nút bật tắt chữ mờ */}
          <button
            type="button"
            onClick={function () { setShowWatermark(!showWatermark); }}
            title={showWatermark ? 'Tắt chữ mẫu mờ' : 'Bật chữ mẫu mờ'}
            className="p-1.5 rounded-lg bg-white border border-pink-200 text-slate-600 hover:text-pink-600 transition-colors shadow-sm"
          >
            {showWatermark ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>

          {/* Nút Xóa vẽ lại */}
          <button
            type="button"
            onClick={handleClear}
            title="Xóa làm lại"
            className="p-1.5 rounded-lg bg-white border border-pink-200 text-slate-600 hover:text-rose-600 transition-colors shadow-sm"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Canvas Luyện viết */}
      <div className="relative rounded-2xl overflow-hidden shadow-inner border-2 border-pink-200 touch-none select-none bg-white">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="cursor-crosshair block"
          style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
        />
      </div>

      {/* Tùy chỉnh màu mực & nét bút */}
      <div className="w-full flex items-center justify-between gap-2 mt-3 pt-3 border-t border-pink-100">
        {/* Bộ chọn màu mực */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-500 mr-1 flex items-center gap-1">
            <Palette size={12} className="text-slate-400" />
            <span>Mực:</span>
          </span>
          {[
            { col: '#1e293b', label: 'Đen' },
            { col: '#e11d48', label: 'Hồng' },
            { col: '#2563eb', label: 'Xanh' }
          ].map(function (c) {
            const isSelected = brushColor === c.col;
            return (
              <button
                key={c.col}
                type="button"
                onClick={function () { setBrushColor(c.col); }}
                className={'w-5 h-5 rounded-full border transition-transform ' + (isSelected ? 'scale-125 ring-2 ring-pink-400 border-white' : 'border-slate-300 hover:scale-110')}
                style={{ backgroundColor: c.col }}
                title={'Mực ' + c.label}
              />
            );
          })}
        </div>

        {/* Bộ chọn độ dày nét bút */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-bold text-slate-500 mr-1">Nét:</span>
          {[
            { width: 4, label: 'Mảnh' },
            { width: 6, label: 'Vừa' },
            { width: 10, label: 'Đậm' }
          ].map(function (w) {
            const isSelected = brushWidth === w.width;
            return (
              <button
                key={w.width}
                type="button"
                onClick={function () { setBrushWidth(w.width); }}
                className={'px-2 py-0.5 rounded text-[10px] font-bold transition-colors ' + (isSelected ? 'bg-pink-600 text-white' : 'bg-white text-slate-600 border border-pink-200 hover:bg-pink-50')}
              >
                {w.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lời khuyên viết bút thuận */}
      <div className="w-full mt-2.5 text-[11px] text-slate-500 bg-white/80 p-2 rounded-xl border border-pink-100/80 leading-relaxed text-center">
        {strokeTip || 'Quy tắc nét: Từ trên xuống dưới, từ trái sang phải, ngang trước sổ sau.'}
      </div>
    </div>
  );
}
