import Phaser from 'phaser';

/**
 * BootScene - Initial boot scene
 */
export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        this.load.on('complete', () => {
            this.scene.start('PreloadScene');
        });
    }

    create() {
        this.scale.refresh();
        this.scene.start('PreloadScene');
    }
}
