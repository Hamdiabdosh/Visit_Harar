import { db } from "../../../../db/index";
import { contactInfo } from "../../../../drizzle/schema/index";
import { getResendConfig } from "@/lib/env.server";
import { ORG_NAME } from "@/lib/org";
import type { BookingStatus, TourDuration } from "@/lib/types";

export type BookingEmailData = {
  booking_ref: string;
  visitor_name: string;
  visitor_email: string;
  visitor_phone: string | null;
  visitor_country: string;
  tour_date: string;
  tour_duration: TourDuration;
  group_size: number;
  special_requests: string | null;
  status: BookingStatus;
  status_note: string | null;
};

export type GuideEmailData = {
  name: string;
  phone: string | null;
  email: string | null;
};

type BureauContact = {
  email_general: string | null;
  email_bookings: string | null;
  phone_primary: string | null;
  office_name: string | null;
};

async function getBureauContact(): Promise<BureauContact> {
  const [row] = await db.select().from(contactInfo).limit(1);
  return {
    email_general: row?.emailGeneral ?? null,
    email_bookings: row?.emailBookings ?? null,
    phone_primary: row?.phonePrimary ?? null,
    office_name: row?.officeName ?? ORG_NAME,
  };
}

function emailLayout(
  title: string,
  bodyHtml: string,
  bureau: BureauContact,
): string {
  const footerPhone = bureau.phone_primary
    ? `<p>Phone: ${bureau.phone_primary}</p>`
    : "";
  const footerEmail = bureau.email_general
    ? `<p>Email: <a href="mailto:${bureau.email_general}">${bureau.email_general}</a></p>`
    : "";
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${title}</title></head>
<body style="font-family: Georgia, serif; color: #1a1a1a; line-height: 1.6; max-width: 560px; margin: 0 auto; padding: 24px;">
  <div style="border-bottom: 3px solid #F9B200; padding-bottom: 16px; margin-bottom: 24px;">
    <h1 style="margin: 0; font-size: 22px; color: #1A99B1;">Visit Harar</h1>
    <p style="margin: 4px 0 0; font-size: 13px; color: #666;">Official Tourism — ${bureau.office_name ?? "Harari Regional State"}</p>
  </div>
  ${bodyHtml}
  <hr style="border: none; border-top: 1px solid #ddd; margin: 32px 0 16px;" />
  <p style="font-size: 12px; color: #666;">${ORG_NAME}</p>
  ${footerPhone}
  ${footerEmail}
</body>
</html>`;
}

async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<boolean> {
  const resend = getResendConfig();
  if (!resend) {
    if (process.env.NODE_ENV === "development") {
      console.log(`[dev email] To: ${to} | Subject: ${subject}`);
    }
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resend.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: resend.from,
        to,
        subject,
        html,
      }),
    });
    if (!res.ok) {
      if (process.env.NODE_ENV === "development") {
        console.error("[Resend]", await res.text());
      }
      return false;
    }
    return true;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("[Resend]", err);
    }
    return false;
  }
}

function tourSummary(booking: BookingEmailData): string {
  return `
    <ul style="padding-left: 20px;">
      <li><strong>Reference:</strong> ${booking.booking_ref}</li>
      <li><strong>Tour date:</strong> ${booking.tour_date}</li>
      <li><strong>Duration:</strong> ${booking.tour_duration}</li>
      <li><strong>Group size:</strong> ${booking.group_size}</li>
    </ul>`;
}

export async function sendConfirmationEmail(
  booking: BookingEmailData,
  guide: GuideEmailData,
): Promise<void> {
  try {
    const bureau = await getBureauContact();
    const guideContact = [
      guide.phone ? `Phone: ${guide.phone}` : "",
      guide.email
        ? `Email: <a href="mailto:${guide.email}">${guide.email}</a>`
        : "",
    ]
      .filter(Boolean)
      .join("<br />");
    const html = emailLayout(
      "Tour Confirmed",
      `
      <p>Dear ${booking.visitor_name},</p>
      <p>Your Harar tour request has been <strong>confirmed</strong>.</p>
      <h2 style="font-size: 16px;">Your guide: ${guide.name}</h2>
      <p>${guideContact}</p>
      <h2 style="font-size: 16px;">Tour details</h2>
      ${tourSummary(booking)}
      <p>Please save your reference <strong>${booking.booking_ref}</strong> for your records.</p>
      `,
      bureau,
    );
    await sendEmail(
      booking.visitor_email,
      `Your Harar Tour is Confirmed — ${booking.booking_ref}`,
      html,
    );
  } catch (err) {
    console.error("[sendConfirmationEmail]", err);
  }
}

export async function sendDeclineEmail(
  booking: BookingEmailData,
  statusNote: string,
): Promise<void> {
  try {
    const bureau = await getBureauContact();
    const noteBlock = statusNote
      ? `<p><strong>Message from the commission:</strong> ${statusNote}</p>`
      : "";
    const html = emailLayout(
      "Tour Request Update",
      `
      <p>Dear ${booking.visitor_name},</p>
      <p>Thank you for your interest in visiting Harar. Unfortunately we are unable to confirm your tour request <strong>${booking.booking_ref}</strong> at this time.</p>
      ${noteBlock}
      <p>You are welcome to submit a new request with different dates via our website.</p>
      ${tourSummary(booking)}
      `,
      bureau,
    );
    await sendEmail(
      booking.visitor_email,
      `Update on Your Harar Tour Request — ${booking.booking_ref}`,
      html,
    );
  } catch (err) {
    console.error("[sendDeclineEmail]", err);
  }
}

export async function sendCancellationEmail(
  booking: BookingEmailData,
): Promise<void> {
  try {
    const bureau = await getBureauContact();
    const noteBlock = booking.status_note
      ? `<p><strong>Note:</strong> ${booking.status_note}</p>`
      : "";
    const html = emailLayout(
      "Booking Cancelled",
      `
      <p>Dear ${booking.visitor_name},</p>
      <p>Your Harar tour booking <strong>${booking.booking_ref}</strong> has been cancelled.</p>
      ${noteBlock}
      ${tourSummary(booking)}
      <p>If you would like to visit Harar in the future, we would be glad to receive a new request.</p>
      `,
      bureau,
    );
    await sendEmail(
      booking.visitor_email,
      `Your Harar Tour Booking Cancelled — ${booking.booking_ref}`,
      html,
    );
  } catch (err) {
    console.error("[sendCancellationEmail]", err);
  }
}

export async function sendNewBookingAlert(
  booking: BookingEmailData,
  guide: GuideEmailData,
): Promise<void> {
  try {
    const bureau = await getBureauContact();
    const to =
      bureau.email_bookings ??
      bureau.email_general ??
      process.env.SUPERADMIN_EMAIL;
    if (!to) {
      if (process.env.NODE_ENV === "development") {
        console.log(
          "[dev] New booking alert — no bureau email configured",
          booking.booking_ref,
        );
      }
      return;
    }
    const appUrl =
      process.env.APP_URL ??
      process.env.BETTER_AUTH_URL ??
      "http://localhost:8080";
    const adminLink = `${appUrl}/admin/bookings/${encodeURIComponent(booking.booking_ref)}`;
    const html = emailLayout(
      "New Booking Request",
      `
      <p>A new tour booking request has been submitted.</p>
      <p><strong>Reference:</strong> ${booking.booking_ref}</p>
      <p><strong>Guide:</strong> ${guide.name}</p>
      <p><strong>Visitor:</strong> ${booking.visitor_name} (${booking.visitor_country})</p>
      <p><strong>Email:</strong> ${booking.visitor_email}</p>
      ${booking.visitor_phone ? `<p><strong>Phone:</strong> ${booking.visitor_phone}</p>` : ""}
      ${tourSummary(booking)}
      ${booking.special_requests ? `<p><strong>Special requests:</strong> ${booking.special_requests}</p>` : ""}
      <p><a href="${adminLink}" style="display:inline-block;padding:10px 16px;background:#1A99B1;color:#fff;text-decoration:none;border-radius:4px;">View in dashboard</a></p>
      `,
      bureau,
    );
    await sendEmail(to, `New Booking Request — ${booking.booking_ref}`, html);
  } catch (err) {
    console.error("[sendNewBookingAlert]", err);
  }
}

export async function sendWelcomeEmail({
  name,
  email,
  tempPassword,
}: {
  name: string;
  email: string;
  tempPassword: string;
}): Promise<void> {
  try {
    const bureau = await getBureauContact();
    const appUrl =
      process.env.APP_URL ??
      process.env.BETTER_AUTH_URL ??
      "http://localhost:8080";
    const html = emailLayout(
      "Welcome to Visit Harar CMS",
      `
      <p>Dear ${name},</p>
      <p>Your editor account for the Visit Harar CMS has been created.</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Temporary password:</strong> ${tempPassword}</p>
      <p>Sign in at <a href="${appUrl}/admin/login">${appUrl}/admin/login</a> and change your password after first login.</p>
      `,
      bureau,
    );
    await sendEmail(email, "Your Visit Harar CMS account", html);
  } catch (err) {
    console.error("[sendWelcomeEmail]", err);
  }
}

export async function sendInquiryEmail({
  name,
  email,
  subject,
  message,
  to,
}: {
  name: string;
  email: string;
  subject: string;
  message: string;
  to: string;
}): Promise<void> {
  try {
    const bureau = await getBureauContact();
    const html = emailLayout(
      "New Contact Inquiry",
      `
      <p>A new inquiry was submitted via the Visit Harar contact form.</p>
      <p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p style="white-space: pre-wrap;">${message}</p>
      <p>Reply directly to <a href="mailto:${email}">${email}</a>.</p>
      `,
      bureau,
    );
    await sendEmail(to, `Contact Inquiry: ${subject}`, html);
  } catch (err) {
    console.error("[sendInquiryEmail]", err);
  }
}

export async function resendBookingNotification(
  booking: BookingEmailData,
  guide: GuideEmailData,
): Promise<void> {
  switch (booking.status) {
    case "Confirmed":
      await sendConfirmationEmail(booking, guide);
      break;
    case "Declined":
      await sendDeclineEmail(booking, booking.status_note ?? "");
      break;
    case "Cancelled":
      await sendCancellationEmail(booking);
      break;
    case "Pending":
      await sendNewBookingAlert(booking, guide);
      break;
  }
}
