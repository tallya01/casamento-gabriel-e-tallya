function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    const nav = navLinks.parentElement;
    nav.classList.toggle('menu-active');
    navLinks.classList.toggle('active');
}

function closeMenu() {
    const navLinks = document.getElementById('navLinks');
    const nav = navLinks.parentElement;
    nav.classList.remove('menu-active');
    navLinks.classList.remove('active');
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});