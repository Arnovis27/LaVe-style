const welcomeScreen = document.getElementById('welcome-screen');
const startBtn = document.getElementById('start-btn');
const loveContainer = document.getElementById('love-container');
const bgAudio = document.getElementById('bg-audio');
const canvas = document.getElementById('heartCanvas');
const ctx = canvas.getContext('2d');

let animationStarted = false;
let currentPointIndex = 0;
let isAudioReady = false;
let showLoveContent = false;

const points = [];
const drawnHeartPoints = [];
const particles = [];
const fireworkHearts = [];

// Control de carga de audio
bgAudio.addEventListener('canplaythrough', () => {
    if (!isAudioReady) {
        isAudioReady = true;
        startBtn.disabled = false;
        startBtn.innerHTML = "💖 Abre la sorpresa 🎁";
    }
});

if (bgAudio.readyState >= 4) {
    isAudioReady = true;
    startBtn.disabled = false;
    startBtn.innerHTML = "💖 Abre la sorpresa 🎁";
}

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        const isSmallScreen = window.innerWidth < 600;
        this.size = Math.random() * (isSmallScreen ? 2.5 : 4) + 1;
        this.speedX = (Math.random() - 0.5) * 4;
        this.speedY = (Math.random() - 0.5) * 4;
        this.color = `hsl(${Math.random() * 40 + 320}, 100%, 65%)`;
        this.life = 100;
        this.maxLife = 100;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= 1.5;
    }

    draw(context) {
        context.save();
        context.globalAlpha = Math.max(0, this.life / this.maxLife);
        context.fillStyle = this.color;
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fill();
        context.restore();
    }
}

class FireworkHeart {
    constructor(centerX, centerY) {
        this.x = centerX;
        this.y = centerY;
        this.size = Math.random() * 18 + 10;
        
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 3;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        
        this.gravity = 0.15;
        this.friction = 0.94;
        this.opacity = 1;
        this.decay = Math.random() * 0.015 + 0.01;
        this.color = `hsl(${Math.random() * 40 + 320}, 100%, ${Math.random() * 20 + 60}%)`;
    }

    update() {
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        
        this.x += this.vx;
        this.y += this.vy;
        
        this.opacity -= this.decay;
    }

    draw(context) {
        if (this.opacity <= 0) return;
        
        context.save();
        context.globalAlpha = Math.max(0, this.opacity);
        context.fillStyle = this.color;
        context.beginPath();
        
        const topCurveHeight = this.size * 0.3;
        context.moveTo(this.x, this.y + topCurveHeight);
        context.bezierCurveTo(
            this.x, this.y, 
            this.x - this.size / 2, this.y, 
            this.x - this.size / 2, this.y + topCurveHeight
        );
        context.bezierCurveTo(
            this.x - this.size / 2, this.y + (this.size + topCurveHeight) / 2, 
            this.x, this.y + (this.size + topCurveHeight) / 1.2, 
            this.x, this.y + this.size
        );
        context.bezierCurveTo(
            this.x, this.y + (this.size + topCurveHeight) / 1.2, 
            this.x + this.size / 2, this.y + (this.size + topCurveHeight) / 2, 
            this.x + this.size / 2, this.y + topCurveHeight
        );
        context.bezierCurveTo(
            this.x + this.size / 2, this.y, 
            this.x, this.y, 
            this.x, this.y + topCurveHeight
        );
        
        context.fill();
        context.restore();
    }
}

function triggerFireworkWave(centerX, centerY) {
    for (let i = 0; i < 60; i++) {
        fireworkHearts.push(new FireworkHeart(centerX, centerY));
    }
}

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);
}

function getHeartPoint(t) {
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    return { x, y };
}

function initHeartPoints() {
    for (let t = 0; t < Math.PI * 2; t += 0.02) {
        points.push(getHeartPoint(t));
    }
}

function startSurprise() {
    bgAudio.volume = 0.3;
    bgAudio.play().then(() => {
        welcomeScreen.classList.add('hidden');
        animationStarted = true;
    }).catch(error => {
        console.error("Error al reproducir audio:", error);
        welcomeScreen.classList.add('hidden');
        animationStarted = true;
    });
}

function animate() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    ctx.fillStyle = 'rgba(5, 5, 5, 0.2)';
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const scale = Math.min(width, height) / (width < 600 ? 42 : 35);

    if (animationStarted) {
        if (currentPointIndex < points.length) {
            const pointsPerFrame = width < 600 ? 2 : 3;
            for (let i = 0; i < pointsPerFrame && currentPointIndex < points.length; i++) {
                const p = points[currentPointIndex];
                const ptX = centerX + p.x * scale;
                const ptY = centerY + p.y * scale;

                drawnHeartPoints.push({ x: ptX, y: ptY });

                const particleCount = width < 600 ? 1 : 2;
                for (let j = 0; j < particleCount; j++) {
                    particles.push(new Particle(ptX, ptY));
                }
                currentPointIndex++;
            }
        }

        ctx.strokeStyle = '#ff2a5f';
        ctx.lineWidth = width < 600 ? 2.5 : 3.5;
        ctx.shadowBlur = width < 600 ? 10 : 20;
        ctx.shadowColor = '#ff2a5f';
        ctx.beginPath();
        for (let i = 0; i < drawnHeartPoints.length; i++) {
            const hp = drawnHeartPoints[i];
            if (i === 0) ctx.moveTo(hp.x, hp.y);
            else ctx.lineTo(hp.x, hp.y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        if (currentPointIndex >= points.length && !showLoveContent) {
            showLoveContent = true;
            loveContainer.classList.add('visible');
            triggerFireworkWave(centerX, centerY);
        }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw(ctx);
        if (particles[i].life <= 0) {
            particles.splice(i, 1);
        }
    }

    for (let i = fireworkHearts.length - 1; i >= 0; i--) {
        fireworkHearts[i].update();
        fireworkHearts[i].draw(ctx);
        if (fireworkHearts[i].opacity <= 0) {
            fireworkHearts.splice(i, 1);
        }
    }

    requestAnimationFrame(animate);
}

window.addEventListener('resize', resizeCanvas);
startBtn.addEventListener('click', startSurprise);

resizeCanvas();
initHeartPoints();
animate();
