import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NgChartsModule } from 'ng2-charts'; // ✅ Fixed import
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

interface AnalyticsData {
  totalUsers?: number;
  verifiedUsers?: number;
  adminUsers?: number;
  monthlyRegistrations?: any[];
  totalBookings?: number;
  monthlyBookings?: any[];
  bookingStatus?: any[];
  totalRevenue?: number;
  monthlyRevenue?: any[];
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterModule, CommonModule, NgChartsModule], // ✅ Fixed (removed BaseChartDirective)
  templateUrl: './dashboard.component.html',
  styles: [`
    .card:hover {
      transform: translateY(-5px);
      transition: transform 0.3s ease;
    }
  `]
})
export class DashboardComponent implements OnInit {
  analytics: AnalyticsData = {};
  loadingAnalytics = true;

  // User Registration Chart
  userChartType: ChartType = 'line';
  userChartData: ChartData<'line'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'User Registrations',
      borderColor: '#007bff',
      backgroundColor: 'rgba(0, 123, 255, 0.1)',
      tension: 0.4
    }]
  };
  userChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: { legend: { display: true } }
  };

  // Revenue Chart
  revenueChartType: ChartType = 'bar';
  revenueChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Monthly Revenue ($)',
      backgroundColor: '#28a745',
      borderColor: '#28a745'
    }]
  };
  revenueChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: { legend: { display: true } }
  };

  // Booking Status Chart
  bookingStatusChartType: ChartType = 'doughnut';
  bookingStatusChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: ['#28a745', '#ffc107', '#dc3545', '#6c757d'],
      borderColor: ['#28a745', '#ffc107', '#dc3545', '#6c757d']
    }]
  };
  bookingStatusChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: { legend: { display: true } }
  };

  // Monthly Bookings Chart
  bookingChartType: ChartType = 'line';
  bookingChartData: ChartData<'line'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Monthly Bookings',
      borderColor: '#ffc107',
      backgroundColor: 'rgba(255, 193, 7, 0.1)',
      tension: 0.4
    }]
  };
  bookingChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: { legend: { display: true } }
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadAnalytics();
  }

  loadAnalytics() {
    this.loadingAnalytics = true;

    // Mock data for demonstration (replace with real API calls once backend is ready)
    const mockUserData: AnalyticsData = {
      totalUsers: 1250,
      verifiedUsers: 980,
      adminUsers: 15,
      monthlyRegistrations: [
        { year: 2023, month: 1, count: 45 },
        { year: 2023, month: 2, count: 62 },
        { year: 2023, month: 3, count: 78 },
        { year: 2023, month: 4, count: 95 },
        { year: 2023, month: 5, count: 112 },
        { year: 2023, month: 6, count: 134 },
        { year: 2023, month: 7, count: 156 },
        { year: 2023, month: 8, count: 178 },
        { year: 2023, month: 9, count: 201 },
        { year: 2023, month: 10, count: 223 },
        { year: 2023, month: 11, count: 245 },
        { year: 2023, month: 12, count: 267 }
      ]
    };

    const mockBookingData: AnalyticsData = {
      totalBookings: 4567,
      monthlyBookings: [
        { year: 2023, month: 1, count: 123 },
        { year: 2023, month: 2, count: 145 },
        { year: 2023, month: 3, count: 167 },
        { year: 2023, month: 4, count: 189 },
        { year: 2023, month: 5, count: 210 },
        { year: 2023, month: 6, count: 232 },
        { year: 2023, month: 7, count: 254 },
        { year: 2023, month: 8, count: 276 },
        { year: 2023, month: 9, count: 298 },
        { year: 2023, month: 10, count: 320 },
        { year: 2023, month: 11, count: 342 },
        { year: 2023, month: 12, count: 364 }
      ],
      bookingStatus: [
        { status: 'Confirmed', count: 2890 },
        { status: 'Pending', count: 1234 },
        { status: 'Cancelled', count: 345 },
        { status: 'Completed', count: 98 }
      ]
    };

    const mockRevenueData: AnalyticsData = {
      totalRevenue: 125000,
      monthlyRevenue: [
        { year: 2023, month: 1, revenue: 4500 },
        { year: 2023, month: 2, revenue: 6200 },
        { year: 2023, month: 3, revenue: 7800 },
        { year: 2023, month: 4, revenue: 9500 },
        { year: 2023, month: 5, revenue: 11200 },
        { year: 2023, month: 6, revenue: 13400 },
        { year: 2023, month: 7, revenue: 15600 },
        { year: 2023, month: 8, revenue: 17800 },
        { year: 2023, month: 9, revenue: 20100 },
        { year: 2023, month: 10, revenue: 22300 },
        { year: 2023, month: 11, revenue: 24500 },
        { year: 2023, month: 12, revenue: 26700 }
      ]
    };

    // Simulate API delay
    setTimeout(() => {
      this.analytics = {
        ...mockUserData,
        ...mockBookingData,
        ...mockRevenueData
      };
      this.updateCharts();
      this.loadingAnalytics = false;
    }, 1000);
  }

  updateCharts() {
    // User Registration Chart
    if (this.analytics.monthlyRegistrations) {
      this.userChartData.labels = this.analytics.monthlyRegistrations.map(item =>
        `${item.year}-${String(item.month).padStart(2, '0')}`
      );
      this.userChartData.datasets[0].data = this.analytics.monthlyRegistrations.map(item => item.count);
    }

    // Revenue Chart
    if (this.analytics.monthlyRevenue) {
      this.revenueChartData.labels = this.analytics.monthlyRevenue.map(item =>
        `${item.year}-${String(item.month).padStart(2, '0')}`
      );
      this.revenueChartData.datasets[0].data = this.analytics.monthlyRevenue.map(item => item.revenue || 0);
    }

    // Booking Status Chart
    if (this.analytics.bookingStatus) {
      this.bookingStatusChartData.labels = this.analytics.bookingStatus.map(item => item.status);
      this.bookingStatusChartData.datasets[0].data = this.analytics.bookingStatus.map(item => item.count);
    }

    // Monthly Bookings Chart
    if (this.analytics.monthlyBookings) {
      this.bookingChartData.labels = this.analytics.monthlyBookings.map(item =>
        `${item.year}-${String(item.month).padStart(2, '0')}`
      );
      this.bookingChartData.datasets[0].data = this.analytics.monthlyBookings.map(item => item.count);
    }
  }
}
