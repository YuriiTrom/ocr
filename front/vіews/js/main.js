document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('loginUsername').value;
      const password = document.getElementById('loginPassword').value;
      const loginError = document.getElementById('loginError');

      // Очистити попереднє повідомлення про помилку
      loginError.textContent = '';

      // Перевірка логіну та паролю
      if (username === 'trompak03@gmail.com') {
        if (password === 'trompak05') {
          // Зберігаємо токен у localStorage (або іншу інформацію)
          localStorage.setItem('token', 'dummy-token');
          // Перенаправляємо на сторінку профілю
          window.location.href = 'profile.html';
        } else {
          loginError.textContent = 'Невірний пароль';
        }
      } else {
        loginError.textContent = 'Невірний email';
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('registerUsername').value;
      const email = document.getElementById('registerEmail').value;
      const password = document.getElementById('registerPassword').value;

      fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          $('#registerModal').modal('hide');
          window.location.href = 'profile.html';
        } else {
          alert('Registration failed');
        }
      });
    });
  }
});
