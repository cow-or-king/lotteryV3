/**
 * Game types
 */
export interface GameResult {
  winningSegmentId?: string | null;
  winningCombination?: [string, string, string] | null;
  prize?: {
    id: string;
    name: string;
    description: string | null;
    value: number | null;
    color: string;
  } | null;
}
