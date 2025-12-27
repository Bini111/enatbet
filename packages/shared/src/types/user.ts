export type UserRole = 'guest' | 'host' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'deleted';

export interface User {
  id: string;
  email: string;
  displayName: string;
  phone?: string;
  photoURL?: string;
  bio?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  role: UserRole;
  status: UserStatus;
  stripeAccountId?: string;
  stripeCustomerId?: string;
  isVerified: boolean;
  verificationDocuments?: string[];
  favorites?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface HostProfile extends User {
  role: 'host';
  stripeAccountId: string;
  onboardingComplete: boolean;
  responseRate?: number;
  responseTime?: number;
  totalListings: number;
  totalBookings: number;
  averageRating?: number;
}

export interface CreateUserInput {
  email: string;
  password: string;
  displayName: string;
  phone?: string;
  role?: UserRole;
}

export interface UpdateUserProfileInput {
  displayName?: string;
  phone?: string;
  bio?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  photoURL?: string;
}
