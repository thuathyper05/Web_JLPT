# 🌸 HYPER JLPT - NỀN TẢNG HỌC & LUYỆN THI TIẾNG NHẬT JLPT N5 HIỆN ĐẠI

> **Trọn bộ 25 bài học Minna no Nihongo (1,589 từ vựng) + 80 chữ Hán Kanji N5**  
> Kiến trúc hiện đại: **React 18 (Vite, Bootstrap 5, Lucide Icons) + Node.js (Express RESTful API) + PostgreSQL / Supabase**

---

## 🌟 TỔNG QUAN DỰ ÁN

**HYPER JLPT** là ứng dụng web học tiếng Nhật toàn diện, được thiết kế theo phong cách tối giản, hiện đại và cao cấp (Navy & Indigo Modern UI), tối ưu hóa trải nghiệm người dùng theo tiêu chuẩn giáo trình quốc tế.

### 🚀 Tính năng nổi bật:
1. **Trọn bộ dữ liệu chuẩn:**
   - 25 bài học Minna no Nihongo với đầy đủ 1,589 từ vựng (Kanji, Hiragana, Romaji, Hán Việt, Nghĩa, Loại từ, Ví dụ).
   - 80 chữ Hán Kanji N5 kèm âm On, Kun, số nét, cấp độ và ví dụ thực tế.
2. **Xác thực linh hoạt (Authentication):**
   - Đăng nhập tài khoản truyền thống (Email + Mật khẩu, Quên mật khẩu & Đặt lại mật khẩu).
   - Đăng nhập nhanh bằng **Google OAuth** và **Facebook Login** chính thức.
   - Hỗ trợ học ẩn danh (Khách / Guest) lưu tiến độ tạm qua LocalStorage mà không bắt buộc đăng nhập.
3. **Đa dạng phương pháp rèn luyện:**
   - 📖 **Học từ vựng:** Xem chi tiết từng từ, bảng từ tổng hợp, phát âm bản xứ (Web Speech API).
   - 🃏 **Flashcard 3D:** Hiệu ứng lật mượt mà, hỗ trợ phím tắt (`Space`, `1`/`2`, `S`), tự động phát âm, chế độ lọc ôn từ sai.
   - 📝 **Trắc nghiệm chuyên nghiệp:** 4 dạng câu hỏi đa dạng (nghĩa, từ vựng, âm đọc Kanji, gõ Kana), tính điểm và xếp loại chuẩn JLPT.
   - ⌨️ **Luyện gõ Kana thời gian thực:** Chấm điểm tức thì, âm thanh sinh động (Web Audio API), hỗ trợ gõ Romaji chuyển đổi Kana.
   - 🀄 **Kanji N5:** Tra cứu bảng chữ Hán, số nét vẽ, âm Hán Việt và từ vựng liên quan.
   - 🔄 **Ôn tập thông minh:** Tự động lọc danh sách các từ từng làm sai để luyện lại.
   - ⭐ **Yêu thích & Sổ tay ghi chú:** Lưu từ vựng quan trọng và ghi chú cá nhân.
   - 📊 **Dashboard tiến độ:** Thống kê trực quan tỉ lệ hoàn thành theo từng bài và toàn cấp độ.
4. **Sẵn sàng triển khai Cloud:**
   - Hỗ trợ kết nối cơ sở dữ liệu Supabase PostgreSQL với SSL.
   - Tích hợp dịch vụ tự động Ping Keep-Alive chống ngủ đông 15 phút trên Render Free Tier.

---

## 🛠️ CẤU TRÚC THƯ MỤC

```text
Web_JLPT/
├── backend/
│   ├── config/
│   │   └── db.js                 # Kết nối PostgreSQL / Supabase qua pg Pool
│   ├── controllers/              # Bộ xử lý nghiệp vụ Auth, Vocab, Lesson, Quiz, Kanji, Progress
│   ├── middleware/               # Xác thực JWT & Guest fallback
│   ├── routes/                   # Các RESTful API routes
│   ├── scripts/
│   │   └── export_sql.js         # Script trích xuất full DB ra file SQL
│   ├── .env.example              # Mẫu biến môi trường backend
│   ├── index.js                  # Điểm khởi chạy server Express & Ping service
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/           # Navbar, AuthModal, LevelSelector, SearchModal, Logo...
│   │   ├── context/              # AppContext quản lý state người dùng & tiến độ
│   │   ├── pages/                # HomePage, LessonStudy, Flashcard, Quiz, Kanji, Dashboard...
│   │   ├── services/api.js       # Gọi API backend & Text-To-Speech
│   │   ├── App.jsx               # Định tuyến Router & Modal
│   │   └── index.css             # Thiết kế giao diện, hiệu ứng 3D Flashcard, Theme
│   ├── .env.example              # Mẫu biến môi trường frontend
│   └── package.json
└── database/
    ├── schema.sql                # Cấu trúc bảng PostgreSQL
    ├── supabase_init.sql         # File nạp toàn bộ cấu trúc + 25 bài + 1,589 từ + 80 Kanji
    └── n5_full_lessons.json       # Dữ liệu JSON gốc
```

---

## ⚡ HƯỚNG DẪN KHỞI CHẠY CỤC BỘ (LOCAL)

### 1. Cơ sở dữ liệu PostgreSQL
- Tạo database `jlpt_n5` trong PostgreSQL:
  ```sql
  CREATE DATABASE jlpt_n5;
  ```
- Nạp toàn bộ dữ liệu chỉ bằng 1 lệnh:
  ```bash
  psql -U postgres -d jlpt_n5 -f database/supabase_init.sql
  ```

### 2. Khởi chạy Backend (Node.js)
```bash
cd backend
npm install
npm start
```
Server chạy tại: `http://localhost:5000`

### 3. Khởi chạy Frontend (React / Vite)
```bash
cd frontend
npm install
npm run dev
```
Ứng dụng mở tại: `http://localhost:3000`

---

## ☁️ HƯỚNG DẪN TRIỂN KHAI CLOUD (SUPABASE + RENDER)

### 1. Database (Supabase)
1. Tạo Project mới trên [Supabase](https://supabase.com).
2. Vào **SQL Editor** -> Dán toàn bộ nội dung file `database/supabase_init.sql` -> Nhấn **Run**.
3. Vào **Project Settings** -> **Database** -> Copy chuỗi **Connection String (URI)** (dạng pooler port 6543 hoặc direct port 5432).

### 2. Backend (Render Web Service)
1. Tạo Web Service mới trên [Render](https://render.com) liên kết với Git repository này.
2. Cấu hình:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
3. Cài đặt **Environment Variables**:
   - `DATABASE_URL`: Dán chuỗi kết nối Supabase URI (thay mật khẩu thực tế)
   - `JWT_SECRET`: Chuỗi bảo mật ngẫu nhiên (VD: `my_secure_jwt_key_2026`)
   - `PORT`: `5000`
   - `RENDER_EXTERNAL_URL`: `https://ten-backend-cua-ban.onrender.com` (để kích hoạt tính năng tự ping chống ngủ 15 phút)

### 3. Frontend (Vercel / Netlify / Render Static Site)
1. Cấu hình:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
2. Cài đặt **Environment Variables**:
   - `VITE_API_BASE_URL`: `https://ten-backend-cua-ban.onrender.com/api`
   - `VITE_GOOGLE_CLIENT_ID`: Google OAuth Client ID của bạn
   - `VITE_FACEBOOK_APP_ID`: Facebook App ID của bạn

---

## 👤 TÁC GIẢ
- **GitHub:** [@thuathyper05](https://github.com/thuathyper05)
