# Realwear Fashion Garment Topologies: Human-Proportioned Speculative Couture

To ensure the parametric designs resemble actual fashion garments (dresses, gowns, and bodices) that wrap beautifully around a human-like form, we are replacing the older speculative topologies with highly recognizable, anatomically-aligned couture shapes.

## Proposed Human-Form Topologies

### 1. Hourglass Pleated Gown (`hourglass_gown`)
- **Visual Form:** A stunning floor-length evening gown. It features a sweetheart neckline at the top, a sharply cinched waist, and a dramatic bell-flare at the hem. Perfect vertical origami pleats flow down the body, scaling dynamically are the shape expands.
- **Mathematical Translation:**
  - $R(z)$ is the hourglass radius function: narrow in the middle, flaring at the top chest and bottom skirt.
  - A semi-torso ellipse wraps the model.
  - $cos(12 \times \theta)$ pleat ridges that scale with $R(z)$.

### 2. Structural Peplum Bodice (`peplum_bodice`)
- **Visual Form:** A high-fashion architectural sleeveless bodice. It wraps the ribcage snugly and flares outward at the hips into a crisp, rigid structural peplum. It features organic, layered ribbing details like high-tech ribbed knits.
- **Mathematical Translation:**
  - Torso curvature with a waist pinch at the bottom-middle.
  - A dramatic flared lip (peplum curve) at the lower edge.
  - Fine horizontal or diagonal ribbed waves superimposed onto the rigid shell.

### 3. Asymmetric Wrap Dress (`slant_dress`)
- **Visual Form:** An elegant asymmetrical wrap dress featuring a diagonal neckline (one-shoulder design) and an overlapping pleated diagonal wrap drape that hugs the body snugly and splits open toward the bottom.
- **Mathematical Translation:**
  - Biased diagonal base profile where width is offset asymmetrically along the vertical axis.
  - High-precision, overlapping folds generated using skewed saw-tooth or absolute sine functions.

---

## 4-Step Implementation Plan

### Step 1: Redefine the Topology Type Definitions
Add the highly descriptive `hourglass_gown`, `peplum_bodice`, and `slant_dress` options in `src/lib/geometry.ts`. We will keep or replace the old, less-recognizable fashion entries so the interface looks polished and coherent.

### Step 2: Implement Perfect Human Torso Proportions in Geometry Code
Program the exact 3D equations inside `generateRelaxedMesh` in `src/lib/geometry.ts`. We will use elegant semi-elliptical cylinder projections to ensure they look like a dress or bodice fitting snugly onto a mannequin/body frame.

### Step 3: Update Interactive Controls in Sidebar
Update `src/components/Sidebar.tsx` to include these three newly designed human-form options with clean, professional retail-luxury labels.

### Step 4: Verify and Run Prettier
Run the compiler and style checks to ensure the app compiles flawlessly with zero bugs or warnings, and check the live dev server.
