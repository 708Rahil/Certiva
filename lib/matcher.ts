import { loadAllCertifications } from './certificationLoader';

// ─── Skill Extraction ────────────────────────────────────────────────────────

const SKILL_KEYWORDS: Record<string, string[]> = {
  // Cloud
  'AWS': ['aws', 'amazon web services', 'amazon aws'],
  'Azure': ['azure', 'microsoft azure', 'az-900', 'az900'],
  'GCP': ['gcp', 'google cloud', 'google cloud platform'],
  'Kubernetes': ['kubernetes', 'k8s', 'container orchestration'],
  'cloud computing': ['cloud computing', 'cloud-native', 'cloud infrastructure', 'cloud platform'],
  'cloud services': ['cloud services', 'saas', 'paas', 'iaas', 'cloud solutions'],
  'infrastructure': ['infrastructure', 'on-premise', 'data center', 'servers'],
  'DevOps': ['devops', 'ci/cd', 'continuous integration', 'continuous deployment', 'pipeline'],
  'serverless': ['serverless', 'lambda', 'functions as a service', 'faas'],
  'Docker': ['docker', 'containers', 'containerization'],

  // Networking
  'networking': ['networking', 'network engineering', 'network administration', 'lan', 'wan'],
  'TCP/IP': ['tcp/ip', 'tcp', 'udp', 'protocols', 'network protocols'],
  'DNS': ['dns', 'domain name', 'name resolution'],
  'routing': ['routing', 'routers', 'bgp', 'ospf'],
  'firewalls': ['firewall', 'firewalls', 'packet filtering', 'network defense'],
  'VPN': ['vpn', 'virtual private network', 'remote access'],

  // Security
  'cybersecurity': ['cybersecurity', 'cyber security', 'information security', 'infosec'],
  'network security': ['network security', 'secure network', 'security architecture'],
  'penetration testing': ['penetration testing', 'pen testing', 'pentest', 'ethical hacking'],
  'vulnerability assessment': ['vulnerability assessment', 'vulnerability scanning', 'vulnerability management'],
  'incident response': ['incident response', 'incident management', 'security incident'],
  'risk management': ['risk management', 'risk assessment', 'risk analysis', 'risk mitigation'],
  'cryptography': ['cryptography', 'encryption', 'decryption', 'PKI', 'SSL', 'TLS'],
  'SIEM': ['siem', 'security information', 'splunk', 'qradar'],
  'threat analysis': ['threat analysis', 'threat modeling', 'threat intelligence', 'threat detection'],
  'security policies': ['security policies', 'compliance', 'governance', 'regulatory'],

  // Data
  'SQL': ['sql', 'mysql', 'postgresql', 'sqlite', 'database queries', 'relational database'],
  'Python': ['python', 'python3', 'django', 'flask', 'fastapi'],
  'data analysis': ['data analysis', 'data analyst', 'analytics', 'data-driven', 'data insights'],
  'data visualization': ['data visualization', 'visualization', 'dashboards', 'charts', 'graphs'],
  'machine learning': ['machine learning', 'ml', 'ai', 'artificial intelligence', 'deep learning', 'neural networks'],
  'data science': ['data science', 'data scientist', 'statistical modeling'],
  'statistics': ['statistics', 'statistical analysis', 'regression', 'hypothesis testing'],
  'Excel': ['excel', 'spreadsheets', 'microsoft excel', 'pivot tables'],
  'Tableau': ['tableau', 'tableau desktop', 'tableau server'],
  'business intelligence': ['business intelligence', 'bi', 'power bi', 'qlikview'],
  'pandas': ['pandas', 'dataframes', 'numpy', 'scipy'],

  // Marketing
  'Google Analytics': ['google analytics', 'ga4', 'web analytics', 'google tag manager'],
  'Google Ads': ['google ads', 'adwords', 'ppc', 'pay-per-click', 'paid search'],
  'digital marketing': ['digital marketing', 'online marketing', 'digital advertising'],
  'SEO': ['seo', 'search engine optimization', 'organic search', 'keyword research'],
  'content marketing': ['content marketing', 'content strategy', 'blog', 'copywriting'],
  'social media': ['social media', 'facebook ads', 'instagram', 'linkedin', 'twitter'],
  'email marketing': ['email marketing', 'email campaigns', 'mailchimp', 'klaviyo'],
  'CRM': ['crm', 'salesforce', 'hubspot', 'customer relationship'],
  'marketing metrics': ['marketing metrics', 'kpis', 'roi', 'conversion rate', 'ctr'],

  // Finance
  'financial analysis': ['financial analysis', 'financial modeling', 'financial statements'],
  'investment management': ['investment management', 'portfolio', 'asset management'],
  'equity valuation': ['equity valuation', 'stock analysis', 'equity research', 'securities'],
  'fixed income': ['fixed income', 'bonds', 'debt securities'],
  'financial markets': ['financial markets', 'capital markets', 'trading', 'market analysis'],
  'Bloomberg Terminal': ['bloomberg', 'bloomberg terminal'],
  'economics': ['economics', 'macroeconomics', 'microeconomics', 'econometrics'],

  // Management
  'project management': ['project management', 'project manager', 'project planning', 'project delivery'],
  'agile': ['agile', 'scrum', 'kanban', 'sprint', 'jira'],
  'leadership': ['leadership', 'team lead', 'managing teams', 'team management'],
  'stakeholder management': ['stakeholder', 'stakeholders', 'client management'],

  // AI/ML
  'TensorFlow': ['tensorflow', 'tf', 'tf2'],
  'PyTorch': ['pytorch', 'torch'],
  'Keras': ['keras'],
  'deep learning': ['deep learning', 'deep neural networks', 'dnn'],
  'neural networks': ['neural networks', 'neural network', 'ann', 'cnn', 'rnn'],
  'NLP': ['nlp', 'natural language processing', 'text mining', 'text analytics'],
  'computer vision': ['computer vision', 'image recognition', 'object detection', 'image classification'],
  'generative AI': ['generative ai', 'gen ai', 'genai', 'llm', 'llms', 'large language model', 'chatgpt', 'gpt'],
  'transformers': ['transformers', 'transformer models', 'bert', 'attention mechanism'],
  'MLflow': ['mlflow', 'ml flow', 'experiment tracking'],
  'Databricks': ['databricks', 'databricks lakehouse', 'lakehouse'],
  'SageMaker': ['sagemaker', 'amazon sagemaker'],
  'Hugging Face': ['hugging face', 'huggingface'],
  'model deployment': ['model deployment', 'model serving', 'mlops', 'ml ops'],
  'feature engineering': ['feature engineering', 'feature store', 'feature extraction'],
  'Apache Spark': ['apache spark', 'spark', 'pyspark'],
  'Kafka': ['kafka', 'apache kafka', 'kafka streams', 'event streaming'],
  'dbt': ['dbt', 'data build tool'],
  'Apache Airflow': ['apache airflow', 'airflow', 'dag', 'dags'],
  'Delta Lake': ['delta lake', 'delta'],

  // Business / CRM
  'Salesforce': ['salesforce', 'sfdc', 'salesforce crm'],
  'ServiceNow': ['servicenow', 'service now', 'snow'],
  'Dynamics 365': ['dynamics 365', 'dynamics365', 'd365', 'microsoft dynamics'],
  'ITIL': ['itil', 'itil 4', 'it service management', 'itsm'],
  'Apex': ['apex', 'salesforce apex'],
  'Lightning Web Components': ['lightning web components', 'lwc', 'lightning'],
  'SOQL': ['soql', 'salesforce queries'],

  // Networking / Infrastructure
  'Cisco': ['cisco', 'ccna', 'ccnp', 'ccie'],
  'SD-WAN': ['sd-wan', 'sdwan', 'software-defined wan'],
  'BGP': ['bgp', 'border gateway protocol'],
  'OSPF': ['ospf', 'open shortest path first'],
  'VMware': ['vmware', 'vsphere', 'vcenter', 'esxi'],
  'virtualization': ['virtualization', 'virtual machines', 'vm', 'vms', 'hypervisor'],
  'Red Hat': ['red hat', 'redhat', 'rhel', 'rhcsa', 'rhce'],
  'Ansible': ['ansible', 'ansible playbook', 'ansible tower', 'configuration management'],
  'Podman': ['podman', 'buildah'],
  'SELinux': ['selinux', 'security enhanced linux'],
  'system administration': ['system administration', 'sysadmin', 'sys admin', 'systems administration'],

  // General Tech
  'Node.js': ['node.js', 'nodejs', 'express', 'backend javascript'],
  'Linux': ['linux', 'unix', 'bash', 'shell scripting', 'command line'],
  'JavaScript': ['javascript', 'js', 'typescript', 'react', 'vue', 'angular'],
};

// Build a dynamic list of lowercase skills, mapping back to their original display names
let DYNAMIC_SKILL_KEYWORDS: Record<string, string[]> = {};

function getDynamicSkillKeywords(): Record<string, string[]> {
  if (Object.keys(DYNAMIC_SKILL_KEYWORDS).length === 0) {
    try {
      const certs = loadAllCertifications();
      const tempSkills = new Set<string>();

      for (const cert of certs) {
        if (cert.skills) {
          cert.skills.forEach(s => tempSkills.add(s));
        }
        if (cert.primary_skills) {
          cert.primary_skills.forEach(s => {
            // Only add if it's a real skill (not a related certification)
            if (!isCertificationName(s)) {
              tempSkills.add(s);
            }
          });
        }
        if (cert.secondary_skills) {
          cert.secondary_skills.forEach(s => {
            if (!isCertificationName(s)) {
              tempSkills.add(s);
            }
          });
        }
      }

      const finalKeywords: Record<string, string[]> = {};

      // Seed with default hardcoded mappings (retaining aliases/synonyms)
      for (const [skill, keywords] of Object.entries(SKILL_KEYWORDS)) {
        finalKeywords[skill] = keywords.map(kw => kw.toLowerCase());
      }

      // Add all skills from certifications if not already represented
      for (const skill of tempSkills) {
        const skillLower = skill.toLowerCase();
        const exists = Object.keys(finalKeywords).some(k => k.toLowerCase() === skillLower);
        if (!exists) {
          finalKeywords[skill] = [skillLower];
        }
      }

      DYNAMIC_SKILL_KEYWORDS = finalKeywords;
    } catch (e) {
      console.error('Failed to load dynamic skill keywords, falling back to static keywords', e);
      DYNAMIC_SKILL_KEYWORDS = SKILL_KEYWORDS;
    }
  }
  return DYNAMIC_SKILL_KEYWORDS;
}

// Helper to avoid importing certification names as skills (since JSONs have them in primary_skills/secondary_skills occasionally)
function isCertificationName(name: string): boolean {
  const lowercase = name.toLowerCase();
  const certKeywords = [
    'google', 'comptia', 'aws', 'azure', 'cisco', 'ccna', 'cissp', 'pmp', 'capm',
    'oscp', 'ceh', 'cfa', 'cysa', 'gpen', 'splunk', 'cert', 'specialization', 'academy'
  ];
  return certKeywords.some(kw => lowercase.includes(kw));
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function extractSkills(text: string): string[] {
  const lower = text.toLowerCase();
  const found = new Set<string>();
  const skillKeywords = getDynamicSkillKeywords();

  for (const [skill, keywords] of Object.entries(skillKeywords)) {
    for (const kw of keywords) {
      const kwLower = kw.toLowerCase();
      // Use clean boundaries for short keywords to prevent false sub-word matches
      if (kwLower.length <= 3) {
        if (testAlias(lower, kwLower)) {
          found.add(skill);
          break;
        }
      } else {
        if (lower.includes(kwLower)) {
          found.add(skill);
          break;
        }
      }
    }
  }

  return Array.from(found);
}

// Safely match terms ensuring they are not part of a larger alphanumeric word
function testAlias(text: string, alias: string): boolean {
  const escaped = escapeRegExp(alias);
  const pattern = `(?:^|[^a-zA-Z0-9_])(${escaped})(?:$|[^a-zA-Z0-9_])`;
  const regex = new RegExp(pattern, 'i');
  return regex.test(text);
}

// ─── Industry Detection ───────────────────────────────────────────────────────

const INDUSTRY_KEYWORDS: Record<string, string[]> = {
  cloud: ['cloud', 'aws', 'azure', 'gcp', 'devops', 'infrastructure', 'kubernetes', 'serverless'],
  cybersecurity: ['security', 'cybersecurity', 'penetration', 'vulnerability', 'threat', 'siem', 'incident'],
  data: ['data', 'analytics', 'sql', 'business intelligence', 'tableau', 'power bi',
    'databricks', 'spark', 'kafka', 'dbt', 'airflow', 'data engineer', 'data pipeline', 'etl', 'snowflake'],
  ai_ml: ['machine learning', 'deep learning', 'neural network', 'nlp', 'computer vision', 'ai',
    'artificial intelligence', 'generative ai', 'llm', 'tensorflow', 'pytorch',
    'mlflow', 'sagemaker', 'ml engineer', 'data science', 'data scientist', 'hugging face'],
  finance: ['finance', 'investment', 'portfolio', 'trading', 'financial', 'equity', 'markets', 'bloomberg'],
  marketing: ['marketing', 'seo', 'google ads', 'digital marketing', 'content', 'social media', 'campaigns'],
  management: ['project management', 'agile', 'scrum', 'pmp', 'program manager',
    'scrum master', 'product owner', 'delivery manager'],
  business: ['salesforce', 'servicenow', 'dynamics 365', 'crm', 'itil', 'itsm',
    'customer relationship', 'service desk', 'salesforce admin'],
  networking: ['networking', 'cisco', 'ccna', 'ccnp', 'vmware', 'vsphere', 'virtualization',
    'linux', 'red hat', 'rhel', 'ansible', 'system administrator', 'network engineer',
    'sysadmin', 'sd-wan', 'routing', 'switching'],
};

// Display labels for industry codes
export const INDUSTRY_LABELS: Record<string, string> = {
  cloud: 'Cloud',
  cybersecurity: 'Cybersecurity',
  data: 'Data',
  ai_ml: 'AI & ML',
  finance: 'Finance',
  marketing: 'Marketing',
  management: 'Management',
  business: 'Business & CRM',
  networking: 'Networking & Infra',
};

export function detectIndustry(title: string, description: string): string {
  const text = (title + ' ' + description).toLowerCase();
  const scores: Record<string, number> = {};

  for (const [industry, keywords] of Object.entries(INDUSTRY_KEYWORDS)) {
    scores[industry] = keywords.filter(kw => text.includes(kw)).length;
  }

  const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return top[1] > 0 ? top[0] : 'general';
}

// ─── Seniority Inference ─────────────────────────────────────────────────────

export type UserLevel = 'entry' | 'mid' | 'senior';

export function inferSeniority(title: string, description: string): UserLevel {
  const titleLower = title.toLowerCase();
  const textLower = (title + ' ' + description).toLowerCase();

  const seniorTitles = ['senior', 'sr', 'lead', 'principal', 'staff', 'director', 'manager', 'head', 'vp', 'chief', 'expert', 'architect'];
  const entryTitles = ['junior', 'jr', 'entry', 'associate', 'intern', 'trainee', 'graduate', 'assistant', 'l1', 'level 1'];

  // Title-level matching takes precedence
  if (seniorTitles.some(t => new RegExp(`\\b${t}\\b`).test(titleLower))) {
    return 'senior';
  }
  if (entryTitles.some(t => new RegExp(`\\b${t}\\b`).test(titleLower))) {
    return 'entry';
  }

  // Description mentions score
  let seniorScore = 0;
  let entryScore = 0;

  seniorTitles.forEach(t => {
    const matches = textLower.match(new RegExp(`\\b${t}\\b`, 'g'));
    if (matches) seniorScore += matches.length;
  });

  entryTitles.forEach(t => {
    const matches = textLower.match(new RegExp(`\\b${t}\\b`, 'g'));
    if (matches) entryScore += matches.length;
  });

  // Experience years check
  const expMatch = textLower.match(/(\d+)\+?\s*(?:years?|yrs?)\b/i);
  if (expMatch) {
    const years = parseInt(expMatch[1]);
    if (years >= 5) {
      return 'senior';
    } else if (years <= 2) {
      return 'entry';
    }
  }

  if (seniorScore > entryScore) {
    return 'senior';
  } else if (entryScore > seniorScore) {
    return 'entry';
  }

  return 'mid';
}

// ─── Matching Algorithm ───────────────────────────────────────────────────────

export interface Certification {
  id: number;
  name: string;
  industry: string;
  skills: string; // JSON-encoded string array
  primary_skills?: string; // JSON-encoded string array
  secondary_skills?: string; // JSON-encoded string array
  difficulty: number;
  description: string;
  provider: string;
  cost: string;
  duration: string;
  trending?: boolean;
  target_job_titles?: string; // JSON-encoded string array from DB
}

export interface RecommendationResult {
  cert: Certification;
  score: number;
  skillOverlap: number;
  industryMatch: boolean;
  difficultyFit: number;
  titleMatch: boolean;       // true if job title aligns with cert's target roles
  matchedJobTitle: string;   // which target title matched, if any
  matchedSkills: string[];
  explanation: string;
}

// ─── Job Title Matching ──────────────────────────────────────────────────────

const GENERIC_TITLE_WORDS = new Set([
  'engineer', 'analyst', 'manager', 'specialist', 'developer', 'consultant',
  'architect', 'administrator', 'technician', 'lead', 'senior', 'junior',
  'associate', 'practitioner', 'sr', 'jr', 'staff', 'principal', 'director',
  'officer', 'support', 'head', 'vp', 'chief', 'expert', 'coordinator'
]);

function matchJobTitle(jobTitle: string, targetTitles: string[]): { match: boolean; matchedTitle: string } {
  const cleanTitleWords = jobTitle
    .toLowerCase()
    .split(/[\s/\-]+/)
    .map(w => w.replace(/[^a-z0-9]/g, ''))
    .filter(w => w.length > 1);

  // Filter out the generic words to find core domain words in job title
  const jobDomainWords = cleanTitleWords.filter(w => !GENERIC_TITLE_WORDS.has(w));

  for (const target of targetTitles) {
    const cleanTargetWords = target
      .toLowerCase()
      .split(/[\s/\-]+/)
      .map(w => w.replace(/[^a-z0-9]/g, ''))
      .filter(w => w.length > 1);

    const targetDomainWords = cleanTargetWords.filter(w => !GENERIC_TITLE_WORDS.has(w));

    if (jobDomainWords.length > 0 && targetDomainWords.length > 0) {
      // Must match at least one core domain word
      const domainHits = targetDomainWords.filter(w => jobDomainWords.some(jw => jw.includes(w) || w.includes(jw)));
      if (domainHits.length > 0) {
        // Then ensure significant overall word overlap
        const allHits = cleanTargetWords.filter(w => cleanTitleWords.some(jw => jw.includes(w) || w.includes(jw)));
        if (allHits.length / cleanTargetWords.length >= 0.5) {
          return { match: true, matchedTitle: target };
        }
      }
    } else {
      // Fallback if title contains no specific domain terms
      const allHits = cleanTargetWords.filter(w => cleanTitleWords.some(jw => jw.includes(w) || w.includes(jw)));
      if (cleanTargetWords.length > 0 && allHits.length / cleanTargetWords.length >= 0.5) {
        return { match: true, matchedTitle: target };
      }
    }
  }

  return { match: false, matchedTitle: '' };
}

// Certification alias mapping for explicit matches in job listings
const CERT_ALIASES: Record<number, string[]> = {
  1: ['aws cloud practitioner', 'aws certified cloud practitioner', 'cloud practitioner'],
  2: ['aws solutions architect', 'aws solutions architect associate', 'solutions architect associate'],
  3: ['aws developer', 'aws developer associate'],
  4: ['az-900', 'az900', 'azure fundamentals'],
  5: ['google associate cloud engineer', 'associate cloud engineer', 'gcp cloud engineer'],
  6: ['network+', 'network +', 'comptia network+'],
  7: ['security+', 'security +', 'comptia security+'],
  8: ['ceh', 'certified ethical hacker', 'ethical hacker'],
  9: ['google cybersecurity'],
  10: ['google data analytics'],
  11: ['excel expert', 'mos excel'],
  12: ['sql certification', 'oracle sql'],
  13: ['ibm data science'],
  14: ['tableau desktop specialist', 'tableau specialist'],
  15: ['cfa', 'chartered financial analyst', 'cfa level 1', 'cfa level i'],
  16: ['bloomberg market concepts', 'bloomberg market concepts', 'bmc'],
  17: ['google analytics'],
  18: ['google ads'],
  19: ['hubspot marketing', 'hubspot inbound'],
  20: ['pmp', 'project management professional'],
  21: ['aws devops engineer professional', 'aws devops professional', 'aws devops'],
  22: ['cka', 'certified kubernetes administrator', 'kubernetes administrator'],
  23: ['terraform associate', 'hashicorp terraform', 'terraform'],
  24: ['cissp', 'certified information systems security professional'],
  25: ['ccsp', 'certified cloud security professional'],
  26: ['az-500', 'az500', 'azure security engineer'],
  27: ['pl-300', 'pl300', 'power bi', 'power bi data analyst', 'microsoft power bi'],
  28: ['snowpro core', 'snowflake snowpro', 'snowpro'],
  29: ['google cloud professional data engineer', 'gcp data engineer', 'professional data engineer'],

  // AI/ML certs (ai_ml.json)
  75: ['tensorflow developer', 'tensorflow certificate', 'tensorflow certified'],
  76: ['databricks ml', 'databricks machine learning associate', 'databricks ml associate'],
  77: ['databricks data engineer', 'databricks data engineer associate'],
  78: ['aws ai practitioner', 'aif-c01', 'aws certified ai practitioner'],
  79: ['ibm ai engineering', 'ibm ai engineer'],
  80: ['deep learning specialization', 'andrew ng deep learning', 'deeplearning.ai'],
  81: ['hugging face nlp', 'hugging face certificate'],
  82: ['confluent kafka', 'kafka developer', 'confluent certified developer'],
  83: ['dbt certification', 'dbt analytics engineering', 'dbt certified'],
  84: ['airflow certification', 'astronomer airflow', 'apache airflow certified'],

  // Networking certs (networking.json)
  85: ['ccna', 'cisco ccna', 'ccna 200-301'],
  86: ['ccnp', 'cisco ccnp', 'ccnp enterprise', 'encor'],
  87: ['devnet', 'cisco devnet', 'devnet associate'],
  88: ['comptia a+', 'a+', 'comptia a plus'],
  89: ['comptia linux+', 'linux+', 'comptia linux plus'],
  90: ['rhcsa', 'red hat certified system administrator'],
  91: ['rhce', 'red hat certified engineer'],
  92: ['vcp-dcv', 'vmware vcp', 'vmware certified professional'],

  // Business certs (business.json)
  93: ['salesforce admin', 'salesforce administrator', 'salesforce certified administrator'],
  94: ['salesforce developer', 'salesforce platform developer', 'platform developer i'],
  95: ['salesforce app builder', 'salesforce platform app builder'],
  96: ['servicenow csa', 'servicenow administrator', 'servicenow certified system administrator'],
  97: ['mb-910', 'dynamics 365 fundamentals', 'dynamics crm fundamentals'],
  98: ['itil foundation', 'itil 4 foundation', 'itil 4'],
  99: ['pmi-acp', 'pmi agile', 'agile certified practitioner'],
  100: ['csm', 'certified scrum master', 'scrum master certification'],
};

export function matchCertifications(
  jobSkills: string[],
  jobIndustry: string,
  jobTitle: string,
  jobDescription: string,
  certifications: Certification[],
  userLevel: UserLevel = 'entry'
): RecommendationResult[] {
  const difficultyTarget = userLevel === 'entry' ? 2 : userLevel === 'mid' ? 3 : 4;
  const textLower = (jobTitle + ' ' + jobDescription).toLowerCase();

  const results: RecommendationResult[] = certifications.map(cert => {
    const certSkills: string[] = JSON.parse(cert.skills || '[]');
    const primarySkills: string[] = cert.primary_skills ? JSON.parse(cert.primary_skills) : [];
    const secondarySkills: string[] = cert.secondary_skills ? JSON.parse(cert.secondary_skills) : [];

    const certSkillsLower = certSkills.map(s => s.toLowerCase());
    const primarySkillsLower = primarySkills.map(s => s.toLowerCase());
    const secondarySkillsLower = secondarySkills.map(s => s.toLowerCase());
    const jobSkillsLower = jobSkills.map(s => s.toLowerCase());

    // 1. Explicit name matching detection
    let explicitMatch = false;
    const aliases = CERT_ALIASES[cert.id] || [];
    for (const alias of aliases) {
      if (testAlias(textLower, alias)) {
        explicitMatch = true;
        break;
      }
    }

    // 2. Skill overlap score (Weighted coverage calculations)
    let totalPossibleWeight = 0;
    let earnedWeight = 0;
    const processedSkills = new Set<string>();

    // Weight primary skills (1.5x)
    primarySkillsLower.forEach(ps => {
      // Don't treat cert aliases as primary skills
      if (isCertificationName(ps)) return;
      processedSkills.add(ps);
      const isMatched = jobSkillsLower.some(js => js.includes(ps) || ps.includes(js));
      totalPossibleWeight += 1.5;
      if (isMatched) earnedWeight += 1.5;
    });

    // Weight secondary skills (0.7x)
    secondarySkillsLower.forEach(ss => {
      if (isCertificationName(ss)) return;
      processedSkills.add(ss);
      const isMatched = jobSkillsLower.some(js => js.includes(ss) || ss.includes(js));
      totalPossibleWeight += 0.7;
      if (isMatched) earnedWeight += 0.7;
    });

    // Weight generic remaining skills (1.0x)
    certSkillsLower.forEach(s => {
      if (isCertificationName(s)) return;
      if (!processedSkills.has(s)) {
        processedSkills.add(s);
        const isMatched = jobSkillsLower.some(js => js.includes(s) || s.includes(js));
        totalPossibleWeight += 1.0;
        if (isMatched) earnedWeight += 1.0;
      }
    });

    // Score based on how well the certification meets the job's requirements (job coverage)
    // and how aligned the certification's scope is to the job (cert precision/coverage)
    const matchedJobSkills = jobSkills.filter(js => {
      const jsLower = js.toLowerCase();
      return certSkillsLower.some(cs => cs.includes(jsLower) || jsLower.includes(cs));
    });

    const jobCoverageScore = jobSkills.length > 0 ? matchedJobSkills.length / jobSkills.length : 0;
    const certCoverageScore = totalPossibleWeight > 0 ? earnedWeight / totalPossibleWeight : 0;

    // Balanced skill overlap: 70% job coverage, 30% certification coverage
    const skillOverlap = (0.7 * jobCoverageScore) + (0.3 * certCoverageScore);

    // Keep original-cased matched skills for UI/explanations
    const matchedSkillsOriginal = jobSkills.filter(js =>
      certSkillsLower.some(cs => cs.includes(js.toLowerCase()) || js.toLowerCase().includes(cs))
    );

    // 3. Industry alignment bonus
    const industryMatch = cert.industry === jobIndustry;

    // 4. Difficulty fit (Bypass/give 100% difficulty fit if explicitly matching by name)
    const diffDelta = Math.abs(cert.difficulty - difficultyTarget);
    const difficultyFit = explicitMatch ? 1.0 : Math.max(0, 1 - diffDelta * 0.35);

    // 5. Trending bonus
    const trendingBonus = cert.trending ? 0.05 : 0;

    // 6. Job title match bonus (+15 pts if job title aligns with cert's target roles)
    const targetTitles: string[] = cert.target_job_titles
      ? JSON.parse(cert.target_job_titles)
      : [];
    const { match: titleMatch, matchedTitle: matchedJobTitle } = matchJobTitle(jobTitle, targetTitles);
    const titleMatchBonus = titleMatch ? 0.15 : 0;

    // Final composite score
    // Weights: 50% skill overlap, 15% industry match, 10% difficulty, 15% title match, +30% explicit match bonus
    const explicitMatchBonus = explicitMatch ? 0.30 : 0;
    const rawScore =
      0.50 * skillOverlap +
      0.15 * (industryMatch ? 1 : 0) +
      0.10 * difficultyFit +
      titleMatchBonus +
      explicitMatchBonus +
      trendingBonus;
    const score = Math.min(100, Math.round(rawScore * 100));

    const explanation = generateExplanation(
      cert, matchedSkillsOriginal, certSkills, jobSkills,
      industryMatch, titleMatch, matchedJobTitle, explicitMatch, score
    );

    return {
      cert,
      score,
      skillOverlap: Math.round(skillOverlap * 100),
      industryMatch,
      difficultyFit: Math.round(difficultyFit * 100),
      titleMatch,
      matchedJobTitle,
      matchedSkills: matchedSkillsOriginal,
      explanation,
    };
  });

  return results
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score);
}

function generateExplanation(
  cert: Certification,
  matchedSkills: string[],
  certSkills: string[],
  jobSkills: string[],
  industryMatch: boolean,
  titleMatch: boolean,
  matchedJobTitle: string,
  explicitMatch: boolean,
  score: number
): string {
  const parts: string[] = [];

  // Opening line — factor in explicit match first
  if (explicitMatch) {
    parts.push(`Explicitly mentioned or requested in this job posting.`);
  } else if (score >= 70) {
    parts.push(titleMatch
      ? `Highly recommended for this role.`
      : `Strong match for this role.`
    );
  } else if (score >= 40) {
    parts.push(`Solid complement to this role's requirements.`);
  } else {
    parts.push(`Partial alignment with this role.`);
  }

  // Title match signal
  if (!explicitMatch && titleMatch && matchedJobTitle) {
    parts.push(`Directly targets "${matchedJobTitle}" roles.`);
  }

  // Skill overlap
  if (matchedSkills.length > 0) {
    const top = matchedSkills.slice(0, 3).join(', ');
    parts.push(`Covers key skills: ${top}.`);
  }

  // Industry alignment
  if (industryMatch && !explicitMatch) {
    parts.push(`Aligned with the ${cert.industry} domain of this position.`);
  }

  // Skill gaps the cert would fill
  const gaps = certSkills.filter(cs =>
    !isCertificationName(cs) &&
    !jobSkills.some(js => js.toLowerCase().includes(cs.toLowerCase()) || cs.toLowerCase().includes(js.toLowerCase()))
  ).slice(0, 2);

  if (gaps.length > 0) {
    parts.push(`Also builds: ${gaps.join(', ')}.`);
  }

  return parts.join(' ');
}