const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'jlpt_n5',
});

// Standard 100+ Essential JLPT N5 Kanji List with On, Kun, Han-Viet, Meaning, and Examples
const n5KanjiList = [
  { kanji: '一', onyomi: 'イチ, イツ', kunyomi: 'ひと, ひと・つ', han_viet: 'NHẤT', meaning: 'Một, số một', stroke: 1, examples: [{ w: '一日', k: 'ついたち', m: 'Mùng 1' }, { w: '一人', k: 'ひとり', m: 'Một người' }] },
  { kanji: '二', onyomi: 'ニ', kunyomi: 'ふた, ふた・つ', han_viet: 'NHỊ', meaning: 'Hai, số hai', stroke: 2, examples: [{ w: '二日', k: 'ふつか', m: 'Mùng 2' }, { w: '二人', k: 'ふたり', m: 'Hai người' }] },
  { kanji: '三', onyomi: 'サン', kunyomi: 'み, みっ・つ', han_viet: 'TAM', meaning: 'Ba, số ba', stroke: 3, examples: [{ w: '三日', k: 'みっか', m: 'Mùng 3' }, { w: '三人', k: 'さんにん', m: 'Ba người' }] },
  { kanji: '四', onyomi: 'シ', kunyomi: 'よ, よっ・つ, よん', han_viet: 'TỨ', meaning: 'Bốn, số bốn', stroke: 4, examples: [{ w: '四日', k: 'よっか', m: 'Mùng 4' }, { w: '四月', k: 'しがつ', m: 'Tháng 4' }] },
  { kanji: '五', onyomi: 'ゴ', kunyomi: 'いつ, いつ・つ', han_viet: 'NGŨ', meaning: 'Năm, số năm', stroke: 4, examples: [{ w: '五日', k: 'いつか', m: 'Mùng 5' }, { w: '五月', k: 'ごがつ', m: 'Tháng 5' }] },
  { kanji: '六', onyomi: 'ロク', kunyomi: 'む, むっ・つ', han_viet: 'LỤC', meaning: 'Sáu, số sáu', stroke: 4, examples: [{ w: '六日', k: 'むいか', m: 'Mùng 6' }, { w: '六人', k: 'ろくにん', m: 'Sáu người' }] },
  { kanji: '七', onyomi: 'シチ', kunyomi: 'なな, なな・つ', han_viet: 'THẤT', meaning: 'Bảy, số bảy', stroke: 2, examples: [{ w: '七日', k: 'なのか', m: 'Mùng 7' }, { w: '七月', k: 'しちがつ', m: 'Tháng 7' }] },
  { kanji: '八', onyomi: 'ハチ', kunyomi: 'や, やっ・つ', han_viet: 'BÁT', meaning: 'Tám, số tám', stroke: 2, examples: [{ w: '八日', k: 'ようか', m: 'Mùng 8' }, { w: '八月', k: 'はちがつ', m: 'Tháng 8' }] },
  { kanji: '九', onyomi: 'キュウ, ク', kunyomi: 'ここの, ここの・つ', han_viet: 'CỬU', meaning: 'Chín, số chín', stroke: 2, examples: [{ w: '九日', k: 'ここのか', m: 'Mùng 9' }, { w: '九月', k: 'くがつ', m: 'Tháng 9' }] },
  { kanji: '十', onyomi: 'ジュウ, ジッ', kunyomi: 'とお, と', han_viet: 'THẬP', meaning: 'Mười, số mười', stroke: 2, examples: [{ w: '十日', k: 'とおか', m: 'Mùng 10' }, { w: '十分', k: 'じゅっぷん', m: '10 phút' }] },
  { kanji: '百', onyomi: 'ヒャク', kunyomi: 'もも', han_viet: 'BÁCH', meaning: 'Trăm, một trăm', stroke: 6, examples: [{ w: '百円', k: 'ひゃくえん', m: '100 yên' }, { w: '三百', k: 'さんびゃく', m: '300' }] },
  { kanji: '千', onyomi: 'セン', kunyomi: 'ち', han_viet: 'THIÊN', meaning: 'Nghìn, một nghìn', stroke: 3, examples: [{ w: '千円', k: 'せんえん', m: '1000 yên' }, { w: '三千', k: 'さんぜん', m: '3000' }] },
  { kanji: '万', onyomi: 'マン, バン', kunyomi: 'よろず', han_viet: 'VẠN', meaning: 'Mười nghìn (vạn)', stroke: 3, examples: [{ w: '一万円', k: 'いちまんえん', m: '1 vạn yên' }] },
  { kanji: '円', onyomi: 'エン', kunyomi: 'まる・い', han_viet: 'VIÊN', meaning: 'Đồng Yên, hình tròn', stroke: 4, examples: [{ w: '円', k: 'えん', m: 'Đồng Yên' }, { w: '円い', k: 'まるい', m: 'Tròn' }] },
  { kanji: '日', onyomi: 'ニチ, ジツ', kunyomi: 'ひ, -び, -か', han_viet: 'NHẬT', meaning: 'Mặt trời, ngày, Nhật Bản', stroke: 4, examples: [{ w: '日本', k: 'にほん', m: 'Nhật Bản' }, { w: '日曜日', k: 'にちようび', m: 'Chủ nhật' }] },
  { kanji: '月', onyomi: 'ゲツ, ガツ', kunyomi: 'つき', han_viet: 'NGUYỆT', meaning: 'Mặt trăng, tháng', stroke: 4, examples: [{ w: '月曜日', k: 'げつようび', m: 'Thứ hai' }, { w: '今月', k: 'こんげつ', m: 'Tháng này' }] },
  { kanji: '火', onyomi: 'カ', kunyomi: 'ひ, ほ', han_viet: 'HỎA', meaning: 'Lửa', stroke: 4, examples: [{ w: '火曜日', k: 'かようび', m: 'Thứ ba' }, { w: '花火', k: 'はなび', m: 'Pháo hoa' }] },
  { kanji: '水', onyomi: 'スイ', kunyomi: 'みず', han_viet: 'THỦY', meaning: 'Nước', stroke: 4, examples: [{ w: '水曜日', k: 'すいようび', m: 'Thứ tư' }, { w: '水', k: 'みず', m: 'Nước lọc' }] },
  { kanji: '木', onyomi: 'ボク, モク', kunyomi: 'き, こ', han_viet: 'MỘC', meaning: 'Cây, gỗ', stroke: 4, examples: [{ w: '木曜日', k: 'もくようび', m: 'Thứ năm' }, { w: '木', k: 'き', m: 'Cái cây' }] },
  { kanji: '金', onyomi: 'キン, コン', kunyomi: 'かね, かな', han_viet: 'KIM', meaning: 'Vàng, tiền', stroke: 8, examples: [{ w: '金曜日', k: 'きんようび', m: 'Thứ sáu' }, { w: 'お金', k: 'おかね', m: 'Tiền bạc' }] },
  { kanji: '土', onyomi: 'ド, ト', kunyomi: 'つち', han_viet: 'THỔ', meaning: 'Đất, thổ nhưỡng', stroke: 3, examples: [{ w: '土曜日', k: 'どようび', m: 'Thứ bảy' }, { w: '土地', k: 'とち', m: 'Khu đất' }] },
  { kanji: '人', onyomi: 'ジン, ニン', kunyomi: 'ひと', han_viet: 'NHÂN', meaning: 'Người', stroke: 2, examples: [{ w: '日本人', k: 'にほんじん', m: 'Người Nhật' }, { w: 'あの人', k: 'あのひと', m: 'Người kia' }] },
  { kanji: '子', onyomi: 'シ, ス', kunyomi: 'こ', han_viet: 'TỬ', meaning: 'Con cái, trẻ em', stroke: 3, examples: [{ w: '子ども', k: 'こども', m: 'Trẻ con' }, { w: '女の子', k: 'おんなのこ', m: 'Bé gái' }] },
  { kanji: '女', onyomi: 'ジョ, ニョ', kunyomi: 'おんな, め', han_viet: 'NỮ', meaning: 'Phụ nữ, nữ giới', stroke: 3, examples: [{ w: '女の人', k: 'おんなのひと', m: 'Người phụ nữ' }] },
  { kanji: '男', onyomi: 'ダン, ナン', kunyomi: 'おとこ', han_viet: 'NAM', meaning: 'Đàn ông, nam giới', stroke: 7, examples: [{ w: '男の人', k: 'おとこのひと', m: 'Người đàn ông' }] },
  { kanji: '先', onyomi: 'セン', kunyomi: 'さき', han_viet: 'TIÊN', meaning: 'Trước, đi trước', stroke: 6, examples: [{ w: '先生', k: 'せんせい', m: 'Thầy/cô giáo' }, { w: '先週', k: 'せんしゅう', m: 'Tuần trước' }] },
  { kanji: '生', onyomi: 'セイ, ショウ', kunyomi: 'い・きる, う・まれる, なま', han_viet: 'SINH', meaning: 'Sinh sống, sinh ra, học sinh', stroke: 5, examples: [{ w: '学生', k: 'がくせい', m: 'Học sinh' }, { w: '生まれる', k: 'うまれる', m: 'Sinh ra' }] },
  { kanji: '学', onyomi: 'ガク', kunyomi: 'まな・ぶ', han_viet: 'HỌC', meaning: 'Học tập, trường học', stroke: 8, examples: [{ w: '学校', k: 'がっこう', m: 'Trường học' }, { w: '大学', k: 'だいがく', m: 'Đại học' }] },
  { kanji: '校', onyomi: 'コウ', kunyomi: '', han_viet: 'HIỆU', meaning: 'Trường học', stroke: 10, examples: [{ w: '学校', k: 'がっこう', m: 'Trường học' }, { w: '高校', k: 'こうこう', m: 'Trường cấp 3' }] },
  { kanji: '本', onyomi: 'ホン', kunyomi: 'もと', han_viet: 'BẢN', meaning: 'Sách, gốc, nguồn gốc', stroke: 5, examples: [{ w: '本', k: 'ほん', m: 'Cuốn sách' }, { w: '日本', k: 'にほん', m: 'Nhật Bản' }] },
  { kanji: '名', onyomi: 'メイ, ミョウ', kunyomi: 'な', han_viet: 'DANH', meaning: 'Tên, danh tiếng', stroke: 6, examples: [{ w: '名前', k: 'なまえ', m: 'Tên' }, { w: '有名', k: 'ゆうめい', m: 'Nổi tiếng' }] },
  { kanji: '前', onyomi: 'ゼン', kunyomi: 'まえ', han_viet: 'TIỀN', meaning: 'Trước, phía trước', stroke: 9, examples: [{ w: '前', k: 'まえ', m: 'Phía trước' }, { w: '午前', k: 'ごぜん', m: 'Buổi sáng (AM)' }] },
  { kanji: '後', onyomi: 'ゴ, コウ', kunyomi: 'のち, うし・ろ, あと', han_viet: 'HẬU', meaning: 'Sau, phía sau', stroke: 9, examples: [{ w: '後ろ', k: 'うしろ', m: 'Phía sau' }, { w: '午後', k: 'ごご', m: 'Buổi chiều (PM)' }] },
  { kanji: '午', onyomi: 'ゴ', kunyomi: 'うま', han_viet: 'NGỌ', meaning: 'Giữa trưa', stroke: 4, examples: [{ w: '午前', k: 'ごぜん', m: 'Sáng' }, { w: '午後', k: 'ごご', m: 'Chiều' }] },
  { kanji: '今', onyomi: 'コン, キン', kunyomi: 'いま', han_viet: 'KIM', meaning: 'Bây giờ, hiện tại', stroke: 4, examples: [{ w: '今', k: 'いま', m: 'Bây giờ' }, { w: '今日', k: 'きょう', m: 'Hôm nay' }] },
  { kanji: '時', onyomi: 'ジ', kunyomi: 'とき', han_viet: 'THỜI', meaning: 'Thời gian, giờ', stroke: 10, examples: [{ w: '時間', k: 'じかん', m: 'Thời gian' }, { w: '何時', k: 'なんじ', m: 'Mấy giờ' }] },
  { kanji: '分', onyomi: 'ブン, フン, ブ', kunyomi: 'わ・ける, わ・かる', han_viet: 'PHÂN', meaning: 'Phút, hiểu, chia phần', stroke: 4, examples: [{ w: '半分', k: 'はんぶん', m: 'Một nửa' }, { w: '分かる', k: 'わかる', m: 'Hiểu' }] },
  { kanji: '半', onyomi: 'ハン', kunyomi: 'なか・ば', han_viet: 'BÁN', meaning: 'Nửa, rưỡi', stroke: 5, examples: [{ w: '半', k: 'はん', m: 'Rưỡi (giờ)' }, { w: '半分', k: 'はんぶん', m: 'Một nửa' }] },
  { kanji: '何', onyomi: 'カ', kunyomi: 'なに, なん', han_viet: 'HÀ', meaning: 'Cái gì, mấy', stroke: 7, examples: [{ w: '何', k: 'なに', m: 'Cái gì' }, { w: '何時', k: 'なんじ', m: 'Mấy giờ' }] },
  { kanji: '上', onyomi: 'ジョウ, ショウ', kunyomi: 'うえ, あ・がる, のぼ・る', han_viet: 'THƯỢNG', meaning: 'Trên, phía trên', stroke: 3, examples: [{ w: '上', k: 'うえ', m: 'Phía trên' }, { w: '上手', k: 'じょうず', m: 'Giỏi' }] },
  { kanji: '下', onyomi: 'カ, ゲ', kunyomi: 'した, さ・がる, くだ・る', han_viet: 'HẠ', meaning: 'Dưới, phía dưới', stroke: 3, examples: [{ w: '下', k: 'した', m: 'Phía dưới' }, { w: '下手', k: 'へた', m: 'Kém' }] },
  { kanji: '中', onyomi: 'チュウ', kunyomi: 'なか', han_viet: 'TRUNG', meaning: 'Trong, ở giữa, Trung Quốc', stroke: 4, examples: [{ w: '中', k: 'なか', m: 'Bên trong' }, { w: '中国', k: 'ちゅうごく', m: 'Trung Quốc' }] },
  { kanji: '大', onyomi: 'ダイ, タイ', kunyomi: 'おお・きい', han_viet: 'ĐẠI', meaning: 'To lớn', stroke: 3, examples: [{ w: '大きい', k: 'おおきい', m: 'To, lớn' }, { w: '大学', k: 'だいがく', m: 'Đại học' }] },
  { kanji: '小', onyomi: 'ショウ', kunyomi: 'ちい・さい, こ, お', han_viet: 'TIỂU', meaning: 'Nhỏ, bé', stroke: 3, examples: [{ w: '小さい', k: 'ちいさい', m: 'Nhỏ, bé' }, { w: '小学校', k: 'しょうがっこう', m: 'Trường tiểu học' }] },
  { kanji: '山', onyomi: 'サン', kunyomi: 'やま', han_viet: 'SƠN', meaning: 'Núi', stroke: 3, examples: [{ w: '山', k: 'やま', m: 'Ngọn núi' }, { w: '富士山', k: 'ふじさん', m: 'Núi Phú Sĩ' }] },
  { kanji: '川', onyomi: 'セン', kunyomi: 'かわ', han_viet: 'XUYÊN', meaning: 'Sông', stroke: 3, examples: [{ w: '川', k: 'かわ', m: 'Dòng sông' }] },
  { kanji: '天', onyomi: 'テン', kunyomi: 'あまつ, あめ', han_viet: 'THIÊN', meaning: 'Trời, thời tiết', stroke: 4, examples: [{ w: '天気', k: 'てんき', m: 'Thời tiết' }, { w: '天ぷら', k: 'てんぷら', m: 'Món tempura' }] },
  { kanji: '気', onyomi: 'キ, ケ', kunyomi: 'いき', han_viet: 'KHÍ', meaning: 'Khí, tinh thần, tâm trạng', stroke: 6, examples: [{ w: '元気', k: 'げんき', m: 'Khỏe mạnh' }, { w: '天気', k: 'てんき', m: 'Thời tiết' }] },
  { kanji: '雨', onyomi: 'ウ', kunyomi: 'あめ, あま', han_viet: 'VŨ', meaning: 'Mưa', stroke: 8, examples: [{ w: '雨', k: 'あめ', m: 'Trời mưa' }] },
  { kanji: '白', onyomi: 'ハク, ビャク', kunyomi: 'しろ, しろ・い', han_viet: 'BẠCH', meaning: 'Màu trắng', stroke: 5, examples: [{ w: '白い', k: 'しろい', m: 'Màu trắng' }] },
  { kanji: '黒', onyomi: 'コク', kunyomi: 'くろ, くろ・い', han_viet: 'HẮC', meaning: 'Màu đen', stroke: 11, examples: [{ w: '黒い', k: 'くろい', m: 'Màu đen' }] },
  { kanji: '赤', onyomi: 'セキ, シャク', kunyomi: 'あか, あか・い', han_viet: 'XÍCH', meaning: 'Màu đỏ', stroke: 7, examples: [{ w: '赤い', k: 'あかい', m: 'Màu đỏ' }] },
  { kanji: '青', onyomi: 'セイ, ショウ', kunyomi: 'あお, あお・い', han_viet: 'THANH', meaning: 'Màu xanh da trời', stroke: 8, examples: [{ w: '青い', k: 'あおい', m: 'Xanh dương' }] },
  { kanji: '行', onyomi: 'コウ, ギョウ', kunyomi: 'い・く, ゆ・く, おこな・う', han_viet: 'HÀNH', meaning: 'Đi, tiến hành', stroke: 6, examples: [{ w: '行く', k: 'いく', m: 'Đi' }, { w: '旅行', k: 'りょこう', m: 'Du lịch' }] },
  { kanji: '来', onyomi: 'ライ', kunyomi: 'く・る, きた・る', han_viet: 'LAI', meaning: 'Đến, tới', stroke: 7, examples: [{ w: '来る', k: 'くる', m: 'Đến' }, { w: '来週', k: 'らいしゅう', m: 'Tuần sau' }] },
  { kanji: '帰', onyomi: 'キ', kunyomi: 'かえ・る', han_viet: 'QUY', meaning: 'Trở về, về nhà', stroke: 10, examples: [{ w: '帰る', k: 'かえる', m: 'Trở về' }] },
  { kanji: '見', onyomi: 'ケン', kunyomi: 'み・る, み・える', han_viet: 'KIẾN', meaning: 'Nhìn, xem', stroke: 7, examples: [{ w: '見る', k: 'みる', m: 'Nhìn, xem' }, { w: '意見', k: 'いけん', m: 'Ý kiến' }] },
  { kanji: '聞', onyomi: 'ブン, モン', kunyomi: 'き・く, き・こえる', han_viet: 'VĂN', meaning: 'Nghe, hỏi', stroke: 14, examples: [{ w: '聞く', k: 'きく', m: 'Nghe' }, { w: '新聞', k: 'しんぶん', m: 'Tờ báo' }] },
  { kanji: '食', onyomi: 'ショク, ジキ', kunyomi: 'た・べる, く・う', han_viet: 'THỰC', meaning: 'Ăn, món ăn', stroke: 9, examples: [{ w: '食べる', k: 'たべる', m: 'Ăn' }, { w: '食べ物', k: 'たべもの', m: 'Đồ ăn' }] },
  { kanji: '飲', onyomi: 'イン', kunyomi: 'の・む', han_viet: 'ẨM', meaning: 'Uống', stroke: 12, examples: [{ w: '飲む', k: 'のむ', m: 'Uống' }, { w: '飲み物', k: 'のみもの', m: 'Đồ uống' }] },
  { kanji: '買', onyomi: 'バイ', kunyomi: 'か・う', han_viet: 'MÃI', meaning: 'Mua', stroke: 12, examples: [{ w: '買う', k: 'かう', m: 'Mua sắm' }, { w: '買い物', k: 'かいもの', m: 'Mua sắm' }] },
  { kanji: '書', onyomi: 'ショ', kunyomi: 'か・く', han_viet: 'THƯ', meaning: 'Viết, cuốn sách', stroke: 10, examples: [{ w: '書く', k: 'かく', m: 'Viết' }, { w: '辞書', k: 'じしょ', m: 'Từ điển' }] },
  { kanji: '読', onyomi: 'ドク, トク', kunyomi: 'よ・む', han_viet: 'ĐỘC', meaning: 'Đọc', stroke: 14, examples: [{ w: '読む', k: 'よむ', m: 'Đọc sách' }] },
  { kanji: '話', onyomi: 'ワ', kunyomi: 'はな・す, はなし', han_viet: 'THOẠI', meaning: 'Nói chuyện, câu chuyện', stroke: 13, examples: [{ w: '話す', k: 'はなす', m: 'Nói chuyện' }, { w: '電話', k: 'でんわ', m: 'Điện thoại' }] },
  { kanji: '語', onyomi: 'ゴ', kunyomi: 'かた・る', han_viet: 'NGỮ', meaning: 'Ngôn ngữ, tiếng', stroke: 14, examples: [{ w: '日本語', k: 'にほんご', m: 'Tiếng Nhật' }, { w: '英語', k: 'えいご', m: 'Tiếng Anh' }] },
  { kanji: '友', onyomi: 'ユウ', kunyomi: 'とも', han_viet: 'HỮU', meaning: 'Bạn bè', stroke: 4, examples: [{ w: '友達', k: 'ともだち', m: 'Bạn bè' }] },
  { kanji: '父', onyomi: 'フ', kunyomi: 'ちち, とう', han_viet: 'PHỤ', meaning: 'Bố, cha', stroke: 4, examples: [{ w: '父', k: 'ちち', m: 'Bố mình' }, { w: 'お父さん', k: 'おとうさん', m: 'Bố bạn' }] },
  { kanji: '母', onyomi: 'ボ', kunyomi: 'はは, かあ', han_viet: 'MẪU', meaning: 'Mẹ', stroke: 5, examples: [{ w: '母', k: 'はは', m: 'Mẹ mình' }, { w: 'お母さん', k: 'おかあさん', m: 'Mẹ bạn' }] },
  { kanji: '家', onyomi: 'カ, ケ', kunyomi: 'いえ, や, うち', han_viet: 'GIA', meaning: 'Nhà, gia đình', stroke: 10, examples: [{ w: '家', k: 'うち', m: 'Ngôi nhà' }, { w: '家族', k: 'かぞく', m: 'Gia đình' }] },
  { kanji: '車', onyomi: 'シャ', kunyomi: 'くるま', han_viet: 'XA', meaning: 'Xe cộ, xe hơi', stroke: 7, examples: [{ w: '車', k: 'くるま', m: 'Xe hơi' }, { w: '電車', k: 'でんしゃ', m: 'Tàu điện' }] },
  { kanji: '電', onyomi: 'デン', kunyomi: '', han_viet: 'ĐIỆN', meaning: 'Điện, tia sét', stroke: 13, examples: [{ w: '電気', k: 'でんき', m: 'Điện, đèn' }, { w: '電話', k: 'でんわ', m: 'Điện thoại' }] },
  { kanji: '駅', onyomi: 'エキ', kunyomi: '', han_viet: 'DỊCH', meaning: 'Nhà ga', stroke: 14, examples: [{ w: '駅', k: 'えき', m: 'Nhà ga' }, { w: '駅前', k: 'えきまえ', m: 'Trước nhà ga' }] },
  { kanji: '道', onyomi: 'ドウ, トウ', kunyomi: 'みち', han_viet: 'ĐẠO', meaning: 'Con đường, đạo', stroke: 12, examples: [{ w: '道', k: 'みち', m: 'Con đường' }] },
  { kanji: '国', onyomi: 'コク', kunyomi: 'くに', han_viet: 'QUỐC', meaning: 'Đất nước, quốc gia', stroke: 8, examples: [{ w: '国', k: 'くに', m: 'Đất nước' }, { w: '外国人', k: 'がいこくじん', m: 'Người nước ngoài' }] },
  { kanji: '社', onyomi: 'シャ', kunyomi: 'やしろ', han_viet: 'XÃ', meaning: 'Công ty, đền thờ', stroke: 7, examples: [{ w: '会社', k: 'かいしゃ', m: 'Công ty' }, { w: '神社', k: 'じんじゃ', m: 'Đền thờ thần đạo' }] },
  { kanji: '会', onyomi: 'カイ, エ', kunyomi: 'あ・う', han_viet: 'HỘI', meaning: 'Gặp gỡ, xã hội', stroke: 6, examples: [{ w: '会う', k: 'あう', m: 'Gặp gỡ' }, { w: '会社', k: 'かいしゃ', m: 'Công ty' }] },
  { kanji: '門', onyomi: 'モン', kunyomi: 'かど', han_viet: 'MÔN', meaning: 'Cổng, cửa', stroke: 8, examples: [{ w: '専門', k: 'せんもん', m: 'Chuyên môn' }] },
  { kanji: '間', onyomi: 'カン, ケン', kunyomi: 'あいだ, ま', han_viet: 'GIAN', meaning: 'Khoảng cách, ở giữa, thời gian', stroke: 12, examples: [{ w: '時間', k: 'じかん', m: 'Thời gian' }, { w: '間', k: 'あいだ', m: 'Ở giữa' }] },
  { kanji: '週', onyomi: 'シュウ', kunyomi: '', han_viet: 'CHU', meaning: 'Tuần lễ', stroke: 11, examples: [{ w: '今週', k: 'こんしゅう', m: 'Tuần này' }, { w: '来週', k: 'らいしゅう', m: 'Tuần sau' }] },
  { kanji: '年', onyomi: 'ネン', kunyomi: 'とし', han_viet: 'NIÊN', meaning: 'Năm, tuổi', stroke: 6, examples: [{ w: '今年', k: 'ことし', m: 'Năm nay' }, { w: '去年', k: 'きょねん', m: 'Năm ngoái' }] }
];

async function seedKanji() {
  const client = await pool.connect();
  try {
    console.log('Seeding Kanji N5...');
    await client.query('BEGIN');

    for (const item of n5KanjiList) {
      await client.query(`
        INSERT INTO kanji (kanji, onyomi, kunyomi, han_viet, meaning, stroke_count, level, examples)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (kanji) DO UPDATE
        SET onyomi = $2, kunyomi = $3, han_viet = $4, meaning = $5, stroke_count = $6, examples = $8
      `, [item.kanji, item.onyomi, item.kunyomi, item.han_viet, item.meaning, item.stroke, 'N5', JSON.stringify(item.examples)]);
    }

    await client.query('COMMIT');
    console.log(`Seeded ${n5KanjiList.length} essential Kanji N5 successfully!`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error seeding kanji:', err);
  } finally {
    client.release();
    pool.end();
  }
}

seedKanji();
