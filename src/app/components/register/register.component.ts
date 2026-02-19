import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  username = '';
  email = '';
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

    const data: RegisterRequest = {
      username: this.username,
      email: this.email,
      password: this.password
    };

    this.authService.register(data).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = '¡Cuenta creada! Ahora puedes iniciar sesión';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        }
      },
      error: (error) => {
        this.errorMessage = error.error?.error || 'Error al registrar usuario';
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
