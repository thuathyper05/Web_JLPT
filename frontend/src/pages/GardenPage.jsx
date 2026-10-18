import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Container, Spinner, Progress, Modal, ModalBody, Row, Col, Input } from 'reactstrap';
import { 
  Leaf, Star, ChevronLeft, Volume2, Sparkles, X, 
  ChevronRight, Trophy, Droplets, Sun, Award, Check, Layers,
  Flame, Zap, Clock, ShieldCheck, Search, Sprout, RotateCcw,
  BookOpen, Plus, HeartPulse
} from 'lucide-react';
import { srsService, vocabService, lessonService, speakJapanese } from '../services/api';
import { sounds } from '../services/sounds';
import { useApp } from '../context/AppContext';
import { getGardenWater, deductGardenWater, awardGardenWater } from '../services/gardenRewards';
import confetti from 'canvas-confetti';

// ── 4 BOTANICAL GROWTH STAGES FOR THE SINGLE BONSAI TREE ──
const TREE_STAGES = {
  1: {
    level: 1,
    name: 'Mầm Non Khởi Đầu',
    subtitle: 'Giai đoạn nảy mầm (0 – 25% vốn từ)',
    color: '#10b981',
    bgColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    desc: 'Cây tri thức vừa đâm chồi xanh biếc trong chậu sứ Tokyo, rễ non đang dần bám sâu vào nền tảng ngữ pháp sơ cấp.',
    minVocab: 0
  },
  2: {
    level: 2,
    name: 'Bonsai Niên Thiếu',
    subtitle: 'Giai đoạn vươn cành (25% – 50% vốn từ)',
    color: '#059669',
    bgColor: '#d1fae5',
    borderColor: '#6ee7b7',
    desc: 'Thân gỗ uốn lượn phong cách Moyogi kiên cường, 4 nhánh tán lá xanh mướt vươn cao đón ánh nắng rực rỡ.',
    minVocab: 100
  },
  3: {
    level: 3,
    name: 'Bonsai Trưởng Thành',
    subtitle: 'Giai đoạn sum sê hoa nở (50% – 85% vốn từ)',
    color: '#2563eb',
    bgColor: '#eff6ff',
    borderColor: '#bfdbfe',
    desc: 'Tán lá tròn đầy râm mát, đâm chồi nảy lộc và điểm xuyết những đóa hoa anh đào phớt hồng rực rỡ.',
    minVocab: 300
  },
  4: {
    level: 4,
    name: 'Đại Thụ Hoàng Kim',
    subtitle: 'Bonsai đại thọ trĩu quả vàng (85% – 100% vốn từ)',
    color: '#f59e0b',
    bgColor: '#fffbeb',
    borderColor: '#fde68a',
    desc: 'Cây đại thụ nghìn năm uy nghi, rễ nổi vững chắc, tán lá trĩu quả vàng hoàng kim — Toàn bộ từ vựng đã khắc sâu vào trí nhớ dài hạn vĩnh viễn!',
    minVocab: 600
  }
};

const hasRealKanji = (str) => /[\u4E00-\u9FAF\u3400-\u4DBF]/.test(str || '');
const GUEST_STORAGE_KEY = 'hyper_guest_garden_srs';

// ── THE ICONIC SINGLE BONSAI TREE VECTOR ARTWORK (RESPONSIVE SVG & LIVELY MOTION) ──
const SingleBonsaiArtwork = React.memo(({ stage = 1, isThirsty = false }) => {
  return (
    <div className="bonsai-tree-wrapper">
      {/* Ambient Pulsing Aura */}
      <div className="bonsai-aura-glow" />

      {/* Floating Cherry Blossom Petals for Stages 3 & 4 */}
      {stage >= 3 && (
        <>
          <div className="bonsai-petal" style={{ top: '15%', left: '20%', animationDelay: '0s' }}>
            <svg width="12" height="12" viewBox="0 0 10 10"><path d="M5 0 C7 3 9 4 5 10 C1 4 3 3 5 0 Z" fill="#f472b6" opacity="0.8"/></svg>
          </div>
          <div className="bonsai-petal" style={{ top: '25%', right: '22%', animationDelay: '2.5s' }}>
            <svg width="10" height="10" viewBox="0 0 10 10"><path d="M5 0 C7 3 9 4 5 10 C1 4 3 3 5 0 Z" fill="#fb7185" opacity="0.75"/></svg>
          </div>
          <div className="bonsai-petal" style={{ top: '35%', left: '30%', animationDelay: '4.8s' }}>
            <svg width="11" height="11" viewBox="0 0 10 10"><path d="M5 0 C7 3 9 4 5 10 C1 4 3 3 5 0 Z" fill="#f472b6" opacity="0.7"/></svg>
          </div>
        </>
      )}

      {/* Stage 1: Sprout of Beginnings */}
      {stage === 1 && (
        <svg viewBox="0 0 280 220" className="bonsai-tree-animated" style={{ width: '100%', maxWidth: '280px', height: 'auto', position: 'relative', zIndex: 1 }}>
          <defs>
            <linearGradient id="potGrad1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1e293b"/>
              <stop offset="100%" stopColor="#0f172a"/>
            </linearGradient>
            <linearGradient id="leafGrad1" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#15803d"/>
              <stop offset="100%" stopColor="#4ade80"/>
            </linearGradient>
          </defs>

          {/* Soil Base / Zen Stand */}
          <ellipse cx="140" cy="195" rx="90" ry="12" fill="#000000" opacity="0.08"/>
          
          {/* Ceramic Pot */}
          <path d="M75 160 L90 190 H190 L205 160 Z" fill="url(#potGrad1)" stroke="#334155" strokeWidth="2.5" strokeLinejoin="round"/>
          <rect x="70" y="152" width="140" height="10" rx="4" fill="#334155"/>
          <ellipse cx="140" cy="157" rx="64" ry="7" fill="#451a03"/>

          {/* Dew drops / Sprout shoot */}
          <path d="M140 156 Q140 120 140 95" stroke={isThirsty ? '#a16207' : '#16a34a'} strokeWidth="5" strokeLinecap="round"/>
          
          {/* Animated Fluttering Leaves */}
          <g className="bonsai-foliage-pulse">
            <path d="M140 115 Q115 105 110 85 Q130 85 140 110" fill={isThirsty ? '#ca8a04' : 'url(#leafGrad1)'} stroke="#15803d" strokeWidth="1.5"/>
            <path d="M140 105 Q165 95 170 75 Q150 75 140 100" fill={isThirsty ? '#a16207' : 'url(#leafGrad1)'} stroke="#15803d" strokeWidth="1.5"/>
            <path d="M140 95 Q132 65 140 55 Q148 65 140 95" fill={isThirsty ? '#eab308' : '#22c55e'} stroke="#15803d" strokeWidth="1.5"/>
          </g>

          {/* Dew drop */}
          <circle cx="160" cy="78" r="3" fill="#38bdf8" opacity="0.9"/>
        </svg>
      )}

      {/* Stage 2: Young Branching Bonsai */}
      {stage === 2 && (
        <svg viewBox="0 0 280 220" className="bonsai-tree-animated" style={{ width: '100%', maxWidth: '280px', height: 'auto', position: 'relative', zIndex: 1 }}>
          <defs>
            <linearGradient id="trunkGrad2" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#451a03"/>
              <stop offset="100%" stopColor="#78350f"/>
            </linearGradient>
            <linearGradient id="cloudGrad2" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#22c55e"/>
              <stop offset="100%" stopColor="#15803d"/>
            </linearGradient>
          </defs>

          <ellipse cx="140" cy="198" rx="100" ry="12" fill="#000000" opacity="0.08"/>

          {/* Glazed Tokyo Pot */}
          <path d="M70 165 L88 194 H192 L210 165 Z" fill="#0369a1" stroke="#0284c7" strokeWidth="2.5" strokeLinejoin="round"/>
          <rect x="65" y="157" width="150" height="10" rx="4" fill="#0284c7"/>
          <ellipse cx="140" cy="162" rx="70" ry="7" fill="#292524"/>

          {/* Curved Trunk */}
          <path d="M140 162 C135 130 165 115 140 85 C130 72 135 55 135 45" stroke="url(#trunkGrad2)" strokeWidth="9" strokeLinecap="round" fill="none"/>
          <path d="M145 125 C120 115 105 105 95 100" stroke="url(#trunkGrad2)" strokeWidth="5.5" strokeLinecap="round" fill="none"/>
          <path d="M142 95 C165 88 180 80 190 75" stroke="url(#trunkGrad2)" strokeWidth="4.5" strokeLinecap="round" fill="none"/>

          {/* Foliage Clouds with Flutter */}
          <g className="bonsai-foliage-pulse">
            <ellipse cx="95" cy="98" rx="28" ry="16" fill={isThirsty ? '#a16207' : 'url(#cloudGrad2)'}/>
            <ellipse cx="190" cy="74" rx="26" ry="15" fill={isThirsty ? '#a16207' : 'url(#cloudGrad2)'}/>
            <ellipse cx="135" cy="42" rx="34" ry="20" fill={isThirsty ? '#854d0e' : 'url(#cloudGrad2)'}/>
            <circle cx="130" cy="36" r="16" fill="#4ade80" opacity="0.6"/>
          </g>
        </svg>
      )}

      {/* Stage 3: Flourishing Green Bonsai with Sakura Accents */}
      {stage === 3 && (
        <svg viewBox="0 0 280 230" className="bonsai-tree-animated" style={{ width: '100%', maxWidth: '290px', height: 'auto', position: 'relative', zIndex: 1 }}>
          <defs>
            <linearGradient id="potGrad3" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1e3a8a"/>
              <stop offset="100%" stopColor="#172554"/>
            </linearGradient>
            <linearGradient id="trunkGrad3" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#3d1e06"/>
              <stop offset="50%" stopColor="#5c2e0b"/>
              <stop offset="100%" stopColor="#78350f"/>
            </linearGradient>
          </defs>

          <ellipse cx="140" cy="205" rx="110" ry="14" fill="#000000" opacity="0.08"/>

          {/* Traditional Ceramic Oval Pot */}
          <path d="M60 172 L80 202 H200 L220 172 Z" fill="url(#potGrad3)" stroke="#2563eb" strokeWidth="2.5" strokeLinejoin="round"/>
          <rect x="54" y="164" width="172" height="10" rx="4" fill="#1e40af"/>
          <ellipse cx="140" cy="169" rx="80" ry="8" fill="#1c1917"/>

          {/* Roots */}
          <path d="M125 170 Q130 162 140 160 Q150 162 155 170" stroke="#3d1e06" strokeWidth="6" strokeLinecap="round" fill="none"/>

          {/* Main Ancient S-curve Trunk */}
          <path d="M140 162 C130 130 170 110 145 75 C135 60 140 45 138 35" stroke="url(#trunkGrad3)" strokeWidth="12" strokeLinecap="round" fill="none"/>
          <path d="M138 120 C100 110 85 95 75 90" stroke="url(#trunkGrad3)" strokeWidth="7" strokeLinecap="round" fill="none"/>
          <path d="M148 90 C185 85 205 75 215 70" stroke="url(#trunkGrad3)" strokeWidth="6" strokeLinecap="round" fill="none"/>

          {/* Lush Green Foliage Pads with Flutter */}
          <g className="bonsai-foliage-pulse">
            <ellipse cx="75" cy="88" rx="36" ry="19" fill={isThirsty ? '#a16207' : '#15803d'}/>
            <ellipse cx="72" cy="83" rx="28" ry="14" fill={isThirsty ? '#ca8a04' : '#16a34a'}/>
            
            <ellipse cx="215" cy="68" rx="36" ry="19" fill={isThirsty ? '#a16207' : '#15803d'}/>
            <ellipse cx="218" cy="63" rx="28" ry="14" fill={isThirsty ? '#ca8a04' : '#16a34a'}/>

            <ellipse cx="138" cy="32" rx="48" ry="24" fill={isThirsty ? '#854d0e' : '#15803d'}/>
            <ellipse cx="138" cy="26" rx="38" ry="18" fill={isThirsty ? '#a16207' : '#22c55e'}/>
            <circle cx="132" cy="20" r="18" fill="#4ade80" opacity="0.6"/>

            {/* Sakura Accents */}
            <circle cx="65" cy="82" r="3.5" fill="#f472b6"/>
            <circle cx="85" cy="78" r="3" fill="#f472b6"/>
            <circle cx="205" cy="62" r="3.5" fill="#f472b6"/>
            <circle cx="225" cy="60" r="3" fill="#f472b6"/>
            <circle cx="120" cy="24" r="3.5" fill="#f472b6"/>
            <circle cx="155" cy="22" r="3" fill="#f472b6"/>
          </g>
        </svg>
      )}

      {/* Stage 4: Grand Golden Masterpiece Bonsai */}
      {stage === 4 && (
        <svg viewBox="0 0 280 235" className="bonsai-tree-animated" style={{ width: '100%', maxWidth: '300px', height: 'auto', position: 'relative', zIndex: 1 }}>
          <defs>
            <radialGradient id="goldenAura" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.45"/>
              <stop offset="100%" stopColor="#fef08a" stopOpacity="0"/>
            </radialGradient>
            <linearGradient id="potGrad4" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#78350f"/>
              <stop offset="100%" stopColor="#451a03"/>
            </linearGradient>
          </defs>

          {/* Aura */}
          <circle cx="140" cy="85" r="95" fill="url(#goldenAura)"/>
          <ellipse cx="140" cy="210" rx="115" ry="14" fill="#000000" opacity="0.1"/>

          {/* Imperial Bonsai Pot */}
          <path d="M55 176 L75 208 H205 L225 176 Z" fill="url(#potGrad4)" stroke="#b45309" strokeWidth="2.5" strokeLinejoin="round"/>
          <rect x="50" y="168" width="180" height="10" rx="4" fill="#d97706"/>
          <ellipse cx="140" cy="173" rx="85" ry="8" fill="#1c1917"/>

          {/* Ancient Roots Wrapping over Stone */}
          <ellipse cx="140" cy="170" rx="28" ry="12" fill="#57534e"/>
          <path d="M120 174 Q135 160 140 155 Q145 160 160 174" stroke="#451a03" strokeWidth="8" strokeLinecap="round" fill="none"/>

          {/* Majestic Ancient Trunk */}
          <path d="M140 158 C120 120 175 95 142 60 C132 45 138 30 138 22" stroke="#451a03" strokeWidth="15" strokeLinecap="round" fill="none"/>
          <path d="M136 110 C85 98 70 85 58 78" stroke="#451a03" strokeWidth="8" strokeLinecap="round" fill="none"/>
          <path d="M146 82 C195 75 218 62 228 55" stroke="#451a03" strokeWidth="7" strokeLinecap="round" fill="none"/>

          {/* Golden Canopy Foliage Clouds with Flutter */}
          <g className="bonsai-foliage-pulse">
            <ellipse cx="58" cy="76" rx="40" ry="21" fill="#15803d"/>
            <ellipse cx="56" cy="70" rx="32" ry="16" fill="#16a34a"/>
            <ellipse cx="56" cy="66" rx="22" ry="11" fill="#eab308"/>

            <ellipse cx="228" cy="53" rx="40" ry="21" fill="#15803d"/>
            <ellipse cx="230" cy="47" rx="32" ry="16" fill="#16a34a"/>
            <ellipse cx="230" cy="43" rx="22" ry="11" fill="#eab308"/>

            <ellipse cx="138" cy="22" rx="54" ry="26" fill="#15803d"/>
            <ellipse cx="138" cy="16" rx="44" ry="20" fill="#16a34a"/>
            <ellipse cx="138" cy="10" rx="30" ry="14" fill="#fbbf24"/>

            {/* Golden Fruit of Wisdom */}
            <circle cx="50" cy="68" r="4.5" fill="#f59e0b" stroke="#78350f" strokeWidth="1"/>
            <circle cx="72" cy="64" r="4" fill="#fbbf24" stroke="#78350f" strokeWidth="1"/>
            <circle cx="218" cy="44" r="4.5" fill="#f59e0b" stroke="#78350f" strokeWidth="1"/>
            <circle cx="240" cy="40" r="4" fill="#fbbf24" stroke="#78350f" strokeWidth="1"/>
            <circle cx="124" cy="12" r="5" fill="#fbbf24" stroke="#78350f" strokeWidth="1"/>
            <circle cx="152" cy="10" r="4.5" fill="#f59e0b" stroke="#78350f" strokeWidth="1"/>
          </g>

          {/* Sparkles */}
          <path d="M140 -4 L142 -9 L147 -7 L142 -5 Z" fill="#fef08a"/>
          <path d="M260 25 L262 20 L266 22 L262 24 Z" fill="#fef08a"/>
          <path d="M25 45 L27 40 L31 42 L27 44 Z" fill="#fef08a"/>
        </svg>
      )}
    </div>
  );
});

const GardenPage = ({ onNavigate }) => {
  const { user } = useApp();
  const [view, setView] = useState('garden'); // 'garden' | 'review'
  const [loading, setLoading] = useState(true);
  const [gardenItems, setGardenItems] = useState([]);
  const [waterDrops, setWaterDrops] = useState(() => getGardenWater());
  
  // Modals
  const [seedModalOpen, setSeedModalOpen] = useState(false);
  const [rootsModalOpen, setRootsModalOpen] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [selectedLessonToPlant, setSelectedLessonToPlant] = useState(1);
  const [seedingLoading, setSeedingLoading] = useState(false);
  const [rootsFilter, setRootsFilter] = useState('all');
  const [rootsSearch, setRootsSearch] = useState('');

  // Review session state
  const [reviewItems, setReviewItems] = useState([]);
  const [reviewIdx, setReviewIdx] = useState(0);
  const [reviewFlipped, setReviewFlipped] = useState(false);
  const [wateringSplash, setWateringSplash] = useState(false);

  // Sync water drops event
  useEffect(() => {
    const handleWaterEvent = (e) => {
      if (e.detail && typeof e.detail.newTotal === 'number') {
        setWaterDrops(e.detail.newTotal);
      }
    };
    window.addEventListener('garden-water-awarded', handleWaterEvent);
    return () => window.removeEventListener('garden-water-awarded', handleWaterEvent);
  }, []);

  // Fetch Lessons for Seeding Modal
  useEffect(() => {
    lessonService.getLessons()
      .then(res => {
        if (res.data && Array.isArray(res.data)) {
          setLessons(res.data);
        }
      })
      .catch(() => {});
  }, []);

  // Load Tree Vocabulary Roots
  const loadGarden = useCallback(async () => {
    setLoading(true);
    try {
      if (user) {
        const res = await srsService.getGarden();
        setGardenItems(res.data?.items || []);
      } else {
        const raw = localStorage.getItem(GUEST_STORAGE_KEY);
        let items = [];
        if (raw) {
          try { items = JSON.parse(raw) || []; } catch {}
        }

        // If brand new, seed Lesson 1 automatically so the Tree is alive
        if (items.length === 0) {
          try {
            const vRes = await vocabService.getVocabularies({ lesson: 1 });
            const list = vRes.data?.vocabularies || vRes.data || [];
            if (Array.isArray(list) && list.length > 0) {
              const now = new Date();
              items = list.slice(0, 15).map((v, i) => {
                const isKj = Boolean(v.kanji && hasRealKanji(v.kanji));
                const clnK = v.clean_kana || v.kana || '';
                return {
                  id: v.id,
                  vocab_id: v.id,
                  level: 1,
                  word: isKj ? v.kanji : clnK,
                  kanji: isKj ? v.kanji : '',
                  reading: isKj ? clnK : '',
                  meaning: v.clean_vietnamese || v.vietnamese || '',
                  lesson_number: v.lesson_number || 1,
                  next_review_date: new Date(now.getTime() - (i % 2 === 0 ? 3600000 : -86400000)).toISOString(),
                  last_reviewed_at: now.toISOString(),
                  correct_count: 1,
                  wrong_count: 0
                };
              });
              localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(items));
            }
          } catch {}
        }

        const now = new Date();
        const evaluated = items.map(item => ({
          ...item,
          is_due: item.level < 4 && (!item.next_review_date || new Date(item.next_review_date) <= now)
        }));
        setGardenItems(evaluated);
      }
    } catch (err) {
      console.warn('loadGarden error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadGarden();
  }, [loadGarden]);

  // Tree Statistics & Mastery
  const stats = useMemo(() => {
    const total = gardenItems.length;
    const due = gardenItems.filter(i => i.is_due).length;
    const l1 = gardenItems.filter(i => i.level === 1).length;
    const l2 = gardenItems.filter(i => i.level === 2).length;
    const l3 = gardenItems.filter(i => i.level === 3).length;
    const l4 = gardenItems.filter(i => i.level === 4).length;

    // Vitality (Độ tươi tốt): 100% down to 20%
    const vitality = total === 0 ? 100 : Math.max(20, Math.round(100 - (due / total) * 75));

    // Tree stage (1 to 4) based on total vocabulary planted
    let currentStage = 1;
    if (total >= 400 || l4 >= 150) currentStage = 4;
    else if (total >= 180 || l3 >= 80) currentStage = 3;
    else if (total >= 50 || l2 >= 30) currentStage = 2;

    return { total, due, l1, l2, l3, l4, vitality, stage: currentStage };
  }, [gardenItems]);

  // Seed Lesson into the Tree
  const handleSeedLesson = async () => {
    setSeedingLoading(true);
    try {
      if (user) {
        await srsService.addLessonToGarden(selectedLessonToPlant);
      } else {
        const vRes = await vocabService.getVocabularies({ lesson: selectedLessonToPlant });
        const list = vRes.data?.vocabularies || vRes.data || [];
        const raw = localStorage.getItem(GUEST_STORAGE_KEY);
        const existing = raw ? JSON.parse(raw) : [];
        const map = new Map(existing.map(p => [p.vocab_id || p.id, p]));
        const now = new Date();

        list.forEach(v => {
          if (!map.has(v.id)) {
            const isKj = Boolean(v.kanji && hasRealKanji(v.kanji));
            const clnK = v.clean_kana || v.kana || '';
            map.set(v.id, {
              id: v.id,
              vocab_id: v.id,
              level: 1,
              word: isKj ? v.kanji : clnK,
              kanji: isKj ? v.kanji : '',
              reading: isKj ? clnK : '',
              meaning: v.clean_vietnamese || v.vietnamese || '',
              lesson_number: v.lesson_number || selectedLessonToPlant,
              next_review_date: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
              last_reviewed_at: now.toISOString(),
              correct_count: 1,
              wrong_count: 0
            });
          }
        });
        localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(Array.from(map.values())));
      }
      awardGardenWater(25, 'Gieo mầm bài học mới');
      sounds.playLevelUp?.();
      confetti({ particleCount: 60, spread: 65, origin: { y: 0.6 } });
      await loadGarden();
      setSeedModalOpen(false);
    } catch (err) {
      console.warn('Seed lesson error:', err);
    } finally {
      setSeedingLoading(false);
    }
  };

  // Start Watering Session for the Single Tree
  const startWateringSession = () => {
    let list = gardenItems.filter(i => i.is_due);
    if (list.length === 0) {
      // If no due words, review 10 lowest level words to nurture tree
      list = [...gardenItems].sort((a, b) => a.level - b.level).slice(0, 10);
    }
    if (list.length === 0) return;

    sounds.playFlip?.();
    setReviewItems(list);
    setReviewIdx(0);
    setReviewFlipped(false);
    setView('review');
  };

  // Answer Card in Watering Review
  const handleReviewAnswer = async (isCorrect) => {
    const cur = reviewItems[reviewIdx];
    if (!cur) return;

    if (isCorrect) {
      sounds.playCorrect?.();
      deductGardenWater(5);
      setWateringSplash(true);
      setTimeout(() => setWateringSplash(false), 600);
    } else {
      sounds.playWrong?.();
    }

    const newLevel = isCorrect ? Math.min(4, cur.level + 1) : Math.max(1, cur.level - 1);
    const intervalDays = newLevel === 1 ? 1 : newLevel === 2 ? 3 : newLevel === 3 ? 7 : 30;
    const now = new Date();
    const nextDate = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000).toISOString();

    try {
      if (user) {
        await srsService.recordReview({ vocab_id: cur.vocab_id || cur.id, correct: isCorrect });
      } else {
        const raw = localStorage.getItem(GUEST_STORAGE_KEY);
        if (raw) {
          const plants = JSON.parse(raw);
          const found = plants.find(p => (p.vocab_id || p.id) === (cur.vocab_id || cur.id));
          if (found) {
            found.level = newLevel;
            found.next_review_date = nextDate;
            found.last_reviewed_at = now.toISOString();
            if (isCorrect) found.correct_count = (found.correct_count || 0) + 1;
            else found.wrong_count = (found.wrong_count || 0) + 1;
            localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(plants));
          }
        }
      }
    } catch {}

    setTimeout(() => {
      if (reviewIdx < reviewItems.length - 1) {
        setReviewIdx(prev => prev + 1);
        setReviewFlipped(false);
      } else {
        sounds.playComplete?.();
        confetti({ particleCount: 80, spread: 75, origin: { y: 0.6 } });
        loadGarden();
        setView('garden');
      }
    }, 400);
  };

  // Filtered Roots Words for Inspector Modal
  const filteredRoots = useMemo(() => {
    let list = gardenItems;
    if (rootsFilter === 'due') list = list.filter(i => i.is_due);
    else if (rootsFilter === 'mastered') list = list.filter(i => i.level === 4);
    else if (rootsFilter === 'learning') list = list.filter(i => i.level < 4);

    if (rootsSearch.trim()) {
      const q = rootsSearch.toLowerCase().trim();
      list = list.filter(i => 
        (i.word && i.word.toLowerCase().includes(q)) ||
        (i.reading && i.reading.toLowerCase().includes(q)) ||
        (i.meaning && i.meaning.toLowerCase().includes(q))
      );
    }
    return list;
  }, [gardenItems, rootsFilter, rootsSearch]);

  // ── RENDER WATERING REVIEW SESSION ──
  if (view === 'review') {
    const cur = reviewItems[reviewIdx];
    const pct = reviewItems.length > 0 ? Math.round(((reviewIdx + 1) / reviewItems.length) * 100) : 0;

    return (
      <Container className="py-3 py-md-4" style={{ maxWidth: '640px' }}>
        {/* Top Header */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <button
            type="button"
            onClick={() => { setView('garden'); loadGarden(); }}
            className="app-btn-secondary"
            style={{ height: '36px', padding: '0 14px', fontSize: '12.5px' }}
          >
            <ChevronLeft size={16} />
            <span>Về Cây Bonsai</span>
          </button>

          <div className="d-flex align-items-center gap-1.5 text-primary fw-bold" style={{ fontSize: '13px' }}>
            <Droplets size={16} />
            <span>Tưới cây: {reviewIdx + 1} / {reviewItems.length}</span>
          </div>

          <div className="d-flex align-items-center gap-1.5 px-3 py-1 rounded-pill bg-light border" style={{ fontSize: '12px' }}>
            <Droplets size={14} className="text-info" />
            <span className="fw-black text-navy-dark">{waterDrops} Giọt</span>
          </div>
        </div>

        <Progress value={pct} color="primary" style={{ height: '5px', borderRadius: '4px' }} className="mb-4" />

        {/* Central Watering Focus Card */}
        {cur && (
          <div
            className={`zen-focus-card text-center p-4 p-md-5 ${wateringSplash ? 'pulse-correct' : ''}`}
            onClick={() => {
              if (!reviewFlipped) {
                sounds.playFlip?.();
                setReviewFlipped(true);
              }
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="badge bg-light text-secondary border fw-bold px-2.5 py-1" style={{ fontSize: '11px' }}>
                Bài {cur.lesson_number} • Cấp {cur.level}/4
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  speakJapanese(cur.reading || cur.word);
                }}
                className="app-icon-btn"
                style={{ width: 34, height: 34 }}
                title="Nghe phát âm Tokyo"
              >
                <Volume2 size={16} />
              </button>
            </div>

            <div className="my-4">
              <h1 className="zen-kanji-title mb-1">
                {cur.word}
              </h1>

              {cur.reading && cur.reading !== cur.word && (
                <div className="zen-kana-sub">
                  {cur.reading}
                </div>
              )}
            </div>

            {reviewFlipped ? (
              <div className="animate-fade-in my-3 p-3 rounded-3 bg-light border">
                <h3 className="zen-meaning-display mb-0">{cur.meaning}</h3>
              </div>
            ) : (
              <div className="text-muted small my-3 user-select-none">
                Chạm vào thẻ để xem nghĩa & tưới nước cho cây
              </div>
            )}

            {reviewFlipped ? (
              <div className="d-flex justify-content-center gap-3 mt-4 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleReviewAnswer(false)}
                  className="btn btn-danger rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-1.5 shadow-xs"
                >
                  <RotateCcw size={15} />
                  <span>Cần Ôn Lại</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleReviewAnswer(true)}
                  className="app-btn-primary"
                >
                  <Droplets size={16} />
                  <span>Đã Thuộc (Tưới Nước)</span>
                </button>
              </div>
            ) : (
              <div className="pt-2">
                <span className="badge bg-light text-secondary border px-3 py-1 rounded-pill">
                  Đánh giá sau khi lật thẻ
                </span>
              </div>
            )}
          </div>
        )}
      </Container>
    );
  }

  // Current stage info
  const stageInfo = TREE_STAGES[stats.stage] || TREE_STAGES[1];

  // ── RENDER MAIN SINGLE TREE SANCTUARY ──
  return (
    <div className="app-shell" style={{ maxWidth: '1040px' }}>
      {/* ── 1. UNIFIED SYSTEMIC PAGE HEADER ── */}
      <div className="app-page-header">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <div className="app-header-tag">
              <Sprout size={13} />
              <span>VƯỜN TRÍ NHỚ • EBBINGHAUS SRS</span>
            </div>
            <h1 className="app-header-title">
              Cây Bonsai Tri Thức
            </h1>
            <p className="app-header-subtitle">
              Cây đại diện cho toàn bộ vốn từ vựng của bạn. Khi bạn chăm chỉ học tập và ôn tập đúng hạn, cây sẽ hấp thụ nước, lớn dần qua 4 cấp độ và đâm chồi nở hoa.
            </p>
          </div>

          {/* Hydration Reservoir Widget */}
          <div className="p-2.5 px-3 rounded-3 bg-light border d-flex align-items-center gap-2.5 shadow-xs">
            <div className="d-flex align-items-center justify-content-center rounded-circle bg-info text-white" style={{ width: 34, height: 34 }}>
              <Droplets size={18} />
            </div>
            <div>
              <small className="text-muted d-block fw-semibold" style={{ fontSize: '11px' }}>Bình Nước Tri Thức</small>
              <span className="fw-black text-navy-dark fs-6">{waterDrops} Giọt</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. THE SINGLE TREE SANCTUARY (CÂY DUY NHẤT) ── */}
      <div className="bonsai-sanctuary-zen mb-4">
        {loading ? (
          <div className="py-5">
            <Spinner color="primary" />
            <p className="mt-2 text-muted small">Đang chăm sóc Cây Bonsai Tri Thức...</p>
          </div>
        ) : (
          <>
            {/* Tree Stage Badge */}
            <div className="d-inline-flex align-items-center gap-1.5 px-3 py-1 rounded-pill mb-3" style={{ background: stageInfo.bgColor, color: stageInfo.color, border: `1px solid ${stageInfo.borderColor}`, fontSize: '12px', fontWeight: 800 }}>
              <Sparkles size={14} />
              <span>Cấp {stageInfo.level}/4: {stageInfo.name}</span>
            </div>

            {/* The Single Bonsai Visual on Zen Pedestal */}
            <div className="my-2 d-flex justify-content-center">
              <div className="bonsai-zen-pedestal position-relative">
                <SingleBonsaiArtwork stage={stats.stage} isThirsty={stats.vitality < 60 || stats.due > 0} />
                {wateringSplash && (
                  <div className="bonsai-water-can-stream">
                    <div className="p-2 rounded-circle bg-info bg-opacity-20 text-info">
                      <Droplets size={26} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tree Vitality & Evolution Description */}
            <div style={{ maxWidth: '540px', margin: '0 auto' }}>
              <p className="small text-muted mb-3" style={{ lineHeight: '1.6' }}>
                {stageInfo.desc}
              </p>

              {/* Vitality Bar */}
              <div className="p-3 rounded-3 bg-white border shadow-xs mb-4 text-start">
                <div className="d-flex justify-content-between align-items-center mb-1.5 small">
                  <span className="fw-bold text-navy-dark d-flex align-items-center gap-1">
                    <HeartPulse size={14} className={stats.vitality > 75 ? 'text-success' : 'text-danger'} />
                    <span>Độ Tươi Tốt Của Cây</span>
                  </span>
                  <span className={`fw-black ${stats.vitality > 75 ? 'text-success' : 'text-danger'}`}>
                    {stats.vitality}% • {stats.vitality > 75 ? 'Khỏe Mạnh' : 'Cần Tưới Nước!'}
                  </span>
                </div>
                <div className="bonsai-vitality-bar">
                  <div
                    className="bonsai-vitality-fill"
                    style={{
                      width: `${stats.vitality}%`,
                      background: stats.vitality > 75 
                        ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)' 
                        : 'linear-gradient(90deg, #f59e0b 0%, #ef4444 100%)'
                    }}
                  />
                </div>
              </div>

              {/* 3 Metric Stats Cards */}
              <Row className="g-2.5 mb-4 text-start">
                <Col xs={4}>
                  <div className="p-2.5 rounded-3 bg-white border shadow-xs h-100">
                    <small className="text-muted d-block fw-semibold" style={{ fontSize: '10.5px' }}>Từ Đã Gieo</small>
                    <span className="fw-black text-navy-dark fs-6">{stats.total} / 1,589</span>
                  </div>
                </Col>

                <Col xs={4}>
                  <div className="p-2.5 rounded-3 bg-white border shadow-xs h-100" style={{ borderColor: stats.due > 0 ? '#fecaca' : undefined, background: stats.due > 0 ? '#fffdfd' : undefined }}>
                    <small className={stats.due > 0 ? 'text-danger d-block fw-bold' : 'text-muted d-block fw-semibold'} style={{ fontSize: '10.5px' }}>
                      Cần Tưới Hôm Nay
                    </small>
                    <span className={`fw-black fs-6 ${stats.due > 0 ? 'text-danger' : 'text-success'}`}>
                      {stats.due} Từ
                    </span>
                  </div>
                </Col>

                <Col xs={4}>
                  <div className="p-2.5 rounded-3 bg-white border shadow-xs h-100">
                    <small className="text-muted d-block fw-semibold" style={{ fontSize: '10.5px' }}>Đã Khắc Sâu</small>
                    <span className="fw-black text-warning fs-6">{stats.l4} Từ</span>
                  </div>
                </Col>
              </Row>

              {/* Action Buttons Bar */}
              <div className="d-flex justify-content-center align-items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={startWateringSession}
                  disabled={stats.total === 0}
                  className="app-btn-primary"
                  style={{ height: '46px', padding: '0 26px', fontSize: '14px' }}
                >
                  <Droplets size={18} />
                  <span>
                    {stats.due > 0 ? `Tưới Nước Cho Cây (Ôn ${stats.due} Từ Đến Hạn)` : 'Tưới Nước Rèn Luyện Cây'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSeedModalOpen(true)}
                  className="app-btn-secondary"
                  style={{ height: '46px', padding: '0 20px', fontSize: '13.5px' }}
                >
                  <Plus size={16} className="text-primary" />
                  <span>Gieo Thêm Bài Mới</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRootsModalOpen(true)}
                  className="app-btn-secondary"
                  style={{ height: '46px', padding: '0 18px', fontSize: '13.5px' }}
                >
                  <Search size={15} />
                  <span>Khám Phá Rễ Cây ({stats.total})</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── 3. MODAL: GIEO MẦM BÀI HỌC MỚI VÀO CÂY ── */}
      <Modal isOpen={seedModalOpen} toggle={() => setSeedModalOpen(false)} centered className="jlpt-modal">
        <ModalBody className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-black mb-0 text-navy-dark d-flex align-items-center gap-2">
              <Sprout size={18} className="text-success" />
              <span>Gieo Từ Vựng Vào Cây Bonsai</span>
            </h5>
            <button
              type="button"
              onClick={() => setSeedModalOpen(false)}
              className="app-icon-btn"
              style={{ width: 30, height: 30 }}
            >
              <X size={16} />
            </button>
          </div>

          <p className="text-muted small mb-3">
            Chọn bài học Minna no Nihongo để nuôi dưỡng thêm từ vựng mới vào cây. Mỗi bài gieo thành công được thưởng ngay <strong>+25 Giọt Nước</strong>.
          </p>

          <div
            className="p-2.5 rounded-3 bg-light border mb-3"
            style={{
              maxHeight: '260px',
              overflowY: 'auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))',
              gap: '6px'
            }}
          >
            {Array.from({ length: 25 }, (_, i) => i + 1).map(num => (
              <button
                key={num}
                type="button"
                onClick={() => setSelectedLessonToPlant(num)}
                className={`btn btn-sm rounded-3 py-2 fw-bold text-center border ${
                  selectedLessonToPlant === num ? 'btn-primary text-white shadow-xs' : 'btn-white bg-white text-dark'
                }`}
                style={{ fontSize: '12px' }}
              >
                Bài {num < 10 ? `0${num}` : num}
              </button>
            ))}
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              onClick={() => setSeedModalOpen(false)}
              className="app-btn-secondary"
              style={{ height: '38px', padding: '0 16px', fontSize: '13px' }}
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={seedingLoading}
              onClick={handleSeedLesson}
              className="app-btn-primary"
              style={{ height: '38px', padding: '0 20px', fontSize: '13px' }}
            >
              {seedingLoading ? <Spinner size="sm" /> : <Sprout size={15} />}
              <span>Gieo Bài {selectedLessonToPlant} Vào Cây</span>
            </button>
          </div>
        </ModalBody>
      </Modal>

      {/* ── 4. MODAL: KHÁM PHÁ RỄ CÂY (DANH SÁCH TỪ VỰNG TRONG CÂY) ── */}
      <Modal isOpen={rootsModalOpen} toggle={() => setRootsModalOpen(false)} centered size="lg" className="jlpt-modal">
        <ModalBody className="p-3.5 p-md-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-black mb-0 text-navy-dark d-flex align-items-center gap-2">
              <Leaf size={18} className="text-primary" />
              <span>Rễ Cây Tri Thức ({filteredRoots.length} Từ)</span>
            </h5>
            <button
              type="button"
              onClick={() => setRootsModalOpen(false)}
              className="app-icon-btn"
              style={{ width: 30, height: 30 }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Filter & Search Bar */}
          <div className="d-flex justify-content-between align-items-center gap-2 mb-3 flex-wrap">
            <div className="d-flex align-items-center gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {[
                { id: 'all', label: `Tất cả (${gardenItems.length})` },
                { id: 'due', label: `Cần tưới (${stats.due})` },
                { id: 'learning', label: `Đang lớn (${stats.l1 + stats.l2 + stats.l3})` },
                { id: 'mastered', label: `Khắc sâu (${stats.l4})` }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setRootsFilter(tab.id)}
                  className={`btn btn-sm rounded-pill px-3 py-1 fw-bold border flex-shrink-0 ${
                    rootsFilter === tab.id ? 'btn-primary text-white shadow-xs' : 'btn-light text-muted'
                  }`}
                  style={{ fontSize: '11.5px' }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="position-relative flex-grow-1 flex-md-grow-0" style={{ minWidth: '180px' }}>
              <Input
                type="text"
                placeholder="Tìm từ vựng..."
                value={rootsSearch}
                onChange={(e) => setRootsSearch(e.target.value)}
                className="form-control-sm rounded-pill ps-4 border"
                style={{ fontSize: '12px', height: '34px' }}
              />
              <Search size={13} className="position-absolute text-muted" style={{ left: '12px', top: '10px' }} />
            </div>
          </div>

          {/* Vocabulary List */}
          <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
            {filteredRoots.length === 0 ? (
              <div className="text-center py-4 text-muted small">
                Không tìm thấy từ vựng nào phù hợp.
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {filteredRoots.map(item => (
                  <div
                    key={item.id || item.vocab_id}
                    className="p-2.5 px-3 rounded-3 bg-light border d-flex justify-content-between align-items-center gap-2"
                  >
                    <div>
                      <div className="d-flex align-items-baseline gap-2">
                        <span className="fw-black text-navy-dark font-monospace" style={{ fontSize: '15px' }}>
                          {item.word}
                        </span>
                        {item.reading && item.reading !== item.word && (
                          <span className="small text-primary font-monospace fw-semibold">
                            {item.reading}
                          </span>
                        )}
                        <span className="badge bg-white text-muted border" style={{ fontSize: '10px' }}>
                          Bài {item.lesson_number}
                        </span>
                      </div>
                      <div className="small text-secondary fw-medium mt-0.5" style={{ fontSize: '12px' }}>
                        {item.meaning}
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2 flex-shrink-0">
                      <span className={`badge rounded-pill px-2 py-1 ${item.is_due ? 'bg-danger text-white' : item.level === 4 ? 'bg-warning text-dark' : 'bg-success text-white'}`} style={{ fontSize: '10px' }}>
                        {item.is_due ? 'Cần tưới' : `Cấp ${item.level}/4`}
                      </span>

                      <button
                        type="button"
                        onClick={() => speakJapanese(item.reading || item.word)}
                        className="app-icon-btn"
                        style={{ width: 32, height: 32 }}
                        title="Nghe phát âm Tokyo"
                      >
                        <Volume2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default GardenPage;
