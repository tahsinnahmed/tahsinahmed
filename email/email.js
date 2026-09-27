var RECIPIENT = "contact@tahsinahmed.com";
var SENDER = "contact@tahsinahmed.com";

var MAX_NAME_LENGTH = 200;
var MAX_EMAIL_LENGTH = 254;
var MAX_SUBJECT_LENGTH = 300;
var MAX_MESSAGE_LENGTH = 10000;
var MAX_ATTACHMENT_SIZE = 3 * 1024 * 1024;

export default {
    async fetch(request, env) {

        var url = new URL(request.url);

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

        return env.ASSETS.fetch(request);
    }
};


async function handleContact(request, env) {

    try {

        if (!env.EMAIL) {
            return jsonResponse(
                {
                    success: false,
                    error:
                        "Cloudflare Email Service is not configured."
                },
                500
            );
        }

        var formData =
            await request.formData();

        var honeypot =
            String(
                formData.get("_honey") || ""
            ).trim();

        if (honeypot) {
            return jsonResponse(
                { success: true },
                200
            );
        }

        var name =
            String(
                formData.get("name") || ""
            ).trim();

        var senderEmail =
            String(
                formData.get("email") || ""
            ).trim();

        var subject =
            String(
                formData.get("subject") || ""
            ).trim();

        var message =
            String(
                formData.get("message") || ""
            ).trim();

        if (
            !name ||
            !senderEmail ||
            !subject ||
            !message
        ) {
            return jsonResponse(
                {
                    success: false,
                    error:
                        "Please complete all required fields."
                },
                400
            );
        }

        if (
            name.length > MAX_NAME_LENGTH ||
            senderEmail.length > MAX_EMAIL_LENGTH ||
            subject.length > MAX_SUBJECT_LENGTH ||
            message.length > MAX_MESSAGE_LENGTH
        ) {
            return jsonResponse(
                {
                    success: false,
                    error:
                        "One or more fields are too long."
                },
                400
            );
        }

        if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(senderEmail)
        ) {
            return jsonResponse(
                {
                    success: false,
                    error:
                        "Invalid email address."
                },
                400
            );
        }

        var cleanSubject =
            subject
                .replace(/[\r\n]+/g, " ")
                .trim();

        var html =
            "<!DOCTYPE html>" +
            "<html><head><meta charset=\"UTF-8\">" +
            "<title>New Contact Form Message</title></head>" +
            "<body style=\"margin:0;padding:30px;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;color:#222;\">" +
            "<div style=\"max-width:700px;margin:0 auto;background:#fff;padding:30px;border-radius:12px;\">" +
            "<h2 style=\"margin:0 0 20px;color:#00006d;\">New Contact Form Message</h2>" +
            "<p><strong>Name:</strong> " + escapeHtml(name) + "</p>" +
            "<p><strong>Email:</strong> " + escapeHtml(senderEmail) + "</p>" +
            "<p><strong>Subject:</strong> " + escapeHtml(cleanSubject) + "</p>" +
            "<hr style=\"border:0;border-top:1px solid #e5e5e5;margin:20px 0;\">" +
            "<p style=\"font-weight:bold;\">Message:</p>" +
            "<div style=\"padding:18px;background:#f8f8f8;border-radius:8px;line-height:1.7;\">" +
            escapeHtml(message).replace(/\r?\n/g, "<br>") +
            "</div>" +
            "</div></body></html>";

        var text =
            "New Contact Form Message\n\n" +
            "Name: " + name + "\n" +
            "Email: " + senderEmail + "\n" +
            "Subject: " + cleanSubject + "\n\n" +
            "Message:\n\n" +
            message;

        var file =
            formData.get("attachment");

        var attachments = [];

        if (
            file &&
            typeof file.arrayBuffer === "function" &&
            file.size > 0
        ) {

            if (file.size > MAX_ATTACHMENT_SIZE) {
                return jsonResponse(
                    {
                        success: false,
                        error:
                            "Attachment must be smaller than 3 MB."
                    },
                    400
                );
            }

            attachments.push(
                {
                    content:
                        arrayBufferToBase64(
                            await file.arrayBuffer()
                        ),
                    filename:
                        file.name || "attachment",
                    type:
                        file.type ||
                        "application/octet-stream",
                    disposition:
                        "attachment"
                }
            );
        }

        var result =
            await env.EMAIL.send(
                {
                    to: RECIPIENT,
                    from: SENDER,
                    replyTo: senderEmail,
                    subject:
                        "[Contact] " + cleanSubject,
                    html: html,
                    text: text,
                    attachments: attachments
                }
            );

        console.log(
            "Contact email sent:",
            result && result.messageId
                ? result.messageId
                : "success"
        );

        return jsonResponse(
            { success: true },
            200
        );

    } catch (error) {

        console.error(
            "Contact Email Service error:",
            error
        );

        return jsonResponse(
            {
                success: false,
                error:
                    error && error.message
                        ? error.message
                        : "Unable to send the message."
            },
            502
        );
    }
}


function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}


function arrayBufferToBase64(buffer) {

    var bytes =
        new Uint8Array(buffer);

    var binary = "";
    var chunkSize = 0x8000;
    var i;
    var end;
    var j;

    for (
        i = 0;
        i < bytes.length;
        i += chunkSize
    ) {

        end =
            Math.min(
                i + chunkSize,
                bytes.length
            );

        for (
            j = i;
            j < end;
            j++
        ) {
            binary +=
                String.fromCharCode(
                    bytes[j]
                );
        }
    }

    return btoa(binary);
}


function jsonResponse(body, status) {

    return new Response(
        JSON.stringify(body),
        {
            status: status || 200,
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
