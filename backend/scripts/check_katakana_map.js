const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '../../database/n5_full_lessons.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// List of all katakana words across Minna no Nihongo N5 Lessons 1-25
// and their correct Katakana spelling
const katakanaMap = {
  // Lesson 1
  'わたし': null, // hiragana
  'あなた': null,
  'あのひと': null,
  'あのかた': null,
  'さん': null,
  'ちゃん': null,
  'くん': null,
  'じん': null,
  'せんせい': null,
  'きょうし': null,
  'がくせい': null,
  'かいしゃいん': null,
  'ぎんこういん': null,
  'いしゃ': null,
  'けんきゅうしゃ': null,
  'えんじにあ': 'エンジニア',
  'だいがく': null,
  'びょういん': null,
  'だれ': null,
  'どなた': null,
  'さい': null,
  'なんさい': null,
  'おいくつ': null,
  'はい': null,
  'いいえ': null,
  'あめりか': 'アメリカ',
  'いぎりす': 'イギリス',
  'いんど': 'インド',
  'いんどねしあ': 'インドネシア',
  'かんこく': null,
  'たい': 'タイ',
  'ちゅうごく': null,
  'どいつ': 'ドイツ',
  'にほん': null,
  'ぶらじる': 'ブラジル',
  'べとなむ': 'ベトナム',
  'ふらんす': 'フランス',
  'ろしあ': 'ロシア',
  'ふぃりぴん': 'フィリピン',
  'しんがぽーる': 'シンガポール',
  'すぺいん': 'スペイン',
  'めきしこ': 'メキシコ',

  // Lesson 2
  'これ': null, 'それ': null, 'あれ': null,
  'この': null, 'その': null, 'あの': null,
  'ほん': null, 'じしょ': null, 'ざっし': null, 'しんぶん': null,
  'のーと': 'ノート',
  'てちょう': null, 'めいし': null,
  'かーど': 'カード',
  'てれほんかーど': 'テレホンカード',
  'えんぴつ': null,
  'ぼーるぺん': 'ボールペン',
  'しゃーぷぺんしる': 'シャープペンシル',
  'かぎ': null, 'とけい': null, 'かさ': null, 'かばん': null,
  'てーぷ': 'テープ',
  'てーぷれこーだー': 'テープレコーダー',
  'てれび': 'テレビ',
  'らじお': 'ラジオ',
  'かめら': 'カメラ',
  'こんぴゅーたー': 'コンピューター',
  'じどうしゃ': null, 'くるま': null, 'つくえ': null, 'いす': null,

  // Lesson 3
  'ここ': null, 'そこ': null, 'あそこ': null, 'どこ': null,
  'こちら': null, 'そちら': null, 'あちら': null, 'どちら': null,
  'きょうしつ': null, 'しょくどう': null, 'じむしょ': null, 'かいぎしつ': null,
  'うけつけ': null,
  'ろびー': 'ロビー',
  'へや': null,
  'といれ': 'トイレ',
  'おてあらい': null,
  'かいだん': null,
  'えれべーたー': 'エレベーター',
  'えすかれーたー': 'エスカレーター',
  'じどうはんばいき': null, 'でんわ': null, 'くに': null, 'かいしゃ': null,
  'うち': null, 'くつ': null, 'ねくたい': 'ネクタイ',
  'わいん': 'ワイン',
  'たばこ': null,
  'うりば': null, 'ちか': null, 'かい': null, 'なんがい': null,
  'えん': null, 'いくら': null, 'ひゃく': null, 'せん': null, 'まん': null,
  'わーぷろ': 'ワープロ',
  'ぱそこん': 'パソコン',

  // Lesson 4
  'おきます': null, 'ねます': null, 'はたらきます': null, 'やすみます': null,
  'べんきょうします': null, 'おわります': null,
  'でぱーと': 'デパート',
  'ぎんこう': null, 'ゆうびんきょく': null, 'としょかん': null, 'びじゅつかん': null,
  'ぺきん': 'ペキン',
  'ばassoc': null,
  'ばある': null,
  'ばんこく': 'バンコク',
  'ろんどん': 'ロンドン',
  'にゅーよーく': 'ニューヨーク',

  // Lesson 5
  'いきます': null, 'きます': null, 'かえります': null,
  'がっこう': null, 'すーぱー': 'スーパー', 'えき': null,
  'ひこうき': null, 'ふね': null, 'でんしゃ': null, 'ちかてつ': null, 'しんかんせん': null,
  'ばす': 'バス',
  'たくしー': 'タクシー',
  'じてんしゃ': null, 'あるいて': null,

  // Lesson 6
  'たべます': null, 'のみます': null, 'すいます': null,
  'みます': null, 'ききます': null, 'よみます': null, 'かきます': null, 'かいます': null, 'とります': null, 'します': null, 'あいます': null,
  'ごはん': null, 'あさごはん': null, 'ひるごはん': null, 'ばんごはん': null,
  'ぱん': 'パン',
  'たまご': null, 'にく': null, 'さかな': null, 'やさい': null, 'くだもの': null,
  'みず': null, 'おちゃ': null, 'こうちゃ': null, 'ぎゅうにゅう': null, 'みるく': 'ミルク',
  'じゅーす': 'ジュース',
  'びーる': 'ビール',
  'おさけ': null,
  'びでお': 'ビデオ',
  'かせっと': 'カセット',
  'しーでぃー': 'CD',
  'ちょこれーと': 'チョコレート',
  'けーき': 'ケーキ',

  // Lesson 7
  'きります': null, 'おくります': null, 'あげます': null, 'もらいます': null, 'かします': null, 'かります': null, 'おしえます': null, 'ならいます': null, 'かけます': null,
  'て': null, 'はし': null,
  'すぷーん': 'スプーン',
  'ないふ': 'ナイフ',
  'ふぉーく': 'フォーク',
  'はさみ': null,
  'ふぁくす': 'ファクス',
  'ふぁっくす': 'ファクス',
  'わーぷろ': 'ワープロ',
  'ぱそこん': 'パソコン',
  'ぱんち': 'パンチ',
  'ほっちきす': 'ホッチキス',
  'せろてーぷ': 'セロテープ',
  'けしごむ': null, 'かみ': null, 'はな': null,
  'しゃつ': 'シャツ',
  'ぷれぜんと': 'プレゼント',
  'にもつ': null, 'おかね': null, 'きっぷ': null,
  'くりすます': 'クリスマス',

  // Lesson 8
  'はんさむ': 'ハンサム',
  'きれいに': null,
  'ほてる': 'ホテル',
  'すーぷ': 'スープ',
  'ぴんく': 'ピンク',
  'ぐれー': 'グレー',
  'べーじゅ': 'ベージュ',
  'しゃんはい': 'シャンハイ',

  // Lesson 9
  'すぽーつ': 'スポーツ',
  'やきゅう': null,
  'だんす': 'ダンス',
  'りょこう': null, 'おんがく': null, 'うた': null, 'くらしく': 'クラシック',
  'じゃず': 'ジャズ',
  'こんさーと': 'コンサート',
  'からおけ': 'カラオケ',
  'かぶき': null, 'え': null, 'じ': null, 'かんじ': null, 'ひらがな': null, 'かたかな': 'カタカナ',
  'ろーまじ': 'ローマ字',

  // Lesson 10
  'ぽすと': 'ポスト',
  'びる': 'ビル',
  'すーぱー': 'スーパー',
  'れすとらん': 'レストラン',
  'あぱーと': 'アパート',
  'まんしょん': 'マンション',
  'すいっち': 'スイッチ',
  'てーぶる': 'テーブル',
  'べっど': 'ベッド',
  'たな': null,
  'どあ': 'ドア',
  'まど': null,
  'かーてん': 'カーテン',
  'かれんだー': 'カレンダー',

  // Lesson 11
  'りんご': null, 'みかん': null,
  'さんどいっち': 'サンドイッチ',
  'かれー': 'カレー',
  'かれーらいす': 'カレーライス',
  'あいすくりーむ': 'アイスクリーム',
  'きって': null, 'はがき': null, 'ふうとう': null,

  // Lesson 12
  'ぷーる': 'プール',

  // Lesson 13
  'すきー': 'スキー',

  // Lesson 15
  'かたろぐ': 'カタログ',
  'そふとうぇあ': 'ソフトウェア',

  // Lesson 16
  'しゃわー': 'シャワー',

  // Lesson 17
  'ぼたん': 'ボタン',

  // Lesson 19
  'ぱちんこ': 'パチンコ',

  // Lesson 20
  'びざ': 'ビザ',

  // Lesson 21
  'しゅしょう': null,
  'だいとうりょう': null,

  // Lesson 22
  'こーと': 'コート',
  'すーつ': 'スーツ',
  'せーたー': 'セーター',
  'ぼうし': null,
  'めがね': null
};

// Search all lessons for kana that should be converted to Katakana
let fixedCount = 0;
for (const [l, words] of Object.entries(data)) {
  for (const w of words) {
    const k = (w.kana || '').replace(/[［\[］\]〜~・\s]/g, '');
    const cleanK = (w.clean_kana || w.kana || '').replace(/[［\[］\]〜~・\s]/g, '');
    
    // Check if in katakanaMap
    if (katakanaMap[k] || katakanaMap[cleanK]) {
      const correctKata = katakanaMap[k] || katakanaMap[cleanK];
      if (w.kana !== correctKata) {
        console.log(`L${l} id:${w.id || '-'} romaji:${w.romaji} kana='${w.kana}' -> FIX TO Katakana: '${correctKata}'`);
        fixedCount++;
      }
    }
  }
}
console.log(`\nTotal Katakana candidates matched: ${fixedCount}`);
