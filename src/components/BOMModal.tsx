import React from "react";
import { X, FileSpreadsheet, Cpu, DollarSign, Scale, Scissors, AlertTriangle, Layers, Download } from "lucide-react";
import { NestingReport, MATERIAL_PRESETS } from "../lib/fabrication";

interface BOMModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: NestingReport | null;
  materialPresetId: string;
  jointType: string;
  onExportSVG: () => void;
  onOpenAdvisor: () => void;
}

export default function BOMModal({
  isOpen,
  onClose,
  report,
  materialPresetId,
  jointType,
  onExportSVG,
  onOpenAdvisor,
}: BOMModalProps) {
  if (!isOpen || !report) return null;

  const preset = MATERIAL_PRESETS[materialPresetId] || MATERIAL_PRESETS.birch_plywood_3mm;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-2xl bg-[#161618] border border-[#2e2e32] rounded-xl shadow-2xl overflow-hidden text-[#e0e0e0] font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2e2e32] bg-[#111113]">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#252528] rounded-lg border border-[#38383c]">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-wider uppercase text-white">
                Digital Fabrication & Engineering BOM
              </h2>
              <p className="text-[11px] text-[#888890]">
                Material Nesting, Laser Job Metrics & Structural Estimates
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#888890] hover:text-white rounded-md hover:bg-[#252528] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* Material & Spec Summary Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#1e1e22] p-3.5 rounded-lg border border-[#2a2a2e]">
            <div>
              <span className="text-[10px] uppercase text-[#888890] block tracking-wider">
                Material Grade
              </span>
              <span className="text-xs font-medium text-emerald-400 truncate block">
                {preset.name}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-[#888890] block tracking-wider">
                Gauge / Thickness
              </span>
              <span className="text-xs font-mono text-white">
                {preset.thicknessMm} mm
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-[#888890] block tracking-wider">
                Kerf Allowance
              </span>
              <span className="text-xs font-mono text-white">
                ±{preset.kerfMm} mm
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-[#888890] block tracking-wider">
                Joinery Method
              </span>
              <span className="text-xs font-medium text-cyan-400 uppercase">
                {jointType.replace("_", " ")}
              </span>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-[#1b1b1e] p-4 rounded-lg border border-[#28282c]">
              <div className="flex items-center space-x-2 text-cyan-400 mb-2">
                <Layers className="w-4 h-4" />
                <span className="text-[11px] uppercase font-medium tracking-wider">
                  Nesting Yield
                </span>
              </div>
              <div className="text-2xl font-bold text-white font-mono">
                {report.sheetCount}{" "}
                <span className="text-xs font-sans text-[#888890]">
                  Sheets ({report.sheetWidthMm}×{report.sheetHeightMm}mm)
                </span>
              </div>
              <p className="text-[11px] text-[#9999a0] mt-1">
                {report.efficiencyPct}% material utilization efficiency
              </p>
            </div>

            <div className="bg-[#1b1b1e] p-4 rounded-lg border border-[#28282c]">
              <div className="flex items-center space-x-2 text-emerald-400 mb-2">
                <Scissors className="w-4 h-4" />
                <span className="text-[11px] uppercase font-medium tracking-wider">
                  Laser Path Length
                </span>
              </div>
              <div className="text-2xl font-bold text-white font-mono">
                {report.totalCutLengthM}{" "}
                <span className="text-xs font-sans text-[#888890]">Meters</span>
              </div>
              <p className="text-[11px] text-[#9999a0] mt-1">
                ~{report.estimatedLaserTimeMin} min laser job execution
              </p>
            </div>

            <div className="bg-[#1b1b1e] p-4 rounded-lg border border-[#28282c]">
              <div className="flex items-center space-x-2 text-amber-400 mb-2">
                <Scale className="w-4 h-4" />
                <span className="text-[11px] uppercase font-medium tracking-wider">
                  Total Weight
                </span>
              </div>
              <div className="text-2xl font-bold text-white font-mono">
                {report.totalWeightKg}{" "}
                <span className="text-xs font-sans text-[#888890]">kg</span>
              </div>
              <p className="text-[11px] text-[#9999a0] mt-1">
                {report.totalAreaSqM} m² net material area
              </p>
            </div>

            <div className="bg-[#1b1b1e] p-4 rounded-lg border border-[#28282c]">
              <div className="flex items-center space-x-2 text-purple-400 mb-2">
                <DollarSign className="w-4 h-4" />
                <span className="text-[11px] uppercase font-medium tracking-wider">
                  Est. Material Cost
                </span>
              </div>
              <div className="text-2xl font-bold text-white font-mono">
                ${report.estimatedMaterialCostUSD}
              </div>
              <p className="text-[11px] text-[#9999a0] mt-1">
                Based on ${preset.costPerSqM}/m² raw stock
              </p>
            </div>

            <div className="bg-[#1b1b1e] p-4 rounded-lg border border-[#28282c]">
              <div className="flex items-center space-x-2 text-blue-400 mb-2">
                <Cpu className="w-4 h-4" />
                <span className="text-[11px] uppercase font-medium tracking-wider">
                  Total Modules
                </span>
              </div>
              <div className="text-2xl font-bold text-white font-mono">
                {report.panelCount}{" "}
                <span className="text-xs font-sans text-[#888890]">Panels</span>
              </div>
              <p className="text-[11px] text-[#9999a0] mt-1">
                Includes edge joint ID engravings
              </p>
            </div>

            <div className="bg-[#1b1b1e] p-4 rounded-lg border border-[#28282c]">
              <div className="flex items-center space-x-2 text-rose-400 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-[11px] uppercase font-medium tracking-wider">
                  Bending Stress Ratio
                </span>
              </div>
              <div className="text-2xl font-bold text-white font-mono">
                {report.bendingStressSafetyScore}
                <span className="text-xs font-sans text-[#888890]"> / 100</span>
              </div>
              <p className="text-[11px] text-[#9999a0] mt-1">
                Max curvature safety factor
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#2e2e32] bg-[#111113]">
          <button
            onClick={() => {
              onClose();
              onOpenAdvisor();
            }}
            className="px-4 py-2 bg-[#252528] hover:bg-[#323238] border border-[#3a3a40] text-emerald-400 text-xs font-medium rounded-md transition-colors flex items-center space-x-2"
          >
            <Cpu className="w-4 h-4" />
            <span>Generate AI Assembly Manual</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs text-[#888890] hover:text-white transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onExportSVG();
              }}
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold uppercase tracking-wider rounded-md transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download SVG Blueprint</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
