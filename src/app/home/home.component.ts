import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  mostrarMario = false;
  private routerSub: any;

  constructor(private router: Router) {}

  ngOnInit() {
    this.checkMarioRoute();
    this.routerSub = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.checkMarioRoute();
      }
    });
  }

  ngOnDestroy() {
    if (this.routerSub) this.routerSub.unsubscribe();
    // Solo eliminar el script, no el canvas ni el UI
    const script = document.getElementById('mario-infinito-script');
    if (script) script.remove();
  }

  private checkMarioRoute() {
    const isMario = window.location.pathname.endsWith('/mario');
    if (isMario && !this.mostrarMario) {
      this.mostrarMario = true;
      setTimeout(() => {
        if (!document.getElementById('mario-infinito-script')) {
          const script = document.createElement('script');
          script.src = '/mario-infinito.component.js';
          script.id = 'marido-infinito-script';
          document.body.appendChild(script);
        }
      }, 0);
    } else if (!isMario && this.mostrarMario) {
      this.mostrarMario = false;
    }
  }

  juegos = [
    {
      nombre: 'Snake',
      imagen: '/snakei.jpg'
    },
    {
      nombre: 'Puzzle',
      imagen: '/rompecabezas.jpg'
    },
    {
      nombre: 'Parejas',
      imagen: '/Parejasi.jpg'
    },
    {
      nombre: 'Mario',
      imagen: '/2222.jpg'
    },
    {
      nombre: 'Tetris',
      imagen: '/bloquesi.jpg'
    },
    {
      nombre: 'Moda',
      imagen: '/kids.jpg' 
    }
  ];

  iniciarJuego(nombre: string) {
    console.log('Iniciando juego:', nombre);
    switch (nombre.toLowerCase()) {
      case 'tetris':
        this.router.navigate(['/tetris']);
        break;
      case 'puzzle':
        this.router.navigate(['/puzzle']);
        break;
      case 'snake':
        this.router.navigate(['/snake']);
        break;
      case 'parejas':
        this.router.navigate(['/parejas']);
        break;
      case 'mario':
        this.router.navigate(['/mario']);
        break;
      case 'moda':
        this.router.navigate(['/moda']);
        break;
      default:
        alert(`Iniciando ${nombre}...`);
    }
  }
}
