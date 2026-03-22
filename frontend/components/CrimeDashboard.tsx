'use client'

import { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import * as d3 from 'd3'
import {
  Scale, Skull, AlertTriangle, Lock, ShieldAlert, HeartOff,
  Banknote, Users, ShoppingBag, Flame, Trophy, BarChart2,
  Calendar, SlidersHorizontal, X, Search, MapPin, TrendingUp, List, Download
} from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type CrimeData = { id: number; state: string; crime_type: string; year: number; count: number }

const CRIME_TYPES = ['Total IPC','Murder','Rape','Kidnapping','Assault on Women','Dowry Deaths','Robbery','Dacoity','Theft','Riots']

const CRIME_ICON_MAP: Record<string, React.ReactNode> = {
  'Total IPC': <Scale size={12} />, 'Murder': <Skull size={12} />,
  'Rape': <AlertTriangle size={12} />, 'Kidnapping': <Lock size={12} />,
  'Assault on Women': <ShieldAlert size={12} />, 'Dowry Deaths': <HeartOff size={12} />,
  'Robbery': <Banknote size={12} />, 'Dacoity': <Users size={12} />,
  'Theft': <ShoppingBag size={12} />, 'Riots': <Flame size={12} />,
}

const STATES: Record<string, { path: string; cx: number; cy: number }> = {
  "Jammu & Kashmir":   { path: "M99,4 L208,4 L208,96 L166,96 L121,86 L99,58 Z", cx: 140, cy: 52 },
  "Ladakh":            { path: "M169,4 L169,96 L208,96 L208,4 Z", cx: 188, cy: 50 },
  "Himachal Pradesh":  { path: "M128,78 L178,78 L178,134 L140,134 L128,112 Z", cx: 155, cy: 107 },
  "Punjab":            { path: "M99,92 L135,92 L135,152 L104,152 L99,132 Z", cx: 117, cy: 124 },
  "Chandigarh":        { path: "M145,126 L152,126 L152,133 L145,133 Z", cx: 148, cy: 129 },
  "Uttarakhand":       { path: "M169,112 L213,112 L213,165 L169,165 Z", cx: 191, cy: 138 },
  "Haryana":           { path: "M109,124 L162,124 L162,187 L109,187 Z", cx: 136, cy: 156 },
  "Delhi":             { path: "M149,163 L161,163 L161,175 L149,175 Z", cx: 154, cy: 169 },
  "Rajasthan":         { path: "M24,138 L166,138 L166,279 L67,279 L24,251 Z", cx: 95, cy: 210 },
  "Uttar Pradesh":     { path: "M154,132 L282,132 L282,263 L154,263 Z", cx: 218, cy: 197 },
  "Bihar":             { path: "M259,191 L345,191 L345,255 L259,255 Z", cx: 302, cy: 223 },
  "Sikkim":            { path: "M340,177 L355,177 L355,199 L340,199 Z", cx: 347, cy: 188 },
  "Arunachal Pradesh": { path: "M401,152 L500,152 L500,207 L401,207 Z", cx: 450, cy: 179 },
  "Nagaland":          { path: "M430,201 L463,201 L463,237 L430,237 Z", cx: 446, cy: 219 },
  "Manipur":           { path: "M425,227 L456,227 L456,265 L425,265 Z", cx: 440, cy: 246 },
  "Mizoram":           { path: "M413,251 L432,251 L432,303 L413,303 Z", cx: 422, cy: 277 },
  "Tripura":           { path: "M394,251 L413,251 L413,301 L394,301 Z", cx: 404, cy: 276 },
  "Meghalaya":         { path: "M370,219 L422,219 L422,241 L370,241 Z", cx: 396, cy: 230 },
  "Assam":             { path: "M369,191 L476,191 L476,239 L369,239 Z", cx: 422, cy: 215 },
  "West Bengal":       { path: "M302,197 L372,197 L372,311 L302,311 Z", cx: 337, cy: 254 },
  "Jharkhand":         { path: "M259,245 L331,245 L331,305 L259,305 Z", cx: 295, cy: 275 },
  "Odisha":            { path: "M227,289 L331,289 L331,385 L227,385 Z", cx: 279, cy: 337 },
  "Chhattisgarh":      { path: "M208,259 L278,259 L278,385 L208,385 Z", cx: 243, cy: 322 },
  "Madhya Pradesh":    { path: "M101,203 L251,203 L251,319 L101,319 Z", cx: 176, cy: 261 },
  "Gujarat":           { path: "M2,247 L109,247 L109,339 L2,339 Z", cx: 55, cy: 293 },
  "Dadra & Nagar Haveli and Daman & Diu": { path: "M80,326 L94,326 L94,348 L80,348 Z", cx: 87, cy: 337 },
  "Maharashtra":       { path: "M77,299 L218,299 L218,429 L77,429 Z", cx: 148, cy: 364 },
  "Goa":               { path: "M96,423 L109,423 L109,445 L96,445 Z", cx: 102, cy: 433 },
  "Karnataka":         { path: "M101,371 L179,371 L179,508 L101,508 Z", cx: 140, cy: 439 },
  "Telangana":         { path: "M155,343 L227,343 L227,425 L155,425 Z", cx: 191, cy: 384 },
  "Andhra Pradesh":    { path: "M152,359 L283,359 L283,488 L152,488 Z", cx: 218, cy: 424 },
  "Tamil Nadu":        { path: "M138,470 L208,470 L208,578 L138,578 Z", cx: 173, cy: 524 },
  "Kerala":            { path: "M116,484 L159,484 L159,576 L116,576 Z", cx: 137, cy: 530 },
  "Puducherry":        { path: "M196,495 L209,495 L209,510 L196,510 Z", cx: 202, cy: 503 },
  "Andaman & Nicobar Islands": { path: "M411,420 L425,420 L425,560 L411,560 Z", cx: 418, cy: 490 },
  "Lakshadweep":       { path: "M63,490 L86,490 L86,545 L63,545 Z", cx: 74, cy: 517 },
}

const STATE_ABBR: Record<string,string> = {
  "Ladakh":"LA","Jammu & Kashmir":"J&K","Himachal Pradesh":"HP","Punjab":"PB",
  "Chandigarh":"CH","Uttarakhand":"UK","Haryana":"HR","Delhi":"DL",
  "Rajasthan":"RJ","Uttar Pradesh":"UP","Bihar":"BR","Sikkim":"SK",
  "Arunachal Pradesh":"AR","Nagaland":"NL","Manipur":"MN","Mizoram":"MZ",
  "Tripura":"TR","Meghalaya":"ML","Assam":"AS","West Bengal":"WB",
  "Jharkhand":"JH","Odisha":"OD","Chhattisgarh":"CG","Madhya Pradesh":"MP",
  "Gujarat":"GJ","Maharashtra":"MH","Dadra & Nagar Haveli and Daman & Diu":"DN",
  "Goa":"GA","Karnataka":"KA","Telangana":"TS","Andhra Pradesh":"AP",
  "Tamil Nadu":"TN","Kerala":"KL","Puducherry":"PY",
  "Andaman & Nicobar Islands":"AN","Lakshadweep":"LD",
}

const ALL_STATES = Object.keys(STATES)

export default function CrimeDashboard() {
  const [allData, setAllData] = useState<CrimeData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(2023)
  const [selectedCrime, setSelectedCrime] = useState('Total IPC')
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const [hoveredState, setHoveredState] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'breakdown'|'trend'>('breakdown')
  const [downloading, setDownloading] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchAll() {
      let rows: CrimeData[] = [], from = 0
      while (true) {
        const { data, error } = await supabase.from('crime_data').select('*').range(from, from + 999)
        if (error) { setError(error.message); break }
        if (!data?.length) break
        rows = [...rows, ...data]
        if (data.length < 1000) break
        from += 1000
      }
      setAllData(rows)
      setLoading(false)
    }
    fetchAll()
  }, [])

  // Search handler
  useEffect(() => {
    if (!search.trim()) { setSearchResults([]); return }
    const q = search.toLowerCase()
    setSearchResults(ALL_STATES.filter(s => s.toLowerCase().includes(q)).slice(0, 5))
  }, [search])

  const filtered = useMemo(() =>
    allData.filter(d => d.year === selectedYear && d.crime_type === selectedCrime),
    [allData, selectedYear, selectedCrime]
  )

  const stateMap = useMemo(() => {
    const m: Record<string,number> = {}
    filtered.forEach(d => { m[d.state] = d.count })
    return m
  }, [filtered])

  const maxCount = Math.max(...Object.values(stateMap), 1)
  const colorFn = d3.scaleSequential().domain([0, maxCount]).interpolator(d3.interpolateRgb('#dde8f5', '#dc2626'))
  const getColor = (s: string) => stateMap[s] ? colorFn(stateMap[s]) : '#dde5ef'

  const stateDetail = useMemo(() =>
    selectedState ? allData.filter(d => d.state === selectedState && d.year === selectedYear).sort((a,b) => b.count - a.count) : [],
    [selectedState, selectedYear, allData]
  )
  const rankings = useMemo(() => [...filtered].sort((a,b) => b.count - a.count).slice(0, 6), [filtered])

  // Trend data: for selected state + crime type, all years
  const trendData = useMemo(() => {
    if (!selectedState) return []
    return Array.from({length:23},(_,i)=>2001+i).map(yr => {
      const row = allData.find(d => d.state === selectedState && d.year === yr && d.crime_type === selectedCrime)
      return { year: yr, count: row?.count || 0 }
    })
  }, [selectedState, selectedCrime, allData])

  const handleStateSelect = (name: string) => {
    setSelectedState(name)
    setSearch('')
    setSearchResults([])
  }

  const handleDownload = useCallback(async () => {
    if (!selectedState || !panelRef.current) return
    setDownloading(true)
    try {
      // Dynamic import to keep bundle small
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(panelRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
      })
      const link = document.createElement('a')
      link.download = `${selectedState.replace(/[^a-z0-9]/gi, '_')}_${selectedYear}_${selectedCrime.replace(/[^a-z0-9]/gi, '_')}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (e) {
      console.error('Download failed:', e)
    } finally {
      setDownloading(false)
    }
  }, [selectedState, selectedYear, selectedCrime])

  if (loading) return (
    <div className="flex items-center justify-center h-screen" style={{ background: '#f0f4f8' }}>
      <div className="text-center space-y-4">
        <div className="relative w-14 h-14 mx-auto">
          <div className="absolute inset-0 border-2 border-red-500/20 rounded-full" />
          <div className="absolute inset-0 border-2 border-t-red-500 rounded-full animate-spin" />
        </div>
        <p className="text-slate-500 text-xs tracking-widest uppercase">Loading NCRB Data...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center h-screen" style={{ background: '#f0f4f8' }}>
      <div className="text-center space-y-2">
        <p className="text-red-400 font-bold">Supabase Error</p>
        <p className="text-slate-500 text-sm">{error}</p>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: '#f0f4f8' }}>

      {/* ━━ HEADER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <header className="flex items-center justify-between px-4 md:px-6 py-3 shrink-0"
        style={{ background: '#ffffff', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.25)' }}>
            <Scale size={14} color="#f87171" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-slate-900 font-bold text-sm leading-none">India&apos;s Crime Ledger</h1>
            <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>{allData.length.toLocaleString()} records · 2001–2023</p>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative flex-1 max-w-xs mx-4">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#64748b' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search state..."
            className="w-full text-xs py-2 pl-8 pr-3 rounded-lg outline-none"
            style={{ background: '#f1f5f9', border: '1px solid rgba(0,0,0,0.08)', color: '#1e293b' }}
          />
          {/* Dropdown results */}
          {searchResults.length > 0 && (
            <div className="absolute top-full mt-1 left-0 right-0 rounded-lg overflow-hidden shadow-2xl z-50"
              style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.1)' }}>
              {searchResults.map(s => (
                <button key={s} onClick={() => handleStateSelect(s)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-left transition-colors"
                  style={{ color: '#475569' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(220,38,38,0.07)'; (e.currentTarget as HTMLElement).style.color = '#dc2626' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#94a3b8' }}>
                  <MapPin size={11} />
                  <span>{s}</span>
                  <span className="ml-auto font-semibold" style={{ color: '#ef4444' }}>
                    {(stateMap[s] || 0).toLocaleString()}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="hidden md:flex items-center gap-4">
          <div className="text-center">
            <p className="font-bold text-sm leading-none" style={{ color: '#1e293b' }}>35</p>
            <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>States</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-sm leading-none" style={{ color: '#1e293b' }}>23</p>
            <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>Years</p>
          </div>
          <div className="px-2.5 py-1 rounded-lg text-xs font-semibold"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)' }}>
            NCRB · GoI
          </div>
        </div>
      </header>

      {/* ━━ CONTROLS BAR ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex items-center gap-4 px-4 md:px-6 py-2.5 shrink-0"
        style={{ background: '#ffffff', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>

        {/* Year slider inline */}
        <div className="flex items-center gap-3 shrink-0">
          <Calendar size={12} style={{ color: '#64748b' }} />
          <span className="text-xs font-bold tabular-nums" style={{ color: '#dc2626' }}>{selectedYear}</span>
          <input type="range" min={2001} max={2023} value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
            className="w-32 md:w-48 cursor-pointer" style={{ accentColor: '#ef4444' }} />
          <span className="text-xs hidden md:block" style={{ color: '#94a3b8' }}>2001 – 2023</span>
        </div>

        <div className="w-px h-4 shrink-0" style={{ background: 'rgba(255,255,255,0.08)' }} />

        {/* Crime type pills — scrollable horizontally */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 flex-1" style={{ scrollbarWidth: 'none' }}>
          <SlidersHorizontal size={12} className="shrink-0" style={{ color: '#64748b' }} />
          {CRIME_TYPES.map(crime => (
            <button key={crime} onClick={() => setSelectedCrime(crime)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-all"
              style={{
                background: selectedCrime === crime ? 'rgba(239,68,68,0.2)' : 'rgba(0,0,0,0.04)',
                color: selectedCrime === crime ? '#dc2626' : '#64748b',
                border: `1px solid ${selectedCrime === crime ? 'rgba(220,38,38,0.3)' : 'rgba(0,0,0,0.06)'}`,
              }}>
              {CRIME_ICON_MAP[crime]}
              <span>{crime}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ━━ MAIN CONTENT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex flex-1 overflow-hidden">

        {/* MAP */}
        <main className="flex-1 flex items-center justify-center relative overflow-hidden p-2 pb-4"
          style={{ background: '#f0f4f8' }}>
          <svg viewBox="-5 -5 515 610" className="h-full w-auto"
            style={{ maxWidth: '100%', maxHeight: '100%', filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.18)) drop-shadow(0 2px 8px rgba(0,0,0,0.12))' }}>
            <defs>
              <pattern id="grid" width="50" height="58" patternUnits="userSpaceOnUse">
                <path d="M50 0 L0 0 0 58" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect x="-5" y="-5" width="515" height="595" fill="url(#grid)" />

            {Object.entries(STATES).map(([name, { path, cx, cy }]) => {
              const isSelected = selectedState === name
              const isHovered = hoveredState === name
              const count = stateMap[name] || 0
              const bright = count > maxCount * 0.3
              return (
                <g key={name}>
                  {count > maxCount * 0.5 && (
                    <path d={path} fill="none" stroke="rgba(220,38,38,0.2)" strokeWidth="5"
                      style={{ filter: 'blur(4px)' }} />
                  )}
                  <path d={path}
                    fill={getColor(name)}
                    stroke={isSelected ? '#fb923c' : isHovered ? '#475569' : 'rgba(255,255,255,0.07)'}
                    strokeWidth={isSelected ? 2 : 0.5}
                    style={{ cursor: 'pointer', transition: 'fill 0.25s ease' }}
                    onClick={() => setSelectedState(isSelected ? null : name)}
                    onMouseEnter={() => setHoveredState(name)}
                    onMouseLeave={() => setHoveredState(null)}>
                    <title>{name}: {count.toLocaleString()}</title>
                  </path>
                  <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
                    fontSize="5.5" fontWeight="700"
                    fill={bright ? 'rgba(15,23,42,0.9)' : 'rgba(100,116,139,0.7)'}
                    style={{ pointerEvents: 'none', userSelect: 'none', letterSpacing: '0.04em' }}>
                    {STATE_ABBR[name]}
                  </text>
                </g>
              )
            })}
          </svg>

          {/* Hover tooltip */}
          {hoveredState && !selectedState && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none rounded-xl px-4 py-2.5 flex items-center gap-4"
              style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)' }}>
              <div>
                <p className="font-semibold text-sm" style={{ color: '#1e293b' }}>{hoveredState}</p>
                <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>{selectedCrime} · {selectedYear}</p>
              </div>
              <p className="text-red-400 font-bold text-lg tabular-nums">
                {(stateMap[hoveredState] || 0).toLocaleString()}
              </p>
            </div>
          )}

          {/* Legend bottom left */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2">
            <span className="text-xs" style={{ color: '#94a3b8' }}>Low</span>
            <div className="w-20 h-1.5 rounded-full" style={{ background: 'linear-gradient(to right, #dde8f5, #fca5a5, #dc2626)' }} />
            <span className="text-xs" style={{ color: '#94a3b8' }}>High</span>
          </div>
        </main>

        {/* ━━ RIGHT PANEL ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <aside className="w-64 flex flex-col overflow-hidden shrink-0"
          style={{ background: '#ffffff', borderLeft: '1px solid rgba(0,0,0,0.07)' }}>

          {selectedState ? (
            <div className="flex-1 overflow-hidden flex flex-col" ref={panelRef}>
              {/* State header */}
              <div className="flex items-start justify-between p-4 pb-2 shrink-0">
                <div>
                  <h3 className="font-bold text-sm" style={{ color: '#1e293b' }}>{selectedState}</h3>
                  <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>{selectedYear} · {selectedCrime}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={handleDownload} disabled={downloading}
                    className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all"
                    style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.2)' }}
                    title="Download as PNG"
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(220,38,38,0.15)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(220,38,38,0.08)' }}>
                    <Download size={10} />
                    <span>{downloading ? '...' : 'PNG'}</span>
                  </button>
                  <button onClick={() => setSelectedState(null)}
                    className="w-6 h-6 rounded-md flex items-center justify-center transition-all"
                    style={{ background: 'rgba(0,0,0,0.05)', color: '#64748b' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#1e293b' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#64748b' }}>
                    <X size={11} />
                  </button>
                </div>
              </div>

              {/* Total highlight */}
              {(() => {
                const total = stateDetail.find(c => c.crime_type === 'Total IPC')
                return total ? (
                  <div className="mx-4 mb-2 rounded-xl p-3 shrink-0"
                    style={{ background: 'linear-gradient(135deg,rgba(220,38,38,0.08),rgba(220,38,38,0.03))', border: '1px solid rgba(220,38,38,0.2)' }}>
                    <p className="text-xs font-semibold" style={{ color: '#dc2626' }}>Total IPC · {selectedYear}</p>
                    <p className="text-2xl font-bold tabular-nums mt-0.5" style={{ color: '#dc2626' }}>
                      {total.count.toLocaleString()}
                    </p>
                  </div>
                ) : null
              })()}

              {/* Tabs */}
              <div className="flex mx-4 mb-2 shrink-0 rounded-lg p-0.5 gap-0.5" style={{ background: '#f1f5f9' }}>
                {[
                  { id: 'breakdown', label: 'Breakdown', icon: <List size={11}/> },
                  { id: 'trend', label: 'Trend', icon: <TrendingUp size={11}/> },
                ].map(tab => (
                  <button key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'breakdown'|'trend')}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition-all"
                    style={{
                      background: activeTab === tab.id ? '#ffffff' : 'transparent',
                      color: activeTab === tab.id ? '#1e293b' : '#94a3b8',
                      boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                    }}>
                    {tab.icon}{tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="flex-1 overflow-y-auto px-4 pb-4">
                {activeTab === 'breakdown' ? (
                  /* Crime bars */
                  (() => {
                    const crimes = stateDetail.filter(c => c.crime_type !== 'Total IPC')
                    const maxVal = Math.max(...crimes.map(c => c.count), 1)
                    return (
                      <div className="space-y-2.5">
                        {crimes.map((crime, i) => (
                          <div key={crime.crime_type}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs flex items-center gap-1.5" style={{ color: '#64748b' }}>
                                {CRIME_ICON_MAP[crime.crime_type]}
                                <span>{crime.crime_type}</span>
                              </span>
                              <span className="text-xs font-bold tabular-nums" style={{ color: '#1e293b' }}>{crime.count.toLocaleString()}</span>
                            </div>
                            <div className="h-1 rounded-full overflow-hidden" style={{ background: '#e2e8f0' }}>
                              <div className="h-full rounded-full"
                                style={{
                                  width: `${(crime.count / maxVal) * 100}%`,
                                  background: i === 0 ? '#ef4444' : i < 3 ? '#f59e0b' : '#3b82f6',
                                  transition: 'width 0.5s ease'
                                }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  })()
                ) : (
                  /* Trend Chart — SVG line graph */
                  (() => {
                    const W = 220, H = 140
                    const pad = { t: 10, r: 10, b: 24, l: 38 }
                    const iW = W - pad.l - pad.r
                    const iH = H - pad.t - pad.b
                    const maxVal = Math.max(...trendData.map(d => d.count), 1)
                    const minVal = Math.min(...trendData.filter(d=>d.count>0).map(d => d.count), 0)
                    const xScale = (i: number) => pad.l + (i / 22) * iW
                    const yScale = (v: number) => pad.t + iH - ((v - minVal) / (maxVal - minVal)) * iH
                    const pts = trendData.map((d,i) => `${xScale(i)},${yScale(d.count)}`).join(' ')
                    const area = `M${xScale(0)},${pad.t+iH} ` + trendData.map((d,i) => `L${xScale(i)},${yScale(d.count)}`).join(' ') + ` L${xScale(22)},${pad.t+iH} Z`
                    const selectedIdx = trendData.findIndex(d => d.year === selectedYear)

                    return (
                      <div>
                        <p className="text-xs font-semibold mb-2" style={{ color: '#64748b' }}>
                          {selectedCrime} · 2001–2023
                        </p>
                        <svg width={W} height={H} className="w-full">
                          {/* Area fill */}
                          <defs>
                            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#dc2626" stopOpacity="0.15"/>
                              <stop offset="100%" stopColor="#dc2626" stopOpacity="0.01"/>
                            </linearGradient>
                          </defs>
                          <path d={area} fill="url(#areaGrad)" />
                          {/* Grid lines */}
                          {[0.25,0.5,0.75,1].map(p => (
                            <line key={p}
                              x1={pad.l} y1={pad.t + iH * (1-p)}
                              x2={pad.l+iW} y2={pad.t + iH * (1-p)}
                              stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="3,3"/>
                          ))}
                          {/* Y axis labels */}
                          {[0, 0.5, 1].map(p => (
                            <text key={p} x={pad.l-4} y={pad.t + iH*(1-p)+3}
                              textAnchor="end" fontSize="6" fill="#94a3b8">
                              {Math.round((minVal + p*(maxVal-minVal))/1000)}k
                            </text>
                          ))}
                          {/* X axis year labels */}
                          {[2001,2005,2010,2015,2020,2023].map(yr => {
                            const i = yr - 2001
                            return (
                              <text key={yr} x={xScale(i)} y={H-6}
                                textAnchor="middle" fontSize="6" fill="#94a3b8">{yr}</text>
                            )
                          })}
                          {/* COVID dip marker */}
                          <line x1={xScale(19)} y1={pad.t} x2={xScale(19)} y2={pad.t+iH}
                            stroke="#f59e0b" strokeWidth="0.8" strokeDasharray="2,2" opacity="0.6"/>
                          <text x={xScale(19)} y={pad.t+8} textAnchor="middle" fontSize="5.5" fill="#f59e0b">COVID</text>
                          {/* Line */}
                          <polyline points={pts} fill="none" stroke="#dc2626" strokeWidth="1.5" strokeLinejoin="round"/>
                          {/* Selected year dot */}
                          {selectedIdx >= 0 && (
                            <>
                              <circle cx={xScale(selectedIdx)} cy={yScale(trendData[selectedIdx].count)}
                                r="4" fill="#dc2626" stroke="white" strokeWidth="1.5"/>
                              <text x={xScale(selectedIdx)} y={yScale(trendData[selectedIdx].count)-7}
                                textAnchor="middle" fontSize="6.5" fontWeight="700" fill="#dc2626">
                                {(trendData[selectedIdx].count/1000).toFixed(0)}k
                              </text>
                            </>
                          )}
                        </svg>

                        {/* Year-by-year mini table */}
                        <div className="mt-3 space-y-1">
                          <p className="text-xs font-semibold" style={{ color: '#94a3b8' }}>All years</p>
                          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                            {trendData.filter(d=>d.count>0).map(d => (
                              <div key={d.year} className="flex justify-between items-center py-0.5"
                                style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <span className="text-xs font-medium"
                                  style={{ color: d.year === selectedYear ? '#dc2626' : '#64748b' }}>
                                  {d.year}
                                </span>
                                <span className="text-xs font-bold tabular-nums"
                                  style={{ color: d.year === selectedYear ? '#dc2626' : '#1e293b' }}>
                                  {d.count.toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )
                  })()
                )}
              </div>
            </div>
          ) : (
            /* Rankings */
            <div className="flex-1 overflow-hidden flex flex-col p-4">
              <div className="flex items-center justify-between mb-3 shrink-0">
                <span className="text-xs font-semibold flex items-center gap-1.5 uppercase tracking-widest"
                  style={{ color: '#64748b' }}><Trophy size={11} />Top States</span>
                <span className="text-xs px-2 py-0.5 rounded font-bold"
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#dc2626' }}>{selectedYear}</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-0.5">
                {rankings.map((item, i) => (
                  <button key={item.state} onClick={() => setSelectedState(item.state)}
                    className="w-full text-left rounded-lg p-2.5 transition-all group"
                    style={{ background: 'transparent' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.04)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold shrink-0"
                        style={{
                          background: i === 0 ? 'rgba(239,68,68,0.2)' : i < 3 ? 'rgba(245,158,11,0.15)' : 'rgba(0,0,0,0.04)',
                          color: i === 0 ? '#f87171' : i < 3 ? '#fbbf24' : '#475569'
                        }}>{i + 1}</div>
                      <span className="text-xs flex-1 truncate" style={{ color: '#475569' }}>{item.state}</span>
                      <span className="text-xs font-bold tabular-nums" style={{ color: '#475569' }}>
                        {item.count.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-0.5 rounded-full ml-7 overflow-hidden" style={{ background: '#e2e8f0' }}>
                      <div className="h-full rounded-full"
                        style={{ width: `${(item.count / maxCount) * 100}%`, background: i === 0 ? '#ef4444' : i < 3 ? '#f59e0b' : '#334155' }} />
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-center mt-3 shrink-0 italic" style={{ color: '#94a3b8' }}>
                Click map or state name to explore
              </p>
            </div>
          )}

          {/* Footer quote */}
          <div className="px-4 py-3 shrink-0" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
            <p className="text-xs italic leading-relaxed" style={{ color: '#94a3b8' }}>
              &ldquo;Accountability is not anti-national. Silence is.&rdquo;
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}