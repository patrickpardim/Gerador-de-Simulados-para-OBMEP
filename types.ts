export enum Level {
  Nivel1 = "Nível 1 (6º e 7º ano)",
  Nivel2 = "Nível 2 (8º e 9º ano)",
  Nivel3 = "Nível 3 (Ensino Médio)",
}

export interface Question {
  number: number;
  text: string;
  options: string[];
  answer: string;
  explanation: string;
}

export interface Simulado {
  level: Level;
  questions: Question[];
}
