# Digital Fabrication & Timber Structure Guidelines

## 1. Overview
This document outlines the advanced principles and necessary structural corrections needed to translate our computational surfaces into realistic, stable, and easily assembled physical forms. It covers both the paper/sheet-material paneling and the underlying timber grid structure.

## 2. Timber Under-Structure Realism
Currently, the timber structure in the 3D viewport is visualized as a simple grid of distinct blocks. To make this "more realistic and correct" for real-world construction, we must account for:

### A. Continuous Members (Laths) vs. Discrete Struts
Instead of visualizing independent segments, the wooden structure should ideally represent continuous timber laths (strips) that bend across the surface (like a gridshell). 
* **Fabrication Method:** Steam bending or kerfing.
* **Correction Needed:** The algorithm needs to trace continuous u/v isoparametric curves across the mesh rather than instancing a separate box per edge. This ensures smooth, realistic bending curves.

### B. Joint Node Detailing
If the structure remains discrete (nodes and struts):
* **Fabrication Method:** CNC-milled nodal connectors (e.g., steel brackets or 5-axis milled wooden hubs).
* **Correction Needed:** Add visual and geometric node elements at each vertex where the wooden beams intersect. The beams must be slightly shortened (offset) to accommodate the hardware node.

### C. Structural Depth and Orientation
* Wood naturally bends along its weakest axis. In a gridshell structure or lamella roof, the cross-section of the wood must be oriented so that the "flat" side faces the curvature direction.
* **Correction Needed:** The local Z-axis of each timber member must align perfectly with the surface normal at that specific point, ensuring structural integrity and physical accuracy.

## 3. Surface Paneling & Sheet Fabrication
The geometric panels (hexagons/triangles) sit atop the under-structure.

### A. Flat-folding vs Curvature
* **Unrolling Limitation:** Only developable surfaces (like cones or cylinders) unroll perfectly flat. Doubly-curved surfaces (like saddles and catenoids) require the panels to be triangulated or they must rely on the material's structural tolerance (bending).
* **Workaround:** We use separated/gapped panels and scoring to absorb the Gaussian curvature.

### B. Clear Assembly Logistics in the Blueprint
The generated SVG blueprint must be fool-proof:
1. **Engraving vs. Cutting:** Laser power settings must distinguish between cut-through (red), score (blue dashed), and text engraving (black).
2. **Global Joint IDs:** (e.g., J-42 matches J-42 on an adjacent piece). This eliminates ambiguity.
3. **Panel IDs:** Central numbering (P-10) is essential to cross-reference the 3D viewport with the physical parts.

## 4. Next Development Steps
1. **Update `TimberGrid` Component:** Refactor the instanced mesh from individual edge-boxes to continuous Splines/Tubes representing bent wooden laths.
2. **Add Node Connectors:** Generate spherical or cylindrical joints at the vertices to represent hardware connections.
3. **Collision Detection:** Implement logic in the SVG generator to ensure flaps and text labels never overlap during the bin-packing stage.
4. **Export 3D Model:** Provide a `.obj` or `.stl` export of the timber frame so the user can CNC it.
