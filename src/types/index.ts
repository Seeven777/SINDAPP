export type UserRole = 'gestao' | 'admin' | 'diretoria' | 'associado';
export type UserStatus = 'pending' | 'active' | 'rejected';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  cnpj?: string;
  workplace?: string;
  documentUrl?: string;
  proofUrl?: string;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Benefit {
  id: string;
  title: string;
  description: string;
  requirements?: string;
  category: string;
  icon?: string;
  url?: string;
  externalLink?: string;
  logoUrl?: string;
  createdAt?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  attachments?: string[];
  externalLink?: string;
  publishedAt: string;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  images?: string[];
  externalLink?: string;
  publishedAt: string;
}

export interface DirectorEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  participants?: string[];
  attachments?: string[];
  createdAt: string;
}
