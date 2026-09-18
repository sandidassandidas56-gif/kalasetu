'use client'

import { ComposableMap, Geographies, Geography } from 'react-simple-maps'

const geoUrl = 'https://cdn.jsdelivr.net/npm/india-atlas@2/states-2019-734.json'

export function IndiaCraftMap({ selectedState, onSelect }: { selectedState: string | null; onSelect: (state: string) => void }) {
  return <div className="overflow-hidden rounded-3xl border border-[#ded6ca] bg-[#eef2e9] p-3">
    <ComposableMap projection="geoMercator" projectionConfig={{ scale: 1000, center: [82, 23] }} className="h-auto w-full">
      <Geographies geography={geoUrl}>{({ geographies }) => geographies.map((geo) => {
        const name = geo.properties?.st_nm || geo.properties?.NAME_1 || geo.properties?.name || 'Unknown'
        const active = selectedState?.toLowerCase() === name.toLowerCase()
        return <Geography key={geo.rsmKey} geography={geo} onClick={() => onSelect(name)} tabIndex={0} aria-label={name} className="cursor-pointer outline-none transition-colors" style={{ fill: active ? '#d9704b' : '#9eb9a7', stroke: '#f7f3ec', strokeWidth: 0.7 }} />
      })}</Geographies>
    </ComposableMap>
  </div>
}
