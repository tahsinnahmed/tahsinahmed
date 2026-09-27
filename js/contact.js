/*
=========================================================
Contact Form - Pure Browser JavaScript
---------------------------------------------------------
No backend
No API
No Cloudflare Worker endpoint
No Resend

Uses mailto: to open the visitor's default email client.
=========================================================
*/

(function () {
    "use strict";

    var RECIPIENT = "contact@tahsinahmed.com";

    var MAX_NAME_LENGTH = 200;
    var MAX_EMAIL_LENGTH = 254;
    var MAX_SUBJECT_LENGTH = 300;
    var MAX_MESSAGE_LENGTH = 10000;

    var form = document.getElementById("contactForm");
    var submitBtn = document.getElementById("submit");
    var emailEl = document.getElementById("email");
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

        if (email.length < 3 || email.length > MAX_EMAIL_LENGTH) {
            return false;
        }

        if (email.indexOf("..") !== -1) {
            return false;
        }

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function getFormGroup(input) {
        var node;

        if (!input) {
            return null;
        }

        node = input.parentNode;

        while (node) {
            if (
                node.className &&
                (" " + node.className + " ").indexOf(" form-group ") !== -1
            ) {
                return node;
            }

            node = node.parentNode;
        }

        return input.parentNode;
    }

    function clearFieldError(input) {
        var group;
        var error;

        if (!input) {
            return;
        }

        group = getFormGroup(input);

        input.setCustomValidity("");

        if (!group) {
            return;
        }

        group.className =
            group.className.replace(/\s*has-error\b/g, "");

        error = group.querySelector
            ? group.querySelector(".field-error")
            : null;

        if (error && error.parentNode) {
            error.parentNode.removeChild(error);
        }
    }

    function setFieldError(input, message) {
        var group;
        var error;

        if (!input) {
            return;
        }

        clearFieldError(input);

        if (!message) {
            return;
        }

        group = getFormGroup(input);

        input.setCustomValidity(message);

        if (!group) {
            return;
        }

        if (
            (" " + group.className + " ").indexOf(" has-error ") === -1
        ) {
            group.className += " has-error";
        }

        error = document.createElement("small");
        error.className = "field-error";
        error.textContent = message;

        group.appendChild(error);
    }

    function showMessage(title, text, icon) {
        if (
            typeof window.Swal !== "undefined" &&
            window.Swal &&
            typeof window.Swal.fire === "function"
        ) {
            window.Swal.fire({
                title: title,
                text: text,
                icon: icon || "info",
                confirmButtonColor: "#00006d"
            });
        } else {
            window.alert(title + "\n\n" + text);
        }
    }

    function showFallback(mailtoUrl) {
        var oldFallback =
            document.getElementById("contact-mail-fallback");

        var wrapper;
        var link;

        if (oldFallback && oldFallback.parentNode) {
            oldFallback.parentNode.removeChild(oldFallback);
        }

        wrapper = document.createElement("p");

        wrapper.id = "contact-mail-fallback";
        wrapper.style.marginTop = "15px";
        wrapper.style.fontWeight = "600";

        link = document.createElement("a");

        link.href = mailtoUrl;
        link.textContent = "click here to open your email app";

        wrapper.appendChild(
            document.createTextNode(
                "If your email application did not open, "
            )
        );

        wrapper.appendChild(link);

        wrapper.appendChild(
            document.createTextNode(".")
        );

        if (form.parentNode) {
            form.parentNode.insertBefore(
                wrapper,
                form.nextSibling
            );
        }
    }

    /*
    =====================================================
    EMAIL VALIDATION
    =====================================================
    */

    if (emailEl) {

        emailEl.addEventListener(
            "input",
            function () {

                var value =
                    trim(emailEl.value);

                if (
                    !value ||
                    isValidEmail(value)
                ) {

                    clearFieldError(emailEl);

                } else {

                    setFieldError(
                        emailEl,
                        "Please enter a valid email address."
                    );
                }
            }
        );


        emailEl.addEventListener(
            "blur",
            function () {

                var value =
                    trim(emailEl.value);

                if (
                    value &&
                    !isValidEmail(value)
                ) {

                    setFieldError(
                        emailEl,
                        "Please enter a valid email address."
                    );

                } else {

                    clearFieldError(emailEl);
                }
            }
        );
    }


    /*
    =====================================================
    FILE NAME PREVIEW
    =====================================================
    */

    if (
        fileInput &&
        fileChosen
    ) {

        fileInput.addEventListener(
            "change",
            function () {

                var file =
                    fileInput.files &&
                    fileInput.files.length
                        ? fileInput.files[0]
                        : null;

                fileChosen.textContent =
                    file
                        ? file.name
                        : "No file chosen";
            }
        );
    }


    /*
    =====================================================
    FORM SUBMISSION
    =====================================================
    */

    form.addEventListener(
        "submit",
        function (event) {

            var name;
            var email;
            var subject;
            var message;
            var file;
            var body;
            var mailtoUrl;
            var originalBtnHTML;

            event.preventDefault();


            /*
            -------------------------------------------------
            Browser validation
            -------------------------------------------------
            */

            if (
                typeof form.checkValidity === "function" &&
                !form.checkValidity()
            ) {

                if (
                    typeof form.reportValidity === "function"
                ) {
                    form.reportValidity();
                }

                return;
            }


            /*
            -------------------------------------------------
            Read fields
            -------------------------------------------------
            */

            name =
                getValue("name");

            email =
                getValue("email");

            subject =
                getValue("subject");

            message =
                getValue("message");


            /*
            -------------------------------------------------
            Validate name
            -------------------------------------------------
            */

            if (
                !name ||
                name.length > MAX_NAME_LENGTH
            ) {

                showMessage(
                    "Invalid name",
                    "Please enter your name.",
                    "warning"
                );

                return;
            }


            /*
            -------------------------------------------------
            Validate email
            -------------------------------------------------
            */

            if (
                !isValidEmail(email)
            ) {

                setFieldError(
                    emailEl,
                    "Please enter a valid email address."
                );

                if (
                    emailEl &&
                    typeof emailEl.focus === "function"
                ) {
                    emailEl.focus();
                }

                showMessage(
                    "Invalid email",
                    "Please enter a valid email address.",
                    "warning"
                );

                return;
            }


            /*
            -------------------------------------------------
            Validate subject
            -------------------------------------------------
            */

            if (
                !subject ||
                subject.length > MAX_SUBJECT_LENGTH
            ) {

                showMessage(
                    "Invalid subject",
                    "Please enter a subject.",
                    "warning"
                );

                return;
            }


            /*
            -------------------------------------------------
            Validate message
            -------------------------------------------------
            */

            if (
                !message ||
                message.length > MAX_MESSAGE_LENGTH
            ) {

                showMessage(
                    "Invalid message",
                    "Please enter your message.",
                    "warning"
                );

                return;
            }


            /*
            -------------------------------------------------
            Attachment
            -------------------------------------------------
            */

            file =
                fileInput &&
                fileInput.files &&
                fileInput.files.length
                    ? fileInput.files[0]
                    : null;


            /*
            -------------------------------------------------
            Build email
            -------------------------------------------------
            */

            body = [
                "New Contact Form Message",
                "",
                "Name: " + name,
                "Email: " + email,
                "Subject: " + subject,
                "",
                "Message:",
                message,
                "",
                "Attachment selected: " +
                    (file ? file.name : "None"),
                "",
                "Website: https://www.tahsinahmed.com/"
            ].join("\n");


            /*
            -------------------------------------------------
            mailto URL
            -------------------------------------------------
            */

            mailtoUrl =
                "mailto:" +
                RECIPIENT +
                "?subject=" +
                encodeURIComponent(
                    "[Contact] " + subject
                ) +
                "&body=" +
                encodeURIComponent(body);


            /*
            -------------------------------------------------
            Lock button
            -------------------------------------------------
            */

            originalBtnHTML =
                submitBtn
                    ? submitBtn.innerHTML
                    : "";


            if (submitBtn) {

                submitBtn.disabled =
                    true;

                submitBtn.innerHTML =
                    "Opening...";
            }


            /*
            -------------------------------------------------
            Open email client
            -------------------------------------------------
            */

            window.location.href =
                mailtoUrl;


            /*
            -------------------------------------------------
            Fallback
            -------------------------------------------------
            */

            window.setTimeout(
                function () {

                    if (submitBtn) {

                        submitBtn.disabled =
                            false;

                        submitBtn.innerHTML =
                            originalBtnHTML;
                    }

                    showFallback(
                        mailtoUrl
                    );

                },
                1500
            );
        }
    );

})();
