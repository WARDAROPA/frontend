import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LogoRainComponent } from './components/logo-rain/logo-rain.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, LogoRainComponent],
  template: `
    <div class="ssl-banner" *ngIf="showSslBanner">
      <span>⚠️ Para usar Wardaropa debes aceptar el certificado del servidor primero.</span>
      <a [href]="backendUrl" target="_blank" rel="noopener" (click)="onCertLinkClicked()">Haz clic aquí para aceptarlo</a>
      <span class="ssl-hint">(Se abrirá una pestaña nueva — acepta el aviso de seguridad del navegador y luego vuelve aquí)</span>
      <button class="ssl-retry" (click)="checkBackend()">Reintentar ✓</button>
    </div>
    <app-logo-rain *ngIf="showRain"></app-logo-rain>
    <div class="main-content">
      <router-outlet></router-outlet>
    </div>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  readonly backendUrl = 'https://4.233.184.106';
  showSslBanner = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.checkBackend();
  }

  checkBackend(): void {
    this.http.get(`${this.backendUrl}/ping`).subscribe({
      next: () => { this.showSslBanner = false; },
      error: (err) => {
        // status 0 = network/SSL error (cert not accepted by browser)
        this.showSslBanner = err.status === 0;
      }
    });
  }

  onCertLinkClicked(): void {
    // Retry after a delay to give the user time to accept the cert
    setTimeout(() => this.checkBackend(), 8000);
  }

  get showRain(): boolean {
    const path = window.location.pathname;
    return path !== '/login' && path !== '/register' && path !== '/';
  }
}
