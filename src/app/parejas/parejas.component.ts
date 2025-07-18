import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Card {
    emoji: string;
    index: number;
    flipped: boolean;
    matched: boolean;
}

@Component({
    selector: 'app-parejas',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './parejas.component.html',
    styleUrls: ['./parejas.component.css']
})
export class ParejasComponent implements OnInit, OnDestroy {
    private emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
    private timer: any;
    private readonly maxMoves = 30;

    cards: Card[] = [];
    hasFlippedCard = false;
    lockBoard = false;
    firstCard: Card | null = null;
    secondCard: Card | null = null;
    moves = 0;
    pairsFound = 0;
    seconds = 0;
    gameStarted = false;
    gameWon = false;
    gameLost = false;
    showWinMessage = false;

    constructor(private router: Router) { }

    ngOnInit() {
        this.initGame();
    }

    ngOnDestroy() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    }

    initGame() {
        this.clearTimer();
        this.resetGameState();
        this.createCards();
        this.shuffleCards();
    }

    private clearTimer() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        this.seconds = 0;
    }

    private resetGameState() {
        this.moves = 0;
        this.pairsFound = 0;
        this.hasFlippedCard = false;
        this.lockBoard = false;
        this.firstCard = null;
        this.secondCard = null;
        this.gameStarted = false;
        this.gameWon = false;
        this.gameLost = false;
        this.showWinMessage = false;
    }

    private createCards() {
        const duplicatedEmojis = [...this.emojis, ...this.emojis];
        this.cards = duplicatedEmojis.map((emoji, index) => ({
            emoji,
            index,
            flipped: false,
            matched: false
        }));
    }

    private shuffleCards() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    flipCard(card: Card) {
        if (!this.gameStarted) {
            this.startTimer();
            this.gameStarted = true;
        }

        if (this.lockBoard || card === this.firstCard || card.flipped || card.matched) {
            return;
        }

        card.flipped = true;

        if (!this.hasFlippedCard) {
            this.hasFlippedCard = true;
            this.firstCard = card;
            return;
        }

        this.secondCard = card;
        this.checkForMatch();
    }

    private checkForMatch() {
        if (!this.firstCard || !this.secondCard) return;

        const isMatch = this.firstCard.emoji === this.secondCard.emoji;
        this.moves++;

        if (isMatch) {
            this.disableCards();
            this.pairsFound++;

            if (this.pairsFound === this.emojis.length) {
                this.endGame(true);
            }
        } else {
            this.unflipCards();
        }

        if (this.moves >= this.maxMoves && this.pairsFound < this.emojis.length) {
            this.endGame(false);
        }
    }

    private disableCards() {
        if (this.firstCard && this.secondCard) {
            this.firstCard.matched = true;
            this.secondCard.matched = true;
        }
        this.resetBoard();
    }

    private unflipCards() {
        this.lockBoard = true;
        setTimeout(() => {
            if (this.firstCard && this.secondCard) {
                this.firstCard.flipped = false;
                this.secondCard.flipped = false;
            }
            this.resetBoard();
        }, 1000);
    }

    private resetBoard() {
        this.hasFlippedCard = false;
        this.lockBoard = false;
        this.firstCard = null;
        this.secondCard = null;
    }

    private startTimer() {
        this.timer = setInterval(() => {
            this.seconds++;
        }, 1000);
    }

    private endGame(won: boolean) {
        this.clearTimer();
        this.gameWon = won;
        this.gameLost = !won;
        this.showWinMessage = true;
        this.lockBoard = true;

        if (won) {
            // Animación de celebración
            setTimeout(() => {
                this.cards.forEach((card, index) => {
                    if (card.matched) {
                        setTimeout(() => {
                            // Aquí podrías agregar una clase de animación
                        }, index * 100);
                    }
                });
            }, 500);
        }
    }

    restartGame() {
        this.cards.forEach(card => {
            card.flipped = false;
            card.matched = false;
        });
        this.resetGameState();
        this.showWinMessage = false;
    }

    newGame() {
        this.initGame();
    }

    playAgain() {
        this.showWinMessage = false;
        this.initGame();
    }

    getFormattedTime(): string {
        return `${this.seconds}s`;
    }

    getPairsText(): string {
        return `${this.pairsFound}/8`;
    }

    goHome() {
        this.router.navigate(['/home']);
    }

    trackByIndex(index: number, card: Card): number {
        return card.index;
    }
}
