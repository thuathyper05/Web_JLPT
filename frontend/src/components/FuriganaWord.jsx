import React from 'react';

/**
 * FuriganaWord
 * Displays Japanese Kanji with small, elegant Furigana (Hiragana/Katakana) on top.
 * If the word has no Kanji or if Kanji is identical to Kana, only the Kana is displayed.
 */
export default function FuriganaWord({
  kanji = '',
  kana = '',
  size = 'base',
  className = '',
  kanjiClassName = '',
  furiganaClassName = '',
  forceShow = false
}) {
  const cleanKanji = (kanji || '').trim();
  const cleanKana = (kana || '').trim();

  // If no kanji exists or kanji equals kana, just display kana
  const hasKanji = cleanKanji && (cleanKanji !== cleanKana || forceShow);

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
      furigana: 'text-[10.5px] -mb-0.5'
    },
    lg: {
      kanji: 'text-lg',
      furigana: 'text-[11.5px] -mb-0.5'
    },
    xl: {
      kanji: 'text-xl',
      furigana: 'text-xs -mb-0.5'
    },
    '2xl': {
      kanji: 'text-2xl',
      furigana: 'text-xs -mb-1'
    },
    '3xl': {
      kanji: 'text-3xl sm:text-4xl',
      furigana: 'text-sm -mb-1'
    },
    '4xl': {
      kanji: 'text-4xl sm:text-5xl',
      furigana: 'text-base -mb-1.5'
    },
    '5xl': {
      kanji: 'text-5xl sm:text-6xl',
      furigana: 'text-lg -mb-2'
    },
    '6xl': {
      kanji: 'text-6xl sm:text-7xl',
      furigana: 'text-xl -mb-2.5'
    }
  };

  const currentSize = sizeClasses[size] || sizeClasses.base;

  if (!hasKanji) {
    return (
      <span
        className={`font-jp font-black text-slate-900 leading-tight inline-block ${currentSize.kanji} ${kanjiClassName} ${className}`}
      >
        {cleanKana || cleanKanji}
      </span>
    );
  }

  return (
    <ruby
      className={`ruby font-jp inline-flex flex-col items-center justify-end leading-none align-middle select-text ${className}`}
      title={`${cleanKanji} (${cleanKana})`}
    >
      <rt
        className={`font-jp font-bold text-pink-600 tracking-tight leading-none select-none transition-colors ${currentSize.furigana} ${furiganaClassName}`}
      >
        {cleanKana}
      </rt>
      <span
        className={`font-black text-slate-900 leading-tight tracking-wide ${currentSize.kanji} ${kanjiClassName}`}
      >
        {cleanKanji}
      </span>
    </ruby>
  );
}