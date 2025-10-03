// --- FIREBASE REAL-TIME CHAT SETUP ---
// 1. Add your Firebase config below
const firebaseConfig = {
    apiKey: "AIzaSyDHSHkB9cVXOix7ExRL2cn_aYvcXkMkXAc",
    authDomain: "new--sign-in-ea29f.firebaseapp.com",
    projectId: "new--sign-in-ea29f",
    storageBucket: "new--sign-in-ea29f.appspot.com",
    messagingSenderId: "809988180692",
    appId: "1:809988180692:web:3825a2663e61b0c2b30941"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 2. Get user info (replace with real user info if available)
const profileImages = [
    '/static/images/profile-1.jpg',
    '/static/images/profile-2.jpg',
    '/static/images/profile-3.jpg',
    '/static/images/profile-4.jpg'
];
const randomAvatar = profileImages[Math.floor(Math.random() * profileImages.length)];
const currentUser = {
    name: 'You',
    avatar: randomAvatar
};


document.addEventListener('DOMContentLoaded', function() {
    // Simulate real-time updates
    function updateDashboard() {
        // Update patient count with random fluctuation
        const patientCount = document.querySelector('.card:nth-child(1) h2');
        const currentPatients = parseInt(patientCount.textContent.replace(/,/g, ''));
        const newPatients = currentPatients + Math.floor(Math.random() * 5) - 2;
        patientCount.textContent = newPatients.toLocaleString();
        
        // Update appointment count
        const appointmentCount = document.querySelector('.card:nth-child(4) h2');
        const currentAppointments = parseInt(appointmentCount.textContent);
        const newAppointments = currentAppointments + Math.floor(Math.random() * 3) - 1;
        appointmentCount.textContent = newAppointments;
        
        // Update status badges randomly
        const statusBadges = document.querySelectorAll('.badge');
        statusBadges.forEach(badge => {
            const statuses = ['Stable', 'Recovering', 'Critical', 'Improving'];
            const colors = ['bg-blue', 'bg-green', 'bg-orange', 'bg-purple'];
            if(Math.random() > 0.9) { // 10% chance to change status
                const randomIndex = Math.floor(Math.random() * statuses.length);
                badge.textContent = statuses[randomIndex];
                badge.className = 'badge ' + colors[randomIndex];
            }
        });
    }
    
    // Update dashboard every 10 seconds
    setInterval(updateDashboard, 10000);
    

    // --- REAL-TIME CHAT FUNCTIONALITY ---
    const chatInput = document.querySelector('.chat-input input');
    const sendButton = document.querySelector('.btn-send');
    const chatMessages = document.querySelector('.chat-messages');

    // Send message to Firestore
    function sendMessage() {
        const messageText = chatInput.value.trim();
        if (messageText) {
            db.collection('chat').add({
                user: currentUser.name,
                avatar: currentUser.avatar,
                message: messageText,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            chatInput.value = '';
        }
    }

    sendButton.addEventListener('click', sendMessage);
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }

    // Listen for new messages in real time
    db.collection('chat').orderBy('timestamp')
        .onSnapshot(snapshot => {
            chatMessages.innerHTML = '';
            snapshot.forEach(doc => {
                const data = doc.data();
                const newMessage = document.createElement('div');
                newMessage.className = 'message';
                newMessage.innerHTML = `
                    <div class="message-avatar">
                        <img src="${data.avatar || 'https://randomuser.me/api/portraits/men/42.jpg'}" alt="${data.user}">
                    </div>
                    <div class="message-content">
                        <div class="message-header">
                            <h4>${data.user}</h4>
                            <span>${data.timestamp ? new Date(data.timestamp.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</span>
                        </div>
                        <p>${data.message}</p>
                    </div>
                `;
                chatMessages.appendChild(newMessage);
            });
            chatMessages.scrollTop = chatMessages.scrollHeight;
        });
    
    // Switch between chat conversations
    const chatItems = document.querySelectorAll('.chat-item');
    chatItems.forEach(item => {
        item.addEventListener('click', function() {
            chatItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            // Update chat header with selected conversation
            const chatTitle = this.querySelector('h4').textContent;
            const chatPreview = this.querySelector('p').textContent;
            const doctorName = chatPreview.split(':')[0];
            
            document.querySelector('.chat-title h3').textContent = chatTitle;
            document.querySelector('.chat-title p').textContent = doctorName + ' discussion';
            
            // Clear and simulate new messages (in a real app, this would fetch from server)
            chatMessages.innerHTML = '';
            const initialMessages = [
                {
                    doctor: doctorName,
                    img: this.querySelector('img').src,
                    time: '10:30 AM',
                    message: chatPreview
                },
                {
                    doctor: 'You',
                    img: 'https://randomuser.me/api/portraits/women/65.jpg',
                    time: '10:32 AM',
                    message: "I've reviewed the case. What specific concerns do you have?"
                },
                {
                    doctor: doctorName,
                    img: this.querySelector('img').src,
                    time: '10:35 AM',
                    message: "The main issue is the patient's resistance to the standard treatment protocol."
                }
            ];
            
            initialMessages.forEach(msg => {
                const messageDiv = document.createElement('div');
                messageDiv.className = 'message';
                messageDiv.innerHTML = `
                    <div class="message-avatar">
                        <img src="${msg.img}" alt="${msg.doctor}">
                    </div>
                    <div class="message-content">
                        <div class="message-header">
                            <h4>${msg.doctor}</h4>
                            <span>${msg.time}</span>
                        </div>
                        <p>${msg.message}</p>
                    </div>
                `;
                chatMessages.appendChild(messageDiv);
            });
            
            chatMessages.scrollTop = chatMessages.scrollHeight;
        });
    });
    
    // New chat button functionality
    document.querySelector('.btn-new-chat').addEventListener('click', function() {
        alert('In a real application, this would open a modal to start a new discussion with selected doctors.');
    });
    
    // View patient button functionality
    // Modal for patient details
    const patientModal = document.getElementById('patient-modal');
    const closeModal = document.getElementById('close-modal');
    const modalPatientInfo = document.getElementById('modal-patient-info');

    document.querySelectorAll('.btn-view').forEach(button => {
        button.addEventListener('click', function() {
            const row = this.closest('tr');
            const patientId = row.querySelector('td:nth-child(1)').textContent.trim();
            const patientName = row.querySelector('td:nth-child(2)').textContent.trim();
            const patientImg = row.querySelector('td:nth-child(2) img').src;
            const condition = row.querySelector('td:nth-child(3)').textContent.trim();
            const doctor = row.querySelector('td:nth-child(4)').textContent.trim();
            // Always use the current status from the table, not the badge text
            const status = row.querySelector('td:nth-child(5)').textContent.trim();

            // Try to match patient in SAMPLE_PATIENTS for more info
            let foundPatient = null;
            if (window.SAMPLE_PATIENTS) {
                foundPatient = window.SAMPLE_PATIENTS.find(p => `${p.first_name} ${p.last_name}`.toLowerCase() === patientName.toLowerCase());
            }

            // Build medical history and details
            let medHistory = '';
            if (foundPatient) {
                medHistory = `
                    <p><strong>Date of Birth:</strong> ${foundPatient.dob}</p>
                    <p><strong>Gender:</strong> ${foundPatient.gender}</p>
                    <p><strong>Address:</strong> ${foundPatient.address}</p>
                    <p><strong>Phone:</strong> ${foundPatient.phone}</p>
                    <p><strong>Email:</strong> ${foundPatient.email || 'N/A'}</p>
                    <p><strong>Patient Type:</strong> ${foundPatient.patient_type}</p>
                    <p><strong>Admission Date:</strong> ${foundPatient.admission_date}</p>
                    <p><strong>Condition Severity:</strong> ${foundPatient.condition_severity}</p>
                    <p><strong>Medications:</strong> ${foundPatient.medications}</p>
                    <p><strong>Notes:</strong> ${foundPatient.notes}</p>
                    <p><strong>Allergies:</strong> ${foundPatient.allergies || 'None'}</p>
                    <p><strong>Surgeries:</strong> ${foundPatient.surgeries || 'None'}</p>
                    <p><strong>Family History:</strong> ${foundPatient.family_history || 'None'}</p>
                    <p><strong>Emergency Contact:</strong> ${foundPatient.emergency_contact || 'None'}</p>
                `;
            } else {
                medHistory = `<p><em>No additional medical history found.</em></p>`;
            }

            // Populate modal with all info
                        modalPatientInfo.innerHTML = `
                                            <div style="text-align:center; max-height:350px; overflow-y:auto; padding:1rem 1.5rem; background:rgba(245,247,250,0.98); border-radius:16px; box-shadow:0 4px 24px rgba(0,0,0,0.12); font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
                                                <img src="${patientImg}" alt="${patientName}" style="width:70px; height:70px; border-radius:50%; margin-bottom:0.7rem; object-fit:cover; box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                                                <h2 style="margin-bottom:0.3rem; font-size:1.35rem; font-weight:600; color:#166088; letter-spacing:0.5px;">${patientName}</h2>
                                                <div style="margin-bottom:0.7rem;">
                                                    <p style="margin:0.2rem 0; font-size:1rem;"><strong>ID:</strong> <span style='color:#4a6fa5;'>${patientId}</span></p>
                                                    <p style="margin:0.2rem 0; font-size:1rem;"><strong>Condition:</strong> <span style='color:#f44336;'>${condition}</span></p>
                                                    <p style="margin:0.2rem 0; font-size:1rem;"><strong>Doctor:</strong> <span style='color:#166088;'>${doctor}</span></p>
                                                    <p style="margin:0.2rem 0; font-size:1rem;"><strong>Status:</strong> <span class="badge" style='font-size:0.95rem;'>${status}</span></p>
                                                </div>
                                                <hr style="margin:0.7rem 0; border:none; border-top:1px solid #e0e0e0;">
                                                <h3 style="margin:0.5rem 0 0.3rem; font-size:1.08rem; color:#166088; font-weight:500;">Medical History & Details</h3>
                                                <div style="text-align:left; font-size:0.98rem; line-height:1.6; color:#333;">
                                                    ${medHistory}
                                                </div>
                                            </div>
                                        `;
            patientModal.style.display = 'flex';
        });
    });

    closeModal.addEventListener('click', function() {
        patientModal.style.display = 'none';
    });

    // Close modal when clicking outside content
    patientModal.addEventListener('click', function(e) {
        if (e.target === patientModal) {
            patientModal.style.display = 'none';
        }
    });
    
    // Simulate notification click
    // document.querySelector('.notification').addEventListener('click', function() {
    //     alert('You have 3 new notifications:\n1. New lab results for Patient #P-1002\n2. Medication low stock alert\n3. Staff meeting reminder');
    // });
});

