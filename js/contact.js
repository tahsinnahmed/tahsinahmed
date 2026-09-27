/*
 * Tahsin Ahmed - Contact Form
 *
 * Static browser-only implementation.
 * No backend.
 * No API.
 * No Cloudflare Worker endpoint.
 *
 * The form opens the visitor's email application using mailto:.
 */

(function () {
    "use strict";

    var RECIPIENT = "contact@tahsinahmed.com";

    var form = document.getElementById("contactForm");
    var submitButton = document.getElementById("submit");
    var emailInput = document.getElementById("email");
    var fileInput = document.getElementById("file");
    var fileChosen = document.getElementById("file-chosen");

    if (!form) {
        return;
    }

    function trim(value) {
        return String(value || "").replace(/^\s+|\s+$/g, "");
    }

    function getValue(id) {
        var element = document.getElementById(id);
        return element ? trim(element.value) : "";
    }

    function isValidEmail(value) {
        var email = trim(value);

        if (!email || email.length > 254) {
            return false;
        }

        if (email.indexOf("..") !== -1) {
            return false;
        }

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function resetFileLabel() {
        if (fileChosen) {
            fileChosen.textContent = "No file chosen";
        }
    }

    if (fileInput && fileChosen) {
        fileInput.addEventListener("change", function () {
            if (fileInput.files && fileInput.files.length > 0) {
                fileChosen.textContent = fileInput.files[0].name;
            } else {
                resetFileLabel();
            }
        });
    }

    if (emailInput) {
        emailInput.addEventListener("input", function () {
            if (!emailInput.value || isValidEmail(emailInput.value)) {
                emailInput.setCustomValidity("");
            } else {
                emailInput.setCustomValidity(
                    "Please enter a valid email address."
                );
            }
        });
    }

    form.addEventListener("submit", function (event) {
        var name;
        var email;
        var subject;
        var message;
        var attachmentName;
        var body;
        var mailtoUrl;
        var originalButtonHTML;

        event.preventDefault();

        if (
            typeof form.checkValidity === "function" &&
            !form.checkValidity()
        ) {
            if (typeof form.reportValidity === "function") {
                form.reportValidity();
            }
            return;
        }

        name = getValue("name");
        email = getValue("email");
        subject = getValue("subject");
        message = getValue("message");

        if (!name) {
            window.alert("Please enter your name.");
            return;
        }

        if (!isValidEmail(email)) {
            if (emailInput) {
                emailInput.setCustomValidity(
                    "Please enter a valid email address."
                );

                if (typeof emailInput.focus === "function") {
                    emailInput.focus();
                }
            }

            window.alert("Please enter a valid email address.");
            return;
        }

        if (!subject) {
            window.alert("Please enter a subject.");
            return;
        }

        if (!message) {
            window.alert("Please enter your message.");
            return;
        }

        attachmentName = "None";

        if (
            fileInput &&
            fileInput.files &&
            fileInput.files.length > 0
        ) {
            attachmentName = fileInput.files[0].name;
        }

        body =
            "New Contact Form Message\n\n" +
            "Name: " + name + "\n" +
            "Email: " + email + "\n" +
            "Subject: " + subject + "\n\n" +
            "Message:\n" +
            message + "\n\n" +
            "Attachment selected: " +
            attachmentName + "\n\n" +
            "Website: https://www.tahsinahmed.com/";

        mailtoUrl =
            "mailto:" +
            RECIPIENT +
            "?subject=" +
            encodeURIComponent("[Contact] " + subject) +
            "&body=" +
            encodeURIComponent(body);

        originalButtonHTML =
            submitButton ? submitButton.innerHTML : "";

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = "Opening...";
        }

        /*
         * No HTTP request is made here.
         * The browser hands the composed email to the user's
         * configured email application.
         */
        window.location.href = mailtoUrl;

        window.setTimeout(function () {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonHTML;
            }
        }, 2000);
    });
}());
