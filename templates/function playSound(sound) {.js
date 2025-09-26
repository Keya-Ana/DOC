function playSound(sound) {
    if (isMuted) return;
    let audio;
    if (sound === 'beep' || !sound) {
        audio = new Audio('/static/beep.mp3');
    } else if (sound === 'chime') {
        audio = new Audio('/static/chime.mp3');
    } else if (sound === 'alarm') {
        audio = new Audio('/static/alarm.mp3');
    }
    if (audio) {
        currentAudio = audio;
        audio.play().catch(err => {
            alert("Unable to play sound. Please interact with the page first (e.g., click Test Sound).");
            console.error("Audio playback error:", err);
        });
    }
}