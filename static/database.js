// Patient API operations using fetch

// Hardcoded sample data
const SAMPLE_PATIENTS = [
    {
        first_name: 'John',
        last_name: 'Smith',
        dob: '1985-04-12',
        gender: 'Male',
        address: '123 Main St, Anytown',
        phone: '555-1234',
        email: 'john.smith@example.com',
        patient_type: 'Inpatient',
        admission_date: '2023-05-15',
        primary_condition: 'Pneumonia',
        condition_severity: 'Severe',
        current_status: 'Recovering',
        medications: 'Amoxicillin, Ibuprofen, Albuterol',
        notes: 'Patient responding well to treatment. Continue current medication regimen.',
        photo: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
        first_name: 'Emily',
        last_name: 'Johnson',
        dob: '1978-11-23',
        gender: 'Female',
        address: '456 Oak Ave, Somewhere',
        phone: '555-5678',
        email: 'emily.j@example.com',
        patient_type: 'Outpatient',
        admission_date: '2023-06-02',
        primary_condition: 'Hypertension',
        condition_severity: 'Moderate',
        current_status: 'Stable',
        medications: 'Lisinopril, Hydrochlorothiazide',
        notes: 'Blood pressure under control. Schedule follow-up in 2 weeks.',
        photo: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
        first_name: 'Michael',
        last_name: 'Williams',
        dob: '1992-07-30',
        gender: 'Male',
        address: '789 Pine Rd, Nowhere',
        phone: '555-9012',
        email: null,
        patient_type: 'Inpatient',
        admission_date: '2023-06-10',
        primary_condition: 'Appendicitis',
        condition_severity: 'Critical',
        current_status: 'Critical',
        medications: 'Morphine, Cefazolin, Metronidazole',
        notes: 'Post-op recovery. Monitor for infection. NPO until bowel sounds return.',
        photo: null
    },
    {
        first_name: 'Sarah',
        last_name: 'Brown',
        dob: '1965-09-14',
        gender: 'Female',
        address: '321 Elm St, Anywhere',
        phone: '555-3456',
        email: 'sarah.b@example.com',
        patient_type: 'Outpatient',
        admission_date: '2023-06-05',
        primary_condition: 'Type 2 Diabetes',
        condition_severity: 'Moderate',
        current_status: 'Stable',
        medications: 'Metformin, Insulin glargine',
        notes: 'Blood sugar levels improving. Continue current treatment and diet.',
        photo: null
    },
    {
        first_name: 'David',
        last_name: 'Jones',
        dob: '1958-12-03',
        gender: 'Male',
        address: '654 Maple Dr, Somewhere',
        phone: '555-7890',
        email: null,
        patient_type: 'Inpatient',
        admission_date: '2023-06-12',
        primary_condition: 'Heart Failure',
        condition_severity: 'Critical',
        current_status: 'Critical',
        medications: 'Furosemide, Carvedilol, Lisinopril',
        notes: 'Severe CHF. Monitor fluid intake/output closely. Cardiology consult ordered.',
        photo: null
    },
    {
        first_name: 'Lisa',
        last_name: 'Garcia',
        dob: '1980-03-25',
        gender: 'Female',
        address: '987 Cedar Ln, Nowhere',
        phone: '555-2345',
        email: 'lisa.g@example.com',
        patient_type: 'Outpatient',
        admission_date: '2023-06-08',
        primary_condition: 'Migraine',
        condition_severity: 'Mild',
        current_status: 'Recovering',
        medications: 'Sumatriptan, Naproxen',
        notes: 'Migraine frequency decreasing with current treatment. Consider preventive therapy if symptoms persist.',
        photo: null
    }
];

// Add a patient
function addPatientToDB(patientData) {
    return fetch('/api/patients', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(patientData)
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to add patient');
        return response.json();
    });
}

// Get all patients, fallback to sample data if empty
function getAllPatients() {
    return fetch('/api/patients')
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch patients');
            return response.json();
        })
        .then(patients => {
            if (!Array.isArray(patients) || patients.length === 0) {
                return SAMPLE_PATIENTS;
            }
            return patients;
        });
}

// Get patient by ID
function getPatientById(id) {
    return fetch(`/api/patients/${id}`)
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch patient');
            return response.json();
        });
}

// Get patient count (optionally by type)
function getPatientCount(type = null) {
    let url = '/api/patients/count';
    if (type) url += `?type=${encodeURIComponent(type)}`;
    return fetch(url)
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch patient count');
            return response.json();
        })
        .then(data => data.count);
}

// Get patient count by status
function getPatientCountByStatus(status) {
    return fetch(`/api/patients/count?status=${encodeURIComponent(status)}`)
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch patient count by status');
            return response.json();
        })
        .then(data => data.count);
}

// Get recent patients
function getRecentPatients(limit = 5) {
    return fetch(`/api/patients/recent?limit=${limit}`)
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch recent patients');
            return response.json();
        });
}

// Remove patient
function removePatient(id) {
    return fetch(`/api/patients/${id}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to delete patient');
        return response.json();
    });
}

// Example test function
async function testDatabase() {
    const allPatients = await getAllPatients();
    console.log("All patients:", allPatients);

    const count = await getPatientCount();
    console.log("Total patients:", count);

    const recent = await getRecentPatients();
    console.log("Recent patients:", recent);
}

window.addEventListener('DOMContentLoaded', testDatabase);
