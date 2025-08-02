import { useState, useEffect, useRef, useCallback } from 'react';

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  gravity: number;
  friction: number;
  opacity: number;
  decay: number;
  color: string;
  shape: 'rectangle' | 'circle';
  getRandomColor(): string;
  update(): void;
  draw(ctx: CanvasRenderingContext2D): void;
  isDead(): boolean;
}

interface SuccessAnimationProps {
  isVisible?: boolean;
  onComplete?: () => void;
}

const SuccessAnimation = ({ isVisible = false, onComplete = () => {} }: SuccessAnimationProps) => {
  const [showCheckmark, setShowCheckmark] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const confettiParticles = useRef<ConfettiParticle[]>([]);

  // Confetti particle class
  class ConfettiParticleClass implements ConfettiParticle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    rotation: number;
    rotationSpeed: number;
    size: number;
    gravity: number;
    friction: number;
    opacity: number;
    decay: number;
    color: string;
    shape: 'rectangle' | 'circle';

    constructor(x: number, y: number) {
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5) * 15; // Random horizontal velocity
      this.vy = (Math.random() - 0.5) * 15 - 5; // Random vertical velocity (upward bias)
      this.rotation = Math.random() * 360;
      this.rotationSpeed = (Math.random() - 0.5) * 10;
      this.size = Math.random() * 8 + 4;
      this.gravity = 0.3;
      this.friction = 0.99;
      this.opacity = 1;
      this.decay = Math.random() * 0.015 + 0.005;
      this.color = this.getRandomColor();
      this.shape = Math.random() > 0.5 ? 'rectangle' : 'circle';
    }

    getRandomColor(): string {
      const colors = [
        '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', 
        '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd',
        '#00d2d3', '#ff9f43', '#ee5a6f', '#0abde3'
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    }

    update(): void {
      this.vx *= this.friction;
      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.rotation += this.rotationSpeed;
      this.opacity -= this.decay;
    }

    draw(ctx: CanvasRenderingContext2D): void {
      if (this.opacity <= 0) return;

      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.fillStyle = this.color;

      if (this.shape === 'rectangle') {
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    isDead(): boolean {
      return this.opacity <= 0 || this.y > window.innerHeight + 100;
    }
  }

  const createConfettiExplosion = useCallback((centerX: number, centerY: number) => {
    const particles: ConfettiParticle[] = [];
    for (let i = 0; i < 150; i++) {
      particles.push(new ConfettiParticleClass(centerX, centerY));
    }
    confettiParticles.current = particles;
  }, []);

  const animateConfetti = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    confettiParticles.current.forEach((particle, index) => {
      particle.update();
      particle.draw(ctx);

      if (particle.isDead()) {
        confettiParticles.current.splice(index, 1);
      }
    });

    if (confettiParticles.current.length > 0) {
      animationRef.current = requestAnimationFrame(animateConfetti);
    }
  }, []);

  const startConfettiAnimation = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create explosion from center
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    createConfettiExplosion(centerX, centerY);
    animateConfetti();
  }, [createConfettiExplosion, animateConfetti]);

  useEffect(() => {
    if (isVisible) {
      // Show checkmark after brief delay
      const checkmarkTimer = setTimeout(() => {
        setShowCheckmark(true);
      }, 200);

      // Start confetti explosion after checkmark animation
      const confettiTimer = setTimeout(() => {
        startConfettiAnimation();
      }, 800);

      // Complete animation
      const completeTimer = setTimeout(() => {
        onComplete();
      }, 4000);

      return () => {
        clearTimeout(checkmarkTimer);
        clearTimeout(confettiTimer);
        clearTimeout(completeTimer);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    } else {
      // Reset animation state
      setShowCheckmark(false);
      confettiParticles.current = [];
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
  }, [isVisible, onComplete, startConfettiAnimation]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      {/* Confetti Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 10 }}
      />
      
      {/* Success Card */}
      <div className="relative z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full mx-4 p-8 animate-scaleIn border border-white/20 dark:border-gray-700/50">
        <div className="text-center">
          {/* Success Circle with Checkmark */}
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className={`
              relative w-full h-full rounded-full bg-gradient-to-br from-green-400 to-green-600 
              shadow-2xl transform transition-all duration-700 ease-out
              ${showCheckmark ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}
            `}>
              {/* Animated background pulse */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400 to-green-600 animate-ping opacity-20" />
              
              {/* Checkmark */}
              <svg 
                className="absolute inset-0 w-full h-full p-6" 
                viewBox="0 0 24 24" 
                fill="none"
              >
                <path
                  d="M9 12l2 2 4-4"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`
                    transition-all duration-600 ease-out delay-300
                    ${showCheckmark ? 'opacity-100' : 'opacity-0'}
                  `}
                  style={{
                    strokeDasharray: 20,
                    strokeDashoffset: showCheckmark ? 0 : 20,
                    transition: 'stroke-dashoffset 0.6s ease-out 0.3s, opacity 0.6s ease-out 0.3s'
                  }}
                />
              </svg>
              
              {/* Outer glow ring */}
              <div className={`
                absolute -inset-2 rounded-full border-2 border-green-300 
                transition-all duration-1000 ease-out
                ${showCheckmark ? 'scale-150 opacity-0' : 'scale-100 opacity-60'}
              `} />
              
              {/* Inner highlight */}
              <div className="absolute inset-2 rounded-full bg-white opacity-20" />
            </div>
          </div>
          
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 animate-slideInUp">
            Event Submitted!
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-8 animate-slideInUp" style={{animationDelay: '0.2s'}}>
            Your event has been successfully submitted and will be reviewed by an administrator. You'll be notified once it's approved!
          </p>
          
          <button
            onClick={onComplete}
            className="px-12 py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold shadow-lg shadow-green-500/25 transition-all duration-300 hover:from-emerald-500 hover:to-green-500 hover:shadow-green-400/40 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 animate-slideInUp"
            style={{animationDelay: '0.4s'}}
          >
            Great!
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessAnimation; 