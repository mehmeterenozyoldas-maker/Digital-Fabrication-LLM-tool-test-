import React, { useState, useEffect } from "react";
import {
  X,
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Eye,
  Sliders,
  Layers,
  Sparkles,
} from "lucide-react";
import { Panel } from "../lib/geometry";
import Assembly3DCanvas from "./Assembly3DCanvas";

interface AssemblyViewerProps {
  isOpen: boolean;
  onClose: () => void;
  panels: Panel[];
  topology: string;
  materialPresetId: string;
  jointType: string;
  materialThickness: number;
}

export default function AssemblyViewer({
  isOpen,
  onClose,
  panels,
  topology,
  materialPresetId,
  jointType,
  materialThickness,
}: AssemblyViewerProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [explodedDistance, setExplodedDistance] = useState<number>(0.2);
  const [showAllGhosted, setShowAllGhosted] = useState<boolean>(true);
  const [aiManual, setAiManual] = useState<any>(null);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"3d" | "manual">("3d");

  const totalSteps = panels.length || 1;

  // Auto playback effect
  useEffect(() => {
    let timer: any;
    if (isPlaying && isOpen) {
      timer = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= totalSteps) {
            setIsPlaying(false);
            return totalSteps;
          }
          return prev + 1;
        });
      }, 1200);
    }
    return () => clearInterval(timer);
  }, [isPlaying, totalSteps, isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(totalSteps, prev + 1));
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const fetchAiManual = async () => {
    setIsLoadingAi(true);
    setActiveTab("manual");
    try {
      const res = await fetch("/api/gemini/fabrication-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topology,
          panelCount: panels.length,
          materialPreset: materialPresetId,
          jointType,
          materialThickness,
          nestingEfficiency: 78,
          totalWeightKg: 4.2,
        }),
      });

      const data = await res.json();
      if (data.success && data.manual) {
        setAiManual(data.manual);
      }
    } catch (err) {
      console.error("Failed to generate AI Manual:", err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="relative w-full max-w-5xl bg-[#161618] border border-[#2e2e32] rounded-xl shadow-2xl overflow-hidden text-[#e0e0e0] font-sans flex flex-col h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2e2e32] bg-[#111113]">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#252528] rounded-lg border border-[#38383c]">
              <Cpu className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-wider uppercase text-white">
                3D Digital Fabrication Assembly Guide
              </h2>
              <p className="text-[11px] text-[#888890]">
                Interactive WebGL 3D panel locking sequence & AI assembly protocol
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex bg-[#202024] p-1 rounded-lg border border-[#2f2f35]">
              <button
                onClick={() => setActiveTab("3d")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center space-x-1.5 ${
                  activeTab === "3d"
                    ? "bg-cyan-500 text-black font-semibold"
                    : "text-[#888890] hover:text-white"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>3D WebGL Viewer</span>
              </button>
              <button
                onClick={() => {
                  if (!aiManual && !isLoadingAi) {
                    fetchAiManual();
                  } else {
                    setActiveTab("manual");
                  }
                }}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center space-x-1.5 ${
                  activeTab === "manual"
                    ? "bg-cyan-500 text-black font-semibold"
                    : "text-[#888890] hover:text-white"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Manual</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-[#888890] hover:text-white rounded-md hover:bg-[#252528] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-hidden relative bg-[#0f0f11]">
          {activeTab === "3d" ? (
            <div className="w-full h-full flex flex-col p-5 space-y-4">
              {/* Top Bar Info & View Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#1b1b1e] p-3.5 rounded-lg border border-[#2a2a2e]">
                <div>
                  <span className="text-[10px] uppercase font-mono text-cyan-400 tracking-widest block">
                    STEP {currentStep} OF {totalSteps} — MODULE P-{currentStep - 1}
                  </span>
                  <h3 className="text-xs font-medium text-white mt-0.5 flex items-center space-x-2">
                    <span>Interlock Panel P-{currentStep - 1} via {jointType.replace("_", " ")} slot</span>
                  </h3>
                </div>

                {/* Controls toolbar */}
                <div className="flex items-center space-x-4 text-xs">
                  {/* Exploded View Slider */}
                  <div className="flex items-center space-x-2 bg-[#232328] px-3 py-1.5 rounded-md border border-[#33333a]">
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-[10px] uppercase text-[#999] tracking-wider">
                      Exploded View
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={explodedDistance}
                      onChange={(e) => setExplodedDistance(parseFloat(e.target.value))}
                      className="w-20 h-1 bg-[#444] appearance-none rounded cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:rounded-full"
                    />
                    <span className="font-mono text-[10px] text-cyan-400 w-7">
                      {Math.round(explodedDistance * 100)}%
                    </span>
                  </div>

                  {/* Ghost Wireframe Toggle */}
                  <button
                    onClick={() => setShowAllGhosted(!showAllGhosted)}
                    className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md border text-[11px] transition-colors ${
                      showAllGhosted
                        ? "bg-cyan-950/60 border-cyan-500/50 text-cyan-300"
                        : "bg-[#232328] border-[#33333a] text-[#888890] hover:text-white"
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ghost Grid</span>
                  </button>
                </div>
              </div>

              {/* 3D WebGL Canvas Stage */}
              <div className="flex-1 bg-[#0a0a0c] border border-[#252528] rounded-xl overflow-hidden relative shadow-inner">
                <Assembly3DCanvas
                  panels={panels}
                  currentStep={currentStep}
                  explodedDistance={explodedDistance}
                  materialThickness={materialThickness}
                  showAllGhosted={showAllGhosted}
                  onSelectPanel={(idx) => setCurrentStep(idx + 1)}
                />

                {/* Overlay Hint & Status */}
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur border border-white/10 px-3 py-1.5 rounded text-[10px] text-[#aaa] font-mono pointer-events-none flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Interactive 3D Stage (Drag to Rotate, Scroll to Zoom)</span>
                </div>
              </div>

              {/* Step Playback Controls Bar */}
              <div className="flex items-center justify-between space-x-4 bg-[#18181b] p-3.5 rounded-xl border border-[#2a2a2e]">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentStep(1);
                    }}
                    className="p-2 text-[#888890] hover:text-white bg-[#222226] rounded-lg border border-[#333338] transition-colors"
                    title="Reset to Step 1"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="flex items-center space-x-2 px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs rounded-lg transition-colors"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-4 h-4" />
                        <span>Pause 3D</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Auto-Play 3D</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex-1 flex items-center space-x-3 px-2">
                  <input
                    type="range"
                    min={1}
                    max={totalSteps}
                    value={currentStep}
                    onChange={(e) => {
                      setIsPlaying(false);
                      setCurrentStep(parseInt(e.target.value));
                    }}
                    className="w-full h-1.5 bg-[#333338] appearance-none cursor-pointer rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:rounded-full"
                  />
                  <span className="font-mono text-xs text-cyan-400 font-bold w-14 text-right">
                    {currentStep} / {totalSteps}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setIsPlaying(false);
                      handlePrev();
                    }}
                    disabled={currentStep === 1}
                    className="p-2 text-[#888890] hover:text-white disabled:opacity-30 bg-[#222226] rounded-lg border border-[#333338] transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setIsPlaying(false);
                      handleNext();
                    }}
                    disabled={currentStep === totalSteps}
                    className="p-2 text-[#888890] hover:text-white disabled:opacity-30 bg-[#222226] rounded-lg border border-[#333338] transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* AI Assembly Manual Tab */
            <div className="w-full h-full p-6 overflow-y-auto custom-scrollbar space-y-6">
              {isLoadingAi ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
                  <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-cyan-400 font-mono tracking-wider">
                    CONSULTING GEMINI AI DIGITAL FABRICATION EXPERT...
                  </p>
                </div>
              ) : aiManual ? (
                <div className="space-y-6">
                  {/* Manual Title & Score */}
                  <div className="flex items-center justify-between bg-[#1d1d21] p-5 rounded-xl border border-[#2e2e34]">
                    <div>
                      <h3 className="text-base font-bold text-white uppercase tracking-wide">
                        {aiManual.title}
                      </h3>
                      <p className="text-xs text-emerald-400 mt-1">
                        Material Performance Rating: {aiManual.materialRating}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase text-[#888890] block tracking-wider">
                        Stability Index
                      </span>
                      <span className="text-2xl font-bold font-mono text-cyan-400">
                        {aiManual.structuralStabilityScore}/100
                      </span>
                    </div>
                  </div>

                  {/* Safety & Laser Specs Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#18181b] p-4 rounded-xl border border-[#27272c] space-y-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Fabrication Safety Guidelines</span>
                      </h4>
                      <ul className="space-y-2 text-xs text-[#a0a0a8]">
                        {aiManual.safetyWarnings.map((warn: string, i: number) => (
                          <li key={i} className="flex items-start space-x-2">
                            <span className="text-amber-400 font-mono">•</span>
                            <span>{warn}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-[#18181b] p-4 rounded-xl border border-[#27272c] space-y-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 flex items-center space-x-2">
                        <Cpu className="w-4 h-4" />
                        <span>Laser Cutting Calibration</span>
                      </h4>
                      <div className="space-y-2 text-xs text-[#a0a0a8]">
                        <div>
                          <strong className="text-white block">Speed:</strong>
                          <span>{aiManual.laserSettings.speedTip}</span>
                        </div>
                        <div>
                          <strong className="text-white block">Power:</strong>
                          <span>{aiManual.laserSettings.powerTip}</span>
                        </div>
                        <div>
                          <strong className="text-white block">Air Assist:</strong>
                          <span>{aiManual.laserSettings.airAssist}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Assembly Sequence Steps */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-semibold uppercase tracking-widest text-white border-b border-[#2e2e34] pb-2">
                      Step-By-Step Assembly Protocol
                    </h4>
                    <div className="space-y-3">
                      {aiManual.assemblySequence.map((step: any, idx: number) => (
                        <div
                          key={idx}
                          className="bg-[#18181b] p-4 rounded-xl border border-[#27272c] space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                              PHASE {step.stepNumber}: {step.phaseName}
                            </span>
                          </div>
                          <p className="text-xs text-[#d0d0d8] leading-relaxed">
                            {step.actionDescription}
                          </p>
                          <p className="text-[11px] text-cyan-400 bg-cyan-500/5 p-2 rounded border border-cyan-500/10">
                            <strong>Pro Tip:</strong> {step.proTip}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full space-y-3 text-center">
                  <p className="text-xs text-[#888890]">
                    Click to generate personalized AI assembly instructions from Gemini.
                  </p>
                  <button
                    onClick={fetchAiManual}
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-semibold rounded-md transition-colors"
                  >
                    Generate AI Manual
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
