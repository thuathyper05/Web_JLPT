const fs = require('fs');
const root = 'd:/HocTap/Web_JLPT/frontend/src/pages/';

function splice(file, startMarker, endMarker, replacement, extraImports, lucideExtra) {
  let text = fs.readFileSync(root + file, 'utf8');
  const crlf = text.indexOf('\r\n') > -1;
  text = text.replace(/\r\n/g, '\n');
  const s = text.indexOf(startMarker);
  const e = text.indexOf(endMarker);
  if (s < 0 || e < 0 || e < s) throw new Error('marker missing in ' + file);
  const lineStart = text.lastIndexOf('\n', s) + 1;
  const lineEnd = text.lastIndexOf('\n', e) + 1;
  text = text.slice(0, lineStart) + replacement + '\n' + text.slice(lineEnd);
  text = text.replace("import { useApp } from '../context/AppContext';", "import { useApp } from '../context/AppContext';\n" + extraImports);
  if (lucideExtra) {
    text = text.replace("} from 'lucide-react';", '  ,' + lucideExtra + "\n} from 'lucide-react';");
  }
  if (crlf) text = text.replace(/\n/g, '\r\n');
  fs.writeFileSync(root + file, text, 'utf8');
}

const kanjiBlock = `      {/* ════════════════════ 1. HERO KANJI HIỆN ĐẠI ════════════════════ */}
      <StudyHero
        bigChar="漢"
        kicker={'Chữ Hán Kanji - JLPT ' + activeLevel}
        icon={<PenTool size={13} />}
        title={'Chinh phục Kanji JLPT ' + activeLevel}
        subtitle="Học theo quy trình 5 bước: chiết tự, đọc, viết, phân biệt và ôn ngắt quãng. Mọi bài tập đều theo đúng dạng đề thi."
        ring={{ percent: stats.rate, label: 'Đã thuộc' }}
        stats={[
          { label: 'Tổng số chữ', value: stats.total },
          { label: 'Đã thuộc', value: stats.mastered, tone: 'emerald' },
          { label: 'Cần ôn', value: stats.review, tone: 'amber' },
          { label: 'Sẵn sàng thi', value: stats.grade, tone: 'sky' }
        ]}
      />

      {/* ════════════════════ 2. THANH ĐIỀU HƯỚNG ════════════════════ */}
      <StudyTabs
        active={activeTab}
        onChange={function (id) {
          sounds.playFlip();
          setActiveTab(id);
        }}
        tabs={[
          { id: 'roadmap', label: 'Lộ trình', icon: Compass },
          { id: 'method', label: 'Phương pháp', icon: Lightbulb },
          { id: 'vault', label: 'Kho Hán tự', icon: Layers, badge: filteredKanjiList.length },
          { id: 'writing', label: 'Tập viết', icon: Edit3 },
          { id: 'confusing', label: 'Dễ nhầm', icon: GitCompare },
          { id: 'flashcard', label: 'Flashcard', icon: Sparkles },
          { id: 'practice', label: 'Luyện đề', icon: ListChecks },
          { id: 'blitz', label: 'Phản xạ 60s', icon: Zap }
        ]}
      />

      {activeTab === 'roadmap' && (
        <DailyPlanCard
          storageKey={'jlpt_kanji_daily_plan_' + activeLevel}
          title="Kế hoạch học Kanji hôm nay"
          onGo={function (id) { setActiveTab(id); }}
          tasks={[
            { id: 'learn', label: 'Học 5 chữ mới', hint: 'Chiết tự và đọc to âm On, Kun, Hán Việt.', minutes: 8, goTo: 'vault' },
            { id: 'cards', label: 'Ôn bằng Flashcard', hint: 'Lật thẻ, đánh dấu chữ đã thuộc và cần ôn.', minutes: 4, goTo: 'flashcard' },
            { id: 'write', label: 'Viết lại 5 chữ', hint: 'Tô nét mờ rồi viết từ trí nhớ.', minutes: 5, goTo: 'writing' },
            { id: 'quiz', label: 'Làm 10 câu đúng dạng JLPT', hint: 'Mondai 1, 2, 3 và xem giải thích câu sai.', minutes: 5, goTo: 'practice' }
          ]}
        />
      )}

      {activeTab === 'method' && (
        <KanjiStudyMethod
          level={activeLevel}
          onGo={function (id) {
            sounds.playFlip();
            setActiveTab(id);
          }}
        />
      )}
`;

const listenBlock = `      {/* ════════════════════ 1. HERO CHOUKAI HIỆN ĐẠI ════════════════════ */}
      <StudyHero
        bigChar="聴"
        kicker={'Choukai 聴解 - JLPT ' + activeLevel}
        icon={<Headphones size={13} />}
        title={'Luyện nghe JLPT ' + activeLevel + ' giọng Tokyo'}
        subtitle="Học theo đúng cấu trúc đề thi: Mondai 1, 2, 4 kèm phân tích bẫy nghe, chép chính tả và luyện bắt chước giọng."
        ring={{ percent: currentTracks.length > 0 ? Math.round((score / currentTracks.length) * 100) : 0, label: 'Chính xác' }}
        stats={[
          { label: 'Bài nghe', value: currentTracks.length },
          { label: 'Điểm', value: score + '/' + currentTracks.length, tone: 'emerald' },
          { label: 'Cấp độ', value: activeLevel, tone: 'sky' },
          { label: 'Bài học', value: lessonChoice === 'all' ? 'Tất cả' : 'Bài ' + lessonChoice, tone: 'amber' }
        ]}
        actions={
          <select
            aria-label="Chọn bài học"
            value={lessonChoice}
            onChange={function (e) {
              sounds.playFlip();
              setLessonChoice(e.target.value);
            }}
            className="min-h-[44px] px-4 rounded-xl bg-white text-slate-800 text-xs font-bold shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-300 max-w-full"
          >
            <option value="all">Tất cả bài học (JLPT {activeLevel})</option>
            {lessonList.map(function (n) {
              return (
                <option key={n} value={String(n)}>
                  Bài {n < 10 ? '0' + n : n} - Giáo trình {activeLevel}
                </option>
              );
            })}
          </select>
        }
      />

      {/* ════════════════════ 2. THANH ĐIỀU HƯỚNG ════════════════════ */}
      <StudyTabs
        active={activeTab}
        onChange={function (id) {
          sounds.playFlip();
          if (id !== 'vocab') {
            if (vocabTimerRef.current) clearTimeout(vocabTimerRef.current);
            setIsVocabAutoPlaying(false);
          }
          if (id === 'vocab' && typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
          }
          setActiveTab(id);
        }}
        tabs={[
          { id: 'dialogue', label: 'Đề thi và hội thoại', icon: Radio, badge: currentTracks.length },
          { id: 'roadmap', label: 'Lộ trình', icon: Compass },
          { id: 'methods', label: 'Phương pháp', icon: Lightbulb },
          { id: 'vocab', label: 'Chuỗi từ vựng', icon: ListMusic }
        ]}
      />

      {activeTab === 'dialogue' && (
        <div className="space-y-4">
          <DailyPlanCard
            storageKey={'jlpt_listening_daily_plan_' + activeLevel}
            title="Kế hoạch luyện nghe hôm nay"
            tasks={[
              { id: 'blind', label: 'Nghe không xem chữ', hint: 'Nghe 1 bài hai lần, tự đoán nội dung trước khi mở phụ đề.', minutes: 5 },
              { id: 'quiz', label: 'Làm 3 câu trắc nghiệm', hint: 'Mỗi dạng Mondai một câu và đọc phần giải thích.', minutes: 6 },
              { id: 'shadow', label: 'Bắt chước từng câu', hint: 'Nghe câu riêng rồi nhại lại đúng nhịp và ngữ điệu.', minutes: 5 },
              { id: 'dictate', label: 'Chép chính tả 1 câu', hint: 'Nghe và viết ra giấy, sau đó đối chiếu với bản gốc.', minutes: 4 }
            ]}
          />
          <ListeningExamGuide active={mondaiFilter} onSelect={function (id) { sounds.playFlip(); setMondaiFilter(id); }} />
        </div>
      )}
`;

splice('KanjiPage.jsx', '1. HEADER & CHỈ SỐ SẴN SÀNG JLPT', 'TAB 1: LỘ TRÌNH HÁN TỰ',
  kanjiBlock,
  "import StudyHero from '../components/StudyHero.jsx';\nimport StudyTabs from '../components/StudyTabs.jsx';\nimport DailyPlanCard from '../components/DailyPlanCard.jsx';\nimport KanjiStudyMethod from '../components/KanjiStudyMethod.jsx';",
  'Lightbulb');
splice('ListeningPage.jsx', '1. HEADER BANNER CHOUKAI', 'TAB 1: ĐỀ THI & HỘI THOẠI',
  listenBlock,
  "import StudyHero from '../components/StudyHero.jsx';\nimport StudyTabs from '../components/StudyTabs.jsx';\nimport DailyPlanCard from '../components/DailyPlanCard.jsx';\nimport ListeningExamGuide from '../components/ListeningExamGuide.jsx';",
  null);
console.log('patched');
