import React from 'react';
import { BrandWordmark } from './BrandWordmark';
import { SmartImage } from './SmartImage';
import { motion } from 'motion/react';
import {
  ArrowRight, ChevronRight, Sparkles, Compass, Target, TrendingUp,
  Users, Lightbulb, Quote, Star,
} from 'lucide-react';

interface MarketingLandingProps {
  onGoogleLogin: () => void;
  onGuestLogin: () => void;
  onLogoClick?: () => void;
}

const MENTORS = [
  { name: 'Innovative Mentor', role: 'Creative → Market Builder', img: '/brand/mentor-1.jpg' },
  { name: 'Innovative Mentor', role: 'Product & Monetization', img: '/brand/mentor-2.jpg' },
  { name: 'Innovative Mentor', role: 'Brand & Community', img: '/brand/mentor-3.jpg' },
];

const PROJECTS = [
  {
    title: 'Student Project',
    desc: 'A creative who turned a saturated skill into a productized service with recurring revenue.',
    img: '/brand/student-project-1.jpg',
  },
  {
    title: 'Student Project',
    desc: 'Discovered an underserved niche and built an offer only they were positioned to deliver.',
    img: '/brand/student-project-2.jpg',
  },
  {
    title: 'Student Project',
    desc: 'Converted an audience into a stable income stream beyond social presence.',
    img: '/brand/student-project-3.jpg',
  },
  {
    title: 'Student Project',
    desc: 'Packaged their craft into a repeatable system that earns without trading every hour.',
    img: '/brand/student-project-4.jpg',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

export const MarketingLanding: React.FC<MarketingLandingProps> = ({
  onGoogleLogin,
  onGuestLogin,
  onLogoClick,
}) => {
  return (
    <div className="w-full">
      {/* Top bar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#DCE9FB]/80 border-b border-[#D6E4FA]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button onClick={onLogoClick} className="cursor-pointer select-none">
            <BrandWordmark variant="light" logoClassName="h-8 w-8" className="text-base" />
          </button>
          <button
            onClick={onGoogleLogin}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold px-4 py-2.5 rounded-full transition-all shadow-md shadow-[#2563EB]/20 cursor-pointer inline-flex items-center gap-1.5"
          >
            Sign in <ChevronRight size={14} />
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-16 text-center">
        <motion.div initial="hidden" animate="show" variants={fadeUp}>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#2563EB] uppercase tracking-[0.18em] bg-white/70 border border-[#D6E4FA] px-3.5 py-1.5 rounded-full">
            <Sparkles size={12} /> An academy for creatives who innovate
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-extrabold text-[#0B1F3A] tracking-tight leading-[1.05] mt-6 max-w-4xl mx-auto">
            Stop competing for the same gigs.<br className="hidden sm:block" />
            Start creating your <span className="text-[#2563EB]">own market.</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 mt-6 leading-relaxed max-w-2xl mx-auto">
            The Creative Academy trains creatives to stop fighting over saturated markets — and
            start problem-solving, discovering the market need they are uniquely positioned to solve.
          </p>

          {/* slogan */}
          <div className="mt-7 inline-flex items-center gap-2 bg-[#0B1F3A] text-white px-5 py-2.5 rounded-full">
            <Star size={14} className="fill-[#FACC15] text-[#FACC15]" />
            <span className="font-serif font-bold text-sm">We don't compete — we create new markets.</span>
          </div>

          <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button
              onClick={onGoogleLogin}
              className="w-full sm:w-auto bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold py-3.5 px-8 rounded-2xl transition-all shadow-lg shadow-[#2563EB]/25 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] text-sm"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.986 0-.743-.08-1.3-.176-1.856l-10.617-.353z" />
              </svg>
              Begin admission with Google
            </button>
            <button
              onClick={onGuestLogin}
              className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold py-3.5 px-6 rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-sm"
            >
              Explore as guest <ChevronRight size={15} />
            </button>
          </div>

          <div className="mt-8 flex flex-wrap gap-2 justify-center">
            {['Discover an unserved market', 'Productize your craft', 'Daily speaking drills', 'Stable income beyond social'].map((chip) => (
              <span key={chip} className="text-xs font-semibold text-[#0B1F3A] bg-white/70 border border-[#D6E4FA] px-3 py-1.5 rounded-full">
                {chip}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* The shift band */}
      <section className="bg-white border-y border-[#D6E4FA]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-[10px] font-mono font-bold text-[#2563EB] uppercase tracking-[0.18em]">The shift we teach</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-[#0B1F3A] mt-2">
              From competing to creating
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { icon: Compass, title: 'Stop competing', body: 'Saturated markets reward volume and price wars. We help you step out of the crowd.' },
              { icon: Lightbulb, title: 'Solve a real need', body: 'Find the specific problem your unique blend of skill and perspective is built to solve.' },
              { icon: TrendingUp, title: 'Create a new market', body: 'Turn that need into an offer — and a stable income that isn’t hostage to the algorithm.' },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="bg-[#EFF5FE] border border-[#D6E4FA] rounded-3xl p-6">
                <div className="bg-white p-3 rounded-2xl text-[#2563EB] border border-[#D6E4FA] inline-flex mb-4">
                  <Icon size={22} />
                </div>
                <h3 className="text-lg font-serif font-bold text-[#0B1F3A]">{title}</h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About the convener */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid lg:grid-cols-5 gap-8 items-center">
          <div className="lg:col-span-2">
            <SmartImage
              src="/brand/convener.jpg"
              alt="The Convener of The Creative Academy"
              placeholderLabel="Add convener.jpg"
              className="aspect-[4/5] rounded-3xl border border-[#D6E4FA] shadow-lg bg-[#EFF5FE]"
            />
          </div>
          <div className="lg:col-span-3">
            <span className="text-[10px] font-mono font-bold text-[#2563EB] uppercase tracking-[0.18em]">About the convener</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-[#0B1F3A] mt-2 leading-tight">
              An advocate for creatives in innovation.
            </h2>
            <div className="mt-4 space-y-3 text-sm sm:text-[15px] text-slate-600 leading-relaxed">
              <p>
                After co-founding <span className="font-semibold text-[#0B1F3A]">Aesyr Studios</span>, a creative
                marketing agency, and running a creative empowerment programme — our first major
                innovation that translated into <span className="font-semibold text-[#0B1F3A]">real revenue</span> not
                just for us, but for the students involved and the department. While most creative programmes
                were competitions or exhibitions, we innovated and <span className="font-semibold text-[#2563EB]">expanded the market.</span>
              </p>
              <p>
                At Aesyr we consistently found ourselves pushed into new markets — especially in
                converting creativity into revenue. I've packaged all of that into a series of lessons and
                challenges to help creatives do the same.
              </p>
              <p>
                So that a creative can create content or pursue their passion not out of the pressure to
                "make it," but with the ease and consistency of creators who have a stable source of income
                beyond their social presence. The moment your creativity becomes your <span className="italic">only</span> source
                of income, you can't treat it with that same consistency.
              </p>
            </div>
            <p className="mt-5 text-xs font-mono text-slate-400">
              — Founder &amp; Convener, The Creative Academy
            </p>
          </div>
        </div>
      </section>

      {/* Mentors */}
      <section className="bg-white border-y border-[#D6E4FA]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-[10px] font-mono font-bold text-[#2563EB] uppercase tracking-[0.18em] inline-flex items-center gap-1.5 justify-center">
              <Users size={12} /> Innovative mentors
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-[#0B1F3A] mt-2">
              Learn from creatives who built their own markets
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {MENTORS.map((m, i) => (
              <div key={i} className="bg-[#EFF5FE] border border-[#D6E4FA] rounded-3xl overflow-hidden">
                <SmartImage
                  src={m.img}
                  alt={`${m.name} — ${m.role}`}
                  placeholderLabel={`Add mentor-${i + 1}.jpg`}
                  className="aspect-square bg-[#DCE9FB]"
                />
                <div className="p-5">
                  <h3 className="text-base font-serif font-bold text-[#0B1F3A]">{m.name}</h3>
                  <p className="text-xs text-[#2563EB] font-mono font-bold uppercase tracking-wide mt-1">{m.role}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-[11px] font-mono text-slate-400 mt-6">
            Replace the names and photos in <code className="text-[#2563EB]">public/brand/</code>.
          </p>
        </div>
      </section>

      {/* Student projects */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-[10px] font-mono font-bold text-[#2563EB] uppercase tracking-[0.18em]">Student projects</span>
          <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-[#0B1F3A] mt-2">
            What our creatives have built
          </h2>
          <p className="text-sm text-slate-600 mt-3">
            Real projects from creatives who stopped competing and created something only they could.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PROJECTS.map((p, i) => (
            <div key={i} className="bg-white border border-[#D6E4FA] rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <SmartImage
                src={p.img}
                alt={p.title}
                placeholderLabel={`Add student-project-${i + 1}.jpg`}
                className="aspect-video bg-[#EFF5FE]"
              />
              <div className="p-5">
                <h3 className="text-sm font-serif font-bold text-[#0B1F3A]">{p.title}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <div className="bg-[#0B1F3A] rounded-3xl p-10 sm:p-14 text-center relative overflow-hidden">
          <div className="absolute -right-10 -top-10 opacity-10 text-[#FACC15]"><Quote size={160} /></div>
          <h2 className="text-2xl sm:text-4xl font-serif font-extrabold text-white leading-tight relative">
            Ready to create a market only you can serve?
          </h2>
          <p className="text-slate-300 mt-4 max-w-xl mx-auto text-sm sm:text-base relative">
            Make your pledge, choose your daily time, and start the journey.
          </p>
          <button
            onClick={onGoogleLogin}
            className="mt-8 bg-[#FACC15] hover:bg-[#EAB308] text-[#0B1F3A] font-bold py-3.5 px-9 rounded-2xl transition-all shadow-lg active:scale-[0.98] inline-flex items-center gap-2 cursor-pointer relative"
          >
            Begin admission <ArrowRight size={18} />
          </button>
        </div>
        <p className="text-center text-[11px] font-mono text-slate-400 mt-8">
          The Creative Academy • We don't compete — we create new markets
        </p>
      </section>
    </div>
  );
};
