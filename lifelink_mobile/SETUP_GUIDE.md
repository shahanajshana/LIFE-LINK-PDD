# LifeLink Mobile App - Setup Guide

## Quick Start

1. **Navigate to the mobile app directory**:
   ```bash
   cd lifelink_mobile
   ```

2. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   - Copy your Supabase credentials from `frontend/.env`
   - Update `lifelink_mobile/.env`:
     ```
     EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
     EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key-here
     ```

4. **Start the development server**:
   ```bash
   npm start
   ```

5. **Run on your preferred platform**:
   - Press `a` for Android
   - Press `i` for iOS (macOS only)
   - Press `w` for web
   - Scan QR code with Expo Go app (mobile)

## Environment Setup

### Required Credentials
Get these from your Supabase project settings:
- Project URL
- Anon Public Key

### Setting Environment Variables
The `.env` file should contain:
```
EXPO_PUBLIC_SUPABASE_URL=your_actual_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key
```

## Platform-Specific Setup

### Android
1. Install Android Studio
2. Set up Android SDK
3. Enable USB debugging on your device
4. Run: `npm run android`

### iOS (macOS only)
1. Install Xcode
2. Install CocoaPods: `sudo gem install cocoapods`
3. Run: `npm run ios`

### Web
1. Simply run: `npm run web`
2. Opens in default browser

## Troubleshooting

### Metro bundler issues
```bash
npm start -- --clear
```

### Environment variables not loading
- Restart the development server after updating `.env`
- Ensure variables start with `EXPO_PUBLIC_`

### Supabase connection errors
- Verify your Supabase URL and anon key are correct
- Check that your Supabase project is active
- Ensure RLS policies are properly configured

### Navigation issues
- Ensure all screen files exist in `src/app/` directory
- Check that imports are correct

### TypeScript errors
```bash
npm run lint
```

## Key Features Implemented

✅ Authentication (Login/Register)
✅ Dashboard with user stats
✅ Emergency SOS requests
✅ Blood donation scheduling
✅ Blood bank stock search
✅ Donor search and filtering
✅ Hospital network directory
✅ Settings page
✅ Bottom navigation
✅ Mobile-responsive layouts
✅ Safe area handling
✅ TypeScript support

## Next Steps

1. Test all user flows on physical device
2. Configure push notifications
3. Add proper error handling
4. Implement offline support
5. Add app icon and splash screen
6. Test on different screen sizes
7. Performance optimization
8. Prepare for app store submission

## Development Notes

- The app uses Expo Router for file-based navigation
- All screens have bottom navigation (except auth)
- API calls use the same Supabase backend as web version
- Session persistence via AsyncStorage
- Responsive design adapts to different screen sizes
- Bottom navigation is scrollable for smaller screens