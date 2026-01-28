
export interface HistoryEntry {
  timestamp: number;
  delta: number;
  reason: string;
}

export interface Student {
  id: string;
  rollNo: number;
  name: string;
  points: number;
  posPoints: number; // Sum of positive increments
  negPoints: number; // Sum of negative increments (as magnitude)
  pokemonId: number;
  history?: HistoryEntry[];
}

export interface ClassData {
  id: string;
  className: string;
  students: Student[];
}

export enum SortType {
  ID_ASC = 'ID_ASC',
  SCORE_DESC = 'SCORE_DESC',
  SCORE_ASC = 'SCORE_ASC',
  NAME_ASC = 'NAME_ASC',
  NEG_DESC = 'NEG_DESC'
}

export interface PointAction {
  labelEn: string;
  labelZh: string;
  points: number;
  type: 'positive' | 'negative';
}
