import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/Button';
import { 
  Check, 
  ShieldCheck, 
  Truck, 
  Zap, 
  Smartphone, 
  FileText, 
  Lock, ArrowRight,  
  MapPin,
  Navigation
} from 'lucide-react';

interface WelcomeSlidesProps {
  onComplete: () => void;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
  })
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

export default function WelcomeSlides({ onComplete }: WelcomeSlidesProps) {
  const [[page, direction], setPage] = useState([0, 0]);

  const paginate = (newDirection: number) => {
    if (page + newDirection >= 0 && page + newDirection < slides.length) {
      setPage([page + newDirection, newDirection]);
    }
  };

  const slides = [
    {
      id: 0,
      headline: "Instant Load Matching",
      description: "Connect with verified transport providers and available cargo within seconds. Smart matching reduces empty return trips and saves time.",
      features: ["Verified Transporters", "Faster Matching", "Better Earnings"],
      illustration: (
        <div className="relative w-full h-full bg-slate-50 overflow-hidden flex items-center justify-center rounded-b-[40px]">
          {/* Logistics warehouse background (subtle) */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{ 
              backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20800%20600%22%20width%3D%22100%25%22%20height%3D%22100%25%22%3E%0A%20%20%3Crect%20width%3D%22800%22%20height%3D%22600%22%20fill%3D%22%23E3F2FD%22/%3E%0A%20%20%3Crect%20x%3D%22100%22%20y%3D%22200%22%20width%3D%22600%22%20height%3D%22400%22%20fill%3D%22%2390CAF9%22/%3E%0A%20%20%3Crect%20x%3D%22200%22%20y%3D%22300%22%20width%3D%22100%22%20height%3D%22100%22%20fill%3D%22%2342A5F5%22/%3E%0A%20%20%3Crect%20x%3D%22320%22%20y%3D%22350%22%20width%3D%22100%22%20height%3D%2250%22%20fill%3D%22%231E88E5%22/%3E%0A%20%20%3Crect%20x%3D%22440%22%20y%3D%22250%22%20width%3D%22100%22%20height%3D%22150%22%20fill%3D%22%231565C0%22/%3E%0A%20%20%3Ccircle%20cx%3D%22200%22%20cy%3D%22100%22%20r%3D%2240%22%20fill%3D%22%23FFFFFF%22%20opacity%3D%220.8%22/%3E%0A%20%20%3Ccircle%20cx%3D%22250%22%20cy%3D%22100%22%20r%3D%2250%22%20fill%3D%22%23FFFFFF%22%20opacity%3D%220.8%22/%3E%0A%20%20%3Ccircle%20cx%3D%22300%22%20cy%3D%22100%22%20r%3D%2240%22%20fill%3D%22%23FFFFFF%22%20opacity%3D%220.8%22/%3E%0A%3C/svg%3E")',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-slate-50" />
          
          {/* Smartphone */}
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6, type: 'spring' }}
            className="absolute left-6 top-8 w-24 h-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border-4 border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden"
          >
            <div className="h-4 bg-brand-600 w-full" />
            <div className="flex-1 p-2 space-y-2">
              <div className="h-2 w-3/4 bg-slate-200 rounded" />
              <div className="h-10 w-full bg-slate-50 rounded-md border border-slate-100 dark:border-slate-800 flex items-center p-1">
                 <div className="w-6 h-6 bg-brand-100 rounded flex items-center justify-center">
                    <Truck size={12} className="text-brand-600" />
                 </div>
                 <div className="ml-1 space-y-1">
                    <div className="h-1 w-8 bg-slate-300 rounded" />
                    <div className="h-1 w-6 bg-slate-200 rounded" />
                 </div>
              </div>
              <div className="h-10 w-full bg-slate-50 rounded-md border border-slate-100 dark:border-slate-800" />
            </div>
          </motion.div>

          {/* Lightning bolt */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="absolute right-12 top-12 w-12 h-12 bg-yellow-400 rounded-full shadow-lg flex items-center justify-center text-white"
          >
            <Zap size={24} fill="white" />
          </motion.div>

          {/* Truck slides into screen */}
          <motion.div
            initial={{ x: 200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.7, type: 'spring', bounce: 0.2 }}
            className="absolute right-4 bottom-12 bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3"
          >
            <div className="w-12 h-12 bg-brand-600/10 rounded-xl flex items-center justify-center">
              <Truck size={24} className="text-brand-600" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Cargo Matched!</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-">2 mins ago</div>
            </div>
          </motion.div>
        </div>
      )
    },
    {
      id: 1,
      headline: "Secure Escrow Payments",
      description: "Communicate, negotiate, and pay with confidence using our secure escrow system. Funds are released only upon successful delivery.",
      features: ["Verified Companies", "Secure Messaging", "Trusted Marketplace"],
      illustration: (
        <div className="relative w-full h-full bg-slate-50 overflow-hidden flex items-center justify-center rounded-b-[40px]">
          {/* Industrial warehouse background (subtle) */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{ 
              backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20800%20600%22%20width%3D%22100%25%22%20height%3D%22100%25%22%3E%0A%20%20%3Crect%20width%3D%22800%22%20height%3D%22600%22%20fill%3D%22%23E8F5E9%22/%3E%0A%20%20%3Crect%20x%3D%22100%22%20y%3D%22300%22%20width%3D%22200%22%20height%3D%22150%22%20fill%3D%22%2381C784%22%20rx%3D%2210%22/%3E%0A%20%20%3Crect%20x%3D%22350%22%20y%3D%22250%22%20width%3D%22200%22%20height%3D%22200%22%20fill%3D%22%234CAF50%22%20rx%3D%2210%22/%3E%0A%20%20%3Crect%20x%3D%22600%22%20y%3D%22300%22%20width%3D%22150%22%20height%3D%22150%22%20fill%3D%22%23388E3C%22%20rx%3D%2210%22/%3E%0A%20%20%3Ccircle%20cx%3D%22150%22%20cy%3D%22450%22%20r%3D%2230%22%20fill%3D%22%232E7D32%22/%3E%0A%20%20%3Ccircle%20cx%3D%22250%22%20cy%3D%22450%22%20r%3D%2230%22%20fill%3D%22%232E7D32%22/%3E%0A%20%20%3Ccircle%20cx%3D%22400%22%20cy%3D%22450%22%20r%3D%2230%22%20fill%3D%22%232E7D32%22/%3E%0A%20%20%3Ccircle%20cx%3D%22500%22%20cy%3D%22450%22%20r%3D%2230%22%20fill%3D%22%232E7D32%22/%3E%0A%3C/svg%3E")',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-slate-50" />

          {/* Secure Document */}
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="absolute left-10 top-16 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800 rotate-[-10deg]"
          >
            <FileText size={32} className="text-slate-600 dark:text-slate-" />
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8 }}
              className="absolute -right-2 -bottom-2 bg-emerald-500 rounded-full p-1 border-2 border-white"
            >
              <Check size={12} className="text-white" />
            </motion.div>
          </motion.div>

          {/* Main Shield */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', bounce: 0.4 }}
            className="relative z-10 w-28 h-28 bg-white dark:bg-slate-900 rounded-3xl shadow-xl flex items-center justify-center border border-slate-100 dark:border-slate-800"
          >
            <ShieldCheck size={56} className="text-brand-600" />
          </motion.div>

          {/* Lock Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: 'spring' }}
            className="absolute right-12 bottom-16 bg-white dark:bg-slate-900 p-3 rounded-full shadow-lg"
          >
            <Lock size={20} className="text-white" />
          </motion.div>
        </div>
      )
    },
    {
      id: 2,
      headline: "Real-Time GPS Tracking",
      description: "Monitor shipment progress with live truck location, route updates and estimated arrival times.",
      features: ["Live Location", "ETA Updates", "Smart Alerts"],
      illustration: (
        <div className="relative w-full h-full bg-slate-50 overflow-hidden flex items-center justify-center rounded-b-[40px]">
          {/* Map background */}
          <div 
            className="absolute inset-0 opacity-30"
            style={{ 
              backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20800%20600%22%20width%3D%22100%25%22%20height%3D%22100%25%22%3E%0A%20%20%3Crect%20width%3D%22800%22%20height%3D%22600%22%20fill%3D%22%23E0F7FA%22/%3E%0A%20%20%3Cpath%20d%3D%22M%20100%20500%20Q%20300%20200%20500%20400%20T%20700%20100%22%20fill%3D%22none%22%20stroke%3D%22%2300BCD4%22%20stroke-width%3D%2220%22/%3E%0A%20%20%3Ccircle%20cx%3D%22700%22%20cy%3D%22100%22%20r%3D%2230%22%20fill%3D%22%230097A7%22/%3E%0A%20%20%3Cpolygon%20points%3D%22700%2C160%20680%2C100%20720%2C100%22%20fill%3D%22%230097A7%22/%3E%0A%3C/svg%3E")',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-slate-50" />

          {/* GPS Route / Map Pin */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="absolute top-1/4 left-1/2 -translate-x-1/2 z-20"
          >
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 bg-brand-400 rounded-full blur-md"
            />
            <MapPin size={48} className="text-brand-600 relative z-10" fill="white" />
          </motion.div>

          {/* Mobile phone showing tracking */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, type: 'spring' }}
            className="absolute bottom-8 right-8 bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 flex items-center gap-4 z-20"
          >
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <Navigation size={20} className="text-emerald-600" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">15 mins away</div>
              <div className="text-xs text-slate-500 dark:text-slate-">On route to Lagos</div>
            </div>
          </motion.div>
        </div>
      )
    }
  ];

  return (
    <div className="relative w-full h-[100dvh] md:h-[800px] md:max-h-[90vh] md:w-[400px] mx-auto bg-white dark:bg-slate-900 md:rounded-[40px] md:shadow-2xl overflow-hidden flex flex-col font-sans">
      
      {/* Illustration Area (Top 45%) */}
      <div className="relative h-[45%] w-full bg-slate-50 rounded-b-[40px]">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);
              if (swipe < -swipeConfidenceThreshold) {
                paginate(1);
              } else if (swipe > swipeConfidenceThreshold) {
                paginate(-1);
              }
            }}
            className="absolute inset-0"
          >
            {slides[page].illustration}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Content Area (Bottom 55%) */}
      <div className="flex-1 flex flex-col px-8 pt-8 pb-10 bg-white dark:bg-slate-900">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col"
          >
            <h1 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight leading-tight">
              {slides[page].headline}
            </h1>
            <p className="text-slate-500 dark:text-slate- text-[15px] leading-relaxed mb-8">
              {slides[page].description}
            </p>
            
            <div className="space-y-4 mb-auto">
              {slides[page].features.map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 + 0.2 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <Check size={14} className="text-emerald-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-900">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Footer Navigation */}
        <div className="mt-8 flex flex-col gap-6">
          {/* Progress Indicators */}
          <div className="flex justify-center gap-2">
            {slides.map((_, i) => (
              <div 
                key={i} 
                className={`h-2 rounded-full transition-all duration-75 ${
                  i === page ? 'w-8 bg-brand-600' : 'w-2 bg-slate-50 border border-slate-200 dark:border-slate-700'
                }`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            {page === 2 ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onComplete()}
                  className="w-full bg-brand-600 text-white rounded-full py-4 font-bold text-lg shadow-[0_8px_20px_rgba(21,101,192,0.3)] transition"
                >
                  Get Started
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onComplete()}
                  className="w-full bg-slate-50 text-slate-900 rounded-full py-4 font-bold text-lg transition"
                >
                  Sign In
                </motion.button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => paginate(1)}
                  className="w-full bg-brand-600 text-white rounded-full py-4 font-bold text-lg shadow-[0_8px_20px_rgba(37,99,235,0.2)] transition"
                >
                  Continue
                </motion.button>
                <Button
                  onClick={() => onComplete()}
                  className="w-full py-3 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-100 transition uppercase tracking-wider"
                >
                  Skip
                </Button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
