import React, { useState } from 'react';
import { UserInputFeatures } from '../types';
import { IRIS_SPECIES_STATS } from '../data/irisData';
import { Compass, Eye, EyeOff } from 'lucide-react';

interface RadarChartProps {
  features: UserInputFeatures;
}

export const RadarChart: React.FC<RadarChartProps> = ({ features }) => {
  // Cho phép người dùng ẩn/hiện các đường trung bình để đối chiếu dễ dàng
  const [visibleSpecies, setVisibleSpecies] = useState<{
    setosa: boolean;
    versicolor: boolean;
    virginica: boolean;
  }>({
    setosa: true,
    versicolor: true,
    virginica: true,
  });

  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);

  // Kích thước SVG
  const size = 380;
  const center = size / 2;
  const maxRadius = 135;
  const maxVal = 8.0; // Thang đo tối đa 8cm

  const axes = [
    { label: 'Sepal Length', key: 'sepalLength' as const, angle: -Math.PI / 2 },
    { label: 'Sepal Width', key: 'sepalWidth' as const, angle: 0 },
    { label: 'Petal Length', key: 'petalLength' as const, angle: Math.PI / 2 },
    { label: 'Petal Width', key: 'petalWidth' as const, angle: Math.PI },
  ];

  // Helper chuyển đổi giá trị sang tọa độ (x, y) trên radar
  const getCoordinates = (value: number, angle: number) => {
    const r = Math.min(Math.max(value / maxVal, 0), 1) * maxRadius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Tạo chuỗi points cho SVG polygon
  const makePolygonPoints = (vals: { sepalLength: number; sepalWidth: number; petalLength: number; petalWidth: number }) => {
    return axes
      .map((axis) => {
        const coords = getCoordinates(vals[axis.key], axis.angle);
        return `${coords.x},${coords.y}`;
      })
      .join(' ');
  };

  const userPoints = makePolygonPoints(features);

  // Các vòng tròn đồng tâm (Grid rings)
  const rings = [2, 4, 6, 8];

  const toggleSpecies = (species: 'setosa' | 'versicolor' | 'virginica') => {
    setVisibleSpecies((prev) => ({ ...prev, [species]: !prev[species] }));
  };

  return (
    <div id="chart-radar-spider" className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-red-500" />
            Biểu Đồ Radar (Spider Chart)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Đối chiếu 4 chỉ số của mẫu hiện tại với trung bình 3 loài hoa Iris
          </p>
        </div>
      </div>

      {/* SVG Canvas Radar */}
      <div className="flex-1 flex items-center justify-center relative py-2">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full max-w-[340px] aspect-square overflow-visible"
        >
          {/* Concentric rings */}
          {rings.map((ringVal) => {
            const r = (ringVal / maxVal) * maxRadius;
            return (
              <g key={ringVal}>
                <circle
                  cx={center}
                  cy={center}
                  r={r}
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <text
                  x={center + 4}
                  y={center - r + 11}
                  fontSize="9"
                  fill="#94A3B8"
                  fontFamily="monospace"
                >
                  {ringVal}cm
                </text>
              </g>
            );
          })}

          {/* Radial axis lines */}
          {axes.map((axis) => {
            const edge = getCoordinates(maxVal, axis.angle);
            return (
              <line
                key={axis.label}
                x1={center}
                y1={center}
                x2={edge.x}
                y2={edge.y}
                stroke="#CBD5E1"
                strokeWidth="1.2"
              />
            );
          })}

          {/* Dotted species averages */}
          {visibleSpecies.setosa && (
            <polygon
              points={makePolygonPoints(IRIS_SPECIES_STATS.setosa.means)}
              fill="rgba(59, 130, 246, 0.05)"
              stroke={IRIS_SPECIES_STATS.setosa.color}
              strokeWidth="1.8"
              strokeDasharray="4 3"
              className="transition-all duration-300"
            />
          )}

          {visibleSpecies.versicolor && (
            <polygon
              points={makePolygonPoints(IRIS_SPECIES_STATS.versicolor.means)}
              fill="rgba(16, 185, 129, 0.05)"
              stroke={IRIS_SPECIES_STATS.versicolor.color}
              strokeWidth="1.8"
              strokeDasharray="4 3"
              className="transition-all duration-300"
            />
          )}

          {visibleSpecies.virginica && (
            <polygon
              points={makePolygonPoints(IRIS_SPECIES_STATS.virginica.means)}
              fill="rgba(139, 92, 246, 0.05)"
              stroke={IRIS_SPECIES_STATS.virginica.color}
              strokeWidth="1.8"
              strokeDasharray="4 3"
              className="transition-all duration-300"
            />
          )}

          {/* User selected polygon (High visibility, red filled) */}
          <polygon
            points={userPoints}
            fill="rgba(239, 68, 68, 0.28)"
            stroke="#EF4444"
            strokeWidth="2.8"
            className="transition-all duration-300"
          />

          {/* User points on vertices */}
          {axes.map((axis) => {
            const coords = getCoordinates(features[axis.key], axis.angle);
            return (
              <circle
                key={axis.key}
                cx={coords.x}
                cy={coords.y}
                r="4.5"
                fill="#EF4444"
                stroke="#FFFFFF"
                strokeWidth="2"
                className="transition-all duration-300 drop-shadow-xs"
              />
            );
          })}

          {/* Axis Labels */}
          {axes.map((axis) => {
            // Đặt text nhãn ra ngoài một chút
            const textRadius = maxRadius + 24;
            const tx = center + textRadius * Math.cos(axis.angle);
            const ty = center + textRadius * Math.sin(axis.angle);
            const isHovered = hoveredMetric === axis.key;

            let textAnchor = 'middle';
            if (Math.abs(axis.angle) < 0.1) textAnchor = 'start';
            else if (Math.abs(axis.angle - Math.PI) < 0.1 || Math.abs(axis.angle + Math.PI) < 0.1)
              textAnchor = 'end';

            return (
              <g
                key={axis.label}
                onMouseEnter={() => setHoveredMetric(axis.key)}
                onMouseLeave={() => setHoveredMetric(null)}
                className="cursor-pointer"
              >
                <text
                  x={tx}
                  y={ty + 4}
                  textAnchor={textAnchor}
                  fontSize={isHovered ? '11.5' : '10.5'}
                  fontWeight={isHovered ? '700' : '600'}
                  fill={isHovered ? '#1E293B' : '#475569'}
                  className="transition-all"
                >
                  {axis.label}
                </text>
                <text
                  x={tx}
                  y={ty + 16}
                  textAnchor={textAnchor}
                  fontSize="9.5"
                  fontWeight="600"
                  fill="#EF4444"
                  fontFamily="monospace"
                >
                  {features[axis.key].toFixed(1)}cm
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend & Interactive toggles */}
      <div className="mt-2 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-center gap-2 text-xs">
        {/* User tag */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 rounded-md border border-red-200 font-semibold text-[11px]">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          Mẫu Hiện Tại
        </div>

        {/* Setosa toggle */}
        <button
          onClick={() => toggleSpecies('setosa')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-medium transition-all ${
            visibleSpecies.setosa
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'bg-slate-50 text-slate-400 border-slate-200 opacity-60'
          }`}
        >
          {visibleSpecies.setosa ? <Eye className="w-3 h-3 text-blue-600" /> : <EyeOff className="w-3 h-3" />}
          TB Setosa ({IRIS_SPECIES_STATS.setosa.means.petalLength}cm)
        </button>

        {/* Versicolor toggle */}
        <button
          onClick={() => toggleSpecies('versicolor')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-medium transition-all ${
            visibleSpecies.versicolor
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-slate-50 text-slate-400 border-slate-200 opacity-60'
          }`}
        >
          {visibleSpecies.versicolor ? <Eye className="w-3 h-3 text-emerald-600" /> : <EyeOff className="w-3 h-3" />}
          TB Versicolor ({IRIS_SPECIES_STATS.versicolor.means.petalLength}cm)
        </button>

        {/* Virginica toggle */}
        <button
          onClick={() => toggleSpecies('virginica')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-medium transition-all ${
            visibleSpecies.virginica
              ? 'bg-purple-50 text-purple-700 border-purple-200'
              : 'bg-slate-50 text-slate-400 border-slate-200 opacity-60'
          }`}
        >
          {visibleSpecies.virginica ? <Eye className="w-3 h-3 text-purple-600" /> : <EyeOff className="w-3 h-3" />}
          TB Virginica ({IRIS_SPECIES_STATS.virginica.means.petalLength}cm)
        </button>
      </div>
    </div>
  );
};
