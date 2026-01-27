/**
 * Gemini API integration for race screenshot OCR
 */

export async function analyzeRaceScreenshot(apiKey, file) {
  const base64Image = await fileToBase64(file);

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

  const prompt = `Analyze this Uma Musume Pretty Derby race result screenshot and extract race data as JSON.

Context:
- Screenshot shows top ~4 finishers from a 9-runner race
- Player's umas have GOLD/YELLOW row background (3 total in race)
- Other umas have white/plain background

Return ONLY this JSON structure (no markdown):
{
  "raceName": "string",
  "raceGrade": "G1/G2/G3/OP or null",
  "venue": "string or null",
  "distance": "string like 1200m",
  "surface": "Turf or Dirt",
  "condition": "Soft/Good/etc or null",
  "results": [
    {
      "position": 1,
      "characterName": "string",
      "isPlayerUma": true/false,
      "trainerName": "string or null"
    }
  ]
}

Only include visible positions. Set isPlayerUma=true for gold background rows.`;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: file.type,
              data: base64Image,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 4096,
    },
  };

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `API request failed: ${response.status}`,
    );
  }

  const data = await response.json();

  // Check for truncation
  const finishReason = data.candidates?.[0]?.finishReason;
  if (finishReason === "MAX_TOKENS") {
    console.warn("Response was truncated due to token limit");
  }

  if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
    throw new Error("Invalid API response format");
  }

  const responseText = data.candidates[0].content.parts[0].text;

  // Parse the JSON from the response
  let jsonStr = responseText.trim();

  // Try to extract JSON if wrapped in markdown code blocks
  const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  // Try to fix truncated JSON by closing brackets
  if (!jsonStr.endsWith("}")) {
    console.warn("Attempting to fix truncated JSON response");
    // Count open brackets and close them
    const openBraces = (jsonStr.match(/{/g) || []).length;
    const closeBraces = (jsonStr.match(/}/g) || []).length;
    const openBrackets = (jsonStr.match(/\[/g) || []).length;
    const closeBrackets = (jsonStr.match(/\]/g) || []).length;

    // Add missing closing brackets
    for (let i = 0; i < openBrackets - closeBrackets; i++) {
      jsonStr += "]";
    }
    for (let i = 0; i < openBraces - closeBraces; i++) {
      jsonStr += "}";
    }
  }

  try {
    const parsed = JSON.parse(jsonStr);

    // Handle both "results" and "visibleResults" keys for compatibility
    const resultsArray = parsed.results || parsed.visibleResults || [];

    if (!Array.isArray(resultsArray)) {
      throw new Error("No race results found in response");
    }

    // Process visible results
    const visibleResults = resultsArray.map((r, idx) => ({
      position: typeof r.position === "number" ? r.position : idx + 1,
      gateNumber: r.gateNumber || null,
      characterName: r.characterName || "Unknown",
      teamName: r.teamName || null,
      trainerName: r.trainerName || null,
      isPlayerUma: r.isPlayerUma === true,
      rank: r.rank || null,
      time: r.time || null,
    }));

    // Extract player's results (gold background umas)
    const playerResults = visibleResults.filter((r) => r.isPlayerUma);
    const playerUmasPlaced = playerResults.length;
    const playerUmasNotPlaced = 3 - playerUmasPlaced; // Player always has 3 umas

    return {
      raceName: parsed.raceName || "Unknown Race",
      raceGrade: parsed.raceGrade || null,
      venue: parsed.venue || null,
      distance: parsed.distance || null,
      surface: parsed.surface || null,
      condition: parsed.condition || null,
      visibleResults: visibleResults,
      playerResults: playerResults,
      playerUmasPlaced: playerUmasPlaced,
      playerUmasNotPlaced: playerUmasNotPlaced,
      lastVisiblePosition:
        visibleResults.length > 0
          ? Math.max(...visibleResults.map((r) => r.position))
          : 0,
    };
  } catch (parseError) {
    console.error("JSON parse error:", parseError, "Response:", responseText);
    throw new Error(
      "Could not parse race results from image. The AI response was incomplete or malformed.",
    );
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function getOrdinalSuffix(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
