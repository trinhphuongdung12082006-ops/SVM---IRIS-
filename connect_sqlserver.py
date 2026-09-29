"""
HỆ THỐNG KẾT NỐI PYTHON TỚI MICROSOFT SQL SERVER
Script này cho phép:
1. Kết nối trực tiếp tới SQL Server (SSMS) trên máy tính của bạn qua pyodbc
2. Tự động lưu mỗi kết quả dự đoán của mô hình SVM vào bảng PredictionLogs
3. Truy vấn danh sách lịch sử dự đoán để hiển thị lên bảng báo cáo
"""

import pyodbc
from datetime import datetime

# CẤU HÌNH KẾT NỐI MICROSOFT SQL SERVER
# Nếu bạn dùng Windows Authentication (như trong ảnh SSMS), chỉ cần để Trusted_Connection=yes
DB_CONFIG = {
    "server": "localhost",               # Hoặc tên máy của bạn, VD: "DESKTOP-ABC\SQLEXPRESS"
    "database": "IrisClassifierDB",
    "driver": "{ODBC Driver 17 for SQL Server}" # Hoặc "{SQL Server}"
}

def get_db_connection():
    """Tạo kết nối tới SQL Server"""
    conn_str = (
        f"DRIVER={DB_CONFIG['driver']};"
        f"SERVER={DB_CONFIG['server']};"
        f"DATABASE={DB_CONFIG['database']};"
        "Trusted_Connection=yes;"
    )
    return pyodbc.connect(conn_str)

def save_prediction_to_sql(username, sepal_len, sepal_wid, petal_len, petal_wid, species, confidence, model_ver="v1.0-rbf"):
    """Lưu kết quả dự đoán của người dùng vào bảng PredictionLogs"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
            INSERT INTO PredictionLogs 
            (Username, SepalLength, SepalWidth, PetalLength, PetalWidth, PredictedSpecies, ConfidenceScore, ModelVersion, PredictedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        cursor.execute(
            query, 
            (username, sepal_len, sepal_wid, petal_len, petal_wid, species, confidence, model_ver, datetime.now())
        )
        conn.commit()
        cursor.close()
        conn.close()
        print(f"[SQL Server] Đã lưu thành công dự đoán của {username}: {species} ({confidence}%)")
        return True
    except Exception as e:
        print(f"[Lỗi kết nối SQL Server]: {e}")
        return False

def get_recent_predictions(limit=10):
    """Lấy danh sách các lần dự đoán gần nhất từ SQL Server"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(f"SELECT TOP {limit} LogId, Username, SepalLength, SepalWidth, PetalLength, PetalWidth, PredictedSpecies, ConfidenceScore, PredictedAt FROM PredictionLogs ORDER BY PredictedAt DESC")
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        return rows
    except Exception as e:
        print(f"[Lỗi truy vấn SQL Server]: {e}")
        return []

if __name__ == "__main__":
    print("--- KIỂM TRA KẾT NỐI TỚI MICROSOFT SQL SERVER ---")
    success = save_prediction_to_sql("Thử Nghiệm", 5.1, 3.5, 1.4, 0.2, "Iris Setosa", 99.85)
    if success:
        logs = get_recent_predictions()
        print(f"Tổng số bản ghi trong SQL Server: {len(logs)}")
        for log in logs:
            print(log)
