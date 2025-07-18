import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Platform {
    x: number;
    y: number;
    width: number;
    height: number;
    element: HTMLElement;
}

interface Coin {
    x: number;
    y: number;
    width: number;
    height: number;
    collected: boolean;
    element: HTMLElement;
}

interface Enemy {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    direction: number;
    originX?: number;
    element: HTMLElement;
}

interface Player {
    x: number;
    y: number;
    width: number;
    height: number;
    velocityX: number;
    velocityY: number;
    speed: number;
    jumpPower: number;
    onGround: boolean;
}

@Component({
    selector: 'app-mario',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './mario.component.html',
    styleUrls: ['./mario.component.css']
})
export class MarioComponent implements OnInit, OnDestroy {
    private gameContainer!: HTMLElement;
    private playerEl!: HTMLElement;
    private shadowEl!: HTMLElement;
    private gameLoop: any;
    private animationId: any;

    score = 0;
    lives = 3;
    running = true;
    gameOver = false;

    private readonly gravity = 0.6;
    public platforms: Platform[] = [];
    public enemies: Enemy[] = [];
    public coins: Coin[] = [];
    public checkpoints: { x: number, y: number }[] = []; 
    public cameraX = 0;
    public keys: { [key: string]: boolean } = {};
    public worldWidth: number = 2000;
    public player: Player = {
        x: 50,
        y: 400,
        width: 40,
        height: 40,
        velocityX: 0,
        velocityY: 0,
        speed: 6,
        jumpPower: 15,
        onGround: false
    };
    public jumpCount = 0;
    public maxJumps = 2;
    private lastSpawnScore = 0;
    public checkpointX: number = 50;
    public checkpointY: number = 400;
    public isDead: boolean = false;
    public paused: boolean = false;
    public musicOn: boolean = true;

    constructor(private router: Router) { }

    ngOnInit() {
        setTimeout(() => {
            this.initializeGame();
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', this.handlePauseKey.bind(this));
            const music = document.getElementById('bg-music') as HTMLAudioElement;
            if (music) {
                music.volume = 0.25;
                music.play().catch(() => { });
            }
        }, 100);
    }

    ngOnDestroy() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.removeEventListeners();
        document.body.style.overflow = '';
        window.removeEventListener('keydown', this.handlePauseKey.bind(this));
        const music = document.getElementById('bg-music') as HTMLAudioElement;
        if (music) music.pause();
    }

    private initializeGame() {
        this.gameContainer = document.getElementById('game-container')!;
        this.playerEl = document.getElementById('player')!;
        this.shadowEl = document.getElementById('player-shadow')!;

        this.playerEl.innerHTML = '';
        this.playerEl.className = 'mario-css';

        if (!this.gameContainer || !this.playerEl || !this.shadowEl) {
            console.error('Game elements not found');
            return;
        }

        this.setupEventListeners();
        this.restartGame();
    }

    private setupEventListeners() {
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
    }

    private removeEventListeners() {
        document.removeEventListener('keydown', this.handleKeyDown.bind(this));
        document.removeEventListener('keyup', this.handleKeyUp.bind(this));
    }

    private handleKeyDown(e: KeyboardEvent) {
        const key = e.key.toLowerCase();
        this.keys[key] = true;

        if ([' ', 'arrowup', 'w'].includes(key)) {
            e.preventDefault();
            if (this.jumpCount < this.maxJumps) {
                this.player.velocityY = -this.player.jumpPower;
                this.player.onGround = false;
                this.jumpCount++;
                this.playJumpSound();
            }
        }
    }

    private handleKeyUp(e: KeyboardEvent) {
        this.keys[e.key.toLowerCase()] = false;
    }

    private createPlatform(x: number, y: number, width = 150, height = 20): Platform {
        const el = document.createElement('div');
        el.className = 'platform';
        el.style.width = width + 'px';
        el.style.height = height + 'px';
        this.gameContainer.appendChild(el);

        const platform: Platform = { x, y, width, height, element: el };
        this.platforms.push(platform);
        return platform;
    }

    private createCoin(x: number, y: number): Coin {
        const el = document.createElement('div');
        el.className = 'coin';
        this.gameContainer.appendChild(el);

        const coin: Coin = { x, y, width: 20, height: 20, collected: false, element: el };
        this.coins.push(coin);
        return coin;
    }

    private createSpider(x: number, y: number): Enemy {
        const el = document.createElement('div');
        el.className = 'spider';
        el.style.background = 'url(assets/spider.png) center/cover'; // Placeholder for sprite
        this.gameContainer.appendChild(el);
        const spider: Enemy = {
            x, y,
            width: 30,
            height: 20,
            speed: 1,
            direction: 1,
            element: el
        };
        this.enemies.push(spider);
        return spider;
    }

    private createBird(x: number, y: number): Enemy {
        const el = document.createElement('div');
        el.className = 'bird';
        el.style.background = 'url(assets/bird.png) center/cover';
        this.gameContainer.appendChild(el);
        const bird: Enemy = {
            x, y,
            width: 32,
            height: 24,
            speed: 2,
            direction: 1,
            element: el
        };
        this.enemies.push(bird);
        return bird;
    }

    private createFireball(x: number, y: number): Enemy {
        const el = document.createElement('div');
        el.className = 'fireball';
        el.style.background = 'radial-gradient(circle, #ff9800 60%, #d32f2f 100%)';
        this.gameContainer.appendChild(el);
        const fireball: Enemy = {
            x, y,
            width: 18,
            height: 18,
            speed: 3,
            direction: 1,
            element: el
        };
        this.enemies.push(fireball);
        return fireball;
    }

    private generateSection(startX: number): number {
        const num = Math.floor(3 + Math.random() * 4);
        let currentX = startX;
        for (let i = 0; i < num; i++) {
            const type = Math.random();
            const width = 80 + Math.random() * 120;
            const gap = 80 + Math.random() * 120;
            const y = 220 + Math.random() * 180;
            this.createPlatform(currentX, y, width, 20);
            this.createCoin(currentX + width / 2 - 10, y - 30);
            if (type < 0.33) {
                this.createSpider(currentX + 20, y - 20);
            } else if (type < 0.66) {
                this.createBird(currentX + width / 2, y - 40);
            } else {
                this.createFireball(currentX + width - 30, y - 10);
            }
            if (Math.random() > 0.7) {
                this.createPlatform(currentX + width / 2, y - 80, 60, 20);
                this.createCoin(currentX + width / 2 - 10, y - 110);
            }
            currentX += width + gap;
        }
        return currentX;
    }

    private checkCollision(a: any, b: any): boolean {
        return a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y;
    }

    private updatePlayer() {
        if (!this.running) return;

        // Checkpoint logic
        if (this.player.x > this.checkpointX + 400) {
            this.checkpointX = this.player.x;
            this.checkpointY = this.player.y;
            this.createCheckpointFlag(this.checkpointX, this.checkpointY);
        }

        // Movement
        if (this.keys['a'] || this.keys['arrowleft']) {
            this.player.velocityX = -this.player.speed;
        } else if (this.keys['d'] || this.keys['arrowright']) {
            this.player.velocityX = this.player.speed;
        } else {
            this.player.velocityX *= 0.8;
            if (Math.abs(this.player.velocityX) < 0.1) {
                this.player.velocityX = 0;
            }
        }

        // Gravity
        this.player.velocityY += this.gravity;
        this.player.x += this.player.velocityX;
        this.player.y += this.player.velocityY;

        // Boundary check
        if (this.player.x < 0) this.player.x = 0;

        // Platform collisions
        this.player.onGround = false;
        this.platforms.forEach(platform => {
            if (this.checkCollision(this.player, platform)) {
                if (this.player.velocityY > 0 && (this.player.y + this.player.height - platform.y) < 20) {
                    this.player.y = platform.y - this.player.height;
                    this.player.velocityY = 0;
                    this.player.onGround = true;
                    this.jumpCount = 0;
                } else if (this.player.velocityY < 0 && this.player.y < platform.y + platform.height) {
                    this.player.y = platform.y + platform.height;
                    this.player.velocityY = 0;
                }
            }
        });

        // Fall death
        if (this.player.y > window.innerHeight + 100) {
            this.lives--;
            this.playHitSound();
            this.triggerDeathAnimation();
            if (this.lives <= 0) {
                this.endGame();
            } else {
                setTimeout(() => {
                    this.resetPlayerToCheckpoint();
                }, 1200);
            }
        }

        // Camera
        const centerX = window.innerWidth / 2;
        this.cameraX = this.player.x > centerX ? this.player.x - centerX : 0;

        // Update visual position
        const visualX = this.player.x - this.cameraX;
        this.playerEl.style.left = visualX + 'px';
        this.playerEl.style.top = this.player.y + 'px';
        this.shadowEl.style.left = (visualX + 6) + 'px';
        this.shadowEl.style.top = (this.player.y + this.player.height - 5) + 'px';
    }

    // Angular death animation
    private triggerDeathAnimation() {
        this.isDead = true;
        setTimeout(() => {
            this.isDead = false;
        }, 1200);
    }

    // Angular checkpoint flag
    private createCheckpointFlag(x: number, y: number) {
        this.checkpoints.push({ x, y });
    }

    private updateEnemies() {
        this.enemies.forEach(enemy => {
            // Movement logic per enemy type
            if (enemy.element.classList.contains('spider')) {
                enemy.x += enemy.speed * enemy.direction;
                if (!enemy.originX) enemy.originX = enemy.x;
                if (enemy.x > enemy.originX + 50) enemy.direction = -1;
                else if (enemy.x < enemy.originX - 50) enemy.direction = 1;
            } else if (enemy.element.classList.contains('bird')) {
                enemy.x += enemy.speed * enemy.direction;
                enemy.y += Math.sin(Date.now() / 300) * 1.5;
                if (!enemy.originX) enemy.originX = enemy.x;
                if (enemy.x > enemy.originX + 120) enemy.direction = -1;
                else if (enemy.x < enemy.originX - 120) enemy.direction = 1;
            } else if (enemy.element.classList.contains('fireball')) {
                enemy.x += enemy.speed * enemy.direction;
                if (enemy.x > enemy.originX! + 80 || enemy.x < enemy.originX! - 80) enemy.direction *= -1;
            }
            enemy.element.style.left = (enemy.x - this.cameraX) + 'px';
            enemy.element.style.top = enemy.y + 'px';
            if (this.checkCollision(this.player, enemy)) {
                if (this.player.velocityY > 0 && (this.player.y + this.player.height - enemy.y) < 15) {
                    enemy.element.remove();
                    this.enemies = this.enemies.filter(e => e !== enemy);
                    this.player.velocityY = -this.player.jumpPower / 1.5;
                    this.score += 20;
                } else {
                    this.lives--;
                    this.playHitSound();
                    if (this.lives <= 0) {
                        this.endGame();
                    } else {
                        this.resetPlayer();
                    }
                }
            }
        });
    }

    private updateCoins() {
        this.coins.forEach(coin => {
            if (!coin.collected && this.checkCollision(this.player, coin)) {
                coin.collected = true;
                this.score += 10;
                coin.element.style.display = 'none';
                this.playCoinSound();
            }

            if (!coin.collected) {
                coin.element.style.left = (coin.x - this.cameraX) + 'px';
                coin.element.style.top = coin.y + 'px';
            }
        });
    }

    private updatePlatforms() {
        this.platforms.forEach(platform => {
            platform.element.style.left = (platform.x - this.cameraX) + 'px';
            platform.element.style.top = platform.y + 'px';
        });
    }

    // updateCheckpoints method removed!

    private resetPlayer() {
        this.player.x = this.cameraX + 50;
        this.player.y = 400;
        this.player.velocityX = 0;
        this.player.velocityY = 0;
    }

    private resetPlayerToCheckpoint() {
        this.player.x = this.checkpointX;
        this.player.y = this.checkpointY;
        this.player.velocityX = 0;
        this.player.velocityY = 0;
    }

    private endGame() {
        this.running = false;
        this.gameOver = true;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    private initWorld() {
        this.createPlatform(0, window.innerHeight - 50, 4000, 50);
        this.worldWidth = this.generateSection(500);
    }

    private runGameLoop() {
        if (!this.running) return;

        this.updatePlayer();
        this.updatePlatforms();
        this.updateEnemies();
        this.updateCoins();
        // updateCheckpoints removed

        if (this.cameraX + window.innerWidth > this.worldWidth - 600) {
            this.worldWidth = this.generateSection(this.worldWidth);
        }

        this.animationId = requestAnimationFrame(() => this.runGameLoop());
    }

    restartGame() {
        this.running = true;
        this.score = 0;
        this.lives = 3;
        this.gameOver = false;
        this.cameraX = 0;
        this.lastSpawnScore = 0;
        this.platforms = [];
        this.enemies = [];
        this.coins = [];
        this.checkpoints = [];
        this.initWorld();
        this.resetPlayer();
        this.runGameLoop();
    }

    private playJumpSound() {
        console.log('Jump sound');
    }

    private playCoinSound() {
        console.log('Coin sound');
    }

    private playHitSound() {
        console.log('Hit sound');
    }

    public handlePauseKey(e: KeyboardEvent) {
        if (e.key === 'Escape') {
            this.paused = !this.paused;
            if (this.paused) {
                this.running = false;
            } else {
                this.resumeGame();
            }
        }
    }

    public toggleMusic() {
        const music = document.getElementById('bg-music') as HTMLAudioElement;
        if (music) {
            this.musicOn = !this.musicOn;
            music.muted = !this.musicOn;
        }
    }

    public resumeGame() {
        this.paused = false;
        this.running = true;
        this.runGameLoop();
    }

    goHome() {
        this.router.navigate(['/home']);
    }
}