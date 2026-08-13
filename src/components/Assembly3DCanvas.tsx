import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Html } from "@react-three/drei";
import * as THREE from "three";
import { Panel } from "../lib/geometry";

interface Assembly3DCanvasProps {
  panels: Panel[];
  currentStep: number;
  explodedDistance: number;
  materialThickness: number;
  showAllGhosted: boolean;
  onSelectPanel?: (index: number) => void;
}

// Single Panel Mesh Component in R3F
function AssemblyPanelMesh({
  panel,
  index,
  currentStep,
  explodedDistance,
  materialThickness,
  showAllGhosted,
  onSelectPanel,
}: {
  panel: Panel;
  index: number;
  currentStep: number;
  explodedDistance: number;
  materialThickness: number;
  showAllGhosted: boolean;
  onSelectPanel?: (index: number) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const pulseRef = useRef<THREE.Mesh>(null);

  const isActive = index === currentStep - 1;
  const isAssembled = index < currentStep;
  const isFuture = index >= currentStep;

  // Animate active panel pulse
  useFrame(({ clock }) => {
    if (isActive && pulseRef.current) {
      const t = clock.getElapsedTime();
      const scale = 1.0 + Math.sin(t * 6) * 0.03;
      pulseRef.current.scale.set(scale, scale, scale);
    }
  });

  // Calculate panel normal and exploded center
  const { geometry, edgesGeometry, normal, explodedCenter } = useMemo(() => {
    if (!panel || !panel.vertices || panel.vertices.length < 3) {
      return { geometry: null, edgesGeometry: null, normal: new THREE.Vector3(0, 1, 0), explodedCenter: new THREE.Vector3() };
    }

    const v0 = panel.vertices[0];
    const v1 = panel.vertices[1];
    const v2 = panel.vertices[2];
    const e1 = new THREE.Vector3().subVectors(v1, v0);
    const e2 = new THREE.Vector3().subVectors(v2, v1);
    const norm = new THREE.Vector3().crossVectors(e1, e2).normalize();
    if (Number.isNaN(norm.x)) norm.set(0, 1, 0);

    // Center offset from origin
    const distFromOrigin = panel.center.length();
    const explodeVec = norm.clone().multiplyScalar(explodedDistance * 2.5);
    const expCenter = panel.center.clone().add(explodeVec);

    const thickness = Math.max(0.04, materialThickness * 0.02);
    const halfThick = thickness / 2;

    const vertices: number[] = [];
    const indices: number[] = [];
    let vertexOffset = 0;

    const vCount = panel.vertices.length;

    // Local vertex coordinates relative to panel center (with explosion vector)
    const localVertices = panel.vertices.map((v) => v.clone().sub(panel.center));

    // Front face (+halfThick * norm)
    const frontCenterIdx = vertexOffset++;
    const frontCenterPos = explodeVec.clone().add(norm.clone().multiplyScalar(halfThick));
    vertices.push(frontCenterPos.x, frontCenterPos.y, frontCenterPos.z);

    const frontStartIdx = vertexOffset;
    localVertices.forEach((lv) => {
      const pos = lv.clone().add(explodeVec).add(norm.clone().multiplyScalar(halfThick));
      vertices.push(pos.x, pos.y, pos.z);
      vertexOffset++;
    });

    for (let i = 0; i < vCount; i++) {
      const nextI = (i + 1) % vCount;
      indices.push(frontCenterIdx, frontStartIdx + i, frontStartIdx + nextI);
    }

    // Back face (-halfThick * norm)
    const backCenterIdx = vertexOffset++;
    const backCenterPos = explodeVec.clone().sub(norm.clone().multiplyScalar(halfThick));
    vertices.push(backCenterPos.x, backCenterPos.y, backCenterPos.z);

    const backStartIdx = vertexOffset;
    localVertices.forEach((lv) => {
      const pos = lv.clone().add(explodeVec).sub(norm.clone().multiplyScalar(halfThick));
      vertices.push(pos.x, pos.y, pos.z);
      vertexOffset++;
    });

    for (let i = 0; i < vCount; i++) {
      const nextI = (i + 1) % vCount;
      // Invert winding for back face
      indices.push(backCenterIdx, backStartIdx + nextI, backStartIdx + i);
    }

    // Side wall quads
    for (let i = 0; i < vCount; i++) {
      const nextI = (i + 1) % vCount;
      const f1 = frontStartIdx + i;
      const f2 = frontStartIdx + nextI;
      const b1 = backStartIdx + i;
      const b2 = backStartIdx + nextI;

      indices.push(f1, b1, f2);
      indices.push(f2, b1, b2);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    const edges = new THREE.EdgesGeometry(geo);

    return {
      geometry: geo,
      edgesGeometry: edges,
      normal: norm,
      explodedCenter: expCenter,
    };
  }, [panel, explodedDistance, materialThickness]);

  if (!geometry || !edgesGeometry) return null;

  // Decide material styling based on state
  let mainColor = "#38bdf8"; // cyan default
  let opacity = 0.85;
  let transparent = true;
  let wireframe = false;

  if (isActive) {
    mainColor = "#00ffcc"; // glowing bright neon cyan/emerald
    opacity = 1.0;
  } else if (isAssembled) {
    mainColor = "#334155"; // assembled steel/wood tone slate
    opacity = 0.9;
    transparent = false;
  } else if (isFuture) {
    if (!showAllGhosted) return null; // hide future if ghosting disabled
    mainColor = "#1e293b";
    opacity = 0.15;
    wireframe = false;
  }

  return (
    <group position={[panel.center.x, panel.center.y, panel.center.z]}>
      {/* Panel Solid Mesh */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        onClick={(e) => {
          e.stopPropagation();
          onSelectPanel?.(index);
        }}
      >
        <meshStandardMaterial
          color={mainColor}
          transparent={transparent}
          opacity={opacity}
          roughness={isActive ? 0.2 : 0.4}
          metalness={isActive ? 0.8 : 0.2}
          wireframe={wireframe}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Edge Wireframe Outlines */}
      <lineSegments geometry={edgesGeometry}>
        <lineBasicMaterial
          color={isActive ? "#00ffff" : isAssembled ? "#64748b" : "#334155"}
          linewidth={isActive ? 2 : 1}
          transparent={transparent}
          opacity={isActive ? 1.0 : isFuture ? 0.2 : 0.6}
        />
      </lineSegments>

      {/* Active Panel Pulsing Outer Highlight Frame */}
      {isActive && (
        <mesh ref={pulseRef} geometry={geometry}>
          <meshBasicMaterial
            color="#00ffcc"
            wireframe
            transparent
            opacity={0.4}
          />
        </mesh>
      )}

      {/* Joint Indicator Spheres on Vertices for Active Panel */}
      {isActive &&
        panel.vertices.map((v, vIdx) => {
          const locV = v.clone().sub(panel.center);
          return (
            <mesh key={vIdx} position={[locV.x, locV.y, locV.z]}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshBasicMaterial color="#38f9d7" />
            </mesh>
          );
        })}

      {/* 3D Label Badge floating above Active Panel */}
      {isActive && (
        <Html position={[0, 0.4, 0]} center distanceFactor={12}>
          <div className="bg-emerald-950/90 border border-emerald-400 text-emerald-300 font-mono text-[10px] px-2 py-0.5 rounded shadow-lg backdrop-blur whitespace-nowrap animate-pulse flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>MODULE P-{index} (ACTIVE LOCK)</span>
          </div>
        </Html>
      )}
    </group>
  );
}

export default function Assembly3DCanvas({
  panels,
  currentStep,
  explodedDistance,
  materialThickness,
  showAllGhosted = true,
  onSelectPanel,
}: Assembly3DCanvasProps) {
  return (
    <div className="w-full h-full relative bg-[#0b0b0d]">
      <Canvas
        camera={{ position: [8, 8, 12], fov: 45 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={["#0a0a0c"]} />
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 15, 10]} intensity={1.2} />
        <directionalLight position={[-10, -10, -10]} intensity={0.4} color="#38bdf8" />
        <pointLight position={[0, 5, 0]} intensity={0.8} color="#00ffcc" />

        <gridHelper args={[20, 20, "#222228", "#141418"]} position={[0, -2, 0]} />

        <group position={[0, 0, 0]}>
          {panels.map((panel, idx) => (
            <AssemblyPanelMesh
              key={panel.id || idx}
              panel={panel}
              index={idx}
              currentStep={currentStep}
              explodedDistance={explodedDistance}
              materialThickness={materialThickness}
              showAllGhosted={showAllGhosted}
              onSelectPanel={onSelectPanel}
            />
          ))}
        </group>

        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2 + 0.1}
          minDistance={2}
          maxDistance={35}
        />
      </Canvas>
    </div>
  );
}
