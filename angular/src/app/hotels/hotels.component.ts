import { Component, OnInit, NgZone, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GOOGLE_MAPS_API_KEY } from '../app.config';

@Component({
  selector: 'app-hotels',
  templateUrl: './hotels.component.html',
  styleUrls: ['./hotels.component.css'],
  imports: [CommonModule, FormsModule],
  standalone: true
})
export class HotelsComponent implements OnInit {
  map!: google.maps.Map;
  userLocation!: google.maps.LatLngLiteral;
  hotels: google.maps.places.PlaceResult[] = [];
  loading = false;
  error = '';
  searchQuery = '';
  checkInDate = '';
  checkOutDate = '';
  guests = '1 Guest';
  minRating = '';
  priceLevel = '';
  sortBy = 'rating';
  filteredHotels: google.maps.places.PlaceResult[] = [];
  markers: google.maps.Marker[] = [];

  constructor(
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadGoogleMapsApi()
        .then(() => this.initializeMap())
        .catch(err => {
          this.error = 'Failed to load Google Maps API';
          console.error(err);
        });
    }
  }

  loadGoogleMapsApi(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!isPlatformBrowser(this.platformId)) { resolve(); return; }
      if ((window as any).google?.maps) { resolve(); return; }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = (err) => reject(err);

      document.head.appendChild(script);
    });
  }

  initializeMap(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!navigator.geolocation) { this.error = 'Geolocation is not supported.'; return; }

    this.loading = true;
    // navigator.geolocation.getCurrentPosition(
    //   position => {
    //     this.ngZone.run(() => {
    //       this.userLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
    //       this.createMap();
    //       this.searchNearbyHotels();
    //       this.loading = false;
    //     });
    //   },
    //   () => {
    //     this.ngZone.run(() => { this.error = 'Geolocation permission denied.'; this.loading = false; });
    //   }
    // );

    navigator.geolocation.getCurrentPosition(
      position => {

        console.log("Latitude:", position.coords.latitude);
        console.log("Longitude:", position.coords.longitude);
        console.log("Accuracy:", position.coords.accuracy);

        this.userLocation = {
          lat: 22.5726,
          lng: 88.3639
        };

        this.createMap();
        this.searchNearbyHotels();

      },
      error => console.log(error),
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 15000
      }
    );

  }



  createMap(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    this.map = new google.maps.Map(mapElement, {
      center: this.userLocation,
      zoom: 14
    });

    new google.maps.Marker({
      position: this.userLocation,
      map: this.map,
      title: 'Your Location',
      icon: { url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' }
    });
  }

  getHotelRating(hotel: google.maps.places.PlaceResult): number {
    if (hotel.rating !== undefined && hotel.rating !== null) {
      return hotel.rating;
    }
    const name = hotel.name || '';
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return 3.5 + Math.abs(hash % 14) / 10;
  }

  getHotelPriceLevel(hotel: google.maps.places.PlaceResult): number {
    if (hotel.price_level !== undefined && hotel.price_level !== null) {
      return hotel.price_level;
    }
    const name = hotel.name || '';
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash % 3) + 1;
  }

  searchNearbyHotels(): void {
    if (!this.map) return;
    const service = new google.maps.places.PlacesService(this.map);
    service.nearbySearch({
      location: this.userLocation, radius: 10000, type: 'lodging' as any
    }, (results, status) => {
      this.ngZone.run(() => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          this.error = '';
          this.hotels = results;
          this.applyFilters();
        } else { this.error = 'No hotels found nearby.'; }
      });
    });
  }

  searchHotels(): void {
    if (!this.searchQuery.trim()) { this.searchNearbyHotels(); return; }
    if (!this.map) return;

    const service = new google.maps.places.PlacesService(this.map);
    service.textSearch({ query: `${this.searchQuery} hotels`, type: 'lodging' as any }, (results, status) => {
      this.ngZone.run(() => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          this.error = '';
          this.hotels = results;
          this.applyFilters();
          if (results.length > 0 && results[0].geometry?.location) {
            this.map.setCenter(results[0].geometry.location);
            this.map.setZoom(14);
          }
        } else { this.error = 'No hotels found for your search.'; }
      });
    });
  }

  clearMarkers(): void {
    this.markers.forEach(marker => marker.setMap(null));
    this.markers = [];
  }

  addHotelMarkers(): void {
    if (!this.map) return;
    this.clearMarkers();
    this.filteredHotels.forEach(hotel => {
      if (!hotel.geometry?.location) return;
      const marker = new google.maps.Marker({ position: hotel.geometry.location, map: this.map, title: hotel.name });
      const infoWindow = new google.maps.InfoWindow({
        content: `<div style="padding:10px; max-width:200px;"><strong style="font-size:14px;">${hotel.name}</strong><br><span style="color:#666; font-size:12px;">${hotel.vicinity || ''}</span><br><div style="margin-top:5px;">Rating: <strong>${hotel.rating || 'N/A'}</strong> ⭐</div><a href="https://www.google.com/maps/dir/?api=1&origin=${this.userLocation.lat},${this.userLocation.lng}&destination=${hotel.geometry.location.lat()},${hotel.geometry.location.lng()}&travelmode=driving" target="_blank" style="display:inline-block; margin-top:8px; color:#ef4136; text-decoration:none; font-weight:bold;">Get Directions</a></div>`
      });
      marker.addListener('click', () => infoWindow.open(this.map, marker));
      this.markers.push(marker);
    });
  }

  getDirections(hotel: google.maps.places.PlaceResult): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!hotel.geometry?.location) return;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${this.userLocation.lat},${this.userLocation.lng}&destination=${hotel.geometry.location.lat()},${hotel.geometry.location.lng()}&travelmode=driving`;
    window.open(url, '_blank');
  }

  getStarRating(rating: number): string {
    if (!rating) return '';
    return '⭐'.repeat(Math.floor(rating));
  }

  getDistance(hotel: google.maps.places.PlaceResult): number {
    if (!this.userLocation || !hotel.geometry?.location) return Infinity;
    const lat1 = this.userLocation.lat;
    const lng1 = this.userLocation.lng;

    const loc = hotel.geometry.location;
    const lat2 = typeof loc.lat === 'function' ? loc.lat() : (loc as any).lat;
    const lng2 = typeof loc.lng === 'function' ? loc.lng() : (loc as any).lng;

    const dLat = lat2 - lat1;
    const dLng = lng2 - lng1;
    return dLat * dLat + dLng * dLng;
  }

  applyFilters(): void {
    let filtered = [...this.hotels];
    if (this.minRating) {
      filtered = filtered.filter(h => h.rating !== undefined && h.rating >= parseFloat(this.minRating));
    }
    if (this.priceLevel) {
      filtered = filtered.filter(h => h.price_level !== undefined && h.price_level <= parseInt(this.priceLevel));
    }
    if (this.sortBy === 'rating') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (this.sortBy === 'name') {
      filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (this.sortBy === 'distance') {
      filtered.sort((a, b) => this.getDistance(a) - this.getDistance(b));
    }
    this.filteredHotels = filtered;
    this.addHotelMarkers();
  }

  clearFilters(): void {
    this.minRating = '';
    this.priceLevel = '';
    this.sortBy = 'rating';
    this.applyFilters();
  }
}