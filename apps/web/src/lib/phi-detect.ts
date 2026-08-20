/**
 * Client-side PHI shape detector.
 *
 * Scans free-text for common PHI patterns: SSN, MRN tokens, and date-of-birth shapes.
 * This is a best-effort heuristic, not a guarantee. It is used to gate form submission
 * on explicit user acknowledgement when suspicious patterns are detected.
 *
 * Never log input text - it may contain PHI.
 */

export interface PhiHit {
  type: 'ssn' | 'mrn' | 'dob'
  snippet: string
}

export interface PhiDetectResult {
  hits: PhiHit[]
}

// SSN: 123-45-6789 or 123456789 (9-digit runs)
const SSN_PATTERN = /\b\d{3}-?\d{2}-?\d{4}\b/g

// MRN: "MRN" token followed by optional whitespace/colon/hash and 4+ digits
const MRN_PATTERN = /\bMRN[\s:#]*\d{4,}\b/gi

// DOB: date of birth shapes - m/d/yy or mm/dd/yyyy etc.
const DOB_PATTERN = /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g

function collectMatches(text: string, pattern: RegExp, type: PhiHit['type']): PhiHit[] {
  const hits: PhiHit[] = []
  let match: RegExpExecArray | null
  // Reset lastIndex on each call since the patterns use the `g` flag.
  pattern.lastIndex = 0
  while ((match = pattern.exec(text)) !== null) {
    hits.push({ type, snippet: match[0] })
  }
  return hits
}

export function detectPhiShape(text: string): PhiDetectResult {
  if (!text) return { hits: [] }

  const hits: PhiHit[] = [
    ...collectMatches(text, SSN_PATTERN, 'ssn'),
    ...collectMatches(text, MRN_PATTERN, 'mrn'),
    ...collectMatches(text, DOB_PATTERN, 'dob'),
  ]

  return { hits }
}
