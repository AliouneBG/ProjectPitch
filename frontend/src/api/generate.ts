export interface PitchRequest {
  projectName: string;
  projectSummary: string;
  projectDescription: string;
  techStack: string;
  keyFeatures: string;
  technicalChallenge: string;
  targetRole?: string;
  targetCompanyType?: string;
}

export interface WeakSpot {
  area: string;
  issueType: "missing" | "weak";
  message: string;
}

export interface PitchResponse {
  simpleExplanation: string;
  technicalExplanation: string;
  interviewAnswer: string;
  engineeringDecisions: string[];
  followUpQuestions: string[];
  weakSpots?: WeakSpot[];
  riskSignals?: string[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export async function generatePitchApi(data: PitchRequest): Promise<PitchResponse> {
  const response = await fetch(`${API_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let errorMsg = 'Failed to generate pitch.';
    try {
      const errBody = await response.json();
      if (errBody.error) {
        errorMsg = errBody.error;
      }
    } catch (e) {
      // JSON parse failed, use default message
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export async function fetchCoaching(weakness: WeakSpot, context: any, mode: 'guide' | 'example' = 'guide'): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/coach`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ weakness, context, mode }),
  });
  if (!response.ok) throw new Error('Failed to fetch coaching');
  const data = await response.json();
  return data.suggestion;
}

export async function fetchRefinement(sectionText: string, instruction: string, sectionType: string, context: any): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/refine`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sectionText, instruction, sectionType, context }),
  });
  if (!response.ok) throw new Error('Failed to refine text');
  const data = await response.json();
  return data.refinedText;
}
