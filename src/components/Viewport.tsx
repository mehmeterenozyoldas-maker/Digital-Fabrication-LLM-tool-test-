import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid, Environment, Text } from "@react-three/drei";
import * as THREE from "three";
import {
  generateRelaxedMesh,
  generatePatternPanels,
  Panel,
  TopologyType,
  PatternType,
} from "../lib/geometry";
import MannequinOverlay from "./MannequinOverlay";
import { JointType } from "../lib/fabrication";

function TimberGrid({
  geometry,
  resolution,
}: {
  geometry: THREE.BufferGeometry;
  resolution: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  const materials = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#8b5a2b", roughness: 0.9 }),
    [],
  );

  const tubes = useMemo(() => {
    if (!geometry) return [];

    const pos = geometry.attributes.position;
    const vertsPerRow = resolution + 1;
    const lathCurves: THREE.CatmullRomCurve3[] = [];

    // Extract U-direction laths (rows)
    for (let r = 0; r < vertsPerRow; r++) {
      const pts: THREE.Vector3[] = [];
      for (let c = 0; c < vertsPerRow; c++) {
        const idx = r * vertsPerRow + c;
        if (idx < pos.count) {
          pts.push(
            new THREE.Vector3(pos.getX(idx), pos.getY(idx), pos.getZ(idx)),
          );
        }
      }
      if (pts.length >= 2) lathCurves.push(new THREE.CatmullRomCurve3(pts));
    }

    // Extract V-direction laths (cols)
    for (let c = 0; c < vertsPerRow; c++) {
      const pts: THREE.Vector3[] = [];
      for (let r = 0; r < vertsPerRow; r++) {
        const idx = r * vertsPerRow + c;
        if (idx < pos.count) {
          pts.push(
            new THREE.Vector3(pos.getX(idx), pos.getY(idx), pos.getZ(idx)),
          );
        }
      }
      if (pts.length >= 2) lathCurves.push(new THREE.CatmullRomCurve3(pts));
    }

    // Generate TubeGeometries (rectangular profile simulated via low radialSegments)
    return lathCurves.map((curve, index) => {
      // radius 0.05, 4 sides to simulate square timber strips
      return (
        <mesh
          key={`lath-${index}`}
          geometry={new THREE.TubeGeometry(curve, resolution, 0.04, 4, false)}
          material={materials}
          castShadow
          receiveShadow
        />
      );
    });
  }, [geometry, resolution, materials]);

  return <group ref={groupRef}>{tubes}</group>;
}

interface ViewportProps {
  resolution: number;
  curvature: number;
  iterations?: number;
  patternRadius?: number;
  patternGap?: number;
  patternType?: PatternType;
  topology?: TopologyType;
  waveX?: number;
  waveZ?: number;
  twistAngle?: number;
  pinchFactor?: number;
  showPanelIDs?: boolean;
  showUnderstructure?: boolean;
  showFabricationPreview?: boolean;
  materialThickness?: number;
  jointType?: JointType;
  onPanelsGenerated?: (panels: Panel[]) => void;
  onBaseGeometryGenerated?: (geometry: THREE.BufferGeometry) => void;
  mannequinShape?: string;
}

function GenerativeModel({
  resolution,
  curvature,
  iterations = 0,
  patternRadius = 0.6,
  patternGap = 0.05,
  patternType = "hexagon",
  topology = "saddle",
  waveX = 0,
  waveZ = 0,
  twistAngle = 0,
  pinchFactor = 0,
  showPanelIDs = false,
  showUnderstructure = false,
  showFabricationPreview = false,
  materialThickness = 2.0,
  jointType = "notch",
  onPanelsGenerated,
  onBaseGeometryGenerated,
  mannequinShape = "none",
}: ViewportProps) {
  const groupRef = useRef<THREE.Group>(null);

  // 1. Generate the relaxed base mesh geometry
  const baseGeometry = useMemo(() => {
    return generateRelaxedMesh(
      resolution,
      curvature,
      iterations,
      topology,
      mannequinShape,
      waveX,
      waveZ,
      twistAngle,
      pinchFactor,
    );
  }, [resolution, curvature, iterations, topology, mannequinShape, waveX, waveZ, twistAngle, pinchFactor]);

  // 2. Generate Panel objects (for geometry and for SVG export)
  const panels = useMemo(() => {
    return generatePatternPanels(
      baseGeometry,
      resolution,
      patternRadius,
      patternGap,
      patternType,
    );
  }, [baseGeometry, resolution, patternRadius, patternGap, patternType]);

  // Pass panels up to parent whenever they change
  useEffect(() => {
    if (onPanelsGenerated) {
      onPanelsGenerated(panels);
    }
  }, [panels, onPanelsGenerated]);

  useEffect(() => {
    if (onBaseGeometryGenerated) {
      onBaseGeometryGenerated(baseGeometry);
    }
  }, [baseGeometry, onBaseGeometryGenerated]);

  // 3. Generate the Hexagonal Pattern BufferGeometry from panels
  const patternGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const indices: number[] = [];
    let vertexOffset = 0;

    for (const panel of panels) {
      vertices.push(panel.center.x, panel.center.y, panel.center.z);
      const centerIndex = vertexOffset;
      vertexOffset++;

      const vertexCount = panel.vertices.length;
      for (let i = 0; i < vertexCount; i++) {
        const v = panel.vertices[i];
        vertices.push(v.x, v.y, v.z);
        vertexOffset++;
      }

      for (let i = 0; i < vertexCount; i++) {
        const nextI = (i + 1) % vertexCount;
        indices.push(centerIndex, centerIndex + 1 + i, centerIndex + 1 + nextI);
      }
    }

    geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, [panels]);

  // 4. Generate Thick Fabrication Preview Geometry (if enabled)
  const thickPatternGeometry = useMemo(() => {
    if (!showFabricationPreview) return null;
    const geo = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const indices: number[] = [];
    let vertexOffset = 0;

    // Use material thickness, scaled to roughly match 3D space.
    // E.g., if materialThickness is 2mm, let's map it to a reasonable visual thickness.
    const thickness = Math.max(0.02, materialThickness * 0.02);

    for (const panel of panels) {
      if (!panel || !panel.vertices || panel.vertices.length < 3) continue;

      // Calculate panel normal
      const v0 = panel.vertices[0];
      const v1 = panel.vertices[1];
      const v2 = panel.vertices[2];
      const e1 = new THREE.Vector3().subVectors(v1, v0);
      const e2 = new THREE.Vector3().subVectors(v2, v1);
      const normal = new THREE.Vector3().crossVectors(e1, e2).normalize();
      if (Number.isNaN(normal.x)) continue;
      // Normal might face inverse direction from center; let's enforce a consistently outward facing normal
      // We can use panel center vs global origin or just use current normal (usually they are consistently wound)
      if (normal.y < 0) normal.negate();

      const offsetVec = normal.clone().multiplyScalar(thickness / 2);

      // FRONT FACE
      const frontCenter = vertexOffset;
      const frontCenterPos = panel.center.clone().add(offsetVec);
      vertices.push(frontCenterPos.x, frontCenterPos.y, frontCenterPos.z);
      vertexOffset++;

      const vertexCount = panel.vertices.length;
      const frontVertexStart = vertexOffset;
      for (let i = 0; i < vertexCount; i++) {
        const v = panel.vertices[i].clone().add(offsetVec);
        vertices.push(v.x, v.y, v.z);
        vertexOffset++;
      }
      for (let i = 0; i < vertexCount; i++) {
        const nextI = (i + 1) % vertexCount;
        indices.push(
          frontCenter,
          frontVertexStart + i,
          frontVertexStart + nextI,
        );
      }

      // BACK FACE
      const backCenter = vertexOffset;
      const backCenterPos = panel.center.clone().sub(offsetVec);
      vertices.push(backCenterPos.x, backCenterPos.y, backCenterPos.z);
      vertexOffset++;

      const backVertexStart = vertexOffset;
      for (let i = 0; i < vertexCount; i++) {
        const v = panel.vertices[i].clone().sub(offsetVec);
        vertices.push(v.x, v.y, v.z);
        vertexOffset++;
      }
      for (let i = 0; i < vertexCount; i++) {
        const nextI = (i + 1) % vertexCount;
        // Reversed winding for back face
        indices.push(backCenter, backVertexStart + nextI, backVertexStart + i);
      }

      // SIDES (Edges connecting front and back)
      for (let i = 0; i < vertexCount; i++) {
        const nextI = (i + 1) % vertexCount;

        const f1 = frontVertexStart + i;
        const f2 = frontVertexStart + nextI;
        const b1 = backVertexStart + i;
        const b2 = backVertexStart + nextI;

        // Two triangles for the quad connecting f1, f2, b2, b1
        // normal outward based on edge
        indices.push(f1, b1, f2);
        indices.push(f2, b1, b2);
      }
    }

    if (vertices.length === 0) return null;

    geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, [panels, showFabricationPreview, materialThickness]);

  // 5. Generate Fabrication Joints (if enabled)
  const jointsGeometry = useMemo(() => {
    if (!showFabricationPreview) return null;

    const getHash = (v1: THREE.Vector3, v2: THREE.Vector3) => {
      const mx = (v1.x + v2.x) / 2;
      const my = (v1.y + v2.y) / 2;
      const mz = (v1.z + v2.z) / 2;
      return `${mx.toFixed(1)},${my.toFixed(1)},${mz.toFixed(1)}`;
    };

    const edgeMap = new Map<string, THREE.Vector3>();

    for (const panel of panels) {
      const count = panel.vertices.length;
      for (let i = 0; i < count; i++) {
        const v1 = panel.vertices[i];
        const v2 = panel.vertices[(i + 1) % count];
        const hash = getHash(v1, v2);

        if (!edgeMap.has(hash)) {
          // This is a shared edge (or an outward edge). For visualization,
          // we'll just put a joint symbol at every edge midpoint that isn't already logged.
          const mid = new THREE.Vector3()
            .addVectors(v1, v2)
            .multiplyScalar(0.5);
          edgeMap.set(hash, mid);
        }
      }
    }

    if (edgeMap.size === 0) return null;

    // Use InstancedMesh for performance
    const dummy = new THREE.Object3D();
    const instancedMatrix = new Float32Array(edgeMap.size * 16);
    let idx = 0;

    // Convert map to array to generate instanced matrices
    edgeMap.forEach((midpoint) => {
      dummy.position.copy(midpoint);
      dummy.updateMatrix();
      dummy.matrix.toArray(instancedMatrix, idx * 16);
      idx++;
    });

    const isNotch = jointType === "notch";
    const geometry = isNotch
      ? new THREE.BoxGeometry(0.1, 0.1, 0.1) // Small cube for notch preview
      : new THREE.CylinderGeometry(0.04, 0.04, 0.15, 8); // Small cylinder for rivet

    // Rotate cylinder so it's roughly perpendicular (not perfect due to missing normals, but aesthetic)
    if (!isNotch) {
      geometry.rotateX(Math.PI / 2);
    }

    // Provide the instanced matrices via InstancedBufferAttribute
    const instancedGeometry = new THREE.InstancedBufferGeometry();
    instancedGeometry.index = geometry.index;
    instancedGeometry.attributes = geometry.attributes;
    instancedGeometry.setAttribute(
      "instanceMatrix",
      new THREE.InstancedBufferAttribute(instancedMatrix, 16),
    );

    return instancedGeometry;
  }, [panels, showFabricationPreview, jointType]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* 3D Mannequin Couture Overlay for Drape & Fitting visualization */}
      <MannequinOverlay shape={mannequinShape} />

      {/* Base Relaxed Surface (Ghosted / Under-Structure) */}
      <mesh geometry={baseGeometry} castShadow receiveShadow>
        <meshStandardMaterial
          color="#333333"
          transparent
          opacity={showUnderstructure ? 0.4 : 0.15}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Parametric Timber Under-Structure */}
      {showUnderstructure && (
        <TimberGrid geometry={baseGeometry} resolution={resolution} />
      )}

      {/* Structural Pattern Panels */}
      <mesh
        geometry={
          showFabricationPreview && thickPatternGeometry
            ? thickPatternGeometry
            : patternGeometry
        }
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={showFabricationPreview ? "#b8b8b8" : "#d4d4d8"}
          roughness={0.6}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
        {/* Wireframe overlay on pattern */}
        <mesh
          geometry={
            showFabricationPreview && thickPatternGeometry
              ? thickPatternGeometry
              : patternGeometry
          }
        >
          <meshBasicMaterial
            color="#52525b"
            wireframe={true}
            transparent
            opacity={0.3}
          />
        </mesh>
      </mesh>

      {/* Fabrication Joints Prefix */}
      {showFabricationPreview && jointsGeometry && (
        <mesh geometry={jointsGeometry}>
          <meshStandardMaterial
            color={jointType === "notch" ? "#ff5555" : "#55aaff"}
            roughness={0.4}
            metalness={0.5}
          />
        </mesh>
      )}

      {/* Panel IDs */}
      {showPanelIDs &&
        panels.map((panel) => {
          if (!panel || !panel.vertices || panel.vertices.length < 3)
            return null;
          try {
            // Calculate panel normal
            const v0 = panel.vertices[0];
            const v1 = panel.vertices[1];
            const v2 = panel.vertices[2];
            if (!v0 || !v1 || !v2) return null;

            const e1 = new THREE.Vector3().subVectors(v1, v0);
            const e2 = new THREE.Vector3().subVectors(v2, v1);
            const n = new THREE.Vector3().crossVectors(e1, e2).normalize();
            if (Number.isNaN(n.x)) return null; // Check for invalid normal
            if (n.y < 0) n.negate();

            // Quat to rotate text from facing +Z to matching normal
            const rot = new THREE.Quaternion().setFromUnitVectors(
              new THREE.Vector3(0, 0, 1),
              n,
            );
            const euler = new THREE.Euler().setFromQuaternion(rot);

            // Push text slightly out from the panel surface
            const pos = panel.center
              .clone()
              .add(n.clone().multiplyScalar(0.05));

            return (
              <Text
                key={panel.id}
                position={[pos.x, pos.y, pos.z]}
                rotation={euler}
                fontSize={0.2}
                color="#111111"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.01}
                outlineColor="#d4d4d8"
              >
                {panel.id}
              </Text>
            );
          } catch (e) {
            console.error("Text generation failed", e);
            return null;
          }
        })}
    </group>
  );
}

export default function Viewport(props: ViewportProps) {
  return (
    <div className="w-full h-full bg-transparent">
      <Canvas shadows camera={{ position: [12, 10, 12], fov: 45 }}>
        <color attach="background" args={["#151515"]} />

        {/* Studio Lighting Setup */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 15, -10]}
          intensity={1.2}
          color="#ffffff"
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <pointLight position={[-10, 5, 10]} intensity={0.6} color="#e0f2fe" />
        <Environment preset="city" />

        <GenerativeModel {...props} />

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          autoRotate={false}
          dampingFactor={0.05}
        />

        <Grid
          infiniteGrid
          fadeDistance={50}
          sectionColor="#2a2a2a"
          cellColor="#1a1a1a"
          cellSize={1}
          sectionSize={5}
        />
      </Canvas>
    </div>
  );
}
