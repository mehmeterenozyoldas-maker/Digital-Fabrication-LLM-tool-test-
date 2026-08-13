# Parametric Fashion Topologies: Image Analysis

Based on the uploaded images, the new topologies focus on structured, geometric surface textures over dress-like body contours. 

## 1. Origami Pleats (`origami_pleats`)
**Inspiration:** The first image featuring a white, folded-paper style dress with a complex diamond/chevron pleating pattern.
**Formular Approach:** A Miura-fold or diamond-pleated surface texture mapped onto an hourglass or tapered silhouette. We will use a combination of absolute trigonometric functions (like triangle waves) on the X and Z axes to create sharp, intersecting ridges, superimposed on a gracefully curved base profile.

## 2. Faceted Armor (`faceted_armor`)
**Inspiration:** The second image showing a wooden parametric dress composed of geometric, star-like triangular tessellations.
**Formular Approach:** Generate a base contour and overlay a high-frequency faceted texture. We will achieve this by intersecting multiple continuous sine/cosine waves and manipulating them using `Math.abs` or modulo operators to create sharp, pyramidal peaks extending outward from the surface.

---

## 2-Step Implementation Plan

### Step 1: Update UI and Types
Add `"origami_pleats"` and `"faceted_armor"` to the `TopologyType` union in `src/lib/geometry.ts`. Add the corresponding user-friendly labels to the `<Select>` dropdown in `src/components/Sidebar.tsx` and optionally remove the previous fashion types if no longer needed.

### Step 2: Implement Geometric Formulas
In `src/lib/geometry.ts`, add the mathematical formulas for the new topologies within `generateRelaxedMesh`. Both will first calculate a base underlying curve (resembling a torso or draped body) and then add the specialized sharp, high-frequency mathematical ridges on top of that base shape to mimic the folded origami and faceted wood textures respectively.
