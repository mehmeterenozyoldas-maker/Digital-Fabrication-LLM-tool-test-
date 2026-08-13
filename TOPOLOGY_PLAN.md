# Advanced Computational Topologies

## Step 1: Monkey Saddle Topology
**Goal:** Implement the Monkey Saddle ($y = x^3 - 3xz^2$), a minimal surface approximation with three "dips" instead of two (like a regular saddle). This creates complex 3-way bending interactions.
**Details:** Add `monkey_saddle` to `TopologyType` and define the boundary conditions based on the cubic equation.

## Step 2: Scherk's Surface Topology
**Goal:** Implement Scherk's first surface, an interesting minimal surface that looks like interlocking orthogonal planes.
**Details:** Add `scherk` to `TopologyType`. Apply carefully clamped logarithmic trigonometric functions ($y = \ln(\cos(x)/\cos(z))$) to the boundary heights to guide the mesh relaxation.

## Step 3: Helicoid Topology
**Goal:** Implement a Helicoid (a spiral ramp or twisted plane), demonstrating torsional twisting along a central axis.
**Details:** Add `helicoid` to `TopologyType` and map the azimuthal angle ($\theta = \arctan2(z, x)$) multiplied by a curvature factor to the boundary heights.

## Step 4: UI Integration & Refinement
**Goal:** Expose the new advanced topologies to the user via the Sidebar.
**Details:** Update the `Sidebar.tsx` dropdown to include the new shapes and tweak the scale/curvature multipliers to ensure they render beautifully within our $10 \times 10$ bounding box.
