# PathWise

**AI-powered personalized learning platform for employee skill development.**

PathWise is a modern web application built with Next.js 14, Tailwind CSS, and Supabase that provides personalized learning paths, AI-generated roadmaps, adaptive assessments, and module completion tracking for employee training and development.

![PathWise](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-38bdf8) ![Supabase](https://img.shields.io/badge/Supabase-Database-green)

## Features

- **AI-Powered Learning Roadmaps**: Generate personalized learning paths using OpenAI, Google Gemini, or Groq
- **User Authentication**: Complete auth system with login and registration using Supabase
- **Skill Assessment**: Pre and post-assessment system to evaluate user skills
- **Module Tracking**: Track completion of learning modules with progress persistence
- **Real-time Notifications**: Get notified when roadmaps are created, modules completed, or courses finished
- **User Profile Management**: View and manage user profiles with skills and experience
- **Responsive Design**: Fully responsive UI that works on all devices
- **Modern UI/UX**: Clean design with animations using Framer Motion and Lucide React icons
- **Type-Safe**: Built with TypeScript for better developer experience

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Database & Auth**: Supabase (PostgreSQL + Auth)
- **AI/LLM Integration**: OpenAI, Google Gemini, Groq
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Language**: TypeScript
- **Font**: Inter (Google Fonts)

## Prerequisites

Before you begin, ensure you have the following:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- A **Supabase account** (free tier is sufficient)
- At least ONE of the following AI API keys:
  - **OpenAI API key** (recommended)
  - **Google AI API key** (for Gemini)
  - **Groq API key**

---

## Required Dependencies

All dependencies will be automatically installed via `npm install`. Here's the complete list:

### Production Dependencies

```json
{
  "@huggingface/inference": "^4.13.4",
  "@langchain/core": "^1.0.5",
  "@langchain/google-genai": "^1.0.1",
  "@langchain/openai": "^1.1.1",
  "@supabase/auth-helpers-nextjs": "^0.10.0",
  "@supabase/ssr": "^0.7.0",
  "@supabase/supabase-js": "^2.39.3",
  "dotenv": "^17.2.3",
  "framer-motion": "^12.23.24",
  "groq-sdk": "^0.37.0",
  "langchain": "^1.0.4",
  "lucide-react": "^0.323.0",
  "next": "14.1.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0"
}
```

### Development Dependencies

```json
{
  "@types/node": "^20",
  "@types/react": "^18",
  "@types/react-dom": "^18",
  "autoprefixer": "^10.0.1",
  "eslint": "^8",
  "eslint-config-next": "14.1.0",
  "postcss": "^8",
  "tailwindcss": "^3.3.0",
  "typescript": "^5"
}
```

---

## Required API Keys and Environment Variables

### Environment Variables Overview

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI API Keys (At least ONE is REQUIRED)
OPENAI_API_KEY=your_openai_api_key
GOOGLE_API_KEY=your_google_ai_api_key
GROQ_API_KEY=your_groq_api_key
```

### How to Get Each API Key

#### 1. Supabase Keys (REQUIRED)

**NEXT_PUBLIC_SUPABASE_URL** and **NEXT_PUBLIC_SUPABASE_ANON_KEY**:
1. Go to [https://supabase.com](https://supabase.com) and sign up/login
2. Create a new project
3. Go to **Settings** → **API**
4. Copy the **Project URL** (this is your `NEXT_PUBLIC_SUPABASE_URL`)
5. Copy the **anon/public** key (this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

**SUPABASE_SERVICE_ROLE_KEY**:
1. In the same **Settings** → **API** page
2. Scroll down to **service_role** key
3. Copy the **service_role** key (this is your `SUPABASE_SERVICE_ROLE_KEY`)
4. ⚠️ **Warning**: Keep this key secret! Never expose it in client-side code.

#### 2. OpenAI API Key (RECOMMENDED)

1. Go to [https://platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Go to **API Keys** section
4. Click **Create new secret key**
5. Copy the key immediately (you won't be able to see it again)
6. Add credits to your account if needed (pay-as-you-go)

**Cost**: ~$0.002 per roadmap generation (very affordable)

#### 3. Google AI API Key (OPTIONAL - for Gemini)

1. Go to [https://ai.google.dev](https://ai.google.dev)
2. Click **Get API key in Google AI Studio**
3. Sign in with your Google account
4. Click **Create API Key**
5. Copy the generated key

**Cost**: Free tier available with generous limits

#### 4. Groq API Key (OPTIONAL - for faster inference)

1. Go to [https://console.groq.com](https://console.groq.com)
2. Sign up or log in
3. Go to **API Keys** section
4. Create a new API key
5. Copy the key

**Cost**: Free tier available with generous limits

---

## Installation & Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/sanghani-rohit/Pathwise.git
cd Pathwise
```

### Step 2: Install Dependencies

```bash
npm install
```

Or with yarn:

```bash
yarn install
```

This will install all packages listed in `package.json`.

### Step 3: Configure Environment Variables

1. Copy the example environment file:

```bash
cp .env.local.example .env.local
```

2. Open `.env.local` and add your credentials:

```env
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# AI API Keys (At least ONE is REQUIRED)
OPENAI_API_KEY=sk-...your_openai_key
GOOGLE_API_KEY=your_google_ai_key
GROQ_API_KEY=your_groq_key
```

Replace the placeholder values with your actual keys.

### Step 4: Set Up Supabase Database

#### Enable Email Authentication

1. In your Supabase dashboard, go to **Authentication** → **Providers**
2. Ensure **Email** is enabled

#### Run Database Migrations

You need to execute the SQL migration files in your Supabase database. Go to **SQL Editor** in your Supabase dashboard and run these files **in order**:

1. `supabase/migrations/create_assessments_table.sql`
2. `supabase/migrations/add_evaluation_fields.sql`
3. `supabase/migrations/create_roadmaps_table.sql`
4. `supabase/migrations/create_learning_path_steps_table.sql`
5. `supabase/migrations/add_assessment_columns.sql`
6. `supabase/migrations/complete_roadmap_schema.sql`
7. `supabase/migrations/create_roadmap_templates_clean.sql`
8. `supabase/migrations/fix_rls_policies.sql`
9. `supabase/migrations/add_data_analysis_template.sql`
10. `supabase/migrations/20250117000000_create_roadmaps_table.sql`
11. `supabase/migrations/20250117000001_create_roadmaps_table_v2.sql`
12. `supabase/migrations/create_module_completions.sql`
13. `supabase/migrations/20250120_roadmaps_simple.sql`
14. `supabase/migrations/create_notifications.sql`
15. `supabase/migrations/create_user_profile_and_skills.sql`

**How to run migrations:**
1. Open Supabase Dashboard → **SQL Editor**
2. Click **New query**
3. Copy the contents of each migration file
4. Paste and click **Run**
5. Repeat for all migration files in the order listed above

### Step 5: Run the Development Server

```bash
npm run dev
```

Or with yarn:

```bash
yarn dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
PathWise/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── roadmap/generate/     # Roadmap generation endpoint
│   │   ├── submit-assessment/    # Assessment submission
│   │   ├── evaluate-assessment/  # Assessment evaluation
│   │   └── ...
│   ├── dashboard/               # Dashboard page (protected)
│   ├── login/                   # Login page
│   ├── register/                # Registration page
│   ├── personal-dashboard/      # Personal dashboard
│   ├── roadmap/                 # Roadmap display page
│   ├── upgrade-skill/           # Skill form page
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Homepage
│   └── globals.css              # Global styles
├── components/                  # Reusable components
│   ├── pages/                   # Page components
│   │   ├── HomePage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── CoursesPage.tsx
│   │   ├── AssessmentPage.tsx
│   │   ├── ProfilePage.tsx
│   │   └── NotificationsPage.tsx
│   ├── Navbar.tsx              # Navigation bar
│   ├── Sidebar.tsx             # Sidebar navigation
│   ├── Footer.tsx              # Footer
│   ├── DashboardLayout.tsx     # Dashboard layout wrapper
│   └── RoadmapDisplay.tsx      # Roadmap module display
├── lib/                         # Utility functions
│   ├── supabase.ts             # Supabase client
│   ├── supabase-server.ts      # Server-side Supabase client
│   └── utils/                  # Helper utilities
├── contexts/                    # React contexts
│   └── AppContext.tsx          # Application state context
├── supabase/                    # Supabase configuration
│   └── migrations/             # Database migration files
├── public/                      # Static assets
├── .env.local.example          # Example environment variables
├── .gitignore                  # Git ignore file
├── next.config.js              # Next.js configuration
├── package.json                # Dependencies and scripts
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── README.md                   # This file
```

---

## Key Features Explained

### 1. AI-Powered Roadmap Generation

Users can fill out a skill form, and the system generates a personalized learning roadmap using AI (OpenAI, Gemini, or Groq). The roadmap includes:
- Module breakdown with duration
- Skills covered in each module
- YouTube video recommendations
- Reading materials
- Practice exercises
- Success metrics

### 2. Module Completion Tracking

Users can mark modules as complete. Progress is:
- Saved to Supabase database
- Displayed on personal dashboard
- Triggers notifications
- Persists across sessions

### 3. Real-time Notifications

The system automatically creates notifications when:
- A new roadmap is generated
- A module is completed
- An entire course is finished

### 4. User Profile System

Displays real user data including:
- Name, email, phone, company
- Current job role
- Skills (current and strong skills)
- Years of experience

---

## Available Scripts

- `npm run dev` - Start development server (localhost:3000)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint for code quality

---

## API Endpoints

### Public Endpoints
- `POST /api/roadmap/generate` - Generate AI learning roadmap
- `POST /api/submit-assessment` - Submit user assessment
- `POST /api/evaluate-assessment-optimized` - Evaluate assessment with AI
- `POST /api/generate-pre-assessment` - Generate pre-assessment questions

### Protected Endpoints
- `POST /api/complete-topic` - Mark topic/module as complete
- `POST /api/save-onboarding` - Save user onboarding data

---

## Troubleshooting

### "Invalid API key" error

**Supabase:**
- Double-check your Supabase credentials in `.env.local`
- Ensure you copied the **anon/public** key, not the service role key for client-side
- Restart the development server after changing environment variables

**AI APIs:**
- Verify your API key is active and has credits/quota
- Check for typos in the `.env.local` file
- Ensure no extra spaces or quotes around the key

### Database/Migration Errors

- Ensure all migration files were run in the correct order
- Check Supabase SQL Editor for error messages
- Verify Row Level Security (RLS) policies are enabled

### Module completion not saving

- Check browser console for errors
- Verify `module_completions` table exists in Supabase
- Check RLS policies allow INSERT for authenticated users
- Ensure user is logged in with valid session

### Roadmap generation fails

- Verify at least one AI API key is configured
- Check API key has sufficient credits/quota
- Check browser console and server logs for errors
- Ensure Supabase service role key is set (for server-side operations)

---

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add all environment variables from `.env.local` in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY` (or other AI keys)
4. Deploy!

### Other Platforms

PathWise can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- Render
- Cloudflare Pages

**Important**: Always add your environment variables in the deployment platform's settings.

---

## Security Notes

⚠️ **NEVER commit the following to Git:**
- `.env` or `.env.local` files
- Any file containing API keys
- `SUPABASE_SERVICE_ROLE_KEY` (server-side only)

These are already excluded via `.gitignore`.

✅ **Safe to commit:**
- `.env.local.example` (template with placeholder values)
- All source code
- Configuration files

---

## Contributing

If you'd like to contribute to PathWise:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## Support

For issues and questions:
- Check the [Next.js Documentation](https://nextjs.org/docs)
- Check the [Supabase Documentation](https://supabase.com/docs)
- Check the [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- Check the [OpenAI API Documentation](https://platform.openai.com/docs)

---

## License

This project is open source and available for educational and commercial use.

---

## Acknowledgments

Built with:
- [Next.js](https://nextjs.org) - React framework
- [Supabase](https://supabase.com) - Backend and authentication
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [OpenAI](https://openai.com) - AI-powered roadmap generation
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [Lucide Icons](https://lucide.dev) - Beautiful icons

---

**Built with ❤️ by the PathWise Team**
