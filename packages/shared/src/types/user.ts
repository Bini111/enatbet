/**
 * User and Authentication Types
 */

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  metadata: UserMetadata;
  profile?: UserProfile;
}

export type UserRole = 'guest' | 'host' | 'both' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'deleted' | 'pending_verification';

export interface UserMetadata {
  lastLoginAt?: Date;
  loginCount: number;
  preferredLanguage: 'en' | 'am';
  preferredCurrency: string;
  notificationSettings: NotificationSettings;
  twoFactorEnabled: boolean;
}

export interface UserProfile {
  bio?: string;
  languages?: string[];
  occupation?: string;
  location?: string;
  dateOfBirth?: Date;
  governmentIdVerified: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  superhost: boolean;
  hostSince?: Date;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  marketing: boolean;
  bookingUpdates: boolean;
  messages: boolean;
  reviews: boolean;
  promotions: boolean;
}

export interface VerificationDocument {
  type: DocumentType;
  status: VerificationStatus;
  uploadedAt: Date;
  verifiedAt?: Date;
  expiresAt?: Date;
  rejectionReason?: string;
}

export type DocumentType = 'passport' | 'drivers_license' | 'national_id';
export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'expired';
