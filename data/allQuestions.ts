import { questions as baseQuestions } from './questions';
import { tryoutQuestions } from './tryout1';
import { data as data26_35 } from './tryout1-data2';
import { data as data36_45 } from './tryout1-data3';
import { data as data46_55 } from './tryout1-data4';
import { data as data56_65 } from './tryout1-data5';
import { data as data66_75 } from './tryout1-data6';

export type AppQuestion = (typeof baseQuestions)[number] & {
  optionExplanations?: string[];
  image?: string | null;
};

type TryoutRow = readonly [string, readonly string[], number, string, string, string];

const makeTryoutQuestions = (rows: readonly TryoutRow[], startNo: number): AppQuestion[] =>
  rows.map((row, index) => {
    const [question, options, answer, explanation, source, image] = row;
    return {
      id: 1000 + startNo + index,
      department: 'Try Out UKMPPD 1',
      question,
      options: [...options],
      answer,
      explanation,
      optionExplanations: options.map((option, optionIndex) =>
        optionIndex === answer
          ? `✓ Opsi ini adalah kunci pada sumber. ${explanation}`
          : `✕ Opsi ini bukan kunci pada sumber. ${explanation}`
      ),
      source,
      ...(image ? { image } : {}),
    };
  });

export const questions: AppQuestion[] = [
  ...(baseQuestions as AppQuestion[]),
  ...tryoutQuestions,
  ...makeTryoutQuestions(data26_35, 26),
  ...makeTryoutQuestions(data36_45, 36),
  ...makeTryoutQuestions(data46_55, 46),
  ...makeTryoutQuestions(data56_65, 56),
  ...makeTryoutQuestions(data66_75, 66),
];
