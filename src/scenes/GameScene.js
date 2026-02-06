import Phaser from 'phaser';
import Player from '../Player.js';
import Enemy from '../Enemy.js';
import { getLevelData } from '../levels.js';
import { getSoundManager } from '../SoundManager.js';

/**
 * GameScene - Main gameplay scene
 */
export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        this.currentLevel = window.gameState.currentLevel;
        this.levelData = getLevelData(this.currentLevel - 1);
        
        if (!this.levelData) {
            console.error('Level not found:', this.currentLevel);
            this.scene.start('MenuScene');
            return;
        }
        
        this.sound = getSoundManager(this);
        this.levelStartTime = this.time.now;
        this.dropsCollected = 0;
        this.secretsCollected = 0;
        this.totalDrops = 0;
        this.totalSecrets = 0;
        this.isPaused = false;
        this.levelComplete = false;
        
        // Set world bounds
        this.physics.world.setBounds(0, 0, this.levelData.width, this.levelData.height);
        
        // Create level elements
        this.createBackground();
        this.createGround();
        this.createPlatforms();
        this.createSpikes();
        this.createHookPoints();
        this.createCheckpoints();
        this.createFinish();
        this.createCollectibles();
        this.createEnemies();
        
        // Create player
        this.spawnPoint = { ...this.levelData.playerStart };
        this.player = new Player(this, this.spawnPoint.x, this.spawnPoint.y);
        
        // Setup collisions
        this.setupCollisions();
        
        // Setup camera
        this.setupCamera();
        
        // Launch UI
        this.scene.launch('UIScene');
        
        // Initial UI update
        this.time.delayedCall(100, () => {
            this.events.emit('collectDrop', this.dropsCollected, this.totalDrops);
            this.events.emit('collectSecret', this.secretsCollected, this.totalSecrets);
        });
        
        // Setup input
        this.setupInput();
        
        // Show level intro
        this.showLevelIntro();
    }

    createBackground() {
        const tilesX = Math.ceil(this.levelData.width / 64) + 2;
        const tilesY = Math.ceil(this.levelData.height / 64) + 2;
        
        for (let x = 0; x < tilesX; x++) {
            for (let y = 0; y < tilesY; y++) {
                this.add.image(x * 64, y * 64, 'bg_sky')
                    .setOrigin(0, 0)
                    .setScrollFactor(0.5)
                    .setDepth(-10);
            }
        }
        
        // Gradient overlay
        const overlay = this.add.graphics();
        overlay.fillGradientStyle(0x87ceeb, 0x87ceeb, 0x4a7c23, 0x4a7c23, 1);
        overlay.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
        overlay.setScrollFactor(0);
        overlay.setDepth(-9);
        overlay.setAlpha(0.3);
    }

    createGround() {
        this.ground = this.physics.add.staticGroup();
        
        this.levelData.ground.forEach(tile => {
            const texture = `tile_${tile.type}`;
            const ground = this.ground.create(tile.x, tile.y, texture);
            ground.setOrigin(0.5, 0.5);
            ground.refreshBody();
        });
    }

    createPlatforms() {
        this.platforms = this.physics.add.staticGroup();
        
        this.levelData.platforms.forEach(plat => {
            const platform = this.platforms.create(plat.x, plat.y, 'tile_platform');
            platform.setOrigin(0.5, 0.5);
            platform.body.checkCollision.down = false;
            platform.body.checkCollision.left = false;
            platform.body.checkCollision.right = false;
            platform.refreshBody();
        });
    }

    createSpikes() {
        this.spikes = this.physics.add.staticGroup();
        
        this.levelData.spikes.forEach(spike => {
            const s = this.spikes.create(spike.x, spike.y, 'tile_spike');
            s.setOrigin(0.5, 0.5);
            s.body.setSize(14, 8);
            s.body.setOffset(1, 8);
            s.refreshBody();
        });
    }

    createHookPoints() {
        this.hookPoints = this.physics.add.staticGroup();
        
        this.levelData.hookPoints.forEach(point => {
            const hp = this.hookPoints.create(point.x, point.y, 'hook_point');
            hp.setOrigin(0.5, 0.5);
            
            this.tweens.add({
                targets: hp,
                y: point.y - 4,
                duration: 1500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        });
    }

    createCheckpoints() {
        this.checkpoints = this.physics.add.staticGroup();
        this.activeCheckpoints = new Set();
        
        this.levelData.checkpoints.forEach((cp, index) => {
            const checkpoint = this.checkpoints.create(cp.x, cp.y - 4, 'checkpoint');
            checkpoint.setOrigin(0.5, 1);
            checkpoint.checkpointIndex = index;
            checkpoint.refreshBody();
        });
    }

    createFinish() {
        if (!this.levelData.finish) {
            console.error('No finish point in level data!');
            return;
        }
        
        this.finish = this.physics.add.staticImage(
            this.levelData.finish.x,
            this.levelData.finish.y - 8,
            'finish'
        );
        this.finish.setOrigin(0.5, 1);
        this.finish.body.setSize(32, 48);
        this.finish.body.setOffset(-8, -16);
        this.finish.refreshBody();
        
        this.tweens.add({
            targets: this.finish,
            scaleX: 1.05,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        console.log('Finish created at:', this.levelData.finish.x, this.levelData.finish.y);
    }

    createCollectibles() {
        this.raindrops = this.physics.add.group();
        
        this.levelData.raindrops.forEach(drop => {
            const raindrop = this.raindrops.create(drop.x, drop.y, 'raindrop');
            raindrop.body.setAllowGravity(false);
            raindrop.setOrigin(0.5, 0.5);
            
            this.tweens.add({
                targets: raindrop,
                y: drop.y - 4,
                duration: 1000 + Math.random() * 500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            
            this.totalDrops++;
        });
        
        this.secrets = this.physics.add.group();
        
        this.levelData.secrets.forEach(secret => {
            const star = this.secrets.create(secret.x, secret.y, 'secret_star');
            star.body.setAllowGravity(false);
            star.setOrigin(0.5, 0.5);
            
            this.tweens.add({
                targets: star,
                angle: 360,
                duration: 3000,
                repeat: -1
            });
            
            this.tweens.add({
                targets: star,
                alpha: 0.6,
                duration: 500,
                yoyo: true,
                repeat: -1
            });
            
            this.totalSecrets++;
        });
    }

    createEnemies() {
        this.enemies = this.physics.add.group();
        
        this.levelData.enemies.forEach(enemy => {
            const e = new Enemy(this, enemy.x, enemy.y, enemy.type);
            this.enemies.add(e);
        });
    }

    setupCollisions() {
        this.physics.add.collider(this.player, this.ground);
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.enemies, this.ground);
        
        this.physics.add.overlap(this.player, this.spikes, this.hitSpikes, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);
        this.physics.add.overlap(this.player, this.checkpoints, this.activateCheckpoint, null, this);
        
        if (this.finish) {
            this.physics.add.overlap(this.player, this.finish, this.reachFinish, null, this);
        }
        
        this.physics.add.overlap(this.player, this.raindrops, this.collectRaindrop, null, this);
        this.physics.add.overlap(this.player, this.secrets, this.collectSecret, null, this);
    }

    setupCamera() {
        this.cameras.main.setBounds(0, 0, this.levelData.width, this.levelData.height);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setDeadzone(64, 32);
        this.cameras.main.setZoom(1);
    }

    setupInput() {
        this.input.keyboard.on('keydown-ESC', () => {
            this.togglePause();
        });
        
        this.input.keyboard.on('keydown-R', () => {
            this.restartLevel();
        });
    }

    showLevelIntro() {
        const { width, height } = this.cameras.main;
        
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
            .setScrollFactor(0)
            .setDepth(100);
        
        const levelText = this.add.text(width / 2, height / 2 - 20, `Level ${this.currentLevel}`, {
            fontSize: '32px',
            fontFamily: 'monospace',
            color: '#ffd700'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(101);
        
        const nameText = this.add.text(width / 2, height / 2 + 20, this.levelData.name, {
            fontSize: '24px',
            fontFamily: 'monospace',
            color: '#ffffff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(101);
        
        this.time.delayedCall(1500, () => {
            this.tweens.add({
                targets: [overlay, levelText, nameText],
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    overlay.destroy();
                    levelText.destroy();
                    nameText.destroy();
                }
            });
        });
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.physics.pause();
            this.scene.launch('PauseScene');
        } else {
            this.physics.resume();
            this.scene.stop('PauseScene');
        }
    }

    hitSpikes(player, spike) {
        if (!player.isDead && !player.isHurt) {
            player.die();
        }
    }

    hitEnemy(player, enemy) {
        if (player.isDead || player.isHurt) return;
        
        // Stomp from above
        if (player.body.velocity.y > 0 && player.y < enemy.y - 8) {
            enemy.destroy();
            player.setVelocityY(-200);
            this.sound.playStomp();
            
            this.add.particles(enemy.x, enemy.y, 'particle_sparkle', {
                speed: 100,
                scale: { start: 1, end: 0 },
                lifespan: 300,
                quantity: 5
            }).explode();
        } else {
            player.hurt();
        }
    }

    activateCheckpoint(player, checkpoint) {
        if (this.activeCheckpoints.has(checkpoint.checkpointIndex)) return;
        
        this.activeCheckpoints.add(checkpoint.checkpointIndex);
        this.spawnPoint = { x: checkpoint.x, y: checkpoint.y - 16 };
        
        checkpoint.setTexture('checkpoint_active');
        this.sound.playCheckpoint();
        
        this.add.particles(checkpoint.x, checkpoint.y - 12, 'particle_sparkle', {
            speed: 50,
            scale: { start: 1, end: 0 },
            lifespan: 500,
            quantity: 10,
            emitting: false
        }).explode();
    }

    reachFinish(player, finish) {
        if (this.levelComplete) return;
        this.levelComplete = true;
        
        const time = Math.floor((this.time.now - this.levelStartTime) / 1000);
        const parTime = this.levelData.parTime;
        
        // Calculate bonus
        let timeBonus = 0;
        if (time < parTime * 0.75) {
            timeBonus = 1000;
        } else if (time < parTime) {
            timeBonus = 500;
        }
        
        const comboBonus = window.gameState.hookCombo * 50;
        const score = this.dropsCollected * 10 + this.secretsCollected * 100 + timeBonus + comboBonus;
        
        // Save stats
        window.gameState.levelStats.push({
            level: this.currentLevel,
            time: time,
            drops: this.dropsCollected,
            totalDrops: this.totalDrops,
            secrets: this.secretsCollected,
            totalSecrets: this.totalSecrets,
            score: score,
            hookCombo: window.gameState.hookCombo
        });
        
        window.gameState.score += score;
        window.gameState.totalDrops += this.dropsCollected;
        window.gameState.totalSecrets += this.secretsCollected;
        
        this.sound.playLevelComplete();
        
        player.setVelocity(0, 0);
        player.body.setAllowGravity(false);
        
        this.tweens.add({
            targets: player,
            y: player.y - 20,
            duration: 500,
            yoyo: true,
            repeat: 2,
            onComplete: () => {
                this.scene.stop('UIScene');
                this.scene.start('LevelCompleteScene', {
                    level: this.currentLevel,
                    time: time,
                    parTime: parTime,
                    drops: this.dropsCollected,
                    totalDrops: this.totalDrops,
                    secrets: this.secretsCollected,
                    totalSecrets: this.totalSecrets,
                    score: score,
                    hookCombo: window.gameState.hookCombo
                });
            }
        });
    }

    collectRaindrop(player, raindrop) {
        raindrop.destroy();
        this.dropsCollected++;
        
        this.add.particles(raindrop.x, raindrop.y, 'particle_sparkle', {
            speed: 50,
            scale: { start: 1, end: 0 },
            lifespan: 300,
            quantity: 3,
            tint: 0x00bfff
        }).explode();
        
        this.sound.playCollect();
        this.events.emit('collectDrop', this.dropsCollected, this.totalDrops);
    }

    collectSecret(player, secret) {
        secret.destroy();
        this.secretsCollected++;
        
        this.add.particles(secret.x, secret.y, 'particle_sparkle', {
            speed: 80,
            scale: { start: 1.5, end: 0 },
            lifespan: 500,
            quantity: 8,
            tint: 0xffd700
        }).explode();
        
        this.sound.playSecret();
        this.events.emit('collectSecret', this.secretsCollected, this.totalSecrets);
    }

    respawnPlayer() {
        this.player.respawn(this.spawnPoint.x, this.spawnPoint.y);
        window.gameState.hookCombo = 0;
    }

    restartLevel() {
        this.scene.stop('UIScene');
        window.gameState.hookCombo = 0;
        this.scene.restart();
    }

    update(time, delta) {
        if (this.isPaused) return;
        
        // Update player
        if (this.player && !this.player.isDead) {
            this.player.update(time, delta);
        }
        
        // Update enemies
        this.enemies.getChildren().forEach(enemy => {
            enemy.update(time, delta);
        });
        
        // Check for death by falling
        const deathY = Math.max(this.levelData.height, this.cameras.main.scrollY + this.cameras.main.height) + 50;
        if (this.player && this.player.y > deathY) {
            this.player.die();
        }
        
        // Update time display
        const elapsed = Math.floor((time - this.levelStartTime) / 1000);
        this.events.emit('updateTime', elapsed);
    }
}
