import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  constructor(private router: Router) { }

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
