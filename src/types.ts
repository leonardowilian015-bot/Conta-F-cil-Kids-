
export type Operation = 'soma' | 'subtracao' | 'multiplicacao' | 'divisao';

export type AppMode = 'menu' | 'aprender' | 'praticar' | 'jogar' | 'pais' | 'gincanas' | 'ajuda' | 'colecao' | 'ranking' | 'user-select';

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  progress: UserProgress;
}

export interface UserProgress {
  stars: number;
  gincanaPoints: number;
  collectedPets: string[]; // IDs of pets collected
  selectedMascotId?: string; // ID of the currently selected mascot
  medals: {
    [key in Operation]: number;
  };
  completedGincanas: string[];
  history: {
    date: string;
    operation: Operation;
    score: number;
    difficulty: number;
  }[];
}

export interface LeaderboardEntry {
  id: string;
  score: number;
  date: string;
  playerName: string;
}

export interface Question {
  id: string;
  num1: number;
  num2: number;
  operation: Operation;
  answer: number;
  options: number[];
}
