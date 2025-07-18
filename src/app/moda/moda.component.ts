
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-moda',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './moda.component.html',
    styleUrls: ['./moda.component.css']
})
export class ModaComponent {
    selectedDress: number | null = null;
    selectedAccessory: number | null = null;

    dresses = [
        { nombre: 'Violeta Real', class: 'dress-2', color: '#a29bfe' },
        { nombre: 'Azul Cielo', class: 'dress-3', color: '#74b9ff' },
        { nombre: 'Verde Esmeralda', class: 'dress-4', color: '#55efc4' },
        { nombre: 'Dorado Sunset', class: 'dress-5', color: '#fdcb6e' },
        { nombre: 'Rosa Glamour', class: 'dress-6', color: '#fd79a8' }
    ];
    accessories = [
        { nombre: 'Sombrero', class: 'acc-hat', color: '#a29bfe' },
        { nombre: 'Bolso', class: 'acc-bag', color: '#ff6b6b' },
        { nombre: 'Zapatos', class: 'acc-shoes', color: '#fdcb6e' }
    ];

    constructor(private router: Router) { }

    selectDress(index: number) {
        this.selectedDress = index;
    }

    selectAccessory(index: number) {
        this.selectedAccessory = index;
    }

    reset() {
        this.selectedDress = -1;
        this.selectedAccessory = -1;
    }

    randomOutfit() {
        this.selectedDress = Math.floor(Math.random() * this.dresses.length);
        this.selectedAccessory = Math.floor(Math.random() * this.accessories.length);
    }

    volverInicio() {
        this.router.navigate(['/home']);
    }
}
