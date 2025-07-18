import { ApplicationConfig } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import { TetrisComponent } from './tetris/tetris.component';
import { PuzzleComponent } from './puzzle/puzzle.component';
import { SnakeComponent } from './snake/snake.component';
import { ParejasComponent } from './parejas/parejas.component';
import { MarioComponent } from './mario/mario.component';

const routes: Routes = [
  { path: '', redirectTo: '/register', pathMatch: 'full' },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent },
  { path: 'tetris', component: TetrisComponent },
  { path: 'puzzle', component: PuzzleComponent },
  { path: 'snake', component: SnakeComponent },
  { path: 'parejas', component: ParejasComponent },
  { path: 'mario', component: MarioComponent }
];

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes)]
};

