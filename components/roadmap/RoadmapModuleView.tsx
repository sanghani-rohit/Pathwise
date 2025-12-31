import { Module } from '@/lib/types/roadmap'
import TopicCard from './TopicCard'

interface RoadmapModuleViewProps {
  module: Module
}

const categoryColors = {
  BUILD: 'bg-red-50 text-red-700 border-red-200',
  IMPROVE: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  REINFORCE: 'bg-green-50 text-green-700 border-green-200',
}

export default function RoadmapModuleView({ module }: RoadmapModuleViewProps) {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Module Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
              categoryColors[module.skill_category]
            }`}
          >
            {module.skill_category}
          </span>
          <span className="text-sm text-gray-500">
            Module {module.module_number}
          </span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          {module.module_name}
        </h1>

        <p className="text-lg text-gray-600 mb-4">{module.module_objective}</p>

        <div className="flex items-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{module.estimated_hours} hours</span>
          </div>

          {module.prerequisite_modules.length > 0 && (
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <span>
                Prerequisites: Module{module.prerequisite_modules.length > 1 ? 's' : ''}{' '}
                {module.prerequisite_modules.join(', ')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Completion Criteria */}
      <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">
          Completion Criteria
        </h3>
        <p className="text-sm text-blue-800">{module.completion_criteria}</p>
      </div>

      {/* Topics */}
      <div className="space-y-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Topics</h2>
        {module.topics.map((topic) => (
          <TopicCard key={topic.topic_number} topic={topic} />
        ))}
      </div>

      {/* Milestone Project */}
      <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <svg
            className="w-6 h-6 text-purple-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
            />
          </svg>
          <h3 className="text-xl font-bold text-purple-900">
            Milestone Project
          </h3>
          <span className="text-sm text-purple-600 font-medium">
            {module.milestone_project.estimated_hours}h
          </span>
        </div>

        <h4 className="text-lg font-semibold text-purple-900 mb-2">
          {module.milestone_project.project_name}
        </h4>

        <p className="text-purple-800 mb-4">
          {module.milestone_project.description}
        </p>

        <div className="mb-4">
          <h5 className="text-sm font-semibold text-purple-900 mb-2">
            Deliverables
          </h5>
          <ul className="space-y-1">
            {module.milestone_project.deliverables.map((deliverable, idx) => (
              <li key={idx} className="text-sm text-purple-800 flex items-start gap-2">
                <svg
                  className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                {deliverable}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h5 className="text-sm font-semibold text-purple-900 mb-2">
            Success Criteria
          </h5>
          <p className="text-sm text-purple-800">
            {module.milestone_project.success_criteria}
          </p>
        </div>
      </div>
    </div>
  )
}
