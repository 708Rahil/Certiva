import { Metadata } from 'next';
import CertificationsClient from './CertificationsClient';

export const metadata: Metadata = {
  title: 'Best Professional Certifications to Get Right Now (2026) | CertRoute',
  description: 'Explore and compare the best professional certifications across Cloud, Cyber, AI, and Tech. Filter by salary boost, average study time, and exam cost.',
};

export default function CertificationsPage() {
  return <CertificationsClient />;
}
