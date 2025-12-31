# PathWise

**AI-powered personalized learning platform for employee skill development.**

PathWise is a modern web application built with Next.js 14, Tailwind CSS, and Supabase that provides personalized learning paths, video-based content, and adaptive assessments for employee training and development.

![PathWise](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-38bdf8) ![Supabase](https://img.shields.io/badge/Supabase-Auth-green)

## Features

- **Modern Homepage**: Beautiful landing page with hero section, about, benefits, and how-it-works sections
- **User Authentication**: Complete auth system with login and registration using Supabase
- **Protected Dashboard**: Authenticated dashboard with user statistics and learning progress
- **Responsive Design**: Fully responsive UI that works on all devices
- **Modern UI/UX**: Clean design with gradients, animations, and Lucide React icons
- **Type-Safe**: Built with TypeScript for better developer experience

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Icons**: Lucide React
- **Language**: TypeScript
- **Font**: Inter (Google Fonts)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- A **Supabase account** (free tier is sufficient)

## Getting Started

### 1. Clone or Navigate to the Project

If you haven't already, navigate to the project directory:

```bash
cd PathWise
```

### 2. Install Dependencies

Install all required packages:

```bash
npm install
```

Or if you use yarn:

```bash
yarn install
```

### 3. Set Up Supabase

#### Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in your project details:
   - **Name**: PathWise (or any name you prefer)
   - **Database Password**: Create a secure password
   - **Region**: Choose the closest region to you
4. Click "Create new project" and wait for setup to complete (1-2 minutes)

#### Get Your Supabase Credentials

1. Once your project is ready, go to **Settings** (gear icon) → **API**
2. Copy the following values:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys")

### 4. Configure Environment Variables

1. Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

2. Open `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace `your_supabase_project_url` and `your_supabase_anon_key` with the values you copied from Supabase.

### 5. Enable Email Authentication in Supabase

1. In your Supabase dashboard, go to **Authentication** → **Providers**
2. Make sure **Email** is enabled (it should be by default)
3. You can configure email templates under **Authentication** → **Email Templates** if you want to customize the verification emails

### 6. Run the Development Server

Start the development server:

```bash
npm run dev
```

Or with yarn:

```bash
yarn dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Project Structure

```
PathWise/
├── app/                      # Next.js App Router
│   ├── dashboard/           # Dashboard page (protected)
│   │   └── page.tsx
│   ├── login/               # Login page
│   │   └── page.tsx
│   ├── register/            # Registration page
│   │   └── page.tsx
│   ├── layout.tsx           # Root layout with Navbar & Footer
│   ├── page.tsx             # Homepage
│   └── globals.css          # Global styles & Tailwind imports
├── components/              # Reusable components
│   ├── Navbar.tsx          # Navigation bar
│   └── Footer.tsx          # Footer
├── lib/                     # Utility functions
│   └── supabase.ts         # Supabase client configuration
├── public/                  # Static assets
├── .env.local.example      # Example environment variables
├── .gitignore              # Git ignore file
├── next.config.js          # Next.js configuration
├── package.json            # Dependencies and scripts
├── postcss.config.js       # PostCSS configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── README.md               # This file
```

## Key Pages

### Homepage (`/`)
- Hero section with project branding
- About PathWise section
- Key benefits showcase
- How it works (3-step process)
- Call-to-action buttons

### Login (`/login`)
- Email and password authentication
- Error handling
- Redirect to dashboard on success
- Link to registration page

### Register (`/register`)
- Full name, email, and password fields
- Password confirmation
- Form validation
- User metadata storage
- Success message and auto-redirect

### Dashboard (`/dashboard`)
- Protected route (requires authentication)
- User welcome message
- Statistics cards (courses, achievements, time, progress)
- Learning path with course progress
- Recommended courses
- Weekly goals tracker

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Authentication Flow

1. **Registration**:
   - User fills out the registration form
   - Supabase creates the user account
   - User metadata (name) is stored
   - User is redirected to dashboard

2. **Login**:
   - User enters email and password
   - Supabase authenticates the user
   - Session is created
   - User is redirected to dashboard

3. **Protected Routes**:
   - Dashboard checks for active session
   - Redirects to login if not authenticated
   - Auth state is monitored for changes

4. **Logout**:
   - User clicks logout in Navbar
   - Supabase signs out the user
   - User is redirected to homepage

## Customization

### Changing Colors

Edit `tailwind.config.js` to customize the primary color palette:

```javascript
colors: {
  primary: {
    50: '#f0f9ff',
    // ... customize these values
    900: '#0c4a6e',
  },
}
```

### Adding More Pages

Create new pages in the `app` directory following Next.js App Router conventions:

```bash
app/
└── your-page/
    └── page.tsx
```

### Modifying Components

All reusable components are in the `components` directory. Edit them to customize the UI.

## Troubleshooting

### "Invalid API key" error
- Double-check your Supabase credentials in `.env.local`
- Make sure you copied the **anon/public** key, not the service role key
- Restart the development server after changing environment variables

### Authentication not working
- Verify email authentication is enabled in Supabase dashboard
- Check browser console for error messages
- Ensure `.env.local` file exists and has correct values

### Styling issues
- Clear your browser cache
- Restart the development server
- Check that Tailwind CSS is properly configured

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add environment variables in Vercel project settings
4. Deploy!

### Other Platforms

You can deploy to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- Render

Make sure to add your environment variables in the deployment platform settings.

## Next Steps

Now that you have PathWise running, consider:

1. **Customizing the content** to match your organization's needs
2. **Adding more features** like course management, video uploads, assessments
3. **Integrating with your existing systems** via APIs
4. **Setting up user roles** and permissions in Supabase
5. **Adding analytics** to track user engagement

## Support

For issues and questions:
- Check the [Next.js Documentation](https://nextjs.org/docs)
- Check the [Supabase Documentation](https://supabase.com/docs)
- Check the [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## License

This project is open source and available for educational and commercial use.

---

**Built with ❤️ using Next.js, Tailwind CSS, and Supabase**
