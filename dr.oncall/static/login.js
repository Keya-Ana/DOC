document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent page refresh

    let formData = new FormData(this);

    fetch("/login", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log("Redirect URL:", data.redirect);  // Log the redirect URL
        if (data.status === "success") {
            window.location.href = data.redirect;  // Redirect to dashboard
        } else {
            alert(data.message);  // Show error message
        }
    })
    .catch(error => console.error("Error:", error));
});
