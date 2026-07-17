// src/main.ts
import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

// If you want to enable production mode, flip this flag manually,
// or better: use environment files as shown earlier.
const isProduction = false; // <-- set true for production builds

if (isProduction) {
  enableProdMode();
}

bootstrapApplication(AppComponent, appConfig).catch(err => {
  console.error('Bootstrap error:', err);
});
