// email/email.js
//
// Cloudflare Worker entry point.
//
// Existing architecture:
//
//   POST /api/contact
//        ↓
//   Resend API
//        ↓
//   contact@tahsinahmed.com
//
// Everything else:
//        ↓
//   Cloudflare ASSETS binding
//        ↓
//   Static website
//
// Required Worker Secret:
//   RESEND_API_KEY
//
// Optional Worker Variable:
//   CONTACT_TO_EMAIL
//
// Your existing frontend already sends:
//   POST /api/contact
//

const RESEND_API_URL = "https://api.resend.com/emails";

const FROM_EMAIL =
    "Tahsin Ahmed <contact@tahsinahmed.com>";

const DEFAULT_TO_EMAIL =
    "contact@tahsinahmed.com";

const MAX_NAME_LENGTH = 200;
const MAX_EMAIL_LENGTH = 254;
const MAX_SUBJECT_LENGTH = 300;
const MAX_MESSAGE_LENGTH = 10000;

// Keep attachment size conservative.
const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024; // 5 MB


export default {

    async fetch(request, env) {

        const url = new URL(request.url);

        // =========================================================
        // EXISTING CONTACT API
        // =========================================================

        if (url.pathname === "/api/contact") {

            if (request.method !== "POST") {

                return jsonResponse(
                    {
                        success: false,
                        error: "Method not allowed"
                    },
                    405
                );

            }

            return handleContact(request, env);

        }


        // =========================================================
        // EXISTING STATIC WEBSITE
        // =========================================================

        return env.ASSETS.fetch(request);

    }

};


// ===============================================================
// CONTACT FORM HANDLER
// ===============================================================

async function handleContact(request, env) {

    try {

        // ---------------------------------------------------------
        // 1. Make sure Resend API key exists
        // ---------------------------------------------------------

        if (!env.RESEND_API_KEY) {

            console.error(
                "RESEND_API_KEY is not configured."
            );

            return jsonResponse(
                {
                    success: false,
                    error: "RESEND_API_KEY not configured"
                },
                500
            );

        }


        // ---------------------------------------------------------
        // 2. Parse multipart form
        // ---------------------------------------------------------

        const formData =
            await request.formData();


        // ---------------------------------------------------------
        // 3. Honeypot
        // ---------------------------------------------------------

        const honey =
            String(
                formData.get("_honey") || ""
            ).trim();


        // Silently accept honeypot spam so bots don't
        // receive useful information.

        if (honey !== "") {

            return jsonResponse(
                {
                    success: true
                },
                200
            );

        }


        // ---------------------------------------------------------
        // 4. Extract fields
        // ---------------------------------------------------------

        const name =
            String(
                formData.get("name") || ""
            ).trim();


        const email =
            String(
                formData.get("email") || ""
            ).trim();


        const subject =
            String(
                formData.get("subject") || ""
            ).trim();


        const message =
            String(
                formData.get("message") || ""
            ).trim();


        // ---------------------------------------------------------
        // 5. Required fields
        // ---------------------------------------------------------

        if (
            !name ||
            !email ||
            !subject ||
            !message
        ) {

            return jsonResponse(
                {
                    success: false,
                    error: "Missing required fields"
                },
                400
            );

        }


        // ---------------------------------------------------------
        // 6. Length validation
        // ---------------------------------------------------------

        if (
            name.length > MAX_NAME_LENGTH ||
            email.length > MAX_EMAIL_LENGTH ||
            subject.length > MAX_SUBJECT_LENGTH ||
            message.length > MAX_MESSAGE_LENGTH
        ) {

            return jsonResponse(
                {
                    success: false,
                    error: "One or more fields are too long"
                },
                400
            );

        }


        // ---------------------------------------------------------
        // 7. Email validation
        // ---------------------------------------------------------

        const EMAIL_REGEX =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (
            !EMAIL_REGEX.test(email)
        ) {

            return jsonResponse(
                {
                    success: false,
                    error: "Invalid email address"
                },
                400
            );

        }


        // ---------------------------------------------------------
        // 8. Prevent subject header injection
        // ---------------------------------------------------------

        const cleanSubject =
            subject
                .replace(/[\r\n]+/g, " ")
                .trim();


        // ---------------------------------------------------------
        // 9. Optional attachment
        // ---------------------------------------------------------

        const attachment =
            formData.get("attachment");


        let attachments = [];


        if (
            attachment instanceof File &&
            attachment.size > 0
        ) {

            // Size restriction
            if (
                attachment.size >
                MAX_ATTACHMENT_SIZE
            ) {

                return jsonResponse(
                    {
                        success: false,
                        error:
                            "Attachment must be smaller than 5 MB."
                    },
                    400
                );

            }


            const arrayBuffer =
                await attachment.arrayBuffer();


            const bytes =
                new Uint8Array(arrayBuffer);


            const base64 =
                uint8ArrayToBase64(bytes);


            attachments.push({

                filename:
                    attachment.name ||
                    "attachment",

                content:
                    base64

            });

        }


        // ---------------------------------------------------------
        // 10. HTML escaping
        // ---------------------------------------------------------

        const safeName =
            escapeHtml(name);


        const safeEmail =
            escapeHtml(email);


        const safeSubject =
            escapeHtml(cleanSubject);


        const safeMessage =
            escapeHtml(message)
                .replace(
                    /\r?\n/g,
                    "<br>"
                );


        // ---------------------------------------------------------
        // 11. Email HTML
        // ---------------------------------------------------------

        const html = `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>New Contact Form Message</title>
</head>

<body style="
    margin:0;
    padding:30px;
    background:#f5f5f5;
    font-family:Arial,Helvetica,sans-serif;
    color:#222;
">

    <div style="
        max-width:700px;
        margin:0 auto;
        background:#ffffff;
        padding:30px;
        border-radius:12px;
        box-sizing:border-box;
    ">

        <h2 style="
            margin:0 0 20px;
            color:#00006d;
        ">
            New Contact Form Message
        </h2>

        <p style="margin:8px 0;">
            <strong>Name:</strong>
            ${safeName}
        </p>

        <p style="margin:8px 0;">
            <strong>Email:</strong>
            ${safeEmail}
        </p>

        <p style="margin:8px 0;">
            <strong>Subject:</strong>
            ${safeSubject}
        </p>

        <hr style="
            border:0;
            border-top:1px solid #e5e5e5;
            margin:20px 0;
        ">

        <p style="
            margin:0 0 8px;
            font-weight:bold;
        ">
            Message:
        </p>

        <div style="
            padding:18px;
            background:#f8f8f8;
            border-radius:8px;
            line-height:1.7;
        ">
            ${safeMessage}
        </div>

    </div>

</body>
</html>
`;


        // ---------------------------------------------------------
        // 12. Plain-text email
        // ---------------------------------------------------------

        const text = `

New Contact Form Message

Name: ${name}
Email: ${email}
Subject: ${cleanSubject}

Message:

${message}

`;


        // ---------------------------------------------------------
        // 13. Recipient
        // ---------------------------------------------------------

        const toEmail =
            env.CONTACT_TO_EMAIL ||
            DEFAULT_TO_EMAIL;


        // ---------------------------------------------------------
        // 14. Build Resend payload
        // ---------------------------------------------------------

        const emailPayload = {

            from:
                FROM_EMAIL,

            to: [
                toEmail
            ],

            reply_to:
                email,

            subject:
                `[Contact] ${cleanSubject}`,

            html:
                html,

            text:
                text

        };


        // Add attachment only when one exists
        if (
            attachments.length > 0
        ) {

            emailPayload.attachments =
                attachments;

        }


        // ---------------------------------------------------------
        // 15. Send through Resend
        // ---------------------------------------------------------

        const resendResponse =
            await fetch(
                RESEND_API_URL,
                {
                    method: "POST",

                    headers: {
                        "Authorization":
                            `Bearer ${env.RESEND_API_KEY}`,

                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            emailPayload
                        )
                }
            );


        // ---------------------------------------------------------
        // 16. Read response
        // ---------------------------------------------------------

        const resendBody =
            await resendResponse.text();


        // ---------------------------------------------------------
        // 17. Resend error
        // ---------------------------------------------------------

        if (
            !resendResponse.ok
        ) {

            console.error(
                "Resend API error:",
                resendResponse.status,
                resendBody
            );


            return jsonResponse(
                {
                    success: false,
                    error: "Failed to send email"
                },
                502
            );

        }


        // ---------------------------------------------------------
        // 18. Success
        // ---------------------------------------------------------

        let resendData = null;


        try {

            resendData =
                JSON.parse(
                    resendBody
                );

        } catch {

            // Resend normally returns JSON.
            // Ignore parsing failure if HTTP status was successful.

        }


        console.log(
            "Contact email sent:",
            resendData?.id || "success"
        );


        return jsonResponse(
            {
                success: true
            },
            200
        );


    } catch (error) {

        console.error(
            "Contact Worker error:",
            error
        );


        return jsonResponse(
            {
                success: false,
                error: "Internal Server Error"
            },
            500
        );

    }

}


// ===============================================================
// HTML ESCAPE
// ===============================================================

function escapeHtml(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#39;"
        );

}


// ===============================================================
// UINT8ARRAY → BASE64
// ===============================================================

function uint8ArrayToBase64(bytes) {

    let binary = "";

    const chunkSize = 0x8000;


    for (
        let i = 0;
        i < bytes.length;
        i += chunkSize
    ) {

        const chunk =
            bytes.subarray(
                i,
                Math.min(
                    i + chunkSize,
                    bytes.length
                )
            );


        for (
            let j = 0;
            j < chunk.length;
            j++
        ) {

            binary +=
                String.fromCharCode(
                    chunk[j]
                );

        }

    }


    return btoa(binary);

}


// ===============================================================
// JSON RESPONSE
// ===============================================================

function jsonResponse(
    body,
    status = 200
) {

    return new Response(
        JSON.stringify(body),
        {
            status,

            headers: {
                "Content-Type":
                    "application/json; charset=UTF-8",

                "Cache-Control":
                    "no-store",

                "X-Content-Type-Options":
                    "nosniff"
            }
        }
    );

}