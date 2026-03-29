# Hướng dẫn chạy source code - Web3 HR Management System

## 📋 Tổng quan dự án

Đây là hệ thống quản lý nhân sự (HR) tích hợp công nghệ blockchain với các thành phần:
- **Backend**: Node.js/Express + MongoDB + Smart Contracts
- **Frontend**: React với Material-UI
- **Smart Contracts**: Solidity contracts trên Ethereum/Sepolia
- **ML Service**: Python (tùy chọn) cho phân tích cảm xúc và dự đoán nhân viên

---

## 🔧 Yêu cầu hệ thống

### Phần mềm cần cài đặt:
1. **Node.js** (phiên bản >= 18.0.0)
   - Tải tại: https://nodejs.org/
   - Kiểm tra: `node --version`

2. **MongoDB** (phiên bản >= 4.4)
   - Tải tại: https://www.mongodb.com/try/download/community
   - Hoặc sử dụng MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

3. **Git** (để clone code nếu cần)
   - Tải tại: https://git-scm.com/downloads

4. **MetaMask Extension** (cho trình duyệt)
   - Tải tại: https://metamask.io/download/

5. **Python 3.8+** (chỉ cần nếu chạy ML Service)
   - Tải tại: https://www.python.org/downloads/

---

## 📦 Cài đặt và chạy dự án

### Bước 1: Cài đặt Backend

```bash
# 1. Di chuyển vào thư mục backend
cd backend

# 2. Cài đặt dependencies (QUAN TRỌNG - PHẢI LÀM BƯỚC NÀY ĐẦU TIÊN!)
npm install

# 3. Copy file môi trường
copy .env.example .env

# 4. Mở file .env và cấu hình các thông số sau:
```

**Cấu hình file `.env` (quan trọng):**

```env
# Database Connection
MONGODB_URI=mongodb://localhost:27017/qlns
# Hoặc dùng MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Security
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters

# Web3/Blockchain (cho local development)
# Có thể để trống nếu chỉ chạy backend
PRIVATE_KEY=
MNEMONIC=
SEPOLIA_RPC_URL=

# Smart Contract Addresses (để trống nếu chưa deploy)
EMPLOYEE_REGISTRY_CONTRACT=0x0000000000000000000000000000000000000000
KPI_CONTRACT=0x0000000000000000000000000000000000000000
PAYROLL_CONTRACT=0x0000000000000000000000000000000000000000
PAYROLL_TOKEN=0x0000000000000000000000000000000000000000
ATTENDANCE_CONTRACT=0x0000000000000000000000000000000000000000
QR_AUTH_CONTRACT=0x0000000000000000000000000000000000000000
CONSENT_CONTRACT=0x0000000000000000000000000000000000000000

# ML Service (tùy chọn)
ML_SERVICE_URL=http://localhost:8001
```

**Chạy Backend:**

```bash
# Chạy mode development (tự động restart khi code thay đổi)
npm run dev

# Hoặc chạy production
npm start
```

Backend sẽ chạy tại: `http://localhost:5000`

---

### Bước 2: Cài đặt Frontend

Mở **terminal mới** (để backend vẫn chạy):

```bash
# 1. Di chuyển vào thư mục frontend
cd frontend

# 2. Cài đặt dependencies
npm install

# 3. Chạy frontend
npm start
```

Frontend sẽ mở tại: `http://localhost:3000`

---

### Bước 3: (Tùy chọn) Deploy Smart Contracts

Nếu muốn sử dụng tính năng blockchain:

```bash
# 1. Di chuyển vào thư mục backend
cd backend

# 2. Compile smart contracts
npm run compile

# 3. Khởi động Hardhat local network (mở terminal mới)
npm run node

# 4. Deploy contracts lên local network (mở terminal khác)
npm run deploy:hrpayroll

# 5. Cập nhật contract addresses vào file .env
```

**Lưu ý:** Nếu deploy lên Sepolia testnet:
- Cần có ETH trên Sepolia (lấy tại: https://sepoliafaucet.com/)
- Cần Infura Project ID: https://infura.io/
- Chạy: `npm run deploy:hrpayroll:sepolia`

---

### Bước 4: (Tùy chọn) Chạy ML Service

Nếu muốn sử dụng tính năng phân tích cảm xúc và dự đoán nhân viên:

```bash
# 1. Cài đặt Python dependencies
cd ml-service
pip install -r requirements.txt

# 2. Chạy ML service
python -m uvicorn app:app --host 0.0.0.0 --port 8001
```

ML Service sẽ chạy tại: `http://localhost:8001`

---

## 🚀 Sử dụng hệ thống

### 1. Truy cập ứng dụng
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/api (nếu có Swagger)

### 2. Tạo tài khoản đầu tiên
1. Mở http://localhost:3000
2. Đăng ký tài khoản mới
3. Hoặc chạy script để tạo Super Admin:
```bash
cd backend
node scripts/seedSuperAdmin.js
```

### 3. Kết nối MetaMask (cho tính năng blockchain)
1. Cài MetaMask extension
2. Tạo hoặc import wallet
3. Chuyển sang Sepolia testnet hoặc Localhost 8545
4. Kết nối wallet với ứng dụng

---

## 🐛 Khắc phục sự cố thường gặp

### 1. Lỗi "Cannot find module 'express'" (hoặc module khác)

**Nguyên nhân:** Chưa cài đặt dependencies với `npm install`

**Giải pháp:**
```bash
cd backend
npm install
```

**Lưu ý quan trọng:**
- PHẢI chạy `npm install` trước khi chạy `npm start` hoặc `npm run dev`
- Lệnh này sẽ cài tất cả dependencies trong file `package.json`
- Thời gian cài đặt có thể mất 3-5 phút tùy tốc độ mạng

### 2. Lỗi "MongoDB connection failed"

**Nguyên nhân:** MongoDB chưa chạy hoặc connection string sai

**Giải pháp:**
- Kiểm tra MongoDB đã chạy: `mongod` (nếu cài local)
- Kiểm tra connection string trong `.env`
- Nếu dùng MongoDB Atlas, đảm bảo IP address đã được whitelist

### 3. Lỗi "Module not found" khi chạy npm install

**Giải pháp:**
```bash
# Xóa node_modules và package-lock.json
rm -rf node_modules package-lock.json  # Linux/Mac
# Hoặc
rmdir /s /q node_modules package-lock.json  # Windows

# Cài lại
npm install
```

### 4. Lỗi "EADDRINUSE: address already in use"

**Nguyên nhân:** Port 5000 hoặc 3000 đang bị sử dụng

**Giải pháp:**
- Thay đổi PORT trong file `.env`
- Hoặc tắt ứng dụng đang chạy trên port đó:
```bash
# Tìm process đang dùng port 5000
netstat -ano | findstr :5000  # Windows
lsof -i :5000  # Linux/Mac

# Kill process
taskkill /PID <PID> /F  # Windows
kill -9 <PID>  # Linux/Mac
```

### 5. Lỗi "Insufficient contract token balance"

**Giải pháp:**
- Nạp token vào contract qua API:
```bash
curl -X POST http://localhost:5000/api/payroll/deposit \
  -H "Authorization: Bearer <super_admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"amount": 100000}'
```

### 6. Frontend không kết nối được với Backend

**Giải pháp:**
- Kiểm tra backend đã chạy chưa
- Kiểm tra proxy trong `frontend/package.json`: `"proxy": "http://localhost:5000"`
- Kiểm tra CORS trong backend (file `backend/server.js`)

### 7. Lỗi "Cannot find module 'hardhat'"

**Giải pháp:**
```bash
cd backend
npm install --save-dev hardhat
```

### 8. MetaMask không kết nối được

**Giải pháp:**
- Đảm bảo MetaMask đã cài và unlock
- Chọn đúng network (Localhost 8545 hoặc Sepolia)
- Refresh trang và thử kết nối lại

### 9. Lỗi "options.allowedHosts[0] should be a non-empty string" (Frontend)

**Nguyên nhân:** Phiên bản webpack-dev-server mới không tương thích với react-scripts

**Giải pháp 1 (Khuyên dùng - Cài lại react-scripts):**
```bash
cd frontend
npm install react-scripts@5.0.1 --save
npm start
```

**Giải pháp 2 (Nếu giải pháp 1 không được):**
```bash
# Xóa node_modules và package-lock.json
rmdir /s /q node_modules package-lock.json

# Cài lại
npm install
npm start
```

**Giải pháp 3 (Sửa package.json):**
Mở file `frontend/package.json` và thay đổi dòng:
```json
"start": "set NODE_OPTIONS=--no-deprecation && react-scripts start",
```
Thành:
```json
"start": "set NODE_OPTIONS=--no-deprecation && set SKIP_PREFLIGHT_CHECK=true && react-scripts start",
```

### 10. ML Service không chạy được

**Giải pháp:**
- Kiểm tra Python version: `python --version` (cần >= 3.8)
- Cài lại dependencies: `pip install -r requirements.txt`
- Nếu thiếu GPU, model sẽ chạy trên CPU (chậm hơn)
- Nếu không cần ML features, có thể bỏ qua bước này

---

## 📝 Scripts hữu ích

### Backend scripts:
```bash
# Seed dữ liệu mẫu (departments, employees, roles)
node scripts/seedDepartments.js
node scripts/seedEmployees.js
node scripts/seedRoles.js

# Kiểm tra node blockchain
npm run check:node

# Test payment
npm run test:payment
```

### Kiểm tra health check:
```bash
# Backend health
curl http://localhost:5000/health

# ML Service health
curl http://localhost:8001/healthz
```

---

## 🔐 Lưu ý bảo mật

1. **KHÔNG bao giờ commit file `.env`** vào Git
2. Thay đổi `JWT_SECRET` trong production
3. Sử dụng environment variables cho sensitive data
4. Đảm bảo MongoDB có authentication enabled
5. Sử dụng HTTPS trong production

---

## 📚 Tài liệu tham khảo

- [Express.js](https://expressjs.com/)
- [React](https://reactjs.org/)
- [MongoDB](https://www.mongodb.com/docs/)
- [Hardhat](https://hardhat.org/docs)
- [Ethers.js](https://docs.ethers.org/)
- [Material-UI](https://mui.com/)

---

## 🆘 Cần hỗ trợ?

Nếu gặp lỗi khác, vui lòng:
1. Kiểm tra console logs (terminal)
2. Kiểm tra browser console (F12)
3. Đọc error message kỹ lưỡng
4. Tìm kiếm trên Google/StackOverflow với error message

---

## 📌 Tóm tắt nhanh (Quick Start)

```bash
# Terminal 1: Backend
cd backend
npm install
copy .env.example .env
# Edit .env với MongoDB URI và JWT_SECRET
npm run dev

# Terminal 2: Frontend
cd frontend
npm install
npm start

# Terminal 3: (Tùy chọn) Hardhat node
cd backend
npm run node

# Terminal 4: (Tùy chọn) Deploy contracts
cd backend
npm run deploy:hrpayroll

# Terminal 5: (Tùy chọn) ML Service
cd ml-service
pip install -r requirements.txt
python -m uvicorn app:app --host 0.0.0.0 --port 8001
```

Truy cập: http://localhost:3000

---

## ⚠️ LỖI BẠN ĐANG GẶP

**Lỗi:** `Error: Cannot find module 'express'`

**Nguyên nhân:** Bạn chưa chạy `npm install` trước khi chạy `npm start`

**Giải pháp ngay lập tức:**
```bash
cd C:\Users\PHONG\Downloads\QLNS-main\backend
npm install
```

Sau khi `npm install` hoàn tất (có thể mất 3-5 phút), bạn có thể chạy:
```bash
npm start
# hoặc
npm run dev
```

**Chúc bạn chạy thành công! 🎉**
