// Remove SQL.js initialization and related code
async function initApp() {
    // Call testDatabase or other initialization functions as needed
    await testDatabase();
}

// API call helper
async function apiCall(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
    };
    if (data) {
        options.body = JSON.stringify(data);
    }
    const response = await fetch(`/api${endpoint}`, options);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return method === 'DELETE' ? {} : response.json();
}

// Database operations (replace your existing ones)
async function addPatientToDB(patientData) {
    try {
        const result = await apiCall('/patients', 'POST', patientData);
        return result;
    } catch (error) {
        console.error('Error adding patient:', error);
        throw error;
    }
}

async function getAllPatients() {
    try {
        return await apiCall('/patients');
    } catch (error) {
        console.error('Error fetching patients:', error);
        throw error;
    }
}

async function getPatientById(id) {
    try {
        return await apiCall(`/patients/${id}`);
    } catch (error) {
        console.error('Error fetching patient:', error);
        throw error;
    }
}

async function getPatientCount(type = null) {
    try {
        const endpoint = type ? `/patients/count?type=${type}` : '/patients/count';
        const result = await apiCall(endpoint);
        return result.count;
    } catch (error) {
        console.error('Error fetching patient count:', error);
        throw error;
    }
}

async function getPatientCountByStatus(status) {
    try {
        const result = await apiCall(`/patients/count/status?status=${status}`);
        return result.count;
    } catch (error) {
        console.error('Error fetching patient count by status:', error);
        throw error;
    }
}

async function getRecentPatients(limit = 5) {
    try {
        return await apiCall(`/patients/recent?limit=${limit}`);
    } catch (error) {
        console.error('Error fetching recent patients:', error);
        throw error;
    }
}

async function removePatient(id) {
    try {
        await apiCall(`/patients/${id}`, 'DELETE');
    } catch (error) {
        console.error('Error deleting patient:', error);
        throw error;
    }
}

// Example: Handle Add Patient form submission
function setupAddPatientForm() {
    const form = document.getElementById('add-patient-form'); // Adjust ID to match your form
    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(form);
            const patientData = {
                first_name: formData.get('first_name'),
                last_name: formData.get('last_name'),
                dob: formData.get('dob'),
                gender: formData.get('gender'),
                address: formData.get('address'),
                phone: formData.get('phone'),
                email: formData.get('email') || null,
                patient_type: formData.get('patient_type'),
                admission_date: formData.get('admission_date'),
                primary_condition: formData.get('primary_condition'),
                condition_severity: formData.get('condition_severity'),
                current_status: formData.get('current_status'),
                medications: formData.get('medications') || null,
                notes: formData.get('notes') || null,
                photo: formData.get('photo') || null,
            };
            try {
                await addPatientToDB(patientData);
                alert('Patient added successfully!');
                form.reset(); // Reset form after submission
                // Optionally redirect or refresh patient list
            } catch (error) {
                alert('Error adding patient: ' + error.message);
            }
        });
    }
}

async function testDatabase() {
    try {
        const allPatients = await getAllPatients();
        console.log("All patients:", allPatients);
        const count = await getPatientCount();
        console.log("Total patients:", count);
        const recent = await getRecentPatients();
        console.log("Recent patients:", recent);
    } catch (error) {
        console.error('Test database error:', error);
    }
}

// Initialize app and form
window.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupAddPatientForm();
});