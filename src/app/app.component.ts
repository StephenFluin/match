import { JsonPipe, NgClass } from '@angular/common';
import { Component, signal, WritableSignal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

const splitEmoji = (s: string) =>
  [...new Intl.Segmenter().segment(s)].map((x) => x.segment);

interface Card {
  x?: number;
  y?: number;
  picture: string;
  flipped: WritableSignal<boolean>;
  matched: WritableSignal<boolean>;
}

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, JsonPipe, NgClass],
    templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'match';
  width = 4;
  height = 3;
  grid = signal<Card[][]>([]);

  symbols = splitEmoji(
    '😍🤢💩💋👩‍🎤🧜‍♀️👑🍱🍕🍿⚽️🏀🏈✈️🛳🎡🎢🛝🏩📪✏️🔍💵🔔🇺🇸🇨🇷🇬🇧🇦🇺'
  );
  bgPicture = '';
  unflipSpeed = signal('1000');

  firstPick?: Card;
  secondPick?: Card;
  waiting: number | undefined;
  moves = signal(0);
  wins = signal(0);

  constructor() {
    this.randomlyPlaceSymbols();
  }
  toggle(card: Card) {
    // console.log('toggling', card, this.firstPick);
    if (this.waiting) {
      // console.log('skipping wait for timeout');
      this.resetPick(card);
    }
    if (card.matched() || card.flipped()) {
      // console.log('cant click on that card');
      return;
    }
    this.moves.update((m) => m + 1);
    if (this.firstPick) {
      // console.log('checking for matches!');
      if (card.picture === this.firstPick.picture) {
        card.matched.set(true);
        card.flipped.set(true);
        this.firstPick.matched.set(true);
        this.firstPick.flipped.set(true);
        this.firstPick = undefined;
        this.checkForWin();
      } else {
        card.flipped.set(true);
        this.secondPick = card;
        this.waiting = <any>setTimeout(() => {
          this.resetPick(card);
        }, parseInt(this.unflipSpeed(), 10));
      }
      return;
    }
    card.flipped.set(true);
    this.firstPick = card;
  }
  resetPick(card: Card) {
    if (!card || !this.firstPick) {
      console.error('resetting at a weird state', card, this.firstPick);
      return;
    }
    card.flipped.set(false);
    this.firstPick.flipped.set(false);
    if (this.secondPick) {
      this.secondPick.flipped.set(false);
      this.secondPick = undefined;
    }
    if (this.waiting) {
      clearTimeout(this.waiting);
      this.waiting = 0;
    }
    this.firstPick = undefined;
  }
  randomlyPlaceSymbols() {
    if (this.symbols.length * 2 < this.width * this.height) {
      console.error('not enough symbols for this grid');
      return;
    }
    const grid: Card[][] = [];
    this.moves.set(0);
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
      for (let copy = 0; copy < 2; copy++) {
        cardList.push({
          picture: this.symbols[i],
          flipped: signal(false),
          matched: signal(false),
        });
      }
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
      grid.push(row);
    }
    this.grid.set(grid);
  }
  checkForWin() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (!this.grid()[y][x]?.matched()) {
          return;
        }
      }
    }
    setTimeout(() => {
      alert('You win!');
      this.wins.update((w) => w + 1);
      this.grid.set([]);
      setTimeout(() => {
        this.randomlyPlaceSymbols();
      }, 1000);
    }, 1000);
  }
}
