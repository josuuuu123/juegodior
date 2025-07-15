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
      imagen: '/figma.jpg'
    },
    {
      nombre: 'Tetris',
      imagen: '/bloquesi.jpg'
    }
  ];

  iniciarJuego(nombre: string) {
    alert(`Iniciando ${nombre}...`);
  }
}
