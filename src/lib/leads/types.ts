/** One enquiry, after server-side validation and enrichment. */
export type LeadRecord = {
  id: string;
  createdAt: string;
  firstName: string;
  lastName: string;
  email: string;
  emailDomain: string;
  /** True when the address is a consumer mailbox (gmail, wp.pl, …). */
  freeEmail: boolean;
  company: string;
  website: string;
  /** Stable option keys, not the translated labels. */
  role: string;
  size: string;
  budget: string;
  message: string;
  lang: string;
  /** Where it came from, for when there is more than one form. */
  source: string;
  userAgent: string;
  country: string;
};
