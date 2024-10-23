'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const updateForm = document.getElementById('updateForm');
    
    if (updateForm) {
        updateForm.addEventListener('submit', function(event) {
            const confirmUpdate = confirm("Are you sure you want to update this vehicle?");
            if (!confirmUpdate) {
                event.preventDefault(); // Prevent the form from submitting
            }
        });
    }
});
