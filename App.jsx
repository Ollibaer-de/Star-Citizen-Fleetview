import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Html, Bounds } from '@react-three/drei'
import clsx from 'clsx'

const SAMPLE_FLEET = [
  { ship_name: 'Carrack', manufacturer: 'Anvil Aerospace', type: 'Explorer', length: 126, beam: 76, height: 30, cargo: 456, value: 60000000 },
  { ship_name: 'Cutlass Black', manufacturer: 'Drake Interplanetary', type: 'Medium Fighter', length: 36, beam: 26, height: 10, cargo: 46, value: 2500000 },
  { ship_name: 'Aurora MR', manufacturer: 'Roberts Space Industries', type: 'Starter', length: 20, beam: 14, height: 6, cargo: 6, value: 45000 }
]

function ShipBox({ ship, position = [0,0,0] }) {
  const sx = Math.max(0.5, ship.length / 30)
  const sy = Math.max(0.3, ship.height / 10)
  const sz = Math.max(0.5, ship.beam / 30)
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[sx, sy, sz]} />
        <meshStandardMaterial roughness={0.6} metalness={0.2} />
      </mesh>
      <Html position={[0, sy/2 + 0.2, 0]} center>
        <div className='bg-black/70 text-white text-xs px-2 py-1 rounded'>
          <strong>{ship.ship_name}</strong><br />{ship.manufacturer}
        </div>
      </Html>
    </group>
  )
}

function FleetScene({ fleet }) {
  const cols = Math.ceil(Math.sqrt(fleet.length || 1))
  return (
    <Canvas shadows camera={{ position: [0, 40, 120], fov: 50 }} style={{ width: '100%', height: '100%' }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[50, 100, 50]} intensity={0.7} castShadow />
      <OrbitControls makeDefault />
      <gridHelper args={[200, 40]} />
      <Bounds fit clip damping={6}>
        {fleet.map((s, i) => {
          const row = Math.floor(i / cols)
          const col = i % cols
          const gap = 20
          const x = (col - cols/2) * gap
          const z = (row - cols/2) * gap
          return <ShipBox key={i} ship={s} position={[x, 0, z]} />
        })}
      </Bounds>
    </Canvas>
  )
}

export default function App() {
  const [fleet, setFleet] = useState(SAMPLE_FLEET)
  const totalValue = useMemo(() => fleet.reduce((s, x) => s + (x.value || 0), 0), [fleet])
  const totalShips = fleet.length

  const handleFile = useCallback((file) => {
    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result)
        if (Array.isArray(parsed)) setFleet(parsed)
        else alert('JSON muss ein Array mit Schiff-Objekten sein.')
      } catch (e) { alert('Fehler beim Parsen der JSON.') }
    }
    reader.readAsText(file)
  }, [])

  const onFileChange = (e) => {
    const f = e.target.files && e.target.files[0]
    if (f) handleFile(f)
    e.target.value = ''
  }

  return (
    <div className='h-screen grid grid-cols-3 gap-4 p-4'>
      <div className='col-span-2 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden'>
        <FleetScene fleet={fleet} />
      </div>

      <aside className='col-span-1 p-4 flex flex-col gap-4'>
        <div className='flex items-center justify-between'>
          <h1 className='text-2xl font-bold'>FleetView — Basis</h1>
          <div className='text-sm opacity-70'>{totalShips} ships</div>
        </div>
        <div className='bg-gray-800 p-3 rounded'>
          <label className='block text-sm mb-2'>Upload JSON</label>
          <input type='file' accept='.json,application/json' onChange={onFileChange} />
        </div>
        <div className='bg-gray-800 p-3 rounded'>
          <h2 className='font-semibold'>Stats</h2>
          <p>Total ships: {totalShips}</p>
          <p>Total value: {totalValue.toLocaleString()} aUEC</p>
        </div>
        <div className='bg-gray-800 p-3 rounded flex-1 overflow-auto'>
          <h3 className='font-semibold mb-2'>Fleet list</h3>
          <ul className='space-y-2 text-sm'>
            {fleet.map((s, i) => (
              <li key={i} className='p-2 bg-gray-900 rounded flex justify-between items-center'>
                <div>
                  <div className='font-semibold'>{s.ship_name}</div>
                  <div className='opacity-70 text-xs'>{s.manufacturer} • {s.type}</div>
                </div>
                <div className='text-right'>
                  <div className='text-sm'>{s.length}m</div>
                  <div className='text-xs opacity-70'>{s.cargo ?? '-'} m³</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  )
}
