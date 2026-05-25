import React, { useState, useEffect } from 'react';
import { Camera, RefreshCw, Sparkles, Eye, Trophy, CheckCircle, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PuzzleImage {
  url: string;
  title: string;
  description: string;
}

interface PhotoPuzzleProps {
  images: PuzzleImage[];
  playTactileSound: (type: 'tap' | 'success' | 'fail' | 'transition') => void;
}

export const PhotoPuzzle: React.FC<PhotoPuzzleProps> = ({ images, playTactileSound }) => {
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);
  const [gridSize, setGridSize] = useState(4); // 3 for 3x3, 4 for 4x4
  const [pieces, setPieces] = useState<number[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [isSolved, setIsSolved] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);

  const activeImage = images[selectedImgIdx] || images[0];

  // Initialize and shuffle the puzzle
  const initPuzzle = (size: number) => {
    const total = size * size;
    // Create sorted pieces array
    let shuffled = Array.from({ length: total }, (_, i) => i);

    // Swap items randomly via Fisher-Yates
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = temp;
    }

    // Ensure it's not solved instantly
    let isAlreadySolved = true;
    for (let i = 0; i < total; i++) {
      if (shuffled[i] !== i) {
        isAlreadySolved = false;
        break;
      }
    }
    
    // If by ultra rare chance it's shuffled solved, swap first two Elements
    if (isAlreadySolved && total > 1) {
      const temp = shuffled[0];
      shuffled[0] = shuffled[1];
      shuffled[1] = temp;
    }

    setPieces(shuffled);
    setMoves(0);
    setIsSolved(false);
    setSelectedIdx(null);
  };

  // Re-run setup whenever grid size or main image changes
  useEffect(() => {
    if (activeImage) {
      initPuzzle(gridSize);
    }
  }, [gridSize, selectedImgIdx]);

  const handleTileClick = (index: number) => {
    if (isSolved || showOriginal) return;

    if (selectedIdx === null) {
      // First tile clicked
      setSelectedIdx(index);
      playTactileSound('tap');
    } else {
      // Second tile clicked - perform swap!
      if (selectedIdx === index) {
        // Tapped same tile again, just deselect
        setSelectedIdx(null);
        playTactileSound('tap');
        return;
      }

      const newPieces = [...pieces];
      const temp = newPieces[selectedIdx];
      newPieces[selectedIdx] = newPieces[index];
      newPieces[index] = temp;

      setPieces(newPieces);
      setMoves((m) => m + 1);
      setSelectedIdx(null);
      playTactileSound('tap');

      // Check if perfectly solved!
      const solved = newPieces.every((val, idx) => val === idx);
      if (solved) {
        setIsSolved(true);
        playTactileSound('success');
      }
    }
  };

  // Calculate matching percentage
  const matchesCount = pieces.reduce((acc, val, idx) => acc + (val === idx ? 1 : 0), 0);
  const solvedPercent = Math.round((matchesCount / (gridSize * gridSize)) * 100);

  // Automatic Magic Solver command
  const autoSolve = () => {
    playTactileSound('success');
    const total = gridSize * gridSize;
    const solvedArray = Array.from({ length: total }, (_, i) => i);
    setPieces(solvedArray);
    setIsSolved(true);
    setSelectedIdx(null);
  };

  return (
    <div id="interactive-photo-puzzle" className="w-full max-w-2xl mx-auto px-4 py-4 select-none">
      
      {/* Container inside the section grid */}
      <div className="rounded-3xl border border-zinc-150 p-5 sm:p-8 apple-glass shadow-xl relative overflow-hidden bg-white/70">
        
        {/* Decorative corner ambient glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-200/20 blur-3xl rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-200/20 blur-3xl rounded-full" />

        <div className="text-center mb-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-[#7C3AED] text-[10px] font-bold uppercase tracking-widest mb-3 border border-purple-100/50">
            <Camera className="w-3 h-3 animate-pulse" />
            Интерактивный подарок
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-jakarta tracking-tight text-zinc-800">
            Собери наши воспоминания ✨
          </h2>
          <p className="text-[11px] sm:text-xs text-zinc-500 mt-1.5 font-light max-w-md mx-auto leading-relaxed">
            Выбирай любое теплое фото, регулируй формат и коснись двух кусочков на игровом поле, чтобы поменять их местами!
          </p>
        </div>

        {/* Level Controls & Previews */}
        <div className="flex flex-col gap-4 mb-5 relative z-10">
          
          {/* 1) Clickable Thumbnails to switch photo */}
          <div className="flex items-center justify-center gap-4 py-1">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => {
                  playTactileSound('transition');
                  setSelectedImgIdx(idx);
                }}
                className={`relative group transition-all duration-300 rounded-xl overflow-hidden shadow-sm aspect-square w-14 sm:w-16 border-2 focus:outline-none ${
                  selectedImgIdx === idx 
                    ? 'border-purple-600 ring-2 ring-purple-100 scale-105' 
                    : 'border-zinc-200 opacity-60 hover:opacity-100 hover:scale-102 hover:border-zinc-300'
                }`}
              >
                <img 
                  src={img.url} 
                  alt={img.title} 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                />
                <span className="absolute bottom-0 inset-x-0 bg-black/50 text-[8px] text-white font-black truncate px-0.5 text-center py-[2px] opacity-0 group-hover:opacity-100 transition-opacity">
                  {img.title}
                </span>
              </button>
            ))}
          </div>

          {/* 2) Grid toggler difficulty + Utility Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-50 p-2 rounded-2xl border border-zinc-150/50">
            
            {/* Hardness Level Selector */}
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl shadow-sm border border-zinc-200/50">
              <button
                onClick={() => {
                  playTactileSound('tap');
                  setGridSize(3);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all ${
                  gridSize === 3 
                    ? 'bg-purple-600 text-white' 
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                3 × 3 (Просто)
              </button>
              <button
                onClick={() => {
                  playTactileSound('tap');
                  setGridSize(4);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all ${
                  gridSize === 4 
                    ? 'bg-purple-600 text-white' 
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                4 × 4 (Вызов)
              </button>
            </div>

            {/* Utility View/Shuffle Bar */}
            <div className="flex items-center gap-2">
              <button
                onMouseDown={() => setShowOriginal(true)}
                onMouseUp={() => setShowOriginal(false)}
                onTouchStart={() => setShowOriginal(true)}
                onTouchEnd={() => setShowOriginal(false)}
                className={`p-2 rounded-xl border border-zinc-200 hover:bg-zinc-100 text-zinc-650 transition-colors flex items-center justify-center gap-1 active:scale-95`}
                title="Зажать, чтобы увидеть оригинал"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold hidden xs:inline">Зажать оригинал</span>
              </button>

              <button
                onClick={() => {
                  playTactileSound('transition');
                  initPuzzle(gridSize);
                }}
                className="p-2 w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-zinc-200 hover:bg-zinc-100 text-zinc-700 transition-colors flex items-center justify-center active:scale-95"
                title="Перемешать плитки"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>

        {/* Puzzle Board Area */}
        <div className="relative flex justify-center items-center py-2 z-10">
          
          <div 
            className="relative w-[280px] h-[280px] xs:w-[320px] xs:h-[320px] sm:w-[380px] sm:h-[380px] bg-zinc-100 rounded-2xl overflow-hidden shadow-inner border-4 border-white/80 select-none p-1"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
              gridTemplateRows: `repeat(${gridSize}, 1fr)`,
              gap: '1px',
            }}
          >
            {/* Interactive swap Tiles */}
            {pieces.map((pieceVal, idx) => {
              // Calculate correct 2D location to draw the crop
              const correctRow = Math.floor(pieceVal / gridSize);
              const correctCol = pieceVal % gridSize;
              
              // Calculate offset percentage
              const colPercent = (correctCol / (gridSize - 1)) * 100;
              const rowPercent = (correctRow / (gridSize - 1)) * 100;

              const isMatch = pieceVal === idx;
              const isTileSelected = selectedIdx === idx;

              return (
                <div
                  key={idx}
                  onClick={() => handleTileClick(idx)}
                  className={`relative w-full h-full cursor-pointer overflow-hidden transition-all duration-200 rounded-[4px] border ${
                    isTileSelected 
                      ? 'ring-4 ring-yellow-400 z-20 scale-[0.98]' 
                      : isMatch 
                        ? 'border-transparent' 
                        : 'border-white/10 hover:brightness-105 active:scale-95'
                  }`}
                  style={{
                    backgroundImage: `url(${activeImage.url})`,
                    backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
                    backgroundPosition: `${colPercent}% ${rowPercent}%`,
                    boxShadow: isTileSelected ? '0 10px 25px -5px rgba(234, 180, 8, 0.4)' : 'none',
                  }}
                >
                  {/* Fine design touch: small success anchor dot if matched correctly */}
                  {isMatch && !isSolved && (
                    <div className="absolute top-1.5 right-1.5 bg-emerald-500/90 w-1.5 h-1.5 rounded-full ring-2 ring-white/60 animate-bounce" />
                  )}

                  {/* Dark mask overlay if another piece is selected to highlight contrast */}
                  {selectedIdx !== null && !isTileSelected && (
                    <div className="absolute inset-0 bg-black/10 pointer-events-none transition-opacity duration-200" />
                  )}
                </div>
              );
            })}

            {/* Hold to show original cover override */}
            <AnimatePresence>
              {showOriginal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white z-30"
                >
                  <img 
                    src={activeImage.url} 
                    alt="Оригинал" 
                    className="w-full h-full object-cover rounded-xl"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-x-0 bottom-4 text-center">
                    <span className="px-3 py-1 rounded-full bg-black/75 text-[10px] text-white font-bold tracking-widest uppercase">
                      Просмотр оригинала
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Victory Reward Panel */}
            <AnimatePresence>
              {isSolved && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute inset-0 bg-gradient-to-b from-purple-950/95 to-indigo-950/95 z-30 flex flex-col items-center justify-center p-6 text-center text-white"
                >
                  {/* Rotating decorative halo background */}
                  <div className="absolute w-36 h-36 bg-gradient-to-tr from-yellow-300 to-amber-500 blur-3xl opacity-35 rounded-full animate-pulse" />

                  <motion.div
                    initial={{ y: 20 }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.15, type: 'spring', stiffness: 120 }}
                    className="relative z-10 flex flex-col items-center"
                  >
                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 flex items-center justify-center shadow-lg transform -rotate-6 mb-4 animate-bounce">
                      <Trophy className="w-7 h-7" />
                    </div>

                    <h3 className="text-lg sm:text-xl font-extrabold text-[#FEE2E2] font-comfortaa leading-tight">
                      Ура, ты великолепна! 🎉
                    </h3>
                    
                    <p className="text-[11px] sm:text-xs text-indigo-200 leading-relaxed font-light mt-3 max-w-xs italic px-1">
                      "Твоя собранность, невероятное упорство и искренний фокус способны превратить любой сумбур в совершенную гармонию. Красивое воспоминание сияет перед тобой во всей полноте! 💖"
                    </p>

                    {/* Quick description of photo */}
                    <div className="mt-4 p-2 py-1.5 rounded-xl bg-white/10 border border-white/15 text-[10px] font-semibold text-amber-200 tracking-wide">
                      📷 {activeImage.title}: {activeImage.description}
                    </div>

                    <button
                      onClick={() => {
                        playTactileSound('transition');
                        initPuzzle(gridSize);
                      }}
                      className="mt-5 px-6 py-2 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-950 font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all outline-none cursor-pointer flex items-center gap-1.5 shadow-md"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Собрать еще раз
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

        {/* Live Status Indicators (Progress and Moves) */}
        <div className="mt-5 flex items-center justify-between text-xs font-bold text-zinc-500 px-1 relative z-10">
          
          <div className="flex items-center gap-1">
            <CheckCircle className={`w-3.5 h-3.5 ${isSolved ? 'text-emerald-500' : solvedPercent > 50 ? 'text-purple-400' : 'text-zinc-400'}`} />
            <span>Совпадений:</span>
            <span className={`text-sm tracking-tight font-black ml-0.5 ${isSolved ? 'text-emerald-600' : solvedPercent > 50 ? 'text-purple-600 font-comfortaa' : 'text-zinc-700'}`}>
              {solvedPercent}%
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-zinc-400" />
            <span>Ходов:</span>
            <span className="text-sm font-black text-zinc-700 font-mono">
              {moves}
            </span>
          </div>

        </div>

        {/* Progress Bar under indicators */}
        <div className="w-full bg-zinc-100 h-1.5 rounded-full mt-2.5 overflow-hidden border border-zinc-200/50">
          <div 
            className={`h-full transition-all duration-500 ease-out rounded-full ${
              isSolved 
                ? 'bg-emerald-500' 
                : solvedPercent > 70 
                  ? 'bg-purple-600' 
                  : solvedPercent > 35 
                    ? 'bg-indigo-500' 
                    : 'bg-zinc-400'
            }`}
            style={{ width: `${solvedPercent}%` }}
          />
        </div>

        {/* Quick cheat-code helper / developer testing trick button */}
        {!isSolved && (
          <div className="flex justify-center mt-4">
            <button
              onClick={autoSolve}
              className="text-[9px] text-zinc-400 hover:text-purple-600 font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-purple-600/60" />
              Магическое решение
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
