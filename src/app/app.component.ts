import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { LogoRainComponent } from './components/logo-rain/logo-rain.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, LogoRainComponent],
  template: `
    <app-logo-rain *ngIf="showRain"></app-logo-rain>
    <div class="main-content">
      <router-outlet></router-outlet>
    </div>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  get showRain(): boolean {
    const path = window.location.pathname;
    return path !== '/login' && path !== '/register' && path !== '/';
  }
}
