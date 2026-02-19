import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { WebSocketService } from '../../services/websocket.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  constructor(
    private authService: AuthService,
    private wsService: WebSocketService,
    private router: Router
  ) {}

  get currentUser() {
    return this.authService.currentUserValue;
  }

  logout(): void {
    this.authService.logout();
    this.wsService.disconnect();
    this.router.navigate(['/login']);
  }
}
