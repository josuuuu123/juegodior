import { ApplicationConfig } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  { path: '', component: RegisterComponent },
  { path: 'home', component: HomeComponent }
];

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes)]
};

