import { Component } from '@angular/core';
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
export class RegisterComponent {
  usuario = '';
  password = '';

  constructor(private router: Router) {}

  registrar() {
    if (this.usuario && this.password) {
      this.router.navigate(['/home']);
    } else {
      alert('Usuario y contraseña requeridos');
    }
  }
}
