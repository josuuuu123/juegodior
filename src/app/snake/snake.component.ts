import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
    selector: 'app-snake',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './snake.component.html',
    styleUrls: ['./snake.component.css']
})
export class SnakeComponent implements OnInit, OnDestroy {
    highScores = [
        { name: 'Josuuuu', value: 50 },
        { name: 'Maria', value: 20 },
        { name: 'Luis', value: 10 }
    ];
    private canvas!: HTMLCanvasElement;
    private ctx!: CanvasRenderingContext2D;
    private gameLoop: any;
    private isPaused = false;
    private gameSpeed = 100;

    private readonly GRID_SIZE = 20;
    private readonly TILE_COUNT = 20; // 400px / 20px = 20

    private snake = [{ x: 10, y: 10 }];
    private food = { x: 0, y: 0 };
    private direction = { x: 0, y: 0 };
    private nextDirection = { x: 0, y: 0 };
    private score = 0;
    private highScore = 0;

    constructor(private router: Router) { }

    ngOnInit() {
        setTimeout(() => {
            this.initializeGame();
        }, 100);
    }

    ngOnDestroy() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }
        document.removeEventListener('keydown', this.handleKeyPress);
    }

    private initializeGame() {
        this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
        if (!this.canvas) {
            console.error('Canvas not found');
            return;
        }

        this.ctx = this.canvas.getContext('2d')!;
        this.highScore = parseInt(localStorage.getItem('snakeHighScore') || '0');

        this.updateHighScoreDisplay();
        this.drawGame();

        document.addEventListener('keydown', this.handleKeyPress.bind(this));
    }

    startGame() {

        this.snake = [{ x: 10, y: 10 }];
        this.score = 0;
        this.direction = { x: 0, y: 0 };
        this.nextDirection = { x: 0, y: 0 };
        this.gameSpeed = 100;
        this.isPaused = false;

        this.updateScoreDisplay();
        this.spawnFood();


        const startScreen = document.getElementById('start-screen');
        const gameOverScreen = document.getElementById('game-over-screen');
        if (startScreen) startScreen.style.display = 'none';
        if (gameOverScreen) gameOverScreen.style.display = 'none';


        if (this.gameLoop) clearInterval(this.gameLoop);
        this.gameLoop = setInterval(() => this.updateGame(), this.gameSpeed);
    }

    private spawnFood() {
        let newFoodPosition: { x: number; y: number } = { x: 0, y: 0 };
        let isOnSnake = true;


        while (isOnSnake) {
            newFoodPosition = {
                x: Math.floor(Math.random() * this.TILE_COUNT),
                y: Math.floor(Math.random() * this.TILE_COUNT)
            };

            isOnSnake = this.snake.some(segment =>
                segment.x === newFoodPosition.x && segment.y === newFoodPosition.y
            );
        }

        this.food = newFoodPosition;
    }

    private updateGame() {
        if (this.isPaused) return;


        if (
            (this.nextDirection.x !== 0 && this.direction.x === 0) ||
            (this.nextDirection.y !== 0 && this.direction.y === 0)
        ) {
            this.direction = { ...this.nextDirection };
        }

    
        const head = {
            x: this.snake[0].x + this.direction.x,
            y: this.snake[0].y + this.direction.y
        };
        this.snake.unshift(head);

      
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateScoreDisplay();

      
            if (this.score % 50 === 0 && this.gameSpeed > 60) {
                this.gameSpeed -= 10;
                clearInterval(this.gameLoop);
                this.gameLoop = setInterval(() => this.updateGame(), this.gameSpeed);
            }

            this.spawnFood();
        } else {
            this.snake.pop();
        }


        if (
            head.x < 0 || head.x >= this.TILE_COUNT ||
            head.y < 0 || head.y >= this.TILE_COUNT ||
            this.snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)
        ) {
            this.gameOver();
            return;
        }


        this.drawGame();
    }

    private drawGame() {
        if (!this.ctx) return;


        this.ctx.fillStyle = '#0f0f0f';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);


        this.ctx.fillStyle = '#f44336';
        this.ctx.fillRect(
            this.food.x * this.GRID_SIZE,
            this.food.y * this.GRID_SIZE,
            this.GRID_SIZE,
            this.GRID_SIZE
        );


        this.snake.forEach((segment, index) => {

            this.ctx.fillStyle = index === 0 ? '#4CAF50' : '#2E7D32';
            this.ctx.fillRect(
                segment.x * this.GRID_SIZE,
                segment.y * this.GRID_SIZE,
                this.GRID_SIZE,
                this.GRID_SIZE
            );

            this.ctx.strokeStyle = '#1a1a1a';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(
                segment.x * this.GRID_SIZE,
                segment.y * this.GRID_SIZE,
                this.GRID_SIZE,
                this.GRID_SIZE
            );
        });

        this.ctx.strokeStyle = '#2a2a2a';
        this.ctx.lineWidth = 0.5;
        for (let i = 0; i < this.TILE_COUNT; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.GRID_SIZE, 0);
            this.ctx.lineTo(i * this.GRID_SIZE, this.canvas.height);
            this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.GRID_SIZE);
            this.ctx.lineTo(this.canvas.width, i * this.GRID_SIZE);
            this.ctx.stroke();
        }
    }

    private gameOver() {
        if (this.gameLoop) clearInterval(this.gameLoop);
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore.toString());
        }
        this.updateHighScores();
        this.updateHighScoreDisplay();
        this.updateFinalScoreDisplay();
        const gameOverScreen = document.getElementById('game-over-screen');
        if (gameOverScreen) gameOverScreen.style.display = 'flex';
    }

    private updateHighScores() {
        const playerName = 'Jugador';
        const minScore = Math.min(...this.highScores.map(s => s.value));
        if (this.score > minScore) {
            this.highScores.push({ name: playerName, value: this.score });
            this.highScores = this.highScores
                .sort((a, b) => b.value - a.value)
                .slice(0, 5);
        }
    }
    private handleKeyPress = (e: KeyboardEvent) => {
        if (!e.key.startsWith('Arrow') && e.code !== 'Space') return;
        e.preventDefault();
        if (e.key === ' ' || e.code === 'Space') {
            this.isPaused = !this.isPaused;
            return;
        }
        switch (e.key) {
            case 'ArrowUp':
                if (this.direction.y === 0) this.nextDirection = { x: 0, y: -1 };
                break;
            case 'ArrowDown':
                if (this.direction.y === 0) this.nextDirection = { x: 0, y: 1 };
                break;
            case 'ArrowLeft':
                if (this.direction.x === 0) this.nextDirection = { x: -1, y: 0 };
                break;
            case 'ArrowRight':
                if (this.direction.x === 0) this.nextDirection = { x: 1, y: 0 };
                break;
        }
    }

    private updateScoreDisplay() {
        const scoreElement = document.getElementById('score');
        if (scoreElement) scoreElement.textContent = this.score.toString();
    }

    private updateHighScoreDisplay() {
        const highScoreElement = document.getElementById('high-score');
        if (highScoreElement) highScoreElement.textContent = this.highScore.toString();
    }

    private updateFinalScoreDisplay() {
        const finalScoreElement = document.getElementById('final-score');
        const finalHighScoreElement = document.getElementById('final-high-score');
        if (finalScoreElement) finalScoreElement.textContent = this.score.toString();
        if (finalHighScoreElement) finalHighScoreElement.textContent = this.highScore.toString();
    }

    togglePause() {
        this.isPaused = !this.isPaused;
    }

    goHome() {
        this.router.navigate(['/home']);
    }
}
