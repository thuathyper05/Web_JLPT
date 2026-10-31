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
 * Splits a word into Kanji segments with ruby furigana and plain Kana segments.
 * Example: '奥さん' (おくさん) chuyển thành [{ type: 'ruby', kanji: '奥', furigana: 'おく' }, { type: 'text', text: 'さん' }]
 * Words with no Kanji (e.g. 'はい', 'ありがとう') have no furigana above them.
 */
function parseFuriganaSegments(kanjiStr, kanaStr) {
  const cleanKanji = (kanjiStr || '').trim();
  const cleanKana = (kanaStr || '').trim();

  // If no Kanji characters exist in kanjiStr, display as plain text (no furigana above)
  if (!cleanKanji || !cleanKanji.split('').some(isKanji)) {
    return [{ type: 'text', text: cleanKana || cleanKanji }];
  }

  // If no kana provided, just display kanji as plain text
  if (!cleanKana) {
    return [{ type: 'text', text: cleanKanji }];
  }

  // 1. Strip common Kana prefix
  let prefixLen = 0;
  while (
    prefixLen < cleanKanji.length &&
    prefixLen < cleanKana.length &&
    !isKanji(cleanKanji[prefixLen]) &&
    cleanKanji[prefixLen] === cleanKana[prefixLen]
  ) {
    prefixLen++;
  }

  // 2. Strip common Kana suffix (okurigana, e.g. 'さん' in '奥さん', 'べる' in '食べる')
  let suffixLen = 0;
  while (
    suffixLen < (cleanKanji.length - prefixLen) &&
    suffixLen < (cleanKana.length - prefixLen) &&
    !isKanji(cleanKanji[cleanKanji.length - 1 - suffixLen]) &&
    cleanKanji[cleanKanji.length - 1 - suffixLen] === cleanKana[cleanKana.length - 1 - suffixLen]
  ) {
    suffixLen++;
  }

  const prefix = cleanKanji.slice(0, prefixLen);
  const suffix = suffixLen > 0 ? cleanKanji.slice(cleanKanji.length - suffixLen) : '';
  const midKanji = cleanKanji.slice(prefixLen, cleanKanji.length - suffixLen);
  const midKana = cleanKana.slice(prefixLen, cleanKana.length - suffixLen);

  const segments = [];
  if (prefix) {
    segments.push({ type: 'text', text: prefix });
  }

  if (midKanji) {
    if (midKanji.split('').some(isKanji) && midKana) {
      segments.push({ type: 'ruby', kanji: midKanji, furigana: midKana });
    } else {
      segments.push({ type: 'text', text: midKana || midKanji });
    }
  }

  if (suffix) {
    segments.push({ type: 'text', text: suffix });
  }

  return segments;
}

/**
 * FuriganaWord
 * Displays Japanese Kanji with small, elegant Furigana (Hiragana) ONLY directly above the Kanji glyph.
 * Okurigana (Kana suffixes like 'さん' in '奥さん') and pure Kana words remain plain text without furigana above.
 */
export default function FuriganaWord({
  kanji = '',
  kana = '',
  size = 'base',
  className = '',
  kanjiClassName = '',
  furiganaClassName = ''
}) {
  const sizeClasses = {
    xs: {
      kanji: 'text-xs',
      furigana: 'text-[8.5px] -mb-0.5'
    },
    sm: {
      kanji: 'text-sm',
      furigana: 'text-[9.5px] -mb-0.5'
    },
    base: {
      kanji: 'text-base',
      furigana: 'text-[10px] -mb-0.5'
    },
    lg: {
      kanji: 'text-lg',
      furigana: 'text-[11px] -mb-0.5'
    },
    xl: {
      kanji: 'text-xl',
      furigana: 'text-[11.5px] -mb-0.5'
    },
    '2xl': {
      kanji: 'text-2xl',
      furigana: 'text-xs -mb-1'
    },
    '3xl': {
      kanji: 'text-3xl sm:text-4xl',
      furigana: 'text-xs sm:text-sm -mb-1'
    },
    '4xl': {
      kanji: 'text-4xl sm:text-5xl',
      furigana: 'text-sm sm:text-base -mb-1'
    },
    '5xl': {
      kanji: 'text-5xl sm:text-6xl',
      furigana: 'text-base sm:text-lg -mb-1.5'
    },
    '6xl': {
      kanji: 'text-6xl sm:text-7xl',
      furigana: 'text-lg sm:text-xl -mb-2'
    }
  };

  const currentSize = sizeClasses[size] || sizeClasses.base;
  const segments = parseFuriganaSegments(kanji, kana);

  return (
    <span className={`inline-flex items-baseline justify-center font-jp select-text ${className}`}>
      {segments.map((seg, idx) => {
        if (seg.type === 'ruby') {
          return (
            <ruby
              key={idx}
              className="inline-flex flex-col items-center justify-end leading-none align-baseline px-[0.5px]"
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
            className={`font-black text-slate-900 leading-tight tracking-normal self-end align-baseline ${currentSize.kanji} ${kanjiClassName}`}
          >
            {seg.text}
          </span>
        );
      })}
    </span>
  );
}
