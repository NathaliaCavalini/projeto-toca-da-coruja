// hero-particles.js - efeito de partículas flutuantes no hero
(function(){
  const HERO_SELECTOR = '.hero-section';
  const CANVAS_ID = 'hero-particles';

  function ensureCanvas(hero){
    let canvas = document.getElementById(CANVAS_ID);
    if(!canvas){
      canvas = document.createElement('canvas');
      canvas.id = CANVAS_ID;
    }
    hero.appendChild(canvas); // garante posicionamento absoluto via CSS existente
    return canvas;
  }

  function init(){
    const hero = document.querySelector(HERO_SELECTOR);
    if(!hero) return;
    hero.style.position = 'relative';
    const canvas = ensureCanvas(hero);
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;

    function resizeCanvas(){
      canvas.width = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
    }

    class Particle{
      constructor(){ this.reset(); }
      reset(){
        this.x = Math.random()*canvas.width;
        this.y = canvas.height + 20;
        this.size = Math.random()*4 + 2;
        this.speedY = -(Math.random()*2 + 0.5);
        this.speedX = (Math.random()-0.5)*0.8;
        this.life = 0; this.maxLife = Math.random()*100 + 100;
        this.opacity = 1; this.wingAngle = 0; this.wingSpeed = Math.random()*0.1 + 0.05;
      }
      update(){
        this.y += this.speedY; this.x += this.speedX; this.life++; this.opacity = 1 - (this.life/this.maxLife); this.wingAngle += this.wingSpeed;
        if(this.life > this.maxLife || this.y < -20){ this.reset(); }
      }
      draw(){
        ctx.save(); ctx.globalAlpha = this.opacity; ctx.translate(this.x,this.y);
        const g = ctx.createRadialGradient(0,0,0,0,0,this.size);
        g.addColorStop(0, `rgba(255,212,163,${this.opacity})`);
        g.addColorStop(0.6, `rgba(197,148,108,${this.opacity*0.8})`);
        g.addColorStop(1, 'rgba(197,148,108,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0,0,this.size,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle = `rgba(197,148,108,${this.opacity*0.5})`; ctx.lineWidth = 1.2; ctx.setLineDash([2,4]);
        ctx.beginPath();
        ctx.moveTo(-this.size*1.8,0);
        ctx.quadraticCurveTo(-this.size*3.5, Math.sin(this.wingAngle)*6, -this.size*2.2, -this.size*0.6);
        ctx.moveTo(this.size*1.8,0);
        ctx.quadraticCurveTo(this.size*3.5, Math.sin(-this.wingAngle)*6, this.size*2.2, -this.size*0.6);
        ctx.stroke(); ctx.setLineDash([]); ctx.restore();
      }
    }

    function initParticles(){
      particles = []; const count = Math.min(Math.floor(canvas.width/15),80);
      for(let i=0;i<count;i++){ particles.push(new Particle()); }
    }

    function animate(){
      ctx.clearRect(0,0,canvas.width,canvas.height);
      particles.forEach(p=>{ p.update(); p.draw(); });
      animationId = requestAnimationFrame(animate);
    }

    resizeCanvas(); initParticles(); animate();
    window.addEventListener('resize', ()=>{ resizeCanvas(); initParticles(); });

    const observer = new MutationObserver(()=>{
      if(document.body.classList.contains('dark-mode')){ ctx.globalCompositeOperation='soft-light'; }
      else{ ctx.globalCompositeOperation='screen'; }
    });
    observer.observe(document.body,{attributes:true,attributeFilter:['class']});
  }

  window.addEventListener('load', init);
})();
