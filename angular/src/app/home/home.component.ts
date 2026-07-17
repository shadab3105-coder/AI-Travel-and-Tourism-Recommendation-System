import {
  Component,
  OnInit,
  NgZone,
  HostListener,
  Inject,
  PLATFORM_ID,
  OnDestroy
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { AuthService } from '../auth/auth.service';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GOOGLE_MAPS_API_KEY } from '../app.config';
import { RegisterComponent } from '../auth/register/register.component';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

interface DestinationRecommendation {
  destination: string;
  country: string;
  category: string;
  price_range: string;
  popularity: number;
  rating: number;
  description: string;
  score: number;
  data_source: string;
}

interface TravelDeal {
  title: string;
  discount: string;
  image: string;
  price: number;
  originalPrice?: number;
  description?: string;
}

interface TrendingDestination {
  city: string;
  country: string;
  image: string;
  price: number;
  rating: number;
  trendingScore?: number;
}

// interface NearbyAttraction {
//   name: string;
//   vicinity: string;
//   geometry?: {
//     location: google.maps.LatLngLiteral;
//   };
//   travelTime?: string;
//   distance?: string;
// }

export interface NearbyAttraction {

  name: string;

  vicinity: string;

  geometry?: any;

  photoUrl?: string;

  rating?: number;

  totalRatings?: number;

  openNow?: boolean | null;

  travelTime?: string;

  distance?: string;

}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, CommonModule, MatDialogModule, RegisterComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  /* ================= USER STATE ================= */
  currentUser: any = null;
  private userSubscription!: Subscription;

  /* ================= RECOMMENDATIONS ================= */
  destinationRecommendations: DestinationRecommendation[] = [];
  loadingDestinationRecommendations = false;

  /* ================= MAPS / NEARBY ================= */
  nearbyAttractions: NearbyAttraction[] = [];
  loadingNearby = false;
  errorNearby = '';
  userLocation!: google.maps.LatLngLiteral;
  showNearbyPanel = false;
  activeServiceTab = 'flights';

  /* ================= MODAL STATE ================= */
  showRegisterModal = false;

  // ***********overviewmodal************
  selectedAttraction: any;

  placeOverview = '';

  loadingOverview = false;
  showAttractionModal = false;

  placeInfo: any = {};

  /* ================= VIEW ALL STATE ================= */
  showAllDeals = false;

  /* ================= STATIC DATA ================= */
  travelDeals: TravelDeal[] = [
    {
      title: 'Summer in Bali',
      discount: '20% OFF',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80',
      price: 899,
      originalPrice: 1124,
      description: '5 Nights All-Inclusive Resort'
    },
    {
      title: 'Paris Romance',
      discount: 'Flat $50 OFF',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80',
      price: 1200,
      originalPrice: 1250,
      description: 'City of Love Package'
    },
    {
      title: 'Tokyo Adventure',
      discount: '15% OFF',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=600&q=80',
      price: 1500,
      originalPrice: 1765,
      description: 'Cultural Experience Package'
    },
    {
      title: 'Maldives Paradise',
      discount: '25% OFF',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80',
      price: 2200,
      originalPrice: 2933,
      description: '7 Nights Overwater Bungalow'
    },
    {
      title: 'Swiss Alps Escape',
      discount: 'Free Breakfast',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80',
      price: 1350,
      originalPrice: 1500,
      description: 'Mountain Resort Getaway'
    },
    {
      title: 'Barcelona Fiesta',
      discount: '10% OFF',
      image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=600&q=80',
      price: 950,
      originalPrice: 1056,
      description: 'Tapas & Culture Experience'
    },
    {
      title: 'Santorini Sunset',
      discount: '30% OFF',
      image: 'https://images.unsplash.com/photo-1613395877344-13d4c79e4284?auto=format&fit=crop&w=600&q=80',
      price: 1800,
      originalPrice: 2571,
      description: 'Romantic Island Getaway'
    },
    {
      title: 'New York City Break',
      discount: 'Flat $100 OFF',
      image: 'https://images.unsplash.com/photo-1496442226666-8d4a0e94f92c?auto=format&fit=crop&w=600&q=80',
      price: 1100,
      originalPrice: 1200,
      description: 'The City That Never Sleeps'
    },
    {
      title: 'Kyoto Temples',
      discount: '18% OFF',
      image: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=600&q=80',
      price: 1200,
      originalPrice: 1463,
      description: 'Ancient Culture & Tradition'
    },
    {
      title: 'Iceland Northern Lights',
      discount: 'Free Transfer',
      image: 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&w=600&q=80',
      price: 2200,
      originalPrice: 2500,
      description: 'Aurora & Glacier Adventure'
    },
    {
      title: 'Morocco Desert Safari',
      discount: '25% OFF',
      image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d0b7ef?auto=format&fit=crop&w=600&q=80',
      price: 850,
      originalPrice: 1133,
      description: 'Camel Trek & Starry Nights'
    },
    {
      title: 'Venice Canals',
      discount: '12% OFF',
      image: 'https://images.unsplash.com/photo-1514890547357-aad4b9836506?auto=format&fit=crop&w=600&q=80',
      price: 1300,
      originalPrice: 1477,
      description: 'Gondola Rides & Romance'
    },
    {
      title: 'Thailand Islands',
      discount: 'Free Meals',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80',
      price: 950,
      originalPrice: 1100,
      description: 'Phi Phi & Krabi Paradise'
    },
    {
      title: 'Scotland Highlands',
      discount: '20% OFF',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80',
      price: 1400,
      originalPrice: 1750,
      description: 'Castles & Loch Adventures'
    },
    {
      title: 'Rio Carnival',
      discount: 'Flat $75 OFF',
      image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80',
      price: 1600,
      originalPrice: 1675,
      description: 'Samba & Beach Culture'
    },
    {
      title: 'Vietnam Halong Bay',
      discount: '15% OFF',
      image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=600&q=80',
      price: 1100,
      originalPrice: 1294,
      description: 'Junk Boat & Cave Exploration'
    },
    {
      title: 'New Zealand Adventure',
      discount: 'Free Activities',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80',
      price: 2500,
      originalPrice: 2800,
      description: 'Bungee & Lord of the Rings'
    },
    {
      title: 'Egypt Pyramids',
      discount: '22% OFF',
      image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d0b7ef?auto=format&fit=crop&w=600&q=80',
      price: 1200,
      originalPrice: 1538,
      description: 'Ancient Wonders Tour'
    },
    {
      title: 'Peru Machu Picchu',
      discount: 'Free Guide',
      image: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&w=600&q=80',
      price: 1800,
      originalPrice: 2000,
      description: 'Inca Trail Experience'
    },
    {
      title: 'Turkey Cappadocia',
      discount: '18% OFF',
      image: 'https://images.unsplash.com/photo-1520637836862-4d197d17c155?auto=format&fit=crop&w=600&q=80',
      price: 950,
      originalPrice: 1159,
      description: 'Hot Air Balloon & Fairy Chimneys'
    },
    {
      title: 'Greece Islands Hop',
      discount: '25% OFF',
      image: 'https://images.unsplash.com/photo-1501436513145-30f24e19fcc8?auto=format&fit=crop&w=600&q=80',
      price: 1600,
      originalPrice: 2133,
      description: 'Santorini to Mykonos'
    },
    {
      title: 'Canada Rockies',
      discount: 'Free Ski Pass',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80',
      price: 1900,
      originalPrice: 2200,
      description: 'Banff & Jasper National Park'
    },
    {
      title: 'Japan Cherry Blossoms',
      discount: '20% OFF',
      image: 'https://images.unsplash.com/photo-1524413840807-0c3cb103ad81?auto=format&fit=crop&w=600&q=80',
      price: 1400,
      originalPrice: 1750,
      description: 'Spring Sakura Season'
    },
    {
      title: 'Australia Great Barrier Reef',
      discount: 'Flat $150 OFF',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80',
      price: 2200,
      originalPrice: 2350,
      description: 'Snorkeling & Marine Life'
    },
    {
      title: 'Italy Amalfi Coast',
      discount: '15% OFF',
      image: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?auto=format&fit=crop&w=600&q=80',
      price: 1700,
      originalPrice: 2000,
      description: 'Cliffside Villages & Sea'
    },
    {
      title: 'Norway Fjords',
      discount: 'Free Cruise',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80',
      price: 2100,
      originalPrice: 2400,
      description: 'Glacier Hiking & Northern Lights'
    },
    {
      title: 'Mexico Yucatan',
      discount: '22% OFF',
      image: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=600&q=80',
      price: 1100,
      originalPrice: 1410,
      description: 'Cenotes & Mayan Ruins'
    },
    {
      title: 'South Africa Safari',
      discount: 'Free Transfer',
      image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80',
      price: 2800,
      originalPrice: 3100,
      description: 'Big Five Wildlife Experience'
    },
    {
      title: 'Portugal Algarve',
      discount: '18% OFF',
      image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=600&q=80',
      price: 1200,
      originalPrice: 1463,
      description: 'Cliffs & Beaches Paradise'
    },
    {
      title: 'Croatia Islands',
      discount: '25% OFF',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=600&q=80',
      price: 1400,
      originalPrice: 1867,
      description: 'Adriatic Sea Hopping'
    },
    {
      title: 'Chile Patagonia',
      discount: 'Free Meals',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80',
      price: 2300,
      originalPrice: 2600,
      description: 'Glaciers & Torres del Paine'
    },
    {
      title: 'Vietnam Mekong Delta',
      discount: '20% OFF',
      image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=600&q=80',
      price: 800,
      originalPrice: 1000,
      description: 'Floating Markets & Culture'
    },
    {
      title: 'Spain Costa Brava',
      discount: 'Flat $80 OFF',
      image: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?auto=format&fit=crop&w=600&q=80',
      price: 1100,
      originalPrice: 1180,
      description: 'Mediterranean Coastline'
    },
    {
      title: 'Indonesia Komodo',
      discount: '15% OFF',
      image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?auto=format&fit=crop&w=600&q=80',
      price: 1900,
      originalPrice: 2235,
      description: 'Dragons & Diving Paradise'
    },
    {
      title: 'Jordan Petra',
      discount: 'Free Guide',
      image: 'https://images.unsplash.com/photo-1588781949913-124c1e4e4b57?auto=format&fit=crop&w=600&q=80',
      price: 1300,
      originalPrice: 1500,
      description: 'Rose City & Desert Castles'
    },
    {
      title: 'Bhutan Himalayas',
      discount: '22% OFF',
      image: 'https://images.unsplash.com/photo-1544008230-ac1e1fb4f4f9?auto=format&fit=crop&w=600&q=80',
      price: 2500,
      originalPrice: 3205,
      description: 'Gross National Happiness'
    },
    {
      title: 'Argentina Tango',
      discount: 'Free Lessons',
      image: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?auto=format&fit=crop&w=600&q=80',
      price: 1500,
      originalPrice: 1800,
      description: 'Buenos Aires Culture'
    },
    {
      title: 'Malaysia Borneo',
      discount: '18% OFF',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=600&q=80',
      price: 1600,
      originalPrice: 1951,
      description: 'Orangutans & Rainforests'
    },
    {
      title: 'Sweden Lapland',
      discount: '25% OFF',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80',
      price: 2000,
      originalPrice: 2667,
      description: 'Santa & Aurora Experience'
    },
    {
      title: 'Kenya Maasai Mara',
      discount: 'Free Transfer',
      image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80',
      price: 2400,
      originalPrice: 2700,
      description: 'Great Migration Safari'
    },
    {
      title: 'France Provence',
      discount: '20% OFF',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80',
      price: 1300,
      originalPrice: 1625,
      description: 'Lavender Fields & Wine'
    },
    {
      title: 'Fiji Overwater',
      discount: 'Flat $200 OFF',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80',
      price: 2800,
      originalPrice: 3000,
      description: 'Pacific Paradise Resort'
    },
    {
      title: 'Cuba Havana',
      discount: '15% OFF',
      image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=600&q=80',
      price: 1200,
      originalPrice: 1412,
      description: 'Classic Cars & Salsa'
    },
    {
      title: 'Nepal Everest',
      discount: 'Free Porter',
      image: 'https://images.unsplash.com/photo-1544008230-ac1e1fb4f4f9?auto=format&fit=crop&w=600&q=80',
      price: 2200,
      originalPrice: 2500,
      description: 'Base Camp Trek Adventure'
    },
    {
      title: 'Slovenia Lakes',
      discount: '22% OFF',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80',
      price: 1100,
      originalPrice: 1410,
      description: 'Julian Alps & Emerald Waters'
    },
    {
      title: 'Myanmar Temples',
      discount: 'Free Visa',
      image: 'https://images.unsplash.com/photo-1520637836862-4d197d17c155?auto=format&fit=crop&w=600&q=80',
      price: 1400,
      originalPrice: 1500,
      description: 'Golden Land Discovery'
    },
    {
      title: 'Colombia Coffee',
      discount: '18% OFF',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80',
      price: 1000,
      originalPrice: 1220,
      description: 'Axis of Coffee & Culture'
    },
    {
      title: 'Mongolia Steppe',
      discount: '25% OFF',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80',
      price: 1800,
      originalPrice: 2400,
      description: 'Nomadic Life & Gobi Desert'
    },
    {
      title: 'Sri Lanka Tea',
      discount: 'Free Transfer',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=600&q=80',
      price: 900,
      originalPrice: 1050,
      description: 'Hill Country & Beaches'
    },
    {
      title: 'Romania Castles',
      discount: '20% OFF',
      image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=600&q=80',
      price: 850,
      originalPrice: 1063,
      description: 'Dracula & Carpathian Mountains'
    },
    {
      title: 'Ethiopia Tribes',
      discount: 'Flat $100 OFF',
      image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80',
      price: 1600,
      originalPrice: 1700,
      description: 'Simien Mountains & Tribes'
    },
    {
      title: 'Laos Mekong',
      discount: '15% OFF',
      image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=600&q=80',
      price: 1100,
      originalPrice: 1294,
      description: 'Land of a Million Elephants'
    },
    {
      title: 'Armenia History',
      discount: 'Free Guide',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=600&q=80',
      price: 950,
      originalPrice: 1100,
      description: 'Ancient Churches & Wine'
    },
    {
      title: 'Georgia Caucasus',
      discount: '22% OFF',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=600&q=80',
      price: 1200,
      originalPrice: 1538,
      description: 'Mountains & Ancient Silk Road'
    },
    {
      title: 'Namibia Desert',
      discount: 'Free Meals',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80',
      price: 2100,
      originalPrice: 2400,
      description: 'Dunes & Wildlife Safari'
    },
    {
      title: 'Uruguay Beaches',
      discount: '18% OFF',
      image: 'https://images.unsplash.com/photo-1501436513145-30f24e19fcc8?auto=format&fit=crop&w=600&q=80',
      price: 1300,
      originalPrice: 1585,
      description: 'Atlantic Coast Paradise'
    },
    {
      title: 'Kazakhstan Steppes',
      discount: '25% OFF',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80',
      price: 1700,
      originalPrice: 2267,
      description: 'Eagle Hunting & Nomads'
    },
    {
      title: 'Madagascar Wildlife',
      discount: 'Free Transfer',
      image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80',
      price: 1900,
      originalPrice: 2200,
      description: 'Lemurs & Unique Biodiversity'
    },
    {
      title: 'Albania Adriatic',
      discount: '20% OFF',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=600&q=80',
      price: 800,
      originalPrice: 1000,
      description: 'Bunkers & Beautiful Beaches'
    },
    {
      title: 'Bosnia Pyramids',
      discount: 'Flat $60 OFF',
      image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=600&q=80',
      price: 900,
      originalPrice: 960,
      description: 'Ancient Mysteries & Nature'
    }
  ];

  globalTrending: TrendingDestination[] = [
    {
      city: 'Paris',
      country: 'France',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&h=320&q=80',
      price: 1200,
      rating: 4.9,
      trendingScore: 95
    },
    {
      city: 'Bali',
      country: 'Indonesia',
      image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?auto=format&fit=crop&w=400&h=320&q=80',
      price: 850,
      rating: 4.8,
      trendingScore: 92
    },
    {
      city: 'Tokyo',
      country: 'Japan',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=400&h=320&q=80',
      price: 1500,
      rating: 4.9,
      trendingScore: 88
    },
    // {
    //   city: 'New York',
    //   country: 'USA',
    //   image: 'https://images.unsplash.com/photo-1496442226666-8d4a0e94f92c?auto=format&fit=crop&w=400&h=320&q=80',
    //   price: 1100,
    //   rating: 4.7,
    //   trendingScore: 85
    // },
    // {
    //   city: 'Santorini',
    //   country: 'Greece',
    //   image: 'https://images.unsplash.com/photo-1613395877344-13d4c79e4284?auto=format&fit=crop&w=400&h=320&q=80',
    //   price: 1800,
    //   rating: 4.9,
    //   trendingScore: 90
    // },
    {
      city: 'Dubai',
      country: 'UAE',
      image: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?fm=jpg&q=60&w=400&h=320&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZHViYWl8ZW58MHx8MHx8fDA%3D',
      price: 1400,
      rating: 4.8,
      trendingScore: 87
    },
    // {
    //   city: 'Amsterdam',
    //   country: 'Netherlands',
    //   image: 'https://images.unsplash.com/photo-1534351590666-13e3e963b3b6?auto=format&fit=crop&w=400&h=320&q=80',
    //   price: 950,
    //   rating: 4.7,
    //   trendingScore: 83
    // },
    {
      city: 'Sydney',
      country: 'Australia',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400&h=320&q=80',
      price: 2000,
      rating: 4.9,
      trendingScore: 89
    }
  ];

  trendingHotels = [
    {
      name: 'Grand Hyatt',
      location: 'Goa',
      rating: 4.8,
      price: 12000,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Taj Lands End',
      location: 'Mumbai',
      rating: 4.9,
      price: 18500,
      image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'The Oberoi',
      location: 'New Delhi',
      rating: 4.7,
      price: 15000,
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Ritz Carlton',
      location: 'Bangalore',
      rating: 4.9,
      price: 22000,
      image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80'
    }
  ];

  /* ================= CAROUSEL STATE ================= */
  activeSlides: any = { nearby: 0, deals: 0, trending: 0, rec: 0, hotels: 0 };
  itemsPerPage = 4;

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private ngZone: NgZone,
    private router: Router,
    private dialog: MatDialog,
    @Inject(PLATFORM_ID) private platformId: any
  ) { }

  /* ================= LIFECYCLE ================= */
  ngOnInit() {
    this.updateItemsPerPage();

    // Subscribe to user changes
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadDestinationRecommendations();
      }
    });
  }

  ngOnDestroy() {
    // Clean up subscriptions
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.updateItemsPerPage();
  }

  /* ================= DATA LOADING ================= */
  loadDestinationRecommendations() {
    if (!this.authService.isLoggedIn()) return;

    this.loadingDestinationRecommendations = true;
    const token = this.authService.getToken();
    const headers = token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();

    this.http.get<{ message: string; recommendations: DestinationRecommendation[] }>(
      'http://localhost:3001/api/destination-recommendations-new',
      { headers }
    ).subscribe({
      next: (response) => {
        this.destinationRecommendations = response.recommendations;
        this.loadingDestinationRecommendations = false;
      },
      error: (error) => {
        console.error('Recommendations Error', error);
        this.loadingDestinationRecommendations = false;

        // Fallback to static recommendations if API fails
        this.destinationRecommendations = this.getFallbackRecommendations();
      }
    });
  }

  /* ================= CAROUSEL METHODS ================= */
  updateItemsPerPage() {
    if (isPlatformBrowser(this.platformId)) {
      const width = window.innerWidth;
      this.itemsPerPage = width < 768 ? 1 : (width < 992 ? 2 : 4);
    }
  }

  scrollCarousel(carouselId: string, direction: number) {
    if (isPlatformBrowser(this.platformId)) {
      const carousel = document.getElementById(`${carouselId}-carousel`);
      if (carousel) {
        const scrollAmount = 300 * direction;
        carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  }


  // **********************modaloverview*******************

  openAttractionModal(attraction: any) {

    this.selectedAttraction = attraction;

    this.showAttractionModal = true;

    this.loadingOverview = true;

    this.placeOverview = '';

    // this.http.get<any>(

    //   `http://localhost:3001/api/place-overview?place=${encodeURIComponent(attraction.name)}`

    // ).subscribe({

    //   next: (res) => {

    //     this.placeOverview = res.overview;

    //     this.loadingOverview = false;

    //   },

    //   error: () => {

    //     this.placeOverview = "Overview unavailable.";

    //     this.loadingOverview = false;

    //   }

    // });

    // this.http.get<any>(

    //   `http://localhost:3001/api/place-overview?place=${encodeURIComponent(attraction.name)}`

    // ).subscribe({

    //   next: (res) => {

    //     this.placeInfo = res;

    //     console.log("place info***", this.placeInfo);


    //     this.placeOverview = res.overview;

    //     this.loadingOverview = false;

    //   },

    //   error: () => {

    //     this.loadingOverview = false;

    //   }

    // });

    this.http.get<any>(
      `http://localhost:3001/api/place-overview?place=${encodeURIComponent(
        attraction.name + ", " + attraction.vicinity
      )}`
    ).subscribe({
      next: (res) => {
        this.placeInfo = res;
        this.placeOverview = res.overview;
        this.loadingOverview = false;
      },
      error: () => {
        this.loadingOverview = false;
      }
    });

  }

  closeAttractionModal() {

    this.showAttractionModal = false;

    this.selectedAttraction = null;

    this.placeOverview = '';

  }







  // Alias method for compatibility with HTML template
  scroll(element: HTMLElement, direction: string): void {
    const scrollAmount = element.clientWidth;
    element.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  }

  onScroll(event: any, category: string) {
    const element = event.target;
    const index = Math.round(element.scrollLeft / element.clientWidth);
    this.activeSlides[category] = index;
  }

  /* ================= NEARBY MAPS LOGIC ================= */
  toggleNearby() {
    this.showNearbyPanel = !this.showNearbyPanel;
    if (this.showNearbyPanel && this.nearbyAttractions.length === 0) {
      this.initializeNearby();
    }
  }

  refreshLocation(): void {
    this.nearbyAttractions = [];
    this.errorNearby = '';
    this.initializeNearby();
  }

  initializeNearby(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadGoogleMapsApi()
        .then(() => this.getUserLocation())
        .catch(err => {
          console.error('Google Maps API Error:', err);
          this.errorNearby = 'Failed to load maps. Please try again.';
          this.loadingNearby = false;
        });
    }
  }

  loadGoogleMapsApi(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!isPlatformBrowser(this.platformId)) {
        resolve();
        return;
      }

      if ((window as any).google?.maps) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = (err) => reject(err);
      document.head.appendChild(script);
    });
  }

  // getUserLocation(): void {
  //   if (!isPlatformBrowser(this.platformId)) return;

  //   if (typeof navigator === 'undefined' || !navigator.geolocation) {
  //     this.errorNearby = 'Geolocation not supported by your browser';
  //     this.loadingNearby = false;
  //     return;
  //   }

  //   this.loadingNearby = true;
  //   // navigator.geolocation.getCurrentPosition(
  //   //   pos => {
  //   //     this.ngZone.run(() => {
  //   //       this.userLocation = { 
  //   //         lat: pos.coords.latitude, 
  //   //         lng: pos.coords.longitude 
  //   //       };
  //   //       this.searchNearbyTouristAttractions();
  //   //     });
  //   //   },
  //   //   (error) => { 
  //   //     this.ngZone.run(() => { 
  //   //       this.errorNearby = this.getGeolocationError(error); 
  //   //       this.loadingNearby = false; 
  //   //     }); 
  //   //   },
  //   //   { timeout: 10000, enableHighAccuracy: true }
  //   // );

  //   navigator.geolocation.getCurrentPosition(
  //     position => {

  //       console.log("Latitude:", position.coords.latitude);
  //       console.log("Longitude:", position.coords.longitude);
  //       console.log("Accuracy:", position.coords.accuracy);

  //       this.ngZone.run(() => {
  //         this.userLocation = {
  //           lat: position.coords.latitude,
  //           lng: position.coords.longitude
  //         };

  //         this.searchNearbyTouristAttractions();
  //       });

  //     },
  //     error => {
  //       console.error(error);
  //     },
  //     {
  //       enableHighAccuracy: true,
  //       timeout: 30000,
  //       maximumAge: 0
  //     }
  //   );
  // }

  useDefaultLocation(): void {

    // Victoria Memorial, Kolkata
    this.userLocation = {
      lat: 22.56074643449899,
      lng: 88.39653711706758
    };

    this.errorNearby = '';

    this.searchNearbyTouristAttractions();
  }

  getUserLocation(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (!navigator.geolocation) {
      this.useDefaultLocation();
      return;
    }

    this.loadingNearby = true;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        console.log("Latitude:", pos.coords.latitude);
        console.log("Longitude:", pos.coords.longitude);
        console.log("Accuracy:", pos.coords.accuracy);

        this.ngZone.run(() => {

          // If accuracy is poor, use Kolkata
          if (pos.coords.accuracy > 1000) {
            console.warn("Low accuracy. Using Kolkata as default.");
            this.useDefaultLocation();
            return;
          }

          this.userLocation = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          };

          this.searchNearbyTouristAttractions();
        });
      },
      (error) => {
        console.error(error);
        this.ngZone.run(() => {
          this.useDefaultLocation();
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  }

  getGeolocationError(error: GeolocationPositionError): string {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return 'Location permission denied. Please enable location services.';
      case error.POSITION_UNAVAILABLE:
        return 'Location information unavailable.';
      case error.TIMEOUT:
        return 'Location request timed out. Please try again.';
      default:
        return 'Unable to get your location.';
    }
  }

  searchNearbyTouristAttractions(): void {
    if (!this.userLocation || !(window as any).google?.maps?.places) {
      this.errorNearby = 'Maps service not available';
      this.loadingNearby = false;
      return;
    }

    const service = new google.maps.places.PlacesService(document.createElement('div'));
    service.nearbySearch({
      location: this.userLocation,
      radius: 15000,
      type: 'tourist_attraction'
    }, (results, status, pagination) => {
      this.ngZone.run(() => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
          // this.nearbyAttractions = results.slice(0, 10).map(result => ({
          //   name: result.name || 'Unknown',
          //   vicinity: result.vicinity || '',
          //   geometry: result.geometry?.location ? { location: result.geometry.location.toJSON() } : undefined
          // }));
          this.nearbyAttractions = results.slice(0, 10).map(result => ({

            name: result.name || 'Unknown',

            vicinity: result.vicinity || '',

            geometry: result.geometry?.location
              ? {
                location: result.geometry.location.toJSON()
              }
              : undefined,

            rating: result.rating || 0,

            totalRatings: result.user_ratings_total || 0,

            // openNow:
            //   result.opening_hours?.isOpen?.() ??
            //   result.opening_hours?.open_now ??
            //   false,

            openNow:
              result.business_status === "OPERATIONAL"
                ? (
                  result.opening_hours?.isOpen?.() ??
                  result.opening_hours?.open_now ??
                  false
                )
                : false,

            photoUrl:
              result.photos && result.photos.length > 0
                ? result.photos[0].getUrl({
                  maxWidth: 600,
                  maxHeight: 400
                })
                : 'https://placehold.co/600x400?text=No+Image'

          }));
          this.calculateTravelTimes();
        } else {
          this.errorNearby = 'No tourist attractions found nearby.';
          this.loadingNearby = false;
        }
      });
    });
  }

  calculateTravelTimes(): void {
    if (!this.userLocation || this.nearbyAttractions.length === 0 || !(window as any).google?.maps) {
      this.loadingNearby = false;
      return;
    }

    const destinations = this.nearbyAttractions
      .map(attraction => attraction.geometry?.location)
      .filter((loc): loc is google.maps.LatLngLiteral => !!loc);

    if (destinations.length === 0) {
      this.loadingNearby = false;
      return;
    }

    const service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix({
      origins: [this.userLocation],
      destinations: destinations,
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.METRIC
    }, (response, status) => {
      this.ngZone.run(() => {
        if (status === google.maps.DistanceMatrixStatus.OK && response) {
          const rows = response.rows[0];
          this.nearbyAttractions.forEach((attraction, index) => {
            if (rows.elements[index]?.status === google.maps.DistanceMatrixElementStatus.OK) {
              attraction.travelTime = rows.elements[index].duration?.text || 'N/A';
              attraction.distance = rows.elements[index].distance?.text || 'N/A';
            } else {
              attraction.travelTime = 'N/A';
              attraction.distance = 'N/A';
            }
          });
        }
        this.loadingNearby = false;
      });
    });
  }

  getTravelTime(attraction: NearbyAttraction): string {
    return attraction.travelTime || 'N/A';
  }

  getDistance(attraction: NearbyAttraction): string {
    return attraction.distance || 'N/A';
  }

  saveAttraction(attraction: NearbyAttraction): void {
    console.log('Saving attraction:', attraction);
    // Implement save functionality here
    // Could save to local storage or send to backend
  }

  /* ================= MODAL METHODS ================= */
  openRegisterModal(): void {
    this.showRegisterModal = true;
  }

  closeRegisterModal(): void {
    this.showRegisterModal = false;
  }

  /* ================= ACTION METHODS ================= */
  viewDeal(deal: TravelDeal): void {
    this.router.navigate(['/deals'], { queryParams: { deal: deal.title } });
  }

  toggleViewAll(): void {
    this.showAllDeals = !this.showAllDeals;
  }

  exploreDestination(destination: TrendingDestination): void {
    this.router.navigate(['/flights'], {
      queryParams: {
        to: destination.city,
        country: destination.country
      }
    });
  }

  /* ================= HELPER METHODS ================= */
  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get user(): any {
    return this.currentUser;
  }

  getPages(totalItems: number): number[] {
    if (!totalItems) return [];
    const pageCount = Math.ceil(totalItems / this.itemsPerPage);
    return Array(pageCount).fill(0).map((_, i) => i);
  }

  // Fallback recommendations if API fails
  private getFallbackRecommendations(): DestinationRecommendation[] {
    return [
      {
        destination: 'Kyoto',
        country: 'Japan',
        category: 'History',
        price_range: '$1,200 - $1,800',
        popularity: 98,
        rating: 4.9,
        description: 'Based on your interest in culture, Kyoto offers stunning temples and cherry blossoms.',
        score: 98,
        data_source: 'Fallback'
      },
      {
        destination: 'Reykjavik',
        country: 'Iceland',
        category: 'Nature',
        price_range: '$1,500 - $2,200',
        popularity: 95,
        rating: 4.8,
        description: 'Since you like adventure, the Northern Lights and geothermal spas are a perfect match.',
        score: 95,
        data_source: 'Fallback'
      },
      {
        destination: 'Santorini',
        country: 'Greece',
        category: 'Romance',
        price_range: '$1,800 - $2,500',
        popularity: 99,
        rating: 4.9,
        description: 'A top pick for relaxation with breathtaking sunsets and volcanic beaches.',
        score: 92,
        data_source: 'Fallback'
      }
    ];
  }
}