import React, { useState } from 'react';
import { Lesson } from '../types';
import { Illustration } from './Illustration';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, BookOpen, Sparkles } from 'lucide-react';

interface LessonCarouselProps {
  lesson: Lesson;
  onFinishCarousel: () => void;
  onBackToHome: () => void;
}

export const LessonCarousel: React.FC<LessonCarouselProps> = ({
  lesson,
  onFinishCarousel,
  onBackToHome
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for back, 1 for forward

  // Parse markdown-lite for text formatting (bold and italics)
  const renderFormattedText = (text: string) => {
    if (!text) return null;
    // split by double stars for bolding
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return (
      <span className="whitespace-pre-wrap">
        {parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={i} className="font-extrabold text-slate-950 underline decoration-[#2563EB]/30">
                {part.slice(2, -2)}
              </strong>
            );
          }
          // split by single star for italicizing
          const subParts = part.split(/(\*.*?\*)/g);
          return subParts.map((subPart, j) => {
            if (subPart.startsWith('*') && subPart.endsWith('*')) {
              return (
                <em key={`${i}-${j}`} className="italic font-medium text-slate-800 bg-amber-50 px-1 rounded-sm">
                  {subPart.slice(1, -1)}
                </em>
              );
            }
            return subPart;
          });
        })}
      </span>
    );
  };

  // Build the list of cards:
  // Card 0: Title card
  // Card 1-N: CarouselCards from lesson data
  // Card Final: Teaser/Intro to Quiz card
  const cards: Array<{
    id: string;
    type: 'title' | 'story' | 'teaser';
    illustrationType: string;
    customImageUrl?: string;
    layoutFormat: 'top' | 'left-bottom' | 'right-bottom';
    showHeading: boolean;
    showPicture: boolean;
    title: string;
    text: string;
  }> = [
    {
      id: 'card-title',
      type: 'title',
      illustrationType: lesson.illustrationType,
      title: lesson.title,
      text: lesson.aboutText,
      layoutFormat: 'top',
      showHeading: true,
      showPicture: true
    },
    ...lesson.carouselCards.map(c => ({
      id: c.id,
      type: 'story' as const,
      illustrationType: c.illustrationType,
      customImageUrl: c.customImageUrl,
      layoutFormat: c.layoutFormat || 'top',
      showHeading: c.showHeading !== false,
      showPicture: c.showPicture !== false,
      title: c.title,
      text: c.text
    })),
    {
      id: 'card-teaser',
      type: 'teaser',
      illustrationType: 'mirror',
      title: "The Core Inquiry",
      text: `Before we reveal the singular truth of this lesson, let's look closer. Let's test our understanding with a short active recall question. Ready to claim this insight?`,
      layoutFormat: 'top',
      showHeading: true,
      showPicture: true
    }
  ];

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
    } else {
      // Transition to Quiz automatically
      onFinishCarousel();
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
    } else {
      onBackToHome();
    }
  };

  // Swipe to advance / go back
  const handleDragEnd = (_e: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    const { offset, velocity } = info;
    if (offset.x < -60 || velocity.x < -450) {
      handleNext();
    } else if (offset.x > 60 || velocity.x > 450) {
      handleBack();
    }
  };

  const currentCard = cards[currentIndex];
  const progressPct = Math.round(((currentIndex + 1) / cards.length) * 100);

  // Motion variants for smooth soft slide + fade
  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
      scale: 0.98
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.4 },
        scale: { duration: 0.4 }
      }
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
      scale: 0.98,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.3 },
        scale: { duration: 0.3 }
      }
    })
  };

  // Helper to render the image/illustration component
  const renderImage = (card: typeof currentCard) => {
    if (!card.showPicture) return null;
    if (card.customImageUrl) {
      return (
        <div className="w-[150px] h-[150px] flex items-center justify-center overflow-hidden rounded-2xl bg-slate-50 shrink-0 shadow-sm p-2">
          <img
            src={card.customImageUrl}
            alt="Slide visual"
            className="max-w-full max-h-full object-contain rounded-xl"
            referrerPolicy="no-referrer"
          />
        </div>
      );
    }
    return (
      <div className="bg-[#EFF5FE] p-4 rounded-full flex items-center justify-center shrink-0 border border-[#D6E4FA]/40 shadow-sm">
        <Illustration type={card.illustrationType as any} size={110} />
      </div>
    );
  };

  // Staggered reveal so each block eases in — helps the reader move through the card
  const containerStagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
  };
  const itemReveal = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
  };

  // Helper to render the card content based on format
  const renderCardContent = (card: typeof currentCard) => {
    const imageElement = renderImage(card);
    const textElement = (
      <motion.div
        variants={containerStagger}
        initial="hidden"
        animate="show"
        className="bg-[#EFF5FE] border border-[#D6E4FA] rounded-3xl p-5 md:p-6 shadow-sm flex-1 text-left relative w-full"
      >
        {card.showHeading && card.title && (
          <motion.div variants={itemReveal} className="mb-2.5">
            {card.type === 'title' && (
              <span className="text-[9px] font-mono tracking-widest text-[#2563EB] uppercase font-bold block mb-1">
                Day {lesson.dayNumber} Lesson Introduction
              </span>
            )}
            {card.type === 'teaser' && (
              <span className="text-[9px] font-mono tracking-widest text-amber-600 uppercase font-bold flex items-center gap-1 mb-1">
                <BookOpen size={10} /> Key Inquiry
              </span>
            )}
            <h2 className="text-xl md:text-2xl font-serif font-bold text-slate-900 tracking-tight leading-snug">
              {card.title}
            </h2>
          </motion.div>
        )}
        <motion.p variants={itemReveal} className="text-slate-700 font-sans text-xs md:text-sm leading-relaxed">
          {renderFormattedText(card.text)}
        </motion.p>
      </motion.div>
    );

    const hasPic = card.showPicture && (card.customImageUrl || card.illustrationType);

    if (card.layoutFormat === 'left-bottom' && hasPic) {
      return (
        <div className="flex flex-col md:flex-row items-center gap-6 w-full text-left">
          <div className="w-full md:w-1/3 flex justify-center">
            {imageElement}
          </div>
          <div className="w-full md:w-2/3">
            {textElement}
          </div>
        </div>
      );
    }

    if (card.layoutFormat === 'right-bottom' && hasPic) {
      return (
        <div className="flex flex-col md:flex-row-reverse items-center gap-6 w-full text-left">
          <div className="w-full md:w-1/3 flex justify-center">
            {imageElement}
          </div>
          <div className="w-full md:w-2/3">
            {textElement}
          </div>
        </div>
      );
    }

    // Default 'top' format
    return (
      <div className="flex flex-col items-center gap-5 w-full">
        {imageElement}
        <div className="w-full max-w-lg mt-1">
          {textElement}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-full justify-between pb-8 px-5 py-6 bg-[#FFFFFF]">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between mb-6" id="carousel-top-bar">
        <button
          onClick={onBackToHome}
          className="text-xs font-mono font-bold text-slate-500 hover:text-[#0B1F3A] flex items-center gap-1 cursor-pointer"
          id="back-home-link"
        >
          <ArrowLeft size={14} /> Exit Lesson
        </button>
        <span className="text-xs font-mono font-bold text-[#2563EB] uppercase">
          Day {lesson.dayNumber} • Page {currentIndex + 1} of {cards.length}
        </span>
      </div>

      {/* Reading progress bar */}
      <div className="mb-4" id="carousel-progress-bar">
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#FACC15]"
            initial={false}
            animate={{ width: `${progressPct}%` }}
            transition={{ type: 'spring', stiffness: 160, damping: 24 }}
          />
        </div>
      </div>

      {/* Main Devotional Carousel Card with Dynamic Layout */}
      <div className="flex-1 flex flex-col justify-center min-h-[380px] my-4 overflow-hidden relative" id="carousel-card-container">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentCard.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.35}
            onDragEnd={handleDragEnd}
            whileTap={{ cursor: 'grabbing' }}
            className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center text-center w-full min-h-[350px] cursor-grab touch-pan-y select-none"
            id={`lesson-card-${currentIndex}`}
          >
            {renderCardContent(currentCard)}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom controls */}
      <div className="flex flex-col items-center gap-5" id="carousel-footer">
        <p className="text-[10px] font-mono text-slate-400 tracking-wide flex items-center gap-1.5">
          <ArrowLeft size={10} /> Swipe or tap to move through the lesson <ArrowRight size={10} />
        </p>

        {/* Progress dots indicating position */}
        <div className="flex items-center gap-2" id="progress-dots">
          {cards.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex 
                  ? 'w-6 bg-[#2563EB]' 
                  : idx < currentIndex 
                    ? 'w-2 bg-slate-400' 
                    : 'w-2 bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Action Button layout */}
        <div className="grid grid-cols-2 gap-4 w-full" id="carousel-action-buttons">
          <button
            onClick={handleBack}
            className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-sans font-bold py-3.5 px-4 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 text-xs uppercase tracking-wider"
            id="carousel-prev"
          >
            <ArrowLeft size={14} />
            <span>{currentIndex === 0 ? 'Home' : 'Back'}</span>
          </button>

          <button
            onClick={handleNext}
            className="bg-[#0B1F3A] hover:bg-[#2563EB] text-white font-sans font-bold py-3.5 px-4 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 text-xs shadow-sm uppercase tracking-wider"
            id="carousel-next"
          >
            <span>{currentIndex === cards.length - 1 ? 'Go to Quiz' : 'Next'}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
