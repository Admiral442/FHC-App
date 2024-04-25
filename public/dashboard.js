// dashboard.js

document.addEventListener('DOMContentLoaded', function() {
    // Fetch and display statistics when the page is loaded
    fetchStatistics();
});

function fetchStatistics() {
    // Fetch statistics from the server
    fetch('/statistics')
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to fetch statistics');
            }
        })
        .then(data => {
            // Update the dashboard with fetched statistics
            updateStatistics(data);
        })
        .catch(error => {
            console.error('Error fetching statistics:', error);
        });
}

function updateStatistics(data) {
    // Update the HTML elements with the fetched statistics
    document.getElementById('totalActiveMembers').textContent = data.totalActiveMembers;
    document.getElementById('applicationsNeedingReview').textContent = data.applicationsNeedingReview;
    // Update more statistics as needed
}
