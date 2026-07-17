import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { BookingService } from '../services/booking.service';

@Component({
  selector: 'app-car-booking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './car-booking.component.html',
  styleUrls: ['./car-booking.component.css']
})

export class CarBookingComponent {

  city: string = '';
  interests: string = '';
  itinerary: string = '';
  loading: boolean = false;

  constructor(
    private bookingService: BookingService
  ) { }

  generateTrip() {

    if (!this.city || !this.interests) {
      alert("Please fill all fields");
      return;
    }

    this.loading = true;

    this.bookingService.generateTrip(
      this.city,
      this.interests
    ).subscribe({

      next: (res: any) => {
        this.itinerary = res.itinerary;
        this.loading = false;
      },

      error: (err: any) => {
        console.log(err);
        alert("Error generating itinerary");
        this.loading = false;
      }

    });
  }

  clearForm() {
    this.city = '';
    this.interests = '';
    this.itinerary = '';
  }
}


// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';

// @Component({
//   selector: 'app-car-booking',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './car-booking.component.html',
//   styleUrls: ['./car-booking.component.css']
// })

// export class CarBookingComponent {

//   city = '';
//   interests = '';
//   itinerary = '';
//   loading = false;

//   generateTrip() {
//     console.log(this.city);
//   }

//   clearForm() {
//     this.city = '';
//     this.interests = '';
//     this.itinerary = '';
//   }
// }