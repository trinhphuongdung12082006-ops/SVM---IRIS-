import React, { useState } from 'react';
import { PredictionResult, UserInputFeatures } from '../types';
import { IRIS_SPECIES_STATS } from '../data/irisData';
import { CheckCircle2, Award, Activity, HelpCircle, X, Calculator, Info } from 'lucide-react';
import { SpeciesFlowerPhoto } from './SpeciesFlowerPhoto';

interface PredictionCardProps {
  prediction: PredictionResult;
  features: UserInputFeatures;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({ prediction, features }) => {
  const [showFormulaModal, setShowFormulaModal] = useState<boolean>(false);
  const currentStats = IRIS_SPECIES_STATS[prediction.predictedSpecies];

  const speciesList: Array<{ id: 'setosa' | 'versicolor' | 'virginica'; label: string; prob: number; color: string }> = [
    {
      id: 'setosa',
      label: 'Iris Setosa',
      prob: prediction.probabilities.setosa,
      color: IRIS_SPECIES_STATS.setosa.color,
    },
    {
      id: 'versicolor',
      label: 'Iris Versicolor',
      prob: prediction.probabilities.versicolor,
      color: IRIS_SPECIES_STATS.versicolor.color,
    },
    {
      id: 'virginica',
      label: 'Iris Virginica',
      prob: prediction.probabilities.virginica,
      color: IRIS_SPECIES_STATS.virginica.color,
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-6">
        {/* Cột 1: Thẻ Nhãn Loài Hoa Dự Đoán */}
        <div
          id="card-prediction-result"
          className="md:col-span-5 rounded-2xl p-6 transition-all duration-300 relative overflow-hidden flex flex-col justify-between border"
          style={{
            backgroundColor: currentStats.bgColor,
            borderColor: currentStats.borderColor,
            boxShadow: `0 4px 20px -2px ${currentStats.borderColor}20`,
          }}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-600 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                Mô Hình Dự Đoán (SVC)
              </span>
              <button
                type="button"
                onClick={() => setShowFormulaModal(true)}
                className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full text-white shadow-xs cursor-pointer hover:opacity-90 transition-opacity"
                style={{ backgroundColor: currentStats.color }}
                title="Bấm để xem công thức tính độ tin cậy"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Độ tin cậy: {prediction.confidence}%
                <HelpCircle className="w-3 h-3 ml-0.5 opacity-80" />
              </button>
            </div>

            <div className="mt-2">
              <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: currentStats.color }}>
                {currentStats.name}
              </h1>
              <p className="text-xs italic text-slate-500 font-serif mt-0.5">{currentStats.scientificName}</p>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mt-3 bg-white/70 backdrop-blur-xs p-3 rounded-xl border border-slate-200/60">
              {currentStats.description}
            </p>
          </div>

          {/* Feature summary row with EXPLICIT CM UNITS */}
          <div className="mt-4 pt-3 border-t border-slate-200/70">
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5 font-medium">
              <span>Giá trị thuộc tính mẫu kiểm thử:</span>
              <span className="text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.2 rounded">Đơn vị: centimet (cm)</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-white/90 p-1.5 rounded-lg border border-slate-200/60">
                <div className="text-[10px] text-slate-500 uppercase font-bold">SL (Sepal)</div>
                <div className="text-xs font-black text-slate-800 font-mono">{features.sepalLength} cm</div>
              </div>
              <div className="bg-white/90 p-1.5 rounded-lg border border-slate-200/60">
                <div className="text-[10px] text-slate-500 uppercase font-bold">SW (Sepal)</div>
                <div className="text-xs font-black text-slate-800 font-mono">{features.sepalWidth} cm</div>
              </div>
              <div className="bg-white/90 p-1.5 rounded-lg border border-slate-200/60">
                <div className="text-[10px] text-slate-500 uppercase font-bold">PL (Petal)</div>
                <div className="text-xs font-black text-slate-800 font-mono">{features.petalLength} cm</div>
              </div>
              <div className="bg-white/90 p-1.5 rounded-lg border border-slate-200/60">
                <div className="text-[10px] text-slate-500 uppercase font-bold">PW (Petal)</div>
                <div className="text-xs font-black text-slate-800 font-mono">{features.petalWidth} cm</div>
              </div>
            </div>
          </div>

          {/* Ảnh minh họa loài hoa từ Wikimedia Commons */}
          <SpeciesFlowerPhoto
            species={prediction.predictedSpecies}
            themeColor={currentStats.color}
          />
        </div>

        {/* Cột 2: Biểu Đồ Cột Ngang Phân Phối Xác Suất (Horizontal Probability Bar Chart) */}
        <div id="chart-probability-distribution" className="md:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-blue-600" />
                Phân Phối Xác Suất Dự Đoán (Probability Distribution)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Trực quan hóa hàm tính toán xác suất qua thuật toán Platt Scaling & Softmax trong SVC
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowFormulaModal(true)}
              className="text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
            >
              <Calculator className="w-3.5 h-3.5" />
              Xem công thức Platt Scaling
            </button>
          </div>

          {/* Horizontal Bars */}
          <div className="space-y-4 my-auto">
            {speciesList.map((item) => {
              const isWinner = item.id === prediction.predictedSpecies;
              return (
                <div key={item.id} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className={`font-semibold flex items-center gap-2 ${isWinner ? 'text-slate-900' : 'text-slate-600'}`}>
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.label}
                      {isWinner && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          Top 1
                        </span>
                      )}
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                      {item.prob.toFixed(1)}%
                    </span>
                  </div>

                  {/* Progress bar container */}
                  <div className="h-6 w-full bg-slate-100 rounded-lg overflow-hidden p-0.5 relative border border-slate-200/70">
                    <div
                      className="h-full rounded-md transition-all duration-500 ease-out flex items-center justify-end pr-2"
                      style={{
                        width: `${Math.max(item.prob, 3)}%`,
                        backgroundColor: item.color,
                        boxShadow: isWinner ? `0 0 12px ${item.color}60` : 'none',
                      }}
                    >
                      {item.prob > 12 && (
                        <span className="text-[11px] font-bold text-white drop-shadow-xs">
                          {item.prob.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ghi chú chân biểu đồ */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
            <span>Tổng xác suất: <strong>100.0%</strong></span>
            <span>Hàm ánh xạ: <strong>Platt Scaling (Logistic Sigmoid) &bull; Softmax</strong></span>
          </div>
        </div>
      </div>

      {/* POPUP MODAL GIẢI THÍCH CƠ SỞ TOÁN HỌC ĐỘ TIN CẬY (PLATT SCALING) */}
      {showFormulaModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Calculator className="w-5 h-5 text-blue-200" />
                <h3 className="font-bold text-base">Cơ Sở Khoa Học: Độ Tin Cậy & Xác Suất SVM Tính Từ Đâu?</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFormulaModal(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-slate-700 leading-relaxed">
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex gap-2.5">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Bản chất học máy của SVM:</strong> SVM nguyên bản là mô hình phân loại <em>phi xác suất (Non-probabilistic Maximum Margin)</em>. Đầu ra tự nhiên của hàm quyết định là khoảng cách đại số f(x) = w^T · φ(x) + b. Hệ thống sử dụng <strong>Platt Scaling (1999)</strong> và <strong>Softmax</strong> để ánh xạ khoảng cách này sang xác suất phần trăm (%).
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1.5 text-indigo-700">1. Thuật toán Platt Scaling (John Platt, 1999):</h4>
                <p>
                  Ánh xạ khoảng cách biên f(x) thành xác suất hậu nghiệm bằng hàm Sigmoid được hiệu chuẩn:
                </p>
                <div className="p-3 bg-slate-100 rounded-lg font-mono text-[11px] text-slate-800 my-2 text-center border border-slate-200">
                  P(y = 1 | x) = 1 / (1 + exp(A * f(x) + B))
                </div>
                <p className="text-[11px] text-slate-500">
                  Trong đó A và B là hai tham số tối ưu hóa qua phương pháp Maximum Likelihood trên tập kiểm thực chéo.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1.5 text-indigo-700">2. Mở rộng đa lớp (Multi-class Softmax Normalization):</h4>
                <p>
                  Với 3 loài hoa (Setosa, Versicolor, Virginica), vector điểm số logit (z1, z2, z3) được chuẩn hóa để đảm bảo tổng xác suất bằng 100%:
                </p>
                <div className="p-3 bg-slate-100 rounded-lg font-mono text-[11px] text-slate-800 my-2 text-center border border-slate-200">
                  P(Loài k | x) = exp(z_k) / [ exp(z_1) + exp(z_2) + exp(z_3) ]
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1.5 text-indigo-700">3. Phân biệt rõ hai đại lượng để trả lời Hội đồng:</h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li>
                    <strong>Độ tin cậy của mẫu đơn lẻ (Confidence: {prediction.confidence}%):</strong> Là xác suất lớn nhất P(Loài) = max(P1, P2, P3) cho mẫu hoa cụ thể đang nhập.
                  </li>
                  <li>
                    <strong>Độ chính xác tổng thể (Model Accuracy: 98.0%):</strong> Được tính qua kiểm định chéo <strong>5-Fold Cross-Validation</strong> trên toàn bộ 150 mẫu Iris của Fisher.
                  </li>
                </ul>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowFormulaModal(false)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                >
                  Đã hiểu cơ sở toán học
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
