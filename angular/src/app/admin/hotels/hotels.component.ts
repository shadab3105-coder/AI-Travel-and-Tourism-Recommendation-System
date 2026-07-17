import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Hotel {
  id?: number;
  name: string;
  location: string;
  description: string;
  pricePerNight: number;
  rating: number;
  amenities: string[];
  images: string[];
  availableRooms: number;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-admin-hotels',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './hotels.component.html',
  styleUrl: './hotels.component.css'
})
export class AdminHotelsComponent implements OnInit {
  hotels: Hotel[] = [];
  loading = false;
  showAddForm = false;
  editingHotel: Hotel | null = null;

  private apiUrl = 'http://localhost:3000/api/admin';

  newHotel: Hotel = {
    name: '',
    location: '',
    description: '',
    pricePerNight: 0,
    rating: 5,
    amenities: [],
    images: [],
    availableRooms: 0
  };

  amenityInput = '';
  imageInput = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadHotels();
  }

  loadHotels() {
    this.loading = true;
    const token = localStorage.getItem('token');
    this.http.get<{ hotels: Hotel[] }>(`${this.apiUrl}/hotels`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (response) => {
        this.hotels = response.hotels;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading hotels:', error);
        this.loading = false;
      }
    });
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.resetForm();
    }
  }

  addAmenity() {
    if (this.amenityInput.trim() && !this.newHotel.amenities.includes(this.amenityInput.trim())) {
      this.newHotel.amenities.push(this.amenityInput.trim());
      this.amenityInput = '';
    }
  }

  removeAmenity(amenity: string) {
    this.newHotel.amenities = this.newHotel.amenities.filter(a => a !== amenity);
  }

  addImage() {
    if (this.imageInput.trim() && !this.newHotel.images.includes(this.imageInput.trim())) {
      this.newHotel.images.push(this.imageInput.trim());
      this.imageInput = '';
    }
  }

  removeImage(image: string) {
    this.newHotel.images = this.newHotel.images.filter(i => i !== image);
  }

  saveHotel() {
    if (!this.isFormValid()) {
      alert('Please fill in all required fields');
      return;
    }

    this.loading = true;
    const token = localStorage.getItem('token');

    if (this.editingHotel) {
      // Update existing hotel
      this.http.put(`${this.apiUrl}/hotels/${this.editingHotel.id}`, this.newHotel, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: () => {
          alert('Hotel updated successfully');
          this.loadHotels();
          this.cancelEdit();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error updating hotel:', error);
          this.loading = false;
        }
      });
    } else {
      // Create new hotel
      this.http.post(`${this.apiUrl}/hotels`, this.newHotel, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: () => {
          alert('Hotel added successfully');
          this.loadHotels();
          this.resetForm();
          this.showAddForm = false;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error creating hotel:', error);
          this.loading = false;
        }
      });
    }
  }

  editHotel(hotel: Hotel) {
    this.editingHotel = hotel;
    this.newHotel = { ...hotel };
    this.showAddForm = true;
  }

  cancelEdit() {
    this.editingHotel = null;
    this.resetForm();
    this.showAddForm = false;
  }

  deleteHotel(hotel: Hotel) {
    if (!hotel.id) return;

    if (confirm(`Are you sure you want to delete "${hotel.name}"?`)) {
      this.loading = true;
      const token = localStorage.getItem('token');

      this.http.delete(`${this.apiUrl}/hotels/${hotel.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: () => {
          this.loadHotels();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error deleting hotel:', error);
          this.loading = false;
        }
      });
    }
  }

  private isFormValid(): boolean {
    return !!(
      this.newHotel.name.trim() &&
      this.newHotel.location.trim() &&
      this.newHotel.description.trim() &&
      this.newHotel.pricePerNight > 0 &&
      this.newHotel.availableRooms > 0
    );
  }

  private resetForm() {
    this.newHotel = {
      name: '',
      location: '',
      description: '',
      pricePerNight: 0,
      rating: 5,
      amenities: [],
      images: [],
      availableRooms: 0
    };
    this.amenityInput = '';
    this.imageInput = '';
  }
}
