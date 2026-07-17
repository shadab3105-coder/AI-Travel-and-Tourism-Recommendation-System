import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';

export const GOOGLE_MAPS_API_KEY = 'AIzaSyA5qdDq6ab3zSKs70Q71-TeavduYYKe9e8';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch()),
    importProvidersFrom(RouterModule.forRoot(routes)),
    provideAnimations()
  ]
};
