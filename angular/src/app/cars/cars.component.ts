import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../auth/auth.service';
import { CarBookingComponent } from './car-booking.component';

interface Car {
  id: number;
  name: string;
  type: string;
  seats: number;
  transmission: string;
  price: number;
  fuel: string;
  unit: string;
  image: string;
  features: string[];
}

@Component({
  selector: 'app-cars',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './cars.component.html',
  styleUrls: ['./cars.component.css']
})
export class CarsComponent implements OnInit {
  activeTab = 'outstation';

  // offers = [
  //   { title: 'Weekend Drive', discount: '15% OFF', code: 'WEEKEND15', bg: 'linear-gradient(135deg, #FF9966, #FF5E62)' },
  //   { title: 'SUV Special', discount: 'Flat ₹500', code: 'SUV500', bg: 'linear-gradient(135deg, #11998e, #38ef7d)' },
  //   { title: 'Airport Transfers', discount: '20% OFF', code: 'AIRPORT20', bg: 'linear-gradient(135deg, #667eea, #764ba2)' },
  //   { title: 'First Rental', discount: '25% OFF', code: 'NEWRIDER25', bg: 'linear-gradient(135deg, #FDC830, #F37335)' },
  //   { title: 'Long Trip', discount: 'Flat ₹1000', code: 'LONGTRIP1000', bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  //   { title: 'Corporate', discount: '30% OFF', code: 'CORPORATE30', bg: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' }
  // ];

  // availableCars: Car[] = [
  //   {
  //     id: 1,
  //     name: 'Toyota Camry',
  //     type: 'Sedan',
  //     seats: 5,
  //     transmission: 'Automatic',
  //     price: 2500,
  //     fuel: 'Petrol',
  //     unit: '/day',
  //     image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=600&q=80',
  //     features: ['AC', 'GPS', 'Bluetooth', 'USB Charging']
  //   },
  //   {
  //     id: 2,
  //     name: 'Honda CR-V',
  //     type: 'SUV',
  //     seats: 5,
  //     transmission: 'Automatic',
  //     price: 3500,
  //     fuel: 'Petrol',
  //     unit: '/day',
  //     image: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=600&q=80',
  //     features: ['AC', 'GPS', 'Bluetooth', '4WD', 'Sunroof']
  //   },
  //   {
  //     id: 3,
  //     name: 'BMW X3',
  //     type: 'Luxury SUV',
  //     seats: 5,
  //     transmission: 'Automatic',
  //     price: 5500,
  //     fuel: 'Diesel',
  //     unit: '/day',
  //     image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=600&q=80',
  //     features: ['AC', 'GPS', 'Bluetooth', 'Leather Seats', 'Premium Sound']
  //   },
  //   {
  //     id: 4,
  //     name: 'Mercedes C-Class',
  //     type: 'Luxury Sedan',
  //     seats: 5,
  //     transmission: 'Automatic',
  //     price: 4800,
  //     fuel: 'Petrol',
  //     unit: '/day',
  //     image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=600&q=80',
  //     features: ['AC', 'GPS', 'Bluetooth', 'Leather Seats', 'Premium Sound']
  //   },
  //   {
  //     id: 5,
  //     name: 'Ford Mustang',
  //     type: 'Sports Car',
  //     seats: 4,
  //     transmission: 'Manual',
  //     price: 4200,
  //     fuel: 'Petrol',
  //     unit: '/day',
  //     image: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?auto=format&fit=crop&w=600&q=80',
  //     features: ['AC', 'GPS', 'Bluetooth', 'Sport Mode']
  //   },
  //   {
  //     id: 6,
  //     name: 'Jeep Wrangler',
  //     type: 'Off-Road SUV',
  //     seats: 5,
  //     transmission: 'Manual',
  //     price: 3800,
  //     fuel: 'Diesel',
  //     unit: '/day',
  //     image: 'https://images.unsplash.com/photo-1606220838315-056192d5e927?auto=format&fit=crop&w=600&q=80',
  //     features: ['AC', 'GPS', 'Bluetooth', '4WD', 'Off-Road Package']
  //   }
  // ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private dialog: MatDialog
  ) { }

  ngOnInit() { }

  selectTab(tab: string) {
    this.activeTab = tab;
  }

  scroll(element: HTMLElement, direction: string) {
    const scrollAmount = 300;
    if (direction === 'left') {
      element.scrollLeft -= scrollAmount;
    } else {
      element.scrollLeft += scrollAmount;
    }
  }

  bookCar(car: Car) {
    if (!this.authService.isLoggedIn()) {
      alert('Please login to book a car.');
      this.router.navigate(['/auth/login']);
      return;
    }
    // Open booking modal with car data
    this.dialog.open(CarBookingComponent, {
      data: { car },
      width: '90vw',
      maxWidth: '800px',
      height: '90vh',
      maxHeight: '90vh',
      disableClose: false
    });
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
}
