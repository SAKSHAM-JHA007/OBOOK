// signupFormHandlingWithCamelcaseConventions
const signupFormElement = document.getElementById("signupForm");
const feedbackElement = document.getElementById("signupError");

if (signupFormElement) {
    signupFormElement.addEventListener("submit", async (event) => {
        event.preventDefault();

        const signupUsername = document.getElementById("signupUsername");
        const signupEmail = document.getElementById("signupEmail");
        const signupPassword = document.getElementById("signupPassword");
        const signupConfirmPassword = document.getElementById("signupConfirmPassword");

        // Validation checks
        if (!signupUsername || !signupEmail || !signupPassword || !signupConfirmPassword) {
            if (feedbackElement) {
                feedbackElement.textContent = "Missing form fields.";
                feedbackElement.classList.remove("hidden");
            }
            return;
        }

        if (signupPassword.value !== signupConfirmPassword.value) {
            if (feedbackElement) {
                feedbackElement.textContent = "Passwords do not match.";
                feedbackElement.classList.remove("hidden");
            }
            return;
        }

        if (signupPassword.value.length < 8) {
            if (feedbackElement) {
                feedbackElement.textContent = "Password must be at least 8 characters.";
                feedbackElement.classList.remove("hidden");
            }
            return;
        }

        const formPayload = {
            username: signupUsername.value.trim(),
            email: signupEmail.value.trim(),
            password: signupPassword.value,
            confirmPassword: signupConfirmPassword.value
        };

        try {
            const response = await fetch("/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formPayload),
            });

            const result = await response.json();

            if (!response.ok) {
                if (feedbackElement) {
                    feedbackElement.textContent = result.error || "Signup failed.";
                    feedbackElement.classList.remove("hidden");
                }
                return;
            }

            window.location.href = result.redirect || "/thankyou.html";
        } catch (error) {
            if (feedbackElement) {
                feedbackElement.textContent = "Signup failed. Please try again.";
                feedbackElement.classList.remove("hidden");
            }
            console.error("Signup error:", error);
        }
    });
}
