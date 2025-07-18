import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
    selector: 'app-puzzle',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './puzzle.component.html',
    styleUrls: ['./puzzle.component.css']
})
export class PuzzleComponent implements OnInit, OnDestroy {
    public board: number[] = [];
    private emptyIndex: number = 15;
    private moveCount: number = 0;
    private seconds: number = 0;
    private timer: any;
    public gameActive: boolean = false;
    private readonly maxMoves: number = 100;

    constructor(private router: Router) { }

    ngOnInit() {
        setTimeout(() => {
            this.initGame();
        }, 100);
    }

    ngOnDestroy() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    }

    initGame() {
        this.board = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0];
        this.emptyIndex = 15;
        this.moveCount = 0;
        this.gameActive = true;

        const moveCountDisplay = document.getElementById('move-count');
        const winMessage = document.querySelector('.win-message') as HTMLElement;
        const loseMessage = document.querySelector('.lose-message') as HTMLElement;

        if (moveCountDisplay) moveCountDisplay.textContent = this.moveCount.toString();
        if (winMessage) winMessage.style.display = 'none';
        if (loseMessage) loseMessage.style.display = 'none';

        if (this.timer) clearInterval(this.timer);
        this.seconds = 0;
        this.updateTimer();
        this.timer = setInterval(() => this.updateTimer(), 1000);

        this.shuffleBoard();
    }

    shuffleBoard() {
        for (let i = 0; i < 500; i++) {
            const adjacentTiles = this.getAdjacentTiles(this.emptyIndex);
            const randomTile = adjacentTiles[Math.floor(Math.random() * adjacentTiles.length)];
            if (randomTile !== undefined) {
                this.moveTile(randomTile, false);
            }
        }
        this.moveCount = 0;
        const moveCountDisplay = document.getElementById('move-count');
        if (moveCountDisplay) moveCountDisplay.textContent = this.moveCount.toString();
    }

    renderBoard() {
        // Ya no es necesario renderizar el tablero manualmente, Angular lo hace en el template
    }

    moveTile(index: number, countMove: boolean): boolean {
        const adjacentTiles = this.getAdjacentTiles(this.emptyIndex);
        if (adjacentTiles.includes(index)) {
            [this.board[this.emptyIndex], this.board[index]] = [this.board[index], this.board[this.emptyIndex]];
            this.emptyIndex = index;
            if (countMove) {
                this.moveCount++;
                const moveCountDisplay = document.getElementById('move-count');
                if (moveCountDisplay) moveCountDisplay.textContent = this.moveCount.toString();
            }
            // Angular actualiza la vista automáticamente
            return true;
        }
        return false;
    }

    getAdjacentTiles(index: number): number[] {
        const tiles: number[] = [];
        const row = Math.floor(index / 4);
        const col = index % 4;

        if (row > 0) tiles.push(index - 4);
        if (row < 3) tiles.push(index + 4);
        if (col > 0) tiles.push(index - 1);
        if (col < 3) tiles.push(index + 1);

        return tiles;
    }

    updateTimer() {
        if (!this.gameActive) return;
        this.seconds++;
        const minutes = Math.floor(this.seconds / 60);
        const remainingSeconds = this.seconds % 60;
        const timeDisplay = document.getElementById('time');
        if (timeDisplay) {
            timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        }
    }

    checkWinOrLose() {
        // Verificar victoria
        for (let i = 0; i < this.board.length - 1; i++) {
            if (this.board[i] !== i + 1) return;
        }

        if (this.board[15] === 0) {
            this.gameActive = false;
            if (this.timer) clearInterval(this.timer);
            const winMessage = document.querySelector('.win-message') as HTMLElement;
            const loseMessage = document.querySelector('.lose-message') as HTMLElement;
            if (winMessage) winMessage.style.display = 'block';
            if (loseMessage) loseMessage.style.display = 'none';
            return;
        }

        // Verificar pérdida
        if (this.moveCount >= this.maxMoves) {
            this.gameActive = false;
            if (this.timer) clearInterval(this.timer);
            const loseMessage = document.querySelector('.lose-message') as HTMLElement;
            const winMessage = document.querySelector('.win-message') as HTMLElement;
            if (loseMessage) loseMessage.style.display = 'block';
            if (winMessage) winMessage.style.display = 'none';
        }
    }

    resetGame() {
        this.initGame();
    }

    goHome() {
        this.router.navigate(['/home']);
    }
}
