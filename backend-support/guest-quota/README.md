# Android guest usage backend integration

The application must not enable guest processing against an old backend: it checks for the `X-HindPDF-Guest-Quota: v1` response header. The backend updates are prepared here because app work is kept in this repository.

To integrate into the HindPDF backend at commit `ca7fe2c` (review and adapt if the backend has changed):

1. Copy `guestIdentity.js` to `src/services/guestIdentity.js` and apply `backend.patch` from the backend root.
2. Configure a persistent, secret `GUEST_DEVICE_HMAC_KEY` of at least 32 characters in the backend environment. Never rotate it casually: changing it changes guest quota identities.
3. Enable Firebase Authentication's Anonymous provider for the app's Firebase project.
4. Deploy the backend after reviewing its existing public conversion routes and ensuring those routes also enforce quotas server-side. This patch applies the guest identity to endpoints that already use `requireAuth`; app-side reservations alone do not protect public endpoints from direct requests.
5. Verify real-device behavior: five daily jobs, a sixth rejection, clear app data, retry still rejected; check a signed-in account and paid entitlement, failed-job release, day rollover and the Android package signing identity.

The server stores a keyed digest rather than the raw Android ID. Android's app-scoped ID generally survives clearing app data, but it can change after factory reset or signing-key changes. Client-supplied identifiers can be spoofed; this is not a tamper-proof quota. Stronger enforcement requires verified Play Integrity and server-side abuse controls. Guest access is Android-only in this implementation. PDF viewing and the offline scanner remain available without consuming these jobs. Internet access is required for counted tools.
