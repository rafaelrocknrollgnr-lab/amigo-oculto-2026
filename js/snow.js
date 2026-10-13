/**
 * Animação de Neve Caindo em Canvas (Snowfall)
 * Otimizada para 60fps, responsiva e com baixo consumo de bateria.
 */
class Snowfall {
  constructor(canvasId = 'snowCanvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.flakes = [];
    this.maxFlakes = 65;
    this.animationFrameId = null;
    this.isActive = true;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Cria os flocos de neve iniciais
    for (let i = 0; i < this.maxFlakes; i++) {
      this.flakes.push(this.createFlake(true));
    }

    // Economia de bateria quando aba não está visível
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pause();
      } else {
        this.resume();
      }
    });

    this.start();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // Reduz quantidade de flocos em celulares para melhor desempenho
    if (this.width < 600) {
      this.maxFlakes = 35;
    } else {
      this.maxFlakes = 65;
    }
  }

  createFlake(randomY = false) {
    return {
      x: Math.random() * this.width,
      y: randomY ? Math.random() * this.height : -10,
      radius: Math.random() * 2.8 + 1.0,
      speedY: Math.random() * 1.2 + 0.6,
      speedX: Math.random() * 0.8 - 0.4,
      opacity: Math.random() * 0.7 + 0.3,
      swing: Math.random() * Math.PI * 2,
      swingSpeed: Math.random() * 0.02 + 0.01,
    };
  }

  update() {
    for (let i = 0; i < this.flakes.length; i++) {
      const flake = this.flakes[i];
      flake.swing += flake.swingSpeed;
      flake.y += flake.speedY;
      flake.x += flake.speedX + Math.sin(flake.swing) * 0.5;

      // Se saiu da tela, reinicia no topo
      if (flake.y > this.height + 10 || flake.x < -10 || flake.x > this.width + 10) {
        this.flakes[i] = this.createFlake(false);
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = '#ffffff';

    for (let i = 0; i < this.flakes.length; i++) {
      const flake = this.flakes[i];
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
      this.ctx.fill();
      this.ctx.restore();
    }
  }

  loop() {
    if (!this.isActive) return;
    this.update();
    this.draw();
    this.animationFrameId = requestAnimationFrame(() => this.loop());
  }

  start() {
    this.isActive = true;
    this.loop();
  }

  pause() {
    this.isActive = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  resume() {
    if (!this.isActive) {
      this.isActive = true;
      this.loop();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.snowEffect = new Snowfall('snowCanvas');
});
