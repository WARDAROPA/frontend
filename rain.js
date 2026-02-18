function createFallingLogo() {
  const logo = document.createElement('img');
  logo.src = 'logo.png';
  logo.className = 'falling-logo';
  
  const startPositionX = Math.random() * window.innerWidth;
  const duration = 3 + Math.random() * 4;
  const delay = Math.random() * 5;
  const size = 30 + Math.random() * 30;
  
  logo.style.left = startPositionX + 'px';
  logo.style.width = size + 'px';
  logo.style.height = size + 'px';
  logo.style.animationDuration = duration + 's';
  logo.style.animationDelay = delay + 's';
  
  document.getElementById('logo-rain').appendChild(logo);
  
  setTimeout(() => {
    logo.remove();
    createFallingLogo();
  }, (duration + delay) * 1000);
}

function initLogoRain() {
  const numberOfLogos = 20;
  
  for (let i = 0; i < numberOfLogos; i++) {
    setTimeout(() => {
      createFallingLogo();
    }, i * 300);
  }
}

window.addEventListener('load', initLogoRain);
