import nodemailer from "nodemailer";

let transportPromise = null;

async function createTransport() {
  if (transportPromise) return transportPromise;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM } =
    process.env;

  if (SMTP_HOST && SMTP_USER) {
    const secure = SMTP_PORT && Number(SMTP_PORT) === 465;
    transportPromise = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT ? Number(SMTP_PORT) : 587,
      secure,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
    return transportPromise;
  }

  // No SMTP configured — create an Ethereal account for dev/testing
  const testAccount = await nodemailer.createTestAccount();
  transportPromise = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
  return transportPromise;
}

export async function sendReminderEmail(to, username, habitTitle) {
  const transport = await createTransport();

  const from = process.env.EMAIL_FROM || 'Habit Tracker <no-reply@example.com>';
  const subject = `Reminder: ${habitTitle}`;
  const text = `Hi ${username},\n\nThis is a reminder to complete your habit: ${habitTitle}.\n\nGood luck!\n`;
  const html = `<p>Hi ${username},</p><p>This is a reminder to complete your habit: <strong>${habitTitle}</strong>.</p><p>Good luck!</p>`;

  const info = await transport.sendMail({ from, to, subject, text, html });

  // If using Ethereal, log a preview URL for quick testing
  const preview = nodemailer.getTestMessageUrl(info);
  if (preview) console.log(`Preview email: ${preview}`);

  return info;
}

export async function sendPushNotification(/* userId, payload */) {
  // Placeholder: implement push notifications integration if needed.
  return Promise.resolve();
}

export default { sendReminderEmail, sendPushNotification };
