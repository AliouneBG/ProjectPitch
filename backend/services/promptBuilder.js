function buildPrompt(data) {
  let roleContext = "";
  if (data.targetRole) {
    const isFrontend = data.targetRole.toLowerCase().includes('frontend') || data.targetRole.toLowerCase().includes('ui');
    const isBackend = data.targetRole.toLowerCase().includes('backend') || data.targetRole.toLowerCase().includes('data');
    if (isFrontend) {
      roleContext = `They are targeting a "${data.targetRole}" position. Emphasize UI behavior, state management, UX decisions, and frontend performance only if supported by the project details.`;
    } else if (isBackend) {
      roleContext = `They are targeting a "${data.targetRole}" position. Emphasize APIs, data modeling, background processing, and backend performance only if supported by the project details.`;
    } else {
      roleContext = `They are targeting a "${data.targetRole}" position. Tailor the emphasis appropriately for this role.`;
    }
  }

  let companyContext = "";
  if (data.targetCompanyType) {
    const isStartup = data.targetCompanyType.toLowerCase().includes('startup') || data.targetCompanyType.toLowerCase().includes('early');
    const isBigTech = data.targetCompanyType.toLowerCase().includes('big tech') || data.targetCompanyType.toLowerCase().includes('enterprise') || data.targetCompanyType.toLowerCase().includes('faang');
    if (isStartup) {
      companyContext = `They are applying for companies like "${data.targetCompanyType}". Emphasize pragmatism, constraints, and implementation tradeoffs where they are clearly reflected in the project.`;
    } else if (isBigTech) {
      companyContext = `They are applying for companies like "${data.targetCompanyType}". Emphasize scale-related reasoning, failure cases, and architectural tradeoffs only when they are clearly supported by the project details.`;
    } else {
      companyContext = `They are applying for companies like "${data.targetCompanyType}". Contextualize the scope appropriately.`;
    }
  }
    
  const isSparse = 
    (data.projectDescription || '').trim().length < 40 || 
    (data.keyFeatures || '').split(/[,\n]/).filter(f => f.trim().length > 0).length < 2 || 
    !(data.techStack || '').trim() || 
    !(data.technicalChallenge || '').trim();

  const sparseWarning = isSparse 
    ? `\n\nWARNING - THE INPUT IS SPARSE: Do NOT invent missing details, architectures, or APIs. State facts confidently based ONLY on what is there, without fabricating technical depth. (e.g., Do not guess they used a database or Redis if they only said HTML/CSS).` 
    : '';

  return `
You are an experienced software engineer helping a candidate explain a project clearly, truthfully, and naturally in an interview.

CRITICAL RULES (FOLLOW STRICTLY):
1. Write like a real engineer speaking in an interview, not like marketing copy, documentation, or AI-generated filler. Write as spoken interview language, not as a design document, case study, or resume bullet.
2. Avoid generic buzzwords entirely. Do not use phrases like "robust", "scalable", "seamless", "efficient", "performant ecosystem", or "chosen for rapid development".
3. Use concrete engineering reasoning tied to the project's actual constraints and implementation.
4. Prefer specifics over abstraction, but DO NOT invent details.
5. Never fabricate architecture, APIs, tools, metrics, data volume, scale, or design decisions that are not supported by the user's input. Only reference a tool, API, architectural component, scaling concern, or design pattern if it is explicitly stated in the input or is a direct unavoidable implication of the stated stack/features. Do not infer Redis, queues, webhooks, workers, caching, security controls, or scale unless the user clearly mentioned them.
6. If the input is incomplete, stay truthful. It is okay to be slightly general rather than making things up.
7. For follow-up questions, prioritize questions about components explicitly mentioned by the user. Do not ask about advanced architecture that was not described.
8. Ensure the response is concise, high-signal, and something the user could confidently say out loud without sounding scripted or overly formal.
9. Prioritize impact and clarity over completeness. Avoid repeating information across sections.
10. Weak spots and risk signals must focus purely on technical interview defensibility. Identify where the technical explanation is vague, underexplained, or hard to defend. Do NOT critique the product's real-world business viability, legal compliance, or domain correctness. Do NOT add domain severity expectations (e.g., "which is crucial for financial data", "critical data privacy considerations"). Keep focus purely on what an interviewer might ask next.
11. You can return 1 to 3 weaknesses in the \`weakSpots\` array conditionally, provided multiple distinct gaps are clearly present and justified.${sparseWarning}

User's Raw Project Data:
- Name: ${data.projectName}
- Summary: ${data.projectSummary}
- Details: ${data.projectDescription}
- Stack: ${data.techStack}
- Features: ${data.keyFeatures}
- Technical Challenge: ${data.technicalChallenge}

ROLE & COMPANY CONTEXT:
${roleContext}
${companyContext}

Return EXACTLY one valid JSON object with this schema:
{
  "simpleExplanation": "Plain English explanation of what the project does, who it helps, and a concrete outcome. Max 2 sentences.",
  "technicalExplanation": "Concrete technical explanation of how the system works. Max 3 sentences.",
  "interviewAnswer": "A natural 45-60 second spoken answer to 'Tell me about this project.' MUST have a sharp personal hook (e.g., 'One project I am proud of is X, which I built to solve Y...') and focus on impact instead of a flat summary of features.",
  "engineeringDecisions": [
    "1 to 3 concrete tradeoffs grounded in the input (return fewer if the input does not support more)"
  ],
  "followUpQuestions": [
    "1 to 3 realistic follow-up questions (return fewer if the input does not support more)"
  ],
  "weakSpots": [
    {
      "area": "E.g., Scalability, Error Handling, Testing, Architecture",
      "issueType": "missing OR weak",
      "message": "One concise sentence explaining where this technical explanation is vague, underexplained, or hard to defend in an interview context."
    }
  ],
  "riskSignals": [
    "Extremely short one-line warning highlighting a likely technical follow-up question based purely on what the user claimed."
  ]
}

QUALITY BAR:
- The user should sound like they actually built the project.
- The response should feel natural enough to say out loud.
- Do not add markdown fences.
- Return ONLY the JSON object.
  `;
}

module.exports = { buildPrompt };
