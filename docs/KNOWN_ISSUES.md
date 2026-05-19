# ClearRing Known Issues

---

## Android

### Issue: CallScreeningService requires user to set ClearRing as default phone app
**Severity**: Expected behavior, not a bug  
**Status**: Documented, graceful fallback implemented

**Details**:
On Android 10+, `CallScreeningService` requires the user to explicitly set the app as the default call screening app (or default phone app). Without this:
- Incoming call identification does not work automatically
- Manual lookup remains fully functional
- App shows a permission education screen explaining how to enable

**Workaround**:
- Navigate to Settings → Apps → Default Apps → Phone App → Select ClearRing
- Or: ClearRing displays instructions in the app

---

### Issue: Call screening NOT available on Android < API 29
**Severity**: Known limitation  
**Status**: Handled with fallback

**Details**:
`CallScreeningService` was introduced in Android 10 (API 29). ClearRing targets `minSdkVersion 26` (Android 8.0). On devices below API 29, call screening is silently skipped — manual lookup is the primary flow.

---

### Issue: APK install on physical device requires "Unknown Sources" enabled
**Severity**: Expected behavior  
**Status**: Documented in README

**Details**:
Debug APKs are not signed with a Play Store certificate. To install:
1. Go to Settings → Security → Install from Unknown Sources
2. Enable for your file manager or browser

---

## Backend

### Issue: OTP SMS not actually sent in current version
**Severity**: Low (dev environment expected)  
**Status**: Known, by design

**Details**:
The OTP system uses a dev bypass (`123456` for any number) in `NODE_ENV=development`. Real SMS delivery via Twilio/AWS SNS/MSG91 is not implemented. The `sendOtp` endpoint logs the OTP to console in dev mode.

**To implement real OTP**:
1. Add `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE` to `.env`
2. Replace `OtpService.sendDev()` with `OtpService.sendSms()`

---

### Issue: Redis required for OTP and rate limiting
**Severity**: Medium  
**Status**: Documented

**Details**:
The API will start without Redis, but OTP verification and rate limiting will fail. Always run `pnpm docker:up` before starting the API.

**Check Redis**: `docker ps | grep clearring_redis`

---

## Website

### Issue: App screen mockups are CSS-only (no real screenshots)
**Severity**: Low (intentional)  
**Status**: By design

**Details**:
The website app screen previews are built with CSS/HTML to avoid image file dependencies. They represent the visual design, not pixel-perfect screenshots. For marketing use, replace with real device screenshots after Android app is built.

---

## Admin Dashboard

### Issue: File upload for business verification documents is placeholder
**Severity**: Low  
**Status**: Future implementation

**Details**:
The business claim form includes a document upload field, but actual file storage (S3, GCS, local disk) is not implemented. The URL field accepts a string. For production, integrate with a file storage service.

---

## General

### Issue: Email delivery not implemented
**Severity**: Low  
**Status**: Future

**Details**:
No email sending is implemented. The waitlist form saves emails to the database. Admin notifications require manual checking. For production, integrate with SendGrid/Resend/SES.

---

*Issues should be updated as they are resolved or new ones are discovered.*  
*Last updated: 2026-05-06*
