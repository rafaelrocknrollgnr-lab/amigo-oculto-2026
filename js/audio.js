/**
 * Gerador de Efeitos Sonoros Natalinos usando Web Audio API
 * Funciona diretamente no navegador sem precisar de arquivos de áudio externos (.mp3)
 */
class ChristmasAudio {
  constructor() {
    this.audioCtx = null;
    this.isMuted = localStorage.getItem('amigo_oculto_muted') === 'true';
  }

  initContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('amigo_oculto_muted', this.isMuted);
    return !this.isMuted;
  }

  // Toca um sino natalino puro (frequência com decaimento suave)
  playBell(freq, duration = 1.0, delay = 0, gainLevel = 0.25) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.audioCtx) return;

    const startTime = this.audioCtx.currentTime + delay;
    const osc = this.audioCtx.createOscillator();
    const gainNode = this.audioCtx.createGain();

    // Harmônicos cristalinos de sino de Natal
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gainNode.gain.setValueAtTime(gainLevel, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  // Jingle Bells (Acorde de Revelação Natalina)
  playJingleBellsCelebration() {
    if (this.isMuted) return;
    this.initContext();

    // Notas: Mi (659.25), Sol (783.99), Do (523.25), Re (587.33)
    const notes = [
      { f: 659.25, d: 0.15 }, // E5
      { f: 659.25, d: 0.15 }, // E5
      { f: 659.25, d: 0.35 }, // E5 (longo)
      { f: 659.25, d: 0.15 }, // E5
      { f: 659.25, d: 0.15 }, // E5
      { f: 659.25, d: 0.35 }, // E5 (longo)
      { f: 659.25, d: 0.18 }, // E5
      { f: 783.99, d: 0.18 }, // G5
      { f: 523.25, d: 0.18 }, // C5
      { f: 587.33, d: 0.18 }, // D5
      { f: 659.25, d: 0.60 }, // E5 (final com cauda)
    ];

    let currentDelay = 0;
    notes.forEach((note) => {
      this.playBell(note.f, 0.6, currentDelay, 0.28);
      currentDelay += note.d;
    });
  }

  // Som sutil de chacoalhar presente
  playBoxShake() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gainNode = this.audioCtx.createGain();
    const now = this.audioCtx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(330, now + 0.1);

    gainNode.gain.setValueAtTime(0.12, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  // Som suave de clique ou botão
  playClick() {
    if (this.isMuted) return;
    this.initContext();
    this.playBell(880, 0.12, 0, 0.08);
  }
}

// Instância global para ser usada em toda a aplicação
window.christmasAudio = new ChristmasAudio();
