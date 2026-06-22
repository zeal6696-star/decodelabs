document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Mobile Hamburger Menu Interaction
    const menuToggle = document.getElementById('menuToggle');
    const navContainer = document.getElementById('navContainer');

    if (menuToggle && navContainer) {
        menuToggle.addEventListener('click', () => {
            navContainer.classList.toggle('active');
        });
    }

    // 2. Click to Interact Button Logic
    const actionBtn = document.getElementById('actionBtn');
    const stateText = document.getElementById('stateText');
    
    let isActive = false;

    if (actionBtn && stateText) {
        actionBtn.addEventListener('click', () => {
            isActive = !isActive;
            
            if (isActive) {
                stateText.innerText = "Processing";
                stateText.style.backgroundColor = "#A5856F"; // Mocha Mousse Active State
                stateText.style.color = "#FFFFFF";
                actionBtn.innerText = "Reset State";
            } else {
                stateText.innerText = "Idle";
                stateText.style.backgroundColor = "#A0D4E0"; // Ethereal Blue Idle State
                stateText.style.color = "#2C2A29";
                actionBtn.innerText = "Click to Interact";
            }
        });
    }

    // 3. Dynamic Active Navigation Link Highlighting on Scroll/Click
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navLinks.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Mobile Menu auto collapse after picking section
            if (window.innerWidth < 768) {
                navContainer.classList.remove('active');
            }
        });
    });
});