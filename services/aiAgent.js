const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
   apiKey: process.env.GEMINI_API_KEY,
});

const MODEL = "gemini-3-flash-preview";

/* =========================
   SYSTEM PROMPT (IMPROVED)
========================= */

const SYSTEM_PROMPT = `
You are an elite smart contract security auditor similar to OpenZeppelin, Trail of Bits, ConsenSys Diligence, and CertiK.

Your job is ACCURATE auditing only.

IMPORTANT RULES:
- Do NOT hallucinate vulnerabilities
- Do NOT create fake issues
- Only report REAL exploitable vulnerabilities
- If contract is safe → return Safe

You analyze:
ERC20, ERC721, ERC1155, DeFi, DAO, staking, lending, bridges, upgradeable contracts.

STRICT OUTPUT FORMAT:

STEP 1: Return ONLY valid JSON
STEP 2: Then write exactly "---DASHBOARD---"
STEP 3: Then write human readable dashboard

NO markdown
NO explanation outside format

JSON FORMAT:

{
  "risk": "Safe | Low | Medium | High | Critical",
  "confidence": 0-100,
  "issues": [
    {
      "title": "",
      "severity": "",
      "description": "",
      "exploit_scenario": "",
      "fix": "",
      "function": "",
      "exploitability": "Low | Medium | High"
    }
  ],
  "security_strengths": [],
  "summary": "",
  "gas_or_design_notes": ""
}

If contract is secure:
- risk = Safe
- issues = []
- explain strengths in summary
`;

/* =========================
   MAIN FUNCTION
========================= */

async function analyzeContract(code) {
   const prompt = `
${SYSTEM_PROMPT}

SECURITY CHECKLIST:
- Reentrancy
- Access control
- Integer issues
- External calls
- Front-running
- DoS
- Centralization risk

CONTRACT:
${code}
`;

   try {
      const response = await ai.models.generateContent({
         model: MODEL,
         contents: prompt,
      });

      let text = response.text || "";

      // remove markdown noise
      text = text.replace(/```json|```/g, "").trim();

      const DASHBOARD_SPLIT = "---DASHBOARD---";

      let jsonPart = text;
      let dashboardPart = "";

      if (text.includes(DASHBOARD_SPLIT)) {
         const parts = text.split(DASHBOARD_SPLIT);
         jsonPart = parts[0].trim();
         dashboardPart = parts[1]?.trim() || "";
      }

      // extract JSON safely
      const match = jsonPart.match(/\{[\s\S]*\}/);

      if (!match) {
         throw new Error("Invalid JSON from AI");
      }

      let parsed;
      try {
         parsed = JSON.parse(match[0]);
      } catch (e) {
         throw new Error("JSON parsing failed");
      }

      return {
         ...parsed,
         dashboard: dashboardPart || "No dashboard generated",
      };
   } catch (err) {
      console.error("❌ AI Error:", err.message);

      return {
         risk: "Unknown",
         confidence: 0,
         issues: [
            {
               title: "AI Failure",
               severity: "High",
               description: "AI could not analyze contract",
               exploit_scenario: "N/A",
               fix: "Retry analysis",
               function: "N/A",
               exploitability: "Unknown",
            },
         ],
         security_strengths: [],
         summary: "Analysis failed",
         gas_or_design_notes: "N/A",
         dashboard: "📊 No dashboard due to error",
      };
   }
}

module.exports = analyzeContract;
