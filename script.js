// Particle Background Effect
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
const particleCount = 100;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 0.5;
        this.color = Math.random() > 0.5 ? '#00f3ff' : '#9d00ff';
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;

        // Add glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;

        ctx.fill();
        ctx.shadowBlur = 0; // Reset
    }
}

function initParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
        p.update();
        p.draw();
    });

    // Draw lines between close particles
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 100) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(0, 243, 255, ${0.2 - dist / 500})`;
                ctx.lineWidth = 0.5;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }

    requestAnimationFrame(animateParticles);
}

// Initial Setup
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
initParticles();
animateParticles();

// Scroll Animation with Intersection Observer
const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
        }
    });
}, observerOptions);

// Select elements to animate and set initial state
document.querySelectorAll('.feature-card, .service-item, .project-card, .store-item').forEach(el => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = "all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
    observer.observe(el);
});


// Mobile menu toggle (simple version)
const mobileBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

mobileBtn.addEventListener('click', () => {
    if (navLinks.style.display === 'flex') {
        navLinks.style.display = 'none';
    } else {
        navLinks.style.display = 'flex';
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '100%';
        navLinks.style.left = '0';
        navLinks.style.width = '100%';
        navLinks.style.background = 'var(--bg-glass)';
        navLinks.style.backdropFilter = 'blur(12px)';
        navLinks.style.padding = '1rem';
        navLinks.style.borderRadius = '16px';
        navLinks.style.border = '1px solid var(--border-glass)';
    }
});

// Custom Cursor Animation
const cursorDot = document.querySelector('[data-cursor-dot]');
const cursorOutline = document.querySelector('[data-cursor-outline]');

// Check if device supports hover (ignores touch screens)
if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    let cursorX = window.innerWidth / 2;
    let cursorY = window.innerHeight / 2;
    let outlineX = window.innerWidth / 2;
    let outlineY = window.innerHeight / 2;

    window.addEventListener('mousemove', (e) => {
        cursorX = e.clientX;
        cursorY = e.clientY;

        // Immediate dot update
        cursorDot.style.left = `${cursorX}px`;
        cursorDot.style.top = `${cursorY}px`;
    });

    // Smooth outline delay
    function animateCursor() {
        let ease = 0.15;
        outlineX += (cursorX - outlineX) * ease;
        outlineY += (cursorY - outlineY) * ease;

        cursorOutline.style.left = `${outlineX}px`;
        cursorOutline.style.top = `${outlineY}px`;

        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover effect on interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .btn, .hover-glow, .gallery-item, .video-container, .project-card, input, textarea, select, .store-item, .play-overlay');

    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorDot.classList.add('hover');
            cursorOutline.classList.add('hover');
        });
        el.addEventListener('mouseleave', () => {
            cursorDot.classList.remove('hover');
            cursorOutline.classList.remove('hover');
        });
    });
} else {
    // Hide custom cursor on mobile/touch devices
    cursorDot.style.display = 'none';
    cursorOutline.style.display = 'none';
}

// =============================================
// Beatport Player Logic (L MAYO)
// =============================================
function initBeatportPlayer() {
    const playlist = [
        { name: "1. 01.1", file: "assets/music/01.1.wav" },
        { name: "2. 01", file: "assets/music/01.wav" },
        { name: "3. Candy Factori B min", file: "assets/music/candy factori b min.wav" },
        { name: "4. Candy Factori", file: "assets/music/candy factori.wav" },
        { name: "5. COME ON ! L MAYO FT BABEEE", file: "assets/music/COME ON ! L MAYO FT BABEEE.wav" },
        { name: "6. FEID - NOS DESCONOXIMOS REMIX (L MAYO)", file: "assets/music/FEID - NOS DESCONOXIMOS REMIX (L MAYO).wav" },
        { name: "7. SINCORTECHNO 1", file: "assets/music/SINCORTECHNO 1.wav" },
        { name: "8. SINCORTECHNO 2", file: "assets/music/SINCORTECHNO 2.wav" },
        { name: "9. SINCORTECHNO 3", file: "assets/music/SINCORTECHNO 3.wav" },
        { name: "10. SINCORTECHNO 4", file: "assets/music/SINCORTECHNO 4.wav" }
    ];

    const audio = new Audio();
    // Allow background playing for premium look
    let currentIdx = 0;
    
    const playBtn = document.getElementById("play-pause-btn");
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");
    const trackTitle = document.getElementById("current-track-title");
    const playlistUl = document.getElementById("playlist-ul");
    const progressBar = document.getElementById("progress-bar");
    const progressThumb = document.querySelector(".progress-thumb");
    const curTimeSpan = document.getElementById("current-time");
    const durTimeSpan = document.getElementById("duration-time");
    const playingBars = document.getElementById("playing-bars");

    if(!playBtn || !playlistUl) return;

    // Build Playlist DOM
    playlist.forEach((track, i) => {
        const li = document.createElement("li");
        li.className = "playlist-item" + (i === 0 ? " playing" : "");
        li.innerHTML = `
            <span class="p-name">` + track.name + `</span>
            <div class="reaction-btns">
                <button class="react-btn" title="Like"><i class="fas fa-heart"></i> <span class="vc">0</span></button>
                <button class="react-btn" title="Fire"><i class="fas fa-fire"></i> <span class="vc">0</span></button>
            </div>
        `;
        li.querySelector(".p-name").addEventListener("click", () => {
            loadTrack(i);
            playTrack();
        });
        
        // Reaction logic
        li.querySelectorAll(".react-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                btn.classList.toggle("liked");
                let vcSpan = btn.querySelector(".vc");
                let vc = parseInt(vcSpan.innerText);
                vcSpan.innerText = btn.classList.contains("liked") ? vc + 1 : vc - 1;
            });
        });

        playlistUl.appendChild(li);
    });

    const loadTrack = (index) => {
        currentIdx = index;
        audio.src = playlist[currentIdx].file;
        trackTitle.innerText = playlist[currentIdx].name;
        
        // update UI classes
        const items = playlistUl.querySelectorAll(".playlist-item");
        items.forEach((item, i) => {
            if(i === index) item.classList.add("playing");
            else item.classList.remove("playing");
        });
    };

    const playTrack = () => {
        let promise = audio.play();
        if (promise !== undefined) {
          promise.then(_ => {
            playBtn.innerHTML = "<i class=\"fas fa-pause\"></i>";
            playingBars.classList.add("active");
          }).catch(error => {
            console.log("Auto-play prevented", error);
          });
        }
    };

    const pauseTrack = () => {
        audio.pause();
        playBtn.innerHTML = "<i class=\"fas fa-play\"></i>";
        playingBars.classList.remove("active");
    };

    playBtn.addEventListener("click", () => {
        if(audio.src === "" || audio.src.endsWith("/")) {
            loadTrack(0);
        }
        if(audio.paused) playTrack();
        else pauseTrack();
    });

    prevBtn.addEventListener("click", () => {
        let nIdx = currentIdx - 1;
        if(nIdx < 0) nIdx = playlist.length - 1;
        loadTrack(nIdx);
        playTrack();
    });

    nextBtn.addEventListener("click", () => {
        let nIdx = currentIdx + 1;
        if(nIdx >= playlist.length) nIdx = 0;
        loadTrack(nIdx);
        playTrack();
    });

    // Time Formatting
    const formatTime = (timeInSecs) => {
        if(isNaN(timeInSecs)) return "0:00";
        let min = Math.floor(timeInSecs / 60);
        let sec = Math.floor(timeInSecs % 60);
        if(sec < 10) sec = "0" + sec;
        return min + ":" + sec;
    };

    audio.addEventListener("timeupdate", () => {
        curTimeSpan.innerText = formatTime(audio.currentTime);
        let progress = (audio.currentTime / audio.duration) * 100;
        if(isNaN(progress)) progress = 0;
        progressThumb.style.width = progress + "%";
    });

    audio.addEventListener("loadeddata", () => {
        durTimeSpan.innerText = formatTime(audio.duration);
    });

    audio.addEventListener("ended", () => {
        nextBtn.click();
    });

    // Seek
    progressBar.addEventListener("click", (e) => {
        const rect = progressBar.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        audio.currentTime = pos * audio.duration;
    });

    loadTrack(0);
}

// =============================================
// Comments Form Submissions
// =============================================
function initComments() {
    const form = document.getElementById("comment-form");
    const wall = document.getElementById("comments-list");
    
    if(!form || !wall) return;
    
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("comment-name").value;
        const text = document.getElementById("comment-text").value;
        
        const newDiv = document.createElement("div");
        newDiv.className = "comment-item";
        newDiv.innerHTML = `
            <div class="comment-avatar" style="background:#ff2a54;"><i class="fas fa-headphones"></i></div>
            <div class="comment-content">
                <h5>` + name + ` <span class="comment-time">Hace un momento</span></h5>
                <p>` + text + `</p>
            </div>
        `;
        
        wall.insertBefore(newDiv, wall.firstChild);
        form.reset();
        
        // Scroll to top of wall
        wall.parentElement.scrollTop = 0;
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initBeatportPlayer();
    initComments();
});

// =============================================
// Booking Form WhatsApp Submission
// =============================================
function sendBookingToWhatsApp(event) {
    event.preventDefault();
    const name = document.getElementById("book-name").value;
    const eventType = document.getElementById("book-event").value;
    const date = document.getElementById("book-date").value;
    const city = document.getElementById("book-city").value;
    const message = document.getElementById("book-message").value;

    const text = `Hola L MAYO, me gustaría hacer una reserva para un evento.
*Nombre:* ${name}
*Tipo de Evento:* ${eventType}
*Fecha:* ${date}
*Ciudad/País:* ${city}
*Mensaje Adicional:* ${message ? message : 'N/A'}`;

    const phoneNumber = "573022780781";
    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedText}`;
    
    window.open(whatsappUrl, "_blank");
}

