# LifeLink Mobile App

A React Native mobile application for the LifeLink blood donation network, built with Expo.

## Features

- 🔐 **Authentication**: Login and registration with secure authentication
- 🏠 **Dashboard**: Personalized dashboard with user stats and quick actions
- 🩸 **Find Blood**: Real-time blood bank stock availability
- ❤️ **Donate Blood**: Schedule blood donations at partner hospitals
- 👥 **Find Donors**: Search and connect with blood donors
- 🏥 **Hospitals**: Browse partner hospitals and get directions
- 🚨 **Emergency SOS**: Submit and respond to emergency blood requests

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (installed with project)
- Supabase account and project

### Installation

1. **Install dependencies**:
   ```bash
   cd lifelink_mobile
   npm install
   ```

2. **Set up environment variables**:
   - Copy your Supabase credentials from `frontend/.env`
   - Update `lifelink_mobile/.env` with your credentials:
     ```
     EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
     EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key-here
     ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Run on your device**:
   - **Android**: Press `a` in the terminal or scan the QR code with Expo Go app
   - **iOS**: Press `i` in the terminal (requires macOS) or scan the QR code
   - **Web**: Press `w` in the terminal to open in browser

## Project Structure

```
lifelink_mobile/
├── src/
│   ├── app/              # Expo Router file-based navigation
│   │   ├── index.tsx     # Home/landing screen
│   │   ├── auth/         # Authentication screens
│   │   ├── dashboard/    # Main dashboard
│   │   ├── emergency/    # Emergency SOS
│   │   ├── donate-blood/ # Blood donation
│   │   ├── find-blood/   # Blood bank stock
│   │   ├── donor-list/   # Donor search
│   │   └── hospitals/    # Hospital network
│   ├── components/       # Reusable components
│   │   └── BottomNav.tsx # Bottom navigation bar
│   ├── context/          # React context providers
│   │   └── AuthContext.tsx
│   ├── pages/            # Screen components
│   ├── services/         # API services
│   │   └── api.ts        # Supabase API calls
│   └── utils/            # Utility functions
│       └── supabase.ts  # Supabase client
├── .env                  # Environment variables
└── package.json          # Dependencies
```

## Key Technologies

- **Expo SDK 57**: Latest Expo framework
- **React Native 0.86**: Mobile UI framework
- **Expo Router**: File-based routing
- **Supabase**: Backend services (auth, database)
- **TypeScript**: Type safety
- **React Native Safe Area Context**: Device compatibility

## Mobile-First Design

All layouts are optimized for mobile devices with:
- Responsive grid layouts
- Touch-friendly interface
- Bottom navigation for easy thumb access
- Safe area handling for notched devices
- Scrollable content areas

## Authentication Flow

1. User opens app → Redirected to auth screen
2. Login/Register with email and password
3. Upon success → Redirected to dashboard
4. Session persisted using AsyncStorage
5. Auto-logout functionality available

## API Integration

The app uses the same Supabase backend as the web version:
- All API calls go through `src/services/api.ts`
- Real-time data synchronization
- Offline-ready with local storage fallback

## Development Notes

- The app uses Expo Router for navigation
- All screens have bottom navigation (except auth)
- Responsive design adapts to different screen sizes
- Error handling with user-friendly alerts
- Loading states for async operations

## Testing

To test the application:

1. Ensure Supabase credentials are correctly set
2. Start the development server
3. Test on physical device or emulator
4. Verify all main flows:
   - Authentication
   - Dashboard loading
   - Emergency request submission
   - Blood donation recording
   - Donor search functionality

## Future Enhancements

- Push notifications for emergency requests
- Location-based donor matching
- In-app chat for donor communication
- Blood donation reminders
- Achievement badges and gamification
- Offline mode support

## Troubleshooting

**Metro bundler issues**: Clear cache with `npm start -- --clear`

**Environment variables not loading**: Restart the development server after updating `.env`

**Supabase connection errors**: Verify your Supabase URL and anon key are correct

**Navigation issues**: Check that all screen files exist in the `src/app/` directory

## License

This mobile app is part of the LifeLink project.