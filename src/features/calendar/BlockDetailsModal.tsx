// Block Details Modal - Enhanced with 5 tabs matching Figma design
// Tabs: Overview, Quiz, Français, AI Skills, Resources, Portfolio
import { useEffect, useState } from 'react';
import {
  X,
  Play,
  Check,
  SkipForward,
  Target,
  Package,
  FileText,
  Plus,
  Clock,
  ExternalLink,
  Sparkles,
  FolderOpen,
  TrendingUp,
  CheckCircle,
  Circle,
  Camera,
  Upload,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { curriculumService } from '../../services/curriculumService';
import { foundationalRailService } from '../../services/foundationalRailService';
import { portfolioService } from '../../services/portfolioService';
import quizProgressService from '../../services/quizProgressService';
import { useFamily } from '../family';
import type { QuizQuestion, SkillLevelId } from '../../types/curriculum';
import { ARTIFACT_TYPE_CONFIG, type Artifact } from '../../types/artifact';
import type {
  AISkillsData,
  BlockCompletionDetails,
  FrenchVocabItem,
  ScheduleBlock,
} from '../../types/schedule';
import { BLOCK_STATUS_CONFIG } from '../../types/schedule';

type TabId = 'overview' | 'quiz' | 'francais' | 'aiSkills' | 'resources' | 'portfolio';

interface BlockDetailsModalProps {
  block: ScheduleBlock;
  learnerName?: string;
  learnerId?: string;
  learnerSkillLevel?: string;
  scheduleDate?: string;
  onClose: () => void;
  onStart: () => void;
  onLaunch?: () => void;
  onComplete: (details?: BlockCompletionDetails) => void;
  onSkip: (reason?: string) => void;
  onAddNote: (note: string) => void;
}

const VALID_SKILL_LEVELS: SkillLevelId[] = ['foundation', 'intermediate', 'advanced', 'pro'];

const normalizeSkillLevel = (value?: string): SkillLevelId =>
  VALID_SKILL_LEVELS.includes((value || '') as SkillLevelId)
    ? (value as SkillLevelId)
    : 'intermediate';

const dedupeFrenchVocab = (items: FrenchVocabItem[]): FrenchVocabItem[] => {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.french.toLowerCase()}::${item.english.toLowerCase()}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

// Default French vocab based on block type
const getDefaultFrenchVocab = (blockType: string): FrenchVocabItem[] => {
  const vocabMap: Record<string, FrenchVocabItem[]> = {
    physical: [
      { french: 'marche', english: 'walk' },
      { french: 'saute', english: 'jump' },
      { french: 'respire', english: 'breathe' },
    ],
    learning: [
      { french: 'apprendre', english: 'to learn' },
      { french: 'comprendre', english: 'to understand' },
      { french: 'étudier', english: 'to study' },
    ],
    practice: [
      { french: 'mesure', english: 'measure' },
      { french: 'secondes', english: 'seconds' },
      { french: 'moyenne', english: 'average' },
    ],
    creative: [
      { french: 'créer', english: 'to create' },
      { french: 'dessiner', english: 'to draw' },
      { french: 'couleur', english: 'color' },
    ],
    external: [
      { french: 'plateforme', english: 'platform' },
      { french: 'essayer', english: 'to try' },
      { french: 'partager', english: 'to share' },
    ],
    project: [
      { french: 'construire', english: 'build' },
      { french: 'mesurer', english: 'measure' },
      { french: 'ficelle', english: 'string' },
      { french: 'étiquette', english: 'label' },
    ],
    french: [
      { french: 'parler', english: 'to speak' },
      { french: 'écouter', english: 'to listen' },
      { french: 'répéter', english: 'to repeat' },
    ],
    vr: [
      { french: 'explorer', english: 'to explore' },
      { french: 'observer', english: 'to observe' },
      { french: 'découvrir', english: 'to discover' },
    ],
    reflection: [
      { french: 'penser', english: 'to think' },
      { french: 'réfléchir', english: 'to reflect' },
      { french: 'écrire', english: 'to write' },
    ],
  };
  return vocabMap[blockType] || vocabMap.learning;
};

const TOPIC_FRENCH_VOCAB: Array<{
  keywords: string[];
  vocab: FrenchVocabItem[];
}> = [
  {
    keywords: ['atom', 'matter', 'particle', 'proton', 'neutron', 'electron', 'nucleus', 'isotope', 'element', 'density', 'model'],
    vocab: [
      { french: 'atome', english: 'atom' },
      { french: 'matière', english: 'matter' },
      { french: 'particule', english: 'particle' },
      { french: 'noyau', english: 'nucleus' },
      { french: 'électron', english: 'electron' },
      { french: 'élément', english: 'element' },
    ],
  },
  {
    keywords: ['math', 'algebra', 'equation', 'number', 'measure', 'pattern', 'graph', 'fraction', 'data', 'calculate'],
    vocab: [
      { french: 'nombre', english: 'number' },
      { french: 'motif', english: 'pattern' },
      { french: 'mesurer', english: 'measure' },
      { french: 'graphique', english: 'graph' },
      { french: 'équation', english: 'equation' },
    ],
  },
  {
    keywords: ['history', 'timeline', 'scientist', 'discovery', 'evidence', 'experiment', 'model'],
    vocab: [
      { french: 'histoire', english: 'history' },
      { french: 'preuve', english: 'evidence' },
      { french: 'expérience', english: 'experiment' },
      { french: 'chronologie', english: 'timeline' },
      { french: 'scientifique', english: 'scientist' },
    ],
  },
  {
    keywords: ['geography', 'map', 'climate', 'region', 'country', 'continent'],
    vocab: [
      { french: 'carte', english: 'map' },
      { french: 'climat', english: 'climate' },
      { french: 'région', english: 'region' },
      { french: 'continent', english: 'continent' },
    ],
  },
  {
    keywords: ['art', 'design', 'draw', 'create', 'color', 'poster', 'visual'],
    vocab: [
      { french: 'dessiner', english: 'draw' },
      { french: 'créer', english: 'create' },
      { french: 'couleur', english: 'color' },
      { french: 'forme', english: 'shape' },
      { french: 'affiche', english: 'poster' },
    ],
  },
  {
    keywords: ['write', 'grammar', 'story', 'sentence', 'vocabulary', 'word', 'reflect'],
    vocab: [
      { french: 'phrase', english: 'sentence' },
      { french: 'grammaire', english: 'grammar' },
      { french: 'mot', english: 'word' },
      { french: 'décrire', english: 'describe' },
      { french: 'raconter', english: 'tell a story' },
    ],
  },
  {
    keywords: ['code', 'coding', 'computer', 'algorithm', 'debug', 'program', 'data'],
    vocab: [
      { french: 'code', english: 'code' },
      { french: 'algorithme', english: 'algorithm' },
      { french: 'déboguer', english: 'debug' },
      { french: 'données', english: 'data' },
      { french: 'programme', english: 'program' },
    ],
  },
  {
    keywords: ['movement', 'physical', 'exercise', 'stretch', 'balance', 'warm-up', 'breath'],
    vocab: [
      { french: 'bouger', english: 'move' },
      { french: 'équilibre', english: 'balance' },
      { french: 'étirer', english: 'stretch' },
      { french: 'souffle', english: 'breath' },
      { french: 'corps', english: 'body' },
    ],
  },
];

const buildDynamicFrenchSupport = (
  block: ScheduleBlock,
  blockTypeDefaults: FrenchVocabItem[]
): { vocab: FrenchVocabItem[]; goals: string[] } => {
  const content = [
    block.title,
    block.description,
    block.expectedWork,
    block.reflectionPrompt,
    ...(block.objectives || []),
    ...(block.materials || []),
    ...(block.recommendedTools || []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const topicMatches = TOPIC_FRENCH_VOCAB.filter((theme) =>
    theme.keywords.some((keyword) => content.includes(keyword))
  );

  const topicVocab = topicMatches.flatMap((theme) => theme.vocab);
  const vocab = dedupeFrenchVocab([...(block.frenchVocab || []), ...topicVocab, ...blockTypeDefaults]).slice(0, 6);
  const focusWords = vocab.slice(0, 3).map((item) => `"${item.french}"`).join(', ');
  const compactTitle = block.title.toLowerCase();

  const fallbackGoals = [
    `Use ${focusWords || 'one new French word'} while explaining ${compactTitle}.`,
    `Say one short French sentence about the key idea from ${compactTitle}.`,
    'Repeat the new vocabulary aloud and connect each word to what you did in this session.',
    'Teach one of the new terms back to someone else in English and French.',
  ];

  return {
    vocab,
    goals: block.frenchIntegrationGoals?.length ? block.frenchIntegrationGoals : fallbackGoals,
  };
};

const getAiLevelForSkill = (skillLevel: SkillLevelId): AISkillsData['level'] => {
  if (skillLevel === 'foundation') return 'beginner';
  if (skillLevel === 'intermediate') return 'intermediate';
  return 'advanced';
};

const getDynamicAISkills = (block: ScheduleBlock, skillLevel: SkillLevelId): AISkillsData => {
  const content = [
    block.title,
    block.description,
    block.expectedWork,
    ...(block.objectives || []),
    ...(block.materials || []),
    ...(block.recommendedTools || []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const level = getAiLevelForSkill(skillLevel);

  const profiles: Array<{
    keywords: string[];
    build: () => AISkillsData;
  }> = [
    {
      keywords: ['movement', 'physical', 'exercise', 'stretch', 'warm-up', 'balance', 'breath'],
      build: () => ({
        title: `${block.title}: Movement Reflection Coach`,
        description: 'Use AI after the movement block to reflect on stamina, coordination, breathing, or recovery and plan the next routine.',
        tools: ['Timer data', 'Voice-note reflection', 'Routine planning prompt'],
        expectedOutcome: 'A clearer picture of how movement affects focus and body readiness.',
        level,
        levelDescription: 'Light-touch AI support that stays grounded in the real physical task you just completed.',
      }),
    },
    {
      keywords: ['french', 'vocabulary', 'word lab', 'pronunciation', 'sentence'],
      build: () => ({
        title: `${block.title}: French Conversation Coach`,
        description: 'Use AI for pronunciation checks, short conversation practice, and topic-linked vocabulary review.',
        tools: ['Voice conversation', 'Pronunciation feedback', 'Vocabulary quiz prompts'],
        expectedOutcome: 'Better spoken and written French tied directly to today’s topic.',
        level,
        levelDescription: 'AI acts as a language partner, not just a translation tool.',
      }),
    },
    {
      keywords: ['grammar', 'writing', 'story', 'sentence', 'paragraph', 'reflection'],
      build: () => ({
        title: `${block.title}: Writing and Revision Coach`,
        description: 'Use AI to brainstorm, improve sentence flow, check grammar choices, or strengthen the clarity of your explanation.',
        tools: ['Sentence feedback', 'Vocabulary explorer', 'Revision checklist'],
        expectedOutcome: 'Stronger writing that explains ideas more clearly and confidently.',
        level,
        levelDescription: 'AI supports drafting and revising without replacing the learner’s own voice.',
      }),
    },
    {
      keywords: ['history', 'timeline', 'scientist', 'discovery', 'evidence'],
      build: () => ({
        title: `${block.title}: Timeline and Evidence Coach`,
        description: 'Use AI to compare sources, build a timeline, or turn historical evidence into clearer explanations.',
        tools: ['Timeline builder', 'Source comparison prompts', 'Question generator'],
        expectedOutcome: 'A better understanding of sequence, evidence, and change over time.',
        level,
        levelDescription: 'AI helps organize information and sharpen historical reasoning.',
      }),
    },
    {
      keywords: ['geography', 'map', 'climate', 'region', 'country', 'continent'],
      build: () => ({
        title: `${block.title}: Mapping and Comparison Coach`,
        description: 'Use AI to compare regions, explain patterns on a map, or ask follow-up questions about place and environment.',
        tools: ['Map explainer prompts', 'Compare-and-contrast questions', 'Observation notes'],
        expectedOutcome: 'Clearer geographic reasoning and stronger use of evidence from maps and patterns.',
        level,
        levelDescription: 'AI supports place-based thinking instead of generic lookup.',
      }),
    },
    {
      keywords: ['atom', 'matter', 'particle', 'electron', 'proton', 'neutron', 'density', 'element'],
      build: () => ({
        title: `${block.title}: Science Concept Coach`,
        description: 'Use AI to compare scientific models, generate follow-up questions, or explain a tricky science idea in a new way.',
        tools: ['Concept comparison prompts', 'Simulation explainer', 'Question generator'],
        expectedOutcome: 'A stronger explanation of the science concept and how it works in the real world.',
        level,
        levelDescription: 'AI should deepen understanding of the model, not replace hands-on reasoning.',
      }),
    },
    {
      keywords: ['body', 'muscle', 'skeleton', 'organ', 'system', 'heart', 'lungs'],
      build: () => ({
        title: `${block.title}: Body Systems Coach`,
        description: 'Use AI to label, compare, and explain how the parts of the human body system work together.',
        tools: ['Labeling prompts', 'Compare-function questions', 'Explain-it-back support'],
        expectedOutcome: 'More accurate understanding of structure, function, and system relationships.',
        level,
        levelDescription: 'AI acts like a study coach for systems thinking and explanation.',
      }),
    },
    {
      keywords: ['math', 'algebra', 'equation', 'number', 'graph', 'fraction', 'pattern', 'measure', 'data'],
      build: () => ({
        title: `${block.title}: Maths Problem-Solving Coach`,
        description: 'Use AI to check a strategy, generate one more example, or explain the pattern in another way when you get stuck.',
        tools: ['Worked-example checker', 'Pattern explainer', 'Graphing helper'],
        expectedOutcome: 'Clearer reasoning, stronger strategy choice, and better explanation of the maths.',
        level,
        levelDescription: 'AI supports mathematical thinking, but the learner still owns the solution.',
      }),
    },
    {
      keywords: ['code', 'coding', 'computer', 'algorithm', 'debug', 'program'],
      build: () => ({
        title: `${block.title}: Coding and Debug Coach`,
        description: 'Use AI to inspect logic, debug a step, or suggest a cleaner way to structure the task.',
        tools: ['Debug prompts', 'Pseudo-code helper', 'Notebook examples'],
        expectedOutcome: 'Stronger logic, cleaner debugging, and more confident tool use.',
        level,
        levelDescription: 'AI should be used as a collaborator that explains, not a copy-paste shortcut.',
      }),
    },
  ];

  const matchedProfile = profiles.find((profile) =>
    profile.keywords.some((keyword) => content.includes(keyword))
  );

  if (matchedProfile) {
    return matchedProfile.build();
  }

  const aiMap: Record<string, AISkillsData> = {
    learning: {
      title: `${block.title}: AI Enhancement`,
      description: 'Use AI tools to explore the concept more deeply and connect it to a real example.',
      tools: ['NotebookLM', 'Question prompts', 'Research support'],
      expectedOutcome: 'Stronger understanding through explanation, questioning, and comparison.',
      level,
      levelDescription: 'Use AI to extend thinking, not to skip the hard part of learning.',
    },
    practice: {
      title: `${block.title}: Strategy Coach`,
      description: 'Use AI to compare methods, check a step, or ask for one more practice example matched to this skill.',
      tools: ['Worked-example prompts', 'Error check', 'Hint generator'],
      expectedOutcome: 'Better strategy choice and more independent correction.',
      level,
      levelDescription: 'AI works best here as a coach that gives hints rather than answers.',
    },
    project: {
      title: `${block.title}: Project Planning Coach`,
      description: 'Use AI to plan steps, document choices, and improve how the project is explained or presented.',
      tools: ['Planning checklist', 'Iteration feedback', 'Presentation coach'],
      expectedOutcome: 'A clearer, better-structured project with stronger documentation.',
      level,
      levelDescription: 'AI should support project planning, reflection, and iteration.',
    },
    creative: {
      title: `${block.title}: Creative Partner`,
      description: 'Use AI to generate variations, critique a design choice, or help explain the creative idea behind the work.',
      tools: ['Idea variations', 'Design critique prompts', 'Showcase caption helper'],
      expectedOutcome: 'A more intentional creative artifact with clearer explanation.',
      level,
      levelDescription: 'AI acts as a thinking partner while the learner stays in charge of the creative choices.',
    },
    external: {
      title: `${block.title}: Learning Bridge`,
      description: 'Use AI to bring ideas back from an outside tool and connect them to the current learning goal.',
      tools: ['Reflection prompts', 'Summary support', 'Transfer questions'],
      expectedOutcome: 'Outside learning translated into visible understanding.',
      level,
      levelDescription: 'The goal is to connect, summarize, and apply what happened elsewhere.',
    },
    physical: {
      title: `${block.title}: Reflection Coach`,
      description: 'Use AI after movement to notice patterns in energy, coordination, or recovery and plan what comes next.',
      tools: ['Voice-note summary', 'Routine planner', 'Observation prompts'],
      expectedOutcome: 'Better awareness of body, focus, and readiness.',
      level,
      levelDescription: 'AI stays light here and supports noticing rather than replacing the real activity.',
    },
    french: {
      title: `${block.title}: Language Coach`,
      description: 'Use AI for conversation practice, pronunciation support, and quick vocabulary retrieval.',
      tools: ['Voice mode', 'Pronunciation feedback', 'Vocabulary prompts'],
      expectedOutcome: 'More confident use of French in context.',
      level,
      levelDescription: 'AI supports speaking and listening practice in short, useful bursts.',
    },
    reflection: {
      title: `${block.title}: Reflection Coach`,
      description: 'Use AI to turn notes into clearer reflections, questions, or next steps.',
      tools: ['Reflection prompts', 'Next-step generator', 'Summary helper'],
      expectedOutcome: 'A more thoughtful reflection and clearer next action.',
      level,
      levelDescription: 'AI supports metacognition and planning rather than doing the learning for the learner.',
    },
    vr: {
      title: `${block.title}: Observation Coach`,
      description: 'Use AI to organize observations, compare patterns, and explain what you noticed during the immersive task.',
      tools: ['Observation notes', 'Pattern prompts', 'Explain-it-back helper'],
      expectedOutcome: 'Stronger meaning-making from immersive experiences.',
      level,
      levelDescription: 'AI helps translate observation into clear understanding.',
    },
  };

  return aiMap[block.type] || aiMap.learning;
};

export function BlockDetailsModal({
  block,
  learnerName = 'Learner',
  learnerId,
  learnerSkillLevel = 'intermediate',
  scheduleDate,
  onClose,
  onStart,
  onLaunch,
  onComplete,
  onSkip,
  onAddNote,
}: BlockDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [newNote, setNewNote] = useState('');
  const [skipReason, setSkipReason] = useState('');
  const [showSkipForm, setShowSkipForm] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  const [whatLearned, setWhatLearned] = useState('');
  const [challengeNote, setChallengeNote] = useState('');
  const [nextStep, setNextStep] = useState('');
  const [quickCheckAnswer, setQuickCheckAnswer] = useState('');
  const [confidence, setConfidence] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [checkedObjectives, setCheckedObjectives] = useState<Set<number>>(new Set());
  const [quizQuestionIndex, setQuizQuestionIndex] = useState(0);
  const [showQuizHint, setShowQuizHint] = useState(false);
  const [, setQuizRevision] = useState(0);
  const [relatedPodAssets, setRelatedPodAssets] = useState<Artifact[]>([]);
  const [isLoadingRelatedPodAssets, setIsLoadingRelatedPodAssets] = useState(false);

  const statusConfig = BLOCK_STATUS_CONFIG[block.status];
  const canStart =
    block.status === 'scheduled' ||
    block.status === 'ready' ||
    block.status === 'paused' ||
    block.status === 'rescheduled';
  const canLaunch = Boolean(onLaunch && block.launchUrl);
  const isCompleted = block.status === 'completed';
  const isSkipped = block.status === 'skipped';
  const skillLevel = normalizeSkillLevel(learnerSkillLevel);
  const { family } = useFamily();

  useEffect(() => {
    setQuizQuestionIndex(0);
    setShowQuizHint(false);
    setActiveTab('overview');
  }, [block.id]);

  useEffect(() => {
    let isCancelled = false;

    const loadRelatedPodAssets = async () => {
      if (!learnerId || !block.podId || block.railId) {
        setRelatedPodAssets([]);
        return;
      }

      setIsLoadingRelatedPodAssets(true);

      try {
        const curriculum = curriculumService.getCurriculum(block.podId);
        const supportAssetIds = new Set((curriculum?.supportingAssets || []).map((asset) => asset.id));
        const linkedSupportAssetIds = (block.sourceLinks || [])
          .map((link) => link.id)
          .filter((id) => supportAssetIds.has(id));
        const assets = await portfolioService.getRelevantPodLibraryAssets({
          learnerId,
          podId: block.podId,
          weekNumber: block.weekNumber,
          skillLevel,
          supportAssetIds: linkedSupportAssetIds,
          familyLearnerIds: family?.learners.map((learner) => learner.id) || [learnerId],
          blockContent: [
            block.title,
            block.description,
            block.expectedWork,
            block.reflectionPrompt,
            ...block.objectives,
            ...block.materials,
            ...(block.sessionGuide || []),
          ].filter((value): value is string => Boolean(value)),
        });

        if (!isCancelled) {
          setRelatedPodAssets(assets);
        }
      } catch (error) {
        console.error('Failed to load related pod assets:', error);
        if (!isCancelled) {
          setRelatedPodAssets([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingRelatedPodAssets(false);
        }
      }
    };

    void loadRelatedPodAssets();

    return () => {
      isCancelled = true;
    };
  }, [
    block.description,
    block.expectedWork,
    block.id,
    block.materials,
    block.objectives,
    block.podId,
    block.railId,
    block.reflectionPrompt,
    block.sessionGuide,
    block.sourceLinks,
    block.title,
    block.weekNumber,
    family?.learners,
    learnerId,
    skillLevel,
  ]);

  const baseFrenchVocab = getDefaultFrenchVocab(block.type);
  const { vocab: frenchVocab, goals: frenchGoals } = buildDynamicFrenchSupport(block, baseFrenchVocab);
  
  // Get AI skills (from block or defaults)
  const aiSkills = block.aiSkills || getDynamicAISkills(block, skillLevel);
  const railModule =
    block.railTrackId && block.railModuleId
      ? foundationalRailService.getModule(block.railTrackId, block.railModuleId)
      : null;
  const quizScopeKey =
    block.railTrackId && block.railModuleId
      ? quizProgressService.createRailScopeKey(block.railTrackId, block.railModuleId)
      : block.podId && block.weekNumber
        ? quizProgressService.createPodScopeKey(block.podId, block.weekNumber)
        : null;
  const quizQuestions = (block.quizQuestions || []).filter((question) => question.type === 'multiple-choice');
  const weekQuizQuestions =
    railModule
        ? (railModule.quizQuestions || []).filter(
            (question) =>
              question.type === 'multiple-choice' && question.skillLevels.includes(skillLevel)
          )
        : block.podId && block.weekNumber
          ? (curriculumService.getWeekCurriculum(block.podId, block.weekNumber)?.quizQuestions || []).filter(
              (question) =>
                question.type === 'multiple-choice' && question.skillLevels.includes(skillLevel)
            )
          : quizQuestions;
  const quizAttempts =
    learnerId && quizScopeKey
      ? quizProgressService.getAttemptsForScope(learnerId, quizScopeKey)
      : [];
  const quizAttemptsByQuestionId = new Map(quizAttempts.map((attempt) => [attempt.questionId, attempt]));
  const dailyQuizSummary =
    learnerId && quizScopeKey
      ? quizProgressService.getScoreForScopeQuestions(learnerId, quizScopeKey, quizQuestions)
      : {
          totalQuestions: quizQuestions.length,
          answeredQuestions: 0,
          correctAnswers: 0,
          accuracy: 0,
        };
  const weeklyQuizSummary =
    learnerId && quizScopeKey
      ? quizProgressService.getScoreForScopeQuestions(learnerId, quizScopeKey, weekQuizQuestions)
      : {
          totalQuestions: weekQuizQuestions.length,
          answeredQuestions: 0,
          correctAnswers: 0,
          accuracy: 0,
        };
  const currentQuizQuestion = quizQuestions[quizQuestionIndex] || null;
  const currentQuizAttempt = currentQuizQuestion
    ? quizAttemptsByQuestionId.get(currentQuizQuestion.id)
    : null;

  const handleQuizAnswer = (question: QuizQuestion, selectedAnswer: string) => {
    if (!learnerId || !quizScopeKey) {
      return;
    }

    quizProgressService.saveScopedAnswer({
      learnerId,
      scopeKey: quizScopeKey,
      podId:
        block.railTrackId && block.railModuleId
          ? `rail-${block.railTrackId}-${block.railModuleId}`
          : block.podId || quizScopeKey,
      weekNumber: block.weekNumber || 1,
      date: scheduleDate || new Date().toISOString().split('T')[0],
      question,
      selectedAnswer,
    });
    setQuizRevision((value) => value + 1);
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      onAddNote(newNote.trim());
      setNewNote('');
    }
  };

  const handleComplete = () => {
    const normalizedLearned = whatLearned.trim() || completionNotes.trim();
    const hasReflection =
      Boolean(normalizedLearned) ||
      Boolean(challengeNote.trim()) ||
      Boolean(nextStep.trim()) ||
      Boolean(quickCheckAnswer.trim());

    onComplete({
      notes: completionNotes.trim() || undefined,
      reflection: hasReflection
        ? {
            prompt: block.reflectionPrompt,
            whatLearned: normalizedLearned || undefined,
            challenge: challengeNote.trim() || undefined,
            nextStep: nextStep.trim() || undefined,
            confidence,
            quickCheckAnswer: quickCheckAnswer.trim() || undefined,
          }
        : undefined,
    });
    onClose();
  };

  const handleSkip = () => {
    onSkip(skipReason || undefined);
    onClose();
  };

  const toggleObjective = (index: number) => {
    const newChecked = new Set(checkedObjectives);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedObjectives(newChecked);
  };

  const tabs: { id: TabId; label: string; icon?: string }[] = [
    { id: 'overview', label: 'Overview' },
    ...(quizQuestions.length > 0 ? [{ id: 'quiz' as TabId, label: '🧪 Quiz' }] : []),
    { id: 'francais', label: '🇫🇷 Français' },
    { id: 'aiSkills', label: '🤖 AI Skills' },
    { id: 'resources', label: 'Resources' },
    { id: 'portfolio', label: 'Portfolio' },
  ];

  const skillLevelLabel = learnerSkillLevel.charAt(0).toUpperCase() + learnerSkillLevel.slice(1);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                {learnerName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-slate-900">
                    {learnerName} - {block.startTime}
                  </h2>
                  <Badge variant="default" size="sm">{skillLevelLabel}</Badge>
                </div>
                <p className="text-sm text-slate-600">{block.title}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 bg-slate-100 rounded-lg p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all
                  ${activeTab === tab.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <OverviewTab
              block={block}
              frenchVocab={frenchVocab}
              checkedObjectives={checkedObjectives}
              toggleObjective={toggleObjective}
            />
          )}

          {activeTab === 'quiz' && quizQuestions.length > 0 && (
            <QuizTab
              questions={quizQuestions}
              weekQuestions={weekQuizQuestions}
              currentQuestionIndex={quizQuestionIndex}
              onQuestionIndexChange={setQuizQuestionIndex}
              showHint={showQuizHint}
              setShowHint={setShowQuizHint}
              currentQuestion={currentQuizQuestion}
              currentAttempt={currentQuizAttempt}
              dailySummary={dailyQuizSummary}
              weeklySummary={weeklyQuizSummary}
              onAnswer={handleQuizAnswer}
            />
          )}

          {/* Français Tab */}
          {activeTab === 'francais' && (
            <FrancaisTab frenchVocab={frenchVocab} frenchGoals={frenchGoals} />
          )}

          {/* AI Skills Tab */}
          {activeTab === 'aiSkills' && (
            <AISkillsTab aiSkills={aiSkills} blockTitle={block.title} />
          )}

          {/* Resources Tab */}
          {activeTab === 'resources' && (
            <ResourcesTab
              block={block}
              onLaunch={onLaunch}
              relatedPodAssets={relatedPodAssets}
              isLoadingRelatedPodAssets={isLoadingRelatedPodAssets}
            />
          )}

          {/* Portfolio Tab */}
          {activeTab === 'portfolio' && (
            <PortfolioTab block={block} isCompleted={isCompleted} />
          )}

          {/* Progress Section (shown in all tabs except portfolio) */}
          {activeTab !== 'portfolio' && (
            <ProgressSection
              block={block}
              statusConfig={statusConfig}
              checkedObjectives={checkedObjectives}
              newNote={newNote}
              setNewNote={setNewNote}
              handleAddNote={handleAddNote}
            />
          )}

          {/* Skip/Complete Forms */}
          {showSkipForm && (
            <Card className="p-4 bg-orange-50 mt-4">
              <p className="text-sm font-medium text-orange-700 mb-2">Why are you skipping this block?</p>
              <input
                type="text"
                value={skipReason}
                onChange={(e) => setSkipReason(e.target.value)}
                placeholder="Optional reason..."
                className="w-full px-3 py-2 border border-orange-200 rounded-lg text-sm mb-3 bg-white text-slate-900"
              />
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setShowSkipForm(false)}>Cancel</Button>
                <Button variant="primary" size="sm" onClick={handleSkip}>Skip Block</Button>
              </div>
            </Card>
          )}

          {showCompleteForm && (
            <Card className="p-4 bg-green-50 mt-4">
              <p className="text-sm font-medium text-green-700 mb-2">Capture what happened in this session</p>
              <textarea
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="Session notes, observations, or reminders"
                className="w-full px-3 py-2 border border-green-200 rounded-lg text-sm h-20 resize-none mb-3 bg-white text-slate-900"
              />
              <div className="space-y-3 mb-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">
                    {block.reflectionPrompt || 'What did you learn?'}
                  </label>
                  <textarea
                    value={whatLearned}
                    onChange={(e) => setWhatLearned(e.target.value)}
                    placeholder="Explain it in your own words"
                    className="w-full px-3 py-2 border border-green-200 rounded-lg text-sm h-20 resize-none bg-white text-slate-900"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">What felt hard?</label>
                    <textarea
                      value={challengeNote}
                      onChange={(e) => setChallengeNote(e.target.value)}
                      placeholder="A tricky part, bug, or confusing idea"
                      className="w-full px-3 py-2 border border-green-200 rounded-lg text-sm h-20 resize-none bg-white text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">What will you try next?</label>
                    <textarea
                      value={nextStep}
                      onChange={(e) => setNextStep(e.target.value)}
                      placeholder="Next move, experiment, or question"
                      className="w-full px-3 py-2 border border-green-200 rounded-lg text-sm h-20 resize-none bg-white text-slate-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Quick check or teach-back</label>
                  <input
                    type="text"
                    value={quickCheckAnswer}
                    onChange={(e) => setQuickCheckAnswer(e.target.value)}
                    placeholder="One key fact, explanation, or takeaway"
                    className="w-full px-3 py-2 border border-green-200 rounded-lg text-sm bg-white text-slate-900"
                  />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-600 mb-2">How confident do you feel now?</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setConfidence(value as 1 | 2 | 3 | 4 | 5)}
                        className={`w-9 h-9 rounded-full border text-sm font-semibold transition-colors ${
                          confidence === value
                            ? 'bg-green-600 border-green-600 text-white'
                            : 'bg-white border-green-200 text-slate-600 hover:border-green-400'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setShowCompleteForm(false)}>Cancel</Button>
                <Button variant="primary" size="sm" onClick={handleComplete}>Mark Complete</Button>
              </div>
            </Card>
          )}
        </div>

        {/* Footer Actions */}
        {!isCompleted && !isSkipped && !showSkipForm && !showCompleteForm && (
          <div className="p-4 border-t border-slate-200 flex justify-between">
            <Button variant="secondary" onClick={() => setShowSkipForm(true)} className="text-orange-600">
              <SkipForward className="w-4 h-4 mr-2" />
              Skip
            </Button>
            <div className="flex gap-2">
              {canLaunch && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    onLaunch?.();
                    onClose();
                  }}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Tool
                </Button>
              )}
              {canStart && (
                <Button variant="primary" onClick={() => { onStart(); onClose(); }}>
                  <Play className="w-4 h-4 mr-2" />
                  Start Now
                </Button>
              )}
              <Button variant="secondary" onClick={() => setShowCompleteForm(true)} className="text-green-600">
                <Check className="w-4 h-4 mr-2" />
                Complete
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


// ============ TAB COMPONENTS ============

// Overview Tab - Learning Objectives, Expected Work, Time, French Preview
function OverviewTab({
  block,
  frenchVocab,
  checkedObjectives,
  toggleObjective,
}: {
  block: ScheduleBlock;
  frenchVocab: FrenchVocabItem[];
  checkedObjectives: Set<number>;
  toggleObjective: (index: number) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Learning Objectives */}
      <Card className="p-4 bg-white border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-blue-500" />
          Learning Objectives
        </h3>
        <div className="space-y-2">
          {block.objectives.map((obj, i) => (
            <button
              key={i}
              onClick={() => toggleObjective(i)}
              className="flex items-start gap-3 w-full text-left p-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              {checkedObjectives.has(i) ? (
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-5 h-5 text-slate-300 flex-shrink-0 mt-0.5" />
              )}
              <span className={`text-sm ${checkedObjectives.has(i) ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                {obj}
              </span>
            </button>
          ))}
        </div>
      </Card>

      {/* Expected Work & Time */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 bg-white border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <h4 className="font-medium text-sm text-slate-700">Expected Work</h4>
          </div>
          <p className="text-sm text-slate-600">
            {block.expectedWork || block.description || `Complete ${block.type} session with documented observations`}
          </p>
        </Card>
        <Card className="p-4 bg-white border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <h4 className="font-medium text-sm text-slate-700">Estimated Time</h4>
          </div>
          <p className="text-sm text-slate-600">{block.duration} minutes</p>
        </Card>
      </div>

      {/* French Vocabulary Integration Preview */}
      <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <span>🇫🇷</span>
          French Vocabulary Integration
        </h3>
        <div className="flex flex-wrap gap-2">
          {frenchVocab.slice(0, 4).map((item, i) => (
            <span
              key={i}
              className="px-3 py-1.5 bg-white rounded-lg text-sm text-slate-700 border border-blue-200"
            >
              {item.french} ({item.english})
            </span>
          ))}
        </div>
      </Card>

      {(block.sessionGuide?.length || block.recommendedTools?.length) && (
        <Card className="p-4 bg-white border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            Session Path
          </h3>

          {block.recommendedTools && block.recommendedTools.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-slate-700 mb-2">Recommended tools</p>
              <div className="flex flex-wrap gap-2">
                {block.recommendedTools.map((tool) => (
                  <span
                    key={tool}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}

          {block.sessionGuide && block.sessionGuide.length > 0 && (
            <div className="space-y-2">
              {block.sessionGuide.map((step) => (
                <div key={step} className="flex items-start gap-3 rounded-lg bg-slate-50 px-3 py-2">
                  <div className="mt-0.5 h-5 w-5 rounded-full bg-indigo-100 text-[11px] font-semibold text-indigo-700 flex items-center justify-center">
                    →
                  </div>
                  <p className="text-sm text-slate-700">{step}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

// Français Tab - Full French vocabulary with goals
function FrancaisTab({
  frenchVocab,
  frenchGoals,
}: {
  frenchVocab: FrenchVocabItem[];
  frenchGoals: string[];
}) {
  return (
    <div className="space-y-4">
      <Card className="p-4 bg-white border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <span>🇫🇷</span>
          French Learning Integration
        </h3>
        
        <p className="text-sm font-medium text-slate-700 mb-3">
          Today's French Vocabulary:
        </p>
        
        <div className="space-y-2 mb-6">
          {frenchVocab.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
            >
              <span className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold">
                {i + 1}
              </span>
              <span className="text-slate-900 font-medium">
                {item.french} <span className="text-slate-500">({item.english})</span>
              </span>
            </div>
          ))}
        </div>

        {/* French Integration Goals */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="font-medium text-sm text-blue-800 mb-2">
            French Integration Goals:
          </p>
          <ul className="space-y-1">
            {frenchGoals.map((goal, i) => (
              <li key={i} className="text-sm text-blue-700 flex items-start gap-2">
                <span className="text-blue-500">•</span>
                {goal}
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </div>
  );
}

function QuizTab({
  questions,
  weekQuestions,
  currentQuestionIndex,
  onQuestionIndexChange,
  showHint,
  setShowHint,
  currentQuestion,
  currentAttempt,
  dailySummary,
  weeklySummary,
  onAnswer,
}: {
  questions: QuizQuestion[];
  weekQuestions: QuizQuestion[];
  currentQuestionIndex: number;
  onQuestionIndexChange: (value: number) => void;
  showHint: boolean;
  setShowHint: (value: boolean) => void;
  currentQuestion: QuizQuestion | null;
  currentAttempt?: { selectedAnswer: string; isCorrect: boolean } | null;
  dailySummary: { totalQuestions: number; answeredQuestions: number; correctAnswers: number; accuracy: number };
  weeklySummary: { totalQuestions: number; answeredQuestions: number; correctAnswers: number; accuracy: number };
  onAnswer: (question: QuizQuestion, selectedAnswer: string) => void;
}) {
  if (!currentQuestion) {
    return (
      <Card className="p-4 bg-white border border-slate-200">
        <p className="text-sm text-slate-600">No quiz questions are attached to this session yet.</p>
      </Card>
    );
  }

  const options = currentQuestion.options || [];
  const canGoBack = currentQuestionIndex > 0;
  const canGoNext = currentQuestionIndex < questions.length - 1;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Today</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {dailySummary.correctAnswers}/{dailySummary.totalQuestions}
          </p>
          <p className="text-sm text-slate-600">{dailySummary.accuracy}% accuracy</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">This Week</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {weeklySummary.correctAnswers}/{weeklySummary.totalQuestions}
          </p>
          <p className="text-sm text-slate-600">{weeklySummary.accuracy}% overall accuracy</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Progress</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {dailySummary.answeredQuestions}/{dailySummary.totalQuestions}
          </p>
          <p className="text-sm text-slate-600">{weekQuestions.length} questions available this week</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-900 bg-slate-950 p-4 text-white shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div>
            <p className="text-sm text-white/70">
              {currentQuestionIndex + 1}/{questions.length} for this day
            </p>
            {currentQuestion.day ? (
              <p className="text-xs uppercase tracking-[0.14em] text-white/50 mt-1">{currentQuestion.day} quick check</p>
            ) : null}
          </div>
          {currentAttempt ? (
            <Badge variant="default" size="sm" className={currentAttempt.isCorrect ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}>
              {currentAttempt.isCorrect ? 'Correct' : 'Needs review'}
            </Badge>
          ) : null}
        </div>

        <h3 className="text-2xl font-semibold leading-tight mb-6">{currentQuestion.prompt}</h3>

        <div className="space-y-3">
          {options.map((option, index) => {
            const isSelected = currentAttempt?.selectedAnswer === option;
            const isCorrect = Array.isArray(currentQuestion.correctAnswer)
              ? currentQuestion.correctAnswer.includes(option)
              : currentQuestion.correctAnswer === option;
            const showResult = Boolean(currentAttempt);

            return (
              <button
                key={option}
                type="button"
                onClick={() => onAnswer(currentQuestion, option)}
                className={[
                  'w-full rounded-2xl border px-5 py-4 text-left transition-colors',
                  showResult && isCorrect
                    ? 'border-emerald-400 bg-emerald-500/15'
                    : showResult && isSelected && !isCorrect
                      ? 'border-rose-400 bg-rose-500/15'
                      : isSelected
                        ? 'border-blue-400 bg-blue-500/10'
                        : 'border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10',
                ].join(' ')}
              >
                <span className="text-lg font-medium text-white/85">
                  {String.fromCharCode(65 + index)}. {option}
                </span>
              </button>
            );
          })}
        </div>

        {currentQuestion.hint ? (
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowHint(!showHint)}
              className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/85 hover:bg-white/15"
            >
              {showHint ? 'Hide hint' : 'Show hint'}
            </button>
            {showHint ? (
              <div className="mt-3 rounded-2xl bg-white/5 px-4 py-3 text-sm text-white/80">
                {currentQuestion.hint}
              </div>
            ) : null}
          </div>
        ) : null}

        {currentAttempt ? (
          <div className="mt-6 rounded-2xl bg-white/5 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.14em] text-white/50 mb-2">Why this answer</p>
            <p className="text-base text-white/85">{currentQuestion.explanation}</p>
          </div>
        ) : null}

        <div className="mt-6 flex items-center justify-between gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              setShowHint(false);
              onQuestionIndexChange(Math.max(0, currentQuestionIndex - 1));
            }}
            disabled={!canGoBack}
          >
            Previous
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setShowHint(false);
              onQuestionIndexChange(Math.min(questions.length - 1, currentQuestionIndex + 1));
            }}
            disabled={!canGoNext}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

// AI Skills Tab - AI enhancement, tools, outcomes
function AISkillsTab({
  aiSkills,
  blockTitle,
}: {
  aiSkills: AISkillsData;
  blockTitle: string;
}) {
  return (
    <div className="space-y-4">
      <Card className="p-4 bg-white border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          AI Skills Development
        </h3>

        {/* Title & Description */}
        <div className="mb-4">
          <p className="font-medium text-slate-800">
            {aiSkills.title || `${blockTitle}: AI Enhancement`}
          </p>
          <p className="text-sm text-slate-600 mt-1">
            {aiSkills.description}
          </p>
        </div>

        {/* AI Tools & Technologies */}
        <div className="mb-4">
          <p className="text-sm font-medium text-slate-700 mb-2">
            AI Tools & Technologies:
          </p>
          <div className="flex flex-wrap gap-2">
            {aiSkills.tools.map((tool, i) => (
              <span
                key={i}
                className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>

        {/* Expected Learning Outcome */}
        <div className="mb-4">
          <p className="text-sm font-medium text-slate-700 mb-1">
            Expected Learning Outcome:
          </p>
          <p className="text-sm text-slate-600">
            {aiSkills.expectedOutcome}
          </p>
        </div>

        {/* AI Skills Progress */}
        <div className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg">
          <p className="font-medium text-sm text-purple-800 mb-2">
            AI Skills Progress:
          </p>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-purple-700">Level:</span>
            <span className="px-2 py-0.5 bg-white rounded text-sm font-medium text-slate-700 border border-purple-200">
              {aiSkills.level.charAt(0).toUpperCase() + aiSkills.level.slice(1)}
            </span>
          </div>
          <p className="text-sm text-purple-600">
            {aiSkills.levelDescription || 'Age-appropriate AI exposure building future-ready skills'}
          </p>
        </div>
      </Card>
    </div>
  );
}

// Resources Tab - Materials list with external links
function ResourcesTab({
  block,
  onLaunch,
  relatedPodAssets,
  isLoadingRelatedPodAssets,
}: {
  block: ScheduleBlock;
  onLaunch?: () => void;
  relatedPodAssets: Artifact[];
  isLoadingRelatedPodAssets: boolean;
}) {
  const materials = block.materials.length > 0 
    ? block.materials 
    : ['Notebook', 'Pencils', 'Tablet'];

  return (
    <div className="space-y-2">
      {materials.map((material, i) => (
        <Card key={i} className="p-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                <Package className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <p className="font-medium text-slate-900">{material}</p>
                <p className="text-xs text-slate-500">Material</p>
              </div>
            </div>
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <ExternalLink className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </Card>
      ))}

      <div className="mt-4 pt-4 border-t border-slate-200">
        <div className="flex items-center gap-2 mb-3">
          <FolderOpen className="w-4 h-4 text-slate-500" />
          <h4 className="font-medium text-sm text-slate-700">Pod Teaching Assets</h4>
        </div>

        {isLoadingRelatedPodAssets ? (
          <Card className="p-4 bg-white border border-slate-200">
            <p className="text-sm text-slate-500">Loading pod teaching assets...</p>
          </Card>
        ) : relatedPodAssets.length > 0 ? (
          <div className="space-y-2">
            {relatedPodAssets.map((asset) => {
              const typeConfig = ARTIFACT_TYPE_CONFIG[asset.type];
              const content = (
                <>
                  <div className="pr-4">
                    <p className="font-medium text-slate-900">
                      {typeConfig.icon} {asset.title}
                    </p>
                    <p className="text-xs uppercase tracking-wide text-slate-400 mt-1">
                      {typeConfig.label}
                      {asset.weekNumber ? ` • week ${asset.weekNumber}` : ' • pod library'}
                    </p>
                    {asset.description ? (
                      <p className="text-sm text-slate-500 mt-1">{asset.description}</p>
                    ) : null}
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
                </>
              );

              return asset.url ? (
                <a
                  key={asset.id}
                  href={asset.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 hover:bg-slate-50"
                >
                  {content}
                </a>
              ) : (
                <div
                  key={asset.id}
                  className="flex items-start justify-between rounded-xl border border-slate-200 bg-white px-4 py-3"
                >
                  {content}
                </div>
              );
            })}
          </div>
        ) : (
          <Card className="p-4 bg-white border border-dashed border-slate-200">
            <p className="text-sm text-slate-500">
              No uploaded pod teaching assets are linked to this session yet.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Learners will see band-matched videos, slide decks, notebooks, and other uploads here when they are attached to this pod week or support asset.
            </p>
          </Card>
        )}
      </div>

      {/* Digital Resources */}
      {block.resources && block.resources.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <h4 className="font-medium text-sm text-slate-700 mb-3">
            Digital Resources
          </h4>
          {block.resources.map((resource, i) => (
            <Card key={i} className="p-4 mb-2 bg-white border border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{resource.icon}</span>
                  <div>
                    <p className="font-medium text-slate-900">{resource.name}</p>
                    <p className="text-xs text-slate-500">{resource.type}</p>
                  </div>
                </div>
                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <ExternalLink className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {(block.sourceLinks?.length || block.launchUrl) && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-sm text-slate-700">Linked Sources & Tools</h4>
            {block.launchUrl && onLaunch && (
              <Button variant="secondary" size="sm" onClick={onLaunch}>
                <ExternalLink className="w-4 h-4 mr-1" />
                Open Tool
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {block.sourceLinks?.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 hover:bg-slate-50"
              >
                <div className="pr-4">
                  <p className="font-medium text-slate-900">{link.title}</p>
                  <p className="text-xs uppercase tracking-wide text-slate-400 mt-1">{link.type}</p>
                  {link.note && <p className="text-sm text-slate-500 mt-1">{link.note}</p>}
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


// Portfolio Tab - Work artifacts and URL sharing
function PortfolioTab({ block, isCompleted }: { block: ScheduleBlock; isCompleted: boolean }) {
  const [urlInput, setUrlInput] = useState('');
  const [urlTitle, setUrlTitle] = useState('');
  const [savedUrls, setSavedUrls] = useState<{ title: string; url: string; type: string }[]>([]);
  const [showUrlForm, setShowUrlForm] = useState(false);

  const handleAddUrl = () => {
    if (urlInput.trim()) {
      const type = detectUrlType(urlInput);
      setSavedUrls([...savedUrls, { 
        title: urlTitle || getDefaultTitle(urlInput), 
        url: urlInput, 
        type 
      }]);
      setUrlInput('');
      setUrlTitle('');
      setShowUrlForm(false);
    }
  };

  const detectUrlType = (url: string): string => {
    if (url.includes('colab.research.google.com')) return 'Colab Notebook';
    if (url.includes('replit.com')) return 'Replit Project';
    if (url.includes('github.com')) return 'GitHub';
    if (url.includes('figma.com')) return 'Figma Design';
    if (url.includes('canva.com')) return 'Canva Design';
    if (url.includes('notion.so')) return 'Notion Doc';
    if (url.includes('docs.google.com')) return 'Google Doc';
    if (url.includes('drive.google.com')) return 'Google Drive';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'Video';
    return 'Link';
  };

  const getDefaultTitle = (url: string): string => {
    try {
      const hostname = new URL(url).hostname.replace('www.', '');
      return `Project on ${hostname}`;
    } catch {
      return 'Project Link';
    }
  };

  const getUrlIcon = (type: string): string => {
    const icons: Record<string, string> = {
      'Colab Notebook': '🔬',
      'Replit Project': '⚡',
      'GitHub': '🐙',
      'Figma Design': '🎨',
      'Canva Design': '🖼️',
      'Notion Doc': '📝',
      'Google Doc': '📄',
      'Google Drive': '📁',
      'Video': '🎬',
      'Link': '🔗',
    };
    return icons[type] || '🔗';
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-white border border-slate-200">
        <h4 className="font-medium text-slate-700 mb-3 flex items-center gap-2">
          <FolderOpen className="w-4 h-4" />
          Work Artifacts
        </h4>
        
        {/* Saved URLs */}
        {savedUrls.length > 0 && (
          <div className="space-y-2 mb-4">
            {savedUrls.map((item, i) => (
              <a
                key={i}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <span className="text-xl">{getUrlIcon(item.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-slate-900 truncate">{item.title}</p>
                  <p className="text-xs text-slate-500 truncate">{item.type}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 flex-shrink-0" />
              </a>
            ))}
          </div>
        )}

        {/* Existing artifacts */}
        {block.artifacts && block.artifacts.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            {block.artifacts.map((artifact, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm font-medium text-slate-900">{artifact}</p>
              </div>
            ))}
          </div>
        )}

        {savedUrls.length === 0 && (!block.artifacts || block.artifacts.length === 0) && !showUrlForm && (
          <div className="text-center py-6">
            <FolderOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500 mb-3">No artifacts yet</p>
            <p className="text-xs text-slate-400">Add your work to build your portfolio</p>
          </div>
        )}

        {/* URL Input Form */}
        {showUrlForm && (
          <div className="p-3 bg-blue-50 rounded-lg mb-4 space-y-3">
            <p className="text-sm font-medium text-blue-700">Add Project Link</p>
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://colab.research.google.com/..."
              className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
            />
            <input
              type="text"
              value={urlTitle}
              onChange={(e) => setUrlTitle(e.target.value)}
              placeholder="Project title (optional)"
              className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
            />
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setShowUrlForm(false)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleAddUrl}>Add to Portfolio</Button>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="grid grid-cols-3 gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowUrlForm(true)}>
            <ExternalLink className="w-4 h-4 mr-1" />
            Add URL
          </Button>
          <Button variant="secondary" size="sm">
            <Camera className="w-4 h-4 mr-1" />
            Photo
          </Button>
          <Button variant="secondary" size="sm">
            <Upload className="w-4 h-4 mr-1" />
            File
          </Button>
        </div>
      </Card>

      {/* Quick Links for Common Platforms */}
      <Card className="p-4 bg-white border border-slate-200">
        <h4 className="font-medium text-slate-700 mb-3">Quick Add from Platform</h4>
        <div className="grid grid-cols-2 gap-2">
          {[
            { name: 'Google Colab', icon: '🔬' },
            { name: 'Replit', icon: '⚡' },
            { name: 'GitHub', icon: '🐙' },
            { name: 'Figma', icon: '🎨' },
          ].map((platform) => (
            <button
              key={platform.name}
              onClick={() => {
                setShowUrlForm(true);
                setUrlTitle(`${platform.name} Project`);
              }}
              className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-left"
            >
              <span className="text-xl">{platform.icon}</span>
              <span className="text-sm text-slate-700">{platform.name}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Completion Status */}
      {isCompleted && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Session Completed</span>
          </div>
          <p className="text-sm text-green-600 mt-1">
            Great work! Your artifacts have been saved to your portfolio.
          </p>
        </Card>
      )}
    </div>
  );
}

// Progress Section - Status, time tracking, notes
function ProgressSection({
  block,
  statusConfig,
  checkedObjectives,
  newNote,
  setNewNote,
  handleAddNote,
}: {
  block: ScheduleBlock;
  statusConfig: { label: string; color: string; bgColor: string; icon: string };
  checkedObjectives: Set<number>;
  newNote: string;
  setNewNote: (note: string) => void;
  handleAddNote: () => void;
}) {
  return (
    <div className="mt-6 pt-4 border-t border-slate-200 space-y-4">
      {/* Status & Progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
            {statusConfig.icon} {statusConfig.label}
          </span>
        </div>
        <div className="text-sm text-slate-500">
          <TrendingUp className="w-4 h-4 inline mr-1" />
          {checkedObjectives.size}/{block.objectives.length} objectives
        </div>
      </div>

      {/* Notes */}
      <Card className="p-4 bg-white border border-slate-200">
        <h4 className="font-medium text-slate-700 mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Session Notes
        </h4>
        {block.notes ? (
          <div className="p-3 bg-slate-50 rounded-lg text-sm whitespace-pre-wrap mb-3 text-slate-700">
            {block.notes}
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic mb-3">No notes yet</p>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a note..."
            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
            onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
          />
          <Button variant="secondary" size="sm" onClick={handleAddNote}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default BlockDetailsModal;
