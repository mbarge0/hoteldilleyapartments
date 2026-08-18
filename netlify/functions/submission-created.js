// Netlify Forms event: fires after a verified submission is saved.
// Named submission-created so the /buy form can keep data-netlify="true"
// and still land on /buy/thanks/. Always return 200 so a Resend miss
// cannot bounce the saved lead.

const fs = require("fs");
const path = require("path");

const FORM_NAME = "buyer-inquiry";
const SUBJECT = "Hotel Dilley Grand: financial package ($650,000 · Dilley, TX)";
const BUY_URL = "https://hoteldilley.com/buy";

const PDFS = [
  {
    file: "financing-one-pager.pdf",
    filename: "Hotel-Dilley-Grand-financing-one-pager.pdf",
  },
  {
    file: "pnl-summary.pdf",
    filename: "Hotel-Dilley-Grand-T12-PnL-summary.pdf",
  },
];

function ok(reason) {
  return {
    statusCode: 200,
    body: JSON.stringify({ status: "ok", reason: reason || "ok" }),
  };
}

function parseBody(event) {
  if (!event || event.body == null) return {};
  let body = event.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (err) {
      console.error("submission-created: body was not JSON");
      return {};
    }
  }
  return body && typeof body === "object" ? body : {};
}

function submissionFrom(body) {
  const payload = body.payload && typeof body.payload === "object" ? body.payload : body;
  const data = payload.data && typeof payload.data === "object" ? payload.data : payload;
  const formName = String(
    payload.form_name || data["form-name"] || data.form_name || ""
  ).trim();
  return { payload, data, formName };
}

function field(data, key) {
  const v = data[key];
  if (v == null) return "";
  return String(v).trim();
}

function isValidEmail(email) {
  if (!email || email.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function pdfCandidates(filename) {
  return [
    path.join(__dirname, "dilley-package", filename),
    path.join(__dirname, "..", "dilley-package", filename),
    path.join(process.cwd(), "netlify", "functions", "dilley-package", filename),
    path.join(process.cwd(), "dilley-package", filename),
  ];
}

function readPdf(filename) {
  const tried = pdfCandidates(filename);
  for (const p of tried) {
    try {
      if (fs.existsSync(p)) return fs.readFileSync(p);
    } catch (err) {
      // keep looking
    }
  }
  console.error("submission-created: missing PDF", filename, "looked in", tried);
  return null;
}

function loadAttachments() {
  const attachments = [];
  for (const spec of PDFS) {
    const buf = readPdf(spec.file);
    if (!buf || !buf.length) return null;
    attachments.push({
      filename: spec.filename,
      content: buf.toString("base64"),
      content_type: "application/pdf",
    });
  }
  return attachments;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildEmail(lead) {
  const nameLine = lead.name ? lead.name : "there";
  const extras = [
    lead.phone && "Phone: " + lead.phone,
    lead.buyerType && "Buying as: " + lead.buyerType,
    lead.financing && "Financing: " + lead.financing,
    lead.timeline && "Timeline: " + lead.timeline,
    lead.message && "Note: " + lead.message,
  ].filter(Boolean);

  const extraText = extras.length
    ? "\nWhat you submitted:\n" + extras.join("\n") + "\n"
    : "";

  const text = [
    "Thanks for requesting the financial package on Hotel Dilley Grand, " + nameLine + ".",
    "",
    "110 S Main St, Dilley, TX 78017. 20 units total: 19 rooms plus an owner's residence. Asking $650,000. Seller is 110 Dilley LLC.",
    "",
    "I am a Texas real estate license holder selling my own property (110 Dilley LLC).",
    "",
    "Attached (two PDFs):",
    "1. Financing and DSCR one-pager. Two lender-quoted paths (SBA 7(a) profile at about 20% down, and a conventional regional-bank hotel-desk path at 60-65% LTV). These are not pre-approvals or commitments. Seller financing is not offered.",
    "2. T12 P&L summary (August 2025 through July 2026) from the owner P&L.",
    "",
    "The full P&L workbook, renovation documentation, and certificate of occupancy are available after a walkthrough or on request. Reply if you want those sooner.",
    extraText,
    "Next step: a walkthrough, in person in Dilley or live video through the building. Reply with a couple of windows that work and whether you want to walk it yourself or on video.",
    "",
    "If you already have a lender, send this packet to them as-is. If you do not, the one-pager is the starting point for a conversation, still subject to their underwriting and a current appraisal.",
    "",
    "Matt Barge",
    "110 Dilley LLC",
    "Texas real estate license holder",
    BUY_URL,
    "",
    "This email is not a solicitation to the public and is sent only because you asked for the package. Figures are owner-provided; please verify independently. Financing descriptions are lender-quoted, subject to underwriting and appraisal, not guaranteed and not pre-approved.",
  ]
    .filter((line) => line !== undefined)
    .join("\n");

  const extraHtml = extras.length
    ? "<p style=\"margin:1.2em 0 0;color:#5f4e3d;font-size:14px\"><strong>What you submitted</strong><br>" +
      extras.map(escapeHtml).join("<br>") +
      "</p>"
    : "";

  const html = [
    '<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif;color:#291c11;line-height:1.55;max-width:640px">',
    "<p>Thanks for requesting the financial package on Hotel Dilley Grand, " + escapeHtml(nameLine) + ".</p>",
    "<p>110 S Main St, Dilley, TX 78017. 20 units total: 19 rooms plus an owner&rsquo;s residence. Asking <strong>$650,000</strong>. Seller is 110 Dilley LLC.</p>",
    "<p>I am a Texas real estate license holder selling my own property (110 Dilley LLC).</p>",
    "<p><strong>Attached (two PDFs):</strong></p>",
    "<ol>",
    "<li><strong>Financing and DSCR one-pager.</strong> Two lender-quoted paths (SBA 7(a) profile at about 20% down, and a conventional regional-bank hotel-desk path at 60&ndash;65% LTV). These are not pre-approvals or commitments. Seller financing is not offered.</li>",
    "<li><strong>T12 P&amp;L summary</strong> (August 2025 through July 2026) from the owner P&amp;L.</li>",
    "</ol>",
    "<p>The full P&amp;L workbook, renovation documentation, and certificate of occupancy are available after a walkthrough or on request. Reply if you want those sooner.</p>",
    extraHtml,
    "<p><strong>Next step:</strong> a walkthrough, in person in Dilley or live video through the building. Reply with a couple of windows that work and whether you want to walk it yourself or on video.</p>",
    "<p>If you already have a lender, send this packet to them as-is. If you do not, the one-pager is the starting point for a conversation, still subject to their underwriting and a current appraisal.</p>",
    "<p>Matt Barge<br>110 Dilley LLC<br>Texas real estate license holder<br>",
    '<a href="' + BUY_URL + '">' + BUY_URL + "</a></p>",
    '<p style="font-size:12px;color:#8a7660">This email is not a solicitation to the public and is sent only because you asked for the package. Figures are owner-provided; please verify independently. Financing descriptions are lender-quoted, subject to underwriting and appraisal, not guaranteed and not pre-approved.</p>',
    "</div>",
  ].join("");

  return { text, html };
}

async function sendResend(apiKey, payload) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  return { ok: res.ok, status: res.status, text };
}

exports.handler = async (event) => {
  try {
    const body = parseBody(event);
    const { data, formName } = submissionFrom(body);

    if (formName !== FORM_NAME) {
      console.log("submission-created: skip form", formName || "(none)");
      return ok("skipped-form");
    }

    if (field(data, "bot-field")) {
      console.log("submission-created: skip honeypot");
      return ok("honeypot");
    }

    const lead = {
      name: field(data, "name"),
      email: field(data, "email"),
      phone: field(data, "phone"),
      buyerType: field(data, "buyer-type"),
      financing: field(data, "financing-status"),
      timeline: field(data, "timeline"),
      message: field(data, "message"),
    };

    if (!isValidEmail(lead.email)) {
      console.log("submission-created: invalid buyer email, not sending package");
      return ok("invalid-email");
    }

    const apiKey = (process.env.RESEND_API_KEY || "").trim();
    const from = (process.env.PACKAGE_FROM_EMAIL || "").trim();
    const notify = (process.env.PACKAGE_NOTIFY_EMAIL || "").trim();

    if (!apiKey) {
      console.error("submission-created: RESEND_API_KEY missing; lead saved, package not sent");
      return ok("missing-resend-key");
    }
    if (!from) {
      console.error("submission-created: PACKAGE_FROM_EMAIL missing; lead saved, package not sent");
      return ok("missing-from");
    }

    const attachments = loadAttachments();
    if (!attachments) {
      console.error("submission-created: PDFs not bundled; lead saved, package not sent");
      return ok("missing-pdfs");
    }

    const { text, html } = buildEmail(lead);
    const emailPayload = {
      from: from,
      to: [lead.email],
      subject: SUBJECT,
      html: html,
      text: text,
      attachments: attachments,
    };

    if (notify && isValidEmail(notify) && notify.toLowerCase() !== lead.email.toLowerCase()) {
      emailPayload.bcc = [notify];
      emailPayload.reply_to = notify;
    }

    let result = await sendResend(apiKey, emailPayload);
    if (!result.ok && emailPayload.bcc) {
      console.error("submission-created: send with BCC failed", result.status, result.text);
      delete emailPayload.bcc;
      result = await sendResend(apiKey, emailPayload);
    }

    if (!result.ok) {
      console.error("submission-created: Resend error", result.status, result.text);
      return ok("resend-error");
    }

    console.log("submission-created: package sent");
    return ok("sent");
  } catch (err) {
    console.error("submission-created: unexpected error", err && err.message);
    return ok("error");
  }
};
