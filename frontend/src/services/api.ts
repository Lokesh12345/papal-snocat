import axios from 'axios';
import type { Template, Locale, ValidationResult, Request, Analytics, Brand, Component, SMS } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

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
  sendTest: (brand: Brand, id: string, recipient: string) => api.post(`/templates/${brand}/${id}/send-test`, { recipient }),
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

export const componentAPI = {
  getAll: () => api.get<Component[]>('/components'),
  getOne: (id: string) => api.get<Component>(`/components/${id}`),
  create: (component: Partial<Component>) => api.post<Component>('/components', component),
  update: (id: string, updates: Partial<Component>) => api.put<Component>(`/components/${id}`, updates),
  delete: (id: string) => api.delete(`/components/${id}`),
};

export const smsAPI = {
  getAll: (brand?: Brand) => api.get<SMS[]>('/sms', { params: { brand } }),
  getOne: (id: string) => api.get<SMS>(`/sms/${id}`),
  create: (sms: Partial<SMS>) => api.post<SMS>('/sms', sms),
  update: (id: string, updates: Partial<SMS>) => api.put<SMS>(`/sms/${id}`, updates),
  delete: (id: string) => api.delete(`/sms/${id}`),
};
