import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, OnDestroy {
  usuario = '';
  password = '';
  private animationIds: number[] = [];
  private isAnimating = true;

  constructor(private router: Router) { }

  ngOnInit() {
    this.initializeStarfield();
    this.startCosmicAnimations();
  }

  ngOnDestroy() {
    this.isAnimating = false;
    this.animationIds.forEach(id => cancelAnimationFrame(id));
  }

  private initializeStarfield() {

    const starsContainer = document.querySelector('.stars-container');
    if (starsContainer) {
      for (let i = 0; i < 20; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.width = star.style.height = Math.random() * 3 + 1 + 'px';
        star.style.animationDelay = Math.random() * 6 + 's';
        star.style.animationDuration = (Math.random() * 4 + 4) + 's';
        starsContainer.appendChild(star);
      }
    }
  }

  private startCosmicAnimations() {
    const animate = () => {
      if (!this.isAnimating) return;

      const container = document.querySelector('.fb-container') as HTMLElement;
      if (container) {
        const time = Date.now() * 0.001;
        const intensity = Math.sin(time * 0.5) * 0.5 + 0.5;
        container.style.setProperty('--glow-intensity', intensity.toString());
      }

      const nebula = document.querySelector('.nebula') as HTMLElement;
      if (nebula) {
        const rotation = (Date.now() * 0.01) % 360;
        nebula.style.transform = `rotate(${rotation}deg) scale(${1 + Math.sin(Date.now() * 0.001) * 0.1})`;
      }

      this.animationIds.push(requestAnimationFrame(animate));
    };

    animate();
  }

  registrar() {
    if (this.usuario.trim() === '' || this.password.trim() === '') {
      this.showCosmicAlert('🌟 Por favor, completa todos los campos cósmicos');
      return;
    }

 
    if (this.usuario.length < 3) {
      this.showCosmicAlert('🚀 El usuario debe tener al menos 3 caracteres');
      return;
    }

    if (this.password.length < 4) {
      this.showCosmicAlert('🔒 La contraseña debe tener al menos 4 caracteres');
      return;
    }

  
    const container = document.querySelector('.fb-container') as HTMLElement;
    if (container) {
      container.style.transition = 'opacity 0.8s cubic-bezier(.77,.2,.25,1), filter 0.8s cubic-bezier(.77,.2,.25,1), transform 0.8s cubic-bezier(.77,.2,.25,1)';
      container.style.transform = 'scale(0.95) rotateY(5deg)';
      container.style.opacity = '0.2';
      container.style.filter = 'blur(18px) brightness(0.7)';

      this.showCosmicAlert('🎮 ¡Bienvenido al universo de juegos!');

      setTimeout(() => {
        this.router.navigate(['/home']);
      }, 900);
    }
  }

  private showCosmicAlert(message: string) {
    // Crear alerta personalizada con tema espacial
    const alert = document.createElement('div');
    alert.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(83, 52, 131, 0.95);
      color: white;
      padding: 15px 20px;
      border-radius: 10px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
      box-shadow: 0 4px 20px rgba(83, 52, 131, 0.4);
    `;

    alert.textContent = message;
    document.body.appendChild(alert);

    setTimeout(() => {
      alert.style.animation = 'slideOut 0.3s ease-in forwards';
      setTimeout(() => document.body.removeChild(alert), 300);
    }, 3000);
  }
}
