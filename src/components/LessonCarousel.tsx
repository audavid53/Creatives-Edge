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
              <strong key={i} className="font-extrabold text-stone-950 underline decoration-[#C85A32]/30">
                {part.slice(2, -2)}
              </strong>
            );
          }
          // split by single star for italicizing
          const subParts = part.split(/(\*.*?\*)/g);
          return subParts.map((subPart, j) => {
            if (subPart.startsWith('*') && subPart.endsWith('*')) {
              return (
                <em key={`${i}-${j}`} className="italic font-medium text-stone-800 bg-amber-50 px-1 rounded-sm">
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

  const currentCard = cards[currentIndex];

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
        <div className="w-[150px] h-[150px] flex items-center justify-center overflow-hidden rounded-2xl bg-stone-50 shrink-0 shadow-3xs p-2">
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
      <div className="bg-[#FAF6F0] p-4 rounded-full flex items-center justify-center shrink-0 border border-[#EBE3D5]/40 shadow-3xs">
        <Illustration type={card.illustrationType as any} size={110} />
      </div>
    );
  };

  // Helper to render the card content based on format
  const renderCardContent = (card: typeof currentCard) => {
    const imageElement = renderImage(card);
    const textElement = (
      <div className="bg-[#FAF6F0] border border-[#EBE3D5] rounded-3xl p-5 md:p-6 shadow-3xs flex-1 text-left relative w-full">
        {card.showHeading && card.title && (
          <div className="mb-2.5">
            {card.type === 'title' && (
              <span className="text-[9px] font-mono tracking-widest text-[#C85A32] uppercase font-bold block mb-1">
                Day {lesson.dayNumber} Lesson Introduction
              </span>
            )}
            {card.type === 'teaser' && (
              <span className="text-[9px] font-mono tracking-widest text-amber-600 uppercase font-bold flex items-center gap-1 mb-1">
                <BookOpen size={10} /> Key Inquiry
              </span>
            )}
            <h2 className="text-xl md:text-2xl font-serif font-bold text-stone-900 tracking-tight leading-snug">
              {card.title}
            </h2>
          </div>
        )}
        <p className="text-stone-700 font-sans text-xs md:text-sm leading-relaxed">
          {renderFormattedText(card.text)}
        </p>
      </div>
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
    <div className="flex flex-col min-h-full justify-between pb-8 px-5 py-6 bg-[#FDFBF7]">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between mb-6" id="carousel-top-bar">
        <button
          onClick={onBackToHome}
          className="text-xs font-mono font-bold text-stone-500 hover:text-[#1C1917] flex items-center gap-1 cursor-pointer"
          id="back-home-link"
        >
          <ArrowLeft size={14} /> Exit Lesson
        </button>
        <span className="text-xs font-mono font-bold text-[#C85A32] uppercase">
          Day {lesson.dayNumber} • Page {currentIndex + 1} of {cards.length}
        </span>
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
            className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-3xs flex flex-col items-center justify-center text-center w-full min-h-[350px]"
            id={`lesson-card-${currentIndex}`}
          >
            {renderCardContent(currentCard)}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom controls */}
      <div className="flex flex-col items-center gap-5" id="carousel-footer">
        {/* Progress dots indicating position */}
        <div className="flex items-center gap-2" id="progress-dots">
          {cards.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex 
                  ? 'w-6 bg-[#C85A32]' 
                  : idx < currentIndex 
                    ? 'w-2 bg-stone-400' 
                    : 'w-2 bg-stone-200'
              }`}
            />
          ))}
        </div>

        {/* Action Button layout */}
        <div className="grid grid-cols-2 gap-4 w-full" id="carousel-action-buttons">
          <button
            onClick={handleBack}
            className="bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 font-sans font-bold py-3.5 px-4 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 text-xs uppercase tracking-wider"
            id="carousel-prev"
          >
            <ArrowLeft size={14} />
            <span>{currentIndex === 0 ? 'Home' : 'Back'}</span>
          </button>

          <button
            onClick={handleNext}
            className="bg-[#1C1917] hover:bg-[#C85A32] text-white font-sans font-bold py-3.5 px-4 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 text-xs shadow-sm uppercase tracking-wider"
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
