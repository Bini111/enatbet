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
};

export type TabParamList = {
  Explore: undefined;
  Favorites: undefined;
  Bookings: undefined;
  Messages: undefined;
  Profile: undefined;
};
