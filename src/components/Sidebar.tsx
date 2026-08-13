import React, { useState } from "react";
import {
  Layers,
  Cuboid,
  Download,
  Settings2,
  SlidersHorizontal,
  ChevronRight,
  Activity,
  User,
  Sparkles,
  FileSpreadsheet,
  Cpu,
  Wrench,
  Wand2,
  HelpCircle,
  BookOpen,
} from "lucide-react";

import { TopologyType, PatternType } from "../lib/geometry";
import { JointType, MATERIAL_PRESETS } from "../lib/fabrication";
import { JOINERY_SHOWCASE_DATA } from "./JoineryShowcaseModal";

interface SidebarProps {
  resolution: number;
  setResolution: (val: number) => void;
  curvature: number;
  setCurvature: (val: number) => void;
  iterations: number;
  setIterations: (val: number) => void;
  patternRadius: number;
  setPatternRadius: (val: number) => void;
  patternGap: number;
  setPatternGap: (val: number) => void;
  patternType: PatternType;
  setPatternType: (val: PatternType) => void;
  topology: TopologyType;
  setTopology: (val: TopologyType) => void;
  materialThickness: number;
  setMaterialThickness: (val: number) => void;
  jointType: JointType;
  setJointType: (val: JointType) => void;
  materialPresetId: string;
  setMaterialPresetId: (val: string) => void;
  waveX: number;
  setWaveX: (val: number) => void;
  waveZ: number;
  setWaveZ: (val: number) => void;
  twistAngle: number;
  setTwistAngle: (val: number) => void;
  pinchFactor: number;
  setPinchFactor: (val: number) => void;
  showPanelIDs: boolean;
  setShowPanelIDs: (val: boolean) => void;
  showUnderstructure: boolean;
  setShowUnderstructure: (val: boolean) => void;
  showFabricationPreview: boolean;
  setShowFabricationPreview: (val: boolean) => void;
  onExport: () => void;
  onExportGrid?: () => void;
  panelCount: number;
  mannequinShape: string;
  setMannequinShape: (val: string) => void;
  onOpenBOM: () => void;
  onOpenAssembly: () => void;
  onOpenAdvisor: () => void;
  onOpenJoineryShowcase?: () => void;
}

const ControlGroup = ({ title, icon: Icon, children }: any) => (
  <div className="border-b border-[#2a2a2a] pb-5 mb-5 last:border-0 last:pb-0 last:mb-0">
    <div className="flex items-center space-x-2 text-[#888] mb-4">
      <Icon className="w-3.5 h-3.5" />
      <h2 className="text-[10px] uppercase tracking-[0.2em] font-medium">
        {title}
      </h2>
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

const RangeSlider = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: any) => (
  <div className="space-y-2">
    <div className="flex justify-between items-end">
      <label className="text-xs text-[#a0a0a0] capitalize tracking-wide">
        {label}
      </label>
      <span className="font-mono text-[10px] text-[#e0e0e0] opacity-80">
        {format ? format(value) : value}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-[2px] bg-[#333] appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:bg-[#e0e0e0] [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
    />
  </div>
);

const Select = ({ label, value, options, onChange }: any) => {
  const hasGroups = options.some((opt: any) => opt.group);
  return (
    <div className="space-y-2">
      <label className="text-xs text-[#a0a0a0] capitalize tracking-wide">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-[#111] border border-[#333] rounded-sm py-1.5 px-2.5 text-xs text-[#e0e0e0] appearance-none focus:outline-none focus:border-[#666] tracking-wide"
        >
          {hasGroups
            ? Object.entries(
                options.reduce((acc: any, opt: any) => {
                  const grp = opt.group || "General";
                  if (!acc[grp]) acc[grp] = [];
                  acc[grp].push(opt);
                  return acc;
                }, {}),
              ).map(([groupName, groupOpts]: any) => (
                <optgroup
                  label={groupName}
                  key={groupName}
                  className="bg-[#111] text-[#777] font-semibold text-[11px] uppercase tracking-wider not-italic my-1"
                >
                  {groupOpts.map((opt: any) => (
                    <option
                      key={opt.value}
                      value={opt.value}
                      className="text-[#e0e0e0] font-sans normal-case text-xs"
                    >
                      {opt.label}
                    </option>
                  ))}
                </optgroup>
              ))
            : options.map((opt: any) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
        </select>
        <ChevronRight className="w-3 h-3 text-[#666] absolute right-2.5 top-[8px] rotate-90 pointer-events-none" />
      </div>
    </div>
  );
};

const Checkbox = ({ label, checked, onChange }: any) => (
  <label className="flex items-center space-x-3 text-xs text-[#a0a0a0] cursor-pointer group">
    <div className="relative flex items-center justify-center w-3.5 h-3.5 border border-[#444] rounded-[2px] group-hover:border-[#666] transition-colors">
      {checked && <div className="w-1.5 h-1.5 bg-[#e0e0e0] rounded-sm" />}
    </div>
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="hidden"
    />
    <span className="tracking-wide">{label}</span>
  </label>
);

export default function Sidebar({
  resolution,
  setResolution,
  curvature,
  setCurvature,
  iterations,
  setIterations,
  patternRadius,
  setPatternRadius,
  patternGap,
  setPatternGap,
  patternType,
  setPatternType,
  topology,
  setTopology,
  materialThickness,
  setMaterialThickness,
  jointType,
  setJointType,
  materialPresetId,
  setMaterialPresetId,
  waveX,
  setWaveX,
  waveZ,
  setWaveZ,
  twistAngle,
  setTwistAngle,
  pinchFactor,
  setPinchFactor,
  showPanelIDs,
  setShowPanelIDs,
  showUnderstructure,
  setShowUnderstructure,
  showFabricationPreview,
  setShowFabricationPreview,
  onExport,
  onExportGrid,
  panelCount,
  mannequinShape,
  setMannequinShape,
  onOpenBOM,
  onOpenAssembly,
  onOpenAdvisor,
  onOpenJoineryShowcase,
}: SidebarProps) {
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiReasoning, setAiReasoning] = useState<string>("");

  const handleAiMorph = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    setAiReasoning("");
    try {
      const res = await fetch("/api/gemini/generate-surface", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const {
          suggestedTopology,
          recommendedCurvature,
          waveX: wX,
          waveZ: wZ,
          twistAngle: tw,
          pinchFactor: pf,
          designReasoning,
        } = json.data;

        if (suggestedTopology) setTopology(suggestedTopology);
        if (recommendedCurvature !== undefined) setCurvature(recommendedCurvature);
        if (wX !== undefined) setWaveX(wX);
        if (wZ !== undefined) setWaveZ(wZ);
        if (tw !== undefined) setTwistAngle(tw);
        if (pf !== undefined) setPinchFactor(pf);
        if (designReasoning) setAiReasoning(designReasoning);
      }
    } catch (err) {
      console.error("AI surface morphing error:", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="absolute right-6 top-6 w-[350px] max-h-[calc(100vh-48px)] bg-[#151515]/92 backdrop-blur-xl border border-[#2a2a2a] rounded-lg shadow-2xl flex flex-col text-[#e0e0e0] z-20 overflow-hidden font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2a] bg-[#111]/60">
        <div className="flex items-center space-x-2">
          <Cuboid className="w-4 h-4 text-emerald-400" />
          <h1 className="text-xs font-semibold tracking-widest uppercase">
            FABRICATE::STUDIO
          </h1>
        </div>
        <div className="flex items-center space-x-1.5 text-[10px] font-mono text-[#888]">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse mr-1"></span>
          PARAMETRIC v3
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 custom-scrollbar">
        {/* Gemini AI Surface Generator */}
        <ControlGroup title="AI Surface Morphing" icon={Wand2}>
          <div className="space-y-2">
            <div className="relative">
              <input
                type="text"
                placeholder="e.g., Tensile shell with stadium arches..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAiMorph()}
                className="w-full bg-[#111] border border-[#333] rounded-sm py-1.5 pl-2.5 pr-8 text-xs text-[#e0e0e0] placeholder-[#666] focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleAiMorph}
                disabled={isAiLoading}
                className="absolute right-1.5 top-1.5 text-emerald-400 hover:text-emerald-300 disabled:opacity-50"
              >
                {isAiLoading ? (
                  <div className="w-3.5 h-3.5 border border-emerald-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            {aiReasoning && (
              <p className="text-[10px] text-emerald-400 bg-emerald-950/30 p-2 rounded border border-emerald-800/40 leading-tight">
                {aiReasoning}
              </p>
            )}
          </div>
        </ControlGroup>

        <ControlGroup title="Topology Matrix" icon={Settings2}>
          <Select
            label="Base Surface"
            value={topology}
            onChange={setTopology}
            options={[
              {
                value: "saddle",
                label: "Saddle (Hypar)",
                group: "1. Minimal Math Surfaces",
              },
              {
                value: "catenoid",
                label: "Catenoid",
                group: "1. Minimal Math Surfaces",
              },
              {
                value: "enneper",
                label: "Enneper Surface",
                group: "1. Minimal Math Surfaces",
              },
              {
                value: "monkey_saddle",
                label: "Monkey Saddle",
                group: "1. Minimal Math Surfaces",
              },
              {
                value: "scherk",
                label: "Scherk's Surface",
                group: "1. Minimal Math Surfaces",
              },
              {
                value: "helicoid",
                label: "Helicoid",
                group: "1. Minimal Math Surfaces",
              },
              {
                value: "schwarz_p",
                label: "Schwarz P TPMS Minimal",
                group: "1. Minimal Math Surfaces",
              },
              {
                value: "schwarz_d",
                label: "Schwarz Diamond TPMS",
                group: "1. Minimal Math Surfaces",
              },
              {
                value: "costa_surface",
                label: "Costa Minimal Surface",
                group: "1. Minimal Math Surfaces",
              },
              {
                value: "mobius_strip",
                label: "Möbius Ribbon Shell",
                group: "1. Minimal Math Surfaces",
              },

              {
                value: "lounge_chair",
                label: "Lounge Chair (Ergonomic)",
                group: "2. Classic Furniture",
              },
              {
                value: "bench",
                label: "Undulating Bench",
                group: "2. Classic Furniture",
              },
              {
                value: "pavilion",
                label: "Arch Pavilion",
                group: "2. Classic Furniture",
              },
              {
                value: "stadium_canopy",
                label: "Stadium Canopy Arch",
                group: "2. Classic Furniture",
              },

              {
                value: "lamp_pendant",
                label: "Pendant Lamp (Organic)",
                group: "3. Lighting Fixtures",
              },
              {
                value: "lamp_tulip",
                label: "Tulip Lamp (Flared)",
                group: "3. Lighting Fixtures",
              },
              {
                value: "lamp_mushroom",
                label: "Mushroom Lamp (Ribbed)",
                group: "3. Lighting Fixtures",
              },

              {
                value: "hourglass_gown",
                label: "Hourglass Evening Gown",
                group: "4. Fashion Dress Forms",
              },
              {
                value: "peplum_bodice",
                label: "Peplum Structural Bodice",
                group: "4. Fashion Dress Forms",
              },
              {
                value: "slant_dress",
                label: "Asymmetric Slit Dress",
                group: "4. Fashion Dress Forms",
              },
              {
                value: "origami_pleats",
                label: "Origami Pleats Dress",
                group: "4. Fashion Dress Forms",
              },
              {
                value: "faceted_armor",
                label: "Faceted Wooden Armor",
                group: "4. Fashion Dress Forms",
              },

              {
                value: "voronoi_cantilever",
                label: "Adv: Voronoi Cantilever",
                group: "5. Advanced Generative Furniture",
              },
              {
                value: "gyroid_table",
                label: "Adv: Gyroid Table Surface",
                group: "5. Advanced Generative Furniture",
              },
              {
                value: "hyperbolic_shell",
                label: "Adv: Hyperbolic Shell Chair",
                group: "5. Advanced Generative Furniture",
              },
            ]}
          />
          <RangeSlider
            label="Resolution"
            value={resolution}
            min={10}
            max={50}
            step={1}
            onChange={setResolution}
            format={(v: number) => `${v}U × ${v}V`}
          />
          <RangeSlider
            label="Amplitude"
            value={curvature}
            min={0}
            max={2}
            step={0.05}
            onChange={setCurvature}
            format={(v: number) => v.toFixed(2)}
          />
        </ControlGroup>

        {/* Real-time Parametric Wave & Sculpting Controls */}
        <ControlGroup title="Parametric Wave Sculptor" icon={SlidersHorizontal}>
          <RangeSlider
            label="X Wave Frequency"
            value={waveX}
            min={0}
            max={3.0}
            step={0.1}
            onChange={setWaveX}
            format={(v: number) => v.toFixed(1)}
          />
          <RangeSlider
            label="Z Wave Frequency"
            value={waveZ}
            min={0}
            max={3.0}
            step={0.1}
            onChange={setWaveZ}
            format={(v: number) => v.toFixed(1)}
          />
          <RangeSlider
            label="Torsional Twist"
            value={twistAngle}
            min={-180}
            max={180}
            step={5}
            onChange={setTwistAngle}
            format={(v: number) => `${v}°`}
          />
          <RangeSlider
            label="Waist Pinch"
            value={pinchFactor}
            min={0}
            max={1.0}
            step={0.05}
            onChange={setPinchFactor}
            format={(v: number) => `${Math.round(v * 100)}%`}
          />
        </ControlGroup>

        <ControlGroup title="Solver Setup" icon={Activity}>
          <RangeSlider
            label="Relaxation Cycles"
            value={iterations}
            min={0}
            max={200}
            step={1}
            onChange={setIterations}
          />
        </ControlGroup>

        <ControlGroup title="Drape & Fitting" icon={User}>
          <Select
            label="Mannequin Body"
            value={mannequinShape}
            onChange={setMannequinShape}
            options={[
              { value: "none", label: "None / Deactivated" },
              { value: "standard", label: "Standard Dress Form" },
              { value: "athletic", label: "Athletic Silhouette" },
              { value: "hourglass", label: "Hourglass Curves" },
              { value: "slim", label: "Petite/Slim Contour" },
            ]}
          />
        </ControlGroup>

        <ControlGroup title="Tessellation" icon={Layers}>
          <Select
            label="Pattern Grid"
            value={patternType}
            onChange={setPatternType}
            options={[
              { value: "hexagon", label: "Hexagonal Lattice" },
              { value: "triangle", label: "Triangulated Mesh" },
            ]}
          />
          <RangeSlider
            label="Cell Radius"
            value={patternRadius}
            min={0.2}
            max={2.0}
            step={0.05}
            onChange={setPatternRadius}
            format={(v: number) => v.toFixed(2)}
          />
          <RangeSlider
            label="Expansion Gap"
            value={patternGap}
            min={0.0}
            max={0.2}
            step={0.01}
            onChange={setPatternGap}
            format={(v: number) => v.toFixed(2)}
          />
        </ControlGroup>

        <ControlGroup title="Fabrication & Material Engineering" icon={Wrench}>
          <Select
            label="Material Stock Grade"
            value={materialPresetId}
            onChange={(val: string) => {
              setMaterialPresetId(val);
              const p = MATERIAL_PRESETS[val];
              if (p) setMaterialThickness(p.thicknessMm);
            }}
            options={Object.values(MATERIAL_PRESETS).map((p) => ({
              value: p.id,
              label: `${p.name} (${p.thicknessMm}mm)`,
            }))}
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-[#a0a0a0] capitalize tracking-wide flex items-center space-x-1">
                <span>Joinery Method</span>
              </label>
              {onOpenJoineryShowcase && (
                <button
                  onClick={onOpenJoineryShowcase}
                  className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/50 transition-colors"
                  title="Explore Joinery Examples & Specs"
                >
                  <BookOpen className="w-3 h-3" />
                  <span>Showcase Examples</span>
                </button>
              )}
            </div>

            <Select
              label=""
              value={jointType}
              onChange={setJointType}
              options={[
                { value: "notch", label: "Notch Interlock Slots" },
                { value: "rivet", label: "Rivet Flaps & Eyelets" },
                { value: "finger_joint", label: "Interlocking Finger Teeth" },
                { value: "zip_tie", label: "Zip-Tie Lacing Eyelets" },
                { value: "living_hinge", label: "Living Hinge Kerf Scoring" },
              ]}
            />

            {/* Inline Joinery Info Card */}
            {JOINERY_SHOWCASE_DATA[jointType] && (
              <div className="bg-[#18181c] border border-[#2b2b32] rounded p-2.5 space-y-2 text-[10px]">
                <div className="flex items-center justify-between font-semibold text-cyan-300">
                  <span>{JOINERY_SHOWCASE_DATA[jointType].name}</span>
                  <span className="text-[9px] font-mono bg-cyan-500/10 px-1.5 py-0.5 rounded text-cyan-400 border border-cyan-500/20">
                    {JOINERY_SHOWCASE_DATA[jointType].assemblyEase}
                  </span>
                </div>

                <div className="bg-amber-950/40 border border-amber-500/30 p-2 rounded text-amber-200 text-[10.5px] leading-snug font-medium flex items-start space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{JOINERY_SHOWCASE_DATA[jointType].analogy}</span>
                </div>

                <p className="text-[#888890] leading-tight text-[10px]">
                  {JOINERY_SHOWCASE_DATA[jointType].description}
                </p>

                {onOpenJoineryShowcase && (
                  <button
                    onClick={onOpenJoineryShowcase}
                    className="w-full mt-1 py-1.5 bg-[#22222a] hover:bg-[#2b2b35] text-cyan-400 hover:text-cyan-300 font-mono text-[10px] rounded border border-[#333340] transition-colors flex items-center justify-center space-x-1"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>View Visual 2D/3D Diagram & Specs</span>
                  </button>
                )}
              </div>
            )}
          </div>
          <RangeSlider
            label="Material Gauge"
            value={materialThickness}
            min={0.5}
            max={10.0}
            step={0.5}
            onChange={setMaterialThickness}
            format={(v: number) => `${v.toFixed(1)}mm`}
          />

          <div className="pt-2 space-y-3">
            <Checkbox
              label="Render Panel Annotations"
              checked={showPanelIDs}
              onChange={setShowPanelIDs}
            />
            <Checkbox
              label="Render Structural Grid"
              checked={showUnderstructure}
              onChange={setShowUnderstructure}
            />
            <Checkbox
              label="Fabrication Preview (3D Panels)"
              checked={showFabricationPreview}
              onChange={setShowFabricationPreview}
            />
          </div>
        </ControlGroup>
      </div>

      <div className="p-4 border-t border-[#2a2a2a] bg-[#111]/60 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onOpenBOM}
            className="bg-[#202024] hover:bg-[#2a2a30] border border-[#33333a] text-emerald-400 py-1.5 px-2 rounded-sm flex items-center justify-center space-x-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Fabrication BOM</span>
          </button>
          <button
            onClick={onOpenAssembly}
            className="bg-[#202024] hover:bg-[#2a2a30] border border-[#33333a] text-cyan-400 py-1.5 px-2 rounded-sm flex items-center justify-center space-x-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>3D Assembly</span>
          </button>
        </div>

        <button
          onClick={onExport}
          className="w-full bg-[#e0e0e0] hover:bg-white text-[#111] py-2 rounded-sm flex items-center justify-center space-x-2 text-xs font-semibold uppercase tracking-wider transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export {panelCount} Panels (SVG)</span>
        </button>

        {onExportGrid && (
          <button
            onClick={onExportGrid}
            className="w-full bg-[#111] hover:bg-[#222] border border-[#333] text-[#e0e0e0] py-1.5 rounded-sm flex items-center justify-center space-x-2 text-[11px] font-semibold uppercase tracking-wider transition-colors"
          >
            <Download className="w-3 h-3 text-[#888]" />
            <span>Export Struct Grid</span>
          </button>
        )}
      </div>
    </div>
  );
}

