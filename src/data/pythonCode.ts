export const REQUIREMENTS_TXT = `streamlit>=1.30.0
scikit-learn>=1.3.0
pandas>=2.0.0
numpy>=1.24.0
plotly>=5.18.0
matplotlib>=3.8.0
`;

export const APP_PY = `"""
Ứng dụng Web Streamlit Phân loại Hoa Iris bằng mô hình Support Vector Machine (SVM)
===================================================================================
Tác giả: Machine Learning & Full-stack Python Developer
Mục tiêu:
  1. Huấn luyện mô hình SVM (RBF Kernel, probability=True) với StandardScaler trên Iris dataset.
  2. Sidebar tương tác 4 tham số (Sepal Length/Width, Petal Length/Width) dựa trên giá trị thực tế.
  3. Trực quan hóa kết quả:
     - Nhãn loài hoa dự đoán kèm thanh xác suất phân loại (Horizontal Bar Chart).
     - Biểu đồ Radar (Spider Chart) so sánh thông số người dùng với trung bình 3 loài hoa.
     - Biểu đồ 2D Decision Boundary (Ranh giới quyết định) của SVM trên 2 đặc trưng quan trọng nhất
       (Petal Length & Petal Width) kèm vị trí điểm người dùng vừa chọn.
  4. Tối ưu hóa hiệu năng với @st.cache_resource.
"""

import streamlit as st
import numpy as np
import pandas as pd
from sklearn.datasets import load_iris
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
import plotly.graph_objects as go
import plotly.express as px

# ==============================================================================
# CẤU HÌNH TRANG WEB (PAGE CONFIGURATION)
# ==============================================================================
st.set_page_config(
    page_title="Iris Classifier - SVM Machine Learning",
    page_icon="🌸",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Tùy chỉnh CSS để giao diện trực quan và thanh lịch
st.markdown("""
<style>
    .main-title {
        font-size: 2.2rem;
        font-weight: 700;
        color: #1E293B;
        margin-bottom: 0.25rem;
    }
    .sub-title {
        font-size: 1.05rem;
        color: #64748B;
        margin-bottom: 1.5rem;
    }
    .metric-card {
        background-color: #F8FAFC;
        border: 1px solid #E2E8F0;
        border-radius: 10px;
        padding: 16px;
        text-align: center;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .stMetric label {
        font-size: 0.9rem !important;
        font-weight: 600;
    }
</style>
""", unsafe_allow_html=True)


# ==============================================================================
# 1. HUẤN LUYỆN MÔ HÌNH VÀ TIỀN XỬ LÝ DỮ LIỆU (BACKEND ML)
# ==============================================================================
@st.cache_resource(show_spinner="Đang tải dữ liệu và huấn luyện mô hình SVM...")
def load_data_and_train_models():
    """
    Hàm tải tập dữ liệu Iris, chuẩn hóa bằng StandardScaler và huấn luyện 2 mô hình SVM:
      - full_model: Huấn luyện trên toàn bộ 4 đặc trưng để dự đoán phân loại chính xác.
      - model_2d: Huấn luyện trên 2 đặc trưng quan trọng nhất (Petal Length, Petal Width)
                  để trực quan hóa 2D Decision Boundary chính xác và trực quan.
    Sử dụng @st.cache_resource để chỉ huấn luyện một lần duy nhất khi khởi chạy.
    """
    # 1. Tải dataset Iris
    iris = load_iris()
    X = iris.data
    y = iris.target
    feature_names = iris.feature_names
    target_names = iris.target_names

    # Tạo DataFrame để tính toán giá trị thống kê trung bình từng loài
    df = pd.DataFrame(X, columns=feature_names)
    df['target'] = y
    df['species'] = df['target'].map({i: name for i, name in enumerate(target_names)})

    # 2. Chuẩn hóa dữ liệu cho mô hình 4 đặc trưng
    scaler_full = StandardScaler()
    X_scaled = scaler_full.fit_transform(X)

    # Khởi tạo và huấn luyện mô hình SVC với xác suất (probability=True)
    svm_full = SVC(kernel='rbf', C=1.0, gamma='scale', probability=True, random_state=42)
    svm_full.fit(X_scaled, y)

    # 3. Chuẩn bị mô hình 2D trên 2 đặc trưng quan trọng nhất: Petal Length (index 2) & Petal Width (index 3)
    X_2d = X[:, [2, 3]]
    scaler_2d = StandardScaler()
    X_2d_scaled = scaler_2d.fit_transform(X_2d)

    svm_2d = SVC(kernel='rbf', C=1.0, gamma='scale', probability=True, random_state=42)
    svm_2d.fit(X_2d_scaled, y)

    # Tính giá trị trung bình 4 đặc trưng của từng loài phục vụ Radar Chart
    species_means = df.groupby('species')[feature_names].mean()

    return {
        'iris': iris,
        'df': df,
        'feature_names': feature_names,
        'target_names': target_names,
        'scaler_full': scaler_full,
        'svm_full': svm_full,
        'scaler_2d': scaler_2d,
        'svm_2d': svm_2d,
        'species_means': species_means,
        'X_2d': X_2d,
        'y': y
    }

# Tải tài nguyên đã huấn luyện (được cache)
ml_assets = load_data_and_train_models()
feature_names = ml_assets['feature_names']
target_names = ml_assets['target_names']
df_iris = ml_assets['df']


# ==============================================================================
# 2. GIAO DIỆN & TƯƠNG TÁC (FRONTEND - SIDEBAR CONTROLS)
# ==============================================================================
st.sidebar.header("🌸 Thông Số Đầu Vào (Input Features)")
st.sidebar.markdown("Điều chỉnh các thông số hình thái học của bông hoa Iris để xem dự đoán theo thời gian thực:")

# Thông tin giải thích & Preset nhanh
preset = st.sidebar.selectbox(
    "Mẫu thử nhanh (Presets):",
    ["Tùy chỉnh (Custom)", "Iris Setosa (Mẫu)", "Iris Versicolor (Mẫu)", "Iris Virginica (Mẫu)"]
)

# Giá trị mặc định theo mẫu hoặc trung bình chung
if preset == "Iris Setosa (Mẫu)":
    default_vals = [5.0, 3.4, 1.5, 0.2]
elif preset == "Iris Versicolor (Mẫu)":
    default_vals = [5.9, 2.8, 4.2, 1.3]
elif preset == "Iris Virginica (Mẫu)":
    default_vals = [6.5, 3.0, 5.5, 2.0]
else:
    default_vals = [5.8, 3.0, 4.2, 1.3]

# Các thanh trượt được gán min/max dựa trên phân bố thực tế của Iris dataset
# Feature 0: Sepal Length (cm) [min=4.3, max=7.9]
sepal_length = st.sidebar.slider(
    "Đài hoa - Chiều dài (Sepal Length cm):",
    min_value=float(df_iris[feature_names[0]].min()),
    max_value=float(df_iris[feature_names[0]].max()),
    value=float(default_vals[0]),
    step=0.1,
    help="Chiều dài của đài hoa (cm)"
)

# Feature 1: Sepal Width (cm) [min=2.0, max=4.4]
sepal_width = st.sidebar.slider(
    "Đài hoa - Chiều rộng (Sepal Width cm):",
    min_value=float(df_iris[feature_names[1]].min()),
    max_value=float(df_iris[feature_names[1]].max()),
    value=float(default_vals[1]),
    step=0.1,
    help="Chiều rộng của đài hoa (cm)"
)

# Feature 2: Petal Length (cm) [min=1.0, max=6.9]
petal_length = st.sidebar.slider(
    "Cánh hoa - Chiều dài (Petal Length cm):",
    min_value=float(df_iris[feature_names[2]].min()),
    max_value=float(df_iris[feature_names[2]].max()),
    value=float(default_vals[2]),
    step=0.1,
    help="Chiều dài của cánh hoa (cm)"
)

# Feature 3: Petal Width (cm) [min=0.1, max=2.5]
petal_width = st.sidebar.slider(
    "Cánh hoa - Chiều rộng (Petal Width cm):",
    min_value=float(df_iris[feature_names[3]].min()),
    max_value=float(df_iris[feature_names[3]].max()),
    value=float(default_vals[3]),
    step=0.1,
    help="Chiều rộng của cánh hoa (cm)"
)

st.sidebar.markdown("---")
st.sidebar.markdown(
    """
    **Mô hình SVM:**
    - Kernel: **RBF (Radial Basis Function)**
    - Chuẩn hóa: **StandardScaler**
    - Đánh giá: **predict_proba()**
    """
)

# Thu thập mẫu đầu vào người dùng
user_input_array = np.array([[sepal_length, sepal_width, petal_length, petal_width]])


# ==============================================================================
# 3. SUY LUẬN & DỰ ĐOÁN (INFERENCE)
# ==============================================================================
# Chuẩn hóa mẫu người dùng
user_input_scaled = ml_assets['scaler_full'].transform(user_input_array)

# Dự đoán lớp và phân phối xác suất
predicted_class_id = ml_assets['svm_full'].predict(user_input_scaled)[0]
predicted_species = target_names[predicted_class_id]
predicted_probabilities = ml_assets['svm_full'].predict_proba(user_input_scaled)[0]
confidence = predicted_probabilities[predicted_class_id] * 100

# Màu sắc đại diện cho 3 loài hoa
SPECIES_COLORS = {
    "setosa": "#3B82F6",       # Xanh lam
    "versicolor": "#10B981",   # Xanh ngọc lục bảo
    "virginica": "#8B5CF6"     # Tím Violet
}

# Tiêu đề chính
st.markdown('<div class="main-title">🌿 Hệ Thống Phân Loại Hoa Iris Bằng Mô Hình SVM</div>', unsafe_allow_html=True)
st.markdown(
    '<div class="sub-title">Ứng dụng Machine Learning trực quan hóa tương tác: Ranh giới quyết định (Decision Boundary), Biểu đồ Radar, và Phân phối xác suất dự đoán.</div>',
    unsafe_allow_html=True
)


# ==============================================================================
# 4. HIỂN THỊ KẾT QUẢ DỰ ĐOÁN VÀ BIỂU ĐỒ XÁC SUẤT
# ==============================================================================
col_pred1, col_pred2 = st.columns([1, 2], gap="medium")

with col_pred1:
    st.subheader("🎯 Kết Quả Phân Loại")
    badge_color = SPECIES_COLORS[predicted_species]
    st.markdown(
        f"""
        <div style="background: linear-gradient(135deg, {badge_color}15, {badge_color}30); 
                    border: 2px solid {badge_color}; border-radius: 12px; padding: 20px; text-align: center;">
            <div style="font-size: 0.95rem; color: #475569; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">
                Loài hoa dự đoán
            </div>
            <div style="font-size: 2.2rem; font-weight: 800; color: {badge_color}; margin: 8px 0;">
                Iris {predicted_species.capitalize()}
            </div>
            <div style="font-size: 1.1rem; font-weight: 600; color: #1E293B;">
                Độ tin cậy: <span style="color: {badge_color}; font-weight: 800;">{confidence:.2f}%</span>
            </div>
        </div>
        """,
        unsafe_allow_html=True
    )

    st.markdown("<br>", unsafe_allow_html=True)
    # Tóm tắt thông số nhập vào
    st.markdown("**Thông số bạn đang chọn:**")
    m1, m2 = st.columns(2)
    m1.metric("Sepal Length", f"{sepal_length} cm")
    m1.metric("Petal Length", f"{petal_length} cm")
    m2.metric("Sepal Width", f"{sepal_width} cm")
    m2.metric("Petal Width", f"{petal_width} cm")

with col_pred2:
    st.subheader("📊 Độ Tin Cậy & Phân Phối Xác Suất")
    
    # Biểu đồ cột ngang (Horizontal Bar Chart) hiển thị xác suất của từng loài hoa
    prob_df = pd.DataFrame({
        "Loài hoa": [f"Iris {name.capitalize()}" for name in target_names],
        "Xác suất (%)": predicted_probabilities * 100,
        "Color": [SPECIES_COLORS[name] for name in target_names]
    })

    fig_prob = go.Figure()
    fig_prob.add_trace(go.Bar(
        x=prob_df["Xác suất (%)"],
        y=prob_df["Loài hoa"],
        orientation='h',
        marker=dict(
            color=prob_df["Color"],
            line=dict(color='rgba(0,0,0,0.15)', width=1.5)
        ),
        text=[f"{val:.1f}%" for val in prob_df["Xác suất (%)"]],
        textposition='outside',
        hoverinfo='x+y'
    ))

    fig_prob.update_layout(
        xaxis=dict(title="Xác suất (%)", range=[0, 115], showgrid=True, gridcolor="#E2E8F0"),
        yaxis=dict(autorange="reversed"),
        margin=dict(l=20, r=30, t=15, b=30),
        height=240,
        paper_bgcolor='rgba(0,0,0,0)',
        plot_bgcolor='rgba(0,0,0,0)',
        font=dict(family="sans-serif", size=13)
    )
    st.plotly_chart(fig_prob, use_container_width=True)

st.markdown("---")


# ==============================================================================
# 5. TRỰC QUAN HÓA CHUYÊN SÂU: RADAR CHART & 2D DECISION BOUNDARY
# ==============================================================================
col_radar, col_boundary = st.columns(2, gap="large")

# ------------------------------------------------------------------------------
# 5A. BIỂU ĐỒ RADAR (SPIDER CHART)
# ------------------------------------------------------------------------------
with col_radar:
    st.subheader("🕸️ Biểu Đồ Radar (Spider Chart)")
    st.caption("So sánh 4 đặc trưng của mẫu hiện tại với trung bình 3 loài hoa Iris:")

    # Chuẩn bị danh mục và nhãn đẹp
    categories = ['Sepal Length', 'Sepal Width', 'Petal Length', 'Petal Width']
    user_vals = [sepal_length, sepal_width, petal_length, petal_width]
    
    # Khép kín đường vẽ đa giác radar bằng cách lặp lại điểm đầu tiên
    categories_closed = categories + [categories[0]]
    user_vals_closed = user_vals + [user_vals[0]]

    fig_radar = go.Figure()

    # Thêm đường trung bình của từng loài hoa
    means = ml_assets['species_means']
    for species in target_names:
        species_mean_vals = [means.loc[species, feat] for feat in feature_names]
        species_mean_vals_closed = species_mean_vals + [species_mean_vals[0]]
        
        fig_radar.add_trace(go.Scatterpolar(
            r=species_mean_vals_closed,
            theta=categories_closed,
            name=f"TB {species.capitalize()}",
            line=dict(color=SPECIES_COLORS[species], width=2, dash='dot'),
            opacity=0.6,
            hoverinfo='r+name'
        ))

    # Thêm đường dữ liệu do người dùng đang chọn (nổi bật, phủ màu)
    fig_radar.add_trace(go.Scatterpolar(
        r=user_vals_closed,
        theta=categories_closed,
        fill='toself',
        fillcolor='rgba(239, 68, 68, 0.25)',  # Đỏ nhạt
        line=dict(color='#EF4444', width=3),   # Đỏ nổi bật
        name='Mẫu Hiện Tại (User Input)',
        marker=dict(size=7, color='#EF4444'),
        hoverinfo='r+name'
    ))

    fig_radar.update_layout(
        polar=dict(
            radialaxis=dict(
                visible=True,
                range=[0, 8],
                showgrid=True,
                gridcolor="#E2E8F0",
                tickfont=dict(size=10)
            ),
            angularaxis=dict(
                tickfont=dict(size=12, family="sans-serif"),
                rotation=90,
                direction="clockwise"
            )
        ),
        showlegend=True,
        legend=dict(orientation="h", yanchor="bottom", y=-0.25, xanchor="center", x=0.5),
        margin=dict(l=40, r=40, t=20, b=50),
        height=420,
        paper_bgcolor='rgba(0,0,0,0)'
    )

    st.plotly_chart(fig_radar, use_container_width=True)


# ------------------------------------------------------------------------------
# 5B. BIỂU ĐỒ 2D DECISION BOUNDARY (RANH GIỚI QUYẾT ĐỊNH SVM)
# ------------------------------------------------------------------------------
with col_boundary:
    st.subheader("🗺️ 2D SVM Decision Boundary")
    st.caption("Ranh giới phân chia không gian trên 2 đặc trưng quan trọng nhất: Petal Length & Petal Width:")

    X_2d = ml_assets['X_2d']
    y = ml_assets['y']
    scaler_2d = ml_assets['scaler_2d']
    svm_2d = ml_assets['svm_2d']

    # Tạo lưới tọa độ Meshgrid để phủ ranh giới quyết định
    x_min, x_max = X_2d[:, 0].min() - 0.5, X_2d[:, 0].max() + 0.5
    y_min, y_max = X_2d[:, 1].min() - 0.4, X_2d[:, 1].max() + 0.4
    
    # Bước nhảy mịn cho lưới
    h = 0.05
    xx, yy = np.meshgrid(np.arange(x_min, x_max, h), np.arange(y_min, y_max, h))
    
    # Chuẩn hóa lưới và dự đoán nhãn cho toàn bộ không gian
    grid_points = np.c_[xx.ravel(), yy.ravel()]
    grid_points_scaled = scaler_2d.transform(grid_points)
    Z = svm_2d.predict(grid_points_scaled)
    Z = Z.reshape(xx.shape)

    fig_boundary = go.Figure()

    # 1. Vẽ vùng quyết định dạng Heatmap/Contour
    # Bảng màu tương ứng: setosa (0), versicolor (1), virginica (2)
    colorscale = [
        [0.0, "rgba(59, 130, 246, 0.18)"],
        [0.33, "rgba(59, 130, 246, 0.18)"],
        [0.33, "rgba(16, 185, 129, 0.18)"],
        [0.66, "rgba(16, 185, 129, 0.18)"],
        [0.66, "rgba(139, 92, 246, 0.18)"],
        [1.0, "rgba(139, 92, 246, 0.18)"],
    ]

    fig_boundary.add_trace(go.Contour(
        x=np.arange(x_min, x_max, h),
        y=np.arange(y_min, y_max, h),
        z=Z,
        showscale=False,
        colorscale=colorscale,
        contours_coloring='heatmap',
        line=dict(width=1, color='rgba(148, 163, 184, 0.4)'),
        hoverinfo='skip',
        name='Ranh Giới SVM'
    ))

    # 2. Vẽ các điểm dữ liệu huấn luyện thực tế
    for class_id, species in enumerate(target_names):
        mask = (y == class_id)
        fig_boundary.add_trace(go.Scatter(
            x=X_2d[mask, 0],
            y=X_2d[mask, 1],
            mode='markers',
            name=f"Dataset {species.capitalize()}",
            marker=dict(
                size=8,
                color=SPECIES_COLORS[species],
                line=dict(color='white', width=1),
                opacity=0.75
            ),
            hovertemplate=f"<b>Iris {species.capitalize()}</b><br>Petal Length: %{x:.2f} cm<br>Petal Width: %{y:.2f} cm<extra></extra>"
        ))

    # 3. Đánh dấu vị trí điểm do người dùng đang chọn
    fig_boundary.add_trace(go.Scatter(
        x=[petal_length],
        y=[petal_width],
        mode='markers',
        name='Điểm Bạn Chọn (Current)',
        marker=dict(
            symbol='star',
            size=18,
            color='#EF4444',
            line=dict(color='#FFFFFF', width=2)
        ),
        hovertemplate=f"<b>Mẫu Hiện Tại</b><br>Petal Length: {petal_length} cm<br>Petal Width: {petal_width} cm<br>Dự đoán: {predicted_species.capitalize()}<extra></extra>"
    ))

    fig_boundary.update_layout(
        xaxis=dict(title="Petal Length (cm)", range=[x_min, x_max], showgrid=True, gridcolor="#E2E8F0"),
        yaxis=dict(title="Petal Width (cm)", range=[y_min, y_max], showgrid=True, gridcolor="#E2E8F0"),
        showlegend=True,
        legend=dict(orientation="h", yanchor="bottom", y=-0.25, xanchor="center", x=0.5),
        margin=dict(l=40, r=20, t=20, b=50),
        height=420,
        paper_bgcolor='rgba(0,0,0,0)',
        plot_bgcolor='rgba(255,255,255,0.9)'
    )

    st.plotly_chart(fig_boundary, use_container_width=True)

# ==============================================================================
# 6. BẢNG DỮ LIỆU THỐNG KÊ & THÔNG TIN MÔ HÌNH (EXPANDER)
# ==============================================================================
with st.expander("ℹ️ Xem Chi Tiết Thống Kê Iris Dataset & Lý Thuyết SVM"):
    tab1, tab2 = st.tabs(["📊 Thống Kê Trung Bình Từng Loài", "🧠 Giới Thiệu Thuật Toán SVM"])
    
    with tab1:
        st.write("Giá trị trung bình 4 đặc trưng đo đạc được trên 150 mẫu Iris thực tế:")
        stats_table = ml_assets['species_means'].copy()
        stats_table.index = [f"Iris {idx.capitalize()}" for idx in stats_table.index]
        st.dataframe(stats_table.style.highlight_max(axis=0, color="#E2E8F0"), use_container_width=True)

    with tab2:
        st.markdown("""
        - **Support Vector Machine (SVM)** là thuật toán học có giám sát tìm kiếm siêu phẳng tối ưu (Hyperplane) phân tách các lớp dữ liệu với khoảng cách biên (Margin) lớn nhất có thể.
        - **RBF Kernel (Radial Basis Function)** cho phép ánh xạ dữ liệu phi tuyến tính sang không gian chiều cao hơn để tìm ranh giới phân tách mềm dẻo.
        - **Chuẩn hóa StandardScaler**: SVM rất nhạy cảm với thang đo của các đặc trưng, việc quy chuẩn về phân phối chuẩn có $\\\\mu = 0$ và $\\\\sigma = 1$ giúp mô hình tối ưu chính xác.
        - **predict_proba**: Được hỗ trợ thông qua kỹ thuật Platt Scaling nội suy xác suất trong \`sklearn.svm.SVC(probability=True)\`.
        """)
`;
