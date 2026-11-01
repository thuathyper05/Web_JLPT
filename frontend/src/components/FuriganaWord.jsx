import React from 'react';

function toHiragana(str) {
  if (!str) return '';
  return str.replace(/[\u30a1-\u30f6]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  );
}

/**
 * Checks if a character is a CJK Unified Ideograph (Kanji) or Kanji iteration mark
 */
function isKanji(ch) {
  if (!ch) return false;
  const code = ch.charCodeAt(0);
  return (
    (code >= 0x4e00 && code <= 0x9fff) || // CJK Unified Ideographs
    (code >= 0x3400 && code <= 0x4dbf) || // CJK Extension A
    (code >= 0xf900 && code <= 0xfaff) || // CJK Compatibility Ideographs
    code === 0x3005 || // 々 (Ideographic iteration mark)
    code === 0x3006 || // 〆
    code === 0x30f6    // ヶ (e.g. in 一ヶ月)
  );
}

function areKanaEqual(ch1, ch2) {
  if (!ch1 || !ch2) return false;
  if (ch1 === ch2) return true;
  return toHiragana(ch1) === toHiragana(ch2);
}

/**
 * Parses a single variant without separators or outer bracket notes
 */
function parseSingleVariant(kText, rText) {
  if (!kText) return rText ? [{ type: 'text', text: rText }] : [];
  if (!rText) return [{ type: 'text', text: kText }];

  // If no kanji remains in kText, return as plain text
  if (!kText.split('').some(isKanji)) {
    return [{ type: 'text', text: kText }];
  }

  // Normalize leading symbols/tildes
  const leadSym = kText.match(/^([～〜…・\s]+)/);
  if (leadSym) {
    const sym = leadSym[1];
    let remR = rText;
    if (rText.startsWith(sym)) {
      remR = rText.slice(sym.length);
    } else if (rText.startsWith(sym.trim()) && sym.trim().length > 0) {
      remR = rText.slice(sym.trim().length);
    }
    return [{ type: 'text', text: sym }, ...parseSingleVariant(kText.slice(sym.length), remR)];
  }

  // Trailing symbols/punctuation (e.g. ？, ?, 。, !)
  const trailSym = kText.match(/([～〜…・\s？！\?!。]+)$/);
  if (trailSym) {
    const sym = trailSym[1];
    let remR = rText;
    const rTrailMatch = rText.match(/([～〜…・\s？！\?!。]+)$/);
    if (rTrailMatch) {
      remR = rText.slice(0, rText.length - rTrailMatch[1].length);
    }
    return [...parseSingleVariant(kText.slice(0, kText.length - sym.length), remR), { type: 'text', text: sym }];
  }

  // If both kText and rText contain whitespace-separated tokens, match token by token
  const kWords = kText.split(/\s+/).filter(Boolean);
  const rWords = rText.split(/\s+/).filter(Boolean);
  if (kWords.length > 1 && kWords.length === rWords.length) {
    const result = [];
    kWords.forEach((kw, idx) => {
      if (idx > 0) result.push({ type: 'text', text: ' ' });
      result.push(...parseSingleVariant(kw, rWords[idx]));
    });
    return result;
  }

  // 1. Strip common prefix (plain Kana, Katakana vs Hiragana matching)
  let pK = 0;
  let pR = 0;
  while (pK < kText.length && pR < rText.length && !isKanji(kText[pK])) {
    if (/\s/.test(rText[pR]) && !/\s/.test(kText[pK])) {
      pR++;
      continue;
    }
    if (areKanaEqual(kText[pK], rText[pR])) {
      pK++;
      pR++;
    } else {
      break;
    }
  }
  if (pK > 0) {
    const pref = kText.slice(0, pK);
    return [{ type: 'text', text: pref }, ...parseSingleVariant(kText.slice(pK), rText.slice(pR))];
  }

  // 2. Strip common suffix (plain Kana, Katakana vs Hiragana matching)
  let sK = 0;
  let sR = 0;
  while (
    sK < kText.length &&
    sR < rText.length &&
    !isKanji(kText[kText.length - 1 - sK])
  ) {
    if (/\s/.test(rText[rText.length - 1 - sR]) && !/\s/.test(kText[kText.length - 1 - sK])) {
      sR++;
      continue;
    }
    if (areKanaEqual(kText[kText.length - 1 - sK], rText[rText.length - 1 - sR])) {
      sK++;
      sR++;
    } else {
      break;
    }
  }
  if (sK > 0) {
    const suff = kText.slice(kText.length - sK);
    const midK = kText.slice(0, kText.length - sK);
    const midR = rText.slice(0, rText.length - sR);
    return [...parseSingleVariant(midK, midR), { type: 'text', text: suff }];
  }

  // 3. Look for internal non-kanji in kText that also appears in rText
  let firstNonKanjiIdx = -1;
  for (let i = 0; i < kText.length; i++) {
    if (!isKanji(kText[i])) {
      firstNonKanjiIdx = i;
      break;
    }
  }

  if (firstNonKanjiIdx > 0) {
    let nonKanjiEnd = firstNonKanjiIdx;
    while (nonKanjiEnd < kText.length && !isKanji(kText[nonKanjiEnd])) {
      nonKanjiEnd++;
    }
    const nonKanjiBlock = kText.slice(firstNonKanjiIdx, nonKanjiEnd);
    const cleanBlockHira = toHiragana(nonKanjiBlock.replace(/\s+/g, ''));
    const rTextHira = toHiragana(rText);

    let rIdx = cleanBlockHira ? rTextHira.indexOf(cleanBlockHira, 1) : -1;
    if (rIdx > 0) {
      const leftK = kText.slice(0, firstNonKanjiIdx);
      const leftR = rText.slice(0, rIdx);
      const rightK = kText.slice(nonKanjiEnd);
      const rightR = rText.slice(rIdx + cleanBlockHira.length);
      return [
        ...parseSingleVariant(leftK, leftR),
        { type: 'text', text: nonKanjiBlock },
        ...parseSingleVariant(rightK, rightR)
      ];
    }
  }

  // Pure kanji block: associate ruby directly above the kanji character(s)
  return [{ type: 'ruby', kanji: kText, furigana: rText.replace(/\s+/g, '') }];
}

/**
 * Advanced Furigana Segmenter:
 * Breaks Japanese words into precise Kanji blocks with ruby annotations and plain Kana segments.
 * Accurately handles:
 * - Separators (e.g. '探します、捜します' with 'さがします')
 * - Auxiliary bracket notes (e.g. '遅れます［時間に～］' with 'おくれます', '［お］弁当')
 * - Okurigana (e.g. 'ます' in '探します')
 */
function parseFuriganaSegments(kanjiStr, kanaStr) {
  let cleanK = (kanjiStr || '').trim();
  let cleanR = (kanaStr || '').trim();

  // If no Kanji characters exist, display as plain text without ruby
  if (!cleanK || !cleanK.split('').some(isKanji)) {
    return [{ type: 'text', text: cleanR || cleanK }];
  }

  // If no kana provided, display kanji as plain text
  if (!cleanR) {
    return [{ type: 'text', text: cleanK }];
  }

  // 1. Handle bracketed context suffix like '遅れます［時間に～］' or 'お先に［失礼します］。'
  const trailingBracketMatch = cleanK.match(/^(.+?)\s*([［\[（(].+?[］\]）)])[。.]*$/);
  if (trailingBracketMatch) {
    const mainK = trailingBracketMatch[1];
    const bracketNote = trailingBracketMatch[2];
    let mainR = cleanR;
    const rTrailingMatch = cleanR.match(/^(.+?)\s*([［\[（(].+?[］\]）)])[。.]*$/);
    if (rTrailingMatch) mainR = rTrailingMatch[1];
    const mainSegments = parseFuriganaSegments(mainK, mainR);
    return [...mainSegments, { type: 'text', text: ' ' + bracketNote, isNote: true }];
  }

  // 2. Handle leading bracket notation like '［お］弁当' or '［いろいろ］お世話に なりました。'
  const leadingBracketMatch = cleanK.match(/^([［\[（(].+?[］\]）)])\s*(.+)$/);
  if (leadingBracketMatch) {
    const bracketNote = leadingBracketMatch[1];
    const mainK = leadingBracketMatch[2];
    let mainR = cleanR;
    const rLeadMatch = cleanR.match(/^([［\[（(].+?[］\]）)])\s*(.+)$/);
    if (rLeadMatch) mainR = rLeadMatch[2];
    const mainSegments = parseFuriganaSegments(mainK, mainR);
    return [{ type: 'text', text: bracketNote + ' ', isNote: true }, ...mainSegments];
  }

  // 3. Handle multiple variants separated by comma '、' or ',' or '／' or '/'
  if (cleanK.includes('、') || cleanK.includes(',') || cleanK.includes('／') || cleanK.includes('/')) {
    const sep = cleanK.includes('、') ? '、' : cleanK.includes(',') ? ',' : cleanK.includes('／') ? '／' : '/';
    const variants = cleanK.split(sep).map((v) => v.trim()).filter(Boolean);
    const result = [];
    variants.forEach((v, idx) => {
      if (idx > 0) {
        result.push({ type: 'text', text: sep + ' ' });
      }
      result.push(...parseSingleVariant(v, cleanR));
    });
    return result;
  }

  return parseSingleVariant(cleanK, cleanR);
}

/**
 * FuriganaWord
 * Displays Japanese Kanji with small, elegant Furigana (Hiragana) ONLY directly above the Kanji glyph.
 * Okurigana (Kana suffixes like 'ます' in '探します') and pure Kana words remain plain text without furigana above.
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
      furigana: 'text-[8px] -mb-0.5',
      romaji: 'text-[9px]'
    },
    sm: {
      kanji: 'text-sm',
      furigana: 'text-[8.5px] -mb-0.5',
      romaji: 'text-[10px]'
    },
    base: {
      kanji: 'text-base sm:text-lg',
      furigana: 'text-[9.5px] sm:text-[10.5px] -mb-0.5 font-bold',
      romaji: 'text-[11px]'
    },
    lg: {
      kanji: 'text-lg sm:text-xl',
      furigana: 'text-[10.5px] sm:text-[11.5px] -mb-0.5 font-bold',
      romaji: 'text-xs'
    },
    xl: {
      kanji: 'text-xl sm:text-2xl',
      furigana: 'text-xs sm:text-[13px] -mb-0.5 font-bold',
      romaji: 'text-xs'
    },
    '2xl': {
      kanji: 'text-2xl sm:text-3xl',
      furigana: 'text-xs sm:text-sm -mb-1 font-bold',
      romaji: 'text-xs'
    },
    '3xl': {
      kanji: 'text-3xl sm:text-4xl',
      furigana: 'text-xs sm:text-sm -mb-1 font-bold',
      romaji: 'text-sm'
    },
    '4xl': {
      kanji: 'text-4xl sm:text-5xl',
      furigana: 'text-sm sm:text-base -mb-1 font-bold',
      romaji: 'text-sm sm:text-base'
    },
    '5xl': {
      kanji: 'text-5xl sm:text-6xl',
      furigana: 'text-base sm:text-lg -mb-1.5 font-bold',
      romaji: 'text-base'
    },
    '6xl': {
      kanji: 'text-6xl sm:text-7xl',
      furigana: 'text-lg sm:text-xl -mb-2 font-bold',
      romaji: 'text-lg'
    }
  };

  const currentSize = sizeClasses[size] || sizeClasses.base;
  const segments = parseFuriganaSegments(kanji, kana);

  return (
    <div className={`inline-flex flex-col items-center justify-center font-jp ${className}`}>
      {/* Kanji & Furigana Row */}
      <span className="inline-flex items-end justify-center font-jp select-text leading-none flex-wrap">
        {segments.map((seg, idx) => {
          if (seg.type === 'ruby') {
            return (
              <ruby
                key={idx}
                className="inline-flex flex-col items-center justify-end leading-none align-bottom px-[1px]"
              >
                <rt
                  className={`font-jp font-bold text-pink-600 tracking-tighter leading-none select-none text-center block w-full whitespace-nowrap ${currentSize.furigana} ${furiganaClassName}`}
                >
                  {seg.furigana}
                </rt>
                <span
                  className={`font-black text-slate-900 leading-tight tracking-normal block text-center whitespace-nowrap ${currentSize.kanji} ${kanjiClassName}`}
                >
                  {seg.kanji}
                </span>
              </ruby>
            );
          }

          if (seg.isNote) {
            return (
              <span
                key={idx}
                className={`font-medium text-slate-400 leading-tight tracking-normal self-end align-bottom text-[0.8em] pb-0.5 ${kanjiClassName}`}
              >
                {seg.text}
              </span>
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
