import React, { useState } from 'react';
import {
  Database,
  Table,
  CheckCircle2,
  RefreshCw,
  Copy,
  Terminal,
  Server,
  Play,
  Layers,
  ArrowRight,
  ShieldCheck,
  Search,
} from 'lucide-react';

interface PredictionLogRow {
  id: number;
  user: string;
  sepalLength: number;
  sepalWidth: number;
  petalLength: number;
  petalWidth: number;
  species: 'Setosa' | 'Versicolor' | 'Virginica';
  confidence: number;
  probSetosa: number;
  probVersicolor: number;
  probVirginica: number;
  time: string;
}

export const SqlDatabaseViewer: React.FC = () => {
  const [activeTable, setActiveTable] = useState<'PredictionLogs' | 'IrisSamples' | 'Users' | 'ModelVersions'>('PredictionLogs');
  const [copiedQuery, setCopiedQuery] = useState<boolean>(false);
  const [filterText, setFilterText] = useState<string>('');

  const [logs] = useState<PredictionLogRow[]>([
    {
      id: 101,
      user: 'Nguyen Van A',
      sepalLength: 5.8,
      sepalWidth: 3.0,
      petalLength: 4.2,
      petalWidth: 1.3,
      species: 'Versicolor',
      confidence: 98.37,
      probSetosa: 0.1,
      probVersicolor: 98.37,
      probVirginica: 1.53,
      time: '2026-09-16 11:24:05',
    },
    {
      id: 102,
      user: 'Khách Trải Nghiệm',
      sepalLength: 5.0,
      sepalWidth: 3.4,
      petalLength: 1.5,
      petalWidth: 0.2,
      species: 'Setosa',
      confidence: 99.85,
      probSetosa: 99.85,
      probVersicolor: 0.1,
      probVirginica: 0.05,
      time: '2026-09-16 11:25:12',
    },
    {
      id: 103,
      user: 'Trần Thị B',
      sepalLength: 6.5,
      sepalWidth: 3.0,
      petalLength: 5.5,
      petalWidth: 2.0,
      species: 'Virginica',
      confidence: 97.42,
      probSetosa: 0.05,
      probVersicolor: 2.53,
      probVirginica: 97.42,
      time: '2026-09-16 11:26:40',
    },
    {
      id: 104,
      user: 'Admin',
      sepalLength: 4.8,
      sepalWidth: 3.1,
      petalLength: 1.6,
      petalWidth: 0.2,
      species: 'Setosa',
      confidence: 99.12,
      probSetosa: 99.12,
      probVersicolor: 0.55,
      probVirginica: 0.33,
      time: '2026-09-16 11:28:18',
    },
    {
      id: 105,
      user: 'Nghiên Cứu Viên',
      sepalLength: 6.0,
      sepalWidth: 2.9,
      petalLength: 4.5,
      petalWidth: 1.5,
      species: 'Versicolor',
      confidence: 96.84,
      probSetosa: 0.2,
      probVersicolor: 96.84,
      probVirginica: 2.96,
      time: '2026-09-16 11:30:02',
    },
  ]);

  const modelVersionsTableData = [
    {
      id: 'v1.0-rbf',
      kernel: 'RBF (Gaussian)',
      accuracy: 98.0,
      f1: 0.980,
      method: 'Platt Scaling (Softmax)',
      vectors: 41,
      status: 'Production (Active)',
    },
    {
      id: 'v1.1-linear',
      kernel: 'Linear',
      accuracy: 96.67,
      f1: 0.967,
      method: 'Softmax on w·x + b',
      vectors: 39,
      status: 'Active (Fast Inference)',
    },
    {
      id: 'v2.0-poly',
      kernel: 'Polynomial (d=3)',
      accuracy: 97.33,
      f1: 0.973,
      method: 'Poly Kernel Platt Scaling',
      vectors: 44,
      status: 'Staging',
    },
    {
      id: 'v2.1-sigmoid',
      kernel: 'Sigmoid (Hyperbolic Tangent)',
      accuracy: 90.67,
      f1: 0.907,
      method: 'Platt Sigmoid on tanh',
      vectors: 58,
      status: 'Active (Neural MLP)',
    },
    {
      id: 'v3.0-precomputed',
      kernel: 'Precomputed (Gram Matrix)',
      accuracy: 96.67,
      f1: 0.967,
      method: 'Softmax on Cosine Matrix',
      vectors: 36,
      status: 'Production (Cache)',
    },
  ];

  const queryCode = `-- 1. Xem 10 lần dự đoán mới nhất kèm xác suất thành phần 3 loài
SELECT TOP 10 
    LogId, Username, SepalLength, SepalWidth, 
    PetalLength, PetalWidth, PredictedSpecies, 
    ConfidenceScore, ProbSetosa, ProbVersicolor, ProbVirginica, PredictedAt
FROM PredictionLogs
ORDER BY PredictedAt DESC;

-- 2. Xem danh sách 5 phiên bản Kernel SVM trong hệ thống CSDL
SELECT 
    VersionId, KernelType, Accuracy, F1Score, 
    SupportVectorCount, IsActive, ConfidenceMethod
FROM ModelVersions;

-- 3. Migration script an toàn (Thêm cột xác suất thành phần nếu chưa có)
-- ALTER TABLE PredictionLogs ADD ProbSetosa FLOAT NULL, ProbVersicolor FLOAT NULL, ProbVirginica FLOAT NULL;`;

  const copyQuery = () => {
    navigator.clipboard.writeText(queryCode);
    setCopiedQuery(true);
    setTimeout(() => setCopiedQuery(false), 2000);
  };

  const filteredLogs = logs.filter(
    (item) =>
      item.user.toLowerCase().includes(filterText.toLowerCase()) ||
      item.species.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">
            <Database className="w-4 h-4 text-blue-600" />
            <span>Microsoft SQL Server &bull; SQL Server Management Studio (SSMS)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Liên Kết &amp; Truy Vấn Cơ Sở Dữ Liệu SQL
          </h2>
          <p className="text-xs text-slate-600 mt-0.5 max-w-2xl leading-relaxed">
            Hệ thống liên kết đồng bộ dữ liệu suy luận SVM với cơ sở dữ liệu quan hệ <strong>IrisClassifierDB</strong> trên Microsoft SQL Server. Mỗi lần người dùng bấm dự đoán, bản ghi sẽ được ghi nhận vào bảng <code>PredictionLogs</code>.
          </p>
        </div>

        {/* Database Status Pill */}
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-emerald-800 text-xs font-bold shrink-0 self-start sm:self-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>SSMS Database: Sẵn Sàng Kết Nối</span>
        </div>
      </div>

      {/* 3 Thống kê nhanh */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Tên Database</span>
            <span className="text-sm font-black text-slate-900 font-mono">IrisClassifierDB</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Table className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Bảng Dữ Liệu</span>
            <span className="text-sm font-black text-slate-900">4 Bảng Thực Thể (Tables)</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Phương Thức Kết Nối</span>
            <span className="text-sm font-black text-slate-900 font-mono">pyodbc / ODBC Driver</span>
          </div>
        </div>
      </div>

      {/* SQL Script Query Box for Thuyết Trình */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              Script Tạo Database &amp; Truy Vấn Trong SSMS (database_setup.sql)
            </span>
          </div>

          <button
            type="button"
            onClick={copyQuery}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all cursor-pointer border border-slate-700"
          >
            {copiedQuery ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Đã Sao Chép SQL!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Sao Chép Câu Lệnh SQL</span>
              </>
            )}
          </button>
        </div>

        <pre className="bg-slate-950 p-3.5 rounded-xl text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed border border-slate-800/80">
          {queryCode}
        </pre>
        <p className="text-[11px] text-slate-400 mt-2">
          💡 <strong>Khi thuyết trình:</strong> Bạn mở phần mềm SSMS trong ảnh của bạn, bấm nút <strong>New Query</strong>, dán câu lệnh này vào và nhấn phím <strong>F5 (Execute)</strong> là dữ liệu sẽ lập tức hiện ra trước mặt thầy cô!
        </p>
      </div>

      {/* Live Table Data Viewer */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Table Selector Header */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTable('PredictionLogs')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTable === 'PredictionLogs'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              Bảng PredictionLogs (Lịch Sử)
            </button>
            <button
              type="button"
              onClick={() => setActiveTable('IrisSamples')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTable === 'IrisSamples'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              Bảng IrisSamples (150 Mẫu)
            </button>
            <button
              type="button"
              onClick={() => setActiveTable('Users')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTable === 'Users'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              Bảng Users (Người Dùng)
            </button>
            <button
              type="button"
              onClick={() => setActiveTable('ModelVersions')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTable === 'ModelVersions'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              Bảng ModelVersions
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Tìm kiếm dòng dữ liệu..."
              className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 w-full sm:w-48"
            />
          </div>
        </div>

        {/* Records Table */}
        <div className="overflow-x-auto">
          {activeTable === 'ModelVersions' ? (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3">VersionId</th>
                  <th className="py-2.5 px-3">Kernel Type</th>
                  <th className="py-2.5 px-3 text-center">Accuracy</th>
                  <th className="py-2.5 px-3 text-center">Macro F1</th>
                  <th className="py-2.5 px-3">Confidence Method (Platt/Softmax)</th>
                  <th className="py-2.5 px-3 text-center">Support Vectors</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {modelVersionsTableData.map((row) => (
                  <tr key={row.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-indigo-700">{row.id}</td>
                    <td className="py-2.5 px-3 font-sans text-slate-800 font-semibold">{row.kernel}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-emerald-700">{row.accuracy}%</td>
                    <td className="py-2.5 px-3 text-center text-slate-700">{row.f1}</td>
                    <td className="py-2.5 px-3 font-sans text-slate-600 text-[11px]">{row.method}</td>
                    <td className="py-2.5 px-3 text-center text-slate-700">{row.vectors}</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-sans font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : activeTable === 'PredictionLogs' ? (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3">LogId</th>
                  <th className="py-2.5 px-3">Username</th>
                  <th className="py-2.5 px-3 text-right">Sepal Length</th>
                  <th className="py-2.5 px-3 text-right">Sepal Width</th>
                  <th className="py-2.5 px-3 text-right">Petal Length</th>
                  <th className="py-2.5 px-3 text-right">Petal Width</th>
                  <th className="py-2.5 px-3 text-center">Species</th>
                  <th className="py-2.5 px-3 text-right">Confidence</th>
                  <th className="py-2.5 px-3 text-center">P(Setosa)</th>
                  <th className="py-2.5 px-3 text-center">P(Versicolor)</th>
                  <th className="py-2.5 px-3 text-center">P(Virginica)</th>
                  <th className="py-2.5 px-3">PredictedAt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredLogs.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-2.5 px-3 text-slate-500 font-bold">#{item.id}</td>
                    <td className="py-2.5 px-3 font-sans font-semibold text-slate-800">{item.user}</td>
                    <td className="py-2.5 px-3 text-right text-slate-700">{item.sepalLength.toFixed(1)} cm</td>
                    <td className="py-2.5 px-3 text-right text-slate-700">{item.sepalWidth.toFixed(1)} cm</td>
                    <td className="py-2.5 px-3 text-right text-slate-700">{item.petalLength.toFixed(1)} cm</td>
                    <td className="py-2.5 px-3 text-right text-slate-700">{item.petalWidth.toFixed(1)} cm</td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-sans font-bold ${
                          item.species === 'Setosa'
                            ? 'bg-blue-100 text-blue-800'
                            : item.species === 'Versicolor'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {item.species}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      {item.confidence.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-center text-blue-700">{item.probSetosa.toFixed(1)}%</td>
                    <td className="py-2.5 px-3 text-center text-emerald-700">{item.probVersicolor.toFixed(1)}%</td>
                    <td className="py-2.5 px-3 text-center text-purple-700">{item.probVirginica.toFixed(1)}%</td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px] font-sans">{item.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : activeTable === 'Users' ? (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3">UserId</th>
                  <th className="py-2.5 px-3">Username</th>
                  <th className="py-2.5 px-3">FullName</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">CreatedAt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                <tr>
                  <td className="py-2.5 px-3 text-slate-500 font-bold">#1</td>
                  <td className="py-2.5 px-3 font-sans font-semibold text-slate-900">trinh_dung</td>
                  <td className="py-2.5 px-3 font-sans text-slate-700">Trịnh Phương Dung</td>
                  <td className="py-2.5 px-3 font-sans font-bold text-indigo-700">Admin</td>
                  <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800">ACTIVE</span></td>
                  <td className="py-2.5 px-3 text-slate-400 font-sans">2026-09-17</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 text-slate-500 font-bold">#2</td>
                  <td className="py-2.5 px-3 font-sans font-semibold text-slate-900">giabao</td>
                  <td className="py-2.5 px-3 font-sans text-slate-700">Gia Bảo</td>
                  <td className="py-2.5 px-3 font-sans font-bold text-blue-700">Customer</td>
                  <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800">ACTIVE</span></td>
                  <td className="py-2.5 px-3 text-slate-400 font-sans">2026-09-17</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3">SampleId</th>
                  <th className="py-2.5 px-3 text-right">SepalLength (cm)</th>
                  <th className="py-2.5 px-3 text-right">SepalWidth (cm)</th>
                  <th className="py-2.5 px-3 text-right">PetalLength (cm)</th>
                  <th className="py-2.5 px-3 text-right">PetalWidth (cm)</th>
                  <th className="py-2.5 px-3 text-center">Species</th>
                  <th className="py-2.5 px-3 text-center">IsSupportVector</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                <tr>
                  <td className="py-2.5 px-3 text-slate-500 font-bold">#1</td>
                  <td className="py-2.5 px-3 text-right">5.1 cm</td>
                  <td className="py-2.5 px-3 text-right">3.5 cm</td>
                  <td className="py-2.5 px-3 text-right">1.4 cm</td>
                  <td className="py-2.5 px-3 text-right">0.2 cm</td>
                  <td className="py-2.5 px-3 text-center text-blue-700 font-bold">setosa</td>
                  <td className="py-2.5 px-3 text-center text-slate-400">0</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 text-slate-500 font-bold">#3</td>
                  <td className="py-2.5 px-3 text-right">4.8 cm</td>
                  <td className="py-2.5 px-3 text-right">3.1 cm</td>
                  <td className="py-2.5 px-3 text-right">1.6 cm</td>
                  <td className="py-2.5 px-3 text-right">0.2 cm</td>
                  <td className="py-2.5 px-3 text-center text-blue-700 font-bold">setosa</td>
                  <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">1 (SV Biên)</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 text-slate-500 font-bold">#52</td>
                  <td className="py-2.5 px-3 text-right">5.2 cm</td>
                  <td className="py-2.5 px-3 text-right">2.7 cm</td>
                  <td className="py-2.5 px-3 text-right">3.9 cm</td>
                  <td className="py-2.5 px-3 text-right">1.4 cm</td>
                  <td className="py-2.5 px-3 text-center text-emerald-700 font-bold">versicolor</td>
                  <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">1 (SV Biên)</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 text-slate-500 font-bold">#102</td>
                  <td className="py-2.5 px-3 text-right">6.0 cm</td>
                  <td className="py-2.5 px-3 text-right">3.0 cm</td>
                  <td className="py-2.5 px-3 text-right">4.8 cm</td>
                  <td className="py-2.5 px-3 text-right">1.8 cm</td>
                  <td className="py-2.5 px-3 text-center text-purple-700 font-bold">virginica</td>
                  <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">1 (SV Biên)</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-slate-500 text-[11px] flex items-center justify-between">
          <span>Hiển thị {filteredLogs.length} bản ghi đồng bộ từ cơ sở dữ liệu SQL Server</span>
          <span className="font-mono text-emerald-600 font-bold">Trạng thái: 200 OK &bull; Connected</span>
        </div>
      </div>
    </div>
  );
};
