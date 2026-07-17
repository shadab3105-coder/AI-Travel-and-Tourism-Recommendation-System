import { Routes } from '@angular/router';
import { AdminGuard } from './auth/admin.guard';
import { UserGuard } from './auth/user.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'flights',
    loadComponent: () => import('./flights/flights.component').then(m => m.FlightsComponent)
  },
  {
    path: 'hotels',
    loadComponent: () => import('./hotels/hotels.component').then(m => m.HotelsComponent)
  },
  // {
  //   path: 'cars',
  //   loadComponent: () => import('./cars/cars.component').then(m => m.CarsComponent)
  // },
  // {
  //   path: 'cars/booking',
  //   loadComponent: () => import('./cars/car-booking.component').then(m => m.CarBookingComponent)
  // },
  // {
  //   path: 'packages',
  //   loadComponent: () => import('./packages/packages.component').then(m => m.PackagesComponent)
  // },
  {
    path: 'search',
    canActivate: [UserGuard],
    loadComponent: () => import('./search/search.component').then(m => m.SearchComponent)
  },
  {
    path: 'bookings',
    loadComponent: () => import('./bookings/bookings.component').then(m => m.BookingsComponent)
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'payment',
    loadComponent: () => import('./payment/payment.component').then(m => m.PaymentComponent)
  },
  {
    path: 'reviews',
    loadComponent: () => import('./reviews/reviews.component').then(m => m.ReviewsComponent)
  },
  {
    path: 'nearby-tourist-points',
    loadComponent: () => import('./nearby-tourist-points/nearby-tourist-points.component').then(m => m.NearbyTouristPointsComponent)
  },
  {
    path: 'admin',
    canActivate: [AdminGuard],
    loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  {
    path: 'plan-trip',
    loadComponent: () =>
      import('./plan-trip/plan-trip.component')
        .then(m => m.PlanTripComponent)
  }
];
