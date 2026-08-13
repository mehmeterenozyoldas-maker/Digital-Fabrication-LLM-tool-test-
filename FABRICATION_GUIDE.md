# Digital Fabrication & Assembly Guidelines

## Objective
To improve the usability of exported SVG files for actual laser cutting, CNC routing, and manual assembly of the bending-active modules.

## Immediate Implementation Plan (Step 1)

### 1. Global Joint Identification
**Problem:** Currently, each panel numbers its edges locally (e0, e1, etc.). A user does not know which edge of Panel 1 connects to which edge of Panel 2.
**Solution:** Iterate through all generated panels and match edges that are spatially adjacent in the 3D mesh. Assign a unique Global Joint ID (e.g., `J-1`, `J-2`) to matching pairs and print this ID on the SVG next to the respective edges.

### 2. Laser Cutter Layer Standards
**Problem:** Cutting, scoring, and engraving are all currently mixed or use non-standard colors/widths.
**Solution:** Adopt standard digital fabrication color coding:
- **CUT (Outer boundary & notches):** Red (`#FF0000`), Stroke Width: 1px (or vector hair-line).
- **SCORE/FOLD (Internal lines):** Blue (`#0000FF`), Stroke Width: 1px, Dashed.
- **ENGRAVE (Text labels):** Black (`#000000`), Solid fill.

### 3. Material Thickness Parameterization
**Problem:** Notches are currently hardcoded to 4px wide/deep.
**Solution:** Add a `materialThickness` variable that parametrically controls the notch depth and width based on real-world material (e.g., 3mm plywood, 1mm cardboard) relative to the scale.

## Future Steps
- **1D Bin Packing:** Optimize the layout of parts onto standard sheet sizes (e.g., 24" x 18" or 1200mm x 800mm) instead of a regular grid.
- **Flaps & Rivet Holes:** For flexible materials (like polypropylene), replace notches with overlapping flaps and rivet/bolt holes.
