# Oasis-LangBoost

Oasis-LangBoost is a modern language-learning web app built with Next.js and React. It combines lessons, flashcards, quizzes, AI tutoring, and community features into one product focused on retention, consistency, and daily momentum.

## Overview

The project uses a polished dashboard-style learning experience where users can:
- follow structured lessons by language and level
- review with spaced-repetition flashcards
- generate adaptive vocabulary quizzes
- practice with an AI conversation tutor
- track streaks, XP, and progress analytics
- participate in a community forum

## Core Features

- AI Tutor
  - scenario-based conversation practice (travel, restaurant, interview, debate, and more)
  - level-aware responses with inline correction feedback
  - optional voice input and text-to-speech support

- Lessons
  - filter by level, language, and lesson type
  - lesson detail pages with pronunciation playback
  - XP rewards and progress indicators

- Flashcards
  - spaced-repetition scheduling (again/good/easy)
  - due-card queue and review status panels
  - pronunciation support for terms

- Quizzes
  - on-demand quiz generation by language and level
  - instant scoring and explanations
  - recent performance context for practice pacing

- Vocabulary
  - create and manage personal vocabulary entries
  - AI autofill for definition/translation/example data
  - one-click AI explanations and pronunciation playback

- Community and Leaderboard
  - forum threads with replies, categories, and language tags
  - leaderboard ranking by XP and streak visibility

- Settings and Theming
  - learner preferences (bio, native language, target languages, goals)
  - light/dark theme support

## Tech Stack

- Framework: Next.js (App Router)
- UI: React 18, Tailwind CSS, Radix UI, Lucide icons, Framer Motion
- State/Data: TanStack Query
- Validation/Forms: Zod, React Hook Form
- Charts and extras: Recharts, Sonner, canvas-confetti, and more

## Project Notes

This codebase is demo-friendly and runs without a separate backend service.

- Data layer: local browser storage seeded from mock data
- Auth: local demo auth flow
- AI integrations: routed through app client integration stubs for tutor/quiz/vocabulary behavior

This makes the project easy to run, test, and iterate during development.

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start development server

```bash
npm run dev
```

### 3. Open the app

Go to `http://localhost:3000`

## Demo Sign-In

Use the seeded demo account on the sign-in page:

- Email: `alex@languageboost.app`
- Password: `demo1234`

## Available Scripts

- `npm run dev` - start local development server
- `npm run build` - build for production
- `npm run start` - run production build
- `npm run lint` - run eslint checks
- `npm run lint:fix` - auto-fix lint issues

## Main App Sections

- `/` - landing page
- `/auth/signin` - authentication
- `/dashboard` - learning overview
- `/lessons` and `/lessons/[id]` - lesson library and detail
- `/flashcards` - spaced-repetition review
- `/quizzes` - adaptive quizzes
- `/vocabulary` - personal vocabulary manager
- `/ai-tutor` - interactive tutor
- `/community` and `/community/[id]` - forum and thread view
- `/leaderboard` - ranked users
- `/settings` - learner preferences

## Conclusion (50 words)

Oasis-LangBoost turns language study into a daily habit by combining guided lessons, spaced repetition, adaptive quizzes, and conversation practice in one smooth workflow. Its modular architecture and realistic demo data make it easy to extend, test, and ship quickly while still delivering an engaging learner experience for modern web platforms.
