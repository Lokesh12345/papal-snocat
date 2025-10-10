export interface Template {
  id: string;
  name: string;
  brand: string;
  subject: string;
  body: string;
  text: string;
  placeholders: string[];
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface Locale {
  lang: string;
  data: Record<string, string>;
}

export interface LocaleCompleteness {
  lang: string;
  status: 'complete' | 'partial' | 'missing';
  completeness: number;
  missingKeys: string[];
}

export interface ValidationResult {
  status: 'pass' | 'warning' | 'fail';
  checks: ValidationCheck[];
}

export interface ValidationCheck {
  name: string;
  status: 'pass' | 'warning' | 'fail';
  message: string;
  details: any;
}

export interface Request {
  id: string;
  brand: string;
  title: string;
  description: string;
  priority: 'P0' | 'P1' | 'P2';
  status: 'new' | 'in-progress' | 'localization' | 'qa-review' | 'deployed';
  templateId: string | null;
  smsId?: string | null;
  createdAt: string;
  updatedAt: string;
  deployedAt?: string;
}

export interface Analytics {
  totalRequests: number;
  statusBreakdown: Record<string, number>;
  brandBreakdown: Record<string, number>;
  priorityBreakdown: Record<string, number>;
  avgCycleTimeHours: number;
  bottleneck: string;
}

export type Brand = 'paypal' | 'venmo' | 'zettle' | 'xoom' | 'fastlane';

export interface Component {
  id: string;
  name: string;
  description: string;
  html: string;
  createdAt: string;
}

export interface SMS {
  id: string;
  name: string;
  brand: Brand;
  message: string;
  placeholders: string[];
  createdAt: string;
  updatedAt: string;
}
