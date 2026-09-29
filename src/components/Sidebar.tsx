import React from 'react';
import { UserInputFeatures } from '../types';
import { FEATURE_BOUNDS } from '../data/irisData';
import { Sliders, RotateCcw, Sparkles, Cpu } from 'lucide-react';

interface SidebarProps {
  features: UserInputFeatures;
  onChange: (features: UserInputFeatures) => void;
  onReset: () => void;
  onSelectPreset: (presetName: string) => void;
  activePreset: string;
  selectedVersionId?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  features,
  onChange,
  onReset,
  onSelectPreset,
  activePreset,
  selectedVersionId = 'v1.0-rbf',
}) => {
  const handleSliderChange = (key: keyof UserInputFeatures, val: number) => {
    onChange({
      ...features,
      [key]: val,
    });
  };

  return (
    <aside id="stSidebar" className="w-full lg:w-80 bg-slate-900 text-slate-100 flex flex-col p-5 border-r border-slate-800 shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center font-bold">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Sidebar Tham Số</h2>
            <p className="text-xs text-slate-400">Điều chỉnh 4 thông số Iris</p>
          </div>
        </div>
        <button
          id="btn-reset-sidebar"
          onClick={onReset}
          title="Đặt lại thông số mặc định"
          className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Prominent Unit Badge */}
      <div className="mb-4 px-3 py-1.5 rounded-xl bg-blue-950/70 border border-blue-800/80 text-[11px] text-blue-200 font-medium flex items-center justify-between">
        <span>Đơn vị đo lường 4 biến:</span>
        <span className="font-mono font-bold text-white bg-blue-600 px-2 py-0.5 rounded-md text-[10px] shadow-xs">
          centimet (cm)
        </span>
      </div>

      {/* Preset selector */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Mẫu Thử Nhanh (Presets)
        </label>
        <select
          id="preset-selector"
          value={activePreset}
          onChange={(e) => onSelectPreset(e.target.value)}
          aria-label="Chọn mẫu thử nhanh"
          className="w-full bg-slate-800 border border-slate-700 text-sm text-slate-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
        >
          <option value="custom">⚙️ Tùy chỉnh (Custom)</option>
          <option value="setosa">🌸 Iris Setosa (Mẫu cánh nhỏ)</option>
          <option value="versicolor">🌿 Iris Versicolor (Mẫu trung bình)</option>
          <option value="virginica">🌺 Iris Virginica (Mẫu cánh lớn)</option>
        </select>
      </div>

      {/* Feature Sliders */}
      <div className="space-y-4 flex-1">
        {/* Sepal Length */}
        <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-medium text-slate-200">{FEATURE_BOUNDS.sepalLength.label}</span>
            <span className="text-xs font-mono font-bold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/60">
              {features.sepalLength.toFixed(1)} cm
            </span>
          </div>
          <input
            id="slider-sepal-length"
            type="range"
            min={FEATURE_BOUNDS.sepalLength.min}
            max={FEATURE_BOUNDS.sepalLength.max}
            step={0.1}
            value={features.sepalLength}
            onChange={(e) => handleSliderChange('sepalLength', parseFloat(e.target.value))}
            className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>Min: {FEATURE_BOUNDS.sepalLength.min}</span>
            <span>Max: {FEATURE_BOUNDS.sepalLength.max}</span>
          </div>
        </div>

        {/* Sepal Width */}
        <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-medium text-slate-200">{FEATURE_BOUNDS.sepalWidth.label}</span>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
              {features.sepalWidth.toFixed(1)} cm
            </span>
          </div>
          <input
            id="slider-sepal-width"
            type="range"
            min={FEATURE_BOUNDS.sepalWidth.min}
            max={FEATURE_BOUNDS.sepalWidth.max}
            step={0.1}
            value={features.sepalWidth}
            onChange={(e) => handleSliderChange('sepalWidth', parseFloat(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>Min: {FEATURE_BOUNDS.sepalWidth.min}</span>
            <span>Max: {FEATURE_BOUNDS.sepalWidth.max}</span>
          </div>
        </div>

        {/* Petal Length */}
        <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-medium text-slate-200">{FEATURE_BOUNDS.petalLength.label}</span>
            <span className="text-xs font-mono font-bold text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/60">
              {features.petalLength.toFixed(1)} cm
            </span>
          </div>
          <input
            id="slider-petal-length"
            type="range"
            min={FEATURE_BOUNDS.petalLength.min}
            max={FEATURE_BOUNDS.petalLength.max}
            step={0.1}
            value={features.petalLength}
            onChange={(e) => handleSliderChange('petalLength', parseFloat(e.target.value))}
            className="w-full accent-purple-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>Min: {FEATURE_BOUNDS.petalLength.min}</span>
            <span>Max: {FEATURE_BOUNDS.petalLength.max}</span>
          </div>
        </div>

        {/* Petal Width */}
        <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-medium text-slate-200">{FEATURE_BOUNDS.petalWidth.label}</span>
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
              {features.petalWidth.toFixed(1)} cm
            </span>
          </div>
          <input
            id="slider-petal-width"
            type="range"
            min={FEATURE_BOUNDS.petalWidth.min}
            max={FEATURE_BOUNDS.petalWidth.max}
            step={0.1}
            value={features.petalWidth}
            onChange={(e) => handleSliderChange('petalWidth', parseFloat(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>Min: {FEATURE_BOUNDS.petalWidth.min}</span>
            <span>Max: {FEATURE_BOUNDS.petalWidth.max}</span>
          </div>
        </div>
      </div>

      {/* Model Spec Box */}
      <div className="mt-5 p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs space-y-1.5">
        <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-1">
          <Cpu className="w-3.5 h-3.5 text-blue-400" />
          <span>Thông Số Kỹ Thuật SVM</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Phiên bản:</span>
          <span className="font-mono text-blue-400 font-bold">{selectedVersionId}</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Kernel:</span>
          <span className="font-mono text-slate-200">
            {selectedVersionId === 'v1.1-linear'
              ? 'Linear (Tuyến tính)'
              : selectedVersionId === 'v2.0-poly'
              ? 'Polynomial (d=3)'
              : 'RBF (Gaussian)'}
          </span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Chuẩn hóa:</span>
          <span className="font-mono text-slate-200">StandardScaler</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Xác suất:</span>
          <span className="font-mono text-emerald-400">probability=True</span>
        </div>
      </div>
    </aside>
  );
};
