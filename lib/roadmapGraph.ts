export interface RoadmapCert {
  id: number;
  name: string;
  prerequisites?: string[];
  next_certs?: string[];
}

const LEVEL_MARKERS = [
  'associate',
  'professional',
  'expert',
  'fundamentals',
  'practitioner',
  'specialty',
  'speciality',
  'specialist',
  'leader',
  'administrator',
] as const;

/** Maps normalized labels to exact cert names in our dataset */
const NAME_ALIASES: Record<string, string> = {
  'aws cloud practitioner': 'AWS Cloud Practitioner (CLF-C02)',
  'aws solutions architect associate': 'AWS Solutions Architect Associate (SAA-C03)',
  'aws developer associate': 'AWS Developer Associate (DVA-C02)',
  'aws solutions architect professional': 'AWS Solutions Architect Professional (SAP-C02)',
  'aws certified solutions architect professional': 'AWS Solutions Architect Professional (SAP-C02)',
  'aws devops engineer professional': 'AWS DevOps Engineer Professional (DOP-C02)',
  'google cloud professional architect': 'Professional Cloud Architect',
  'google cloud professional ml engineer': 'Professional Machine Learning Engineer',
  'professional data engineer': 'Google Cloud Professional Data Engineer',
  'certified kubernetes administrator': 'Certified Kubernetes Administrator (CKA)',
  'azure security engineer (az-500)': 'Azure Security Engineer Associate (AZ-500)',
  'azure security engineer associate (az-500)': 'Azure Security Engineer Associate (AZ-500)',
  'comptia security+': 'CompTIA Security+ (SY0-701)',
  'comptia network+': 'CompTIA Network+ (N10-009)',
  'ceh': 'CEH (Certified Ethical Hacker)',
  'cissp': 'CISSP (Certified Information Systems Security Professional)',
  'ccsp': 'CCSP (Certified Cloud Security Professional)',
  'power bi data analyst associate': 'Microsoft Power BI Data Analyst Associate (PL-300)',
  'gcp cloud fundamentals': 'Google Cloud Digital Leader',
};

const EXPERIENCE_PATTERN =
  /\d+\s*(?:\+)?\s*years?|work experience|professional experience|contact hours|diploma|bachelor|domains|proficiency|fundamentals knowledge|training required/i;

export function normalizeCertName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractExamCode(text: string): string | null {
  const inParens = text.match(/\(([A-Z]{2,3}-\d{3})\)/i);
  if (inParens) return inParens[1].toUpperCase();

  const bare = text.match(/\b([A-Z]{2,3}-\d{3})\b/i);
  return bare ? bare[1].toUpperCase() : null;
}

function levelMarkersIn(text: string): Set<string> {
  const norm = normalizeCertName(text);
  return new Set(LEVEL_MARKERS.filter((m) => norm.includes(m)));
}

function levelsCompatible(labelNorm: string, certNorm: string): boolean {
  const labelLevels = levelMarkersIn(labelNorm);
  const certLevels = levelMarkersIn(certNorm);

  if (labelLevels.size === 0 || certLevels.size === 0) {
    return true;
  }

  for (const marker of labelLevels) {
    if (!certNorm.includes(marker)) {
      return false;
    }
  }

  for (const marker of certLevels) {
    if (!labelLevels.has(marker)) {
      return false;
    }
  }

  return true;
}

export function cleanPrerequisiteLabel(raw: string): string {
  let label = raw.trim();

  label = label.replace(/\s*(?:strongly\s+)?recommended\.?$/i, '').trim();
  label = label.replace(/\s+or\s+equivalent(?:\s+experience)?\.?$/i, '').trim();
  label = label.replace(/\s+or\s+professional\s+experience\.?$/i, '').trim();
  label = label.replace(/\s+required\b.*$/i, '').trim();

  return label;
}

function isNonCertRequirement(label: string): boolean {
  const norm = normalizeCertName(label);
  if (norm.length < 4) return true;
  if (EXPERIENCE_PATTERN.test(label)) return true;
  return false;
}

const EXAM_CODE_PATTERN = /\b[A-Z]{2,3}-\d{3}\b/;

/** Split "A or B" (and comma-separated exam codes) into separate cert references */
export function parseCertLabels(raw: string): string[] {
  const parts = raw.split(/\s+or\s+/i).flatMap((segment) => {
    if (EXAM_CODE_PATTERN.test(segment) && segment.includes(',')) {
      return segment.split(',').map((piece) => piece.trim());
    }
    return [segment];
  });

  return parts
    .map((part) => cleanPrerequisiteLabel(part))
    .filter((part) => part.length > 0 && !isNonCertRequirement(part));
}

function scoreMatch(label: string, cert: RoadmapCert): number {
  const labelNorm = normalizeCertName(label);
  const certNorm = normalizeCertName(cert.name);

  if (!labelNorm || !levelsCompatible(labelNorm, certNorm)) {
    return 0;
  }

  if (labelNorm === certNorm) {
    return 100;
  }

  const aliasName = NAME_ALIASES[labelNorm];
  if (aliasName && normalizeCertName(aliasName) === certNorm) {
    return 95;
  }

  const labelCode = extractExamCode(label);
  const certCode = extractExamCode(cert.name);
  if (labelCode && certCode && labelCode === certCode) {
    return 92;
  }

  const minPrefixLen = 18;
  if (labelNorm.length >= minPrefixLen && certNorm.startsWith(labelNorm)) {
    return 85;
  }
  if (certNorm.length >= minPrefixLen && labelNorm.startsWith(certNorm)) {
    return 85;
  }

  return 0;
}

/**
 * Resolve a single label to matching certs in the current set.
 * Returns all ties at the top score when score >= 90 (explicit OR paths).
 */
export function resolveCertRef(
  label: string,
  certs: RoadmapCert[]
): RoadmapCert[] {
  const cleaned = cleanPrerequisiteLabel(label);
  if (!cleaned || isNonCertRequirement(cleaned)) {
    return [];
  }

  const scored = certs
    .map((cert) => ({ cert, score: scoreMatch(cleaned, cert) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return [];
  }

  const topScore = scored[0].score;
  if (topScore < 85) {
    return [];
  }

  return scored
    .filter((entry) => entry.score === topScore)
    .map((entry) => entry.cert);
}

export function buildRoadmapGraph(certs: RoadmapCert[]): Map<number, Set<number>> {
  const graph = new Map<number, Set<number>>();
  const certIds = new Set(certs.map((c) => c.id));

  for (const cert of certs) {
    graph.set(cert.id, new Set());
  }

  const seenEdges = new Set<string>();

  const link = (fromId: number, toId: number) => {
    if (fromId === toId) return;
    if (!certIds.has(fromId) || !certIds.has(toId)) return;

    const key = `${fromId}->${toId}`;
    if (seenEdges.has(key)) return;

    // Skip reverse edge (e.g. A→B via next_certs and B→A via prerequisites)
    if (graph.get(toId)?.has(fromId)) return;

    seenEdges.add(key);
    graph.get(fromId)!.add(toId);
  };

  for (const cert of certs) {
    for (const rawLabel of cert.prerequisites ?? []) {
      for (const label of parseCertLabels(rawLabel)) {
        for (const prereq of resolveCertRef(label, certs)) {
          link(prereq.id, cert.id);
        }
      }
    }

    for (const rawLabel of cert.next_certs ?? []) {
      for (const label of parseCertLabels(rawLabel)) {
        for (const next of resolveCertRef(label, certs)) {
          link(cert.id, next.id);
        }
      }
    }
  }

  return graph;
}

function getPredecessors(
  graph: Map<number, Set<number>>,
  nodeId: number
): number[] {
  const preds: number[] = [];
  graph.forEach((deps, fromId) => {
    if (deps.has(nodeId)) {
      preds.push(fromId);
    }
  });
  return preds;
}

export function computeNodeLevels(
  graph: Map<number, Set<number>>,
  certIds: number[]
): Map<number, number> {
  const nodeLevel = new Map<number, number>();
  const visiting = new Set<number>();

  const getLevel = (nodeId: number): number => {
    const cached = nodeLevel.get(nodeId);
    if (cached !== undefined) {
      return cached;
    }

    if (visiting.has(nodeId)) {
      return 0;
    }

    visiting.add(nodeId);

    let maxPrevLevel = -1;
    for (const fromId of getPredecessors(graph, nodeId)) {
      maxPrevLevel = Math.max(maxPrevLevel, getLevel(fromId));
    }

    visiting.delete(nodeId);

    const level = maxPrevLevel + 1;
    nodeLevel.set(nodeId, level);
    return level;
  };

  for (const id of certIds) {
    getLevel(id);
  }

  return nodeLevel;
}

export function groupCertsByLevel(
  nodeLevel: Map<number, number>
): number[][] {
  const levels: number[][] = [];

  nodeLevel.forEach((level, nodeId) => {
    if (!levels[level]) {
      levels[level] = [];
    }
    levels[level].push(nodeId);
  });

  return levels;
}
