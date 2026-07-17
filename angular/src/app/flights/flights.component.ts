import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { BookingService } from '../services/booking.service';

@Component({
  selector: 'app-flights',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './flights.component.html',
  styleUrls: ['./flights.component.css']
})
export class FlightsComponent {
  private authService = inject(AuthService);
  private bookingService = inject(BookingService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);

  flightForm: FormGroup;
  bookingForm: FormGroup;
  searchResults: any[] = [];
  isSearching = false;
  showBookingModal = false;
  showDetailsModal = false;
  selectedFlight: any = null;

  // Coupon related properties
  couponCode = '';
  couponApplied: any = null;
  couponError = '';

  // 📖 EXPANDED DICTIONARY: Fixes "Weird Names"
  airlineNames: any = {
    'AI': 'Air India', '6E': 'IndiGo', 'UK': 'Vistara', 'SG': 'SpiceJet',
    'IX': 'Air India Express', 'QP': 'Akasa Air', 'G8': 'Go First',
    'EK': 'Emirates', 'EY': 'Etihad', 'QR': 'Qatar Airways', 'G9': 'Air Arabia',
    'BA': 'British Airways', 'LH': 'Lufthansa', 'AF': 'Air France', 'KL': 'KLM',
    'VS': 'Virgin Atlantic', 'LX': 'Swiss Air', 'TK': 'Turkish Airlines',
    'DL': 'Delta', 'UA': 'United', 'AA': 'American Airlines',
    'SQ': 'Singapore Airlines', 'TG': 'Thai Airways', 'MH': 'Malaysia Airlines',
    'CX': 'Cathay Pacific', 'JL': 'Japan Airlines', 'NH': 'ANA'
  };

  airports = [

    { city: 'Kolkata', code: 'CCU' },

    { city: 'Delhi', code: 'DEL' },

    { city: 'Mumbai', code: 'BOM' },

    { city: 'Chennai', code: 'MAA' },

    { city: 'Bangalore', code: 'BLR' },

    { city: 'Hyderabad', code: 'HYD' },

    { city: 'Pune', code: 'PNQ' },

    { city: 'Goa', code: 'GOI' },

    { city: 'Ahmedabad', code: 'AMD' },

    { city: 'Jaipur', code: 'JAI' },

    { city: 'Lucknow', code: 'LKO' },

    { city: 'Patna', code: 'PAT' },

    { city: 'Bhubaneswar', code: 'BBI' },

    { city: 'Srinagar', code: 'SXR' },

    { city: 'Guwahati', code: 'GAU' }

  ];

  // Offers Carousel Data
  offers = [
    { title: 'Summer Sale', discount: '20% OFF', code: 'SUMMER20', bg: 'linear-gradient(45deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)' },
    { title: 'Bank Offer', discount: 'Flat ₹500', code: 'HDFC500', bg: 'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)' },
    { title: 'Early Bird', discount: '15% OFF', code: 'FLYEARLY', bg: 'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)' },
    { title: 'Student Special', discount: '25% OFF', code: 'STUDENT25', bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { title: 'Family Deal', discount: 'Flat ₹1000', code: 'FAMILY1000', bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { title: 'Weekend Getaway', discount: '18% OFF', code: 'WEEKEND18', bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { title: 'Senior Citizen', discount: '30% OFF', code: 'SENIOR30', bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
    { title: 'Corporate Rate', discount: '22% OFF', code: 'CORPORATE22', bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
    { title: 'Last Minute', discount: 'Flat ₹300', code: 'LASTMIN300', bg: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
    { title: 'International', discount: '12% OFF', code: 'INTL12', bg: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' }
  ];

  constructor() {
    this.flightForm = this.fb.group({
      from: ['', Validators.required],
      to: ['', Validators.required],
      departure: [new Date().toISOString().split('T')[0], Validators.required],
      sortBy: ['']
    });

    this.bookingForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      passengers: [1, [Validators.required, Validators.min(1)]]
    });

    this.flightForm.get('sortBy')?.valueChanges.subscribe(() => {

      this.sortFlights();

    });
  }


  sortFlights() {

    const sort = this.flightForm.value.sortBy;

    if (!sort || this.searchResults.length === 0) return;

    switch (sort) {

      case 'priceLow':

        this.searchResults.sort((a, b) => a.price - b.price);

        break;

      case 'priceHigh':

        this.searchResults.sort((a, b) => b.price - a.price);

        break;

      case 'departure':

        this.searchResults.sort((a, b) => {

          const t1 = a.departureDateTime
            ? new Date(a.departureDateTime).getTime()
            : Number.MAX_SAFE_INTEGER;

          const t2 = b.departureDateTime
            ? new Date(b.departureDateTime).getTime()
            : Number.MAX_SAFE_INTEGER;

          return t1 - t2;

        });

        break;

      default:

        break;

    }

  }
  validateAirports() {

    const from = this.flightForm.value.from;
    const to = this.flightForm.value.to;

    if (!from || !to) return;

    if (from.toLowerCase() === to.toLowerCase()) {

      alert("Origin and Destination cannot be the same.");

      this.flightForm.patchValue({
        to: ''
      });

    }

  }

  // Helper for scrolling offers
  scroll(el: HTMLElement, dir: string) {
    el.scrollBy({ left: (dir === 'left' ? -200 : 200), behavior: 'smooth' });
  }

  // searchFlights() {

  //   if (this.flightForm.invalid) {
  //     this.flightForm.patchValue({ from: 'CCU', to: 'DEL' });
  //   }

  //   this.isSearching = true;
  //   this.searchResults = [];

  //   // const { from, to } = this.flightForm.value;

  //   const from = this.flightForm.value.from;
  //   const to = this.flightForm.value.to;

  //   if (from.toLowerCase() === to.toLowerCase()) {

  //     alert("Please select different cities.");

  //     return;

  //   }
  //   console.log("From:*********", from, "To:", to);


  //   this.http.get<any[]>(
  //     `http://localhost:3001/api/flights/search?origin=${from}&destination=${to}`
  //   )
  //     .subscribe({
  //       next: (data) => {
  //         if (data && data.length > 0) {
  //           console.log("API Data********:", data, "flights found");
  //           console.log("API Data:", data.length, "flights found");
  //           this.searchResults = data.map(f => this.mapApiDataToUi(f));
  //         } else {
  //           console.warn("No API flights, using mock");
  //           this.generateMockFlights(from, to);
  //         }

  //         this.isSearching = false;
  //       },

  //       error: (err) => {
  //         console.error("API failed", err);
  //         this.generateMockFlights(from, to);
  //         this.isSearching = false;
  //       }
  //     });
  // }


  searchFlights() {

    if (this.flightForm.invalid) {
      return;
    }

    this.isSearching = true;
    this.searchResults = [];

    const fromCity = this.flightForm.value.from.trim().toLowerCase();
    const toCity = this.flightForm.value.to.trim().toLowerCase();

    if (fromCity === toCity) {
      alert("Please select different cities.");
      this.isSearching = false;
      return;
    }

    // Find airport codes
    const fromAirport = this.airports.find(
      (a: any) => a.city.toLowerCase() === fromCity
    );

    const toAirport = this.airports.find(
      (a: any) => a.city.toLowerCase() === toCity
    );

    if (!fromAirport || !toAirport) {
      alert("Invalid city selected.");
      this.isSearching = false;
      return;
    }

    const origin = fromAirport.code;
    const destination = toAirport.code;

    console.log("From City:", fromCity);
    console.log("To City:", toCity);
    console.log("Origin Code:", origin);
    console.log("Destination Code:", destination);

    this.http.get<any[]>(
      `http://localhost:3001/api/flights/search?origin=${origin}&destination=${destination}`
    ).subscribe({

      next: (data) => {

        if (data && data.length > 0) {

          console.log("Flights Found:", data.length);

          this.searchResults = data.map(f => this.mapApiDataToUi(f));
          this.sortFlights();

        } else {

          console.warn("No API flights, using mock");

          this.generateMockFlights(origin, destination);
          this.sortFlights();
        }

        this.isSearching = false;

      },

      error: (err) => {

        console.error("API Failed", err);

        this.generateMockFlights(origin, destination);

        this.isSearching = false;

      }

    });

  }

  // 🎨 THE FIX: Currency Converter & Name Mapper
  // mapApiDataToUi(apiFlight: any): any {
  //   const segment = apiFlight.itineraries[0].segments[0];
  //   const carrierCode = segment.carrierCode;

  //   // 1. Fix Name: Use dictionary, fallback to code if missing
  //   const name = this.airlineNames[carrierCode] || carrierCode; 

  //   // 2. Fix Price: Convert EUR/USD to INR
  //   let rawPrice = parseFloat(apiFlight.price.total);
  //   let currency = apiFlight.price.currency;

  //   if (currency === 'EUR') {
  //       rawPrice = rawPrice * 90; // Approx Exchange Rate
  //       currency = 'INR';
  //   } else if (currency === 'USD') {
  //       rawPrice = rawPrice * 84;
  //       currency = 'INR';
  //   }

  //   // Auto-Logos
  //   const logos: any = {
  //     'AI': 'https://cdn-icons-png.flaticon.com/512/732/732205.png',
  //     '6E': 'https://upload.wikimedia.org/wikipedia/en/thumb/9/91/IndiGo_logo.svg/1200px-IndiGo_logo.svg.png',
  //     'UK': 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Vistara_logo.svg/1200px-Vistara_logo.svg.png',
  //     'EK': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Emirates_logo.svg/150px-Emirates_logo.svg.png'
  //   };

  //   return {
  //     airline: name,
  //     flightNumber: `${carrierCode}-${segment.number}`,
  //     from: segment.departure.iataCode,
  //     to: segment.arrival.iataCode,
  //     departureTime: segment.departure.at.split('T')[1].slice(0, 5),
  //     arrivalTime: segment.arrival.at.split('T')[1].slice(0, 5),
  //     duration: apiFlight.itineraries[0].duration.replace('PT', '').toLowerCase(),

  //     // ✅ ROUNDED PRICE (No decimals like 83.03333)
  //     price: Math.round(rawPrice), 
  //     currency: currency,

  //     logo: logos[carrierCode] || 'https://cdn-icons-png.flaticon.com/512/78/78957.png'
  //   };
  // }

  // mapApiDataToUi(apiFlight: any) {

  //   const depTime = apiFlight.departure?.scheduled
  //     ? new Date(apiFlight.departure.scheduled)
  //       .toLocaleTimeString([], {
  //         hour: '2-digit',
  //         minute: '2-digit'
  //       })
  //     : "Unknown";

  //   const arrTime = apiFlight.arrival?.scheduled
  //     ? new Date(apiFlight.arrival.scheduled)
  //       .toLocaleTimeString([], {
  //         hour: '2-digit',
  //         minute: '2-digit'
  //       })
  //     : "Unknown";

  //   return {
  //     airline: apiFlight.airline?.name || "Unknown Airline",

  //     flightNumber:
  //       apiFlight.flight?.iata || "N/A",

  //     from:
  //       apiFlight.departure?.iata || "N/A",

  //     to:
  //       apiFlight.arrival?.iata || "N/A",

  //     departureTime: depTime,

  //     arrivalTime: arrTime,

  //     duration: "2h 30m",   // temporary

  //     price: Math.floor(Math.random() * 5000 + 3000),

  //     status: apiFlight.flight_status || "scheduled",

  //     logo:
  //       "https://cdn-icons-png.flaticon.com/512/7893/7893979.png"
  //   };

  // }

  mapApiDataToUi(apiFlight: any) {

    const depDate = apiFlight.departure?.scheduled
      ? new Date(apiFlight.departure.scheduled)
      : null;

    const arrDate = apiFlight.arrival?.scheduled
      ? new Date(apiFlight.arrival.scheduled)
      : null;

    return {

      airline: apiFlight.airline?.name || "Unknown Airline",

      flightNumber: apiFlight.flight?.iata || "N/A",

      from: apiFlight.departure?.iata || "N/A",

      to: apiFlight.arrival?.iata || "N/A",

      departureTime: depDate
        ? depDate.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })
        : "Unknown",

      arrivalTime: arrDate
        ? arrDate.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })
        : "Unknown",

      // ✅ Keep original datetime for sorting
      departureDateTime: depDate,

      arrivalDateTime: arrDate,

      duration: "2h 30m",

      price: Math.floor(Math.random() * 5000 + 3000),

      status: apiFlight.flight_status || "scheduled",

      logo: "https://cdn-icons-png.flaticon.com/512/7893/7893979.png"

    };

  }

  generateMockFlights(from: string, to: string) {
    const airlines = ['AI', '6E', 'UK'];
    setTimeout(() => {
      this.searchResults = Array.from({ length: 5 }).map((_, i) => ({
        airline: this.airlineNames[airlines[i % 3]],
        flightNumber: `${airlines[i % 3]}-10${i}`,
        from: from || 'DEL', to: to || 'BOM',
        departureTime: '10:00', arrivalTime: '12:30',
        duration: '2h 30m',
        price: 4500 + (i * 500),
        currency: 'INR',
        logo: 'https://cdn-icons-png.flaticon.com/512/78/78957.png'
      }));
    }, 500);
  }

  proceedToPayment() {
    if (this.bookingForm.invalid) return alert('Fill all details');
    const searchDate = this.flightForm.value.departure;
    const basePrice = this.selectedFlight.price * this.bookingForm.value.passengers;
    const discountAmount = this.couponApplied ? this.couponApplied.savings : 0;
    const finalPrice = basePrice - discountAmount;

    const payload = {
      flightDetails: {
        ...this.selectedFlight,
        date: searchDate || new Date().toISOString().split('T')[0]
      },
      passengerInfo: this.bookingForm.value,
      totalPrice: finalPrice,
      couponApplied: this.couponApplied ? {
        code: this.couponApplied.code,
        discount: this.couponApplied.discount,
        savings: this.couponApplied.savings
      } : null
    };
    this.bookingService.setBookingData(payload);
    this.closeBookingModal();
    this.router.navigate(['/payment']);
  }

  applyCoupon() {
    if (!this.couponCode.trim()) return;

    this.couponError = '';
    this.couponApplied = null;

    const coupon = this.offers.find(offer => offer.code.toLowerCase() === this.couponCode.toLowerCase());
    if (coupon) {
      let savings = 0;
      const originalPrice = this.selectedFlight.price * this.bookingForm.value.passengers;

      if (coupon.discount.includes('%')) {
        const percentage = parseFloat(coupon.discount.replace('% OFF', ''));
        savings = Math.round((originalPrice * percentage) / 100);
      } else if (coupon.discount.includes('Flat')) {
        savings = parseFloat(coupon.discount.replace('Flat ₹', ''));
      }

      this.couponApplied = {
        discount: coupon.discount,
        savings: savings,
        code: coupon.code
      };
    } else {
      this.couponError = 'Invalid coupon code. Please check and try again.';
    }
  }

  openBookingModal(flight: any) {
    if (!this.authService.isLoggedIn()) {
      alert('Please login to book.');
      this.router.navigate(['/auth/login']);
      return;
    }
    this.selectedFlight = flight;
    this.showBookingModal = true;
    this.couponCode = '';
    this.couponApplied = null;
    this.couponError = '';
    const user = this.authService.getUser();
    console.log("user details**", user);

    if (user) this.bookingForm.patchValue({ firstName: user.firstName, lastName: user.lastName, email: user.email });
  }


  showDetails(flight: any) {
    if (!this.authService.isLoggedIn()) {
      alert('Please login to book.');
      this.router.navigate(['/auth/login']);
      return;
    }
    this.selectedFlight = flight;
    this.showDetailsModal = true;
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
  }



  copyCoupon(code: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        alert(`Coupon code "${code}" copied to clipboard!`);
      }).catch(err => {
        console.error('Failed to copy: ', err);
        // Fallback for older browsers
        this.fallbackCopyTextToClipboard(code);
      });
    } else {
      // Fallback for browsers without clipboard API
      this.fallbackCopyTextToClipboard(code);
    }
  }

  private fallbackCopyTextToClipboard(text: string) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      alert(`Coupon code "${text}" copied to clipboard!`);
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
      alert('Unable to copy coupon code. Please copy manually.');
    }
    document.body.removeChild(textArea);
  }

  closeBookingModal() { this.showBookingModal = false; }
}
