document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const auth = new AuthSystem();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const user = auth.login(username, password);
    if (user) {
      window.location.href = 'index.html';
    } else {
      showAlert('Invalid credentials', 'error');
    }
  });
  
  document.getElementById('signup-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const auth = new AuthSystem();
    const formData = {
      username: document.getElementById('username').value,
      email: document.getElementById('email').value,
      password: document.getElementById('password').value,
      position: document.getElementById('position').value
    };
    
    if (auth.register(formData.username, formData.password, formData.email, formData.position)) {
      showAlert('Registration successful!', 'success');
      setTimeout(() => window.location.href = 'index.html', 1500);
    } else {
      showAlert('Username already exists', 'error');
    }
  });