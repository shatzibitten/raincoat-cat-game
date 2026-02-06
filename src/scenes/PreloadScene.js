import Phaser from 'phaser';

/**
 * PreloadScene - Generates all game sprites procedurally
 */
export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Loading bar
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

        const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
            font: '20px monospace',
            fill: '#ffffff'
        }).setOrigin(0.5, 0.5);

        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xffd700, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
        });
    }

    create() {
        this.generateSprites();
        this.scene.start('MenuScene');
    }

    generateSprites() {
        this.generateCatSprite();
        this.generateTiles();
        this.generateHookPoint();
        this.generateCollectibles();
        this.generateEnemies();
        this.generateUIElements();
        this.generateParticles();
    }

    generateCatSprite() {
        // Idle
        const idle = this.make.graphics({ x: 0, y: 0, add: false });
        this.drawCat(idle, 0, 0, 'idle');
        idle.generateTexture('cat_idle', 16, 16);
        idle.destroy();

        // Run frames
        for (let i = 0; i < 2; i++) {
            const run = this.make.graphics({ x: 0, y: 0, add: false });
            this.drawCat(run, 0, 0, 'run', i);
            run.generateTexture(`cat_run_${i}`, 16, 16);
            run.destroy();
        }

        // Jump
        const jump = this.make.graphics({ x: 0, y: 0, add: false });
        this.drawCat(jump, 0, 0, 'jump');
        jump.generateTexture('cat_jump', 16, 16);
        jump.destroy();

        // Fall
        const fall = this.make.graphics({ x: 0, y: 0, add: false });
        this.drawCat(fall, 0, 0, 'fall');
        fall.generateTexture('cat_fall', 16, 16);
        fall.destroy();

        // Hook
        const hook = this.make.graphics({ x: 0, y: 0, add: false });
        this.drawCat(hook, 0, 0, 'hook');
        hook.generateTexture('cat_hook', 16, 16);
        hook.destroy();

        // Hurt
        const hurt = this.make.graphics({ x: 0, y: 0, add: false });
        this.drawCat(hurt, 0, 0, 'hurt');
        hurt.generateTexture('cat_hurt', 16, 16);
        hurt.destroy();
    }

    drawCat(g, x, y, state, frame = 0) {
        const colors = {
            raincoat: 0xffd700,      // Yellow raincoat
            raincoatDark: 0xdaa520,  // Darker yellow
            mask: 0x2d2d2d,          // Dark mask/goggles
            face: 0xffc0a1,          // Skin tone
            eyes: 0x00ff00,          // Green eyes
            ears: 0xffb6ba           // Pink ears
        };

        // Body (raincoat)
        g.fillStyle(colors.raincoat);
        g.fillRect(x + 4, y + 6, 8, 8);
        g.fillRect(x + 3, y + 7, 10, 6);

        // Raincoat details
        g.fillStyle(colors.raincoatDark);
        g.fillRect(x + 4, y + 12, 8, 2);
        g.fillRect(x + 3, y + 10, 1, 3);
        g.fillRect(x + 12, y + 10, 1, 3);

        // Hood
        g.fillStyle(colors.raincoat);
        g.fillRect(x + 5, y + 3, 6, 4);

        // Ears
        g.fillStyle(colors.ears);
        g.fillRect(x + 4, y + 2, 2, 2);
        g.fillRect(x + 10, y + 2, 2, 2);

        // Face
        g.fillStyle(colors.face);
        g.fillRect(x + 6, y + 5, 4, 3);

        // Mask/goggles
        g.fillStyle(colors.mask);
        g.fillRect(x + 5, y + 4, 6, 2);

        // Eyes
        g.fillStyle(colors.eyes);
        g.fillRect(x + 6, y + 4, 1, 1);
        g.fillRect(x + 9, y + 4, 1, 1);

        // Nose
        g.fillStyle(0xff9494);
        g.fillRect(x + 7, y + 6, 2, 1);

        // Legs based on state
        g.fillStyle(colors.raincoatDark);

        if (state === 'idle') {
            g.fillRect(x + 5, y + 14, 2, 2);
            g.fillRect(x + 9, y + 14, 2, 2);
        } else if (state === 'run') {
            if (frame === 0) {
                g.fillRect(x + 4, y + 14, 2, 2);
                g.fillRect(x + 10, y + 13, 2, 2);
            } else {
                g.fillRect(x + 4, y + 13, 2, 2);
                g.fillRect(x + 10, y + 14, 2, 2);
            }
        } else if (state === 'jump') {
            g.fillRect(x + 4, y + 13, 2, 2);
            g.fillRect(x + 10, y + 13, 2, 2);
        } else if (state === 'fall') {
            g.fillRect(x + 3, y + 14, 2, 2);
            g.fillRect(x + 11, y + 14, 2, 2);
        } else if (state === 'hook') {
            g.fillRect(x + 5, y + 14, 2, 2);
            g.fillRect(x + 9, y + 14, 2, 2);
            // Extended arm
            g.fillStyle(colors.raincoat);
            g.fillRect(x + 13, y + 7, 3, 2);
        } else if (state === 'hurt') {
            g.fillRect(x + 3, y + 13, 2, 2);
            g.fillRect(x + 11, y + 13, 2, 2);
            // X eyes
            g.fillStyle(0xff0000);
            g.fillRect(x + 6, y + 4, 1, 1);
            g.fillRect(x + 9, y + 4, 1, 1);
        }
    }

    generateTiles() {
        // Ground tile (grass)
        const ground = this.make.graphics({ x: 0, y: 0, add: false });
        ground.fillStyle(0x4a7c23);
        ground.fillRect(0, 0, 16, 16);
        ground.fillStyle(0x5d9b2b);
        ground.fillRect(0, 0, 16, 4);
        ground.fillStyle(0x3d6720);
        ground.fillRect(0, 12, 16, 4);
        ground.fillStyle(0x7bc043);
        for (let i = 0; i < 4; i++) {
            ground.fillRect(i * 4 + 1, 0, 2, 2);
        }
        ground.generateTexture('tile_ground', 16, 16);
        ground.destroy();

        // Dirt tile
        const dirt = this.make.graphics({ x: 0, y: 0, add: false });
        dirt.fillStyle(0x8b5a13);
        dirt.fillRect(0, 0, 16, 16);
        dirt.fillStyle(0x6b4410);
        dirt.fillRect(2, 3, 3, 3);
        dirt.fillRect(10, 8, 4, 3);
        dirt.fillRect(5, 12, 3, 2);
        dirt.generateTexture('tile_dirt', 16, 16);
        dirt.destroy();

        // Stone tile
        const stone = this.make.graphics({ x: 0, y: 0, add: false });
        stone.fillStyle(0x808080);
        stone.fillRect(0, 0, 16, 16);
        stone.fillStyle(0x696969);
        stone.fillRect(0, 0, 7, 7);
        stone.fillRect(8, 8, 8, 8);
        stone.fillStyle(0x505050);
        stone.fillRect(7, 0, 1, 16);
        stone.fillRect(0, 7, 16, 1);
        stone.generateTexture('tile_stone', 16, 16);
        stone.destroy();

        // Platform tile
        const platform = this.make.graphics({ x: 0, y: 0, add: false });
        platform.fillStyle(0xcd9b5f);
        platform.fillRect(0, 0, 16, 6);
        platform.fillStyle(0xa07a4d);
        platform.fillRect(0, 4, 16, 2);
        platform.fillStyle(0x8b5a13);
        platform.fillRect(3, 0, 1, 6);
        platform.fillRect(11, 0, 1, 6);
        platform.generateTexture('tile_platform', 16, 6);
        platform.destroy();

        // Spike tile
        const spike = this.make.graphics({ x: 0, y: 0, add: false });
        spike.fillStyle(0xc0c0c0);
        for (let i = 0; i < 4; i++) {
            const sx = i * 4;
            spike.fillTriangle(sx, 16, sx + 2, 4, sx + 4, 16);
        }
        spike.fillStyle(0x808080);
        for (let i = 0; i < 4; i++) {
            const sx = i * 4;
            spike.fillRect(sx + 1, 6, 2, 2);
        }
        spike.generateTexture('tile_spike', 16, 16);
        spike.destroy();

        // Checkpoint
        const checkpoint = this.make.graphics({ x: 0, y: 0, add: false });
        checkpoint.fillStyle(0x8b7355);
        checkpoint.fillRect(2, 0, 3, 24);
        checkpoint.fillStyle(0xff5544);
        checkpoint.fillRect(5, 2, 10, 8);
        checkpoint.fillStyle(0xcc0000);
        checkpoint.fillRect(5, 8, 10, 2);
        checkpoint.generateTexture('checkpoint', 16, 24);
        checkpoint.destroy();

        // Checkpoint active
        const checkpointActive = this.make.graphics({ x: 0, y: 0, add: false });
        checkpointActive.fillStyle(0x8b7355);
        checkpointActive.fillRect(2, 0, 3, 24);
        checkpointActive.fillStyle(0x44ff44);
        checkpointActive.fillRect(5, 2, 10, 8);
        checkpointActive.fillStyle(0x00cc00);
        checkpointActive.fillRect(5, 8, 10, 2);
        checkpointActive.generateTexture('checkpoint_active', 16, 24);
        checkpointActive.destroy();

        // Finish flag
        const finish = this.make.graphics({ x: 0, y: 0, add: false });
        finish.fillStyle(0xffd700);
        finish.fillRect(2, 0, 4, 32);
        finish.fillStyle(0xffffff);
        finish.fillRect(6, 2, 12, 10);
        finish.fillStyle(0x000000);
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 6; col++) {
                if ((row + col) % 2 === 0) {
                    finish.fillRect(6 + col * 2, 2 + row * 2, 2, 2);
                }
            }
        }
        finish.generateTexture('finish', 20, 32);
        finish.destroy();

        // Background sky
        const sky = this.make.graphics({ x: 0, y: 0, add: false });
        sky.fillStyle(0x87ceeb);
        sky.fillRect(0, 0, 64, 64);
        sky.fillStyle(0xffffff);
        sky.fillCircle(16, 20, 8);
        sky.fillCircle(24, 18, 10);
        sky.fillCircle(32, 22, 7);
        sky.fillCircle(48, 40, 6);
        sky.fillCircle(54, 38, 8);
        sky.generateTexture('bg_sky', 64, 64);
        sky.destroy();
    }

    generateHookPoint() {
        // Normal hook point
        const hookPoint = this.make.graphics({ x: 0, y: 0, add: false });
        hookPoint.fillStyle(0xffd700);
        hookPoint.fillCircle(8, 8, 6);
        hookPoint.fillStyle(0xffecab);
        hookPoint.fillCircle(6, 6, 2);
        hookPoint.fillStyle(0xb8860b);
        hookPoint.fillCircle(10, 10, 2);
        hookPoint.lineStyle(2, 0xdaa520);
        hookPoint.strokeCircle(8, 8, 5);
        hookPoint.generateTexture('hook_point', 16, 16);
        hookPoint.destroy();

        // Highlighted hook point
        const hookHighlight = this.make.graphics({ x: 0, y: 0, add: false });
        hookHighlight.fillStyle(0x00ff00);
        hookHighlight.fillCircle(8, 8, 8);
        hookHighlight.fillStyle(0xffd700);
        hookHighlight.fillCircle(8, 8, 6);
        hookHighlight.fillStyle(0xffecab);
        hookHighlight.fillCircle(6, 6, 2);
        hookHighlight.generateTexture('hook_point_highlight', 16, 16);
        hookHighlight.destroy();

        // Hook projectile
        const projectile = this.make.graphics({ x: 0, y: 0, add: false });
        projectile.fillStyle(0xc0c0c0);
        projectile.fillTriangle(0, 4, 8, 0, 8, 8);
        projectile.fillStyle(0x808080);
        projectile.fillRect(6, 2, 4, 4);
        projectile.generateTexture('hook_projectile', 10, 8);
        projectile.destroy();
    }

    generateCollectibles() {
        // Raindrop
        const raindrop = this.make.graphics({ x: 0, y: 0, add: false });
        raindrop.fillStyle(0x00bfff);
        raindrop.fillTriangle(6, 0, 0, 10, 12, 10);
        raindrop.fillCircle(6, 10, 6);
        raindrop.fillStyle(0x87ceeb);
        raindrop.fillCircle(4, 8, 2);
        raindrop.generateTexture('raindrop', 12, 16);
        raindrop.destroy();

        // Secret star
        const star = this.make.graphics({ x: 0, y: 0, add: false });
        star.fillStyle(0xffd700);
        const cx = 8, cy = 8;
        const outerR = 7, innerR = 3;
        const points = [];
        for (let i = 0; i < 10; i++) {
            const r = i % 2 === 0 ? outerR : innerR;
            const angle = (i * Math.PI / 5) - Math.PI / 2;
            points.push(cx + r * Math.cos(angle));
            points.push(cy + r * Math.sin(angle));
        }
        star.fillPoints(points, true);
        star.fillStyle(0xffecab);
        star.fillCircle(6, 6, 2);
        star.generateTexture('secret_star', 16, 16);
        star.destroy();
    }

    generateEnemies() {
        // Slime enemy (2 frames)
        for (let frame = 0; frame < 2; frame++) {
            const slime = this.make.graphics({ x: 0, y: 0, add: false });
            const squash = frame === 0 ? 0 : 2;
            
            slime.fillStyle(0x993cac);
            slime.fillEllipse(8, 10 + squash, 14, 10 - squash);
            slime.fillStyle(0xba55d3);
            slime.fillEllipse(8, 8 + squash, 10, 6 - squash);
            
            // Eyes
            slime.fillStyle(0xffffff);
            slime.fillCircle(5, 8 + squash, 2);
            slime.fillCircle(11, 8 + squash, 2);
            slime.fillStyle(0x000000);
            slime.fillCircle(5, 8 + squash, 1);
            slime.fillCircle(11, 8 + squash, 1);
            
            slime.generateTexture(`enemy_slime_${frame}`, 16, 16);
            slime.destroy();
        }

        // Bug enemy (2 frames)
        for (let frame = 0; frame < 2; frame++) {
            const bug = this.make.graphics({ x: 0, y: 0, add: false });
            
            bug.fillStyle(0x228b22);
            bug.fillEllipse(8, 10, 12, 8);
            bug.fillStyle(0x32cd32);
            bug.fillEllipse(8, 8, 10, 6);
            
            // Antenna
            bug.fillStyle(0x006400);
            bug.fillRect(7, 5, 2, 8);
            
            // Eyes
            bug.fillStyle(0xff0000);
            bug.fillCircle(4, 7, 2);
            bug.fillCircle(12, 7, 2);
            
            // Legs
            bug.fillStyle(0x228b22);
            const legOffset = frame === 0 ? 0 : 1;
            bug.fillRect(2, 12 + legOffset, 2, 3);
            bug.fillRect(6, 13 - legOffset, 2, 3);
            bug.fillRect(8, 12 + legOffset, 2, 3);
            bug.fillRect(12, 13 - legOffset, 2, 3);
            
            bug.generateTexture(`enemy_bug_${frame}`, 16, 16);
            bug.destroy();
        }
    }

    generateUIElements() {
        // Button normal
        const button = this.make.graphics({ x: 0, y: 0, add: false });
        button.fillStyle(0x4a4a5a);
        button.fillRoundedRect(0, 0, 120, 40, 8);
        button.fillStyle(0x6a6a7a);
        button.fillRoundedRect(2, 2, 116, 36, 6);
        button.generateTexture('button', 120, 40);
        button.destroy();

        // Button hover
        const buttonHover = this.make.graphics({ x: 0, y: 0, add: false });
        buttonHover.fillStyle(0xffd700);
        buttonHover.fillRoundedRect(0, 0, 120, 40, 8);
        buttonHover.fillStyle(0x8a8a9a);
        buttonHover.fillRoundedRect(2, 2, 116, 36, 6);
        buttonHover.generateTexture('button_hover', 120, 40);
        buttonHover.destroy();

        // Panel
        const panel = this.make.graphics({ x: 0, y: 0, add: false });
        panel.fillStyle(0x2d2d2d, 0.9);
        panel.fillRoundedRect(0, 0, 200, 150, 10);
        panel.lineStyle(3, 0xffd700);
        panel.strokeRoundedRect(0, 0, 200, 150, 10);
        panel.generateTexture('panel', 200, 150);
        panel.destroy();

        // Heart
        const heart = this.make.graphics({ x: 0, y: 0, add: false });
        heart.fillStyle(0xff0000);
        heart.fillCircle(5, 5, 4);
        heart.fillCircle(11, 5, 4);
        heart.fillTriangle(1, 6, 8, 15, 15, 6);
        heart.generateTexture('heart', 16, 16);
        heart.destroy();
    }

    generateParticles() {
        // Dust particle
        const dust = this.make.graphics({ x: 0, y: 0, add: false });
        dust.fillStyle(0xd2b48c);
        dust.fillCircle(2, 2, 2);
        dust.generateTexture('particle_dust', 4, 4);
        dust.destroy();

        // Sparkle particle
        const sparkle = this.make.graphics({ x: 0, y: 0, add: false });
        sparkle.fillStyle(0xffffff);
        sparkle.fillRect(2, 0, 2, 6);
        sparkle.fillRect(0, 2, 6, 2);
        sparkle.generateTexture('particle_sparkle', 6, 6);
        sparkle.destroy();

        // Hook line
        const hookLine = this.make.graphics({ x: 0, y: 0, add: false });
        hookLine.fillStyle(0x8b7355);
        hookLine.fillRect(0, 0, 4, 4);
        hookLine.generateTexture('hook_line', 4, 4);
        hookLine.destroy();

        // Tear particle
        const tear = this.make.graphics({ x: 0, y: 0, add: false });
        tear.fillStyle(0x00bfff, 1);
        tear.fillEllipse(3, 4, 6, 8);
        tear.generateTexture('tear_particle', 6, 8);
        tear.destroy();
    }
}
