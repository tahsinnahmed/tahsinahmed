/*
=========================================================
Contact Form Email Handler — Browser Only
---------------------------------------------------------
This file is CLIENT-SIDE JavaScript only.

It does NOT:
- run as a Cloudflare Worker
- expose an API endpoint
- call /api/contact
- call Resend
- use an API key
- require a backend

It opens the visitor's configured email application with
the contact-form information pre-filled using mailto:.
=========================================================
*/

(function () {
    "use strict";

    var RECIPIENT = "contact@tahsinahmed.com";
    var MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024;

    var form = document.getElementById("contactForm");
    var submitBtn = document.getElementById("submit");
    var emailEl = document.getElementById("email");
    var fileInput = document.getElementById("file");
    var fileChosen = document.getElementById("file-chosen");

    if (!form) {
        return;
    }

    function isValidEmail(value) {

        var email =
            String(value || "").trim();

        return (
            email.length >= 3 &&
            email.length <= 254 &&
            email.indexOf("..") === -1 &&
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        );
    }


    function setFieldError(input, message) {

        if (!input) {
            return;
        }

        var group =
            input.closest(".form-group") ||
            input.parentNode;

        if (!group) {
            return;
        }

        var old =
            group.querySelector(".field-error");

        if (old) {
            old.remove();
        }

        group.classList.remove("has-error");

        input.setCustomValidity("");

        if (!message) {
            return;
        }

        group.classList.add("has-error");

        input.setCustomValidity(message);

        var error =
            document.createElement("small");

        error.className =
            "field-error";

        error.textContent =
            message;

        group.appendChild(error);
    }


    function getValue(id) {

        var element =
            document.getElementById(id);

        return element
            ? element.value.trim()
            : "";
    }


    function showMailtoFallback(mailto) {

        var existing =
            document.getElementById(
                "contactMailFallback"
            );

        if (existing) {
            existing.remove();
        }

        var wrapper =
            document.createElement("p");

        wrapper.id =
            "contactMailFallback";

        wrapper.style.marginTop =
            "15px";

        wrapper.style.color =
            "#00006d";

        wrapper.style.fontWeight =
            "600";


        var link =
            document.createElement("a");

        link.href =
            mailto;

        link.textContent =
            "click here to open your email app";


        wrapper.appendChild(
            document.createTextNode(
                "If your email application did not open, "
            )
        );

        wrapper.appendChild(link);

        wrapper.appendChild(
            document.createTextNode(".")
        );


        form.parentNode.insertBefore(
            wrapper,
            form.nextSibling
        );
    }


    /* =====================================================
       EMAIL VALIDATION
       ===================================================== */

    if (emailEl) {

        emailEl.addEventListener(
            "input",
            function () {

                var value =
                    emailEl.value.trim();

                if (
                    !value ||
                    isValidEmail(value)
                ) {

                    setFieldError(
                        emailEl,
                        ""
                    );

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
                    emailEl.value.trim();

                if (
                    value &&
                    !isValidEmail(value)
                ) {

                    setFieldError(
                        emailEl,
                        "Please enter a valid email address."
                    );

                } else {

                    setFieldError(
                        emailEl,
                        ""
                    );
                }
            }
        );
    }


    /* =====================================================
       FILE NAME PREVIEW
       ===================================================== */

    if (
        fileInput &&
        fileChosen
    ) {

        fileInput.addEventListener(
            "change",
            function () {

                var file =
                    fileInput.files &&
                    fileInput.files[0];

                fileChosen.textContent =
                    file
                        ? file.name
                        : "No file chosen";
            }
        );
    }


    /* =====================================================
       FORM SUBMISSION
       ===================================================== */

    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            if (!form.checkValidity()) {

                form.reportValidity();

                return;
            }


            var name =
                getValue("name");

            var email =
                getValue("email");

            var subject =
                getValue("subject");

            var message =
                getValue("message");


            if (!isValidEmail(email)) {

                setFieldError(
                    emailEl,
                    "Please enter a valid email address."
                );

                if (emailEl) {
                    emailEl.focus();
                }

                return;
            }


            var selectedFile =
                fileInput &&
                fileInput.files &&
                fileInput.files[0];


            if (
                selectedFile &&
                selectedFile.size > MAX_ATTACHMENT_SIZE
            ) {

                window.alert(
                    "Please select an attachment smaller than 5 MB."
                );

                return;
            }


            var attachmentInfo =
                selectedFile
                    ? selectedFile.name
                    : "None";


            var body = [

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
                    attachmentInfo,

                "",

                "Website: https://www.tahsinahmed.com/"

            ].join("\n");


            var mailto =
                "mailto:" +
                RECIPIENT +
                "?subject=" +
                encodeURIComponent(
                    "[Contact] " + subject
                ) +
                "&body=" +
                encodeURIComponent(body);


            var originalBtnHTML =
                submitBtn
                    ? submitBtn.innerHTML
                    : "";


            if (submitBtn) {

                submitBtn.disabled =
                    true;

                submitBtn.innerHTML =
                    'Opening&nbsp;&nbsp;<i class="fa fa-spinner fa-spin"></i>';
            }


            /*
             * Browser-native email handoff.
             */
            window.location.href =
                mailto;


            /*
             * Fallback if the browser did not
             * open an email application.
             */
            window.setTimeout(
                function () {

                    if (submitBtn) {

                        submitBtn.disabled =
                            false;

                        submitBtn.innerHTML =
                            originalBtnHTML;
                    }

                    showMailtoFallback(
                        mailto
                    );

                },
                1200
            );
        }
    );

})();