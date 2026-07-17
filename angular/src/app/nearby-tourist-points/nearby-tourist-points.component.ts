import { Component, OnInit, NgZone, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { GOOGLE_MAPS_API_KEY } from '../app.config';

@Component({
  selector: 'app-nearby-tourist-points',
  templateUrl: './nearby-tourist-points.component.html',
  styleUrls: ['./nearby-tourist-points.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class NearbyTouristPointsComponent implements OnInit {
  map!: google.maps.Map;
  userLocation!: google.maps.LatLngLiteral;
  places: google.maps.places.PlaceResult[] = [];
  loading = false;
  error = '';

  // Precomputed photo URLs keyed by place_id — avoids calling getUrl() repeatedly in template
  photoUrls = new Map<string, string>();
  // Track places whose image URL failed to load
  imageErrors = new Set<string>();

  constructor(
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
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
    navigator.geolocation.getCurrentPosition(
      position => {
        this.ngZone.run(() => {
          this.userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          this.createMap();
          this.searchNearbyTouristAttractions();
          this.loading = false;
        });
      },
      () => {
        this.ngZone.run(() => {
          this.error = 'Geolocation permission denied. Please enable location services.';
          this.loading = false;
        });
      }
    );
  }

  createMap(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    this.map = new google.maps.Map(mapElement, {
      center: this.userLocation,
      zoom: 14,
      disableDefaultUI: false,
      zoomControl: true
    });

    new google.maps.Marker({
      position: this.userLocation,
      map: this.map,
      title: 'You are here',
      icon: { url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' }
    });
  }

  searchNearbyTouristAttractions(): void {
    if (!this.map) return;
    const service = new google.maps.places.PlacesService(this.map);
    const request: google.maps.places.PlaceSearchRequest = {
      location: this.userLocation,
      radius: 5000,
      type: 'tourist_attraction' as any
    };

    service.nearbySearch(request, (results, status) => {
      this.ngZone.run(() => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          this.places = results;
          this.addPlaceMarkers();
          // Precompute photo URLs for all places
          this.precomputePhotoUrls(service, results);
        } else {
          this.error = 'No tourist attractions found nearby.';
        }
      });
    });
  }

  /**
   * Precomputes photo URLs for all places at once.
   * - If nearbySearch already returned photos, uses those directly.
   * - If not, fires a getDetails() call to fetch full place data with photos.
   */
  precomputePhotoUrls(
    service: google.maps.places.PlacesService,
    results: google.maps.places.PlaceResult[]
  ): void {
    results.forEach(place => {
      const placeId = place.place_id;
      if (!placeId) return;

      if (place.photos && place.photos.length > 0) {
        // Photos already present from nearbySearch — use them directly
        try {
          const url = place.photos[0].getUrl({ maxWidth: 500, maxHeight: 280 });
          if (url) {
            this.ngZone.run(() => {
              this.photoUrls.set(placeId, url);
              this.cdr.detectChanges();
            });
          }
        } catch (e) {
          console.warn(`Could not get photo URL for ${place.name}`, e);
        }
      } else {
        // Fallback: fetch full details to get photos
        service.getDetails(
          { placeId, fields: ['photos'] },
          (details, detailStatus) => {
            if (
              detailStatus === google.maps.places.PlacesServiceStatus.OK &&
              details?.photos &&
              details.photos.length > 0
            ) {
              try {
                const url = details.photos[0].getUrl({ maxWidth: 500, maxHeight: 280 });
                if (url) {
                  this.ngZone.run(() => {
                    this.photoUrls.set(placeId, url);
                    this.cdr.detectChanges();
                  });
                }
              } catch (e) {
                console.warn(`Could not get detail photo URL for ${place.name}`, e);
              }
            }
          }
        );
      }
    });
  }

  /** Returns precomputed photo URL, or null if unavailable / errored */
  getPhotoUrl(place: google.maps.places.PlaceResult): string | null {
    const id = place.place_id;
    if (!id) return null;
    if (this.imageErrors.has(id)) return null;
    return this.photoUrls.get(id) ?? null;
  }

  /** Called when an <img> fails to load — marks place as errored and falls back to placeholder */
  onImageError(event: Event, place: google.maps.places.PlaceResult): void {
    if (place.place_id) {
      this.imageErrors.add(place.place_id);
    }
    (event.target as HTMLImageElement).style.display = 'none';
  }

  addPlaceMarkers(): void {
    if (!this.map) return;
    this.places.forEach(place => {
      if (!place.geometry?.location) return;

      const marker = new google.maps.Marker({
        position: place.geometry.location,
        map: this.map,
        title: place.name
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding:8px; font-family:sans-serif;">
            <strong style="font-size:14px; color:#1e293b;">${place.name}</strong><br>
            <span style="font-size:12px; color:#64748b;">${place.vicinity || ''}</span><br>
            <button id="btn-${place.place_id}" style="margin-top:8px; color:#ef4136; background:none; border:none; font-weight:bold; cursor:pointer; padding:0; text-decoration:underline;">
              Get Directions
            </button>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(this.map, marker);
        setTimeout(() => {
          const btn = document.getElementById(`btn-${place.place_id}`);
          if (btn) btn.onclick = () => this.getDirections(place);
        }, 100);
      });
    });
  }

  getDirections(place: google.maps.places.PlaceResult): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!place.geometry?.location) return;

    const origin = `${this.userLocation.lat},${this.userLocation.lng}`;
    const destination = `${place.geometry.location.lat()},${place.geometry.location.lng()}`;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;

    window.open(url, '_blank');
  }
}