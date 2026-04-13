const { GoogleGenAI } = require('@google/genai');
const crypto = require('crypto');

const mockResponse = {
  simpleExplanation: "A tool that turns a developer's project description into a clear, interview-ready explanation.",
  technicalExplanation: "It uses a React/Vite frontend communicating with a Node/Express backend API. Data is processed locally and passed to a Large Language Model via structured prompting to extract standard interview formats.",
  interviewAnswer: "This is a full-stack tool I built to solve the frustration of translating technical work into interview-ready pitches. I used React on the frontend and Express on the backend. The main challenge was ensuring the LLM consistently returned structured data, which I solved by using strict JSON parsing fallbacks and robust prompt engineering. It taught me a lot about building resilient AI integrations.",
  engineeringDecisions: [
    "Chose React + Vite for fast iteration and a snappy UI.",
    "Node/Express for the backend to handle API proxying and avoid exposing keys.",
    "Zod for rigorous input validation before dropping text into the prompt."
  ],
  followUpQuestions: [
    "How do you handle cases where the LLM API times out?",
    "Can you explain your JSON parsing fallback strategy?",
    "Why did you choose not to use a database for V1?"
  ],
  weakSpots: [
    {
      area: "Technical Depth",
      issueType: "vague",
      message: "The explanation of the validation pipeline is vague and doesn't clarify data flow."
    },
    {
      area: "Error Handling",
      issueType: "weak",
      message: "Fallback regex parsing for JSON is brittle and could be hard to defend if the schema evolves."
    }
  ],
  riskSignals: [
    "Reliance primarily on regex for core parsing logic may trigger reliability questions.",
    "Explanation of API proxying lacks detail on rate-limiting strategies."
  ]
};

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Wraps the API call in an exponential backoff retry loop
async function fetchWithRetry(ai, prompt, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out. The AI took longer than 45 seconds, please try again.')), 45000)
    );
    
    try {
      const fetchPromise = ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return await Promise.race([fetchPromise, timeoutPromise]);
    } catch (error) {
      lastError = error;
      const errorStr = error.message || String(error);
      
      // Determine if it's a transient network/rate limit error
      const isRetryable = errorStr.includes('503') || errorStr.includes('429') || errorStr.includes('timed out');
      
      if (attempt === maxRetries || !isRetryable) {
        throw error;
      }
      
      // Exponential backoff: 2s, 4s, 8s + random jitter
      const waitTime = Math.pow(2, attempt) * 2000 + (Math.random() * 1000);
      console.warn(`[WARN] LLM API temporarily unavailable / high demand. Retrying in ${Math.round(waitTime)}ms...`);
      await delay(waitTime);
    }
  }
  throw lastError;
}

async function generatePitch(prompt) {
  // If GEMINI_API_KEY is missing or explicitly mocked
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'mock' || process.env.GEMINI_API_KEY === 'your_api_key_here') {
    console.log('[LOG] Using mocked LLM response');
    await delay(1500); // Simulate latency
    return mockResponse;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  try {
    // 2. Fetch with resilient retry logic
    const response = await fetchWithRetry(ai, prompt);
    const text = response.text;
    
    // 3. JSON Enforcement Strategy
    let extractedText = text.trim();
    if (extractedText.startsWith('\`\`\`json')) {
      extractedText = extractedText.replace(/^\`\`\`json\n?/, '').replace(/\n?\`\`\`$/, '');
    } else if (extractedText.startsWith('\`\`\`')) {
      extractedText = extractedText.replace(/^\`\`\`\n?/, '').replace(/\n?\`\`\`$/, '');
    }

    try {
      const parsedJSON = JSON.parse(extractedText);
      return parsedJSON;
    } catch (parseError) {
      console.error('[ERROR] Failed to parse JSON from LLM:', extractedText.substring(0, 200) + '...');
      // Fallback: Attempt to extract JSON substring if there's garbage text around it
      const start = extractedText.indexOf('{');
      const end = extractedText.lastIndexOf('}');
      if (start !== -1 && end !== -1 && end > start) {
         try {
           const parsedJSON = JSON.parse(extractedText.substring(start, end + 1));
           return parsedJSON;
         } catch (e) {}
      }
      throw new Error('LLM returned malformed JSON structure');
    }
  } catch (error) {
    console.error('[ERROR] LLM API call failed completely after retries:', error.message);
    throw error;
  }
}

async function generateCoaching(weakness, context, mode = 'guide') {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'mock' || process.env.GEMINI_API_KEY === 'your_api_key_here') {
    await delay(1000);
    if (mode === 'example') {
      return "For the MVP, I implemented the tax calculation as a simplified backend module that processes categorized transaction data and applies a set of predefined rules to estimate the user's tax liability. Once transactions are identified as income or expenses, the system aggregates them and applies basic assumptions to compute a real-time estimate. I intentionally kept the logic straightforward so the app could provide immediate feedback, rather than trying to handle every possible tax scenario.";
    }
    return "Clarify what assumptions your system uses to estimate tax liability and walk through how transaction data is processed to produce the final value. Be ready to explain whether the logic is fixed, configurable, or intentionally simplified for the scope of the project.";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  let prompt = '';
  if (mode === 'example') {
    prompt = `
You are an experienced software engineer acting as an interview coach.
The candidate's project has the following weakness down as a potential red flag:
"${weakness.message}" (Area: ${weakness.area}, Type: ${weakness.issueType})

Here is some brief context about their project:
- Role: ${context.targetRole || 'Software Engineer'}
- Summary: ${context.projectSummary || 'A software project'}

Provide a 2-3 sentence hypothetical example of what the candidate could SAY in an interview to defend against this weakness.
IMPORTANT RULES:
1. This example must be clearly framed as hypothetical and should remain simple, realistic, and consistent with the project description.
2. Examples must include how the system works (data flow + logic), but must not include specific tools, storage patterns, or exact values unless explicitly provided. Structure the example to answer: Where does the data come from? What happens to it? What logic is applied? Why was it kept simple?
3. Do not imply system architecture that was not described, even indirectly. Prefer simple, common patterns over advanced or production-scale architecture (no config tables, separate processes, managed services, Kafka, etc.).
4. The example must directly address the specific weakness described and not introduce unrelated system components.
5. All outputs must sound like spoken interview responses, not written explanations. Voice it in the first person ("I chose to...", "Since this was an MVP, I...").

Return only the plain text example response, no markdown blocks.
`;
  } else {
    prompt = `
You are an experienced software engineer acting as an interview coach.
The candidate's project has the following weakness down as a potential red flag:
"${weakness.message}" (Area: ${weakness.area}, Type: ${weakness.issueType})

Here is some brief context about their project:
- Role: ${context.targetRole || 'Software Engineer'}
- Summary: ${context.projectSummary || 'A software project'}

Provide a lightweight 2-3 sentence suggestion on how the candidate can address this weakness if asked about it in an interview.
IMPORTANT RULES: 
1. Frame your suggestion conditionally. Always use framing like "If your implementation used...", "You can address this by explaining...", or "Acknowledge the limitation and mention...".
2. Tips must only guide what to explain, never suggest what was implemented. Do not use phrases like "You could use retries...". Tell the candidate *what* to clarify (e.g. "Explain how your system handles...").
3. DO NOT assume a specific implementation pattern (e.g., fixed percentage, keyword rules, specific algorithms) unless it is explicitly stated in the weakness or context. Do not provide example implementations, concrete mechanisms, or future architecture.
4. Do not suggest specific tools, technologies, or implementation patterns (e.g., environment variables, secrets managers, encryption methods). Keep guidance high-level.
5. All outputs must sound like spoken interview responses, not written explanations.

Return only the plain text suggestion, no markdown blocks.
`;
  }

  try {
    const response = await fetchWithRetry(ai, prompt);
    return response.text.trim();
  } catch (err) {
    console.error('[ERROR] generateCoaching failed:', err.message);
    throw new Error('Failed to generate coaching suggestion');
  }
}

async function refineText(sectionText, instruction, sectionType, context) {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'mock' || process.env.GEMINI_API_KEY === 'your_api_key_here') {
    await delay(1000);
    return `[Refined] ${sectionText.substring(0, 50)}... (applied: ${instruction})`;
  }

  const instructionMap = {
    'Make it more concise': 'Remove filler and make it punchy, keeping exactly the same core facts.',
    'Make it more technical': 'Increase technical clarity by making system behavior, data flow, and reasoning more explicit, without introducing new details.',
    'Make it more conversational': 'Rewrite to sound more natural and spoken, like an engineer referring to their own work in a casual interview.',
    'Shorten to 30 seconds': 'Condense aggressively so it can be spoken out loud comfortably in under 30 seconds.'
  };
  const mappedInstruction = instructionMap[instruction] || instruction;

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `
You are an experienced software engineer acting as an interview coach.
You act on the following project context:
- Role: ${context.targetRole || 'Software Engineer'}
- Company Type: ${context.targetCompanyType || 'General'}
- Summary: ${context.projectSummary || 'A software project'}

Please rewrite the following excerpt from a candidate's "${sectionType}" explanation.

Original Text:
---
${sectionText}
---

Rules:
1. Apply the instruction: ${mappedInstruction}
2. Keep the core facts exactly the same. DO NOT INVENT new technical details.
3. Preserve the meaning exactly. Keep the same voice as the original, ensuring it sounds like spoken interview language rather than a design doc, case study, or essay tone.
4. Keep the output plain text. Do not add markdown blocks or conversational padding like "Here is the rewritten text". Just return the text.
`;

  try {
    const response = await fetchWithRetry(ai, prompt);
    return response.text.trim();
  } catch (err) {
    console.error('[ERROR] refineText failed:', err.message);
    throw new Error('Failed to refine text');
  }
}

module.exports = { generatePitch, generateCoaching, refineText };
