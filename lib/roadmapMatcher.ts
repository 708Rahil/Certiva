// Utility to find alternative certs from different providers
export function findAlternativePaths(
  cert: any,
  allCerts: any[],
  userCertMap: Map<number, string>
) {
  const provider = extractProvider(cert.name);
  
  // Find certs with same or adjacent difficulty from different providers
  const alternatives = allCerts.filter(other => {
    if (other.id === cert.id) return false;
    
    const otherProvider = extractProvider(other.name);
    // Must be different provider
    if (otherProvider === provider) return false;
    
    // Similar difficulty (within 1 level)
    if (Math.abs(other.difficulty - cert.difficulty) > 1) return false;
    
    // Similar domain (both cloud, both security, etc)
    if (!haveSimilarDomain(cert, other)) return false;
    
    // Don't suggest certs user already completed
    if (userCertMap.get(other.id) === 'completed') return false;
    
    return true;
  });

  return alternatives.slice(0, 3); // Return top 3 alternatives
}

export function extractProvider(certName: string): string {
  const name = certName.toLowerCase();
  
  if (name.includes('aws') || name.includes('amazon')) return 'AWS';
  if (name.includes('google') || name.includes('gcp')) return 'Google Cloud';
  if (name.includes('azure') || name.includes('microsoft')) return 'Azure';
  if (name.includes('kubernetes') || name.includes('cka')) return 'Cloud Native';
  if (name.includes('comptia') || name.includes('cissp') || name.includes('ceh')) return 'Vendor Neutral';
  if (name.includes('tableau') || name.includes('snowflake')) return 'Data Tools';
  if (name.includes('salesforce')) return 'Salesforce';
  if (name.includes('databricks')) return 'Databricks';
  
  return 'Other';
}

export function haveSimilarDomain(cert1: any, cert2: any): boolean {
  const getDomain = (cert: any) => {
    const primarySkills = (cert.primary_skills || []).join(' ').toLowerCase();
    const secondarySkills = (cert.secondary_skills || []).join(' ').toLowerCase();
    const name = cert.name.toLowerCase();
    const combined = `${name} ${primarySkills} ${secondarySkills}`;
    
    if (combined.includes('cloud') || combined.includes('architecture')) return 'cloud';
    if (combined.includes('security')) return 'security';
    if (combined.includes('data')) return 'data';
    if (combined.includes('network')) return 'network';
    if (combined.includes('devops')) return 'devops';
    if (combined.includes('developer') || combined.includes('development')) return 'development';
    
    return 'general';
  };
  
  const domain1 = getDomain(cert1);
  const domain2 = getDomain(cert2);
  
  // Allow cross-domain within cloud/devops/development (related areas)
  if (['cloud', 'devops', 'development'].includes(domain1) && 
      ['cloud', 'devops', 'development'].includes(domain2)) {
    return true;
  }
  
  return domain1 === domain2;
}

export function getProviderColor(provider: string): string {
  switch (provider) {
    case 'AWS':
      return '#FF9900';
    case 'Google Cloud':
      return '#4285F4';
    case 'Azure':
      return '#0078D4';
    case 'Cloud Native':
      return '#326CE5';
    case 'Vendor Neutral':
      return '#8B5CF6';
    case 'Data Tools':
      return '#10B981';
    default:
      return '#6B7280';
  }
}
