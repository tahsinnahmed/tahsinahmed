(function () {

    "use strict";

    var FORM_ENDPOINT = "/api/contact";

    var form =
        document.getElementById("contactForm");

    var submitBtn =
        document.getElementById("submit");

    var emailEl =
        document.getElementById("email");

    var fileInput =
        document.getElementById("file");

    var fileChosen =
        document.getElementById("file-chosen");


    if (!form) {
        return;
    }


    function isValidEmail(value) {

        var email =
            String(value || "")
                .replace(/^\s+|\s+$/g, "");

        return (
            email.length >= 3 &&
            email.length <= 254 &&
            email.indexOf("..") === -1 &&
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        );
    }


    function showAlert(
        title,
        message,
        icon
    ) {

        if (
            typeof window.Swal !== "undefined" &&
            window.Swal &&
            typeof window.Swal.fire === "function"
        ) {

            window.Swal.fire(
                {
                    title:
                        title,

                    text:
                        message,

                    icon:
                        icon || "info",

                    confirmButtonColor:
                        "#00006d"
                }
            );

        } else {

            window.alert(
                title +
                "\n\n" +
                message
            );
        }
    }


    if (emailEl) {

        emailEl.addEventListener(
            "input",
            function () {

                emailEl.setCustomValidity(
                    !emailEl.value ||
                    isValidEmail(emailEl.value)
                        ? ""
                        : "Please enter a valid email address."
                );
            }
        );
    }


    if (
        fileInput &&
        fileChosen
    ) {

        fileInput.addEventListener(
            "change",
            function () {

                fileChosen.textContent =
                    (
                        fileInput.files &&
                        fileInput.files.length > 0
                    )
                        ? fileInput.files[0].name
                        : "No file chosen";
            }
        );
    }


    form.addEventListener(
        "submit",
        async function (event) {

            var formData;
            var response;
            var responseText;
            var data;
            var originalHTML;


            event.preventDefault();


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


            if (
                !emailEl ||
                !isValidEmail(emailEl.value)
            ) {

                showAlert(
                    "Invalid email",
                    "Please enter a valid email address.",
                    "warning"
                );

                return;
            }


            formData =
                new FormData(form);


            originalHTML =
                submitBtn
                    ? submitBtn.innerHTML
                    : "";


            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML =
                    "Sending...";
            }


            try {

                response =
                    await fetch(
                        FORM_ENDPOINT,
                        {
                            method:
                                "POST",

                            body:
                                formData,

                            headers: {
                                "Accept":
                                    "application/json"
                            }
                        }
                    );


                responseText =
                    await response.text();


                try {

                    data =
                        JSON.parse(
                            responseText
                        );

                } catch (parseError) {

                    console.error(
                        "Invalid server response:",
                        response.status,
                        responseText
                    );

                    throw new Error(
                        "Invalid server response (" +
                        response.status +
                        ")."
                    );
                }


                if (
                    !response.ok ||
                    !data ||
                    !data.success
                ) {

                    throw new Error(
                        data &&
                        data.error
                            ? data.error
                            : "Unable to send the message."
                    );
                }


                form.reset();

                if (emailEl) {
                    emailEl.setCustomValidity("");
                }

                if (fileChosen) {
                    fileChosen.textContent =
                        "No file chosen";
                }


                showAlert(
                    "Message sent!",
                    "Your message has been sent successfully.",
                    "success"
                );


            } catch (error) {

                console.error(
                    "Contact form error:",
                    error
                );


                showAlert(
                    "Message not sent",
                    error &&
                    error.message
                        ? error.message
                        : "Unable to send the message right now.",
                    "error"
                );


            } finally {

                if (submitBtn) {

                    submitBtn.disabled =
                        false;

                    submitBtn.innerHTML =
                        originalHTML;
                }
            }
        }
    );

}());