import Phaser from 'phaser';
import { getSoundManager } from './SoundManager.js';

/**
 * Player class - Cat with grappling hook mechanics
 */
export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'cat_idle');
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.setCollideWorldBounds(false);
        this.body.setSize(12, 14);
        this.body.setOffset(2, 2);
        this.setScale(1);
        
        // Movement properties
        this.moveSpeed = 150;
        this.jumpForce = -280;
        this.maxJumpHoldTime = 150;
        this.isJumping = false;
        this.jumpHoldTime = 0;
        this.canJump = true;
        this.facingRight = true;
        
        // State flags
        this.isDead = false;
        this.isHurt = false;
        this.deathAnimationPlaying = false;
        
        // Coyote time (allows jumping shortly after leaving platform)
        this.coyoteTime = 120;
        this.coyoteTimer = 0;
        this.wasOnGround = false;
        
        // Jump buffering (allows pressing jump before landing)
        this.jumpBufferTime = 100;
        this.jumpBufferTimer = 0;
        
        // Grappling hook properties
        this.hookState = 'ready'; // ready, firing, attached, cooldown
        this.hookCooldown = 500;
        this.hookCooldownTimer = 0;
        this.hookMaxLength = 300;
        this.hookSpeed = 600;
        this.hookTarget = null;
        this.hookLine = null;
        this.hookProjectile = null;
        this.hookDirection = new Phaser.Math.Vector2(1, 0);
        
        // Swing physics
        this.ropeLength = 0;
        this.swingAngle = 0;
        this.swingAngularVelocity = 0;
        this.swingGravity = 0.006;
        this.swingDamping = 0.998;
        this.swingAcceleration = 0.003;
        this.maxSwingSpeed = 0.08;
        
        // Combo tracking
        this.groundTouchesSinceHook = 0;
        this.hookCombo = 0;
        
        // Input setup
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.keys = scene.input.keyboard.addKeys({
            w: Phaser.Input.Keyboard.KeyCodes.W,
            a: Phaser.Input.Keyboard.KeyCodes.A,
            s: Phaser.Input.Keyboard.KeyCodes.S,
            d: Phaser.Input.Keyboard.KeyCodes.D,
            space: Phaser.Input.Keyboard.KeyCodes.SPACE,
            e: Phaser.Input.Keyboard.KeyCodes.E,
            r: Phaser.Input.Keyboard.KeyCodes.R
        });
        
        // Mouse input for hook
        scene.input.on('pointerdown', (pointer) => {
            if (pointer.leftButtonDown()) {
                this.fireHook();
            } else if (pointer.rightButtonDown()) {
                this.cancelHook();
            }
        });
        
        // Keyboard hook controls
        scene.input.keyboard.on('keydown-E', () => {
            if (this.hookState === 'ready') {
                this.fireHook();
            } else {
                this.cancelHook();
            }
        });
        
        scene.input.keyboard.on('keydown-SPACE', () => {
            if (this.hookState === 'attached') {
                this.releaseHookWithMomentum();
            }
        });
        
        // Graphics for hook line
        this.hookLineGraphics = scene.add.graphics();
        this.hookLineGraphics.setDepth(5);
        
        // Particle emitters
        this.dustEmitter = scene.add.particles(0, 0, 'particle_dust', {
            speed: { min: 20, max: 50 },
            angle: { min: 180, max: 360 },
            scale: { start: 1, end: 0 },
            lifespan: 300,
            gravityY: 100,
            emitting: false
        });
        
        this.tearEmitter = null;
        this.gameScene = scene;
        this.sound = getSoundManager(scene);
    }

    update(time, delta) {
        if (this.isDead) {
            if (this.deathAnimationPlaying) {
                this.updateDeathAnimation(delta);
            }
            return;
        }
        
        this.updateTimers(delta);
        
        if (this.hookState === 'attached') {
            this.handleSwingMovement(delta);
        } else {
            this.handleMovement();
            this.handleJump(delta);
        }
        
        this.handleHookAiming();
        this.updateHook(delta);
        this.updateAnimation();
        
        // Track ground touches for combo
        if (this.body.onFloor() && !this.wasOnGround) {
            this.groundTouchesSinceHook++;
            if (this.groundTouchesSinceHook > 1) {
                this.hookCombo = 0;
            }
        }
        
        this.wasOnGround = this.body.onFloor();
        
        // Reset coyote timer when on ground
        if (this.body.onFloor()) {
            this.coyoteTimer = this.coyoteTime;
        }
    }

    updateTimers(delta) {
        if (this.coyoteTimer > 0) {
            this.coyoteTimer -= delta;
        }
        if (this.jumpBufferTimer > 0) {
            this.jumpBufferTimer -= delta;
        }
        if (this.hookCooldownTimer > 0) {
            this.hookCooldownTimer -= delta;
            if (this.hookCooldownTimer <= 0) {
                this.hookState = 'ready';
            }
        }
    }

    handleMovement() {
        const left = this.cursors.left.isDown || this.keys.a.isDown;
        const right = this.cursors.right.isDown || this.keys.d.isDown;
        
        if (left) {
            this.setVelocityX(-this.moveSpeed);
            this.facingRight = false;
            this.setFlipX(true);
        } else if (right) {
            this.setVelocityX(this.moveSpeed);
            this.facingRight = true;
            this.setFlipX(false);
        } else {
            this.setVelocityX(0);
        }
        
        // Dust particles when running
        if (this.body.onFloor() && (left || right) && Math.random() < 0.1) {
            this.dustEmitter.setPosition(this.x, this.y + 8);
            this.dustEmitter.explode(1);
        }
    }

    handleSwingMovement(delta) {
        const left = this.cursors.left.isDown || this.keys.a.isDown;
        const right = this.cursors.right.isDown || this.keys.d.isDown;
        
        if (left) {
            this.swingAngularVelocity -= this.swingAcceleration;
            this.facingRight = false;
            this.setFlipX(true);
        } else if (right) {
            this.swingAngularVelocity += this.swingAcceleration;
            this.facingRight = true;
            this.setFlipX(false);
        }
        
        this.swingAngularVelocity = Phaser.Math.Clamp(
            this.swingAngularVelocity,
            -this.maxSwingSpeed,
            this.maxSwingSpeed
        );
    }

    handleJump(delta) {
        const justPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
                           Phaser.Input.Keyboard.JustDown(this.keys.w) ||
                           Phaser.Input.Keyboard.JustDown(this.keys.space);
        const held = this.cursors.up.isDown || this.keys.w.isDown || this.keys.space.isDown;
        
        // Buffer jump input
        if (justPressed) {
            this.jumpBufferTimer = this.jumpBufferTime;
        }
        
        const canJump = this.body.onFloor() || this.coyoteTimer > 0;
        
        // Execute jump if buffered and can jump
        if (this.jumpBufferTimer > 0 && canJump && !this.isJumping) {
            this.setVelocityY(this.jumpForce);
            this.isJumping = true;
            this.jumpHoldTime = 0;
            this.coyoteTimer = 0;
            this.jumpBufferTimer = 0;
            
            this.dustEmitter.setPosition(this.x, this.y + 8);
            this.dustEmitter.explode(3);
            this.sound.playJump();
        }
        
        // Variable jump height
        if (this.isJumping && held && this.jumpHoldTime < this.maxJumpHoldTime) {
            this.jumpHoldTime += delta;
            if (this.body.velocity.y < 0) {
                this.body.velocity.y *= 0.98;
            }
        }
        
        // Cut jump short if button released
        if (this.isJumping && !held && this.body.velocity.y < -100) {
            this.body.velocity.y *= 0.5;
            this.isJumping = false;
        }
        
        // Reset jump state on landing
        if (this.body.onFloor()) {
            this.isJumping = false;
        }
    }

    handleHookAiming() {
        const pointer = this.gameScene.input.activePointer;
        const worldPoint = this.gameScene.cameras.main.getWorldPoint(pointer.x, pointer.y);
        const dx = worldPoint.x - this.x;
        const dy = worldPoint.y - this.y;
        
        // Keyboard aiming
        let aimX = 0, aimY = 0;
        if (this.cursors.left.isDown || this.keys.a.isDown) aimX = -1;
        if (this.cursors.right.isDown || this.keys.d.isDown) aimX = 1;
        if (this.cursors.up.isDown || this.keys.w.isDown) aimY = -1;
        if (this.cursors.down.isDown || this.keys.s.isDown) aimY = 1;
        
        if (aimX !== 0 || aimY !== 0) {
            this.hookDirection.set(aimX, aimY).normalize();
        } else if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
            this.hookDirection.set(dx, dy).normalize();
        } else {
            this.hookDirection.set(this.facingRight ? 1 : -1, -0.5).normalize();
        }
    }

    fireHook() {
        if (this.hookState !== 'ready' || this.isDead) return;
        
        const hookPoints = this.gameScene.hookPoints;
        if (!hookPoints || hookPoints.getLength() === 0) return;
        
        let nearestPoint = null;
        let nearestDist = this.hookMaxLength;
        
        hookPoints.getChildren().forEach(point => {
            const dist = Phaser.Math.Distance.Between(this.x, this.y, point.x, point.y);
            if (dist < nearestDist) {
                const toPoint = new Phaser.Math.Vector2(point.x - this.x, point.y - this.y).normalize();
                if (this.hookDirection.dot(toPoint) > 0.3) {
                    nearestDist = dist;
                    nearestPoint = point;
                }
            }
        });
        
        if (nearestPoint) {
            this.hookState = 'firing';
            this.hookTarget = nearestPoint;
            this.sound.playHookFire();
            
            // Create projectile
            this.hookProjectile = this.gameScene.add.image(this.x, this.y, 'hook_projectile');
            this.hookProjectile.setDepth(10);
            
            const angle = Phaser.Math.Angle.Between(this.x, this.y, nearestPoint.x, nearestPoint.y);
            this.hookProjectile.setRotation(angle);
            
            const duration = (nearestDist / this.hookSpeed) * 1000;
            
            this.gameScene.tweens.add({
                targets: this.hookProjectile,
                x: nearestPoint.x,
                y: nearestPoint.y,
                duration: duration,
                onComplete: () => {
                    this.hookState = 'attached';
                    nearestPoint.setTexture('hook_point_highlight');
                    this.sound.playHookAttach();
                    this.initializeSwing();
                }
            });
        }
    }

    initializeSwing() {
        if (!this.hookTarget) return;
        
        const dx = this.x - this.hookTarget.x;
        const dy = this.y - this.hookTarget.y;
        
        this.ropeLength = Math.sqrt(dx * dx + dy * dy);
        this.swingAngle = Math.atan2(dx, dy);
        
        // Convert current velocity to angular velocity
        const tangentX = Math.cos(this.swingAngle);
        const tangentY = -Math.sin(this.swingAngle);
        const tangentVel = this.body.velocity.x * tangentX + this.body.velocity.y * tangentY;
        
        this.swingAngularVelocity = (tangentVel / this.ropeLength) * 0.008;
        this.swingAngularVelocity = Phaser.Math.Clamp(
            this.swingAngularVelocity,
            -this.maxSwingSpeed * 0.5,
            this.maxSwingSpeed * 0.5
        );
        
        this.body.setAllowGravity(false);
    }

    updateHook(delta) {
        this.hookLineGraphics.clear();
        
        if (this.hookState === 'firing' && this.hookProjectile) {
            this.hookLineGraphics.lineStyle(2, 0x8b7355);
            this.hookLineGraphics.beginPath();
            this.hookLineGraphics.moveTo(this.x, this.y);
            this.hookLineGraphics.lineTo(this.hookProjectile.x, this.hookProjectile.y);
            this.hookLineGraphics.strokePath();
        }
        
        if (this.hookState === 'attached' && this.hookTarget) {
            this.hookLineGraphics.lineStyle(3, 0x8b7355);
            this.hookLineGraphics.beginPath();
            this.hookLineGraphics.moveTo(this.x, this.y);
            this.hookLineGraphics.lineTo(this.hookTarget.x, this.hookTarget.y);
            this.hookLineGraphics.strokePath();
            
            this.updateSwingPhysics(delta);
        } else {
            this.body.setAllowGravity(true);
        }
    }

    updateSwingPhysics(delta) {
        if (!this.hookTarget) return;
        
        // Pendulum physics
        const gravity = -this.swingGravity * Math.sin(this.swingAngle);
        this.swingAngularVelocity += gravity;
        this.swingAngularVelocity *= this.swingDamping;
        this.swingAngularVelocity = Phaser.Math.Clamp(
            this.swingAngularVelocity,
            -this.maxSwingSpeed,
            this.maxSwingSpeed
        );
        
        this.swingAngle += this.swingAngularVelocity;
        
        // Calculate new position
        const newX = this.hookTarget.x + Math.sin(this.swingAngle) * this.ropeLength;
        const newY = this.hookTarget.y + Math.cos(this.swingAngle) * this.ropeLength;
        
        // Update velocity for physics interactions
        const velX = (newX - this.x) * 60;
        const velY = (newY - this.y) * 60;
        
        this.x = newX;
        this.y = newY;
        this.body.velocity.x = velX;
        this.body.velocity.y = velY;
        
        // Gradually shorten rope
        if (this.ropeLength > 50) {
            this.ropeLength -= 0.15;
        }
        
        // Auto-release if rope too short
        if (this.ropeLength < 30) {
            this.releaseHookWithMomentum();
        }
    }

    releaseHookWithMomentum() {
        if (this.hookState !== 'attached') return;
        
        // Calculate release velocity
        const tangentX = Math.cos(this.swingAngle);
        const tangentY = -Math.sin(this.swingAngle);
        const releaseSpeed = this.swingAngularVelocity * this.ropeLength * 4;
        
        const velX = tangentX * releaseSpeed;
        const velY = tangentY * releaseSpeed - 120;
        
        this.setVelocity(velX, Math.min(velY, -50));
        
        // Update combo
        if (this.groundTouchesSinceHook <= 1) {
            this.hookCombo++;
            window.gameState.hookCombo = Math.max(window.gameState.hookCombo, this.hookCombo);
        }
        this.groundTouchesSinceHook = 0;
        
        this.cancelHook();
    }

    completeHook() {
        this.setVelocity(this.body.velocity.x * 0.5, -150);
        
        if (this.groundTouchesSinceHook <= 1) {
            this.hookCombo++;
            window.gameState.hookCombo = Math.max(window.gameState.hookCombo, this.hookCombo);
        }
        this.groundTouchesSinceHook = 0;
        
        this.cancelHook();
    }

    cancelHook() {
        if (this.hookTarget) {
            this.hookTarget.setTexture('hook_point');
        }
        
        if (this.hookProjectile) {
            this.hookProjectile.destroy();
            this.hookProjectile = null;
        }
        
        this.hookTarget = null;
        this.hookState = 'cooldown';
        this.hookCooldownTimer = this.hookCooldown;
        this.hookLineGraphics.clear();
        this.body.setAllowGravity(true);
        
        this.swingAngle = 0;
        this.swingAngularVelocity = 0;
        this.ropeLength = 0;
    }

    updateAnimation() {
        if (this.isDead || this.isHurt) {
            this.setTexture('cat_hurt');
            return;
        }
        
        if (this.hookState === 'attached' || this.hookState === 'firing') {
            this.setTexture('cat_hook');
            return;
        }
        
        if (!this.body.onFloor()) {
            if (this.body.velocity.y < 0) {
                this.setTexture('cat_jump');
            } else {
                this.setTexture('cat_fall');
            }
        } else if (Math.abs(this.body.velocity.x) > 10) {
            const frame = Math.floor(this.gameScene.time.now / 150) % 2;
            this.setTexture(`cat_run_${frame}`);
        } else {
            this.setTexture('cat_idle');
        }
    }

    hurt() {
        if (this.isDead || this.isHurt) return;
        
        this.isHurt = true;
        this.cancelHook();
        this.sound.playHurt();
        
        this.setVelocity(this.facingRight ? -100 : 100, -200);
        
        this.gameScene.tweens.add({
            targets: this,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: 3,
            onComplete: () => {
                this.alpha = 1;
                this.isHurt = false;
            }
        });
    }

    die() {
        if (this.isDead) return;
        
        this.isDead = true;
        this.deathAnimationPlaying = true;
        this.cancelHook();
        this.sound.playDeath();
        
        this.setVelocity(0, 0);
        this.body.setAllowGravity(false);
        
        // Death animation - float up then fall
        this.gameScene.tweens.add({
            targets: this,
            y: this.y - 30,
            duration: 300,
            ease: 'Power2',
            yoyo: true,
            onComplete: () => {
                this.body.setAllowGravity(true);
            }
        });
        
        this.setTexture('cat_hurt');
        
        // Spin animation
        this.gameScene.tweens.add({
            targets: this,
            angle: 180,
            duration: 600,
            ease: 'Power2'
        });
        
        this.createTearEffect();
        
        // Respawn after delay
        this.gameScene.time.delayedCall(2000, () => {
            this.respawn();
        });
    }

    createTearEffect() {
        if (this.tearEmitter) {
            this.tearEmitter.destroy();
        }
        
        this.tearEmitter = this.gameScene.add.particles(this.x, this.y, 'tear_particle', {
            speed: { min: 50, max: 100 },
            angle: { min: 70, max: 110 },
            scale: { start: 2.5, end: 1 },
            lifespan: 1500,
            gravityY: 400,
            frequency: 50,
            quantity: 3,
            emitting: true,
            alpha: { start: 1, end: 0.5 }
        });
        
        this.tearEmitter.setDepth(20);
    }

    updateDeathAnimation(delta) {
        if (this.tearEmitter) {
            const rad = this.angle * Math.PI / 180;
            const offsetX = Math.sin(rad) * 4;
            const offsetY = -Math.cos(rad) * 4;
            this.tearEmitter.setPosition(this.x + offsetX, this.y + offsetY);
        }
    }

    respawn() {
        this.deathAnimationPlaying = false;
        
        if (this.tearEmitter) {
            this.tearEmitter.destroy();
            this.tearEmitter = null;
        }
        
        this.angle = 0;
        
        const spawn = this.gameScene.spawnPoint;
        this.setPosition(spawn.x, spawn.y);
        this.setVelocity(0, 0);
        
        this.isDead = false;
        this.isHurt = false;
        this.alpha = 1;
        this.hookState = 'ready';
        this.hookCooldownTimer = 0;
        
        window.gameState.hookCombo = 0;
    }
}
