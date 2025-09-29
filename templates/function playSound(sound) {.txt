function playSound(sound) {
    if (isMuted) return;

    // Use Web Audio API for a simple beep/chime/alarm
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();

    // Set frequency and duration based on sound type
    let freq = 440, duration = 0.5;
    if (sound === 'beep' || !sound) {
        freq = 440; duration = 0.3;
    } else if (sound === 'chime') {
        freq = 660; duration = 0.5;
    } else if (sound === 'alarm') {
        freq = 880; duration = 1.0;
    }

    o.type = 'sine';
    o.frequency.value = freq;
    o.connect(g);
    g.connect(ctx.destination);
    g.gain.setValueAtTime(0.2, ctx.currentTime);

    o.start();
    o.stop(ctx.currentTime + duration);

    o.onended = function() {
        ctx.close();
    };
}