'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase, CrimeData } from '@/lib/supabase'
import { CRIME_TYPES, YEARS } from '@/lib/constants'
import IndiaMap from './IndiaMap'
import StatePopup from './StatePopup'
import RankingPanel from './RankingPanel'

export default function CrimeDashboard() {
  const [allData, setAllData] = useState<CrimeData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(2014)
  const [selectedCrime, setSelectedCrime] = useState('Total IPC')
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch all data once
  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const { data, error } = await supabase
        .from('crime_data')
        .select('*')
        .order('year', { ascending: true })

      if (error) {
        setError(error.message)
      } else {
        setAllData(data || [])
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  // Filter data for current year + crime type
  const filteredData = allData.filter(
    d => d.year === selectedYear && d.crime_type === selectedCrime
  )

  // State data map: { stateName -> count }
  const stateDataMap: Record<string, number> = {}
  filteredData.forEach(d => {
    stateDataMap[d.state] = d.count
  })

  // All crime data for selected state (for popup)
  const stateAllCrimes = selectedState
    ? allData.filter(d => d.state === selectedState && d.year === selectedYear)
    : []

  // Rankings: sorted states by count
  const rankings = [...filteredData]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const maxCount = Math.max(...filteredData.map(d => d.count), 1)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Loading crime data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="text-center text-red-400">
          <p className="text-xl font-bold mb-2">Error loading data</p>
          <p className="text-sm text-gray-500">{error}</p>
          <p className="text-sm text-gray-600 mt-2">Check your .env.local Supabase keys</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-orange-400 tracking-tight">
              📒 India's Crime Ledger
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              NCRB Official Data · {allData.length.toLocaleString()} records · 2001–2014
            </p>
          </div>
          <div className="text-right text-xs text-gray-600">
            <p>Source: National Crime Records Bureau</p>
            <p>Ministry of Home Affairs, GoI</p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Controls */}
        <div className="bg-gray-900 rounded-2xl p-5 mb-6 border border-gray-800">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Year Slider */}
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-400">Year</label>
                <span className="text-2xl font-bold text-orange-400">{selectedYear}</span>
              </div>
              <input
                type="range"
                min={YEARS[0]}
                max={YEARS[YEARS.length - 1]}
                value={selectedYear}
                onChange={e => setSelectedYear(Number(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>{YEARS[0]}</span>
                <span>{YEARS[YEARS.length - 1]}</span>
              </div>
            </div>

            {/* Crime Type Filter */}
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-400 block mb-2">Crime Type</label>
              <div className="flex flex-wrap gap-2">
                {CRIME_TYPES.map(crime => (
                  <button
                    key={crime}
                    onClick={() => setSelectedCrime(crime)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedCrime === crime
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    {crime}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map — takes 2 cols */}
          <div className="lg:col-span-2 bg-gray-900 rounded-2xl border border-gray-800 p-4 relative">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                {selectedCrime} · {selectedYear}
              </h2>
              {selectedState && (
                <button
                  onClick={() => setSelectedState(null)}
                  className="text-xs text-gray-500 hover:text-white transition-colors"
                >
                  ✕ Close popup
                </button>
              )}
            </div>

            <IndiaMap
              stateDataMap={stateDataMap}
              maxCount={maxCount}
              selectedState={selectedState}
              onStateClick={setSelectedState}
            />

            {/* Legend */}
            <div className="mt-3 flex items-center gap-3">
              <span className="text-xs text-gray-600">Low</span>
              <div className="flex-1 h-2 rounded-full bg-gradient-to-r from-yellow-900 via-orange-600 to-red-600" />
              <span className="text-xs text-gray-600">High</span>
              <span className="text-xs text-gray-500 ml-2">
                Max: {maxCount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Right panel */}
          <div className="flex flex-col gap-6">
            {/* State Popup */}
            {selectedState && (
              <StatePopup
                state={selectedState}
                year={selectedYear}
                crimes={stateAllCrimes}
                onClose={() => setSelectedState(null)}
              />
            )}

            {/* Rankings */}
            <RankingPanel
              rankings={rankings}
              crimeType={selectedCrime}
              year={selectedYear}
              maxCount={maxCount}
              onStateClick={setSelectedState}
            />
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-700 mt-6">
          Every number is a real FIR. A real victim. A real family. — Accountability is not anti-national. Silence is.
        </p>
      </div>
    </div>
  )
}