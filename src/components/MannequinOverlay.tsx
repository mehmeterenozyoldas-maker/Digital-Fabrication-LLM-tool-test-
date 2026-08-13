import React, { useMemo } from "react";
import * as THREE from "three";

interface MannequinOverlayProps {
  shape: string; // "none" | "standard" | "athletic" | "hourglass" | "slim"
}

export default function MannequinOverlay({ shape }: MannequinOverlayProps) {
  if (shape === "none") return null;

  // Compute specific measurements based on toggled shape
  const props = useMemo(() => {
    switch (shape) {
      case "athlete":
      case "athletic":
        return {
          bustWidth: 2.7,
          bustDepth: 1.4,
          waistWidth: 1.7,
          waistDepth: 1.1,
          hipsWidth: 2.2,
          hipsDepth: 1.3,
          bustZ: 2.8,
          waistZ: 0.0,
          hipsZ: -2.0,
          shoulderWidth: 3.2,
          neckThickness: 0.22,
          glassColor: "#818cf8", // vibrant technical indigo for athletic profile
        };
      case "hourglass":
        return {
          bustWidth: 2.8,
          bustDepth: 1.6,
          waistWidth: 1.3,
          waistDepth: 0.95,
          hipsWidth: 2.7,
          hipsDepth: 1.6,
          bustZ: 2.8,
          waistZ: -0.2,
          hipsZ: -2.2,
          shoulderWidth: 2.8,
          neckThickness: 0.18,
          glassColor: "#ec4899", // deep couture pink for dramatic hourglass
        };
      case "slim":
      case "petite":
        return {
          bustWidth: 2.0,
          bustDepth: 1.1,
          waistWidth: 1.35,
          waistDepth: 0.9,
          hipsWidth: 1.9,
          hipsDepth: 1.1,
          bustZ: 2.7,
          waistZ: 0.0,
          hipsZ: -1.8,
          shoulderWidth: 2.4,
          neckThickness: 0.17,
          glassColor: "#14b8a6", // teal for slim silhouette
        };
      case "standard":
      default:
        return {
          bustWidth: 2.4,
          bustDepth: 1.3,
          waistWidth: 1.5,
          waistDepth: 1.0,
          hipsWidth: 2.3,
          hipsDepth: 1.4,
          bustZ: 2.8,
          waistZ: -0.1,
          hipsZ: -2.0,
          shoulderWidth: 2.8,
          neckThickness: 0.2,
          glassColor: "#a7f3d0", // soft mint/silver glass for standard dress form
        };
    }
  }, [shape]);

  // Constructing a procedural model in standard Three space:
  // Since our dress extends horizontally along the length of the Z-axis:
  // Z axis: Vertical placement (Head is at positive Z, Skirt is at negative Z)
  // X axis: Horizontal width
  // Y axis: Front-to-back depth (chest crest points towards positive Y)

  return (
    <group>
      {/* 1. Base Stand Form (Tall column representing the studio stand) */}
      {/* Pole goes along Z axis from Z = -5 to Z = -2 */}
      <mesh position={[0, -2.5, -3.5]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 3.5, 8]} />
        <meshStandardMaterial color="#2d2d30" roughness={0.3} metalness={0.9} />
      </mesh>
      {/* Heavy base stand plate at bottom of pole */}
      <mesh position={[0, -2.5, -5.2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.7, 0.7, 0.15, 12]} />
        <meshStandardMaterial color="#1a1a1c" roughness={0.4} metalness={0.8} />
      </mesh>

      {/* 2. Main Sculpture Torso Group */}
      {/* Head section */}
      <mesh position={[0, -1.0, 4.4]} rotation={[Math.PI / 2, 0, 0]}>
        <sphereGeometry args={[0.38, 12, 12]} />
        <meshStandardMaterial
          color={props.glassColor}
          transparent
          opacity={0.25}
          roughness={0.1}
          metalness={0.2}
          flatShading
        />
      </mesh>
      {/* Elegant Brass Head/Neck Cap on mannequin */}
      <mesh position={[0, -0.98, 4.75]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.18, 0.2, 12]} />
        <meshStandardMaterial color="#eab308" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Neck segment */}
      <mesh position={[0, -1.15, 3.95]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry
          args={[props.neckThickness, props.neckThickness + 0.05, 0.6, 12]}
        />
        <meshStandardMaterial
          color={props.glassColor}
          transparent
          opacity={0.3}
          roughness={0.2}
          flatShading
        />
      </mesh>

      {/* Shoulders & Chest */}
      <mesh
        position={[0, -1.3, 3.4]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[props.shoulderWidth / 2, props.bustDepth / 2, 0.5]}
      >
        <sphereGeometry args={[1, 14, 8]} />
        <meshStandardMaterial
          color={props.glassColor}
          transparent
          opacity={0.22}
          roughness={0.2}
          flatShading
        />
      </mesh>

      {/* Bust Group */}
      <mesh
        position={[0, -1.2, props.bustZ]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[props.bustWidth / 2, props.bustDepth / 2, 0.8]}
      >
        <cylinderGeometry args={[1, 0.8, 1, 16]} />
        <meshStandardMaterial
          color={props.glassColor}
          transparent
          opacity={0.2}
          roughness={0.15}
          flatShading
        />
      </mesh>

      {/* Waist Group */}
      <mesh
        position={[0, -1.35, props.waistZ]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[props.waistWidth / 2, props.waistDepth / 2, 0.8]}
      >
        <cylinderGeometry args={[0.9, 1.1, 1, 16]} />
        <meshStandardMaterial
          color={props.glassColor}
          transparent
          opacity={0.24}
          roughness={0.15}
          flatShading
        />
      </mesh>

      {/* Hips & Skirt Base */}
      <mesh
        position={[0, -1.25, props.hipsZ]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[props.hipsWidth / 2, props.hipsDepth / 2, 1.2]}
      >
        <cylinderGeometry args={[0.9, 1.3, 1, 16]} />
        <meshStandardMaterial
          color={props.glassColor}
          transparent
          opacity={0.22}
          roughness={0.2}
          flatShading
        />
      </mesh>

      {/* Sub-sculpture Wireframe Silhouette Overlay */}
      {/* Overlapping exact geometric copies in subtle wireframe for that professional high-fidelity blueprint aesthetic */}
      <group>
        <mesh position={[0, -1.0, 4.4]} rotation={[Math.PI / 2, 0, 0]}>
          <sphereGeometry args={[0.38, 12, 12]} />
          <meshBasicMaterial
            color={props.glassColor}
            wireframe
            transparent
            opacity={0.08}
          />
        </mesh>
        <mesh
          position={[0, -1.2, props.bustZ]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[props.bustWidth / 2, props.bustDepth / 2, 0.8]}
        >
          <cylinderGeometry args={[1, 0.8, 1, 16]} />
          <meshBasicMaterial
            color={props.glassColor}
            wireframe
            transparent
            opacity={0.06}
          />
        </mesh>
        <mesh
          position={[0, -1.35, props.waistZ]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[props.waistWidth / 2, props.waistDepth / 2, 0.8]}
        >
          <cylinderGeometry args={[0.9, 1.1, 1, 16]} />
          <meshBasicMaterial
            color={props.glassColor}
            wireframe
            transparent
            opacity={0.07}
          />
        </mesh>
        <mesh
          position={[0, -1.25, props.hipsZ]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[props.hipsWidth / 2, props.hipsDepth / 2, 1.2]}
        >
          <cylinderGeometry args={[0.9, 1.3, 1, 16]} />
          <meshBasicMaterial
            color={props.glassColor}
            wireframe
            transparent
            opacity={0.06}
          />
        </mesh>
      </group>
    </group>
  );
}
