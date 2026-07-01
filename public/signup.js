const signupForm = document.getElementById("signup-form");
const feedback = document.getElementById("feedback");

signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = {
        username: document.getElementById("username").value.trim(),
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("password").value,
        confirmPassword: document.getElementById("confirmPassword").value,
    };

    try {
        const response = await fetch("/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (!response.ok) {
            feedback.textContent = result.error || "Signup failed.";
            feedback.classList.remove("success");
            return;
        }

        window.location.href = result.redirect || "/thankyou.html";
    } catch (error) {
        feedback.textContent = "Signup failed. Please try again.";
        feedback.classList.remove("success");
        console.error("Signup error:", error);
    }
});
