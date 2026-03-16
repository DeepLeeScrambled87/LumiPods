import React, { useEffect, useRef, useState } from 'react';
import {
  Bot,
  BookOpen,
  Code2,
  FlaskConical,
  Globe,
  HelpCircle,
  Lightbulb,
  Maximize2,
  Mic,
  MicOff,
  Minimize2,
  RefreshCw,
  Send,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/cn';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { useAuth } from '../auth/AuthContext';
import { useFamily } from '../family';
import { curriculumService } from '../../services/curriculumService';
import { learningPersonalizationService } from '../../services/learningPersonalizationService';
import {
  AI_CONFIG_EVENT,
  canUseSpeechOutput,
  createSpeechStream,
  configureSpeech,
  getSpeechConfig,
  speakText,
  stopSpeaking,
  streamChat,
  type ChatMessage,
  type TutorMode,
} from '../../services/llmService';
import { getSkillLevel } from '../../types/skillLevel';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  feedback?: 'positive' | 'negative';
  speechHandled?: boolean;
}

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

type SpeechRecognitionResultLike = ArrayLike<SpeechRecognitionAlternativeLike>;

interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

interface WindowWithSpeechRecognition extends Window {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

const TUTOR_MODES: Record<TutorMode, { label: string; icon: React.ReactNode; description: string }> = {
  helper: { label: 'Guide', icon: <HelpCircle className="h-4 w-4" />, description: 'Direct answers and guidance' },
  socratic: { label: 'Socrates', icon: <Lightbulb className="h-4 w-4" />, description: 'Questions to help you think' },
  encourager: { label: 'Coach', icon: <Sparkles className="h-4 w-4" />, description: 'Motivation and support' },
  explainer: { label: 'Explainer', icon: <BookOpen className="h-4 w-4" />, description: 'Detailed explanations' },
  scientist: { label: 'Curie', icon: <FlaskConical className="h-4 w-4" />, description: 'Evidence, experiments, and scientific thinking' },
  maker: { label: 'Ada', icon: <Code2 className="h-4 w-4" />, description: 'Build, code, prototype, and debug' },
  french: { label: 'Français', icon: <Globe className="h-4 w-4" />, description: 'Practice French conversation with Lumi' },
};

const QUICK_PROMPTS = {
  learner: [
    "I'm stuck on this problem",
    "Can you explain this differently?",
    'Give me a hint',
    'Teach me French! 🇫🇷',
    'What should I do next?',
  ],
  parent: [
    'How is my child progressing?',
    'Suggest activities for this topic',
    'French learning tips',
    'What resources do you recommend?',
    'Tips for keeping them motivated',
  ],
  french: [
    'Phrase du jour',
    'Comment dit-on...?',
    'Practice colors',
    'Count to 20',
    'Basic greetings',
  ],
  scientist: [
    'Help me test an idea',
    'What should I observe?',
    'Turn this into an experiment',
    'What evidence do I need?',
  ],
  maker: [
    'Turn this into a project',
    'Help me debug this',
    'What can I build with this?',
    'Give me a prototype idea',
  ],
};

interface AITutorProps {
  isOpen?: boolean;
  onClose?: () => void;
  onMinimize?: () => void;
  isFullPage?: boolean;
}

const getSpeechLanguage = (mode: TutorMode): string => (mode === 'french' ? 'fr-FR' : 'en-US');

const getModeIntro = (mode: TutorMode): Pick<Message, 'content' | 'suggestions'> | null => {
  switch (mode) {
    case 'socratic':
      return {
        content:
          'Socrates mode is on.\n\nI will guide with questions so you can reason your way to the answer. Start by telling me what you already notice.',
        suggestions: ['What do I know already?', 'Ask me a guiding question', 'Help me reason this out'],
      };
    case 'scientist':
      return {
        content:
          'Curie mode is on.\n\nWe will work like scientists: observe, predict, test, compare, and explain with evidence.',
        suggestions: QUICK_PROMPTS.scientist.slice(0, 4),
      };
    case 'maker':
      return {
        content:
          'Ada mode is on.\n\nWe will turn ideas into systems, builds, code, and prototypes. Expect lots of iteration and debugging.',
        suggestions: QUICK_PROMPTS.maker.slice(0, 4),
      };
    case 'french':
      return {
        content:
          '🇫🇷 Mode Français activé!\n\nBonjour! Je suis Lumi, ton professeur de français.\n\n**Phrase du jour:**\n🇫🇷 "Je suis prêt(e) à apprendre!"\n🔊 "zhuh swee PREH(t) ah ah-prahn-druh"\n🇬🇧 "I\'m ready to learn!"\n\nEssaie de le dire à voix haute une fois, puis réponds-moi avec une petite phrase en français. Si tu fais une petite erreur, je t’aiderai doucement à l’améliorer.',
        suggestions: ['Let me try saying it', ...QUICK_PROMPTS.french.slice(0, 3)],
      };
    default:
      return null;
  }
};

const getQuickPromptsForMode = (mode: TutorMode, isLearner: boolean): string[] => {
  if (mode === 'french') return QUICK_PROMPTS.french;
  if (mode === 'scientist') return QUICK_PROMPTS.scientist;
  if (mode === 'maker') return QUICK_PROMPTS.maker;
  return isLearner ? QUICK_PROMPTS.learner : QUICK_PROMPTS.parent;
};

export const AITutor: React.FC<AITutorProps> = ({
  isOpen = true,
  onClose,
  onMinimize,
  isFullPage = false,
}) => {
  const { user, isLearner } = useAuth();
  const { family, getLearner } = useFamily();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [tutorMode, setTutorMode] = useState<TutorMode>('helper');
  const [isExpanded, setIsExpanded] = useState(isFullPage);
  const [speechRepliesEnabled, setSpeechRepliesEnabled] = useState(getSpeechConfig().autoSpeakReplies);
  const [speechProviderLabel, setSpeechProviderLabel] = useState(getSpeechConfig().provider);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const lastSpokenMessageIdRef = useRef<string | null>(null);
  const messagesLengthRef = useRef(0);

  const currentLearner = user?.learnerId ? getLearner(user.learnerId) : null;
  const activePodPlan = family ? curriculumService.getActivePod(family.id) : null;
  const activeWeekNumber = activePodPlan?.weekNumber || family?.currentWeek || 1;
  const activeCurriculum = activePodPlan?.podId
    ? curriculumService.getCurriculum(activePodPlan.podId)
    : undefined;
  const tutorTopics = [
    activeCurriculum?.podTitle,
    activePodPlan?.podId
      ? curriculumService.getWeekCurriculum(activePodPlan.podId, activeWeekNumber)?.title
      : undefined,
  ].filter(Boolean) as string[];
  const tutorCanonicalSnippets =
    activePodPlan?.podId && currentLearner
      ? learningPersonalizationService.getCanonicalLessonSnippets(
          activePodPlan.podId,
          activeWeekNumber,
          currentLearner.skillLevel
        )
      : [];
  const learnerInterests = learningPersonalizationService.getLearnerInterests(currentLearner);
  const learnerProfileSummary = learningPersonalizationService.buildStudentProfileSummary(
    currentLearner
  );
  const learnerBand = currentLearner ? getSkillLevel(currentLearner.skillLevel).ageRange : undefined;
  const speechWindow =
    typeof window !== 'undefined' ? (window as WindowWithSpeechRecognition) : undefined;
  const supportsSpeechOutput = canUseSpeechOutput();
  const supportsSpeechRecognition =
    Boolean(speechWindow?.SpeechRecognition || speechWindow?.webkitSpeechRecognition);

  useEffect(() => {
    const syncSpeechSettings = () => {
      const config = getSpeechConfig();
      setSpeechRepliesEnabled(config.autoSpeakReplies);
      setSpeechProviderLabel(config.provider);
    };

    syncSpeechSettings();

    if (typeof window === 'undefined') {
      return;
    }

    const handleConfigChange = () => {
      syncSpeechSettings();
    };

    window.addEventListener(AI_CONFIG_EVENT, handleConfigChange);
    return () => {
      window.removeEventListener(AI_CONFIG_EVENT, handleConfigChange);
    };
  }, []);

  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: isLearner
          ? `Hi ${currentLearner?.name || 'there'}! 👋 I'm Lumi, your learning buddy!\n\nI can help you with:\n• 📚 Any subject questions\n• 🇫🇷 Learning French conversation and pronunciation\n• 💡 Hints when you're stuck\n• 🌟 Encouragement along the way\n• 🔬 Scientific thinking and build ideas\n\nWhat would you like to explore today?`
          : `Hello! I'm Lumi, your family's AI learning assistant. 🚀\n\nI can help with:\n• Curriculum questions & activity ideas\n• French language learning for the whole family\n• Progress tracking & motivation tips\n• Resource recommendations\n• Project, science, and build coaching\n\nHow can I help today?`,
        timestamp: new Date(),
        suggestions: getQuickPromptsForMode(tutorMode, isLearner).slice(0, 3),
      };
      setMessages([welcomeMessage]);
    }
  }, [currentLearner, isLearner, messages.length, tutorMode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    messagesLengthRef.current = messages.length;
  }, [messages.length]);

  useEffect(() => {
    if (messagesLengthRef.current === 0) {
      return;
    }

    const intro = getModeIntro(tutorMode);
    if (!intro) {
      return;
    }

    const modeIntro: Message = {
      id: `${tutorMode}-intro-${Date.now()}`,
      role: 'assistant',
      content: intro.content,
      timestamp: new Date(),
      suggestions: intro.suggestions,
    };
    setMessages((prev) => [...prev, modeIntro]);
  }, [tutorMode]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop?.();
      stopSpeaking();
    };
  }, []);

  useEffect(() => {
    if (!speechRepliesEnabled || !supportsSpeechOutput || messages.length === 0) {
      return;
    }

    const latestAssistantMessage = [...messages]
      .reverse()
      .find((message) => message.role === 'assistant');

    if (
      !latestAssistantMessage ||
      latestAssistantMessage.speechHandled ||
      lastSpokenMessageIdRef.current === latestAssistantMessage.id
    ) {
      return;
    }

    lastSpokenMessageIdRef.current = latestAssistantMessage.id;
    void speakText(latestAssistantMessage.content, {
      language: getSpeechLanguage(tutorMode),
    }).catch((error) => {
      console.warn('Speech playback failed:', error);
    });
  }, [messages, speechRepliesEnabled, supportsSpeechOutput, tutorMode]);

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const chatHistory: ChatMessage[] = messages
      .filter((message) => message.role !== 'system')
      .slice(-10)
      .map((message) => ({
        role: message.role as 'user' | 'assistant',
        content: message.content,
      }));

    chatHistory.push({ role: 'user', content: messageText });

    const suggestions =
      tutorMode === 'french'
        ? ['More vocabulary', 'Practice pronunciation', 'Tell me a story in French', 'Quiz me!']
        : tutorMode === 'scientist'
          ? ['What is my hypothesis?', 'How can I test this?', 'What pattern do you see?', 'What evidence matters?']
          : tutorMode === 'maker'
            ? ['Give me version one', 'How should I debug this?', 'What can I build next?', 'How do I improve it?']
            : isLearner
              ? ['Tell me more', 'I understand!', 'Can you give an example?', "What's next?"]
              : ['How can I reinforce this?', 'What activities help?', 'More resources'];

    const assistantMessageId = `msg-${Date.now()}-response`;
    const assistantTimestamp = new Date();
    const shouldStreamSpeech = speechRepliesEnabled && supportsSpeechOutput;
    const speechStream = shouldStreamSpeech
      ? createSpeechStream({
          language: getSpeechLanguage(tutorMode),
        })
      : null;
    let hasRenderedAssistantMessage = false;

    try {
      const response = await streamChat(chatHistory, {
        mode: tutorMode,
        language: tutorMode === 'french' ? 'fr' : 'en',
        learnerAge: currentLearner?.age,
        learnerInterests,
        currentTopics: tutorTopics,
        canonicalSnippets: tutorCanonicalSnippets,
        skillBand: learnerBand,
        studentProfileSummary: learnerProfileSummary,
        personaName:
          tutorMode === 'socratic'
            ? 'Socrates'
            : tutorMode === 'scientist'
              ? 'Marie Curie'
              : tutorMode === 'maker'
                ? 'Ada Lovelace'
                : tutorMode === 'french'
                  ? 'a warm French conversation guide'
                  : undefined,
      }, {
        onText: (chunk, fullContent) => {
          if (!chunk) {
            return;
          }

          if (!hasRenderedAssistantMessage) {
            hasRenderedAssistantMessage = true;
            setIsTyping(false);
            setMessages((prev) => [
              ...prev,
              {
                id: assistantMessageId,
                role: 'assistant',
                content: fullContent,
                timestamp: assistantTimestamp,
                suggestions,
                speechHandled: shouldStreamSpeech,
              },
            ]);
          } else {
            setMessages((prev) =>
              prev.map((message) =>
                message.id === assistantMessageId
                  ? {
                      ...message,
                      content: fullContent,
                      speechHandled: shouldStreamSpeech,
                    }
                  : message
              )
            );
          }

          speechStream?.pushText(chunk);
        },
      });

      if (!hasRenderedAssistantMessage) {
        setMessages((prev) => [
          ...prev,
          {
            id: assistantMessageId,
            role: 'assistant',
            content: response.content,
            timestamp: assistantTimestamp,
            suggestions,
            speechHandled: shouldStreamSpeech,
          },
        ]);
      } else {
        setMessages((prev) =>
          prev.map((message) =>
            message.id === assistantMessageId
              ? {
                  ...message,
                  content: response.content,
                  suggestions,
                  speechHandled: shouldStreamSpeech,
                }
              : message
          )
        );
      }

      if (shouldStreamSpeech) {
        lastSpokenMessageIdRef.current = assistantMessageId;
        void speechStream?.finish().catch((error) => {
          console.warn('Streaming speech playback failed:', error);
        });
      }
    } catch (error) {
      speechStream?.cancel();
      console.error('AI response error:', error);
      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: 'Oops! I had a little hiccup. Let me try again. Could you rephrase your question?',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFeedback = (messageId: string, feedback: 'positive' | 'negative') => {
    setMessages((prev) =>
      prev.map((message) => (message.id === messageId ? { ...message, feedback } : message))
    );
  };

  const handleReset = () => {
    setMessages([]);
    stopSpeaking();
  };

  const handleSpeakMessage = (content: string) => {
    if (!supportsSpeechOutput) {
      return;
    }

    void speakText(content, {
      language: getSpeechLanguage(tutorMode),
    }).catch((error) => {
      console.warn('Speech playback failed:', error);
    });
  };

  const handleToggleListening = () => {
    if (!supportsSpeechRecognition || typeof window === 'undefined') {
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop?.();
      setIsListening(false);
      return;
    }

    const RecognitionCtor = speechWindow?.SpeechRecognition || speechWindow?.webkitSpeechRecognition;
    if (!RecognitionCtor) {
      return;
    }

    const recognition = new RecognitionCtor();
    recognition.lang = getSpeechLanguage(tutorMode);
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      const transcript = Array.from(event.results || [])
        .map((result) => result[0]?.transcript || '')
        .join(' ')
        .trim();

      if (transcript) {
        setInput(transcript);
      }
    };
    recognition.onend = () => {
      setIsListening(false);
    };
    recognition.onerror = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  if (!isOpen) return null;

  const containerClass =
    isExpanded || isFullPage
      ? 'fixed inset-0 z-50 bg-white'
      : 'fixed bottom-4 right-4 z-50 h-[600px] w-96 rounded-2xl border border-slate-200 bg-white shadow-2xl';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className={containerClass}
    >
      <div className="flex h-full flex-col">
        <div
          className={cn(
            'flex items-center justify-between border-b border-slate-200 p-4 text-white',
            tutorMode === 'french'
              ? 'bg-gradient-to-r from-blue-600 via-white to-red-500'
              : 'bg-gradient-to-r from-indigo-500 to-purple-600',
            !isFullPage && 'rounded-t-2xl'
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full',
                tutorMode === 'french' ? 'bg-blue-600' : 'bg-white/20'
              )}
            >
              {tutorMode === 'french' ? '🇫🇷' : <Bot className="h-6 w-6" />}
            </div>
            <div>
              <h2 className={cn('font-semibold', tutorMode === 'french' && 'text-blue-900')}>
                Lumi {tutorMode === 'french' && '• Français'}
              </h2>
              <p className={cn('text-xs', tutorMode === 'french' ? 'text-blue-700' : 'text-white/80')}>
                {tutorMode === 'french'
                  ? 'Ton professeur de français'
                  : TUTOR_MODES[tutorMode].description}
              </p>
              <p className={cn('text-[11px]', tutorMode === 'french' ? 'text-blue-700/90' : 'text-white/70')}>
                Voice: {speechProviderLabel}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isFullPage && onClose && (
              <Button
                variant="secondary"
                size="sm"
                className={cn(
                  'border-white/20 bg-white/10 text-white hover:bg-white/20',
                  tutorMode === 'french' && 'border-blue-200 bg-white text-blue-900 hover:bg-blue-100'
                )}
                onClick={onClose}
              >
                Exit Lumi
              </Button>
            )}
            <button
              onClick={handleReset}
              className={cn(
                'rounded-lg p-2 transition-colors',
                tutorMode === 'french' ? 'text-blue-900 hover:bg-blue-100' : 'hover:bg-white/20'
              )}
              title="New conversation"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            {supportsSpeechOutput && (
              <button
                onClick={() => {
                  setSpeechRepliesEnabled((current) => {
                    const nextValue = !current;
                    if (!nextValue) {
                      stopSpeaking();
                    }
                    configureSpeech({ autoSpeakReplies: nextValue });
                    return nextValue;
                  });
                }}
                className={cn(
                  'rounded-lg p-2 transition-colors',
                  tutorMode === 'french' ? 'text-blue-900 hover:bg-blue-100' : 'hover:bg-white/20'
                )}
                title={speechRepliesEnabled ? 'Mute spoken replies' : 'Speak replies aloud'}
              >
                {speechRepliesEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>
            )}
            {!isFullPage && onMinimize && (
              <button
                onClick={onMinimize}
                className={cn(
                  'rounded-lg p-2 transition-colors',
                  tutorMode === 'french' ? 'text-blue-900 hover:bg-blue-100' : 'hover:bg-white/20'
                )}
                title="Minimize"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
            )}
            {!isFullPage && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={cn(
                  'rounded-lg p-2 transition-colors',
                  tutorMode === 'french' ? 'text-blue-900 hover:bg-blue-100' : 'hover:bg-white/20'
                )}
                title={isExpanded ? 'Return to popup size' : 'Expand'}
              >
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
            )}
            {onClose && !isFullPage && (
              <button
                onClick={onClose}
                className={cn(
                  'rounded-lg p-2 transition-colors',
                  tutorMode === 'french' ? 'text-blue-900 hover:bg-blue-100' : 'hover:bg-white/20'
                )}
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto border-b border-slate-100 bg-slate-50 p-2">
          {(Object.entries(TUTOR_MODES) as [TutorMode, (typeof TUTOR_MODES)[TutorMode]][]).map(
            ([key, config]) => (
              <button
                key={key}
                onClick={() => setTutorMode(key)}
                className={cn(
                  'flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                  tutorMode === key
                    ? key === 'french'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-indigo-100 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-100'
                )}
                title={config.description}
              >
                {config.icon}
                {config.label}
              </button>
            )
          )}
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn('flex gap-3', message.role === 'user' ? 'flex-row-reverse' : '')}
            >
              {message.role === 'assistant' && (
                <div
                  className={cn(
                    'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full',
                    tutorMode === 'french'
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                      : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                  )}
                >
                  {tutorMode === 'french' ? (
                    <span className="text-sm">🇫🇷</span>
                  ) : (
                    <Bot className="h-4 w-4 text-white" />
                  )}
                </div>
              )}
              {message.role === 'user' && (
                <Avatar emoji={currentLearner?.avatar || user?.avatar || '👤'} size="sm" />
              )}
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-3',
                  message.role === 'user'
                    ? 'rounded-tr-sm bg-indigo-600 text-white'
                    : 'rounded-tl-sm bg-slate-100 text-slate-900'
                )}
              >
                <p className="whitespace-pre-wrap text-sm">{message.content}</p>

                {message.suggestions && message.role === 'assistant' && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSend(suggestion)}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 transition-colors hover:bg-slate-50"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                {message.role === 'assistant' &&
                  message.id !== 'welcome' &&
                  !message.id.includes('-intro-') && (
                    <div className="mt-2 flex items-center gap-2 border-t border-slate-200 pt-2">
                      <span className="text-xs text-slate-400">Helpful?</span>
                      {supportsSpeechOutput && (
                        <button
                          onClick={() => handleSpeakMessage(message.content)}
                          className="rounded p-1 text-slate-400 transition-colors hover:text-indigo-600"
                          title="Read aloud"
                        >
                          <Volume2 className="h-3 w-3" />
                        </button>
                      )}
                      <button
                        onClick={() => handleFeedback(message.id, 'positive')}
                        className={cn(
                          'rounded p-1 transition-colors',
                          message.feedback === 'positive'
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'text-slate-400 hover:text-emerald-600'
                        )}
                      >
                        <ThumbsUp className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleFeedback(message.id, 'negative')}
                        className={cn(
                          'rounded p-1 transition-colors',
                          message.feedback === 'negative'
                            ? 'bg-red-50 text-red-600'
                            : 'text-slate-400 hover:text-red-600'
                        )}
                      >
                        <ThumbsDown className="h-3 w-3" />
                      </button>
                    </div>
                  )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full',
                  tutorMode === 'french'
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                    : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                )}
              >
                {tutorMode === 'french' ? (
                  <span className="text-sm">🇫🇷</span>
                ) : (
                  <Bot className="h-4 w-4 text-white" />
                )}
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-slate-100 bg-slate-50 px-4 py-2">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {getQuickPromptsForMode(tutorMode, isLearner).map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleSend(prompt)}
                className={cn(
                  'whitespace-nowrap rounded-full border bg-white px-3 py-1.5 text-xs transition-colors',
                  tutorMode === 'french'
                    ? 'border-blue-200 text-blue-600 hover:border-blue-300 hover:bg-blue-50'
                    : 'border-slate-200 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600'
                )}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-200 p-4">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={
                tutorMode === 'french'
                  ? 'Pose ta question en français ou anglais...'
                  : 'Ask Lumi anything...'
              }
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isTyping}
            />
            {supportsSpeechRecognition && (
              <Button
                type="button"
                variant="secondary"
                onClick={handleToggleListening}
                disabled={isTyping}
                icon={isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              >
                {isListening ? 'Stop' : 'Speak'}
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              disabled={!input.trim() || isTyping}
              icon={<Send className="h-4 w-4" />}
            >
              Send
            </Button>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default AITutor;
