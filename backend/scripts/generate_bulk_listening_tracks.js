// Bổ sung hàng loạt bài nghe Choukai chuẩn JLPT cho N5 (Bài 6 đến 25) và N4 (Bài 26 đến 50)
// Gồm 45 bài phản xạ Mondai 4 và 21 hội thoại ngắn Mondai 1 và 2. Chạy lại nhiều lần vẫn an toàn.
// ZERO ARROWS RULE: Không dùng ký tự mũi tên

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../../frontend/src/data/listeningTracks.js');
const data = require(filePath).listeningTracksByLevel;

// Mỗi mục: [bài, cấp độ, chủ đề, câu nghe, cách đọc, nghĩa, đáp án đúng, sai1, sai2, sai3, giải thích, từ khóa]
const QUICK = [
  [6, 'N5', 'rủ ăn tối', '一緒に晩ごはんを食べませんか。', 'いっしょにばんごはんをたべませんか。', 'Cùng ăn cơm tối nhé?', 'ええ、いいですね。', 'はい、食べました。', 'いいえ、晩ごはんです。', 'どういたしまして。', 'Lời rủ 「〜ませんか」 được đáp lại bằng 「ええ、いいですね」 khi đồng ý.', '〜ませんか và ええ、いいですね'],
  [7, 'N5', 'hỏi ai cho', 'それは誰にもらいましたか。', 'それはだれにもらいましたか。', 'Cái đó bạn nhận từ ai vậy?', '友達にもらいました。', '友達にあげました。', '昨日もらいました。', 'きれいです。', 'Hỏi 「誰に」 thì trả lời tên người kèm 「にもらいました」.', '誰に và もらいました'],
  [8, 'N5', 'hỏi cảm tưởng', '日本の生活はどうですか。', 'にほんのせいかつはどうですか。', 'Cuộc sống ở Nhật thế nào?', 'とても楽しいです。', '東京に住んでいます。', '先月来ました。', '日本語で話します。', '「どうですか」 hỏi cảm nhận nên đáp bằng tính từ.', 'どうですか và tính từ'],
  [9, 'N5', 'hỏi sở thích', 'どんなスポーツが好きですか。', 'どんなすぽーつがすきですか。', 'Bạn thích môn thể thao nào?', 'サッカーが好きです。', '毎日します。', '上手じゃありません。', '公園でします。', 'Hỏi 「どんな〜」 thì nêu tên môn cụ thể với 「が好きです」.', 'どんな và 好きです'],
  [10, 'N5', 'hỏi đồ vật', 'かばんの中に何がありますか。', 'かばんのなかになにがありますか。', 'Trong túi có gì?', '財布と傘があります。', '田中さんがいます。', '机の上です。', '青いです。', 'Vật vô tri dùng 「あります」, câu trả lời liệt kê đồ vật.', '何があります'],
  [11, 'N5', 'hỏi thời lượng học', '毎日何時間日本語を勉強しますか。', 'まいにちなんじかんにほんごをべんきょうしますか。', 'Mỗi ngày bạn học tiếng Nhật mấy tiếng?', '二時間勉強します。', '九時から勉強します。', '図書館で勉強します。', '二人で勉強します。', '「何時間」 hỏi khoảng thời gian nên đáp bằng số giờ.', '何時間'],
  [12, 'N5', 'so sánh hai thứ', '東京と大阪とどちらが大きいですか。', 'とうきょうとおおさかとどちらがおおきいですか。', 'Tokyo và Osaka bên nào lớn hơn?', '東京のほうが大きいです。', '大阪に行きました。', '新幹線で行きます。', '先月でした。', 'Câu so sánh trả lời bằng mẫu 「〜のほうが〜」.', 'どちらが và のほうが'],
  [13, 'N5', 'hỏi điều muốn làm', '休みの日に何がしたいですか。', 'やすみのひになにがしたいですか。', 'Ngày nghỉ bạn muốn làm gì?', '温泉に行きたいです。', '温泉に行きました。', 'はい、行きます。', '休みは日曜日です。', '「したいです」 hỏi mong muốn nên đáp bằng 「〜たいです」.', '〜たいです'],
  [14, 'N5', 'nhờ mở cửa sổ', 'すみません、ちょっと窓を開けてください。', 'すみません、ちょっとまどをあけてください。', 'Xin lỗi, làm ơn mở cửa sổ giúp.', 'はい、分かりました。', 'ありがとうございました。', 'いいえ、そうです。', 'どういたしまして。', 'Lời nhờ 「〜てください」 được nhận bằng 「はい、分かりました」.', '〜てください'],
  [15, 'N5', 'xin phép chụp ảnh', 'ここで写真を撮ってもいいですか。', 'ここでしゃしんをとってもいいですか。', 'Tôi chụp ảnh ở đây được không?', 'はい、どうぞ。', 'いいえ、撮りました。', 'はい、写真です。', 'どういたしまして。', 'Xin phép 「〜てもいいですか」, đồng ý trả lời 「はい、どうぞ」.', '〜てもいいですか'],
  [16, 'N5', 'hỏi việc buổi sáng', '今朝は何をしましたか。', 'けさはなにをしましたか。', 'Sáng nay bạn đã làm gì?', '散歩して、朝ごはんを食べました。', '明日散歩します。', '公園へ行きます。', '六時に起きます。', 'Hỏi quá khứ nên đáp bằng thể 「〜ました」 nối bằng thể て.', '今朝 và 〜ました'],
  [17, 'N5', 'nhắc đừng quên', '宿題を忘れないでくださいね。', 'しゅくだいをわすれないでくださいね。', 'Đừng quên bài tập nhé.', 'はい、気をつけます。', 'いいえ、忘れました。', 'どういたしまして。', '宿題は難しいです。', '「〜ないでください」 là lời dặn, đáp 「はい、気をつけます」.', '〜ないでください'],
  [18, 'N5', 'hỏi khả năng', 'ピアノが弾けますか。', 'ぴあのがひけますか。', 'Bạn chơi được piano không?', 'いいえ、弾けません。', 'はい、ピアノです。', 'ええ、買いました。', 'いいえ、弾きました。', '「弾けますか」 hỏi khả năng, đáp bằng 「弾けます」 hoặc 「弾けません」.', '〜られます và 〜けます'],
  [19, 'N5', 'hỏi kinh nghiệm', '富士山に登ったことがありますか。', 'ふじさんにのぼったことがありますか。', 'Bạn đã từng leo núi Phú Sĩ chưa?', 'はい、一度あります。', 'はい、登っています。', 'いいえ、富士山です。', '来月登ります。', 'Mẫu 「〜たことがあります」 hỏi kinh nghiệm đã từng làm.', '〜たことがありますか'],
  [20, 'N5', 'rủ bạn thể thường', '明日、パーティーに行く？', 'あした、ぱーてぃーにいく？', 'Mai cậu có đi tiệc không?', 'うん、行くよ。', 'うん、行ったよ。', 'ごめんください。', 'いいえ、パーティーです。', 'Thể thường 「行く？」 đáp 「うん、行くよ」.', '行く？ và うん'],
  [21, 'N5', 'hỏi dự đoán', '明日は雨が降ると思いますか。', 'あしたはあめがふるとおもいますか。', 'Bạn nghĩ mai trời sẽ mưa không?', 'ええ、降ると思います。', 'ええ、降りました。', '雨は嫌いです。', 'いいえ、傘です。', 'Hỏi 「と思いますか」 thì đáp lại bằng 「〜と思います」.', 'と思います'],
  [22, 'N5', 'hỏi người làm', 'これは誰が作ったケーキですか。', 'これはだれがつくったけーきですか。', 'Đây là bánh ai làm vậy?', '母が作ったケーキです。', 'とても甘いです。', '三つあります。', '駅の前の店です。', '「誰が作った」 hỏi người làm nên đáp bằng tên người.', '誰が作った'],
  [23, 'N5', 'hỏi lúc đến Nhật', '日本へ来たとき、何をしましたか。', 'にほんへきたとき、なにをしましたか。', 'Lúc đến Nhật bạn đã làm gì?', '空港で友達に会いました。', '来年行きます。', '飛行機で来ます。', '日本が好きです。', 'Hỏi quá khứ 「とき、何をしましたか」 nên đáp bằng việc đã làm.', '〜とき'],
  [24, 'N5', 'hỏi người tặng quà', '誕生日に誰がプレゼントをくれましたか。', 'たんじょうびにだれがぷれぜんとをくれましたか。', 'Sinh nhật ai đã tặng quà cho bạn?', '姉がくれました。', '姉にあげました。', '昨日でした。', '私の誕生日です。', '「誰がくれましたか」 đáp 「〜がくれました」 với chủ ngữ là người cho.', 'くれました'],
  [25, 'N5', 'hỏi giả định', 'もし宝くじに当たったら、どうしますか。', 'もしたからくじにあたったら、どうしますか。', 'Nếu trúng xổ số, bạn sẽ làm gì?', '世界旅行をしたいです。', '昨日当たりました。', '宝くじは高いです。', 'はい、当たります。', 'Câu điều kiện 「〜たら」 đáp bằng việc sẽ làm.', '〜たら'],
  [26, 'N4', 'hỏi lý do về sớm', 'どうして今日は早く帰るんですか。', 'どうしてきょうははやくかえるんですか。', 'Sao hôm nay bạn về sớm vậy?', '子どもが熱を出したんです。', '電車で帰ります。', '六時に帰りました。', 'はい、早いです。', '「どうして〜んですか」 hỏi lý do, đáp bằng 「〜んです」.', 'どうして và んです'],
  [27, 'N4', 'hỏi khả năng đọc báo', '日本語の新聞が読めますか。', 'にほんごのしんぶんがよめますか。', 'Bạn đọc được báo tiếng Nhật không?', '簡単な記事なら読めます。', '毎朝読んでいます。', '新聞は安いです。', 'はい、読みました。', 'Thể khả năng 「読めます」 đáp bằng mức độ đọc được.', '読めます'],
  [28, 'N4', 'vừa học vừa nghe nhạc', '音楽を聞きながら勉強しますか。', 'おんがくをききながらべんきょうしますか。', 'Bạn vừa nghe nhạc vừa học à?', 'いいえ、静かなほうが集中できます。', 'はい、音楽は静かです。', 'いいえ、勉強しませんでした。', '音楽を聞きました。', 'Mẫu 「ながら」 là làm hai việc cùng lúc, đáp kèm lý do.', '〜ながら'],
  [29, 'N4', 'nhận xét cửa sổ mở', 'あれ、窓が開いていますね。', 'あれ、まどがあいていますね。', 'Ủa, cửa sổ đang mở kìa.', '本当ですね。閉めましょうか。', 'いいえ、窓じゃありません。', 'どういたしまして。', '昨日開けます。', '「開いています」 là trạng thái, đáp đồng tình và đề nghị đóng.', '〜ています trạng thái'],
  [30, 'N4', 'hỏi chuẩn bị đi du lịch', '旅行の準備はできましたか。', 'りょこうのじゅんびはできましたか。', 'Bạn chuẩn bị xong chuyến du lịch chưa?', 'はい、切符は買ってあります。', 'はい、切符は高いです。', 'いいえ、旅行はしました。', '来週準備しました。', 'Mẫu 「〜てあります」 diễn tả việc đã chuẩn bị sẵn.', '〜てあります'],
  [31, 'N4', 'hỏi dự định nghỉ hè', '夏休みはどうするつもりですか。', 'なつやすみはどうするつもりですか。', 'Kỳ nghỉ hè bạn định làm gì?', '国へ帰ろうと思っています。', '国へ帰りました。', '夏休みは暑いです。', '先週の休みでした。', 'Hỏi dự định đáp 「〜ようと思っています」.', 'つもり và 〜ようと思う'],
  [32, 'N4', 'bạn đau đầu', '頭が痛いんです。', 'あたまがいたいんです。', 'Tôi bị đau đầu.', 'それはいけませんね。薬を飲んだほうがいいですよ。', 'それはよかったですね。', 'どういたしまして。', '頭が大きいですね。', 'Nghe tin xấu thì chia buồn và khuyên 「〜たほうがいい」.', 'それはいけませんね'],
  [33, 'N4', 'hỏi biển báo', 'あの標識は何と書いてありますか。', 'あのひょうしきはなんとかいてありますか。', 'Biển báo kia viết gì vậy?', '止まれと書いてあります。', '赤い色です。', '駅の前にあります。', '止まれと言いました。', '「と書いてあります」 là mẫu nêu nội dung được viết.', '〜と書いてあります'],
  [34, 'N4', 'hỏi cách nấu', 'この料理はどうやって作りますか。', 'このりょうりはどうやってつくりますか。', 'Món này làm như thế nào?', '説明書に書いてあるとおりに作ります。', 'とても簡単でした。', '母が作りました。', '昨日食べました。', '「どうやって」 hỏi cách làm, đáp 「〜とおりに」.', '〜とおりに'],
  [35, 'N4', 'hỏi điều kiện mua', '安ければ買いますか。', 'やすければかいますか。', 'Nếu rẻ thì bạn sẽ mua chứ?', 'ええ、安ければ買います。', 'ええ、安かったです。', 'いいえ、店です。', 'はい、買いました。', 'Thể điều kiện 「〜ば」 được đáp lại bằng cùng cấu trúc.', '〜ば'],
  [36, 'N4', 'hỏi thói quen vận động', '毎日運動していますね。', 'まいにちうんどうしていますね。', 'Ngày nào bạn cũng tập thể dục nhỉ.', 'ええ、健康でいられるようにしているんです。', 'ええ、運動は健康です。', 'いいえ、運動しました。', 'ありがとうございました。', 'Mẫu 「〜ようにしている」 là cố gắng duy trì thói quen.', '〜ようにしている'],
  [37, 'N4', 'hỏi chuyện bị mưa', '昨日は雨が降って、大変でしたね。', 'きのうはあめがふって、たいへんでしたね。', 'Hôm qua mưa vất vả nhỉ.', 'ええ、傘がなくて、びしょぬれになりました。', 'はい、傘を買いに行きます。', 'どういたしまして。', '昨日は日曜日でした。', 'Đáp đồng cảm và kể thêm tình huống đã trải qua.', 'ええ và kể thêm'],
  [38, 'N4', 'hỏi sở thích', '趣味は何ですか。', 'しゅみはなんですか。', 'Sở thích của bạn là gì?', '写真を撮ることです。', '写真を撮りました。', 'カメラは高いです。', '趣味は昨日でした。', 'Mẫu 「〜ことです」 dùng khi nói sở thích.', '〜ことです'],
  [39, 'N4', 'hỏi lý do đến muộn', 'どうして遅れたんですか。', 'どうしておくれたんですか。', 'Sao bạn đến muộn vậy?', '電車が遅れたので、遅くなりました。', '電車で来ました。', 'もう遅いです。', '次は遅れません。', 'Giải thích lý do bằng 「〜ので」.', '〜ので'],
  [40, 'N4', 'hỏi giờ họp', '会議は何時からか分かりますか。', 'かいぎはなんじからかわかりますか。', 'Bạn có biết cuộc họp từ mấy giờ không?', '三時からだと思います。', '会議室は二階です。', 'はい、会議でした。', '三時間かかります。', 'Câu hỏi có 「〜か分かりますか」 vẫn đáp thông tin giờ giấc.', '何時からか'],
  [41, 'N4', 'hỏi nhận gì từ thầy', '先生に何をいただきましたか。', 'せんせいになにをいただきましたか。', 'Bạn đã nhận gì từ thầy giáo?', '辞書をいただきました。', '辞書を差し上げました。', '先生はやさしいです。', '昨日いただきます。', '「いただく」 là khiêm nhường ngữ của 「もらう」.', 'いただきました'],
  [42, 'N4', 'hỏi công dụng cái kéo', 'このはさみは何に使いますか。', 'このはさみはなににつかいますか。', 'Cái kéo này dùng để làm gì?', '紙を切るのに使います。', '昨日使いました。', '机の上にあります。', 'とても便利でした。', 'Mẫu 「〜のに使います」 nêu công dụng.', '〜のに使います'],
  [43, 'N4', 'nhận xét bánh ngon', 'このケーキ、おいしそうですね。', 'このけーき、おいしそうですね。', 'Cái bánh này trông ngon nhỉ.', 'ええ、食べてみましょう。', 'いいえ、ケーキです。', 'どういたしまして。', 'ええ、昨日そうでした。', 'Đồng tình với phán đoán 「そうですね」 rồi rủ thử.', '〜そうです'],
  [44, 'N4', 'hỏi cảm nhận món cà ri', 'このカレー、どうですか。', 'このかれー、どうですか。', 'Món cà ri này thế nào?', 'ちょっと辛すぎますね。', 'カレーを食べました。', '駅の近くの店です。', '二人で行きます。', 'Hỏi cảm nhận nên đáp bằng đánh giá có 「〜すぎる」.', '〜すぎる'],
  [45, 'N4', 'hỏi khi tàu dừng', '電車が止まった場合は、どうしますか。', 'でんしゃがとまったばあいは、どうしますか。', 'Nếu tàu dừng chạy thì bạn làm sao?', 'バスで行きます。', '昨日止まりました。', '電車は速いです。', '駅にいます。', 'Mẫu 「場合は」 hỏi cách xử lý, đáp bằng hành động.', '〜場合は'],
  [46, 'N4', 'hỏi đã ăn trưa chưa', 'もう昼ご飯を食べましたか。', 'もうひるごはんをたべましたか。', 'Bạn ăn trưa chưa?', 'いいえ、今から食べるところです。', 'いいえ、さっき食べたところです。', 'はい、これから食べます。', 'いいえ、昼ご飯でした。', '「〜ところです」 diễn tả thời điểm sắp làm, vừa làm hoặc đang làm.', '〜ところです'],
  [47, 'N4', 'hỏi dự báo thời tiết', '天気予報によると、明日はどうですか。', 'てんきよほうによると、あしたはどうですか。', 'Theo dự báo thời tiết thì ngày mai thế nào?', '雪が降るそうです。', '昨日は晴れました。', '天気予報は見ません。', '明日は水曜日です。', 'Mẫu 「〜によると〜そうです」 là truyền đạt thông tin nghe được.', '〜によると'],
  [48, 'N4', 'hỏi việc cho con làm', '子どもに何をさせていますか。', 'こどもになにをさせていますか。', 'Bạn bắt con làm gì vậy?', '毎日ピアノを練習させています。', '毎日ピアノを弾かれています。', '子どもは元気です。', 'ピアノは高かったです。', 'Thể sai khiến 「させています」 nói người khiến người khác làm.', '〜させる'],
  [49, 'N4', 'mời ngồi lịch sự', 'どうぞお座りください。', 'どうぞおすわりください。', 'Xin mời ngồi.', 'ありがとうございます。失礼します。', 'どういたしまして。', '行ってきます。', 'いただきます。', 'Được mời ngồi thì cảm ơn và nói 「失礼します」.', '失礼します'],
  [50, 'N4', 'hỏi tên lịch sự', 'お名前は何とおっしゃいますか。', 'おなまえはなんとおっしゃいますか。', 'Quý danh của anh là gì ạ?', '山田と申します。', '山田とおっしゃいます。', '山田さんと言われます。', '何と申しますか。', 'Nói về bản thân dùng khiêm nhường ngữ 「申します」.', '申します']
];

// Mỗi mục: {l, lv, m, topic, sit, lines, q, o, ex, kw, tip}; lines gồm [người nói, vai, kanji, kana, nghĩa]
const DIALOGS = [
  { l: 11, lv: 'N5', m: 'mondai1', topic: 'Thời gian đi làm', sit: 'Hai đồng nghiệp nói chuyện về đường đi làm.', lines: [['Nữ', 'A', '会社まで電車でどのぐらいかかりますか。', 'かいしゃまででんしゃでどのぐらいかかりますか。', 'Đến công ty bằng tàu mất khoảng bao lâu?'], ['Nam', 'B', '四十分ぐらいかかります。', 'よんじゅっぷんぐらいかかります。', 'Mất khoảng 40 phút.'], ['Nữ', 'A', 'バスはどうですか。', 'ばすはどうですか。', 'Xe bus thì sao?'], ['Nam', 'B', 'バスは一時間かかりますから、電車で行きます。', 'ばすはいちじかんかかりますから、でんしゃでいきます。', 'Xe bus mất 1 tiếng nên tôi đi tàu.']], q: 'Người nam đi làm bằng gì và mất bao lâu?', o: ['Tàu điện, khoảng 40 phút', 'Xe bus, khoảng 1 giờ', 'Tàu điện, khoảng 1 giờ', 'Đi bộ, khoảng 40 phút'], ex: 'Anh ấy nói 「電車で行きます」 và tàu mất 「四十分」.', kw: '四十分 và 電車で', tip: 'Nghe kỹ con số của từng phương tiện rồi mới chọn.' },
  { l: 12, lv: 'N5', m: 'mondai2', topic: 'Mùa yêu thích', sit: 'Hai người bạn nói về mùa mình thích.', lines: [['Nam', 'A', '夏と冬と、どちらが好きですか。', 'なつとふゆと、どちらがすきですか。', 'Bạn thích mùa hè hay mùa đông hơn?'], ['Nữ', 'B', '冬のほうが好きです。スキーができますから。', 'ふゆのほうがすきです。すきーができますから。', 'Tôi thích mùa đông hơn vì có thể trượt tuyết.'], ['Nam', 'A', '私は夏のほうが好きです。海で泳げますから。', 'わたしはなつのほうがすきです。うみでおよげますから。', 'Tôi thích mùa hè hơn vì có thể bơi biển.']], q: 'Người nam thích mùa nào và vì sao?', o: ['Mùa hè vì có thể bơi biển', 'Mùa đông vì có thể trượt tuyết', 'Mùa hè vì được nghỉ dài', 'Mùa đông vì không nóng'], ex: 'Người nam nói 「夏のほうが好き」 vì 「海で泳げます」.', kw: '夏のほうが và 海で泳げます', tip: 'Hai người chọn khác nhau, đừng nhầm ý người nữ.' },
  { l: 13, lv: 'N5', m: 'mondai1', topic: 'Quà sinh nhật', sit: 'Hai người bàn kế hoạch mua quà.', lines: [['Nam', 'A', '誕生日に何がほしいですか。', 'たんじょうびになにがほしいですか。', 'Sinh nhật bạn muốn gì?'], ['Nữ', 'B', '新しいかばんがほしいです。今のは古いですから。', 'あたらしいかばんがほしいです。いまのはふるいですから。', 'Tôi muốn một chiếc túi mới vì cái hiện tại cũ rồi.'], ['Nam', 'A', 'じゃ、駅の前のデパートへ行きませんか。', 'じゃ、えきのまえのでぱーとへいきませんか。', 'Vậy mình đến cửa hàng bách hóa trước ga nhé?'], ['Nữ', 'B', 'いいですね。日曜日に行きましょう。', 'いいですね。にちようびにいきましょう。', 'Hay đấy. Chủ nhật mình đi nhé.']], q: 'Hai người sẽ làm gì vào chủ nhật?', o: ['Đến cửa hàng bách hóa mua túi', 'Tổ chức tiệc sinh nhật ở nhà hàng', 'Mua đồng hồ cũ', 'Đi du lịch'], ex: 'Họ hẹn 「日曜日に行きましょう」 đến 「デパート」 để mua túi.', kw: 'デパート và 日曜日', tip: 'Chú ý từ chỉ ngày và địa điểm đã chốt.' },
  { l: 16, lv: 'N5', m: 'mondai1', topic: 'Buổi sáng của anh Tanaka', sit: 'Đồng nghiệp hỏi về thói quen buổi sáng.', lines: [['Nữ', 'A', '朝は何をしますか。', 'あさはなにをしますか。', 'Buổi sáng anh làm gì?'], ['Nam', 'B', '起きて、シャワーを浴びて、朝ごはんを食べます。', 'おきて、しゃわーをあびて、あさごはんをたべます。', 'Tôi dậy, tắm vòi sen rồi ăn sáng.'], ['Nữ', 'A', 'それから？', 'それから？', 'Sau đó?'], ['Nam', 'B', '八時に家を出て、会社へ行きます。', 'はちじにいえをでて、かいしゃへいきます。', 'Tám giờ tôi ra khỏi nhà và đi làm.']], q: 'Người nam làm gì ngay sau khi thức dậy?', o: ['Tắm vòi sen', 'Ăn sáng', 'Ra khỏi nhà', 'Đi làm'], ex: 'Thứ tự là 起きて、シャワーを浴びて、朝ごはん nên sau khi dậy là tắm.', kw: '起きて、シャワーを浴びて', tip: 'Thể て nối các việc theo đúng thứ tự thời gian.' },
  { l: 19, lv: 'N5', m: 'mondai2', topic: 'Kinh nghiệm đi Kyoto', sit: 'Hai bạn nói về chuyến đi Kyoto.', lines: [['Nữ', 'A', '京都へ行ったことがありますか。', 'きょうとへいったことがありますか。', 'Bạn đã từng đến Kyoto chưa?'], ['Nam', 'B', 'ええ、去年、一度行きました。お寺がきれいでした。', 'ええ、きょねん、いちどいきました。おてらがきれいでした。', 'Rồi, năm ngoái tôi đi một lần. Chùa rất đẹp.'], ['Nữ', 'A', '私はまだ行ったことがありません。', 'わたしはまだいったことがありません。', 'Tôi vẫn chưa từng đi.'], ['Nam', 'B', 'じゃ、今度いっしょに行きましょう。', 'じゃ、こんどいっしょにいきましょう。', 'Vậy lần tới cùng đi nhé.']], q: 'Người nữ đã từng đến Kyoto chưa?', o: ['Chưa từng đến', 'Đã đến một lần năm ngoái', 'Đã đến nhiều lần', 'Sẽ đến vào năm sau'], ex: 'Người nữ nói 「まだ行ったことがありません」, nghĩa là chưa từng đi.', kw: 'まだ〜たことがありません', tip: 'Đừng lẫn trải nghiệm của người nam với người nữ.' },
  { l: 20, lv: 'N5', m: 'mondai1', topic: 'Hẹn xem phim', sit: 'Hai bạn thân nói chuyện bằng thể thường.', lines: [['Nữ', 'A', '明日、暇？', 'あした、ひま？', 'Mai cậu rảnh không?'], ['Nam', 'B', '午後なら暇だよ。何かあるの？', 'ごごならひまだよ。なにかあるの？', 'Buổi chiều thì rảnh. Có chuyện gì à?'], ['Nữ', 'A', '映画を見に行かない？', 'えいがをみにいかない？', 'Đi xem phim không?'], ['Nam', 'B', 'いいね。三時に駅で会おう。', 'いいね。さんじにえきであおう。', 'Hay đấy. Ba giờ gặp ở ga nhé.']], q: 'Hai người hẹn gặp lúc nào và ở đâu?', o: ['3 giờ chiều ở nhà ga', '3 giờ chiều ở rạp phim', 'Buổi sáng ở nhà ga', '3 giờ chiều ở nhà'], ex: 'Người nam đề nghị 「三時に駅で会おう」.', kw: '三時 và 駅', tip: 'Rạp phim là nơi đến, không phải nơi hẹn.' },
  { l: 21, lv: 'N5', m: 'mondai2', topic: 'Trận đấu ngày mai', sit: 'Hai đồng đội nói về trận đấu.', lines: [['Nữ', 'A', '明日の試合、勝つと思いますか。', 'あしたのしあい、かつとおもいますか。', 'Bạn nghĩ trận mai mình thắng không?'], ['Nam', 'B', '私は勝つと思います。みんな練習しましたから。', 'わたしはかつとおもいます。みんなれんしゅうしましたから。', 'Tôi nghĩ sẽ thắng vì mọi người đã luyện tập.'], ['Nữ', 'A', 'でも、天気が悪いそうですよ。', 'でも、てんきがわるいそうですよ。', 'Nhưng nghe nói thời tiết xấu đấy.'], ['Nam', 'B', '雨でも、試合はあるでしょう。', 'あめでも、しあいはあるでしょう。', 'Dù mưa chắc trận đấu vẫn diễn ra.']], q: 'Người nam nghĩ thế nào về trận đấu?', o: ['Sẽ thắng vì đã luyện tập nhiều', 'Trận đấu bị hủy vì mưa', 'Đội sẽ thua', 'Không biết kết quả'], ex: 'Anh nói 「勝つと思います」 vì 「練習しました」.', kw: '勝つと思います', tip: 'Lời của người nữ về thời tiết chỉ là bẫy gây nhiễu.' },
  { l: 22, lv: 'N5', m: 'mondai2', topic: 'Chiếc túi màu đỏ', sit: 'Hai người nói về chiếc túi của đồng nghiệp.', lines: [['Nữ', 'A', 'あの赤いかばんを持っている人は誰ですか。', 'あのあかいかばんをもっているひとはだれですか。', 'Người cầm chiếc túi đỏ kia là ai vậy?'], ['Nam', 'B', '山田さんです。昨日買ったかばんです。', 'やまださんです。きのうかったかばんです。', 'Là chị Yamada. Chiếc túi mới mua hôm qua.']], q: 'Chiếc túi đỏ của ai và mua khi nào?', o: ['Của chị Yamada, mua hôm qua', 'Của người nữ, mua hôm qua', 'Của chị Yamada, mua tuần trước', 'Của người nam, mua hôm qua'], ex: 'Người nam nói 「山田さんです。昨日買った」.', kw: '山田さん và 昨日買った', tip: 'Mệnh đề 「昨日買った」 bổ nghĩa cho 「かばん」.' },
  { l: 23, lv: 'N5', m: 'mondai2', topic: 'Lúc rảnh rỗi', sit: 'Hai người bàn về việc làm lúc rảnh.', lines: [['Nữ', 'A', '暇なとき、何をしますか。', 'ひまなとき、なにをしますか。', 'Lúc rảnh bạn làm gì?'], ['Nam', 'B', '暇なとき、よく図書館で本を読みます。', 'ひまなとき、よくとしょかんでほんをよみます。', 'Lúc rảnh tôi hay đọc sách ở thư viện.'], ['Nữ', 'A', '私は暇なとき、料理をします。', 'わたしはひまなとき、りょうりをします。', 'Lúc rảnh tôi nấu ăn.']], q: 'Người nam làm gì lúc rảnh?', o: ['Đọc sách ở thư viện', 'Nấu ăn ở nhà', 'Xem phim', 'Đi dạo công viên'], ex: 'Người nam nói 「図書館で本を読みます」.', kw: '図書館で本を読む', tip: 'Đừng lẫn với sở thích nấu ăn của người nữ.' },
  { l: 24, lv: 'N5', m: 'mondai2', topic: 'Cà vạt mới', sit: 'Đồng nghiệp khen chiếc cà vạt.', lines: [['Nữ', 'A', 'そのネクタイ、素敵ですね。', 'そのねくたい、すてきですね。', 'Cà vạt đó đẹp nhỉ.'], ['Nam', 'B', 'ありがとうございます。妹がくれました。誕生日のプレゼントです。', 'ありがとうございます。いもうとがくれました。たんじょうびのぷれぜんとです。', 'Cảm ơn. Em gái tặng tôi, là quà sinh nhật.'], ['Nữ', 'A', 'いい妹さんですね。', 'いいいもうとさんですね。', 'Em gái của anh tốt quá.']], q: 'Ai đã tặng chiếc cà vạt cho người nam?', o: ['Em gái', 'Bạn gái', 'Mẹ', 'Anh tự mua'], ex: 'Anh nói 「妹がくれました」.', kw: '妹がくれました', tip: '「くれる」 chỉ người khác cho mình.' },
  { l: 25, lv: 'N5', m: 'mondai2', topic: 'Kế hoạch ngày mai', sit: 'Hai người bàn kế hoạch tùy thời tiết.', lines: [['Nữ', 'A', '明日雨が降ったら、どうしますか。', 'あしたあめがふったら、どうしますか。', 'Mai nếu mưa anh làm gì?'], ['Nam', 'B', '雨が降ったら、家で映画を見ます。', 'あめがふったら、いえでえいがをみます。', 'Nếu mưa tôi xem phim ở nhà.'], ['Nữ', 'A', '晴れたら？', 'はれたら？', 'Còn nếu nắng?'], ['Nam', 'B', '晴れたら、公園で友達とテニスをします。', 'はれたら、こうえんでともだちとてにすをします。', 'Nếu nắng tôi chơi tennis với bạn ở công viên.']], q: 'Nếu trời nắng người nam sẽ làm gì?', o: ['Chơi tennis với bạn ở công viên', 'Xem phim ở nhà', 'Đi mua sắm', 'Ở nhà ngủ'], ex: 'Anh nói 「晴れたら、公園で友達とテニス」.', kw: '晴れたら', tip: 'Phải nghe đúng điều kiện đang được hỏi là mưa hay nắng.' },
  { l: 28, lv: 'N4', m: 'mondai2', topic: 'Vừa ăn vừa xem', sit: 'Hai người nói về thói quen ăn sáng.', lines: [['Nữ', 'A', '毎朝、何をしながら朝ごはんを食べますか。', 'まいあさ、なにをしながらあさごはんをたべますか。', 'Mỗi sáng bạn vừa ăn vừa làm gì?'], ['Nam', 'B', 'ニュースを見ながら食べます。', 'にゅーすをみながらたべます。', 'Tôi vừa ăn vừa xem tin tức.'], ['Nữ', 'A', '私は音楽を聞きながら食べます。', 'わたしはおんがくをききながらたべます。', 'Tôi vừa ăn vừa nghe nhạc.']], q: 'Người nam vừa ăn sáng vừa làm gì?', o: ['Xem tin tức', 'Nghe nhạc', 'Đọc báo', 'Nói chuyện điện thoại'], ex: 'Người nam nói 「ニュースを見ながら」.', kw: 'ニュースを見ながら', tip: 'Hai người làm hai việc khác nhau, phân biệt chủ ngữ.' },
  { l: 30, lv: 'N4', m: 'mondai1', topic: 'Chuẩn bị cuộc họp', sit: 'Hai nhân viên kiểm tra việc chuẩn bị họp.', lines: [['Nam', 'A', '会議の資料は準備しましたか。', 'かいぎのしりょうはじゅんびしましたか。', 'Tài liệu họp đã chuẩn bị chưa?'], ['Nữ', 'B', 'はい、コピーしてあります。机の上に置いてあります。', 'はい、こぴーしてあります。つくえのうえにおいてあります。', 'Rồi, đã photo và đặt sẵn trên bàn.'], ['Nam', 'A', '部屋のエアコンは？', 'へやのえあこんは？', 'Còn điều hòa phòng thì sao?'], ['Nữ', 'B', 'それは今からつけておきます。', 'それはいまからつけておきます。', 'Cái đó tôi sẽ bật sẵn ngay bây giờ.']], q: 'Người nữ sẽ làm gì ngay bây giờ?', o: ['Bật điều hòa', 'Photo tài liệu', 'Đặt tài liệu lên bàn', 'Chuẩn bị trà'], ex: 'Tài liệu đã xong, chỉ còn 「エアコンをつけておきます」.', kw: 'つけておきます', tip: '「〜てあります」 là đã xong, 「〜ておきます」 là sắp làm.' },
  { l: 32, lv: 'N4', m: 'mondai2', topic: 'Lời khuyên khi bị sốt', sit: 'Đồng nghiệp thấy sắc mặt không tốt.', lines: [['Nữ', 'A', '顔色が悪いですね。', 'かおいろがわるいですね。', 'Sắc mặt anh không tốt nhỉ.'], ['Nam', 'B', 'ええ、昨日から熱があるんです。', 'ええ、きのうからねつがあるんです。', 'Vâng, từ hôm qua tôi bị sốt.'], ['Nữ', 'A', '今日は早く帰って、休んだほうがいいですよ。', 'きょうははやくかえって、やすんだほうがいいですよ。', 'Hôm nay anh nên về sớm nghỉ ngơi.'], ['Nam', 'B', 'そうします。', 'そうします。', 'Tôi sẽ làm vậy.']], q: 'Người nam được khuyên làm gì?', o: ['Về sớm và nghỉ ngơi', 'Đi bệnh viện ngay', 'Làm việc thêm', 'Uống cà phê'], ex: 'Người nữ khuyên 「早く帰って、休んだほうがいい」.', kw: '休んだほうがいい', tip: 'Chú ý nội dung lời khuyên đứng sau 「〜たほうがいい」.' },
  { l: 34, lv: 'N4', m: 'mondai1', topic: 'Cách dùng máy', sit: 'Nhân viên hướng dẫn cách dùng máy mới.', lines: [['Nam', 'A', 'この機械はどう使いますか。', 'このきかいはどうつかいますか。', 'Máy này dùng như thế nào?'], ['Nữ', 'B', '説明書に書いてあるとおりに、まず赤いボタンを押してください。', 'せつめいしょにかいてあるとおりに、まずあかいぼたんをおしてください。', 'Làm theo hướng dẫn, trước hết hãy ấn nút đỏ.'], ['Nam', 'A', '分かりました。', 'わかりました。', 'Tôi hiểu rồi.']], q: 'Người nam cần làm gì đầu tiên?', o: ['Ấn nút đỏ', 'Cắm điện', 'Ấn nút xanh', 'Gọi nhân viên'], ex: 'Từ 「まず」 chỉ việc đầu tiên là 「赤いボタンを押す」.', kw: 'まず赤いボタン', tip: 'Từ 「まず」 luôn đánh dấu hành động đầu tiên.' },
  { l: 36, lv: 'N4', m: 'mondai2', topic: 'Đi bộ mỗi ngày', sit: 'Hai người nói về thói quen đi bộ.', lines: [['Nữ', 'A', '毎日歩いているんですか。', 'まいにちあるいているんですか。', 'Ngày nào anh cũng đi bộ à?'], ['Nam', 'B', 'ええ、健康のために、一日一時間歩くようにしています。', 'ええ、けんこうのために、いちにちいちじかんあるくようにしています。', 'Vâng, để giữ sức khỏe, tôi cố gắng đi bộ một giờ mỗi ngày.']], q: 'Tại sao người nam đi bộ mỗi ngày?', o: ['Để giữ sức khỏe', 'Vì không có xe', 'Để giảm cân thi đấu', 'Vì thích ngắm cảnh'], ex: 'Anh nói 「健康のために」.', kw: '健康のために', tip: '「〜ために」 nêu mục đích.' },
  { l: 38, lv: 'N4', m: 'mondai2', topic: 'Sở thích chụp ảnh', sit: 'Hai bạn trò chuyện về sở thích.', lines: [['Nữ', 'A', '趣味は何ですか。', 'しゅみはなんですか。', 'Sở thích của anh là gì?'], ['Nam', 'B', '写真を撮ることです。休みの日は山へ行って撮ります。', 'しゃしんをとることです。やすみのひはやまへいってとります。', 'Là chụp ảnh. Ngày nghỉ tôi lên núi chụp.'], ['Nữ', 'A', '私は料理を作ることです。', 'わたしはりょうりをつくることです。', 'Sở thích của tôi là nấu ăn.']], q: 'Sở thích của người nam là gì?', o: ['Chụp ảnh', 'Nấu ăn', 'Leo núi', 'Vẽ tranh'], ex: 'Anh nói 「写真を撮ること」; leo núi chỉ là nơi anh đi chụp.', kw: '写真を撮ること', tip: 'Phân biệt sở thích với nơi chốn hay phương tiện.' },
  { l: 39, lv: 'N4', m: 'mondai2', topic: 'Vì sao buồn ngủ', sit: 'Đồng nghiệp hỏi thăm vì thấy buồn ngủ.', lines: [['Nữ', 'A', '今日は元気がありませんね。', 'きょうはげんきがありませんね。', 'Hôm nay anh trông không khỏe nhỉ.'], ['Nam', 'B', '昨日、寝るのが遅かったので、眠いんです。', 'きのう、ねるのがおそかったので、ねむいんです。', 'Hôm qua tôi ngủ muộn nên buồn ngủ.'], ['Nữ', 'A', '何をしていたんですか。', 'なにをしていたんですか。', 'Anh đã làm gì vậy?'], ['Nam', 'B', '友達とゲームをしていました。', 'ともだちとげーむをしていました。', 'Tôi chơi game với bạn.']], q: 'Tại sao người nam buồn ngủ?', o: ['Hôm qua ngủ muộn vì chơi game', 'Bị ốm', 'Làm thêm đến khuya', 'Thức học bài'], ex: 'Nguyên nhân 「寝るのが遅かった」 vì 「ゲームをしていた」.', kw: 'ので và ゲーム', tip: 'Nghe hết câu để biết nguyên nhân gốc.' },
  { l: 42, lv: 'N4', m: 'mondai2', topic: 'Công dụng của thẻ', sit: 'Nhân viên giải thích về một chiếc thẻ.', lines: [['Nam', 'A', 'このカードは何に使いますか。', 'このかーどはなににつかいますか。', 'Thẻ này dùng để làm gì?'], ['Nữ', 'B', '電車に乗るのに使います。バスも乗れますよ。', 'でんしゃにのるのにつかいます。ばすものれますよ。', 'Dùng để đi tàu. Đi xe bus cũng được.']], q: 'Chiếc thẻ dùng để làm gì?', o: ['Đi tàu và xe bus', 'Mua đồ ăn', 'Vào thư viện', 'Rút tiền'], ex: 'Người nữ nói dùng 「電車に乗るのに」 và 「バスも乗れる」.', kw: '電車に乗るのに', tip: '「〜のに使います」 nêu công dụng.' },
  { l: 44, lv: 'N4', m: 'mondai2', topic: 'Nhận xét món ramen', sit: 'Hai người nói về bữa ăn vừa rồi.', lines: [['Nữ', 'A', 'ラーメンはいかがでしたか。', 'らーめんはいかがでしたか。', 'Ramen thế nào ạ?'], ['Nam', 'B', 'おいしかったですが、ちょっと量が多すぎました。', 'おいしかったですが、ちょっとりょうがおおすぎました。', 'Ngon nhưng hơi nhiều quá.'], ['Nữ', 'A', '半分、私が食べますよ。', 'はんぶん、わたしがたべますよ。', 'Để tôi ăn giúp một nửa.']], q: 'Người nam thấy món ramen thế nào?', o: ['Ngon nhưng nhiều quá', 'Dở và đắt', 'Ít quá', 'Ngon vừa đủ'], ex: 'Anh nói 「おいしかったが、量が多すぎた」.', kw: '多すぎました', tip: 'Chú ý ý sau chữ 「が」 vì đó là điểm chính.' },
  { l: 45, lv: 'N4', m: 'mondai2', topic: 'Quy định khi có bão', sit: 'Nhân viên hỏi về quy định nghỉ làm khi có bão.', lines: [['Nam', 'A', '台風が来た場合は、会社を休んでもいいですか。', 'たいふうがきたばあいは、かいしゃをやすんでもいいですか。', 'Khi bão đến có được nghỉ làm không?'], ['Nữ', 'B', '危ない場合は、休んでもいいです。ただし、連絡してください。', 'あぶないばあいは、やすんでもいいです。ただし、れんらくしてください。', 'Nếu nguy hiểm thì được nghỉ. Nhưng hãy liên lạc.']], q: 'Khi nào được nghỉ làm?', o: ['Khi nguy hiểm, nhưng phải liên lạc', 'Bão đến là nghỉ ngay không cần báo', 'Không được nghỉ', 'Chỉ khi có giấy bác sĩ'], ex: 'Quy định là 「危ない場合は休んでもいい、ただし連絡」.', kw: 'ただし連絡してください', tip: 'Từ 「ただし」 đi kèm điều kiện bổ sung.' }
];

const LETTERS = ['A', 'B', 'C', 'D'];

function pad2(n) {
  return n < 10 ? '0' + n : String(n);
}

function buildOptions(texts, rotation) {
  const arranged = texts.slice();
  for (let i = 0; i < rotation % 4; i++) {
    arranged.push(arranged.shift());
  }
  const correctText = texts[0];
  const opts = arranged.map(function (t, idx) {
    return { id: LETTERS[idx], text: t };
  });
  const found = opts.filter(function (o) { return o.text === correctText; })[0];
  return { opts: opts, answer: found.id };
}

const existing = new Set();
['N5', 'N4'].forEach(function (lv) {
  data[lv].forEach(function (t) { existing.add(t.topic); });
});

let nextId = 3000;
let added = 0;

QUICK.forEach(function (q, idx) {
  const lv = q[1];
  const topic = 'Bài ' + pad2(q[0]) + ' - Phần 4: Phản xạ ' + q[2];
  if (existing.has(topic)) return;
  const built = buildOptions([q[6], q[7], q[8], q[9]], idx);
  data[lv].push({
    id: nextId++,
    lesson: q[0],
    partName: 'Phần 4: Mondai 4 - Phản xạ nhanh',
    mondaiType: 'mondai4',
    topic: topic,
    situation: 'Nghe một câu ngắn và chọn câu đáp lại tự nhiên nhất.',
    audioText: q[3],
    dialogue: [{ speaker: 'Người nói', role: 'A', kanji: q[3], kana: q[4], vi: q[5] }],
    question: 'Hãy chọn câu đáp lại tự nhiên nhất:',
    options: built.opts,
    correctAnswer: built.answer,
    explanation: q[10] + ' Đáp án đúng là ' + built.answer + '.',
    keyword: q[11],
    tip: 'Nhận ra từ để hỏi hoặc mẫu câu rồi loại ngay các phương án trả lời sai câu hỏi.',
    level: lv
  });
  added++;
});

DIALOGS.forEach(function (d, idx) {
  const topic = 'Bài ' + pad2(d.l) + ' - Phần 5: ' + d.topic;
  if (existing.has(topic)) return;
  const built = buildOptions(d.o, idx + 1);
  data[d.lv].push({
    id: nextId++,
    lesson: d.l,
    partName: d.m === 'mondai1' ? 'Phần 5: Mondai 1 - Hiểu nhiệm vụ' : 'Phần 5: Mondai 2 - Điểm mấu chốt',
    mondaiType: d.m,
    topic: topic,
    situation: d.sit,
    audioText: d.lines.map(function (ln) { return ln[2]; }).join(''),
    dialogue: d.lines.map(function (ln) {
      return { speaker: ln[0], role: ln[1], kanji: ln[2], kana: ln[3], vi: ln[4] };
    }),
    question: d.q,
    options: built.opts,
    correctAnswer: built.answer,
    explanation: d.ex + ' Đáp án đúng là ' + built.answer + '.',
    keyword: d.kw,
    tip: d.tip,
    level: d.lv
  });
  added++;
});

['N5', 'N4'].forEach(function (lv) {
  data[lv].sort(function (a, b) {
    if (a.lesson !== b.lesson) return a.lesson - b.lesson;
    return a.id - b.id;
  });
});

const out = '// Hệ thống dữ liệu Luyện Nghe Choukai Đa Cấp Độ (N5 - N1)\n' +
  '// Bám sát giáo trình chuẩn Minna no Nihongo I và II, Soumatome, Shinkanzen Master và đề thi JLPT thật\n' +
  '// ZERO ARROWS RULE: Không dùng ký tự mũi tên\n\n' +
  'export const listeningTracksByLevel = ' + JSON.stringify(data, null, 2) + ';\n';

fs.writeFileSync(filePath, out, 'utf8');
console.log('Added tracks:', added, ' N5:', data.N5.length, ' N4:', data.N4.length);
