import React, { useState, useMemo } from 'react';
import {
  Container, Row, Col, Badge, Card, CardBody, Button,
  Progress, Input, ListGroup, ListGroupItem
} from 'reactstrap';
import {
  Compass, BookOpen, CheckCircle2, XCircle, Volume2, Sparkles,
  RotateCcw, HelpCircle, Layers, Check, ChevronRight, ChevronLeft,
  Zap, Award, Search, Info, Bookmark, Filter
} from 'lucide-react';
import { speakJapanese } from '../services/api';
import { sounds } from '../services/sounds';
import { awardGardenWater } from '../services/gardenRewards';

// ── 1. 19 CORE N5 PARTICLES ENCYCLOPEDIA ──
const PARTICLES_DATABASE = [
  {
    particle: 'は',
    romaji: 'wa',
    category: 'topic',
    title: 'Trợ từ Chủ đề & Đối lập',
    badge: 'Cốt Lõi',
    usage: 'Đứng sau danh từ để xác định chủ đề chính của câu ("về phần...", "thì"). Dùng để nhấn mạnh sự tương phản hoặc so sánh.',
    formula: 'Danh từ + は + Vị ngữ',
    notes: 'Viết bằng chữ Hiragana "ha" (は) nhưng phát âm là "wa". Khi muốn nói về chủ đề câu đã biết, luôn dùng は.',
    examples: [
      { jp: 'わたしは ベトナム人です。', romaji: 'Watashi wa betonamu-jin desu.', vi: 'Tôi là người Việt Nam.' },
      { jp: '今日はお茶を飲みますが、コーヒーは飲みません。', romaji: 'Kyou wa ocha o nomimasu ga, koohii wa nomimasen.', vi: 'Hôm nay tôi uống trà nhưng cà phê thì không uống.' }
    ]
  },
  {
    particle: 'が',
    romaji: 'ga',
    category: 'topic',
    title: 'Trợ từ Chủ ngữ Khách quan & Đối tượng',
    badge: 'Cốt Lõi',
    usage: 'Chỉ chủ ngữ của hành động/hiện tượng tự nhiên, nghi vấn từ làm chủ ngữ (だれが, なにが), hoặc chỉ đối tượng của tính từ, sở thích (好き, 嫌い), năng lực (上手, 下手, わかります, できます).',
    formula: 'Chủ ngữ + が + Động từ / Danh từ + が + 好き/わかります',
    notes: 'Khác với は (nhấn mạnh vế sau), が nhấn mạnh chính CHỦ THỂ đứng trước nó.',
    examples: [
      { jp: '雨が 降っています。', romaji: 'Ame ga futte imasu.', vi: 'Trời đang mưa (hiện tượng khách quan).' },
      { jp: 'わたしは 日本料理が 好きです。', romaji: 'Watashi wa nihon ryouri ga suki desu.', vi: 'Tôi thích món ăn Nhật Bản.' }
    ]
  },
  {
    particle: 'を',
    romaji: 'o / wo',
    category: 'object',
    title: 'Trợ từ Tân ngữ Trực tiếp & Điểm rời khỏi',
    badge: 'Cốt Lõi',
    usage: 'Chỉ tân ngữ chịu sự tác động trực tiếp của ngoại động từ (ăn cơm, uống nước). Ngoài ra còn chỉ nơi chốn rời khỏi (xuống xe, rời nhà) hoặc không gian băng qua (đi dạo công viên).',
    formula: 'Danh từ + を + Ngoại động từ',
    notes: 'Viết là を nhưng phát âm là "o". Không dùng を với tự động từ.',
    examples: [
      { jp: 'ごはんを 食べます。', romaji: 'Gohan o tabemasu.', vi: 'Ăn cơm.' },
      { jp: '電車を 降ります。', romaji: 'Densha o orimasu.', vi: 'Bước xuống tàu điện.' }
    ]
  },
  {
    particle: 'に',
    romaji: 'ni',
    category: 'time_place',
    title: 'Trợ từ Thời gian, Điểm đến, Nơi tồn tại & Đối tượng',
    badge: 'Đa Năng',
    usage: '1. Mốc thời gian cụ thể có con số (7時に).\n2. Điểm đến của hành động (学校に行きます).\n3. Nơi tồn tại của sự vật (部屋に います/あります).\n4. Đối tượng tiếp nhận hành động (友だちに 会います).\n5. Mục đích hành động (V-bỏます + に 行きます).',
    formula: 'Thời gian cụ thể / Nơi chốn / Người + に',
    notes: 'Nếu thời gian không có con số (hôm nay, ngày mai, tuần sau...), KHÔNG dùng に.',
    examples: [
      { jp: '毎朝 7時に 起きます。', romaji: 'Maiasa shichi-ji ni okimasu.', vi: 'Mỗi sáng tôi thức dậy lúc 7 giờ.' },
      { jp: '机の上に 本があります。', romaji: 'Tsukue no ue ni hon ga arimasu.', vi: 'Trên bàn có quyển sách.' }
    ]
  },
  {
    particle: 'で',
    romaji: 'de',
    category: 'time_place',
    title: 'Trợ từ Địa điểm hành động, Phương tiện & Công cụ',
    badge: 'Đa Năng',
    usage: '1. Địa điểm nơi hành động diễn ra (thư viện đọc sách).\n2. Phương tiện đi lại (đi bằng xe buýt).\n3. Công cụ, cách thức thực hiện (viết bằng bút, ăn bằng đũa, nói bằng tiếng Nhật).',
    formula: 'Địa điểm / Phương tiện / Công cụ + で + Hành động',
    notes: 'Phân biệt: "Nơi TỒN TẠI" dùng に, "Nơi HÀNH ĐỘNG" dùng で. Đi bộ (歩いて) không dùng で.',
    examples: [
      { jp: '図書館で 本を 読みます。', romaji: 'Toshokan de hon o yomimasu.', vi: 'Đọc sách ở thư viện.' },
      { jp: 'バスで 会社へ 行きます。', romaji: 'Basu de kaisha e ikimasu.', vi: 'Đi đến công ty bằng xe buýt.' }
    ]
  },
  {
    particle: 'へ',
    romaji: 'e',
    category: 'object',
    title: 'Trợ từ Hướng di chuyển',
    badge: 'Cốt Lõi',
    usage: 'Đứng sau danh từ chỉ nơi chốn để biểu thị phương hướng di chuyển tới đích đến (thường đi với 行きます, 来ます, 帰ります).',
    formula: 'Địa điểm + へ + 行きます / 来ます / 帰ります',
    notes: 'Viết là へ nhưng phát âm là "e". へ nhấn mạnh PHƯƠNG HƯỚNG tiến về phía trước.',
    examples: [
      { jp: '来週 日本へ 行きます。', romaji: 'Raishuu nihon e ikimasu.', vi: 'Tuần sau tôi sẽ đi sang Nhật Bản.' }
    ]
  },
  {
    particle: 'と',
    romaji: 'to',
    category: 'connect',
    title: 'Trợ từ Liên kết Đầy đủ ("Và") & Đồng hành ("Với")',
    badge: 'Cốt Lõi',
    usage: '1. Nối tất cả các danh từ được liệt kê đầy đủ ("A và B").\n2. Cùng thực hiện hành động với ai đó ("làm cùng với...").',
    formula: 'Danh từ 1 + と + Danh từ 2 / Người + と + Động từ',
    notes: 'と liệt kê trọn vẹn, khác với や (liệt kê một vài cái tiêu biểu).',
    examples: [
      { jp: 'パンと 卵を 買いました。', romaji: 'Pan to tamago o kaimashita.', vi: 'Tôi đã mua bánh mì và trứng.' },
      { jp: '友だちと 映画を 見ます。', romaji: 'Tomodachi to eiga o mimasu.', vi: 'Xem phim cùng với bạn.' }
    ]
  },
  {
    particle: 'も',
    romaji: 'mo',
    category: 'connect',
    title: 'Trợ từ Đồng nhất ("Cũng") & Phủ định hoàn toàn',
    badge: 'Cốt Lõi',
    usage: '1. Biểu thị sự tương đồng ("cũng").\n2. Kết hợp với nghi vấn từ và đuôi phủ định để phủ định 100% ("không... một ai/cái gì/nơi nào").',
    formula: 'Danh từ + も / Nghi vấn từ + も + Phủ định',
    notes: 'Khi dùng も, nó thay thế luôn cho は, が, を.',
    examples: [
      { jp: 'わたしも 学生です。', romaji: 'Watashi mo gakusei desu.', vi: 'Tôi cũng là học sinh.' },
      { jp: 'きのう どこも 行きませんでした。', romaji: 'Kinou doko mo ikimasendeshita.', vi: 'Hôm qua tôi chẳng đi đâu cả.' }
    ]
  },
  {
    particle: 'から',
    romaji: 'kara',
    category: 'range',
    title: 'Trợ từ Khởi đầu ("Từ") & Nguyên nhân ("Vì")',
    badge: 'Căn Bản',
    usage: '1. Chỉ mốc điểm bắt đầu về thời gian hoặc địa điểm xuất phát ("từ...").\n2. Đứng cuối mệnh đề để chỉ nguyên nhân, lý do ("vì... nên...").',
    formula: 'Thời gian / Địa điểm + から / Mệnh đề + から',
    notes: 'Thường đi kèm với まで thành cặp "から ～ まで" (từ... đến...).',
    examples: [
      { jp: '午前9時から 働きます。', romaji: 'Gozen ku-ji kara hatarakimasu.', vi: 'Tôi làm việc từ 9 giờ sáng.' },
      { jp: '時間が ありませんから、タクシーで行きます。', romaji: 'Jikan ga arimasen kara, takushii de ikimasu.', vi: 'Vì không có thời gian nên tôi đi taxi.' }
    ]
  },
  {
    particle: 'まで',
    romaji: 'made',
    category: 'range',
    title: 'Trợ từ Điểm kết thúc ("Đến / Cho tới")',
    badge: 'Căn Bản',
    usage: 'Chỉ giới hạn kết thúc về mặt thời gian hoặc không gian địa lý ("cho đến...").',
    formula: 'Thời gian / Địa điểm + まで',
    notes: 'Phân biệt với までに (hạn chót hoàn thành trước thời điểm đó).',
    examples: [
      { jp: '午後5時まで 勉強します。', romaji: 'Gogo go-ji made benkyou shimasu.', vi: 'Tôi học bài đến tận 5 giờ chiều.' }
    ]
  },
  {
    particle: 'より',
    romaji: 'yori',
    category: 'range',
    title: 'Trợ từ So sánh hơn ("Hơn")',
    badge: 'So Sánh',
    usage: 'Đứng sau đối tượng được đem ra làm mốc so sánh ("so với... thì... hơn").',
    formula: 'A は B + より + Tính từ です',
    notes: 'A là đối tượng nổi trội hơn B.',
    examples: [
      { jp: '新幹線は バスより 速いです。', romaji: 'Shinkansen wa basu yori hayai desu.', vi: 'Tàu Shinkansen thì nhanh hơn xe buýt.' }
    ]
  },
  {
    particle: 'の',
    romaji: 'no',
    category: 'connect',
    title: 'Trợ từ Sở hữu, Xuất xứ & Bổ nghĩa Danh từ ("Của")',
    badge: 'Cốt Lõi',
    usage: 'Nối hai danh từ: quan hệ sở hữu (sách của tôi), xuất xứ (xe của Nhật), hoặc giải thích cho danh từ chính.',
    formula: 'Danh từ 1 + の + Danh từ 2',
    notes: 'Danh từ bổ nghĩa đứng TRƯỚC, danh từ chính đứng SAU.',
    examples: [
      { jp: 'これは わたしの 本です。', romaji: 'Kore wa watashi no hon desu.', vi: 'Đây là cuốn sách của tôi.' }
    ]
  },
  {
    particle: 'や',
    romaji: 'ya',
    category: 'connect',
    title: 'Trợ từ Liệt kê Tiêu biểu ("Nào là... và...")',
    badge: 'Nâng Cao',
    usage: 'Nối các danh từ mang tính chất liệt kê đại diện (còn những thứ khác nữa). Thường kết hợp với など ở cuối.',
    formula: 'Danh từ 1 + や + Danh từ 2 (+ など)',
    notes: 'Khác với と (liệt kê hết), や ám chỉ vẫn còn các sự vật khác chưa kể.',
    examples: [
      { jp: '机の上に 本や ペンなどが あります。', romaji: 'Tsukue no ue ni hon ya pen nado ga arimasu.', vi: 'Trên bàn có sách, bút,... v.v.' }
    ]
  },
  {
    particle: 'など',
    romaji: 'nado',
    category: 'connect',
    title: 'Trợ từ "Vân vân / v.v."',
    badge: 'Căn Bản',
    usage: 'Đứng sau danh từ cuối cùng trong chuỗi liệt kê để biểu thị nghĩa "vân vân".',
    formula: 'Danh từ + など',
    notes: 'Thường bắt cặp hoàn hảo với trợ từ や.',
    examples: [
      { jp: 'りんごや みかんなどを 買いました。', romaji: 'Ringo ya mikan nado o kaimashita.', vi: 'Tôi đã mua táo, quýt,... vân vân.' }
    ]
  },
  {
    particle: 'だけ',
    romaji: 'dake',
    category: 'limit',
    title: 'Trợ từ Giới hạn Khẳng định ("Chỉ")',
    badge: 'Giới Hạn',
    usage: 'Biểu thị sự giới hạn duy nhất trong phạm vi nêu ra ("chỉ có thế thôi"). Luôn đi với vế KHẲNG ĐỊNH.',
    formula: 'Danh từ / Số từ + だけ + Khẳng định',
    notes: 'だけ đi với khẳng định. しか đi với phủ định.',
    examples: [
      { jp: '休みは 日曜日だけです。', romaji: 'Yasumi wa nichiyoubi dake desu.', vi: 'Ngày nghỉ chỉ có duy nhất chủ nhật.' }
    ]
  },
  {
    particle: 'しか',
    romaji: 'shika',
    category: 'limit',
    title: 'Trợ từ Giới hạn Phủ định ("Chỉ vỏn vẹn / Không gì ngoài")',
    badge: 'Giới Hạn',
    usage: 'Nhấn mạnh sự ít ỏi mang sắc thái tiếc nuối. Luôn luôn đi kèm đuôi PHỦ ĐỊNH.',
    formula: 'Danh từ / Số từ + しか + Động từ PHỦ ĐỊNH',
    notes: 'Cứ thấy しか thì đuôi câu BẮT BUỘC phải là dạng phủ định (ません / ない).',
    examples: [
      { jp: '財布に 100円しか ありません。', romaji: 'Saifu ni hyaku-en shika arimasen.', vi: 'Trong ví chỉ vỏn vẹn có 100 yên.' }
    ]
  },
  {
    particle: 'か',
    romaji: 'ka',
    category: 'sentence_end',
    title: 'Trợ từ Nghi vấn & Lựa chọn ("Hoặc / Phải không?")',
    badge: 'Căn Bản',
    usage: '1. Đặt ở cuối câu để tạo thành câu hỏi nghi vấn ("... phải không?").\n2. Nối 2 danh từ mang nghĩa lựa chọn ("hoặc là...").',
    formula: 'Cuối câu + か / Danh từ A + か + Danh từ B',
    notes: 'Đặt sau nghi vấn từ tạo thành đại từ bất định (だれか, なにか, どこか).',
    examples: [
      { jp: 'これはいったい 何ですか。', romaji: 'Kore wa ittai nan desu ka.', vi: 'Cái này rốt cuộc là cái gì vậy?' }
    ]
  },
  {
    particle: 'ね',
    romaji: 'ne',
    category: 'sentence_end',
    title: 'Trợ từ Cuối câu Đồng tình ("... nhỉ / nhé")',
    badge: 'Cuối Câu',
    usage: 'Đặt ở cuối câu để tìm kiếm sự đồng thuận, chia sẻ cảm xúc, hoặc xác nhận nhẹ nhàng từ người nghe.',
    formula: 'Câu hoàn chỉnh + ね',
    notes: 'Thể hiện sự thân thiện, gần gũi trong giao tiếp.',
    examples: [
      { jp: 'きょうは いい天気ですね。', romaji: 'Kyou wa ii tenki desu ne.', vi: 'Hôm nay trời đẹp nhỉ!' }
    ]
  },
  {
    particle: 'よ',
    romaji: 'yo',
    category: 'sentence_end',
    title: 'Trợ từ Cuối câu Nhấn mạnh & Cung cấp Thông tin ("... đấy / nhé")',
    badge: 'Cuối Câu',
    usage: 'Đặt ở cuối câu để nhấn mạnh điều người nói biết mà người nghe chưa biết, hoặc nhắc nhở, khẳng định.',
    formula: 'Câu hoàn chỉnh + よ',
    notes: 'Dùng khi muốn truyền đạt thông tin mới cho đối phương.',
    examples: [
      { jp: 'あの映画は とても 面白いですよ。', romaji: 'Ano eiga wa totemo omoshiroi desu yo.', vi: 'Bộ phim kia hay lắm đấy nhé!' }
    ]
  }
];

// ── 2. STANDARD 25 MINNA NO NIHONGO LESSONS CURRICULUM (BÀI 1 ĐẾN BÀI 25) ──
const LESSONS_CURRICULUM = [
  {
    lesson: 1,
    title: 'Bài 1: Khẳng định, Phủ định, Trợ từ は, も, の',
    focus: 'は (chủ đề), も (đồng nhất), の (thuộc về), じゃありません (phủ định)',
    questions: [
      {
        id: 'L1-1',
        sentence: 'わたし [ ? ] ベトナム人です。',
        target: 'は',
        options: ['は', 'が', 'を', 'に'],
        translation: 'Tôi là người Việt Nam.',
        fullSentence: 'わたしは ベトナム人です。',
        explanation: 'Bài 1: Trợ từ は dùng để xác định chủ ngữ/chủ đề chính của câu (Danh từ + は + Vị ngữ).'
      },
      {
        id: 'L1-2',
        sentence: 'サントスさんは ブラジル人です。マリアさん [ ? ] ブラジル人です。',
        target: 'も',
        options: ['も', 'は', 'の', 'で'],
        translation: 'Anh Santos là người Brazil. Chị Maria cũng là người Brazil.',
        fullSentence: 'サントスさんは ブラジル人です。マリアさんも ブラジル人です。',
        explanation: 'Bài 1: Trợ từ も mang nghĩa "cũng", dùng khi thông tin tương đồng với chủ thể phía trước.'
      },
      {
        id: 'L1-3',
        sentence: 'ミラーさんは IMC [ ? ] 社員です。',
        target: 'の',
        options: ['の', 'は', 'に', 'と'],
        translation: 'Anh Miller là nhân viên của công ty IMC.',
        fullSentence: 'ミラーさんは IMCの 社員です。',
        explanation: 'Bài 1: Trợ từ の nối hai danh từ biểu thị quan hệ trực thuộc/sở hữu (N1 の N2).'
      }
    ]
  },
  {
    lesson: 2,
    title: 'Bài 2: Chỉ từ これ/それ/あれ, Trợ từ の (sở hữu/chủng loại)',
    focus: 'これ/それ/あれ, この/その/あの, の (sở hữu, phân loại)',
    questions: [
      {
        id: 'L2-1',
        sentence: 'それ [ ? ] なんの 本ですか。',
        target: 'は',
        options: ['は', 'が', 'を', 'に'],
        translation: 'Đó là sách gì vậy?',
        fullSentence: 'それは なんの 本ですか。',
        explanation: 'Bài 2: Chỉ từ それ làm chủ đề câu đi kèm trợ từ は (それは ... ですか).'
      },
      {
        id: 'L2-2',
        sentence: 'これは 自動車 [ ? ] 雑誌です。',
        target: 'の',
        options: ['の', 'と', 'に', 'で'],
        translation: 'Đây là tạp chí về ô tô.',
        fullSentence: 'これは 自動車の 雑誌です。',
        explanation: 'Bài 2: Trợ từ の chỉ nội dung, chủng loại của cuốn tạp chí (tạp chí về xe hơi).'
      },
      {
        id: 'L2-3',
        sentence: 'この 傘 [ ? ] わたしのです。',
        target: 'は',
        options: ['は', 'の', 'が', 'を'],
        translation: 'Cây dù này là của tôi.',
        fullSentence: 'この 傘は わたしのです。',
        explanation: 'Bài 2: Cụm "この + Danh từ" làm chủ đề câu, theo sau là trợ từ は.'
      }
    ]
  },
  {
    lesson: 3,
    title: 'Bài 3: Chỉ nơi chốn ここ/そこ/あそこ, Trợ từ の (xuất xứ)',
    focus: 'ここ/そこ/あそこ/どこ, の (xuất xứ/quốc gia), に (tồn tại)',
    questions: [
      {
        id: 'L3-1',
        sentence: 'お手洗い [ ? ] あちらです。',
        target: 'は',
        options: ['は', 'が', 'に', 'で'],
        translation: 'Nhà vệ sinh ở đằng kia ạ.',
        fullSentence: 'お手洗いは あちらです。',
        explanation: 'Bài 3: Cấu trúc xác định vị trí của địa điểm: Địa điểm + は + Chỉ từ phương hướng + です.'
      },
      {
        id: 'L3-2',
        sentence: 'これは 日本 [ ? ] カメラです。',
        target: 'の',
        options: ['の', 'に', 'で', 'と'],
        translation: 'Đây là máy ảnh sản xuất tại Nhật Bản.',
        fullSentence: 'これは 日本の カメラです。',
        explanation: 'Bài 3: Trợ từ の biểu thị xuất xứ quốc gia sản xuất (Tên nước + の + Sản phẩm).'
      },
      {
        id: 'L3-3',
        sentence: '事務所は 2階 [ ? ] あります。',
        target: 'に',
        options: ['に', 'で', 'を', 'は'],
        translation: 'Văn phòng nằm ở tầng 2.',
        fullSentence: '事務所は 2階に あります。',
        explanation: 'Bài 3: Chỉ vị trí tầng nơi tồn tại của phòng ốc đi với あります dùng trợ từ に.'
      }
    ]
  },
  {
    lesson: 4,
    title: 'Bài 4: Thời gian に, Khoảng thời gian から ～ まで, Trợ từ と',
    focus: 'に (thời điểm cụ thể), から (từ), まで (đến), と (nối danh từ)',
    questions: [
      {
        id: 'L4-1',
        sentence: '毎朝 6時半 [ ? ] 起きます。',
        target: 'に',
        options: ['に', 'で', 'を', 'へ'],
        translation: 'Mỗi sáng tôi thức dậy lúc 6 giờ rưỡi.',
        fullSentence: '毎朝 6時半に 起きます。',
        explanation: 'Bài 4: Thời gian có con số cụ thể (6時半) bắt buộc phải đi kèm trợ từ に.'
      },
      {
        id: 'L4-2',
        sentence: '銀行は 9時 [ ? ] 3時までです。',
        target: 'から',
        options: ['から', 'まで', 'に', 'で'],
        translation: 'Ngân hàng mở cửa từ 9 giờ đến 3 giờ.',
        fullSentence: '銀行は 9時から 3時までです。',
        explanation: 'Bài 4: Mốc bắt đầu dùng trợ từ から ("từ 9 giờ"). Cặp đôi: から ～ まで.'
      },
      {
        id: 'L4-3',
        sentence: '郵便局の 休みは 土曜日 [ ? ] 日曜日です。',
        target: 'と',
        options: ['と', 'に', 'で', 'や'],
        translation: 'Ngày nghỉ của bưu điện là thứ bảy và chủ nhật.',
        fullSentence: '郵便局の 休みは 土曜日と 日曜日です。',
        explanation: 'Bài 4: Trợ từ と dùng để nối hai danh từ được liệt kê đầy đủ ("thứ 7 và chủ nhật").'
      }
    ]
  },
  {
    lesson: 5,
    title: 'Bài 5: Hướng di chuyển へ, Phương tiện で, Đồng hành と',
    focus: 'へ (hướng đích đến), で (phương tiện), と (cùng với ai)',
    questions: [
      {
        id: 'L5-1',
        sentence: '来週 京都 [ ? ] 行きます。',
        target: 'へ',
        options: ['へ', 'で', 'を', 'と'],
        translation: 'Tuần sau tôi sẽ đi Kyoto.',
        fullSentence: '来週 京都へ 行きます。',
        explanation: 'Bài 5: Địa điểm đích đến đi với động từ di chuyển (行きます/来ます/帰ります) dùng trợ từ へ.'
      },
      {
        id: 'L5-2',
        sentence: 'タクシー [ ? ] うちへ 帰りました。',
        target: 'で',
        options: ['で', 'に', 'へ', 'を'],
        translation: 'Tôi đã về nhà bằng taxi.',
        fullSentence: 'タクシーで うちへ 帰りました。',
        explanation: 'Bài 5: Trợ từ で đứng sau phương tiện giao thông (bằng taxi, bằng tàu điện).'
      },
      {
        id: 'L5-3',
        sentence: '家族 [ ? ] 日本へ 来ました。',
        target: 'と',
        options: ['と', 'に', 'で', 'を'],
        translation: 'Tôi đã đến Nhật cùng với gia đình.',
        fullSentence: '家族と 日本へ 来ました。',
        explanation: 'Bài 5: Trợ từ と đứng sau người cùng thực hiện hành động ("làm gì cùng với ai").'
      }
    ]
  },
  {
    lesson: 6,
    title: 'Bài 6: Tân ngữ を, Nơi hành động で, Rủ rê ～ませんか',
    focus: 'を (tân ngữ trực tiếp), で (nơi diễn ra hành động), ～ませんか/～ましょう',
    questions: [
      {
        id: 'L6-1',
        sentence: 'ジュース [ ? ] 飲みます。',
        target: 'を',
        options: ['を', 'が', 'に', 'で'],
        translation: 'Tôi uống nước hoa quả.',
        fullSentence: 'ジュースを 飲みます。',
        explanation: 'Bài 6: Đối tượng chịu tác động trực tiếp của ngoại động từ (uống) đi với trợ từ を.'
      },
      {
        id: 'L6-2',
        sentence: 'レストラン [ ? ] 昼ごはんを 食べました。',
        target: 'で',
        options: ['で', 'に', 'へ', 'を'],
        translation: 'Tôi đã ăn cơm trưa ở nhà hàng.',
        fullSentence: 'レストランで 昼ごはんを 食べました。',
        explanation: 'Bài 6: Địa điểm nơi diễn ra HÀNH ĐỘNG (ăn cơm trưa) dùng trợ từ で.'
      },
      {
        id: 'L6-3',
        sentence: 'いっしょに 京都へ 行き [ ? ]。',
        target: 'ませんか',
        options: ['ませんか', 'ましょうか', 'ました', 'ます'],
        translation: 'Bạn cùng đi Kyoto với tôi nhé? (Lời mời lịch sự)',
        fullSentence: 'いっしょに 京都へ 行きませんか。',
        explanation: 'Bài 6: Động từ thể ます bỏ ます + ませんか dùng để đưa ra lời rủ rê, mời mọc lịch sự.'
      }
    ]
  },
  {
    lesson: 7,
    title: 'Bài 7: Công cụ で, Cho/Nhận に / から (あげます/もらいます)',
    focus: 'で (công cụ/phương thức), に (đối tượng cho/nhận), もう ～ました',
    questions: [
      {
        id: 'L7-1',
        sentence: 'はし [ ? ] ごはんを 食べます。',
        target: 'で',
        options: ['で', 'に', 'を', 'と'],
        translation: 'Tôi ăn cơm bằng đũa.',
        fullSentence: 'はしで ごはんを 食べます。',
        explanation: 'Bài 7: Trợ từ で chỉ công cụ, dụng cụ hoặc ngôn ngữ thực hiện hành động (ăn bằng đũa).'
      },
      {
        id: 'L7-2',
        sentence: '母 [ ? ] プレゼントを あげました。',
        target: 'に',
        options: ['に', 'を', 'で', 'から'],
        translation: 'Tôi đã tặng quà cho mẹ.',
        fullSentence: '母に プレゼントを あげました。',
        explanation: 'Bài 7: Đối tượng tiếp nhận hành động cho/tặng (あげます) dùng trợ từ に.'
      },
      {
        id: 'L7-3',
        sentence: '先生 [ ? ] 本を 借りました。',
        target: 'に',
        options: ['に', 'で', 'を', 'へ'],
        translation: 'Tôi đã mượn sách từ thầy giáo.',
        fullSentence: '先生に 本を 借りました。',
        explanation: 'Bài 7: Đối tượng mình nhận hoặc mượn từ họ (もらいます/借ります) dùng trợ từ に (hoặc から).'
      }
    ]
  },
  {
    lesson: 8,
    title: 'Bài 8: Tính từ đuôi い / な, Trợ từ が (nhưng)',
    focus: 'Tính từ い / な, とても / あまり, が (liên từ nhưng)',
    questions: [
      {
        id: 'L8-1',
        sentence: '桜は とても [ ? ] です。',
        target: 'きれい',
        options: ['きれい', 'きれいに', 'きれいな', 'きれいく'],
        translation: 'Hoa anh đào rất đẹp.',
        fullSentence: '桜は とても きれいです。',
        explanation: 'Bài 8: Tính từ đuôi な khi đứng trước です thì bỏ な (きれいです).'
      },
      {
        id: 'L8-2',
        sentence: '日本の 食べ物は おいしいですが、高い [ ? ]。',
        target: 'です',
        options: ['です', 'で', 'だ', 'ます'],
        translation: 'Món ăn Nhật Bản ngon nhưng mà đắt.',
        fullSentence: '日本の 食べ物は おいしいですが、高いです。',
        explanation: 'Bài 8: Trợ từ が đứng giữa hai vế câu mang nghĩa đối lập tương phản ("nhưng mà...").'
      },
      {
        id: 'L8-3',
        sentence: 'この 本は あまり [ ? ] ないです。',
        target: 'おもしろく',
        options: ['おもしろく', 'おもしろい', 'おもしろな', 'おもしろ'],
        translation: 'Cuốn sách này không thú vị lắm.',
        fullSentence: 'この 本は あまり おもしろくないです。',
        explanation: 'Bài 8: Phó từ あまり đi với thể phủ định của tính từ đuôi い (bỏ い thêm く + ないです).'
      }
    ]
  },
  {
    lesson: 9,
    title: 'Bài 9: Đối tượng が (sở thích, năng lực, sở hữu), Lý do から',
    focus: 'が (好き/嫌い/上手/下手/わかります/あります), から (nguyên nhân)',
    questions: [
      {
        id: 'L9-1',
        sentence: 'わたしは イタリア料理 [ ? ] 好きです。',
        target: 'が',
        options: ['が', 'を', 'に', 'で'],
        translation: 'Tôi thích món ăn Ý.',
        fullSentence: 'わたしは イタリア料理が 好きです。',
        explanation: 'Bài 9: Đối tượng của tính từ chỉ cảm xúc, sở thích (好き, 嫌い) bắt buộc đi với trợ từ が.'
      },
      {
        id: 'L9-2',
        sentence: '英語 [ ? ] よく わかります。',
        target: 'が',
        options: ['が', 'を', 'で', 'に'],
        translation: 'Tôi hiểu rõ tiếng Anh.',
        fullSentence: '英語が よく わかります。',
        explanation: 'Bài 9: Đối tượng của động từ chỉ năng lực, hiểu biết (わかります, できます) đi với trợ từ が.'
      },
      {
        id: 'L9-3',
        sentence: '用事が あります [ ? ]、早く 帰ります。',
        target: 'から',
        options: ['から', 'まで', 'で', 'が'],
        translation: 'Vì có việc bận nên tôi về sớm.',
        fullSentence: '用事が ありますから、早く 帰ります。',
        explanation: 'Bài 9: Đứng cuối mệnh đề 1 chỉ nguyên nhân, lý do dẫn tới kết quả vế 2 (Mệnh đề + から).'
      }
    ]
  },
  {
    lesson: 10,
    title: 'Bài 10: Tồn tại に ... が あります/います, Liệt kê や ... など',
    focus: 'に (nơi tồn tại), が (chủ thể tồn tại), の (vị trí 上/下/隣), や...など',
    questions: [
      {
        id: 'L10-1',
        sentence: '庭 [ ? ] 犬が います。',
        target: 'に',
        options: ['に', 'で', 'へ', 'を'],
        translation: 'Trong sân có con chó.',
        fullSentence: '庭に 犬が います。',
        explanation: 'Bài 10: Chỉ nơi chốn tồn tại tĩnh của người hoặc động vật (います) dùng trợ từ に.'
      },
      {
        id: 'L10-2',
        sentence: '机の 上 [ ? ] 写真が あります。',
        target: 'に',
        options: ['に', 'で', 'を', 'は'],
        translation: 'Trên mặt bàn có bức ảnh.',
        fullSentence: '机の 上に 写真が あります。',
        explanation: 'Bài 10: Cấu trúc vị trí: Danh từ 1 + の + Từ chỉ vị trí (上, 下, 前, 後ろ) + に + あります.'
      },
      {
        id: 'L10-3',
        sentence: '箱の中に 手紙 [ ? ] 写真などが あります。',
        target: 'や',
        options: ['や', 'と', 'に', 'で'],
        translation: 'Trong hộp có những thứ như thư từ, ảnh,... vân vân.',
        fullSentence: '箱の中に 手紙や 写真などが あります。',
        explanation: 'Bài 10: Trợ từ や dùng để liệt kê tiêu biểu đại diện, thường đi cùng など ở cuối.'
      }
    ]
  },
  {
    lesson: 11,
    title: 'Bài 11: Lượng từ, Trợ từ に (tần suất), Giới hạn だけ',
    focus: 'Lượng từ (không cần trợ từ), に (tần suất thời gian), だけ (chỉ)',
    questions: [
      {
        id: 'L11-1',
        sentence: 'りんごを 3つ [ ? ] 買いました。',
        target: '∅',
        options: ['∅ (không cần)', 'を', 'に', 'で'],
        translation: 'Tôi đã mua 3 quả táo.',
        fullSentence: 'りんごを 3つ 買いました。',
        explanation: 'Bài 11: Lượng từ / Số đếm đứng ngay trước động từ thì KHÔNG cần trợ từ đi kèm.'
      },
      {
        id: 'L11-2',
        sentence: '1か月 [ ? ] 2回 映画を 見ます。',
        target: 'に',
        options: ['に', 'で', 'を', 'から'],
        translation: 'Một tháng tôi xem phim 2 lần.',
        fullSentence: '1か月に 2回 映画を 見ます。',
        explanation: 'Bài 11: Trợ từ に biểu thị tần suất thực hiện trong một khoảng thời gian (Thời gian + に + Số lần).'
      },
      {
        id: 'L11-3',
        sentence: '会社に 外国人は 1人 [ ? ] います。',
        target: 'だけ',
        options: ['だけ', 'しか', 'に', 'で'],
        translation: 'Ở công ty chỉ có duy nhất 1 người nước ngoài.',
        fullSentence: '会社に 外国人は 1人だけ います。',
        explanation: 'Bài 11: Trợ từ だけ mang nghĩa "chỉ", đi với vị ngữ khẳng định (います).'
      }
    ]
  },
  {
    lesson: 12,
    title: 'Bài 12: So sánh より, どちらが, Trong phạm vi で ... が一番',
    focus: 'より (hơn), どちらが (cái nào hơn), で (trong phạm vi so sánh)',
    questions: [
      {
        id: 'L12-1',
        sentence: '新幹線は バス [ ? ] 速いです。',
        target: 'より',
        options: ['より', 'から', 'まで', 'で'],
        translation: 'Tàu Shinkansen thì nhanh hơn xe buýt.',
        fullSentence: '新幹線は バスより 速いです。',
        explanation: 'Bài 12: Trợ từ より đứng sau đối tượng đem ra làm mốc so sánh (A は B より Tính từ).'
      },
      {
        id: 'L12-2',
        sentence: '海 [ ? ] 山と どちらが 好きですか。',
        target: 'と',
        options: ['と', 'に', 'で', 'より'],
        translation: 'Biển và núi, bạn thích nơi nào hơn?',
        fullSentence: '海と 山と どちらが 好きですか。',
        explanation: 'Bài 12: Cấu trúc so sánh lựa chọn giữa 2 đối tượng: A と B と どちらが ... ですか.'
      },
      {
        id: 'L12-3',
        sentence: '果物の 中 [ ? ] りんごが いちばん 好きです。',
        target: 'で',
        options: ['で', 'に', 'から', 'を'],
        translation: 'Trong các loại hoa quả, tôi thích táo nhất.',
        fullSentence: '果物の 中で りんごが いちばん 好きです。',
        explanation: 'Bài 12: Trợ từ で xác định phạm vi so sánh nhất (Phạm vi + で + ... が一番 Tính từ).'
      }
    ]
  },
  {
    lesson: 13,
    title: 'Bài 13: Mong muốn が ほしい / たい, Mục đích di chuyển に',
    focus: 'が (ほしい), たいです (muốn làm), V-bỏます + に 行きます (mục đích)',
    questions: [
      {
        id: 'L13-1',
        sentence: 'わたしは 新しい パソコン [ ? ] ほしいです。',
        target: 'が',
        options: ['が', 'を', 'に', 'で'],
        translation: 'Tôi muốn có một chiếc máy tính mới.',
        fullSentence: 'わたしは 新しい パソコンが ほしいです。',
        explanation: 'Bài 13: Đối tượng của tính từ ほしい (muốn có vật gì) luôn đi với trợ từ が.'
      },
      {
        id: 'L13-2',
        sentence: '日本料理を 食べ [ ? ] です。',
        target: 'たい',
        options: ['たい', 'ほしい', 'そう', 'ます'],
        translation: 'Tôi muốn ăn món ăn Nhật Bản.',
        fullSentence: '日本料理を 食べたいです。',
        explanation: 'Bài 13: Muốn thực hiện hành động: Động từ thể ます bỏ ます + たいです.'
      },
      {
        id: 'L13-3',
        sentence: 'デパートへ 買い物 [ ? ] 行きます。',
        target: 'に',
        options: ['に', 'で', 'を', 'へ'],
        translation: 'Tôi đi đến trung tâm bách hóa để mua sắm.',
        fullSentence: 'デパートへ 買い物に 行きます。',
        explanation: 'Bài 13: Trợ từ に biểu thị mục đích di chuyển (Danh từ chỉ hành động / V-bỏます + に + 行きます).'
      }
    ]
  },
  {
    lesson: 14,
    title: 'Bài 14: Thể て (てください, ています, ましょうか)',
    focus: 'Vてください (yêu cầu), Vています (tiến hành), Vましょうか (đề nghị)',
    questions: [
      {
        id: 'L14-1',
        sentence: 'ここに 住所を 書いて [ ? ]。',
        target: 'ください',
        options: ['ください', 'います', 'ました', 'ましょう'],
        translation: 'Xin vui lòng viết địa chỉ vào đây.',
        fullSentence: 'ここに 住所を 書いて ください。',
        explanation: 'Bài 14: Thể て + ください dùng để đưa ra lời nhờ vả, yêu cầu lịch sự.'
      },
      {
        id: 'L14-2',
        sentence: '今 雨が 降って [ ? ]。',
        target: 'います',
        options: ['います', 'ください', 'きます', 'あります'],
        translation: 'Bây giờ trời đang mưa.',
        fullSentence: '今 雨が 降って います。',
        explanation: 'Bài 14: Thể て + います diễn tả hành động đang diễn ra tại thời điểm nói.'
      },
      {
        id: 'L14-3',
        sentence: '荷物を 持ち [ ? ]。',
        target: 'ましょうか',
        options: ['ましょうか', 'ませんか', 'ます', 'ましょう'],
        translation: 'Tôi mang hành lý giúp bạn nhé?',
        fullSentence: '荷物を 持ちましょうか。',
        explanation: 'Bài 14: V-bỏます + ましょうか dùng khi người nói chủ động đề nghị giúp đỡ đối phương.'
      }
    ]
  },
  {
    lesson: 15,
    title: 'Bài 15: Cho phép てもいい, Cấm đoán てはいけない, Trạng thái ている',
    focus: 'Vてもいいです, Vてはいけません, Vています (trạng thái nghề nghiệp/hôn nhân)',
    questions: [
      {
        id: 'L15-1',
        sentence: 'ここで 写真を 撮って [ ? ] いいですか。',
        target: 'も',
        options: ['も', 'は', 'に', 'で'],
        translation: 'Tôi chụp ảnh ở đây có được không ạ?',
        fullSentence: 'ここで 写真を 撮っても いいですか。',
        explanation: 'Bài 15: Mẫu câu xin phép làm gì: Động từ thể て + もいいですか.'
      },
      {
        id: 'L15-2',
        sentence: 'ここで たばこを 吸って [ ? ] いけません。',
        target: 'は',
        options: ['は', 'も', 'に', 'で'],
        translation: 'Cấm hút thuốc ở đây.',
        fullSentence: 'ここで たばこを 吸っては いけません。',
        explanation: 'Bài 15: Mẫu câu cấm đoán: Động từ thể て + は いけません.'
      },
      {
        id: 'L15-3',
        sentence: 'わたしは ハノイ [ ? ] 住んで います。',
        target: 'に',
        options: ['に', 'で', 'へ', 'を'],
        translation: 'Tôi đang sinh sống ở Hà Nội.',
        fullSentence: 'わたしは ハノイに 住んで います。',
        explanation: 'Bài 15: Nơi sinh sống gắn liền với trạng thái tĩnh (住んでいます) đi với trợ từ に.'
      }
    ]
  },
  {
    lesson: 16,
    title: 'Bài 16: Nối hành động て, Sau khi てから, Đặc điểm が',
    focus: 'Vて, Vて, Vてから (sau khi), N1 は N2 が Tính từ',
    questions: [
      {
        id: 'L16-1',
        sentence: '朝 起きて、顔を [ ? ]、ごはんを 食べます。',
        target: '洗って',
        options: ['洗って', '洗います', '洗う', '洗った'],
        translation: 'Buổi sáng thức dậy, rửa mặt rồi ăn cơm.',
        fullSentence: '朝 起きて、顔を 洗って、ごはんを 食べます。',
        explanation: 'Bài 16: Dùng thể て để nối chuỗi các hành động diễn ra theo trình tự thời gian.'
      },
      {
        id: 'L16-2',
        sentence: '仕事を 終わって [ ? ]、飲みに行きます。',
        target: 'から',
        options: ['から', 'まで', 'に', 'で'],
        translation: 'Sau khi xong việc thì tôi đi uống.',
        fullSentence: '仕事を 終わってから、飲みに行きます。',
        explanation: 'Bài 16: Thể て + から biểu thị sau khi hoàn thành hành động 1 mới bắt đầu hành động 2.'
      },
      {
        id: 'L16-3',
        sentence: 'マリアさんは 髪 [ ? ] 長いです。',
        target: 'が',
        options: ['が', 'は', 'を', 'に'],
        translation: 'Chị Maria có mái tóc dài.',
        fullSentence: 'マリアさんは 髪が 長いです。',
        explanation: 'Bài 16: Miêu tả đặc điểm bộ phận của chủ thể: Chủ thể は + Bộ phận が + Tính từ.'
      }
    ]
  },
  {
    lesson: 17,
    title: 'Bài 17: Thể ない (ないでください, なければなりません, なくてもいい)',
    focus: 'Vないでください (xin đừng), Vなければなりません (bắt buộc), Vなくてもいい (không cần)',
    questions: [
      {
        id: 'L17-1',
        sentence: 'ここに ゴミを 捨て [ ? ] ください。',
        target: 'ないで',
        options: ['ないで', 'なくて', 'なければ', 'ない'],
        translation: 'Xin vui lòng đừng vứt rác ở đây.',
        fullSentence: 'ここに ゴミを 捨てないで ください。',
        explanation: 'Bài 17: Khuyên nhủ, yêu cầu ai đó không làm gì: Động từ thể ない + でください.'
      },
      {
        id: 'L17-2',
        sentence: '毎日 薬を 飲ま [ ? ] なりません。',
        target: 'なければ',
        options: ['なければ', 'ないで', 'なくて', 'ない'],
        translation: 'Mỗi ngày tôi bắt buộc phải uống thuốc.',
        fullSentence: '毎日 薬を 飲まなければ なりません。',
        explanation: 'Bài 17: Nghĩa vụ bắt buộc: Động từ thể ない bỏ い + ければなりません.'
      },
      {
        id: 'L17-3',
        sentence: '明日は 休みですから、早く 起き [ ? ] いいです。',
        target: 'なくても',
        options: ['なくても', 'なければ', 'ないで', 'なくて'],
        translation: 'Ngày mai là ngày nghỉ nên không cần dậy sớm cũng được.',
        fullSentence: '明日は 休みですから、早く 起きなくても いいです。',
        explanation: 'Bài 17: Không cần thiết phải làm gì: Động từ thể ない bỏ い + くてもいいです.'
      }
    ]
  },
  {
    lesson: 18,
    title: 'Bài 18: Thể từ điển (ことができる, 趣味は～こと, 前に)',
    focus: 'Vことが できます (khả năng), 趣味は Vことです, Vる 前に (trước khi)',
    questions: [
      {
        id: 'L18-1',
        sentence: 'ミラーさんは 漢字を 読むこと [ ? ] できます。',
        target: 'が',
        options: ['が', 'を', 'に', 'は'],
        translation: 'Anh Miller có thể đọc được chữ Hán.',
        fullSentence: 'ミラーさんは 漢字を 読むことが できます。',
        explanation: 'Bài 18: Biểu thị năng lực khả năng: V-nguyên dạng + ことが できます.'
      },
      {
        id: 'L18-2',
        sentence: 'わたしの 趣味は 写真を 撮る [ ? ] です。',
        target: 'こと',
        options: ['こと', 'もの', 'の', 'ところ'],
        translation: 'Sở thích của tôi là chụp ảnh.',
        fullSentence: 'わたしの 趣味は 写真を 撮ることです。',
        explanation: 'Bài 18: Biến động từ thành danh từ làm vị ngữ: V-nguyên dạng + ことです.'
      },
      {
        id: 'L18-3',
        sentence: 'ごはんを 食べる [ ? ]、手を 洗います。',
        target: '前に',
        options: ['前に', '後で', 'とき', 'から'],
        translation: 'Trước khi ăn cơm, tôi rửa tay.',
        fullSentence: 'ごはんを 食べる 前に、手を 洗います。',
        explanation: 'Bài 18: Biểu thị làm hành động gì trước: Động từ thể từ điển (Vる) + 前に.'
      }
    ]
  },
  {
    lesson: 19,
    title: 'Bài 19: Thể た (たことがある, たり～たりする, に/くなります)',
    focus: 'Vたことが あります (kinh nghiệm), Vたり～Vたりします, に/くなります (biến đổi)',
    questions: [
      {
        id: 'L19-1',
        sentence: '日本へ 行ったこと [ ? ] ありますか。',
        target: 'が',
        options: ['が', 'を', 'に', 'は'],
        translation: 'Bạn đã từng đi Nhật Bản bao giờ chưa?',
        fullSentence: '日本へ 行ったことが ありますか。',
        explanation: 'Bài 19: Diễn tả kinh nghiệm đã từng làm gì trong quá khứ: Động từ thể た + ことが あります.'
      },
      {
        id: 'L19-2',
        sentence: '日曜日は テニスを し [ ? ]、音楽を 聞いたり します。',
        target: 'たり',
        options: ['たり', 'て', 'ながら', 'たら'],
        translation: 'Chủ nhật tôi lúc thì chơi tennis, lúc thì nghe nhạc.',
        fullSentence: '日曜日は テニスを したり、音楽を 聞いたり します。',
        explanation: 'Bài 19: Liệt kê các hành động tiêu biểu không theo thứ tự: V1-た + り, V2-た + り します.'
      },
      {
        id: 'L19-3',
        sentence: '寒 [ ? ] なりましたね。',
        target: 'く',
        options: ['く', 'に', 'な', 'で'],
        translation: 'Trời đã trở nên lạnh rồi nhỉ.',
        fullSentence: '寒く なりましたね。',
        explanation: 'Bài 19: Biến đổi trạng thái với tính từ đuôi い: Bỏ い thêm く + なります.'
      }
    ]
  },
  {
    lesson: 20,
    title: 'Bài 20: Thể thông thường (普通形) trong giao tiếp thân mật',
    focus: 'Thể thông thường (thay cho ます/です), Trợ từ thân mật の, けど',
    questions: [
      {
        id: 'L20-1',
        sentence: '今 忙しい [ ? ]。うん、忙しい。',
        target: '？',
        options: ['？ (lên giọng)', 'か', 'ね', 'よ'],
        translation: 'Bây giờ bận không? Ừ, bận.',
        fullSentence: '今 忙しい？',
        explanation: 'Bài 20: Trong văn nói thân mật (普通形), câu hỏi bỏ trợ từ か và chỉ cần lên giọng ở cuối câu.'
      },
      {
        id: 'L20-2',
        sentence: '明日 暇？――ううん、暇じゃ [ ? ]。',
        target: 'ない',
        options: ['ない', 'ありません', 'なかった', 'なくて'],
        translation: 'Ngày mai rảnh không? -- Không, không rảnh.',
        fullSentence: 'ううん、暇じゃない。',
        explanation: 'Bài 20: Phủ định thân mật của tính từ đuôi な / danh từ: じゃありません biến thành じゃない.'
      },
      {
        id: 'L20-3',
        sentence: 'チケットが ある [ ? ]、いっしょに 行かない？',
        target: 'けど',
        options: ['けど', 'から', 'ので', 'のに'],
        translation: 'Mình có vé này, cùng đi không?',
        fullSentence: 'チケットが あるけど、いっしょに 行かない？',
        explanation: 'Bài 20: Trợ từ けど dùng trong văn nói thân mật để mở đầu câu chuyện (tương đương が).'
      }
    ]
  },
  {
    lesson: 21,
    title: 'Bài 21: Mẫu câu phỏng đoán, ý kiến (と思います, と言いました)',
    focus: '～と 思います (nghĩ rằng), ～と 言いました (nói rằng), でしょう',
    questions: [
      {
        id: 'L21-1',
        sentence: '日本は 物価が 高い [ ? ] 思います。',
        target: 'と',
        options: ['と', 'を', 'に', 'が'],
        translation: 'Tôi nghĩ rằng giá cả ở Nhật Bản đắt đỏ.',
        fullSentence: '日本は 物価が 高いと 思います。',
        explanation: 'Bài 21: Nêu ý kiến, suy nghĩ cá nhân: Thể thông thường + と 思います.'
      },
      {
        id: 'L21-2',
        sentence: '部長は 明日 休む [ ? ] 言いました。',
        target: 'と',
        options: ['と', 'に', 'を', 'は'],
        translation: 'Trưởng phòng đã nói rằng ngày mai ông ấy nghỉ.',
        fullSentence: '部長は 明日 休むと 言いました。',
        explanation: 'Bài 21: Trích dẫn lời nói gián tiếp: Câu trích dẫn (thể thông thường) + と 言いました.'
      },
      {
        id: 'L21-3',
        sentence: '明日は いい 天気 [ ? ]。',
        target: 'でしょう',
        options: ['でしょう', 'ですか', 'でした', 'だ'],
        translation: 'Ngày mai chắc trời sẽ đẹp nhỉ.',
        fullSentence: '明日は いい 天気でしょう。',
        explanation: 'Bài 21: Thể hiện sự phỏng đoán với mức độ chắc chắn khá cao (Thể thông thường + でしょう).'
      }
    ]
  },
  {
    lesson: 22,
    title: 'Bài 22: Mệnh đề bổ ngữ cho danh từ (Định ngữ)',
    focus: 'Mệnh đề bổ nghĩa cho N, Chủ ngữ trong mệnh đề phụ dùng が',
    questions: [
      {
        id: 'L22-1',
        sentence: '母 [ ? ] 作った 料理は とても おいしいです。',
        target: 'が',
        options: ['が', 'は', 'を', 'に'],
        translation: 'Món ăn mà mẹ tôi nấu rất ngon.',
        fullSentence: '母が 作った 料理は とても おいしいです。',
        explanation: 'Bài 22: Trong mệnh đề phụ bổ nghĩa cho danh từ, chủ ngữ của mệnh đề phụ bắt buộc dùng trợ từ が.'
      },
      {
        id: 'L22-2',
        sentence: 'あそこで 本を 読んで いる 人 [ ? ] 誰ですか。',
        target: 'は',
        options: ['は', 'が', 'を', 'に'],
        translation: 'Người đang đọc sách đằng kia là ai vậy?',
        fullSentence: 'あそこで 本を 読んで いる 人は 誰ですか。',
        explanation: 'Bài 22: "あそこで本を読んでいる人" là cụm danh từ làm chủ đề chính của câu nên đi với は.'
      },
      {
        id: 'L22-3',
        sentence: 'わたしは 朝ごはんを 食べる 時間 [ ? ] ありません。',
        target: 'が',
        options: ['が', 'を', 'に', 'は'],
        translation: 'Tôi không có thời gian để ăn bữa sáng.',
        fullSentence: 'わたしは 朝ごはんを 食べる 時間が ありません。',
        explanation: 'Bài 22: Đối tượng tồn tại đi với ありません dùng trợ từ が (時間が ありません).'
      }
    ]
  },
  {
    lesson: 23,
    title: 'Bài 23: Mẫu câu thời điểm (とき), Điều kiện tự nhiên (と)',
    focus: 'Vる / Vない / Vた + とき (khi), Vる + と (hễ mà)',
    questions: [
      {
        id: 'L23-1',
        sentence: '道を 渡る [ ? ]、右と 左を よく 見ます。',
        target: 'とき',
        options: ['とき', 'と', 'から', 'まで'],
        translation: 'Khi băng qua đường, hãy quan sát kỹ bên phải và bên trái.',
        fullSentence: '道を 渡る とき、右と 左を よく 見ます。',
        explanation: 'Bài 23: Diễn tả thời điểm hành động diễn ra: Động từ thể từ điển (Vる) + とき.'
      },
      {
        id: 'L23-2',
        sentence: 'この つまみを 右へ 回す [ ? ]、音が 大きく なります。',
        target: 'と',
        options: ['と', 'とき', 'なら', 'たら'],
        translation: 'Hễ vặn cái núm này sang phải thì âm thanh sẽ to lên.',
        fullSentence: 'この つまみを 右へ 回すと、音が 大きく なります。',
        explanation: 'Bài 23: Điều kiện tất yếu/kết quả hiển nhiên của máy móc, tự nhiên: V-nguyên dạng + と.'
      },
      {
        id: 'L23-3',
        sentence: '会社へ 来た [ ? ]、「おはようございます」と 言います。',
        target: 'とき',
        options: ['とき', 'と', 'ので', 'から'],
        translation: 'Khi đã đến công ty, chúng ta chào "Ohayou gozaimasu".',
        fullSentence: '会社へ 来た とき、「おはようございます」と 言います。',
        explanation: 'Bài 23: Hành động đến đã hoàn tất trước khi chào nên dùng V-thể quá khứ (Vた) + とき.'
      }
    ]
  },
  {
    lesson: 24,
    title: 'Bài 24: Cho - Nhận hành động (てくれます, てもらいます, てあげます)',
    focus: 'Vてくれます (ai làm cho tôi), Vてもらいます (nhận sự giúp đỡ), Vてあげます',
    questions: [
      {
        id: 'L24-1',
        sentence: '佐藤さんは わたし [ ? ] 傘を 貸して くれました。',
        target: 'に',
        options: ['に', 'が', 'で', 'を'],
        translation: 'Anh Sato đã cho tôi mượn cây dù.',
        fullSentence: '佐藤さんは わたしに 傘を 貸して くれました。',
        explanation: 'Bài 24: Ai đó làm việc gì cho tôi: Người làm は わたしに + Vてくれます.'
      },
      {
        id: 'L24-2',
        sentence: 'わたしは 鈴木さん [ ? ] 駅まで 送って もらいました。',
        target: 'に',
        options: ['に', 'を', 'で', 'へ'],
        translation: 'Tôi đã được anh Suzuki chở đến ga.',
        fullSentence: 'わたしは 鈴木さんに 駅まで 送って もらいました。',
        explanation: 'Bài 24: Nhận được sự giúp đỡ từ ai: わたしは + Người giúp に + Vてもらいました.'
      },
      {
        id: 'L24-3',
        sentence: '弟の 宿題を 手伝って [ ? ]。',
        target: 'あげました',
        options: ['あげました', 'もらいました', 'くれました', 'いただきました'],
        translation: 'Tôi đã giúp em trai làm bài tập về nhà.',
        fullSentence: '弟の 宿題を 手伝って あげました。',
        explanation: 'Bài 24: Người nói làm việc tốt giúp cho người dưới hoặc người khác: Vてあげました.'
      }
    ]
  },
  {
    lesson: 25,
    title: 'Bài 25: Điều kiện giả định (たら) & Nhượng bộ (ても)',
    focus: 'Vたら (nếu... thì), Vても (cho dù... cũng), いくら～ても',
    questions: [
      {
        id: 'L25-1',
        sentence: '雨が 降っ [ ? ]、出かけません。',
        target: 'たら',
        options: ['たら', 'ても', 'なら', 'と'],
        translation: 'Nếu trời mưa thì tôi sẽ không ra ngoài.',
        fullSentence: '雨が 降ったら、出かけません。',
        explanation: 'Bài 25: Điều kiện giả định trong tương lai: Động từ thể quá khứ (Vた) + ら (Vたら).'
      },
      {
        id: 'L25-2',
        sentence: '高く [ ? ]、この パソコンが 買いたいです。',
        target: 'ても',
        options: ['ても', 'たら', 'なら', 'と'],
        translation: 'Cho dù có đắt đi chăng nữa, tôi vẫn muốn mua chiếc máy tính này.',
        fullSentence: '高くても、この パソコンが 買いたいです。',
        explanation: 'Bài 25: Điều kiện nhượng bộ với tính từ đuôi い: Bỏ い thêm くても (cho dù... thì vẫn).'
      },
      {
        id: 'L25-3',
        sentence: '駅に 着い [ ? ]、電話して ください。',
        target: 'たら',
        options: ['たら', 'ても', 'と', 'なら'],
        translation: 'Sau khi đến ga thì hãy gọi điện thoại cho tôi nhé.',
        fullSentence: '駅に 着いたら、電話して ください。',
        explanation: 'Bài 25: Vたら còn dùng để chỉ hành động chắc chắn sẽ xảy ra trong tương lai ("Sau khi... thì hãy...").'
      }
    ]
  }
];

const CATEGORIES = [
  { id: 'all', label: 'Tất cả (19)' },
  { id: 'topic', label: 'Chủ ngữ & Chủ đề (は, が)' },
  { id: 'object', label: 'Tân ngữ & Hướng (を, へ)' },
  { id: 'time_place', label: 'Thời gian & Địa điểm (に, で)' },
  { id: 'connect', label: 'Liên kết & Sở hữu (と, も, の, や)' },
  { id: 'range', label: 'Phạm vi & So sánh (から, まで, より)' },
  { id: 'limit', label: 'Giới hạn (だけ, しか)' },
  { id: 'sentence_end', label: 'Cuối câu (か, ね, よ)' }
];

const ParticlesPage = ({ onNavigate }) => {
  // Navigation tabs: 'theory' (Bách khoa Trợ từ) | 'practice' (Luyện Điền Trợ Từ 25 Bài)
  const [activeTab, setActiveTab] = useState('practice');
  const [theoryCategory, setTheoryCategory] = useState('all');
  const [theorySearch, setTheorySearch] = useState('');

  // Practice state: Selected lesson (1 to 25 or 'all')
  const [selectedLesson, setSelectedLesson] = useState(1);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [streak, setStreak] = useState(0);

  // Filtered theory particles
  const filteredParticles = useMemo(() => {
    return PARTICLES_DATABASE.filter(p => {
      if (theoryCategory !== 'all' && p.category !== theoryCategory) return false;
      if (theorySearch.trim()) {
        const q = theorySearch.trim().toLowerCase();
        return (
          p.particle.toLowerCase().includes(q) ||
          p.romaji.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q) ||
          p.usage.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [theoryCategory, theorySearch]);

  // Current lesson curriculum
  const currentLessonData = useMemo(() => {
    if (selectedLesson === 'all') {
      const allQ = LESSONS_CURRICULUM.flatMap(l => l.questions);
      return {
        lesson: 'all',
        title: 'Tổng hợp Toàn bộ 25 Bài Minna no Nihongo N5',
        focus: 'Ôn luyện toàn diện toàn bộ 19 trợ từ và mẫu câu ngữ pháp cốt lõi N5',
        questions: allQ
      };
    }
    return LESSONS_CURRICULUM.find(l => l.lesson === selectedLesson) || LESSONS_CURRICULUM[0];
  }, [selectedLesson]);

  const activeQuestions = currentLessonData.questions || [];
  const currentQ = activeQuestions[practiceIndex] || activeQuestions[0];

  const handleSelectLesson = (num) => {
    sounds.playFlip();
    setSelectedLesson(num);
    setPracticeIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
  };

  const handleSelectOption = (opt) => {
    if (isAnswered) return;
    setSelectedAnswer(opt);
    setIsAnswered(true);

    const isCorrect = opt === currentQ.target;
    if (isCorrect) {
      sounds.playCorrect();
      setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
      setStreak(prev => prev + 1);
      awardGardenWater(2, 'Luyện trợ từ đúng');
    } else {
      sounds.playWrong();
      setScore(prev => ({ ...prev, wrong: prev.wrong + 1 }));
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    sounds.playFlip();
    setSelectedAnswer(null);
    setIsAnswered(false);
    if (practiceIndex < activeQuestions.length - 1) {
      setPracticeIndex(prev => prev + 1);
    } else {
      setPracticeIndex(0);
    }
  };

  const handleResetPractice = () => {
    sounds.playFlip();
    setPracticeIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore({ correct: 0, wrong: 0 });
    setStreak(0);
  };

  return (
    <div className="app-shell" style={{ maxWidth: '980px', margin: '0 auto', paddingBottom: '80px' }}>
      {/* ── 1. LUXURY PAGE HEADER ── */}
      <div className="p-3 p-md-4 rounded-4 bg-white border shadow-xs mb-3">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <div>
            <div className="d-inline-flex align-items-center gap-1.5 px-2.5 py-0.5 rounded-pill bg-purple-50 text-purple-700 border border-purple-200 mb-1.5">
              <Sparkles size={13} className="text-purple-600" />
              <span className="fw-bold" style={{ fontSize: '11px', letterSpacing: '0.04em' }}>CHUYÊN ĐỀ NGỮ PHÁP 25 BÀI N5</span>
            </div>
            <h1 className="fw-black text-navy-dark fs-4 mb-1" style={{ letterSpacing: '-0.02em' }}>
              Luyện Trợ Từ & Ngữ Pháp Chuẩn 25 Bài N5 (助詞)
            </h1>
            <p className="text-muted small mb-0" style={{ fontSize: '13px' }}>
              Thực chiến 25 bài Minna no Nihongo chuẩn mực: luyện điền trợ từ, giải thích chi tiết từng bài và tra cứu bách khoa.
            </p>
          </div>

          {/* Master 2 Tabs Switcher */}
          <div className="d-flex align-items-center p-1 bg-light rounded-pill border shadow-xs w-100 w-md-auto">
            <button
              type="button"
              onClick={() => { sounds.playFlip(); setActiveTab('practice'); }}
              className={`btn btn-sm rounded-pill py-1.5 px-3 fw-bold flex-fill transition-all ${
                activeTab === 'practice' ? 'btn-primary text-white shadow-xs' : 'text-muted border-0 bg-transparent'
              }`}
              style={{ fontSize: '12px' }}
            >
              <Zap size={14} className="me-1.5" />
              <span>Luyện 25 bài</span>
            </button>
            <button
              type="button"
              onClick={() => { sounds.playFlip(); setActiveTab('theory'); }}
              className={`btn btn-sm rounded-pill py-1.5 px-3 fw-bold flex-fill transition-all ${
                activeTab === 'theory' ? 'btn-primary text-white shadow-xs' : 'text-muted border-0 bg-transparent'
              }`}
              style={{ fontSize: '12px' }}
            >
              <BookOpen size={14} className="me-1.5" />
              <span>Bách khoa Trợ từ</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. TAB 1: 25 LESSONS DRILL STUDIO (PRACTICE) ── */}
      {activeTab === 'practice' && (
        <div className="practice-workspace animate-fade-in">
          {/* ── 1. ULTRA-COMPACT MODERN LESSON SELECTOR & STUDIO BAR ── */}
          <div className="p-2.5 p-sm-3 rounded-4 bg-white border shadow-xs mb-2.5">
            {/* Row 1: Dropdown + Quick Prev/Next Lesson Nav */}
            <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
              <div className="d-flex align-items-center gap-1.5 flex-grow-1 min-w-0" style={{ maxWidth: '480px' }}>
                <Bookmark size={15} className="text-primary flex-shrink-0" />
                <select
                  value={selectedLesson}
                  onChange={(e) => handleSelectLesson(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                  className="form-select form-select-sm rounded-pill fw-bold border bg-white shadow-xs text-truncate"
                  style={{ fontSize: '12.5px', borderColor: 'var(--slate-200)', height: '34px' }}
                >
                  <option value="all">🌟 Tất cả 25 Bài N5 (75 câu hỏi chuẩn)</option>
                  {LESSONS_CURRICULUM.map(l => (
                    <option key={l.lesson} value={l.lesson}>
                      {l.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Prev / Next & Reset Controls */}
              <div className="d-flex align-items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  disabled={selectedLesson === 'all'}
                  onClick={() => {
                    const prevL = typeof selectedLesson === 'number'
                      ? (selectedLesson > 1 ? selectedLesson - 1 : 25)
                      : 1;
                    handleSelectLesson(prevL);
                  }}
                  className="btn btn-sm btn-light border rounded-circle p-1 d-flex align-items-center justify-content-center text-dark"
                  style={{ width: '32px', height: '32px' }}
                  title="Bài trước"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  disabled={selectedLesson === 'all'}
                  onClick={() => {
                    const nextL = typeof selectedLesson === 'number'
                      ? (selectedLesson < 25 ? selectedLesson + 1 : 1)
                      : 1;
                    handleSelectLesson(nextL);
                  }}
                  className="btn btn-sm btn-light border rounded-circle p-1 d-flex align-items-center justify-content-center text-dark"
                  style={{ width: '32px', height: '32px' }}
                  title="Bài tiếp theo"
                >
                  <ChevronRight size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleResetPractice}
                  className="btn btn-sm btn-light border rounded-pill px-2.5 py-1 text-muted d-flex align-items-center gap-1"
                  style={{ height: '32px', fontSize: '11.5px' }}
                  title="Làm lại từ đầu"
                >
                  <RotateCcw size={12} />
                  <span className="d-none d-sm-inline">Làm lại</span>
                </button>
              </div>
            </div>

            {/* Row 2: Horizontal Scrolling Snap Track (25 Lesson Quick Pills) */}
            <div
              className="d-flex align-items-center gap-1 overflow-x-auto pb-1 mb-2 no-scrollbar"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              <button
                type="button"
                onClick={() => handleSelectLesson('all')}
                className={`btn btn-sm py-1 px-2.5 rounded-pill fw-bold text-xs flex-shrink-0 transition-all ${
                  selectedLesson === 'all'
                    ? 'btn-primary shadow-xs'
                    : 'btn-light text-secondary border'
                }`}
                style={{ fontSize: '11px' }}
              >
                Tất cả
              </button>
              {Array.from({ length: 25 }, (_, i) => i + 1).map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleSelectLesson(num)}
                  className={`btn btn-sm py-1 px-2 rounded-pill fw-bold font-monospace flex-shrink-0 transition-all ${
                    selectedLesson === num
                      ? 'btn-primary text-white shadow-xs'
                      : 'btn-light text-secondary border'
                  }`}
                  style={{ minWidth: '34px', fontSize: '11.5px' }}
                >
                  {num < 10 ? `0${num}` : num}
                </button>
              ))}
            </div>

            {/* Row 3: Active Focus Banner & Inline Live Metrics Strip */}
            <div
              className="p-2 rounded-3 border d-flex align-items-center justify-content-between gap-1.5"
              style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}
            >
              <div className="min-w-0 flex-grow-1 pe-1">
                <span className="fw-bold text-navy-dark small text-truncate d-block" style={{ fontSize: '12px' }}>
                  {currentLessonData.title}
                </span>
                <span className="text-muted small text-truncate d-block" style={{ fontSize: '11px' }}>
                  🎯 {currentLessonData.focus}
                </span>
              </div>

              {/* Compact Metrics Pills */}
              <div className="d-flex align-items-center gap-1 flex-shrink-0">
                <span className="badge bg-primary text-white fw-bold px-2 py-0.5" style={{ fontSize: '10.5px' }}>
                  {practiceIndex + 1}/{activeQuestions.length}
                </span>
                <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-200 fw-bold px-2 py-0.5" style={{ fontSize: '10.5px' }}>
                  ✓{score.correct} ✗{score.wrong}
                </span>
              </div>
            </div>

            {/* Micro Progress Line */}
            <div className="mt-2">
              <Progress
                value={((practiceIndex + 1) / activeQuestions.length) * 100}
                color="primary"
                style={{ height: '4px', borderRadius: '4px' }}
              />
            </div>
          </div>

          {/* ── 2. INTERACTIVE DRILL STUDIO CARD ── */}
          <div className="p-3 p-md-4 rounded-4 shadow-sm bg-white border mb-2.5 text-center">
            {/* Top Row: Tag & Audio button */}
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="badge bg-light text-secondary border fw-bold px-2 py-0.5" style={{ fontSize: '11px' }}>
                Minna no Nihongo N5
              </span>
              <button
                type="button"
                onClick={() => speakJapanese(currentQ.fullSentence)}
                className="btn btn-sm btn-light rounded-circle border p-1 text-primary audio-btn d-flex align-items-center justify-content-center"
                style={{ width: 32, height: 32 }}
                title="Nghe câu hoàn chỉnh chuẩn Tokyo"
              >
                <Volume2 size={15} />
              </button>
            </div>

            {/* Japanese Question Sentence with glowing blank slot */}
            <h2 className="fw-black text-navy-dark font-monospace mb-2" style={{ fontSize: 'clamp(1.35rem, 4.5vw, 2rem)', letterSpacing: '0.02em', lineHeight: '1.4' }}>
              {isAnswered ? (
                <span>
                  {currentQ.sentence.split('[ ? ]')[0]}
                  <span
                    className="px-2.5 py-0.5 rounded-3 mx-1 text-white fw-black shadow-xs d-inline-block"
                    style={{
                      backgroundColor: selectedAnswer === currentQ.target ? '#10b981' : '#ef4444'
                    }}
                  >
                    {currentQ.target}
                  </span>
                  {currentQ.sentence.split('[ ? ]')[1]}
                </span>
              ) : (
                <span>
                  {currentQ.sentence.split('[ ? ]')[0]}
                  <span
                    className="badge font-monospace px-2.5 py-1 mx-1 shadow-xs"
                    style={{
                      background: '#f5f3ff',
                      color: '#4f46e5',
                      border: '2px dashed #818cf8',
                      fontSize: 'clamp(1rem, 3.5vw, 1.4rem)'
                    }}
                  >
                    ?
                  </span>
                  {currentQ.sentence.split('[ ? ]')[1]}
                </span>
              )}
            </h2>

            {/* Vietnamese Meaning Prompt */}
            <p className="text-secondary small mb-3 mb-md-4 fw-medium" style={{ fontSize: '13px' }}>
              Ý nghĩa câu: <strong className="text-dark">"{currentQ.translation}"</strong>
            </p>

            {/* 4 ABCD Particle Options (Mobile-friendly 2x2 grid with compact height) */}
            <div className="row g-2 max-w-md mx-auto mb-3" style={{ maxWidth: '520px' }}>
              {currentQ.options.map((opt, idx) => {
                const letters = ['A', 'B', 'C', 'D'];
                const isCorrect = opt === currentQ.target;
                const isSelected = opt === selectedAnswer;

                let btnClass = 'btn-outline-secondary bg-white text-dark border-slate-200';
                if (isAnswered) {
                  if (isCorrect) {
                    btnClass = 'btn-success text-white shadow-xs border-success';
                  } else if (isSelected) {
                    btnClass = 'btn-danger text-white shadow-xs border-danger';
                  } else {
                    btnClass = 'btn-light text-muted border opacity-50';
                  }
                }

                return (
                  <div className="col-6" key={opt}>
                    <button
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(opt)}
                      className={`btn w-100 py-2 px-2.5 rounded-3 fw-bold font-monospace transition-all d-flex align-items-center justify-content-between ${btnClass}`}
                      style={{ height: '44px', fontSize: '16px' }}
                    >
                      <span className="small text-muted font-sans fw-bold" style={{ fontSize: '11px' }}>
                        {letters[idx]}.
                      </span>
                      <span className="fs-5">{opt}</span>
                      {isAnswered && isCorrect && <Check size={16} className="text-white" />}
                      {isAnswered && isSelected && !isCorrect && <XCircle size={16} className="text-white" />}
                      {!isAnswered && <span style={{ width: 16 }} />}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Explanation & Feedback (Slide up with smooth micro-animation) */}
            {isAnswered && (
              <div
                className="p-3 rounded-3 text-start animate-slide-up border mb-2.5"
                style={{
                  backgroundColor: selectedAnswer === currentQ.target ? '#f0fdf4' : '#fef2f2',
                  borderColor: selectedAnswer === currentQ.target ? '#bbf7d0' : '#fecaca'
                }}
              >
                <div className="d-flex align-items-center gap-2 mb-1">
                  {selectedAnswer === currentQ.target ? (
                    <>
                      <CheckCircle2 size={16} className="text-success flex-shrink-0" />
                      <strong className="text-success small">Chính xác! (+2 Nước Vườn cây)</strong>
                    </>
                  ) : (
                    <>
                      <XCircle size={16} className="text-danger flex-shrink-0" />
                      <strong className="text-danger small">
                        Chưa chính xác! Đáp án đúng: <span className="badge bg-success ms-1">{currentQ.target}</span>
                      </strong>
                    </>
                  )}
                </div>
                <p className="text-dark small mb-0" style={{ fontSize: '12px', lineHeight: '1.5' }}>
                  💡 <strong>Quy tắc bài học:</strong> {currentQ.explanation}
                </p>
              </div>
            )}

            {/* Action Button: Next Question (Zero Arrows: ChevronRight instead of ArrowRight) */}
            {isAnswered && (
              <div className="d-flex justify-content-center">
                <Button
                  color="primary"
                  onClick={handleNextQuestion}
                  className="rounded-pill px-4 py-2 fw-bold shadow-xs d-flex align-items-center gap-1.5 hover-lift"
                  style={{ fontSize: '13px' }}
                >
                  <span>
                    {practiceIndex < activeQuestions.length - 1 ? 'Câu kế tiếp' : 'Hoàn thành bài này'}
                  </span>
                  <ChevronRight size={15} />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 3. TAB 2: PARTICLES ENCYCLOPEDIA (THEORY & COMPARISONS) ── */}
      {activeTab === 'theory' && (
        <div className="theory-workspace animate-fade-in">
          {/* Search & Category Filter Bar */}
          <div className="p-3 rounded-4 bg-white border shadow-xs mb-3">
            <div className="d-flex flex-column flex-sm-row gap-2.5 mb-2.5">
              <div className="d-flex align-items-center bg-light border rounded-pill px-3 py-1 flex-grow-1">
                <Search size={16} className="text-muted me-2" />
                <input
                  type="text"
                  placeholder="Tìm kiếm trợ từ hoặc ý nghĩa (VD: に, で, thời gian, nơi chốn...)"
                  className="form-control form-control-sm border-0 bg-transparent shadow-none px-0"
                  value={theorySearch}
                  onChange={(e) => setTheorySearch(e.target.value)}
                  style={{ fontSize: '13px' }}
                />
                {theorySearch && (
                  <button
                    type="button"
                    onClick={() => setTheorySearch('')}
                    className="btn btn-sm p-0 text-muted border-0 bg-transparent"
                  >
                    <XCircle size={15} />
                  </button>
                )}
              </div>
            </div>

            {/* Category Pills */}
            <div className="d-flex align-items-center gap-1.5 overflow-x-auto no-scrollbar pb-1" style={{ WebkitOverflowScrolling: "touch" }}>
              {CATEGORIES.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => { sounds.playFlip(); setTheoryCategory(c.id); }}
                  className={`btn btn-sm py-1 px-2.5 rounded-pill fw-semibold text-xs transition-all ${
                    theoryCategory === c.id
                      ? 'btn-primary shadow-xs'
                      : 'btn-outline-secondary bg-white text-dark border-slate-200'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Comparison Highlights Banner */}
          <div className="p-3 rounded-4 mb-3 border shadow-xs" style={{ background: '#f5f3ff', borderColor: '#ddd6fe' }}>
            <div className="d-flex align-items-center gap-2 mb-2">
              <Info size={16} className="text-purple-600" />
              <h6 className="fw-bold mb-0 text-purple-900 fs-6">3 Bí Quyết Phân Biệt Trợ Từ Hay Nhầm Nhất N5</h6>
            </div>
            <Row className="g-2.5">
              <Col xs={12} md={4}>
                <div className="p-2.5 rounded-3 bg-white border shadow-xs h-100">
                  <div className="fw-bold text-dark small mb-1">
                    <span className="badge bg-primary me-1">は</span> vs <span className="badge bg-danger me-1">が</span>
                  </div>
                  <p className="text-muted mb-0" style={{ fontSize: '11.5px', lineHeight: '1.45' }}>
                    <strong>は</strong> nhấn mạnh thông tin vế <em>sau</em> (chủ đề đã biết). <strong>が</strong> nhấn mạnh đối tượng <em>trước</em> (thông tin mới, hiện tượng tự nhiên).
                  </p>
                </div>
              </Col>
              <Col xs={12} md={4}>
                <div className="p-2.5 rounded-3 bg-white border shadow-xs h-100">
                  <div className="fw-bold text-dark small mb-1">
                    <span className="badge bg-success me-1">に</span> vs <span className="badge bg-warning text-dark me-1">で</span>
                  </div>
                  <p className="text-muted mb-0" style={{ fontSize: '11.5px', lineHeight: '1.45' }}>
                    <strong>に</strong> chỉ nơi <em>tồn tại</em> tĩnh (います, あります) hoặc <em>đích đến</em>. <strong>で</strong> chỉ nơi <em>hành động</em> diễn ra (ăn, học, chơi).
                  </p>
                </div>
              </Col>
              <Col xs={12} md={4}>
                <div className="p-2.5 rounded-3 bg-white border shadow-xs h-100">
                  <div className="fw-bold text-dark small mb-1">
                    <span className="badge bg-info me-1">だけ</span> vs <span className="badge bg-secondary me-1">しか</span>
                  </div>
                  <p className="text-muted mb-0" style={{ fontSize: '11.5px', lineHeight: '1.45' }}>
                    <strong>だけ</strong> luôn đi với vị ngữ <em>Khẳng định</em>. <strong>しか</strong> luôn bắt buộc đi với vị ngữ <em>Phủ định</em> mang sắc thái tiếc nuối.
                  </p>
                </div>
              </Col>
            </Row>
          </div>

          {/* Cards Grid */}
          <Row className="g-3">
            {filteredParticles.map(p => (
              <Col xs={12} md={6} key={p.particle}>
                <Card className="border rounded-4 shadow-xs h-100 bg-white hover-shadow transition-all" style={{ borderColor: 'var(--slate-200)' }}>
                  <CardBody className="p-3 p-md-3.5 d-flex flex-column">
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <span
                          className="d-inline-flex align-items-center justify-content-center fw-black rounded-circle font-monospace text-white"
                          style={{
                            width: 42,
                            height: 42,
                            fontSize: '22px',
                            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                            boxShadow: '0 4px 10px rgba(79, 70, 229, 0.25)'
                          }}
                        >
                          {p.particle}
                        </span>
                        <div>
                          <h6 className="fw-bold text-navy-dark mb-0 fs-6">{p.title}</h6>
                          <span className="text-muted font-monospace small" style={{ fontSize: '11.5px' }}>
                            Phiên âm: /{p.romaji}/
                          </span>
                        </div>
                      </div>
                      <Badge color="light" pill className="text-secondary border fw-bold" style={{ fontSize: '10.5px' }}>
                        {p.badge}
                      </Badge>
                    </div>

                    {/* Formula */}
                    <div className="p-2 rounded-3 bg-slate-50 border border-slate-200 mb-2 font-monospace small text-dark fw-semibold" style={{ fontSize: '12px' }}>
                      <span className="text-muted me-1">Cấu trúc:</span>
                      <span className="text-primary">{p.formula}</span>
                    </div>

                    {/* Usage */}
                    <p className="text-secondary small mb-2.5 flex-grow-1" style={{ fontSize: '12.5px', lineHeight: '1.5' }}>
                      {p.usage}
                    </p>

                    {/* Notes (if any) */}
                    {p.notes && (
                      <div className="p-2 rounded-3 bg-amber-50 border border-amber-200 text-amber-900 small mb-2.5" style={{ fontSize: '11.5px' }}>
                        💡 <strong>Lưu ý:</strong> {p.notes}
                      </div>
                    )}

                    {/* Sample Sentences */}
                    <div className="border-top pt-2">
                      <small className="text-muted fw-bold d-block mb-1.5" style={{ fontSize: '11px', letterSpacing: '0.04em' }}>
                        MẪU CÂU TIÊU BIỂU:
                      </small>
                      <div className="d-flex flex-column gap-1.5">
                        {p.examples.map((ex, idx) => (
                          <div key={idx} className="p-2 rounded-3 bg-light border d-flex justify-content-between align-items-center gap-2">
                            <div className="min-w-0">
                              <span className="fw-bold text-navy-dark font-monospace d-block" style={{ fontSize: '13px' }}>
                                {ex.jp}
                              </span>
                              <span className="text-muted small d-block" style={{ fontSize: '11.5px' }}>
                                {ex.vi}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => speakJapanese(ex.jp)}
                              className="btn btn-sm btn-light rounded-circle border p-1 text-primary audio-btn flex-shrink-0"
                              style={{ width: 28, height: 28 }}
                              title="Nghe phát âm chuẩn Tokyo"
                            >
                              <Volume2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}
    </div>
  );
};

export default ParticlesPage;
