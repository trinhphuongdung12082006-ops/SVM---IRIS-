-- =======================================================
-- HỆ THỐNG CƠ SỞ DỮ LIỆU MICROSOFT SQL SERVER CHO MÔ HÌNH IRIS SVM
-- Database: IrisClassifierDB
-- =======================================================

-- 1. TẠO CƠ SỞ DỮ LIỆU
CREATE DATABASE IrisClassifierDB;
GO

USE IrisClassifierDB;
GO

-- 2. BẢNG TÀI KHOẢN NGƯỜI DÙNG (USERS)
CREATE TABLE Users (
    UserId INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(50) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    FullName NVARCHAR(100),
    Role NVARCHAR(20) DEFAULT 'User', -- 'Admin', 'Researcher', 'User'
    CreatedAt DATETIME DEFAULT GETDATE(),
    LastLogin DATETIME
);
GO

-- 3. BẢNG DỮ LIỆU HOA IRIS CHUẨN (IRIS DATASET)
CREATE TABLE IrisSamples (
    SampleId INT IDENTITY(1,1) PRIMARY KEY,
    SepalLength FLOAT NOT NULL,
    SepalWidth FLOAT NOT NULL,
    PetalLength FLOAT NOT NULL,
    PetalWidth FLOAT NOT NULL,
    Species NVARCHAR(50) NOT NULL, -- 'setosa', 'versicolor', 'virginica'
    IsSupportVector BIT DEFAULT 0,  -- 1 nếu là Support Vector của mô hình SVM
    CreatedAt DATETIME DEFAULT GETDATE()
);
GO

-- 4. BẢNG LỊCH SỬ DỰ ĐOÁN MÔ HÌNH (PREDICTION LOGS)
CREATE TABLE PredictionLogs (
    LogId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NULL FOREIGN KEY REFERENCES Users(UserId),
    Username NVARCHAR(50) DEFAULT 'Khách',
    SepalLength FLOAT NOT NULL,
    SepalWidth FLOAT NOT NULL,
    PetalLength FLOAT NOT NULL,
    PetalWidth FLOAT NOT NULL,
    PredictedSpecies NVARCHAR(50) NOT NULL,
    ConfidenceScore FLOAT NOT NULL,
    ModelVersion NVARCHAR(50) DEFAULT 'v1.0-rbf',
    ExecutionTimeMs FLOAT DEFAULT 0.85,
    PredictedAt DATETIME DEFAULT GETDATE()
);
GO

-- 5. BẢNG PHIÊN BẢN MÔ HÌNH SVM (MODEL VERSIONS)
CREATE TABLE ModelVersions (
    VersionId NVARCHAR(50) PRIMARY KEY,
    KernelType NVARCHAR(20) NOT NULL,
    Accuracy FLOAT NOT NULL,
    F1Score FLOAT NOT NULL,
    SupportVectorCount INT NOT NULL,
    IsActive BIT DEFAULT 0,
    TrainedAt DATETIME DEFAULT GETDATE()
);
GO

-- 6. CHÈN DỮ LIỆU MẪU BAN ĐẦU
INSERT INTO Users (Username, PasswordHash, FullName, Role)
VALUES 
('admin', 'admin123', N'Quản Trị Viên Hệ Thống', 'Admin'),
('researcher', 'science2026', N'Nghiên Cứu Viên Sinh Học', 'Researcher'),
('guest', 'guest', N'Khách Thử Nghiệm', 'User');

INSERT INTO ModelVersions (VersionId, KernelType, Accuracy, F1Score, SupportVectorCount, IsActive)
VALUES 
('v1.0-rbf', 'RBF (Gaussian)', 98.0, 0.980, 41, 1),
('v1.1-linear', 'Linear', 96.67, 0.967, 29, 0),
('v2.0-poly', 'Polynomial (d=3)', 97.33, 0.973, 44, 0);

-- Chèn một số mẫu kiểm thử điển hình
INSERT INTO IrisSamples (SepalLength, SepalWidth, PetalLength, PetalWidth, Species, IsSupportVector)
VALUES 
(5.1, 3.5, 1.4, 0.2, 'setosa', 0),
(4.9, 3.0, 1.4, 0.2, 'setosa', 0),
(4.8, 3.1, 1.6, 0.2, 'setosa', 1), -- Support vector Setosa biên
(7.0, 3.2, 4.7, 1.4, 'versicolor', 0),
(6.4, 3.2, 4.5, 1.5, 'versicolor', 0),
(5.2, 2.7, 3.9, 1.4, 'versicolor', 1), -- Support vector Versicolor biên
(6.3, 3.3, 6.0, 2.5, 'virginica', 0),
(5.8, 2.7, 5.1, 1.9, 'virginica', 0),
(6.0, 3.0, 4.8, 1.8, 'virginica', 1); -- Support vector Virginica biên

-- Chèn một số log dự đoán mẫu
INSERT INTO PredictionLogs (Username, SepalLength, SepalWidth, PetalLength, PetalWidth, PredictedSpecies, ConfidenceScore, ModelVersion, ExecutionTimeMs)
VALUES 
(N'Khách', 5.8, 3.0, 4.2, 1.3, 'versicolor', 98.37, 'v1.0-rbf', 0.74),
(N'admin', 5.0, 3.4, 1.5, 0.2, 'setosa', 99.85, 'v1.0-rbf', 0.65),
(N'researcher', 6.5, 3.0, 5.5, 2.0, 'virginica', 97.42, 'v1.0-rbf', 0.82);
GO

-- =======================================================
-- TRUY VẤN KIỂM TRA BÁO CÁO THỐNG KÊ (DÙNG ĐỂ DEMO TRONG SSMS)
-- =======================================================
-- 1. Xem lịch sử suy luận mới nhất
SELECT TOP 10 * FROM PredictionLogs ORDER BY PredictedAt DESC;

-- 2. Thống kê tỷ lệ phân bổ loài hoa đã dự đoán
SELECT 
    PredictedSpecies, 
    COUNT(*) AS TotalPredictions,
    ROUND(AVG(ConfidenceScore), 2) AS AvgConfidencePercent
FROM PredictionLogs
GROUP BY PredictedSpecies;
GO
