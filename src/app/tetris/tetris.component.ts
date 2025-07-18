import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
    selector: 'app-tetris',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './tetris.component.html',
    styleUrls: ['./tetris.component.css']
})
export class TetrisComponent implements OnInit, OnDestroy {
    public highScores: { name: string; value: number }[] = [];
    private canvas!: HTMLCanvasElement;
    private context!: CanvasRenderingContext2D;
    private scoreElement!: HTMLElement;
    private percentageElement!: HTMLElement;
    private progressFill!: HTMLElement;
    private gameOverElement!: HTMLElement;
    private gameOver = false;
    private dropCounter = 0;
    private dropInterval = 1000;
    private lastTime = 0;
    private animationId!: number;

    private arena: number[][] = [];
    private player = {
        pos: { x: 0, y: 0 },
        matrix: null as number[][] | null,
        score: 0
    };

    private colors = [
        null,
        '#FF0D72',
        '#0DC2FF',
        '#0DFF72',
        '#F538FF',
        '#FF8E0D',
        '#FFE138',
        '#3877FF',
    ];

    constructor(private router: Router) { }

    ngOnInit() {
        this.loadHighScores();
        setTimeout(() => {
            this.initializeGame();
            this.setupEventListeners();
        }, 100);
    }

    ngOnDestroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        document.removeEventListener('keydown', this.handleKeyDown);
    }

    private initializeGame() {
        this.canvas = document.getElementById('tetris') as HTMLCanvasElement;
        if (!this.canvas) {
            console.error('Canvas element not found');
            return;
        }

        this.context = this.canvas.getContext('2d')!;
        if (!this.context) {
            console.error('Canvas context not available');
            return;
        }

        this.context.scale(20, 20);

        this.scoreElement = document.getElementById('score')!;
        this.percentageElement = document.getElementById('percentage')!;
        this.progressFill = document.getElementById('progress-fill')!;
        this.gameOverElement = document.getElementById('game-over')!;

        if (!this.scoreElement || !this.percentageElement || !this.progressFill || !this.gameOverElement) {
            console.error('Required DOM elements not found');
            return;
        }

        this.arena = this.createMatrix(12, 20);
        this.playerReset();
        this.updateScore();
        this.update();
    }

    private setupEventListeners() {
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    private handleKeyDown = (event: KeyboardEvent) => {
        if (this.gameOver) return;

        if (event.key === 'ArrowLeft') {
            this.playerMove(-1);
        } else if (event.key === 'ArrowRight') {
            this.playerMove(1);
        } else if (event.key === 'ArrowDown') {
            this.playerDrop();
        } else if (event.key === 'q') {
            this.playerRotate(-1);
        } else if (event.key === 'w') {
            this.playerRotate(1);
        } else if (event.code === 'Space') {
            event.preventDefault();
            this.playerRotate(1);
        } else if (event.key === 'Escape') {
            this.goHome();
        }
    }

    private arenaSweep() {
        let rowCount = 1;
        outer: for (let y = this.arena.length - 1; y >= 0; y--) {
            for (let x = 0; x < this.arena[y].length; x++) {
                if (this.arena[y][x] === 0) {
                    continue outer;
                }
            }
            const row = this.arena.splice(y, 1)[0].fill(0);
            this.arena.unshift(row);
            y++;
            this.player.score += rowCount * 10;
            rowCount *= 2;
        }
    }

    private collide(arena: number[][], player: any): boolean {
        const [m, o] = [player.matrix, player.pos];
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < m[y].length; ++x) {
                if (m[y][x] !== 0 &&
                    (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                    return true;
                }
            }
        }
        return false;
    }

    private createMatrix(w: number, h: number): number[][] {
        const matrix: number[][] = [];
        while (h--) {
            matrix.push(new Array(w).fill(0));
        }
        return matrix;
    }

    private createPiece(type: string): number[][] {
        if (type === 'T') {
            return [
                [0, 1, 0],
                [1, 1, 1],
                [0, 0, 0],
            ];
        } else if (type === 'O') {
            return [
                [2, 2],
                [2, 2],
            ];
        } else if (type === 'L') {
            return [
                [0, 3, 0],
                [0, 3, 0],
                [0, 3, 3],
            ];
        } else if (type === 'J') {
            return [
                [0, 4, 0],
                [0, 4, 0],
                [4, 4, 0],
            ];
        } else if (type === 'I') {
            return [
                [0, 5, 0, 0],
                [0, 5, 0, 0],
                [0, 5, 0, 0],
                [0, 5, 0, 0],
            ];
        } else if (type === 'S') {
            return [
                [0, 6, 6],
                [6, 6, 0],
                [0, 0, 0],
            ];
        } else if (type === 'Z') {
            return [
                [7, 7, 0],
                [0, 7, 7],
                [0, 0, 0],
            ];
        }
        return [];
    }

    private drawMatrix(matrix: number[][], offset: { x: number, y: number }) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.context.fillStyle = this.colors[value] as string;
                    this.context.fillRect(x + offset.x, y + offset.y, 1, 1);
                }
            });
        });
    }

    private draw() {
        this.context.fillStyle = '#000';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawMatrix(this.arena, { x: 0, y: 0 });
        if (this.player.matrix) {
            this.drawMatrix(this.player.matrix, this.player.pos);
        }
    }

    private merge(arena: number[][], player: any) {
        player.matrix.forEach((row: number[], y: number) => {
            row.forEach((value: number, x: number) => {
                if (value !== 0) {
                    arena[y + player.pos.y][x + player.pos.x] = value;
                }
            });
        });
    }

    private playerDrop() {
        this.player.pos.y++;
        if (this.collide(this.arena, this.player)) {
            this.player.pos.y--;
            this.merge(this.arena, this.player);
            this.playerReset();
            this.arenaSweep();
            this.updateScore();
        }
        this.dropCounter = 0;
    }

    private playerMove(dir: number) {
        this.player.pos.x += dir;
        if (this.collide(this.arena, this.player)) {
            this.player.pos.x -= dir;
        }
    }

    private playerReset() {
        const pieces = 'TJLOSZI';
        this.player.matrix = this.createPiece(pieces[Math.floor(Math.random() * pieces.length)]);
        this.player.pos.y = 0;
        this.player.pos.x = Math.floor(this.arena[0].length / 2) - Math.floor(this.player.matrix[0].length / 2);

        if (this.collide(this.arena, this.player)) {
            this.arena.forEach(row => row.fill(0));
            this.player.score = 0;
            this.updateScore();
            this.showGameOver();
        }
    }

    private playerRotate(dir: number) {
        const pos = this.player.pos.x;
        let offset = 1;
        this.rotate(this.player.matrix!, dir);
        while (this.collide(this.arena, this.player)) {
            this.player.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > this.player.matrix![0].length) {
                this.rotate(this.player.matrix!, -dir);
                this.player.pos.x = pos;
                return;
            }
        }
    }

    private rotate(matrix: number[][], dir: number) {
        for (let y = 0; y < matrix.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
            }
        }
        if (dir > 0) {
            matrix.forEach(row => row.reverse());
        } else {
            matrix.reverse();
        }
    }

    private updateProgress() {
        let blocks = 0;
        for (let y = 0; y < this.arena.length; y++) {
            for (let x = 0; x < this.arena[y].length; x++) {
                if (this.arena[y][x] !== 0) blocks++;
            }
        }
        const total = this.arena.length * this.arena[0].length;
        const percent = Math.floor((blocks / total) * 100);
        this.percentageElement.innerText = percent + '%';
        this.progressFill.style.width = percent + '%';
    }

    private update = (time = 0) => {
        if (this.gameOver) return;

        const deltaTime = time - this.lastTime;
        this.lastTime = time;

        this.dropCounter += deltaTime;
        if (this.dropCounter > this.dropInterval) {
            this.playerDrop();
        }

        this.draw();
        this.updateProgress();
        this.animationId = requestAnimationFrame(this.update);
    }

    private updateScore() {
        this.scoreElement.innerText = this.player.score.toString();
        if (this.gameOver) {
            this.updateHighScores();
        }
    }

    private showGameOver() {
        this.gameOver = true;
        this.gameOverElement.style.display = 'block';
        this.updateHighScores();
    }

    goHome() {
        this.router.navigate(['/home']);
    }

    restartGame() {
        this.gameOver = false;
        this.gameOverElement.style.display = 'none';
        this.arena = this.createMatrix(12, 20);
        this.player.score = 0;
        this.playerReset();
        this.updateScore();
        this.update();
        // No actualiza highScores aquí, solo al terminar el juego
    }

    private updateHighScores() {
        const playerName = 'Jugador';
        const score = this.player.score;
        this.highScores.push({ name: playerName, value: score });
        this.highScores = this.highScores
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
        localStorage.setItem('tetrisHighScores', JSON.stringify(this.highScores));
    }

    private loadHighScores() {
        const scores = localStorage.getItem('tetrisHighScores');
        if (scores) {
            this.highScores = JSON.parse(scores);
        } else {
            this.highScores = [
                { name: 'Jugador', value: 500 },
                { name: 'Jugador', value: 400 },
                { name: 'Jugador', value: 300 },
                { name: 'Jugador', value: 200 },
                { name: 'Jugador', value: 100 }
            ];
        }
    }
}

