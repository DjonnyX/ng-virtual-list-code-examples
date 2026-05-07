import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';

import { routes } from './app.routes';
import { MEDIA_CONFIG } from './directives/media';
import { mediaConfig } from './media.config';
import { VERSION } from './const';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withHashLocation()),
    {
      provide: MEDIA_CONFIG, useValue: mediaConfig,
    },
    {
      provide: VERSION, useValue: '20.12.0-beta-08',
    }
  ]
};
