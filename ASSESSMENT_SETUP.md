# Pre & Post Assessment Setup Guide

This guide will help you set up the AI-powered assessment feature using Google Gemini API.

## 📋 Prerequisites

1. Google Cloud account with Gemini API access
2. Supabase project set up
3. Node.js and npm installed

## 🔑 Step 1: Get Your Gemini API Key

1. Go to [Google AI Studio](https://ai.google.dev/)
2. Sign in with your Google account
3. Click on "Get API Key"
4. Create a new API key or use an existing one
5. Copy the API key

## ⚙️ Step 2: Configure Environment Variables

1. Create a `.env.local` file in the root directory (if it doesn't exist)
2. Add the following:

```env
GOOGLE_API_KEY=your_gemini_api_key_here
```

Replace `your_gemini_api_key_here` with the API key you copied.

## 🗄️ Step 3: Set Up Database

Run the SQL migration to create the assessments table:

### Option A: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file: `supabase/migrations/create_assessments_table.sql`
4. Copy all the SQL code
5. Paste it into the SQL Editor
6. Click "Run" to execute

### Option B: Using Supabase CLI

```bash
supabase db push
```

## 🚀 Step 4: Restart Development Server

Stop and restart your development server to load the new environment variables:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## ✅ Step 5: Test the Feature

1. Log in to your PathWise account
2. Complete the "Upgrade Your Skills" form if you haven't already
3. Navigate to **Personal Dashboard**
4. Click on **"Pre-Post Assessment"** in the sidebar
5. Click **"Generate Pre-Assessment"**
6. Wait for the AI to generate 30 personalized questions
7. Answer the questions and submit

## 🧪 How It Works

### Question Generation
- The system fetches your skills and experience from the database
- Based on your experience level, it determines question difficulty:
  - **Beginner** (<1 year): Conceptual and basic questions
  - **Intermediate** (1-3 years): Scenario-based questions
  - **Advanced** (>3 years): Complex problem-solving questions
- Gemini AI generates 30 tailored questions
- Questions focus on:
  - 40% Weak skills (skills to improve)
  - 30% Current skills
  - 30% Target skill

### Scoring
- Each question is worth 1 mark (total: 30 marks)
- You can skip questions (skipped = 0 marks)
- Only answered questions count toward your score
- Results are saved to your profile

## 📊 Database Schema

The `assessments` table stores:
- `id`: Unique identifier
- `user_id`: User who took the assessment
- `assessment_type`: 'pre' or 'post'
- `questions`: JSON array of all questions
- `answers`: JSON object of user responses
- `score`: Total score (0-30)
- `created_at`: Timestamp

## 🔒 Security

- Row Level Security (RLS) is enabled
- Users can only access their own assessments
- API routes are protected with authentication
- Environment variables keep API keys secure

## 🐛 Troubleshooting

### "Failed to generate assessment"
- Check if your `GOOGLE_API_KEY` is correctly set in `.env.local`
- Verify your Gemini API key is active and has quota
- Check browser console and server logs for errors

### "Failed to store assessment"
- Ensure the database migration was run successfully
- Check Supabase connection settings
- Verify RLS policies are set up correctly

### Questions don't appear
- Clear browser cache
- Check network tab for API errors
- Ensure you have completed the skill upgrade form

## 💡 Tips

- The Gemini API has a free tier with generous limits
- Questions are generated fresh each time (not cached)
- You can take multiple assessments - the latest is saved
- Results can be used later for generating personalized roadmaps

## 📚 Resources

- [Google Gemini API Docs](https://ai.google.dev/docs)
- [LangChain Documentation](https://js.langchain.com/docs/)
- [Supabase Documentation](https://supabase.com/docs)

## 🆘 Need Help?

If you encounter issues:
1. Check the console for error messages
2. Verify all environment variables are set
3. Ensure database migrations ran successfully
4. Check that you're logged in and have completed the skill form
