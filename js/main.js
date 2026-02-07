// Simple effects: typewriter, confetti canvas, floating hearts & balloons, audio trigger.

const nameEl = document.getElementById('name');
const msgEl = document.getElementById('message');
const btn = document.getElementById('celebrateBtn');
const music = document.getElementById('music');
const confettiCanvas = document.getElementById('confetti');
const heartsContainer = document.getElementById('hearts');
const balloonsContainer = document.getElementById('balloons');

if (msgEl) msgEl.classList.add('caret');

const TYPE_SPEED = 28;
function typeWriter(text, el, onDone){
    if(!el) return onDone && onDone();
    el.textContent = '';
    let i = 0;
    function step(){
        if(i < text.length){
            el.textContent += text[i++];
            setTimeout(step, TYPE_SPEED);
        } else {
            el.classList.remove('caret');
            onDone && onDone();
        }
    }
    step();
}

// show message typed out (safe access)
if(msgEl) typeWriter(msgEl.dataset.text || msgEl.textContent || '', msgEl);

// confetti implementation (guard canvas)
let ctx = null;
let confettiParts = [];
if(confettiCanvas && confettiCanvas.getContext){
    ctx = confettiCanvas.getContext('2d');
    function resizeCanvas(){
        confettiCanvas.width = innerWidth;
        confettiCanvas.height = innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function spawnConfetti(x, y, count = 70){
        const colors = ['#FF6B81','#FFD166','#6FFFB0','#9AD0FF','#E19BFF'];
        for(let i=0;i<count;i++){
            confettiParts.push({
                x: (x !== undefined) ? x : Math.random()*innerWidth,
                y: (y !== undefined) ? y : Math.random()*innerHeight*0.5,
                size: 6 + Math.random()*10,
                color: colors[Math.floor(Math.random()*colors.length)],
                vx: (Math.random()-0.5)*8,
                vy: -6 + Math.random()*6,
                rot: Math.random()*360,
                vr: (Math.random()-0.5)*12,
                life: 80 + Math.random()*60
            });
        }
    }

    function updateConfetti(){
        ctx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height);
        for(let i=confettiParts.length-1;i>=0;i--){
            const p = confettiParts[i];
            p.life--;
            p.vy += 0.18; // gravity
            p.x += p.vx;
            p.y += p.vy;
            p.rot += p.vr;
            ctx.save();
            ctx.translate(p.x,p.y);
            ctx.rotate(p.rot * Math.PI / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size*0.6);
            ctx.restore();
            if(p.y > innerHeight+50 || p.x < -50 || p.x > innerWidth+50 || p.life <= 0){
                confettiParts.splice(i,1);
            }
        }
        requestAnimationFrame(updateConfetti);
    }
    requestAnimationFrame(updateConfetti);

    // expose spawn function to outer scope
    window._spawnConfetti = spawnConfetti;
} else {
    // fallback no-op
    window._spawnConfetti = function(){};
}

// floating hearts
function spawnHeart(x){
    if(!heartsContainer) return;
    const div = document.createElement('div');
    div.className = 'heart';
    div.style.left = (x || (20 + Math.random()*80)) + 'vw';
    div.style.bottom = '-10vh';
    div.style.setProperty('--c', ['#ff6b81','#ff9aa2','#ffd166','#ffb3c6'][Math.floor(Math.random()*4)]);
    div.style.animationDuration = (8 + Math.random()*6) + 's';
    div.style.transform = `translate(-50%,0) rotate(${Math.random()*40-20}deg)`;
    heartsContainer.appendChild(div);
    // remove later
    setTimeout(()=>div.remove(), 16000);
}

// balloons
function spawnBalloon(x){
    if(!balloonsContainer) return;
    const el = document.createElement('div');
    el.className = 'balloon';
    el.style.left = (x || (10 + Math.random()*80)) + 'vw';
    const colors = [
        'linear-gradient(180deg,#ffd166,#ff9a66)',
        'linear-gradient(180deg,#9ad0ff,#6f8fff)',
        'linear-gradient(180deg,#ff6b81,#ff9aa2)',
        'linear-gradient(180deg,#c285ff,#ffd6ff)'
    ];
    el.style.background = colors[Math.floor(Math.random()*colors.length)];
    el.style.animationDuration = (10 + Math.random()*8) + 's';
    balloonsContainer.appendChild(el);
    setTimeout(()=>el.remove(), 20000);
}

// periodic gentle effects
setInterval(()=> spawnHeart(Math.random()*80+10), 900);
setInterval(()=> {
    if(Math.random() < 0.27) spawnBalloon(Math.random()*80+10);
}, 1400);

// button action: play audio + confetti + bursts
if(btn){
    btn.addEventListener('click', () => {
        // confetti (use spawnConfetti if canvas available)
        const spawn = window._spawnConfetti || function(){};
        spawn(innerWidth/2, innerHeight/3, 160);
        // optional music play (user can add file at src/audio/happy-birthday.mp3)
        if(music && music.src){
            music.currentTime = 0;
            music.volume = 0.9;
            music.play().catch(()=>{ /* ignore play errors */ });
        }
        // quick extra bursts
        setTimeout(()=>spawn(innerWidth*0.3, innerHeight*0.2, 80), 350);
        setTimeout(()=>spawn(innerWidth*0.7, innerHeight*0.25, 80), 700);
        // small local hearts
        for(let i=0;i<12;i++) setTimeout(()=>spawnHeart(40+Math.random()*20), i*120);
    });
}

// small friendly hint: pressing space triggers a burst (keyboard accessible)
window.addEventListener('keydown', (e)=>{
    if(e.code === 'Space') {
        e.preventDefault();
        btn && btn.click();
    }
});

// ----------------------
// Background sparkles & parallax
// ----------------------
// create a simple sparkle layer: small particles that gently appear and drift
;(function backgroundSparkles(){
    const container = document.createElement('div');
    container.className = 'sparkles parallax';
    document.body.appendChild(container);

    function makeSpark(){
        const s = document.createElement('div');
        s.className = 'spark';
        if(Math.random() < 0.2) s.classList.add('glow');
        const x = Math.random()*100; const y = Math.random()*100;
        s.style.left = x + 'vw';
        s.style.top = y + 'vh';
        const dur = 2400 + Math.random()*4200;
        container.appendChild(s);
        // animate with JS for predictable timing
        requestAnimationFrame(()=>{
            s.style.transition = `opacity ${dur/1000}s linear, transform ${dur/1000}s linear`;
            s.style.opacity = '0.9';
            s.style.transform = `translate(-50%,-50%) scale(${0.6 + Math.random()*1.2}) translateY(${ -10 - Math.random()*40 }px)`;
        });
        setTimeout(()=>{
            s.style.opacity = '0';
            s.style.transform = `translate(-50%,-50%) scale(0.2) translateY(${ -200 }px)`;
            setTimeout(()=>s.remove(), 1000);
        }, dur);
    }
    // staggered spawn
    setInterval(()=>{ if(Math.random() < 0.9) makeSpark(); }, 480);

    // parallax on mouse move
    let lastX=0,lastY=0;
    window.addEventListener('mousemove', (ev)=>{
        const vx = (ev.clientX / window.innerWidth - 0.5) * 12; // small offset
        const vy = (ev.clientY / window.innerHeight - 0.5) * 8;
        container.style.transform = `translate3d(${vx}px, ${vy}px, 0)`;
        lastX = vx; lastY = vy;
    });
})();
document.addEventListener("DOMContentLoaded", function() {
    const messageContainer = document.createElement("div");
    messageContainer.classList.add("birthday-message");
    
    const message = document.createElement("h1");
    message.textContent = "Happy Birthday to my loving wife!";
    
    const subMessage = document.createElement("p");
    subMessage.textContent = "You are the light of my life and I cherish every moment with you. Enjoy your special day!";
    
    messageContainer.appendChild(message);
    messageContainer.appendChild(subMessage);
    
    document.body.appendChild(messageContainer);
});
