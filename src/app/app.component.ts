import { JsonPipe, NgClass } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

interface Card {
  x: number;
  y: number;
  picture: string;
  flipped: boolean;
  matched: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, JsonPipe, NgClass],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'match';
  width = 4;
  height = 3;
  grid: Card[][] = [];
  symbols = ['😍', '🤢', '💩', '💋', '👩‍🎤', '🧜‍♀️', '👑'];
  bgPicture = '';

  firstPick?: Card;
  secondPick?: Card;
  waiting: number | undefined;

  constructor(private changeDetector: ChangeDetectorRef) {
    for (let y = 0; y < this.height; y++) {
      const row: Card[] = [];
      for (let x = 0; x < this.width; x++) {
        row.push({
          x,
          y,
          picture:
            this.symbols[Math.floor(Math.random() * this.symbols.length)],
          flipped: false,
          matched: false,
        });
      }
      this.grid.push(row);
    }
  }
  toggle(card: Card) {
    // console.log('toggling', card, this.firstPick);
    if (this.waiting) {
      // console.log('skipping wait for timeout');
      this.resetPick(card);
    }
    if (card.matched || card.flipped) {
      // console.log('cant click on that card');
      return;
    }
    if (this.firstPick) {
      // console.log('checking for matches!');
      if (card.picture === this.firstPick.picture) {
        card.matched = true;
        card.flipped = true;
        this.firstPick.matched = true;
        this.firstPick.flipped = true;
        this.firstPick = undefined;
      } else {
        card.flipped = true;
        this.secondPick = card;
        this.waiting = <any>setTimeout(() => {
          this.resetPick(card);
        }, 3000);
      }
      return;
    }
    card.flipped = true;
    this.firstPick = card;
  }
  resetPick(card: Card) {
    if (!card || !this.firstPick) {
      console.error('resetting at a weird state', card, this.firstPick);
      return;
    }
    card.flipped = false;
    this.firstPick.flipped = false;
    if (this.secondPick) {
      this.secondPick.flipped = false;
      this.secondPick = undefined;
    }
    if (this.waiting) {
      clearTimeout(this.waiting);
      this.waiting = 0;
    }
    this.changeDetector.detectChanges();
    this.firstPick = undefined;
  }
}
