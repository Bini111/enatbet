import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';

/**
 * Storage Service
 * Handles file uploads to Firebase Storage
 */

// Upload image and return download URL
export const uploadImage = async (
  file: File | Blob,
  path: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to upload image');
  }
};

// Upload listing image
export const uploadListingImage = async (
  file: File | Blob,
  listingId: string,
  imageIndex: number
): Promise<string> => {
  const path = `listings/${listingId}/image_${imageIndex}_${Date.now()}.jpg`;
  return uploadImage(file, path);
};

// Upload profile photo
export const uploadProfilePhoto = async (
  file: File | Blob,
  userId: string
): Promise<string> => {
  const path = `users/${userId}/profile_${Date.now()}.jpg`;
  return uploadImage(file, path);
};

// Delete image
export const deleteImage = async (imageUrl: string): Promise<void> => {
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error: any) {
    // Ignore errors if file doesn't exist
    if (error.code !== 'storage/object-not-found') {
      throw new Error(error.message || 'Failed to delete image');
    }
  }
};

// Get file extension from URI
export const getFileExtension = (uri: string): string => {
  return uri.split('.').pop()?.toLowerCase() || 'jpg';
};

// Convert URI to Blob (for React Native)
export const uriToBlob = async (uri: string): Promise<Blob> => {
  const response = await fetch(uri);
  return response.blob();
};
