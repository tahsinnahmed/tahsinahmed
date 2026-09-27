/*
 * Tahsin Ahmed - Static Contact Form
 *
 * Browser-only JavaScript.
 * No Worker.
 * No backend.
 * No API.
 * No Resend.
 *
 * Opens the visitor's email application with the
 * contact message pre-filled.
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


    function clean(value) {
        return String(value || "").replace(/^\s+|\s+$/g, "");
    }


    function valueOf(id) {
        var element = document.getElementById(id);

        if (!element) {
            return "";
        }

        return clean(element.value);
    }


    function validEmail(value) {
        var email = clean(value);

        if (email.length < 3) {
            return false;
        }

        if (email.length > 254) {
            return false;
        }

        if (email.indexOf("..") !== -1) {
            return false;
        }

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }


    function showError(message) {
        window.alert(message);
    }


    function buildMailto(subject, body) {
        return (
            "mailto:" +
            RECIPIENT +
            "?subject=" +
            encodeURIComponent(subject) +
            "&body=" +
            encodeURIComponent(body)
        );
    }


    function showFallback(url) {
        var old;
        var container;
        var link;

        old = document.getElementById("mailtoFallback");

        if (old && old.parentNode) {
            old.parentNode.removeChild(old);
        }


        container =
            document.createElement("div");

        container.id =
            "mailtoFallback";

        container.style.marginTop =
            "15px";

        container.style.lineHeight =
            "1.6";


        link =
            document.createElement("a");

        link.href =
            url;

        link.textContent =
            "open your email app manually";

        link.style.color =
            "#00006d";

        link.style.fontWeight =
            "600";


        container.appendChild(
            document.createTextNode(
                "Your email application did not open. "
            )
        );

        container.appendChild(link);

        container.appendChild(
            document.createTextNode(".")
        );


        if (form.parentNode) {
            form.parentNode.insertBefore(
                container,
                form.nextSibling
            );
        }
    }


    /*
     * Email validation
     */

    if (emailInput) {

        emailInput.addEventListener(
            "input",
            function () {

                if (
                    emailInput.value &&
                    !validEmail(emailInput.value)
                ) {

                    emailInput.setCustomValidity(
                        "Please enter a valid email address."
                    );

                } else {

                    emailInput.setCustomValidity(
                        ""
                    );
                }
            }
        );


        emailInput.addEventListener(
            "blur",
            function () {

                if (
                    emailInput.value &&
                    !validEmail(emailInput.value)
                ) {

                    emailInput.setCustomValidity(
                        "Please enter a valid email address."
                    );

                } else {

                    emailInput.setCustomValidity(
                        ""
                    );
                }
            }
        );
    }


    /*
     * Attachment name preview
     */

    if (
        fileInput &&
        fileChosen
    ) {

        fileInput.addEventListener(
            "change",
            function () {

                var file = null;

                if (
                    fileInput.files &&
                    fileInput.files.length > 0
                ) {

                    file =
                        fileInput.files[0];
                }


                fileChosen.textContent =
                    file
                        ? file.name
                        : "No file chosen";
            }
        );
    }


    /*
     * Submit form
     */

    form.addEventListener(
        "submit",
        function (event) {

            var name;
            var email;
            var subject;
            var message;
            var fileName;
            var body;
            var mailtoUrl;
            var originalButtonHTML;


            event.preventDefault();


            /*
             * Native browser validation
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
             * Get values
             */

            name =
                valueOf("name");

            email =
                valueOf("email");

            subject =
                valueOf("subject");

            message =
                valueOf("message");


            /*
             * Validate name
             */

            if (!name) {

                showError(
                    "Please enter your name."
                );

                return;
            }


            /*
             * Validate email
             */

            if (!validEmail(email)) {

                if (emailInput) {

                    emailInput.setCustomValidity(
                        "Please enter a valid email address."
                    );

                    emailInput.focus();
                }


                showError(
                    "Please enter a valid email address."
                );

                return;
            }


            /*
             * Validate subject
             */

            if (!subject) {

                showError(
                    "Please enter a subject."
                );

                return;
            }


            /*
             * Validate message
             */

            if (!message) {

                showError(
                    "Please enter your message."
                );

                return;
            }


            /*
             * Attachment name
             */

            fileName =
                "None";

            if (
                fileInput &&
                fileInput.files &&
                fileInput.files.length > 0
            ) {

                fileName =
                    fileInput.files[0].name;
            }


            /*
             * Build email body
             */

            body =
                "New Contact Form Message\n" +
                "\n" +
                "Name: " +
                name +
                "\n" +
                "Email: " +
                email +
                "\n" +
                "Subject: " +
                subject +
                "\n" +
                "\n" +
                "Message:\n" +
                message +
                "\n" +
                "\n" +
                "Attachment selected: " +
                fileName +
                "\n" +
                "\n" +
                "Website: https://www.tahsinahmed.com/";


            /*
             * Build mailto URL
             */

            mailtoUrl =
                buildMailto(
                    "[Contact] " + subject,
                    body
                );


            /*
             * Save original button
             */

            originalButtonHTML =
                submitButton
                    ? submitButton.innerHTML
                    : "";


            /*
             * Disable button
             */

            if (submitButton) {

                submitButton.disabled =
                    true;

                submitButton.innerHTML =
                    "Opening...";
            }


            /*
             * Open email application
             */

            window.location.href =
                mailtoUrl;


            /*
             * Fallback message
             */

            window.setTimeout(
                function () {

                    if (submitButton) {

                        submitButton.disabled =
                            false;

                        submitButton.innerHTML =
                            originalButtonHTML;
                    }


                    showFallback(
                        mailtoUrl
                    );

                },
                1500
            );
        }
    );

}());