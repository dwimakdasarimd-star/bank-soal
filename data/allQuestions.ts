import { questions as baseQuestions } from './questions';
import { tryoutQuestions } from './tryout1';

export type AppQuestion = (typeof baseQuestions)[number] & {
  optionExplanations?: string[];
  image?: string;
};

export const questions: AppQuestion[] = [
  ...(baseQuestions as AppQuestion[]),
  ...tryoutQuestions,
];
