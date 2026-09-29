import os
import pyodbc
from typing import Optional
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, EmailStr
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Data Quality API",
    description="Hệ thống FastAPI kết nối trực tiếp SQL Server BỐNG\\SQLEXPRESS trên cổng 4444",
    version="1.0.0"
)

# Cấu hình CORS để Web React tại cổng 3000 có thể gửi dữ liệu trực tiếp vào SQL Server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# KẾT NỐI TỚI BỐNG\SQLEXPRESS QUA WINDOWS AUTHENTICATION
def get_db_connection():
    conn_str = (
        "DRIVER={ODBC Driver 17 for SQL Server};"
        r"SERVER=BỐNG\SQLEXPRESS;"
        "DATABASE=DataManagementDB;"
        "Trusted_Connection=yes;"
        "TrustServerCertificate=yes;"
    )
    return pyodbc.connect(conn_str, autocommit=True)

# SCHEMA VALIDATION CHUẨN PYDANTIC V2
class UserCreateRequest(BaseModel):
    username: str = Field(..., min_length=5, max_length=50)
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone_number: str = Field(..., min_length=10, max_length=11)
    age: int = Field(..., ge=18, le=100)
    initial_deposit: float = Field(default=0.0, ge=0.0)
    role_code: str = Field(default="CUSTOMER")

    model_config = {
        "json_schema_extra": {
            "example": {
                "username": "trinh_dung",
                "full_name": "Trịnh Phương Dung",
                "email": "dung.trinh@company.com",
                "phone_number": "0987654321",
                "age": 20,
                "initial_deposit": 500000.0,
                "role_code": "CUSTOMER"
            }
        }
    }

# 1. KIỂM TRA TRẠNG THÁI KẾT NỐI
@app.get("/", tags=["Health Check"])
def check_health():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT @@VERSION AS Version, DB_NAME() AS CurrentDatabase")
        row = cursor.fetchone()
        conn.close()
        return {
            "trang_thai": "Ket noi SQL Server Thanh Cong!",
            "server": r"BỐNG\SQLEXPRESS",
            "database": row.CurrentDatabase,
            "port": 4444
        }
    except Exception as e:
        return {"trang_thai": "Loi ket noi", "chi_tiet": str(e), "port": 4444}

# 2. API GỌI STORED PROCEDURE THÊM DỮ LIỆU ĐÃ CHUẨN HÓA
@app.post("/api/v1/users", status_code=status.HTTP_201_CREATED, tags=["Users"])
def create_user(user: UserCreateRequest):
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        sql = """
            DECLARE @out_UserId INT;
            DECLARE @out_StatusCode INT;
            DECLARE @out_StatusMessage NVARCHAR(500);

            EXEC dbo.usp_CreateUserAccount
                @p_Username = ?,
                @p_FullName = ?,
                @p_Email = ?,
                @p_PhoneNumber = ?,
                @p_Age = ?,
                @p_InitialDeposit = ?,
                @p_RoleCode = ?,
                @p_NewUserId = @out_UserId OUTPUT,
                @p_StatusCode = @out_StatusCode OUTPUT,
                @p_StatusMessage = @out_StatusMessage OUTPUT;

            SELECT @out_UserId AS NewUserId, @out_StatusCode AS StatusCode, @out_StatusMessage AS StatusMessage;
        """

        cursor.execute(
            sql,
            user.username,
            user.full_name,
            user.email,
            user.phone_number,
            user.age,
            user.initial_deposit,
            user.role_code
        )

        row = cursor.fetchone()
        new_id = row.NewUserId
        code = row.StatusCode
        msg = row.StatusMessage
        conn.close()

        if code != 200:
            raise HTTPException(status_code=400, detail={"code": code, "message": msg})

        return {
            "success": True,
            "message": msg,
            "user_id": new_id,
            "port": 4444
        }
    except HTTPException:
        raise
    except Exception as e:
        if conn:
            conn.close()
        raise HTTPException(status_code=500, detail=str(e))

# 3. LẤY DANH SÁCH TẤT CẢ TÀI KHOẢN TRONG SQL SERVER
@app.get("/api/v1/users", tags=["Users"])
def get_all_users():
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT u.UserId, u.Username, u.FullName, u.Email, u.PhoneNumber, 
                   u.Age, u.AccountBalance, u.AccountStatus, r.RoleName, 
                   CONVERT(VARCHAR(20), u.CreatedAt, 120) AS CreatedAt
            FROM UserAccounts u
            INNER JOIN Roles r ON u.RoleId = r.RoleId
            ORDER BY u.UserId DESC
        """)
        columns = [column[0] for column in cursor.description]
        results = []
        for row in cursor.fetchall():
            results.append(dict(zip(columns, row)))
        conn.close()
        return {"total": len(results), "users": results}
    except Exception as e:
        if conn:
            conn.close()
        raise HTTPException(status_code=500, detail=str(e))

# 4. XEM CHI TIẾT TÀI KHOẢN THEO USERNAME
@app.get("/api/v1/users/{username}", tags=["Users"])
def get_user_by_username(username: str):
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT u.UserId, u.Username, u.FullName, u.Email, u.PhoneNumber, 
                   u.Age, u.AccountBalance, u.AccountStatus, r.RoleName,
                   CONVERT(VARCHAR(20), u.CreatedAt, 120) AS CreatedAt
            FROM UserAccounts u
            INNER JOIN Roles r ON u.RoleId = r.RoleId
            WHERE u.Username = ?
        """, username.strip().lower())
        row = cursor.fetchone()
        if not row:
            conn.close()
            raise HTTPException(status_code=404, detail=f"Không tìm thấy tài khoản '{username}'")
        
        columns = [column[0] for column in cursor.description]
        user_data = dict(zip(columns, row))
        conn.close()
        return {"found": True, "user": user_data}
    except HTTPException:
        raise
    except Exception as e:
        if conn:
            conn.close()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # Cổng cố định 4444 theo yêu cầu
    PORT = 4444
    print(f"--> Dang khoi dong FastAPI Backend tren cong: {PORT}")
    uvicorn.run(app, host="127.0.0.1", port=PORT)
