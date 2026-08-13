import * as THREE from "three";

export function getInterpolatedY(
  x: number,
  z: number,
  posAttribute: THREE.BufferAttribute,
  resolution: number,
) {
  const u = ((x + 5) / 10) * resolution;
  const v = ((z + 5) / 10) * resolution;

  const u0 = Math.max(0, Math.min(Math.floor(u), resolution));
  const v0 = Math.max(0, Math.min(Math.floor(v), resolution));
  const u1 = Math.max(0, Math.min(u0 + 1, resolution));
  const v1 = Math.max(0, Math.min(v0 + 1, resolution));

  const du = u - u0;
  const dv = v - v0;

  const vertsPerRow = resolution + 1;
  const y00 = posAttribute.getY(v0 * vertsPerRow + u0);
  const y10 = posAttribute.getY(v0 * vertsPerRow + u1);
  const y01 = posAttribute.getY(v1 * vertsPerRow + u0);
  const y11 = posAttribute.getY(v1 * vertsPerRow + u1);

  const y0 = y00 * (1 - du) + y10 * du;
  const y1 = y01 * (1 - du) + y11 * du;

  return y0 * (1 - dv) + y1 * dv;
}

export type TopologyType =
  | "saddle"
  | "catenoid"
  | "enneper"
  | "monkey_saddle"
  | "scherk"
  | "helicoid"
  | "lounge_chair"
  | "bench"
  | "pavilion"
  | "lamp_pendant"
  | "lamp_tulip"
  | "lamp_mushroom"
  | "hourglass_gown"
  | "peplum_bodice"
  | "slant_dress"
  | "origami_pleats"
  | "faceted_armor"
  | "voronoi_cantilever"
  | "gyroid_table"
  | "hyperbolic_shell"
  | "schwarz_p"
  | "schwarz_d"
  | "costa_surface"
  | "mobius_strip"
  | "stadium_canopy";
export type PatternType = "hexagon" | "triangle";

export function generateRelaxedMesh(
  resolution: number,
  curvature: number,
  iterations: number,
  topology: TopologyType = "saddle",
  mannequinShape: string = "none",
  waveX: number = 0,
  waveZ: number = 0,
  twistAngle: number = 0,
  pinchFactor: number = 0,
) {
  const geo = new THREE.PlaneGeometry(10, 10, resolution, resolution);
  geo.rotateX(-Math.PI / 2);

  const posAttribute = geo.attributes.position;
  const vertsPerRow = resolution + 1;

  const isDirectParametric =
    topology === "hourglass_gown" ||
    topology === "peplum_bodice" ||
    topology === "slant_dress" ||
    topology === "origami_pleats" ||
    topology === "faceted_armor" ||
    topology === "voronoi_cantilever" ||
    topology === "gyroid_table" ||
    topology === "hyperbolic_shell" ||
    topology === "schwarz_p" ||
    topology === "schwarz_d" ||
    topology === "costa_surface" ||
    topology === "mobius_strip" ||
    topology === "stadium_canopy";

  // Base key heights of the mannequin
  let bustZ = 2.8;
  let waistZ = -0.1;
  let hipsZ = -2.0;

  // Key half-width (Radius X) measurements
  let bustW = 1.2;
  let waistW = 0.75;
  let hipsW = 1.15;

  // Key half-depth (Radius Y) measurements
  let bustD = 0.65;
  let waistD = 0.5;
  let hipsD = 0.7;

  // Key Center-Y positions
  let bustY = -1.2;
  let waistY = -1.35;
  let hipsY = -1.25;

  if (mannequinShape === "athlete" || mannequinShape === "athletic") {
    bustW = 1.35;
    bustD = 0.7;
    bustY = -1.2;
    waistW = 0.85;
    waistD = 0.55;
    waistY = -1.35;
    hipsW = 1.1;
    hipsD = 0.65;
    hipsY = -1.25;
    bustZ = 2.8;
    waistZ = 0.0;
    hipsZ = -2.0;
  } else if (mannequinShape === "hourglass") {
    bustW = 1.4;
    bustD = 0.8;
    bustY = -1.2;
    waistW = 0.65;
    waistD = 0.475;
    waistY = -1.35;
    hipsW = 1.35;
    hipsD = 0.8;
    hipsY = -1.25;
    bustZ = 2.8;
    waistZ = -0.2;
    hipsZ = -2.2;
  } else if (mannequinShape === "slim" || mannequinShape === "petite") {
    bustW = 1.0;
    bustD = 0.55;
    bustY = -1.2;
    waistW = 0.675;
    waistD = 0.45;
    waistY = -1.35;
    hipsW = 0.95;
    hipsD = 0.55;
    hipsY = -1.25;
    bustZ = 2.7;
    waistZ = 0.0;
    hipsZ = -1.8;
  }

  // Smooth interpolation helper function to conform the fabric exactly to body coordinates
  const getBodyRadius = (currentZ: number) => {
    let W = waistW;
    let D = waistD;
    let Yc = waistY;

    if (currentZ >= bustZ) {
      const t = Math.min(1.0, (currentZ - bustZ) / 2.2);
      W = bustW + t * (1.1 - bustW);
      D = bustD - t * 0.2;
      Yc = bustY - t * 0.05;
    } else if (currentZ > waistZ) {
      const t = (currentZ - waistZ) / (bustZ - waistZ);
      W = waistW + t * (bustW - waistW);
      D = waistD + t * (bustD - waistD);
      Yc = waistY + t * (bustY - waistY);
    } else if (currentZ > hipsZ) {
      const t = (currentZ - hipsZ) / (waistZ - hipsZ);
      W = hipsW + t * (waistW - hipsW);
      D = hipsD + t * (waistD - hipsD);
      Yc = hipsY + t * (waistY - hipsY);
    } else {
      // Skirt / hem flaring below hips
      const t = (hipsZ - currentZ) / 3.0;
      W = hipsW + t * 2.1;
      D = hipsD + t * 1.6;
      Yc = hipsY;
    }
    return { W, D, Yc };
  };

  for (let i = 0; i < vertsPerRow; i++) {
    for (let j = 0; j < vertsPerRow; j++) {
      const idx = i * vertsPerRow + j;
      const x = posAttribute.getX(idx);
      const z = posAttribute.getZ(idx);

      const isBoundary =
        i === 0 || i === vertsPerRow - 1 || j === 0 || j === vertsPerRow - 1;

      if (isBoundary || isDirectParametric) {
        let y = 0;
        if (topology === "saddle") {
          y = (Math.pow(x / 5, 2) - Math.pow(z / 5, 2)) * curvature * 3;
        } else if (topology === "catenoid") {
          const r = Math.sqrt(x * x + z * z);
          y = curvature * 3 * (Math.cosh(r / 3) - 1);
        } else if (topology === "enneper") {
          const u = x / 3;
          const v = z / 3;
          y = (Math.pow(u, 3) - 3 * u * Math.pow(v, 2)) * curvature * 0.5;
        } else if (topology === "monkey_saddle") {
          const u = x / 4;
          const v = z / 4;
          y = (Math.pow(u, 3) - 3 * u * Math.pow(v, 2)) * curvature * 1.5;
        } else if (topology === "scherk") {
          const c = 2.0;
          const cx = Math.cos(x / c);
          const cz = Math.cos(z / c);
          const ratio = Math.max(
            0.01,
            Math.min(100, Math.abs(cx) / Math.max(0.01, Math.abs(cz))),
          );
          y = Math.log(ratio) * curvature * 2.5;
        } else if (topology === "helicoid") {
          const theta = Math.atan2(z, x);
          y = theta * curvature * 4.0;
        } else if (topology === "lounge_chair") {
          const zNorm = z / 5;
          const profileY =
            Math.sin((zNorm - 0.5) * Math.PI) * 2.5 - zNorm * 1.5;
          const sideY = Math.pow(x / 5, 2) * 2.0;
          y = (profileY + sideY) * curvature;
        } else if (topology === "bench") {
          const xNorm = x / 5;
          const zNorm = z / 5;
          const waveY = Math.sin(xNorm * Math.PI * 1.5) * 1.5;
          const rollY = -Math.pow(zNorm, 4) * 4.0 + Math.pow(zNorm, 2) * 1.0;
          y = (waveY + rollY) * curvature * 1.5;
        } else if (topology === "pavilion") {
          const rSq = Math.pow(x / 5, 2) + Math.pow(z / 5, 2);
          const dome = (1 - rSq) * 4.0;
          const arches =
            (Math.cos((x / 5) * Math.PI) + Math.cos((z / 5) * Math.PI)) * 1.5;
          y = (dome + arches) * curvature;
        } else if (topology === "lamp_pendant") {
          const r = Math.sqrt(Math.pow(x / 5, 2) + Math.pow(z / 5, 2));
          const bell = 6.0 * Math.exp(-Math.pow(r * 2.5, 2));
          const waves = Math.sin(Math.atan2(z, x) * 6) * 0.5 * r;
          y = (bell + waves - 3.0) * curvature;
        } else if (topology === "lamp_tulip") {
          const r = Math.sqrt(Math.pow(x / 5, 2) + Math.pow(z / 5, 2));
          const angle = Math.atan2(z, x);
          const trumpet = Math.pow(r, 2.5) * 5.0;
          const petals = Math.cos(angle * 6) * Math.pow(r, 2) * 1.2;
          y = (trumpet + petals - 2.5) * curvature;
        } else if (topology === "lamp_mushroom") {
          const r = Math.sqrt(Math.pow(x / 5, 2) + Math.pow(z / 5, 2));
          const angle = Math.atan2(z, x);
          let dome = 0;
          if (r < 1) {
            dome = Math.pow(1 - Math.pow(r, 2), 0.7) * 4.0;
          } else {
            dome = (1 - r) * 8.0;
          }
          const ribs = Math.cos(angle * 16) * 0.08 * (r < 1 ? r : 1);
          y = (dome + ribs - 1.5) * curvature;
        } else if (topology === "hourglass_gown") {
          const { W, D, Yc } = getBodyRadius(z);
          const xClamped = Math.max(-W, Math.min(W, x));
          const wrap = Math.max(0, 1 - Math.pow(xClamped / W, 2));
          const base = Yc + D * Math.sqrt(wrap) + 0.12;

          let necklineEffect = 0;
          if (z >= 2.0) {
            const neckDip = Math.pow((z - 2.0) / 1.5, 2) * 0.6;
            const centerDip = Math.max(0, 1.0 - Math.pow(x / 1.5, 2));
            necklineEffect = -neckDip * centerDip;
          }

          const angle = Math.asin(xClamped / W);
          const pleatCount = 14;
          const pleats =
            Math.cos(angle * pleatCount) *
            0.16 *
            (1.0 + Math.abs(z - waistZ) * 0.08);

          const fadeEdge = Math.min(1.0, wrap * 3.0);
          y = (base + (pleats + necklineEffect) * fadeEdge) * curvature;
        } else if (topology === "peplum_bodice") {
          let { W, D, Yc } = getBodyRadius(z);

          if (z < waistZ && z >= hipsZ) {
            const peplumFactor =
              Math.pow((waistZ - z) / (waistZ - hipsZ), 2) * 1.4;
            W += peplumFactor * 0.9;
            D += peplumFactor * 0.7;
          } else if (z < hipsZ) {
            W = 0.001;
            D = 0.001;
          }

          const xClamped = Math.max(-W, Math.min(W, x));
          const wrap = Math.max(0, 1 - Math.pow(xClamped / W, 2));
          const base = Yc + D * Math.sqrt(wrap) + 0.12;

          const angle = Math.asin(xClamped / W);
          const ribs = Math.sin(z * 4.0 + angle * 1.5) * 0.1;

          const fadeEdge = Math.min(1.0, wrap * 4.0);
          y = (base + ribs * fadeEdge) * curvature;
        } else if (topology === "slant_dress") {
          const { W, D, Yc } = getBodyRadius(z);

          const xClamped = Math.max(-W, Math.min(W, x));
          const wrap = Math.max(0, 1 - Math.pow(xClamped / W, 2));
          const base = Yc + D * Math.sqrt(wrap) + 0.12;

          const angle = Math.asin(xClamped / W);
          const slantVal = x * 0.4 + z * 0.6;
          const diagonalDrape = Math.sin(slantVal * 3.0) * 0.14;
          const mainFold = Math.max(0, 1.0 - Math.abs(slantVal - 0.8)) * 0.25;

          let neckline = 0;
          if (z > 1.8) {
            const cutLineHeight = -x * 0.35 + 2.2;
            if (z > cutLineHeight) {
              neckline = -(z - cutLineHeight) * 1.5;
            }
          }

          const fadeEdge = Math.min(1.0, wrap * 3.0);
          y =
            (base + (diagonalDrape + mainFold + neckline) * fadeEdge) *
            curvature;
        } else if (topology === "origami_pleats") {
          const { W, D, Yc } = getBodyRadius(z);
          const xClamped = Math.max(-W, Math.min(W, x));
          const wrap = Math.max(0, 1 - Math.pow(xClamped / W, 2));
          const base = Yc + D * Math.sqrt(wrap) + 0.12;

          const angle = Math.asin(xClamped / W);
          const wave1 = Math.asin(Math.sin(angle * 5.0 + z * 2.2));
          const wave2 = Math.asin(Math.sin(angle * 5.0 - z * 2.2));
          const pleating = (Math.abs(wave1) + Math.abs(wave2)) * 0.12;

          const fadeEdge = Math.min(1.0, wrap * 3.0);
          y = (base + pleating * fadeEdge) * curvature;
        } else if (topology === "faceted_armor") {
          const { W, D, Yc } = getBodyRadius(z);
          const xClamped = Math.max(-W, Math.min(W, x));
          const wrap = Math.max(0, 1 - Math.pow(xClamped / W, 2));
          const base = Yc + D * Math.sqrt(wrap) + 0.12;

          const angle = Math.asin(xClamped / W);
          const f1 = Math.abs(Math.sin(angle * 4.0));
          const f2 = Math.abs(Math.cos(z * 3.0 + angle * 2.0));
          const f3 = Math.abs(Math.sin(z * 3.0 - angle * 2.0));
          const facets = (f1 + f2 + f3) * 0.1;
          const rigidFacets = Math.pow(facets, 1.4) * 1.5;

          const fadeEdge = Math.min(1.0, wrap * 4.0);
          y = (base + rigidFacets * fadeEdge) * curvature;
        } else if (topology === "voronoi_cantilever") {
          const zNorm = z / 5;
          const xNorm = x / 5;
          const swoop =
            Math.sinh(zNorm * 1.5) * 1.8 - Math.pow(zNorm - 0.2, 2) * 1.2;
          const bolster = Math.pow(xNorm, 2) * 1.6;
          const freqX1 = 1.1;
          const freqZ1 = 0.8;
          const freqX2 = 2.4;
          const freqZ2 = 1.9;
          const cell1 = Math.sin(x * freqX1) * Math.cos(z * freqZ1);
          const cell2 = Math.cos(x * freqX2) * Math.sin(z * freqZ2);
          const voronoiField = Math.abs(cell1 + cell2 * 0.4);
          const ribs = Math.pow(voronoiField, 1.8) * 0.45 * (1.2 - zNorm * 0.5);
          y = (swoop + bolster + ribs) * curvature;
        } else if (topology === "gyroid_table") {
          const r = Math.sqrt(x * x + z * z);
          const topLevel = 2.0;
          const legsPattern = 1.8 * Math.cos(4 * Math.atan2(z, x));
          const falloff = Math.min(1.0, Math.pow(r / 5.0, 3));
          const tpms =
            0.4 *
            (Math.sin(x * 1.5) * Math.sin(z * 1.5) +
              Math.cos(x * 1.5) * Math.cos(z * 1.5));
          y =
            (topLevel * (1.0 - falloff) +
              legsPattern * falloff +
              tpms * (0.3 + 0.7 * falloff)) *
            curvature;
        } else if (topology === "hyperbolic_shell") {
          const r = Math.sqrt(x * x + z * z) / 5;
          const theta = Math.atan2(z, x);
          const saddle = (Math.pow(x / 3.5, 2) - Math.pow(z / 3.5, 2)) * 1.5;
          const frameRays = 0.5 * Math.sin(theta * 4) * Math.pow(r, 2);
          const edgeBeams = Math.cos(theta * 4) * 0.4;
          const dipAtCorners = Math.pow(r, 3) * 1.2;
          y = (saddle + frameRays + edgeBeams - dipAtCorners) * curvature;
        } else if (topology === "schwarz_p") {
          // Schwarz P Minimal Surface approximation height field
          const u = (x / 5) * Math.PI;
          const v = (z / 5) * Math.PI;
          const pVal = Math.cos(u) + Math.cos(v);
          y = -Math.sign(pVal) * Math.pow(Math.abs(pVal), 0.8) * 1.8 * curvature;
        } else if (topology === "schwarz_d") {
          // Schwarz Diamond Minimal Surface approximation
          const u = (x / 4) * Math.PI;
          const v = (z / 4) * Math.PI;
          const dVal = Math.sin(u) * Math.sin(v) + Math.cos(u) * Math.cos(v);
          y = Math.sin(u + v) * 2.2 * curvature;
        } else if (topology === "costa_surface") {
          // Costa Minimal Surface
          const r = Math.max(0.1, Math.sqrt(x * x + z * z) / 4);
          const theta = Math.atan2(z, x);
          const catenoidBase = Math.log(r);
          const planeFlaps = Math.cos(2 * theta) * Math.exp(-r);
          y = (catenoidBase + planeFlaps) * 1.6 * curvature;
        } else if (topology === "mobius_strip") {
          // Bending-active Möbius ribbon shell
          const theta = Math.atan2(z, x);
          const r = Math.sqrt(x * x + z * z) / 5;
          const twist = Math.sin(theta / 2) * (r - 0.5) * 3.5;
          y = twist * curvature;
        } else if (topology === "stadium_canopy") {
          // Tensile membrane stadium canopy with catenary arches
          const r = Math.sqrt(x * x + z * z) / 5;
          const theta = Math.atan2(z, x);
          const dome = (1 - Math.pow(r, 2)) * 3.5;
          const ringArches = Math.sin(theta * 6) * (1 - r) * 1.2;
          const perimeterDip = Math.pow(r, 4) * -2.0;
          y = (dome + ringArches + perimeterDip) * curvature;
        }

        // Apply real-time Parametric Wave, Twist, and Pinch Modifiers
        if (waveX > 0) {
          y += Math.sin((x / 5) * Math.PI * waveX) * 0.5 * curvature;
        }
        if (waveZ > 0) {
          y += Math.cos((z / 5) * Math.PI * waveZ) * 0.5 * curvature;
        }
        if (twistAngle !== 0) {
          const rad = (twistAngle * Math.PI) / 180;
          const dist = Math.sqrt(x * x + z * z) / 5;
          y += Math.sin(dist * Math.PI + rad) * 0.6 * curvature;
        }
        if (pinchFactor > 0) {
          const dist = Math.sqrt(x * x + z * z) / 5;
          const pinchWindow = Math.exp(-Math.pow(dist * 2.0, 2));
          y *= 1.0 - pinchFactor * 0.7 * pinchWindow;
        }

        posAttribute.setY(idx, y);
      } else {
        posAttribute.setY(idx, 0);
      }
    }
  }

  let currentY = new Float32Array(vertsPerRow * vertsPerRow);
  for (let i = 0; i < currentY.length; i++) currentY[i] = posAttribute.getY(i);
  let nextY = new Float32Array(vertsPerRow * vertsPerRow);

  if (!isDirectParametric) {
    for (let iter = 0; iter < iterations; iter++) {
      for (let i = 0; i < currentY.length; i++) nextY[i] = currentY[i];
      for (let i = 1; i < vertsPerRow - 1; i++) {
        for (let j = 1; j < vertsPerRow - 1; j++) {
          const idx = i * vertsPerRow + j;
          const n1 = (i - 1) * vertsPerRow + j;
          const n2 = (i + 1) * vertsPerRow + j;
          const n3 = i * vertsPerRow + (j - 1);
          const n4 = i * vertsPerRow + (j + 1);
          nextY[idx] =
            (currentY[n1] + currentY[n2] + currentY[n3] + currentY[n4]) / 4;
        }
      }
      const temp = currentY;
      currentY = nextY;
      currentY = nextY;
      nextY = temp;
    }
  }

  for (let i = 0; i < currentY.length; i++) {
    posAttribute.setY(i, currentY[i]);
  }

  geo.computeVertexNormals();
  posAttribute.needsUpdate = true;
  return geo;
}

export interface Panel {
  id: number;
  center: THREE.Vector3;
  vertices: THREE.Vector3[];
}

export function generatePatternPanels(
  baseGeometry: THREE.BufferGeometry,
  resolution: number,
  patternRadius: number,
  patternGap: number,
  patternType: PatternType = "hexagon",
): Panel[] {
  const hexRadius = patternRadius;
  const hexHeight = 2 * hexRadius;
  const hexWidth = Math.sqrt(3) * hexRadius;

  const cols = Math.ceil(12 / hexWidth) + 1;
  const rows = Math.ceil(12 / (hexHeight * 0.75)) + 1;

  const panels: Panel[] = [];
  let panelId = 0;

  for (let r = -rows; r <= rows; r++) {
    for (let q = -cols; q <= cols; q++) {
      const cx = hexRadius * Math.sqrt(3) * (q + r / 2);
      const cz = ((hexRadius * 3) / 2) * r;

      if (cx > -5.2 && cx < 5.2 && cz > -5.2 && cz < 5.2) {
        if (patternType === "hexagon") {
          const panelRadius = Math.max(0.01, hexRadius - patternGap);
          const clampedCx = Math.max(-5, Math.min(5, cx));
          const clampedCz = Math.max(-5, Math.min(5, cz));
          const centerY = getInterpolatedY(
            clampedCx,
            clampedCz,
            baseGeometry.attributes.position as THREE.BufferAttribute,
            resolution,
          );

          const center = new THREE.Vector3(cx, centerY, cz);
          const vertices = [];

          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 6;
            const px = cx + panelRadius * Math.cos(angle);
            const pz = cz + panelRadius * Math.sin(angle);
            const clampedPx = Math.max(-5, Math.min(5, px));
            const clampedPz = Math.max(-5, Math.min(5, pz));
            const py = getInterpolatedY(
              clampedPx,
              clampedPz,
              baseGeometry.attributes.position as THREE.BufferAttribute,
              resolution,
            );
            vertices.push(new THREE.Vector3(px, py, pz));
          }

          panels.push({ id: panelId++, center, vertices });
        } else if (patternType === "triangle") {
          // Subdivide the hexagon into 6 equilateral triangles
          for (let i = 0; i < 6; i++) {
            const angle1 = (Math.PI / 3) * i - Math.PI / 6;
            const angle2 = (Math.PI / 3) * ((i + 1) % 6) - Math.PI / 6;

            const p0x = cx;
            const p0z = cz;
            const p1x = cx + hexRadius * Math.cos(angle1);
            const p1z = cz + hexRadius * Math.sin(angle1);
            const p2x = cx + hexRadius * Math.cos(angle2);
            const p2z = cz + hexRadius * Math.sin(angle2);

            // Triangle center
            const tCx = (p0x + p1x + p2x) / 3;
            const tCz = (p0z + p1z + p2z) / 3;

            // Apply gap (shrink towards triangle center)
            const shrink = Math.max(0.01, 1 - patternGap / (hexRadius / 2));

            const shrinkPt = (px: number, pz: number) => {
              const nx = tCx + (px - tCx) * shrink;
              const nz = tCz + (pz - tCz) * shrink;
              return { x: nx, z: nz };
            };

            const pts = [
              shrinkPt(p0x, p0z),
              shrinkPt(p1x, p1z),
              shrinkPt(p2x, p2z),
            ];

            const vertices = pts.map((pt) => {
              const clampedPx = Math.max(-5, Math.min(5, pt.x));
              const clampedPz = Math.max(-5, Math.min(5, pt.z));
              const py = getInterpolatedY(
                clampedPx,
                clampedPz,
                baseGeometry.attributes.position as THREE.BufferAttribute,
                resolution,
              );
              return new THREE.Vector3(pt.x, py, pt.z);
            });

            const clampedTx = Math.max(-5, Math.min(5, tCx));
            const clampedTz = Math.max(-5, Math.min(5, tCz));
            const ty = getInterpolatedY(
              clampedTx,
              clampedTz,
              baseGeometry.attributes.position as THREE.BufferAttribute,
              resolution,
            );
            const center = new THREE.Vector3(tCx, ty, tCz);

            panels.push({ id: panelId++, center, vertices });
          }
        }
      }
    }
  }

  return panels;
}
