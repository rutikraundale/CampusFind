# React + Vite

## Student registration and reports

Student registration accepts only addresses ending in the exact `@kbtcoe.org` domain. The account is created only after the one-time email code is verified. Use an inbox you can access and avoid refreshing or closing the page before completing verification.

Students must check the responsibility declaration before submitting a lost/found report. Contact information is read from the verified account and is not returned in public item listings or details.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Admin found-item photo uploads

Administrators can publish recovered items from `/admin/found-items/new`. Photos can be uploaded from the computer or sent from a phone using a temporary QR link. The phone upload page is `/mobile-upload`; its link is single-use and expires after the configured session lifetime.

Copy `.env.example` to `.env` and configure:

- `VITE_API_BASE_URL`: backend API root. For phone uploads on a local network, use the computer's LAN address rather than `localhost`.
- `VITE_PUBLIC_APP_URL`: frontend origin reachable from the phone. In local-network development, use the computer's LAN address and the Vite port. Production must use HTTPS.

For local phone testing, start Vite with `npm run dev -- --host 0.0.0.0` and open the admin page on the computer using its LAN address (for example, `http://192.168.1.20:5173`), not `localhost`. The QR code uses this reachable site address automatically. The API client also substitutes that LAN host when its development API URL is `localhost`; set `VITE_API_BASE_URL` to the LAN backend URL if the backend runs on a different host. Set backend `CORS_ORIGIN` to the frontend LAN origin and ensure the backend listens on the network interface. Restart Vite after changing environment variables. Keep the temporary QR code private and do not share it.

The backend stores only a SHA-256 hash of the temporary token, accepts JPEG/PNG/WebP images up to 5 MB, and polls session status over HTTP. See [backend upload API and lifecycle](../backend/README.md) for endpoints, expiry, and cleanup details.

## Admin physical handover

Admins use **Physical Handover** in the admin navigation to select an available item, verify the student's registered email, send and check an email OTP, then confirm the in-person identity check and handover. The item becomes claimed only after that final confirmation. Students should visit the administration office to recover a found item; there is no online claim submission.

The admin console provides a single **Report Item** form with a lost/found classification field and an **Item Registry** page for administrative records. Admin accounts are routed to the console and away from student-facing pages.
