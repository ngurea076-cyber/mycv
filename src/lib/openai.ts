import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface CVData {
  firstName: string;
  lastName: string;
  role: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  summary?: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  languages: string[];
}

export interface Experience {
  jobTitle: string;
  company: string;
  location?: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
  achievements?: string;
}

export async function generateSummary(
  role: string,
  skills: string[],
): Promise<string> {
  const prompt = `Generate a professional summary for a ${role} with skills: ${skills.join(", ")}.
  Keep it concise (2-3 sentences), results-oriented, and ATS-friendly.
  Focus on achievements and value proposition.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are a professional CV writer expert. Create compelling, ATS-optimized content.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    max_tokens: 200,
    temperature: 0.7,
  });

  return completion.choices[0]?.message?.content || "";
}

export async function enhanceExperience(
  experience: Experience,
): Promise<string> {
  const prompt = `Enhance these work experience bullet points with action verbs and measurable achievements.
  Job: ${experience.jobTitle} at ${experience.company}
  Description: ${experience.description}
  
  Convert into 3-5 strong bullet points with:
  - Action verbs (achieved, led, developed, implemented, etc.)
  - Quantifiable metrics where possible
  - ATS-friendly keywords
  
  Output as bullet points only.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are a professional CV writer expert. Create compelling, ATS-optimized content with measurable achievements.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    max_tokens: 300,
    temperature: 0.7,
  });

  return completion.choices[0]?.message?.content || "";
}

export async function suggestSkills(role: string): Promise<string[]> {
  const prompt = `List the top 10 most in-demand skills for a ${role} position in Kenya/East Africa.
  Include both technical and soft skills relevant to the role.
  Return as a comma-separated list only.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are a career and tech skills expert with knowledge of the East African job market.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    max_tokens: 150,
    temperature: 0.5,
  });

  const content = completion.choices[0]?.message?.content || "";
  return content
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export interface ATSResult {
  score: number;
  keywordMatch: number;
  missingKeywords: string[];
  suggestions: string[];
}

export async function analyzeATS(
  cvData: CVData,
  jobDescription: string,
): Promise<ATSResult> {
  const cvText = JSON.stringify(cvData);

  const prompt = `Analyze this CV against the job description for ATS (Applicant Tracking System) compatibility.
  
CV Data:
${cvText}

Job Description:
${jobDescription}

Provide:
1. Overall ATS score (0-100)
2. Keyword match percentage
3. List of missing keywords that should be added
4. Specific suggestions to improve the CV

Format as JSON:
{
  "score": number,
  "keywordMatch": number,
  "missingKeywords": string[],
  "suggestions": string[]
}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are an ATS (Applicant Tracking System) expert. Analyze CVs and provide detailed scoring with improvement suggestions. Always respond with valid JSON.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    max_tokens: 500,
    temperature: 0.3,
  });

  try {
    const content = completion.choices[0]?.message?.content || "{}";
    return JSON.parse(content);
  } catch {
    return {
      score: 70,
      keywordMatch: 60,
      missingKeywords: ["Add more keywords from job description"],
      suggestions: ["Review job description and add relevant keywords"],
    };
  }
}

export async function generateCoverLetter(
  cvData: CVData,
  jobTitle: string,
  companyName: string,
  jobDescription: string,
): Promise<string> {
  const prompt = `Write a professional cover letter for:
  
Candidate: ${cvData.firstName} ${cvData.lastName}
Current Role: ${cvData.role}
Skills: ${cvData.skills.join(", ")}
Target Position: ${jobTitle}
Company: ${companyName}

Job Description:
${jobDescription}

Requirements:
- Professional greeting
- Brief introduction mentioning the role
- How the candidate's skills match the job requirements
- Achievements relevant to the role
- Call to action
- Professional closing

Keep it concise (3-4 paragraphs), ATS-friendly, and tailored to the job.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are a professional cover letter writer. Create compelling, tailored cover letters that get results.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    max_tokens: 800,
    temperature: 0.7,
  });

  return completion.choices[0]?.message?.content || "";
}

export async function generatePortfolioContent(
  name: string,
  skills: string[],
  projects: string[],
): Promise<{ bio: string; projectDescriptions: string[] }> {
  const prompt = `Generate professional portfolio content for:
  
Name: ${name}
Skills: ${skills.join(", ")}
Projects: ${projects.join(", ")}

Provide:
1. A compelling professional bio (2-3 sentences)
2. Brief descriptions for each project (what it is, your role, technologies used)

Format as JSON:
{
  "bio": "string",
  "projectDescriptions": ["string", "string"]
}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are a professional portfolio content writer. Create compelling bios and project descriptions.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    max_tokens: 400,
    temperature: 0.7,
  });

  try {
    const content = completion.choices[0]?.message?.content || "{}";
    return JSON.parse(content);
  } catch {
    return {
      bio: `Passionate professional with expertise in ${skills.join(", ")}.`,
      projectDescriptions: projects.map(
        (p) => `${p} - Built with modern technologies.`,
      ),
    };
  }
}
