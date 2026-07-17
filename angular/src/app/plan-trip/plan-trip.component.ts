import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TripService } from '../services/trip.service';

@Component({
    selector: 'app-plan-trip',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './plan-trip.component.html',
    styleUrls: ['./plan-trip.component.css']
})

export class PlanTripComponent {

    city: string = '';
    interests: string = '';
    itinerary: string = '';
    loading: boolean = false;

    constructor(
        private tripService: TripService
    ) { }

    generateTrip() {

        if (!this.city || !this.interests) {
            alert("Please fill all fields");
            return;
        }

        this.loading = true;

        this.tripService.generateTrip(
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