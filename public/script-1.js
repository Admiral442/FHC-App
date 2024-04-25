document.addEventListener('DOMContentLoaded', function() {
    // Function to handle application form submission
    document.getElementById('applicationForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form submission

        // Retrieve form data
        let fullName = document.getElementById('fullName').value;
        let email = document.getElementById('email').value;
        let phone = document.getElementById('phone').value;
        let emergencyContact = document.getElementById('emergencyContact').value;

        // Construct the data object to send to the server
        let formData = {
            fullName: fullName,
            email: email,
            phone: phone,
            emergencyContact: emergencyContact
        };

        // Send the form data to the server
        fetch('/submit-application', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (response.ok) {
                alert('Application submitted successfully!');
                // Optionally, reset the form
                document.getElementById('applicationForm').reset();
            } else {
                alert('Failed to submit application. Please try again later.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred. Please try again later.');
        });
    });
});
