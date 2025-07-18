import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { TetrisComponent } from './tetris/tetris.component';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'tetris', component: TetrisComponent }
];
