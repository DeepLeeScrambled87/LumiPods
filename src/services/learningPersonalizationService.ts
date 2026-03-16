import { curriculumService } from './curriculumService';
import type {
  CanonicalMiniLesson,
  ProjectTemplate,
  SkillLevelId,
  WeekCurriculum,
} from '../types/curriculum';
import type { Learner } from '../types/learner';

export interface PersonalizedProjectSuggestion {
  id: string;
  title: string;
  style: ProjectTemplate['style'];
  description: string;
  learningGoals: string[];
  materials: string[];
  steps: string[];
  interestHook: string;
  estimatedTimeMinutes: number;
}

interface TutorPromptParams {
  subject: string;
  band: string;
  topics: string[];
  studentProfile: string;
  canonicalSnippets: string[];
  language: 'en' | 'fr';
  persona?: string;
}

interface ProjectPromptParams {
  band: string;
  subject: string;
  topic: string;
  weekLearningSummary: string;
  studentProfile: string;
  projectTemplates: ProjectTemplate[];
  language: 'en' | 'fr';
}

const tokenizeInterest = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, ' ');

const formatInterest = (value: string): string => value.trim();

const replaceTemplateTokens = (
  template: string,
  primaryInterest: string,
  secondaryInterest: string
): string =>
  template
    .replace(/\{interest\}/g, primaryInterest)
    .replace(/\{secondaryInterest\}/g, secondaryInterest)
    .replace(/\{interestPlural\}/g, `${primaryInterest}s`);

export const learningPersonalizationService = {
  getLearnerInterests(learner?: Learner | null): string[] {
    const raw = learner?.preferences?.interests || [];
    const seen = new Set<string>();

    return raw
      .map(formatInterest)
      .filter(Boolean)
      .filter((interest) => {
        const key = tokenizeInterest(interest);
        if (!key || seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });
  },

  buildStudentProfileSummary(learner?: Learner | null): string {
    if (!learner) {
      return 'No learner profile was provided.';
    }

    const interests = this.getLearnerInterests(learner);
    return [
      `${learner.name} is ${learner.age} years old.`,
      `Current skill level: ${learner.skillLevel}.`,
      interests.length > 0 ? `Interests: ${interests.join(', ')}.` : 'No interests have been saved yet.',
      learner.preferences?.accommodations?.length
        ? `Accommodations: ${learner.preferences.accommodations.join(', ')}.`
        : null,
    ]
      .filter(Boolean)
      .join(' ');
  },

  getCanonicalLessons(
    podId?: string,
    weekNumber?: number,
    skillLevel: SkillLevelId = 'intermediate'
  ): CanonicalMiniLesson[] {
    if (!podId || !weekNumber) {
      return [];
    }

    const week = curriculumService.getWeekCurriculum(podId, weekNumber);
    return week?.canonicalLessonsBySkillLevel?.[skillLevel] || [];
  },

  getCanonicalLessonSnippets(
    podId?: string,
    weekNumber?: number,
    skillLevel: SkillLevelId = 'intermediate'
  ): string[] {
    return this.getCanonicalLessons(podId, weekNumber, skillLevel)
      .flatMap((lesson) => [
        lesson.title,
        lesson.learningObjective,
        lesson.explanationSections[0],
        lesson.concreteExample,
        lesson.keyTakeaways[0],
      ])
      .filter(Boolean)
      .slice(0, 10);
  },

  personalizeProjectTemplate(
    template: ProjectTemplate,
    learner?: Learner | null
  ): PersonalizedProjectSuggestion {
    const interests = this.getLearnerInterests(learner);
    const primaryInterest = interests[0] || 'the learner’s favorite topic';
    const secondaryInterest = interests[1] || primaryInterest;

    return {
      id: template.id,
      title: replaceTemplateTokens(template.title, primaryInterest, secondaryInterest),
      style: template.style,
      description: replaceTemplateTokens(template.description, primaryInterest, secondaryInterest),
      learningGoals: template.learningGoals.map((goal) =>
        replaceTemplateTokens(goal, primaryInterest, secondaryInterest)
      ),
      materials: template.materials.map((item) =>
        replaceTemplateTokens(item, primaryInterest, secondaryInterest)
      ),
      steps: template.steps.map((step) =>
        replaceTemplateTokens(step, primaryInterest, secondaryInterest)
      ),
      interestHook: replaceTemplateTokens(
        template.interestHookTemplate,
        primaryInterest,
        secondaryInterest
      ),
      estimatedTimeMinutes: template.estimatedTimeMinutes,
    };
  },

  getProjectSuggestionsFromWeek(
    week: WeekCurriculum | null | undefined,
    skillLevel: SkillLevelId,
    learner?: Learner | null,
    limit: number = 3
  ): PersonalizedProjectSuggestion[] {
    if (!week?.projectTemplates?.length) {
      return [];
    }

    return week.projectTemplates
      .filter((template) => template.skillLevels.includes(skillLevel))
      .slice(0, limit)
      .map((template) => this.personalizeProjectTemplate(template, learner));
  },

  buildInterestAwareTutorSystemPrompt(params: TutorPromptParams): string {
    const { subject, band, topics, studentProfile, canonicalSnippets, language, persona } = params;

    return `You are a friendly, Socratic tutor helping a school-age learner understand concepts in ${subject}.
The learner is approximately in band ${band}.
Their current topics are: ${topics.join(', ') || 'the current Lumipods lesson'}.
Their profile is: ${studentProfile}.

You must follow these rules:

Scope and curriculum
- Only teach and discuss concepts that appear in this canonical material: ${canonicalSnippets.join(' | ')}.
- Do not introduce advanced or unrelated content, even if the learner asks.
- Align explanations with the level implied by ${band}.

Socratic style
- Start with questions before giving explanations.
- Ask one short question at a time, then wait for the learner’s response.
- When they are stuck, give a small hint or partial explanation, then ask another question.

Use their interests for examples
- Always ground explanations and practice questions in the learner’s interests when possible.
- Keep the conceptual target the same; only the framing and examples should change.

Tone and safety
- Be encouraging, patient, and positive.
- Praise effort and strategy, not just correct answers.
- If something is outside the current material, say so and steer back.

Interaction style
- Keep messages short and focused.
- After any explanation, ask a quick check question.

Always respond in ${language === 'fr' ? 'French' : 'English'}.
Stay in character as a warm, curious tutor${persona ? ` inspired by ${persona}` : ''}.`;
  },

  buildProjectSuggestionGeneratorPrompt(params: ProjectPromptParams): string {
    const { band, subject, topic, weekLearningSummary, studentProfile, projectTemplates, language } = params;

    return `You are a curriculum-aligned project generator for Lumipods.
Your job is to propose 2-3 project ideas for a specific learner based on what they learned this week and their interests.

Context:
- Band: ${band}
- Subject: ${subject}
- Topic: ${topic}
- Week learning summary: ${weekLearningSummary}
- Student profile: ${studentProfile}
- Available project templates: ${JSON.stringify(projectTemplates)}

Requirements:
- All projects must directly reinforce the concepts from the week learning summary.
- Difficulty must fit the band.
- Projects should be doable at home or in a typical classroom with simple materials.
- Each project should connect to at least one learner interest, without changing the core learning goal.
- Use varied formats where possible.

Return only JSON with 2-3 project objects including title, description, learning_goals, materials, steps, interest_hook, and estimated_time_minutes.
Write everything in ${language === 'fr' ? 'French' : 'English'}.`;
  },
};

export default learningPersonalizationService;
