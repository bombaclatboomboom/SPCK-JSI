import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// --- CONFIG ---
const firebaseConfig = {
    apiKey: "AIzaSyBImD4KXKJSZ94QqIMjnu54NRHaQu7dvnY",
    authDomain: "jsitest-d2e8e.firebaseapp.com",
    projectId: "jsitest-d2e8e",
    storageBucket: "jsitest-d2e8e.firebasestorage.app",
    messagingSenderId: "879082552061",
    appId: "1:879082552061:web:292f08bbdf316a2bed9c94",
    measurementId: "G-7PN0QFR1SV"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
lucide.createIcons();

// --- ELEMENTS OBJECT (This fixes your Google/Outro error) ---
const els = {
    sceneIntro: document.getElementById("scene-intro"),
    sceneAuth: document.getElementById("scene-auth"),
    sceneOutroAdmin: document.getElementById("scene-outro-admin"),
    sceneOutroGuest: document.getElementById("scene-outro-guest"),
    btnGoogle: document.getElementById("btn-google"),
    introText: document.getElementById("intro-text"),
    logoTrigger: document.getElementById("logo-trigger"),
    progressRing: document.getElementById("progress-ring"),
    adminProgress: document.getElementById("admin-progress"),
    adminPanel: document.getElementById("admin-panel"),
    statusText: document.getElementById("status-text"),
    btnSubmit: document.getElementById("btn-submit"),
    btnText: document.getElementById("btn-text"),
    authForm: document.getElementById("auth-form")
};

// --- VARIABLES ---
let isLogin = true;
let pressTimer;
let isAdminMode = false;
const LONG_PRESS_DURATION = 2000;

// --- 1. THE "DECODE" INTRO EFFECT ---
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*";
let interval = null;

function runDecodeEffect() {
    let iteration = 0;
    const finalValue = els.introText.dataset.value;
    
    // START MUSIC ON DECODE
    if (window.fadeAudioIn) window.fadeAudioIn();

    clearInterval(interval);
    interval = setInterval(() => {
        els.introText.innerText = finalValue
            .split("")
            .map((letter, index) => {
                if(index < iteration) return finalValue[index];
                return letters[Math.floor(Math.random() * 26)];
            })
            .join("");
        
        if(iteration >= finalValue.length){ 
            clearInterval(interval);
            setTimeout(() => {
                els.sceneIntro.style.opacity = "0";
                setTimeout(() => {
                    els.sceneIntro.classList.add("hidden");
                    els.sceneAuth.classList.remove("hidden");
                    void els.sceneAuth.offsetWidth; 
                    els.sceneAuth.style.opacity = "1";
                }, 500);
            }, 1000);
        }
        iteration += 1 / 3;
    }, 30);
}

window.onload = runDecodeEffect;

// --- 2. LONG PRESS LOGIC (ADMIN) ---
const startPress = (e) => {
    els.adminProgress.style.opacity = "1";
    els.progressRing.style.strokeDashoffset = "0";
    
    pressTimer = setTimeout(() => {
        isAdminMode = true;
        els.progressRing.style.stroke = "#10b981";
        els.statusText.innerText = "SYSTEM UNLOCKED";
        els.statusText.classList.add("text-green-500");
        els.adminPanel.style.height = "60px";
        els.logoTrigger.classList.add("animate-pulse");
    }, LONG_PRESS_DURATION);
};

const cancelPress = () => {
    clearTimeout(pressTimer);
    if(!isAdminMode) {
        els.progressRing.style.transition = "none";
        els.progressRing.style.strokeDashoffset = "289";
        els.adminProgress.style.opacity = "0";
        setTimeout(() => {
            els.progressRing.style.transition = "all 2s linear";
        }, 10);
    }
};

els.logoTrigger.addEventListener("mousedown", startPress);
els.logoTrigger.addEventListener("touchstart", startPress);
els.logoTrigger.addEventListener("mouseup", cancelPress);
els.logoTrigger.addEventListener("mouseleave", cancelPress);
els.logoTrigger.addEventListener("touchend", cancelPress);

// --- 3. TOGGLE FORMS ---
const btnToggle = document.getElementById("btn-toggle");
const fieldName = document.getElementById("field-name");

btnToggle.addEventListener("click", (e) => {
    e.preventDefault();
    isLogin = !isLogin;
    
    if(!isLogin) {
        fieldName.classList.remove("hidden");
        els.btnText.innerText = "Create Account";
        document.getElementById("toggle-text").innerText = "Already have an ID?";
        btnToggle.innerText = "Sign In";
        els.statusText.innerText = "HOLD TO UNLOCK SYSTEM";
    } else {
        fieldName.classList.add("hidden");
        els.btnText.innerText = "Connect";
        document.getElementById("toggle-text").innerText = "First time?";
        btnToggle.innerText = "Create ID";
        els.adminPanel.style.height = "0";
        isAdminMode = false;
        els.statusText.innerText = "";
    }
});

// --- 4. SUBMIT LOGIC ---
els.authForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("input-email").value;
    const password = document.getElementById("input-password").value;
    const name = document.getElementById("input-name").value;
    const adminCode = document.getElementById("input-admin-code").value;
    
    els.btnText.innerText = "Verifying...";
    
    try {
        let role = "guest";
        let user;

        // Custom Root Key
        if (isAdminMode && adminCode === "chicken") role = "admin";

        if (isLogin) {
            const res = await signInWithEmailAndPassword(auth, email, password);
            user = res.user;
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if(userDoc.exists()) role = userDoc.data().role;
            
            // Upgrade existing user to Admin if they use the manual override key during sign-in
            if (isAdminMode && adminCode === "chicken" && role !== "admin") {
                role = "admin";
                await setDoc(doc(db, "users", user.uid), { role: "admin" }, { merge: true });
            }
        } else {
            const res = await createUserWithEmailAndPassword(auth, email, password);
            user = res.user;
            await updateProfile(user, { displayName: name });
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                name: name,
                email: email,
                role: role,
                createdAt: new Date().toISOString()
            });
        }

        triggerOutro(role);

    } catch (err) {
        alert(err.message);
        els.btnText.innerText = isLogin ? "Connect" : "Create Account";
    }
});

// --- 5. GOOGLE AUTH ---
els.btnGoogle.addEventListener('click', async () => {
    console.log("Google Button Clicked..."); 
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        
        const userDoc = await getDoc(doc(db, "users", user.uid));
        let role = "guest";
        
        if (!userDoc.exists()) {
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                name: user.displayName,
                email: user.email,
                role: "guest",
                createdAt: new Date().toISOString()
            });
        } else {
            role = userDoc.data().role;
        }

        triggerOutro(role);

    } catch (error) {
        console.error("FULL ERROR OBJECT:", error); 
        alert("Google Sign In Failed: " + error.message);
    }
});

// --- 6. OUTRO SEQUENCE ---
function triggerOutro(role) {
    // Fade out current card
    els.sceneAuth.style.opacity = "0";
    els.sceneAuth.style.transform = "scale(0.9)";

    setTimeout(() => {
        els.sceneAuth.classList.add('hidden');
        
        if (role === 'admin') {
            els.sceneOutroAdmin.classList.remove('hidden');
            // Redirect Admin
            setTimeout(() => window.location.href = 'admin-dashboard.html', 4000);
        } else {
            els.sceneOutroGuest.classList.remove('hidden');
            // Redirect Guest
            setTimeout(() => window.location.href = 'home.html', 3000);
        }
    }, 500);
}