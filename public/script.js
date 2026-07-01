const btn = document.getElementById("btn");

if (btn) {
    btn.addEventListener("click", async () => {
        try {
            const response = await fetch("/api");
            const data = await response.json();
            const output = document.getElementById("output");
            if (output) {
                output.innerText = data.message;
            }
        } catch (error) {
            console.error("API fetch error:", error);
        }
    });
}
