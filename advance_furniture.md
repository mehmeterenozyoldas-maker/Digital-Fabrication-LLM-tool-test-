# Advanced Computational Furniture: Parametric Generative Design Topologies

This document outlines the design and implementation of 3 highly advanced, mathematically complex, and computationally optimized generative furniture topologies that push the limits of parametric manufacturing.

## Advanced Topologies Overview

### 1. Voronoi Cantilever Lounger (`voronoi_cantilever`)
- **Computational Concept:** An ergonomic cantilevered lounge chair inspired by bionic load-bearing structures. Its shape is governed by an optimized beam-deflection profile with a series of high-frequency Voronoi-like structural rib networks.
- **Mathematical Formula:** 
  - Base profile: $y_{base} = c_{cantilever} \cdot (z/5)^3 - \cos(x/2) \cdot 1.5$ representing the swoop of the backrest and structural seat.
  - Ribbing field: Generative cell boundaries formulated via overlapping absolute distance metrics: $R = \sum \cos(k \cdot x) \cdot \sin(k \cdot z)$ yielding organic, self-supporting structural load fins.

### 2. Gyroid Console Table (`gyroid_table`)
- **Computational Concept:** A high-end architectural side table featuring organic, support pillars that merge seamlessly into a flat desktop, mimicking the micro-structures of Triply Periodic Minimal Surfaces (TPMS).
- **Mathematical Formula:**
  - Approximate Gyroid field function: $F(x, y, z) = \sin(\pi x) \cos(\pi y) + \sin(\pi y) \cos(\pi z) + \sin(\pi z) \cos(\pi x)$.
  - The surface height $y$ is computed by finding the root of the Gyroid field intersecting an organic pedestal projection, creating cellular load paths that transition from a solid slab at the top to hollow lattice support pillars at the ground.

### 3. Hyperbolic Shell Chair (`hyperbolic_shell`)
- **Computational Concept:** A shell chair inspired by Felix Candela's thin-walled architectural structures. It uses a high-order hyperbolic paraboloid system with organic structural edge beams that curve down to form support legs and wings.
- **Mathematical Formula:**
  - Base: Hyperbolic paraboloid $y = \alpha (x^2 - z^2)$ combined with a radial decay function.
  - Boundary envelope: Cut using a polar coordinate boundary curve $r(\theta) = a + b \cos(4\theta)$, giving the chair sculptural curves and integrated leg structures that blend into the primary shell.

---

## 3-Step Development Plan

### Step 1: Update Type Definitions & Architecture [COMPLETED]
- Add the new `"voronoi_cantilever"`, `"gyroid_table"`, and `"hyperbolic_shell"` union values to `TopologyType` in `src/lib/geometry.ts` to ensure full TypeScript type integration.
- Bootstrap the math blocks within `generateRelaxedMesh` in `src/lib/geometry.ts`.

### Step 2: Implement Complex Generative Formulas [COMPLETED]
- Write high-fidelity mathematical equations inside `src/lib/geometry.ts` to model the exact physical surfaces, complete with support ribs, self-supporting trusses, and organic blending.

### Step 3: Integrate and Polish Viewport & Sidebar Controls [ACTIVE]
- Group the new entries under an "Advanced Computational Furniture" section or include them directly in selection controls in the Sidebar.
- Clean up any type validations, linter, formatting, and rebuild the application to verify.
