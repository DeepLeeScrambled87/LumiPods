import { storage } from '../lib/storage';
import type { QuizQuestion } from '../types/curriculum';

const getQuizProgressKey = (learnerId: string, podId: string, weekNumber: number) =>
  `quiz-progress-${learnerId}-${podId}-${weekNumber}`;

const getScopedQuizProgressKey = (learnerId: string, scopeKey: string) =>
  `quiz-progress-${learnerId}-${scopeKey}`;

export interface QuizAttempt {
  learnerId: string;
  podId: string;
  weekNumber: number;
  questionId: string;
  date: string;
  selectedAnswer: string;
  isCorrect: boolean;
  answeredAt: string;
  scopeKey?: string;
}

export interface QuizScoreSummary {
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  accuracy: number;
}

const normalizeAnswer = (value: string): string =>
  value.trim().toLowerCase().replace(/\s+/g, ' ');

export const isQuizAnswerCorrect = (question: QuizQuestion, answer: string): boolean => {
  const normalizedAnswer = normalizeAnswer(answer);

  if (Array.isArray(question.correctAnswer)) {
    return question.correctAnswer.map(normalizeAnswer).join('|') === normalizedAnswer;
  }

  return normalizeAnswer(question.correctAnswer) === normalizedAnswer;
};

export const quizProgressService = {
  createPodScopeKey(podId: string, weekNumber: number): string {
    return `pod-${podId}-${weekNumber}`;
  },

  createRailScopeKey(trackId: string, moduleId: string): string {
    return `rail-${trackId}-${moduleId}`;
  },

  getAttemptsForScope(learnerId: string, scopeKey: string): QuizAttempt[] {
    return storage.get<QuizAttempt[]>(getScopedQuizProgressKey(learnerId, scopeKey), []);
  },

  getAttemptForScope(
    learnerId: string,
    scopeKey: string,
    questionId: string
  ): QuizAttempt | null {
    return (
      this.getAttemptsForScope(learnerId, scopeKey).find(
        (attempt) => attempt.questionId === questionId
      ) || null
    );
  },

  saveScopedAnswer(params: {
    learnerId: string;
    scopeKey: string;
    podId?: string;
    weekNumber?: number;
    date: string;
    question: QuizQuestion;
    selectedAnswer: string;
  }): QuizAttempt {
    const {
      learnerId,
      scopeKey,
      podId = scopeKey,
      weekNumber = 1,
      date,
      question,
      selectedAnswer,
    } = params;
    const attempts = this.getAttemptsForScope(learnerId, scopeKey);
    const nextAttempt: QuizAttempt = {
      learnerId,
      podId,
      weekNumber,
      scopeKey,
      questionId: question.id,
      date,
      selectedAnswer,
      isCorrect: isQuizAnswerCorrect(question, selectedAnswer),
      answeredAt: new Date().toISOString(),
    };

    const existingIndex = attempts.findIndex((attempt) => attempt.questionId === question.id);
    if (existingIndex >= 0) {
      attempts[existingIndex] = nextAttempt;
    } else {
      attempts.push(nextAttempt);
    }

    storage.set(getScopedQuizProgressKey(learnerId, scopeKey), attempts);
    return nextAttempt;
  },

  getScoreForScopeQuestions(
    learnerId: string,
    scopeKey: string,
    questions: QuizQuestion[]
  ): QuizScoreSummary {
    const attempts = this.getAttemptsForScope(learnerId, scopeKey);
    const attemptsByQuestionId = new Map(attempts.map((attempt) => [attempt.questionId, attempt]));
    const answeredQuestions = questions.filter((question) => attemptsByQuestionId.has(question.id)).length;
    const correctAnswers = questions.filter((question) => attemptsByQuestionId.get(question.id)?.isCorrect).length;
    const totalQuestions = questions.length;

    return {
      totalQuestions,
      answeredQuestions,
      correctAnswers,
      accuracy: totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0,
    };
  },

  getAttempts(learnerId: string, podId: string, weekNumber: number): QuizAttempt[] {
    const scopeKey = this.createPodScopeKey(podId, weekNumber);
    const scopedAttempts = this.getAttemptsForScope(learnerId, scopeKey);
    if (scopedAttempts.length > 0) {
      return scopedAttempts;
    }

    return storage.get<QuizAttempt[]>(getQuizProgressKey(learnerId, podId, weekNumber), []);
  },

  getAttempt(
    learnerId: string,
    podId: string,
    weekNumber: number,
    questionId: string
  ): QuizAttempt | null {
    return (
      this.getAttempts(learnerId, podId, weekNumber).find((attempt) => attempt.questionId === questionId) || null
    );
  },

  saveAnswer(params: {
    learnerId: string;
    podId: string;
    weekNumber: number;
    date: string;
    question: QuizQuestion;
    selectedAnswer: string;
  }): QuizAttempt {
    const { learnerId, podId, weekNumber, date, question, selectedAnswer } = params;
    const attempt = this.saveScopedAnswer({
      learnerId,
      scopeKey: this.createPodScopeKey(podId, weekNumber),
      podId,
      weekNumber,
      date,
      question,
      selectedAnswer,
    });

    storage.set(getQuizProgressKey(learnerId, podId, weekNumber), this.getAttempts(learnerId, podId, weekNumber));
    return attempt;
  },

  getScoreForQuestions(
    learnerId: string,
    podId: string,
    weekNumber: number,
    questions: QuizQuestion[]
  ): QuizScoreSummary {
    return this.getScoreForScopeQuestions(
      learnerId,
      this.createPodScopeKey(podId, weekNumber),
      questions
    );
  },
};

export default quizProgressService;
