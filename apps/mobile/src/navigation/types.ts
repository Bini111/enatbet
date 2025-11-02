export type RootStackParamList = {
  MainTabs: undefined;
  Home: undefined;
  Search: { location?: string };
  PropertyDetails: { propertyId: string };
  Booking: { propertyId: string };
  BookingConfirmation: { bookingId: string };
  Profile: undefined;
  MyBookings: undefined;
  Login: undefined;
  SignUp: undefined;
};

export type TabParamList = {
  Explore: undefined;
  Favorites: undefined;
  Bookings: undefined;
  Profile: undefined;
};
