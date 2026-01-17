
export enum QuestionType {
  TRUE_FALSE = 'TRUE_FALSE',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  FILL_BLANKS = 'FILL_BLANKS'
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  questions: Question[];
  createdAt: number;
}

export interface Resource {
  id: string;
  type: 'file' | 'link';
  name: string;
  url: string;
  mimeType?: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  category: string;
  resources: Resource[];
  quizzes: Quiz[];
  createdAt: number;
  teacherId: string;
}

export interface User {
  id: string;
  email: string;
  role: 'teacher';
}
