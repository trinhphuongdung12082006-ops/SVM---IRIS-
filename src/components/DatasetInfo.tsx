import React from 'react';
import { IRIS_SPECIES_STATS } from '../data/irisData';
import { BookOpen, Database, Brain, Sparkles } from 'lucide-react';

export const DatasetInfo: React.FC = () => {
  return (
    <div id="section-dataset-info" className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs mb-8">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
        <BookOpen className="w-5 h-5 text-indigo-600" />
        <h3 className="text-base font-bold text-slate-800">
          Thông Tin Kỹ Thuật: Iris Dataset & Thuật Toán SVM
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bảng giá trị trung bình 3 loài hoa */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Database className="w-3.5 h-3.5 text-blue-600" />
            Bảng Thống Kê Trung Bình 4 Đặc Trưng (Iris Means)
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                  <th className="py-2.5 px-3 text-left font-semibold">Loài Hoa</th>
                  <th className="py-2.5 px-3 text-right font-semibold">Sepal L.</th>
                  <th className="py-2.5 px-3 text-right font-semibold">Sepal W.</th>
                  <th className="py-2.5 px-3 text-right font-semibold">Petal L.</th>
                  <th className="py-2.5 px-3 text-right font-semibold">Petal W.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-blue-50/40">
                  <td className="py-2.5 px-3 font-semibold text-blue-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Iris Setosa
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono">{IRIS_SPECIES_STATS.setosa.means.sepalLength} cm</td>
                  <td className="py-2.5 px-3 text-right font-mono">{IRIS_SPECIES_STATS.setosa.means.sepalWidth} cm</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-600">{IRIS_SPECIES_STATS.setosa.means.petalLength} cm</td>
                  <td className="py-2.5 px-3 text-right font-mono">{IRIS_SPECIES_STATS.setosa.means.petalWidth} cm</td>
                </tr>
                <tr className="hover:bg-emerald-50/40">
                  <td className="py-2.5 px-3 font-semibold text-emerald-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Iris Versicolor
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono">{IRIS_SPECIES_STATS.versicolor.means.sepalLength} cm</td>
                  <td className="py-2.5 px-3 text-right font-mono">{IRIS_SPECIES_STATS.versicolor.means.sepalWidth} cm</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600">{IRIS_SPECIES_STATS.versicolor.means.petalLength} cm</td>
                  <td className="py-2.5 px-3 text-right font-mono">{IRIS_SPECIES_STATS.versicolor.means.petalWidth} cm</td>
                </tr>
                <tr className="hover:bg-purple-50/40">
                  <td className="py-2.5 px-3 font-semibold text-purple-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    Iris Virginica
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono">{IRIS_SPECIES_STATS.virginica.means.sepalLength} cm</td>
                  <td className="py-2.5 px-3 text-right font-mono">{IRIS_SPECIES_STATS.virginica.means.sepalWidth} cm</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-purple-600">{IRIS_SPECIES_STATS.virginica.means.petalLength} cm</td>
                  <td className="py-2.5 px-3 text-right font-mono">{IRIS_SPECIES_STATS.virginica.means.petalWidth} cm</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-slate-500 italic">
            * Cánh hoa (Petal) là đặc trưng có tính phân loại cao nhất: Setosa có Petal ngắn rõ rệt (&lt; 2.5cm), trong khi Versicolor và Virginica phân tách xung quanh ngưỡng Petal Length 4.8cm &amp; Petal Width 1.6cm.
          </p>
        </div>

        {/* Kiến thức lý thuyết ML */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Brain className="w-3.5 h-3.5 text-purple-600" />
            Kiến Trúc Thuật Toán &amp; Tối Ưu Streamlit
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
              <span className="font-bold text-slate-800 block mb-1">StandardScaler</span>
              <p className="text-slate-600 text-[11.5px] leading-relaxed">
                Chuẩn hóa dữ liệu về trung bình 0 và phương sai 1. Cực kỳ quan trọng vì SVM dựa vào khoảng cách Euclidean.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
              <span className="font-bold text-slate-800 block mb-1">RBF Kernel (Gaussian)</span>
              <p className="text-slate-600 text-[11.5px] leading-relaxed">
                Ánh xạ dữ liệu phi tuyến sang không gian đa chiều, tạo ranh giới quyết định mềm uốn lượn tối ưu biên an toàn.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
              <span className="font-bold text-slate-800 block mb-1">Platt Scaling</span>
              <p className="text-slate-600 text-[11.5px] leading-relaxed">
                Tham số <code className="text-purple-600 font-mono">probability=True</code> khớp hàm sigmoid logistic qua cross-validation để trích xuất xác suất.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
              <span className="font-bold text-slate-800 block mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                @st.cache_resource
              </span>
              <p className="text-slate-600 text-[11.5px] leading-relaxed">
                Lưu trữ mô hình trong bộ nhớ đệm Streamlit, ngăn chặn việc huấn luyện lặp lại vô ích mỗi khi kéo slider.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
