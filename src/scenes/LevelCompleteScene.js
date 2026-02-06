import Phaser from 'phaser';

/**
 * LevelCompleteScene - Shows stats after completing a level
 */
export default class LevelCompleteScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LevelCompleteScene' });
    }

    init(data) {
        this.levelData = data;
    }

    create() {
        const { width, height } = this.cameras.main;
        
        this.cameras.main.setBackgroundColor(0x1a1a2e);
        
        // Title
        this.add.text(width / 2, 40, 'LEVEL COMPLETE!', {
            fontSize: '32px',
            fontFamily: 'monospace',
            color: '#ffd700',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        this.add.text(width / 2, 75, `Level ${this.levelData.level}`, {
            fontSize: '20px',
            fontFamily: 'monospace',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        // Stats
        const startY = 120;
        const lineHeight = 30;
        const timeColor = this.levelData.time < this.levelData.parTime ? '#00ff00' : '#ffffff';
        
        this.add.text(width / 2 - 100, startY, 'Time:', {
            fontSize: '18px',
            fontFamily: 'monospace',
            color: '#aaaaaa'
        });
        this.add.text(width / 2 + 100, startY, `${this.levelData.time}s`, {
            fontSize: '18px',
            fontFamily: 'monospace',
            color: timeColor
        }).setOrigin(1, 0);
        
        this.add.text(width / 2 - 100, startY + lineHeight, 'Par Time:', {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#666666'
        });
        this.add.text(width / 2 + 100, startY + lineHeight, `${this.levelData.parTime}s`, {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#666666'
        }).setOrigin(1, 0);
        
        this.add.text(width / 2 - 100, startY + lineHeight * 2, 'Raindrops:', {
            fontSize: '18px',
            fontFamily: 'monospace',
            color: '#00bfff'
        });
        this.add.text(width / 2 + 100, startY + lineHeight * 2, 
            `${this.levelData.drops} / ${this.levelData.totalDrops}`, {
            fontSize: '18px',
            fontFamily: 'monospace',
            color: '#00bfff'
        }).setOrigin(1, 0);
        
        this.add.text(width / 2 - 100, startY + lineHeight * 3, 'Secrets:', {
            fontSize: '18px',
            fontFamily: 'monospace',
            color: '#ffd700'
        });
        this.add.text(width / 2 + 100, startY + lineHeight * 3, 
            `${this.levelData.secrets} / ${this.levelData.totalSecrets}`, {
            fontSize: '18px',
            fontFamily: 'monospace',
            color: '#ffd700'
        }).setOrigin(1, 0);
        
        if (this.levelData.hookCombo > 1) {
            this.add.text(width / 2 - 100, startY + lineHeight * 4, 'Best Combo:', {
                fontSize: '18px',
                fontFamily: 'monospace',
                color: '#ff6600'
            });
            this.add.text(width / 2 + 100, startY + lineHeight * 4, `x${this.levelData.hookCombo}`, {
                fontSize: '18px',
                fontFamily: 'monospace',
                color: '#ff6600'
            }).setOrigin(1, 0);
        }
        
        // Score
        this.add.text(width / 2, startY + lineHeight * 5.5, 'SCORE', {
            fontSize: '24px',
            fontFamily: 'monospace',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        const scoreText = this.add.text(width / 2, startY + lineHeight * 6.5, 
            this.levelData.score.toString(), {
            fontSize: '36px',
            fontFamily: 'monospace',
            color: '#ffd700'
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: scoreText,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 500,
            yoyo: true,
            repeat: 1
        });
        
        // Buttons
        if (window.gameState.currentLevel >= window.gameState.totalLevels) {
            this.createButton(width / 2, height - 60, 'VIEW RESULTS', () => {
                this.scene.start('GameOverScene');
            });
        } else {
            this.createButton(width / 2, height - 60, 'NEXT LEVEL', () => {
                window.gameState.currentLevel++;
                window.gameState.hookCombo = 0;
                this.scene.start('GameScene');
            });
        }
        
        this.createButton(width / 2, height - 110, 'RETRY', () => {
            window.gameState.levelStats.pop();
            window.gameState.score -= this.levelData.score;
            window.gameState.totalDrops -= this.levelData.drops;
            window.gameState.totalSecrets -= this.levelData.secrets;
            window.gameState.hookCombo = 0;
            this.scene.start('GameScene');
        });
        
        // Sparkle effects
        for (let i = 0; i < 20; i++) {
            const sparkle = this.add.image(
                Phaser.Math.Between(50, width - 50),
                Phaser.Math.Between(50, height - 50),
                'particle_sparkle'
            ).setAlpha(0.5).setScale(Phaser.Math.FloatBetween(0.5, 1.5));
            
            this.tweens.add({
                targets: sparkle,
                y: sparkle.y - 20,
                alpha: 0,
                duration: Phaser.Math.Between(1000, 2000),
                repeat: -1,
                onRepeat: () => {
                    sparkle.x = Phaser.Math.Between(50, width - 50);
                    sparkle.y = Phaser.Math.Between(50, height - 50);
                    sparkle.alpha = 0.5;
                }
            });
        }
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
