# LINE Family Conversation Loop setup

The website and Cloud Functions source are prepared. One-time setup is required before LINE delivery starts.

1. Create a LINE Official Account and enable Messaging API in LINE Developers.
2. In Firebase CLI for project `tsuruta-family-trip-2026`, set secrets:
   - `firebase functions:secrets:set LINE_CHANNEL_ACCESS_TOKEN`
   - `firebase functions:secrets:set LINE_CHANNEL_SECRET`
3. Deploy:
   - `firebase deploy --only functions,firestore:rules`
4. After deployment, set the Messaging API Webhook URL to the deployed `lineWebhook` HTTPS function URL and enable Webhooks.
5. Add the Official Account as a friend.
6. Each family member opens the trip website → Account → LINE notification → creates an 8-character code → sends that code to the Official Account.
7. Test by adding a family comment. Everyone except the author should receive a LINE notification if linked and notifications are enabled.

Security:
- LINE webhook requests are verified with HMAC-SHA256 using `x-line-signature`.
- Channel token/secret must be Firebase secrets, never committed to GitHub.
- Pairing codes expire after 10 minutes.
