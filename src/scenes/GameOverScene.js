import Phaser from 'phaser';

/**
 * GameOverScene - Final results after completing all levels
 */
export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    create() {
        const { width, height } = this.cameras.main;
        
        this.cameras.main.setBackgroundColor(0x1a1a2e);
        
        // Title
        this.add.text(width / 2, 30, 'CONGRATULATIONS!', {
            fontSize: '32px',
            fontFamily: 'monospace',
            color: '#ffd700',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        this.add.text(width / 2, 60, 'You completed all levels!', {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        // Cat celebration
        const cat = this.add.image(width / 2, 100, 'cat_idle').setScale(4);
        this.tweens.add({
            targets: cat,
            y: 90,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Stats table
        const stats = window.gameState.levelStats;
        const startY = 140;
        const lineHeight = 22;
        
        // Headers
        this.add.text(60, startY, 'LVL', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#888888'
        });
        this.add.text(120, startY, 'TIME', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#888888'
        });
        this.add.text(200, startY, 'DROPS', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#888888'
        });
        this.add.text(300, startY, 'STARS', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#888888'
        });
        this.add.text(400, startY, 'SCORE', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#888888'
        });
        
        // Level rows
        stats.forEach((stat, index) => {
            const y = startY + (index + 1) * lineHeight;
            
            this.add.text(60, y, stat.level.toString(), {
                fontSize: '14px',
                fontFamily: 'monospace',
                color: '#ffffff'
            });
            this.add.text(120, y, `${stat.time}s`, {
                fontSize: '14px',
                fontFamily: 'monospace',
                color: '#ffffff'
            });
            this.add.text(200, y, `${stat.drops}/${stat.totalDrops}`, {
                fontSize: '14px',
                fontFamily: 'monospace',
                color: '#00bfff'
            });
            this.add.text(300, y, `${stat.secrets}/${stat.totalSecrets}`, {
                fontSize: '14px',
                fontFamily: 'monospace',
                color: '#ffd700'
            });
            this.add.text(400, y, stat.score.toString(), {
                fontSize: '14px',
                fontFamily: 'monospace',
                color: '#ffffff'
            });
        });
        
        // Totals
        const totalY = startY + (stats.length + 1.5) * lineHeight;
        
        this.add.text(60, totalY, 'TOTAL', {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#ffd700'
        });
        
        const totalTime = stats.reduce((sum, s) => sum + s.time, 0);
        this.add.text(120, totalY, `${totalTime}s`, {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#ffd700'
        });
        
        const totalDrops = stats.reduce((sum, s) => sum + s.drops, 0);
        const maxDrops = stats.reduce((sum, s) => sum + s.totalDrops, 0);
        this.add.text(200, totalY, `${totalDrops}/${maxDrops}`, {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#00bfff'
        });
        
        const totalSecrets = stats.reduce((sum, s) => sum + s.secrets, 0);
        const maxSecrets = stats.reduce((sum, s) => sum + s.totalSecrets, 0);
        this.add.text(300, totalY, `${totalSecrets}/${maxSecrets}`, {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#ffd700'
        });
        
        // Final score
        this.add.text(width / 2, height - 100, 'FINAL SCORE', {
            fontSize: '20px',
            fontFamily: 'monospace',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        const finalScore = this.add.text(width / 2, height - 70, 
            window.gameState.score.toString(), {
            fontSize: '40px',
            fontFamily: 'monospace',
            color: '#ffd700'
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: finalScore,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Play again button
        this.createButton(width / 2, height - 25, 'PLAY AGAIN', () => {
            window.gameState.currentLevel = 1;
            window.gameState.score = 0;
            window.gameState.totalDrops = 0;
            window.gameState.totalSecrets = 0;
            window.gameState.levelStats = [];
            window.gameState.hookCombo = 0;
            this.scene.start('MenuScene');
        });
        
        // Celebration particles
        this.time.addEvent({
            delay: 500,
            callback: () => {
                const x = Phaser.Math.Between(50, width - 50);
                this.add.particles(x, height, 'particle_sparkle', {
                    speed: { min: 100, max: 200 },
                    angle: { min: 250, max: 290 },
                    scale: { start: 1, end: 0 },
                    lifespan: 1000,
                    quantity: 5,
                    tint: [0xffd700, 0x00bfff, 0xff6600]
                }).explode();
            },
            repeat: -1
        });
    }

    createButton(x, y, text, callback) {
        const button = this.add.image(x, y, 'button').setInteractive();
        const buttonText = this.add.text(x, y, text, {
            fontSize: '18px',
            fontFamily: 'monospace',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        button.on('pointerover', () => {
            button.setTexture('button_hover');
            buttonText.setColor('#ffd700');
        });
        
        button.on('pointerout', () => {
            button.setTexture('button');
            buttonText.setColor('#ffffff');
        });
        
        button.on('pointerdown', callback);
        
        return { button, buttonText };
    }
}
