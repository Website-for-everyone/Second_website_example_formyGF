import React, { useState, useEffect, useRef } from 'react';
import { 
  VolumeX, 
  Sparkles, 
  Heart, 
  Trophy, 
  Smile, 
  ArrowRight,
  RotateCcw,
  Zap,
  Coffee,
  HeartHandshake,
  X
} from 'lucide-react';
import { gsap } from 'gsap';
import { PhotoPuzzle } from './components/PhotoPuzzle';

// import 7 real, premium uploaded custom images with relative paths for Vite asset bundling
import mainBg from '../IMG_20260525_054655_415.jpg';
import img1 from '../IMG_20260525_054723_121.jpg';
import img2 from '../IMG_20260525_054749_935.jpg';
import img3 from '../IMG_20260525_054807_572.jpg';
import img4 from '../IMG_20260525_054843_945.jpg';
import img5 from '../IMG_20260525_054929_364.jpg';
import img6 from '../IMG_20260525_054953_627.jpg';
import trackAudio from '../track.mp3';

// Singleton AudioContext state to handle rapid entry without standard browser voice limits or clipping
let globalAudioCtx: AudioContext | null = null;

const playTactileSound = (type: 'tap' | 'success' | 'fail' | 'transition') => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    
    // Initialize or resume single global AudioContext once on user input
    if (!globalAudioCtx) {
      globalAudioCtx = new AudioCtx();
    }
    if (globalAudioCtx.state === 'suspended') {
      globalAudioCtx.resume();
    }
    
    const ctx = globalAudioCtx;
    
    if (type === 'tap') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'success') {
      const now = ctx.currentTime;
      // Sweet classic Major 7th ascending arpeggio for high-end reward
      [523.25, 659.25, 783.99, 987.77].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        gain.gain.setValueAtTime(0.02, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.07 + 0.15);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.15);
      });
    } else if (type === 'fail') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.22);
      gain.gain.setValueAtTime(0.035, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    } else if (type === 'transition') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.012, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    }
  } catch (err) {
    // Fail silently
  }
};

// Beautiful Image wrapper component handling local relative paths with high-end, gorgeous Unsplash fallbacks
interface ImageWithFallbackProps {
  src: string;
  fallbackUrl: string;
  className?: string;
  alt?: string;
}

const ImageWithFallback = ({ src, fallbackUrl, className = '', alt = '' }: ImageWithFallbackProps) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl bg-zinc-100">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#F5F5F7]">
          <div className="w-8 h-8 rounded-full border-2 border-purple-200 border-t-purple-600 animate-spin" />
        </div>
      )}
      <img
        src={imgSrc}
        alt={alt}
        className={`${className} transition-all duration-1000 ease-out ${isLoaded ? 'opacity-100 scale-100 filter blur-0' : 'opacity-0 scale-105 filter blur-sm'}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          if (imgSrc !== fallbackUrl) {
            setImgSrc(fallbackUrl);
          }
        }}
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

// Scroll Reveal with sliding up effect + fade in for custom blocks
interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  key?: React.Key;
}

const ScrollReveal = ({ children, className = '' }: ScrollRevealProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -20px 0px' }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={elementRef}
      className={`${className} transition-all duration-1000 ease-out transform ${
        isVisible 
          ? 'opacity-100 translate-y-0 filter blur-0 scale-100' 
          : 'opacity-0 translate-y-10 filter blur-md scale-95'
      }`}
    >
      {children}
    </div>
  );
};

export default function App() {
  // Lock system states
  const [isLocked, setIsLocked] = useState(true);
  const [pin, setPin] = useState<string>('');
  const [isShaking, setIsShaking] = useState(false);
  const [unlockedSequence, setUnlockedSequence] = useState(false);
  
  // Custom navigation trigger modal state
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  
  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const backupAudioUrl = 'https://assets.mixkit.co/music/preview/mixkit-dreaming-big-31.mp3';

  // Tabs state
  const [activeTab, setActiveTab] = useState<'sila' | 'grit' | 'support'>('sila');

  // Interactive Widgets states
  const [activeSuperpower, setActiveSuperpower] = useState<'mind' | 'style' | 'warmth'>('mind');
  const [activeGraphPoint, setActiveGraphPoint] = useState<number>(1); // June is default
  const [currentProphecy, setCurrentProphecy] = useState<string>('Нажми на кнопку ниже, чтобы запустить звездные часы и раскрыть тайну своего будущего... ✨');
  const [isProphecySpinning, setIsProphecySpinning] = useState<boolean>(false);

  const prophecies = [
    "Тебя ждет головокружительный взлет в любимом деле и миллион поводов для гордости! 🚀",
    "Рядом всегда будут самые верные, любящие и искренние люди, готовые поддержать тебя в любой момент! ✨",
    "Каждая поставленная цель в 2026 году будет покорена со светлой улыбкой и невероятным изяществом! 🏆",
    "Твое обаяние откроет абсолютно любые двери, а новые идеи превзойдут самые смелые ожидания! 🌟",
    "Впереди — потрясающее путешествие, наполненное смехом, теплыми открытиями и космическим счастьем! 💫",
    "Ты создана для великого. Школьный рубеж пройден, впереди — эпоха грандиозных свершений! 👑",
    "Твоя внутренняя эстетика и сила способны менять мир вокруг. Верь в свою уникальность! 🌸"
  ];

  const rollProphecy = () => {
    if (isProphecySpinning) return;
    setIsProphecySpinning(true);
    playTactileSound('transition');
    
    let counter = 0;
    const interval = setInterval(() => {
      setCurrentProphecy(prophecies[Math.floor(Math.random() * prophecies.length)]);
      counter++;
      if (counter > 8) {
        clearInterval(interval);
        const finalProphecy = prophecies[Math.floor(Math.random() * prophecies.length)];
        setCurrentProphecy(finalProphecy);
        setIsProphecySpinning(false);
        playTactileSound('success');
      }
    }, 100);
  };

  // Interactive scroll scenario states
  const [scrollY, setScrollY] = useState(0);

  // 6 Photos Stories block mapped beautifully to user's real uploaded photos!
  const storyCards = [
    {
      title: 'Твоё особенное сияние',
      text: 'Жизнь измеряется не числом вдохов, а моментами, от которых захватывает дух. Твое сияние, искренность и удивительный внутренний свет делают этот мир чище, красивее и глубже.',
      imgSrc: img1,
      fallbackImg: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Искры радости и смеха',
      text: 'Рядом с тобой всегда невероятно легко и весело. Твоя живая энергия, искры юмора и заразительный смех превращают любую встречу в яркий праздник, оставляя самые теплые воспоминания.',
      imgSrc: img2,
      fallbackImg: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Радость в каждом дне',
      text: 'Твоя потрясающая, теплая улыбка способна развеять любые тучи. Ты наполняешь вдохновением сердца людей вокруг, делая это путешествие легким и по-настоящему живым.',
      imgSrc: img3,
      fallbackImg: 'https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Твоя теплая опора',
      text: 'Каждое мудрое слово, вовремя протянутая рука — твоя поддержка ощущается как самое надежное и безопасное крыло, дарующее абсолютную уверенность в грядущих победах.',
      imgSrc: img4,
      fallbackImg: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Покорение новых вершин',
      text: 'Этот важнейший рубеж — это не финишная черта, а крепкий, вечный фундамент. Перед тобой сияют бескрайние просторы, и мы бесконечно верим в каждый твой шаг!',
      imgSrc: img6,
      fallbackImg: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Магия взаимопонимания',
      text: 'У тебя есть редкий, драгоценный дар — находить ключ к сердцу каждого человека. Твое умение слушать сопереживая и легко находить общий язык со всеми объединяет людей.',
      imgSrc: img5,
      fallbackImg: 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=800&q=80',
    }
  ];

  // Initialize hidden audio element safely
  useEffect(() => {
    const audio = new Audio();
    // Use the user's uploaded track.mp3 as primary source
    audio.src = trackAudio;
    audio.loop = true;
    audioRef.current = audio;

    const handleAudioError = () => {
      console.warn("Primary local /track.mp3 failed or not found. Switching to ultra-stable backup stream...");
      // Secondary stable fallback track
      audio.src = backupAudioUrl;
    };

    audio.addEventListener('error', handleAudioError);
    return () => {
      audio.removeEventListener('error', handleAudioError);
      audio.pause();
    };
  }, []);

  // Track window scrolling position for Cinematic Overlays (Scroll Moves 1 & 2)
  useEffect(() => {
    const handleScroll = () => {
      if (isLocked) return;
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLocked]);

  // Lock scroll bar inside the viewport if lockscreen is active
  useEffect(() => {
    if (isLocked) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isLocked]);

  // Manage interactive keypad typing
  const handleKeyClick = (char: string) => {
    if (pin.length >= 4) return;
    playTactileSound('tap');
    
    const nextPin = pin + char;
    setPin(nextPin);

    if (nextPin.length === 4) {
      if (nextPin === '2026') {
        playTactileSound('success');
        
        // Correct pin behavior: Slide UP out of screen instantly via GSAP
        gsap.to('#gatekeeper-lock-overlay', {
          yPercent: -100,
          duration: 0.65,
          ease: 'power2.inOut',
          onComplete: () => {
            setIsLocked(false);
            setUnlockedSequence(true);

            // Play background theme on success automatically
            if (audioRef.current) {
              audioRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(() => {
                  // Fallback for strict browser media locks
                });
            }
          }
        });
      } else {
        // Red iOS shake feedback
        setTimeout(() => {
          playTactileSound('fail');
          setIsShaking(true);
          setTimeout(() => {
            setIsShaking(false);
            setPin('');
          }, 450);
        }, 150);
      }
    }
  };

  const deleteChar = () => {
    if (pin.length === 0) return;
    playTactileSound('tap');
    setPin(pin.slice(0, -1));
  };

  const clearAll = () => {
    if (pin.length === 0) return;
    playTactileSound('tap');
    setPin('');
  };

  const toggleAudioControl = () => {
    if (!audioRef.current) return;
    playTactileSound('tap');
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn("Autoplay was blocked or primary source error. Playing secondary backup...", err);
          audioRef.current!.src = 'https://assets.mixkit.co/music/preview/mixkit-ambient-smiles-58.mp3';
          audioRef.current!.play()
            .then(() => setIsPlaying(true))
            .catch(e => console.error("All audio fallbacks failed:", e));
        });
    }
  };

  // Triggers order mockup notification modal
  const triggerOrderAlert = () => {
    playTactileSound('transition');
    setIsOrderModalOpen(true);
  };

  // Helper smooth scroll to avoid getting stuck during early scroll scenarios on mobile
  const scrollToContent = () => {
    playTactileSound('transition');
    const target = document.getElementById('our-moments-section');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Calculate coordinates for Scroll Move elements in client-side runtime
  // Welcome card opacity & slide logic
  const welcomeCardProgress = Math.max(0, Math.min(1.0, scrollY / 400));
  // Large Graduation Card slide logic: comes in around scrollY 150 to 800
  const gradCardProgress = Math.max(0, Math.min(1.0, (scrollY - 100) / 450));
  // Full white screen masking: rolls up when user continues to scroll (scrollY 750 to 1400)
  const rollUpProgress = Math.max(0, Math.min(1.0, (scrollY - 650) / 500));

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] select-none no-scrollbar relative overflow-x-hidden font-sans">
      
      {/* 2. Brand Premium Header: Long Thin Oval Glassmorphic Navigation Menu (Fully optimized for Mobile) */}
      <header className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-[90] w-[94vw] sm:w-[92%] max-w-lg flex items-center justify-between gap-2 sm:gap-4 px-4 sm:px-5 py-2.5 rounded-full apple-glass shadow-lg shadow-zinc-200/45 text-xs text-zinc-800 font-medium tracking-tight">
        {/* Simulating luxurious Multi-Page navigation items */}
        <div className="flex items-center gap-1.5 cursor-pointer hover:opacity-85 transition-opacity" onClick={triggerOrderAlert}>
          <div className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
          <span className="font-bold text-[10px] sm:text-[11px] font-comfortaa uppercase tracking-wider text-purple-600">Сюрприз</span>
        </div>
        
        {/* Responsive Navbar: hide individual items on very small viewports to maintain extreme precision */}
        <nav className="flex items-center gap-3 sm:gap-6">
          <button onClick={triggerOrderAlert} className="hidden sm:inline-block hover:text-purple-600 cursor-pointer transition-colors">Главная</button>
          <button onClick={triggerOrderAlert} className="hidden sm:inline-block hover:text-purple-600 cursor-pointer transition-colors">Галерея</button>
          <button onClick={triggerOrderAlert} className="hover:text-purple-600 uppercase tracking-widest text-[10px] sm:text-xs font-comfortaa font-bold ml-1 hover:scale-102 transition-transform cursor-pointer">Заказать</button>
        </nav>

        {/* Dynamic Glassmorphic Music Toggle */}
        <button
          onClick={toggleAudioControl}
          className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 active:scale-90 text-zinc-800 focus:outline-none shadow-sm shrink-0"
          title={isPlaying ? "Поставить музыку на паузу" : "Включить фоновую музыку"}
        >
          {isPlaying ? (
            <div className="flex gap-[2px] items-end justify-center h-3 w-3">
              <span className="w-0.5 bg-purple-600 rounded-full sound-bar" style={{ height: '4px', animationDelay: '0.1s' }}></span>
              <span className="w-0.5 bg-purple-600 rounded-full sound-bar" style={{ height: '8px', animationDelay: '0.3s', animationDuration: '0.6s' }}></span>
              <span className="w-0.5 bg-purple-600 rounded-full sound-bar" style={{ height: '3px', animationDelay: '0s' }}></span>
            </div>
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-zinc-500" />
          )}
        </button>
      </header>

      {/* Modern Multi-page Simulating Elegant Alert Modal */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 bg-[#1D1D1F]/40 backdrop-blur-md z-[1000] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="w-full max-w-sm apple-glass rounded-3xl p-6 sm:p-8 shadow-2xl relative border border-white flex flex-col items-center text-center animate-scale-up">
            <button
              onClick={() => { playTactileSound('tap'); setIsOrderModalOpen(false); }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-150/10 hover:bg-zinc-100 flex items-center justify-center cursor-pointer transition-colors text-zinc-650"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            
            <h3 className="text-base sm:text-lg font-extrabold text-zinc-800 font-jakarta leading-snug">Индивидуальный дизайн</h3>
            
            <p className="text-zinc-550 text-xs sm:text-sm font-light leading-relaxed mt-2 sm:mt-3 px-1">
              «Хочешь узнать, как будет выглядеть эта страница? Просто сделай заказ!»
            </p>
            
            <button
              onClick={() => { playTactileSound('tap'); setIsOrderModalOpen(false); }}
              className="w-full mt-5 sm:mt-6 py-3 rounded-full bg-purple-600 text-white font-bold text-xs uppercase tracking-widest font-comfortaa hover:bg-purple-700 transition"
            >
              Превосходно
            </button>
          </div>
        </div>
      )}

      {/* 3. Fully Responsive iOS-Style Lock Screen */}
      {isLocked && (
        <div 
          id="gatekeeper-lock-overlay"
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center p-4 sm:p-6 bg-[#F5F5F7]"
        >
          {/* Main Keypad Glass container - dynamically adapt spacing and limits on short screen heights */}
          <div 
            className={`w-[92vw] max-w-sm apple-glass rounded-3xl p-5 sm:p-8 py-6 sm:py-10 shadow-2xl flex flex-col items-center transform transition-all duration-300 max-h-[96vh] overflow-y-auto no-scrollbar ${
              isShaking ? 'animate-shake border-red-300 shadow-xl shadow-red-50/80 bg-red-50/10' : ''
            }`}
          >
            {/* Soft locked head */}
            <div className="flex flex-col items-center mb-4 sm:mb-8 text-center shrink-0">
              <div className="w-10 h-10 sm:h-12 sm:w-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-2 sm:mb-4 border border-purple-100">
                <Smile className="w-5 h-5 animate-bounce" />
              </div>
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-[#1D1D1F] font-jakarta">Вход в подарок</h1>
              <p className="text-[11px] sm:text-xs text-zinc-400 mt-1 max-w-[210px] leading-relaxed">Введите памятную дату, чтобы запустить путешествие.</p>
            </div>

            {/* iOS Pin code dot inputs */}
            <div className="flex gap-3 sm:gap-4 mb-6 sm:mb-9 justify-center shrink-0">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-3 sm:w-3.5 h-3 sm:h-3.5 rounded-full border-2 transition-all duration-200 ${
                    pin.length > idx 
                      ? 'bg-purple-600 border-purple-600 scale-110 shadow-md shadow-purple-200' 
                      : 'border-zinc-300 bg-transparent'
                  }`}
                />
              ))}
            </div>

            {/* Tactile friendly dynamic iOS Keys (scaled wonderfully for smaller mobile screens) */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-[240px] sm:max-w-[260px] w-full mb-4 sm:mb-6 mx-auto shrink-0">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  onClick={() => handleKeyClick(digit)}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white border border-zinc-150/60 shadow-sm flex flex-col items-center justify-center cursor-pointer font-comfortaa text-base sm:text-lg font-bold text-zinc-800 transition-all active:scale-90 active:bg-purple-50 active:border-purple-200 focus:outline-none"
                >
                  {digit}
                </button>
              ))}

              {/* Bottom Special keypads line */}
              <button
                onClick={clearAll}
                className="w-12 h-12 flex items-center justify-center font-jakarta text-[11px] sm:text-xs text-zinc-400 font-medium active:scale-95 focus:outline-none"
              >
                Сброс
              </button>

              <button
                onClick={() => handleKeyClick('0')}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white border border-zinc-150/60 shadow-sm flex items-center justify-center font-comfortaa text-base sm:text-lg font-bold text-zinc-800 transition-all active:scale-90 active:bg-purple-50 active:border-purple-200 focus:outline-none"
              >
                0
              </button>

              <button
                onClick={deleteChar}
                className="w-12 h-12 flex items-center justify-center font-jakarta text-[11px] sm:text-xs text-zinc-400 font-medium active:scale-95 focus:outline-none"
              >
                Стереть
              </button>
            </div>

            {/* Hint for developers and review */}
            <span className="text-[10px] text-zinc-300 select-all tracking-wide mt-1" title="Подсказка">Код: 2026</span>
          </div>
        </div>
      )}

      {/* Main Core Viewport once gatekeeper has been successfully unlocked */}
      <div className={`transition-all duration-700 ${unlockedSequence ? 'opacity-100 blur-0' : 'opacity-0 blur-md'}`}>
        
        {/* IMMERSIVE SCENARIO VIEW CONTAINER: FIXED BACKGROUND WRAPPER */}
        <div className="relative h-[210vh] w-full">
          
          {/* Stunning Background Fixed image panel container (loaded with your real main cover photo) */}
          <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
            <ImageWithFallback
              src={mainBg}
              fallbackUrl="https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1400&q=80"
              alt="Красивая обложка памятного момента"
              className="w-full h-full object-cover scale-100 filter brightness-90"
            />
            {/* Atmospheric light vignetting or fine luxury gradient filter */}
            <div className="absolute inset-0 bg-neutral-900/15 pointer-events-none" />
          </div>

          {/* SCENARIO MOVE 1: The elegant responsive Welcome Card */}
          <div 
            className="absolute top-[35vh] sm:top-[45vh] left-1/2 w-[92%] sm:w-[90%] max-w-xl z-25 transition-all text-center pointer-events-auto"
            style={{
              opacity: Math.max(0, 1 - welcomeCardProgress * 2.2),
              transform: `translate3d(-50%, -${welcomeCardProgress * 180}px, 0)`,
              display: welcomeCardProgress >= 0.95 ? 'none' : 'block'
            }}
          >
            <div className="rounded-3xl p-5 sm:p-8 py-8 sm:py-10 apple-glass shadow-2xl border border-white">
              <span className="text-[9px] sm:text-[10px] text-purple-650 font-bold uppercase tracking-widest font-jakarta mb-2 block">Великий Шаг</span>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-zinc-800 tracking-tight font-jakarta leading-snug">
                «Этот важный этап успешно пройден...»
              </h2>
              <p className="text-zinc-550 font-light text-xs sm:text-sm mt-3 max-w-md mx-auto leading-relaxed">
                Твой первый ключевой отрезок лег в основу твоей бесконечной уверенности. Листай дальше, чтобы увидеть историю.
              </p>
              
              <div className="mt-6 flex flex-col items-center justify-center gap-3">
                <button 
                  onClick={scrollToContent} 
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] uppercase tracking-widest font-comfortaa rounded-full shadow-lg hover:shadow-purple-200/50 transition-all active:scale-95 duration-200 cursor-pointer"
                >
                  Смотреть историю
                </button>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-zinc-400 font-jakarta">или крути вниз</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-bounce mt-1.5" />
                </div>
              </div>
            </div>
          </div>

          {/* SCENARIO MOVE 2: Glassmorphic graduation milestones subtext */}
          <div 
            className="absolute top-[105vh] sm:top-[110vh] left-1/2 w-[92%] sm:w-[90%] max-w-xl z-30 transition-all pointer-events-auto"
            style={{
              opacity: Math.max(0, Math.min(1.0, gradCardProgress * 2.6 - (scrollY > 600 ? (scrollY - 600) / 100 : 0))),
              transform: `translate3d(-50%, -${gradCardProgress * 220}px, 0)`,
              display: scrollY > 750 ? 'none' : 'block'
            }}
          >
            <div className="rounded-3xl p-6 sm:p-10 apple-glass shadow-3xl border border-white/60 space-y-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-[9px] sm:text-[10px] text-purple-600 font-bold uppercase tracking-wider font-jakarta">
                  Выпускной Релиз
                </div>
                <span className="text-[10px] text-zinc-400 font-mono tracking-wider">11 Класс • Поздравляем</span>
              </div>

              <h3 className="text-lg sm:text-2xl font-black font-jakarta text-zinc-800 tracking-tight leading-snug">
                Позади годы ярких дедлайнов, упорных штурмов и вдохновляющих открытий.
              </h3>

              <p className="text-zinc-550 text-xs sm:text-sm font-light leading-relaxed">
                Завершение 11-го класса — это великолепное и неповторимое достижение. Твоя целеустремленность, глубина ума и способность двигаться вперед заслуживают самого искреннего признания. Это не просто окончание школы, это запуск новой, технологичной и удивительно красивой версии твоей жизни.
              </p>

              <div className="pt-1.5 flex items-center justify-between text-xs font-semibold text-purple-650 font-jakarta">
                <button onClick={scrollToContent} className="hover:underline hover:text-purple-700">Перейти к моментам</button>
                <span className="animate-pulse">↓</span>
              </div>
            </div>
          </div>

          {/* SCENARIO MOVE 3: Pure visual white masking that rolls up cleanly */}
          <div 
            className="absolute top-[175vh] inset-x-0 h-[35vh] z-40 bg-white transition-all flex items-end justify-center pb-2 pointer-events-none"
            style={{
              transform: `translate3d(0, -${rollUpProgress * 80}px, 0)`,
              height: `${35 + rollUpProgress * 65}vh`
            }}
          >
            <div className="w-full text-center pb-12 opacity-80">
              <ArrowRight className="w-5 h-5 text-purple-600 mx-auto transform rotate-90 animate-bounce" />
            </div>
          </div>

        </div>


        {/* MAIN BODY CONTENTS: Pure White high-end responsive grid layout */}
        <div id="our-moments-section" className="relative z-50 bg-white min-h-screen">
          
          {/* 4. Section: "Наши моменты" (Displaying user's real pictures) */}
          <section className="bg-white py-16 sm:py-24 px-4 sm:px-6 relative border-t border-zinc-100">
            <div className="w-full max-w-4xl mx-auto">
              
              {/* Clean luxury layout header */}
              <div className="text-center mb-16 sm:mb-24 space-y-3">
                <div className="w-8 h-[2px] bg-purple-600 mx-auto" />
                <span className="text-[10px] sm:text-xs text-purple-600 font-extrabold uppercase tracking-widest font-jakarta block pt-1">События года</span>
                <h2 className="text-2xl sm:text-4xl font-extrabold font-jakarta tracking-tight text-zinc-800 leading-tight">Наши моменты</h2>
                <p className="text-xs sm:text-sm text-zinc-400 font-light max-w-md mx-auto px-2">
                  Шесть теплых, воодушевляющих и поддерживающих зарисовок о твоем пути, теплых улыбках и триумфе.
                </p>
              </div>

              {/* 6 Photos real images responsive list */}
              <div className="space-y-16 sm:space-y-28 md:space-y-36">
                {storyCards.map((card, idx) => (
                  <ScrollReveal key={idx}>
                    <div className={`flex flex-col ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-6 sm:gap-10 md:gap-14`}>
                      
                      {/* Photo Image Card */}
                      <div className="w-full md:w-1/2 aspect-[4/3] rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-700 hover:scale-[1.01]">
                        <ImageWithFallback
                          src={card.imgSrc}
                          fallbackUrl={card.fallbackImg}
                          alt={card.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Descriptive support text info */}
                      <div className="w-full md:w-1/2 flex flex-col items-start text-left space-y-3 sm:space-y-4 px-2 sm:px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-comfortaa text-purple-600 font-bold text-sm sm:text-base tracking-widest">0{idx + 1}</span>
                          <div className="h-[1px] w-6 bg-zinc-200" />
                          <span className="text-[9px] sm:text-[10px] text-zinc-400 uppercase tracking-widest font-jakarta font-medium">Moments</span>
                        </div>
                        <h3 className="text-lg sm:text-2xl font-extrabold text-zinc-800 font-jakarta tracking-tight leading-snug">{card.title}</h3>
                        <p className="text-xs sm:text-base text-zinc-500 leading-relaxed font-light">{card.text}</p>
                      </div>

                    </div>
                  </ScrollReveal>
                ))}
              </div>

            </div>
          </section>


          {/* 5. Section: "Главные грани твоей уникальности" (The Mathematically Aligned Elegant Tabs Block) */}
          <section className="bg-[#F5F5F7] py-16 sm:py-24 px-4 sm:px-6 border-y border-zinc-150/40 relative">
            <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
              
              <ScrollReveal className="space-y-3 text-center mb-10 sm:mb-12">
                <span className="text-xs text-purple-600 font-extrabold uppercase tracking-widest font-jakarta block">Твои Релизы</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-jakarta text-zinc-800">Главные грани твоей уникальности</h2>
                <p className="text-xs sm:text-sm text-zinc-400 font-light max-w-sm mx-auto px-2">Интерактивный анализ качеств, которые помогают создавать шедевры день за днем.</p>
              </ScrollReveal>

              {/* Centered Segmented Control layout adapting beautifully on mobile device sizes */}
              <ScrollReveal className="w-full flex justify-center mb-8 sm:mb-10">
                <div className="inline-flex p-[4px] sm:p-[5px] rounded-full bg-zinc-200/50 backdrop-blur-md relative border border-zinc-200/20 shadow-inner max-w-md w-full justify-between">
                  
                  <button
                    onClick={() => { playTactileSound('tap'); setActiveTab('sila'); }}
                    className={`flex-1 py-2 sm:py-3 px-1 sm:px-2 rounded-full text-[10px] sm:text-xs font-bold transition-all duration-300 relative z-10 font-comfortaa focus:outline-none cursor-pointer ${
                      activeTab === 'sila' ? 'bg-white text-purple-600 shadow-md scale-102 sm:scale-105' : 'text-zinc-500 hover:text-zinc-800'
                    }`}
                  >
                    <span className="flex items-center gap-1 justify-center">
                      <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Сила
                    </span>
                  </button>
                  
                  <button
                    onClick={() => { playTactileSound('tap'); setActiveTab('grit'); }}
                    className={`flex-1 py-2 sm:py-3 px-1 sm:px-2 rounded-full text-[10px] sm:text-xs font-bold transition-all duration-300 relative z-10 font-comfortaa focus:outline-none cursor-pointer ${
                      activeTab === 'grit' ? 'bg-white text-purple-600 shadow-md scale-102 sm:scale-105' : 'text-zinc-500 hover:text-zinc-800'
                    }`}
                  >
                    <span className="flex items-center gap-1 justify-center">
                      <Coffee className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Упорство
                    </span>
                  </button>
                  
                  <button
                    onClick={() => { playTactileSound('tap'); setActiveTab('support'); }}
                    className={`flex-1 py-2 sm:py-3 px-1 sm:px-2 rounded-full text-[10px] sm:text-xs font-bold transition-all duration-300 relative z-10 font-comfortaa focus:outline-none cursor-pointer ${
                      activeTab === 'support' ? 'bg-white text-purple-600 shadow-md scale-102 sm:scale-105' : 'text-zinc-500 hover:text-zinc-800'
                    }`}
                  >
                    <span className="flex items-center gap-1 justify-center">
                      <HeartHandshake className="w-3.5 h-3.5" /> Поддержка
                    </span>
                  </button>

                </div>
              </ScrollReveal>

              {/* Mathematically Center-Aligned Description Card box with mobile friendly padding */}
              <div className="w-full max-w-xl min-h-[160px] text-center p-6 sm:p-8 rounded-3xl apple-glass shadow-md shadow-zinc-200/50 border border-white flex flex-col items-center justify-center relative overflow-hidden">
                
                {activeTab === 'sila' && (
                  <div className="animate-fade-in space-y-2 max-w-md">
                    <h4 className="text-sm sm:text-lg font-extrabold text-[#7C3AED] font-jakarta flex items-center justify-center gap-2">
                       Энергия Побеждать
                    </h4>
                    <p className="text-xs sm:text-sm text-zinc-550 leading-relaxed font-light">
                      Твоя настоящая сила заключается в исключительно красивом, разумном подходе к делу. Ты бережно принимаешь решения, раскладываешь сложные формулы успеха по полочкам и вдохновляешь верить.
                    </p>
                  </div>
                )}

                {activeTab === 'grit' && (
                  <div className="animate-fade-in space-y-2 max-w-md">
                    <h4 className="text-sm sm:text-lg font-extrabold text-[#7C3AED] font-jakarta flex items-center justify-center gap-2">
                      Решительное Видение
                    </h4>
                    <p className="text-xs sm:text-sm text-zinc-555 leading-relaxed font-light">
                      Для тебя не существует преград — только интересные задачи. Твое рвение учиться, изучать современные технологии со вкусом заставляет верить, что ты достигнешь абсолютно любой цели.
                    </p>
                  </div>
                )}

                {activeTab === 'support' && (
                  <div className="animate-fade-in space-y-2 max-w-md">
                    <h4 className="text-sm sm:text-lg font-extrabold text-[#7C3AED] font-jakarta flex items-center justify-center gap-2">
                      Тепло Каждого Слова
                    </h4>
                    <p className="text-xs sm:text-sm text-zinc-555 leading-relaxed font-light">
                      Самый редкий дар — это доброта и отзывчивость. Твоё мудрое слово уберегает от штормов, помогая окружающим заново поверить в свои безграничные силы и новые масштабные высоты.
                    </p>
                  </div>
                )}

              </div>

            </div>
          </section>


          {/* 6. Section: Horizontal Carousel of interactive Carousel Widgets */}
          <section className="bg-white py-16 sm:py-24 px-4 sm:px-6 overflow-hidden">
            <div className="w-full max-w-4xl mx-auto">
              
              <ScrollReveal className="text-center mb-10 sm:mb-12 space-y-3">
                <span className="text-xs text-purple-600 font-extrabold uppercase tracking-widest font-jakarta block">Интерактивный Мониторинг</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-jakarta text-zinc-800">Панель Успеваемости</h2>
                <p className="text-xs sm:text-sm text-zinc-400 font-light max-w-xs mx-auto px-2">Прокручивай горизонтально, чтобы увидеть все метрики твоего года.</p>
              </ScrollReveal>

              {/* The horizontal, touch-friendly scrolling container with scroll snap */}
              <ScrollReveal>
                <div 
                  className="flex gap-4 sm:gap-6 overflow-x-auto pb-8 pt-2 scroll-smooth snap-x snap-mandatory scrollbar-thin scrollbar-thumb-purple-200"
                  style={{ WebkitOverflowScrolling: 'touch' }}
                >
                  
                  {/* Widget 1: Interactive Segmented Circular Donut Chart for "Ценность" */}
                  <div 
                    className="snap-center shrink-0 w-[290px] sm:w-[340px] rounded-3xl apple-glass p-5 sm:p-6 pb-6 border border-zinc-150 flex flex-col justify-between min-h-[260px] shadow-md hover:shadow-xl transition-all duration-305 hover:scale-[1.01] select-none"
                  >
                    <div className="flex justify-between items-start">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                        <Trophy className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] sm:text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-jakarta">Диаграмма</span>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-5 mt-3">
                      {/* Smooth SVG gauge circle */}
                      <div 
                        onClick={() => {
                          playTactileSound('tap');
                          const nextMap: Record<'mind' | 'style' | 'warmth', 'mind' | 'style' | 'warmth'> = {
                            mind: 'style',
                            style: 'warmth',
                            warmth: 'mind'
                          };
                          setActiveSuperpower(nextMap[activeSuperpower]);
                        }}
                        className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shrink-0 cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-200 bg-white shadow-sm border border-zinc-100/50 rounded-full"
                      >
                        <svg className="w-[85%] h-[85%] transform -rotate-90">
                          <circle cx="28" cy="28" r="24" className="stroke-zinc-100 fill-none" strokeWidth="4" />
                          <circle 
                            cx="28" 
                            cy="28" 
                            r="24" 
                            className="stroke-purple-600 fill-none transition-all duration-700 ease-out" 
                            strokeWidth="4" 
                            strokeDasharray="150"
                            strokeDashoffset="0" // 100% filled!
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="absolute text-xs sm:text-sm font-black text-purple-600 font-comfortaa">100%</span>
                      </div>

                      <div>
                        <span className="text-xl sm:text-2xl font-black text-[#1D1D1F] tracking-tight font-comfortaa">Ценность</span>
                        <h4 className="text-[11px] sm:text-xs font-bold text-purple-600 uppercase tracking-widest mt-0.5 font-jakarta">Твоя основа</h4>
                        <p className="text-[10px] sm:text-[11px] text-zinc-400 mt-1 font-light leading-snug">Ты обладаешь абсолютным набором качеств лидера и вдохновителя.</p>
                      </div>
                    </div>

                    {/* Interactive Pill Selector of traits inside the widget card */}
                    <div className="mt-4 pt-3 border-t border-zinc-100 flex justify-between gap-1">
                      <button 
                        onClick={() => { playTactileSound('tap'); setActiveSuperpower('mind'); }}
                        className={`px-2 py-1 rounded-full text-[9px] font-bold active:scale-95 transition-all outline-none ${activeSuperpower === 'mind' ? 'bg-purple-600 text-white shadow-sm' : 'bg-zinc-100 text-zinc-500 hover:text-zinc-800'}`}
                      >
                        Разум
                      </button>
                      <button 
                        onClick={() => { playTactileSound('tap'); setActiveSuperpower('style'); }}
                        className={`px-2 py-1 rounded-full text-[9px] font-bold active:scale-95 transition-all outline-none ${activeSuperpower === 'style' ? 'bg-purple-600 text-white shadow-sm' : 'bg-zinc-100 text-zinc-500 hover:text-zinc-800'}`}
                      >
                        Стиль
                      </button>
                      <button 
                        onClick={() => { playTactileSound('tap'); setActiveSuperpower('warmth'); }}
                        className={`px-2 py-1 rounded-full text-[9px] font-bold active:scale-95 transition-all outline-none ${activeSuperpower === 'warmth' ? 'bg-purple-600 text-white shadow-sm' : 'bg-zinc-100 text-zinc-500 hover:text-zinc-800'}`}
                      >
                        Свет
                      </button>
                    </div>

                    {/* Description changes based on superpower tab */}
                    <div className="min-h-[48px] mt-2 text-[10px] sm:text-[11px] text-zinc-500 leading-snug italic font-light">
                      {activeSuperpower === 'mind' && "💡 Стратегический ум, способный решать сложнейшие задачи и находить гениальные выходы."}
                      {activeSuperpower === 'style' && "🎨 Безупречное чувство прекрасного, любовь к качественным деталям и роскошная эстетика."}
                      {activeSuperpower === 'warmth' && "✨ Искренность, согревающая всех вокруг и озаряющая даже хмурые рабочие будни."}
                    </div>
                  </div>

                  {/* Widget 2: Elegant Interactive SVG Area Line Chart */}
                  <div 
                    className="snap-center shrink-0 w-[290px] sm:w-[340px] rounded-3xl apple-glass p-5 sm:p-6 pb-6 border border-zinc-150 flex flex-col justify-between min-h-[260px] shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.01] select-none"
                  >
                    <div className="flex justify-between items-start">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-blue-650" />
                      </div>
                      <span className="text-[9px] sm:text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-jakarta">График Успеха</span>
                    </div>

                    {/* Real Interactive SVG Sparkline */}
                    <div className="relative h-24 sm:h-28 w-full mt-2 flex items-center justify-center">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100">
                        <defs>
                          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        
                        {/* Background Grid Lines */}
                        <line x1="15" y1="20" x2="285" y2="20" className="stroke-zinc-100" strokeWidth="1" strokeDasharray="3" />
                        <line x1="15" y1="50" x2="285" y2="50" className="stroke-zinc-100" strokeWidth="1" strokeDasharray="3" />
                        <line x1="15" y1="80" x2="285" y2="80" className="stroke-zinc-100" strokeWidth="1" strokeDasharray="3" />

                        {/* SVG Filled Area Path */}
                        <path 
                          d={`M 15 75 Q 100 ${activeGraphPoint === 0 ? '45' : activeGraphPoint === 1 ? '15' : '30'} 105 ${activeGraphPoint === 1 ? '15' : '45'} T 195 ${activeGraphPoint === 2 ? '20' : '40'} T 285 ${activeGraphPoint === 3 ? '12' : '45'} L 285 95 L 15 95 Z`}
                          className="fill-[url(#chartGrad)] transition-all duration-500 ease-out"
                        />

                        {/* SVG Smooth Curve Path */}
                        <path 
                          d="M 15 75 C 60 70, 80 15, 105 15 C 150 15, 150 45, 195 38 C 240 31, 260 12, 285 12"
                          fill="none"
                          stroke="#7C3AED"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                        />

                        {/* Tappable Interaction circles for month markers */}
                        {[
                          { x: 15, y: 75, month: 'Май', info: 'Штурм & Финал', label: '92%' },
                          { x: 105, y: 15, month: 'Июнь', info: 'Главный Взлет', label: '100% 🎓' },
                          { x: 195, y: 38, month: 'Июль', info: 'Новые Горизонты', label: '98%' },
                          { x: 285, y: 12, month: 'Авг', info: 'Абсолютный Пик', label: '100% 🚀' }
                        ].map((pt, index) => (
                          <g 
                            key={index} 
                            className="cursor-pointer"
                            onClick={() => { playTactileSound('success'); setActiveGraphPoint(index); }}
                          >
                            {/* Outer Pulse glow circle */}
                            <circle 
                              cx={pt.x} 
                              cy={pt.y} 
                              r={activeGraphPoint === index ? 9 : 4} 
                              className="fill-purple-300 stroke-none transition-all duration-300 opacity-60" 
                            />
                            {/* Inner core circle */}
                            <circle 
                              cx={pt.x} 
                              cy={pt.y} 
                              r={activeGraphPoint === index ? 5 : 3} 
                              className={`${activeGraphPoint === index ? 'fill-purple-700' : 'fill-purple-500'} stroke-white stroke-[1.5] transition-all duration-300`} 
                            />
                            {/* Small text label under / above circles */}
                            <text 
                              x={pt.x} 
                              y={pt.y - 12} 
                              className="text-[9px] font-bold font-comfortaa fill-purple-700 text-center" 
                              textAnchor="middle"
                            >
                              {pt.month}
                            </text>
                          </g>
                        ))}
                      </svg>
                    </div>

                    {/* Active graph details panel */}
                    <div className="mt-3 p-2.5 rounded-xl bg-purple-50/50 border border-purple-100 flex flex-col min-h-[62px] justify-center text-left">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[11px] font-extrabold text-[#7C3AED] uppercase tracking-wider font-jakarta">
                          {activeGraphPoint === 0 && 'Май 2026'}
                          {activeGraphPoint === 1 && 'Июнь 2026 (Выпускной!)'}
                          {activeGraphPoint === 2 && 'Июль 2026'}
                          {activeGraphPoint === 3 && 'Август 2026'}
                        </span>
                        <span className="text-[10px] sm:text-xs font-black text-purple-600 font-mono">
                          {activeGraphPoint === 0 && '92% успеха'}
                          {activeGraphPoint === 1 && '100% вершины 🎓'}
                          {activeGraphPoint === 2 && '98% уюта'}
                          {activeGraphPoint === 3 && '100% возможностей'}
                        </span>
                      </div>
                      <span className="text-[10px] sm:text-[11px] text-zinc-550 leading-relaxed font-light mt-0.5">
                        {activeGraphPoint === 0 && 'Ожесточенная подготовка к экзаменам, бессонные ночи и первый огромный шаг к завершению школьного этапа.'}
                        {activeGraphPoint === 1 && 'Выпускной бал, долгожданный диплом 11 класса и стопроцентное счастье. Самая яркая и памятная точка лета!'}
                        {activeGraphPoint === 2 && 'Чистая свобода, бескрайнее июльское солнце, сладкий отдых и построение грандиозных планов на жизнь.'}
                        {activeGraphPoint === 3 && 'Уверенное покорение новых вершин, подготовка к зачислению и старт триумфальной взрослой истории.'}
                      </span>
                    </div>
                  </div>

                  {/* Widget 3: Magical Interactive Prophecy Slot Machine */}
                  <div 
                    className="snap-center shrink-0 w-[290px] sm:w-[340px] rounded-3xl apple-glass p-5 sm:p-6 pb-6 border border-zinc-150 flex flex-col justify-between min-h-[260px] shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.01] select-none"
                  >
                    <div className="flex justify-between items-start">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                      </div>
                      <span className="text-[9px] sm:text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-jakarta">Будущее</span>
                    </div>

                    <div className="mt-3 text-center flex-1 flex flex-col justify-center items-center px-1">
                      <div className="h-[2px] w-8 bg-indigo-100 mb-2.5" />
                      <h3 className="text-xs font-bold text-zinc-400 font-jakarta uppercase tracking-widest mb-1.5">Твое Предсказание</h3>
                      
                      <div className={`text-[11px] sm:text-xs text-zinc-700 leading-relaxed font-semibold min-h-[64px] flex items-center justify-center px-2 transition-all duration-300 ${isProphecySpinning ? 'opacity-40 scale-95 filter blur-[1px]' : 'opacity-100 scale-100 blur-0'}`}>
                        <p className="font-sans italic text-indigo-900 border-l-2 border-indigo-400 pl-2.5 text-center">
                          {currentProphecy}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={rollProphecy}
                      disabled={isProphecySpinning}
                      className={`w-full mt-4 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-750 text-white font-bold text-[10px] uppercase tracking-widest font-comfortaa shadow-md hover:shadow-lg active:scale-95 transition-all outline-none flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isProphecySpinning ? (
                        <>
                          <div className="w-3.5 h-3.5 rounded-full border border-white border-t-transparent animate-spin" />
                          Развертывание будущего...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                          Получить предсказание ✨
                        </>
                      )}
                    </button>
                  </div>

                </div>
              </ScrollReveal>

            </div>
          </section>

          {/* 6.5. Interactive Memory Photo Puzzle Section */}
          <section className="bg-[#F5F5F7]/30 py-16 sm:py-24 px-4 sm:px-6 relative border-t border-zinc-150/40">
            <PhotoPuzzle 
              images={[
                { url: img3, title: 'Радость', description: 'Твоя потрясающая, вдохновляющая улыбка 🌸' },
                { url: img4, title: 'Теплая опора', description: 'Твоя поддержка и надежность в любой момент 💫' },
                { url: img6, title: 'Новые вершины', description: 'Твой сияющий покоренный рубеж 🎓' }
              ]}
              playTactileSound={playTactileSound}
            />
          </section>

          {/* 7. Pure White Minimalist Finale */}
          <section className="bg-white py-20 sm:py-28 px-4 sm:px-6 relative flex flex-col justify-center items-center border-t border-zinc-50">
            
            <div className="w-full max-w-2xl text-center space-y-10 sm:space-y-12">
              
              {/* Pulsing luxurious violet heart outline */}
              <div className="flex justify-center">
                <div 
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-purple-100 flex items-center justify-center cursor-pointer animate-pulse-heart transition-all duration-300 active:scale-110"
                  onClick={() => playTactileSound('success')}
                  title="Постучи в сердце"
                >
                  <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-[#7C3AED] fill-transparent stroke-[1.5]" />
                </div>
              </div>

              {/* Luxury typographic text layout */}
              <div className="space-y-4 sm:space-y-6 px-2 sm:px-4">
                
                <h2 className="text-xs font-bold uppercase text-[#7C3AED] tracking-widest font-jakarta">
                  Финальный Релиз
                </h2>

                <div className="space-y-4 sm:space-y-6 md:space-y-8 select-none py-4">
                  <ScrollReveal className="animate-line-reveal-1">
                    <p className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-none font-jakarta text-shimmer-glow py-1.5">
                      Впереди целый мир.
                    </p>
                  </ScrollReveal>
                  
                  <ScrollReveal className="animate-line-reveal-2">
                    <p className="text-xl sm:text-3xl font-extrabold tracking-tight leading-relaxed font-jakarta text-zinc-800 hover:scale-102 transition-all duration-300 cursor-default">
                      Я верю в каждый твой шаг.
                    </p>
                  </ScrollReveal>

                  <ScrollReveal className="animate-line-reveal-3">
                    <p className="text-xl sm:text-3xl font-black tracking-tight leading-normal font-jakarta text-zinc-900">
                      Горжусь тобой.
                    </p>
                  </ScrollReveal>

                  <ScrollReveal className="animate-line-reveal-4">
                    <p className="text-lg sm:text-2xl font-extrabold tracking-widest leading-loose font-comfortaa text-[#7C3AED] uppercase">
                      — Всегда рядом —
                    </p>
                  </ScrollReveal>
                </div>

              </div>

              {/* Start again callback toggle button */}
              <div className="pt-4 sm:pt-6">
                <button
                  onClick={() => {
                    playTactileSound('transition');
                    setPin('');
                    setIsLocked(true);
                    setUnlockedSequence(false);
                    window.scrollTo({ top: 0, behavior: 'auto' });
                  }}
                  className="inline-flex items-center gap-2 text-[10px] sm:text-xs text-zinc-400 hover:text-purple-600 transition-colors uppercase tracking-widest cursor-pointer focus:outline-none"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Начать сначала
                </button>
              </div>

            </div>
          </section>

        </div>

      </div>

    </div>
  );
}
