type OrganizationData = {
  organizationName: string;
  titleAtWork: string;
  relationshipTimestamp: {
    startDate: Date;
    endDate: Date;
  };
  organizationWebsite: string;
  type: "education" | "work" | "volunteer";
};
export type IndexedUser = {
  address: string;
  identity: string;
  platform: string;
  displayName: string;
  avatar: string;
  email: string | null;
  description: string | null;
  location: string | null;
  header: string | null;
  error: string | null;
  links: {
    [key: string]: {
      link: string;
      handle: string;
    };
  };
};
export type Resume = {
  dids: string[];
  pubKey: string;
  lastName: string;
  firstName: string;
  languages: {
    name: string;
    level: string;
  }[];
  organization: OrganizationData[];
  educations: {
    end: string;
    links: {
      href: string;
      name: string;
    }[];
    start: string;
    title: string;
    company: {
      dns: string;
      name: string;
      preferredIcon: string;
    };
    keywords: string[];
    description: string;
  }[];
  description: string;
  occupations: {
    end: string;
    links: {
      href: string;
      name: string;
    }[];
    start: string;
    title: string;
    company: {
      dns: string;
      name: string;
      preferredIcon: string;
    };
    keywords: string[];
    description: string;
  }[];
  publications: {
    cid: string;
    doi?: string;
    ISBN?: string;
    href: string;
    type: string;
    title: string;
    idChecks?: {
      did: string;
      sig: string;
    }[];
    keywords?: string[];
    description?: string;
    contentChecks?: {
      did: string;
      sig: string;
    }[];
  }[];
  preferredName: string;
  preferredTitle: string;
  skill_keywords: string[];
  eoaAttestations: any[];
  attestationData:any[]
  preferredLocation: string;
};
