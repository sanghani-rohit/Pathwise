import { SidebarSection } from '@/lib/types/roadmap'

interface RoadmapSidebarProps {
  sidebarStructure: SidebarSection[]
  selectedModuleId: number | null
  onSelectModule: (moduleId: number) => void
}

const badgeColors = {
  red: 'bg-red-100 text-red-800 border-red-200',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  green: 'bg-green-100 text-green-800 border-green-200',
}

export default function RoadmapSidebar({
  sidebarStructure,
  selectedModuleId,
  onSelectModule,
}: RoadmapSidebarProps) {
  return (
    <div className="w-80 border-r border-gray-200 bg-white overflow-y-auto">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Learning Roadmap</h1>

        <div className="space-y-6">
          {sidebarStructure.map((section, idx) => (
            <div key={idx}>
              {/* Section Header */}
              <div className="mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      badgeColors[section.badge_color]
                    }`}
                  >
                    {section.section_priority}
                  </span>
                </div>
                <h2 className="mt-2 text-sm font-semibold text-gray-900 uppercase tracking-wide">
                  {section.section_name}
                </h2>
              </div>

              {/* Modules List */}
              <div className="space-y-1">
                {section.modules.map((module) => (
                  <button
                    key={module.module_id}
                    onClick={() => onSelectModule(module.module_id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                      selectedModuleId === module.module_id
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium ${
                            selectedModuleId === module.module_id
                              ? 'text-blue-900'
                              : 'text-gray-900'
                          }`}
                        >
                          {module.module_name}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-medium whitespace-nowrap ${
                          selectedModuleId === module.module_id
                            ? 'text-blue-600'
                            : 'text-gray-500'
                        }`}
                      >
                        {module.estimated_hours}h
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
