# Digital Fabrication & Advanced Geometry Plan

## Step 1: Advanced Topology Topographies
**Goal:** Expand the "Form Finding" module beyond the simple saddle (hyperbolic paraboloid) to include richer minimal surface approximations.
**Details:** 
- Introduce a "Topology" dropdown in the UI.
- Implement starting boundary conditions for different minimal surfaces, such as:
  - **Saddle (Hyperbolic Paraboloid)** - The current default.
  - **Catenoid** - A tube-like minimal surface between two circular rings.
  - **Enneper Surface** - A self-intersecting complex minimal surface.
- Update the mesh relaxation algorithm base generation to accept these different boundary types.

## Step 2: Advanced Tessellation Patterns
**Goal:** Provide more complex and structural pattern generation beyond standard hexagons.
**Details:**
- Introduce a "Pattern Type" dropdown.
- Add support for:
  - **Triangular Grid:** More rigid, non-planar panels.
  - **Kagome/Auxetic Pattern:** Interlocking tri-hex pattern allowing for unique bending properties.
  - **Voronoi Relaxation:** (Optional/Stretch) randomized cell structures based on Lloyd's algorithm.

## Step 3: Joinery & Fabrication Interlocks
**Goal:** Make the exported SVG ready for physical assembly without adhesives.
**Details:**
- Enhance the `exportPanelsToSVG` function.
- Add interlocking slits (notches) along the shared edges of the unrolled panels.
- Include scoring lines (dashed) for bend angles between adjacent panels.
- Add numbering and alignment markers near the joints.
