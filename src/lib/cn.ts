// Classname utility - combines clsx with tailwind-merge pattern
import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
