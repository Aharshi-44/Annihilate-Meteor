import React, { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html, Environment, useTexture } from '@react-three/drei';
import * as THREE from 'three';

function Meteor({ onImpact, targetPosition = [0, 0, 0], enableEffects, impacted }) {
  const ref = useRef();
  const velocity = useMemo(() => ({ x: -0.04, y: -0.02, z: -0.06 }), []);
  const trailRef = useRef([]);
  const mutatedRef = useRef(false);

  useFrame(() => {
    if (!ref.current) return;
    if (impacted) return; // stop updating after impact
    // slow rotation for realism
    ref.current.rotation.x += 0.01;
    ref.current.rotation.y += 0.007;
    ref.current.position.x += velocity.x;
    ref.current.position.y += velocity.y;
    ref.current.position.z += velocity.z;

    const dx = ref.current.position.x - targetPosition[0];
    const dy = ref.current.position.y - targetPosition[1];
    const dz = ref.current.position.z - targetPosition[2];
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (dist < 1.2) {
      // Pass current position so caller computes crater location
      onImpact?.(ref.current.position.clone());
    }

    // Simple trail of afterimages
    if (enableEffects) {
      trailRef.current.unshift(ref.current.position.clone());
      if (trailRef.current.length > 20) trailRef.current.pop();
    } else {
      trailRef.current = [];
    }
  });

  return (
    <group>
      <mesh ref={ref} position={[8, 4, 12]} visible={!impacted}
        onUpdate={(m) => {
          if (mutatedRef.current) return;
          const geom = m.geometry;
          if (!geom.attributes?.position) return;
          const pos = geom.attributes.position;
          for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            const z = pos.getZ(i);
            const v = new THREE.Vector3(x, y, z);
            const n = v.clone().normalize();
            const noise = (Math.sin(i * 12.9898) * 43758.5453) % 1; // deterministic pseudo-random
            const scale = 1 + (noise - 0.5) * 0.35; // +/- 17.5%
            const v2 = n.multiplyScalar(0.5 * scale); // base radius 0.5
            pos.setXYZ(i, v2.x, v2.y, v2.z);
          }
          pos.needsUpdate = true;
          geom.computeVertexNormals();
          mutatedRef.current = true;
        }}
      >
        <icosahedronGeometry args={[0.5, 2]} />
        <meshStandardMaterial color="#6b5f52" roughness={1} metalness={0} flatShading />
        <pointLight intensity={2.2} color="#ff8c00" distance={8} decay={2} />
      </mesh>
      {enableEffects && trailRef.current.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.12 * Math.max(0.1, 1 - i / 20), 8, 8]} />
          <meshBasicMaterial color="#665a50" transparent opacity={Math.max(0, 0.35 - i * 0.02)} />
        </mesh>
      ))}
    </group>
  );
}

function Earth({ crater }) {
  const ref = useRef();
  const [colorMap, normalMap, specMap] = useTexture([
    // Public domain/example textures
    'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg',
    'https://threejs.org/examples/textures/planets/earth_normal_2048.jpg',
    'https://threejs.org/examples/textures/planets/earth_specular_2048.jpg'
  ]);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.02;
    }
  });
  return (
    <group>
      {/* Earth sphere */}
      <mesh ref={ref} castShadow receiveShadow>
        <sphereGeometry args={[3, 96, 96]} />
        <meshStandardMaterial map={colorMap} normalMap={normalMap} roughness={0.9} metalness={0.0} />
      </mesh>
      {/* Simple atmosphere glow */}
      <mesh scale={1.03}>
        <sphereGeometry args={[3, 96, 96]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          side={THREE.BackSide}
          uniforms={{
            c: { value: 0.6 },
            p: { value: 2.0 },
            glowColor: { value: new THREE.Color('#6ec8ff') }
          }}
          vertexShader={`
            varying vec3 vNormal;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            varying vec3 vNormal;
            uniform vec3 glowColor;
            uniform float c;
            uniform float p;
            void main() {
              float intensity = pow(c - dot(vNormal, vec3(0.0, 0.0, 1.0)), p);
              gl_FragColor = vec4(glowColor, 0.25 * intensity);
            }
          `}
        />
      </mesh>

      {/* Crater decal (appears after impact) */}
      {crater && (
        <group position={crater.position}>
          {/* Dark center */}
          <mesh
            onUpdate={(m) => {
              // Orient the crater so its normal points away from earth center
              const outward = crater.position.clone().normalize();
              m.lookAt(crater.position.clone().add(outward));
            }}
          >
            <circleGeometry args={[0.5, 32]} />
            <meshStandardMaterial color="#1a1a1a" roughness={1} metalness={0} />
          </mesh>
          {/* Rim */}
          <mesh
            onUpdate={(m) => {
              const outward = crater.position.clone().normalize();
              m.lookAt(crater.position.clone().add(outward));
            }}
          >
            <ringGeometry args={[0.5, 0.7, 32]} />
            <meshStandardMaterial color="#553300" emissive="#331a00" emissiveIntensity={0.2} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}
    </group>
  );
}

export default function EarthImpact3D({ onClose }) {
  const [enableEffects, setEnableEffects] = useState(true);
  const [flash, setFlash] = useState(false);
  const [highRes, setHighRes] = useState(true);
  const [impacted, setImpacted] = useState(false);
  const [crater, setCrater] = useState(null);

  const handleImpact = (impactPos) => {
    if (!enableEffects) return;
    setFlash(true);
    setTimeout(() => setFlash(false), 180);
    // Compute crater position on earth surface along impact direction
    const direction = impactPos.clone().normalize();
    const craterPos = direction.multiplyScalar(3.02); // slightly above surface
    setCrater({ position: craterPos });
    setImpacted(true);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/90">
      <Canvas
        className="h-full w-full"
        shadows
        dpr={[1, highRes ? 2 : 1]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ position: [10, 6, 14], fov: 50 }}
        onCreated={({ gl, scene }) => {
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.0;
          scene.background = new THREE.Color('#03050a');
        }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 12, 6]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <Environment preset="sunset" />
        <Stars radius={150} depth={60} count={4000} factor={3} saturation={0} fade />

        <group position={[0, 0, 0]}>
          <Earth crater={crater} />
          <Meteor onImpact={handleImpact} targetPosition={[0, 0, 0]} enableEffects={enableEffects} impacted={impacted} />
        </group>

        {/* Postprocessing temporarily disabled for stability */}

        <OrbitControls enablePan={false} maxDistance={30} minDistance={6} enableDamping dampingFactor={0.05} />

        <Html position={[0, -4.2, 0]} center>
          <div className="flex gap-2">
            <button onClick={() => setEnableEffects((v) => !v)} className="px-3 py-1.5 bg-white/10 text-white rounded border border-white/20">
              {enableEffects ? 'Disable Effects' : 'Enable Effects'}
            </button>
            <button onClick={() => setHighRes((v) => !v)} className="px-3 py-1.5 bg-white/10 text-white rounded border border-white/20">
              {highRes ? 'Performance Mode' : 'Quality Mode'}
            </button>
            <button onClick={onClose} className="px-3 py-1.5 bg-white/10 text-white rounded border border-white/20">
              Close 3D View
            </button>
          </div>
        </Html>
      </Canvas>
      {flash && (
        <div className="absolute inset-0 bg-white/30 pointer-events-none"></div>
      )}
    </div>
  );
}


