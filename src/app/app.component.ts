import { JsonPipe, NgClass } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

interface Card {
  x?: number;
  y?: number;
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
  moves = 0;

  constructor(private changeDetector: ChangeDetectorRef) {
    this.randomlyPlaceSymbols();
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
    this.moves++;
    if (this.firstPick) {
      // console.log('checking for matches!');
      if (card.picture === this.firstPick.picture) {
        card.matched = true;
        card.flipped = true;
        this.firstPick.matched = true;
        this.firstPick.flipped = true;
        this.firstPick = undefined;
        this.checkForWin();
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
  randomlyPlaceSymbols() {
    if (this.symbols.length * 2 < this.width * this.height) {
      console.error('not enough symbols for this grid');
      return;
    }
    this.grid = [];
    this.moves = 0;
    // Create a random array of cards based on the symbols
    // With width*height/2 symbols, or (width*height-1)/2
    let count = this.width * this.height;
    if (count % 2 !== 0) {
      count--;
    }
    let symbolCount = count / 2;
    this.symbols.sort(() => Math.random() - 0.5);
    const cardList: Card[] = [];
    for (let i = 0; i < symbolCount; i++) {
      cardList.push({
        picture: this.symbols[i],
        flipped: false,
        matched: false,
      });
      cardList.push({
        picture: this.symbols[i],
        flipped: false,
        matched: false,
      });
    }
    for (let y = 0; y < this.height; y++) {
      const row: Card[] = [];
      for (let x = 0; x < this.width; x++) {
        if (cardList.length <= 0) {
          break;
        }
        const index = Math.floor(Math.random() * cardList.length);
        cardList[index].x = x;
        cardList[index].y = y;
        row.push(cardList.splice(index, 1)[0]);
      }
      this.grid.push(row);
    }
  }
  checkForWin() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (!this.grid[y][x]?.matched) {
          return;
        }
      }
    }
    setTimeout(() => {
      alert('You win!');
      this.grid = [];
      setTimeout(() => {
        this.randomlyPlaceSymbols();
      }, 1000);
      this.changeDetector.detectChanges();
    }, 1000);
  }
}
