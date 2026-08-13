/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from "react";
import * as THREE from "three";
import Sidebar from "./components/Sidebar";
import Viewport from "./components/Viewport";
import BOMModal from "./components/BOMModal";
import AssemblyViewer from "./components/AssemblyViewer";
import JoineryShowcaseModal from "./components/JoineryShowcaseModal";
import { Panel, TopologyType, PatternType } from "./lib/geometry";
import {
  exportPanelsToSVG,
  exportStructuralGridToSVG,
  JointType,
  calculateNestingReport,
} from "./lib/fabrication";

export default function App() {
  const [resolution, setResolution] = useState<number>(30);
  const [curvature, setCurvature] = useState<number>(1.2);
  const [iterations, setIterations] = useState<number>(150);
  const [patternRadius, setPatternRadius] = useState<number>(0.6);
  const [patternGap, setPatternGap] = useState<number>(0.05);
  const [patternType, setPatternType] = useState<PatternType>("hexagon");
  const [materialThickness, setMaterialThickness] = useState<number>(3.0);
  const [jointType, setJointType] = useState<JointType>("notch");
  const [materialPresetId, setMaterialPresetId] = useState<string>("birch_plywood_3mm");
  const [waveX, setWaveX] = useState<number>(0);
  const [waveZ, setWaveZ] = useState<number>(0);
  const [twistAngle, setTwistAngle] = useState<number>(0);
  const [pinchFactor, setPinchFactor] = useState<number>(0);

  const [showPanelIDs, setShowPanelIDs] = useState<boolean>(true);
  const [showUnderstructure, setShowUnderstructure] = useState<boolean>(false);
  const [showFabricationPreview, setShowFabricationPreview] = useState<boolean>(false);
  
  const [isBOMOpen, setIsBOMOpen] = useState<boolean>(false);
  const [isAssemblyOpen, setIsAssemblyOpen] = useState<boolean>(false);
  const [isJoineryShowcaseOpen, setIsJoineryShowcaseOpen] = useState<boolean>(false);

  const [panels, setPanels] = useState<Panel[]>([]);
  const [topology, setTopology] = useState<TopologyType>("saddle");
  const [mannequinShape, setMannequinShape] = useState<string>("none");
  const [baseGeometry, setBaseGeometry] = useState<THREE.BufferGeometry | null>(null);

  const nestingReport = useMemo(() => {
    return calculateNestingReport(panels, materialPresetId);
  }, [panels, materialPresetId]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#111]">
      <Sidebar
        resolution={resolution}
        setResolution={setResolution}
        curvature={curvature}
        setCurvature={setCurvature}
        iterations={iterations}
        setIterations={setIterations}
        patternRadius={patternRadius}
        setPatternRadius={setPatternRadius}
        patternGap={patternGap}
        setPatternGap={setPatternGap}
        patternType={patternType}
        setPatternType={setPatternType}
        topology={topology}
        setTopology={setTopology}
        materialThickness={materialThickness}
        setMaterialThickness={setMaterialThickness}
        jointType={jointType}
        setJointType={setJointType}
        materialPresetId={materialPresetId}
        setMaterialPresetId={setMaterialPresetId}
        waveX={waveX}
        setWaveX={setWaveX}
        waveZ={waveZ}
        setWaveZ={setWaveZ}
        twistAngle={twistAngle}
        setTwistAngle={setTwistAngle}
        pinchFactor={pinchFactor}
        setPinchFactor={setPinchFactor}
        showPanelIDs={showPanelIDs}
        setShowPanelIDs={setShowPanelIDs}
        showUnderstructure={showUnderstructure}
        setShowUnderstructure={setShowUnderstructure}
        showFabricationPreview={showFabricationPreview}
        setShowFabricationPreview={setShowFabricationPreview}
        onExport={() => exportPanelsToSVG(panels, materialThickness, jointType)}
        onExportGrid={() => {
          exportStructuralGridToSVG(
            baseGeometry,
            resolution,
            materialThickness,
          );
        }}
        panelCount={panels.length}
        mannequinShape={mannequinShape}
        setMannequinShape={setMannequinShape}
        onOpenBOM={() => setIsBOMOpen(true)}
        onOpenAssembly={() => setIsAssemblyOpen(true)}
        onOpenAdvisor={() => setIsAssemblyOpen(true)}
        onOpenJoineryShowcase={() => setIsJoineryShowcaseOpen(true)}
      />

      <div className="absolute inset-0">
        <Viewport
          resolution={resolution}
          curvature={curvature}
          iterations={iterations}
          patternRadius={patternRadius}
          patternGap={patternGap}
          patternType={patternType}
          topology={topology}
          waveX={waveX}
          waveZ={waveZ}
          twistAngle={twistAngle}
          pinchFactor={pinchFactor}
          showPanelIDs={showPanelIDs}
          showUnderstructure={showUnderstructure}
          showFabricationPreview={showFabricationPreview}
          materialThickness={materialThickness}
          jointType={jointType}
          onPanelsGenerated={setPanels}
          onBaseGeometryGenerated={setBaseGeometry}
          mannequinShape={mannequinShape}
        />
      </div>

      <BOMModal
        isOpen={isBOMOpen}
        onClose={() => setIsBOMOpen(false)}
        report={nestingReport}
        materialPresetId={materialPresetId}
        jointType={jointType}
        onExportSVG={() => exportPanelsToSVG(panels, materialThickness, jointType)}
        onOpenAdvisor={() => setIsAssemblyOpen(true)}
      />

      <AssemblyViewer
        isOpen={isAssemblyOpen}
        onClose={() => setIsAssemblyOpen(false)}
        panels={panels}
        topology={topology}
        materialPresetId={materialPresetId}
        jointType={jointType}
        materialThickness={materialThickness}
      />

      <JoineryShowcaseModal
        isOpen={isJoineryShowcaseOpen}
        onClose={() => setIsJoineryShowcaseOpen(false)}
        selectedJointType={jointType}
        onSelectJointType={(newJoint) => {
          setJointType(newJoint);
          setIsJoineryShowcaseOpen(false);
        }}
      />
    </div>
  );
}
