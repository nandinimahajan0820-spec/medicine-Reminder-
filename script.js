

// State Management
let reminders = JSON.parse(localStorage.getItem('reminders')) || [];
const alarmSound = document.getElementById('alarm-sound');
const modal = document.getElementById('alarm-modal');

// Page Navigation Logic
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    if(pageId === 'list') renderReminders();
    if(pageId === 'home') updateDashboard();
}

// Form Submission
document.getElementById('medicine-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newReminder = {
        id: Date.now(),
        name: document.getElementById('med-name').value,
        dosage: document.getElementById('med-dosage').value,
        time: document.getElementById('med-time').value,
        triggered: false
    };

    reminders.push(newReminder);
    saveData();
    e.target.reset();
    showPage('list');
});

// Render Reminders List
function renderReminders() {
    const container = document.getElementById('reminder-container');
    container.innerHTML = reminders.length === 0 ? '<p>No reminders set yet.</p>' : '';
    
    reminders.sort((a, b) => a.time.localeCompare(b.time)).forEach(rem => {
        const div = document.createElement('div');
        div.className = 'reminder-item';
        div.innerHTML = `
            <div>
                <strong>${rem.name}</strong><br>
                <small>${rem.dosage} at ${rem.time}</small>
            </div>
            <button class="btn-delete" onclick="deleteReminder(${rem.id})"><i class="fas fa-trash"></i></button>
        `;
        container.appendChild(div);
    });
}

// Dashboard Stats
function updateDashboard() {
    document.getElementById('pending-count').innerText = reminders.length;
    const next = reminders.find(r => !r.triggered); // Simplified logic
    const card = document.getElementById('next-reminder-card');
    if (next) {
        card.innerHTML = `<strong>${next.name}</strong> in ${next.time}`;
    }
}

// Delete Logic
function deleteReminder(id) {
    reminders = reminders.filter(r => r.id !== id);
    saveData();
    renderReminders();
    updateDashboard();
}

function saveData() {
    localStorage.setItem('reminders', JSON.stringify(reminders));
}

// ALARM SYSTEM: The Heartbeat
setInterval(() => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    reminders.forEach(rem => {
        if (rem.time === currentTime && !rem.triggered) {
            triggerAlarm(rem);
        }
    });
}, 1000);

function triggerAlarm(medicine) {
    medicine.triggered = true; // Prevents double firing
    document.getElementById('alarm-med-details').innerText = `${medicine.name} - ${medicine.dosage}`;
    modal.style.display = 'flex';
    alarmSound.play().catch(e => console.log("User interaction required for audio"));
}

document.getElementById('stop-alarm').onclick = () => {
    alarmSound.pause();
    alarmSound.currentTime = 0;
    modal.style.display = 'none';
    saveData();
};

// Reset triggers at midnight
if (localStorage.getItem('last_reset') !== new Date().toLocaleDateString()) {
    reminders.forEach(r => r.triggered = false);
    localStorage.setItem('last_reset', new Date().toLocaleDateString());
    saveData();
}

// Init
updateDashboard();