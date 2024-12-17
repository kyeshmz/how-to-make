import { Text } from '@react-three/drei'

export default function Disc({ number }: { number: number }) {
  return (
    <mesh>
      <circleGeometry args={[0.5, 32, 32]} />
      <meshNormalMaterial />
      <Text position={[0, 0, 0.1]} fontSize={0.5} color="white">
        {number.toString()}
      </Text>
    </mesh>
  )
}
