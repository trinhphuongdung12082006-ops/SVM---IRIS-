import React, { useState } from 'react';
import { AuthUser } from '../types';
import { User, Lock, ArrowRight, CheckCircle2, ShieldCheck, Sparkles, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
  onLoginSuccess: (user: AuthUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  
  // Login fields
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register fields (3 yêu cầu: tài khoản, mật khẩu, xác nhận lại mật khẩu)
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Xử lý Đăng nhập
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

    // Đọc danh sách tài khoản đã đăng ký từ localStorage
    try {
      const storedUsersRaw = localStorage.getItem('iris_svm_users');
      const users: Record<string, string> = storedUsersRaw ? JSON.parse(storedUsersRaw) : {};

      // Nếu tài khoản tồn tại nhưng sai mật khẩu
      if (users[trimmedUser] && users[trimmedUser] !== loginPassword) {
        setError('Mật khẩu không chính xác. Vui lòng kiểm tra lại.');
        return;
      }

      // Đăng nhập thành công
      const authUser: AuthUser = {
        username: trimmedUser,
        name: trimmedUser,
        isGuest: false,
        loggedInAt: new Date().toISOString(),
      };
      localStorage.setItem('iris_svm_current_user', JSON.stringify(authUser));
      onLoginSuccess(authUser);
      onClose();
    } catch {
      const authUser: AuthUser = {
        username: trimmedUser,
        name: trimmedUser,
        isGuest: false,
        loggedInAt: new Date().toISOString(),
      };
      onLoginSuccess(authUser);
      onClose();
    }
  };

  // Xử lý Đăng ký (3 trường theo yêu cầu)
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const trimmedUser = regUsername.trim();
    if (!trimmedUser) {
      setError('Yêu cầu 1: Vui lòng nhập tên tài khoản.');
      return;
    }
    if (trimmedUser.length < 3) {
      setError('Tên tài khoản cần có tối thiểu 3 ký tự.');
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
      setError('Mật khẩu xác nhận không khớp. Vui lòng nhập lại chính xác.');
      return;
    }

    try {
      const storedUsersRaw = localStorage.getItem('iris_svm_users');
      const users: Record<string, string> = storedUsersRaw ? JSON.parse(storedUsersRaw) : {};

      if (users[trimmedUser]) {
        setError('Tài khoản này đã tồn tại. Vui lòng chọn tên khác hoặc chuyển sang Đăng nhập.');
        return;
      }

      // Lưu tài khoản mới
      users[trimmedUser] = regPassword;
      localStorage.setItem('iris_svm_users', JSON.stringify(users));

      // Tự động đăng nhập
      const authUser: AuthUser = {
        username: trimmedUser,
        name: trimmedUser,
        isGuest: false,
        loggedInAt: new Date().toISOString(),
      };
      localStorage.setItem('iris_svm_current_user', JSON.stringify(authUser));

      setSuccessMsg('Đăng ký tài khoản thành công! Đang tự động đăng nhập...');
      setTimeout(() => {
        onLoginSuccess(authUser);
        onClose();
      }, 700);
    } catch {
      const authUser: AuthUser = {
        username: trimmedUser,
        name: trimmedUser,
        isGuest: false,
        loggedInAt: new Date().toISOString(),
      };
      onLoginSuccess(authUser);
      onClose();
    }
  };

  // Vào nhanh với vai trò Khách (Guest)
  const handleGuestLogin = () => {
    const guestUser: AuthUser = {
      username: 'Khách Trải Nghiệm',
      name: 'Khách',
      isGuest: true,
      loggedInAt: new Date().toISOString(),
    };
    localStorage.setItem('iris_svm_current_user', JSON.stringify(guestUser));
    onLoginSuccess(guestUser);
    onClose();
  };

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        id="auth-modal-card"
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-5 pb-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl shadow-xs">
              🌸
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">Iris SVM Platform</h3>
              <p className="text-xs text-blue-100">Hệ thống Vận Hành ML &amp; API Swagger</p>
            </div>
          </div>
          {currentUser && (
            <button
              id="auth-modal-close-btn"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tab Switcher: Đăng nhập vs Đăng ký */}
        <div className="flex border-b border-slate-200 bg-slate-50 p-1 m-4 rounded-xl">
          <button
            id="tab-login-btn"
            type="button"
            onClick={() => {
              setTab('login');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              tab === 'login'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Đăng Nhập
          </button>
          <button
            id="tab-register-btn"
            type="button"
            onClick={() => {
              setTab('register');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              tab === 'register'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Đăng Ký (3 Yêu Cầu)
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 pt-0">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <span className="font-bold">Lỗi:</span> {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tài khoản (Tên người dùng)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    id="input-login-username"
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="Ví dụ: ml_engineer"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    id="input-login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <button
                id="btn-submit-login"
                type="submit"
                className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <span>Đăng Nhập Vào Hệ Thống</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-100 text-[11px] text-blue-700 font-medium">
                Đăng ký siêu đơn giản với 3 yêu cầu: Tài khoản, Mật khẩu và Xác nhận lại mật khẩu.
              </div>

              {/* Yêu cầu 1: Tài khoản */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  1. Tài khoản (Tên đăng nhập)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    id="input-reg-username"
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="Nhập tên tài khoản của bạn..."
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Yêu cầu 2: Mật khẩu */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  2. Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    id="input-reg-password"
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Yêu cầu 3: Xác nhận lại mật khẩu */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  3. Xác nhận lại mật khẩu
                </label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    id="input-reg-confirm-password"
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Nhập lại chính xác mật khẩu trên..."
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <button
                id="btn-submit-register"
                type="submit"
                className="w-full mt-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <span>Hoàn Tất Đăng Ký &amp; Vào Nền Tảng</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* Guest Login Option */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Muốn dùng thử ngay?</span>
            <button
              id="btn-guest-login"
              type="button"
              onClick={handleGuestLogin}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 hover:underline"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Trải nghiệm Khách (Guest)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
