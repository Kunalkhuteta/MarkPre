import { OpenAI } from "openai";

interface GenerateSlidesOptions {
  topic: string;
  slideCount?: number;
  style?: "professional" | "casual" | "academic" | "creative";
  language?: string;
}

// ✅ OpenAI client pointed at HuggingFace router — exactly like the example
const getHFClient = () =>
  new OpenAI({
    baseURL: "https://router.huggingface.co/v1",
    apiKey: process.env.HUGGINGFACE_API_KEY,
  });

const MODELS = [
  "Qwen/Qwen3-Coder-Next:novita",
  "mistralai/Mistral-7B-Instruct-v0.3:novita",
  "meta-llama/Llama-3.1-8B-Instruct:novita",
];

export async function generateSlidesWithAI(options: GenerateSlidesOptions): Promise<string> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;

  console.log("🔑 HF API Key loaded:", !!apiKey, apiKey?.substring(0, 8));

  if (!apiKey || apiKey === "" || apiKey === "your-api-key-here") {
    console.log("⚠️ No valid API key. Using template-based generation.");
    return generateSlidesSimple(options);
  }

  try {
    return await generateSlidesWithHuggingFace(options);
  } catch (error: any) {
    console.error("❌ HuggingFace failed, falling back to templates:", error.message);
    return generateSlidesSimple(options);
  }
}

async function generateSlidesWithHuggingFace(options: GenerateSlidesOptions): Promise<string> {
  const { topic, slideCount = 5, style = "professional", language = "english" } = options;

  const styleInstructions = {
    professional: "professional, business-oriented, concise",
    casual: "casual, friendly, engaging",
    academic: "academic, scholarly, evidence-based",
    creative: "creative, storytelling, narrative",
  };

  const userPrompt = `Create a ${slideCount}-slide presentation about "${topic}" in ${language}.
Style: ${styleInstructions[style]}

Rules:
- Separate each slide with exactly "---" on its own line
- First slide: use # for the main title
- All other slides: use ## for headings
- Use "- " for bullet points (3-4 per slide)
- Output ONLY the slides, no intro text or explanations

Start directly with the first slide:`;

  const client = getHFClient();

  for (const model of MODELS) {
    try {
      console.log(`🤖 Trying model: ${model}`);

      // ✅ Exact same pattern as the TypeScript example provided
      const chatCompletion = await client.chat.completions.create({
        model,
        messages: [{ role: "user", content: userPrompt }],
        max_tokens: 2000,
        temperature: 0.7,
      });

      console.log(`📦 Raw response from ${model}:`, JSON.stringify(chatCompletion).substring(0, 200));

      const generatedText = chatCompletion.choices[0]?.message?.content?.trim() || "";

      if (generatedText) {
        let cleaned = generatedText;
        if (!cleaned.includes("---")) {
          cleaned = cleaned.replace(/\n## /g, "\n\n---\n\n## ");
        }
        if (!cleaned.startsWith("#")) {
          cleaned = `# ${topic}\n\n${cleaned}`;
        }
        console.log(`✅ Model ${model} succeeded`);
        return cleaned;
      }

      console.log(`⚠️ Model ${model} returned empty content`);
    } catch (error: any) {
      console.error(`❌ Model ${model} failed:`, {
        status: error.status,
        message: error.message,
      });
      continue;
    }
  }

  console.log("⚠️ All models failed. Using template fallback.");
  return generateSlidesSimple(options);
}

export async function generateSlidesSimple(options: GenerateSlidesOptions): Promise<string> {
  const { topic, slideCount = 5, style = "professional" } = options;
  const slides: string[] = [];

  slides.push(`# ${topic}\n\nA comprehensive ${style} presentation`);

  const templates: Record<string, string[]> = {
    professional: [
      `## Overview\n\n- Introduction to ${topic}\n- Key objectives\n- Expected outcomes`,
      `## Background\n\n- Current situation\n- Market context\n- Key challenges`,
      `## Key Concepts\n\n- Main idea 1\n- Main idea 2\n- Main idea 3`,
      `## Analysis\n\n- Data and insights\n- Trends\n- Patterns`,
      `## Strategy\n\n- Proposed approach\n- Implementation plan\n- Success metrics`,
      `## Benefits\n\n- Advantages\n- ROI\n- Long-term value`,
      `## Action Items\n\n- Next steps\n- Timeline\n- Resources needed`,
      `## Conclusion\n\n- Summary\n- Key takeaways\n- Q&A`,
    ],
    casual: [
      `## Hey There!\n\n- What is ${topic}?\n- Why should you care?\n- What we'll cover`,
      `## The Basics\n\n- Simple explanation\n- Real-world examples\n- Common uses`,
      `## Getting Started\n\n- First steps\n- Quick wins\n- Pro tips`,
      `## Cool Stuff\n\n- Interesting facts\n- Success stories\n- Best practices`,
      `## Common Pitfalls\n\n- Mistakes to avoid\n- How to fix them\n- Learning resources`,
      `## Let's Wrap Up\n\n- What we learned\n- Where to go next\n- Questions?`,
    ],
    academic: [
      `## Research Overview\n\n- Research question\n- Hypothesis\n- Objectives`,
      `## Literature Review\n\n- Previous studies\n- Theoretical framework\n- Research gaps`,
      `## Methodology\n\n- Research design\n- Data collection\n- Analysis approach`,
      `## Results\n\n- Key findings\n- Data analysis\n- Statistical significance`,
      `## Discussion\n\n- Interpretation\n- Implications\n- Limitations`,
      `## Conclusion\n\n- Summary of findings\n- Contributions\n- Future research`,
      `## References\n\n- Key sources\n- Further reading\n- Citations`,
    ],
    creative: [
      `## The Story Begins\n\n- Once upon a time...\n- The challenge\n- Why it matters`,
      `## The Journey\n\n- Setting out\n- Obstacles faced\n- Discoveries made`,
      `## The Turning Point\n\n- Breakthrough moment\n- New perspective\n- Transformation`,
      `## The Impact\n\n- Outcomes\n- Lessons learned\n- Ripple effects`,
      `## The Future\n\n- What's next\n- Your role\n- Call to action`,
      `## The End?\n\n- Or is it just the beginning?\n- Join the adventure\n- Questions?`,
    ],
  };

  const selectedTemplates = templates[style] || templates.professional;

  for (let i = 0; i < Math.min(slideCount - 1, selectedTemplates.length); i++) {
    slides.push(selectedTemplates[i]);
  }

  for (let i = selectedTemplates.length; i < slideCount - 1; i++) {
    slides.push(
      `## Point ${i + 1}\n\n- Detail about ${topic}\n- Supporting information\n- Examples`
    );
  }

  return slides.join("\n\n---\n\n");
}

export async function improveSlidesWithAI(content: string): Promise<string> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;

  console.log("🔑 HF Key for improve:", !!apiKey);

  if (apiKey && apiKey !== "" && apiKey !== "your-api-key-here") {
    try {
      const client = getHFClient();

      const chatCompletion = await client.chat.completions.create({
        model: "Qwen/Qwen3-Coder-Next:novita",
        messages: [
          {
            role: "user",
            content: `Improve this presentation. Make bullet points more specific and impactful. Keep the exact same "---" separator format. Return ONLY the improved slides, no extra text.\n\n${content}`,
          },
        ],
        max_tokens: 2000,
        temperature: 0.5,
      });

      const improved = chatCompletion.choices[0]?.message?.content?.trim();

      if (improved) {
        console.log("✅ Slides improved via AI");
        return improved;
      }
    } catch (error: any) {
      console.error("❌ Improve failed:", error.message);
    }
  }

  // Fallback: basic enhancement
  console.log("⚠️ Using basic improve fallback");
  const slides = content.split("---");
  const improved = slides.map((slide) => {
    const lines = slide.trim().split("\n");
    if (lines.length < 3) {
      return slide + "\n\n- Key point\n- Supporting detail\n- Example";
    }
    return slide;
  });
  return improved.join("\n\n---\n\n");
}

export async function generateSpeakerNotes(slideContent: string): Promise<string> {
  const lines = slideContent.split("\n").filter((l) => l.trim());
  const heading = lines.find((l) => l.startsWith("#")) || "This slide";

  return `When presenting ${heading.replace(/^#+\s*/, "")}:

1. Start with a strong opening statement
2. Explain each point clearly with examples
3. Engage the audience with questions
4. Pause for understanding
5. Transition smoothly to the next slide

Remember to maintain eye contact and speak clearly.`;
}