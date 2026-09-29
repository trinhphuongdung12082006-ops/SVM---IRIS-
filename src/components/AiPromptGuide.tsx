import React, { useState } from 'react';
import { Sparkles, Copy, Check, Terminal, Eye, Layers, Zap, CheckCircle2 } from 'lucide-react';

export const AiPromptGuide: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const masterPrompt = `[VAI TRÒ & MỤC TIÊU]
Bạn là một Chuyên Gia Machine Learning & Kỹ Sư Full-stack Cấp Cao. Hãy xây dựng một ứng dụng Web hoàn chỉnh để triển khai mô hình Support Vector Machine (SVM) phân loại tập dữ liệu hoa Iris (Iris Dataset) với độ trực quan cao nhất cho người dùng và khả năng vận hành chuẩn production.

[CÁC YÊU CẦU CỐT LÕI ĐỂ TRỰC QUAN HÓA & VẬN HÀNH ML TỐT NHẤT]
1. TIỀN XỬ LÝ & MÔ HÌNH HỌC MÁY (ML PIPELINE):
   - Sử dụng scikit-learn load_iris() gồm 150 mẫu, 4 đặc trưng (sepal_length, sepal_width, petal_length, petal_width) và 3 loài hoa (Setosa, Versicolor, Virginica).
   - BẮT BUỘC chuẩn hóa dữ liệu bằng StandardScaler() để tránh thiên lệch khoảng cách hình học trong thuật toán SVM.
   - Huấn luyện SVC(kernel='rbf', C=1.0, probability=True, random_state=42) để có xác suất Platt Scaling phục vụ tính độ tin cậy (Confidence score %).
   - Hỗ trợ lựa chọn phiên bản mô hình (Kernel RBF dẻo phi tuyến, Linear tốc độ cao, Polynomial bậc 3).
   - Sử dụng cơ chế cache tài nguyên (@st.cache_resource trong Streamlit hoặc singleton engine trong FastAPI/React) để không huấn luyện lại mỗi lượt click.

2. TRỰC QUAN HÓA TRỰC QUAN (VISUALIZATION CHECKLIST):
   - Thẻ kết quả phân loại: Hiển thị loài hoa dự đoán kèm màu sắc đại diện (Setosa: Xanh dương, Versicolor: Xanh lục, Virginica: Tím) và thanh xác suất phân loại nằm ngang (Horizontal Bar Chart).
   - Biểu đồ 2D Decision Boundary (Ranh giới quyết định): Vẽ trên 2 đặc trưng phân loại quan trọng nhất (Petal Length & Petal Width) kèm vùng màu quyết định của SVM, các điểm dữ liệu huấn luyện và đánh dấu điểm hiện tại của người dùng. Cho phép click đổi tọa độ trực tiếp trên biểu đồ.
   - Biểu đồ Radar (Spider Chart): Đặt 4 đặc trưng của mẫu hiện tại lên đa giác và so sánh lồng ghép với đường trung bình của 3 loài hoa để người dùng hiểu vì sao mô hình đưa ra quyết định đó.
   - Mô hình hóa theo tệp dữ liệu (Batch Drag & Drop): Kéo thả tệp CSV/JSON vào để dự đoán hàng loạt và hiển thị biểu đồ phân bổ % các loài hoa.

3. GIAO DIỆN & KIẾN TRÚC HỆ THỐNG:
   - Tối ưu di động (Mobile-friendly): Các nút bấm và thanh trượt tối thiểu 44px, phản hồi tức thì, màu sắc có độ tương phản cao, dễ nhìn và dễ phân tích.
   - Hệ thống xác thực đơn giản: Đăng nhập & Đăng ký tối giản (3 trường: Tài khoản, Mật khẩu, Xác nhận lại mật khẩu) + chế độ Khách (Guest).
   - FastAPI Swagger UI tích hợp: Cung cấp tài liệu API tương tác (/api/v1/predict, /api/v1/batch-predict, /api/v1/models, /api/v1/health) với tính năng "Try it out" thử nghiệm trực tiếp ngay trên trình duyệt.

Hãy xuất mã nguồn chi tiết, sạch sẽ, có chú thích giải thích rõ ràng từng khối lệnh.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(masterPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="ai-prompt-guide-card" className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Lệnh Prompt Chuẩn Cho AI (AI Master Prompt)
            </h3>
            <p className="text-xs text-slate-500">
              Chỉ dẫn chi tiết các thành phần cần thiết để triển khai mô hình SVM lên web đạt độ trực quan cao nhất
            </p>
          </div>
        </div>

        <button
          id="btn-copy-ai-prompt"
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-xs transition-all self-start sm:self-auto"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Đã Sao Chép Lệnh!' : 'Sao Chép Lệnh Cho AI'}</span>
        </button>
      </div>

      {/* 4 Trụ cột trực quan hóa cần có */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100">
          <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700 mb-1">
            <Eye className="w-3.5 h-3.5" />
            <span>1. 2D Decision Boundary</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Ranh giới quyết định của SVM trên 2 đặc trưng mấu chốt (Petal Length/Width) để thấy rõ cách SVM phân chia không gian đa chiều.
          </p>
        </div>

        <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>2. Spider Radar Chart</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Đa giác 4 trục so sánh mẫu người dùng nhập với trung bình 3 loài hoa, giải thích trực giác nguyên do mô hình phân loại.
          </p>
        </div>

        <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 mb-1">
            <Zap className="w-3.5 h-3.5" />
            <span>3. Xác Suất Platt Scaling</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Hiển thị thanh xác suất ngang % độ tin cậy cho từng loài, thay vì chỉ trả về một nhãn cứng nhắc không kèm phân phối.
          </p>
        </div>

        <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 mb-1">
            <Terminal className="w-3.5 h-3.5" />
            <span>4. Kéo Thả File &amp; Swagger</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Cho phép thả tệp CSV kiểm thử hàng loạt và Swagger UI tương tác trực tiếp để kiểm thử API như production.
          </p>
        </div>
      </div>

      {/* Code / Prompt box */}
      <div className="relative">
        <pre className="p-4 bg-slate-900 text-slate-200 text-[11px] font-mono rounded-xl overflow-x-auto max-h-60 leading-relaxed">
          {masterPrompt}
        </pre>
      </div>
    </div>
  );
};
