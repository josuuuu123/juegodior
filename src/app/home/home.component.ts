import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  juegos = [
    {
      nombre: 'Snake',
      imagen: '/figma.jpg'
    },
    {
      nombre: 'Puzzle',
      imagen: '/figma.jpg'
    },
    {
      nombre: 'Memoria',
      imagen: '/figma.jpg'
    },
    {
      nombre: 'Mario',
      imagen: '/figma.jpg'
    },
    {
      nombre: 'Tetris',
      imagen: '/figma.jpg'
    }
  ];

  iniciarJuego(nombre: string) {
    alert(`Iniciando ${nombre}...`);
  }
}
