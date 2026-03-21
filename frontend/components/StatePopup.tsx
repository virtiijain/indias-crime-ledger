'use client'

import { CrimeData } from '@/lib/supabase'

interface StatePopupProps {
  state: string
  year: number
  crimes: CrimeData[]
  onClose: () => void
}

const CRIME_ICONS: Record<string, string> = {
  "Total IPC":        "⚖️",
  "Murder":           "🔪",
  "Rape":             "🚨",
  "Kidnapping":       "🔒",
  "Assault on Women": "🛡️",
  "Dowry Deaths":     "💔",
  "Robbery":          "💰",
  "Dacoity":          "🏴",
  "Theft":            "👜",
  "Riots":            "🔥",
}

export default function StatePopup({ state, year, crimes, onClose }: StatePopupProps) {
  const totalIPC = crimes.find(c => c.crime_type === 'Total IPC')?.count || 0
  const sortedCrimes = [...crimes]
    .filter(c => c.crime_type !== 'Total IPC')
    .sort((a, b) => b.count - a.count)

  const maxCrime = Math.max(...sortedCrimes.map(c => c.count), 1)

  return (
    <div className="bg-gray-900 rounded-2xl border border-orange-500/30 p-4 shadow-xl shadow-orange-500/5">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-white text-lg leading-tight">{state}</h3>
          <p className="text-xs text-gray-500 mt-0.5">Year {year}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-600 hover:text-white transition-colors text-lg leading-none"
        >
          ✕
        </button>
      </div>

      {/* Total IPC highlight */}
      <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 mb-3">
        <p className="text-xs text-orange-400 font-medium">Total IPC Crimes</p>
        <p className="text-2xl font-bold text-orange-300">{totalIPC.toLocaleString()}</p>
      </div>

      {/* Crime breakdown */}
      <div className="space-y-2">
        {sortedCrimes.map(crime => (
          <div key={crime.crime_type}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-400">
                {CRIME_ICONS[crime.crime_type] || '📊'} {crime.crime_type}
              </span>
              <span className="text-white font-medium">{crime.count.toLocaleString()}</span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-600 to-red-500 rounded-full transition-all duration-500"
                style={{ width: `${(crime.count / maxCrime) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}