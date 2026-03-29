// --- ELITE AUDIO CONTROLLER ---
const audio = document.getElementById('bg-music');

// Initial state
if (audio) {
    audio.volume = 0;
}

// 1. Function to handle the fade-in (Cinematic feel)
export function fadeAudioIn() {
    if (!audio) return;
    
    audio.play().then(() => {
        let vol = 0;
        const fade = setInterval(() => {
            if (vol < 0.4) { // Max volume 40% (good for background)
                vol += 0.02;
                audio.volume = vol;
            } else {
                clearInterval(fade);
            }
        }, 150);
    }).catch(e => {
        console.log("Autoplay blocked. Waiting for user interaction...");
    });
}

// 2. Global trigger for scene transitions (The "Ascension" effect)
window.triggerAscension = function() {
    if (!audio) return;
    let vol = audio.volume;
    const swell = setInterval(() => {
        if(vol < 0.8) { 
            vol += 0.05; 
            audio.volume = Math.min(vol, 1.0); 
        } else { 
            clearInterval(swell); 
        }
    }, 100);
};

// 3. EVENT: Start music on the very first click anywhere on the page
// This bypasses browser security
document.addEventListener('click', () => {
    if (audio && audio.paused) {
        fadeAudioIn();
    }
}, { once: true });

// 4. EVENT: If they press the Connect button, swell the music
const connectBtn = document.getElementById('btn-submit');
if (connectBtn) {
    connectBtn.addEventListener('click', () => {
        window.triggerAscension();
    });
}