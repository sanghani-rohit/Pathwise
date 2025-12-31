import Link from 'next/link'
import { ArrowRight, Target, Video, Brain, Sparkles, TrendingUp, Users } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-primary-50 py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles size={16} />
              AI-Powered Learning Platform
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                PathWise
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              AI-powered personalized learning platform for employee skill development.
            </p>
            <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto">
              Transform your workforce with intelligent learning paths, video-based content,
              and adaptive assessments tailored to each employee's unique journey.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 text-white text-lg font-semibold rounded-lg hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Get Started
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-primary-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              About PathWise
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary-600 to-primary-400 mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              PathWise revolutionizes employee training and development by leveraging artificial intelligence
              to create personalized learning experiences. Our platform adapts to each individual's skill level,
              learning pace, and career goals.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="text-primary-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI-Driven Insights</h3>
              <p className="text-gray-600">
                Our AI analyzes employee performance and suggests optimal learning paths to bridge skill gaps effectively.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-primary-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Scalable Solution</h3>
              <p className="text-gray-600">
                Built for teams of all sizes, from startups to enterprises, with seamless integration and management.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="text-primary-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Measurable Results</h3>
              <p className="text-gray-600">
                Track progress with detailed analytics and see real improvement in employee skills and productivity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Key Benefits
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary-600 to-primary-400 mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Discover how PathWise transforms the way your organization approaches employee development
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Benefit 1 */}
            <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center mb-4">
                <Target className="text-white" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Personalized Roadmap
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Each employee receives a custom learning path designed by AI, based on their current skills,
                job role, and career aspirations. No more one-size-fits-all training programs.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center mb-4">
                <Video className="text-white" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Video-Based Learning
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Engage employees with high-quality video content from industry experts.
                Learn at their own pace with interactive lessons and hands-on demonstrations.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center mb-4">
                <Brain className="text-white" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Adaptive Assessments
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Smart assessments that adjust difficulty based on performance.
                Get real-time feedback and identify knowledge gaps for continuous improvement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary-600 to-primary-400 mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Getting started with PathWise is simple. Follow these three easy steps to begin your learning journey.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Step 1 */}
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mb-6 relative z-10">
                  <span className="text-white text-2xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Create Your Account
                </h3>
                <p className="text-gray-600">
                  Sign up in seconds with just your email. Set up your profile and tell us about your learning goals.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mb-6 relative z-10">
                  <span className="text-white text-2xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Get Your Personalized Path
                </h3>
                <p className="text-gray-600">
                  Our AI analyzes your skills and creates a custom learning roadmap tailored to your needs and objectives.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mb-6 relative z-10">
                  <span className="text-white text-2xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Start Learning & Growing
                </h3>
                <p className="text-gray-600">
                  Access video lessons, complete assessments, and watch your skills grow with continuous feedback and support.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 text-white text-lg font-semibold rounded-lg hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl"
            >
              Start Your Journey Today
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
