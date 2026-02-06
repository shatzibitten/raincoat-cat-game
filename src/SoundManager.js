/**
 * SoundManager - Procedural sound generation using Web Audio API
 */
class SoundManager {
    constructor(scene) {
        this.scene = scene;
        this.audioContext = null;
        this.enabled = true;
        this.volume = 0.3;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
            this.enabled = false;
        }
    }

    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    playTone(frequency, duration, type = 'square', vol = this.volume) {
        if (!this.enabled || !this.audioContext) return;
        this.resume();

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

        gainNode.gain.setValueAtTime(vol, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    playNoise(duration, vol = this.volume * 0.5) {
        if (!this.enabled || !this.audioContext) return;
        this.resume();

        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();

        source.buffer = buffer;
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        gainNode.gain.setValueAtTime(vol, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        source.start();
    }

    playJump() {
        this.playTone(200, 0.1, 'square', this.volume * 0.4);
        setTimeout(() => this.playTone(300, 0.1, 'square', this.volume * 0.3), 50);
    }

    playLand() {
        this.playNoise(0.05, this.volume * 0.3);
    }

    playCollect() {
        this.playTone(800, 0.1, 'sine', this.volume * 0.5);
        setTimeout(() => this.playTone(1000, 0.15, 'sine', this.volume * 0.4), 50);
    }

    playSecret() {
        this.playTone(600, 0.1, 'sine', this.volume * 0.5);
        setTimeout(() => this.playTone(800, 0.1, 'sine', this.volume * 0.5), 100);
        setTimeout(() => this.playTone(1000, 0.2, 'sine', this.volume * 0.5), 200);
    }

    playHookFire() {
        this.playTone(150, 0.1, 'sawtooth', this.volume * 0.4);
        this.playNoise(0.05, this.volume * 0.2);
    }

    playHookAttach() {
        this.playTone(400, 0.1, 'square', this.volume * 0.4);
        this.playTone(500, 0.15, 'square', this.volume * 0.3);
    }

    playHookRelease() {
        this.playTone(300, 0.1, 'square', this.volume * 0.3);
        setTimeout(() => this.playTone(200, 0.1, 'square', this.volume * 0.2), 50);
    }

    playHurt() {
        this.playTone(200, 0.1, 'sawtooth', this.volume * 0.5);
        setTimeout(() => this.playTone(150, 0.15, 'sawtooth', this.volume * 0.4), 100);
    }

    playDeath() {
        this.playTone(400, 0.1, 'square', this.volume * 0.5);
        setTimeout(() => this.playTone(300, 0.1, 'square', this.volume * 0.4), 100);
        setTimeout(() => this.playTone(200, 0.1, 'square', this.volume * 0.3), 200);
        setTimeout(() => this.playTone(100, 0.2, 'square', this.volume * 0.2), 300);
    }

    playCheckpoint() {
        this.playTone(500, 0.1, 'sine', this.volume * 0.5);
        setTimeout(() => this.playTone(700, 0.1, 'sine', this.volume * 0.5), 100);
        setTimeout(() => this.playTone(600, 0.2, 'sine', this.volume * 0.4), 200);
    }

    playLevelComplete() {
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.2, 'sine', this.volume * 0.5), i * 150);
        });
    }

    playClick() {
        this.playTone(600, 0.05, 'square', this.volume * 0.3);
    }

    playStomp() {
        this.playTone(300, 0.1, 'square', this.volume * 0.4);
        this.playNoise(0.05, this.volume * 0.3);
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
    }
}

// Singleton instance
let soundManagerInstance = null;

export function getSoundManager(scene) {
    if (!soundManagerInstance) {
        soundManagerInstance = new SoundManager(scene);
    }
    return soundManagerInstance;
}

export default SoundManager;
