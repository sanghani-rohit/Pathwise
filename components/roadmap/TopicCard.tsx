import { Topic } from '@/lib/types/roadmap'
import VideoRecommendations from './VideoRecommendations'

interface TopicCardProps {
  topic: Topic
}

export default function TopicCard({ topic }: TopicCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {/* Topic Header */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
            {topic.topic_number}
          </span>
          <h3 className="text-xl font-bold text-gray-900">{topic.topic_name}</h3>
          <span className="text-sm text-gray-500 ml-auto">
            {topic.estimated_hours}h
          </span>
        </div>
        <p className="text-gray-600 ml-11">{topic.topic_objective}</p>
      </div>

      {/* Subtopics */}
      {topic.subtopics.length > 0 && (
        <div className="mb-4 ml-11">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Subtopics</h4>
          <ul className="space-y-1">
            {topic.subtopics.map((subtopic, idx) => (
              <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-gray-400 mt-1">•</span>
                <span>{subtopic}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Learning Outcomes */}
      {topic.learning_outcomes.length > 0 && (
        <div className="mb-4 ml-11">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">
            Learning Outcomes
          </h4>
          <ul className="space-y-1">
            {topic.learning_outcomes.map((outcome, idx) => (
              <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                <svg
                  className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{outcome}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Practice Exercises */}
      {topic.practice_exercises.length > 0 && (
        <div className="mb-4 ml-11">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">
            Practice Exercises
          </h4>
          <ul className="space-y-1">
            {topic.practice_exercises.map((exercise, idx) => (
              <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                <svg
                  className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{exercise}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Video Recommendations */}
      {topic.recommended_videos.length > 0 && (
        <VideoRecommendations videos={topic.recommended_videos} />
      )}
    </div>
  )
}
