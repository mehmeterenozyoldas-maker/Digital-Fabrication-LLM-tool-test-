# PhD-Level Computational Design & Fabrication Roadmap

To elevate this platform from standard parametric modeling (BA Level) to advanced, research-grade computational architecture (PhD Level), we must move beyond primitive mathematical surfaces and uniform grids. We must integrate structural performance, material behavior, and advanced differential geometry directly into the form-generation process.

## 5 "What If" Questions for Advanced Research

### 1. What if form-finding wasn't purely mathematical, but physics-driven?
Currently, our surfaces (saddle, dome) are generated using static mathematical equations ($z = x^2 - y^2$). 
**PhD Trajectory:** Implement *Dynamic Relaxation* or *Particle-Spring Systems* where the form is "found" by simulating physical forces (gravity, tension) on a digital fabric. This results in true minimal surfaces or pure compression shells (catenary vaults) that inherently minimize bending moments.

### 2. What if panelization was driven by Principal Curvature (Asymptotic Lines)?
Naive projection of hexagons onto a doubly-curved surface results in non-planar panels (warping) and stretching.
**PhD Trajectory:** Generate the panelization grid based on the asymptotic curves or lines of principal curvature of the surface. This allows doubly curved surfaces to be built entirely from perfectly flat, unwarped strips of material (e.g., actively bent timber gridshells) without any material distortion.

### 3. What if the under-structure density responded to localized stress?
A uniform timber grid is structurally inefficient; it places material where it isn't needed.
**PhD Trajectory:** Integrate a lightweight Finite Element Analysis (FEA) solver. The timber grid's density, thickness, and layout should dynamically adapt (Topology Optimization), clustering denser webs of timber in areas of high stress or large bending moments, and thinning out in self-supporting areas.

### 4. What if joints were computationally generated, fastener-free wooden interlocks?
Right now, fabrication assumes basic flaps, notches, or manual fasteners.
**PhD Trajectory:** Calculate the dihedral angles between every adjacent face and computationally generate 5-axis robotically CNC-milled integral joints (like digital Japanese joinery). The joints would inherently lock the structure geometrically without screws or glue, factoring in milling bit diameters and insertion vectors.

### 5. What if the assembly blueprint wasn't 2D?
Exporting 2D SVGs for manual assembly becomes impossible for complex, heterogeneous structures with thousands of unique parts.
**PhD Trajectory:** Replace the static blueprint with an embedded Spatial Data pipeline. Generate fiducial AR (Augmented Reality) markers engraved directly onto the nodes, allowing builders wearing AR headsets (e.g., HoloLens/Vision Pro) to see holographic assembly sequences and exact spatial coordinates superimposed in physical space.

---

## Next Immediate Implementation Step
We will push our current implementation limits by adding **Curvature-Driven Dynamic Density** or simulating a **Relaxed Minimal Surface** directly in our geometry generator, representing the leap toward physics-based design.
