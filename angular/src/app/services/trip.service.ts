import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})

export class TripService {

    constructor(private http: HttpClient) { }

    generateTrip(city: string, interests: string) {

        return this.http.post(

            'http://localhost:3001/api/plan-trip',

            {
                city,
                interests
            }

        );

    }

}