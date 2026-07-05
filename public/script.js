// mainScriptForObookApplication
// All variables and functions use camelCase convention

const submitBtn = document.getElementById("btn");

if (submitBtn) {
    submitBtn.addEventListener("click", async () => {
        try {
            const response = await fetch("/api");
            const data = await response.json();
            const outputElement = document.getElementById("output");
            if (outputElement) {
                outputElement.innerText = data.message;
            }
        } catch (error) {
            console.error("API fetch error:", error);
        }
    });
}

// Utility function to add smooth scrolling behavior
const initSmoothScroll = () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", function (event) {
            const href = this.getAttribute("href");
            if (href !== "#") {
                event.preventDefault();
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
                }
            }
        });
    });
};

// Initialize when DOM is ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSmoothScroll);
} else {
    initSmoothScroll();
}

