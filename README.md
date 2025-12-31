# PathWise

AI-powered personalized learning platform for employee skill development.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Database & Auth)
- OpenAI / Google Gemini / Groq (AI)
- Framer Motion

## Installation

```bash
git clone https://github.com/sanghani-rohit/Pathwise.git
cd Pathwise
npm install
```

## Required Packages

All dependencies are listed in `package.json` and installed automatically with `npm install`:

**Main Dependencies:**
- `next` - Next.js framework
- `react`, `react-dom` - React
- `@supabase/supabase-js` - Supabase client
- `@langchain/openai` - OpenAI integration
- `@langchain/google-genai` - Google Gemini integration
- `groq-sdk` - Groq AI integration
- `framer-motion` - Animations
- `lucide-react` - Icons
- `tailwindcss` - Styling

## Environment Variables

Create `.env.local` in the root directory:

```env
# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI API Keys (at least ONE required)
OPENAI_API_KEY=your_openai_key
GOOGLE_API_KEY=your_google_ai_key
GROQ_API_KEY=your_groq_key
```

**Where to get API keys:**
- Supabase: https://supabase.com → Project Settings → API
- OpenAI: https://platform.openai.com/api-keys
- Google AI: https://ai.google.dev
- Groq: https://console.groq.com/keys

## Database Setup

Run all SQL migration files from `supabase/migrations/` in your Supabase SQL Editor in order.

## Run the Project

```bash
npm run dev
```

Open http://localhost:3000

## Scripts

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm start` - Production server
- `npm run lint` - Lint code

## Features

- AI-generated learning roadmaps
- User authentication
- Skill assessments
- Module completion tracking
- Real-time notifications
- User profile management

## License

Open source - available for educational and commercial use.
