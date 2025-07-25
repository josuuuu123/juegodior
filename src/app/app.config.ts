import { ApplicationConfig } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import { TetrisComponent } from './tetris/tetris.component';
import { PuzzleComponent } from './puzzle/puzzle.component';
import { SnakeComponent } from './snake/snake.component';
import { ParejasComponent } from './parejas/parejas.component';
import { ModaComponent } from './moda/moda.component';
import { MarioInfinitoComponent } from './mario/mario-infinito.component';

const routes: Routes = [
  { path: '', redirectTo: '/register', pathMatch: 'full' },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent },
  { path: 'tetris', component: TetrisComponent },
  { path: 'puzzle', component: PuzzleComponent },
  { path: 'snake', component: SnakeComponent },
  { path: 'parejas', component: ParejasComponent },
  { path: 'moda', component: ModaComponent },
  { path: 'mario', component: MarioInfinitoComponent }, 
  

];

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes)]
};

