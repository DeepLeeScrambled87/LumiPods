// Maths Games Page - Interactive math practice with timers and rewards
import { useState } from 'react';
import { toast } from 'sonner';
import {
  Calculator,
  Trophy,
  Clock,
  Star,
  ChevronRight,
  Check,
  RotateCcw,
  Zap,
  Target,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useAuth } from '../auth/AuthContext';
import { useFamily } from '../family';
import { learnerPointsLedgerService } from '../../services/learnerPointsLedgerService';
import { syncLearnerPointsBalance } from '../../services/pointsBalanceService';

// Types
interface MathScore {
  bestTime: number; // in seconds
  totalAttempts: number;
  correctAnswers: number;
  level: number;
  lastPlayed: string;
}

interface MathScores {
  timesTables: Record<number, MathScore>;
  romanNumerals: MathScore;
  percentToDecimal: MathScore;
  decimalToPercent: MathScore;
  fractionConversion: MathScore;
}

type GameType = 'times-tables' | 'roman-numerals' | 'percent-decimal' | 'decimal-percent' | 'fractions';

const DEFAULT_SCORES: MathScores = {
  timesTables: {},
  romanNumerals: { bestTime: 0, totalAttempts: 0, correctAnswers: 0, level: 1, lastPlayed: '' },
  percentToDecimal: { bestTime: 0, totalAttempts: 0, correctAnswers: 0, level: 1, lastPlayed: '' },
  decimalToPercent: { bestTime: 0, totalAttempts: 0, correctAnswers: 0, level: 1, lastPlayed: '' },
  fractionConversion: { bestTime: 0, totalAttempts: 0, correctAnswers: 0, level: 1, lastPlayed: '' },
};

// Game cards data
const MATH_GAMES = [
  {
    id: 'times-tables' as GameType,
    title: 'Times Tables',
    icon: '✖️',
    color: 'from-blue-500 to-indigo-600',
    description: 'Master multiplication from 0 to 12',
    skills: ['Multiplication', 'Mental Math', 'Speed'],
  },
  {
    id: 'roman-numerals' as GameType,
    title: 'Roman Numerals',
    icon: '🏛️',
    color: 'from-amber-500 to-orange-600',
    description: 'Learn I, V, X, L, C, D, M and beyond',
    skills: ['Number Systems', 'History', 'Pattern Recognition'],
  },
  {
    id: 'percent-decimal' as GameType,
    title: 'Percent → Decimal',
    icon: '📊',
    color: 'from-emerald-500 to-teal-600',
    description: 'Move decimal 2 places left (45% = 0.45)',
    skills: ['Percentages', 'Decimals', 'Conversion'],
  },
  {
    id: 'decimal-percent' as GameType,
    title: 'Decimal → Percent',
    icon: '📈',
    color: 'from-purple-500 to-violet-600',
    description: 'Move decimal 2 places right (0.7 = 70%)',
    skills: ['Decimals', 'Percentages', 'Conversion'],
  },
  {
    id: 'fractions' as GameType,
    title: 'Fraction Conversions',
    icon: '🥧',
    color: 'from-rose-500 to-pink-600',
    description: 'Convert fractions to decimals and percents',
    skills: ['Fractions', 'Division', 'Equivalence'],
  },
];

export function MathsGamesPage() {
  const { currentLearnerId } = useAuth();
  const { family } = useFamily();
  const [scores, setScores] = useLocalStorage<MathScores>('maths-scores', DEFAULT_SCORES);
  const [activeGame, setActiveGame] = useState<GameType | null>(null);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const activeLearnerId =
    currentLearnerId || (family?.learners.length === 1 ? family.learners[0]?.id || null : null);

  const handleCloseGame = () => {
    setActiveGame(null);
    setSelectedTable(null);
  };

  const updateScore = (gameType: GameType, tableNum: number | null, newScore: Partial<MathScore>) => {
    setScores(prev => {
      if (gameType === 'times-tables' && tableNum !== null) {
        const current = prev.timesTables[tableNum] || { bestTime: 0, totalAttempts: 0, correctAnswers: 0, level: 1, lastPlayed: '' };
        return {
          ...prev,
          timesTables: {
            ...prev.timesTables,
            [tableNum]: { ...current, ...newScore, lastPlayed: new Date().toISOString() },
          },
        };
      }
      const key = gameType === 'roman-numerals' ? 'romanNumerals' :
                  gameType === 'percent-decimal' ? 'percentToDecimal' :
                  gameType === 'decimal-percent' ? 'decimalToPercent' : 'fractionConversion';
      return {
        ...prev,
        [key]: { ...prev[key], ...newScore, lastPlayed: new Date().toISOString() },
      };
    });
  };

  const awardMathsGamePoints = async (params: {
    gameTitle: string;
    total: number;
    correct: number;
    levelUp?: boolean;
    beatBest?: boolean;
  }) => {
    if (!family?.id || !activeLearnerId) {
      return;
    }

    const accuracy = params.total > 0 ? params.correct / params.total : 0;
    const baseBonus = accuracy >= 1 ? 2 : accuracy >= 0.8 ? 1 : 0;
    let awardedPoints = 0;

    const completionEvent = await learnerPointsLedgerService.award({
      familyId: family.id,
      learnerId: activeLearnerId,
      actionId: 'maths_game_completed',
      description: `Completed the ${params.gameTitle} maths game.`,
      pointsOverride: 8 + baseBonus,
    });
    if (completionEvent) {
      awardedPoints += completionEvent.points;
    }

    if (params.levelUp || params.beatBest) {
      const masteryEvent = await learnerPointsLedgerService.award({
        familyId: family.id,
        learnerId: activeLearnerId,
        actionId: 'maths_mastery_bonus',
        description: `${params.levelUp ? 'Levelled up' : 'Beat a personal best'} in ${params.gameTitle}.`,
      });
      if (masteryEvent) {
        awardedPoints += masteryEvent.points;
      }
    }

    if (awardedPoints > 0) {
      await syncLearnerPointsBalance(family.id, activeLearnerId);
      toast.success(`+${awardedPoints} points for ${params.gameTitle}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Calculator className="h-6 w-6 text-slate-600" />
            <h1 className="text-2xl font-semibold text-slate-900">Maths Games</h1>
          </div>
          <p className="text-slate-600">
            Fun, interactive math practice. Beat your best times and level up your skills!
          </p>
        </header>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 bg-white border border-slate-200">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <Trophy className="h-4 w-4 text-amber-500" />
              Total Games
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {Object.values(scores.timesTables).reduce((a, b) => a + b.totalAttempts, 0) +
               scores.romanNumerals.totalAttempts +
               scores.percentToDecimal.totalAttempts +
               scores.decimalToPercent.totalAttempts +
               scores.fractionConversion.totalAttempts}
            </p>
          </Card>
          <Card className="p-4 bg-white border border-slate-200">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <Star className="h-4 w-4 text-emerald-500" />
              Tables Mastered
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {Object.values(scores.timesTables).filter(s => s.level >= 3).length}/13
            </p>
          </Card>
          <Card className="p-4 bg-white border border-slate-200">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <Zap className="h-4 w-4 text-purple-500" />
              Conversion Skills
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {Math.round(((scores.percentToDecimal.level + scores.decimalToPercent.level + scores.fractionConversion.level) / 3) * 33)}%
            </p>
          </Card>
          <Card className="p-4 bg-white border border-slate-200">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <Target className="h-4 w-4 text-blue-500" />
              Roman Numerals
            </div>
            <p className="text-2xl font-bold text-slate-900">
              Level {scores.romanNumerals.level}
            </p>
          </Card>
        </div>

        {/* Game Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MATH_GAMES.map(game => (
            <GameCard
              key={game.id}
              game={game}
              scores={scores}
              onPlay={() => setActiveGame(game.id)}
            />
          ))}
        </div>

        {/* How It Works */}
        <section className="mt-12">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-white border border-slate-200 text-center">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-medium text-slate-900 mb-2">Practice</h3>
              <p className="text-sm text-slate-600">
                Learn the concepts first, then test your knowledge
              </p>
            </Card>
            <Card className="p-4 bg-white border border-slate-200 text-center">
              <div className="text-3xl mb-3">⏱️</div>
              <h3 className="font-medium text-slate-900 mb-2">Beat the Clock</h3>
              <p className="text-sm text-slate-600">
                Race against time and beat your personal best
              </p>
            </Card>
            <Card className="p-4 bg-white border border-slate-200 text-center">
              <div className="text-3xl mb-3">🏆</div>
              <h3 className="font-medium text-slate-900 mb-2">Level Up</h3>
              <p className="text-sm text-slate-600">
                Earn rewards and unlock harder challenges
              </p>
            </Card>
          </div>
        </section>
      </div>

      {/* Times Tables Modal */}
      {activeGame === 'times-tables' && !selectedTable && (
        <TimesTablesSelector
          scores={scores.timesTables}
          onSelect={setSelectedTable}
          onClose={handleCloseGame}
        />
      )}

      {/* Times Tables Quiz */}
      {activeGame === 'times-tables' && selectedTable !== null && (
        <TimesTablesQuiz
          tableNumber={selectedTable}
          bestTime={scores.timesTables[selectedTable]?.bestTime || 0}
          onComplete={(time, correct, total) => {
            const current = scores.timesTables[selectedTable] || { bestTime: 0, totalAttempts: 0, correctAnswers: 0, level: 1, lastPlayed: '' };
            const newBest = current.bestTime === 0 || time < current.bestTime ? time : current.bestTime;
            const newLevel = correct === total && time < 30 ? Math.min(current.level + 1, 5) : current.level;
            updateScore('times-tables', selectedTable, {
              bestTime: newBest,
              totalAttempts: current.totalAttempts + 1,
              correctAnswers: current.correctAnswers + correct,
              level: newLevel,
            });
            void awardMathsGamePoints({
              gameTitle: `${selectedTable} Times Table`,
              correct,
              total,
              levelUp: newLevel > current.level,
              beatBest: current.bestTime > 0 && newBest < current.bestTime,
            });
          }}
          onClose={() => setSelectedTable(null)}
        />
      )}

      {/* Roman Numerals Game */}
      {activeGame === 'roman-numerals' && (
        <RomanNumeralsGame
          currentLevel={scores.romanNumerals.level}
          bestTime={scores.romanNumerals.bestTime}
          onComplete={(time, correct, total, newLevel) => {
            const current = scores.romanNumerals;
            const newBest = current.bestTime === 0 || time < current.bestTime ? time : current.bestTime;
            updateScore('roman-numerals', null, {
              bestTime: newBest,
              totalAttempts: current.totalAttempts + 1,
              correctAnswers: current.correctAnswers + correct,
              level: newLevel,
            });
            void awardMathsGamePoints({
              gameTitle: 'Roman Numerals',
              correct,
              total,
              levelUp: newLevel > current.level,
              beatBest: current.bestTime > 0 && newBest < current.bestTime,
            });
          }}
          onClose={handleCloseGame}
        />
      )}

      {/* Percent to Decimal Game */}
      {activeGame === 'percent-decimal' && (
        <ConversionGame
          type="percent-decimal"
          currentLevel={scores.percentToDecimal.level}
          bestTime={scores.percentToDecimal.bestTime}
          onComplete={(time, correct, total, newLevel) => {
            const current = scores.percentToDecimal;
            const newBest = current.bestTime === 0 || time < current.bestTime ? time : current.bestTime;
            updateScore('percent-decimal', null, {
              bestTime: newBest,
              totalAttempts: current.totalAttempts + 1,
              correctAnswers: current.correctAnswers + correct,
              level: newLevel,
            });
            void awardMathsGamePoints({
              gameTitle: 'Percent to Decimal',
              correct,
              total,
              levelUp: newLevel > current.level,
              beatBest: current.bestTime > 0 && newBest < current.bestTime,
            });
          }}
          onClose={handleCloseGame}
        />
      )}

      {/* Decimal to Percent Game */}
      {activeGame === 'decimal-percent' && (
        <ConversionGame
          type="decimal-percent"
          currentLevel={scores.decimalToPercent.level}
          bestTime={scores.decimalToPercent.bestTime}
          onComplete={(time, correct, total, newLevel) => {
            const current = scores.decimalToPercent;
            const newBest = current.bestTime === 0 || time < current.bestTime ? time : current.bestTime;
            updateScore('decimal-percent', null, {
              bestTime: newBest,
              totalAttempts: current.totalAttempts + 1,
              correctAnswers: current.correctAnswers + correct,
              level: newLevel,
            });
            void awardMathsGamePoints({
              gameTitle: 'Decimal to Percent',
              correct,
              total,
              levelUp: newLevel > current.level,
              beatBest: current.bestTime > 0 && newBest < current.bestTime,
            });
          }}
          onClose={handleCloseGame}
        />
      )}

      {/* Fractions Game */}
      {activeGame === 'fractions' && (
        <FractionsGame
          currentLevel={scores.fractionConversion.level}
          bestTime={scores.fractionConversion.bestTime}
          onComplete={(time, correct, total, newLevel) => {
            const current = scores.fractionConversion;
            const newBest = current.bestTime === 0 || time < current.bestTime ? time : current.bestTime;
            updateScore('fractions', null, {
              bestTime: newBest,
              totalAttempts: current.totalAttempts + 1,
              correctAnswers: current.correctAnswers + correct,
              level: newLevel,
            });
            void awardMathsGamePoints({
              gameTitle: 'Fraction Conversions',
              correct,
              total,
              levelUp: newLevel > current.level,
              beatBest: current.bestTime > 0 && newBest < current.bestTime,
            });
          }}
          onClose={handleCloseGame}
        />
      )}
    </div>
  );
}

// Game Card Component
function GameCard({ game, scores, onPlay }: { 
  game: typeof MATH_GAMES[0]; 
  scores: MathScores;
  onPlay: () => void;
}) {
  const getGameLevel = () => {
    if (game.id === 'times-tables') {
      const mastered = Object.values(scores.timesTables).filter(s => s.level >= 3).length;
      return mastered >= 10 ? 3 : mastered >= 5 ? 2 : 1;
    }
    const key = game.id === 'roman-numerals' ? 'romanNumerals' :
                game.id === 'percent-decimal' ? 'percentToDecimal' :
                game.id === 'decimal-percent' ? 'decimalToPercent' : 'fractionConversion';
    return scores[key].level;
  };

  const level = getGameLevel();

  return (
    <Card className="overflow-hidden bg-white border border-slate-200 hover:shadow-lg transition-shadow">
      <div className={`h-24 bg-gradient-to-br ${game.color} flex items-center justify-center`}>
        <span className="text-5xl">{game.icon}</span>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-slate-900">{game.title}</h3>
          <Badge variant={level >= 3 ? 'success' : level >= 2 ? 'warning' : 'default'}>
            Level {level}
          </Badge>
        </div>
        <p className="text-sm text-slate-600 mb-3">{game.description}</p>
        <div className="flex flex-wrap gap-1 mb-4">
          {game.skills.map(skill => (
            <span key={skill} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
              {skill}
            </span>
          ))}
        </div>
        <Button variant="primary" size="sm" className="w-full" onClick={onPlay}>
          Play Now <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </Card>
  );
}


// Times Tables Selector
function TimesTablesSelector({ scores, onSelect, onClose }: {
  scores: Record<number, MathScore>;
  onSelect: (num: number) => void;
  onClose: () => void;
}) {
  const tables = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  return (
    <Modal isOpen onClose={onClose} title="Times Tables" size="lg">
      <p className="text-slate-600 mb-4">Select a times table to practice:</p>
      <div className="grid grid-cols-4 gap-3 mb-4">
        {tables.map(num => {
          const score = scores[num];
          const level = score?.level || 0;
          return (
            <button
              key={num}
              onClick={() => onSelect(num)}
              className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                level >= 3 ? 'border-emerald-500 bg-emerald-50' :
                level >= 2 ? 'border-amber-500 bg-amber-50' :
                level >= 1 ? 'border-blue-500 bg-blue-50' :
                'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="text-2xl font-bold text-slate-900">{num}×</div>
              {score && (
                <div className="text-xs text-slate-500 mt-1">
                  {score.bestTime > 0 ? `${score.bestTime}s` : 'New'}
                </div>
              )}
              {level >= 3 && <Star className="w-4 h-4 text-emerald-500 mx-auto mt-1" />}
            </button>
          );
        })}
      </div>
      <div className="flex gap-2 text-xs text-slate-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500" /> Mastered</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500" /> Learning</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500" /> Started</span>
      </div>
    </Modal>
  );
}

// Times Tables Quiz
function TimesTablesQuiz({ tableNumber, bestTime, onComplete, onClose }: {
  tableNumber: number;
  bestTime: number;
  onComplete: (time: number, correct: number, total: number) => void;
  onClose: () => void;
}) {
  const [questions, setQuestions] = useState<{ a: number; b: number; answer: number }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [correct, setCorrect] = useState(0);
  const [startTime] = useState(Date.now());
  const [isComplete, setIsComplete] = useState(false);
  const [showLearn, setShowLearn] = useState(true);

  // Generate questions on mount
  useState(() => {
    const qs = [];
    for (let i = 0; i <= 12; i++) {
      qs.push({ a: tableNumber, b: i, answer: tableNumber * i });
    }
    // Shuffle
    for (let i = qs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [qs[i], qs[j]] = [qs[j], qs[i]];
    }
    setQuestions(qs);
  });

  const handleSubmit = () => {
    const isCorrect = parseInt(userAnswer) === questions[currentIndex]?.answer;
    if (isCorrect) setCorrect(c => c + 1);
    
    if (currentIndex + 1 >= questions.length) {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      setIsComplete(true);
      onComplete(elapsed, correct + (isCorrect ? 1 : 0), questions.length);
    } else {
      setCurrentIndex(i => i + 1);
      setUserAnswer('');
    }
  };

  if (showLearn) {
    return (
      <Modal isOpen onClose={onClose} title={`${tableNumber} Times Table`} size="lg">
        <div className="mb-4">
          <p className="text-slate-600 mb-4">Learn the {tableNumber} times table:</p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {Array.from({ length: 13 }, (_, i) => (
              <div key={i} className="p-2 bg-slate-50 rounded text-center">
                <span className="font-mono text-slate-900">{tableNumber} × {i} = {tableNumber * i}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onClose}>Back</Button>
          <Button variant="primary" onClick={() => setShowLearn(false)}>
            Start Quiz <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </Modal>
    );
  }

  if (isComplete) {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    const beatRecord = bestTime > 0 && elapsed < bestTime;
    return (
      <Modal isOpen onClose={onClose} title="Quiz Complete!" size="md">
        <div className="text-center py-4">
          {beatRecord ? (
            <>
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-xl font-bold text-emerald-600 mb-2">New Record!</h3>
              <p className="text-slate-600">You beat your best time!</p>
            </>
          ) : (
            <>
              <div className="text-5xl mb-4">{correct === questions.length ? '⭐' : '👍'}</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {correct === questions.length ? 'Perfect!' : 'Good Try!'}
              </h3>
            </>
          )}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500">Score</p>
              <p className="text-2xl font-bold text-slate-900">{correct}/{questions.length}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500">Time</p>
              <p className="text-2xl font-bold text-slate-900">{elapsed}s</p>
            </div>
          </div>
          {bestTime > 0 && (
            <p className="text-sm text-slate-500 mt-2">Best time: {bestTime}s</p>
          )}
        </div>
        <div className="flex gap-2 mt-4">
          <Button variant="secondary" onClick={onClose}>Done</Button>
          <Button variant="primary" onClick={() => {
            setCurrentIndex(0);
            setCorrect(0);
            setUserAnswer('');
            setIsComplete(false);
            setShowLearn(true);
          }}>
            <RotateCcw className="w-4 h-4 mr-1" /> Try Again
          </Button>
        </div>
      </Modal>
    );
  }

  const q = questions[currentIndex];
  if (!q) return null;

  return (
    <Modal isOpen onClose={onClose} title={`${tableNumber} Times Table Quiz`} size="md">
      <div className="text-center py-4">
        <div className="flex justify-between text-sm text-slate-500 mb-4">
          <span>Question {currentIndex + 1}/{questions.length}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {Math.round((Date.now() - startTime) / 1000)}s
          </span>
        </div>
        <div className="text-4xl font-bold text-slate-900 mb-6">
          {q.a} × {q.b} = ?
        </div>
        <input
          type="number"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && userAnswer && handleSubmit()}
          className="w-32 text-center text-2xl font-bold p-3 border-2 border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none"
          autoFocus
        />
      </div>
      <div className="flex justify-center mt-4">
        <Button variant="primary" onClick={handleSubmit} disabled={!userAnswer}>
          <Check className="w-4 h-4 mr-1" /> Submit
        </Button>
      </div>
    </Modal>
  );
}


// Roman Numerals Game
function RomanNumeralsGame({ currentLevel, bestTime, onComplete, onClose }: {
  currentLevel: number;
  bestTime: number;
  onComplete: (time: number, correct: number, total: number, newLevel: number) => void;
  onClose: () => void;
}) {
  const [showLearn, setShowLearn] = useState(true);
  const [questions, setQuestions] = useState<{ value: number; roman: string; toRoman: boolean }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [correct, setCorrect] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const ROMAN_MAP: [number, string][] = [
    [1000000, 'M̄'], [500000, 'D̄'], [100000, 'C̄'], [50000, 'L̄'], [10000, 'X̄'],
    [5000, 'V̄'], [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'],
    [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
  ];

  const toRoman = (num: number): string => {
    let result = '';
    for (const [value, symbol] of ROMAN_MAP) {
      while (num >= value) {
        result += symbol;
        num -= value;
      }
    }
    return result;
  };

  const generateQuestions = () => {
    const qs: { value: number; roman: string; toRoman: boolean }[] = [];
    const ranges = [
      { max: 20, count: 5 },
      { max: 100, count: 3 },
      { max: 500, count: 2 },
      ...(currentLevel >= 2 ? [{ max: 1000, count: 2 }] : []),
      ...(currentLevel >= 3 ? [{ max: 5000, count: 2 }] : []),
    ];
    
    for (const range of ranges) {
      for (let i = 0; i < range.count; i++) {
        const value = Math.floor(Math.random() * range.max) + 1;
        qs.push({ value, roman: toRoman(value), toRoman: Math.random() > 0.5 });
      }
    }
    return qs.sort(() => Math.random() - 0.5);
  };

  const startQuiz = () => {
    setQuestions(generateQuestions());
    setShowLearn(false);
    setStartTime(Date.now());
    setCurrentIndex(0);
    setCorrect(0);
    setUserAnswer('');
    setIsComplete(false);
  };

  const handleSubmit = () => {
    const q = questions[currentIndex];
    const correctAnswer = q.toRoman ? q.roman : q.value.toString();
    const isCorrect = userAnswer.toUpperCase().replace(/\s/g, '') === correctAnswer.toUpperCase();
    if (isCorrect) setCorrect(c => c + 1);
    
    if (currentIndex + 1 >= questions.length) {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      const newCorrect = correct + (isCorrect ? 1 : 0);
      const newLevel = newCorrect >= questions.length * 0.8 ? Math.min(currentLevel + 1, 5) : currentLevel;
      setIsComplete(true);
      onComplete(elapsed, newCorrect, questions.length, newLevel);
    } else {
      setCurrentIndex(i => i + 1);
      setUserAnswer('');
    }
  };

  if (showLearn) {
    return (
      <Modal isOpen onClose={onClose} title="Roman Numerals" size="lg">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <p className="text-slate-600">Learn the Roman numeral system:</p>
          
          {/* Basic Symbols */}
          <div>
            <h4 className="font-medium text-slate-900 mb-2">Basic Symbols:</h4>
            <div className="grid grid-cols-7 gap-2">
              {[
                { r: 'I', v: 1 }, { r: 'V', v: 5 }, { r: 'X', v: 10 }, { r: 'L', v: 50 },
                { r: 'C', v: 100 }, { r: 'D', v: 500 }, { r: 'M', v: 1000 },
              ].map(({ r, v }) => (
                <div key={r} className="p-3 bg-amber-50 rounded-lg text-center border border-amber-200">
                  <div className="text-2xl font-bold text-amber-700">{r}</div>
                  <div className="text-sm text-amber-600">{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Numbers 1-10 */}
          <div>
            <h4 className="font-medium text-slate-900 mb-2">Numbers 1 to 10:</h4>
            <div className="grid grid-cols-5 gap-2">
              {[
                { r: 'I', v: 1 }, { r: 'II', v: 2 }, { r: 'III', v: 3 }, { r: 'IV', v: 4 }, { r: 'V', v: 5 },
                { r: 'VI', v: 6 }, { r: 'VII', v: 7 }, { r: 'VIII', v: 8 }, { r: 'IX', v: 9 }, { r: 'X', v: 10 },
              ].map(({ r, v }) => (
                <div key={v} className="p-2 bg-blue-50 rounded-lg text-center border border-blue-200">
                  <div className="text-lg font-bold text-blue-700">{r}</div>
                  <div className="text-xs text-blue-600">{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tens: 10, 20, 30... */}
          <div>
            <h4 className="font-medium text-slate-900 mb-2">Tens (10, 20, 30...):</h4>
            <div className="grid grid-cols-5 gap-2">
              {[
                { r: 'X', v: 10 }, { r: 'XX', v: 20 }, { r: 'XXX', v: 30 }, { r: 'XL', v: 40 }, { r: 'L', v: 50 },
                { r: 'LX', v: 60 }, { r: 'LXX', v: 70 }, { r: 'LXXX', v: 80 }, { r: 'XC', v: 90 }, { r: 'C', v: 100 },
              ].map(({ r, v }) => (
                <div key={v} className="p-2 bg-emerald-50 rounded-lg text-center border border-emerald-200">
                  <div className="text-lg font-bold text-emerald-700">{r}</div>
                  <div className="text-xs text-emerald-600">{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hundreds: 100, 200, 300... */}
          <div>
            <h4 className="font-medium text-slate-900 mb-2">Hundreds (100, 200, 300...):</h4>
            <div className="grid grid-cols-5 gap-2">
              {[
                { r: 'C', v: 100 }, { r: 'CC', v: 200 }, { r: 'CCC', v: 300 }, { r: 'CD', v: 400 }, { r: 'D', v: 500 },
                { r: 'DC', v: 600 }, { r: 'DCC', v: 700 }, { r: 'DCCC', v: 800 }, { r: 'CM', v: 900 }, { r: 'M', v: 1000 },
              ].map(({ r, v }) => (
                <div key={v} className="p-2 bg-purple-50 rounded-lg text-center border border-purple-200">
                  <div className="text-lg font-bold text-purple-700">{r}</div>
                  <div className="text-xs text-purple-600">{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Rules */}
          <div className="p-4 bg-slate-50 rounded-lg">
            <h4 className="font-medium text-slate-900 mb-2">Key Rules:</h4>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Symbols are added left to right: VI = 6, XII = 12</li>
              <li>• Smaller before larger = subtract: IV = 4, IX = 9, XL = 40, XC = 90</li>
              <li>• Never repeat more than 3 times: III = 3, but 4 = IV (not IIII)</li>
              <li>• For thousands+: add a bar over the symbol (×1000): V̄ = 5,000</li>
            </ul>
          </div>

          {/* Examples */}
          <div className="p-4 bg-rose-50 rounded-lg">
            <h4 className="font-medium text-rose-900 mb-2">Practice Examples:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-rose-700">14 = XIV (10+4)</span>
              <span className="text-rose-700">49 = XLIX (40+9)</span>
              <span className="text-rose-700">99 = XCIX (90+9)</span>
              <span className="text-rose-700">444 = CDXLIV</span>
              <span className="text-rose-700">1999 = MCMXCIX</span>
              <span className="text-rose-700">2024 = MMXXIV</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button variant="secondary" onClick={onClose}>Back</Button>
          <Button variant="primary" onClick={startQuiz}>
            Start Quiz <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </Modal>
    );
  }

  if (isComplete) {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    const beatRecord = bestTime > 0 && elapsed < bestTime;
    return (
      <Modal isOpen onClose={onClose} title="Quiz Complete!" size="md">
        <div className="text-center py-4">
          {beatRecord ? (
            <>
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-xl font-bold text-emerald-600 mb-2">New Record!</h3>
            </>
          ) : (
            <div className="text-5xl mb-4">{correct >= questions.length * 0.8 ? '🏛️' : '👍'}</div>
          )}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500">Score</p>
              <p className="text-2xl font-bold text-slate-900">{correct}/{questions.length}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500">Time</p>
              <p className="text-2xl font-bold text-slate-900">{elapsed}s</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button variant="secondary" onClick={onClose}>Done</Button>
          <Button variant="primary" onClick={startQuiz}>
            <RotateCcw className="w-4 h-4 mr-1" /> Try Again
          </Button>
        </div>
      </Modal>
    );
  }

  const q = questions[currentIndex];
  if (!q) return null;

  return (
    <Modal isOpen onClose={onClose} title="Roman Numerals Quiz" size="md">
      <div className="text-center py-4">
        <div className="flex justify-between text-sm text-slate-500 mb-4">
          <span>Question {currentIndex + 1}/{questions.length}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {Math.round((Date.now() - startTime) / 1000)}s
          </span>
        </div>
        <p className="text-slate-600 mb-2">
          {q.toRoman ? 'Convert to Roman numerals:' : 'Convert to a number:'}
        </p>
        <div className="text-4xl font-bold text-slate-900 mb-6">
          {q.toRoman ? q.value : q.roman}
        </div>
        <input
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && userAnswer && handleSubmit()}
          placeholder={q.toRoman ? 'e.g. XIV' : 'e.g. 14'}
          className="w-40 text-center text-2xl font-bold p-3 border-2 border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none"
          autoFocus
        />
      </div>
      <div className="flex justify-center mt-4">
        <Button variant="primary" onClick={handleSubmit} disabled={!userAnswer}>
          <Check className="w-4 h-4 mr-1" /> Submit
        </Button>
      </div>
    </Modal>
  );
}

// Conversion Game (Percent/Decimal)
function ConversionGame({ type, currentLevel, bestTime, onComplete, onClose }: {
  type: 'percent-decimal' | 'decimal-percent';
  currentLevel: number;
  bestTime: number;
  onComplete: (time: number, correct: number, total: number, newLevel: number) => void;
  onClose: () => void;
}) {
  const [showLearn, setShowLearn] = useState(true);
  const [questions, setQuestions] = useState<{ input: number; answer: number }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [correct, setCorrect] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const isPercentToDecimal = type === 'percent-decimal';
  const title = isPercentToDecimal ? 'Percent → Decimal' : 'Decimal → Percent';

  const generateQuestions = () => {
    const qs: { input: number; answer: number }[] = [];
    const count = 10 + currentLevel * 2;
    
    for (let i = 0; i < count; i++) {
      if (isPercentToDecimal) {
        const percent = currentLevel >= 2 
          ? Math.round(Math.random() * 1000) / 10 
          : Math.round(Math.random() * 100);
        qs.push({ input: percent, answer: percent / 100 });
      } else {
        const decimal = currentLevel >= 2
          ? Math.round(Math.random() * 1000) / 1000
          : Math.round(Math.random() * 100) / 100;
        qs.push({ input: decimal, answer: decimal * 100 });
      }
    }
    return qs;
  };

  const startQuiz = () => {
    setQuestions(generateQuestions());
    setShowLearn(false);
    setStartTime(Date.now());
    setCurrentIndex(0);
    setCorrect(0);
    setUserAnswer('');
    setIsComplete(false);
  };

  const handleSubmit = () => {
    const q = questions[currentIndex];
    const userNum = parseFloat(userAnswer);
    const isCorrect = Math.abs(userNum - q.answer) < 0.001;
    if (isCorrect) setCorrect(c => c + 1);
    
    if (currentIndex + 1 >= questions.length) {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      const newCorrect = correct + (isCorrect ? 1 : 0);
      const newLevel = newCorrect >= questions.length * 0.8 ? Math.min(currentLevel + 1, 5) : currentLevel;
      setIsComplete(true);
      onComplete(elapsed, newCorrect, questions.length, newLevel);
    } else {
      setCurrentIndex(i => i + 1);
      setUserAnswer('');
    }
  };

  if (showLearn) {
    return (
      <Modal isOpen onClose={onClose} title={title} size="lg">
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
            <h4 className="font-bold text-emerald-800 mb-2">The Hack:</h4>
            <p className="text-emerald-700 text-lg">
              {isPercentToDecimal 
                ? 'Move the decimal point 2 places LEFT'
                : 'Move the decimal point 2 places RIGHT'}
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg">
            <h4 className="font-medium text-slate-900 mb-3">Examples:</h4>
            <div className="space-y-2">
              {isPercentToDecimal ? (
                <>
                  <div className="flex items-center gap-2 text-slate-700">
                    <span className="font-mono bg-white px-2 py-1 rounded">45%</span>
                    <span>→</span>
                    <span className="font-mono bg-white px-2 py-1 rounded">0.45</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <span className="font-mono bg-white px-2 py-1 rounded">7%</span>
                    <span>→</span>
                    <span className="font-mono bg-white px-2 py-1 rounded">0.07</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <span className="font-mono bg-white px-2 py-1 rounded">125%</span>
                    <span>→</span>
                    <span className="font-mono bg-white px-2 py-1 rounded">1.25</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-slate-700">
                    <span className="font-mono bg-white px-2 py-1 rounded">0.7</span>
                    <span>→</span>
                    <span className="font-mono bg-white px-2 py-1 rounded">70%</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <span className="font-mono bg-white px-2 py-1 rounded">0.05</span>
                    <span>→</span>
                    <span className="font-mono bg-white px-2 py-1 rounded">5%</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <span className="font-mono bg-white px-2 py-1 rounded">1.5</span>
                    <span>→</span>
                    <span className="font-mono bg-white px-2 py-1 rounded">150%</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button variant="secondary" onClick={onClose}>Back</Button>
          <Button variant="primary" onClick={startQuiz}>
            Start Quiz <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </Modal>
    );
  }

  if (isComplete) {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    const beatRecord = bestTime > 0 && elapsed < bestTime;
    return (
      <Modal isOpen onClose={onClose} title="Quiz Complete!" size="md">
        <div className="text-center py-4">
          {beatRecord && <div className="text-5xl mb-4">🎉</div>}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500">Score</p>
              <p className="text-2xl font-bold text-slate-900">{correct}/{questions.length}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500">Time</p>
              <p className="text-2xl font-bold text-slate-900">{elapsed}s</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button variant="secondary" onClick={onClose}>Done</Button>
          <Button variant="primary" onClick={startQuiz}>
            <RotateCcw className="w-4 h-4 mr-1" /> Try Again
          </Button>
        </div>
      </Modal>
    );
  }

  const q = questions[currentIndex];
  if (!q) return null;

  return (
    <Modal isOpen onClose={onClose} title={`${title} Quiz`} size="md">
      <div className="text-center py-4">
        <div className="flex justify-between text-sm text-slate-500 mb-4">
          <span>Question {currentIndex + 1}/{questions.length}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {Math.round((Date.now() - startTime) / 1000)}s
          </span>
        </div>
        <p className="text-slate-600 mb-2">
          Convert {isPercentToDecimal ? 'to decimal' : 'to percent'}:
        </p>
        <div className="text-4xl font-bold text-slate-900 mb-6">
          {isPercentToDecimal ? `${q.input}%` : q.input}
        </div>
        <input
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && userAnswer && handleSubmit()}
          placeholder={isPercentToDecimal ? '0.45' : '70'}
          className="w-40 text-center text-2xl font-bold p-3 border-2 border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none"
          autoFocus
        />
        {!isPercentToDecimal && <span className="text-2xl font-bold text-slate-400 ml-2">%</span>}
      </div>
      <div className="flex justify-center mt-4">
        <Button variant="primary" onClick={handleSubmit} disabled={!userAnswer}>
          <Check className="w-4 h-4 mr-1" /> Submit
        </Button>
      </div>
    </Modal>
  );
}

// Fractions Game
function FractionsGame({ currentLevel, bestTime, onComplete, onClose }: {
  currentLevel: number;
  bestTime: number;
  onComplete: (time: number, correct: number, total: number, newLevel: number) => void;
  onClose: () => void;
}) {
  const [showLearn, setShowLearn] = useState(true);
  const [questions, setQuestions] = useState<{ num: number; den: number; toDecimal: boolean; answer: number }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [correct, setCorrect] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const generateQuestions = () => {
    const qs: { num: number; den: number; toDecimal: boolean; answer: number }[] = [];
    const denominators = [2, 4, 5, 10, ...(currentLevel >= 2 ? [3, 8, 20, 25] : [])];
    const count = 10 + currentLevel * 2;
    
    for (let i = 0; i < count; i++) {
      const den = denominators[Math.floor(Math.random() * denominators.length)];
      const num = Math.floor(Math.random() * den) + 1;
      const toDecimal = Math.random() > 0.5;
      const decimal = num / den;
      qs.push({ 
        num, 
        den, 
        toDecimal,
        answer: toDecimal ? decimal : decimal * 100
      });
    }
    return qs;
  };

  const startQuiz = () => {
    setQuestions(generateQuestions());
    setShowLearn(false);
    setStartTime(Date.now());
    setCurrentIndex(0);
    setCorrect(0);
    setUserAnswer('');
    setIsComplete(false);
  };

  const handleSubmit = () => {
    const q = questions[currentIndex];
    const userNum = parseFloat(userAnswer);
    const isCorrect = Math.abs(userNum - q.answer) < 0.01;
    if (isCorrect) setCorrect(c => c + 1);
    
    if (currentIndex + 1 >= questions.length) {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      const newCorrect = correct + (isCorrect ? 1 : 0);
      const newLevel = newCorrect >= questions.length * 0.8 ? Math.min(currentLevel + 1, 5) : currentLevel;
      setIsComplete(true);
      onComplete(elapsed, newCorrect, questions.length, newLevel);
    } else {
      setCurrentIndex(i => i + 1);
      setUserAnswer('');
    }
  };

  if (showLearn) {
    return (
      <Modal isOpen onClose={onClose} title="Fraction Conversions" size="lg">
        <div className="space-y-4">
          <p className="text-slate-600">Convert fractions to decimals and percents:</p>
          
          <div className="p-4 bg-rose-50 rounded-lg border border-rose-200">
            <h4 className="font-bold text-rose-800 mb-2">The Method:</h4>
            <p className="text-rose-700">Divide the top number by the bottom number</p>
            <p className="text-rose-600 text-sm mt-1">Then multiply by 100 for percent</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg">
            <h4 className="font-medium text-slate-900 mb-3">Common Fractions:</h4>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="bg-white p-2 rounded text-center">
                <div className="font-bold">1/2</div>
                <div className="text-slate-500">0.5 = 50%</div>
              </div>
              <div className="bg-white p-2 rounded text-center">
                <div className="font-bold">1/4</div>
                <div className="text-slate-500">0.25 = 25%</div>
              </div>
              <div className="bg-white p-2 rounded text-center">
                <div className="font-bold">3/4</div>
                <div className="text-slate-500">0.75 = 75%</div>
              </div>
              <div className="bg-white p-2 rounded text-center">
                <div className="font-bold">1/5</div>
                <div className="text-slate-500">0.2 = 20%</div>
              </div>
              <div className="bg-white p-2 rounded text-center">
                <div className="font-bold">1/10</div>
                <div className="text-slate-500">0.1 = 10%</div>
              </div>
              <div className="bg-white p-2 rounded text-center">
                <div className="font-bold">1/3</div>
                <div className="text-slate-500">0.33... = 33%</div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button variant="secondary" onClick={onClose}>Back</Button>
          <Button variant="primary" onClick={startQuiz}>
            Start Quiz <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </Modal>
    );
  }

  if (isComplete) {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    const beatRecord = bestTime > 0 && elapsed < bestTime;
    return (
      <Modal isOpen onClose={onClose} title="Quiz Complete!" size="md">
        <div className="text-center py-4">
          {beatRecord && <div className="text-5xl mb-4">🎉</div>}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500">Score</p>
              <p className="text-2xl font-bold text-slate-900">{correct}/{questions.length}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500">Time</p>
              <p className="text-2xl font-bold text-slate-900">{elapsed}s</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button variant="secondary" onClick={onClose}>Done</Button>
          <Button variant="primary" onClick={startQuiz}>
            <RotateCcw className="w-4 h-4 mr-1" /> Try Again
          </Button>
        </div>
      </Modal>
    );
  }

  const q = questions[currentIndex];
  if (!q) return null;

  return (
    <Modal isOpen onClose={onClose} title="Fraction Conversions Quiz" size="md">
      <div className="text-center py-4">
        <div className="flex justify-between text-sm text-slate-500 mb-4">
          <span>Question {currentIndex + 1}/{questions.length}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {Math.round((Date.now() - startTime) / 1000)}s
          </span>
        </div>
        <p className="text-slate-600 mb-2">
          Convert to {q.toDecimal ? 'decimal' : 'percent'}:
        </p>
        <div className="text-4xl font-bold text-slate-900 mb-6">
          <span className="inline-flex flex-col items-center">
            <span className="border-b-2 border-slate-900 px-2">{q.num}</span>
            <span className="px-2">{q.den}</span>
          </span>
        </div>
        <input
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && userAnswer && handleSubmit()}
          placeholder={q.toDecimal ? '0.5' : '50'}
          className="w-40 text-center text-2xl font-bold p-3 border-2 border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none"
          autoFocus
        />
        {!q.toDecimal && <span className="text-2xl font-bold text-slate-400 ml-2">%</span>}
      </div>
      <div className="flex justify-center mt-4">
        <Button variant="primary" onClick={handleSubmit} disabled={!userAnswer}>
          <Check className="w-4 h-4 mr-1" /> Submit
        </Button>
      </div>
    </Modal>
  );
}

export default MathsGamesPage;
