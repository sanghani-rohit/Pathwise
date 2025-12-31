import { Video } from '@/lib/types/roadmap'

interface VideoRecommendationsProps {
  videos: Video[]
}

const videoTypeColors: Record<string, string> = {
  Conceptual: 'bg-purple-100 text-purple-700 border-purple-200',
  Tutorial: 'bg-blue-100 text-blue-700 border-blue-200',
  Practical: 'bg-green-100 text-green-700 border-green-200',
  Advanced: 'bg-red-100 text-red-700 border-red-200',
  Applied: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Performance: 'bg-orange-100 text-orange-700 border-orange-200',
  Design: 'bg-pink-100 text-pink-700 border-pink-200',
  Tool: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  Monitoring: 'bg-teal-100 text-teal-700 border-teal-200',
  'ML-Specific': 'bg-cyan-100 text-cyan-700 border-cyan-200',
}

export default function VideoRecommendations({ videos }: VideoRecommendationsProps) {
  return (
    <div className="ml-11 mt-4">
      <h4 className="text-sm font-semibold text-gray-900 mb-3">
        Video Recommendations
      </h4>

      <div className="space-y-3">
        {videos.map((video, idx) => (
          <div
            key={idx}
            className="bg-gray-50 border border-gray-200 rounded-lg p-4"
          >
            {/* Video Type and Watch Time */}
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${
                  videoTypeColors[video.type] || 'bg-gray-100 text-gray-700 border-gray-200'
                }`}
              >
                {video.type}
              </span>
              <span className="text-xs text-gray-500">
                {video.estimated_watch_time}
              </span>
            </div>

            {/* Search Query */}
            <div className="mb-2">
              <p className="text-sm font-medium text-gray-900">
                {video.search_query}
              </p>
            </div>

            {/* Expected Content */}
            <p className="text-sm text-gray-600 mb-2">{video.expected_content}</p>

            {/* Preferred Channels */}
            {video.preferred_channels.length > 0 && (
              <div className="mb-2">
                <span className="text-xs font-medium text-gray-700">
                  Suggested channels:{' '}
                </span>
                <span className="text-xs text-gray-600">
                  {video.preferred_channels.join(', ')}
                </span>
              </div>
            )}

            {/* Why Recommended */}
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-600 italic">
                {video.why_recommended}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
