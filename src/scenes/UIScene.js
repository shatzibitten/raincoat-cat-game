import Phaser from 'phaser';

/**
 * UIScene - HUD overlay during gameplay
 */
export default class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }

    create() {
        const { width } = this.cameras.main;
        
        // Time display
        this.timeText = this.add.text(16, 16, 'Time: 0', {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        });
        
        // Drops counter
        this.dropsIcon = this.add.image(16, 48, 'raindrop').setOrigin(0, 0.5).setScale(1.5);
        this.dropsText = this.add.text(36, 48, '0 / 0', {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#00bfff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0, 0.5);
        
        // Secrets counter
        this.secretsIcon = this.add.image(16, 76, 'secret_star').setOrigin(0, 0.5).setScale(1);
        this.secretsText = this.add.text(36, 76, '0 / 0', {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#ffd700',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0, 0.5);
        
        // Level indicator
        this.levelText = this.add.text(width - 16, 16, `Level ${window.gameState.currentLevel}`, {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#ffd700',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(1, 0);
        
        // Hook cooldown indicator
        this.hookIndicator = this.add.graphics();
        this.hookIndicator.setPosition(width - 40, 50);
        this.drawHookIndicator(1);
        
        // Combo display
        this.comboText = this.add.text(width - 16, 80, '', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#ff6600',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(1, 0);
        
        // Controls hint
        this.controlsHint = this.add.text(width / 2, this.cameras.main.height - 20, 
            'E or Click to Hook | ESC to Pause | R to Restart', {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#888888'
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: this.controlsHint,
            alpha: 0,
            delay: 5000,
            duration: 1000
        });
        
        // Listen to game events
        const gameScene = this.scene.get('GameScene');
        
        gameScene.events.on('updateTime', (time) => {
            this.timeText.setText(`Time: ${time}s`);
        });
        
        gameScene.events.on('collectDrop', (collected, total) => {
            this.dropsText.setText(`${collected} / ${total}`);
            this.pulseElement(this.dropsText);
        });
        
        gameScene.events.on('collectSecret', (collected, total) => {
            this.secretsText.setText(`${collected} / ${total}`);
            this.pulseElement(this.secretsText);
        });
        
        // Combo update
        this.time.addEvent({
            delay: 100,
            callback: () => {
                const combo = window.gameState.hookCombo;
                if (combo > 1) {
                    this.comboText.setText(`Combo x${combo}!`);
                    this.comboText.setAlpha(1);
                } else {
                    this.comboText.setAlpha(0);
                }
            },
            loop: true
        });
    }

    drawHookIndicator(progress) {
        this.hookIndicator.clear();
        
        // Background
        this.hookIndicator.fillStyle(0x333333, 0.8);
        this.hookIndicator.fillCircle(0, 0, 16);
        
        if (progress < 1) {
            // Cooldown arc
            this.hookIndicator.fillStyle(0xff6600, 1);
            this.hookIndicator.slice(0, 0, 14, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2, true);
            this.hookIndicator.fillPath();
        } else {
            // Ready
            this.hookIndicator.fillStyle(0x00ff00, 1);
            this.hookIndicator.fillCircle(0, 0, 14);
        }
        
        // Center dot
        this.hookIndicator.fillStyle(0xffffff, 1);
        this.hookIndicator.fillCircle(0, 0, 6);
    }

    pulseElement(element) {
        this.tweens.add({
            targets: element,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 100,
            yoyo: true
        });
    }

    update() {}
}
