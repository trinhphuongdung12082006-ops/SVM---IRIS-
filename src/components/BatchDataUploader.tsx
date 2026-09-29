import React, { useState, useRef } from 'react';
import { BatchPredictionRow, IrisSpecies } from '../types';
import { batchPredictSVM } from '../utils/svmModel';
import { IRIS_SPECIES_STATS } from '../data/irisData';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  Play,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Filter,
  RefreshCw,
} from 'lucide-react';

interface BatchDataUploaderProps {
  selectedVersionId: string;
}

export const BatchDataUploader: React.FC<BatchDataUploaderProps> = ({ selectedVersionId }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [parsedRows, setParsedRows] = useState<BatchPredictionRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [speciesFilter, setSpeciesFilter] = useState<IrisSpecies | 'all'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File CSV mẫu cho người dùng tải về
  const sampleCSVContent = `sepal_length,sepal_width,petal_length,petal_width
5.1,3.5,1.4,0.2
4.9,3.0,1.4,0.2
5.8,2.7,4.1,1.0
6.2,2.2,4.5,1.5
5.9,3.2,4.8,1.8
6.3,3.3,6.0,2.5
7.2,3.6,6.1,2.5
4.8,3.4,1.6,0.2
5.6,3.0,4.5,1.5
6.7,3.1,5.6,2.4`;

  const handleDownloadSampleCSV = () => {
    const blob = new Blob([sampleCSVContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'iris_sample_test.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Nút chạy thử ngay dữ liệu mẫu (10 mẫu ngẫu nhiên)
  const handleLoadDemoData = () => {
    setIsLoading(true);
    setError(null);
    setTimeout(() => {
      parseCSVAndModel(sampleCSVContent);
      setIsLoading(false);
    }, 300);
  };

  // Phân tích cú pháp CSV và mô hình hóa
  const parseCSVAndModel = (text: string) => {
    try {
      const lines = text.trim().split(/\r?\n/);
      if (lines.length < 1) {
        setError('Tệp trống hoặc không chứa dữ liệu hợp lệ.');
        return;
      }

      const rawSamples: Array<{ sepalLength: number; sepalWidth: number; petalLength: number; petalWidth: number }> = [];

      // Kiểm tra xem dòng đầu có phải tiêu đề cột không
      const firstLine = lines[0].toLowerCase();
      const hasHeader =
        firstLine.includes('sepal') || firstLine.includes('petal') || firstLine.includes('length');

      const startIdx = hasHeader ? 1 : 0;

      for (let i = startIdx; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Phân tách dấu phẩy hoặc tab hoặc chấm phẩy
        const parts = line.split(/[,\t;]/).map((p) => parseFloat(p.trim()));
        if (parts.length >= 4 && !parts.slice(0, 4).some(isNaN)) {
          rawSamples.push({
            sepalLength: parts[0],
            sepalWidth: parts[1],
            petalLength: parts[2],
            petalWidth: parts[3],
          });
        }
      }

      if (rawSamples.length === 0) {
        setError('Không tìm thấy dữ liệu số hợp lệ (cần 4 cột: sepal_length, sepal_width, petal_length, petal_width).');
        return;
      }

      // Mô hình hóa qua SVM
      const results = batchPredictSVM(rawSamples, selectedVersionId);
      setParsedRows(results);
      setError(null);
    } catch {
      setError('Đã xảy ra lỗi khi đọc cấu trúc tệp. Vui lòng kiểm tra lại định dạng CSV hoặc JSON.');
    }
  };

  const handleFileProcess = (file: File) => {
    setError(null);
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt') && !file.name.endsWith('.json')) {
      setError('Định dạng tệp không được hỗ trợ. Vui lòng tải lên tệp .CSV hoặc .JSON.');
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (file.name.endsWith('.json')) {
        try {
          const json = JSON.parse(content);
          const array = Array.isArray(json) ? json : json.data || json.samples || [];
          const rawSamples = array.map((item: Record<string, number>) => ({
            sepalLength: item.sepalLength || item.sepal_length || 0,
            sepalWidth: item.sepalWidth || item.sepal_width || 0,
            petalLength: item.petalLength || item.petal_length || 0,
            petalWidth: item.petalWidth || item.petal_width || 0,
          })).filter((s: { sepalLength: number }) => s.sepalLength > 0);

          if (rawSamples.length === 0) {
            setError('Tệp JSON không chứa mảng mẫu dữ liệu hợp lệ.');
            setIsLoading(false);
            return;
          }
          const results = batchPredictSVM(rawSamples, selectedVersionId);
          setParsedRows(results);
          setIsLoading(false);
        } catch {
          setError('Không thể đọc cú pháp JSON.');
          setIsLoading(false);
        }
      } else {
        parseCSVAndModel(content);
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      setError('Không thể đọc tệp tin.');
      setIsLoading(false);
    };

    reader.readAsText(file);
  };

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  // Tính thống kê phân loại sau khi mô hình hóa
  const stats = React.useMemo(() => {
    if (parsedRows.length === 0) return null;
    const total = parsedRows.length;
    const setosaCount = parsedRows.filter((r) => r.predictedSpecies === 'setosa').length;
    const versicolorCount = parsedRows.filter((r) => r.predictedSpecies === 'versicolor').length;
    const virginicaCount = parsedRows.filter((r) => r.predictedSpecies === 'virginica').length;

    return {
      total,
      setosa: { count: setosaCount, pct: ((setosaCount / total) * 100).toFixed(1) },
      versicolor: { count: versicolorCount, pct: ((versicolorCount / total) * 100).toFixed(1) },
      virginica: { count: virginicaCount, pct: ((virginicaCount / total) * 100).toFixed(1) },
    };
  }, [parsedRows]);

  const filteredRows = React.useMemo(() => {
    if (speciesFilter === 'all') return parsedRows;
    return parsedRows.filter((r) => r.predictedSpecies === speciesFilter);
  }, [parsedRows, speciesFilter]);

  return (
    <div id="batch-data-uploader-section" className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Mô Hình Hóa Dữ Liệu Tự Động (Batch Prediction)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Kéo thả tệp CSV / JSON chứa các mẫu hoa Iris để chạy dự đoán hàng loạt qua mô hình SVM
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2">
          <button
            id="btn-download-sample-csv"
            type="button"
            onClick={handleDownloadSampleCSV}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Tải CSV Mẫu</span>
          </button>
          <button
            id="btn-load-demo-batch"
            type="button"
            onClick={handleLoadDemoData}
            disabled={isLoading}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Thử Nhanh 10 Mẫu</span>
          </button>
        </div>
      </div>

      {/* Drag and Drop Zone */}
      <div
        id="dropzone-area"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-50/60 scale-[0.99]'
            : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.txt,.json"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFileProcess(e.target.files[0]);
            }
          }}
        />

        <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-200 mx-auto flex items-center justify-center text-blue-600 mb-3">
          <UploadCloud className="w-6 h-6" />
        </div>

        <div className="text-xs font-bold text-slate-800">
          Kéo &amp; Thả tệp CSV / JSON vào đây hoặc <span className="text-blue-600 hover:underline">Duyệt tệp</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Hỗ trợ cột: <code className="bg-slate-200 px-1 py-0.5 rounded text-[10px] font-mono">sepal_length, sepal_width, petal_length, petal_width</code>
        </p>
      </div>

      {/* Error display */}
      {error && (
        <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results View */}
      {parsedRows.length > 0 && stats && (
        <div className="mt-6 pt-5 border-t border-slate-100 animate-in fade-in duration-300">
          {/* Summary Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Tổng Số Mẫu
              </span>
              <div className="text-xl font-extrabold text-slate-900 mt-0.5">{stats.total}</div>
              <span className="text-[10px] text-slate-400">Đã dự đoán bằng {selectedVersionId}</span>
            </div>

            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200">
              <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">
                Iris Setosa
              </span>
              <div className="text-xl font-extrabold text-blue-700 mt-0.5">
                {stats.setosa.count}{' '}
                <span className="text-xs font-normal text-blue-600">({stats.setosa.pct}%)</span>
              </div>
              <span className="text-[10px] text-blue-500">Cánh hoa ngắn</span>
            </div>

            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200">
              <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
                Iris Versicolor
              </span>
              <div className="text-xl font-extrabold text-emerald-700 mt-0.5">
                {stats.versicolor.count}{' '}
                <span className="text-xs font-normal text-emerald-600">({stats.versicolor.pct}%)</span>
              </div>
              <span className="text-[10px] text-emerald-500">Kích thước trung gian</span>
            </div>

            <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200">
              <span className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider">
                Iris Virginica
              </span>
              <div className="text-xl font-extrabold text-purple-700 mt-0.5">
                {stats.virginica.count}{' '}
                <span className="text-xs font-normal text-purple-600">({stats.virginica.pct}%)</span>
              </div>
              <span className="text-[10px] text-purple-500">Cánh hoa lớn nhất</span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Lọc theo loài:</span>
              <div className="inline-flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px]">
                {(['all', 'setosa', 'versicolor', 'virginica'] as const).map((key) => (
                  <button
                    key={key}
                    onClick={() => setSpeciesFilter(key)}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                      speciesFilter === key
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {key === 'all' ? 'Tất Cả' : `Iris ${key}`}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setParsedRows([]);
                setError(null);
              }}
              className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Xóa kết quả</span>
            </button>
          </div>

          {/* Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="p-2.5 pl-3">#</th>
                  <th className="p-2.5">Sepal L/W</th>
                  <th className="p-2.5">Petal L/W</th>
                  <th className="p-2.5">Loài Dự Đoán</th>
                  <th className="p-2.5">Độ Tin Cậy</th>
                  <th className="p-2.5 pr-3">Phân Phối Xác Suất</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredRows.map((row) => {
                  const stat = IRIS_SPECIES_STATS[row.predictedSpecies];
                  return (
                    <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-2.5 pl-3 font-mono text-[11px] text-slate-400">{row.id}</td>
                      <td className="p-2.5 font-mono text-[11px]">
                        {row.sepalLength} / {row.sepalWidth}
                      </td>
                      <td className="p-2.5 font-mono text-[11px]">
                        {row.petalLength} / {row.petalWidth}
                      </td>
                      <td className="p-2.5 font-semibold">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold"
                          style={{
                            backgroundColor: stat.bgColor,
                            color: stat.borderColor,
                          }}
                        >
                          Iris {row.predictedSpecies}
                        </span>
                      </td>
                      <td className="p-2.5 font-bold font-mono text-[11px]">
                        {row.confidence}%
                      </td>
                      <td className="p-2.5 pr-3">
                        <div className="w-28 h-2 bg-slate-100 rounded-full overflow-hidden flex">
                          <div
                            style={{ width: `${row.probabilities.setosa}%` }}
                            className="bg-blue-500 h-full"
                            title={`Setosa: ${row.probabilities.setosa}%`}
                          />
                          <div
                            style={{ width: `${row.probabilities.versicolor}%` }}
                            className="bg-emerald-500 h-full"
                            title={`Versicolor: ${row.probabilities.versicolor}%`}
                          />
                          <div
                            style={{ width: `${row.probabilities.virginica}%` }}
                            className="bg-purple-500 h-full"
                            title={`Virginica: ${row.probabilities.virginica}%`}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
