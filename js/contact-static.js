(function () {
    "use strict";

    var RECIPIENT = "contact@tahsinahmed.com";

    function trim(value) {
        return String(value || "").replace(/^\s+|\s+$/g, "");
    }

    function get(id) {
        return document.getElementById(id);
    }

    function validEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trim(value));
    }

    function init() {
        var form = get("contactForm");
        var submit = get("submit");
        var email = get("email");
        var file = get("file");
        var fileChosen = get("file-chosen");

        if (!form) {
            return;
        }

        if (email) {
            email.addEventListener("input", function () {
                email.setCustomValidity(
                    !email.value || validEmail(email.value)
                        ? ""
                        : "Please enter a valid email address."
                );
            });
        }

        if (file && fileChosen) {
            file.addEventListener("change", function () {
                fileChosen.textContent =
                    file.files && file.files.length
                        ? file.files[0].name
                        : "No file chosen";
            });
        }

        form.addEventListener("submit", function (event) {
            var name;
            var emailValue;
            var subject;
            var message;
            var attachmentName;
            var body;
            var mailto;

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

            name = trim(get("name") ? get("name").value : "");
            emailValue = trim(email ? email.value : "");
            subject = trim(get("subject") ? get("subject").value : "");
            message = trim(get("message") ? get("message").value : "");

            if (!name) {
                window.alert("Please enter your name.");
                return;
            }

            if (!validEmail(emailValue)) {
                if (email) {
                    email.setCustomValidity(
                        "Please enter a valid email address."
                    );
                    email.focus();
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
                file &&
                file.files &&
                file.files.length
            ) {
                attachmentName = file.files[0].name;
            }

            body =
                "New Contact Form Message\n\n" +
                "Name: " + name + "\n" +
                "Email: " + emailValue + "\n" +
                "Subject: " + subject + "\n\n" +
                "Message:\n" + message + "\n\n" +
                "Attachment selected: " + attachmentName + "\n\n" +
                "Website: https://www.tahsinahmed.com/";

            mailto =
                "mailto:" + RECIPIENT +
                "?subject=" +
                encodeURIComponent("[Contact] " + subject) +
                "&body=" +
                encodeURIComponent(body);

            if (submit) {
                submit.disabled = true;
                submit.innerHTML = "Opening...";
            }

            window.location.href = mailto;

            window.setTimeout(function () {
                if (submit) {
                    submit.disabled = false;
                    submit.innerHTML =
                        '<i class="fa fa-paper-plane"></i> Send';
                }
            }, 2000);
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
}());
