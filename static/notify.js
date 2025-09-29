document.addEventListener('DOMContentLoaded', function() {
    // --- Reminder Data ---
    let reminders = [];

    let isMuted = false;
    let currentAudio = null;

    // --- Show/Hide Interval Fields ---
    function showIntervalFields() {
        const interval = document.getElementById('interval').value;
        document.getElementById('hours-interval-group').style.display = interval === 'hours' ? 'block' : 'none';
        document.getElementById('days-of-week-group').style.display = interval === 'days' ? 'block' : 'none';
        document.getElementById('custom-interval-group').style.display = interval === 'custom' ? 'block' : 'none';
    }
    document.getElementById('interval').addEventListener('change', showIntervalFields);

    // --- Add Reminder ---
    document.getElementById('reminder-form').addEventListener('submit', function(e) {
        e.preventDefault();

        const patientName = document.getElementById('patient-name').value;
        const medication = document.getElementById('medication').value;
        const interval = document.getElementById('interval').value;
        const reminderTime = document.getElementById('reminder-time').value;
        const dosage = document.getElementById('dosage').value;
        const sound = document.getElementById('sound-select').value;

        let hoursInterval = null;
        let daysOfWeek = [];
        let customDate = null;
        let customTime = null;

        if (interval === 'hours') {
            hoursInterval = parseInt(document.getElementById('hours-interval').value, 10);
        }
        if (interval === 'days') {
            document.querySelectorAll('input[name="days"]:checked').forEach(cb => {
                daysOfWeek.push(cb.value);
            });
        }
        if (interval === 'custom') {
            customDate = document.getElementById('custom-date').value;
            customTime = document.getElementById('custom-time').value;
        }

        const reminder = {
            patientName,
            medication,
            interval,
            reminderTime,
            dosage,
            sound,
            hoursInterval,
            daysOfWeek,
            customDate,
            customTime,
            lastTriggered: null
        };

        reminders.push(reminder);
        renderReminders();
        this.reset();
        showIntervalFields();
    });

    // --- Render Reminders ---
    function renderReminders() {
        const list = document.getElementById('reminders-list');
        list.innerHTML = '';
        reminders.forEach((reminder, idx) => {
            let intervalInfo = '';
            if (reminder.interval === 'hours') {
                intervalInfo = `<span class="label">Every ${reminder.hoursInterval} hour(s)</span>`;
            } else if (reminder.interval === 'days') {
                intervalInfo = `<span class="label">On: ${reminder.daysOfWeek.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')}</span>`;
            } else if (reminder.interval === 'custom') {
                intervalInfo = `<span class="label">At: ${reminder.customDate} ${reminder.customTime}</span>`;
            } else {
                intervalInfo = `<span class="label">No Repeat</span>`;
            }

            const reminderDiv = document.createElement('div');
            reminderDiv.className = 'reminder-item';
            reminderDiv.innerHTML = `
                <strong>${reminder.patientName}</strong>
                <div class="interval-info">${intervalInfo}</div>
                <div><span class="label">Medication:</span> ${reminder.medication}</div>
                <div><span class="label">Dosage:</span> ${reminder.dosage}</div>
                <div><span class="label">Time:</span> ${reminder.reminderTime}</div>
                <div class="sound-info"><span class="label">Sound:</span> ${reminder.sound}</div>
                <button class="delete-reminder-btn" data-idx="${idx}"><i class="fas fa-trash"></i> Delete</button>
            `;
            list.appendChild(reminderDiv);
        });

        // Add delete event listeners
        document.querySelectorAll('.delete-reminder-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.getAttribute('data-idx'), 10);
                reminders.splice(idx, 1);
                renderReminders();
            });
        });
    }

    // --- Notification Logic ---
    function checkReminders() {
        const now = new Date();
        const nowTime = now.toTimeString().slice(0,5);

        reminders.forEach(reminder => {
            let shouldTrigger = false;

            if (reminder.interval === 'hours' && reminder.hoursInterval) {
                if (!reminder.lastTriggered) {
                    if (nowTime === reminder.reminderTime) {
                        shouldTrigger = true;
                    }
                } else {
                    const last = new Date(reminder.lastTriggered);
                    const diffMs = now - last;
                    const diffHours = diffMs / (1000 * 60 * 60);
                    if (diffHours >= reminder.hoursInterval && nowTime === reminder.reminderTime) {
                        shouldTrigger = true;
                    }
                }
            } else if (reminder.interval === 'days' && reminder.daysOfWeek.length > 0) {
                const today = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                if (reminder.daysOfWeek.includes(today) && nowTime === reminder.reminderTime) {
                    if (!reminder.lastTriggered || new Date(reminder.lastTriggered).toDateString() !== now.toDateString()) {
                        shouldTrigger = true;
                    }
                }
            } else if (reminder.interval === 'custom' && reminder.customDate && reminder.customTime) {
                const customDateTime = new Date(`${reminder.customDate}T${reminder.customTime}`);
                if (
                    now.getFullYear() === customDateTime.getFullYear() &&
                    now.getMonth() === customDateTime.getMonth() &&
                    now.getDate() === customDateTime.getDate() &&
                    nowTime === reminder.customTime &&
                    !reminder.lastTriggered
                ) {
                    shouldTrigger = true;
                }
            } else if (reminder.interval === 'none') {
                if (nowTime === reminder.reminderTime && !reminder.lastTriggered) {
                    shouldTrigger = true;
                }
            }

            if (shouldTrigger) {
                triggerNotification(reminder);
                reminder.lastTriggered = now.toISOString();
            }
        });
    }

    // --- Notification Modal & Sound ---
    function triggerNotification(reminder) {
        const modal = document.getElementById('notification-modal');
        const content = document.getElementById('notification-content');
        content.innerHTML = `
            <strong>${reminder.patientName}</strong> - ${reminder.medication}<br>
            Dosage: ${reminder.dosage}<br>
            Time: ${reminder.reminderTime}<br>
            Interval: ${reminder.interval}<br>
            Sound: ${reminder.sound}
        `;
        modal.style.display = 'block';
        playSound(reminder.sound);
    }

    // --- Sound Logic ---
    function playSound(sound) {
        if (isMuted) return;
        let audio;
        if (sound === 'beep' || !sound) {
            audio = new Audio('/static/beep.wav');
        } else if (sound === 'chime') {
            audio = new Audio('/static/chime.wav');
        } else if (sound === 'alarm') {
            audio = new Audio('/static/alarm.wav');
        }
        if (audio) {
            currentAudio = audio;
            audio.play().catch(err => {
                alert("Unable to play sound. Please interact with the page first (e.g., click Test Sound).");
                console.error("Audio playback error:", err);
            });
        }
    }

    function stopSound() {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            currentAudio = null;
        }
    }

    // --- Modal Controls ---
    document.querySelector('.close-modal').onclick = function() {
        document.getElementById('notification-modal').style.display = 'none';
        stopSound();
    };
    document.getElementById('dismiss-btn').onclick = function() {
        document.getElementById('notification-modal').style.display = 'none';
        stopSound();
    };
    document.getElementById('snooze-btn').onclick = function() {
        setTimeout(() => {
            document.getElementById('notification-modal').style.display = 'block';
            playSound(document.getElementById('sound-select').value);
        }, 5 * 60 * 1000);
        document.getElementById('notification-modal').style.display = 'none';
        stopSound();
    };
    document.querySelectorAll('.sound-test-btn').forEach(btn => {
        btn.onclick = function() {
            // Try to get the selected sound from the closest form or modal
            let soundSelect = btn.closest('form') 
                ? btn.closest('form').querySelector('#sound-select')
                : document.getElementById('sound-select');
            let sound = soundSelect ? soundSelect.value : 'beep';
            playSound(sound);
        };
    });
    document.getElementById('sound-mute-btn').onclick = function() {
        isMuted = !isMuted;
        this.textContent = isMuted ? "Unmute" : "Mute";
        stopSound();
    };

    // --- Search Reminders ---
    document.getElementById('search-input').addEventListener('input', function() {
        const query = this.value.toLowerCase();
        const filtered = reminders.filter(r =>
            r.patientName.toLowerCase().includes(query) ||
            r.medication.toLowerCase().includes(query)
        );
        const list = document.getElementById('reminders-list');
        list.innerHTML = '';
        filtered.forEach((reminder, idx) => {
            let intervalInfo = '';
            if (reminder.interval === 'hours') {
                intervalInfo = `<span class="label">Every ${reminder.hoursInterval} hour(s)</span>`;
            } else if (reminder.interval === 'days') {
                intervalInfo = `<span class="label">On: ${reminder.daysOfWeek.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')}</span>`;
            } else if (reminder.interval === 'custom') {
                intervalInfo = `<span class="label">At: ${reminder.customDate} ${reminder.customTime}</span>`;
            } else {
                intervalInfo = `<span class="label">No Repeat</span>`;
            }

            const reminderDiv = document.createElement('div');
            reminderDiv.className = 'reminder-item';
            reminderDiv.innerHTML = `
                <strong>${reminder.patientName}</strong>
                <div class="interval-info">${intervalInfo}</div>
                <div><span class="label">Medication:</span> ${reminder.medication}</div>
                <div><span class="label">Dosage:</span> ${reminder.dosage}</div>
                <div><span class="label">Time:</span> ${reminder.reminderTime}</div>
                <div class="sound-info"><span class="label">Sound:</span> ${reminder.sound}</div>
                <button class="delete-reminder-btn" data-idx="${reminders.indexOf(reminder)}"><i class="fas fa-trash"></i> Delete</button>
            `;
            list.appendChild(reminderDiv);
        });

        // Add delete event listeners for filtered list
        document.querySelectorAll('.delete-reminder-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.getAttribute('data-idx'), 10);
                reminders.splice(idx, 1);
                renderReminders();
            });
        });
    });

    // --- Start Reminder Check ---
    setInterval(checkReminders, 60000);
    showIntervalFields();
    renderReminders();
});