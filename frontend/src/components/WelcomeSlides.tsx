import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/Button';
import {
  Check,
  ShieldCheck,
  Truck,
  Zap,
  FileText,
  Lock,
  MapPin,
  Navigation,
} from 'lucide-react';

interface WelcomeSlidesProps {
  onComplete: () => void;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
  }),
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => Math.abs(offset) * velocity;

const slideData = [
  {
    id: 0,
    headline: 'Instant Load Matching',
    description:
      'Connect with verified transport providers and available cargo within seconds. Smart matching reduces empty return trips and saves time.',
    features: ['Verified Transporters', 'Faster Matching', 'Better Earnings'],
  },
  {
    id: 1,
    headline: 'Secure Escrow Payments',
    description:
      'Communicate, negotiate, and pay with confidence using our secure escrow system. Funds are released only upon successful delivery.',
    features: ['Verified Companies', 'Secure Messaging', 'Trusted Marketplace'],
  },
  {
    id: 2,
    headline: 'Real-Time GPS Tracking',
    description:
      'Monitor shipment progress with live truck location, route updates and estimated arrival times.',
    features: ['Live Location', 'ETA Updates', 'Smart Alerts'],
  },
];

function SlideIllustration({ page }: { page: number }) {
  if (page === 0) {
    return (
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-slate-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(59,130,246,0.16),transparent_42%)]" />
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="relative z-10 w-[min(62vw,300px)] rounded-[30px] border border-white bg-white p-4 shadow-[0_24px_60px_rgba(15,23,42,0.12)]"
        >
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-brand-600">
              <Truck size={23} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Smart matching</p>
              <p className="text-sm font-black text-slate-900">Cargo matched</p>
            </div>
            <Zap size={18} className="ml-auto text-amber-400" fill="currentColor" />
          </div>
          <div className="mt-4 space-y-3">
            <div className="h-3 w-2/3 rounded-full bg-slate-100" />
            <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
              <div className="h-10 w-10 rounded-xl bg-brand-600/10" />
              <div className="flex-1 space-y-2">
                <div className="h-2.5 w-3/4 rounded-full bg-slate-200" />
                <div className="h-2 w-1/2 rounded-full bg-slate-100" />
              </div>
            </div>
            <div className="h-12 rounded-2xl bg-blue-50" />
          </div>
        </motion.div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.25, type: 'spring' }}
          className="absolute right-[14%] top-[25%] flex h-14 w-14 items-center justify-center rounded-full bg-amber-400 text-white shadow-lg"
        >
          <Zap size={26} fill="currentColor" />
        </motion.div>
      </div>
    );
  }

  if (page === 1) {
    return (
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-slate-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(16,185,129,0.13),transparent_44%)]" />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.55, type: 'spring' }}
          className="relative z-10 flex h-44 w-44 items-center justify-center rounded-[38px] border border-white bg-white shadow-[0_24px_60px_rgba(15,23,42,0.12)]"
        >
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-50 text-brand-600">
            <ShieldCheck size={54} />
          </div>
        </motion.div>
        <motion.div
          initial={{ x: -40, opacity: 0, rotate: -8 }}
          animate={{ x: 0, opacity: 1, rotate: -8 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="absolute left-[10%] top-[28%] rounded-2xl border border-slate-100 bg-white p-4 shadow-lg"
        >
          <FileText size={30} className="text-slate-600" />
        </motion.div>
        <motion.div
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.35, type: 'spring' }}
          className="absolute bottom-[20%] right-[12%] flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg"
        >
          <Lock size={21} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-cyan-50 via-white to-blue-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(37,99,235,0.14),transparent_45%)]" />
      <svg className="absolute inset-0 h-full w-full opacity-20" viewBox="0 0 600 500" preserveAspectRatio="none" aria-hidden="true">
        <path d="M40 420 C170 310 160 120 320 190 S450 390 560 80" fill="none" stroke="currentColor" strokeWidth="28" strokeLinecap="round" className="text-brand-500" />
        <path d="M40 420 C170 310 160 120 320 190 S450 390 560 80" fill="none" stroke="white" strokeWidth="5" strokeDasharray="18 18" strokeLinecap="round" />
      </svg>
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring' }}
        className="relative z-10 flex h-28 w-28 items-center justify-center rounded-full border-8 border-white bg-brand-600 text-white shadow-[0_18px_45px_rgba(37,99,235,0.28)]"
      >
        <MapPin size={46} fill="currentColor" />
      </motion.div>
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
        className="absolute bottom-[16%] right-[9%] flex items-center gap-3 rounded-2xl border border-white bg-white p-3 shadow-lg"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <Navigation size={19} />
        </div>
        <div>
          <p className="text-sm font-black text-slate-900">15 mins away</p>
          <p className="text-[10px] text-slate-500">On route to Lagos</p>
        </div>
      </motion.div>
    </div>
  );
}

export default function WelcomeSlides({ onComplete }: WelcomeSlidesProps) {
  const [[page, direction], setPage] = useState([0, 0]);

  const paginate = (newDirection: number) => {
    if (page + newDirection >= 0 && page + newDirection < slideData.length) {
      setPage([page + newDirection, newDirection]);
    }
  };

  const currentSlide = slideData[page];

  return (
    <div className="fixed inset-0 z-[100] flex h-[100dvh] min-h-[100dvh] w-screen min-w-full flex-col overflow-hidden bg-white font-sans text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="shrink-0 px-5 pt-[max(18px,env(safe-area-inset-top))] pb-3 sm:px-8">
        <div className="flex flex-col items-center text-center select-none">
          <div className="text-[30px] font-sans font-light tracking-tight sm:text-[38px]">
            <span className="font-bold text-brand-600">Trans</span><span className="text-slate-400 dark:text-slate-300">Conet</span>
          </div>
          <p className="mt-1 text-[7px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400 sm:text-[8px]">
            Connecting Cargo with Capacity
          </p>
        </div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={page}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ x: { type: 'spring', stiffness: 300, damping: 32 }, opacity: { duration: 0.2 } }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(_, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);
              if (swipe < -swipeConfidenceThreshold) paginate(1);
              else if (swipe > swipeConfidenceThreshold) paginate(-1);
            }}
            className="absolute inset-0 flex min-h-0 flex-col"
          >
            <div className="min-h-0 flex-[0.9] overflow-hidden">
              <SlideIllustration page={currentSlide.id} />
            </div>

            <div className="flex min-h-0 flex-[1.1] flex-col overflow-y-auto bg-white px-6 pb-[max(20px,env(safe-area-inset-bottom))] pt-6 dark:bg-slate-950 sm:px-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={page}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="mx-auto flex w-full max-w-2xl flex-1 flex-col"
                >
                  <h1 className="text-[30px] font-black leading-[1.05] tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                    {currentSlide.headline}
                  </h1>
                  <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-slate-500 dark:text-slate-400 sm:text-base">
                    {currentSlide.description}
                  </p>

                  <div className="mt-5 space-y-3">
                    {currentSlide.features.map((feature, i) => (
                      <motion.div
                        key={feature}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 + 0.15 }}
                        className="flex items-center gap-3"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                          <Check size={14} />
                        </span>
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{feature}</span>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-auto pt-6">
                    <div className="mb-5 flex justify-center gap-2">
                      {slideData.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          aria-label={`Go to welcome slide ${i + 1}`}
                          onClick={() => setPage([i, i > page ? 1 : -1])}
                          className={`h-2 rounded-full transition-all ${i === page ? 'w-8 bg-brand-600' : 'w-2 bg-slate-200 dark:bg-slate-700'}`}
                        />
                      ))}
                    </div>

                    {page === 2 ? (
                      <div className="grid gap-2.5 sm:grid-cols-2">
                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          onClick={onComplete}
                          className="w-full rounded-2xl bg-brand-600 py-3.5 text-sm font-bold text-white shadow-[0_8px_22px_rgba(37,99,235,0.22)] transition hover:bg-brand-700"
                        >
                          Get Started
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          onClick={onComplete}
                          className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                        >
                          Sign In
                        </motion.button>
                      </div>
                    ) : (
                      <div className="grid gap-2.5 sm:grid-cols-[1fr_auto]">
                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          onClick={() => paginate(1)}
                          className="w-full rounded-2xl bg-brand-600 py-3.5 text-sm font-bold text-white shadow-[0_8px_22px_rgba(37,99,235,0.22)] transition hover:bg-brand-700"
                        >
                          Continue
                        </motion.button>
                        <Button
                          onClick={onComplete}
                          className="w-full rounded-2xl px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white sm:w-auto"
                        >
                          Skip
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
