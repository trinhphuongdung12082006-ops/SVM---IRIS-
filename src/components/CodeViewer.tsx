import React, { useState } from 'react';
import { Copy, Check, Download, Terminal, FileCode, CheckCircle } from 'lucide-react';

interface CodeViewerProps {
  pythonCode: string;
  requirementsCode: string;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ pythonCode, requirementsCode }) => {
  const [activeTab, setActiveTab] = useState<'app' | 'requirements' | 'terminal'>('app');
  const [copiedApp, setCopiedApp] = useState(false);
  const [copiedReq, setCopiedReq] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  const handleCopy = (text: string, type: 'app' | 'req' | 'cmd') => {
    navigator.clipboard.writeText(text);
    if (type === 'app') {
      setCopiedApp(true);
      setTimeout(() => setCopiedApp(false), 2000);
    } else if (type === 'req') {
      setCopiedReq(true);
      setTimeout(() => setCopiedReq(false), 2000);
    } else {
      setCopiedCmd(true);
      setTimeout(() => setCopiedCmd(false), 2000);
    }
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="section-code-viewer" className="bg-slate-900 rounded-2xl border border-slate-800 shadow-lg overflow-hidden text-slate-100 mb-8">
      {/* Tab Navigation Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 px-4 py-3 bg-slate-950/80">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('app')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'app'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            app.py (Streamlit Code)
          </button>
          <button
            onClick={() => setActiveTab('requirements')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'requirements'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            requirements.txt
          </button>
          <button
            onClick={() => setActiveTab('terminal')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'terminal'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Hướng Dẫn Chạy (Guide)
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          {activeTab === 'app' && (
            <>
              <button
                onClick={() => handleCopy(pythonCode, 'app')}
                className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
              >
                {copiedApp ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedApp ? 'Đã sao chép!' : 'Sao chép app.py'}
              </button>
              <button
                onClick={() => handleDownload(pythonCode, 'app.py')}
                className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Tải app.py
              </button>
            </>
          )}

          {activeTab === 'requirements' && (
            <>
              <button
                onClick={() => handleCopy(requirementsCode, 'req')}
                className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
              >
                {copiedReq ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedReq ? 'Đã sao chép!' : 'Sao chép requirements.txt'}
              </button>
              <button
                onClick={() => handleDownload(requirementsCode, 'requirements.txt')}
                className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Tải requirements.txt
              </button>
            </>
          )}
        </div>
      </div>

      {/* Code Display Body */}
      <div className="p-4 max-h-[500px] overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed bg-slate-900/90">
        {activeTab === 'app' && (
          <pre className="whitespace-pre overflow-x-auto text-[11.5px] font-mono text-slate-200">
            <code>{pythonCode}</code>
          </pre>
        )}

        {activeTab === 'requirements' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-400 font-sans">
              Các thư viện cần thiết để triển khai ứng dụng Streamlit trên môi trường Python local:
            </p>
            <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-emerald-400 whitespace-pre">
              <code>{requirementsCode}</code>
            </pre>
          </div>
        )}

        {activeTab === 'terminal' && (
          <div className="font-sans space-y-4 text-xs">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-300 font-semibold mb-1">
                <span>Bước 1: Cài đặt các gói thư viện Python</span>
                <button
                  onClick={() => handleCopy('pip install -r requirements.txt', 'cmd')}
                  className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
                >
                  {copiedCmd ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy
                </button>
              </div>
              <code className="block bg-slate-900 text-emerald-400 p-2.5 rounded font-mono text-xs">
                pip install -r requirements.txt
              </code>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="text-slate-300 font-semibold mb-1">
                <span>Bước 2: Khởi chạy ứng dụng Streamlit</span>
              </div>
              <code className="block bg-slate-900 text-emerald-400 p-2.5 rounded font-mono text-xs">
                streamlit run app.py
              </code>
              <p className="text-[11px] text-slate-400 pt-1">
                Trình duyệt sẽ tự động khởi động tại: <span className="text-blue-400 font-mono">http://localhost:8501</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
