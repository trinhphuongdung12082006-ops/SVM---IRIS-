import React, { useState } from 'react';
import { AuthUser } from '../types';
import {
  User,
  Lock,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  BarChart3,
  Server,
  Layers,
  HelpCircle,
  Zap,
} from 'lucide-react';

interface LoginGatewayProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginGateway: React.FC<LoginGatewayProps> = ({ onLoginSuccess }) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state (3 yêu cầu: 1. Tài khoản, 2. Mật khẩu, 3. Xác nhận lại mật khẩu)
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Xử lý Đăng Nhập
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedUser = loginUsername.trim();
    if (!trimmedUser) {
      setError('Vui lòng nhập tên tài khoản.');
      return;
    }
    if (!loginPassword) {
      setError('Vui lòng nhập mật khẩu.');
      return;
    }

    try {
      const storedUsersRaw = localStorage.getItem('iris_svm_users');
      const users: Record<string, string> = storedUsersRaw ? JSON.parse(storedUsersRaw) : {};

      if (users[trimmedUser] && users[trimmedUser] !== loginPassword) {
        setError('Mật khẩu không chính xác. Vui lòng kiểm tra lại.');
        return;
      }

      const authUser: AuthUser = {
        username: trimmedUser,
        name: trimmedUser,
        isGuest: false,
        loggedInAt: new Date().toISOString(),
      };
      localStorage.setItem('iris_svm_current_user', JSON.stringify(authUser));
      onLoginSuccess(authUser);
    } catch {
      const authUser: AuthUser = {
        username: trimmedUser,
        name: trimmedUser,
        isGuest: false,
        loggedInAt: new Date().toISOString(),
      };
      onLoginSuccess(authUser);
    }
  };

  // Xử lý Đăng Ký (3 trường yêu cầu)
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const trimmedUser = regUsername.trim();
    if (!trimmedUser) {
      setError('Yêu cầu 1: Vui lòng nhập tên tài khoản.');
      return;
    }
    if (trimmedUser.length < 5) {
      setError('Tên tài khoản cần có tối thiểu 5 ký tự (quy tắc CSDL SQL Server).');
      return;
    }
    if (trimmedUser.includes(' ')) {
      setError('Tên tài khoản không được chứa khoảng trắng.');
      return;
    }
    if (!regPassword) {
      setError('Yêu cầu 2: Vui lòng nhập mật khẩu.');
      return;
    }
    if (regPassword.length < 4) {
      setError('Mật khẩu cần tối thiểu 4 ký tự.');
      return;
    }
    if (!regConfirmPassword) {
      setError('Yêu cầu 3: Vui lòng xác nhận lại mật khẩu.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError('Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. GỬI TRỰC TIẾP VÀO FASTAPI CỔNG 4444 -> SQL SERVER (BỐNG\SQLEXPRESS)
      const res = await fetch('http://127.0.0.1:4444/api/v1/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: trimmedUser,
          full_name: trimmedUser,
          email: `${trimmedUser.toLowerCase()}@iris-svm.vn`,
          phone_number: '0987654321',
          age: 20,
          initial_deposit: 0,
          role_code: 'CUSTOMER',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setIsSubmitting(false);
        setError(data?.detail?.error_message || data?.detail?.message || data?.detail || 'Lỗi lưu vào SQL Server!');
        return;
      }

      // 2. Lưu vào local state
      const storedUsersRaw = localStorage.getItem('iris_svm_users');
      const users: Record<string, string> = storedUsersRaw ? JSON.parse(storedUsersRaw) : {};
      users[trimmedUser] = regPassword;
      localStorage.setItem('iris_svm_users', JSON.stringify(users));

      const authUser: AuthUser = {
        username: trimmedUser,
        name: trimmedUser,
        isGuest: false,
        loggedInAt: new Date().toISOString(),
      };
      localStorage.setItem('iris_svm_current_user', JSON.stringify(authUser));

      setSuccessMsg(`Đã lưu thành công vào SQL Server (User ID: ${data.user_id || 1})! Đang chuyển trang...`);
      setTimeout(() => {
        setIsSubmitting(false);
        onLoginSuccess(authUser);
      }, 1000);

    } catch (err: any) {
      setIsSubmitting(false);
      setError('Không thể kết nối tới FastAPI cổng 4444! Hãy chắc chắn bạn đã chạy lệnh "python main.py" trong Terminal.');
    }
  };

  // Tiếp tục với vai trò Khách (Guest mode)
  const handleGuestContinue = () => {
    const guestUser: AuthUser = {
      username: 'Khách Trải Nghiệm',
      name: 'Khách',
      isGuest: true,
      loggedInAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem('iris_svm_current_user', JSON.stringify(guestUser));
    } catch {
      // ignore
    }
    onLoginSuccess(guestUser);
  };

  return (
    <div
      id="login-gateway-container"
      className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl shadow-blue-500/20 mb-3 text-2xl font-bold">
            🌸
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Iris SVM Classifier
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
            Hệ Thống Vận Hành ML, Trực Quan Hóa Không Gian SVM &amp; Báo Cáo Hiệu Năng
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-slate-800/90 backdrop-blur-md rounded-3xl border border-slate-700/80 p-6 sm:p-7 shadow-2xl">
          {/* Tab Switcher */}
          <div className="flex bg-slate-900/80 p-1 rounded-2xl border border-slate-700/60 mb-6">
            <button
              id="btn-tab-login"
              type="button"
              onClick={() => {
                setTab('login');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                tab === 'login'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Đăng Nhập
            </button>
            <button
              id="btn-tab-register"
              type="button"
              onClick={() => {
                setTab('register');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                tab === 'register'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Đăng Ký Tài Khoản
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form: Đăng Nhập */}
          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Tên Tài Khoản
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-login-username"
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="Nhập tên tài khoản của bạn"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Mật Khẩu
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <button
                id="btn-submit-login"
                type="submit"
                className="w-full mt-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Đăng Nhập Vào Hệ Thống</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Form: Đăng Ký (3 Trường Yêu Cầu) */
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  1. Tên Tài Khoản (Định danh)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-register-username"
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="VD: nguyen_van_a"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  2. Mật Khẩu (Tối thiểu 4 ký tự)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-register-password"
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  3. Xác Nhận Lại Mật Khẩu
                </label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-register-confirm-password"
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  />
                </div>
              </div>

              <button
                id="btn-submit-register"
                type="submit"
                disabled={isSubmitting}
                className={`w-full mt-2 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                <span>{isSubmitting ? 'Đang Lưu Vào SQL Server...' : 'Tạo Tài Khoản & Lưu Vào SQL Server'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700/60" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
              <span className="bg-slate-800 px-3 text-slate-400">hoặc</span>
            </div>
          </div>

          {/* Guest Access Button */}
          <button
            id="btn-login-guest"
            type="button"
            onClick={handleGuestContinue}
            className="w-full py-2.5 bg-slate-700/50 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold border border-slate-600/60 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Tiếp Tục Với Tư Cách Khách (Dùng Thử Ngay)</span>
          </button>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-6 grid grid-cols-2 gap-2 text-center text-[11px] text-slate-400">
          <div className="p-2 bg-slate-800/40 rounded-xl border border-slate-800 flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="truncate">Ranh Giới 2D &amp; Radar</span>
          </div>
          <div className="p-2 bg-slate-800/40 rounded-xl border border-slate-800 flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="truncate">Ma Trận Nhầm Lẫn</span>
          </div>
          <div className="p-2 bg-slate-800/40 rounded-xl border border-slate-800 flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">AutoML Kéo Thả File</span>
          </div>
          <div className="p-2 bg-slate-800/40 rounded-xl border border-slate-800 flex items-center gap-2">
            <Server className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span className="truncate">FastAPI Swagger UI</span>
          </div>
        </div>
      </div>
    </div>
  );
};
