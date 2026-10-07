# HỆ THỐNG WEBSITE HỖ TRỢ HỌC & ÔN TẬP TỪ VỰNG TIẾNG NHẬT N5

> **Trọn bộ 25 bài học Minna no Nihongo với 1,589 từ vựng đầy đủ 100%**  
> Kiến trúc: **ReactJS (Reactstrap/Bootstrap, Lucide Icons) + Node.js (Express RESTful API) + PostgreSQL**

---

## 🌟 TỔNG QUAN HỆ THỐNG

Website hỗ trợ học và ôn tập từ vựng tiếng Nhật JLPT N5 theo giáo trình chuẩn **Minna no Nihongo (25 Bài)** với giao diện hiện đại, chuẩn phong cách Navy Blue / Tối giản, không lạm dụng AI, sử dụng hệ thống icon web chuyên nghiệp (Lucide Icons).

### 🚀 Điểm nổi bật:
1. **Không bắt buộc đăng nhập:** Người dùng vào web là có thể học ngay lập tức toàn bộ 25 bài, lật Flashcard, làm bài trắc nghiệm, luyện gõ Kana và nghe phát âm. Tiến độ được lưu tạm bằng LocalStorage.
2. **Đăng nhập tùy chọn:** Khi muốn đồng bộ tiến độ, từ đã thuộc, từ yêu thích và ghi chú lâu dài lên cơ sở dữ liệu PostgreSQL.
3. **Độc lập theo từng bài:** Không trộn lẫn từ vựng giữa các bài khi đang học bài cụ thể.
4. **Phát âm tiếng Nhật chuẩn bản xứ:** Tích hợp Web Speech Synthesis (`ja-JP`).
5. **Đầy đủ 4 phương pháp rèn luyện:**
   - 📖 Học từ vựng từng từ một & xem bảng tổng hợp bài học.
   - 🃏 Flashcard 3D lật thẻ ghi nhớ và đánh dấu Đã nhớ / Chưa nhớ.
   - 📝 Bài trắc nghiệm với 4 dạng câu hỏi (chọn nghĩa, chọn từ, chọn âm đọc Kanji, nhập Kana) kèm đánh giá xếp loại.
   - ⌨️ Luyện gõ đáp án Kana theo thời gian thực (Real-time feedback).
   - 🔄 Ôn tập riêng các từ từng làm sai / chưa nhớ.
   - ⭐ Quản lý từ vựng yêu thích.
   - 📝 Sổ tay ghi chú cá nhân cho từng từ vựng.
   - 📊 Bảng Dashboard tiến độ chi tiết từng bài và toàn bộ N5.

---

## 🛠️ CẤU TRÚC DỰ ÁN

```text
Web_JLPT/
├── backend/
│   ├── config/
│   │   └── db.js                 # Kết nối cơ sở dữ liệu PostgreSQL
│   ├── controllers/
│   │   ├── authController.js     # Đăng ký, đăng nhập, JWT
│   │   ├── lessonController.js   # 25 bài học N5
│   │   ├── vocabController.js    # 1,589 từ vựng, lọc, tìm kiếm
│   │   ├── quizController.js     # Tạo trắc nghiệm, chấm điểm
│   │   ├── progressController.js # Quản lý tiến độ
│   │   ├── favoriteController.js # Quản lý từ yêu thích
│   │   └── noteController.js     # Quản lý ghi chú cá nhân
│   ├── middleware/
│   │   └── auth.js               # Xác thực JWT (hỗ trợ cả guest và user)
│   ├── routes/                   # Các RESTful API routes
│   ├── seed.js                   # Script nạp 25 bài và 1589 từ vào Postgres
│   ├── .env                      # Cấu hình cổng, DB và secret key
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── NavbarComponent.jsx # Thanh điều hướng & Auth modal
│   │   │   └── SearchModal.jsx     # Tra cứu nhanh Kanji/Kana/Romaji/Nghĩa
│   │   ├── pages/
│   │   │   ├── HomePage.jsx        # Trang chủ & tổng quan 25 bài
│   │   │   ├── LessonStudyPage.jsx # Chế độ học theo bài (Word-by-word & Table)
│   │   │   ├── FlashcardPage.jsx   # Thẻ nhớ 3D, lật thẻ, âm thanh
│   │   │   ├── QuizPage.jsx        # Trắc nghiệm 4 dạng câu hỏi
│   │   │   ├── PracticeInputPage.jsx # Luyện gõ Kana thời gian thực
│   │   │   ├── ReviewWrongPage.jsx # Ôn tập từ sai & chưa nhớ
│   │   │   ├── FavoritesPage.jsx   # Danh sách từ yêu thích
│   │   │   ├── NotesPage.jsx       # Sổ tay ghi chú cá nhân
│   │   │   └── DashboardPage.jsx   # Bảng theo dõi tiến độ N5
│   │   ├── context/
│   │   │   └── AppContext.jsx      # Quản lý trạng thái Auth & Guest LocalStorage
│   │   ├── services/
│   │   │   └── api.js              # Gọi API Axios & Speech Synthesis
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── database/
    ├── schema.sql                  # Cấu trúc bảng PostgreSQL
    └── n5_full_lessons.json        # Dữ liệu từ vựng 25 bài Minna no Nihongo
```

---

## ⚡ HƯỚNG DẪN KHỞI CHẠY HỆ THỐNG

### 1. Cơ sở dữ liệu PostgreSQL
- Tên Database: `jlpt_n5`
- Cổng mặc định: `5432`
- Chạy schema:
  ```bash
  psql -U postgres -d jlpt_n5 -f database/schema.sql
  ```
- Nạp dữ liệu tự động:
  ```bash
  cd backend
  node seed.js
  ```

### 2. Khởi chạy Backend (Node.js/Express)
```bash
cd backend
npm install
node index.js
```
Backend lắng nghe tại: `http://localhost:5000`

### 3. Khởi chạy Frontend (ReactJS / Vite)
```bash
cd frontend
npm install
npm run dev
```
Frontend mở tại: `http://localhost:3000`
