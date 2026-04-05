// ============================================
// VIBE ENGINE - HYBRID SFX CONTROLLER
// ============================================

// 1. THE DIGITAL SYNTHESIZER (Web Audio API)
// This creates mathematical soundwaves on the fly without needing any MP3 files.
const AudioContext = window.AudioContext || window.webkitAudioContext;
let synthContext = null;

function initSynth() {
    if (!synthContext) {
        synthContext = new AudioContext();
    }
    // Resume context if browser suspended it
    if(synthContext.state === 'suspended') {
        synthContext.resume();
    }
}

// Low futuristic mechanical click
function playDigitalClick() {
    initSynth();
    const osc = synthContext.createOscillator();
    const gain = synthContext.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, synthContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, synthContext.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.3, synthContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, synthContext.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(synthContext.destination);
    
    osc.start();
    osc.stop(synthContext.currentTime + 0.1);
}

// Light soft blip for navigation
function playSoftBlip() {
    initSynth();
    const osc = synthContext.createOscillator();
    const gain = synthContext.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, synthContext.currentTime);
    
    gain.gain.setValueAtTime(0.1, synthContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, synthContext.currentTime + 0.05);
    
    osc.connect(gain);
    gain.connect(synthContext.destination);
    
    osc.start();
    osc.stop(synthContext.currentTime + 0.05);
}

// Shimmering success chime
function playSuccessChime() {
    initSynth();
    const osc = synthContext.createOscillator();
    const gain = synthContext.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, synthContext.currentTime);
    osc.frequency.setValueAtTime(1200, synthContext.currentTime + 0.1);
    osc.frequency.setValueAtTime(1600, synthContext.currentTime + 0.2);
    
    gain.gain.setValueAtTime(0.2, synthContext.currentTime);
    gain.gain.linearRampToValueAtTime(0, synthContext.currentTime + 0.5);
    
    osc.connect(gain);
    gain.connect(synthContext.destination);
    
    osc.start();
    osc.stop(synthContext.currentTime + 0.5);
}

// 2. THE MP3 IMPORTER (Media Playback)
// With built-in Single-Instance Cache to absolutely prevent spam/noise overlaps
const activeAudios = {};

function playMP3(src, allowOverlap = false) {
    // If this sound hasn't been played yet, create it and save it to memory
    if (!activeAudios[src]) {
        activeAudios[src] = new Audio(src);
        activeAudios[src].volume = 0.2; // Minimized volume (20% instead of 60%)
    }

    const sfx = activeAudios[src];

    if (allowOverlap) {
        // For standard clicks: Reset timer to 0 so it rapid-fires instantly on every click
        sfx.currentTime = 0;
    } else {
        // Extreme Anti-Spam: If the audio is currently playing, ignore the click entirely!
        if (!sfx.paused && sfx.currentTime > 0 && !sfx.ended) {
            return; // Block spam
        }
    }

    sfx.play().catch(e => {
        console.warn("Missing SFX File. Please upload: " + src);
    });
}


// 3. GLOBAL EVENT MAPPING (MP3 Focused)
// We use event delegation on the document body so it works instantly on every page
document.addEventListener('click', (e) => {
    
    // ------------------------------------
    // HOOK: HEAVY DISCONNECT (Disconnect Button)
    // ------------------------------------
    const logoutBtn = e.target.closest('#btn-logout');
    if (logoutBtn) {
        playMP3('assets/fahhhhhhhhhhhhhh (1).mp3'); 
        return; 
    }

    // ------------------------------------
    // HOOK: SURPRISE ME WARP (Surprise Button)
    // ------------------------------------
    const surpriseBtn = e.target.closest('#btn-surprise');
    if (surpriseBtn) {
        playMP3('assets/perfect-fart.mp3'); 
        return; 
    }

    // ------------------------------------
    // HOOK: SUCCESS ACTIONS (Check-ins, Uploads)
    // ------------------------------------
    const submitBtn = e.target.closest('#btn-submit');
    if (submitBtn) {
        playMP3('assets/apple-pay-sound.mp3'); 
        return; 
    }

    // ------------------------------------
    // HOOK: CHAT & MESSAGING (Send Button)
    // ------------------------------------
    const sendBtn = e.target.closest('#btn-send, #chat-send, [data-lucide="send"]');
    if (sendBtn) {
        playMP3('assets/rizz-sound-effect (1).mp3'); 
        return; 
    }

    // ------------------------------------
    // HOOK: SOCIAL ACTIONS (Like & Bookmark)
    // ------------------------------------
    const likeBtn = e.target.closest('#dt-like-btn, .like-btn, [data-lucide="heart"]');
    if (likeBtn) {
        playMP3('assets/studio-audience-awwww-sound-fx.mp3'); 
        return; 
    }

    // ------------------------------------
    // HOOK: MODAL CONTROLS (Open & Close)
    // ------------------------------------
    const checkinOpenBtn = e.target.closest('#btn-checkin, [data-i18n="btn_checkin"]');
    if (checkinOpenBtn) {
        playMP3('assets/taco-bell-bong.mp3'); 
        return; 
    }

    const closeBtn = e.target.closest('#close-checkin, .close-modal, [data-lucide="x"]');
    if (closeBtn) {
        playMP3('assets/shocking_0NL2w3I.mp3'); 
        return; 
    }


    // ------------------------------------
    // HOOK: GENERIC BUTTON CLICKS (Rapid Fire Allowed)
    // ------------------------------------
    const button = e.target.closest('button, .track-btn, .vibe-filter');
    if (button) {
        // We pass "true" to allowOverlap so the click never delays
        playMP3('assets/mouse-click-sound.mp3', true);
        return;
    }
});