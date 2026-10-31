import React from 'react';

/**
 * Checks if a character is a CJK Unified Ideograph (Kanji)
 */
function isKanji(ch) {
  if (!ch) return false;
  const code = ch.charCodeAt(0);
  return (
    (code >= 0x4e00 && code <= 0x9fff) || // CJK Unified Ideographs
    (code >= 0x3400 && code <= 0x4dbf) || // CJK Extension A
    (code >= 0xf900 && code <= 0xfaff)    // CJK Compatibility Ideographs
  );
}

/**
 * Advanced Furigana Segmenter:
 * Breaks Japanese words into precise Kanji blocks with ruby annotations and plain Kana segments.
 *
 * Examples:
 * - '奥さん' (おくさん) => [{ type: 'ruby', kanji: '奥', furigana: 'おく' }, { type: 'text', text: 'さん' }]
 * - '食べます' (たべます) => [{ type: 'ruby', kanji: '食', furigana: 'た' }, { type: 'text', text: 'べます' }]
 * - '飲み物' (のみもの) => [{ type: 'ruby', kanji: '飲', furigana: 'の' }, { type: 'text', text: 'み' }, { type: 'ruby', kanji: '物', furigana: 'もの' }]
 * - 'お茶' (おちゃ) => [{ type: 'text', text: 'お' }, { type: 'ruby', kanji: '茶', furigana: 'ちゃ' }]
 * - Pure Kana (e.g. 'ありがとう', 'テニス') => [{ type: 'text', text: '...' }] (NO furigana above)
 */
function parseFuriganaSegments(kanjiStr, kanaStr) {
  const cleanKanji = (kanjiStr || '').trim();
  const cleanKana = (kanaStr || '').trim();

  // If no Kanji characters exist, display as plain text without ruby
  if (!cleanKanji || !cleanKanji.split('').some(isKanji)) {
    return [{ type: 'text', text: cleanKana || cleanKanji }];
  }

  // If no kana provided, display kanji as plain text
  if (!cleanKana) {
    return [{ type: 'text', text: cleanKanji }];
  }

  function matchSegments(kText, rText) {
    if (!kText) {
      return rText ? [{ type: 'text', text: rText }] : [];
    }
    if (!rText) {
      return [{ type: 'text', text: kText }];
    }

    // If no kanji remains in kText, return as plain text
    if (!kText.split('').some(isKanji)) {
      return [{ type: 'text', text: kText }];
    }

    // 1. Strip common prefix (plain Kana, e.g. 'お' in 'お茶')
    let p = 0;
    while (p < kText.length && p < rText.length && !isKanji(kText[p]) && kText[p] === rText[p]) {
      p++;
    }
    if (p > 0) {
      const pref = kText.slice(0, p);
      return [{ type: 'text', text: pref }, ...matchSegments(kText.slice(p), rText.slice(p))];
    }

    // 2. Strip common suffix (plain Kana, e.g. 'さん' in '奥さん', 'べます' in '食べます')
    let s = 0;
    while (
      s < kText.length &&
      s < rText.length &&
      !isKanji(kText[kText.length - 1 - s]) &&
      kText[kText.length - 1 - s] === rText[rText.length - 1 - s]
    ) {
      s++;
    }
    if (s > 0) {
      const suff = kText.slice(kText.length - s);
      const midK = kText.slice(0, kText.length - s);
      const midR = rText.slice(0, rText.length - s);
      return [...matchSegments(midK, midR), { type: 'text', text: suff }];
    }

    // 3. Look for internal kana in kText that also appears in rText (e.g. 'み' in '飲み物')
    let firstKanaIdx = -1;
    for (let i = 0; i < kText.length; i++) {
      if (!isKanji(kText[i])) {
        firstKanaIdx = i;
        break;
      }
    }

    if (firstKanaIdx > 0) {
      let kanaBlockEnd = firstKanaIdx;
      while (kanaBlockEnd < kText.length && !isKanji(kText[kanaBlockEnd])) {
        kanaBlockEnd++;
      }
      const kanaBlock = kText.slice(firstKanaIdx, kanaBlockEnd);
      const rIdx = rText.indexOf(kanaBlock, 1);
      if (rIdx > 0) {
        const leftK = kText.slice(0, firstKanaIdx);
        const leftR = rText.slice(0, rIdx);
        const rightK = kText.slice(kanaBlockEnd);
        const rightR = rText.slice(rIdx + kanaBlock.length);
        return [
          ...matchSegments(leftK, leftR),
          { type: 'text', text: kanaBlock },
          ...matchSegments(rightK, rightR)
        ];
      }
    }

    // Single kanji or indivisible compound: associate ruby
    return [{ type: 'ruby', kanji: kText, furigana: rText }];
  }

  return matchSegments(cleanKanji, cleanKana);
}

/**
 * FuriganaWord
 * Displays Japanese Kanji with small, elegant Furigana (Hiragana) ONLY directly above the Kanji glyph.
 * Okurigana (Kana suffixes like 'さん' in '奥さん') and pure Kana words remain plain text without furigana above.
 */
export default function FuriganaWord({
  kanji = '',
  kana = '',
  romaji = '',
  showRomaji = false,
  size = 'base',
  className = '',
  kanjiClassName = '',
  furiganaClassName = '',
  romajiClassName = ''
}) {
  const sizeClasses = {
    xs: {
      kanji: 'text-xs',
      furigana: 'text-[8.5px] -mb-0.5',
      romaji: 'text-[9px]'
    },
    sm: {
      kanji: 'text-sm',
      furigana: 'text-[9.5px] -mb-0.5',
      romaji: 'text-[10px]'
    },
    base: {
      kanji: 'text-base',
      furigana: 'text-[10px] -mb-0.5',
      romaji: 'text-[11px]'
    },
    lg: {
      kanji: 'text-lg',
      furigana: 'text-[11px] -mb-0.5',
      romaji: 'text-xs'
    },
    xl: {
      kanji: 'text-xl',
      furigana: 'text-[11.5px] -mb-0.5',
      romaji: 'text-xs'
    },
    '2xl': {
      kanji: 'text-2xl',
      furigana: 'text-xs -mb-1',
      romaji: 'text-xs'
    },
    '3xl': {
      kanji: 'text-3xl sm:text-4xl',
      furigana: 'text-xs sm:text-sm -mb-1',
      romaji: 'text-sm'
    },
    '4xl': {
      kanji: 'text-4xl sm:text-5xl',
      furigana: 'text-sm sm:text-base -mb-1',
      romaji: 'text-sm sm:text-base'
    },
    '5xl': {
      kanji: 'text-5xl sm:text-6xl',
      furigana: 'text-base sm:text-lg -mb-1.5',
      romaji: 'text-base'
    },
    '6xl': {
      kanji: 'text-6xl sm:text-7xl',
      furigana: 'text-lg sm:text-xl -mb-2',
      romaji: 'text-lg'
    }
  };

  const currentSize = sizeClasses[size] || sizeClasses.base;
  const segments = parseFuriganaSegments(kanji, kana);

  return (
    <div className={`inline-flex flex-col items-center justify-center font-jp ${className}`}>
      {/* Kanji & Furigana Row */}
      <span className="inline-flex items-end justify-center font-jp select-text leading-none">
        {segments.map((seg, idx) => {
          if (seg.type === 'ruby') {
            return (
              <ruby
                key={idx}
                className="inline-flex flex-col items-center justify-end leading-none align-bottom px-[0.5px]"
              >
                <rt
                  className={`font-jp font-bold text-pink-600 tracking-tighter leading-none select-none text-center block ${currentSize.furigana} ${furiganaClassName}`}
                >
                  {seg.furigana}
                </rt>
                <span
                  className={`font-black text-slate-900 leading-tight tracking-normal block ${currentSize.kanji} ${kanjiClassName}`}
                >
                  {seg.kanji}
                </span>
              </ruby>
            );
          }

          return (
            <span
              key={idx}
              className={`font-black text-slate-900 leading-tight tracking-normal self-end align-bottom ${currentSize.kanji} ${kanjiClassName}`}
            >
              {seg.text}
            </span>
          );
        })}
      </span>

      {/* Optional Romaji subtitle */}
      {showRomaji && romaji && (
        <span
          className={`font-sans font-medium text-slate-400 mt-1 tracking-wide select-text ${currentSize.romaji} ${romajiClassName}`}
        >
          {romaji}
        </span>
      )}
    </div>
  );
}
