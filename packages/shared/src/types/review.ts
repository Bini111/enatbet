export interface Review {
  id: string;
  listingId: string;
  bookingId: string;
  guestId: string;
  hostId: string;
  rating: number; // 1-5
  comment: string;
  cleanliness: number; // 1-5
  accuracy: number; // 1-5
  communication: number; // 1-5
  location: number; // 1-5
  value: number; // 1-5
  response?: {
    text: string;
    createdAt: Date;
  };
  flagged: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReviewInput {
  listingId: string;
  bookingId: string;
  rating: number;
  comment: string;
  cleanliness: number;
  accuracy: number;
  communication: number;
  location: number;
  value: number;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  cleanliness: number;
  accuracy: number;
  communication: number;
  location: number;
  value: number;
}
