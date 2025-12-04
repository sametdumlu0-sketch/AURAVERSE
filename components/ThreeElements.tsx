
import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float, Stars, Sparkles, useGLTF, Text3D, Center, Cloud } from '@react-three/drei';
import * as THREE from 'three';
import { Brand, Product } from '../types';

interface BrandPodMeshProps {
  brand: Brand;
  onClick: (brandId: string) => void;
}

export const BrandPodMesh: React.FC<BrandPodMeshProps> = ({ brand, onClick }) => {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  // Use config or defaults
  const wallColor = brand.podConfig?.wallColor || brand.color;
  const floorColor = brand.podConfig?.floorColor || '#222222';
  const intensity = brand.podConfig?.lightIntensity || 1;

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group 
      ref={meshRef} 
      position={new THREE.Vector3(...brand.position)}
      onClick={(e) => { e.stopPropagation(); onClick(brand.id); }}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; setHovered(true); }}
      onPointerOut={() => { document.body.style.cursor = 'auto'; setHovered(false); }}
    >
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        {/* Main Station Ring - OPTIMIZED GEOMETRY (reduced segments) */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[3, 0.2, 8, 48]} />
          <meshStandardMaterial color={brand.color} emissive={brand.color} emissiveIntensity={0.5} />
        </mesh>
        
        {/* Floor Platform - OPTIMIZED */}
        <mesh position={[0, -1, 0]}>
           <cylinderGeometry args={[2.8, 2.5, 0.5, 24]} />
           <meshStandardMaterial color={floorColor} metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Central Dome/Wall - OPTIMIZED */}
        <mesh>
          <sphereGeometry args={[1.5, 24, 24]} />
          <meshStandardMaterial 
            color={wallColor} 
            roughness={0.1} 
            metalness={0.9} 
            emissive={wallColor}
            emissiveIntensity={intensity * 0.2} 
          />
        </mesh>

        {/* Brand Label */}
        <Text
          position={[0, 3.5, 0]}
          fontSize={1}
          color={brand.color}
          anchorX="center"
          anchorY="middle"
          font="https://fonts.gstatic.com/s/rajdhani/v10/L1RYZPSJb7k_O1gnC9h_6K0.woff"
        >
          {brand.name}
        </Text>
        
        {/* Spot Light based on config */}
        <pointLight position={[0, 2, 0]} intensity={intensity} color={brand.color} distance={10} />
      </Float>
      
      {/* Local Particles */}
      <Sparkles count={30} scale={6} size={4} speed={0.4} opacity={0.5} color={brand.color} />
    </group>
  );
};

interface ProductMeshProps {
  product: Product;
  position: [number, number, number];
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

export const ProductMesh: React.FC<ProductMeshProps> = ({ product, position, onAddToCart, onViewDetails }) => {
  const ref = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  // Try to load GLB if URL exists (Placeholder logic)
  const { scene } = useGLTF(product.modelUrl || 'https://modelviewer.dev/shared-assets/models/Astronaut.glb');

  // Clone scene to avoid sharing instances
  const clonedScene = React.useMemo(() => scene.clone(), [scene]);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta;
    }
  });

  const Geometry = () => {
    switch(product.geometry) {
      case 'sphere': return <sphereGeometry args={[0.8, 24, 24]} />;
      case 'cone': return <coneGeometry args={[0.8, 1.6, 24]} />;
      case 'torus': return <torusGeometry args={[0.6, 0.2, 12, 32]} />;
      default: return <boxGeometry args={[1.2, 1.2, 1.2]} />;
    }
  };

  return (
    <group position={new THREE.Vector3(...position)}>
      <Float speed={4} rotationIntensity={1} floatIntensity={0.5}>
        <group 
          onClick={(e) => { 
             e.stopPropagation(); 
             onViewDetails(product); 
          }}
          onPointerOver={() => { document.body.style.cursor = 'pointer'; setHovered(true); }}
          onPointerOut={() => { document.body.style.cursor = 'auto'; setHovered(false); }}
        >
            {product.modelUrl ? (
                <primitive object={clonedScene} scale={0.5} />
            ) : (
                <mesh ref={ref}>
                    <Geometry />
                    <meshStandardMaterial 
                        color={product.color} 
                        metalness={0.8} 
                        roughness={0.2}
                        emissive={product.color}
                        emissiveIntensity={hovered ? 0.8 : 0.1}
                    />
                </mesh>
            )}
        </group>
        
        {/* Holographic Label */}
        <group position={[0, -1.5, 0]}>
             <mesh position={[0, 0, -0.1]}>
                <planeGeometry args={[2.5, 1]} />
                <meshBasicMaterial color="black" transparent opacity={0.6} />
             </mesh>
             <Text
                fontSize={0.25}
                color="white"
                anchorX="center"
                anchorY="middle"
                maxWidth={2.2}
                textAlign="center"
             >
                {product.name}
                {'\n'}
                {product.price} TKN
            </Text>
        </group>
      </Float>
    </group>
  );
};

export const UserAvatar = () => {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
      if(ref.current) {
          const t = state.clock.getElapsedTime();
          ref.current.position.x = Math.sin(t * 0.2) * 5;
          ref.current.position.z = Math.cos(t * 0.2) * 5 + 10;
          ref.current.position.y = Math.sin(t * 0.5) * 2;
          
          ref.current.rotation.y = t * 0.5;
          ref.current.rotation.z = Math.sin(t) * 0.2;
      }
  });

  return (
      <group ref={ref}>
          <Float speed={5} rotationIntensity={2} floatIntensity={2}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <coneGeometry args={[0.2, 1, 4]} />
                <meshStandardMaterial color="#00ffcc" emissive="#00ffcc" emissiveIntensity={0.8} wireframe />
            </mesh>
             <pointLight color="#00ffcc" distance={5} intensity={1} />
          </Float>
      </group>
  );
}

export const OtherUser = ({ position, name }: { position: [number, number, number], name: string }) => {
  return (
    <group position={new THREE.Vector3(...position)}>
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.8}>
         {/* Body - Capsule */}
         <mesh position={[0, 0.75, 0]}>
            <capsuleGeometry args={[0.3, 1.5, 4, 8]} />
            <meshStandardMaterial color="#374151" transparent opacity={0.8} roughness={0.3} metalness={0.8} />
         </mesh>
         
         {/* Visor - Glowing Eye */}
         <mesh position={[0, 1.25, 0.25]}>
            <boxGeometry args={[0.4, 0.1, 0.1]} />
            <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={2} />
         </mesh>
         
         {/* Hover Ring */}
         <mesh position={[0, -0.2, 0]} rotation={[Math.PI/2, 0, 0]}>
            <torusGeometry args={[0.4, 0.05, 8, 16]} />
            <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.5} />
         </mesh>

         {/* Name Tag */}
         <Text
            position={[0, 2.0, 0]}
            fontSize={0.2}
            color="#00ff00"
            anchorX="center"
            anchorY="bottom"
            font="https://fonts.gstatic.com/s/rajdhani/v10/L1RYZPSJb7k_O1gnC9h_6K0.woff"
         >
            {name}
         </Text>
      </Float>
    </group>
  );
};

export const AuraverseTitle3D = () => {
    const groupRef = useRef<THREE.Group>(null);
    const textOptions = {
        font: 'https://threejs.org/examples/fonts/helvetiker_bold.typeface.json',
        size: 3,
        height: 0.5,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.1,
        bevelSize: 0.05,
        bevelOffset: 0,
        bevelSegments: 5
    };

    useFrame((state) => {
        if(groupRef.current) {
            const { x, y } = state.pointer;
            // More dynamic tilt based on mouse
            groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -y * 0.3, 0.1);
            groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, x * 0.3 + (state.clock.elapsedTime * 0.15), 0.1);
        }
    });

    return (
        <group ref={groupRef} position={[0, 0, 0]}>
            <Center>
                <group>
                    <Text3D {...textOptions}>
                        AURAVERSE
                        <meshPhongMaterial color="#111111" specular="#00FFFF" shininess={100} />
                    </Text3D>
                    <Text3D {...textOptions}>
                        AURAVERSE
                        <meshBasicMaterial color="#00FFFF" wireframe transparent opacity={0.3} />
                    </Text3D>
                </group>
            </Center>
        </group>
    );
};

export const GalaxyBackground = () => {
  const outerStarsRef = useRef<THREE.Group>(null);
  const nebulaRef1 = useRef<THREE.Group>(null);
  const nebulaRef2 = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    // 1. Rotate Outer Stars (Slowest)
    if (outerStarsRef.current) {
        outerStarsRef.current.rotation.y -= delta * 0.01;
        outerStarsRef.current.rotation.z += delta * 0.005;
    }

    // 2. Rotate Spiral Arms (Nebulas) - Faster and opposing directions
    if (nebulaRef1.current) {
        nebulaRef1.current.rotation.y -= delta * 0.05; // Clockwise
        nebulaRef1.current.position.y = Math.sin(t * 0.2) * 2; // Floating effect
    }
    if (nebulaRef2.current) {
        nebulaRef2.current.rotation.y -= delta * 0.03; 
        nebulaRef2.current.rotation.x = Math.sin(t * 0.1) * 0.1; // Slight tilt
    }

    // 3. Pulse the Core
    if (coreRef.current) {
        const pulse = 1 + Math.sin(t * 2) * 0.1;
        coreRef.current.scale.set(pulse, pulse, pulse);
        // Random flicker logic could go here
    }
  });

  return (
    <group>
      <color attach="background" args={['#020205']} />
      <fog attach="fog" args={['#020205', 30, 150]} /> 

      {/* GALACTIC CORE */}
      <mesh ref={coreRef} position={[0, 0, 0]}>
        <sphereGeometry args={[4, 32, 32]} />
        <meshBasicMaterial color="#ffaa00" transparent opacity={0.8} />
        <pointLight color="#ffaa00" intensity={4} distance={60} decay={2} />
      </mesh>
      {/* Core Glow */}
      <mesh position={[0, 0, 0]}>
         <sphereGeometry args={[7, 32, 32]} />
         <meshBasicMaterial color="#ff5500" transparent opacity={0.15} blending={THREE.AdditiveBlending} side={THREE.BackSide} />
      </mesh>

      {/* LAYER 1: SPIRAL ARM (CYAN/BLUE) */}
      <group ref={nebulaRef1}>
        <Sparkles 
            count={2000} 
            scale={[80, 5, 80]} // Flattened disc shape
            size={6} 
            speed={0.4} 
            opacity={0.6} 
            color="#00FFFF" 
            noise={10} // More organic distribution
        />
        {/* Volumetric Clouds simulation using large transparent particles */}
         <Sparkles 
            count={200} 
            scale={[60, 10, 60]} 
            size={30} 
            speed={0.1} 
            opacity={0.1} 
            color="#0066ff" 
        />
      </group>

      {/* LAYER 2: SPIRAL ARM (MAGENTA/PURPLE) */}
      <group ref={nebulaRef2} rotation={[0, Math.PI / 2, 0]}>
        <Sparkles 
            count={1500} 
            scale={[70, 8, 70]} 
            size={5} 
            speed={0.3} 
            opacity={0.5} 
            color="#FF00FF" 
            noise={5}
        />
         <Sparkles 
            count={150} 
            scale={[50, 15, 50]} 
            size={25} 
            speed={0.2} 
            opacity={0.1} 
            color="#aa00ff" 
        />
      </group>

      {/* LAYER 3: DEEP SPACE STARS (Background) */}
      <group ref={outerStarsRef}>
        <Stars 
            radius={200} 
            depth={100} 
            count={8000} 
            factor={6} 
            saturation={1} 
            fade 
            speed={0.5} 
        />
      </group>

      {/* Ambient Fill */}
      <ambientLight intensity={0.05} />
    </group>
  );
};
