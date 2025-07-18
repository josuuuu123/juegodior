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
      imagen: '/22222.jpg'
    },
    {
      nombre: 'Tetris',
      imagen: '/bloquesi.jpg'
    }
  ];

  iniciarJuego(nombre: string) {
    console.log('Iniciando juego:', nombre);
    switch (nombre.toLowerCase()) {
      case 'tetris':
        console.log('Navegando a Tetris');
        this.router.navigate(['/tetris']);
        break;
      case 'puzzle':
        console.log('Navegando a Puzzle');
        this.router.navigate(['/puzzle']);
        break;
      case 'snake':
        console.log('Navegando a Snake');
        this.router.navigate(['/snake']);
        break;
      case 'parejas':
        console.log('Navegando a Parejas');
        this.router.navigate(['/parejas']);
        break;
      case 'mario':
        console.log('Navegando a Mario');
        this.router.navigate(['/mario']);
        break;
      default:
        alert(`Iniciando ${nombre}...`);
    }
  }
}
