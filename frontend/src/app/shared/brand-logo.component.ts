import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-brand-logo',
  standalone: true,
  imports: [NgIf],
  template: `
    <div class="brand-logo" [class.compact]="compact" [class.light]="light">
      <svg class="brand-icon" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="currentColor" opacity=".12"/>
        <path d="M6 19h20v3a2 2 0 01-2 2H8a2 2 0 01-2-2v-3z" fill="#F97316"/>
        <path d="M7 11h18l2 8H5l2-8z" fill="currentColor"/>
        <circle cx="10" cy="22" r="2" fill="currentColor"/>
        <circle cx="22" cy="22" r="2" fill="currentColor"/>
      </svg>
      <span class="brand-text">Yatra<span class="accent">Go</span></span>
      <span class="brand-badge" *ngIf="badge">{{badge}}</span>
    </div>
  `,
})
export class BrandLogoComponent {
  @Input() light = false;
  @Input() compact = false;
  @Input() badge = '';
}
