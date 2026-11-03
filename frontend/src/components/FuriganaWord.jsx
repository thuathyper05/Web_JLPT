import React from 'react';
import { useApp } from '../context/AppContext';
import { n5n4FuriganaDict } from '../data/n5n4FuriganaDict';

export function toHiragana(str) {
  if (!str) return '';
  return str.replace(/[\u30a1-\u30f6]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  );
}

/**
 * Checks if a character is a CJK Unified Ideograph (Kanji) or Kanji iteration mark
 */
export function isKanji(ch) {
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

export function areKanaEqual(ch1, ch2) {
  if (!ch1 || !ch2) return false;
  if (ch1 === ch2) return true;
  return toHiragana(ch1) === toHiragana(ch2);
}

/**
 * Comprehensive Hepburn Romaji mapping table
 */
const hepburnMap = {
  'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
  'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
  'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
  'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
  'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
  'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
  'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
  'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
  'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
  'わ': 'wa', 'を': 'o', 'ん': 'n',
  'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
  'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
  'だ': 'da', 'ぢ': 'ji', 'づ': 'zu', 'で': 'de', 'ど': 'do',
  'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
  'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',
  'きゃ': 'kya', 'きゅ': 'kyu', 'きょ': 'kyo',
  'しゃ': 'sha', 'しゅ': 'shu', 'しょ': 'sho',
  'ちゃ': 'cha', 'ちゅ': 'chu', 'ちょ': 'cho',
  'にゃ': 'nya', 'にゅ': 'nyu', 'にょ': 'nyo',
  'ひゃ': 'hya', 'ひゅ': 'hyu', 'ひょ': 'hyo',
  'みゃ': 'mya', 'みゅ': 'myu', 'みょ': 'myo',
  'りゃ': 'rya', 'りゅ': 'ryu', 'りょ': 'ryo',
  'ぎゃ': 'gya', 'ぎゅ': 'gyu', 'ぎょ': 'gyo',
  'じゃ': 'ja', 'じゅ': 'ju', 'じょ': 'jo',
  'びゃ': 'bya', 'びゅ': 'byu', 'びょ': 'byo',
  'ぴゃ': 'pya', 'ぴゅ': 'pyu', 'ぴょ': 'pyo',
  'ふぁ': 'fa', 'ふぃ': 'fi', 'ふぇ': 'fe', 'ふぉ': 'fo',
  'てぃ': 'ti', 'でぃ': 'di', 'とぅ': 'tu', 'どぅ': 'du',
  'うぃ': 'wi', 'うぇ': 'we', 'うぉ': 'wo',
  'ゔ': 'vu', 'ゔぁ': 'va', 'ゔぃ': 'vi', 'ゔぇ': 've', 'ゔぉ': 'vo',
  'しぇ': 'she', 'じぇ': 'je', 'ちぇ': 'che'
};

/**
 * Converts Hiragana or Katakana string to clean Hepburn Romaji
 */
export function toHepburnRomaji(str) {
  if (!str) return '';
  const hira = toHiragana(str);
  let result = '';
  let i = 0;

  while (i < hira.length) {
    // Sokuon (small tsu っ or ッ)
    if (hira[i] === 'っ' || hira[i] === 'ッ') {
      const nextTwo = hira.slice(i + 1, i + 3);
      const nextOne = hira.slice(i + 1, i + 2);
      const rom = hepburnMap[nextTwo] || hepburnMap[nextOne] || '';
      if (rom) {
        result += rom[0] === 'c' ? 't' : rom[0];
      }
      i++;
      continue;
    }

    // Chouonpu (ー)
    if (hira[i] === 'ー') {
      const lastChar = result[result.length - 1];
      if (lastChar && 'aeiou'.includes(lastChar)) {
        result += lastChar;
      }
      i++;
      continue;
    }

    // Two-character combination (y-sounds)
    const two = hira.slice(i, i + 2);
    if (hepburnMap[two]) {
      result += hepburnMap[two];
      i += 2;
      continue;
    }

    // Single character
    const one = hira.slice(i, i + 1);
    if (hepburnMap[one]) {
      result += hepburnMap[one];
      i += 1;
      continue;
    }

    result += hira[i];
    i++;
  }

  return result;
}

/**
 * Safely accesses useApp without crashing outside AppProvider
 */
function useSafeApp() {
  try {
    return useApp();
  } catch {
    return null;
  }
}

/**
 * Parses a single variant without separators or outer bracket notes
 */
function parseSingleVariant(kText, rText) {
  if (
    !kText ||
    kText === '-' ||
    kText === '–' ||
    kText === '—' ||
    !/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3400-\u4DBF]/.test(kText)
  ) {
    return rText ? [{ type: 'text', text: rText }] : [];
  }
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

    const rIdx = cleanBlockHira ? rTextHira.indexOf(cleanBlockHira, 1) : -1;
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
 */
export function parseFuriganaSegments(kanjiStr, kanaStr) {
  let cleanK = (kanjiStr || '').trim();
  let cleanR = (kanaStr || '').trim();

  if (
    !cleanK ||
    cleanK === '-' ||
    cleanK === '–' ||
    cleanK === '—' ||
    !/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3400-\u4DBF]/.test(cleanK)
  ) {
    cleanK = '';
  }

  // If no Kanji characters exist, display as plain text without ruby
  if (!cleanK || !cleanK.split('').some(isKanji)) {
    return [{ type: 'text', text: cleanK || cleanR }];
  }

  // If no kana provided, display kanji as plain text
  if (!cleanR) {
    return [{ type: 'text', text: cleanK }];
  }

  // 1. Handle bracketed context suffix like '遅れます［時間に～］'
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

  // 2. Handle leading bracket notation like '［お］弁当'
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
 * Displays Japanese Kanji with small, elegant Furigana (Hiragana/Katakana) directly above the Kanji glyph.
 * Level N5 and N4: Furigana and Romaji are active.
 * Level N3, N2, N1: Displays clean standard Kanji (unless forceFurigana is enabled).
 */
export default function FuriganaWord({
  kanji = '',
  kana = '',
  romaji = '',
  showRomaji = null,
  level = null,
  forceFurigana = false,
  size = 'base',
  className = '',
  kanjiClassName = '',
  furiganaClassName = '',
  romajiClassName = ''
}) {
  const appCtx = useSafeApp();
  const currentAppLevel = appCtx?.currentLevel || 'N5';
  const activeLevel = (level || currentAppLevel).toUpperCase();

  // Condition: Only apply for N5 and N4
  const isN5N4 = forceFurigana || activeLevel === 'N5' || activeLevel === 'N4';
  const shouldShowRomaji = showRomaji !== null ? showRomaji : isN5N4;

  const sizeClasses = {
    xs: {
      kanji: 'text-xs',
      furigana: 'text-[8px]',
      romaji: 'text-[9px]'
    },
    sm: {
      kanji: 'text-sm',
      furigana: 'text-[8.5px]',
      romaji: 'text-[10px]'
    },
    base: {
      kanji: 'text-base sm:text-lg',
      furigana: 'text-[9.5px] sm:text-[10px]',
      romaji: 'text-[11px]'
    },
    lg: {
      kanji: 'text-lg sm:text-xl',
      furigana: 'text-[10px] sm:text-[11px]',
      romaji: 'text-xs'
    },
    xl: {
      kanji: 'text-xl sm:text-2xl',
      furigana: 'text-xs sm:text-[12.5px]',
      romaji: 'text-xs'
    },
    '2xl': {
      kanji: 'text-2xl sm:text-3xl',
      furigana: 'text-xs sm:text-[13px]',
      romaji: 'text-xs'
    },
    '3xl': {
      kanji: 'text-3xl sm:text-4xl',
      furigana: 'text-xs sm:text-sm',
      romaji: 'text-sm'
    },
    '4xl': {
      kanji: 'text-4xl sm:text-5xl',
      furigana: 'text-sm sm:text-base',
      romaji: 'text-sm sm:text-base'
    },
    '5xl': {
      kanji: 'text-5xl sm:text-6xl',
      furigana: 'text-sm sm:text-base',
      romaji: 'text-base'
    },
    '6xl': {
      kanji: 'text-6xl sm:text-7xl',
      furigana: 'text-base sm:text-lg',
      romaji: 'text-lg'
    }
  };

  const currentSize = sizeClasses[size] || sizeClasses.base;
  const cleanK = (kanji || '').trim();
  const cleanR = (kana || '').trim();

  // If level is NOT N5 or N4 (N3, N2, N1) and not forced:
  // Display standard clean text without ruby on top
  if (!isN5N4) {
    const displayText = (cleanK && cleanK !== '-' && cleanK !== '–' && cleanK !== '—') ? cleanK : cleanR;
    return (
      <span
        className={`inline-flex items-center font-jp font-black text-slate-900 select-text leading-none ${currentSize.kanji} ${kanjiClassName} ${className}`}
      >
        {displayText}
      </span>
    );
  }

  // N5 and N4 Level: Parse Furigana segments
  const segments = parseFuriganaSegments(cleanK, cleanR);

  // Compute Romaji
  const effectiveRomaji = (romaji || '').trim() || toHepburnRomaji(cleanR || cleanK);

  return (
    <div className={`inline-flex flex-col items-center justify-center font-jp ${className}`}>
      {/* Kanji and Furigana Row */}
      <span className="inline-flex items-end justify-center font-jp select-text leading-none flex-wrap">
        {segments.map((seg, idx) => {
          if (seg.type === 'ruby') {
            const kLen = (seg.kanji || '').length;
            const fLen = (seg.furigana || '').length;

            let fontRatio = 'text-[0.40em]';
            let trackingClass = 'tracking-tight';
            let scaleClass = '';

            if (kLen === 1) {
              if (fLen === 1) {
                fontRatio = 'text-[0.48em]';
                trackingClass = 'tracking-normal';
              } else if (fLen === 2) {
                fontRatio = 'text-[0.38em]';
                trackingClass = 'tracking-tighter';
              } else if (fLen >= 3) {
                fontRatio = 'text-[0.30em]';
                trackingClass = 'tracking-tighter';
                scaleClass = 'scale-x-95';
              }
            } else {
              const ratio = fLen / kLen;
              if (ratio <= 1.2) {
                fontRatio = 'text-[0.45em]';
                trackingClass = 'tracking-normal';
              } else if (ratio <= 2) {
                fontRatio = 'text-[0.38em]';
                trackingClass = 'tracking-tight';
              } else {
                fontRatio = 'text-[0.32em]';
                trackingClass = 'tracking-tighter';
                scaleClass = 'scale-x-95';
              }
            }

            return (
              <span
                key={idx}
                className="inline-flex flex-col items-center justify-end align-bottom leading-none mx-[0.5px]"
              >
                <span
                  className={`font-jp font-bold text-pink-600 select-none text-center block w-full leading-none whitespace-nowrap mb-0.5 ${currentSize.furigana} ${fontRatio} ${trackingClass} ${scaleClass} ${furiganaClassName}`}
                >
                  {seg.furigana}
                </span>
                <span
                  className={`font-black text-slate-900 leading-none block text-center whitespace-nowrap ${currentSize.kanji} ${kanjiClassName}`}
                >
                  {seg.kanji}
                </span>
              </span>
            );
          }

          if (seg.isNote) {
            return (
              <span
                key={idx}
                className={`font-medium text-slate-400 leading-none tracking-normal self-end align-bottom text-[0.8em] pb-0.5 ${kanjiClassName}`}
              >
                {seg.text}
              </span>
            );
          }

          return (
            <span
              key={idx}
              className={`font-black text-slate-900 leading-none tracking-normal self-end align-bottom whitespace-nowrap ${currentSize.kanji} ${kanjiClassName}`}
            >
              {seg.text}
            </span>
          );
        })}
      </span>

      {/* Romaji display for N5 and N4 */}
      {shouldShowRomaji && effectiveRomaji && (
        <span
          className={`font-sans font-medium text-slate-400 mt-1 tracking-wide select-text ${currentSize.romaji} ${romajiClassName}`}
        >
          {effectiveRomaji}
        </span>
      )}
    </div>
  );
}

// Cached regex for sentence tokenizer
let dictRegex = null;
function getDictRegex() {
  if (!dictRegex) {
    const keys = Object.keys(n5n4FuriganaDict || {}).sort((a, b) => b.length - a.length);
    dictRegex = new RegExp(
      '(' + keys.map((k) => k.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|') + ')',
      'g'
    );
  }
  return dictRegex;
}

/**
 * FuriganaSentence
 * Renders full sentences with automatic ruby Furigana for all N5 and N4 Kanji words.
 * Level N5 and N4: Furigana and Romaji are active.
 * Level N3, N2, N1: Displays clean standard Japanese sentence text.
 */
export function FuriganaSentence({
  text = '',
  level = null,
  forceFurigana = false,
  showRomaji = null,
  size = 'base',
  className = '',
  kanjiClassName = '',
  furiganaClassName = '',
  romajiClassName = ''
}) {
  const appCtx = useSafeApp();
  const currentAppLevel = appCtx?.currentLevel || 'N5';
  const activeLevel = (level || currentAppLevel).toUpperCase();
  const isN5N4 = forceFurigana || activeLevel === 'N5' || activeLevel === 'N4';
  const shouldShowRomaji = showRomaji !== null ? showRomaji : isN5N4;

  if (!text) return null;

  if (!isN5N4) {
    return (
      <span className={`font-jp font-bold text-slate-900 select-text ${className}`}>
        {text}
      </span>
    );
  }

  // Tokenize against N5/N4 dictionary
  const regex = getDictRegex();
  const parts = text.split(regex);

  return (
    <div className={`inline-flex flex-col items-start gap-1 font-jp ${className}`}>
      <div className="inline-flex flex-wrap items-end gap-x-0.5 gap-y-2 leading-none">
        {parts.map((part, idx) => {
          if (!part) return null;

          const dictEntry = n5n4FuriganaDict[part];
          if (dictEntry) {
            return (
              <FuriganaWord
                key={idx}
                kanji={part}
                kana={dictEntry.kana}
                romaji={dictEntry.romaji}
                showRomaji={false}
                level="N5"
                size={size}
                kanjiClassName={kanjiClassName}
                furiganaClassName={furiganaClassName}
              />
            );
          }

          // Handle bracketed particles like ［は］, ［を］, ［に］
          const bracketMatch = part.match(/^([［\[].+?[］\]])$/);
          if (bracketMatch) {
            return (
              <span
                key={idx}
                className="inline-block px-1.5 py-0.5 mx-0.5 rounded-lg bg-pink-100 text-pink-700 font-black border border-pink-200 text-xs self-center"
              >
                {part}
              </span>
            );
          }

          return (
            <span
              key={idx}
              className={`font-jp font-bold text-slate-800 leading-none self-end align-bottom ${kanjiClassName}`}
            >
              {part}
            </span>
          );
        })}
      </div>

      {shouldShowRomaji && (
        <span
          className={`font-mono text-xs text-slate-400 font-medium tracking-wide mt-0.5 select-text ${romajiClassName}`}
        >
          {toHepburnRomaji(text.replace(/[［\[］\]]/g, ''))}
        </span>
      )}
    </div>
  );
}
