// One place for everything that changes between "working prototype" and "live site".
export const site = {
  name: 'Salt Line CR',
  tagline: 'Surf, wellness and ocean travel in Costa Rica',
  url: 'https://saltlinecr.com',

  // Draft flags: turn both off when facts are verified and real photography is in.
  showDraftBadges: true,
  placeholderPhotos: true,

  // The travel partner every referral goes to. Confirm branding with Casey before launch.
  partner: {
    name: 'our Costa Rica travel partner',
    base: 'https://www.vacationscostarica.com',
    fallbackPath: '/surfing/',
    // If his system gives us an affiliate ID, set both (for example param 'ref', id 'saltline').
    affiliateParam: '',
    affiliateId: '',
  },

  // Quote form: emails each lead (with source tags) to this address through FormSubmit.
  // Replace REPLACE_WITH_EMAIL with the inbox that should receive leads.
  quote: {
    endpoint: 'https://formsubmit.co/REPLACE_WITH_EMAIL',
  },

  utm: { source: 'saltline', medium: 'referral' },
};

export const levelLabels: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert',
};
