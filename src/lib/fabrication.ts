import * as THREE from "three";
import { Panel } from "./geometry";

export type JointType = "notch" | "rivet" | "finger_joint" | "zip_tie" | "living_hinge";

export interface MaterialPreset {
  id: string;
  name: string;
  thicknessMm: number;
  kerfMm: number;
  densityKgM3: number;
  maxBendRadiusMm: number;
  costPerSqM: number;
}

export const MATERIAL_PRESETS: Record<string, MaterialPreset> = {
  birch_plywood_3mm: {
    id: "birch_plywood_3mm",
    name: "3mm Birch Plywood",
    thicknessMm: 3.0,
    kerfMm: 0.15,
    densityKgM3: 650,
    maxBendRadiusMm: 300,
    costPerSqM: 25.0,
  },
  polypropylene_15mm: {
    id: "polypropylene_15mm",
    name: "1.5mm Polypropylene Sheet",
    thicknessMm: 1.5,
    kerfMm: 0.1,
    densityKgM3: 900,
    maxBendRadiusMm: 45,
    costPerSqM: 18.0,
  },
  acrylic_4mm: {
    id: "acrylic_4mm",
    name: "4mm Cast Acrylic",
    thicknessMm: 4.0,
    kerfMm: 0.2,
    densityKgM3: 1190,
    maxBendRadiusMm: 800,
    costPerSqM: 42.0,
  },
  aluminum_1mm: {
    id: "aluminum_1mm",
    name: "1mm Aluminum Sheet Metal",
    thicknessMm: 1.0,
    kerfMm: 0.05,
    densityKgM3: 2700,
    maxBendRadiusMm: 120,
    costPerSqM: 65.0,
  },
  cardboard_6mm: {
    id: "cardboard_6mm",
    name: "6mm Heavy Corrugated Cardboard",
    thicknessMm: 6.0,
    kerfMm: 0.25,
    densityKgM3: 250,
    maxBendRadiusMm: 150,
    costPerSqM: 6.0,
  },
};

export interface NestingReport {
  panelCount: number;
  totalAreaSqM: number;
  sheetCount: number;
  sheetWidthMm: number;
  sheetHeightMm: number;
  efficiencyPct: number;
  totalWeightKg: number;
  totalCutLengthM: number;
  estimatedLaserTimeMin: number;
  estimatedMaterialCostUSD: number;
  bendingStressSafetyScore: number;
}

export function calculateNestingReport(
  panels: Panel[],
  materialPresetId: string = "birch_plywood_3mm",
): NestingReport {
  const preset = MATERIAL_PRESETS[materialPresetId] || MATERIAL_PRESETS.birch_plywood_3mm;
  
  let totalAreaSqM = 0;
  let totalPerimeterM = 0;

  panels.forEach((panel) => {
    // Polygon area in 3D / unrolled plane
    const vCount = panel.vertices.length;
    let area = 0;
    for (let i = 0; i < vCount; i++) {
      const v1 = panel.vertices[i];
      const v2 = panel.vertices[(i + 1) % vCount];
      area += v1.x * v2.z - v2.x * v1.z;
      totalPerimeterM += v1.distanceTo(v2);
    }
    totalAreaSqM += Math.abs(area) * 0.5;
  });

  // Scale 3D units to real-world meters (assume 1 unit = 0.2m)
  const scaleM = 0.2;
  const realAreaSqM = totalAreaSqM * scaleM * scaleM;
  const realPerimeterM = totalPerimeterM * scaleM;

  const sheetWidthMm = 1200;
  const sheetHeightMm = 800;
  const singleSheetAreaSqM = (sheetWidthMm * sheetHeightMm) / 1000000;

  // Add packing loss margin (approx 28% spacing overhead)
  const requiredSheetArea = realAreaSqM * 1.35;
  const sheetCount = Math.max(1, Math.ceil(requiredSheetArea / singleSheetAreaSqM));
  const efficiencyPct = Math.min(92, Math.round((realAreaSqM / (sheetCount * singleSheetAreaSqM)) * 100));

  const volumeCuM = realAreaSqM * (preset.thicknessMm / 1000);
  const totalWeightKg = parseFloat((volumeCuM * preset.densityKgM3).toFixed(2));

  // Laser speed: ~30 mm/s for 3mm material
  const cuttingSpeedMPerMin = Math.max(0.5, 2.5 - preset.thicknessMm * 0.25);
  const estimatedLaserTimeMin = Math.ceil(realPerimeterM / cuttingSpeedMPerMin) + sheetCount * 1.5;

  const estimatedMaterialCostUSD = parseFloat((sheetCount * singleSheetAreaSqM * preset.costPerSqM).toFixed(2));
  
  // Bending safety score (100 is ideal, lower if curvature exceeds material bend limit)
  const bendingStressSafetyScore = Math.max(50, Math.min(100, Math.round(100 - (preset.thicknessMm * 4))));

  return {
    panelCount: panels.length,
    totalAreaSqM: parseFloat(realAreaSqM.toFixed(3)),
    sheetCount,
    sheetWidthMm,
    sheetHeightMm,
    efficiencyPct,
    totalWeightKg,
    totalCutLengthM: parseFloat(realPerimeterM.toFixed(1)),
    estimatedLaserTimeMin,
    estimatedMaterialCostUSD,
    bendingStressSafetyScore,
  };
}

// Flattens out 3D panels into 2D SVG shapes for laser cutting fabrication
export function exportPanelsToSVG(
  panels: Panel[],
  materialThickness: number = 2,
  jointType: JointType = "notch",
): void {
  // Dimensions and layout parameters
  const padding = 15;
  const scale = 50; // pixels per 3D unit

  // 1. Identify Global Joints
  // We hash the 3D midpoint of each edge to find matching edges across different panels.
  const edgeMap = new Map<string, number>();
  let jointCounter = 0;
  const panelJointIDs = new Map<string, number>(); // key: panelId-edgeIndex

  const getHash = (v1: THREE.Vector3, v2: THREE.Vector3) => {
    const mx = (v1.x + v2.x) / 2;
    const my = (v1.y + v2.y) / 2;
    const mz = (v1.z + v2.z) / 2;
    // Round to 1 decimal place to handle floating point imprecision when detecting adjacent edges
    return `${mx.toFixed(1)},${my.toFixed(1)},${mz.toFixed(1)}`;
  };

  panels.forEach((panel) => {
    const vCount = panel.vertices.length;
    for (let j = 0; j < vCount; j++) {
      const v1 = panel.vertices[j];
      const v2 = panel.vertices[(j + 1) % vCount];
      const hash = getHash(v1, v2);

      if (!edgeMap.has(hash)) {
        edgeMap.set(hash, ++jointCounter);
      }
      panelJointIDs.set(`${panel.id}-${j}`, edgeMap.get(hash)!);
    }
  });

  // 2. Unroll each panel to local 2D coordinates
  type UnrolledPanel = {
    id: number;
    points: { x: number; y: number }[];
    bounds: {
      minX: number;
      minY: number;
      maxX: number;
      maxY: number;
      width: number;
      height: number;
    };
  };

  const unrolledPanels: UnrolledPanel[] = panels.map((panel) => {
    const vCount = panel.vertices.length;
    const dCenterToPerimeter = panel.vertices.map((v) =>
      panel.center.distanceTo(v),
    );
    const dPerimeter = [];
    for (let j = 0; j < vCount; j++) {
      dPerimeter.push(
        panel.vertices[j].distanceTo(panel.vertices[(j + 1) % vCount]),
      );
    }

    let angleSum = 0;
    const localPoints: { x: number; y: number }[] = [];

    for (let j = 0; j < vCount; j++) {
      const a = dCenterToPerimeter[j];
      const b = dCenterToPerimeter[(j + 1) % vCount];
      const c = dPerimeter[j];

      let cosC = (a * a + b * b - c * c) / (2 * a * b);
      cosC = Math.max(-1, Math.min(1, cosC));
      const angle = Math.acos(cosC);

      if (j === 0) {
        localPoints.push({
          x: a * Math.cos(angleSum),
          y: a * Math.sin(angleSum),
        });
      }

      angleSum += angle;

      if (j < vCount - 1) {
        localPoints.push({
          x: b * Math.cos(angleSum),
          y: b * Math.sin(angleSum),
        });
      }
    }

    // scale local points
    localPoints.forEach((pt) => {
      pt.x *= scale;
      pt.y *= scale;
    });

    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    localPoints.forEach((pt) => {
      if (pt.x < minX) minX = pt.x;
      if (pt.x > maxX) maxX = pt.x;
      if (pt.y < minY) minY = pt.y;
      if (pt.y > maxY) maxY = pt.y;
    });

    // We add padding to bounds to account for flaps/notches which can extend outward
    const flapAllowance = jointType === "rivet" ? 30 : 25;
    minX -= flapAllowance;
    maxX += flapAllowance;
    minY -= flapAllowance;
    maxY += flapAllowance;

    return {
      id: panel.id,
      points: localPoints,
      bounds: {
        minX,
        minY,
        maxX,
        maxY,
        width: maxX - minX,
        height: maxY - minY,
      },
    };
  });

  // 3. Simple Shelf Layout
  // Sort panels purely by ID to order them 1 to N
  unrolledPanels.sort((a, b) => a.id - b.id);

  const SHEET_WIDTH = 1200; // Custom standard sheet width in pixels
  let currentX = padding;
  let currentY = padding;
  let shelfHeight = 0;
  let maxLayoutHeight = 0;

  const placements = unrolledPanels.map((panel) => {
    if (currentX + panel.bounds.width + padding > SHEET_WIDTH) {
      // Move to next shelf
      currentX = padding;
      currentY += shelfHeight + padding;
      shelfHeight = 0;
    }

    const placement = {
      x: currentX - panel.bounds.minX,
      y: currentY - panel.bounds.minY,
    };

    currentX += panel.bounds.width + padding;
    shelfHeight = Math.max(shelfHeight, panel.bounds.height);
    maxLayoutHeight = Math.max(
      maxLayoutHeight,
      currentY + shelfHeight + padding,
    );

    return { panel, placement };
  });

  // 4. Generate SVG contents
  const TITLE_BLOCK_HEIGHT = 150;
  const svgWidth = SHEET_WIDTH;
  const svgHeight = maxLayoutHeight + TITLE_BLOCK_HEIGHT;

  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">\n`;

  // Background
  svgContent += `<rect width="${svgWidth}" height="${svgHeight}" fill="white" />\n`;

  // Draw Title Block
  svgContent += `
  <g transform="translate(20, 20)">
    <rect width="${svgWidth - 40}" height="120" fill="none" stroke="black" stroke-width="2px" />
    <text x="20" y="40" font-family="sans-serif" font-weight="bold" font-size="24" fill="black">DIGITAL FABRICATION BLUEPRINT</text>
    <text x="20" y="70" font-family="sans-serif" font-size="14" fill="black">Total Panels: ${panels.length} | Joint Type: ${jointType.toUpperCase()} | Material Thickness: ${materialThickness}mm</text>
    <text x="20" y="90" font-family="sans-serif" font-size="14" fill="black">Generated by Form Finder</text>
    
    <g transform="translate(500, 20)">
      <text x="0" y="15" font-family="sans-serif" font-weight="bold" font-size="14" fill="black">LEGEND:</text>
      
      <line x1="80" y1="10" x2="130" y2="10" stroke="#FF0000" stroke-width="1px" />
      <text x="140" y="15" font-family="sans-serif" font-size="12" fill="black">CUT (Outer boundaries)</text>
      
      <line x1="80" y1="35" x2="130" y2="35" stroke="#0000FF" stroke-width="1px" stroke-dasharray="4" />
      <text x="140" y="40" font-family="sans-serif" font-size="12" fill="black">SCORE (Fold lines)</text>
      
      <text x="80" y="65" font-family="monospace" font-size="12" fill="#000000">J-XX / P-XX</text>
      <text x="170" y="65" font-family="sans-serif" font-size="12" fill="black">ENGRAVE (IDs &amp; Labels)</text>
    </g>

    <g transform="translate(850, 20)">
      <text x="0" y="15" font-family="sans-serif" font-weight="bold" font-size="14" fill="black">ASSEMBLY INSTRUCTIONS:</text>
      <text x="0" y="35" font-family="sans-serif" font-size="12" fill="black">1. Cut along red lines. Score along blue dashed lines.</text>
      <text x="0" y="55" font-family="sans-serif" font-size="12" fill="black">2. Match identical Edge Joint IDs (e.g., J-42 to J-42).</text>
      <text x="0" y="75" font-family="sans-serif" font-size="12" fill="black">3. Apply wood glue / CA glue to the connecting faces.</text>
      <text x="0" y="95" font-family="sans-serif" font-size="12" fill="black">4. Insert notch / rivet connections and hold until set.</text>
    </g>
  </g>
  `;

  const yOffset = TITLE_BLOCK_HEIGHT + 20;

  placements.forEach(({ panel, placement }) => {
    const offsetX = placement.x;
    const offsetY = placement.y + yOffset;
    const vCount = panel.points.length;

    // Center text label (approximate center from bounds)
    const centerX = offsetX + (panel.bounds.minX + panel.bounds.maxX) / 2;
    const centerY = offsetY + (panel.bounds.minY + panel.bounds.maxY) / 2;

    // Draw Score Lines from center to vertices (Laser Standard: Blue, 1px, dashed)
    panel.points.forEach((pt) => {
      const px = offsetX + pt.x;
      const py = offsetY + pt.y;
      svgContent += `  <line x1="${centerX}" y1="${centerY}" x2="${px}" y2="${py}" stroke="#0000FF" stroke-width="1px" stroke-dasharray="4" />\n`;
    });

    // Draw Perimeter with Interlocking Notches or Flaps (Laser Standard: Red, 1px)
    let pathData = "";
    for (let j = 0; j < vCount; j++) {
      const pt1 = panel.points[j];
      const pt2 = panel.points[(j + 1) % vCount];

      const px1 = offsetX + pt1.x;
      const py1 = offsetY + pt1.y;
      const px2 = offsetX + pt2.x;
      const py2 = offsetY + pt2.y;

      if (j === 0) pathData += `M ${px1},${py1} `;

      const dx = px2 - px1;
      const dy = py2 - py1;
      const len = Math.sqrt(dx * dx + dy * dy);
      const ux = dx / len;
      const uy = dy / len;

      // normal pointing inward
      const nx = -uy;
      const ny = ux;

      const mx = (px1 + px2) / 2;
      const my = (py1 + py2) / 2;

      let outwardLabelOffset = 8;

      if (jointType === "notch") {
        const notchWidth = materialThickness * 2; // e.g. 2mm material -> 4px wide notch
        const notchDepth = notchWidth;
        outwardLabelOffset = notchDepth + 6;

        const n1x = mx - ux * (notchWidth / 2);
        const n1y = my - uy * (notchWidth / 2);
        const n2x = mx + ux * (notchWidth / 2);
        const n2y = my + uy * (notchWidth / 2);

        const b1x = n1x + nx * notchDepth;
        const b1y = n1y + ny * notchDepth;
        const b2x = n2x + nx * notchDepth;
        const b2y = n2y + ny * notchDepth;

        pathData += `L ${n1x},${n1y} L ${b1x},${b1y} L ${b2x},${b2y} L ${n2x},${n2y} L ${px2},${py2} `;
      } else if (jointType === "rivet") {
        const flapLen = 15;
        const flapDepth = 12;
        outwardLabelOffset = flapDepth + 6;

        const n1x = mx - ux * flapLen;
        const n1y = my - uy * flapLen;
        const n2x = mx + ux * flapLen;
        const n2y = my + uy * flapLen;

        // flap points outwards (-nx, -ny)
        const b1x = n1x - nx * flapDepth;
        const b1y = n1y - ny * flapDepth;
        const b2x = n2x - nx * flapDepth;
        const b2y = n2y - ny * flapDepth;

        pathData += `L ${n1x},${n1y} L ${b1x},${b1y} L ${b2x},${b2y} L ${n2x},${n2y} L ${px2},${py2} `;

        // Add rivet circle (Laser Standard: Red cut)
        const rCx = mx - nx * (flapDepth / 2);
        const rCy = my - ny * (flapDepth / 2);
        svgContent += `  <circle cx="${rCx}" cy="${rCy}" r="1.5" fill="none" stroke="#FF0000" stroke-width="1px" />\n`;
      } else if (jointType === "finger_joint") {
        // Interlocking Finger Teeth along the edge
        const teethCount = 3;
        const fingerDepth = materialThickness * 3;
        outwardLabelOffset = fingerDepth + 8;
        const segmentLen = len / (teethCount * 2 + 1);

        let currX = px1;
        let currY = py1;

        for (let t = 0; t < teethCount * 2 + 1; t++) {
          const isTooth = t % 2 === 1;
          const nextX = px1 + ux * (t + 1) * segmentLen;
          const nextY = py1 + uy * (t + 1) * segmentLen;

          if (isTooth) {
            const out1X = currX + nx * fingerDepth;
            const out1Y = currY + ny * fingerDepth;
            const out2X = nextX + nx * fingerDepth;
            const out2Y = nextY + ny * fingerDepth;
            pathData += `L ${out1X},${out1Y} L ${out2X},${out2Y} L ${nextX},${nextY} `;
          } else {
            pathData += `L ${nextX},${nextY} `;
          }
          currX = nextX;
          currY = nextY;
        }
      } else if (jointType === "zip_tie") {
        // Zip-tie lacing eyelets for flexible textiles/polypropylene
        outwardLabelOffset = 10;
        pathData += `L ${px2},${py2} `;

        // Draw pairs of eyelet holes near edge
        const h1x = mx - ux * 8 + nx * 5;
        const h1y = my - uy * 8 + ny * 5;
        const h2x = mx + ux * 8 + nx * 5;
        const h2y = my + uy * 8 + ny * 5;

        svgContent += `  <circle cx="${h1x}" cy="${h1y}" r="2.0" fill="none" stroke="#FF0000" stroke-width="1px" />\n`;
        svgContent += `  <circle cx="${h2x}" cy="${h2y}" r="2.0" fill="none" stroke="#FF0000" stroke-width="1px" />\n`;
      } else if (jointType === "living_hinge") {
        // Living hinge kerf scoring along perimeter fold
        outwardLabelOffset = 12;
        pathData += `L ${px2},${py2} `;

        // Draw living hinge parallel score lines (Laser Standard: Blue dash)
        for (let h = 1; h <= 3; h++) {
          const hOffset = h * 3;
          const hsx = px1 + nx * hOffset;
          const hsy = py1 + ny * hOffset;
          const hex = px2 + nx * hOffset;
          const hey = py2 + ny * hOffset;
          svgContent += `  <line x1="${hsx}" y1="${hsy}" x2="${hex}" y2="${hey}" stroke="#0000FF" stroke-width="0.8px" stroke-dasharray="3,2" />\n`;
        }
      }

      // Draw global edge joint ID indicator (Laser Standard: Black Fill)
      // Position it slightly outward from the center of the edge to avoid overlap
      const globalJointId = panelJointIDs.get(`${panel.id}-${j}`);
      // nx, ny is inward normal. -nx, -ny is outward normal.
      const labelX = mx - nx * outwardLabelOffset;
      const labelY = my - ny * outwardLabelOffset;

      // Calculate rotation angle for text to align with the edge
      let angleDeg = Math.atan2(dy, dx) * (180 / Math.PI);
      // Ensure text is right-side up
      if (angleDeg > 90 || angleDeg < -90) {
        angleDeg += 180;
      }

      svgContent += `  <text x="${labelX}" y="${labelY}" transform="rotate(${angleDeg}, ${labelX}, ${labelY})" font-family="monospace" font-size="8" fill="#000000" text-anchor="middle" dominant-baseline="middle">J-${globalJointId}</text>\n`;
    }

    svgContent += `  <path d="${pathData}" fill="none" stroke="#FF0000" stroke-width="1px" />\n`;
    svgContent += `  <text x="${centerX}" y="${centerY + 3}" font-family="monospace" font-size="10" fill="#000000" text-anchor="middle" font-weight="bold">P-${panel.id}</text>\n`;
  });

  svgContent += `</svg>`;

  // Create a blob and trigger download
  const blob = new Blob([svgContent], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `fabrication_panels_${Date.now()}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportStructuralGridToSVG(
  baseGeometry: THREE.BufferGeometry | null,
  resolution: number,
  materialThickness: number = 2,
): void {
  if (!baseGeometry || !baseGeometry.attributes || !baseGeometry.attributes.position) {
    console.warn("exportStructuralGridToSVG: Base geometry position attribute is missing.");
    return;
  }

  const pos = baseGeometry.attributes.position;
  if (pos.count === 0) {
    console.warn("exportStructuralGridToSVG: Position attribute is empty.");
    return;
  }

  const vertsPerRow = resolution + 1;
  const scale = 50; // pixels per 3D unit
  const stripDepthUnits = 1.5; // depth of the waffle strips in 3D units
  const stripDepthPx = stripDepthUnits * scale;
  const notchWidthPx = Math.max(2, materialThickness * 2); // pixel width for the notch slot

  type LathPoint = { x: number; y: number; index: number };
  type Lath = {
    id: string;
    points: LathPoint[];
    isU: boolean;
    bounds: {
      minX: number;
      maxX: number;
      minY: number;
      maxY: number;
      width: number;
      height: number;
    };
  };

  const laths: Lath[] = [];

  // Helper to calculate bounds safely
  const compileLath = (id: string, rawPoints: LathPoint[], isU: boolean) => {
    if (rawPoints.length < 2) return;

    const points = rawPoints.map((p) => ({
      x: (isNaN(p.x) ? 0 : p.x) * scale,
      y: -(isNaN(p.y) ? 0 : p.y) * scale,
      index: p.index,
    }));

    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;

    points.forEach((p) => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y + stripDepthPx > maxY) maxY = p.y + stripDepthPx;
    });

    if (!isFinite(minX) || !isFinite(maxX) || !isFinite(minY) || !isFinite(maxY)) {
      return;
    }

    const width = Math.max(10, maxX - minX);
    const height = Math.max(10, maxY - minY);

    laths.push({
      id,
      points,
      isU,
      bounds: {
        minX,
        maxX,
        minY,
        maxY,
        width,
        height,
      },
    });
  };

  // U-direction laths (Rows, varying X)
  for (let r = 0; r < vertsPerRow; r++) {
    const rawPoints: LathPoint[] = [];
    for (let c = 0; c < vertsPerRow; c++) {
      const idx = r * vertsPerRow + c;
      if (idx < pos.count) {
        const xVal = pos.getX(idx);
        const yVal = pos.getY(idx);
        if (isFinite(xVal) && isFinite(yVal)) {
          rawPoints.push({ x: xVal, y: yVal, index: c });
        }
      }
    }
    compileLath(`U-${r}`, rawPoints, true);
  }

  // V-direction laths (Cols, varying Z)
  for (let c = 0; c < vertsPerRow; c++) {
    const rawPoints: LathPoint[] = [];
    for (let r = 0; r < vertsPerRow; r++) {
      const idx = r * vertsPerRow + c;
      if (idx < pos.count) {
        const zVal = pos.getZ(idx);
        const yVal = pos.getY(idx);
        if (isFinite(zVal) && isFinite(yVal)) {
          rawPoints.push({ x: zVal, y: yVal, index: r });
        }
      }
    }
    compileLath(`V-${c}`, rawPoints, false);
  }

  if (laths.length === 0) {
    console.warn("exportStructuralGridToSVG: No valid laths generated.");
    return;
  }

  // Layout the laths
  const SHEET_WIDTH = 1200;
  const padding = 20;
  let currentX = padding;
  let currentY = padding;
  let shelfHeight = 0;
  let maxLayoutHeight = 0;

  const placements = laths.map((lath) => {
    if (currentX + lath.bounds.width + padding > SHEET_WIDTH) {
      currentX = padding;
      currentY += shelfHeight + padding;
      shelfHeight = 0;
    }

    const placement = {
      x: currentX - lath.bounds.minX,
      y: currentY - lath.bounds.minY,
    };

    currentX += lath.bounds.width + padding;
    shelfHeight = Math.max(shelfHeight, lath.bounds.height);
    maxLayoutHeight = Math.max(
      maxLayoutHeight,
      currentY + shelfHeight + padding,
    );

    return { lath, placement };
  });

  const TITLE_BLOCK_HEIGHT = 150;
  const svgWidth = SHEET_WIDTH;
  const svgHeight = Math.max(300, maxLayoutHeight + TITLE_BLOCK_HEIGHT);

  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">\n`;
  svgContent += `<rect width="${svgWidth}" height="${svgHeight}" fill="white" />\n`;

  svgContent += `
  <g transform="translate(20, 20)">
    <rect width="${svgWidth - 40}" height="120" fill="none" stroke="black" stroke-width="2px" />
    <text x="20" y="40" font-family="sans-serif" font-weight="bold" font-size="24" fill="black">STRUCTURAL GRID BLUEPRINT</text>
    <text x="20" y="70" font-family="sans-serif" font-size="14" fill="black">Total Laths: ${laths.length} | Material Thickness: ${materialThickness}mm | Strip Depth: ${stripDepthUnits} units</text>
    <text x="20" y="90" font-family="sans-serif" font-size="14" fill="black">Generated by Form Finder Digital Fabrication Studio</text>
    
    <g transform="translate(500, 20)">
      <text x="0" y="15" font-family="sans-serif" font-weight="bold" font-size="14" fill="black">LEGEND:</text>
      <line x1="80" y1="10" x2="130" y2="10" stroke="#FF0000" stroke-width="1px" />
      <text x="140" y="15" font-family="sans-serif" font-size="12" fill="black">CUT (Outer boundaries &amp; notches)</text>
    </g>

    <g transform="translate(850, 20)">
      <text x="0" y="15" font-family="sans-serif" font-weight="bold" font-size="14" fill="black">ASSEMBLY INSTRUCTIONS:</text>
      <text x="0" y="35" font-family="sans-serif" font-size="12" fill="black">1. Cut along red lines.</text>
      <text x="0" y="55" font-family="sans-serif" font-size="12" fill="black">2. Slot U-laths and V-laths together at intersections.</text>
      <text x="0" y="75" font-family="sans-serif" font-size="12" fill="black">3. U-laths are notched top-down, V-laths bottom-up.</text>
    </g>
  </g>
  `;

  const yOffset = TITLE_BLOCK_HEIGHT + 20;

  placements.forEach(({ lath, placement }) => {
    const offsetX = placement.x;
    const offsetY = placement.y + yOffset;

    const pts = lath.points;
    const n = pts.length;
    if (n < 2) return;

    let pathData = "";
    const ex = notchWidthPx * 1.5;

    // Safe interpolation helper
    const getY = (xVal: number) => {
      if (n === 1) return offsetY + pts[0].y;
      const xLocal = xVal - offsetX;
      if (xLocal <= pts[0].x) {
        const dx = pts[1].x - pts[0].x;
        const dy = pts[1].y - pts[0].y;
        return (
          offsetY + pts[0].y + (dx !== 0 ? (dy / dx) * (xLocal - pts[0].x) : 0)
        );
      }
      if (xLocal >= pts[n - 1].x) {
        const dx = pts[n - 1].x - pts[n - 2].x;
        const dy = pts[n - 1].y - pts[n - 2].y;
        return (
          offsetY +
          pts[n - 1].y +
          (dx !== 0 ? (dy / dx) * (xLocal - pts[n - 1].x) : 0)
        );
      }
      for (let i = 0; i < n - 1; i++) {
        if (xLocal >= pts[i].x && xLocal <= pts[i + 1].x) {
          const dx = pts[i + 1].x - pts[i].x;
          const dy = pts[i + 1].y - pts[i].y;
          return (
            offsetY +
            pts[i].y +
            (dx !== 0 ? (dy / dx) * (xLocal - pts[i].x) : 0)
          );
        }
      }
      return offsetY + pts[n - 1].y;
    };

    const xStart = offsetX + pts[0].x - ex;
    const xEnd = offsetX + pts[n - 1].x + ex;

    // 1. Draw top edge
    pathData += `M ${xStart.toFixed(2)},${getY(xStart).toFixed(2)} `;

    for (let i = 0; i < n; i++) {
      const px = offsetX + pts[i].x;
      const py = offsetY + pts[i].y;

      if (lath.isU) {
        const nx1 = px - notchWidthPx / 2;
        const nx2 = px + notchWidthPx / 2;
        const notchBottom = py + stripDepthPx / 2;

        pathData += `L ${nx1.toFixed(2)},${getY(nx1).toFixed(2)} `;
        pathData += `L ${nx1.toFixed(2)},${notchBottom.toFixed(2)} `;
        pathData += `L ${nx2.toFixed(2)},${notchBottom.toFixed(2)} `;
        pathData += `L ${nx2.toFixed(2)},${getY(nx2).toFixed(2)} `;
      } else {
        pathData += `L ${px.toFixed(2)},${py.toFixed(2)} `;
      }
    }

    pathData += `L ${xEnd.toFixed(2)},${getY(xEnd).toFixed(2)} `;

    // 2. Draw right edge
    pathData += `L ${xEnd.toFixed(2)},${(getY(xEnd) + stripDepthPx).toFixed(2)} `;

    // 3. Draw bottom edge (right to left)
    for (let i = n - 1; i >= 0; i--) {
      const px = offsetX + pts[i].x;
      const py = offsetY + pts[i].y;

      if (!lath.isU) {
        const nx2 = px + notchWidthPx / 2;
        const nx1 = px - notchWidthPx / 2;
        const notchTop = py + stripDepthPx / 2;

        pathData += `L ${nx2.toFixed(2)},${(getY(nx2) + stripDepthPx).toFixed(2)} `;
        pathData += `L ${nx2.toFixed(2)},${notchTop.toFixed(2)} `;
        pathData += `L ${nx1.toFixed(2)},${notchTop.toFixed(2)} `;
        pathData += `L ${nx1.toFixed(2)},${(getY(nx1) + stripDepthPx).toFixed(2)} `;
      } else {
        pathData += `L ${px.toFixed(2)},${(py + stripDepthPx).toFixed(2)} `;
      }
    }

    // 4. Draw to bottom left and close
    pathData += `L ${xStart.toFixed(2)},${(getY(xStart) + stripDepthPx).toFixed(2)} Z`;

    svgContent += `  <path d="${pathData}" fill="none" stroke="#FF0000" stroke-width="1px" />\n`;

    // Label for the lath
    const centerX = offsetX + (lath.bounds.minX + lath.bounds.maxX) / 2;
    const centerY = offsetY + (lath.bounds.minY + lath.bounds.maxY) / 2;
    svgContent += `  <text x="${centerX.toFixed(2)}" y="${centerY.toFixed(2)}" font-family="monospace" font-size="12" fill="#000000" text-anchor="middle" dominant-baseline="middle" font-weight="bold">${lath.id}</text>\n`;
  });

  svgContent += `</svg>`;

  const blob = new Blob([svgContent], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `structural_grid_${Date.now()}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
