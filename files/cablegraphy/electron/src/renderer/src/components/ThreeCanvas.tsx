import { OrbitControls, Stats } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useDataStore } from '@renderer/state'
import { useEffect, useState } from 'react'
import Disc from './Disc'

function Movements() {
  const data = useDataStore((state) => state.data)
  const [circleCenter, setCircleCenter] = useState({ x: 0, y: 0 })

  useEffect(() => {
    // Example of handling key press logic
    const handleKeyPress = (event) => {
      if (event.key === '4') {
        console.log('data', data)
        // Handle data logic here
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [data])

  return (
    <>
      {data.map((movement, index) => (
        <mesh key={index} position={[movement.x / 100, movement.y / 100, 0]}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color="green" />
        </mesh>
      ))}
      <mesh position={[circleCenter.x / 100, circleCenter.y / 100, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="blue" />
      </mesh>
    </>
  )
}

export default function ThreeCanvas(): JSX.Element {
  return (
    <Canvas>
      {/* <mesh>
        <boxGeometry args={[2, 2, 2]} />
        <meshNormalMaterial />
      </mesh> */}

      {/*  */}
      <Disc number={1}></Disc>

      <OrbitControls makeDefault />
      {/* <Movements /> */}

      <gridHelper />

      <axesHelper args={[5]} />
      <gridHelper rotation-x={Math.PI / 2} />
      <Stats />
    </Canvas>

    // <Canvas dpr={[1, 2]}>
    //   <Box position={[2, 2, 0]} />
    //   <Box />

    //
    // </Canvas>
  )
}
