import React, { useState } from "react";
import {
  X,
  Wrench,
  HelpCircle,
  Layers,
  CheckCircle2,
  Info,
  ExternalLink,
  Scissors,
  Sparkles,
  Zap,
  Maximize2,
  ShieldAlert,
} from "lucide-react";
import { JointType } from "../lib/fabrication";

interface JoineryShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedJointType: JointType;
  onSelectJointType: (joint: JointType) => void;
}

export interface JoineryDetails {
  id: JointType;
  name: string;
  subtitle: string;
  analogy: string;
  description: string;
  howItWorks: string;
  idealMaterials: string[];
  thicknessRange: string;
  kerfTolerance: string;
  assemblyEase: "Easy (Toolless)" | "Moderate" | "Requires Fasteners";
  rigidityRating: "High Structural" | "Medium Flexible" | "High Shear";
  pros: string[];
  cons: string[];
  laserInstructions: string;
  svgDiagram: (activeColor: string) => React.ReactNode;
}

export const JOINERY_SHOWCASE_DATA: Record<JointType, JoineryDetails> = {
  notch: {
    id: "notch",
    name: "Notch Interlock Slots",
    subtitle: "Half-Lap Friction Slots (Waffle Grid)",
    analogy: "🍷 Like egg-crate cardboard partitions inside a wine bottle box. Two flat sheets with slots slide halfway into each other to build a rigid 3D grid with zero glue or screws.",
    description:
      "Perpendicular laser-cut slots designed to slide halfway into matching slots on adjacent panels, locking two sheets at 90° or custom angles without glue.",
    howItWorks:
      "Slot width is calibrated to match material thickness plus laser kerf allowance. Panels slide together along notch guide chamfers until flush.",
    idealMaterials: ["3mm - 6mm Birch Plywood", "MDF", "Acrylic", "Fluted Cardboard"],
    thicknessRange: "2.0mm - 12.0mm",
    kerfTolerance: "+0.15mm (Friction fit)",
    assemblyEase: "Easy (Toolless)",
    rigidityRating: "High Structural",
    pros: [
      "Zero hardware or glue required",
      "Self-aligning geometry during assembly",
      "Ideal for high-density waffle grid structures",
    ],
    cons: [
      "Requires precise material gauge calibration",
      "Brittle materials (like acrylic) can crack if slots are too tight",
    ],
    laserInstructions:
      "Laser cut outer edge in RED (#FF0000). Ensure slot width matches caliper-measured material gauge.",
    svgDiagram: (color) => (
      <svg viewBox="0 0 300 180" className="w-full h-auto">
        <rect width="300" height="180" fill="#0f0f13" rx="8" />
        <pattern id="g1" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1f1f28" strokeWidth="0.5" />
        </pattern>
        <rect width="300" height="180" fill="url(#g1)" />

        {/* Panel A (Horizontal base) */}
        <path
          d="M 30,110 L 130,110 L 130,130 L 140,130 L 140,110 L 270,110 L 270,145 L 30,145 Z"
          fill="#1e293b"
          stroke={color}
          strokeWidth="2"
        />
        <text x="50" y="132" fill="#94a3b8" fontSize="10" fontFamily="monospace">
          PANEL A (NOTCH DOWN)
        </text>

        {/* Panel B (Vertical inserting notch) */}
        <path
          d="M 125,25 L 145,25 L 145,80 L 135,80 L 135,110 L 125,110 Z"
          fill="#0f766e"
          fillOpacity="0.8"
          stroke="#2dd4bf"
          strokeWidth="2"
          strokeDasharray="4,2"
        />
        <text x="152" y="50" fill="#2dd4bf" fontSize="10" fontFamily="monospace">
          PANEL B (SLIDING NOTCH)
        </text>

        {/* Arrow showing insertion direction */}
        <path d="M 135,60 L 135,95" stroke="#00ffcc" strokeWidth="2.5" markerEnd="url(#arrow)" />
        <circle cx="135" cy="110" r="4" fill="#00ffcc" />

        {/* Kerf annotation callout */}
        <line x1="130" y1="130" x2="140" y2="130" stroke="#f59e0b" strokeWidth="2" />
        <text x="135" y="165" fill="#f59e0b" fontSize="9" fontFamily="monospace" textAnchor="middle">
          SLOT WIDTH = THICKNESS + KERF
        </text>
      </svg>
    ),
  },

  rivet: {
    id: "rivet",
    name: "Rivet Flaps & Eyelets",
    subtitle: "Perimeter Folding Flaps with Chicago Screws / Pop-Rivets",
    analogy: "📦 Like folding tabs on a cardboard box fastened with plastic rivets or paper brass fasteners. A tab on Panel A bends 90° over Panel B, and a rivet clips through matching laser holes.",
    description:
      "Perimeter tabs extending from panel edges, featuring laser-pierced eyelet holes. Flaps fold along etched scorelines to overlap adjacent panels for mechanical fastening.",
    howItWorks:
      "Flaps are folded 90° along laser-etched scorelines. Rivet holes on overlapping flaps align automatically to receive 4mm plastic pop-rivets, Chicago bolts, or screws.",
    idealMaterials: ["1.0mm - 2.0mm Polypropylene", "PETG", "Leather", "Sheet Aluminum", "Cardstock"],
    thicknessRange: "0.5mm - 3.0mm",
    kerfTolerance: "Hole Diameter 4.2mm (+0.2mm clearance)",
    assemblyEase: "Requires Fasteners",
    rigidityRating: "High Shear",
    pros: [
      "Extremely strong shear connection across complex curved surfaces",
      "Easily disassemblable if Chicago screws or removable rivets are used",
      "Prevents panel edge slippage under torsional stress",
    ],
    cons: [
      "Requires purchasing external rivets/screws",
      "Slightly longer assembly time per joint",
    ],
    laserInstructions:
      "Cut panel & flap outline in RED (#FF0000). Etch folding crease in BLUE DASHED (#0000FF).",
    svgDiagram: (color) => (
      <svg viewBox="0 0 300 180" className="w-full h-auto">
        <rect width="300" height="180" fill="#0f0f13" rx="8" />

        {/* Base Panel */}
        <path d="M 30,120 L 180,120 L 180,150 L 30,150 Z" fill="#1e293b" stroke={color} strokeWidth="2" />
        <text x="40" y="140" fill="#94a3b8" fontSize="10" fontFamily="monospace">
          PANEL A BODY
        </text>

        {/* Folded Flap */}
        <path d="M 180,120 L 250,70 L 250,100 L 180,150 Z" fill="#334155" stroke="#38bdf8" strokeWidth="2" />
        {/* Scoreline */}
        <line x1="180" y1="120" x2="180" y2="150" stroke="#0000ff" strokeWidth="2" strokeDasharray="3,2" />

        {/* Eyelet hole 1 */}
        <circle cx="210" cy="95" r="7" fill="#0f0f13" stroke="#f59e0b" strokeWidth="2" />
        {/* Eyelet hole 2 */}
        <circle cx="230" cy="80" r="7" fill="#0f0f13" stroke="#f59e0b" strokeWidth="2" />

        {/* Pop Rivet Graphic */}
        <path d="M 210,65 L 210,95 M 205,65 L 215,65" stroke="#00ffcc" strokeWidth="2.5" />
        <circle cx="210" cy="95" r="3" fill="#00ffcc" />

        <text x="200" y="45" fill="#00ffcc" fontSize="9" fontFamily="monospace">
          POP-RIVET / CHICAGO SCREW
        </text>
        <text x="110" y="170" fill="#f59e0b" fontSize="9" fontFamily="monospace" textAnchor="middle">
          BLUE SCORELINE = FLEX FOLD | RIVET HOLES = 4.2mm
        </text>
      </svg>
    ),
  },

  finger_joint: {
    id: "finger_joint",
    name: "Interlocking Finger Teeth",
    subtitle: "Precision Box Joint / Comb Teeth Edge Locking",
    analogy: "🤝 Like interlacing your fingers when clasping your hands together. Alternating square teeth along Edge A fit into square cutouts along Edge B to form a rigid 90° box corner.",
    description:
      "Alternating rectangular finger teeth along perimeter edges that interlock like fingers in clasped hands, providing seamless flush corner joints.",
    howItWorks:
      "Panel perimeters are laser cut with male and female comb teeth. When joined at 90° or flat planes, fingers lock tight for wood glue bonding or press-fit retention.",
    idealMaterials: ["Hardwood", "Birch Plywood", "Cast Acrylic", "Bamboo Sheet"],
    thicknessRange: "2.0mm - 8.0mm",
    kerfTolerance: "+0.10mm (Snug friction fit)",
    assemblyEase: "Easy (Toolless)",
    rigidityRating: "High Structural",
    pros: [
      "Maximum glue surface area for structural durability",
      "Creates clean, professional, flush-corner furniture boxes",
      "Prevents lateral warping across flat panels",
    ],
    cons: [
      "Longer laser cutting path length",
      "Requires tight kerf tuning to avoid loose fingers",
    ],
    laserInstructions:
      "Cut perimeter finger teeth in RED (#FF0000). Apply kerf compensation offset in CAM software.",
    svgDiagram: (color) => (
      <svg viewBox="0 0 300 180" className="w-full h-auto">
        <rect width="300" height="180" fill="#0f0f13" rx="8" />

        {/* Panel 1 (Top finger teeth) */}
        <path
          d="M 30,50 L 80,50 L 80,70 L 110,70 L 110,50 L 140,50 L 140,70 L 170,70 L 170,50 L 220,50 L 220,90 L 30,90 Z"
          fill="#1e293b"
          stroke={color}
          strokeWidth="2"
        />

        {/* Panel 2 (Bottom interlocking finger teeth) */}
        <path
          d="M 30,130 L 80,130 L 80,70 L 110,70 L 110,90 L 140,90 L 140,70 L 170,70 L 170,130 L 220,130 L 220,90 L 270,90 L 270,130 Z"
          fill="#065f46"
          fillOpacity="0.5"
          stroke="#34d399"
          strokeWidth="2"
          strokeDasharray="4,2"
        />

        {/* Interlocking arrows */}
        <path d="M 95,40 L 95,65 M 125,100 L 125,75" stroke="#f59e0b" strokeWidth="2" />
        <text x="150" y="30" fill="#f59e0b" fontSize="9" fontFamily="monospace">
          COMB TEETH INTERLOCK
        </text>
        <text x="150" y="160" fill="#34d399" fontSize="9" fontFamily="monospace" textAnchor="middle">
          MALE & FEMALE FINGER TEETH LOCK AT 90°
        </text>
      </svg>
    ),
  },

  zip_tie: {
    id: "zip_tie",
    name: "Zip-Tie Lacing Eyelets",
    subtitle: "Stitch-and-Glue Laser-Pierced Cable Tie Eyelets",
    analogy: "👟 Like lacing up a sneaker or stitching fabric together with needle & thread. Pairs of small 3.5mm laser-drilled holes line matching panel edges, and flexible nylon zip-ties or wire loops through them to pull curved sheets together.",
    description:
      "Pairs of 3.5mm laser-cut holes spaced along matching panel edges. Standard nylon zip-ties or wire lacing stitch adjacent panels tightly together.",
    howItWorks:
      "Align matching edge eyelets on panels P-A and P-B. Insert zip-ties through eyelet pairs, pull tight to draw curved panels into position, then snip zip-tie tails.",
    idealMaterials: ["1.5mm - 4.0mm Plywood", "Corrugated Cardboard", "Polypropylene", "Thin Sheet Metal"],
    thicknessRange: "1.0mm - 6.0mm",
    kerfTolerance: "Eyelet Diameter 3.5mm",
    assemblyEase: "Requires Fasteners",
    rigidityRating: "Medium Flexible",
    pros: [
      "Extremely fast to assemble double-curved 3D shells",
      "Forgiving tolerances for complex organic forms",
      "Easy to loosen or adjust during initial dry-fit framing",
    ],
    cons: [
      "Exposed zip-tie heads visible unless covered or resin-sealed",
    ],
    laserInstructions:
      "Cut perimeter in RED (#FF0000). Cut 3.5mm eyelet circles in RED (#FF0000).",
    svgDiagram: (color) => (
      <svg viewBox="0 0 300 180" className="w-full h-auto">
        <rect width="300" height="180" fill="#0f0f13" rx="8" />

        {/* Left Panel */}
        <path d="M 30,40 L 135,40 L 135,140 L 30,140 Z" fill="#1e293b" stroke={color} strokeWidth="2" />
        {/* Right Panel */}
        <path d="M 145,40 L 250,40 L 250,140 L 145,140 Z" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />

        {/* Eyelets on left panel */}
        <circle cx="120" cy="65" r="5" fill="#0f0f13" stroke="#f59e0b" strokeWidth="1.5" />
        <circle cx="120" cy="115" r="5" fill="#0f0f13" stroke="#f59e0b" strokeWidth="1.5" />

        {/* Eyelets on right panel */}
        <circle cx="160" cy="65" r="5" fill="#0f0f13" stroke="#f59e0b" strokeWidth="1.5" />
        <circle cx="160" cy="115" r="5" fill="#0f0f13" stroke="#f59e0b" strokeWidth="1.5" />

        {/* Zip Tie Stitching */}
        <path
          d="M 120,65 C 120,45 160,45 160,65 C 160,85 120,85 120,65"
          fill="none"
          stroke="#00ffcc"
          strokeWidth="3"
        />
        <path
          d="M 120,115 C 120,95 160,95 160,115 C 160,135 120,135 120,115"
          fill="none"
          stroke="#00ffcc"
          strokeWidth="3"
        />

        <text x="140" y="30" fill="#00ffcc" fontSize="9" fontFamily="monospace" textAnchor="middle">
          NYLON ZIP-TIE / WIRE LACE
        </text>
        <text x="140" y="165" fill="#f59e0b" fontSize="9" fontFamily="monospace" textAnchor="middle">
          3.5mm HOLES | 6.0mm EDGE MARGIN | FAST 3D SHELL STITCHING
        </text>
      </svg>
    ),
  },

  living_hinge: {
    id: "living_hinge",
    name: "Living Hinge Kerf Scoring",
    subtitle: "Laser-Cut Kerf Bending Lattice for Sheet Curvature",
    analogy: "📜 Like a wooden roll-top desk cover or a flexible wooden watch band. Cutting hundreds of narrow parallel slits into rigid wood or acrylic allows hard timber to roll smoothly like soft cloth around tight 3D curves.",
    description:
      "A dense lattice matrix of alternating laser cuts that renders rigid materials like wood or acrylic extremely pliable, bending around tight 3D radiuses without breaking.",
    howItWorks:
      "Laser cuts narrow offset slits into the material. The remaining material strips twist under tension, allowing flat timber or plastic to roll into smooth cylindrical tubes or organic curves.",
    idealMaterials: ["3.0mm Baltic Birch Plywood", "MDF", "Acrylic", "Hardboard"],
    thicknessRange: "1.5mm - 4.0mm",
    kerfTolerance: "Lattice Cut Line Pitch = 1.8mm",
    assemblyEase: "Easy (Toolless)",
    rigidityRating: "Medium Flexible",
    pros: [
      "Bends rigid wooden sheets around tight radii down to 12mm",
      "Single-piece seamless curved surfaces with zero joints",
      "Stunning architectural & lighting design aesthetic",
    ],
    cons: [
      "Delicate lattice lines can snap if forced beyond bend radius limit",
    ],
    laserInstructions:
      "Outer cut in RED (#FF0000). Lattice cut lines in RED (#FF0000). Do NOT use vector engrave.",
    svgDiagram: (color) => (
      <svg viewBox="0 0 300 180" className="w-full h-auto">
        <rect width="300" height="180" fill="#0f0f13" rx="8" />

        {/* Bending Wooden Sheet curve */}
        <path
          d="M 30,140 Q 150,20 270,140 L 255,150 Q 150,40 45,150 Z"
          fill="#27272a"
          stroke={color}
          strokeWidth="2"
        />

        {/* Living Hinge Lattice Slots */}
        <g stroke="#00ffcc" strokeWidth="1.5">
          <line x1="80" y1="100" x2="80" y2="120" />
          <line x1="95" y1="85" x2="95" y2="108" />
          <line x1="110" y1="70" x2="110" y2="95" />
          <line x1="125" y1="60" x2="125" y2="85" />
          <line x1="140" y1="52" x2="140" y2="78" />
          <line x1="155" y1="50" x2="155" y2="76" />
          <line x1="170" y1="55" x2="170" y2="80" />
          <line x1="185" y1="65" x2="185" y2="90" />
          <line x1="200" y1="80" x2="200" y2="105" />
          <line x1="215" y1="95" x2="215" y2="120" />
        </g>

        <text x="150" y="30" fill="#00ffcc" fontSize="9" fontFamily="monospace" textAnchor="middle">
          LIVING HINGE KERF LATTICE
        </text>
        <text x="150" y="170" fill="#f59e0b" fontSize="9" fontFamily="monospace" textAnchor="middle">
          PARALLEL CUT SLITS ALLOW WOOD TO BEND LIKE FLEXIBLE CLOTH
        </text>
      </svg>
    ),
  },
};

export default function JoineryShowcaseModal({
  isOpen,
  onClose,
  selectedJointType,
  onSelectJointType,
}: JoineryShowcaseModalProps) {
  const [activeTab, setActiveTab] = useState<JointType>(selectedJointType || "notch");

  if (!isOpen) return null;

  const activeJoint = JOINERY_SHOWCASE_DATA[activeTab];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="relative w-full max-w-5xl bg-[#151518] border border-[#2e2e34] rounded-xl shadow-2xl overflow-hidden text-[#e0e0e0] font-sans flex flex-col h-[88vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2e2e34] bg-[#111113]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-wider uppercase text-white flex items-center space-x-2">
                <span>Digital Fabrication Joinery Showcase</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Interactive Guide
                </span>
              </h2>
              <p className="text-[11px] text-[#888890]">
                Understand CNC router & laser cutting joint methods, kerf tolerances & assembly workflows
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#888890] hover:text-white hover:bg-[#222226] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content Layout */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Left Navigation List of Joinery Methods */}
          <div className="w-full md:w-72 bg-[#111114] border-r border-[#2a2a2e] p-3 space-y-1.5 overflow-y-auto custom-scrollbar">
            <div className="px-2 py-1.5 text-[10px] font-mono font-bold text-[#777] uppercase tracking-wider">
              Select Joinery Method
            </div>

            {(Object.keys(JOINERY_SHOWCASE_DATA) as JointType[]).map((key) => {
              const item = JOINERY_SHOWCASE_DATA[key];
              const isSelected = activeTab === key;
              const isCurrentActiveInApp = selectedJointType === key;

              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`w-full text-left p-3 rounded-lg border transition-all flex flex-col space-y-1 ${
                    isSelected
                      ? "bg-[#1c2333] border-cyan-500/60 text-white shadow-md"
                      : "bg-[#161619] border-[#26262a] text-[#aaa] hover:bg-[#1f1f24] hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">{item.name}</span>
                    {isCurrentActiveInApp && (
                      <span className="text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
                        ACTIVE IN APP
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-[#888] line-clamp-1">{item.subtitle}</span>
                </button>
              );
            })}

            <div className="pt-4 px-2">
              <div className="bg-emerald-950/30 border border-emerald-800/40 p-3 rounded-lg space-y-1.5 text-[11px] text-emerald-300">
                <div className="flex items-center space-x-1 font-semibold text-emerald-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>CAM Laser Standard</span>
                </div>
                <p className="text-[10px] text-emerald-200/80 leading-relaxed">
                  Red lines (#FF0000) = Laser Vector Cut. Blue dashed lines (#0000FF) = Etch Fold Score.
                </p>
              </div>
            </div>
          </div>

          {/* Right Detail Showcase Box */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#151518] custom-scrollbar">
            {/* Title Banner & Set Active Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2a2a2e]">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest block">
                  JOINERY CODE :: {activeJoint.id.toUpperCase()}
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">{activeJoint.name}</h3>
                <p className="text-xs text-cyan-300/80 font-mono mt-0.5">{activeJoint.subtitle}</p>
              </div>

              {selectedJointType !== activeTab ? (
                <button
                  onClick={() => {
                    onSelectJointType(activeTab);
                  }}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Apply to Current 3D Model</span>
                </button>
              ) : (
                <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold rounded-lg flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Currently Applied in Studio</span>
                </div>
              )}
            </div>

            {/* Plain-English Real World Analogy Box */}
            <div className="bg-amber-950/30 border border-amber-500/40 p-4 rounded-xl flex items-start space-x-3 text-amber-200">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold block">
                  EVERYDAY REAL-WORLD ANALOGY
                </span>
                <p className="text-xs font-medium text-amber-100 leading-relaxed">
                  {activeJoint.analogy}
                </p>
              </div>
            </div>

            {/* Interactive SVG Diagram Showcase */}
            <div className="bg-[#0c0c0e] border border-[#2a2a2e] rounded-xl p-4 shadow-inner relative overflow-hidden group">
              <div className="absolute top-3 left-3 bg-black/80 backdrop-blur px-2.5 py-1 rounded border border-white/10 text-[10px] font-mono text-[#aaa]">
                Interactive Laser Cut CAD Blueprint Diagram
              </div>
              {activeJoint.svgDiagram("#38bdf8")}
            </div>

            {/* Key Engineering Specifications Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#1c1c20] p-3 rounded-lg border border-[#2a2a30]">
                <span className="text-[10px] uppercase font-mono text-[#888]">Ideal Materials</span>
                <p className="text-xs font-semibold text-white mt-1 line-clamp-2">
                  {activeJoint.idealMaterials.join(", ")}
                </p>
              </div>
              <div className="bg-[#1c1c20] p-3 rounded-lg border border-[#2a2a30]">
                <span className="text-[10px] uppercase font-mono text-[#888]">Thickness Range</span>
                <p className="text-xs font-semibold text-cyan-400 mt-1">{activeJoint.thicknessRange}</p>
              </div>
              <div className="bg-[#1c1c20] p-3 rounded-lg border border-[#2a2a30]">
                <span className="text-[10px] uppercase font-mono text-[#888]">Kerf Tolerance</span>
                <p className="text-xs font-semibold text-emerald-400 mt-1">{activeJoint.kerfTolerance}</p>
              </div>
              <div className="bg-[#1c1c20] p-3 rounded-lg border border-[#2a2a30]">
                <span className="text-[10px] uppercase font-mono text-[#888]">Assembly Rating</span>
                <p className="text-xs font-semibold text-amber-400 mt-1">{activeJoint.assemblyEase}</p>
              </div>
            </div>

            {/* Description & How it works */}
            <div className="space-y-4">
              <div className="bg-[#1a1a1e] p-4 rounded-xl border border-[#2a2a30] space-y-2">
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center space-x-2">
                  <Info className="w-4 h-4 text-cyan-400" />
                  <span>How This Joint Works</span>
                </h4>
                <p className="text-xs text-[#ccc] leading-relaxed">{activeJoint.description}</p>
                <p className="text-xs text-[#aaa] leading-relaxed pt-1 font-sans">{activeJoint.howItWorks}</p>
              </div>

              {/* Pros & Cons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#16201a] p-4 rounded-xl border border-emerald-900/40 space-y-2">
                  <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Advantages</span>
                  </h5>
                  <ul className="space-y-1.5 text-xs text-emerald-200/90">
                    {activeJoint.pros.map((pro, i) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#241a1a] p-4 rounded-xl border border-rose-900/40 space-y-2">
                  <h5 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Considerations & Limits</span>
                  </h5>
                  <ul className="space-y-1.5 text-xs text-rose-200/90">
                    {activeJoint.cons.map((con, i) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <span className="text-rose-500 font-bold">•</span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Laser Cutting Instructions */}
              <div className="bg-[#1a1813] border border-amber-500/30 p-4 rounded-xl space-y-1 text-xs">
                <span className="text-[10px] font-mono text-amber-400 uppercase font-bold tracking-wider block">
                  CAM & Laser Cutter File Preparation
                </span>
                <p className="text-amber-200/90 font-mono text-[11px]">{activeJoint.laserInstructions}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
