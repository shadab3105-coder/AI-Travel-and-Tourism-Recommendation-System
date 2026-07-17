import { Injectable, inject, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private baseUrl = 'http://localhost:3001/api';
  private currentBookingData: any = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  // 1. DATA SHARING (The Backpack)
  setBookingData(data: any) {
    this.currentBookingData = data;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('tempBooking', JSON.stringify(data));
    }
  }

  getBookingData() {
    if (!this.currentBookingData) {
      if (isPlatformBrowser(this.platformId)) {
        const saved = localStorage.getItem('tempBooking');
        return saved ? JSON.parse(saved) : null;
      }
      return null;
    }
    return this.currentBookingData;
  }

  clearBookingData() {
    this.currentBookingData = null;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('tempBooking');
    }
  }

  // 2. API CONNECTIONS (Real Data Integration)

  // Confirms the booking to your Database
  bookFlight(payload: any): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.post(`${this.baseUrl}/flights/book`, payload, { headers });
  }

  // Books a car rental
  bookCar(payload: any): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.post(`${this.baseUrl}/cars/book`, payload, { headers });
  }

  // Fetches your history
  getUserBookings(): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.get(`${this.baseUrl}/bookings`, { headers });
  }

  generateTrip(city: string, interests: string) {

    return this.http.post(

      'http://localhost:5000/api/plan-trip',

      {
        city: city,
        interests: interests
      }

    );

  }
}