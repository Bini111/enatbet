export type RootStackParamList = {
  MainTabs: undefined;
  Home: undefined;
  Search: { location?: string };
  PropertyDetails: { propertyId?: string; listingId?: string };
  Booking: { propertyId?: string; listingId?: string };
  BookingConfirmation: { bookingId: string };
  Profile: undefined;
  MyBookings: undefined;
  Messages: undefined;
  Chat: { conversationId: string };
  Login: undefined;
  SignUp: undefined;
  About: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  ForgotPassword: undefined;
  BecomeAHost: undefined;
  Contact: undefined;
  Resources: undefined;
};

export type TabParamList = {
  Explore: undefined;
  Favorites: undefined;
  Bookings: undefined;
  Messages: undefined;
  Profile: undefined;
};
