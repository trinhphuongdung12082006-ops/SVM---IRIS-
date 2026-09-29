import React, { useRef, useEffect, useState, useMemo } from 'react';
import { UserInputFeatures } from '../types';
import { IRIS_DATASET, IRIS_SPECIES_STATS } from '../data/irisData';
import { predict2DSVM } from '../utils/svmModel';
import { Layers, Crosshair, HelpCircle } from 'lucide-react';

interface DecisionBoundaryPlotProps {
  features: UserInputFeatures;
  onUpdatePetalParams: (petalLength: number, petalWidth: number) => void;
  selectedVersionId?: string;
}

export const DecisionBoundaryPlot: React.FC<DecisionBoundaryPlotProps> = ({
  features,
  onUpdatePetalParams,
  selectedVersionId = 'v1.0-rbf',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showSupportVectors, setShowSupportVectors] = useState<boolean>(true);
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    species?: string;
    text: string;
  } | null>(null);

  // Trục tọa độ
  const xMin = 0.5;
  const xMax = 7.5; // Petal Length (cm)
  const yMin = 0.0;
  const yMax = 2.8; // Petal Width (cm)

  const width = 460;
  const height = 340;
  const padding = { top: 20, right: 20, bottom: 40, left: 45 };

  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  // Helpers ánh xạ từ dữ liệu cm sang pixel
  const scaleX = (val: number) => padding.left + ((val - xMin) / (xMax - xMin)) * plotW;
  const scaleY = (val: number) => padding.top + (1 - (val - yMin) / (yMax - yMin)) * plotH;

  // Helpers ánh xạ ngược từ pixel sang cm
  const invScaleX = (px: number) => xMin + ((px - padding.left) / plotW) * (xMax - xMin);
  const invScaleY = (py: number) => yMin + (1 - (py - padding.top) / plotH) * (yMax - yMin);

  // Tính trước lưới meshgrid ranh giới phân loại 2D theo version mô hình
  const gridResolution = 80;
  const decisionGrid = useMemo(() => {
    const grid: number[][] = [];
    const stepX = (xMax - xMin) / gridResolution;
    const stepY = (yMax - yMin) / gridResolution;

    for (let i = 0; i < gridResolution; i++) {
      const row: number[] = [];
      const yVal = yMin + i * stepY;
      for (let j = 0; j < gridResolution; j++) {
        const xVal = xMin + j * stepX;
        const res = predict2DSVM(xVal, yVal, selectedVersionId);
        row.push(res.classId);
      }
      grid.push(row);
    }
    return grid;
  }, [selectedVersionId]);

  // Vẽ Canvas nền và các điểm dữ liệu
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset canvas
    ctx.clearRect(0, 0, width, height);

    // 1. Vẽ vùng quyết định (Decision regions)
    const stepX = (xMax - xMin) / gridResolution;
    const stepY = (yMax - yMin) / gridResolution;
    const cellW = plotW / gridResolution + 0.5;
    const cellH = plotH / gridResolution + 0.5;

    for (let i = 0; i < gridResolution; i++) {
      const yVal = yMin + (i + 0.5) * stepY;
      const py = scaleY(yVal) - cellH / 2;

      for (let j = 0; j < gridResolution; j++) {
        const xVal = xMin + (j + 0.5) * stepX;
        const px = scaleX(xVal) - cellW / 2;

        const classId = decisionGrid[i][j];
        if (classId === 0) {
          ctx.fillStyle = 'rgba(59, 130, 246, 0.16)'; // Setosa soft blue
        } else if (classId === 1) {
          ctx.fillStyle = 'rgba(16, 185, 129, 0.16)'; // Versicolor soft emerald
        } else {
          ctx.fillStyle = 'rgba(139, 92, 246, 0.16)'; // Virginica soft purple
        }
        ctx.fillRect(px, py, cellW, cellH);
      }
    }

    // 2. Vẽ lưới trục tọa độ
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.beginPath();

    // Lưới dọc (Petal Length: 1, 2, 3, 4, 5, 6, 7)
    ctx.fillStyle = '#94A3B8';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';

    for (let x = 1; x <= 7; x++) {
      const px = scaleX(x);
      ctx.moveTo(px, padding.top);
      ctx.lineTo(px, height - padding.bottom);
      ctx.fillText(`${x}`, px, height - padding.bottom + 14);
    }

    // Lưới ngang (Petal Width: 0.5, 1.0, 1.5, 2.0, 2.5)
    ctx.textAlign = 'right';
    for (let y = 0.5; y <= 2.5; y += 0.5) {
      const py = scaleY(y);
      ctx.moveTo(padding.left, py);
      ctx.lineTo(width - padding.right, py);
      ctx.fillText(`${y.toFixed(1)}`, padding.left - 6, py + 3);
    }
    ctx.stroke();

    // Khung viền đồ thị
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(padding.left, padding.top, plotW, plotH);

    // Nhãn trục X và Y
    ctx.fillStyle = '#475569';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Petal Length (Chiều dài cánh hoa - cm)', padding.left + plotW / 2, height - 10);

    ctx.save();
    ctx.translate(14, padding.top + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Petal Width (Chiều rộng cánh hoa - cm)', 0, 0);
    ctx.restore();

    // 3. Vẽ 150 điểm dữ liệu mẫu thực tế
    for (const sample of IRIS_DATASET) {
      const px = scaleX(sample.petalLength);
      const py = scaleY(sample.petalWidth);

      // Vẽ vòng tròn viền vàng cho Support Vectors nếu được bật
      if (showSupportVectors) {
        const isSupportVector =
          (sample.species === 'setosa' && sample.petalLength >= 1.6) ||
          (sample.species === 'versicolor' && (sample.petalLength >= 4.3 || sample.petalWidth >= 1.4)) ||
          (sample.species === 'virginica' && (sample.petalLength <= 5.3 || sample.petalWidth <= 1.8));

        if (isSupportVector) {
          ctx.beginPath();
          ctx.arc(px, py, 6.5, 0, Math.PI * 2);
          ctx.strokeStyle = '#F59E0B';
          ctx.lineWidth = 1.6;
          ctx.stroke();
        }
      }

      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, Math.PI * 2);

      if (sample.species === 'setosa') {
        ctx.fillStyle = IRIS_SPECIES_STATS.setosa.color;
      } else if (sample.species === 'versicolor') {
        ctx.fillStyle = IRIS_SPECIES_STATS.versicolor.color;
      } else {
        ctx.fillStyle = IRIS_SPECIES_STATS.virginica.color;
      }
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // 4. Vẽ điểm người dùng đã chọn (Tọa độ hiện tại)
    const userPx = scaleX(features.petalLength);
    const userPy = scaleY(features.petalWidth);

    // Pulsing halo
    ctx.beginPath();
    ctx.arc(userPx, userPy, 14, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Inner glowing red dot with crosshair
    ctx.beginPath();
    ctx.arc(userPx, userPy, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#EF4444';
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [decisionGrid, features.petalLength, features.petalWidth, showSupportVectors]);

  // Tương tác click trên biểu đồ để trực tiếp đổi Petal Length & Petal Width
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickPx = ((e.clientX - rect.left) / rect.width) * width;
    const clickPy = ((e.clientY - rect.top) / rect.height) * height;

    if (
      clickPx >= padding.left &&
      clickPx <= width - padding.right &&
      clickPy >= padding.top &&
      clickPy <= height - padding.bottom
    ) {
      const rawPL = Math.min(Math.max(invScaleX(clickPx), 1.0), 6.9);
      const rawPW = Math.min(Math.max(invScaleY(clickPy), 0.1), 2.5);
      onUpdatePetalParams(parseFloat(rawPL.toFixed(1)), parseFloat(rawPW.toFixed(1)));
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * width;
    const py = ((e.clientY - rect.top) / rect.height) * height;

    if (
      px >= padding.left &&
      px <= width - padding.right &&
      py >= padding.top &&
      py <= height - padding.bottom
    ) {
      const pl = invScaleX(px).toFixed(1);
      const pw = invScaleY(py).toFixed(1);
      const pred = predict2DSVM(parseFloat(pl), parseFloat(pw), selectedVersionId);
      setHoveredPoint({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        species: pred.species,
        text: `PL: ${pl}cm | PW: ${pw}cm (${pred.species})`,
      });
    } else {
      setHoveredPoint(null);
    }
  };

  return (
    <div id="chart-decision-boundary" className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-purple-600" />
            2D SVM Decision Boundary
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Ranh giới quyết định phân loại trên 2 đặc trưng Petal Length & Petal Width
          </p>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
          <Crosshair className="w-3 h-3 text-red-500" />
          <span>Click để chọn tọa độ</span>
        </div>
      </div>

      {/* Canvas container */}
      <div className="flex-1 flex items-center justify-center relative py-1">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredPoint(null)}
          className="w-full max-w-[460px] aspect-[460/340] cursor-crosshair rounded-lg shadow-xs"
        />

        {/* Floating tooltip */}
        {hoveredPoint && (
          <div
            className="absolute pointer-events-none bg-slate-900 text-white text-[11px] font-mono px-2 py-1 rounded shadow-md -translate-x-1/2 -translate-y-8 z-10 whitespace-nowrap"
            style={{ left: hoveredPoint.x, top: hoveredPoint.y }}
          >
            {hoveredPoint.text}
          </div>
        )}
      </div>

      {/* Legend & Instructions */}
      <div className="mt-2 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[11px] text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            Setosa
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Versicolor
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            Virginica
          </div>

          <button
            type="button"
            onClick={() => setShowSupportVectors(!showSupportVectors)}
            className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border transition-all ${
              showSupportVectors
                ? 'bg-amber-50 text-amber-800 border-amber-300 font-bold'
                : 'bg-slate-100 text-slate-400 border-slate-200'
            }`}
            title="Bật/Tắt hiển thị các Support Vectors của mô hình SVM"
          >
            <span className="w-2 h-2 rounded-full border border-amber-500 bg-amber-400" />
            <span>Support Vectors</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 font-semibold text-[11px] text-red-600 bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span>Điểm đang chọn: ({features.petalLength}, {features.petalWidth})</span>
        </div>
      </div>
    </div>
  );
};
