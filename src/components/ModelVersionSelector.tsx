import React from 'react';
import { ModelVersion, ModelVersionId } from '../types';
import { MODEL_VERSIONS } from '../data/modelVersions';
import { Cpu, Check, Zap, Clock } from 'lucide-react';

interface ModelVersionSelectorProps {
  selectedVersionId: string;
  onSelectVersion: (versionId: ModelVersionId) => void;
}

export const ModelVersionSelector: React.FC<ModelVersionSelectorProps> = ({
  selectedVersionId,
  onSelectVersion,
}) => {
  const currentModel = MODEL_VERSIONS.find((m) => m.id === selectedVersionId) || MODEL_VERSIONS[0];

  return (
    <div id="model-version-selector-card" className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Chọn Phiên Bản Mô Hình SVM (5 Kernel Scikit-Learn Chuẩn)
            </h3>
            <p className="text-xs text-slate-500">
              Kiểm thử so sánh 5 cấu trúc nhân: RBF, Linear, Polynomial, Sigmoid (Neural) và Precomputed (Gram Matrix)
            </p>
          </div>
        </div>

        {/* Current Active Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Đang chạy: {currentModel.id} ({currentModel.kernel.toUpperCase()})
          </span>
        </div>
      </div>

      {/* Grid 5 Version Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {MODEL_VERSIONS.map((model) => {
          const isSelected = model.id === selectedVersionId;
          return (
            <button
              key={model.id}
              id={`model-card-${model.id}`}
              type="button"
              onClick={() => onSelectVersion(model.id as ModelVersionId)}
              className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {model.id}
                  </span>
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>

                <div className="font-bold text-xs text-slate-900 mb-1 truncate" title={model.name}>
                  {model.name.split(' (')[0]}
                </div>

                <p className="text-[10px] text-slate-600 line-clamp-2 mb-2 leading-relaxed">
                  {model.description}
                </p>
              </div>

              {/* Metrics bar */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                <div className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <Zap className="w-3 h-3" />
                  <span>{model.accuracy}%</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span>{model.latencyMs}ms</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
