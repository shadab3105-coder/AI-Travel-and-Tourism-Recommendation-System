import { Component, inject, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BookingService } from '../services/booking.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container py-5" *ngIf="bookingData">
      <div class="card shadow-lg mx-auto" style="max-width: 500px; border-radius: 20px;">
        <div class="card-header bg-primary text-white text-center py-4" style="border-radius: 20px 20px 0 0;">
          <h3 class="mb-0"><i class="bi bi-credit-card me-2"></i> Payment Gateway</h3>
        </div>
        <div class="card-body p-5">
          
          <div class="text-center mb-4">
            <h5 class="text-muted">Total Amount</h5>
            <h1 class="fw-bold text-dark">{{ bookingData.totalPrice | currency:'INR' }}</h1>
          </div>

          <!-- Flight Booking Details -->
          <div class="alert alert-light border mb-4" *ngIf="bookingData.flightDetails">
            <strong>Flight:</strong> {{ bookingData.flightDetails.airline }} ({{ bookingData.flightDetails.flightNumber }})<br>
            <small>{{ bookingData.flightDetails.from }} <i class="bi bi-arrow-right"></i> {{ bookingData.flightDetails.to }}</small>
          </div>

          <!-- Car Booking Details -->
          <div class="alert alert-light border mb-4" *ngIf="bookingData.carDetails">
            <strong>Car:</strong> {{ bookingData.carDetails.name }}<br>
            <small>{{ bookingData.carDetails.type }} • {{ bookingData.carDetails.seats }} seats • {{ bookingData.carDetails.transmission }}</small><br>
            <small class="text-muted">{{ bookingData.carDetails.pickupLocation }} <i class="bi bi-arrow-right"></i> {{ bookingData.carDetails.dropLocation }}</small>
          </div>

          <div class="d-grid gap-3">
            <button class="btn btn-dark btn-lg" (click)="confirmPayment()" [disabled]="processing">
              <span *ngIf="processing" class="spinner-border spinner-border-sm me-2"></span>
              {{ processing ? 'Processing...' : 'Pay with UPI / Card' }}
            </button>
            <button class="btn btn-outline-danger" routerLink="/flights">Cancel</button>
          </div>

        </div>
      </div>
    </div>
  `
})
export class PaymentComponent implements OnInit {
  private router = inject(Router);
  private bookingService = inject(BookingService);

  bookingData: any = null;
  processing = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    // 1. Retrieve Data from Memory
    this.bookingData = this.bookingService.getBookingData();

    // 2. If no data (user refreshed page), kick them back to appropriate page
    if (!this.bookingData) {
      if (isPlatformBrowser(this.platformId)) {
        alert('No booking session found. Redirecting...');
        // Check if there was a previous booking type in localStorage
        const lastBookingType = localStorage.getItem('lastBookingType');
        const redirectPath = lastBookingType === 'car' ? '/cars' : '/flights';
        this.router.navigate([redirectPath]);
      } else {
        this.router.navigate(['/flights']);
      }
    } else {
      // Store the booking type for potential future redirects
      if (isPlatformBrowser(this.platformId)) {
        const bookingType = this.bookingData.flightDetails ? 'flight' : 'car';
        localStorage.setItem('lastBookingType', bookingType);
      }
    }
  }

  confirmPayment() {
    this.processing = true;

    // 3. EXECUTE THE BOOKING (Hit Backend)
    const bookingMethod = this.bookingData.flightDetails ? 'bookFlight' : 'bookCar';
    const bookingObservable = this.bookingData.flightDetails
      ? this.bookingService.bookFlight(this.bookingData)
      : this.bookingService.bookCar(this.bookingData);

    bookingObservable.subscribe({
      next: (res) => {
        console.log('✅ Payment Success:', res);
        if (isPlatformBrowser(this.platformId)) {
          const bookingType = this.bookingData.flightDetails ? 'Flight' : 'Car';
          alert(`${bookingType} booking successful! Booking Ref: ${res.booking.bookingReference}`);
        }

        // Clear memory and go to My Bookings
        this.bookingService.clearBookingData();
        this.router.navigate(['/bookings']);
      },
      error: (err) => {
        console.error('❌ Payment Failed:', err);
        if (isPlatformBrowser(this.platformId)) {
          alert('Transaction Failed. Please try again.');
        }
        this.processing = false;
      }
    });
  }
}