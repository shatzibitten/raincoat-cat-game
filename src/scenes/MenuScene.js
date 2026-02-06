import Phaser from 'phaser';

/**
 * MenuScene - Main menu with title and buttons
 */
export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const { width, height } = this.cameras.main;
        
        this.cameras.main.setBackgroundColor(0x1a1a2e);
        
        this.createBackgroundElements();
        
        // Title
        const title = this.add.text(width / 2, 80, 'RAINCOAT CAT', {
            fontSize: '48px',
            fontFamily: 'monospace',
            color: '#ffd700',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        this.add.text(width / 2, 120, 'A Grappling Hook Adventure', {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        // Cat mascot
        const cat = this.add.image(width / 2, 180, 'cat_idle').setScale(4);
        this.tweens.add({
            targets: cat,
            y: 190,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Buttons
        this.createButton(width / 2, 250, 'PLAY', () => {
            window.gameState.currentLevel = 1;
            window.gameState.score = 0;
            window.gameState.totalDrops = 0;
            window.gameState.totalSecrets = 0;
            window.gameState.levelStats = [];
            this.scene.start('GameScene');
        });
        
        this.createButton(width / 2, 300, 'CONTROLS', () => {
            this.scene.start('ControlsScene');
        });
        
        // Footer
        this.add.text(width / 2, height - 20, 'Made with Phaser 3', {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#666666'
        }).setOrigin(0.5);
        
        // Title animation
        this.tweens.add({
            targets: title,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    createBackgroundElements() {
        // Falling raindrops
        for (let i = 0; i < 15; i++) {
            const drop = this.add.image(
                Phaser.Math.Between(50, 590),
                Phaser.Math.Between(-50, 360),
                'raindrop'
            ).setScale(1.5).setAlpha(0.3);
            
            this.tweens.add({
                targets: drop,
                y: 400,
                duration: Phaser.Math.Between(3000, 6000),
                repeat: -1,
                onRepeat: () => {
                    drop.x = Phaser.Math.Between(50, 590);
                    drop.y = -20;
                }
            });
        }
        
        // Floating hook points
        for (let i = 0; i < 5; i++) {
            const hook = this.add.image(
                Phaser.Math.Between(100, 540),
                Phaser.Math.Between(50, 310),
                'hook_point'
            ).setScale(2).setAlpha(0.2);
            
            this.tweens.add({
                targets: hook,
                y: hook.y + 20,
                duration: Phaser.Math.Between(2000, 3000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    createButton(x, y, text, callback) {
        const button = this.add.image(x, y, 'button').setInteractive();
        const buttonText = this.add.text(x, y, text, {
            fontSize: '20px',
            fontFamily: 'monospace',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        button.on('pointerover', () => {
            button.setTexture('button_hover');
            buttonText.setColor('#ffd700');
            this.tweens.add({
                targets: [button, buttonText],
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 100
            });
        });
        
        button.on('pointerout', () => {
            button.setTexture('button');
            buttonText.setColor('#ffffff');
            this.tweens.add({
                targets: [button, buttonText],
                scaleX: 1,
                scaleY: 1,
                duration: 100
            });
        });
        
        button.on('pointerdown', () => {
            this.tweens.add({
                targets: [button, buttonText],
                scaleX: 0.95,
                scaleY: 0.95,
                duration: 50,
                yoyo: true,
                onComplete: callback
            });
        });
        
        return { button, buttonText };
    }
}
