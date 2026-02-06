import Phaser from 'phaser';

/**
 * PauseScene - Pause menu overlay
 */
export default class PauseScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PauseScene' });
    }

    create() {
        const { width, height } = this.cameras.main;
        
        // Semi-transparent overlay
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
        
        // Title
        this.add.text(width / 2, 80, 'PAUSED', {
            fontSize: '40px',
            fontFamily: 'monospace',
            color: '#ffd700',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Buttons
        this.createButton(width / 2, 160, 'RESUME', () => {
            this.resumeGame();
        });
        
        this.createButton(width / 2, 210, 'RESTART', () => {
            this.scene.stop('UIScene');
            this.scene.stop('GameScene');
            window.gameState.hookCombo = 0;
            this.scene.start('GameScene');
        });
        
        this.createButton(width / 2, 260, 'MAIN MENU', () => {
            this.scene.stop('UIScene');
            this.scene.stop('GameScene');
            this.scene.start('MenuScene');
        });
        
        // ESC to resume
        this.input.keyboard.on('keydown-ESC', () => {
            this.resumeGame();
        });
        
        // Level indicator
        this.add.text(width / 2, height - 40, `Level ${window.gameState.currentLevel}`, {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#888888'
        }).setOrigin(0.5);
    }

    resumeGame() {
        const gameScene = this.scene.get('GameScene');
        gameScene.isPaused = false;
        gameScene.physics.resume();
        this.scene.stop();
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
