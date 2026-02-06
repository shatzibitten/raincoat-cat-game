import Phaser from 'phaser';

/**
 * ControlsScene - Shows game controls and tips
 */
export default class ControlsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ControlsScene' });
    }

    create() {
        const { width, height } = this.cameras.main;
        
        this.cameras.main.setBackgroundColor(0x1a1a2e);
        
        // Title
        this.add.text(width / 2, 40, 'CONTROLS', {
            fontSize: '36px',
            fontFamily: 'monospace',
            color: '#ffd700',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Controls list
        const controls = [
            { key: 'A / D  or  ← / →', action: 'Move Left / Right' },
            { key: 'SPACE  or  W / ↑', action: 'Jump' },
            { key: 'E  or  Left Click', action: 'Fire Grappling Hook' },
            { key: 'Arrow Keys / Mouse', action: 'Aim Hook Direction' },
            { key: 'E again  or  Right Click', action: 'Cancel Hook' },
            { key: 'ESC', action: 'Pause Game' },
            { key: 'R', action: 'Restart Level' }
        ];
        
        const startY = 90;
        const lineHeight = 35;
        
        controls.forEach((control, index) => {
            const y = startY + index * lineHeight;
            
            this.add.text(width / 2 - 20, y, control.key, {
                fontSize: '14px',
                fontFamily: 'monospace',
                color: '#ffd700'
            }).setOrigin(1, 0.5);
            
            this.add.text(width / 2, y, ':', {
                fontSize: '14px',
                fontFamily: 'monospace',
                color: '#ffffff'
            }).setOrigin(0.5, 0.5);
            
            this.add.text(width / 2 + 20, y, control.action, {
                fontSize: '14px',
                fontFamily: 'monospace',
                color: '#ffffff'
            }).setOrigin(0, 0.5);
        });
        
        // Tips section
        this.add.text(width / 2, 280, 'TIPS', {
            fontSize: '24px',
            fontFamily: 'monospace',
            color: '#ffd700'
        }).setOrigin(0.5);
        
        const tips = [
            '• Look for golden hook points to grapple',
            '• Chain hooks without touching ground for combos',
            '• Find hidden stars for bonus points'
        ];
        
        tips.forEach((tip, index) => {
            this.add.text(width / 2, 305 + index * 20, tip, {
                fontSize: '12px',
                fontFamily: 'monospace',
                color: '#aaaaaa'
            }).setOrigin(0.5);
        });
        
        // Back button
        this.createButton(width / 2, height - 40, 'BACK', () => {
            this.scene.start('MenuScene');
        });
        
        // ESC to go back
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start('MenuScene');
        });
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
        });
        
        button.on('pointerout', () => {
            button.setTexture('button');
            buttonText.setColor('#ffffff');
        });
        
        button.on('pointerdown', callback);
        
        return { button, buttonText };
    }
}
