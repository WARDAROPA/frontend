let ws;
let currentUser = null;

function showLogin() {
  document.getElementById('auth-container').innerHTML = `
    <h2>Iniciar Sesión</h2>
    <form id="login-form">
      <input type="text" id="login-username" placeholder="Usuario" required>
      <input type="password" id="login-password" placeholder="Contraseña" required>
      <button type="submit">Entrar</button>
      <p class="switch-link">¿No tienes cuenta? <a href="#" onclick="showRegister(); return false;">Regístrate</a></p>
    </form>
    <div id="message"></div>
  `;
  
  document.getElementById('login-form').addEventListener('submit', handleLogin);
}

function showRegister() {
  document.getElementById('auth-container').innerHTML = `
    <h2>Crear Cuenta</h2>
    <form id="register-form">
      <input type="text" id="register-username" placeholder="Usuario" required>
      <input type="email" id="register-email" placeholder="Email" required>
      <input type="password" id="register-password" placeholder="Contraseña" required>
      <button type="submit">Registrarse</button>
      <p class="switch-link">¿Ya tienes cuenta? <a href="#" onclick="showLogin(); return false;">Inicia sesión</a></p>
    </form>
    <div id="message"></div>
  `;
  
  document.getElementById('register-form').addEventListener('submit', handleRegister);
}

async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  
  try {
    const response = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      currentUser = data.user;
      showMessage('¡Bienvenido ' + data.user.username + '!', 'success');
      setTimeout(() => showMainApp(), 1500);
    } else {
      showMessage(data.error, 'error');
    }
  } catch (error) {
    showMessage('Error de conexión con el servidor', 'error');
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const username = document.getElementById('register-username').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  
  try {
    const response = await fetch('http://localhost:3000/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showMessage('¡Cuenta creada! Ahora puedes iniciar sesión', 'success');
      setTimeout(showLogin, 2000);
    } else {
      showMessage(data.error, 'error');
    }
  } catch (error) {
    showMessage('Error de conexión con el servidor', 'error');
  }
}

function showMessage(text, type) {
  const messageDiv = document.getElementById('message');
  messageDiv.textContent = text;
  messageDiv.className = type;
}

function showMainApp() {
  document.getElementById('auth-container').innerHTML = `
    <h1>👗 Wardaropa</h1>
    <p>Bienvenido, <strong>${currentUser.username}</strong></p>
    <div id="status" class="disconnected">Desconectado del WebSocket</div>
    <button onclick="logout()">Cerrar Sesión</button>
  `;
  
  connectWebSocket();
}

function connectWebSocket() {
  ws = new WebSocket('ws://localhost:3000');
  const statusDiv = document.getElementById('status');

  ws.onopen = () => {
    statusDiv.textContent = 'Conectado al servidor ✓';
    statusDiv.className = 'connected';
  };

  ws.onmessage = (event) => {
    console.log('Mensaje del servidor:', event.data);
  };

  ws.onerror = () => {
    statusDiv.textContent = 'Error de conexión ✗';
    statusDiv.className = 'disconnected';
  };

  ws.onclose = () => {
    statusDiv.textContent = 'Desconectado ✗';
    statusDiv.className = 'disconnected';
  };
}

function logout() {
  currentUser = null;
  if (ws) ws.close();
  showLogin();
}

showLogin();
