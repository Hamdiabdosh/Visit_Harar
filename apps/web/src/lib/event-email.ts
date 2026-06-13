import { db } from "../../../../db/index";
import { contactInfo } from "../../../../drizzle/schema/index";
import { getResendConfig } from "@/lib/env.server";
import { ORG_NAME } from "@/lib/org";
import type { EventRegistrationStatus } from "@/lib/types";

export type EventSummaryEmailData = {
  title: string;
  event_date: string | null;
  event_location: string | null;
};

export type EventRegistrationEmailData = {
  registration_ref: string;
  visitor_name: string;
  visitor_email: string;
  visitor_phone: string | null;
  visitor_country: string;
  party_size: number;
  special_requests: string | null;
  status: EventRegistrationStatus;
  status_note: string | null;
  qr_token: string;
  event: EventSummaryEmailData;
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

function appBaseUrl(): string {
  return (
    process.env.APP_URL ??
    process.env.BETTER_AUTH_URL ??
    "http://localhost:8080"
  );
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

function eventSummary(
  registration: EventRegistrationEmailData,
): string {
  const { event } = registration;
  return `
    <ul style="padding-left: 20px;">
      <li><strong>Reference:</strong> ${registration.registration_ref}</li>
      <li><strong>Event:</strong> ${event.title}</li>
      ${event.event_date ? `<li><strong>Date:</strong> ${event.event_date}</li>` : ""}
      ${event.event_location ? `<li><strong>Location:</strong> ${event.event_location}</li>` : ""}
      <li><strong>Party size:</strong> ${registration.party_size}</li>
    </ul>`;
}

function ticketLink(qrToken: string): string {
  return `${appBaseUrl()}/events/ticket/${encodeURIComponent(qrToken)}`;
}

export async function sendEventConfirmationEmail(
  registration: EventRegistrationEmailData,
): Promise<void> {
  try {
    const bureau = await getBureauContact();
    const link = ticketLink(registration.qr_token);
    const html = emailLayout(
      "Event Registration Confirmed",
      `
      <p>Dear ${registration.visitor_name},</p>
      <p>Your registration for <strong>${registration.event.title}</strong> is confirmed.</p>
      ${eventSummary(registration)}
      <p>Show your ticket at the event entrance. <a href="${link}">View your ticket online</a>.</p>
      <p>Reference: <strong>${registration.registration_ref}</strong></p>
      `,
      bureau,
    );
    await sendEmail(
      registration.visitor_email,
      `Event Confirmed — ${registration.event.title}`,
      html,
    );
  } catch (err) {
    console.error("[sendEventConfirmationEmail]", err);
  }
}

export async function sendEventRegistrationPendingEmail(
  registration: EventRegistrationEmailData,
): Promise<void> {
  try {
    const bureau = await getBureauContact();
    const html = emailLayout(
      "Event Registration Received",
      `
      <p>Dear ${registration.visitor_name},</p>
      <p>We received your registration for <strong>${registration.event.title}</strong>. The commission will review it shortly.</p>
      ${eventSummary(registration)}
      <p>You will receive another email once your registration is confirmed.</p>
      `,
      bureau,
    );
    await sendEmail(
      registration.visitor_email,
      `Registration Received — ${registration.event.title}`,
      html,
    );
  } catch (err) {
    console.error("[sendEventRegistrationPendingEmail]", err);
  }
}

export async function sendEventDeclineEmail(
  registration: EventRegistrationEmailData,
  statusNote: string,
): Promise<void> {
  try {
    const bureau = await getBureauContact();
    const noteBlock = statusNote
      ? `<p><strong>Message from the commission:</strong> ${statusNote}</p>`
      : "";
    const html = emailLayout(
      "Event Registration Update",
      `
      <p>Dear ${registration.visitor_name},</p>
      <p>Unfortunately we cannot confirm your registration <strong>${registration.registration_ref}</strong> for ${registration.event.title}.</p>
      ${noteBlock}
      ${eventSummary(registration)}
      `,
      bureau,
    );
    await sendEmail(
      registration.visitor_email,
      `Registration Update — ${registration.event.title}`,
      html,
    );
  } catch (err) {
    console.error("[sendEventDeclineEmail]", err);
  }
}

export async function sendEventCancellationEmail(
  registration: EventRegistrationEmailData,
): Promise<void> {
  try {
    const bureau = await getBureauContact();
    const noteBlock = registration.status_note
      ? `<p><strong>Note:</strong> ${registration.status_note}</p>`
      : "";
    const html = emailLayout(
      "Event Registration Cancelled",
      `
      <p>Dear ${registration.visitor_name},</p>
      <p>Your registration <strong>${registration.registration_ref}</strong> for ${registration.event.title} has been cancelled.</p>
      ${noteBlock}
      ${eventSummary(registration)}
      `,
      bureau,
    );
    await sendEmail(
      registration.visitor_email,
      `Registration Cancelled — ${registration.event.title}`,
      html,
    );
  } catch (err) {
    console.error("[sendEventCancellationEmail]", err);
  }
}

export async function sendEventRegistrationAlert(
  registration: EventRegistrationEmailData,
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
          "[dev] New event registration — no bureau email configured",
          registration.registration_ref,
        );
      }
      return;
    }
    const adminLink = `${appBaseUrl()}/admin/event-registrations/${encodeURIComponent(registration.registration_ref)}`;
    const html = emailLayout(
      "New Event Registration",
      `
      <p>A new event registration has been submitted.</p>
      <p><strong>Reference:</strong> ${registration.registration_ref}</p>
      <p><strong>Event:</strong> ${registration.event.title}</p>
      <p><strong>Visitor:</strong> ${registration.visitor_name} (${registration.visitor_country})</p>
      <p><strong>Email:</strong> ${registration.visitor_email}</p>
      ${registration.visitor_phone ? `<p><strong>Phone:</strong> ${registration.visitor_phone}</p>` : ""}
      ${eventSummary(registration)}
      ${registration.special_requests ? `<p><strong>Notes:</strong> ${registration.special_requests}</p>` : ""}
      <p><a href="${adminLink}" style="display:inline-block;padding:10px 16px;background:#1A99B1;color:#fff;text-decoration:none;border-radius:4px;">View in dashboard</a></p>
      `,
      bureau,
    );
    await sendEmail(
      to,
      `New Event Registration — ${registration.registration_ref}`,
      html,
    );
  } catch (err) {
    console.error("[sendEventRegistrationAlert]", err);
  }
}

export async function resendEventRegistrationEmail(
  registration: EventRegistrationEmailData,
): Promise<void> {
  switch (registration.status) {
    case "Confirmed":
    case "CheckedIn":
      await sendEventConfirmationEmail(registration);
      break;
    case "Declined":
      await sendEventDeclineEmail(
        registration,
        registration.status_note ?? "",
      );
      break;
    case "Cancelled":
      await sendEventCancellationEmail(registration);
      break;
    case "Pending":
      await sendEventRegistrationPendingEmail(registration);
      break;
  }
}
