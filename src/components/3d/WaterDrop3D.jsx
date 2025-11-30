import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sphere, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

// Floating water droplet
function WaterDroplet({ position }) {
    const meshRef = useRef()
    const speed = useRef(Math.random() * 0.5 + 0.5)
    const amplitude = useRef(Math.random() * 2 + 1)

    useFrame((state) => {
        if (meshRef.current) {
            const time = state.clock.elapsedTime
            // Floating animation
            meshRef.current.position.y = position[1] + Math.sin(time * speed.current) * amplitude.current
            // Gentle rotation
            meshRef.current.rotation.x = time * 0.2
            meshRef.current.rotation.y = time * 0.3
        }
    })

    return (
        <Sphere ref={meshRef} args={[1, 32, 32]} position={position}>
            <MeshDistortMaterial
                color="#4F46E5"
                attach="material"
                distort={0.4}
                speed={2}
                roughness={0}
                metalness={0.8}
                transparent
                opacity={0.6}
            />
        </Sphere>
    )
}

// Collection of floating droplets
function WaterDroplets() {
    const droplets = [
        [-8, 3, -5],
        [8, -2, -8],
        [-6, -4, -3],
        [4, 5, -6],
        [0, 0, -10],
        [-3, 6, -4],
        [6, -3, -7],
    ]

    return (
        <>
            {droplets.map((position, index) => (
                <WaterDroplet key={index} position={position} />
            ))}
        </>
    )
}

// Main 3D Scene Component
const WaterDrop3D = () => {
    return (
        <Canvas
            camera={{ position: [0, 0, 10], fov: 50 }}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        >
            {/* Lighting */}
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#7C3AED" />

            {/* Water Droplets */}
            <WaterDroplets />
        </Canvas>
    )
}

export default WaterDrop3D
