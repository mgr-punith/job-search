import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { buildCredentialAccountData } from "../src/features/auth/services/credential.ts";
import {
  CompanySize,
  ExperienceLevel,
  JobType,
  Market,
  PrismaClient,
  WorkplaceType,
} from "../src/generated/prisma/client.ts";

const DEMO_CANDIDATE_EMAIL = "demo.candidate@example.com";
const DEMO_CANDIDATE_PASSWORD = "JobSearchDemo123!";

type CompanySeed = {
  slug: string;
  name: string;
  description: string;
  size: CompanySize;
  location: string;
};

type RoleFamily =
  | "engineering"
  | "product"
  | "design"
  | "data"
  | "marketing"
  | "customer"
  | "operations"
  | "people"
  | "consulting";

type JobSeed = {
  slug: string;
  title: string;
  companySlug: string;
  family: RoleFamily;
  mission: string;
  location: string;
  country: string;
  timeZone: string;
  workplaceType: WorkplaceType;
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  market: Market;
  salaryMin: number;
  salaryMax: number;
  skillSlugs: string[];
  benefitSlugs: string[];
  isActivelyRecruiting?: boolean;
  publishedDaysAgo: number;
};

const companies: CompanySeed[] = [
  {
    slug: "northstar-labs",
    name: "Northstar Labs",
    description:
      "Northstar Labs builds planning software that helps distributed teams turn strategy into measurable work.",
    size: CompanySize.MEDIUM,
    location: "San Francisco, United States",
  },
  {
    slug: "ledgerleaf",
    name: "LedgerLeaf",
    description:
      "LedgerLeaf gives growing businesses a clear, real-time view of cash flow, payments, and financial operations.",
    size: CompanySize.SMALL,
    location: "New York, United States",
  },
  {
    slug: "medispring",
    name: "MediSpring",
    description:
      "MediSpring connects care teams and patients through secure digital health workflows.",
    size: CompanySize.LARGE,
    location: "Boston, United States",
  },
  {
    slug: "cartwheel-commerce",
    name: "Cartwheel Commerce",
    description:
      "Cartwheel Commerce helps independent brands manage storefronts, fulfillment, and customer retention in one place.",
    size: CompanySize.MEDIUM,
    location: "Austin, United States",
  },
  {
    slug: "learnly",
    name: "Learnly",
    description:
      "Learnly creates practical online learning programs for people changing careers and building new skills.",
    size: CompanySize.SMALL,
    location: "London, United Kingdom",
  },
  {
    slug: "signal-house-media",
    name: "Signal House Media",
    description:
      "Signal House Media produces trusted business journalism and audience-first digital products.",
    size: CompanySize.LARGE,
    location: "Toronto, Canada",
  },
  {
    slug: "atlas-advisory",
    name: "Atlas Advisory",
    description:
      "Atlas Advisory helps mid-market organizations improve operations, technology, and customer experience.",
    size: CompanySize.ENTERPRISE,
    location: "Chicago, United States",
  },
  {
    slug: "nimbus-systems",
    name: "Nimbus Systems",
    description:
      "Nimbus Systems provides cloud infrastructure and developer tooling for high-growth software teams.",
    size: CompanySize.LARGE,
    location: "Bengaluru, India",
  },
  {
    slug: "harborpay",
    name: "HarborPay",
    description:
      "HarborPay provides compliant payment infrastructure for marketplaces operating across Asia-Pacific.",
    size: CompanySize.MEDIUM,
    location: "Singapore",
  },
  {
    slug: "wellnest-health",
    name: "WellNest Health",
    description:
      "WellNest Health coordinates preventive care programs for employers and community health partners.",
    size: CompanySize.MEDIUM,
    location: "Sydney, Australia",
  },
];

const skills = [
  ["typescript", "TypeScript"],
  ["react", "React"],
  ["next-js", "Next.js"],
  ["node-js", "Node.js"],
  ["postgresql", "PostgreSQL"],
  ["prisma", "Prisma"],
  ["aws", "AWS"],
  ["docker", "Docker"],
  ["kubernetes", "Kubernetes"],
  ["terraform", "Terraform"],
  ["python", "Python"],
  ["sql", "SQL"],
  ["dbt", "dbt"],
  ["snowflake", "Snowflake"],
  ["data-analysis", "Data Analysis"],
  ["machine-learning", "Machine Learning"],
  ["product-management", "Product Management"],
  ["roadmapping", "Roadmapping"],
  ["figma", "Figma"],
  ["user-research", "User Research"],
  ["design-systems", "Design Systems"],
  ["cybersecurity", "Cybersecurity"],
  ["oauth", "OAuth"],
  ["observability", "Observability"],
  ["ci-cd", "CI/CD"],
  ["vitest", "Vitest"],
  ["playwright", "Playwright"],
  ["react-native", "React Native"],
  ["content-strategy", "Content Strategy"],
  ["seo", "SEO"],
  ["growth-marketing", "Growth Marketing"],
  ["customer-success", "Customer Success"],
  ["healthcare-operations", "Healthcare Operations"],
  ["payments", "Payments"],
  ["risk-management", "Risk Management"],
  ["compliance", "Compliance"],
  ["project-management", "Project Management"],
  ["recruiting", "Recruiting"],
  ["technical-writing", "Technical Writing"],
  ["quality-assurance", "Quality Assurance"],
  ["product-analytics", "Product Analytics"],
  ["partnerships", "Partnerships"],
] as const;

const benefits = [
  ["remote-work", "Remote work options"],
  ["flexible-hours", "Flexible working hours"],
  ["health-insurance", "Health insurance"],
  ["learning-budget", "Annual learning budget"],
  ["home-office", "Home office stipend"],
  ["parental-leave", "Paid parental leave"],
  ["wellness", "Wellness allowance"],
  ["equity", "Employee equity"],
  ["annual-bonus", "Annual performance bonus"],
  ["volunteer-days", "Paid volunteer days"],
] as const;

const jobs: JobSeed[] = [
  ...[
    { slug: "nimbus-web-developer", title: "Web Developer", companySlug: "nimbus-systems", mission: "build responsive customer websites and accessible web tools", skillSlugs: ["typescript", "react", "next-js", "design-systems"] },
    { slug: "learnly-frontend-developer", title: "Frontend Developer", companySlug: "learnly", mission: "build fast learning interfaces with React and TypeScript", skillSlugs: ["typescript", "react", "next-js", "vitest"] },
    { slug: "ledgerleaf-backend-developer", title: "Backend Developer", companySlug: "ledgerleaf", mission: "develop reliable APIs and PostgreSQL services for finance workflows", skillSlugs: ["typescript", "node-js", "postgresql", "prisma"] },
    { slug: "northstar-software-engineer", title: "Software Engineer", companySlug: "northstar-labs", mission: "deliver maintainable software for collaborative planning", skillSlugs: ["typescript", "react", "node-js", "postgresql", "vitest"] },
    { slug: "cartwheel-full-stack-developer", title: "Full Stack Developer", companySlug: "cartwheel-commerce", mission: "build storefront features from React interfaces to database services", skillSlugs: ["typescript", "react", "next-js", "node-js", "postgresql", "prisma"] },
  ].map((role): JobSeed => ({
    ...role, family: "engineering", location: "Remote, worldwide", country: "Worldwide", timeZone: "Flexible / worldwide",
    workplaceType: WorkplaceType.REMOTE, jobType: JobType.FULL_TIME, experienceLevel: ExperienceLevel.MID,
    market: Market.TECHNOLOGY, salaryMin: 60_000, salaryMax: 100_000,
    benefitSlugs: ["remote-work", "flexible-hours", "learning-budget"], isActivelyRecruiting: true, publishedDaysAgo: 0,
  })),
  {
    slug: "northstar-senior-frontend-engineer",
    title: "Senior Frontend Engineer",
    companySlug: "northstar-labs",
    family: "engineering",
    mission: "make complex planning workflows fast, accessible, and easy to understand",
    location: "Remote, United States",
    country: "United States",
    timeZone: "UTC-08:00 to UTC-05:00",
    workplaceType: WorkplaceType.REMOTE,
    jobType: JobType.FULL_TIME,
    experienceLevel: ExperienceLevel.SENIOR,
    market: Market.TECHNOLOGY,
    salaryMin: 145000,
    salaryMax: 185000,
    skillSlugs: ["typescript", "react", "next-js", "design-systems", "vitest"],
    benefitSlugs: ["remote-work", "health-insurance", "learning-budget", "equity"],
    isActivelyRecruiting: true,
    publishedDaysAgo: 1,
  },
  {
    slug: "northstar-platform-engineer",
    title: "Platform Engineer",
    companySlug: "northstar-labs",
    family: "engineering",
    mission: "improve the reliability and delivery speed of its multi-tenant platform",
    location: "San Francisco, United States",
    country: "United States",
    timeZone: "UTC-08:00",
    workplaceType: WorkplaceType.HYBRID,
    jobType: JobType.FULL_TIME,
    experienceLevel: ExperienceLevel.MID,
    market: Market.TECHNOLOGY,
    salaryMin: 135000,
    salaryMax: 172000,
    skillSlugs: ["aws", "docker", "kubernetes", "terraform", "observability"],
    benefitSlugs: ["health-insurance", "learning-budget", "parental-leave", "equity"],
    publishedDaysAgo: 4,
  },
  {
    slug: "northstar-product-manager",
    title: "Product Manager, Collaboration",
    companySlug: "northstar-labs",
    family: "product",
    mission: "shape collaboration tools that keep distributed teams aligned",
    location: "Remote, Americas",
    country: "Remote",
    timeZone: "UTC-08:00 to UTC-03:00",
    workplaceType: WorkplaceType.REMOTE,
    jobType: JobType.FULL_TIME,
    experienceLevel: ExperienceLevel.SENIOR,
    market: Market.TECHNOLOGY,
    salaryMin: 140000,
    salaryMax: 180000,
    skillSlugs: ["product-management", "roadmapping", "user-research", "product-analytics"],
    benefitSlugs: ["remote-work", "flexible-hours", "health-insurance", "equity"],
    publishedDaysAgo: 7,
  },
  {
    slug: "northstar-product-designer",
    title: "Product Designer",
    companySlug: "northstar-labs",
    family: "design",
    mission: "turn dense planning data into clear, inclusive product experiences",
    location: "San Francisco, United States",
    country: "United States",
    timeZone: "UTC-08:00",
    workplaceType: WorkplaceType.HYBRID,
    jobType: JobType.CONTRACT,
    experienceLevel: ExperienceLevel.MID,
    market: Market.TECHNOLOGY,
    salaryMin: 110000,
    salaryMax: 140000,
    skillSlugs: ["figma", "user-research", "design-systems", "product-management"],
    benefitSlugs: ["flexible-hours", "learning-budget", "wellness"],
    publishedDaysAgo: 11,
  },
  {
    slug: "ledgerleaf-staff-backend-engineer",
    title: "Staff Backend Engineer",
    companySlug: "ledgerleaf",
    family: "engineering",
    mission: "scale secure ledger ingestion and reconciliation services",
    location: "New York, United States",
    country: "United States",
    timeZone: "UTC-05:00",
    workplaceType: WorkplaceType.HYBRID,
    jobType: JobType.FULL_TIME,
    experienceLevel: ExperienceLevel.LEAD,
    market: Market.FINTECH,
    salaryMin: 185000,
    salaryMax: 230000,
    skillSlugs: ["typescript", "node-js", "postgresql", "aws", "payments"],
    benefitSlugs: ["health-insurance", "parental-leave", "equity", "annual-bonus"],
    isActivelyRecruiting: true,
    publishedDaysAgo: 2,
  },
  {
    slug: "ledgerleaf-data-engineer",
    title: "Data Engineer",
    companySlug: "ledgerleaf",
    family: "data",
    mission: "build trustworthy financial data models for reporting and forecasting",
    location: "Remote, United States",
    country: "United States",
    timeZone: "UTC-08:00 to UTC-05:00",
    workplaceType: WorkplaceType.REMOTE,
    jobType: JobType.FULL_TIME,
    experienceLevel: ExperienceLevel.MID,
    market: Market.FINTECH,
    salaryMin: 130000,
    salaryMax: 165000,
    skillSlugs: ["python", "sql", "dbt", "snowflake", "data-analysis"],
    benefitSlugs: ["remote-work", "home-office", "health-insurance", "learning-budget"],
    publishedDaysAgo: 6,
  },
  {
    slug: "ledgerleaf-security-engineer",
    title: "Security Engineer",
    companySlug: "ledgerleaf",
    family: "engineering",
    mission: "strengthen application security and identity controls across the product",
    location: "New York, United States",
    country: "United States",
    timeZone: "UTC-05:00",
    workplaceType: WorkplaceType.HYBRID,
    jobType: JobType.FULL_TIME,
    experienceLevel: ExperienceLevel.SENIOR,
    market: Market.FINTECH,
    salaryMin: 155000,
    salaryMax: 195000,
    skillSlugs: ["cybersecurity", "oauth", "aws", "observability", "compliance"],
    benefitSlugs: ["health-insurance", "learning-budget", "equity", "annual-bonus"],
    publishedDaysAgo: 9,
  },
  {
    slug: "ledgerleaf-finance-operations-analyst",
    title: "Finance Operations Analyst",
    companySlug: "ledgerleaf",
    family: "operations",
    mission: "improve reconciliation, reporting, and month-end operating processes",
    location: "New York, United States",
    country: "United States",
    timeZone: "UTC-05:00",
    workplaceType: WorkplaceType.ON_SITE,
    jobType: JobType.FULL_TIME,
    experienceLevel: ExperienceLevel.ENTRY,
    market: Market.FINTECH,
    salaryMin: 70000,
    salaryMax: 90000,
    skillSlugs: ["data-analysis", "sql", "payments", "project-management"],
    benefitSlugs: ["health-insurance", "learning-budget", "annual-bonus", "volunteer-days"],
    publishedDaysAgo: 15,
  },
  {
    slug: "medispring-full-stack-engineer",
    title: "Full Stack Engineer",
    companySlug: "medispring",
    family: "engineering",
    mission: "deliver secure patient and care-team workflows from database to interface",
    location: "Boston, United States",
    country: "United States",
    timeZone: "UTC-05:00",
    workplaceType: WorkplaceType.HYBRID,
    jobType: JobType.FULL_TIME,
    experienceLevel: ExperienceLevel.MID,
    market: Market.HEALTHCARE,
    salaryMin: 125000,
    salaryMax: 158000,
    skillSlugs: ["typescript", "react", "node-js", "postgresql", "prisma"],
    benefitSlugs: ["health-insurance", "parental-leave", "learning-budget", "wellness"],
    isActivelyRecruiting: true,
    publishedDaysAgo: 3,
  },
  {
    slug: "medispring-clinical-product-manager",
    title: "Clinical Product Manager",
    companySlug: "medispring",
    family: "product",
    mission: "translate care-team needs into safe and usable clinical workflows",
    location: "Boston, United States",
    country: "United States",
    timeZone: "UTC-05:00",
    workplaceType: WorkplaceType.HYBRID,
    jobType: JobType.FULL_TIME,
    experienceLevel: ExperienceLevel.SENIOR,
    market: Market.HEALTHCARE,
    salaryMin: 140000,
    salaryMax: 178000,
    skillSlugs: ["product-management", "roadmapping", "user-research", "healthcare-operations"],
    benefitSlugs: ["health-insurance", "parental-leave", "wellness", "annual-bonus"],
    publishedDaysAgo: 8,
  },
  {
    slug: "medispring-data-analyst",
    title: "Healthcare Data Analyst",
    companySlug: "medispring",
    family: "data",
    mission: "surface operational insights that help care teams improve patient access",
    location: "Remote, United States",
    country: "United States",
    timeZone: "UTC-08:00 to UTC-05:00",
    workplaceType: WorkplaceType.REMOTE,
    jobType: JobType.FULL_TIME,
    experienceLevel: ExperienceLevel.MID,
    market: Market.HEALTHCARE,
    salaryMin: 95000,
    salaryMax: 125000,
    skillSlugs: ["sql", "data-analysis", "python", "product-analytics", "healthcare-operations"],
    benefitSlugs: ["remote-work", "home-office", "health-insurance", "wellness"],
    publishedDaysAgo: 12,
  },
  {
    slug: "medispring-customer-success-manager",
    title: "Customer Success Manager",
    companySlug: "medispring",
    family: "customer",
    mission: "help clinical partners launch workflows and achieve measurable adoption",
    location: "Boston, United States",
    country: "United States",
    timeZone: "UTC-05:00",
    workplaceType: WorkplaceType.HYBRID,
    jobType: JobType.FULL_TIME,
    experienceLevel: ExperienceLevel.MID,
    market: Market.HEALTHCARE,
    salaryMin: 90000,
    salaryMax: 120000,
    skillSlugs: ["customer-success", "healthcare-operations", "project-management", "data-analysis"],
    benefitSlugs: ["health-insurance", "learning-budget", "wellness", "annual-bonus"],
    publishedDaysAgo: 18,
  },
  {
    slug: "cartwheel-software-engineer",
    title: "Software Engineer, Storefronts",
    companySlug: "cartwheel-commerce",
    family: "engineering",
    mission: "build fast storefront features for independent retail brands",
    location: "Austin, United States",
    country: "United States",
    timeZone: "UTC-06:00",
    workplaceType: WorkplaceType.HYBRID,
    jobType: JobType.FULL_TIME,
    experienceLevel: ExperienceLevel.MID,
    market: Market.ECOMMERCE,
    salaryMin: 120000,
    salaryMax: 155000,
    skillSlugs: ["typescript", "react", "next-js", "node-js", "postgresql"],
    benefitSlugs: ["health-insurance", "learning-budget", "equity", "flexible-hours"],
    isActivelyRecruiting: true,
    publishedDaysAgo: 2,
  },
  {
    slug: "cartwheel-growth-marketing-manager",
    title: "Growth Marketing Manager",
    companySlug: "cartwheel-commerce",
    family: "marketing",
    mission: "grow qualified demand through measurable lifecycle and acquisition programs",
    location: "Remote, United States",
    country: "United States",
    timeZone: "UTC-08:00 to UTC-05:00",
    workplaceType: WorkplaceType.REMOTE,
    jobType: JobType.FULL_TIME,
    experienceLevel: ExperienceLevel.SENIOR,
    market: Market.ECOMMERCE,
    salaryMin: 115000,
    salaryMax: 145000,
    skillSlugs: ["growth-marketing", "seo", "content-strategy", "data-analysis", "product-analytics"],
    benefitSlugs: ["remote-work", "home-office", "health-insurance", "annual-bonus"],
    publishedDaysAgo: 5,
  },
  {
    slug: "cartwheel-ecommerce-operations-specialist",
    title: "Ecommerce Operations Specialist",
    companySlug: "cartwheel-commerce",
    family: "operations",
    mission: "make merchant onboarding and fulfillment workflows dependable at scale",
    location: "Austin, United States",
    country: "United States",
    timeZone: "UTC-06:00",
    workplaceType: WorkplaceType.ON_SITE,
    jobType: JobType.FULL_TIME,
    experienceLevel: ExperienceLevel.ENTRY,
    market: Market.ECOMMERCE,
    salaryMin: 62000,
    salaryMax: 78000,
    skillSlugs: ["project-management", "customer-success", "data-analysis"],
    benefitSlugs: ["health-insurance", "learning-budget", "volunteer-days", "annual-bonus"],
    publishedDaysAgo: 14,
  },
  {
    slug: "cartwheel-ux-researcher",
    title: "UX Researcher",
    companySlug: "cartwheel-commerce",
    family: "design",
    mission: "uncover merchant needs and guide evidence-based product decisions",
    location: "Remote, North America",
    country: "Remote",
    timeZone: "UTC-08:00 to UTC-05:00",
    workplaceType: WorkplaceType.REMOTE,
    jobType: JobType.CONTRACT,
    experienceLevel: ExperienceLevel.MID,
    market: Market.ECOMMERCE,
    salaryMin: 95000,
    salaryMax: 125000,
    skillSlugs: ["user-research", "figma", "product-management", "product-analytics"],
    benefitSlugs: ["remote-work", "flexible-hours", "learning-budget"],
    publishedDaysAgo: 20,
  },
  {
    slug: "learnly-learning-experience-designer",
    title: "Learning Experience Designer",
    companySlug: "learnly",
    family: "design",
    mission: "design practical learning journeys that help adults build job-ready skills",
    location: "London, United Kingdom",
    country: "United Kingdom",
    timeZone: "UTC+00:00",
    workplaceType: WorkplaceType.HYBRID,
    jobType: JobType.FULL_TIME,
    experienceLevel: ExperienceLevel.MID,
    market: Market.EDUCATION,
    salaryMin: 70000,
    salaryMax: 90000,
    skillSlugs: ["user-research", "figma", "content-strategy", "project-management"],
    benefitSlugs: ["flexible-hours", "learning-budget", "wellness", "volunteer-days"],
    publishedDaysAgo: 4,
  },
  {
    slug: "learnly-frontend-engineer",
    title: "Frontend Engineer",
    companySlug: "learnly",
    family: "engineering",
    mission: "create accessible learning tools that work well across devices",
    location: "Remote, Europe",
    country: "Remote",
    timeZone: "UTC-01:00 to UTC+03:00",
    workplaceType: WorkplaceType.REMOTE,
    jobType: JobType.FULL_TIME,
    experienceLevel: ExperienceLevel.MID,
    market: Market.EDUCATION,
    salaryMin: 85000,
    salaryMax: 115000,
    skillSlugs: ["typescript", "react", "next-js", "vitest", "design-systems"],
    benefitSlugs: ["remote-work", "home-office", "learning-budget", "flexible-hours"],
    isActivelyRecruiting: true,
    publishedDaysAgo: 6,
  },
  {
    slug: "learnly-product-analyst-intern",
    title: "Product Analyst Intern",
    companySlug: "learnly",
    family: "data",
    mission: "measure learner engagement and turn findings into product recommendations",
    location: "London, United Kingdom",
    country: "United Kingdom",
    timeZone: "UTC+00:00",
    workplaceType: WorkplaceType.HYBRID,
    jobType: JobType.INTERNSHIP,
    experienceLevel: ExperienceLevel.ENTRY,
    market: Market.EDUCATION,
    salaryMin: 35000,
    salaryMax: 42000,
    skillSlugs: ["sql", "data-analysis", "product-analytics"],
    benefitSlugs: ["learning-budget", "flexible-hours", "wellness"],
    publishedDaysAgo: 10,
  },
  {
    slug: "learnly-partnerships-manager",
    title: "Partnerships Manager",
    companySlug: "learnly",
    family: "customer",
    mission: "build employer partnerships that connect learners with career opportunities",
    location: "London, United Kingdom",
    country: "United Kingdom",
    timeZone: "UTC+00:00",
    workplaceType: WorkplaceType.HYBRID,
    jobType: JobType.FULL_TIME,
    experienceLevel: ExperienceLevel.SENIOR,
    market: Market.EDUCATION,
    salaryMin: 90000,
    salaryMax: 120000,
    skillSlugs: ["partnerships", "customer-success", "project-management", "data-analysis"],
    benefitSlugs: ["learning-budget", "wellness", "annual-bonus", "volunteer-days"],
    publishedDaysAgo: 17,
  },
  {
    slug: "signal-house-content-strategist",
    title: "Content Strategist",
    companySlug: "signal-house-media",
    family: "marketing",
    mission: "shape useful editorial series for business and technology audiences",
    location: "Toronto, Canada",
    country: "Canada",
    timeZone: "UTC-05:00",
    workplaceType: WorkplaceType.HYBRID,
    jobType: JobType.PART_TIME,
    experienceLevel: ExperienceLevel.MID,
    market: Market.MEDIA,
    salaryMin: 65000,
    salaryMax: 85000,
    skillSlugs: ["content-strategy", "seo", "data-analysis", "project-management"],
    benefitSlugs: ["flexible-hours", "learning-budget", "wellness"],
    publishedDaysAgo: 3,
  },
  {
    slug: "signal-house-audience-data-scientist",
    title: "Audience Data Scientist",
    companySlug: "signal-house-media",
    family: "data",
    mission: "model audience behavior and improve subscription decisions",
    location: "Remote, Canada",
    country: "Canada",
    timeZone: "UTC-08:00 to UTC-04:00",
    workplaceType: WorkplaceType.REMOTE,
    jobType: JobType.FULL_TIME,
    experienceLevel: ExperienceLevel.SENIOR,
    market: Market.MEDIA,
    salaryMin: 125000,
    salaryMax: 160000,
    skillSlugs: ["python", "sql", "machine-learning", "data-analysis", "product-analytics"],
    benefitSlugs: ["remote-work", "home-office", "learning-budget", "health-insurance"],
    publishedDaysAgo: 8,
  },
  {
    slug: "signal-house-mobile-engineer",
    title: "Mobile Engineer",
    companySlug: "signal-house-media",
    family: "engineering",
    mission: "improve reading and audio experiences in its mobile applications",
    location: "Toronto, Canada",
    country: "Canada",
    timeZone: "UTC-05:00",
    workplaceType: WorkplaceType.HYBRID,
    jobType: JobType.FULL_TIME,
    experienceLevel: ExperienceLevel.MID,
    market: Market.MEDIA,
    salaryMin: 105000,
    salaryMax: 138000,
    skillSlugs: ["typescript", "react-native", "react", "vitest", "ci-cd"],
    benefitSlugs: ["health-insurance", "learning-budget", "parental-leave", "wellness"],
    publishedDaysAgo: 13,
  },
  {
    slug: "signal-house-ad-operations-manager",
    title: "Ad Operations Manager",
    companySlug: "signal-house-media",
    family: "operations",
    mission: "run accurate, transparent advertising campaigns across digital products",
    location: "Toronto, Canada",
    country: "Canada",
    timeZone: "UTC-05:00",
    workplaceType: WorkplaceType.ON_SITE,
    jobType: JobType.FULL_TIME,
    experienceLevel: ExperienceLevel.SENIOR,
    market: Market.MEDIA,
    salaryMin: 90000,
    salaryMax: 118000,
    skillSlugs: ["project-management", "data-analysis", "customer-success"],
    benefitSlugs: ["health-insurance", "annual-bonus", "volunteer-days", "wellness"],
    publishedDaysAgo: 21,
  },
  {
    slug: "atlas-strategy-consultant",
    title: "Strategy Consultant",
    companySlug: "atlas-advisory",
    family: "consulting",
    mission: "solve operating-model and growth problems for mid-market clients",
    location: "Chicago, United States",
    country: "United States",
    timeZone: "UTC-06:00",
    workplaceType: WorkplaceType.HYBRID,
    jobType: JobType.FULL_TIME,
    experienceLevel: ExperienceLevel.SENIOR,
    market: Market.PROFESSIONAL_SERVICES,
    salaryMin: 125000,
    salaryMax: 160000,
    skillSlugs: ["project-management", "data-analysis", "product-management", "technical-writing"],
    benefitSlugs: ["health-insurance", "learning-budget", "annual-bonus", "volunteer-days"],
    publishedDaysAgo: 5,
  },
  {
    slug: "atlas-business-intelligence-engineer",
    title: "Business Intelligence Engineer",
    companySlug: "atlas-advisory",
    family: "data",
    mission: "build reusable analytics foundations for client delivery teams",
    location: "Remote, United States",
    country: "United States",
    timeZone: "UTC-08:00 to UTC-05:00",
    workplaceType: WorkplaceType.REMOTE,
    jobType: JobType.FULL_TIME,
    experienceLevel: ExperienceLevel.MID,
    market: Market.PROFESSIONAL_SERVICES,
    salaryMin: 115000,
    salaryMax: 145000,
    skillSlugs: ["sql", "dbt", "snowflake", "python", "data-analysis"],
    benefitSlugs: ["remote-work", "home-office", "health-insurance", "learning-budget"],
    publishedDaysAgo: 9,
  },
  {
    slug: "atlas-talent-acquisition-partner",
    title: "Talent Acquisition Partner",
    companySlug: "atlas-advisory",
    family: "people",
    mission: "build consistent hiring practices for consulting and technology teams",
    location: "Chicago, United States",
    country: "United States",
    timeZone: "UTC-06:00",
    workplaceType: WorkplaceType.HYBRID,
    jobType: JobType.FULL_TIME,
    experienceLevel: ExperienceLevel.MID,
    market: Market.PROFESSIONAL_SERVICES,
    salaryMin: 85000,
    salaryMax: 110000,
    skillSlugs: ["recruiting", "project-management", "data-analysis", "technical-writing"],
    benefitSlugs: ["health-insurance", "learning-budget", "parental-leave", "annual-bonus"],
    publishedDaysAgo: 16,
  },
  {
    slug: "atlas-project-coordinator",
    title: "Project Coordinator",
    companySlug: "atlas-advisory",
    family: "operations",
    mission: "keep client projects organized, documented, and on schedule",
    location: "Chicago, United States",
    country: "United States",
    timeZone: "UTC-06:00",
    workplaceType: WorkplaceType.ON_SITE,
    jobType: JobType.TEMPORARY,
    experienceLevel: ExperienceLevel.ENTRY,
    market: Market.PROFESSIONAL_SERVICES,
    salaryMin: 55000,
    salaryMax: 70000,
    skillSlugs: ["project-management", "technical-writing", "data-analysis"],
    benefitSlugs: ["learning-budget", "volunteer-days", "flexible-hours"],
    publishedDaysAgo: 24,
  },
  {
    slug: "nimbus-cloud-infrastructure-engineer",
    title: "Cloud Infrastructure Engineer",
    companySlug: "nimbus-systems",
    family: "engineering",
    mission: "automate resilient cloud environments for enterprise customers",
    location: "Bengaluru, India",
    country: "India",
    timeZone: "UTC+05:30",
    workplaceType: WorkplaceType.HYBRID,
    jobType: JobType.FULL_TIME,
    experienceLevel: ExperienceLevel.SENIOR,
    market: Market.TECHNOLOGY,
    salaryMin: 55000,
    salaryMax: 80000,
    skillSlugs: ["aws", "terraform", "kubernetes", "docker", "observability"],
    benefitSlugs: ["health-insurance", "learning-budget", "wellness", "annual-bonus"],
    isActivelyRecruiting: true,
    publishedDaysAgo: 1,
  },
  {
    slug: "nimbus-qa-automation-engineer",
    title: "QA Automation Engineer",
    companySlug: "nimbus-systems",
    family: "engineering",
    mission: "increase release confidence through dependable automated test coverage",
    location: "Bengaluru, India",
    country: "India",
    timeZone: "UTC+05:30",
    workplaceType: WorkplaceType.HYBRID,
    jobType: JobType.FULL_TIME,
    experienceLevel: ExperienceLevel.MID,
    market: Market.TECHNOLOGY,
    salaryMin: 35000,
    salaryMax: 52000,
    skillSlugs: ["quality-assurance", "playwright", "vitest", "typescript", "ci-cd"],
    benefitSlugs: ["health-insurance", "learning-budget", "wellness", "flexible-hours"],
    publishedDaysAgo: 7,
  },
  {
    slug: "nimbus-developer-advocate",
    title: "Developer Advocate",
    companySlug: "nimbus-systems",
    family: "marketing",
    mission: "help developers adopt cloud tooling through useful examples and education",
    location: "Remote, Asia-Pacific",
    country: "Remote",
    timeZone: "UTC+05:30 to UTC+10:00",
    workplaceType: WorkplaceType.REMOTE,
    jobType: JobType.FULL_TIME,
    experienceLevel: ExperienceLevel.SENIOR,
    market: Market.TECHNOLOGY,
    salaryMin: 70000,
    salaryMax: 100000,
    skillSlugs: ["technical-writing", "aws", "docker", "typescript", "content-strategy"],
    benefitSlugs: ["remote-work", "home-office", "learning-budget", "flexible-hours"],
    publishedDaysAgo: 12,
  },
  {
    slug: "nimbus-technical-support-engineer",
    title: "Technical Support Engineer",
    companySlug: "nimbus-systems",
    family: "customer",
    mission: "resolve complex platform issues and improve customer self-service",
    location: "Bengaluru, India",
    country: "India",
    timeZone: "UTC+05:30",
    workplaceType: WorkplaceType.ON_SITE,
    jobType: JobType.FULL_TIME,
    experienceLevel: ExperienceLevel.ENTRY,
    market: Market.TECHNOLOGY,
    salaryMin: 26000,
    salaryMax: 38000,
    skillSlugs: ["customer-success", "technical-writing", "docker", "observability"],
    benefitSlugs: ["health-insurance", "learning-budget", "wellness", "annual-bonus"],
    publishedDaysAgo: 19,
  },
  {
    slug: "harborpay-payments-product-manager",
    title: "Payments Product Manager",
    companySlug: "harborpay",
    family: "product",
    mission: "launch reliable cross-border payment capabilities for marketplaces",
    location: "Singapore",
    country: "Singapore",
    timeZone: "UTC+08:00",
    workplaceType: WorkplaceType.HYBRID,
    jobType: JobType.FULL_TIME,
    experienceLevel: ExperienceLevel.SENIOR,
    market: Market.FINTECH,
    salaryMin: 125000,
    salaryMax: 165000,
    skillSlugs: ["product-management", "payments", "roadmapping", "compliance", "product-analytics"],
    benefitSlugs: ["health-insurance", "learning-budget", "annual-bonus", "parental-leave"],
    isActivelyRecruiting: true,
    publishedDaysAgo: 2,
  },
  {
    slug: "harborpay-risk-analyst",
    title: "Risk Analyst",
    companySlug: "harborpay",
    family: "data",
    mission: "detect payment risk patterns without adding friction for good customers",
    location: "Singapore",
    country: "Singapore",
    timeZone: "UTC+08:00",
    workplaceType: WorkplaceType.HYBRID,
    jobType: JobType.CONTRACT,
    experienceLevel: ExperienceLevel.MID,
    market: Market.FINTECH,
    salaryMin: 75000,
    salaryMax: 100000,
    skillSlugs: ["risk-management", "payments", "sql", "data-analysis", "compliance"],
    benefitSlugs: ["flexible-hours", "learning-budget", "wellness"],
    publishedDaysAgo: 8,
  },
  {
    slug: "harborpay-site-reliability-engineer",
    title: "Site Reliability Engineer",
    companySlug: "harborpay",
    family: "engineering",
    mission: "keep payment services observable, resilient, and ready for regional growth",
    location: "Remote, Asia-Pacific",
    country: "Remote",
    timeZone: "UTC+05:30 to UTC+10:00",
    workplaceType: WorkplaceType.REMOTE,
    jobType: JobType.FULL_TIME,
    experienceLevel: ExperienceLevel.SENIOR,
    market: Market.FINTECH,
    salaryMin: 115000,
    salaryMax: 155000,
    skillSlugs: ["aws", "kubernetes", "terraform", "observability", "payments"],
    benefitSlugs: ["remote-work", "home-office", "health-insurance", "annual-bonus"],
    publishedDaysAgo: 11,
  },
  {
    slug: "harborpay-compliance-operations-specialist",
    title: "Compliance Operations Specialist",
    companySlug: "harborpay",
    family: "operations",
    mission: "run consistent onboarding and transaction-review controls across markets",
    location: "Singapore",
    country: "Singapore",
    timeZone: "UTC+08:00",
    workplaceType: WorkplaceType.ON_SITE,
    jobType: JobType.FULL_TIME,
    experienceLevel: ExperienceLevel.MID,
    market: Market.FINTECH,
    salaryMin: 65000,
    salaryMax: 88000,
    skillSlugs: ["compliance", "risk-management", "payments", "project-management"],
    benefitSlugs: ["health-insurance", "learning-budget", "annual-bonus", "volunteer-days"],
    publishedDaysAgo: 18,
  },
  {
    slug: "wellnest-lead-product-designer",
    title: "Lead Product Designer",
    companySlug: "wellnest-health",
    family: "design",
    mission: "lead accessible member and care-coordinator experiences across the platform",
    location: "Sydney, Australia",
    country: "Australia",
    timeZone: "UTC+10:00",
    workplaceType: WorkplaceType.HYBRID,
    jobType: JobType.FULL_TIME,
    experienceLevel: ExperienceLevel.LEAD,
    market: Market.HEALTHCARE,
    salaryMin: 130000,
    salaryMax: 165000,
    skillSlugs: ["figma", "user-research", "design-systems", "product-management", "healthcare-operations"],
    benefitSlugs: ["health-insurance", "parental-leave", "wellness", "annual-bonus"],
    isActivelyRecruiting: true,
    publishedDaysAgo: 3,
  },
  {
    slug: "wellnest-machine-learning-engineer",
    title: "Machine Learning Engineer",
    companySlug: "wellnest-health",
    family: "data",
    mission: "build responsible models that help care teams prioritize outreach",
    location: "Remote, Australia",
    country: "Australia",
    timeZone: "UTC+08:00 to UTC+11:00",
    workplaceType: WorkplaceType.REMOTE,
    jobType: JobType.FULL_TIME,
    experienceLevel: ExperienceLevel.SENIOR,
    market: Market.HEALTHCARE,
    salaryMin: 125000,
    salaryMax: 160000,
    skillSlugs: ["python", "machine-learning", "sql", "aws", "healthcare-operations"],
    benefitSlugs: ["remote-work", "home-office", "health-insurance", "learning-budget"],
    publishedDaysAgo: 7,
  },
  {
    slug: "wellnest-director-care-operations",
    title: "Director of Care Operations",
    companySlug: "wellnest-health",
    family: "operations",
    mission: "set the operating model for safe, consistent preventive-care programs",
    location: "Sydney, Australia",
    country: "Australia",
    timeZone: "UTC+10:00",
    workplaceType: WorkplaceType.HYBRID,
    jobType: JobType.FULL_TIME,
    experienceLevel: ExperienceLevel.EXECUTIVE,
    market: Market.HEALTHCARE,
    salaryMin: 165000,
    salaryMax: 210000,
    skillSlugs: ["healthcare-operations", "project-management", "data-analysis", "customer-success"],
    benefitSlugs: ["health-insurance", "parental-leave", "annual-bonus", "wellness"],
    publishedDaysAgo: 14,
  },
  {
    slug: "wellnest-implementation-specialist",
    title: "Implementation Specialist",
    companySlug: "wellnest-health",
    family: "customer",
    mission: "launch employer health programs with clear plans and strong partner training",
    location: "Sydney, Australia",
    country: "Australia",
    timeZone: "UTC+10:00",
    workplaceType: WorkplaceType.ON_SITE,
    jobType: JobType.FULL_TIME,
    experienceLevel: ExperienceLevel.MID,
    market: Market.HEALTHCARE,
    salaryMin: 75000,
    salaryMax: 98000,
    skillSlugs: ["customer-success", "project-management", "healthcare-operations", "technical-writing"],
    benefitSlugs: ["health-insurance", "learning-budget", "wellness", "volunteer-days"],
    publishedDaysAgo: 22,
  },
];

const roleCopy: Record<
  RoleFamily,
  { responsibilities: [string, string]; idealProfile: [string, string] }
> = {
  engineering: {
    responsibilities: [
      "Ship maintainable production changes with useful tests and operational visibility.",
      "Review technical proposals and improve reliability, security, and delivery practices.",
    ],
    idealProfile: [
      "You have shipped production software and can explain your technical decisions clearly.",
      "You work well with product, design, data, and operations partners.",
    ],
  },
  product: {
    responsibilities: [
      "Turn customer evidence and business goals into a focused roadmap.",
      "Define success measures and guide delivery with design, engineering, and go-to-market partners.",
    ],
    idealProfile: [
      "You have owned product outcomes from discovery through launch and iteration.",
      "You make clear trade-offs and communicate decisions to technical and non-technical teams.",
    ],
  },
  design: {
    responsibilities: [
      "Research user needs and translate findings into accessible end-to-end experiences.",
      "Prototype, test, and refine solutions with product and engineering partners.",
    ],
    idealProfile: [
      "Your portfolio shows strong interaction design, product thinking, and research judgment.",
      "You can simplify complex workflows without losing important detail.",
    ],
  },
  data: {
    responsibilities: [
      "Build dependable analysis or data products that teams can use to make decisions.",
      "Document assumptions, validate data quality, and communicate findings with appropriate context.",
    ],
    idealProfile: [
      "You can move from an ambiguous question to a reproducible, well-explained result.",
      "You understand data quality, privacy, and the limits of quantitative evidence.",
    ],
  },
  marketing: {
    responsibilities: [
      "Plan useful campaigns and content for a defined audience and measurable goal.",
      "Use performance data and customer feedback to improve each program.",
    ],
    idealProfile: [
      "You have delivered audience-focused programs and can show how they affected growth or adoption.",
      "You write clearly and collaborate comfortably with product, sales, and creative teams.",
    ],
  },
  customer: {
    responsibilities: [
      "Guide customers from planning through launch, adoption, and measurable value.",
      "Turn recurring customer needs into clear feedback for product and operations teams.",
    ],
    idealProfile: [
      "You build trusted customer relationships and manage several workstreams without losing detail.",
      "You explain technical or operational concepts in direct, practical language.",
    ],
  },
  operations: {
    responsibilities: [
      "Run accurate operating processes and improve them using data and frontline feedback.",
      "Coordinate owners, timelines, controls, and documentation across teams.",
    ],
    idealProfile: [
      "You bring structure to detailed work and follow issues through to resolution.",
      "You spot operational risk early and communicate changes with care.",
    ],
  },
  people: {
    responsibilities: [
      "Build fair, consistent people processes and maintain clear candidate communication.",
      "Use hiring data and stakeholder feedback to improve team planning and execution.",
    ],
    idealProfile: [
      "You have managed end-to-end hiring or people programs in a growing organization.",
      "You balance a strong candidate experience with sound process and documentation.",
    ],
  },
  consulting: {
    responsibilities: [
      "Structure ambiguous client problems and turn analysis into practical recommendations.",
      "Own workstreams, facilitate decisions, and present findings to senior stakeholders.",
    ],
    idealProfile: [
      "You combine analytical rigor with concise writing and confident client communication.",
      "You can manage competing priorities while protecting the quality of the work.",
    ],
  },
};

const experienceCopy: Record<ExperienceLevel, string> = {
  [ExperienceLevel.ENTRY]: "Early-career",
  [ExperienceLevel.MID]: "Mid-level",
  [ExperienceLevel.SENIOR]: "Senior-level",
  [ExperienceLevel.LEAD]: "Lead-level",
  [ExperienceLevel.EXECUTIVE]: "Executive-level",
};

function requireDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to seed the database.");
  }

  return databaseUrl;
}

async function seed() {
  const adapter = new PrismaPg({ connectionString: requireDatabaseUrl() });
  const db = new PrismaClient({ adapter });
  const companyBySlug = new Map(companies.map((company) => [company.slug, company]));
  const skillNameBySlug = new Map<string, string>(skills);
  const benefitNameBySlug = new Map<string, string>(benefits);
  const now = new Date();

  try {
    for (const company of companies) {
      await db.company.upsert({
        where: { slug: company.slug },
        create: {
          ...company,
          websiteUrl: `https://${company.slug}.example`,
        },
        update: {
          name: company.name,
          description: company.description,
          size: company.size,
          location: company.location,
          websiteUrl: `https://${company.slug}.example`,
        },
      });
    }

    for (const [slug, name] of skills) {
      await db.skill.upsert({
        where: { slug },
        create: { slug, name },
        update: { name },
      });
    }

    for (const [slug, name] of benefits) {
      await db.benefit.upsert({
        where: { slug },
        create: { slug, name },
        update: { name },
      });
    }

    for (const job of jobs.toSorted((a, b) => Number(a.publishedDaysAgo === 0) - Number(b.publishedDaysAgo === 0))) {
      const company = companyBySlug.get(job.companySlug);

      if (!company) {
        throw new Error(`Missing company seed for ${job.companySlug}.`);
      }

      const role = roleCopy[job.family];
      const namedSkills = job.skillSlugs.map((slug) => {
        const name = skillNameBySlug.get(slug);

        if (!name) {
          throw new Error(`Missing skill seed for ${slug}.`);
        }

        return name;
      });
      const namedBenefits = job.benefitSlugs.map((slug) => {
        const name = benefitNameBySlug.get(slug);

        if (!name) {
          throw new Error(`Missing benefit seed for ${slug}.`);
        }

        return name;
      });
      const publishedAt = new Date(
        now.getTime() - job.publishedDaysAgo * 24 * 60 * 60 * 1000,
      );
      const scalarData = {
        title: job.title,
        summary: `Join ${company.name} as ${job.title} to ${job.mission}.`,
        about: `${company.description} You will ${job.mission} and work with colleagues across the business.`,
        responsibilities: [
          `Plan and deliver work that helps ${company.name} ${job.mission}.`,
          ...role.responsibilities,
        ],
        idealProfile: [
          `${experienceCopy[job.experienceLevel]} experience using ${namedSkills.slice(0, 3).join(", ")}.`,
          ...role.idealProfile,
        ],
        whatsOnOffer: namedBenefits,
        location: job.location,
        country: job.country,
        timeZone: job.timeZone,
        workplaceType: job.workplaceType,
        jobType: job.jobType,
        experienceLevel: job.experienceLevel,
        market: job.market,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        salaryCurrency: "USD",
        isActive: true,
        isActivelyRecruiting: job.isActivelyRecruiting ?? false,
        publishedAt,
      };
      const skillCreates = job.skillSlugs.map((slug) => ({
        skill: { connect: { slug } },
      }));
      const benefitCreates = job.benefitSlugs.map((slug) => ({
        benefit: { connect: { slug } },
      }));

      await db.job.upsert({
        where: { slug: job.slug },
        create: {
          slug: job.slug,
          ...scalarData,
          company: { connect: { slug: job.companySlug } },
          skills: { create: skillCreates },
          benefits: { create: benefitCreates },
        },
        update: {
          ...scalarData,
          company: { connect: { slug: job.companySlug } },
          skills: { deleteMany: {}, create: skillCreates },
          benefits: { deleteMany: {}, create: benefitCreates },
        },
      });
    }

    // Allow refreshing assignment jobs without changing the reviewer's edited demo profile.
    if (!process.argv.includes("--jobs-only")) {
      const demoUser = await db.user.upsert({
        where: { email: DEMO_CANDIDATE_EMAIL },
        create: {
          name: "Jordan Lee",
          email: DEMO_CANDIDATE_EMAIL,
          emailVerified: false,
        },
        update: {
          name: "Jordan Lee",
        },
      });

      const demoCredential = await buildCredentialAccountData(
        demoUser.id,
        DEMO_CANDIDATE_PASSWORD,
      );

      await db.account.upsert({
        where: {
          providerId_accountId: {
            providerId: demoCredential.providerId,
            accountId: demoCredential.accountId,
          },
        },
        create: demoCredential,
        update: { password: demoCredential.password },
      });

      await db.candidateProfile.upsert({
        where: { userId: demoUser.id },
        create: {
          userId: demoUser.id,
          headline: "Full-stack engineer building reliable web products",
          phone: "+1 555 010 2040",
          location: "New York, United States",
          country: "United States",
          timeZone: "UTC-05:00",
          yearsExperience: 6,
          experienceLevel: ExperienceLevel.SENIOR,
          bio: "Product-minded engineer with experience across TypeScript, React, Node.js, PostgreSQL, and cloud delivery.",
          preferredMarkets: [Market.TECHNOLOGY, Market.FINTECH],
          preferredWorkplaceTypes: [WorkplaceType.REMOTE, WorkplaceType.HYBRID],
          skills: {
            create: ["typescript", "react", "next-js", "node-js", "postgresql", "aws"].map(
              (slug) => ({ skill: { connect: { slug } } }),
            ),
          },
        },
        update: {
          headline: "Full-stack engineer building reliable web products",
          phone: "+1 555 010 2040",
          location: "New York, United States",
          country: "United States",
          timeZone: "UTC-05:00",
          yearsExperience: 6,
          experienceLevel: ExperienceLevel.SENIOR,
          bio: "Product-minded engineer with experience across TypeScript, React, Node.js, PostgreSQL, and cloud delivery.",
          preferredMarkets: [Market.TECHNOLOGY, Market.FINTECH],
          preferredWorkplaceTypes: [WorkplaceType.REMOTE, WorkplaceType.HYBRID],
          skills: {
            deleteMany: {},
            create: ["typescript", "react", "next-js", "node-js", "postgresql", "aws"].map(
              (slug) => ({ skill: { connect: { slug } } }),
            ),
          },
        },
      });

    }

    const [companyCount, jobCount, skillCount, benefitCount, candidateCount] =
      await Promise.all([
        db.company.count({ where: { slug: { in: companies.map(({ slug }) => slug) } } }),
        db.job.count({ where: { slug: { in: jobs.map(({ slug }) => slug) } } }),
        db.skill.count({ where: { slug: { in: skills.map(([slug]) => slug) } } }),
        db.benefit.count({ where: { slug: { in: benefits.map(([slug]) => slug) } } }),
        db.user.count({ where: { email: DEMO_CANDIDATE_EMAIL } }),
      ]);

    console.info(
      `Seed complete: ${companyCount} companies, ${jobCount} jobs, ${skillCount} skills, ${benefitCount} benefits, ${candidateCount} demo candidate.`,
    );
  } finally {
    await db.$disconnect();
  }
}

await seed();
