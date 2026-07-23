import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ArrowLeft, Sparkles, Clock, Check, Compass, Target } from 'lucide-react';
import { BrandWordmark } from './BrandWordmark';

interface AdmissionViewProps {
  userName?: string;
  onComplete: (pledgeTime: string) => void;
}

/**
 * Admission flow — shown once, before a creative starts the journey.
 * Step 1: the journey framing (stop competing → create a new market).
 * Step 2: the pledge — choose a daily time you commit to show up.
 */
export const AdmissionView: React.FC<AdmissionViewProps> = ({ userName, onComplete }) => {
  const [step, setStep] = useState(0);
  const [pledgeTime, setPledgeTime] = useState('08:00');
  const [agreed, setAgreed] = useState(false);
  const firstName = (userName || 'Creative').split(' ')[0];

  return (
    <div className="min-h-full flex-1 flex items-center justify-center px-4 sm:px-6 py-10">
      <div className="w-full max-w-2xl">
        <div className="flex justify-center mb-8">
          <BrandWordmark variant="light" logoClassName="h-9 w-9" className="text-lg" />
        </div>

        <div className="bg-white rounded-3xl border border-[#D6E4FA] shadow-xl shadow-[#2563EB]/5 p-7 sm:p-10 relative overflow-hidden">
          {/* progress dots */}
          <div className="flex justify-center gap-2 mb-8">
            {[0, 1].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  step === s ? 'w-8 bg-[#2563EB]' : 'w-1.5 bg-slate-200'
                }`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="framing"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.25 }}
                className="text-center"
              >
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#2563EB] uppercase tracking-[0.18em] bg-[#EFF5FE] border border-[#D6E4FA] px-3 py-1.5 rounded-full">
                  <Sparkles size={11} /> Admission
                </span>
                <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-[#0B1F3A] mt-5 leading-tight">
                  Welcome, {firstName}. This is a different kind of journey.
                </h1>

                <p className="text-slate-600 text-sm sm:text-base leading-relaxed mt-4 max-w-xl mx-auto">
                  This is a journey to help you go from{' '}
                  <span className="font-semibold text-[#0B1F3A]">competing for the same gigs and brand deals as every other creative</span>{' '}
                  — to <span className="font-semibold text-[#2563EB]">discovering a market need you are uniquely positioned to solve.</span>
                </p>

                <div className="grid sm:grid-cols-2 gap-3 mt-7 text-left">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-start gap-3">
                    <div className="bg-white p-2 rounded-xl text-slate-400 border border-slate-200 shrink-0">
                      <Compass size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#0B1F3A]">Stop competing</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">No more fighting for scraps in a saturated market.</p>
                    </div>
                  </div>
                  <div className="bg-[#EFF5FE] border border-[#D6E4FA] rounded-2xl p-4 flex items-start gap-3">
                    <div className="bg-white p-2 rounded-xl text-[#2563EB] border border-[#D6E4FA] shrink-0">
                      <Target size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#0B1F3A]">Create a new market</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">Solve a real need only you are positioned to serve.</p>
                    </div>
                  </div>
                </div>

                <p className="text-sm font-serif italic font-bold text-[#2563EB] mt-7">
                  "We don't compete — we create new markets."
                </p>

                <button
                  onClick={() => setStep(1)}
                  className="mt-8 w-full sm:w-auto bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm py-3.5 px-8 rounded-2xl transition-all shadow-lg shadow-[#2563EB]/25 active:scale-[0.98] inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Make my pledge</span>
                  <ArrowRight size={16} />
                </button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="pledge"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.25 }}
                className="text-center"
              >
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#EAB308] uppercase tracking-[0.18em] bg-[#FEF9C3] border border-[#FDE68A] px-3 py-1.5 rounded-full">
                  <Clock size={11} /> Your Commitment
                </span>
                <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-[#0B1F3A] mt-5 leading-tight">
                  Choose a time you pledge to the journey.
                </h1>
                <p className="text-slate-600 text-sm leading-relaxed mt-3 max-w-lg mx-auto">
                  Consistency is what turns creativity into a stable income. Pick the
                  time of day you commit to showing up for one lesson — and hold yourself to it.
                </p>

                <div className="mt-7 bg-gradient-to-br from-[#EFF5FE] to-[#DCE9FB] border border-[#D6E4FA] rounded-3xl p-6">
                  <label className="block text-[10px] font-mono font-bold text-[#2563EB] uppercase tracking-wider mb-2">
                    I pledge to show up daily at
                  </label>
                  <input
                    type="time"
                    value={pledgeTime}
                    onChange={(e) => setPledgeTime(e.target.value)}
                    className="text-3xl font-serif font-extrabold text-[#0B1F3A] bg-white border border-[#D6E4FA] rounded-2xl px-5 py-3 text-center focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 cursor-pointer"
                  />
                </div>

                <button
                  onClick={() => setAgreed((a) => !a)}
                  className={`mt-6 w-full flex items-start gap-3 text-left p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                    agreed ? 'bg-[#2563EB]/5 border-[#2563EB]' : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                    agreed ? 'bg-[#2563EB] border-[#2563EB] text-white' : 'border-slate-300 bg-slate-50'
                  }`}>
                    {agreed && <Check size={12} strokeWidth={3} />}
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-slate-700 leading-relaxed">
                    I pledge to commit to this journey — to stop competing, and to do the work of
                    discovering the market only I can create.
                  </span>
                </button>

                <div className="flex items-center gap-3 mt-7">
                  <button
                    onClick={() => setStep(0)}
                    className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold py-3 px-5 rounded-2xl text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <ArrowLeft size={13} /> Back
                  </button>
                  <button
                    onClick={() => onComplete(pledgeTime)}
                    disabled={!agreed}
                    className={`flex-1 font-bold py-3.5 px-6 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider ${
                      agreed
                        ? 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white cursor-pointer active:scale-[0.98]'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <span>Enter the Academy</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
