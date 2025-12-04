export { termsOfService } from './terms-of-service';
export type { Terms, TermsSection } from './terms-of-service';

export { privacyPolicy } from './privacy-policy';
export type { Privacy, PrivacySection } from './privacy-policy';

export { hostAgreement } from './host-agreement';
export type { HostAgreement, HostSection } from './host-agreement';

export { cancellationPolicy } from './cancellation-policy';
export type { CancellationPolicy, CancellationSection } from './cancellation-policy';

// Helper function to get last updated date
export const getLastUpdated = (doc: 'terms' | 'privacy' | 'host' | 'cancellation'): string => {
  switch (doc) {
    case 'terms':
      return termsOfService.lastUpdated;
    case 'privacy':
      return privacyPolicy.lastUpdated;
    case 'host':
      return hostAgreement.lastUpdated;
    case 'cancellation':
      return cancellationPolicy.lastUpdated;
  }
};

// Helper to format content with proper line breaks
export const formatContent = (content: string): string[] => {
  return content.split('\n\n').filter(Boolean);
};
