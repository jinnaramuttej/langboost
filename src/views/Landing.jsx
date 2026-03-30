import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpen, Brain, Check, Flame, Layers, Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { useTheme } from '@/lib/ThemeContext';

const stats = [
  { label: '50,000+ learners' },
  { label: '40+ languages' },
  { label: '4.9 avg rating' },
];

const features = [
  {
    title: 'AI Conversation Tutor',
    desc: 'Practice real conversations with AI that corrects your grammar in real time. Choose from dozens of scenarios.',
    icon: Brain,
    large: true,
  },
  {
    title: 'Spaced Repetition',
    desc: 'SM-2 scheduling helps you review at the right moment for long-term retention.',
    icon: Layers,
  },
  {
    title: 'Lesson Library',
    desc: 'CEFR A1-C2 lesson paths across 40+ languages with interactive drills.',
    icon: BookOpen,
  },
  {
    title: 'Streak and XP System',
    desc: 'Daily goals, streak tracking, and XP rewards keep the habit alive.',
    icon: Flame,
  },
  {
    title: 'Adaptive Quizzes',
    desc: 'Five quiz types with instant feedback, timed modes, and detailed score breakdowns.',
    icon: Brain,
  },
];

const steps = [
  { num: '01', title: 'Choose your language and level', desc: 'Pick from 40+ languages and set the level that matches your current ability.' },
  { num: '02', title: 'Study with AI-guided lessons', desc: 'Move through sessions that combine listening, speaking, and spaced review.' },
  { num: '03', title: 'Track progress and earn XP', desc: 'Build streaks, unlock milestones, and see your progress compound over time.' },
];

const pricing = [
  {
    name: 'Free',
    price: '$0',
    period: '/mo',
    features: ['1 language', '20 lessons', 'Basic flashcards', 'Community access'],
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$9',
    period: '/mo',
    features: ['Unlimited languages', 'AI tutor access', 'All lessons and quizzes', 'Spaced repetition', 'Priority support'],
    highlight: true,
  },
  {
    name: 'Teams',
    price: '$6',
    period: '/user',
    features: ['Everything in Pro', 'Shared vocabulary', 'Admin dashboard', 'Progress reports', 'Team analytics'],
    highlight: false,
  },
];

const testimonials = [
  {
    quote: "I've tried every language app out there. LanguageBoost is the only one where I actually feel like I'm making progress.",
    name: 'Maria S.',
    detail: 'Spanish to English',
  },
  {
    quote: 'The AI tutor feels like having a real conversation partner. My confidence in speaking French has skyrocketed.',
    name: 'James L.',
    detail: 'English to French',
  },
  {
    quote: 'The spaced repetition system is incredible. I retain vocabulary so much better than with traditional flashcard apps.',
    name: 'Yuki T.',
    detail: 'Japanese to English',
  },
];

const activeLanguages = [
  { name: 'Spanish B1', progress: 54 },
  { name: 'French A2', progress: 63 },
  { name: 'Japanese A1', progress: 42 },
];

const heroSignals = [
  'Voice-first drills',
  'Adaptive review plans',
  'Listening that sticks',
];

const activityBars = [40, 60, 25, 80, 55, 70, 45];

const heroTerms = ['Hola', 'Bonjour', 'Konnichiwa', 'Guten Tag'];

const shellClassName = 'mx-auto w-full max-w-[1580px] px-5 sm:px-6 lg:px-10 xl:px-12';

export default function Landing() {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [annual, setAnnual] = useState(true);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[920px] bg-[radial-gradient(circle_at_18%_12%,rgba(216,241,159,0.16),transparent_32%),radial-gradient(circle_at_84%_16%,rgba(127,198,255,0.14),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_40%)]" />
        <div className="absolute -left-40 top-28 h-[28rem] w-[28rem] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-28 top-36 h-[24rem] w-[24rem] rounded-full bg-sky-400/10 blur-3xl" />
      </div>

      <nav className={`fixed left-0 right-0 top-0 z-50 h-16 transition-all duration-250 ${scrolled ? 'border-b border-border bg-card/85 backdrop-blur-sm' : ''}`}>
        <div className={`${shellClassName} flex h-full items-center justify-between`}>
          <span className="font-syne text-lg font-bold tracking-display text-foreground">LanguageBoost</span>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Features</a>
            <a href="#pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Pricing</a>
            <a href="#testimonials" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Reviews</a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 text-muted-foreground hover:text-foreground">
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Button asChild variant="ghost" size="sm" className="text-sm">
              <Link href="/auth/signin">Sign in</Link>
            </Button>
            <Button asChild size="sm" className="text-sm">
              <Link href="/dashboard">Start free <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
            </Button>
          </div>
        </div>
      </nav>

      <section className="relative min-h-screen pt-24 pb-16 sm:pb-20">
        <div className={shellClassName}>
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.98fr)_minmax(460px,0.92fr)] xl:grid-cols-[minmax(0,1fr)_minmax(620px,0.96fr)] xl:gap-16 2xl:gap-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="relative z-10 max-w-[720px] py-4 md:py-10"
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-card/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                AI-powered language learning
              </div>
              <h1 className="font-syne text-4xl font-bold leading-display tracking-display text-foreground sm:text-5xl lg:text-6xl xl:text-7xl">
                Learn any language.
                <br />
                <span className="text-primary">Actually remember it.</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-body text-muted-foreground">
                AI-powered lessons, spaced repetition flashcards, and real conversation practice designed for retention, not just recognition.
              </p>
              <div className="mt-8 flex flex-col items-start gap-2">
                <Button asChild size="lg" className="h-12 px-6 text-base">
                  <Link href="/dashboard">
                    Start for free <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <p className="text-[12px] text-[#7d837f]">No credit card required. Cancel anytime.</p>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-y-3">
                {stats.map((item, index) => (
                  <React.Fragment key={item.label}>
                    {index > 0 && <div className="mx-4 hidden h-5 w-px bg-border sm:block" />}
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                  </React.Fragment>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-2.5">
                {heroSignals.map(signal => (
                  <span
                    key={signal}
                    className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground backdrop-blur-sm"
                  >
                    {signal}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="relative lg:pl-2 xl:pl-6 2xl:pl-10"
            >
              <div className="relative ml-auto w-full max-w-[760px] overflow-hidden rounded-[30px] border border-white/10 bg-[#090c0a] shadow-[0_30px_120px_rgba(0,0,0,0.45)]">
                <Image
                  src="/images/landing/hero-scene.svg"
                  alt="Immersive language learning scene"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 48vw"
                  className="absolute inset-0 h-full w-full object-cover object-center opacity-90"
                />
                <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(4,5,5,0.92)_8%,rgba(4,5,5,0.68)_48%,rgba(4,5,5,0.82)_100%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(216,241,159,0.18),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(127,198,255,0.14),transparent_28%)]" />

                <div className="relative flex min-h-[380px] flex-col justify-between p-5 sm:min-h-[460px] sm:p-6 xl:min-h-[560px] xl:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div className="max-w-[17rem] rounded-2xl border border-white/10 bg-black/35 px-4 py-3 backdrop-blur-sm">
                      <p className="text-[10px] uppercase tracking-[0.28em] text-[#96a19a]">Live practice room</p>
                      <p className="mt-2 font-syne text-2xl text-white">Speak. Get corrected. Keep momentum.</p>
                    </div>
                    <div className="rounded-full border border-primary/25 bg-primary/15 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-primary">
                      Immersive mode
                    </div>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
                    <div className="rounded-[28px] border border-white/10 bg-black/45 p-4 backdrop-blur-sm sm:p-5">
                      <p className="text-[11px] uppercase tracking-[0.26em] text-[#8f9993]">Your dashboard</p>
                      <div className="mb-4 mt-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                          <Flame className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">7-day streak</p>
                          <p className="text-xs text-[#b0b7b3]">Keep it going tonight.</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        {activeLanguages.map(lang => (
                          <div key={lang.name} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                            <p className="text-xs text-[#9ea6a2]">Active</p>
                            <p className="mt-1 text-sm font-medium text-white">{lang.name}</p>
                            <div className="mt-2 h-1 rounded-full bg-white/10">
                              <div className="h-full rounded-full bg-primary" style={{ width: `${lang.progress}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3">
                        <p className="mb-2 text-xs text-[#9ea6a2]">Today's progress</p>
                        <div className="flex h-16 items-end gap-1">
                          {activityBars.map((height, index) => (
                            <div
                              key={height}
                              className={`flex-1 rounded-sm ${index === activityBars.length - 1 ? 'bg-primary' : 'bg-white/10'}`}
                              style={{ height: `${height}%` }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-[24px] border border-white/10 bg-black/45 p-4 backdrop-blur-sm sm:p-5">
                        <p className="text-[11px] uppercase tracking-[0.24em] text-[#8f9993]">Conversation prompt</p>
                        <p className="mt-3 font-syne text-xl text-white">Order a coffee, ask for a window seat, and keep the chat going for 2 minutes.</p>
                        <p className="mt-3 text-sm leading-body text-[#b2bab5]">Lessons, listening, and review stay connected instead of living in separate tools.</p>
                      </div>

                      <div className="rounded-[24px] border border-white/10 bg-black/45 p-4 backdrop-blur-sm sm:p-5">
                        <p className="text-[11px] uppercase tracking-[0.24em] text-[#8f9993]">In rotation</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {heroTerms.map(term => (
                            <span key={term} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white">
                              {term}
                            </span>
                          ))}
                        </div>
                        <p className="mt-4 text-sm text-[#b2bab5]">Visual context, voice practice, and spaced repetition all in one focused session.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 md:py-32">
        <div className={shellClassName}>
          <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">What you get</p>
          <h2 className="font-syne text-3xl font-bold tracking-display text-foreground md:text-4xl">
            Everything built for retention
          </h2>

          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {features.map(feature => (
              <div
                key={feature.title}
                className={`rounded-lg border border-border bg-card p-6 transition-colors duration-150 hover:border-foreground/20 ${feature.large ? 'md:col-span-2' : ''}`}
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-syne text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm leading-body text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border py-20 md:py-32">
        <div className={shellClassName}>
          <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">How it works</p>
          <h2 className="font-syne text-3xl font-bold tracking-display text-foreground md:text-4xl">
            Three steps to fluency
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map(step => (
              <div key={step.num} className="space-y-3">
                <span className="font-syne text-3xl font-bold text-primary/40">{step.num}</span>
                <h3 className="font-syne text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="text-sm leading-body text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="border-t border-border py-20 md:py-32">
        <div className={shellClassName}>
          <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Pricing</p>
          <h2 className="font-syne text-3xl font-bold tracking-display text-foreground md:text-4xl">
            Simple, transparent pricing
          </h2>

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={() => setAnnual(false)}
              className={`rounded-md px-3 py-1 text-sm transition-colors ${!annual ? 'bg-secondary text-foreground' : 'text-muted-foreground'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`rounded-md px-3 py-1 text-sm transition-colors ${annual ? 'bg-secondary text-foreground' : 'text-muted-foreground'}`}
            >
              Annual <span className="ml-1 text-xs text-primary">save 30%</span>
            </button>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {pricing.map(plan => (
              <div
                key={plan.name}
                className={`rounded-lg p-6 ${plan.highlight ? 'border-2 border-primary bg-card' : 'border border-border bg-card'}`}
              >
                <h3 className="font-syne text-lg font-semibold">{plan.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-syne text-3xl font-bold text-foreground">
                    {plan.price === '$0' ? '$0' : annual ? `$${Math.round(parseInt(plan.price.replace('$', ''), 10) * 0.7)}` : plan.price}
                  </span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
                <ul className="mt-6 space-y-2.5">
                  {plan.features.map(feature => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className={`mt-6 w-full ${plan.highlight ? '' : 'bg-secondary text-foreground hover:bg-secondary/80'}`}
                  variant={plan.highlight ? 'default' : 'secondary'}
                >
                  <Link href="/dashboard">
                    {plan.price === '$0' ? 'Get started' : 'Start free trial'}
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="border-t border-border py-20 md:py-32">
        <div className={shellClassName}>
          <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Reviews</p>
          <h2 className="font-syne text-3xl font-bold tracking-display text-foreground md:text-4xl">
            Loved by learners
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map(testimonial => (
              <div key={testimonial.name} className="rounded-lg border border-border p-6">
                <span className="font-syne text-4xl text-primary/30">&quot;</span>
                <p className="mt-2 text-sm leading-body text-muted-foreground">{testimonial.quote}</p>
                <div className="mt-4 border-t border-border pt-4">
                  <p className="text-sm font-medium text-foreground">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-12">
        <div className={shellClassName}>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <p className="mb-4 text-xs uppercase tracking-widest text-muted-foreground">Product</p>
              <div className="space-y-2">
                {['Features', 'Pricing', 'Changelog', 'API'].map(link => (
                  <p key={link} className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground">{link}</p>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-4 text-xs uppercase tracking-widest text-muted-foreground">Learn</p>
              <div className="space-y-2">
                {['Spanish', 'French', 'German', 'Japanese'].map(link => (
                  <p key={link} className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground">{link}</p>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-4 text-xs uppercase tracking-widest text-muted-foreground">Company</p>
              <div className="space-y-2">
                {['About', 'Blog', 'Careers', 'Contact'].map(link => (
                  <p key={link} className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground">{link}</p>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-4 text-xs uppercase tracking-widest text-muted-foreground">Legal</p>
              <div className="space-y-2">
                {['Privacy', 'Terms', 'Cookies', 'GDPR'].map(link => (
                  <p key={link} className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground">{link}</p>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-12 flex items-center justify-between border-t border-border pt-6">
            <p className="text-xs text-muted-foreground">Copyright 2025 LanguageBoost. All rights reserved.</p>
            <button onClick={toggleTheme} className="text-muted-foreground hover:text-foreground">
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
