const fs = require('fs');
const file = 'd:/HocTap/Web_JLPT/frontend/src/pages/KanjiPage.jsx';
let text = fs.readFileSync(file, 'utf8');
const crlf = text.indexOf('\r\n') > -1;
text = text.replace(/\r\n/g, '\n');

const startMarker = 'TAB 1: LỘ TRÌNH HÁN TỰ';
const endMarker = 'TAB 2: KHO HÁN TỰ';
const s = text.indexOf(startMarker);
const e = text.indexOf(endMarker);
if (s < 0 || e < 0) throw new Error('marker missing');
const lineStart = text.lastIndexOf('\n', s) + 1;
const lineEnd = text.lastIndexOf('\n', e) + 1;

const block = `      {/* ════════════════════ TAB 1: LỘ TRÌNH HÁN TỰ (ROADMAP) ════════════════════ */}
      {activeTab === 'roadmap' && (
        <KanjiRoadmap
          topics={KANJI_TOPICS}
          topicStats={topicStats}
          topicStyles={TOPIC_STYLES}
          iconMap={TOPIC_ICON_MAP}
          level={activeLevel}
          getKanjiStatus={getKanjiStatus}
          onOpenDetail={openDetail}
          onVault={handleJumpToTopicVault}
          onQuiz={function (topicId) {
            setQuizSettings(function (prev) {
              return { ...prev, topicId: topicId };
            });
            handleStartQuiz(topicId, false);
          }}
          onGo={function (id) {
            sounds.playFlip();
            setActiveTab(id);
          }}
        />
      )}
`;

text = text.slice(0, lineStart) + block + '\n' + text.slice(lineEnd);
text = text.replace("import StudyHero from", "import KanjiRoadmap from '../components/KanjiRoadmap.jsx';\nimport StudyHero from");
if (crlf) text = text.replace(/\n/g, '\r\n');
fs.writeFileSync(file, text, 'utf8');
console.log('ok');
