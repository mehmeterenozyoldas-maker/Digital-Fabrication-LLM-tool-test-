import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Server-side Gemini AI client initialization
  const getAi = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // API Route: AI Generative Surface Morphing
  app.post("/api/gemini/generate-surface", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ error: "A valid prompt string is required." });
      }

      const ai = getAi();
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `Analyze this architectural / parametric surface request: "${prompt}".
Recommend the optimal base surface topology type and parametric wave/sculpting adjustments to achieve this form.
Allowed topology types: ["saddle", "catenoid", "enneper", "monkey_saddle", "scherk", "helicoid", "lounge_chair", "bench", "pavilion", "lamp_pendant", "lamp_tulip", "lamp_mushroom", "hourglass_gown", "peplum_bodice", "slant_dress", "origami_pleats", "faceted_armor", "voronoi_cantilever", "gyroid_table", "hyperbolic_shell", "schwarz_p", "schwarz_d", "costa_surface", "mobius_strip", "stadium_canopy"].`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              suggestedTopology: {
                type: Type.STRING,
                description: "The closest matching topology type from the allowed list.",
              },
              recommendedCurvature: {
                type: Type.NUMBER,
                description: "Amplitude curvature between 0.1 and 2.0.",
              },
              waveX: {
                type: Type.NUMBER,
                description: "Frequency multiplier for X axis wave between 0.0 and 3.0.",
              },
              waveZ: {
                type: Type.NUMBER,
                description: "Frequency multiplier for Z axis wave between 0.0 and 3.0.",
              },
              twistAngle: {
                type: Type.NUMBER,
                description: "Torsional twist angle in degrees between -180 and 180.",
              },
              pinchFactor: {
                type: Type.NUMBER,
                description: "Waist pinch or waist compression factor between 0.0 and 1.0.",
              },
              designReasoning: {
                type: Type.STRING,
                description: "Concise architectural explanation of why these surface parameters match the user's intent.",
              },
            },
            required: [
              "suggestedTopology",
              "recommendedCurvature",
              "waveX",
              "waveZ",
              "twistAngle",
              "pinchFactor",
              "designReasoning",
            ],
          },
        },
      });

      const resultText = response.text;
      if (!resultText) {
        throw new Error("Empty response from Gemini API");
      }

      const parsedData = JSON.parse(resultText);
      res.json({ success: true, data: parsedData });
    } catch (err: any) {
      console.error("Error in /api/gemini/generate-surface:", err);
      res.status(500).json({
        error: err.message || "Failed to generate AI surface parameters",
      });
    }
  });

  // API Route: AI Fabrication Advisor & Step-by-Step Manual
  app.post("/api/gemini/fabrication-advisor", async (req, res) => {
    try {
      const {
        topology,
        panelCount,
        materialPreset,
        jointType,
        materialThickness,
        nestingEfficiency,
        totalWeightKg,
      } = req.body;

      const ai = getAi();
      const prompt = `You are a Senior Digital Fabrication Expert & Computational Structural Engineer.
Provide a highly rigorous, professional step-by-step Fabrication & Assembly Manual for the following project:
- Base Surface Topology: ${topology}
- Total Bending-Active Panels: ${panelCount}
- Material Preset: ${materialPreset}
- Material Thickness: ${materialThickness} mm
- Joinery Method: ${jointType}
- Sheet Nesting Efficiency: ${nestingEfficiency}%
- Estimated Structural Weight: ${totalWeightKg} kg

Return a JSON document detailing safety guidelines, kerf calibration recommendations, fastener specs, step-by-step assembly order (using Global Joint IDs), and structural stability advice.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              materialRating: { type: Type.STRING },
              structuralStabilityScore: { type: Type.NUMBER, description: "Score out of 100" },
              recommendedAdhesives: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              laserSettings: {
                type: Type.OBJECT,
                properties: {
                  speedTip: { type: Type.STRING },
                  powerTip: { type: Type.STRING },
                  airAssist: { type: Type.STRING },
                },
                required: ["speedTip", "powerTip", "airAssist"],
              },
              safetyWarnings: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              assemblySequence: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    stepNumber: { type: Type.INTEGER },
                    phaseName: { type: Type.STRING },
                    actionDescription: { type: Type.STRING },
                    proTip: { type: Type.STRING },
                  },
                  required: ["stepNumber", "phaseName", "actionDescription", "proTip"],
                },
              },
              structuralMaintenance: { type: Type.STRING },
            },
            required: [
              "title",
              "materialRating",
              "structuralStabilityScore",
              "recommendedAdhesives",
              "laserSettings",
              "safetyWarnings",
              "assemblySequence",
              "structuralMaintenance",
            ],
          },
        },
      });

      const resultText = response.text;
      if (!resultText) {
        throw new Error("Empty response from Gemini API");
      }

      const parsedData = JSON.parse(resultText);
      res.json({ success: true, manual: parsedData });
    } catch (err: any) {
      console.error("Error in /api/gemini/fabrication-advisor:", err);
      res.status(500).json({
        error: err.message || "Failed to generate AI Fabrication manual",
      });
    }
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
