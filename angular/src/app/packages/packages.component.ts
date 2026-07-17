import { Component, ElementRef, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-packages',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './packages.component.html',
  styleUrls: ['./packages.component.css']
})
export class PackagesComponent {

  @ViewChild('slider') slider!: ElementRef;

  constructor(@Inject(PLATFORM_ID) private platformId: any) {}

  activeTab = 'search';

  tabs = [
    { id: 'search', label: 'Search', icon: 'fas fa-search' },
    { id: 'group',  label: 'Group Packages', icon: 'fas fa-users' }
  ];

  switchTab(tabId: string, index: number) {
    this.activeTab = tabId;

    // Run DOM code ONLY in browser
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        const tabEls = document.querySelectorAll('.tab');
        const active = tabEls[index] as HTMLElement;

        if (active && this.slider) {
          this.slider.nativeElement.style.width  = active.offsetWidth + 'px';
          this.slider.nativeElement.style.left   = active.offsetLeft  + 'px';
        }
      }, 10);
    }
  }

  ngAfterViewInit() {
    // Run DOM code ONLY in browser
    if (isPlatformBrowser(this.platformId)) {
      this.switchTab(this.activeTab, 0);
    }
  }
}