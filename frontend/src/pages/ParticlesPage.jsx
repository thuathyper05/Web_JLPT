import React, { useState, useMemo } from 'react';
import {
  Container, Row, Col, Badge, Card, CardBody, Button,
  Progress, Input, ListGroup, ListGroupItem
} from 'reactstrap';
import {
  Compass, BookOpen, CheckCircle2, XCircle, Volume2, Sparkles,
  ArrowRight, RotateCcw, HelpCircle, Layers, Check, ChevronRight,
  Zap, Award, Search, Info
} from 'lucide-react';
import { speakJapanese } from '../services/api';
import { sounds } from '../services/sounds';
import { awardGardenWater } from '../services/gardenRewards';

// ── 1. COMPREHENSIVE PARTICLES DATABASE (N5 CURRICULUM) ──
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
      { jp: 'わたしは 日本料理が 好きです。', romaji: 'Watashi wa nihon ryouri ga suki desu.', vi: 'Tôi thích món ăn Nhật Bản.' },
      { jp: 'だれが 来ますか。', romaji: 'Dare ga kimasu ka.', vi: 'Ai sẽ đến vậy? (Nghi vấn từ đi với が).' }
    ]
  },
  {
    particle: 'を',
    romaji: 'o / wo',
    category: 'object',
    title: 'Trợ từ Tân ngữ Trực tiếp & Điểm rời khỏi',
    badge: 'Cốt Lõi',
    usage: 'Chỉ tân ngữ chịu sự tác động trực tiếp của ngoại động từ (ăn cơm, uống nước). Ngoài ra còn chỉ nơi chốn rời khỏi (xuống xe, rời nhà) hoặc không gian băng qua (đi dạo công viên, bay qua bầu trời).',
    formula: 'Danh từ + を + Ngoại động từ',
    notes: 'Viết là を nhưng phát âm là "o". Không dùng を với tự động từ.',
    examples: [
      { jp: 'ごはんを 食べます。', romaji: 'Gohan o tabemasu.', vi: 'Ăn cơm.' },
      { jp: '電車を 降ります。', romaji: 'Densha o orimasu.', vi: 'Bước xuống tàu điện (điểm rời khỏi).' },
      { jp: '公園を 散歩します。', romaji: 'Kouen o sanpo shimasu.', vi: 'Đi dạo trong công viên (không gian băng qua).' }
    ]
  },
  {
    particle: 'に',
    romaji: 'ni',
    category: 'time_place',
    title: 'Trợ từ Thời gian, Điểm đến, Nơi tồn tại & Đối tượng',
    badge: 'Đa Năng',
    usage: '1. Mốc thời gian cụ thể có con số (7時に, 5月に).\n2. Điểm đến của hành động (学校に行きます).\n3. Nơi tồn tại của sự vật (部屋に います/あります).\n4. Đối tượng tiếp nhận hành động (友だちに 会います, 母に 手紙を送ります).\n5. Mục đích hành động (V-bỏます + に 行きます).',
    formula: 'Thời gian cụ thể / Nơi chốn / Người + に',
    notes: 'Nếu thời gian không có con số (hôm nay, ngày mai, tuần sau...), KHÔNG dùng に.',
    examples: [
      { jp: '毎朝 7時に 起きます。', romaji: 'Maiasa shichi-ji ni okimasu.', vi: 'Mỗi sáng tôi thức dậy lúc 7 giờ.' },
      { jp: '机の上に 本があります。', romaji: 'Tsukue no ue ni hon ga arimasu.', vi: 'Trên bàn có quyển sách.' },
      { jp: '日本へ 勉強に 行きます。', romaji: 'Nihon e benkyou ni ikimasu.', vi: 'Tôi đi Nhật để du học (mục đích hành động).' }
    ]
  },
  {
    particle: 'で',
    romaji: 'de',
    category: 'time_place',
    title: 'Trợ từ Địa điểm hành động, Phương tiện & Công cụ',
    badge: 'Đa Năng',
    usage: '1. Địa điểm nơi hành động diễn ra (thư viện đọc sách, nhà ăn cơm).\n2. Phương tiện đi lại (đi bằng xe buýt, máy bay).\n3. Công cụ, cách thức thực hiện (viết bằng bút, ăn bằng đũa, nói bằng tiếng Nhật).\n4. Nguyên nhân, lý do khách quan (nghỉ học vì cảm cúm).',
    formula: 'Địa điểm / Phương tiện / Công cụ + で + Hành động',
    notes: 'Phân biệt: "Nơi TỒN TẠI" dùng に (ngồi yên), còn "Nơi HÀNH ĐỘNG" dùng で (hoạt động). Đi bộ (歩いて) không dùng で.',
    examples: [
      { jp: '図書館で 本を 読みます。', romaji: 'Toshokan de hon o yomimasu.', vi: 'Đọc sách ở thư viện.' },
      { jp: 'バスで 会社へ 行きます。', romaji: 'Basu de kaisha e ikimasu.', vi: 'Đi đến công ty bằng xe buýt.' },
      { jp: 'はしで ごはんを 食べます。', romaji: 'Hashi de gohan o tabemasu.', vi: 'Ăn cơm bằng đũa.' }
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
    notes: 'Viết là へ (he) nhưng phát âm là "e". へ nhấn mạnh PHƯƠNG HƯỚNG tiến về phía trước, còn に nhấn mạnh ĐÍCH ĐẾN chạm tới.',
    examples: [
      { jp: '来週 日本へ 行きます。', romaji: 'Raishuu nihon e ikimasu.', vi: 'Tuần sau tôi sẽ đi sang Nhật Bản.' },
      { jp: '家へ 帰ります。', romaji: 'Uchi e kaerimasu.', vi: 'Tôi trở về nhà.' }
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
    notes: 'Khác với や (liệt kê một vài cái tiêu biểu), と liệt kê toàn bộ không thiếu cái nào.',
    examples: [
      { jp: 'パンと 卵を 買いました。', romaji: 'Pan to tamago o kaimashita.', vi: 'Tôi đã mua bánh mì và trứng (chỉ mua đúng 2 thứ này).' },
      { jp: '友だちと 映画を 見ます。', romaji: 'Tomodachi to eiga o mimasu.', vi: 'Xem phim cùng với bạn.' }
    ]
  },
  {
    particle: 'も',
    romaji: 'mo',
    category: 'connect',
    title: 'Trợ từ Đồng nhất ("Cũng") & Phủ định hoàn toàn',
    badge: 'Cốt Lõi',
    usage: '1. Biểu thị sự tương đồng, thay thế cho は/が/を mang nghĩa "cũng".\n2. Kết hợp với nghi vấn từ và đuôi phủ định để phủ định 100% ("không... một ai/cái gì/nơi nào").',
    formula: 'Danh từ + も / Nghi vấn từ + も + Phủ định',
    notes: 'Khi dùng も, nó sẽ nuốt luôn các trợ từ は, が, を (VD: わたしも, không nói わたしはも).',
    examples: [
      { jp: 'わたしも 学生です。', romaji: 'Watashi mo gakusei desu.', vi: 'Tôi cũng là học sinh.' },
      { jp: 'きのう どこも 行きませんでした。', romaji: 'Kinou doko mo ikimasendeshita.', vi: 'Hôm qua tôi chẳng đi bất cứ đâu cả.' }
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
      { jp: '時間が ありませんから、タクシーで 行きましょう。', romaji: 'Jikan ga arimasen kara, takushii de ikimashou.', vi: 'Vì không có thời gian nên hãy đi taxi nhé.' }
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
    notes: 'Phân biệt với までに (hạn chót hoàn thành). まで chỉ hành động kéo dài liên tục đến thời điểm đó.',
    examples: [
      { jp: '午後5時まで 勉強します。', romaji: 'Gogo go-ji made benkyou shimasu.', vi: 'Tôi học bài đến tận 5 giờ chiều.' },
      { jp: '駅まで 歩いて行きます。', romaji: 'Eki made aruite ikimasu.', vi: 'Tôi đi bộ đến tận ga.' }
    ]
  },
  {
    particle: 'より',
    romaji: 'yori',
    category: 'range',
    title: 'Trợ từ So sánh hơn ("Hơn")',
    badge: 'So Sánh',
    usage: 'Đứng sau đối tượng được đem ra làm mốc so sánh ("so với... thì... hơn").',
    formula: 'Danh từ A は Danh từ B + より + Tính từ です',
    notes: 'A là đối tượng nổi trội hơn B.',
    examples: [
      { jp: '新幹線は バスより 速いです。', romaji: 'Shinkansen wa basu yori hayai desu.', vi: 'Tàu Shinkansen thì nhanh hơn xe buýt.' },
      { jp: '日本は ベトナムより 寒いです。', romaji: 'Nihon wa betonamu yori samui desu.', vi: 'Nhật Bản thì lạnh hơn Việt Nam.' }
    ]
  },
  {
    particle: 'の',
    romaji: 'no',
    category: 'connect',
    title: 'Trợ từ Sở hữu, Xuất xứ & Bổ nghĩa Danh từ ("Của")',
    badge: 'Cốt Lõi',
    usage: 'Nối hai danh từ với nhau: quan hệ sở hữu (sách của tôi), xuất xứ (xe của Nhật), hoặc thuộc tính giải thích cho danh từ chính.',
    formula: 'Danh từ 1 + の + Danh từ 2',
    notes: 'Trong tiếng Nhật, danh từ bổ nghĩa đứng TRƯỚC, danh từ chính đứng SAU (ngược với tiếng Việt).',
    examples: [
      { jp: 'これは わたしの 本です。', romaji: 'Kore wa watashi no hon desu.', vi: 'Đây là cuốn sách của tôi.' },
      { jp: '日本の カメラを 買いました。', romaji: 'Nihon no kamera o kaimashita.', vi: 'Tôi đã mua máy ảnh của Nhật Bản.' }
    ]
  },
  {
    particle: 'や',
    romaji: 'ya',
    category: 'connect',
    title: 'Trợ từ Liệt kê Tiêu biểu ("Nào là... và...")',
    badge: 'Nâng Cao',
    usage: 'Nối các danh từ mang tính chất liệt kê đại diện (còn những thứ khác nữa nhưng không kể hết). Thường kết hợp với など ở cuối.',
    formula: 'Danh từ 1 + や + Danh từ 2 (+ など)',
    notes: 'Khác với と (liệt kê hết), や ám chỉ vẫn còn các sự vật khác chưa liệt kê.',
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
      { jp: 'りんごや みかんなどを 食べました。', romaji: 'Ringo ya mikan nado o tabemashita.', vi: 'Tôi đã ăn nào là táo, quýt,... vân vân.' }
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
    notes: 'Phân biệt: だけ đi với khẳng định. しか đi với phủ định.',
    examples: [
      { jp: '休みは 日曜日だけです。', romaji: 'Yasumi wa nichiyoubi dake desu.', vi: 'Ngày nghỉ chỉ có duy nhất chủ nhật.' },
      { jp: '1人だけ 来ました。', romaji: 'Hitori dake kimashita.', vi: 'Chỉ có 1 người tới.' }
    ]
  },
  {
    particle: 'しか',
    romaji: 'shika',
    category: 'limit',
    title: 'Trợ từ Giới hạn Phủ định ("Chỉ vỏn vẹn / Không gì ngoài")',
    badge: 'Giới Hạn',
    usage: 'Nhấn mạnh sự ít ỏi, thiếu thốn mang sắc thái tiếc nuối ("chỉ còn có ngần này thôi"). Luôn luôn đi kèm đuôi PHỦ ĐỊNH.',
    formula: 'Danh từ / Số từ + しか + Động từ PHỦ ĐỊNH',
    notes: 'QUAN TRỌNG: Cứ thấy しか thì đuôi câu BẮT BUỘC phải là dạng phủ định (ません / ない).',
    examples: [
      { jp: '財布に 100円しか ありません。', romaji: 'Saifu ni hyaku-en shika arimasen.', vi: 'Trong ví chỉ vỏn vẹn có 100 yên (không đủ).' },
      { jp: 'ひらがなしか 書けません。', romaji: 'Hiragana shika kakemasen.', vi: 'Tôi chỉ viết được mỗi Hiragana (Kanji chưa viết được).' }
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
    notes: 'Khi đặt sau nghi vấn từ tạo thành đại từ bất định (だれか: ai đó, なにか: cái gì đó, どこか: nơi nào đó).',
    examples: [
      { jp: 'これはいったい 何ですか。', romaji: 'Kore wa ittai nan desu ka.', vi: 'Cái này rốt cuộc là cái gì vậy?' },
      { jp: 'コーヒーか 紅茶を 飲みますか。', romaji: 'Koohii ka koucha o nomimasu ka.', vi: 'Bạn uống cà phê hay là trà?' }
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
    notes: 'Thể hiện sự thân thiện, gần gũi trong giao tiếp thường ngày.',
    examples: [
      { jp: 'きょうは いい天気ですね。', romaji: 'Kyou wa ii tenki desu ne.', vi: 'Hôm nay trời đẹp nhỉ!' },
      { jp: 'この料理は 美味しいですね。', romaji: 'Kono ryouri wa oishii desu ne.', vi: 'Món này ngon thật đấy nhỉ!' }
    ]
  },
  {
    particle: 'よ',
    romaji: 'yo',
    category: 'sentence_end',
    title: 'Trợ từ Cuối câu Nhấn mạnh & Cung cấp Thông tin ("... đấy / nhé")',
    badge: 'Cuối Câu',
    usage: 'Đặt ở cuối câu để nhấn mạnh điều người nói biết mà người nghe chưa biết, hoặc nhắc nhở, khẳng định chắc nịch.',
    formula: 'Câu hoàn chỉnh + よ',
    notes: 'Dùng khi muốn truyền đạt thông tin mới cho đối phương.',
    examples: [
      { jp: 'あの映画は とても 面白いですよ。', romaji: 'Ano eiga wa totemo omoshiroi desu yo.', vi: 'Bộ phim kia hay lắm đấy nhé!' },
      { jp: 'もう 12時ですよ。寝ましょう。', romaji: 'Mou juuni-ji desu yo. Nemashou.', vi: 'Đã 12 giờ rồi đấy nhé. Đi ngủ thôi!' }
    ]
  }
];

// ── 2. CURATED JLPT N5 PRACTICE QUESTIONS (35 DRILL SENTENCES) ──
const PRACTICE_QUESTIONS = [
  {
    id: 1,
    sentence: 'わたし [ ? ] ベトナム人です。',
    target: 'は',
    options: ['は', 'が', 'を', 'に'],
    translation: 'Tôi là người Việt Nam.',
    fullSentence: 'わたしは ベトナム人です。',
    explanation: 'Dùng trợ từ は để xác định chủ đề chính của câu (Tôi thì là người Việt Nam).',
    category: 'topic'
  },
  {
    id: 2,
    sentence: '毎朝 7時 [ ? ] 起きます。',
    target: 'に',
    options: ['で', 'に', 'を', 'へ'],
    translation: 'Mỗi sáng tôi thức dậy lúc 7 giờ.',
    fullSentence: '毎朝 7時に 起きます。',
    explanation: 'Điểm mốc thời gian có con số cụ thể (7時) bắt buộc dùng trợ từ に.',
    category: 'time_place'
  },
  {
    id: 3,
    sentence: '図書館 [ ? ] 本を 読みます。',
    target: 'で',
    options: ['に', 'で', 'へ', 'を'],
    translation: 'Tôi đọc sách ở thư viện.',
    fullSentence: '図書館で 本を 読みます。',
    explanation: 'Địa điểm nơi diễn ra HÀNH ĐỘNG (đọc sách - 読みます) dùng trợ từ で.',
    category: 'time_place'
  },
  {
    id: 4,
    sentence: '机の上に 本 [ ? ] あります。',
    target: 'が',
    options: ['を', 'が', 'は', 'で'],
    translation: 'Trên bàn có quyển sách.',
    fullSentence: '机の上に 本が あります。',
    explanation: 'Chủ thể tồn tại đi với động từ あります/います luôn đi với trợ từ が.',
    category: 'topic'
  },
  {
    id: 5,
    sentence: 'ごはん [ ? ] 食べます。',
    target: 'を',
    options: ['を', 'が', 'に', 'で'],
    translation: 'Tôi ăn cơm.',
    fullSentence: 'ごはんを 食べます。',
    explanation: 'Cơm là đối tượng chịu sự tác động trực tiếp của ngoại động từ ăn (食べます), dùng を.',
    category: 'object'
  },
  {
    id: 6,
    sentence: 'バス [ ? ] 会社へ 行きます。',
    target: 'で',
    options: ['に', 'で', 'を', 'から'],
    translation: 'Tôi đi đến công ty bằng xe buýt.',
    fullSentence: 'バスで 会社へ 行きます。',
    explanation: 'Phương tiện giao thông dùng để di chuyển dùng trợ từ で (bằng xe buýt).',
    category: 'time_place'
  },
  {
    id: 7,
    sentence: '来週 日本 [ ? ] 行きます。',
    target: 'へ',
    options: ['へ', 'で', 'を', 'と'],
    translation: 'Tuần sau tôi sẽ đi Nhật Bản.',
    fullSentence: '来週 日本へ 行きます。',
    explanation: 'Phương hướng di chuyển tới địa điểm đích đến (nhật bản) đi với 行きます dùng へ (hoặc に).',
    category: 'object'
  },
  {
    id: 8,
    sentence: '友だち [ ? ] 映画を 見ました。',
    target: 'と',
    options: ['と', 'に', 'で', 'を'],
    translation: 'Tôi đã xem phim cùng với bạn.',
    fullSentence: '友だちと 映画を 見ました。',
    explanation: 'Chỉ đối tượng cùng thực hiện hành động ("làm gì cùng với ai") dùng trợ từ と.',
    category: 'connect'
  },
  {
    id: 9,
    sentence: 'わたし [ ? ] 学生です。',
    target: 'も',
    options: ['も', 'と', 'で', 'に'],
    translation: 'Tôi cũng là học sinh.',
    fullSentence: 'わたしも 学生です。',
    explanation: 'Biểu thị sự tương đồng ("tôi cũng vậy") dùng trợ từ も thay thế cho は.',
    category: 'connect'
  },
  {
    id: 10,
    sentence: '9時 [ ? ] 5時まで 働きます。',
    target: 'から',
    options: ['から', 'まで', 'に', 'で'],
    translation: 'Tôi làm việc từ 9 giờ đến 5 giờ.',
    fullSentence: '9時から 5時まで 働きます。',
    explanation: 'Mốc thời gian bắt đầu dùng から ("từ 9 giờ"). Cặp đôi kinh điển: から ... まで.',
    category: 'range'
  },
  {
    id: 11,
    sentence: '財布に 100円 [ ? ] ありません。',
    target: 'しか',
    options: ['しか', 'だけ', 'も', 'が'],
    translation: 'Trong ví chỉ có vỏn vẹn 100 yên.',
    fullSentence: '財布に 100円しか ありません。',
    explanation: 'Vế sau là PHỦ ĐỊNH (ありません) và mang sắc thái ít ỏi, bắt buộc dùng しか (しか ... ません).',
    category: 'limit'
  },
  {
    id: 12,
    sentence: '休みは 日曜日 [ ? ] です。',
    target: 'だけ',
    options: ['だけ', 'しか', 'から', 'まで'],
    translation: 'Ngày nghỉ chỉ có ngày chủ nhật.',
    fullSentence: '休みは 日曜日だけです。',
    explanation: 'Vế sau là KHẲNG ĐỊNH (です), biểu thị giới hạn duy nhất dùng だけ.',
    category: 'limit'
  },
  {
    id: 13,
    sentence: '新幹線は バス [ ? ] 速いです。',
    target: 'より',
    options: ['より', 'から', 'ほど', 'で'],
    translation: 'Tàu Shinkansen thì nhanh hơn xe buýt.',
    fullSentence: '新幹線は バスより 速いです。',
    explanation: 'Đối tượng được đem ra làm mốc so sánh ("so với xe buýt thì...") dùng trợ từ より.',
    category: 'range'
  },
  {
    id: 14,
    sentence: 'これは わたし [ ? ] 傘です。',
    target: 'の',
    options: ['の', 'に', 'は', 'で'],
    translation: 'Đây là cây dù của tôi.',
    fullSentence: 'これは わたしの 傘です。',
    explanation: 'Quan hệ sở hữu ("của tôi") kết nối hai danh từ dùng trợ từ の.',
    category: 'connect'
  },
  {
    id: 15,
    sentence: 'きのう どこ [ ? ] 行きませんでした。',
    target: 'も',
    options: ['も', 'へ', 'に', 'で'],
    translation: 'Hôm qua tôi chẳng đi đâu cả.',
    fullSentence: 'きのう どこも 行きませんでした。',
    explanation: 'Nghi vấn từ (どこ) kết hợp với も và đuôi phủ định (行きませんでした) mang nghĩa phủ định hoàn toàn.',
    category: 'connect'
  },
  {
    id: 16,
    sentence: '友だち [ ? ] 会います。',
    target: 'に',
    options: ['に', 'を', 'で', 'へ'],
    translation: 'Tôi gặp bạn bè.',
    fullSentence: '友だちに 会います。',
    explanation: 'Động từ 会います (gặp gỡ) đối tượng tiếp xúc trực tiếp luôn đi với trợ từ に (に会います).',
    category: 'time_place'
  },
  {
    id: 17,
    sentence: 'あした 映画を 見 [ ? ] 行きます。',
    target: 'に',
    options: ['に', 'で', 'へ', 'を'],
    translation: 'Ngày mai tôi đi xem phim.',
    fullSentence: 'あした 映画を 見に 行きます。',
    explanation: 'Cấu trúc chỉ mục đích di chuyển: Động từ thể ます bỏ ます + に行きます.',
    category: 'time_place'
  },
  {
    id: 18,
    sentence: '部屋 [ ? ] 猫が います。',
    target: 'に',
    options: ['に', 'で', 'へ', 'を'],
    translation: 'Trong phòng có con mèo.',
    fullSentence: '部屋に 猫が います。',
    explanation: 'Chỉ nơi chốn TỒN TẠI của người hoặc động vật (います) dùng trợ từ に.',
    category: 'time_place'
  },
  {
    id: 19,
    sentence: '電車 [ ? ] 降ります。',
    target: 'を',
    options: ['を', 'に', 'で', 'から'],
    translation: 'Tôi bước xuống tàu điện.',
    fullSentence: '電車を 降ります。',
    explanation: 'Chỉ điểm rời khỏi chuyển động (xuống xe, rời nhà) dùng trợ từ を (降ります, 出ます).',
    category: 'object'
  },
  {
    id: 20,
    sentence: 'きょうは いい天気です [ ? ]。',
    target: 'ね',
    options: ['ね', 'よ', 'か', 'わ'],
    translation: 'Hôm nay trời đẹp nhỉ!',
    fullSentence: 'きょうは いい天気ですね。',
    explanation: 'Trợ từ cuối câu tìm kiếm sự đồng thuận, tán thưởng từ người nghe dùng ね.',
    category: 'sentence_end'
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
  // Navigation tabs: 'theory' (Lý Thuyết & Mẫu Câu) | 'practice' (Luyện Điền Trợ Từ)
  const [activeTab, setActiveTab] = useState('theory');
  const [theoryCategory, setTheoryCategory] = useState('all');
  const [theorySearch, setTheorySearch] = useState('');

  // Practice state
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [streak, setStreak] = useState(0);
  const [practiceCategory, setPracticeCategory] = useState('all');

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

  // Filtered practice questions
  const filteredQuestions = useMemo(() => {
    if (practiceCategory === 'all') return PRACTICE_QUESTIONS;
    return PRACTICE_QUESTIONS.filter(q => q.category === practiceCategory);
  }, [practiceCategory]);

  const currentQ = filteredQuestions[practiceIndex] || filteredQuestions[0];

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
    if (practiceIndex < filteredQuestions.length - 1) {
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
              <span className="fw-bold" style={{ fontSize: '11px', letterSpacing: '0.04em' }}>CHUYÊN ĐỀ NGỮ PHÁP N5</span>
            </div>
            <h1 className="fw-black text-navy-dark fs-4 mb-1" style={{ letterSpacing: '-0.02em' }}>
              Luyện Trợ Từ Tiếng Nhật (助詞)
            </h1>
            <p className="text-muted small mb-0" style={{ fontSize: '13px' }}>
              Nắm chắc 19 trợ từ căn bản qua bảng tra cứu lý thuyết trực quan và trắc nghiệm điền câu thực chiến.
            </p>
          </div>

          {/* Master 2 Tabs Switcher */}
          <div className="d-flex align-items-center p-1 bg-light rounded-pill border shadow-xs">
            <button
              type="button"
              onClick={() => { sounds.playFlip(); setActiveTab('theory'); }}
              className={`btn btn-sm rounded-pill py-1.5 px-3 fw-bold transition-all ${
                activeTab === 'theory' ? 'btn-primary text-white shadow-xs' : 'text-muted border-0 bg-transparent'
              }`}
              style={{ fontSize: '12.5px' }}
            >
              <BookOpen size={14} className="me-1.5" />
              <span>Bách khoa Trợ từ</span>
            </button>
            <button
              type="button"
              onClick={() => { sounds.playFlip(); setActiveTab('practice'); }}
              className={`btn btn-sm rounded-pill py-1.5 px-3 fw-bold transition-all ${
                activeTab === 'practice' ? 'btn-primary text-white shadow-xs' : 'text-muted border-0 bg-transparent'
              }`}
              style={{ fontSize: '12.5px' }}
            >
              <Zap size={14} className="me-1.5" />
              <span>Luyện điền trợ từ</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. TAB 1: PARTICLES ENCYCLOPEDIA (THEORY & EXAMPLES) ── */}
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
            <div className="d-flex align-items-center gap-1.5 flex-wrap">
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
              <h6 className="fw-bold mb-0 text-purple-900 fs-6">3 Bí Quyết Phân Biệt Trợ Từ Hay Nhầm Nhất</h6>
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

      {/* ── 3. TAB 2: INTERACTIVE PRACTICE STUDIO (DRILL STUDIO) ── */}
      {activeTab === 'practice' && (
        <div className="practice-workspace animate-fade-in">
          {/* Top Control Bar: Category Selector & Metrics */}
          <div className="p-3 rounded-4 bg-white border shadow-xs mb-3">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2.5 mb-3">
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-purple-100 text-purple-700 border border-purple-200 fw-bold px-2.5 py-1">
                  Câu {practiceIndex + 1}/{filteredQuestions.length}
                </span>
                {streak >= 3 && (
                  <span className="badge bg-amber-100 text-amber-800 border border-amber-200 fw-bold px-2 py-1 animate-pulse">
                    🔥 Combo {streak}
                  </span>
                )}
              </div>

              {/* Category Filter */}
              <div className="d-flex align-items-center gap-1.5">
                <small className="text-muted fw-semibold">Dạng câu:</small>
                <Input
                  type="select"
                  bsSize="sm"
                  value={practiceCategory}
                  onChange={(e) => {
                    sounds.playFlip();
                    setPracticeCategory(e.target.value);
                    setPracticeIndex(0);
                    setSelectedAnswer(null);
                    setIsAnswered(false);
                  }}
                  className="rounded-pill border-slate-200 small"
                  style={{ width: 'auto', fontSize: '12px' }}
                >
                  <option value="all">Tổng hợp ngẫu nhiên (20)</option>
                  <option value="topic">Chủ ngữ & Chủ đề (は, が)</option>
                  <option value="time_place">Thời gian & Nơi chốn (に, で)</option>
                  <option value="object">Tân ngữ & Hướng (を, へ)</option>
                  <option value="connect">Liên kết & Đồng nhất (と, も, の)</option>
                  <option value="limit">Giới hạn (だけ, しか)</option>
                  <option value="range">Phạm vi & So sánh (から, まで, より)</option>
                </Input>
              </div>
            </div>

            {/* 4 Clean Metrics Bar */}
            <div className="row g-2 text-center">
              <div className="col-3">
                <div className="p-2 rounded-3 bg-light border shadow-xs">
                  <small className="text-muted d-block fw-semibold" style={{ fontSize: '11px' }}>Tổng số</small>
                  <span className="fw-black text-navy-dark" style={{ fontSize: '14.5px' }}>
                    {filteredQuestions.length}
                  </span>
                </div>
              </div>
              <div className="col-3">
                <div className="p-2 rounded-3 border shadow-xs" style={{ background: '#ecfdf5', borderColor: '#a7f3d0', color: '#059669' }}>
                  <small className="d-block fw-semibold" style={{ fontSize: '11px' }}>Chính xác</small>
                  <span className="fw-black" style={{ fontSize: '14.5px' }}>{score.correct}</span>
                </div>
              </div>
              <div className="col-3">
                <div className="p-2 rounded-3 border shadow-xs" style={{ background: '#fef2f2', borderColor: '#fecaca', color: '#dc2626' }}>
                  <small className="d-block fw-semibold" style={{ fontSize: '11px' }}>Chưa đúng</small>
                  <span className="fw-black" style={{ fontSize: '14.5px' }}>{score.wrong}</span>
                </div>
              </div>
              <div className="col-3">
                <div className="p-2 rounded-3 border shadow-xs" style={{ background: '#eff6ff', borderColor: '#bfdbfe', color: '#2563eb' }}>
                  <small className="d-block fw-semibold" style={{ fontSize: '11px' }}>Tỷ lệ</small>
                  <span className="fw-black" style={{ fontSize: '14.5px' }}>
                    {score.correct + score.wrong > 0
                      ? Math.round((score.correct / (score.correct + score.wrong)) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-2.5">
              <Progress
                value={((practiceIndex + 1) / filteredQuestions.length) * 100}
                color="primary"
                style={{ height: '5px', borderRadius: '5px' }}
              />
            </div>
          </div>

          {/* Interactive Drill Card */}
          <Card className="border-0 rounded-4 shadow-sm bg-white overflow-hidden mb-3">
            <CardBody className="p-4 p-md-5 text-center">
              {/* Question Speaker */}
              <div className="d-flex justify-content-end mb-2">
                <button
                  type="button"
                  onClick={() => speakJapanese(currentQ.fullSentence)}
                  className="btn btn-sm btn-light rounded-circle border p-1 text-primary audio-btn"
                  style={{ width: 34, height: 34 }}
                  title="Nghe câu hoàn chỉnh chuẩn Tokyo"
                >
                  <Volume2 size={16} />
                </button>
              </div>

              {/* Japanese Question Sentence */}
              <h2 className="fw-black text-navy-dark font-monospace mb-2" style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', letterSpacing: '0.02em' }}>
                {isAnswered ? (
                  <span>
                    {currentQ.sentence.split('[ ? ]')[0]}
                    <span
                      className="px-2 py-0.5 rounded-3 mx-1 text-white fw-black"
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
                    <span className="badge bg-purple-50 text-purple-700 border border-purple-300 font-monospace px-3 py-1 mx-1">
                      ?
                    </span>
                    {currentQ.sentence.split('[ ? ]')[1]}
                  </span>
                )}
              </h2>

              {/* Vietnamese Meaning Prompt */}
              <p className="text-secondary fs-6 mb-4 fw-medium">
                Nghĩa câu: <strong className="text-dark">"{currentQ.translation}"</strong>
              </p>

              {/* 4 ABCD Particle Options */}
              <div className="row g-2.5 justify-content-center max-w-md mx-auto mb-4" style={{ maxWidth: '520px' }}>
                {currentQ.options.map((opt, idx) => {
                  const letters = ['A', 'B', 'C', 'D'];
                  const isCorrect = opt === currentQ.target;
                  const isSelected = opt === selectedAnswer;

                  let btnStyle = 'btn-outline-secondary bg-white text-dark border-slate-200';
                  if (isAnswered) {
                    if (isCorrect) {
                      btnStyle = 'btn-success text-white shadow-xs border-success';
                    } else if (isSelected) {
                      btnStyle = 'btn-danger text-white shadow-xs border-danger';
                    } else {
                      btnStyle = 'btn-light text-muted border opacity-50';
                    }
                  }

                  return (
                    <div className="col-6" key={opt}>
                      <button
                        type="button"
                        disabled={isAnswered}
                        onClick={() => handleSelectOption(opt)}
                        className={`btn w-100 py-3 rounded-4 fw-bold font-monospace transition-all d-flex align-items-center justify-content-between px-3 ${btnStyle}`}
                        style={{ fontSize: '18px' }}
                      >
                        <span className="small text-muted font-sans fw-bold" style={{ fontSize: '12px' }}>
                          {letters[idx]}.
                        </span>
                        <span className="fs-4">{opt}</span>
                        {isAnswered && isCorrect && <Check size={18} className="text-white" />}
                        {isAnswered && isSelected && !isCorrect && <XCircle size={18} className="text-white" />}
                        {!isAnswered && <span style={{ width: 18 }} />}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Feedback & Explanation Box */}
              {isAnswered && (
                <div
                  className="p-3.5 rounded-4 text-start animate-slide-up border mb-3"
                  style={{
                    backgroundColor: selectedAnswer === currentQ.target ? '#f0fdf4' : '#fef2f2',
                    borderColor: selectedAnswer === currentQ.target ? '#bbf7d0' : '#fecaca'
                  }}
                >
                  <div className="d-flex align-items-center gap-2 mb-1.5">
                    {selectedAnswer === currentQ.target ? (
                      <>
                        <CheckCircle2 size={18} className="text-success flex-shrink-0" />
                        <strong className="text-success fs-6">Chính xác! (+2 Nước Vườn cây)</strong>
                      </>
                    ) : (
                      <>
                        <XCircle size={18} className="text-danger flex-shrink-0" />
                        <strong className="text-danger fs-6">
                          Chưa chính xác! Đáp án đúng là: <span className="badge bg-success ms-1">{currentQ.target}</span>
                        </strong>
                      </>
                    )}
                  </div>
                  <p className="text-dark small mb-0" style={{ fontSize: '13px', lineHeight: '1.5' }}>
                    💡 <strong>Giải thích ngữ pháp:</strong> {currentQ.explanation}
                  </p>
                </div>
              )}

              {/* Next Question / Restart Button */}
              {isAnswered && (
                <div className="d-flex justify-content-center gap-2">
                  <Button
                    color="primary"
                    onClick={handleNextQuestion}
                    className="rounded-pill px-4 py-2 fw-bold shadow-xs d-flex align-items-center gap-2 hover-lift"
                  >
                    <span>
                      {practiceIndex < filteredQuestions.length - 1 ? 'Câu kế tiếp' : 'Hoàn thành lượt luyện'}
                    </span>
                    <ArrowRight size={16} />
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ParticlesPage;
