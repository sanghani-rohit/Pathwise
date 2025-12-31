interface RoadmapCardProps {
  roadmap: {
    id: string
    roadmapNumber: number
    title: string
    description: string
    priority: number
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
    estimatedWeeks: number
    modules: Array<{
      id: string
      moduleNumber: number
      title: string
      overview: string
      practicalExample: string
      keyConcepts: string[]
      videoUrl: string
      difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
      estimatedHours: number
    }>
  }
  onSelect: () => void
}

export default function RoadmapCard({ roadmap, onSelect }: RoadmapCardProps) {
  const difficultyColors = {
    Beginner: 'bg-green-100 text-green-800 border-green-300',
    Intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    Advanced: 'bg-red-100 text-red-800 border-red-300',
  }

  const priorityBadgeColors = {
    1: 'bg-blue-600 text-white',
    2: 'bg-purple-600 text-white',
    3: 'bg-indigo-600 text-white',
    4: 'bg-pink-600 text-white',
  }

  const totalHours = roadmap.modules?.reduce(
    (sum, module) => sum + (module.estimatedHours || 0),
    0
  ) || 0

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 hover:border-blue-400 transition-all duration-300 overflow-hidden group">
      {/* Priority Badge */}
      <div className="relative">
        <div
          className={`absolute top-3 right-3 ${
            priorityBadgeColors[roadmap.priority as keyof typeof priorityBadgeColors] ||
            'bg-gray-600 text-white'
          } px-3 py-1 rounded-full text-xs font-bold z-10`}
        >
          Priority {roadmap.priority}
        </div>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
          <h3 className="text-2xl font-bold mb-2 pr-20">{roadmap.title}</h3>
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                difficultyColors[roadmap.difficulty]
              } bg-white`}
            >
              {roadmap.difficulty.toUpperCase()}
            </span>
            <span className="text-blue-100 text-sm">
              {roadmap.modules?.length || 0} modules
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        {/* Description */}
        <p className="text-gray-700 text-sm mb-4 leading-relaxed">
          {roadmap.description}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-gray-900">
              {roadmap.estimatedWeeks}
            </div>
            <div className="text-xs text-gray-600 font-medium">Weeks</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-gray-900">{totalHours}</div>
            <div className="text-xs text-gray-600 font-medium">Total Hours</div>
          </div>
        </div>

        {/* Sample Modules */}
        <div className="mb-5">
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
            Sample Modules:
          </h4>
          <ul className="space-y-1">
            {roadmap.modules?.slice(0, 3).map((module) => (
              <li key={module.id} className="text-sm text-gray-700 flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span className="line-clamp-1">{module.title}</span>
              </li>
            ))}
            {(roadmap.modules?.length || 0) > 3 && (
              <li className="text-sm text-gray-500 italic ml-4">
                +{(roadmap.modules?.length || 0) - 3} more modules...
              </li>
            )}
          </ul>
        </div>

        {/* Action Button */}
        <button
          onClick={onSelect}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors group-hover:scale-105 transform duration-200"
        >
          Start Learning
        </button>
      </div>
    </div>
  )
}
