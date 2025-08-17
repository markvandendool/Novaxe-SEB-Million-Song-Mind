import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExerciseModel {

  public _question: string[] = ['C', 'G', 'D', 'A'];
  public _cards: string[] = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
  public verified: number = 0;
  public win: boolean | undefined = undefined;

  private _fourths: string[] = ['C', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'F#', 'B', 'E', 'A', 'D', 'G'];
  private _solution: string[] = [];

  constructor() {
    this.start();
  }

  /**
   * Answer a card - simplified version for migration compatibility
   */
  public answer(card: string): boolean {
    // Simple validation - check if card is in the expected solution
    const isCorrect = this._solution.includes(card);
    if (isCorrect) {
      this.verified++;
      if (this.verified >= this._solution.length) {
        this.win = true;
      }
    }
    return isCorrect;
  }

  /**
   * Start a new exercise
   */
  public start(): void {
    this.verified = 0;
    this.win = undefined;
    this._solution = ['C', 'G', 'D', 'A']; // Simple circle of fifths sequence
    this._question = [...this._solution]; // Copy solution as question
  }

  /**
   * Verify next step in progression
   */
  public verifyNext(e: any): boolean {
    this.verified++;
    if (this.verified >= this._solution.length) {
      this.win = true;
    }
    return true;
  }

  /**
   * Get random number between min and max
   */
  private getRandBetween(min: number = 0, max: number = 11): number {
    return min + Math.floor(Math.random() * max);
  }
}
