# Found-item photo upload API

## Student registration and posting requirements

New student registrations must use an email whose normalized domain is exactly `kbtcoe.org`. Registration creates a short-lived pending record, not a login account. The OTP expires after 10 minutes, is HMAC-hashed at rest, is single-use, and allows five verification attempts. Codes can be resent no more than once per minute and five times per hour; registration and OTP endpoints also have per-IP rate limits. A successful OTP verification atomically creates the account and returns a login session. Pending passwords are bcrypt-hashed; plaintext passwords and OTPs are not stored.

Set `REGISTRATION_OTP_SECRET` to a dedicated random secret in production. If unset, registration OTPs use `ACCESS_TOKEN_SECRET`. Email delivery uses the existing `EMAIL_USER` and `EMAIL_PASS` settings.

Before deploying, back up the database and run `npm run migrate:registration-otps` from `backend/` once. It removes only six-digit plaintext OTPs from unverified legacy accounts; accounts and email-link verification tokens are preserved. Those students can request a new hashed OTP through the normal resend flow.

Registration uses `POST /api/v1/users/register`, `POST /api/v1/users/verify-otp`, and `POST /api/v1/users/resend-otp`. The built-in IP limiter uses an in-memory store per backend process; configure a shared rate-limit store and the correct Express proxy trust settings when deploying multiple instances or behind a reverse proxy.

Existing student accounts remain available for sign-in and retain their current verification state; they are not automatically marked verified. Existing unverified campus-domain accounts can continue through the OTP resend/verification flow. Student item creation now requires an authenticated, verified `@kbtcoe.org` account and explicit acceptance of declaration version `v1`. This account migration does not change admin authentication or admin item publishing. Existing accounts with other email domains can still sign in, but cannot post student reports. Email changes from the profile endpoint are rejected until an email-change verification workflow is available.

Student item records include the declaration version, server acceptance timestamp, and accepting account ID. Student contact email and phone are sourced from the authenticated account, not from submitted form data, and are excluded from public item, detail, and search responses. Administrators retain access through the protected registry.

Administrators can create a found-item record with a photo uploaded from a PC or a phone. Phone uploads use a short-lived, single-use capability URL and ordinary HTTP polling; this feature does not use sockets.

## Configuration

Copy `.env.example` as a reference when setting up the backend. Retain the project's existing database, token, email, and Cloudinary configuration and use real credentials only in a private `.env` file.

- `FOUND_ITEM_UPLOAD_TTL_MINUTES`: optional integer from 5 to 10; defaults to 8.
- `CORS_ORIGIN`: frontend origin. For phone testing on a local network, set it to the frontend's LAN origin.
- Cloudinary credentials are required for both PC and phone image uploads.

The frontend also needs `VITE_PUBLIC_APP_URL` and `VITE_API_BASE_URL`; see [frontend setup](../frontend/README.md#admin-found-item-photo-uploads). For cross-device local testing, both URLs must use the computer's LAN address, not `localhost`, and Vite must listen on the network interface.

## Endpoints

Admin endpoints require the existing access-token authentication and the `admin` role:

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/v1/found-item-uploads/sessions` | Create a temporary upload session; returns the raw token once |
| `GET` | `/api/v1/found-item-uploads/sessions/:id` | Poll status and receive the preview URL after upload |
| `DELETE` | `/api/v1/found-item-uploads/sessions/:id` | Cancel a session and clean up an unattached image |
| `POST` | `/api/v1/found-item-uploads/sessions/:id/image` | Upload the PC-selected `image` multipart file |
| `POST` | `/api/v1/found-item-uploads/sessions/:id/publish` | Publish item fields with `uploadSessionId` |

The phone page uses its temporary token only:

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/v1/found-item-uploads/:token` | Validate token and return minimal session status |
| `POST` | `/api/v1/found-item-uploads/:token/image` | Upload the single `image` multipart file |

The publish body contains `uploadSessionId`, `reportType` (`lost` or `found`, defaults to `found`), `title`, `description`, `category`, `foundAt`, `foundDate` (`YYYY-MM-DD`), `contactEmail`, and `contactPhone`.

## Session lifecycle and safeguards

Sessions move through `pending`, `uploading`, `uploaded`, `publishing`, and `consumed`, or end as `expired`/`cancelled`. A cryptographically random 256-bit token is returned only at creation; MongoDB stores its SHA-256 hash. Every token request checks expiry and session state. Upload transitions are atomic, the photo's contents are checked before Cloudinary upload, and the image is limited to 5 MB and JPEG/PNG/WebP. Responses are marked `Cache-Control: no-store`.

Published items reference their unique upload session, making retries idempotent. The item schema records `foundDate`, and `postedByModel` distinguishes student-owned from admin-owned records for population and authorization. Cloudinary assets from expired or cancelled sessions are retried by a cleanup job every five minutes; unattached terminal sessions are pruned after 24 hours. The cleanup does not delete images belonging to consumed sessions.

Rate limits cover session creation, status polling, token validation, and uploads. The default `express-rate-limit` memory store is per backend process; deployments with multiple instances should configure a shared store. MongoDB and Cloudinary do not share a transaction: failed or cancelled staging uploads are cleaned up asynchronously, and the unique session reference prevents duplicate published items.

## Admin physical handover

Claims are completed at the administration office. Admins select an available item, look up a registered student, send a short-lived email OTP to the student's verified CampusFind address, verify the code, then explicitly confirm the in-person identity check and handover. OTP verification by itself never marks an item claimed. The student directory displays item status and directs claimants to the office; online claim submission is retired.

Admins use one report form for both lost and found items. The report type is stored on the item record; found items alone can enter the physical handover process. Existing records without a report type are treated as found for compatibility.

## Student feedback and issue reports

Authenticated students can submit an issue such as a handover concern or a request to remove an item from the directory, then track its status on the `/issues` page. Each submission receives a unique, ten-character alphanumeric reference ID. The admin `/admin/issues` page lists submissions and allows admins to set the status to `Pending`, `Solved`, or `Reject`; admin notes are visible to the submitting student.

| Method | Path | Access | Purpose |
|---|---|---|---|
| `POST` | `/api/v1/issues` | Student | Submit an issue with category, subject, description, and optional related item ID |
| `GET` | `/api/v1/issues/mine` | Student | List only the current student's issues |
| `GET` | `/api/v1/issues/admin` | Admin | List all student issues |
| `PATCH` | `/api/v1/issues/:id/status` | Admin | Update status and optional student-visible admin note |

All handover endpoints are mounted under `/api/v1/claims/handover` and require an authenticated admin. The item is changed from `available` to `claimed` with a conditional database update so concurrent handovers cannot claim the same item. OTP values are HMAC-hashed at rest, expire after five minutes, are limited to five attempts, and are never returned by the API. The active handover session can be resumed by the initiating admin; the session response does not include OTP data.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/v1/claims/handover/items` | List available and already-claimed items |
| `GET` | `/api/v1/claims/handover/history` | List completed handovers |
| `GET` | `/api/v1/claims/handover/:handoverId` | Resume the initiating admin's session |
| `DELETE` | `/api/v1/claims/handover/:handoverId` | Cancel an active session |
| `POST` | `/api/v1/claims/handover/check-student` | Check registered account and verified-email status |
| `POST` | `/api/v1/claims/handover/send-otp` | Send or resend the OTP to the registered email |
| `POST` | `/api/v1/claims/handover/verify-otp` | Verify the six-digit OTP |
| `POST` | `/api/v1/claims/handover/confirm` | Confirm in-person identity check and physical handover |

Set `CLAIM_OTP_SECRET` to a dedicated random secret for OTP hashing. When unset, the application uses `ACCESS_TOKEN_SECRET`; configure a strong token secret before deploying.

Administrative item records are available from `GET /api/v1/items/admin/records`, which requires an authenticated admin. The public `GET /api/v1/items` endpoint remains available for the student directory.
