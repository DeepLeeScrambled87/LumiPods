// French Reading Games - Syllable-based phonics learning
// Unlike English CVC, French uses CV syllables as building blocks
import { useState } from 'react';
import {
  BookOpen,
  Trophy,
  Clock,
  Star,
  ChevronRight,
  RotateCcw,
  Zap,
  Volume2,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useLocalStorage } from '../../hooks/useLocalStorage';

// Helper functions
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getRandomOptions(correct: string, allOptions: string[], count: number): string[] {
  const others = allOptions.filter(o => o !== correct);
  return shuffleArray(others).slice(0, count);
}

// Types
interface FrenchScore {
  wordsLearned: number;
  bestTime: number;
  totalAttempts: number;
  correctAnswers: number;
  level: number;
  lastPlayed: string;
}

interface FrenchScores {
  // Foundation levels
  daysOfWeek: FrenchScore;
  monthsOfYear: FrenchScore;
  seasons: FrenchScore;
  numbers: FrenchScore;
  // Phonics levels
  pureSounds: FrenchScore;
  cvSyllables: FrenchScore;
  syllableStack: FrenchScore;
  soundFamilies: FrenchScore;
  wholeWords: FrenchScore;
  homophones: FrenchScore;
  // Grammar levels
  nouns: FrenchScore;
  verbs: FrenchScore;
  adjectives: FrenchScore;
  pronouns: FrenchScore;
  conjunctions: FrenchScore;
}

type GameType = 
  | 'days' | 'months' | 'seasons' | 'numbers'
  | 'sounds' | 'cv-syllables' | 'syllable-stack' | 'sound-families' 
  | 'whole-words' | 'homophones'
  | 'nouns' | 'verbs' | 'adjectives' | 'pronouns' | 'conjunctions';

const DEFAULT_SCORE: FrenchScore = { 
  wordsLearned: 0, bestTime: 0, totalAttempts: 0, correctAnswers: 0, level: 1, lastPlayed: '' 
};

const DEFAULT_SCORES: FrenchScores = {
  daysOfWeek: { ...DEFAULT_SCORE },
  monthsOfYear: { ...DEFAULT_SCORE },
  seasons: { ...DEFAULT_SCORE },
  numbers: { ...DEFAULT_SCORE },
  pureSounds: { ...DEFAULT_SCORE },
  cvSyllables: { ...DEFAULT_SCORE },
  syllableStack: { ...DEFAULT_SCORE },
  soundFamilies: { ...DEFAULT_SCORE },
  wholeWords: { ...DEFAULT_SCORE },
  homophones: { ...DEFAULT_SCORE },
  nouns: { ...DEFAULT_SCORE },
  verbs: { ...DEFAULT_SCORE },
  adjectives: { ...DEFAULT_SCORE },
  pronouns: { ...DEFAULT_SCORE },
  conjunctions: { ...DEFAULT_SCORE },
};

// Game categories
const FOUNDATION_GAMES = [
  {
    id: 'days' as GameType,
    title: 'Days of the Week',
    titleFr: 'Les Jours de la Semaine',
    icon: '📅',
    color: 'from-blue-500 to-indigo-600',
    description: 'Learn lundi, mardi, mercredi...',
    ageRange: '5+',
  },
  {
    id: 'months' as GameType,
    title: 'Months of the Year',
    titleFr: 'Les Mois de l\'Année',
    icon: '🗓️',
    color: 'from-emerald-500 to-teal-600',
    description: 'janvier, février, mars...',
    ageRange: '5+',
  },
  {
    id: 'seasons' as GameType,
    title: 'Seasons & Phrases',
    titleFr: 'Les Saisons',
    icon: '🌸',
    color: 'from-amber-500 to-orange-600',
    description: 'le printemps, l\'été, l\'automne, l\'hiver',
    ageRange: '5+',
  },
  {
    id: 'numbers' as GameType,
    title: 'Numbers 1-100',
    titleFr: 'Les Nombres',
    icon: '🔢',
    color: 'from-purple-500 to-violet-600',
    description: 'Learn the logic of French counting',
    ageRange: '6+',
  },
];

const PHONICS_GAMES = [
  {
    id: 'sounds' as GameType,
    title: 'Pure Sounds',
    titleFr: 'Les Sons Purs',
    icon: '🔊',
    color: 'from-rose-500 to-pink-600',
    description: 'a, i, o, u, é, è - vowel sounds',
    ageRange: '5-7',
    layer: 1,
  },
  {
    id: 'cv-syllables' as GameType,
    title: 'CV Syllables',
    titleFr: 'Les Syllabes',
    icon: '🧩',
    color: 'from-cyan-500 to-blue-600',
    description: 'ma, ta, sa, la - consonant + vowel',
    ageRange: '5-7',
    layer: 2,
  },
  {
    id: 'syllable-stack' as GameType,
    title: 'Syllable Stacking',
    titleFr: 'Empiler les Syllabes',
    icon: '🏗️',
    color: 'from-green-500 to-emerald-600',
    description: 'ma-man, pa-pa, to-ma-te',
    ageRange: '6-8',
    layer: 3,
  },
  {
    id: 'sound-families' as GameType,
    title: 'Sound Families',
    titleFr: 'Les Familles de Sons',
    icon: '👨‍👩‍👧',
    color: 'from-indigo-500 to-purple-600',
    description: 'pan/fan/man, bon/ton/son',
    ageRange: '7-10',
    layer: 4,
  },
  {
    id: 'whole-words' as GameType,
    title: 'Whole Words',
    titleFr: 'Les Mots Entiers',
    icon: '📖',
    color: 'from-orange-500 to-red-600',
    description: 'table, pomme, livre',
    ageRange: '8-12',
    layer: 5,
  },
  {
    id: 'homophones' as GameType,
    title: 'Homophones',
    titleFr: 'Les Homophones',
    icon: '🎭',
    color: 'from-fuchsia-500 to-pink-600',
    description: 'seau/sot/saut - same sound, different meaning',
    ageRange: '12+',
    layer: 6,
  },
];

const GRAMMAR_GAMES = [
  {
    id: 'nouns' as GameType,
    title: 'Nouns',
    titleFr: 'Les Noms',
    icon: '🏠',
    color: 'from-sky-500 to-blue-600',
    description: 'le/la, un/une - gender & articles',
    ageRange: '7+',
    layer: 7,
  },
  {
    id: 'verbs' as GameType,
    title: 'Verbs & Adverbs',
    titleFr: 'Les Verbes',
    icon: '🏃',
    color: 'from-lime-500 to-green-600',
    description: 'être, avoir, aller, faire',
    ageRange: '8+',
    layer: 8,
  },
  {
    id: 'adjectives' as GameType,
    title: 'Adjectives',
    titleFr: 'Les Adjectifs',
    icon: '🎨',
    color: 'from-yellow-500 to-amber-600',
    description: 'grand/grande, petit/petite',
    ageRange: '8+',
    layer: 9,
  },
  {
    id: 'pronouns' as GameType,
    title: 'Pronouns',
    titleFr: 'Les Pronoms',
    icon: '👤',
    color: 'from-teal-500 to-cyan-600',
    description: 'je, tu, il, elle, nous, vous, ils',
    ageRange: '9+',
    layer: 10,
  },
  {
    id: 'conjunctions' as GameType,
    title: 'Conjunctions',
    titleFr: 'Les Conjonctions',
    icon: '🔗',
    color: 'from-violet-500 to-purple-600',
    description: 'et, ou, mais, donc, car',
    ageRange: '10+',
    layer: 11,
  },
];

export function FrenchReadingPage() {
  const [scores, setScores] = useLocalStorage<FrenchScores>('french-scores', DEFAULT_SCORES);
  const [activeGame, setActiveGame] = useState<GameType | null>(null);

  const handleCloseGame = () => setActiveGame(null);

  const getTotalWordsLearned = () => {
    return Object.values(scores).reduce((sum, s) => sum + s.wordsLearned, 0);
  };

  const updateScore = (gameType: GameType, newScore: Partial<FrenchScore>) => {
    const keyMap: Record<GameType, keyof FrenchScores> = {
      'days': 'daysOfWeek', 'months': 'monthsOfYear', 'seasons': 'seasons', 'numbers': 'numbers',
      'sounds': 'pureSounds', 'cv-syllables': 'cvSyllables', 'syllable-stack': 'syllableStack',
      'sound-families': 'soundFamilies', 'whole-words': 'wholeWords', 'homophones': 'homophones',
      'nouns': 'nouns', 'verbs': 'verbs', 'adjectives': 'adjectives', 
      'pronouns': 'pronouns', 'conjunctions': 'conjunctions',
    };
    const key = keyMap[gameType];
    setScores(prev => ({
      ...prev,
      [key]: { ...prev[key], ...newScore, lastPlayed: new Date().toISOString() },
    }));
  };

  const getScoreForGame = (gameType: GameType): FrenchScore => {
    const keyMap: Record<GameType, keyof FrenchScores> = {
      'days': 'daysOfWeek', 'months': 'monthsOfYear', 'seasons': 'seasons', 'numbers': 'numbers',
      'sounds': 'pureSounds', 'cv-syllables': 'cvSyllables', 'syllable-stack': 'syllableStack',
      'sound-families': 'soundFamilies', 'whole-words': 'wholeWords', 'homophones': 'homophones',
      'nouns': 'nouns', 'verbs': 'verbs', 'adjectives': 'adjectives', 
      'pronouns': 'pronouns', 'conjunctions': 'conjunctions',
    };
    return scores[keyMap[gameType]];
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="h-6 w-6 text-slate-600" />
            <h1 className="text-2xl font-semibold text-slate-900">French Reading</h1>
            <span className="text-2xl">🇫🇷</span>
          </div>
          <p className="text-slate-600">
            Learn French through syllables, not letters. The natural way French children learn to read!
          </p>
        </header>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0">
            <div className="flex items-center gap-2 text-blue-100 text-xs mb-1">
              <Sparkles className="h-4 w-4" />
              Words Learned
            </div>
            <p className="text-3xl font-bold">{getTotalWordsLearned()}</p>
          </Card>
          <Card className="p-4 bg-white border border-slate-200">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <Trophy className="h-4 w-4 text-amber-500" />
              Foundation
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {[scores.daysOfWeek, scores.monthsOfYear, scores.seasons, scores.numbers]
                .filter(s => s.level >= 3).length}/4
            </p>
          </Card>
          <Card className="p-4 bg-white border border-slate-200">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <Zap className="h-4 w-4 text-purple-500" />
              Phonics Progress
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {[scores.pureSounds, scores.cvSyllables, scores.syllableStack, 
                scores.soundFamilies, scores.wholeWords, scores.homophones]
                .filter(s => s.level >= 2).length}/6
            </p>
          </Card>
          <Card className="p-4 bg-white border border-slate-200">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <Star className="h-4 w-4 text-emerald-500" />
              Grammar Mastery
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {[scores.nouns, scores.verbs, scores.adjectives, scores.pronouns, scores.conjunctions]
                .filter(s => s.level >= 2).length}/5
            </p>
          </Card>
        </div>

        {/* Foundation Section */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span className="text-xl">🌱</span>
            Foundation
            <Badge>Start Here</Badge>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {FOUNDATION_GAMES.map(game => (
              <GameCard
                key={game.id}
                game={game}
                score={getScoreForGame(game.id)}
                onPlay={() => setActiveGame(game.id)}
              />
            ))}
          </div>
        </section>

        {/* Phonics Section */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span className="text-xl">🔤</span>
            Phonics Journey
            <Badge variant="info">Syllable-Based</Badge>
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            French uses CV (consonant-vowel) syllables as building blocks, not CVC like English.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PHONICS_GAMES.map(game => (
              <GameCard
                key={game.id}
                game={game}
                score={getScoreForGame(game.id)}
                onPlay={() => setActiveGame(game.id)}
                showLayer
              />
            ))}
          </div>
        </section>

        {/* Grammar Section */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span className="text-xl">📚</span>
            Grammar Building
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {GRAMMAR_GAMES.map(game => (
              <GameCard
                key={game.id}
                game={game}
                score={getScoreForGame(game.id)}
                onPlay={() => setActiveGame(game.id)}
                showLayer
              />
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="mt-12">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">How French Reading Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 bg-white border border-slate-200 text-center">
              <div className="text-3xl mb-3">🔊</div>
              <h3 className="font-medium text-slate-900 mb-2">Sound First</h3>
              <p className="text-sm text-slate-600">
                Learn sounds, not letters. "ma" is ONE sound, not m-a.
              </p>
            </Card>
            <Card className="p-4 bg-white border border-slate-200 text-center">
              <div className="text-3xl mb-3">🧩</div>
              <h3 className="font-medium text-slate-900 mb-2">Stack Syllables</h3>
              <p className="text-sm text-slate-600">
                Build words by combining syllables: ma-man, to-ma-te
              </p>
            </Card>
            <Card className="p-4 bg-white border border-slate-200 text-center">
              <div className="text-3xl mb-3">👂</div>
              <h3 className="font-medium text-slate-900 mb-2">Pattern Recognition</h3>
              <p className="text-sm text-slate-600">
                Same endings: pan, fan, man. Same starts: chat, rat, plat.
              </p>
            </Card>
            <Card className="p-4 bg-white border border-slate-200 text-center">
              <div className="text-3xl mb-3">🎮</div>
              <h3 className="font-medium text-slate-900 mb-2">Game-Based</h3>
              <p className="text-sm text-slate-600">
                Match, build, speed rounds - feels like play, not school!
              </p>
            </Card>
          </div>
        </section>
      </div>

      {/* Game Modals */}
      {activeGame === 'days' && (
        <DaysOfWeekGame
          score={scores.daysOfWeek}
          onComplete={(wordsLearned, correct, total, time) => {
            const current = scores.daysOfWeek;
            const newBest = current.bestTime === 0 || time < current.bestTime ? time : current.bestTime;
            const newLevel = correct >= total * 0.8 ? Math.min(current.level + 1, 5) : current.level;
            updateScore('days', {
              wordsLearned: Math.max(current.wordsLearned, wordsLearned),
              bestTime: newBest,
              totalAttempts: current.totalAttempts + 1,
              correctAnswers: current.correctAnswers + correct,
              level: newLevel,
            });
          }}
          onClose={handleCloseGame}
        />
      )}

      {activeGame === 'months' && (
        <MonthsGame
          score={scores.monthsOfYear}
          onComplete={(wordsLearned, correct, _total, time) => {
            const current = scores.monthsOfYear;
            const newBest = current.bestTime === 0 || time < current.bestTime ? time : current.bestTime;
            updateScore('months', {
              wordsLearned: Math.max(current.wordsLearned, wordsLearned),
              bestTime: newBest,
              totalAttempts: current.totalAttempts + 1,
              correctAnswers: current.correctAnswers + correct,
              level: Math.min(current.level + 1, 5),
            });
          }}
          onClose={handleCloseGame}
        />
      )}

      {activeGame === 'seasons' && (
        <SeasonsGame
          score={scores.seasons}
          onComplete={(wordsLearned, correct, _total, time) => {
            const current = scores.seasons;
            const newBest = current.bestTime === 0 || time < current.bestTime ? time : current.bestTime;
            updateScore('seasons', {
              wordsLearned: Math.max(current.wordsLearned, wordsLearned),
              bestTime: newBest,
              totalAttempts: current.totalAttempts + 1,
              correctAnswers: current.correctAnswers + correct,
              level: Math.min(current.level + 1, 5),
            });
          }}
          onClose={handleCloseGame}
        />
      )}

      {activeGame === 'numbers' && (
        <NumbersGame
          score={scores.numbers}
          onComplete={(wordsLearned, correct, _total, time) => {
            const current = scores.numbers;
            const newBest = current.bestTime === 0 || time < current.bestTime ? time : current.bestTime;
            updateScore('numbers', {
              wordsLearned: Math.max(current.wordsLearned, wordsLearned),
              bestTime: newBest,
              totalAttempts: current.totalAttempts + 1,
              correctAnswers: current.correctAnswers + correct,
              level: Math.min(current.level + 1, 5),
            });
          }}
          onClose={handleCloseGame}
        />
      )}

      {activeGame === 'sounds' && (
        <PureSoundsGame
          score={scores.pureSounds}
          onComplete={(wordsLearned, correct, _total, time) => {
            const current = scores.pureSounds;
            const newBest = current.bestTime === 0 || time < current.bestTime ? time : current.bestTime;
            updateScore('sounds', {
              wordsLearned: Math.max(current.wordsLearned, wordsLearned),
              bestTime: newBest,
              totalAttempts: current.totalAttempts + 1,
              correctAnswers: current.correctAnswers + correct,
              level: Math.min(current.level + 1, 5),
            });
          }}
          onClose={handleCloseGame}
        />
      )}

      {activeGame === 'cv-syllables' && (
        <CVSyllablesGame
          score={scores.cvSyllables}
          onComplete={(wordsLearned, correct, _total, time) => {
            const current = scores.cvSyllables;
            const newBest = current.bestTime === 0 || time < current.bestTime ? time : current.bestTime;
            updateScore('cv-syllables', {
              wordsLearned: Math.max(current.wordsLearned, wordsLearned),
              bestTime: newBest,
              totalAttempts: current.totalAttempts + 1,
              correctAnswers: current.correctAnswers + correct,
              level: Math.min(current.level + 1, 5),
            });
          }}
          onClose={handleCloseGame}
        />
      )}

      {activeGame === 'syllable-stack' && (
        <SyllableStackGame
          score={scores.syllableStack}
          onComplete={(wordsLearned, correct, _total, time) => {
            const current = scores.syllableStack;
            const newBest = current.bestTime === 0 || time < current.bestTime ? time : current.bestTime;
            updateScore('syllable-stack', {
              wordsLearned: Math.max(current.wordsLearned, wordsLearned),
              bestTime: newBest,
              totalAttempts: current.totalAttempts + 1,
              correctAnswers: current.correctAnswers + correct,
              level: Math.min(current.level + 1, 5),
            });
          }}
          onClose={handleCloseGame}
        />
      )}

      {activeGame === 'sound-families' && (
        <SoundFamiliesGame
          score={scores.soundFamilies}
          onComplete={(wordsLearned, correct, _total, time) => {
            const current = scores.soundFamilies;
            const newBest = current.bestTime === 0 || time < current.bestTime ? time : current.bestTime;
            updateScore('sound-families', {
              wordsLearned: Math.max(current.wordsLearned, wordsLearned),
              bestTime: newBest,
              totalAttempts: current.totalAttempts + 1,
              correctAnswers: current.correctAnswers + correct,
              level: Math.min(current.level + 1, 5),
            });
          }}
          onClose={handleCloseGame}
        />
      )}

      {activeGame === 'whole-words' && (
        <WholeWordsGame
          score={scores.wholeWords}
          onComplete={(wordsLearned, correct, _total, time) => {
            const current = scores.wholeWords;
            const newBest = current.bestTime === 0 || time < current.bestTime ? time : current.bestTime;
            updateScore('whole-words', {
              wordsLearned: Math.max(current.wordsLearned, wordsLearned),
              bestTime: newBest,
              totalAttempts: current.totalAttempts + 1,
              correctAnswers: current.correctAnswers + correct,
              level: Math.min(current.level + 1, 5),
            });
          }}
          onClose={handleCloseGame}
        />
      )}

      {activeGame === 'homophones' && (
        <HomophonesGame
          score={scores.homophones}
          onComplete={(wordsLearned, correct, _total, time) => {
            const current = scores.homophones;
            const newBest = current.bestTime === 0 || time < current.bestTime ? time : current.bestTime;
            updateScore('homophones', {
              wordsLearned: Math.max(current.wordsLearned, wordsLearned),
              bestTime: newBest,
              totalAttempts: current.totalAttempts + 1,
              correctAnswers: current.correctAnswers + correct,
              level: Math.min(current.level + 1, 5),
            });
          }}
          onClose={handleCloseGame}
        />
      )}

      {activeGame === 'nouns' && (
        <NounsGame
          score={scores.nouns}
          onComplete={(wordsLearned, correct, _total, time) => {
            const current = scores.nouns;
            const newBest = current.bestTime === 0 || time < current.bestTime ? time : current.bestTime;
            updateScore('nouns', {
              wordsLearned: Math.max(current.wordsLearned, wordsLearned),
              bestTime: newBest,
              totalAttempts: current.totalAttempts + 1,
              correctAnswers: current.correctAnswers + correct,
              level: Math.min(current.level + 1, 5),
            });
          }}
          onClose={handleCloseGame}
        />
      )}

      {activeGame === 'verbs' && (
        <VerbsGame
          score={scores.verbs}
          onComplete={(wordsLearned, correct, _total, time) => {
            const current = scores.verbs;
            const newBest = current.bestTime === 0 || time < current.bestTime ? time : current.bestTime;
            updateScore('verbs', {
              wordsLearned: Math.max(current.wordsLearned, wordsLearned),
              bestTime: newBest,
              totalAttempts: current.totalAttempts + 1,
              correctAnswers: current.correctAnswers + correct,
              level: Math.min(current.level + 1, 5),
            });
          }}
          onClose={handleCloseGame}
        />
      )}

      {activeGame === 'adjectives' && (
        <AdjectivesGame
          score={scores.adjectives}
          onComplete={(wordsLearned, correct, _total, time) => {
            const current = scores.adjectives;
            const newBest = current.bestTime === 0 || time < current.bestTime ? time : current.bestTime;
            updateScore('adjectives', {
              wordsLearned: Math.max(current.wordsLearned, wordsLearned),
              bestTime: newBest,
              totalAttempts: current.totalAttempts + 1,
              correctAnswers: current.correctAnswers + correct,
              level: Math.min(current.level + 1, 5),
            });
          }}
          onClose={handleCloseGame}
        />
      )}

      {activeGame === 'pronouns' && (
        <PronounsGame
          score={scores.pronouns}
          onComplete={(wordsLearned, correct, _total, time) => {
            const current = scores.pronouns;
            const newBest = current.bestTime === 0 || time < current.bestTime ? time : current.bestTime;
            updateScore('pronouns', {
              wordsLearned: Math.max(current.wordsLearned, wordsLearned),
              bestTime: newBest,
              totalAttempts: current.totalAttempts + 1,
              correctAnswers: current.correctAnswers + correct,
              level: Math.min(current.level + 1, 5),
            });
          }}
          onClose={handleCloseGame}
        />
      )}

      {activeGame === 'conjunctions' && (
        <ConjunctionsGame
          score={scores.conjunctions}
          onComplete={(wordsLearned, correct, _total, time) => {
            const current = scores.conjunctions;
            const newBest = current.bestTime === 0 || time < current.bestTime ? time : current.bestTime;
            updateScore('conjunctions', {
              wordsLearned: Math.max(current.wordsLearned, wordsLearned),
              bestTime: newBest,
              totalAttempts: current.totalAttempts + 1,
              correctAnswers: current.correctAnswers + correct,
              level: Math.min(current.level + 1, 5),
            });
          }}
          onClose={handleCloseGame}
        />
      )}
    </div>
  );
}

// Game Card Component
function GameCard({ game, score, onPlay, showLayer }: { 
  game: { id: GameType; title: string; titleFr?: string; icon: string; color: string; description: string; ageRange: string; layer?: number };
  score: FrenchScore;
  onPlay: () => void;
  showLayer?: boolean;
}) {
  return (
    <Card className="overflow-hidden bg-white border border-slate-200 hover:shadow-lg transition-shadow">
      <div className={`h-20 bg-gradient-to-br ${game.color} flex items-center justify-center relative`}>
        <span className="text-4xl">{game.icon}</span>
        {showLayer && game.layer && (
          <span className="absolute top-2 left-2 bg-white/90 text-xs font-bold px-2 py-0.5 rounded">
            Layer {game.layer}
          </span>
        )}
        <span className="absolute top-2 right-2 bg-white/90 text-xs px-2 py-0.5 rounded">
          {game.ageRange}
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-slate-900">{game.title}</h3>
          <Badge variant={score.level >= 3 ? 'success' : score.level >= 2 ? 'warning' : 'default'}>
            Lv {score.level}
          </Badge>
        </div>
        {game.titleFr && (
          <p className="text-xs text-blue-600 italic mb-1">{game.titleFr}</p>
        )}
        <p className="text-sm text-slate-600 mb-3">{game.description}</p>
        
        {score.wordsLearned > 0 && (
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-500" />
              {score.wordsLearned} words
            </span>
            {score.bestTime > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {score.bestTime}s best
              </span>
            )}
          </div>
        )}
        
        <Button variant="primary" size="sm" className="w-full" onClick={onPlay}>
          {score.totalAttempts > 0 ? 'Continue' : 'Start'} <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </Card>
  );
}


// ============ FOUNDATION GAMES ============

// Days of the Week Game
function DaysOfWeekGame({ score: _score, onComplete, onClose }: {
  score: FrenchScore;
  onComplete: (wordsLearned: number, correct: number, total: number, time: number) => void;
  onClose: () => void;
}) {
  const [showLearn, setShowLearn] = useState(true);
  const [questions, setQuestions] = useState<{ french: string; english: string; options: string[] }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const DAYS = [
    { french: 'lundi', english: 'Monday' },
    { french: 'mardi', english: 'Tuesday' },
    { french: 'mercredi', english: 'Wednesday' },
    { french: 'jeudi', english: 'Thursday' },
    { french: 'vendredi', english: 'Friday' },
    { french: 'samedi', english: 'Saturday' },
    { french: 'dimanche', english: 'Sunday' },
  ];

  const startQuiz = () => {
    const qs = DAYS.map(day => ({
      french: day.french,
      english: day.english,
      options: shuffleArray([day.french, ...getRandomOptions(day.french, DAYS.map(d => d.french), 3)]),
    }));
    setQuestions(shuffleArray(qs));
    setShowLearn(false);
    setStartTime(Date.now());
    setCurrentIndex(0);
    setCorrect(0);
    setIsComplete(false);
  };

  const handleAnswer = (answer: string) => {
    const isCorrect = answer === questions[currentIndex].french;
    if (isCorrect) setCorrect(c => c + 1);
    
    if (currentIndex + 1 >= questions.length) {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      setIsComplete(true);
      onComplete(7, correct + (isCorrect ? 1 : 0), questions.length, elapsed);
    } else {
      setCurrentIndex(i => i + 1);
    }
  };

  if (showLearn) {
    return (
      <Modal isOpen onClose={onClose} title="Days of the Week" size="lg">
        <div className="space-y-4">
          <p className="text-slate-600">Les Jours de la Semaine - Learn the days in French:</p>
          
          <div className="grid grid-cols-1 gap-2">
            {DAYS.map((day, i) => (
              <div key={day.french} className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <span className="text-lg font-bold text-blue-700">{day.french}</span>
                  <span className="text-slate-500 ml-3">{day.english}</span>
                </div>
                <button className="p-2 hover:bg-blue-100 rounded-full">
                  <Volume2 className="w-4 h-4 text-blue-500" />
                </button>
              </div>
            ))}
          </div>

          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-sm text-amber-800">
              💡 <strong>Tip:</strong> French days don't start with capital letters like English!
            </p>
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
    return (
      <Modal isOpen onClose={onClose} title="Bien fait!" size="md">
        <div className="text-center py-4">
          <div className="text-5xl mb-4">{correct === questions.length ? '🎉' : '👍'}</div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            {correct === questions.length ? 'Parfait!' : 'Bon travail!'}
          </h3>
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
          <Button variant="primary" onClick={() => setShowLearn(true)}>
            <RotateCcw className="w-4 h-4 mr-1" /> Try Again
          </Button>
        </div>
      </Modal>
    );
  }

  const q = questions[currentIndex];
  if (!q) return null;

  return (
    <Modal isOpen onClose={onClose} title="Days of the Week Quiz" size="md">
      <div className="text-center py-4">
        <div className="flex justify-between text-sm text-slate-500 mb-4">
          <span>Question {currentIndex + 1}/{questions.length}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {Math.round((Date.now() - startTime) / 1000)}s
          </span>
        </div>
        <p className="text-slate-600 mb-2">What is "{q.english}" in French?</p>
        <div className="grid grid-cols-2 gap-3 mt-6">
          {q.options.map(option => (
            <button
              key={option}
              onClick={() => handleAnswer(option)}
              className="p-4 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-400 rounded-xl text-lg font-semibold text-blue-700 transition-all"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}

// Months Game
function MonthsGame({ score: _score, onComplete, onClose }: {
  score: FrenchScore;
  onComplete: (wordsLearned: number, correct: number, total: number, time: number) => void;
  onClose: () => void;
}) {
  const [showLearn, setShowLearn] = useState(true);
  const [questions, setQuestions] = useState<{ french: string; english: string; options: string[] }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const MONTHS = [
    { french: 'janvier', english: 'January' },
    { french: 'février', english: 'February' },
    { french: 'mars', english: 'March' },
    { french: 'avril', english: 'April' },
    { french: 'mai', english: 'May' },
    { french: 'juin', english: 'June' },
    { french: 'juillet', english: 'July' },
    { french: 'août', english: 'August' },
    { french: 'septembre', english: 'September' },
    { french: 'octobre', english: 'October' },
    { french: 'novembre', english: 'November' },
    { french: 'décembre', english: 'December' },
  ];

  const startQuiz = () => {
    const qs = MONTHS.map(m => ({
      french: m.french,
      english: m.english,
      options: shuffleArray([m.french, ...getRandomOptions(m.french, MONTHS.map(x => x.french), 3)]),
    }));
    setQuestions(shuffleArray(qs));
    setShowLearn(false);
    setStartTime(Date.now());
    setCurrentIndex(0);
    setCorrect(0);
    setIsComplete(false);
  };

  const handleAnswer = (answer: string) => {
    const isCorrect = answer === questions[currentIndex].french;
    if (isCorrect) setCorrect(c => c + 1);
    
    if (currentIndex + 1 >= questions.length) {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      setIsComplete(true);
      onComplete(12, correct + (isCorrect ? 1 : 0), questions.length, elapsed);
    } else {
      setCurrentIndex(i => i + 1);
    }
  };

  if (showLearn) {
    return (
      <Modal isOpen onClose={onClose} title="Months of the Year" size="lg">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <p className="text-slate-600">Les Mois de l'Année - Learn the months in French:</p>
          
          <div className="grid grid-cols-2 gap-2">
            {MONTHS.map((m, i) => (
              <div key={m.french} className="flex items-center gap-3 p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                <span className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold">
                  {i + 1}
                </span>
                <div>
                  <span className="font-bold text-emerald-700">{m.french}</span>
                  <span className="text-slate-500 text-sm ml-2">{m.english}</span>
                </div>
              </div>
            ))}
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
    return (
      <Modal isOpen onClose={onClose} title="Bien fait!" size="md">
        <div className="text-center py-4">
          <div className="text-5xl mb-4">{correct >= 10 ? '🎉' : '👍'}</div>
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
          <Button variant="primary" onClick={() => setShowLearn(true)}>
            <RotateCcw className="w-4 h-4 mr-1" /> Try Again
          </Button>
        </div>
      </Modal>
    );
  }

  const q = questions[currentIndex];
  if (!q) return null;

  return (
    <Modal isOpen onClose={onClose} title="Months Quiz" size="md">
      <div className="text-center py-4">
        <div className="flex justify-between text-sm text-slate-500 mb-4">
          <span>Question {currentIndex + 1}/{questions.length}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {Math.round((Date.now() - startTime) / 1000)}s
          </span>
        </div>
        <p className="text-slate-600 mb-2">What is "{q.english}" in French?</p>
        <div className="grid grid-cols-2 gap-3 mt-6">
          {q.options.map(option => (
            <button
              key={option}
              onClick={() => handleAnswer(option)}
              className="p-4 bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-200 hover:border-emerald-400 rounded-xl text-lg font-semibold text-emerald-700 transition-all"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}

// Seasons Game
function SeasonsGame({ score: _score, onComplete, onClose }: {
  score: FrenchScore;
  onComplete: (wordsLearned: number, correct: number, total: number, time: number) => void;
  onClose: () => void;
}) {
  const [showLearn, setShowLearn] = useState(true);
  const [questions, setQuestions] = useState<{ french: string; english: string; options: string[] }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const SEASONS = [
    { french: 'le printemps', english: 'spring', icon: '🌸', phrases: ['Il fait beau', 'Les fleurs poussent'] },
    { french: "l'été", english: 'summer', icon: '☀️', phrases: ['Il fait chaud', 'Les vacances'] },
    { french: "l'automne", english: 'autumn/fall', icon: '🍂', phrases: ['Les feuilles tombent', 'Il pleut'] },
    { french: "l'hiver", english: 'winter', icon: '❄️', phrases: ['Il fait froid', 'Il neige'] },
  ];

  const startQuiz = () => {
    const allWords = SEASONS.map(s => s.french);
    const qs = SEASONS.map(s => ({
      french: s.french,
      english: s.english,
      options: shuffleArray([s.french, ...getRandomOptions(s.french, allWords, 3)]),
    }));
    setQuestions(shuffleArray(qs));
    setShowLearn(false);
    setStartTime(Date.now());
    setCurrentIndex(0);
    setCorrect(0);
    setIsComplete(false);
  };

  const handleAnswer = (answer: string) => {
    const isCorrect = answer === questions[currentIndex].french;
    if (isCorrect) setCorrect(c => c + 1);
    
    if (currentIndex + 1 >= questions.length) {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      setIsComplete(true);
      onComplete(4, correct + (isCorrect ? 1 : 0), questions.length, elapsed);
    } else {
      setCurrentIndex(i => i + 1);
    }
  };

  if (showLearn) {
    return (
      <Modal isOpen onClose={onClose} title="Seasons & Phrases" size="lg">
        <div className="space-y-4">
          <p className="text-slate-600">Les Saisons - Learn the seasons and common phrases:</p>
          
          <div className="grid grid-cols-2 gap-4">
            {SEASONS.map(s => (
              <div key={s.french} className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className="font-bold text-amber-700 text-lg">{s.french}</div>
                <div className="text-slate-500 text-sm mb-2">{s.english}</div>
                <div className="space-y-1">
                  {s.phrases.map(p => (
                    <div key={p} className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded">
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            ))}
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
    return (
      <Modal isOpen onClose={onClose} title="Bien fait!" size="md">
        <div className="text-center py-4">
          <div className="text-5xl mb-4">{correct === questions.length ? '🎉' : '👍'}</div>
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
          <Button variant="primary" onClick={() => setShowLearn(true)}>
            <RotateCcw className="w-4 h-4 mr-1" /> Try Again
          </Button>
        </div>
      </Modal>
    );
  }

  const q = questions[currentIndex];
  if (!q) return null;

  return (
    <Modal isOpen onClose={onClose} title="Seasons Quiz" size="md">
      <div className="text-center py-4">
        <div className="flex justify-between text-sm text-slate-500 mb-4">
          <span>Question {currentIndex + 1}/{questions.length}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {Math.round((Date.now() - startTime) / 1000)}s
          </span>
        </div>
        <p className="text-slate-600 mb-2">What is "{q.english}" in French?</p>
        <div className="grid grid-cols-2 gap-3 mt-6">
          {q.options.map(option => (
            <button
              key={option}
              onClick={() => handleAnswer(option)}
              className="p-4 bg-amber-50 hover:bg-amber-100 border-2 border-amber-200 hover:border-amber-400 rounded-xl text-lg font-semibold text-amber-700 transition-all"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}


// Numbers Game - French counting logic
function NumbersGame({ score: _score, onComplete, onClose }: {
  score: FrenchScore;
  onComplete: (wordsLearned: number, correct: number, total: number, time: number) => void;
  onClose: () => void;
}) {
  const [showLearn, setShowLearn] = useState(true);
  const [questions, setQuestions] = useState<{ num: number; french: string; options: string[] }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const NUMBERS: Record<number, string> = {
    0: 'zéro', 1: 'un', 2: 'deux', 3: 'trois', 4: 'quatre', 5: 'cinq',
    6: 'six', 7: 'sept', 8: 'huit', 9: 'neuf', 10: 'dix',
    11: 'onze', 12: 'douze', 13: 'treize', 14: 'quatorze', 15: 'quinze',
    16: 'seize', 17: 'dix-sept', 18: 'dix-huit', 19: 'dix-neuf', 20: 'vingt',
    21: 'vingt et un', 22: 'vingt-deux', 30: 'trente', 40: 'quarante', 50: 'cinquante',
    60: 'soixante', 70: 'soixante-dix', 71: 'soixante et onze', 80: 'quatre-vingts',
    81: 'quatre-vingt-un', 90: 'quatre-vingt-dix', 91: 'quatre-vingt-onze', 100: 'cent',
  };

  const startQuiz = () => {
    const nums = Object.keys(NUMBERS).map(Number);
    const selected = shuffleArray(nums).slice(0, 10);
    const allFrench = Object.values(NUMBERS);
    const qs = selected.map(n => ({
      num: n,
      french: NUMBERS[n],
      options: shuffleArray([NUMBERS[n], ...getRandomOptions(NUMBERS[n], allFrench, 3)]),
    }));
    setQuestions(qs);
    setShowLearn(false);
    setStartTime(Date.now());
    setCurrentIndex(0);
    setCorrect(0);
    setIsComplete(false);
  };

  const handleAnswer = (answer: string) => {
    const isCorrect = answer === questions[currentIndex].french;
    if (isCorrect) setCorrect(c => c + 1);
    
    if (currentIndex + 1 >= questions.length) {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      setIsComplete(true);
      onComplete(Object.keys(NUMBERS).length, correct + (isCorrect ? 1 : 0), questions.length, elapsed);
    } else {
      setCurrentIndex(i => i + 1);
    }
  };

  if (showLearn) {
    return (
      <Modal isOpen onClose={onClose} title="French Numbers" size="lg">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <p className="text-slate-600">Les Nombres - Learn French counting logic:</p>
          
          {/* 0-10 */}
          <div>
            <h4 className="font-medium text-slate-900 mb-2">0-10 (Basic)</h4>
            <div className="grid grid-cols-4 gap-2">
              {[0,1,2,3,4,5,6,7,8,9,10].map(n => (
                <div key={n} className="p-2 bg-purple-50 rounded text-center border border-purple-200">
                  <div className="text-lg font-bold text-purple-700">{n}</div>
                  <div className="text-xs text-purple-600">{NUMBERS[n]}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 11-20 */}
          <div>
            <h4 className="font-medium text-slate-900 mb-2">11-20 (Special forms)</h4>
            <div className="grid grid-cols-5 gap-2">
              {[11,12,13,14,15,16,17,18,19,20].map(n => (
                <div key={n} className="p-2 bg-blue-50 rounded text-center border border-blue-200">
                  <div className="text-lg font-bold text-blue-700">{n}</div>
                  <div className="text-xs text-blue-600">{NUMBERS[n]}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tens */}
          <div>
            <h4 className="font-medium text-slate-900 mb-2">Tens (The French Logic!)</h4>
            <div className="grid grid-cols-5 gap-2">
              {[20,30,40,50,60,70,80,90,100].map(n => (
                <div key={n} className="p-2 bg-emerald-50 rounded text-center border border-emerald-200">
                  <div className="text-lg font-bold text-emerald-700">{n}</div>
                  <div className="text-xs text-emerald-600">{NUMBERS[n]}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Logic explanation */}
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <h4 className="font-medium text-amber-800 mb-2">🧠 French Number Logic:</h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• <strong>70</strong> = soixante-dix (60 + 10)</li>
              <li>• <strong>80</strong> = quatre-vingts (4 × 20)</li>
              <li>• <strong>90</strong> = quatre-vingt-dix (4 × 20 + 10)</li>
              <li>• <strong>71</strong> = soixante et onze (60 + 11)</li>
              <li>• <strong>91</strong> = quatre-vingt-onze (4 × 20 + 11)</li>
            </ul>
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
    return (
      <Modal isOpen onClose={onClose} title="Bien fait!" size="md">
        <div className="text-center py-4">
          <div className="text-5xl mb-4">{correct >= 8 ? '🎉' : '👍'}</div>
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
          <Button variant="primary" onClick={() => setShowLearn(true)}>
            <RotateCcw className="w-4 h-4 mr-1" /> Try Again
          </Button>
        </div>
      </Modal>
    );
  }

  const q = questions[currentIndex];
  if (!q) return null;

  return (
    <Modal isOpen onClose={onClose} title="Numbers Quiz" size="md">
      <div className="text-center py-4">
        <div className="flex justify-between text-sm text-slate-500 mb-4">
          <span>Question {currentIndex + 1}/{questions.length}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {Math.round((Date.now() - startTime) / 1000)}s
          </span>
        </div>
        <p className="text-slate-600 mb-2">What is {q.num} in French?</p>
        <div className="text-5xl font-bold text-purple-600 mb-6">{q.num}</div>
        <div className="grid grid-cols-2 gap-3">
          {q.options.map(option => (
            <button
              key={option}
              onClick={() => handleAnswer(option)}
              className="p-3 bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 hover:border-purple-400 rounded-xl font-semibold text-purple-700 transition-all"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}

// ============ PHONICS GAMES ============

// Pure Sounds Game (Layer 1)
function PureSoundsGame({ score: _score, onComplete, onClose }: {
  score: FrenchScore;
  onComplete: (wordsLearned: number, correct: number, total: number, time: number) => void;
  onClose: () => void;
}) {
  const [showLearn, setShowLearn] = useState(true);
  const [questions, setQuestions] = useState<{ sound: string; pronunciation: string; options: string[] }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const VOWELS = [
    { sound: 'a', pronunciation: 'ah', example: 'chat' },
    { sound: 'e', pronunciation: 'uh', example: 'le' },
    { sound: 'i', pronunciation: 'ee', example: 'lit' },
    { sound: 'o', pronunciation: 'oh', example: 'mot' },
    { sound: 'u', pronunciation: 'oo (lips rounded)', example: 'tu' },
    { sound: 'é', pronunciation: 'ay', example: 'été' },
    { sound: 'è', pronunciation: 'eh', example: 'mère' },
    { sound: 'ou', pronunciation: 'oo', example: 'vous' },
    { sound: 'oi', pronunciation: 'wa', example: 'moi' },
    { sound: 'au/eau', pronunciation: 'oh', example: 'beau' },
  ];

  const CONSONANTS = [
    { sound: 'm', pronunciation: 'mm', example: 'maman' },
    { sound: 'l', pronunciation: 'll', example: 'lune' },
    { sound: 's', pronunciation: 'ss', example: 'soleil' },
    { sound: 't', pronunciation: 'tt', example: 'table' },
    { sound: 'p', pronunciation: 'pp', example: 'papa' },
    { sound: 'n', pronunciation: 'nn', example: 'nuit' },
    { sound: 'b', pronunciation: 'bb', example: 'bébé' },
    { sound: 'd', pronunciation: 'dd', example: 'dodo' },
    { sound: 'f', pronunciation: 'ff', example: 'fille' },
  ];

  const startQuiz = () => {
    const allSounds = [...VOWELS, ...CONSONANTS];
    const selected = shuffleArray(allSounds).slice(0, 10);
    const qs = selected.map(s => ({
      sound: s.sound,
      pronunciation: s.pronunciation,
      options: shuffleArray([s.pronunciation, ...getRandomOptions(s.pronunciation, allSounds.map(x => x.pronunciation), 3)]),
    }));
    setQuestions(qs);
    setShowLearn(false);
    setStartTime(Date.now());
    setCurrentIndex(0);
    setCorrect(0);
    setIsComplete(false);
  };

  const handleAnswer = (answer: string) => {
    const isCorrect = answer === questions[currentIndex].pronunciation;
    if (isCorrect) setCorrect(c => c + 1);
    
    if (currentIndex + 1 >= questions.length) {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      setIsComplete(true);
      onComplete(VOWELS.length + CONSONANTS.length, correct + (isCorrect ? 1 : 0), questions.length, elapsed);
    } else {
      setCurrentIndex(i => i + 1);
    }
  };

  if (showLearn) {
    return (
      <Modal isOpen onClose={onClose} title="Pure Sounds" size="lg">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <p className="text-slate-600">Les Sons Purs - Learn individual sounds first, not letters!</p>
          
          {/* Vowels */}
          <div>
            <h4 className="font-medium text-slate-900 mb-2">🔴 Vowel Sounds (Les Voyelles)</h4>
            <div className="grid grid-cols-2 gap-2">
              {VOWELS.map(v => (
                <div key={v.sound} className="flex items-center gap-3 p-2 bg-rose-50 rounded-lg border border-rose-200">
                  <span className="text-2xl font-bold text-rose-600 w-12">{v.sound}</span>
                  <div>
                    <span className="text-sm text-rose-700">"{v.pronunciation}"</span>
                    <span className="text-xs text-slate-500 ml-2">({v.example})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Consonants */}
          <div>
            <h4 className="font-medium text-slate-900 mb-2">🔵 Consonant Sounds (Les Consonnes)</h4>
            <div className="grid grid-cols-3 gap-2">
              {CONSONANTS.map(c => (
                <div key={c.sound} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-xl font-bold text-blue-600">{c.sound}</span>
                  <span className="text-xs text-slate-500">({c.example})</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-sm text-amber-800">
              💡 <strong>Key:</strong> Focus on the SOUND, not the letter name. Say "ah" not "ay" for 'a'.
            </p>
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
    return (
      <Modal isOpen onClose={onClose} title="Bien fait!" size="md">
        <div className="text-center py-4">
          <div className="text-5xl mb-4">{correct >= 8 ? '🎉' : '👍'}</div>
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
          <Button variant="primary" onClick={() => setShowLearn(true)}>
            <RotateCcw className="w-4 h-4 mr-1" /> Try Again
          </Button>
        </div>
      </Modal>
    );
  }

  const q = questions[currentIndex];
  if (!q) return null;

  return (
    <Modal isOpen onClose={onClose} title="Pure Sounds Quiz" size="md">
      <div className="text-center py-4">
        <div className="flex justify-between text-sm text-slate-500 mb-4">
          <span>Question {currentIndex + 1}/{questions.length}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {Math.round((Date.now() - startTime) / 1000)}s
          </span>
        </div>
        <p className="text-slate-600 mb-2">How do you pronounce this sound?</p>
        <div className="text-6xl font-bold text-rose-600 mb-6">{q.sound}</div>
        <div className="grid grid-cols-2 gap-3">
          {q.options.map(option => (
            <button
              key={option}
              onClick={() => handleAnswer(option)}
              className="p-4 bg-rose-50 hover:bg-rose-100 border-2 border-rose-200 hover:border-rose-400 rounded-xl text-lg font-semibold text-rose-700 transition-all"
            >
              "{option}"
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}


// CV Syllables Game (Layer 2)
function CVSyllablesGame({ score: _score, onComplete, onClose }: {
  score: FrenchScore;
  onComplete: (wordsLearned: number, correct: number, total: number, time: number) => void;
  onClose: () => void;
}) {
  const [showLearn, setShowLearn] = useState(true);
  const [questions, setQuestions] = useState<{ syllable: string; row: string; options: string[] }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const CV_ROWS = [
    { consonant: 'm', syllables: ['ma', 'me', 'mi', 'mo', 'mu'] },
    { consonant: 't', syllables: ['ta', 'te', 'ti', 'to', 'tu'] },
    { consonant: 's', syllables: ['sa', 'se', 'si', 'so', 'su'] },
    { consonant: 'l', syllables: ['la', 'le', 'li', 'lo', 'lu'] },
    { consonant: 'p', syllables: ['pa', 'pe', 'pi', 'po', 'pu'] },
    { consonant: 'b', syllables: ['ba', 'be', 'bi', 'bo', 'bu'] },
    { consonant: 'd', syllables: ['da', 'de', 'di', 'do', 'du'] },
    { consonant: 'f', syllables: ['fa', 'fe', 'fi', 'fo', 'fu'] },
    { consonant: 'n', syllables: ['na', 'ne', 'ni', 'no', 'nu'] },
  ];

  const allSyllables = CV_ROWS.flatMap(r => r.syllables);

  const startQuiz = () => {
    const selected = shuffleArray(allSyllables).slice(0, 12);
    const qs = selected.map(syl => ({
      syllable: syl,
      row: syl[0],
      options: shuffleArray([syl, ...getRandomOptions(syl, allSyllables, 3)]),
    }));
    setQuestions(qs);
    setShowLearn(false);
    setStartTime(Date.now());
    setCurrentIndex(0);
    setCorrect(0);
    setIsComplete(false);
  };

  const handleAnswer = (answer: string) => {
    const isCorrect = answer === questions[currentIndex].syllable;
    if (isCorrect) setCorrect(c => c + 1);
    if (currentIndex + 1 >= questions.length) {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      setIsComplete(true);
      onComplete(allSyllables.length, correct + (isCorrect ? 1 : 0), questions.length, elapsed);
    } else {
      setCurrentIndex(i => i + 1);
    }
  };

  if (showLearn) {
    return (
      <Modal isOpen onClose={onClose} title="CV Syllables" size="lg">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <p className="text-slate-600">Les Syllabes CV - Consonant + Vowel = ONE sound!</p>
          <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-200 mb-4">
            <p className="text-sm text-cyan-800">
              💡 Read "ma" as ONE sound, not "m-a". This is how French children learn!
            </p>
          </div>
          <div className="space-y-3">
            {CV_ROWS.map(row => (
              <div key={row.consonant} className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-cyan-500 text-white flex items-center justify-center font-bold">
                  {row.consonant}
                </span>
                <div className="flex gap-2 flex-wrap">
                  {row.syllables.map(syl => (
                    <span key={syl} className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-lg font-medium">
                      {syl}
                    </span>
                  ))}
                </div>
              </div>
            ))}
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
    return (
      <Modal isOpen onClose={onClose} title="Bien fait!" size="md">
        <div className="text-center py-4">
          <div className="text-5xl mb-4">{correct >= 10 ? '🎉' : '👍'}</div>
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
          <Button variant="primary" onClick={() => setShowLearn(true)}>
            <RotateCcw className="w-4 h-4 mr-1" /> Try Again
          </Button>
        </div>
      </Modal>
    );
  }

  const q = questions[currentIndex];
  if (!q) return null;

  return (
    <Modal isOpen onClose={onClose} title="CV Syllables Quiz" size="md">
      <div className="text-center py-4">
        <div className="flex justify-between text-sm text-slate-500 mb-4">
          <span>Question {currentIndex + 1}/{questions.length}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {Math.round((Date.now() - startTime) / 1000)}s
          </span>
        </div>
        <p className="text-slate-600 mb-2">Find the syllable that sounds like:</p>
        <div className="text-5xl font-bold text-cyan-600 mb-6">{q.syllable}</div>
        <div className="grid grid-cols-2 gap-3">
          {q.options.map(option => (
            <button
              key={option}
              onClick={() => handleAnswer(option)}
              className="p-4 bg-cyan-50 hover:bg-cyan-100 border-2 border-cyan-200 hover:border-cyan-400 rounded-xl text-xl font-semibold text-cyan-700 transition-all"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}

// Syllable Stack Game (Layer 3)
function SyllableStackGame({ score: _score, onComplete, onClose }: {
  score: FrenchScore;
  onComplete: (wordsLearned: number, correct: number, total: number, time: number) => void;
  onClose: () => void;
}) {
  const [showLearn, setShowLearn] = useState(true);
  const [questions, setQuestions] = useState<{ word: string; syllables: string[]; english: string; options: string[] }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const WORDS = [
    { word: 'maman', syllables: ['ma', 'man'], english: 'mom' },
    { word: 'papa', syllables: ['pa', 'pa'], english: 'dad' },
    { word: 'lama', syllables: ['la', 'ma'], english: 'llama' },
    { word: 'tomate', syllables: ['to', 'ma', 'te'], english: 'tomato' },
    { word: 'banane', syllables: ['ba', 'na', 'ne'], english: 'banana' },
    { word: 'salade', syllables: ['sa', 'la', 'de'], english: 'salad' },
    { word: 'domino', syllables: ['do', 'mi', 'no'], english: 'domino' },
    { word: 'piano', syllables: ['pi', 'a', 'no'], english: 'piano' },
    { word: 'café', syllables: ['ca', 'fé'], english: 'coffee' },
    { word: 'bébé', syllables: ['bé', 'bé'], english: 'baby' },
  ];

  const startQuiz = () => {
    const allWords = WORDS.map(w => w.word);
    const qs = shuffleArray(WORDS).slice(0, 8).map(w => ({
      ...w,
      options: shuffleArray([w.word, ...getRandomOptions(w.word, allWords, 3)]),
    }));
    setQuestions(qs);
    setShowLearn(false);
    setStartTime(Date.now());
    setCurrentIndex(0);
    setCorrect(0);
    setIsComplete(false);
  };

  const handleAnswer = (answer: string) => {
    const isCorrect = answer === questions[currentIndex].word;
    if (isCorrect) setCorrect(c => c + 1);
    if (currentIndex + 1 >= questions.length) {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      setIsComplete(true);
      onComplete(WORDS.length, correct + (isCorrect ? 1 : 0), questions.length, elapsed);
    } else {
      setCurrentIndex(i => i + 1);
    }
  };

  if (showLearn) {
    return (
      <Modal isOpen onClose={onClose} title="Syllable Stacking" size="lg">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <p className="text-slate-600">Empiler les Syllabes - Stack syllables to make words!</p>
          <div className="p-3 bg-green-50 rounded-lg border border-green-200 mb-4">
            <p className="text-sm text-green-800">
              💡 You already know how to read! Just stack the syllables: ma + man = maman
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {WORDS.map(w => (
              <div key={w.word} className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-1 mb-1">
                  {w.syllables.map((syl, i) => (
                    <span key={i} className="px-2 py-1 bg-green-200 text-green-800 rounded font-medium text-sm">
                      {syl}
                    </span>
                  ))}
                  <span className="text-green-600 mx-1">=</span>
                  <span className="font-bold text-green-700">{w.word}</span>
                </div>
                <p className="text-xs text-slate-500">{w.english}</p>
              </div>
            ))}
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
    return (
      <Modal isOpen onClose={onClose} title="Bien fait!" size="md">
        <div className="text-center py-4">
          <div className="text-5xl mb-4">{correct >= 6 ? '🎉' : '👍'}</div>
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
          <Button variant="primary" onClick={() => setShowLearn(true)}>
            <RotateCcw className="w-4 h-4 mr-1" /> Try Again
          </Button>
        </div>
      </Modal>
    );
  }

  const q = questions[currentIndex];
  if (!q) return null;

  return (
    <Modal isOpen onClose={onClose} title="Syllable Stack Quiz" size="md">
      <div className="text-center py-4">
        <div className="flex justify-between text-sm text-slate-500 mb-4">
          <span>Question {currentIndex + 1}/{questions.length}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {Math.round((Date.now() - startTime) / 1000)}s
          </span>
        </div>
        <p className="text-slate-600 mb-2">Stack these syllables:</p>
        <div className="flex items-center justify-center gap-2 mb-6">
          {q.syllables.map((syl, i) => (
            <span key={i} className="px-4 py-2 bg-green-200 text-green-800 rounded-lg font-bold text-xl">
              {syl}
            </span>
          ))}
        </div>
        <p className="text-sm text-slate-500 mb-4">({q.english})</p>
        <div className="grid grid-cols-2 gap-3">
          {q.options.map(option => (
            <button key={option} onClick={() => handleAnswer(option)}
              className="p-4 bg-green-50 hover:bg-green-100 border-2 border-green-200 hover:border-green-400 rounded-xl text-xl font-semibold text-green-700 transition-all">
              {option}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}


// Sound Families Game (Layer 4)
function SoundFamiliesGame({ score: _score, onComplete, onClose }: {
  score: FrenchScore;
  onComplete: (wordsLearned: number, correct: number, total: number, time: number) => void;
  onClose: () => void;
}) {
  const [showLearn, setShowLearn] = useState(true);
  const [questions, setQuestions] = useState<{ word: string; family: string; english: string; options: string[] }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const FAMILIES = [
    { ending: '-an', words: [{ word: 'pan', english: 'bread' }, { word: 'fan', english: 'fan' }, { word: 'man', english: 'hand (slang)' }, { word: 'plan', english: 'plan' }] },
    { ending: '-on', words: [{ word: 'bon', english: 'good' }, { word: 'ton', english: 'your' }, { word: 'son', english: 'his/sound' }, { word: 'mon', english: 'my' }] },
    { ending: '-in', words: [{ word: 'vin', english: 'wine' }, { word: 'fin', english: 'end' }, { word: 'lin', english: 'linen' }, { word: 'pin', english: 'pine' }] },
    { ending: '-at', words: [{ word: 'chat', english: 'cat' }, { word: 'rat', english: 'rat' }, { word: 'plat', english: 'dish' }, { word: 'mat', english: 'matte' }] },
    { ending: '-al', words: [{ word: 'bal', english: 'ball' }, { word: 'mal', english: 'bad' }, { word: 'val', english: 'valley' }, { word: 'cal', english: 'callus' }] },
  ];

  const allWords = FAMILIES.flatMap(f => f.words.map(w => ({ ...w, family: f.ending })));

  const startQuiz = () => {
    const selected = shuffleArray(allWords).slice(0, 10);
    const wordList = allWords.map(w => w.word);
    const qs = selected.map(w => ({
      word: w.word,
      family: w.family,
      english: w.english,
      options: shuffleArray([w.word, ...getRandomOptions(w.word, wordList, 3)]),
    }));
    setQuestions(qs);
    setShowLearn(false);
    setStartTime(Date.now());
    setCurrentIndex(0);
    setCorrect(0);
    setIsComplete(false);
  };

  const handleAnswer = (answer: string) => {
    const isCorrect = answer === questions[currentIndex].word;
    if (isCorrect) setCorrect(c => c + 1);
    if (currentIndex + 1 >= questions.length) {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      setIsComplete(true);
      onComplete(allWords.length, correct + (isCorrect ? 1 : 0), questions.length, elapsed);
    } else {
      setCurrentIndex(i => i + 1);
    }
  };

  if (showLearn) {
    return (
      <Modal isOpen onClose={onClose} title="Sound Families" size="lg">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <p className="text-slate-600">Les Familles de Sons - Words that rhyme share the same ending!</p>
          <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200 mb-4">
            <p className="text-sm text-indigo-800">
              💡 Pattern recognition: pan, fan, man all end in "-an" and rhyme!
            </p>
          </div>
          <div className="space-y-4">
            {FAMILIES.map(f => (
              <div key={f.ending} className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-indigo-500 text-white rounded-full font-bold">{f.ending}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {f.words.map(w => (
                    <div key={w.word} className="px-3 py-1 bg-white rounded border border-indigo-200">
                      <span className="font-medium text-indigo-700">{w.word}</span>
                      <span className="text-xs text-slate-500 ml-1">({w.english})</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
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
    return (
      <Modal isOpen onClose={onClose} title="Bien fait!" size="md">
        <div className="text-center py-4">
          <div className="text-5xl mb-4">{correct >= 8 ? '🎉' : '👍'}</div>
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
          <Button variant="primary" onClick={() => setShowLearn(true)}>
            <RotateCcw className="w-4 h-4 mr-1" /> Try Again
          </Button>
        </div>
      </Modal>
    );
  }

  const q = questions[currentIndex];
  if (!q) return null;

  return (
    <Modal isOpen onClose={onClose} title="Sound Families Quiz" size="md">
      <div className="text-center py-4">
        <div className="flex justify-between text-sm text-slate-500 mb-4">
          <span>Question {currentIndex + 1}/{questions.length}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {Math.round((Date.now() - startTime) / 1000)}s
          </span>
        </div>
        <p className="text-slate-600 mb-2">Find the word that means "{q.english}"</p>
        <div className="text-sm text-indigo-600 mb-4">Family: {q.family}</div>
        <div className="grid grid-cols-2 gap-3">
          {q.options.map(option => (
            <button key={option} onClick={() => handleAnswer(option)}
              className="p-4 bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-200 hover:border-indigo-400 rounded-xl text-xl font-semibold text-indigo-700 transition-all">
              {option}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}

// Whole Words Game (Layer 5)
function WholeWordsGame({ score: _score, onComplete, onClose }: {
  score: FrenchScore;
  onComplete: (wordsLearned: number, correct: number, total: number, time: number) => void;
  onClose: () => void;
}) {
  const [showLearn, setShowLearn] = useState(true);
  const [questions, setQuestions] = useState<{ french: string; english: string; options: string[] }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const WORDS = [
    { french: 'table', english: 'table' }, { french: 'pomme', english: 'apple' },
    { french: 'livre', english: 'book' }, { french: 'maison', english: 'house' },
    { french: 'école', english: 'school' }, { french: 'chien', english: 'dog' },
    { french: 'chat', english: 'cat' }, { french: 'soleil', english: 'sun' },
    { french: 'lune', english: 'moon' }, { french: 'fleur', english: 'flower' },
    { french: 'arbre', english: 'tree' }, { french: 'eau', english: 'water' },
    { french: 'pain', english: 'bread' }, { french: 'fromage', english: 'cheese' },
    { french: 'voiture', english: 'car' }, { french: 'oiseau', english: 'bird' },
  ];

  const startQuiz = () => {
    const allFrench = WORDS.map(w => w.french);
    const selected = shuffleArray(WORDS).slice(0, 10);
    const qs = selected.map(w => ({
      french: w.french,
      english: w.english,
      options: shuffleArray([w.french, ...getRandomOptions(w.french, allFrench, 3)]),
    }));
    setQuestions(qs);
    setShowLearn(false);
    setStartTime(Date.now());
    setCurrentIndex(0);
    setCorrect(0);
    setIsComplete(false);
  };

  const handleAnswer = (answer: string) => {
    const isCorrect = answer === questions[currentIndex].french;
    if (isCorrect) setCorrect(c => c + 1);
    if (currentIndex + 1 >= questions.length) {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      setIsComplete(true);
      onComplete(WORDS.length, correct + (isCorrect ? 1 : 0), questions.length, elapsed);
    } else {
      setCurrentIndex(i => i + 1);
    }
  };

  if (showLearn) {
    return (
      <Modal isOpen onClose={onClose} title="Whole Words" size="lg">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <p className="text-slate-600">Les Mots Entiers - Common everyday words!</p>
          <div className="grid grid-cols-2 gap-2">
            {WORDS.map(w => (
              <div key={w.french} className="flex items-center justify-between p-2 bg-orange-50 rounded-lg border border-orange-200">
                <span className="font-bold text-orange-700">{w.french}</span>
                <span className="text-sm text-slate-500">{w.english}</span>
              </div>
            ))}
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
    return (
      <Modal isOpen onClose={onClose} title="Bien fait!" size="md">
        <div className="text-center py-4">
          <div className="text-5xl mb-4">{correct >= 8 ? '🎉' : '👍'}</div>
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
          <Button variant="primary" onClick={() => setShowLearn(true)}>
            <RotateCcw className="w-4 h-4 mr-1" /> Try Again
          </Button>
        </div>
      </Modal>
    );
  }

  const q = questions[currentIndex];
  if (!q) return null;

  return (
    <Modal isOpen onClose={onClose} title="Whole Words Quiz" size="md">
      <div className="text-center py-4">
        <div className="flex justify-between text-sm text-slate-500 mb-4">
          <span>Question {currentIndex + 1}/{questions.length}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {Math.round((Date.now() - startTime) / 1000)}s
          </span>
        </div>
        <p className="text-slate-600 mb-2">What is "{q.english}" in French?</p>
        <div className="grid grid-cols-2 gap-3 mt-6">
          {q.options.map(option => (
            <button key={option} onClick={() => handleAnswer(option)}
              className="p-4 bg-orange-50 hover:bg-orange-100 border-2 border-orange-200 hover:border-orange-400 rounded-xl text-xl font-semibold text-orange-700 transition-all">
              {option}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}


// Homophones Game (Layer 6)
function HomophonesGame({ score: _score, onComplete, onClose }: {
  score: FrenchScore;
  onComplete: (wordsLearned: number, correct: number, total: number, time: number) => void;
  onClose: () => void;
}) {
  const [showLearn, setShowLearn] = useState(true);
  const [questions, setQuestions] = useState<{ sound: string; words: { word: string; meaning: string }[]; correctWord: string; correctMeaning: string; options: string[] }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const HOMOPHONES = [
    { sound: '/so/', words: [{ word: 'seau', meaning: 'bucket' }, { word: 'sot', meaning: 'fool' }, { word: 'saut', meaning: 'jump' }] },
    { sound: '/vɛʁ/', words: [{ word: 'ver', meaning: 'worm' }, { word: 'verre', meaning: 'glass' }, { word: 'vert', meaning: 'green' }, { word: 'vers', meaning: 'toward' }] },
    { sound: '/mɛʁ/', words: [{ word: 'mer', meaning: 'sea' }, { word: 'mère', meaning: 'mother' }, { word: 'maire', meaning: 'mayor' }] },
    { sound: '/sɛ̃/', words: [{ word: 'saint', meaning: 'saint' }, { word: 'sein', meaning: 'breast' }, { word: 'sain', meaning: 'healthy' }] },
    { sound: '/kɔ̃/', words: [{ word: 'compte', meaning: 'account' }, { word: 'conte', meaning: 'tale' }, { word: 'comte', meaning: 'count (noble)' }] },
    { sound: '/o/', words: [{ word: 'eau', meaning: 'water' }, { word: 'haut', meaning: 'high' }, { word: 'os', meaning: 'bone' }] },
  ];

  const startQuiz = () => {
    const qs: typeof questions = [];
    HOMOPHONES.forEach(h => {
      h.words.forEach(w => {
        const otherWords = h.words.filter(x => x.word !== w.word).map(x => x.word);
        const allOtherWords = HOMOPHONES.flatMap(x => x.words).filter(x => x.word !== w.word).map(x => x.word);
        qs.push({
          sound: h.sound,
          words: h.words,
          correctWord: w.word,
          correctMeaning: w.meaning,
          options: shuffleArray([w.word, ...otherWords.slice(0, 2), ...getRandomOptions(w.word, allOtherWords, 1)]).slice(0, 4),
        });
      });
    });
    setQuestions(shuffleArray(qs).slice(0, 10));
    setShowLearn(false);
    setStartTime(Date.now());
    setCurrentIndex(0);
    setCorrect(0);
    setIsComplete(false);
  };

  const handleAnswer = (answer: string) => {
    const isCorrect = answer === questions[currentIndex].correctWord;
    if (isCorrect) setCorrect(c => c + 1);
    if (currentIndex + 1 >= questions.length) {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      setIsComplete(true);
      onComplete(HOMOPHONES.flatMap(h => h.words).length, correct + (isCorrect ? 1 : 0), questions.length, elapsed);
    } else {
      setCurrentIndex(i => i + 1);
    }
  };

  if (showLearn) {
    return (
      <Modal isOpen onClose={onClose} title="Homophones" size="lg">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <p className="text-slate-600">Les Homophones - Same sound, different spelling & meaning!</p>
          <div className="p-3 bg-fuchsia-50 rounded-lg border border-fuchsia-200 mb-4">
            <p className="text-sm text-fuchsia-800">
              💡 Advanced skill: These words sound identical but have completely different meanings!
            </p>
          </div>
          <div className="space-y-4">
            {HOMOPHONES.map(h => (
              <div key={h.sound} className="p-4 bg-fuchsia-50 rounded-lg border border-fuchsia-200">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-fuchsia-500 text-white rounded-full font-bold text-sm">{h.sound}</span>
                  <span className="text-sm text-fuchsia-600">All sound the same!</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {h.words.map(w => (
                    <div key={w.word} className="p-2 bg-white rounded border border-fuchsia-200">
                      <span className="font-bold text-fuchsia-700">{w.word}</span>
                      <span className="text-xs text-slate-500 block">{w.meaning}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
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
    return (
      <Modal isOpen onClose={onClose} title="Bien fait!" size="md">
        <div className="text-center py-4">
          <div className="text-5xl mb-4">{correct >= 8 ? '🎉' : '👍'}</div>
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
          <Button variant="primary" onClick={() => setShowLearn(true)}>
            <RotateCcw className="w-4 h-4 mr-1" /> Try Again
          </Button>
        </div>
      </Modal>
    );
  }

  const q = questions[currentIndex];
  if (!q) return null;

  return (
    <Modal isOpen onClose={onClose} title="Homophones Quiz" size="md">
      <div className="text-center py-4">
        <div className="flex justify-between text-sm text-slate-500 mb-4">
          <span>Question {currentIndex + 1}/{questions.length}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {Math.round((Date.now() - startTime) / 1000)}s
          </span>
        </div>
        <p className="text-slate-600 mb-2">Which word means "{q.correctMeaning}"?</p>
        <p className="text-sm text-fuchsia-600 mb-4">Sound: {q.sound}</p>
        <div className="grid grid-cols-2 gap-3">
          {q.options.map(option => (
            <button key={option} onClick={() => handleAnswer(option)}
              className="p-4 bg-fuchsia-50 hover:bg-fuchsia-100 border-2 border-fuchsia-200 hover:border-fuchsia-400 rounded-xl text-xl font-semibold text-fuchsia-700 transition-all">
              {option}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}


// ============ GRAMMAR GAMES ============

// Nouns Game (Layer 7)
function NounsGame({ score: _score, onComplete, onClose }: {
  score: FrenchScore;
  onComplete: (wordsLearned: number, correct: number, total: number, time: number) => void;
  onClose: () => void;
}) {
  const [showLearn, setShowLearn] = useState(true);
  const [questions, setQuestions] = useState<{ noun: string; english: string; gender: 'le' | 'la'; options: string[] }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const NOUNS = [
    { noun: 'soleil', english: 'sun', gender: 'le' as const },
    { noun: 'lune', english: 'moon', gender: 'la' as const },
    { noun: 'livre', english: 'book', gender: 'le' as const },
    { noun: 'table', english: 'table', gender: 'la' as const },
    { noun: 'chat', english: 'cat', gender: 'le' as const },
    { noun: 'maison', english: 'house', gender: 'la' as const },
    { noun: 'jardin', english: 'garden', gender: 'le' as const },
    { noun: 'fleur', english: 'flower', gender: 'la' as const },
    { noun: 'arbre', english: 'tree', gender: 'le' as const },
    { noun: 'voiture', english: 'car', gender: 'la' as const },
    { noun: 'chien', english: 'dog', gender: 'le' as const },
    { noun: 'école', english: 'school', gender: 'la' as const },
  ];

  const startQuiz = () => {
    const qs = shuffleArray(NOUNS).slice(0, 10).map(n => ({
      ...n,
      options: shuffleArray(['le', 'la']),
    }));
    setQuestions(qs);
    setShowLearn(false);
    setStartTime(Date.now());
    setCurrentIndex(0);
    setCorrect(0);
    setIsComplete(false);
  };

  const handleAnswer = (answer: string) => {
    const isCorrect = answer === questions[currentIndex].gender;
    if (isCorrect) setCorrect(c => c + 1);
    if (currentIndex + 1 >= questions.length) {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      setIsComplete(true);
      onComplete(NOUNS.length, correct + (isCorrect ? 1 : 0), questions.length, elapsed);
    } else {
      setCurrentIndex(i => i + 1);
    }
  };

  if (showLearn) {
    return (
      <Modal isOpen onClose={onClose} title="Nouns & Gender" size="lg">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <p className="text-slate-600">Les Noms - Every French noun has a gender: masculine (le) or feminine (la)!</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-bold text-blue-700 mb-2">🔵 Masculine (le)</h4>
              {NOUNS.filter(n => n.gender === 'le').map(n => (
                <div key={n.noun} className="text-sm py-1">
                  <span className="font-medium text-blue-600">le {n.noun}</span>
                  <span className="text-slate-500 ml-2">({n.english})</span>
                </div>
              ))}
            </div>
            <div className="p-3 bg-pink-50 rounded-lg border border-pink-200">
              <h4 className="font-bold text-pink-700 mb-2">🔴 Feminine (la)</h4>
              {NOUNS.filter(n => n.gender === 'la').map(n => (
                <div key={n.noun} className="text-sm py-1">
                  <span className="font-medium text-pink-600">la {n.noun}</span>
                  <span className="text-slate-500 ml-2">({n.english})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button variant="secondary" onClick={onClose}>Back</Button>
          <Button variant="primary" onClick={startQuiz}>Start Quiz <ChevronRight className="w-4 h-4 ml-1" /></Button>
        </div>
      </Modal>
    );
  }

  if (isComplete) {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    return (
      <Modal isOpen onClose={onClose} title="Bien fait!" size="md">
        <div className="text-center py-4">
          <div className="text-5xl mb-4">{correct >= 8 ? '🎉' : '👍'}</div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-slate-50 rounded-lg"><p className="text-xs text-slate-500">Score</p><p className="text-2xl font-bold text-slate-900">{correct}/{questions.length}</p></div>
            <div className="p-3 bg-slate-50 rounded-lg"><p className="text-xs text-slate-500">Time</p><p className="text-2xl font-bold text-slate-900">{elapsed}s</p></div>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button variant="secondary" onClick={onClose}>Done</Button>
          <Button variant="primary" onClick={() => setShowLearn(true)}><RotateCcw className="w-4 h-4 mr-1" /> Try Again</Button>
        </div>
      </Modal>
    );
  }

  const q = questions[currentIndex];
  if (!q) return null;

  return (
    <Modal isOpen onClose={onClose} title="Nouns Quiz" size="md">
      <div className="text-center py-4">
        <div className="flex justify-between text-sm text-slate-500 mb-4">
          <span>Question {currentIndex + 1}/{questions.length}</span>
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{Math.round((Date.now() - startTime) / 1000)}s</span>
        </div>
        <p className="text-slate-600 mb-2">Is it "le" or "la"?</p>
        <p className="text-3xl font-bold text-sky-600 mb-2">___ {q.noun}</p>
        <p className="text-sm text-slate-500 mb-6">({q.english})</p>
        <div className="flex justify-center gap-4">
          <button onClick={() => handleAnswer('le')} className="px-8 py-4 bg-blue-100 hover:bg-blue-200 border-2 border-blue-300 hover:border-blue-400 rounded-xl text-2xl font-bold text-blue-700 transition-all">le</button>
          <button onClick={() => handleAnswer('la')} className="px-8 py-4 bg-pink-100 hover:bg-pink-200 border-2 border-pink-300 hover:border-pink-400 rounded-xl text-2xl font-bold text-pink-700 transition-all">la</button>
        </div>
      </div>
    </Modal>
  );
}


// Verbs Game (Layer 8)
function VerbsGame({ score: _score, onComplete, onClose }: {
  score: FrenchScore;
  onComplete: (wordsLearned: number, correct: number, total: number, time: number) => void;
  onClose: () => void;
}) {
  const [showLearn, setShowLearn] = useState(true);
  const [questions, setQuestions] = useState<{ verb: string; english: string; conjugation: string; subject: string; options: string[] }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const VERBS = [
    { infinitive: 'être', english: 'to be', conjugations: { je: 'suis', tu: 'es', il: 'est', nous: 'sommes', vous: 'êtes', ils: 'sont' } },
    { infinitive: 'avoir', english: 'to have', conjugations: { je: 'ai', tu: 'as', il: 'a', nous: 'avons', vous: 'avez', ils: 'ont' } },
    { infinitive: 'aller', english: 'to go', conjugations: { je: 'vais', tu: 'vas', il: 'va', nous: 'allons', vous: 'allez', ils: 'vont' } },
    { infinitive: 'faire', english: 'to do/make', conjugations: { je: 'fais', tu: 'fais', il: 'fait', nous: 'faisons', vous: 'faites', ils: 'font' } },
  ];

  const startQuiz = () => {
    const qs: typeof questions = [];
    VERBS.forEach(v => {
      Object.entries(v.conjugations).forEach(([subj, conj]) => {
        const displaySubj = subj === 'il' ? 'il/elle' : subj === 'ils' ? 'ils/elles' : subj;
        const allConjs = VERBS.flatMap(x => Object.values(x.conjugations));
        qs.push({ verb: v.infinitive, english: v.english, conjugation: conj, subject: displaySubj, options: shuffleArray([conj, ...getRandomOptions(conj, allConjs, 3)]) });
      });
    });
    setQuestions(shuffleArray(qs).slice(0, 10));
    setShowLearn(false);
    setStartTime(Date.now());
    setCurrentIndex(0);
    setCorrect(0);
    setIsComplete(false);
  };

  const handleAnswer = (answer: string) => {
    const isCorrect = answer === questions[currentIndex].conjugation;
    if (isCorrect) setCorrect(c => c + 1);
    if (currentIndex + 1 >= questions.length) {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      setIsComplete(true);
      onComplete(VERBS.length * 6, correct + (isCorrect ? 1 : 0), questions.length, elapsed);
    } else {
      setCurrentIndex(i => i + 1);
    }
  };

  if (showLearn) {
    return (
      <Modal isOpen onClose={onClose} title="Verbs & Conjugation" size="lg">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <p className="text-slate-600">Les Verbes - The 4 most important French verbs!</p>
          {VERBS.map(v => (
            <div key={v.infinitive} className="p-3 bg-lime-50 rounded-lg border border-lime-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-bold text-lime-700">{v.infinitive}</span>
                <span className="text-sm text-slate-500">({v.english})</span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-sm">
                {Object.entries(v.conjugations).map(([subj, conj]) => (
                  <div key={subj} className="bg-white px-2 py-1 rounded">
                    <span className="text-slate-500">{subj}</span> <span className="font-medium text-lime-700">{conj}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <Button variant="secondary" onClick={onClose}>Back</Button>
          <Button variant="primary" onClick={startQuiz}>Start Quiz <ChevronRight className="w-4 h-4 ml-1" /></Button>
        </div>
      </Modal>
    );
  }

  if (isComplete) {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    return (
      <Modal isOpen onClose={onClose} title="Bien fait!" size="md">
        <div className="text-center py-4">
          <div className="text-5xl mb-4">{correct >= 8 ? '🎉' : '👍'}</div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-slate-50 rounded-lg"><p className="text-xs text-slate-500">Score</p><p className="text-2xl font-bold text-slate-900">{correct}/{questions.length}</p></div>
            <div className="p-3 bg-slate-50 rounded-lg"><p className="text-xs text-slate-500">Time</p><p className="text-2xl font-bold text-slate-900">{elapsed}s</p></div>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button variant="secondary" onClick={onClose}>Done</Button>
          <Button variant="primary" onClick={() => setShowLearn(true)}><RotateCcw className="w-4 h-4 mr-1" /> Try Again</Button>
        </div>
      </Modal>
    );
  }

  const q = questions[currentIndex];
  if (!q) return null;

  return (
    <Modal isOpen onClose={onClose} title="Verbs Quiz" size="md">
      <div className="text-center py-4">
        <div className="flex justify-between text-sm text-slate-500 mb-4">
          <span>Question {currentIndex + 1}/{questions.length}</span>
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{Math.round((Date.now() - startTime) / 1000)}s</span>
        </div>
        <p className="text-slate-600 mb-2">Conjugate "{q.verb}" ({q.english}) for:</p>
        <p className="text-3xl font-bold text-lime-600 mb-6">{q.subject} ___</p>
        <div className="grid grid-cols-2 gap-3">
          {q.options.map(option => (
            <button key={option} onClick={() => handleAnswer(option)} className="p-3 bg-lime-50 hover:bg-lime-100 border-2 border-lime-200 hover:border-lime-400 rounded-xl text-lg font-semibold text-lime-700 transition-all">{option}</button>
          ))}
        </div>
      </div>
    </Modal>
  );
}


// Adjectives Game (Layer 9)
function AdjectivesGame({ score: _score, onComplete, onClose }: {
  score: FrenchScore;
  onComplete: (wordsLearned: number, correct: number, total: number, time: number) => void;
  onClose: () => void;
}) {
  const [showLearn, setShowLearn] = useState(true);
  const [questions, setQuestions] = useState<{ masc: string; fem: string; english: string; askFem: boolean; options: string[] }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const ADJECTIVES = [
    { masc: 'grand', fem: 'grande', english: 'big/tall' },
    { masc: 'petit', fem: 'petite', english: 'small' },
    { masc: 'beau', fem: 'belle', english: 'beautiful' },
    { masc: 'nouveau', fem: 'nouvelle', english: 'new' },
    { masc: 'vieux', fem: 'vieille', english: 'old' },
    { masc: 'bon', fem: 'bonne', english: 'good' },
    { masc: 'mauvais', fem: 'mauvaise', english: 'bad' },
    { masc: 'heureux', fem: 'heureuse', english: 'happy' },
    { masc: 'blanc', fem: 'blanche', english: 'white' },
    { masc: 'noir', fem: 'noire', english: 'black' },
  ];

  const startQuiz = () => {
    const qs: typeof questions = [];
    ADJECTIVES.forEach(a => {
      const allForms = ADJECTIVES.flatMap(x => [x.masc, x.fem]);
      qs.push({ ...a, askFem: true, options: shuffleArray([a.fem, ...getRandomOptions(a.fem, allForms, 3)]) });
      qs.push({ ...a, askFem: false, options: shuffleArray([a.masc, ...getRandomOptions(a.masc, allForms, 3)]) });
    });
    setQuestions(shuffleArray(qs).slice(0, 10));
    setShowLearn(false);
    setStartTime(Date.now());
    setCurrentIndex(0);
    setCorrect(0);
    setIsComplete(false);
  };

  const handleAnswer = (answer: string) => {
    const q = questions[currentIndex];
    const isCorrect = answer === (q.askFem ? q.fem : q.masc);
    if (isCorrect) setCorrect(c => c + 1);
    if (currentIndex + 1 >= questions.length) {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      setIsComplete(true);
      onComplete(ADJECTIVES.length * 2, correct + (isCorrect ? 1 : 0), questions.length, elapsed);
    } else {
      setCurrentIndex(i => i + 1);
    }
  };

  if (showLearn) {
    return (
      <Modal isOpen onClose={onClose} title="Adjectives" size="lg">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <p className="text-slate-600">Les Adjectifs - Adjectives change based on gender!</p>
          <div className="grid grid-cols-1 gap-2">
            {ADJECTIVES.map(a => (
              <div key={a.masc} className="flex items-center gap-4 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                <span className="text-sm text-slate-500 w-20">{a.english}</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-medium">🔵 {a.masc}</span>
                <span className="text-slate-400">→</span>
                <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded font-medium">🔴 {a.fem}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button variant="secondary" onClick={onClose}>Back</Button>
          <Button variant="primary" onClick={startQuiz}>Start Quiz <ChevronRight className="w-4 h-4 ml-1" /></Button>
        </div>
      </Modal>
    );
  }

  if (isComplete) {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    return (
      <Modal isOpen onClose={onClose} title="Bien fait!" size="md">
        <div className="text-center py-4">
          <div className="text-5xl mb-4">{correct >= 8 ? '🎉' : '👍'}</div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-slate-50 rounded-lg"><p className="text-xs text-slate-500">Score</p><p className="text-2xl font-bold text-slate-900">{correct}/{questions.length}</p></div>
            <div className="p-3 bg-slate-50 rounded-lg"><p className="text-xs text-slate-500">Time</p><p className="text-2xl font-bold text-slate-900">{elapsed}s</p></div>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button variant="secondary" onClick={onClose}>Done</Button>
          <Button variant="primary" onClick={() => setShowLearn(true)}><RotateCcw className="w-4 h-4 mr-1" /> Try Again</Button>
        </div>
      </Modal>
    );
  }

  const q = questions[currentIndex];
  if (!q) return null;

  return (
    <Modal isOpen onClose={onClose} title="Adjectives Quiz" size="md">
      <div className="text-center py-4">
        <div className="flex justify-between text-sm text-slate-500 mb-4">
          <span>Question {currentIndex + 1}/{questions.length}</span>
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{Math.round((Date.now() - startTime) / 1000)}s</span>
        </div>
        <p className="text-slate-600 mb-2">What is the {q.askFem ? 'feminine 🔴' : 'masculine 🔵'} form of "{q.english}"?</p>
        <div className="grid grid-cols-2 gap-3 mt-6">
          {q.options.map(option => (
            <button key={option} onClick={() => handleAnswer(option)} className="p-4 bg-yellow-50 hover:bg-yellow-100 border-2 border-yellow-200 hover:border-yellow-400 rounded-xl text-xl font-semibold text-yellow-700 transition-all">{option}</button>
          ))}
        </div>
      </div>
    </Modal>
  );
}


// Pronouns Game (Layer 10)
function PronounsGame({ score: _score, onComplete, onClose }: {
  score: FrenchScore;
  onComplete: (wordsLearned: number, correct: number, total: number, time: number) => void;
  onClose: () => void;
}) {
  const [showLearn, setShowLearn] = useState(true);
  const [questions, setQuestions] = useState<{ french: string; english: string; options: string[] }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const PRONOUNS = [
    { french: 'je', english: 'I' }, { french: 'tu', english: 'you (informal)' },
    { french: 'il', english: 'he' }, { french: 'elle', english: 'she' },
    { french: 'on', english: 'one/we (informal)' }, { french: 'nous', english: 'we' },
    { french: 'vous', english: 'you (formal/plural)' }, { french: 'ils', english: 'they (masc)' },
    { french: 'elles', english: 'they (fem)' }, { french: 'moi', english: 'me' },
    { french: 'toi', english: 'you (stressed)' }, { french: 'lui', english: 'him' },
  ];

  const startQuiz = () => {
    const allFrench = PRONOUNS.map(p => p.french);
    const qs = shuffleArray(PRONOUNS).slice(0, 10).map(p => ({
      ...p,
      options: shuffleArray([p.french, ...getRandomOptions(p.french, allFrench, 3)]),
    }));
    setQuestions(qs);
    setShowLearn(false);
    setStartTime(Date.now());
    setCurrentIndex(0);
    setCorrect(0);
    setIsComplete(false);
  };

  const handleAnswer = (answer: string) => {
    const isCorrect = answer === questions[currentIndex].french;
    if (isCorrect) setCorrect(c => c + 1);
    if (currentIndex + 1 >= questions.length) {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      setIsComplete(true);
      onComplete(PRONOUNS.length, correct + (isCorrect ? 1 : 0), questions.length, elapsed);
    } else {
      setCurrentIndex(i => i + 1);
    }
  };

  if (showLearn) {
    return (
      <Modal isOpen onClose={onClose} title="Pronouns" size="lg">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <p className="text-slate-600">Les Pronoms - Subject and stressed pronouns!</p>
          <div className="grid grid-cols-2 gap-2">
            {PRONOUNS.map(p => (
              <div key={p.french} className="flex items-center justify-between p-2 bg-teal-50 rounded-lg border border-teal-200">
                <span className="font-bold text-teal-700">{p.french}</span>
                <span className="text-sm text-slate-500">{p.english}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button variant="secondary" onClick={onClose}>Back</Button>
          <Button variant="primary" onClick={startQuiz}>Start Quiz <ChevronRight className="w-4 h-4 ml-1" /></Button>
        </div>
      </Modal>
    );
  }

  if (isComplete) {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    return (
      <Modal isOpen onClose={onClose} title="Bien fait!" size="md">
        <div className="text-center py-4">
          <div className="text-5xl mb-4">{correct >= 8 ? '🎉' : '👍'}</div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-slate-50 rounded-lg"><p className="text-xs text-slate-500">Score</p><p className="text-2xl font-bold text-slate-900">{correct}/{questions.length}</p></div>
            <div className="p-3 bg-slate-50 rounded-lg"><p className="text-xs text-slate-500">Time</p><p className="text-2xl font-bold text-slate-900">{elapsed}s</p></div>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button variant="secondary" onClick={onClose}>Done</Button>
          <Button variant="primary" onClick={() => setShowLearn(true)}><RotateCcw className="w-4 h-4 mr-1" /> Try Again</Button>
        </div>
      </Modal>
    );
  }

  const q = questions[currentIndex];
  if (!q) return null;

  return (
    <Modal isOpen onClose={onClose} title="Pronouns Quiz" size="md">
      <div className="text-center py-4">
        <div className="flex justify-between text-sm text-slate-500 mb-4">
          <span>Question {currentIndex + 1}/{questions.length}</span>
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{Math.round((Date.now() - startTime) / 1000)}s</span>
        </div>
        <p className="text-slate-600 mb-2">What is "{q.english}" in French?</p>
        <div className="grid grid-cols-2 gap-3 mt-6">
          {q.options.map(option => (
            <button key={option} onClick={() => handleAnswer(option)} className="p-4 bg-teal-50 hover:bg-teal-100 border-2 border-teal-200 hover:border-teal-400 rounded-xl text-xl font-semibold text-teal-700 transition-all">{option}</button>
          ))}
        </div>
      </div>
    </Modal>
  );
}


// Conjunctions Game (Layer 11)
function ConjunctionsGame({ score: _score, onComplete, onClose }: {
  score: FrenchScore;
  onComplete: (wordsLearned: number, correct: number, total: number, time: number) => void;
  onClose: () => void;
}) {
  const [showLearn, setShowLearn] = useState(true);
  const [questions, setQuestions] = useState<{ french: string; english: string; example: string; options: string[] }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const CONJUNCTIONS = [
    { french: 'et', english: 'and', example: 'pain et beurre' },
    { french: 'ou', english: 'or', example: 'café ou thé?' },
    { french: 'mais', english: 'but', example: 'petit mais fort' },
    { french: 'donc', english: 'so/therefore', example: 'je pense, donc je suis' },
    { french: 'car', english: 'because', example: "j'ai faim car je n'ai pas mangé" },
    { french: 'ni', english: 'neither/nor', example: 'ni oui ni non' },
    { french: 'puis', english: 'then', example: 'et puis après' },
    { french: 'quand', english: 'when', example: 'quand tu veux' },
    { french: 'si', english: 'if', example: 'si tu veux' },
    { french: 'comme', english: 'as/like', example: 'comme ci, comme ça' },
  ];

  const startQuiz = () => {
    const allFrench = CONJUNCTIONS.map(c => c.french);
    const qs = shuffleArray(CONJUNCTIONS).slice(0, 10).map(c => ({
      ...c,
      options: shuffleArray([c.french, ...getRandomOptions(c.french, allFrench, 3)]),
    }));
    setQuestions(qs);
    setShowLearn(false);
    setStartTime(Date.now());
    setCurrentIndex(0);
    setCorrect(0);
    setIsComplete(false);
  };

  const handleAnswer = (answer: string) => {
    const isCorrect = answer === questions[currentIndex].french;
    if (isCorrect) setCorrect(c => c + 1);
    if (currentIndex + 1 >= questions.length) {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      setIsComplete(true);
      onComplete(CONJUNCTIONS.length, correct + (isCorrect ? 1 : 0), questions.length, elapsed);
    } else {
      setCurrentIndex(i => i + 1);
    }
  };

  if (showLearn) {
    return (
      <Modal isOpen onClose={onClose} title="Conjunctions" size="lg">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <p className="text-slate-600">Les Conjonctions - Words that connect ideas!</p>
          <div className="grid grid-cols-1 gap-2">
            {CONJUNCTIONS.map(c => (
              <div key={c.french} className="p-3 bg-violet-50 rounded-lg border border-violet-200">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-violet-700 text-lg w-16">{c.french}</span>
                  <span className="text-slate-600">{c.english}</span>
                </div>
                <p className="text-sm text-violet-600 mt-1 italic">"{c.example}"</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button variant="secondary" onClick={onClose}>Back</Button>
          <Button variant="primary" onClick={startQuiz}>Start Quiz <ChevronRight className="w-4 h-4 ml-1" /></Button>
        </div>
      </Modal>
    );
  }

  if (isComplete) {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    return (
      <Modal isOpen onClose={onClose} title="Bien fait!" size="md">
        <div className="text-center py-4">
          <div className="text-5xl mb-4">{correct >= 8 ? '🎉' : '👍'}</div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-slate-50 rounded-lg"><p className="text-xs text-slate-500">Score</p><p className="text-2xl font-bold text-slate-900">{correct}/{questions.length}</p></div>
            <div className="p-3 bg-slate-50 rounded-lg"><p className="text-xs text-slate-500">Time</p><p className="text-2xl font-bold text-slate-900">{elapsed}s</p></div>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button variant="secondary" onClick={onClose}>Done</Button>
          <Button variant="primary" onClick={() => setShowLearn(true)}><RotateCcw className="w-4 h-4 mr-1" /> Try Again</Button>
        </div>
      </Modal>
    );
  }

  const q = questions[currentIndex];
  if (!q) return null;

  return (
    <Modal isOpen onClose={onClose} title="Conjunctions Quiz" size="md">
      <div className="text-center py-4">
        <div className="flex justify-between text-sm text-slate-500 mb-4">
          <span>Question {currentIndex + 1}/{questions.length}</span>
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{Math.round((Date.now() - startTime) / 1000)}s</span>
        </div>
        <p className="text-slate-600 mb-2">What is "{q.english}" in French?</p>
        <div className="grid grid-cols-2 gap-3 mt-6">
          {q.options.map(option => (
            <button key={option} onClick={() => handleAnswer(option)} className="p-4 bg-violet-50 hover:bg-violet-100 border-2 border-violet-200 hover:border-violet-400 rounded-xl text-xl font-semibold text-violet-700 transition-all">{option}</button>
          ))}
        </div>
      </div>
    </Modal>
  );
}