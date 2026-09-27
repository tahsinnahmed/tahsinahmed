/*
=========================================================
Contact Form — Pure Browser JavaScript
---------------------------------------------------------
No backend.
No Cloudflare Worker API.
No Resend API.
No API key.

The browser opens the visitor's default email application
using a mailto: link addressed to contact@tahsinahmed.com.
=========================================================
*/

(function () {
    "use strict";

    var RECIPIENT = "contact@tahsinahmed.com";

    var form = document.getElementById("contactForm");
    var submitBtn = document.getElementById("submit");
    var emailEl = document.getElementById("email");
    var fileInput = document.getElementById("file");
    var fileChosen = document.getElementById("file-chosen");

    if (!form) {
        return;
    }

    function isValidEmail(value) {
        var email = String(value || "").trim();

        return (
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
            email.length <= 254 &&
            email.indexOf("..") === -1
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

        group.classList.remove("has-error");

        var old =
            group.querySelector(".field-error");

        if (old) {
            old.remove();
        }

        input.setCustomValidity("");

        if (!message) {
            return;
        }

        group.classList.add("has-error");

        input.setCustomValidity(message);

        var error =
            document.createElement("small");

        error.className = "field-error";
        error.textContent = message;

        group.appendChild(error);
    }

    /*
    =====================================================
    LIVE EMAIL VALIDATION
    =====================================================
    */

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
                    fileInput.files[0];

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

            event.preventDefault();


            /*
            -------------------------------------------------
            Browser validation
            -------------------------------------------------
            */

            if (!form.checkValidity()) {

                form.reportValidity();

                return;
            }


            /*
            -------------------------------------------------
            Read form fields
            -------------------------------------------------
            */

            var name =
                String(
                    document.getElementById("name")?.value ||
                    ""
                ).trim();


            var email =
                String(
                    emailEl?.value ||
                    ""
                ).trim();


            var subject =
                String(
                    document.getElementById("subject")?.value ||
                    ""
                ).trim();


            var message =
                String(
                    document.getElementById("message")?.value ||
                    ""
                ).trim();


            /*
            -------------------------------------------------
            Attachment filename
            -------------------------------------------------
            */

            var attachment =
                (
                    fileInput &&
                    fileInput.files &&
                    fileInput.files[0]
                )
                    ? fileInput.files[0].name
                    : "No attachment";


            /*
            -------------------------------------------------
            Explicit email validation
            -------------------------------------------------
            */

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


            /*
            -------------------------------------------------
            Build email body
            -------------------------------------------------
            */

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
                "Attachment selected: " + attachment,
                "",
                "Sent from https://www.tahsinahmed.com/"
            ].join("\n");


            /*
            -------------------------------------------------
            Build mailto URL
            -------------------------------------------------
            */

            var mailto =
                "mailto:" +
                encodeURIComponent(RECIPIENT) +

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

            var originalBtnHTML =
                submitBtn
                    ? submitBtn.innerHTML
                    : "";


            if (submitBtn) {

                submitBtn.disabled = true;

                submitBtn.innerHTML =
                    'Opening&nbsp;&nbsp;<i class="fa fa-spinner fa-spin"></i>';
            }


            /*
            -------------------------------------------------
            Open visitor's email application
            -------------------------------------------------
            */

            window.location.href = mailto;


            /*
            -------------------------------------------------
            Fallback
            -------------------------------------------------
            */

            window.setTimeout(
                function () {

                    if (submitBtn) {

                        submitBtn.disabled = false;

                        submitBtn.innerHTML =
                            originalBtnHTML;
                    }


                    var previous =
                        document.querySelector(
                            ".contact-mail-fallback"
                        );


                    if (previous) {
                        previous.remove();
                    }


                    var fallback =
                        document.createElement("p");


                    fallback.className =
                        "contact-mail-fallback";


                    fallback.style.marginTop =
                        "15px";


                    fallback.style.color =
                        "#00006d";


                    fallback.style.fontWeight =
                        "600";


                    var link =
                        document.createElement("a");


                    link.href =
                        mailto;


                    link.textContent =
                        "click here to open it";


                    fallback.appendChild(
                        document.createTextNode(
                            "If your email app did not open, "
                        )
                    );


                    fallback.appendChild(link);


                    fallback.appendChild(
                        document.createTextNode(".")
                    );


                    form.parentNode.insertBefore(
                        fallback,
                        form.nextSibling
                    );

                },
                1200
            );
        }
    );

})();