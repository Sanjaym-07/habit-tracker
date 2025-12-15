# Server: Habit Tracker

This folder contains the backend for the Habit Tracker app and implements scheduled reminders for habits.

## Environment variables

- `MONGO_URI` — MongoDB connection string (required)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` — SMTP settings (optional; if omitted, an Ethereal test account is used for development)
- `EMAIL_FROM` — Optional from address for outgoing emails
- `NODE_ENV` — `production` or `development`

## Reminders

- The server runs a scheduler at startup to:
  - Run a reminder check every minute to send pending reminders.
  - Create daily reminders once per day for habits with reminders enabled.

### Manual testing

- You can trigger reminder tasks manually (development only):

  - Trigger processing pending reminders:

    ```bash
    npm run reminders:check
    ```

  - Create today's reminders:

    ```bash
    npm run reminders:create
    ```

- There are also development-only API endpoints (only when `NODE_ENV !== 'production'`):

  - `POST /api/reminders/__run-check` — run reminder processing
  - `POST /api/reminders/__create-daily` — create daily reminders

## Notes

- Emails are sent using `nodemailer`. If SMTP is not configured, the server will create a test Ethereal account and log a preview URL for each sent message.
