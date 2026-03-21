'use client'

import { CrimeData } from '@/lib/supabase'

interface RankingPanelProps {
  rankings: CrimeData[]
  crimeType: string
  year: number
  maxCount: number
  onStateClick: (state: string) => void
}

const RANK_COLORS = [
  'text-red-400',
  'text-orange-400',
  'text-yellow-400',
  'text-yellow-500',
  'text-yellow-600',
  'text-gray-400',
  'text-gray-400',
  'text-gray-500',
  'text-gray-500',
  'text-gray-600',
]

export default function RankingPanel({ rankings, crimeType, year, maxCount, onStateClick }: RankingPanelProps) {
  if (rankings.length === 0) {
    return (
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
        <p className="text-gray-600 text-sm text-center">No data for selected filters</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 flex-1">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
        🏆 Top States · {crimeType} · {year}
      </h3>

      <div className="space-y-2">
        {rankings.map((item, i) => (
          <button
            key={item.state}
            onClick={() => onStateClick(item.state)}
            className="w-full text-left hover:bg-gray-800 rounded-lg p-2 transition-colors group"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-bold w-5 ${RANK_COLORS[i]}`}>
                #{i + 1}
              </span>
              <span className="text-sm text-white flex-1 truncate group-hover:text-orange-400 transition-colors">
                {item.state}
              </span>
              <span className="text-xs text-gray-400 font-medium">
                {item.count.toLocaleString()}
              </span>
            </div>
            <div className="h-1 bg-gray-800 rounded-full overflow-hidden ml-7">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(item.count / maxCount) * 100}%`,
                  background: i === 0
                    ? 'linear-gradient(to right, #ef4444, #dc2626)'
                    : i < 3
                    ? 'linear-gradient(to right, #f97316, #ea580c)'
                    : 'linear-gradient(to right, #eab308, #ca8a04)',
                }}
              />
            </div>
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-700 mt-3 text-center">
        Click any state to see full breakdown
      </p>
    </div>
  )
}