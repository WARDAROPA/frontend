import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const credentials: LoginRequest = {
      username: this.username,
      password: this.password
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = `¡Bienvenido ${response.user?.username}!`;
          setTimeout(() => {
            this.router.navigate(['/home']);
          }, 1500);
        }
      },
      error: (error) => {
        this.errorMessage = error.error?.error || 'Error al iniciar sesión';
      }
    });
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
