import fs from 'fs';
import path from 'path';

// Common tech skills database
const TECH_SKILLS = {
  languages: ['python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'go', 'rust', 'scala', 'kotlin', 'swift', 'ruby', 'php', 'matlab', 'r', 'sql'],
  frameworks: ['react', 'vue', 'angular', 'express', 'django', 'flask', 'spring', 'nextjs', 'fastapi', 'fastx', 'rail'],
  tools: ['git', 'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'jenkins', 'terraform', 'linux', 'bash'],
  ml: ['tensorflow', 'pytorch', 'sklearn', 'pandas', 'numpy', 'keras', 'huggingface', 'spacy'],
  databases: ['postgresql', 'mysql', 'mongodb', 'redis', 'dynamodb', 'cassandra', 'sqlite'],
  other: ['rest', 'graphql', 'oauth', 'websocket', 'agile', 'scrum', 'jira', 'figma', 'postman']
};

export function parseResume(resumeText) {
  const skills = extractSkills(resumeText);
  const experience = extractExperience(resumeText);
  const education = extractEducation(resumeText);
  
  return {
    skills,
    experience,
    education,
    raw_text: resumeText
  };
}

function extractSkills(text) {
  const lowerText = text.toLowerCase();
  const found = {
    languages: [],
    frameworks: [],
    tools: [],
    ml: [],
    databases: [],
    other: []
  };

  for (const [category, skillList] of Object.entries(TECH_SKILLS)) {
    for (const skill of skillList) {
      if (lowerText.includes(skill)) {
        found[category].push(skill);
      }
    }
  }

  return found;
}

function extractExperience(text) {
  // Look for patterns like "Company Name | Role | Date range"
  const experiencePattern = /([A-Z][a-zA-Z\s]+?)\s*(?:\||–|-)\s*([A-Z][a-zA-Z\s]+?)\s*(?:\||–|-|\n|\d{4})/g;
  const matches = [...text.matchAll(experiencePattern)];
  
  return matches.slice(0, 5).map(match => ({
    company: match[1].trim(),
    role: match[2].trim()
  }));
}

function extractEducation(text) {
  // Look for degree + university patterns
  const degreePattern = /(Bachelor's|Master's|B\.S\.|M\.S\.|B\.A\.|M\.A\.|BS|MS|BA|MA)\s+(?:in\s+)?([a-zA-Z\s]+?)(?:\s+from\s+|,|\n|–|at\s+)?([A-Z][a-zA-Z\s]+University)?/gi;
  const matches = [...text.matchAll(degreePattern)];
  
  return matches.slice(0, 3).map(match => ({
    degree: match[1].trim(),
    field: match[2]?.trim(),
    school: match[3]?.trim()
  }));
}

export function compareSkills(resumeSkills, jobDescription) {
  const jobLowerText = jobDescription.toLowerCase();
  
  // Count matches
  let matches = 0;
  let totalSkillsInResume = 0;

  for (const skillCategory of Object.values(resumeSkills)) {
    totalSkillsInResume += skillCategory.length;
    for (const skill of skillCategory) {
      if (jobLowerText.includes(skill)) {
        matches++;
      }
    }
  }

  // Calculate match percentage
  const matchPercentage = totalSkillsInResume > 0 
    ? Math.round((matches / totalSkillsInResume) * 100)
    : 0;

  return {
    matched_skills: matches,
    total_skills: totalSkillsInResume,
    match_percentage: matchPercentage
  };
}
