import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithCredential,
  PhoneAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  onAuthStateChanged,
  User as FirebaseUser,
  OAuthProvider,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { auth, db, collections, getErrorMessage } from '../config/firebase';
import { User, SignUpData, SignInData } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';

class AuthService {
  private googleProvider = new GoogleAuthProvider();
  private appleProvider = new OAuthProvider('apple.com');

  // Sign up with email and password
  async signUp(data: SignUpData): Promise<User> {
    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const firebaseUser = userCredential.user;

      // Update display name
      await updateProfile(firebaseUser, {
        displayName: data.displayName,
      });

      // Create user document in Firestore
      const userData: User = {
        id: firebaseUser.uid,
        email: data.email,
        displayName: data.displayName,
        phoneNumber: data.phoneNumber || '',
        bio: '',
        languages: ['en'], // Default to English
        isHost: false,
        verified: {
          email: false,
          phone: false,
          id: false,
        },
        communityVerification: {
          status: 'pending',
          method: 'self_attestation',
        },
        stats: {
          averageRating: 0,
          totalReviews: 0,
          responseRate: 0,
          responseTime: 0,
        },
        badges: {
          superhost: false,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save to Firestore
      await setDoc(doc(db, collections.users, firebaseUser.uid), {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Send email verification
      await sendEmailVerification(firebaseUser);

      // Store auth token
      const token = await firebaseUser.getIdToken();
      await AsyncStorage.setItem('authToken', token);

      return userData;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  // Sign in with email and password
  async signIn(data: SignInData): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const firebaseUser = userCredential.user;

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, collections.users, firebaseUser.uid));
      
      if (!userDoc.exists()) {
        throw new Error('User profile not found. Please contact support.');
      }

      const userData = { id: userDoc.id, ...userDoc.data() } as User;

      // Update last login
      await updateDoc(doc(db, collections.users, firebaseUser.uid), {
        lastLoginAt: serverTimestamp(),
      });

      // Store auth token
      const token = await firebaseUser.getIdToken();
      await AsyncStorage.setItem('authToken', token);

      return userData;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  // Sign in with Google
  async signInWithGoogle(): Promise<User> {
    try {
      // This would typically use expo-auth-session for Google Sign-In
      // For Expo Go compatibility, we'll use web-based auth flow
      throw new Error('Google Sign-In requires additional setup. Please use email/password for now.');
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  // Sign in with Apple
  async signInWithApple(): Promise<User> {
    try {
      // Check if Apple Authentication is available
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      
      if (!isAvailable) {
        throw new Error('Apple Sign-In is not available on this device.');
      }

      // Generate nonce for security
      const nonce = Math.random().toString(36).substring(2, 10);
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        nonce
      );

      // Request Apple credential
      const appleCredential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });

      // Build Firebase credential
      const { identityToken } = appleCredential;
      if (!identityToken) {
        throw new Error('No identity token received from Apple.');
      }

      const provider = new OAuthProvider('apple.com');
      const credential = provider.credential({
        idToken: identityToken,
        rawNonce: nonce,
      });

      // Sign in with Firebase
      const userCredential = await signInWithCredential(auth, credential);
      const firebaseUser = userCredential.user;

      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, collections.users, firebaseUser.uid));

      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() } as User;
      }

      // Create new user if doesn't exist
      const userData: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || appleCredential.email || '',
        displayName: appleCredential.fullName
          ? `${appleCredential.fullName.givenName || ''} ${appleCredential.fullName.familyName || ''}`.trim()
          : firebaseUser.displayName || 'User',
        phoneNumber: '',
        bio: '',
        languages: ['en'],
        isHost: false,
        verified: {
          email: true, // Apple verifies email
          phone: false,
          id: false,
        },
        communityVerification: {
          status: 'pending',
          method: 'self_attestation',
        },
        stats: {
          averageRating: 0,
          totalReviews: 0,
          responseRate: 0,
          responseTime: 0,
        },
        badges: {
          superhost: false,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save to Firestore
      await setDoc(doc(db, collections.users, firebaseUser.uid), {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return userData;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  // Send phone verification code
  async sendPhoneVerificationCode(phoneNumber: string): Promise<string> {
    try {
      // Note: Phone authentication requires additional setup for reCAPTCHA
      // This is a simplified version - production would need proper reCAPTCHA setup
      
      // Format phone number (ensure it includes country code)
      const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+1${phoneNumber}`;
      
      // For Expo Go, we'd typically use Firebase Auth REST API
      // This is a placeholder that would need proper implementation
      const verificationId = 'mock-verification-id';
      
      // In production, you would use:
      // const confirmationResult = await signInWithPhoneNumber(auth, formattedNumber, recaptchaVerifier);
      // return confirmationResult.verificationId;
      
      return verificationId;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  // Verify phone number with code
  async verifyPhoneNumber(verificationId: string, code: string): Promise<void> {
    try {
      // In production:
      // const credential = PhoneAuthProvider.credential(verificationId, code);
      // await auth.currentUser?.linkWithCredential(credential);
      
      // Update user document
      if (auth.currentUser) {
        await updateDoc(doc(db, collections.users, auth.currentUser.uid), {
          'verified.phone': true,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  // Reset password
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem('authToken');
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const firebaseUser = auth.currentUser;
      
      if (!firebaseUser) {
        return null;
      }

      const userDoc = await getDoc(doc(db, collections.users, firebaseUser.uid));
      
      if (!userDoc.exists()) {
        return null;
      }

      return { id: userDoc.id, ...userDoc.data() } as User;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<User>): Promise<void> {
    try {
      await updateDoc(doc(db, collections.users, userId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      // Update Firebase Auth profile if display name changed
      if (updates.displayName && auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: updates.displayName,
        });
      }
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  // Upload community verification document
  async uploadVerificationDocument(userId: string, documentUrl: string): Promise<void> {
    try {
      await updateDoc(doc(db, collections.users, userId), {
        'communityVerification.method': 'id_upload',
        'communityVerification.idDocumentURL': documentUrl,
        'communityVerification.status': 'pending',
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  // Subscribe to auth state changes
  subscribeToAuthChanges(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, collections.users, firebaseUser.uid));
        if (userDoc.exists()) {
          callback({ id: userDoc.id, ...userDoc.data() } as User);
        } else {
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }

  // Check if email is already registered
  async isEmailRegistered(email: string): Promise<boolean> {
    try {
      const usersRef = collection(db, collections.users);
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  }

  // Resend verification email
  async resendVerificationEmail(): Promise<void> {
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
      } else {
        throw new Error('No user signed in');
      }
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }
}

export default new AuthService();