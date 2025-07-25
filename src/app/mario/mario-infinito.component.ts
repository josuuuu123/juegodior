import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mario-infinito',
  templateUrl: './mario-infinito.component.html',
  styleUrls: ['./mario-infinito.component.css']
})
export class MarioInfinitoComponent implements OnInit, OnDestroy {
  private scriptElement?: HTMLScriptElement;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Cargar el script solo si no está ya cargado
    if (!document.getElementById('mario-infinito-script')) {
      this.scriptElement = document.createElement('script');
      this.scriptElement.id = 'mario-infinito-script';
      this.scriptElement.src = '/mario-infinito.component.js';
      this.scriptElement.async = false;
      document.body.appendChild(this.scriptElement);
    }
  }

  ngOnDestroy(): void {
    // Opcional: eliminar el script si quieres limpiar al salir del componente
    if (this.scriptElement) {
      document.body.removeChild(this.scriptElement);
    }
  }

  volver() {
    // Si quieres volver a home, usa router
    this.router.navigate(['/home']);
  }
}
