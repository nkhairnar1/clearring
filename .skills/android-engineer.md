# ClearRing Android Engineer Skill

## Role
Senior Android engineer responsible for Kotlin, Jetpack Compose, permissions, CallScreeningService, Room cache, Retrofit API client, APK builds, and real-device testing.

## Tech Stack
- Language: Kotlin
- UI: Jetpack Compose
- Architecture: MVVM + Repository pattern
- Network: Retrofit + OkHttp + Gson/Moshi
- Local cache: Room database
- Settings: DataStore (Preferences)
- Background work: WorkManager
- DI: Hilt
- Build: Gradle (Kotlin DSL)
- Min SDK: 26 (Android 8.0)
- Target SDK: 35
- Compile SDK: 35

## Project Structure
```
apps/android/app/src/main/
  java/com/clearring/app/
    ui/
      screens/
        splash/
        onboarding/
        login/
        permissions/
        home/
        lookup/
        report/
        business/
        settings/
        themes/
        incoming/
      components/         # Shared Compose components
      theme/              # MaterialTheme definitions for 5 themes
    data/
      api/                # Retrofit interfaces + DTOs
      local/              # Room DAOs + entities
      repository/         # Repository implementations
    domain/
      models/             # Business models
      usecases/           # Use cases
    service/
      ClearRingScreeningService.kt   # CallScreeningService
      BootReceiver.kt
    di/                   # Hilt modules
    utils/
      PhoneUtils.kt
      PermissionUtils.kt
```

## Screen List (11)
1. SplashScreen — logo + tagline, 2s delay, navigate to onboarding or home
2. OnboardingScreen — 4 swipeable feature slides, "Get Started" button
3. PhoneLoginScreen — phone number input, OTP entry (dev: 123456)
4. PermissionEducationScreen — explain each permission, allow skip
5. HomeScreen — search bar, recent lookups, quick actions, stats cards
6. LookupResultScreen — full caller intelligence: RiskBadge, SpamScoreRing, CallerIdentityCard, ReportsList
7. ReportNumberScreen — report type selector, fraud indicator checkboxes, notes, submit
8. IncomingCallScreen — call overlay with risk badge (or permission education fallback)
9. BusinessClaimScreen — business form: name, category, website, address, doc URL, submit
10. SettingsScreen — theme selector, privacy, blocked numbers, account deletion
11. ThemePreviewScreen — 5 theme cards with live preview

## Key Compose Components
- `RiskBadge(riskLevel)` — colored badge with label
- `SpamScoreRing(score)` — circular progress ring with score
- `CallerIdentityCard(result)` — main card with all caller info
- `VerifiedBadge()` — blue checkmark badge
- `SourceLabel(sourceType)` — transparent "Community" / "Admin" label
- `ReportActionSheet()` — bottom sheet with report/block/safe options
- `PermissionEducationCard(permission)` — explains permission, allows skip
- `ThemeSelector(themes, current, onSelect)` — theme grid selector
- `TrustSignalCard(signals)` — positive trust indicators
- `FraudWarningCard(indicators)` — fraud warning with details

## Backend Connection
```kotlin
// local.properties (emulator)
BASE_URL=http://10.0.2.2:3001/api/

// local.properties (real device on LAN)
BASE_URL=http://192.168.1.x:3001/api/

// build.gradle.kts
buildConfigField("String", "BASE_URL", localProperties["BASE_URL"] as String)
```

## CallScreeningService
```kotlin
class ClearRingScreeningService : CallScreeningService() {
    override fun onScreenCall(callDetails: Call.Details) {
        // Lookup number via repository
        // Display notification with risk info
        // If HIGH_RISK: optionally suggest reject
    }
}
```
Requires: `BIND_SCREENING_SERVICE` + `READ_CALL_LOG` permissions, user sets as default screening app.

## DO Rules
- Always show loading state during API calls
- Always show empty state when no data
- Always handle network errors gracefully
- Always cache lookup results in Room (TTL: 1 hour)
- Always use DataStore for theme and settings persistence
- Handle all permissions gracefully — never crash if denied

## DO NOT Rules
- Do not crash if call screening permission is denied
- Do not require contacts permission for manual lookup
- Do not hardcode BASE_URL — read from BuildConfig
- Do not block main thread with network calls
- Do not store JWT tokens in SharedPreferences (use encrypted DataStore)

## Quality Checklist
- [ ] App launches without crash
- [ ] Login with dev OTP 123456 works
- [ ] Manual number lookup returns results
- [ ] Report screen submits successfully
- [ ] Theme selector applies theme immediately
- [ ] Permissions can all be skipped
- [ ] `./gradlew assembleDebug` succeeds
- [ ] APK installs on physical device

## Definition of Done
- `./gradlew assembleDebug` succeeds
- APK at: `app/build/outputs/apk/debug/app-debug.apk`
- App installs on Android 8.0+ device/emulator
- All 11 screens navigate correctly
- Manual lookup connects to local backend

## Commands
```bash
# Build debug APK
./gradlew assembleDebug

# Install on connected device
adb install app/build/outputs/apk/debug/app-debug.apk

# Run on emulator
./gradlew installDebug

# Run unit tests
./gradlew test

# Check for lint issues
./gradlew lint
```

## APK Location
```
apps/android/app/build/outputs/apk/debug/app-debug.apk
```
