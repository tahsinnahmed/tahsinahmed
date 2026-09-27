/*
=========================================================
Contact Form
---------------------------------------------------------
Browser
    ↓
POST /api/contact
    ↓
Cloudflare Worker (email/email.js)
    ↓
Resend API
    ↓
contact@tahsinahmed.com
    ↓
Cloudflare Email Routing
    ↓
Your Gmail / destination mailbox
=========================================================
*/

(function () {

    "use strict";


    // =====================================================
    // CONFIG
    // =====================================================

    var FORM_ENDPOINT = "/api/contact";

    var FALLBACK_EMAIL =
        "contact@tahsinahmed.com";


    // =====================================================
    // EMAIL VALIDATION
    // =====================================================

    var EMAIL_REGEX =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    function isValidEmail(value) {

        if (!value) {
            return false;
        }


        var v =
            value.trim();


        if (
            v.length < 3 ||
            v.length > 254
        ) {
            return false;
        }


        if (
            v.indexOf("..") !== -1
        ) {
            return false;
        }


        return EMAIL_REGEX.test(v);

    }


    // =====================================================
    // ELEMENTS
    // =====================================================

    var form =
        document.getElementById(
            "contactForm"
        );


    var submitBtn =
        document.getElementById(
            "submit"
        );


    var emailEl =
        document.getElementById(
            "email"
        );


    // =====================================================
    // INLINE ERROR
    // =====================================================

    function setFieldError(
        input,
        message
    ) {

        if (!input) {
            return;
        }


        var group =
            input.closest(
                ".form-group"
            ) ||
            input.parentNode;


        group.classList.remove(
            "has-error"
        );


        var old =
            group.querySelector(
                ".field-error"
            );


        if (old) {
            old.remove();
        }


        if (!message) {

            input.setCustomValidity(
                ""
            );

            return;

        }


        group.classList.add(
            "has-error"
        );


        input.setCustomValidity(
            message
        );


        var err =
            document.createElement(
                "small"
            );


        err.className =
            "field-error";


        err.textContent =
            message;


        group.appendChild(
            err
        );

    }


    // =====================================================
    // LIVE EMAIL VALIDATION
    // =====================================================

    if (emailEl) {

        emailEl.addEventListener(
            "input",
            function () {

                var value =
                    emailEl.value.trim();


                if (!value) {

                    setFieldError(
                        emailEl,
                        ""
                    );

                    return;

                }


                if (
                    !isValidEmail(
                        value
                    )
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


        emailEl.addEventListener(
            "blur",
            function () {

                var value =
                    emailEl.value.trim();


                if (
                    value &&
                    !isValidEmail(
                        value
                    )
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


    // =====================================================
    // FORM SUBMISSION
    // =====================================================

    if (form) {

        form.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                // -------------------------------------------------
                // 1. Browser validation
                // -------------------------------------------------

                if (
                    !form.checkValidity()
                ) {

                    form.reportValidity();

                    return;

                }


                // -------------------------------------------------
                // 2. Explicit email validation
                // -------------------------------------------------

                var rawEmail =
                    emailEl
                        ? emailEl.value.trim()
                        : "";


                if (
                    !isValidEmail(
                        rawEmail
                    )
                ) {

                    setFieldError(
                        emailEl,
                        "Please enter a valid email address."
                    );


                    if (emailEl) {
                        emailEl.focus();
                    }


                    if (
                        typeof Swal !==
                        "undefined"
                    ) {

                        Swal.fire({

                            title:
                                "Invalid email",

                            text:
                                "Please enter a valid email address.",

                            icon:
                                "warning",

                            confirmButtonColor:
                                "#00006d"

                        });

                    }


                    return;

                }


                // -------------------------------------------------
                // 3. Build FormData
                // -------------------------------------------------

                var formData =
                    new FormData(
                        form
                    );


                formData.set(
                    "email",
                    rawEmail
                );


                // -------------------------------------------------
                // 4. Lock button
                // -------------------------------------------------

                var originalBtnHTML =
                    submitBtn
                        ? submitBtn.innerHTML
                        : "";


                if (submitBtn) {

                    submitBtn.disabled =
                        true;


                    submitBtn.innerHTML =
                        'Sending&nbsp;&nbsp;<i class="fa fa-spinner fa-spin"></i>';

                }


                // -------------------------------------------------
                // 5. Send to existing Worker API
                // -------------------------------------------------

                fetch(
                    FORM_ENDPOINT,
                    {
                        method:
                            "POST",

                        body:
                            formData
                    }
                )


                // -------------------------------------------------
                // 6. Parse response
                // -------------------------------------------------

                .then(
                    function (response) {

                        return response.text()
                            .then(
                                function (text) {

                                    var data;


                                    try {

                                        data =
                                            JSON.parse(
                                                text
                                            );

                                    } catch (
                                        parseErr
                                    ) {

                                        var snippet =
                                            (
                                                text ||
                                                ""
                                            )
                                            .slice(
                                                0,
                                                300
                                            )
                                            .replace(
                                                /\s+/g,
                                                " "
                                            );


                                        throw new Error(
                                            "Server returned non-JSON (HTTP " +
                                            response.status +
                                            "). Body: \"" +
                                            snippet +
                                            "\""
                                        );

                                    }


                                    if (
                                        !response.ok
                                    ) {

                                        throw new Error(
                                            (
                                                data &&
                                                data.error
                                            ) ||
                                            (
                                                "HTTP " +
                                                response.status
                                            )
                                        );

                                    }


                                    return data;

                                }
                            );

                    }
                )


                // -------------------------------------------------
                // 7. Success
                // -------------------------------------------------

                .then(
                    function (data) {

                        if (
                            !data ||
                            !data.success
                        ) {

                            throw new Error(
                                (
                                    data &&
                                    data.error
                                ) ||
                                "Unknown error"
                            );

                        }


                        form.reset();


                        setFieldError(
                            emailEl,
                            ""
                        );


                        var fileChosen =
                            document.getElementById(
                                "file-chosen"
                            );


                        if (
                            fileChosen
                        ) {

                            fileChosen.textContent =
                                "No file chosen";

                        }


                        if (
                            typeof Swal !==
                            "undefined"
                        ) {

                            Swal.fire({

                                title:
                                    "Message sent!",

                                text:
                                    "Thank you for reaching out. I am currently tied up but will get back to you as soon as possible. I appreciate your patience.",

                                icon:
                                    "success",

                                confirmButtonColor:
                                    "#00006d"

                            });

                        } else {

                            alert(
                                "Thank you! Your message has been sent."
                            );

                        }

                    }
                )


                // -------------------------------------------------
                // 8. Error handling
                // -------------------------------------------------

                .catch(
                    function (err) {

                        console.error(
                            "Contact form error:",
                            err
                        );


                        var raw =
                            (
                                err &&
                                err.message
                            )
                            ? err.message
                            : "Unknown error.";


                        var friendly =
                            raw;


                        if (
                            /RESEND_API_KEY|not configured/i
                                .test(raw)
                        ) {

                            friendly =
                                "The contact form is not configured yet. " +
                                "Please email me directly at " +
                                FALLBACK_EMAIL +
                                ".";

                        } else if (
                            /Failed to send|Resend|Unauthorized|401|403/i
                                .test(raw)
                        ) {

                            friendly =
                                "The message service is temporarily unable to send emails. " +
                                "Please try again later, or email me directly at " +
                                FALLBACK_EMAIL +
                                ".";

                        } else if (
                            /HTTP 4|HTTP 5/.test(
                                raw
                            )
                        ) {

                            friendly =
                                "The message service rejected the request. " +
                                "Please try again later, or email me directly at " +
                                FALLBACK_EMAIL +
                                ".";

                        } else if (
                            /Failed to fetch|NetworkError|Load failed/i
                                .test(raw)
                        ) {

                            friendly =
                                "Network error. Please check your internet connection and try again.";

                        } else if (
                            /non-JSON/.test(
                                raw
                            )
                        ) {

                            friendly =
                                "The contact endpoint is not available yet. " +
                                "Please email me directly at " +
                                FALLBACK_EMAIL +
                                ".";

                        }


                        if (
                            typeof Swal !==
                            "undefined"
                        ) {

                            Swal.fire({

                                title:
                                    "Message not sent",

                                text:
                                    friendly,

                                icon:
                                    "error",

                                confirmButtonColor:
                                    "#00006d"

                            });

                        } else {

                            alert(
                                friendly
                            );

                        }

                    }
                )


                // -------------------------------------------------
                // 9. Restore button
                // -------------------------------------------------

                .finally(
                    function () {

                        if (submitBtn) {

                            submitBtn.disabled =
                                false;


                            submitBtn.innerHTML =
                                originalBtnHTML;

                        }

                    }
                );

            }
        );

    }


    // =====================================================
    // FILE NAME PREVIEW
    // =====================================================

    var fileInput =
        document.getElementById(
            "file"
        );


    var fileChosen =
        document.getElementById(
            "file-chosen"
        );


    if (
        fileInput &&
        fileChosen
    ) {

        fileInput.addEventListener(
            "change",
            function (event) {

                var file =
                    event.target.files[0];


                fileChosen.textContent =
                    file
                        ? file.name
                        : "No file chosen";

            }
        );

    }

})();