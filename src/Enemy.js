import Phaser from 'phaser';

/**
 * Enemy class - Patrolling enemies (slime and bug types)
 */
export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type = 'slime') {
        const texture = type === 'slime' ? 'enemy_slime_0' : 'enemy_bug_0';
        super(scene, x, y, texture);
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.type = type;
        this.moveSpeed = type === 'slime' ? 30 : 50;
        this.direction = 1;
        this.patrolDistance = 80;
        this.startX = x;
        
        this.body.setSize(14, 12);
        this.body.setOffset(1, 4);
        this.setCollideWorldBounds(true);
        
        this.animTimer = 0;
        this.animFrame = 0;
    }

    update(time, delta) {
        // Move in current direction
        this.setVelocityX(this.moveSpeed * this.direction);
        
        // Reverse at patrol boundaries
        if (this.x > this.startX + this.patrolDistance) {
            this.direction = -1;
            this.setFlipX(true);
        } else if (this.x < this.startX - this.patrolDistance) {
            this.direction = 1;
            this.setFlipX(false);
        }
        
        // Reverse on wall collision
        if (this.body.blocked.left) {
            this.direction = 1;
            this.setFlipX(false);
        } else if (this.body.blocked.right) {
            this.direction = -1;
            this.setFlipX(true);
        }
        
        // Animation
        this.animTimer += delta;
        if (this.animTimer > 300) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 2;
            this.setTexture(`enemy_${this.type}_${this.animFrame}`);
        }
    }
}
