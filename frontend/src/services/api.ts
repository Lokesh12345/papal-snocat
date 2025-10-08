import axios from 'axios';
import type { Template, Locale, ValidationResult, Request, Analytics, Brand } from '../types';

const API_BASE = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const templateAPI = {
  getAll: (brand: Brand) => api.get<Template[]>(`/templates/${brand}`),
  getOne: (brand: Brand, id: string) => api.get<Template>(`/templates/${brand}/${id}`),
  create: (brand: Brand, template: Partial<Template>) => api.post<Template>(`/templates/${brand}`, template),
  update: (brand: Brand, id: string, updates: Partial<Template>) => api.put<Template>(`/templates/${brand}/${id}`, updates),
  delete: (brand: Brand, id: string) => api.delete(`/templates/${brand}/${id}`),
};

export const localeAPI = {
  getAll: () => api.get<Locale[]>('/locales'),
  getOne: (lang: string) => api.get<Record<string, string>>(`/locales/${lang}`),
  update: (lang: string, data: Record<string, string>) => api.put<Record<string, string>>(`/locales/${lang}`, data),
  getSupportedLanguages: () => api.get<string[]>('/locales/supported'),
};

export const validationAPI = {
  validate: (template: Template) => api.post<ValidationResult>('/validation/validate', template),
};

export const requestAPI = {
  getAll: () => api.get<Request[]>('/requests'),
  create: (request: Partial<Request>) => api.post<Request>('/requests', request),
  update: (id: string, updates: Partial<Request>) => api.put<Request>(`/requests/${id}`, updates),
  delete: (id: string) => api.delete(`/requests/${id}`),
};

export const analyticsAPI = {
  get: () => api.get<Analytics>('/analytics'),
};
