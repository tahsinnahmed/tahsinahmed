(function () {

    "use strict";

    var ENDPOINT = "/api/contact";

    var form =
        document.getElementById("contactForm");

    var submit =
        document.getElementById("submit");

    var email =
        document.getElementById("email");

    var file =
        document.getElementById("file");

    var fileChosen =
        document.getElementById("file-chosen");


    if (!form) {
        return;
    }


    function validEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            String(value || "").replace(/^\s+|\s+$/g, "")
        );
    }


    function show(title, message, icon) {

        if (
            typeof window.Swal !== "undefined" &&
            window.Swal &&
            typeof window.Swal.fire === "function"
        ) {

            window.Swal.fire({
                title: title,
                text: message,
                icon: icon || "info",
                confirmButtonColor: "#00006d"
            });

        } else {

            window.alert(
                title + "\n\n" + message
            );
        }
    }


    if (email) {

        email.addEventListener(
            "input",
            function () {

                email.setCustomValidity(
                    !email.value ||
                    validEmail(email.value)
                        ? ""
                        : "Please enter a valid email address."
                );
            }
        );
    }


    if (file && fileChosen) {

        file.addEventListener(
            "change",
            function () {

                fileChosen.textContent =
                    file.files &&
                    file.files.length
                        ? file.files[0].name
                        : "No file chosen";
            }
        );
    }


    form.addEventListener(
        "submit",
        async function (event) {

            var formData;
            var response;
            var text;
            var data;
            var original;


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
                !email ||
                !validEmail(email.value)
            ) {

                show(
                    "Invalid email",
                    "Please enter a valid email address.",
                    "warning"
                );

                if (email) {
                    email.focus();
                }

                return;
            }


            formData =
                new FormData(form);


            original =
                submit
                    ? submit.innerHTML
                    : "";


            if (submit) {
                submit.disabled = true;
                submit.innerHTML = "Sending...";
            }


            try {

                /*
                 * Direct same-origin request to the
                 * Cloudflare Worker.
                 *
                 * This does NOT use mailto.
                 */
                response =
                    await fetch(
                        ENDPOINT,
                        {
                            method:
                                "POST",

                            body:
                                formData,

                            headers: {
                                Accept:
                                    "application/json"
                            }
                        }
                    );


                text =
                    await response.text();


                try {

                    data =
                        JSON.parse(text);

                } catch (parseError) {

                    console.error(
                        "Server returned:",
                        response.status,
                        text
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

                if (email) {
                    email.setCustomValidity("");
                }

                if (fileChosen) {
                    fileChosen.textContent =
                        "No file chosen";
                }


                show(
                    "Message sent!",
                    "Your message has been sent successfully.",
                    "success"
                );


            } catch (error) {

                console.error(
                    "Contact form error:",
                    error
                );

                show(
                    "Message not sent",
                    error &&
                    error.message
                        ? error.message
                        : "Unable to send the message.",
                    "error"
                );


            } finally {

                if (submit) {

                    submit.disabled =
                        false;

                    submit.innerHTML =
                        original;
                }
            }
        }
    );

}());
