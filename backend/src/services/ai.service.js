import axios from "axios";
/**
 * Generate presentation slides - Primary method
 * Falls back to template-based generation if API fails
 */
export async function generateSlidesWithAI(options) {
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    // If no API key, use template-based generation
    if (!apiKey || apiKey === "" || apiKey === "your-api-key-here") {
        console.log("No valid API key found. Using template-based generation.");
        return generateSlidesSimple(options);
    }
    // Try API generation first
    try {
        return await generateSlidesWithHuggingFace(options);
    }
    catch (error) {
        console.error("API generation failed, falling back to templates:", error.message);
        // Fallback to template-based generation
        return generateSlidesSimple(options);
    }
}
/**
 * Hugging Face API generation (may fail due to API changes)
 */
async function generateSlidesWithHuggingFace(options) {
    const { topic, slideCount = 5, style = "professional", language = "english" } = options;
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    const styleInstructions = {
        professional: "professional, business-oriented",
        casual: "casual, engaging",
        academic: "academic, scholarly",
        creative: "creative, storytelling"
    };
    const prompt = `Create a ${slideCount}-slide presentation about "${topic}".
Style: ${styleInstructions[style]}
Format: Markdown with "---" between slides.
Include: headings, bullet points, examples.`;
    // Try different model endpoints (Hugging Face keeps changing)
    const models = [
        "mistralai/Mistral-7B-Instruct-v0.3",
        "mistralai/Mistral-7B-Instruct-v0.2",
        "google/flan-t5-large",
    ];
    for (const model of models) {
        try {
            const response = await axios.post(`https://api-inference.huggingface.co/models/${model}`, {
                inputs: prompt,
                parameters: {
                    max_new_tokens: 2000,
                    temperature: 0.7,
                    top_p: 0.9,
                    return_full_text: false,
                },
            }, {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                timeout: 60000,
            });
            let generatedText = "";
            if (Array.isArray(response.data) && response.data.length > 0) {
                generatedText = response.data[0].generated_text || "";
            }
            else if (response.data.generated_text) {
                generatedText = response.data.generated_text;
            }
            if (generatedText.trim()) {
                // Clean up
                generatedText = generatedText.trim();
                if (!generatedText.includes("---")) {
                    generatedText = generatedText.replace(/\n## /g, "\n\n---\n\n## ");
                }
                if (!generatedText.startsWith("#")) {
                    generatedText = `# ${topic}\n\n${generatedText}`;
                }
                return generatedText;
            }
        }
        catch (error) {
            console.log(`Model ${model} failed:`, error.response?.data?.error || error.message);
            continue; // Try next model
        }
    }
    // All models failed
    throw new Error("All AI models failed. Using template fallback.");
}
/**
 * Reliable template-based generation (always works, no API needed)
 */
export async function generateSlidesSimple(options) {
    const { topic, slideCount = 5, style = "professional" } = options;
    const slides = [];
    // Title slide
    slides.push(`# ${topic}\n\nA comprehensive ${style} presentation`);
    // Content slides based on style
    const templates = {
        professional: [
            `## Overview\n\n- Introduction to ${topic}\n- Key objectives\n- Expected outcomes`,
            `## Background\n\n- Current situation\n- Market context\n- Key challenges`,
            `## Key Concepts\n\n- Main idea 1\n- Main idea 2\n- Main idea 3`,
            `## Analysis\n\n- Data and insights\n- Trends\n- Patterns`,
            `## Strategy\n\n- Proposed approach\n- Implementation plan\n- Success metrics`,
            `## Benefits\n\n- Advantages\n- ROI\n- Long-term value`,
            `## Action Items\n\n- Next steps\n- Timeline\n- Resources needed`,
            `## Conclusion\n\n- Summary\n- Key takeaways\n- Q&A`
        ],
        casual: [
            `## Hey There!\n\n- What is ${topic}?\n- Why should you care?\n- What we'll cover`,
            `## The Basics\n\n- Simple explanation\n- Real-world examples\n- Common uses`,
            `## Getting Started\n\n- First steps\n- Quick wins\n- Pro tips`,
            `## Cool Stuff\n\n- Interesting facts\n- Success stories\n- Best practices`,
            `## Common Pitfalls\n\n- Mistakes to avoid\n- How to fix them\n- Learning resources`,
            `## Let's Wrap Up\n\n- What we learned\n- Where to go next\n- Questions?`
        ],
        academic: [
            `## Research Overview\n\n- Research question\n- Hypothesis\n- Objectives`,
            `## Literature Review\n\n- Previous studies\n- Theoretical framework\n- Research gaps`,
            `## Methodology\n\n- Research design\n- Data collection methods\n- Analysis approach`,
            `## Results\n\n- Key findings\n- Data analysis\n- Statistical significance`,
            `## Discussion\n\n- Interpretation\n- Implications\n- Limitations`,
            `## Conclusion\n\n- Summary of findings\n- Contributions to field\n- Future research directions`,
            `## References\n\n- Key sources\n- Further reading\n- Citations`
        ],
        creative: [
            `## The Story Begins\n\n- Once upon a time...\n- The challenge\n- Why it matters`,
            `## The Journey\n\n- Setting out\n- Obstacles faced\n- Discoveries made`,
            `## The Turning Point\n\n- Breakthrough moment\n- New perspective\n- Transformation`,
            `## The Impact\n\n- Outcomes\n- Lessons learned\n- Ripple effects`,
            `## The Future\n\n- What's next\n- Your role\n- Call to action`,
            `## The End?\n\n- Or is it just the beginning?\n- Join the adventure\n- Questions?`
        ]
    };
    const selectedTemplates = templates[style] || templates.professional;
    // Add slides up to requested count
    for (let i = 0; i < Math.min(slideCount - 1, selectedTemplates.length); i++) {
        slides.push(selectedTemplates[i]);
    }
    // If more slides needed, add generic ones
    for (let i = selectedTemplates.length; i < slideCount - 1; i++) {
        slides.push(`## Point ${i + 1}\n\n- Detail about ${topic}\n- Supporting information\n- Examples and evidence`);
    }
    return slides.join("\n\n---\n\n");
}
/**
 * Improve existing slides (template-based)
 */
export async function improveSlidesWithAI(content) {
    // For now, just return enhanced version of existing content
    const slides = content.split("---");
    const improved = slides.map(slide => {
        const lines = slide.trim().split("\n");
        // Just add more structure if missing
        if (lines.length < 3) {
            return slide + "\n\n- Key point\n- Supporting detail\n- Example";
        }
        return slide;
    });
    return improved.join("\n\n---\n\n");
}
/**
 * Generate speaker notes (template-based)
 */
export async function generateSpeakerNotes(slideContent) {
    const lines = slideContent.split("\n").filter(l => l.trim());
    const heading = lines.find(l => l.startsWith("#")) || "This slide";
    return `When presenting ${heading.replace(/^#+\s*/, "")}:

1. Start with a strong opening statement
2. Explain each point clearly with examples
3. Engage the audience with questions
4. Pause for understanding
5. Transition smoothly to the next slide

Remember to maintain eye contact and speak clearly.`;
}
