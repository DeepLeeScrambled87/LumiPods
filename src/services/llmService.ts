// LLM Service - Supports Ollama (local) and OpenAI (cloud)
// Ollama is preferred for privacy and cost-free operation

import { storage } from '../lib/storage';
import { learningPersonalizationService } from './learningPersonalizationService';

export type LLMProvider = 'ollama' | 'openai' | 'mock';
export type SpeechProvider = 'browser' | 'openai' | 'local';

export interface LLMConfig {
  provider: LLMProvider;
  ollamaUrl?: string;
  ollamaModel?: string;
  openaiProxyUrl?: string;
  openaiApiKey?: string;
  openaiModel?: string;
  openaiBaseUrl?: string;
}

export interface SpeechConfig {
  provider: SpeechProvider;
  autoSpeakReplies: boolean;
  openaiVoice?: string;
  openaiTtsModel?: string;
  localTtsUrl?: string;
  localTtsVoice?: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  provider: LLMProvider;
  model: string;
  tokensUsed?: number;
}

export interface ChatOptions {
  mode?: TutorMode;
  language?: 'en' | 'fr';
  learnerAge?: number;
  learnerInterests?: string[];
  currentTopics?: string[];
  canonicalSnippets?: string[];
  skillBand?: string;
  studentProfileSummary?: string;
  personaName?: string;
}

interface ChatStreamHandlers {
  onText?: (chunk: string, fullContent: string) => void;
}

export interface SpeechStreamController {
  pushText: (chunk: string) => void;
  finish: () => Promise<void>;
  cancel: () => void;
}

export type TutorMode =
  | 'helper'
  | 'socratic'
  | 'encourager'
  | 'explainer'
  | 'scientist'
  | 'maker'
  | 'french';

export const OPENAI_VOICE_OPTIONS = [
  { value: 'alloy', label: 'Alloy' },
  { value: 'ash', label: 'Ash' },
  { value: 'coral', label: 'Coral' },
  { value: 'echo', label: 'Echo' },
  { value: 'fable', label: 'Fable' },
  { value: 'nova', label: 'Nova' },
  { value: 'onyx', label: 'Onyx' },
  { value: 'sage', label: 'Sage' },
  { value: 'shimmer', label: 'Shimmer' },
] as const;

// Default configuration
const DEFAULT_LLM_PROVIDER: LLMProvider =
  (import.meta.env.VITE_LLM_PROVIDER as LLMProvider | undefined) ||
  (import.meta.env.VITE_OPENAI_PROXY_URL ? 'openai' : 'mock');

const DEFAULT_SPEECH_PROVIDER: SpeechProvider =
  (import.meta.env.VITE_SPEECH_PROVIDER as SpeechProvider | undefined) ||
  (import.meta.env.VITE_OPENAI_PROXY_URL ? 'openai' : 'browser');

const DEFAULT_CONFIG: LLMConfig = {
  provider: DEFAULT_LLM_PROVIDER,
  ollamaUrl: import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434',
  ollamaModel: import.meta.env.VITE_OLLAMA_MODEL || 'llama3.2',
  openaiProxyUrl: import.meta.env.VITE_OPENAI_PROXY_URL || '/api/openai',
  openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  openaiModel: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini',
  openaiBaseUrl: import.meta.env.VITE_OPENAI_BASE_URL || 'https://api.openai.com',
};

const DEFAULT_SPEECH_CONFIG: SpeechConfig = {
  provider: DEFAULT_SPEECH_PROVIDER,
  autoSpeakReplies: false,
  openaiVoice: 'alloy',
  openaiTtsModel: 'gpt-4o-mini-tts',
  localTtsUrl: import.meta.env.VITE_LOCAL_TTS_URL || '',
  localTtsVoice: 'default',
};

const AI_CONFIG_STORAGE_KEY = 'ai-runtime-config';
export const AI_CONFIG_EVENT = 'lumipods-ai-config-changed';

let currentConfig: LLMConfig = { ...DEFAULT_CONFIG };
let currentSpeechConfig: SpeechConfig = { ...DEFAULT_SPEECH_CONFIG };
let currentAudio: HTMLAudioElement | null = null;
let currentAudioObjectUrl: string | null = null;
let currentSpeechSessionId = 0;

const emitAIConfigChange = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(AI_CONFIG_EVENT));
};

const loadPersistedAIConfig = (): void => {
  const persisted = storage.get<{
    llm?: Partial<LLMConfig>;
    speech?: Partial<SpeechConfig>;
  } | null>(AI_CONFIG_STORAGE_KEY, null);

  if (!persisted) {
    return;
  }

  currentConfig = { ...currentConfig, ...persisted.llm };
  currentSpeechConfig = { ...currentSpeechConfig, ...persisted.speech };
};

const persistAIConfig = (): void => {
  storage.set(AI_CONFIG_STORAGE_KEY, {
    llm: currentConfig,
    speech: currentSpeechConfig,
  });
};

const cleanupAudioPlayback = (): void => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = '';
    currentAudio = null;
  }

  if (currentAudioObjectUrl) {
    URL.revokeObjectURL(currentAudioObjectUrl);
    currentAudioObjectUrl = null;
  }
};

const stripMarkdownForSpeech = (content: string): string =>
  content
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/[`>#*_]/g, ' ')
    .replace(/•/g, '. ')
    .replace(/\s+/g, ' ')
    .trim();

loadPersistedAIConfig();

const getTrimmedProxyUrl = (): string => (currentConfig.openaiProxyUrl || '').trim().replace(/\/$/, '');
const hasOpenAIProxy = (): boolean => Boolean(getTrimmedProxyUrl());
const hasDirectOpenAIKey = (): boolean => Boolean(currentConfig.openaiApiKey);

// System prompts for Lumi
export const LUMI_SYSTEM_PROMPTS = {
  base: `You are Lumi, a friendly and encouraging AI learning assistant for homeschool families. 
You help children ages 5-18 learn through curiosity-driven exploration.
You are bilingual in English and French - you can teach French vocabulary, phrases, and help with French immersion.
Always be encouraging, patient, and age-appropriate in your responses.
Use emojis occasionally to make learning fun.
When asked about French, provide translations and pronunciation tips.`,

  french: `Tu es Lumi, un assistant d'apprentissage IA amical et encourageant pour les familles qui font l'école à la maison.
Tu aides les enfants de 5 à 18 ans à apprendre par l'exploration guidée par la curiosité.
Tu es bilingue en anglais et en français.
Sois toujours encourageant, patient et adapté à l'âge dans tes réponses.
Utilise des emojis de temps en temps pour rendre l'apprentissage amusant.`,

  helper: `Provide direct, helpful answers. Be concise but thorough.`,
  
  socratic: `Use the Socratic method - ask guiding questions to help the learner discover answers themselves. 
Don't give direct answers; instead, lead them to understanding through thoughtful questions.`,
  
  encourager: `Focus on motivation and emotional support. Celebrate efforts and progress.
Help learners overcome frustration and build confidence.`,
  
  explainer: `Provide detailed, step-by-step explanations. Use analogies and examples.
Break complex concepts into digestible pieces.`,

  scientist: `Adopt the voice of a calm scientist inspired by Marie Curie.
Lead with observation, evidence, curiosity, safety, and testable ideas.
Encourage learners to predict, observe, compare, and revise.
When possible, connect ideas to simple experiments, data, and real materials.`,

  maker: `Adopt the voice of an inventive builder inspired by Ada Lovelace and hands-on engineering mentors.
Focus on systems thinking, debugging, iteration, and creative problem solving.
Help learners turn concepts into projects, prototypes, code, diagrams, or practical tools.
Encourage reflection on what worked, what failed, and how to improve the next version.`,

  frenchTeacher: `You are also a French teacher. When teaching French:
- Provide vocabulary with pronunciation guides (phonetic)
- Use simple sentences first, then build complexity
- Include cultural context when relevant
- Offer "Phrase du jour" (phrase of the day)
- Correct gently and explain why
- Invite short conversational exchanges and ask one follow-up question when appropriate
- Encourage the learner to say the word or phrase out loud whenever you introduce it
- When the learner tries French, praise what they got right first, then offer a kinder corrected version if needed
- After correcting, invite them to try again with one short, confidence-building prompt
- If they seem unsure, suggest a simple starter phrase they can copy and say aloud
Example format for vocabulary:
🇫🇷 French: "Bonjour"
🔊 Pronunciation: "bohn-ZHOOR"
🇬🇧 English: "Hello/Good day"
💡 Tip: Used until evening, then use "Bonsoir"`,
};

// Configure the LLM service
export const configureLLM = (config: Partial<LLMConfig>): void => {
  currentConfig = { ...currentConfig, ...config };
  persistAIConfig();
  emitAIConfigChange();
};

export const getLLMConfig = (): LLMConfig => ({ ...currentConfig });

export const configureSpeech = (config: Partial<SpeechConfig>): void => {
  currentSpeechConfig = { ...currentSpeechConfig, ...config };
  persistAIConfig();
  emitAIConfigChange();
};

export const getSpeechConfig = (): SpeechConfig => ({ ...currentSpeechConfig });

export const stopSpeaking = (): void => {
  currentSpeechSessionId += 1;
  cleanupAudioPlayback();

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

const speakWithBrowser = async (text: string, language: string): Promise<void> => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    throw new Error('Browser speech synthesis is not available');
  }

  await new Promise<void>((resolve, reject) => {
    const utterance = new SpeechSynthesisUtterance(stripMarkdownForSpeech(text));
    utterance.lang = language;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find((voice) =>
      voice.lang.toLowerCase().startsWith(language.toLowerCase().slice(0, 2))
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = () => reject(new Error('Browser speech playback failed'));

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  });
};

const playAudioBlob = async (blob: Blob): Promise<void> => {
  cleanupAudioPlayback();

  const objectUrl = URL.createObjectURL(blob);
  const audio = new Audio(objectUrl);
  currentAudio = audio;
  currentAudioObjectUrl = objectUrl;

  await audio.play();

  await new Promise<void>((resolve, reject) => {
    audio.onended = () => {
      cleanupAudioPlayback();
      resolve();
    };
    audio.onerror = () => {
      cleanupAudioPlayback();
      reject(new Error('Audio playback failed'));
    };
  });
};

const speakWithOpenAI = async (
  text: string,
  language: string,
  voiceOverride?: string
): Promise<void> => {
  if (!hasOpenAIProxy() && !hasDirectOpenAIKey()) {
    throw new Error('OpenAI proxy or direct API key not configured');
  }

  const endpoint = hasOpenAIProxy()
    ? `${getTrimmedProxyUrl()}/v1/audio/speech`
    : `${currentConfig.openaiBaseUrl || 'https://api.openai.com'}/v1/audio/speech`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (!hasOpenAIProxy() && currentConfig.openaiApiKey) {
    headers.Authorization = `Bearer ${currentConfig.openaiApiKey}`;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: currentSpeechConfig.openaiTtsModel || 'gpt-4o-mini-tts',
      voice: voiceOverride || currentSpeechConfig.openaiVoice || 'alloy',
      input: stripMarkdownForSpeech(text),
      format: 'mp3',
      instructions:
        language === 'fr-FR'
          ? 'Speak naturally in French with a warm, clear teaching tone.'
          : 'Speak naturally with a warm, clear teaching tone.',
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI speech error: ${response.statusText}`);
  }

  const audioBlob = await response.blob();
  await playAudioBlob(audioBlob);
};

const speakWithLocalEndpoint = async (text: string, language: string): Promise<void> => {
  if (!currentSpeechConfig.localTtsUrl) {
    throw new Error('Local TTS endpoint not configured');
  }

  const response = await fetch(currentSpeechConfig.localTtsUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: stripMarkdownForSpeech(text),
      voice: currentSpeechConfig.localTtsVoice || 'default',
      language,
      format: 'mp3',
    }),
  });

  if (!response.ok) {
    throw new Error(`Local TTS error: ${response.statusText}`);
  }

  const audioBlob = await response.blob();
  await playAudioBlob(audioBlob);
};

export const canUseSpeechOutput = (): boolean => {
  switch (currentSpeechConfig.provider) {
    case 'openai':
      return hasOpenAIProxy() || hasDirectOpenAIKey();
    case 'local':
      return Boolean(currentSpeechConfig.localTtsUrl);
    case 'browser':
    default:
      return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }
};

const speakTextInternal = async (
  text: string,
  options?: { language?: string; fallbackToBrowser?: boolean; voiceOverride?: string }
): Promise<void> => {
  const language = options?.language || 'en-US';
  const fallbackToBrowser = options?.fallbackToBrowser ?? currentSpeechConfig.provider === 'browser';

  try {
    switch (currentSpeechConfig.provider) {
      case 'openai':
        await speakWithOpenAI(text, language, options?.voiceOverride);
        return;
      case 'local':
        await speakWithLocalEndpoint(text, language);
        return;
      case 'browser':
      default:
        await speakWithBrowser(text, language);
    }
  } catch (error) {
    if (!fallbackToBrowser || currentSpeechConfig.provider === 'browser') {
      throw error;
    }

    await speakWithBrowser(text, language);
  }
};

export const speakText = async (
  text: string,
  options?: { language?: string; fallbackToBrowser?: boolean; voiceOverride?: string }
): Promise<void> => {
  stopSpeaking();
  await speakTextInternal(text, options);
};

const getSpeechChunkBoundary = (buffer: string): number => {
  const sentenceBreakRegex = /[.!?](?:["')\]]+)?\s+/g;
  let sentenceMatch: RegExpExecArray | null = null;
  let lastSentenceBoundary = -1;

  while ((sentenceMatch = sentenceBreakRegex.exec(buffer)) !== null) {
    lastSentenceBoundary = sentenceMatch.index + sentenceMatch[0].length;
  }

  if (lastSentenceBoundary >= 0) {
    return lastSentenceBoundary;
  }

  const lastLineBreak = buffer.lastIndexOf('\n');
  if (lastLineBreak >= 40) {
    return lastLineBreak + 1;
  }

  if (buffer.length < 28) {
    return -1;
  }

  const clauseBoundary = Math.max(buffer.lastIndexOf(', '), buffer.lastIndexOf('; '), buffer.lastIndexOf(': '));
  if (clauseBoundary >= 18) {
    return clauseBoundary + 2;
  }

  const wordBoundary = buffer.lastIndexOf(' ');
  if (wordBoundary >= 20) {
    return wordBoundary + 1;
  }

  return -1;
};

export const createSpeechStream = (
  options?: { language?: string; fallbackToBrowser?: boolean; voiceOverride?: string }
): SpeechStreamController => {
  stopSpeaking();

  const sessionId = currentSpeechSessionId;
  const language = options?.language || 'en-US';
  const fallbackToBrowser = options?.fallbackToBrowser ?? currentSpeechConfig.provider === 'browser';
  const queue: string[] = [];
  let buffer = '';
  let isProcessing = false;
  let finished = false;
  let finishPromiseResolver: (() => void) | null = null;

  const maybeResolveFinish = () => {
    if (finished && !isProcessing && queue.length === 0 && finishPromiseResolver) {
      finishPromiseResolver();
      finishPromiseResolver = null;
    }
  };

  const processQueue = async () => {
    if (isProcessing || sessionId !== currentSpeechSessionId) {
      maybeResolveFinish();
      return;
    }

    isProcessing = true;

    try {
      while (queue.length > 0 && sessionId === currentSpeechSessionId) {
        const nextChunk = queue.shift();
        if (!nextChunk) {
          continue;
        }

        await speakTextInternal(nextChunk, {
          language,
          fallbackToBrowser,
          voiceOverride: options?.voiceOverride,
        });
      }
    } finally {
      isProcessing = false;
      maybeResolveFinish();
    }
  };

  const queueChunk = (chunk: string) => {
    const normalized = stripMarkdownForSpeech(chunk);
    if (!normalized) {
      return;
    }

    queue.push(normalized);
    void processQueue();
  };

  return {
    pushText: (chunk: string) => {
      if (!chunk || sessionId !== currentSpeechSessionId) {
        return;
      }

      buffer += chunk;

      while (true) {
        const boundary = getSpeechChunkBoundary(buffer);
        if (boundary < 0) {
          break;
        }

        const speakableChunk = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary);
        queueChunk(speakableChunk);
      }
    },
    finish: async () => {
      if (sessionId !== currentSpeechSessionId) {
        return;
      }

      finished = true;

      if (buffer.trim()) {
        queueChunk(buffer);
        buffer = '';
      }

      if (!isProcessing && queue.length === 0) {
        return;
      }

      await new Promise<void>((resolve) => {
        finishPromiseResolver = resolve;
        maybeResolveFinish();
      });
    },
    cancel: () => {
      if (sessionId === currentSpeechSessionId) {
        stopSpeaking();
      }
    },
  };
};

// Check if Ollama is available
export const checkOllamaAvailability = async (overrideUrl?: string): Promise<boolean> => {
  try {
    const response = await fetch(`${overrideUrl || currentConfig.ollamaUrl}/api/tags`, {
      method: 'GET',
    });
    return response.ok;
  } catch {
    return false;
  }
};

// Get available Ollama models
export const getOllamaModels = async (overrideUrl?: string): Promise<string[]> => {
  try {
    const response = await fetch(`${overrideUrl || currentConfig.ollamaUrl}/api/tags`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.models?.map((m: { name: string }) => m.name) || [];
  } catch {
    return [];
  }
};

// Generate response using Ollama
const generateOllamaResponse = async (
  messages: ChatMessage[]
): Promise<LLMResponse> => {
  const response = await fetch(`${currentConfig.ollamaUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: currentConfig.ollamaModel,
      messages,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    content: data.message?.content || '',
    provider: 'ollama',
    model: currentConfig.ollamaModel || 'unknown',
  };
};

const buildSystemPrompt = (options?: ChatOptions): string => {
  let systemPrompt = LUMI_SYSTEM_PROMPTS.base + '\n\n' + LUMI_SYSTEM_PROMPTS.frenchTeacher;

  if (options?.mode && LUMI_SYSTEM_PROMPTS[options.mode]) {
    systemPrompt += '\n\n' + LUMI_SYSTEM_PROMPTS[options.mode];
  }

  if (options?.learnerAge) {
    if (options.learnerAge <= 8) {
      systemPrompt += '\n\nThe learner is young (5-8). Use simple words, short sentences, and lots of encouragement.';
    } else if (options.learnerAge <= 12) {
      systemPrompt += '\n\nThe learner is 9-12 years old. You can use more complex concepts but keep explanations clear.';
    } else {
      systemPrompt += '\n\nThe learner is a teenager. You can discuss advanced topics and encourage independent thinking.';
    }
  }

  if (
    options?.currentTopics?.length ||
    options?.canonicalSnippets?.length ||
    options?.learnerInterests?.length ||
    options?.studentProfileSummary
  ) {
    const dynamicPrompt = learningPersonalizationService.buildInterestAwareTutorSystemPrompt({
      subject: options?.mode === 'french' ? 'French language' : 'the learner’s current Lumipods topics',
      band: options?.skillBand || 'the learner’s current level',
      topics: options?.currentTopics || ['the current lesson'],
      studentProfile:
        options?.studentProfileSummary ||
        [
          options?.learnerAge ? `Age ${options.learnerAge}` : null,
          options?.learnerInterests?.length
            ? `Interests: ${options.learnerInterests.join(', ')}`
            : null,
        ]
          .filter(Boolean)
          .join('. ') ||
        'No extra learner profile provided.',
      canonicalSnippets: options?.canonicalSnippets || ['Stay aligned with the current Lumipods lesson.'],
      language: options?.language || 'en',
      persona: options?.personaName,
    });

    systemPrompt += `\n\n${dynamicPrompt}`;
  }

  return systemPrompt;
};

const buildFullMessages = (messages: ChatMessage[], options?: ChatOptions): ChatMessage[] => [
  { role: 'system', content: buildSystemPrompt(options) },
  ...messages,
];

// Generate response using OpenAI
const generateOpenAIResponse = async (
  messages: ChatMessage[]
): Promise<LLMResponse> => {
  if (!hasOpenAIProxy() && !hasDirectOpenAIKey()) {
    throw new Error('OpenAI proxy or direct API key not configured');
  }

  const endpoint = hasOpenAIProxy()
    ? `${getTrimmedProxyUrl()}/v1/chat/completions`
    : `${currentConfig.openaiBaseUrl || 'https://api.openai.com'}/v1/chat/completions`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (!hasOpenAIProxy() && currentConfig.openaiApiKey) {
    headers.Authorization = `Bearer ${currentConfig.openaiApiKey}`;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: currentConfig.openaiModel,
      messages,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI error: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    content: data.choices?.[0]?.message?.content || '',
    provider: 'openai',
    model: currentConfig.openaiModel || 'unknown',
    tokensUsed: data.usage?.total_tokens,
  };
};

const parseSseEvents = (
  chunkBuffer: string,
  onEvent: (payload: string) => void
): string => {
  let buffer = chunkBuffer;

  while (true) {
    const eventBoundaryMatch = buffer.match(/\r?\n\r?\n/);
    if (!eventBoundaryMatch || eventBoundaryMatch.index == null) {
      break;
    }

    const eventBoundary = eventBoundaryMatch.index;
    const rawEvent = buffer.slice(0, eventBoundary);
    buffer = buffer.slice(eventBoundary + eventBoundaryMatch[0].length);

    const data = rawEvent
      .split(/\r?\n/)
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trimStart())
      .join('\n');

    if (data) {
      onEvent(data);
    }
  }

  return buffer;
};

const streamOpenAIResponse = async (
  messages: ChatMessage[],
  handlers?: ChatStreamHandlers
): Promise<LLMResponse> => {
  if (!hasOpenAIProxy() && !hasDirectOpenAIKey()) {
    throw new Error('OpenAI proxy or direct API key not configured');
  }

  const endpoint = hasOpenAIProxy()
    ? `${getTrimmedProxyUrl()}/v1/chat/completions`
    : `${currentConfig.openaiBaseUrl || 'https://api.openai.com'}/v1/chat/completions`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (!hasOpenAIProxy() && currentConfig.openaiApiKey) {
    headers.Authorization = `Bearer ${currentConfig.openaiApiKey}`;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: currentConfig.openaiModel,
      messages,
      max_tokens: 1000,
      stream: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI error: ${response.statusText}`);
  }

  if (!response.body) {
    throw new Error('OpenAI stream body was empty');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let content = '';
  let model = currentConfig.openaiModel || 'unknown';
  let tokensUsed: number | undefined;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      buffer = parseSseEvents(buffer, (payload) => {
        if (payload === '[DONE]') {
          return;
        }

        const parsed = JSON.parse(payload) as {
          model?: string;
          usage?: { total_tokens?: number };
          choices?: Array<{
            delta?: { content?: string };
          }>;
        };

        if (parsed.model) {
          model = parsed.model;
        }

        if (parsed.usage?.total_tokens) {
          tokensUsed = parsed.usage.total_tokens;
        }

        const delta = parsed.choices?.[0]?.delta?.content || '';
        if (!delta) {
          return;
        }

        content += delta;
        handlers?.onText?.(delta, content);
      });
    }
  } finally {
    reader.releaseLock();
  }

  return {
    content,
    provider: 'openai',
    model,
    tokensUsed,
  };
};

// Mock responses for demo/offline mode
const generateMockResponse = async (
  messages: ChatMessage[],
  language: 'en' | 'fr' = 'en',
  mode: TutorMode = 'helper'
): Promise<LLMResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 800));

  const lastMessage = messages[messages.length - 1]?.content.toLowerCase() || '';
  
  // French-specific responses
  if (lastMessage.includes('french') || lastMessage.includes('français') || language === 'fr') {
    const frenchResponses = [
      `Bien sûr! Let's learn some French together! 🇫🇷\n\n**Phrase du jour:**\n🇫🇷 "Comment ça va?"\n🔊 "koh-mahn sah VAH"\n🇬🇧 "How are you?"\n\nTry saying it out loud once, then answer me in French: "Ça va bien" or "Ça va comme ci, comme ça."`,
      `Excellent question! Here's today's vocabulary:\n\n🇫🇷 **Les couleurs (Colors)**\n• Rouge (roozh) - Red\n• Bleu (bluh) - Blue\n• Vert (vehr) - Green\n• Jaune (zhohn) - Yellow\n\nPick one word, say it out loud, and then use it in a short sentence.`,
      `Super! 🌟 Let's practice a real exchange.\n\n🇫🇷 "Je m'appelle..." (zhuh mah-PEL)\n🇬🇧 "My name is..."\n\nNow you try saying it. If you want, send me your version and I’ll gently help you improve it.`,
    ];
    return {
      content: frenchResponses[Math.floor(Math.random() * frenchResponses.length)],
      provider: 'mock',
      model: 'mock-bilingual',
    };
  }

  // General educational responses
  const responsesByMode: Record<TutorMode, string[]> = {
    helper: [
      `Great question! Let me help you break it into smaller steps.\n\nWhat part feels unclear right now?`,
      `Here is a practical way to approach it:\n\n1. Start with what you know\n2. Identify what changed\n3. Test one next step\n\nWhich part should we do together?`,
    ],
    socratic: [
      `Let's reason it out together. What do you already notice, and what evidence supports that idea?`,
      `Before I answer directly, what do you think the first useful step would be, and why?`,
    ],
    encourager: [
      `You're doing real thinking here. Progress counts even before the final answer.\n\nTell me which part feels hardest and we'll tackle that piece first.`,
      `You do not need to solve it all at once. Pick one small next move and we'll build from there.`,
    ],
    explainer: [
      `Let's make it concrete.\n\nStep 1: name the key idea.\nStep 2: connect it to an example.\nStep 3: check whether the example really fits.\n\nWhich step should we expand?`,
      `A useful explanation starts with the structure underneath the topic.\n\nTell me the topic and I will unpack it clearly with an example.`,
    ],
    scientist: [
      `Let's look at this like a scientist.\n\nWhat can we observe, what can we measure, and what do we predict will happen next?`,
      `Start with evidence.\n\nWhat pattern do you notice, and how could we test whether that pattern is real?`,
    ],
    maker: [
      `Let's build with the idea instead of only talking about it.\n\nWhat could you make, model, code, or test to prove you understand it?`,
      `Good problem. If we treat this like a prototype, what is version one and what would we improve after testing it?`,
    ],
    french: [],
  };

  return {
    content:
      responsesByMode[mode][Math.floor(Math.random() * responsesByMode[mode].length)] ||
      responsesByMode.helper[0],
    provider: 'mock',
    model: 'mock-v1',
  };
};

// Main chat function
export const chat = async (
  messages: ChatMessage[],
  options?: ChatOptions
): Promise<LLMResponse> => {
  const fullMessages = buildFullMessages(messages, options);

  if (currentConfig.provider === 'ollama') {
    try {
      const isOllamaAvailable = await checkOllamaAvailability();
      if (isOllamaAvailable) {
        return await generateOllamaResponse(fullMessages);
      }
    } catch (error) {
      console.warn('Ollama not available, falling back to mock:', error);
    }
  }

  if (currentConfig.provider === 'openai' && (hasOpenAIProxy() || hasDirectOpenAIKey())) {
    try {
      return await generateOpenAIResponse(fullMessages);
    } catch (error) {
      console.warn('OpenAI failed, falling back to mock:', error);
    }
  }

  // Fallback to mock
  return generateMockResponse(messages, options?.language, options?.mode);
};

export const streamChat = async (
  messages: ChatMessage[],
  options?: ChatOptions,
  handlers?: ChatStreamHandlers
): Promise<LLMResponse> => {
  const fullMessages = buildFullMessages(messages, options);

  if (currentConfig.provider === 'openai' && (hasOpenAIProxy() || hasDirectOpenAIKey())) {
    try {
      return await streamOpenAIResponse(fullMessages, handlers);
    } catch (error) {
      console.warn('OpenAI streaming failed, falling back to standard chat:', error);
    }
  }

  const response = await chat(messages, options);
  handlers?.onText?.(response.content, response.content);
  return response;
};

// Quick translation helper
export const translateToFrench = async (text: string): Promise<string> => {
  const response = await chat([
    { role: 'user', content: `Translate this to French and provide pronunciation: "${text}"` }
  ], { mode: 'french' });
  return response.content;
};

// Get French phrase of the day
export const getFrenchPhraseOfDay = async (): Promise<string> => {
  const response = await chat([
    { role: 'user', content: 'Give me a useful French phrase of the day with pronunciation and usage example.' }
  ], { mode: 'french' });
  return response.content;
};
