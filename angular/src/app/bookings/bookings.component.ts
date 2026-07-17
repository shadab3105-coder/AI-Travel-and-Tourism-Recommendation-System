import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { RouterModule } from '@angular/router';

// Access Bootstrap JS for the Modal
declare var bootstrap: any;

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.css']
})
export class BookingsComponent implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  // UI Data Arrays
  upcomingBookings: any[] = [];
  pastBookings: any[] = [];
  
  // State
  loading = true;
  invoiceLoading = false;
  selectedBooking: any = null;

  ngOnInit() {
    this.fetchMyBookings();
  }

  fetchMyBookings() {
    // 1. Get the Security Token (Who am I?)
    const token = this.authService.getToken();
    
    // Debug: Check if we actually have a token
    if (!token) {
      console.warn('⛔ No token found! User might not be logged in.');
      this.loading = false;
      return; 
    }

    // 2. Prepare the Request Header
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    // 3. Send Request to Backend (Port 3001)
    // The backend uses the token to filter results by 'userId'
    this.http.get<{ bookings: any[] }>('http://localhost:3001/api/bookings', { headers })
      .subscribe({
        next: (res) => {
          console.log(`✅ Loaded ${res.bookings.length} bookings for this profile.`);
          this.processBookings(res.bookings || []);
          this.loading = false;
        },
        error: (err) => {
          console.error('❌ Error fetching bookings:', err);
          this.loading = false;
        }
      });
  }

  processBookings(bookings: any[]) {
    this.upcomingBookings = [];
    this.pastBookings = [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    bookings.forEach(b => {
      // 🎨 UI LOGIC: Assign Icons & Colors based on Status/Type
      let icon = 'bi-airplane-fill'; // Default
      if (b.type === 'package') icon = 'bi-bag-heart-fill';
      if (b.type === 'hotel') icon = 'bi-building-fill';

      // Create a clean object for the HTML
      const uiBooking = { 
        ...b, 
        icon, 
        parsedDate: new Date(b.date) 
      };

      // Sort: Future vs Past
      if (uiBooking.parsedDate >= today) {
        this.upcomingBookings.push(uiBooking);
      } else {
        this.pastBookings.push(uiBooking);
      }
    });
  }

  // 🧾 INVOICE MODAL LOGIC
  viewInvoice(bookingId: string) {
    this.invoiceLoading = true;
    this.selectedBooking = null;

    // Open Modal Immediately
    const modalElement = document.getElementById('invoiceModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }

    // Fetch Full Details
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<{ booking: any }>(`http://localhost:3001/api/bookings/${bookingId}`, { headers })
      .subscribe({
        next: (res) => {
          this.selectedBooking = res.booking;
          this.invoiceLoading = false;
        },
        error: (err) => {
          console.error('Invoice Error', err);
          this.invoiceLoading = false;
        }
      });
  }
}