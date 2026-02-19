import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface FallingLogo {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
}

@Component({
  selector: 'app-logo-rain',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logo-rain.component.html',
  styleUrls: ['./logo-rain.component.css']
})
export class LogoRainComponent implements OnInit, OnDestroy {
  logos: FallingLogo[] = [];
  private intervalIds: number[] = [];

  ngOnInit(): void {
    this.initLogoRain();
  }

  ngOnDestroy(): void {
    this.intervalIds.forEach(id => clearTimeout(id));
  }

  initLogoRain(): void {
    const numberOfLogos = 20;
    
    for (let i = 0; i < numberOfLogos; i++) {
      const timeoutId = window.setTimeout(() => {
        this.createFallingLogo(i);
      }, i * 300);
      this.intervalIds.push(timeoutId);
    }
  }

  createFallingLogo(id: number): void {
    const logo: FallingLogo = {
      id,
      left: Math.random() * 100,
      size: 30 + Math.random() * 30,
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 5
    };

    this.logos.push(logo);

    const timeoutId = window.setTimeout(() => {
      this.logos = this.logos.filter(l => l.id !== id);
      this.createFallingLogo(id);
    }, (logo.duration + logo.delay) * 1000);
    
    this.intervalIds.push(timeoutId);
  }

  getLogoStyle(logo: FallingLogo) {
    return {
      left: `${logo.left}%`,
      width: `${logo.size}px`,
      height: `${logo.size}px`,
      animationDuration: `${logo.duration}s`,
      animationDelay: `${logo.delay}s`
    };
  }
}
