// GSAP is loaded globally via CDN or Vite in production
// If using Vite and imports, uncomment below:
// import { gsap } from 'gsap';
// import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Canvas Frame-By-Frame Animation Setup
const canvas = document.getElementById('hero-canvas');
const context = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  render(); // Re-render the canvas on resize
});

const frameCount = 192;
const currentFrame = index => (
  `./animation-pics/ffout${(index + 1).toString().padStart(3, '0')}.gif`
);

// We will store Image objects here
const images = [];
const frameInfo = { frame: 0 };

// Preload the first image 
const firstImage = new Image();
firstImage.onload = () => {
  // Render once the first image is fully loaded
  render();
};
firstImage.src = currentFrame(0);
images[0] = firstImage; // Assign explicitly to index 0

// Queue the rest of the images
for (let i = 1; i < frameCount; i++) {
  const img = new Image();
  img.src = currentFrame(i);
  images[i] = img; // Explicitly assign using index `i`!
}

// Setup the ScrollTrigger for Image Scrabbing
// Note: we pin the parent of the canvas using CSS (sticky inside a 300vh #hero section).
gsap.to(frameInfo, {
  frame: frameCount - 1,
  snap: "frame",
  ease: "none", // Prevent acceleration/deceleration on scrubbing
  scrollTrigger: {
    trigger: "#hero",
    start: "top top",
    end: "bottom bottom",
    scrub: 1.5, // 1.5s smoothing effect on scrub
  },
  onUpdate: render
});

/**
 * Calculates responsive object-cover boundaries and draws the image.
 */
function render() {
  const img = images[Math.round(frameInfo.frame)];
  if (img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
    const canvasRatio = canvas.width / canvas.height;
    const imgRatio = img.naturalWidth / img.naturalHeight;

    let drawWidth, drawHeight, offsetX, offsetY;

    if (canvasRatio > imgRatio) {
      drawWidth = canvas.width;
      drawHeight = canvas.width / imgRatio;
      offsetX = 0;
      offsetY = (canvas.height - drawHeight) / 2;
    } else {
      drawHeight = canvas.height;
      drawWidth = canvas.height * imgRatio;
      offsetY = 0;
      offsetX = (canvas.width - drawWidth) / 2;
    }

    // Clear canvas
    context.fillStyle = '#050505';
    context.fillRect(0, 0, canvas.width, canvas.height);
    // Draw current frame covering whole space
    context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  }
}

// -----------------------------------------------------
// Additional UI Animations
// -----------------------------------------------------

// Fade in and out Scrollytelling Text blocks dynamically on scroll
gsap.utils.toArray('.scrolly-text').forEach((text) => {
  gsap.fromTo(text,
    { opacity: 0, y: 50 },
    {
      scrollTrigger: {
        trigger: text,
        start: "top 80%",
        end: "bottom 15%",
        toggleActions: "play reverse play reverse",
      },
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power3.out"
    }
  );
});

// Fade in Section Headers on scroll
gsap.utils.toArray('.section-header').forEach((el) => {
  gsap.to(el, {
    scrollTrigger: {
      trigger: el,
      start: "top 80%",
    },
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: "power3.out",
  });
});

// Staggered Fade in for Product Cards
gsap.utils.toArray('.product-card').forEach((card, i) => {
  gsap.to(card, {
    scrollTrigger: {
      trigger: "#products",
      start: "top 75%",
    },
    opacity: 1,
    y: 0,
    duration: 1,
    ease: "power3.out",
    delay: i * 0.2
  });
});

// Numeric Stat Counters
const counters = document.querySelectorAll('.counter');
ScrollTrigger.create({
  trigger: "#stats-container",
  start: "top 85%",
  onEnter: () => {
    counters.forEach(counter => {
      const target = +counter.getAttribute('data-target');
      const countObj = { val: 0 };
      gsap.to(countObj, {
        val: target,
        duration: 2.5,
        ease: "power3.out",
        onUpdate: function () {
          // Update and format with commas
          counter.innerHTML = Math.round(countObj.val).toLocaleString();
        }
      });
    });
  },
  once: true // Only animate the counters once per page load
});
