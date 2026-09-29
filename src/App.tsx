/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { UserInputFeatures, AuthUser, ModelVersion, ModelVersionId } from './types';
import { FEATURE_BOUNDS } from './data/irisData';
import { predictIrisSVM } from './utils/svmModel';
import { MODEL_VERSIONS } from './data/modelVersions';

// Components
import { LoginGateway } from './components/LoginGateway';
import { Sidebar } from './components/Sidebar';
import { PredictionCard } from './components/PredictionCard';
import { RadarChart } from './components/RadarChart';
import { DecisionBoundaryPlot } from './components/DecisionBoundaryPlot';
import { ModelVersionSelector } from './components/ModelVersionSelector';
import { ModelEvaluationReport } from './components/ModelEvaluationReport';
import { ModelExplainability } from './components/ModelExplainability';
import { BatchDataUploader } from './components/BatchDataUploader';
import { SwaggerUI } from './components/SwaggerUI';
import { SqlDatabaseViewer } from './components/SqlDatabaseViewer';
import { AiPromptGuide } from './components/AiPromptGuide';
import { AuthModal } from './components/AuthModal';

import {
  Activity,
  Server,
  Database,
  Smartphone,
  Monitor,
  User,
  LogOut,
  Sliders,
  Sparkles,
  PartyPopper,
  CheckCircle2,
  Layers,
  BarChart3,
  Award,
  Lightbulb,
  FileSpreadsheet,
  Terminal,
  ShieldCheck,
  ChevronRight,
  Eye,
  Info,
} from 'lucide-react';

export type AppTab =
  | 'inference'
  | 'boundary_radar'
  | 'evaluation'
  | 'explainability'
  | 'batch_upload'
  | 'sql_db'
  | 'swagger'
  | 'ai_prompt';

export default function App() {
  // Trạng thái xác thực người dùng (Auth User) - Mặc định null để hiển thị màn hình Đăng Nhập khi vào web
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Tab đang kích hoạt
  const [activeTab, setActiveTab] = useState<AppTab>('inference');

  // Trạng thái 4 tham số đầu vào của hoa Iris
  const [features, setFeatures] = useState<UserInputFeatures>({
    sepalLength: FEATURE_BOUNDS.sepalLength.default,
    sepalWidth: FEATURE_BOUNDS.sepalWidth.default,
    petalLength: FEATURE_BOUNDS.petalLength.default,
    petalWidth: FEATURE_BOUNDS.petalWidth.default,
  });

  const [activePreset, setActivePreset] = useState<string>('custom');

  // Phiên bản mô hình SVM đang chọn (Hỗ trợ 5 Kernel Scikit-Learn)
  const [selectedVersionId, setSelectedVersionId] = useState<ModelVersionId>('v1.0-rbf');

  // Bối cảnh ứng dụng di động: Mobile Frame Mode vs Full Responsive Mode
  const [isMobileFrameMode, setIsMobileFrameMode] = useState<boolean>(false);

  // Đóng/mở drawer tham số trên di động
  const [isMobileInputDrawerOpen, setIsMobileInputDrawerOpen] = useState<boolean>(false);

  // Khôi phục phiên đăng nhập từ localStorage (nếu có)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('iris_svm_current_user');
      if (saved) {
        setCurrentUser(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  // Dự đoán kết quả SVM tương ứng với phiên bản mô hình được chọn
  const prediction = useMemo(() => {
    return predictIrisSVM(features, selectedVersionId);
  }, [features, selectedVersionId]);

  // Chọn mẫu thử nhanh (Preset)
  const handleSelectPreset = (presetKey: string) => {
    setActivePreset(presetKey);
    if (presetKey === 'setosa') {
      setFeatures({ sepalLength: 5.0, sepalWidth: 3.4, petalLength: 1.5, petalWidth: 0.2 });
    } else if (presetKey === 'versicolor') {
      setFeatures({ sepalLength: 5.9, sepalWidth: 2.8, petalLength: 4.2, petalWidth: 1.3 });
    } else if (presetKey === 'virginica') {
      setFeatures({ sepalLength: 6.5, sepalWidth: 3.0, petalLength: 5.5, petalWidth: 2.0 });
    } else {
      setFeatures({
        sepalLength: FEATURE_BOUNDS.sepalLength.default,
        sepalWidth: FEATURE_BOUNDS.sepalWidth.default,
        petalLength: FEATURE_BOUNDS.petalLength.default,
        petalWidth: FEATURE_BOUNDS.petalWidth.default,
      });
    }
  };

  const handleReset = () => {
    setActivePreset('custom');
    setFeatures({
      sepalLength: FEATURE_BOUNDS.sepalLength.default,
      sepalWidth: FEATURE_BOUNDS.sepalWidth.default,
      petalLength: FEATURE_BOUNDS.petalLength.default,
      petalWidth: FEATURE_BOUNDS.petalWidth.default,
    });
  };

  const handleUpdatePetalParams = (petalLength: number, petalWidth: number) => {
    setActivePreset('custom');
    setFeatures((prev) => ({
      ...prev,
      petalLength,
      petalWidth,
    }));
  };

  // Đăng xuất và trở về Cổng Đăng Nhập
  const handleLogout = () => {
    localStorage.removeItem('iris_svm_current_user');
    setCurrentUser(null);
  };

  // Hiệu ứng pháo giấy confetti khi có kết quả tự tin cao
  const triggerBalloons = () => {
    confetti({
      particleCount: 80,
      spread: 75,
      origin: { y: 0.6 },
    });
  };

  // NẾU CHƯA ĐĂNG NHẬP: Hiển thị màn hình Đăng Nhập / Đăng Ký (Theo đúng yêu cầu của người dùng)
  if (!currentUser) {
    return <LoginGateway onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  // Danh sách các tab điều hướng người dùng (Chuẩn giao diện sản phẩm người dùng cuối)
  const navigationTabs = [
    {
      id: 'inference' as AppTab,
      label: 'Dự Đoán Thời Gian Thực',
      shortLabel: 'Dự Đoán',
      icon: Sparkles,
      color: 'text-blue-600',
      activeClass: 'bg-white text-blue-700 shadow-xs border-blue-200',
    },
    {
      id: 'boundary_radar' as AppTab,
      label: 'Ranh Giới 2D & Radar',
      shortLabel: 'Ranh Giới',
      icon: Layers,
      color: 'text-purple-600',
      activeClass: 'bg-white text-purple-700 shadow-xs border-purple-200',
    },
    {
      id: 'evaluation' as AppTab,
      label: 'Báo Cáo Hiệu Năng & Đánh Giá',
      shortLabel: 'Báo Cáo',
      icon: Award,
      color: 'text-indigo-600',
      activeClass: 'bg-white text-indigo-700 shadow-xs border-indigo-200',
      badge: '98%',
    },
    {
      id: 'explainability' as AppTab,
      label: 'Giải Thích & Độ Nhạy',
      shortLabel: 'Giải Thích',
      icon: Lightbulb,
      color: 'text-amber-600',
      activeClass: 'bg-white text-amber-700 shadow-xs border-amber-200',
    },
    {
      id: 'batch_upload' as AppTab,
      label: 'Kéo Thả Tệp AutoML',
      shortLabel: 'Tệp Batch',
      icon: FileSpreadsheet,
      color: 'text-emerald-600',
      activeClass: 'bg-white text-emerald-700 shadow-xs border-emerald-200',
    },
  ];

  // Nội dung chính theo tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'inference':
        return (
          <div className="space-y-6">
            {/* Context Header */}
            <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-white p-5 rounded-2xl border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Trung Tâm Suy Luận MLOps &bull; Real-time Inference</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Suy Luận &amp; Phân Loại Mô Hình SVM
                </h2>
                <p className="text-xs text-slate-600 mt-0.5 max-w-2xl leading-relaxed">
                  Thay đổi 4 tham số đài hoa &amp; cánh hoa để mô hình SVM tính toán khoảng cách siêu phẳng và xác suất phân bổ Platt Scaling tức thì.
                </p>
              </div>

              {/* Mobile button to open params */}
              <button
                id="btn-open-params-mobile"
                type="button"
                onClick={() => setIsMobileInputDrawerOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all self-start sm:self-auto"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Chỉnh 4 Tham Số</span>
              </button>
            </div>

            {/* Bộ chọn Version Mô Hình */}
            <ModelVersionSelector
              selectedVersionId={selectedVersionId}
              onSelectVersion={setSelectedVersionId}
            />

            {/* Thẻ kết quả phân loại & thanh phân phối xác suất */}
            <PredictionCard prediction={prediction} features={features} />

            {/* Quick Links to Other Analytical Sections */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('boundary_radar')}
                className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/30 text-left transition-all group flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block group-hover:text-purple-700">
                      Ranh Giới 2D &amp; Radar
                    </span>
                    <span className="text-[11px] text-slate-500">Xem siêu phẳng &amp; support vectors</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('evaluation')}
                className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 text-left transition-all group flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block group-hover:text-indigo-700">
                      Báo Cáo Hiệu Năng
                    </span>
                    <span className="text-[11px] text-slate-500">Ma trận nhầm lẫn &amp; 5-Fold CV</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('explainability')}
                className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/30 text-left transition-all group flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block group-hover:text-amber-800">
                      Giải Thích Độ Nhạy
                    </span>
                    <span className="text-[11px] text-slate-500">Mô phỏng "What-If" độ nhạy</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        );

      case 'boundary_radar':
        return (
          <div className="space-y-6">
            {/* Banner */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-purple-700 uppercase tracking-wider mb-1">
                  <Layers className="w-4 h-4 text-purple-600" />
                  <span>Trực Quan Hóa Hình Học Đa Chiều &bull; Geometric Analysis</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Ranh Giới Quyết Định 2D &amp; Spider Radar Chart
                </h2>
                <p className="text-xs text-slate-600 mt-0.5 max-w-2xl leading-relaxed">
                  Quan sát vùng phân cách phi tuyến của SVM trên 2 đặc trưng Petal Length &amp; Petal Width, đối chiếu các Support Vectors và so sánh 4 thông số với giá trị trung bình 3 loài hoa.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs bg-purple-50 text-purple-800 px-3 py-1.5 rounded-xl border border-purple-200 font-bold self-start sm:self-auto">
                <span>Kernel: {selectedVersionId}</span>
              </div>
            </div>

            {/* Grid 2 đồ thị */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DecisionBoundaryPlot
                features={features}
                onUpdatePetalParams={handleUpdatePetalParams}
                selectedVersionId={selectedVersionId}
              />
              <RadarChart features={features} />
            </div>

            {/* Math note */}
            <div className="p-4 bg-slate-900 text-slate-200 rounded-2xl text-xs flex items-start gap-3">
              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Cơ Chế Phân Tách SVM:</strong> Mô hình tìm kiếm siêu phẳng tối ưu hóa khoảng cách lề (Margin width = 2/||w||). Bằng cách chiếu dữ liệu vào không gian nhiều chiều thông qua hàm nhân RBF $K(x, x') = \exp(-\gamma ||x - x'||^2)$, các mẫu hoa Iris được phân tách mềm với độ chính xác đạt tới 98.0%.
              </div>
            </div>
          </div>
        );

      case 'evaluation':
        return <ModelEvaluationReport />;

      case 'explainability':
        return (
          <ModelExplainability
            currentFeatures={features}
            selectedVersionId={selectedVersionId}
          />
        );

      case 'batch_upload':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>AutoML &amp; Suy Luận Hàng Loạt &bull; Batch Ingestion</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Giụt Tệp &amp; Mô Hình Hóa Dữ Liệu Hàng Loạt
              </h2>
              <p className="text-xs text-slate-600 mt-0.5 max-w-2xl leading-relaxed">
                Kéo thả file CSV hoặc JSON chứa các đặc trưng hoa Iris vào hệ thống. Mô hình SVM sẽ tự động chuẩn hóa, dự đoán đồng loạt và xuất báo cáo tỷ lệ phân bổ.
              </p>
            </div>

            <BatchDataUploader selectedVersionId={selectedVersionId} />
          </div>
        );

      case 'sql_db':
        return <SqlDatabaseViewer />;

      case 'swagger':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-bold text-teal-700 uppercase tracking-wider mb-1">
                <Server className="w-4 h-4 text-teal-600" />
                <span>API Microservice &bull; OpenAPI 3.1.0</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                FastAPI Swagger UI &bull; Tài Liệu Tương Tác Trực Tiếp
              </h2>
              <p className="text-xs text-slate-600 mt-0.5 max-w-2xl leading-relaxed">
                Mô phỏng đầy đủ giao diện Swagger UI chuẩn production của FastAPI. Bạn có thể nhấn <strong>Try it out</strong> và <strong>Execute</strong> trên từng endpoint để gọi kiểm thử trực tiếp ngay trên trình duyệt.
              </p>
            </div>

            <SwaggerUI />
          </div>
        );

      case 'ai_prompt':
        return (
          <div className="space-y-6">
            <AiPromptGuide />
          </div>
        );

      default:
        return null;
    }
  };

  const mainLayoutContent = (
    <div className="p-4 sm:p-6 lg:p-7 max-w-6xl mx-auto w-full">
      {renderTabContent()}
    </div>
  );

  return (
    <div id="app-root-container" className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Top Main Navigation Header Bar */}
      <header
        id="app-main-header"
        className="bg-white border-b border-slate-200 sticky top-0 z-40 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 shadow-2xs"
      >
        {/* Logo & Brand */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-xs">
            🌸
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                Iris SVM Classifier
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                Online MLOps
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Hệ Thống Trực Quan Hóa &amp; Báo Cáo Hiệu Năng Mô Hình
            </p>
          </div>
        </div>

        {/* Desktop Navigation Tabs (Từng mục riêng biệt) */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 overflow-x-auto">
          {navigationTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? tab.activeClass
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? tab.color : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-mono">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Tools & User Authentication Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile frame preview toggle */}
          <button
            id="btn-toggle-mobile-frame"
            type="button"
            onClick={() => setIsMobileFrameMode(!isMobileFrameMode)}
            title={isMobileFrameMode ? 'Chuyển sang toàn màn hình' : 'Chuyển sang khung xem ứng dụng di động'}
            className="hidden md:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors"
          >
            {isMobileFrameMode ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-blue-600" />
                <span>Toàn Màn Hình</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-purple-600" />
                <span>Khung Di Động</span>
              </>
            )}
          </button>

          {/* Confetti Balloons Button */}
          <button
            id="btn-balloons-header"
            type="button"
            onClick={triggerBalloons}
            title="Kích hoạt pháo giấy chúc mừng"
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-amber-500 transition-colors cursor-pointer"
          >
            <PartyPopper className="w-4 h-4" />
          </button>

          {/* User Account Info & Logout Button */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
              {currentUser.username.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-xs font-bold text-slate-800 max-w-[90px] sm:max-w-[120px] truncate block leading-tight">
                {currentUser.username}
              </span>
              <span className="text-[10px] text-slate-500 block leading-tight">
                {currentUser.isGuest ? 'Khách trải nghiệm' : 'Đã xác thực'}
              </span>
            </div>

            <button
              id="btn-logout-user"
              type="button"
              onClick={handleLogout}
              title="Đăng xuất khỏi hệ thống"
              className="text-slate-400 hover:text-rose-600 p-1 transition-colors rounded-lg hover:bg-rose-50"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Sub-header on Mobile/Tablet: Horizontal scrollable tabs */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-3 py-1.5 overflow-x-auto flex items-center gap-1.5">
        {navigationTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.shortLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Main Container: Mobile Frame Mode or Standard Fluid Responsive Mode */}
      {isMobileFrameMode ? (
        <div className="flex-1 p-4 sm:p-8 flex items-center justify-center bg-slate-200/80 overflow-y-auto">
          {/* Simulated Mobile Device Frame */}
          <div className="w-full max-w-[420px] h-[820px] bg-white rounded-[40px] shadow-2xl border-[10px] border-slate-900 flex flex-col overflow-hidden relative">
            {/* Phone Notch & Speaker */}
            <div className="h-6 bg-slate-900 w-full flex items-center justify-center shrink-0">
              <div className="w-24 h-3 bg-black rounded-b-xl flex items-center justify-center">
                <div className="w-10 h-1 bg-slate-700 rounded-full" />
              </div>
            </div>

            {/* Mobile App Header */}
            <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between shrink-0">
              <span className="font-bold text-xs flex items-center gap-1.5">
                🌸 Iris SVM Mobile
              </span>
              <span className="text-[10px] bg-blue-600 px-2 py-0.5 rounded-full font-mono">
                {selectedVersionId}
              </span>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto bg-slate-50">
              {mainLayoutContent}
            </div>

            {/* Mobile App Bottom Tab Bar */}
            <nav className="h-14 bg-white border-t border-slate-200 flex items-center justify-around px-1 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('inference')}
                className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
                  activeTab === 'inference' ? 'text-blue-600' : 'text-slate-400'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Dự Đoán</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('boundary_radar')}
                className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
                  activeTab === 'boundary_radar' ? 'text-purple-600' : 'text-slate-400'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Ranh Giới</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('evaluation')}
                className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
                  activeTab === 'evaluation' ? 'text-indigo-600' : 'text-slate-400'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Báo Cáo</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('explainability')}
                className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
                  activeTab === 'explainability' ? 'text-amber-600' : 'text-slate-400'
                }`}
              >
                <Lightbulb className="w-4 h-4" />
                <span>Giải Thích</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('batch_upload')}
                className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
                  activeTab === 'batch_upload' ? 'text-emerald-600' : 'text-slate-400'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>AutoML</span>
              </button>
            </nav>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row">
          {/* Desktop Left Sidebar: Hiển thị khi ở tab Dự đoán, Ranh giới hoặc Độ nhạy */}
          {(activeTab === 'inference' || activeTab === 'boundary_radar' || activeTab === 'explainability') && (
            <div className="hidden lg:block shrink-0">
              <Sidebar
                features={features}
                onChange={setFeatures}
                onReset={handleReset}
                onSelectPreset={handleSelectPreset}
                activePreset={activePreset}
                selectedVersionId={selectedVersionId}
              />
            </div>
          )}

          {/* Main Area */}
          <main className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-y-auto">
            {mainLayoutContent}
          </main>
        </div>
      )}

      {/* Mobile Input Drawer Modal for Adjusting Parameters */}
      {isMobileInputDrawerOpen && (
        <div
          id="mobile-drawer-backdrop"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end lg:hidden animate-in fade-in"
        >
          <div
            id="mobile-drawer-card"
            className="bg-slate-900 text-white w-full max-h-[85vh] rounded-t-3xl p-5 overflow-y-auto border-t border-slate-700 shadow-2xl flex flex-col"
          >
            <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-400" />
                <span>Điều Chỉnh 4 Tham Số Iris</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsMobileInputDrawerOpen(false)}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
              >
                Đóng
              </button>
            </div>

            <Sidebar
              features={features}
              onChange={setFeatures}
              onReset={handleReset}
              onSelectPreset={handleSelectPreset}
              activePreset={activePreset}
              selectedVersionId={selectedVersionId}
            />
          </div>
        </div>
      )}

      {/* Auth Modal (phòng trường hợp người dùng muốn đổi tài khoản) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthModalOpen(false);
        }}
      />

      {/* Global Bottom Footer */}
      <footer className="bg-white border-t border-slate-200 py-3.5 px-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span>🌸 Iris SVM Classifier &bull; Support Vector Machine MLOps</span>
        </div>
        <div className="flex items-center gap-3">
          <span>StandardScaler Normalization</span>
          <span>&bull;</span>
          <span>Platt Scaling Probabilities</span>
          <span>&bull;</span>
          <span>FastAPI OpenAPI 3.1.0</span>
        </div>
      </footer>
    </div>
  );
}
