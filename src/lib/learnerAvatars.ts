const imageModules = import.meta.glob('../Images/profile icon images/*.{png,jpg,jpeg,webp}', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

const extractAvatarNumber = (path: string): number => {
  const match = path.match(/icon\s*(\d+)/i);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
};

const isBannerPath = (path: string): boolean => /banner/i.test(path);

const avatarEntries = Object.entries(imageModules).filter(([path]) => !isBannerPath(path));
const bannerEntries = Object.entries(imageModules).filter(([path]) => isBannerPath(path));

const bannerByAvatarId = new Map<string, string>(
  bannerEntries.map(([path, src]) => [`Avatar ${extractAvatarNumber(path)}`, src])
);

export interface LearnerAvatarOption {
  id: string;
  label: string;
  src: string;
  alt: string;
}

export const LEARNER_AVATAR_OPTIONS: LearnerAvatarOption[] = avatarEntries
  .sort(([leftPath], [rightPath]) => extractAvatarNumber(leftPath) - extractAvatarNumber(rightPath))
  .map(([path, src], index) => {
    const avatarNumber = extractAvatarNumber(path);
    const label = Number.isFinite(avatarNumber) ? `Avatar ${avatarNumber}` : `Avatar ${index + 1}`;

    return {
      id: label,
      label,
      src,
      alt: `${label} profile icon`,
    };
  });

export const DEFAULT_LEARNER_AVATAR = LEARNER_AVATAR_OPTIONS[0]?.id || '🧒';

export const resolveLearnerAvatar = (avatar?: string): string | null => {
  if (!avatar) return null;
  return LEARNER_AVATAR_OPTIONS.find((option) => option.id === avatar)?.src || null;
};

export const resolveLearnerBanner = (avatar?: string): string | null => {
  if (!avatar) return null;
  return bannerByAvatarId.get(avatar) || null;
};

export const hasLearnerBanner = (avatar?: string): boolean => resolveLearnerBanner(avatar) !== null;

export const isImageLearnerAvatar = (avatar?: string): boolean => resolveLearnerAvatar(avatar) !== null;

export const formatLearnerAvatarLabel = (avatar?: string): string => {
  if (!avatar) return '';
  return isImageLearnerAvatar(avatar) ? '' : avatar;
};
