import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { ApiService } from '../../services/api.service';

import { BrandLogoComponent } from '../../shared/brand-logo.component';

@Component({
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, BrandLogoComponent],
  template: `
  <header class="topbar">
    <app-brand-logo></app-brand-logo>
    <span class="greet">Hi, {{name}}</span>
    <nav>
      <button [class.active]="tab==='search'" (click)="tab='search'">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        Find Bus
      </button>
      <button [class.active]="tab==='bookings'" (click)="loadBookings()">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 9a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V9z"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        My Bookings
      </button>
      <button [class.active]="tab==='profile'" (click)="loadProfile()">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
        Profile
      </button>
      <button class="logout" (click)="logout()">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        Logout
      </button>
    </nav>
  </header>

  <div class="page-bg">
  <main class="container" *ngIf="tab==='search'">
    <section class="hero">
      <div class="hero-text">
        <h1>Plan Your Next Journey</h1>
        <p>Discover routes, choose your seat, and travel smarter with YatraGo.</p>
        <div class="hero-tags">
          <span class="hero-tag"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3 7h7l-5.5 4.5 2 7L12 17l-6.5 3.5 2-7L2 9h7z"/></svg> 48+ Routes</span>
          <span class="hero-tag"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8 2 4 5 4 9c0 5.2 8 13 8 13s8-7.8 8-13c0-4-4-7-8-7z"/></svg> 18 Cities</span>
          <span class="hero-tag"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V5l-9-4z"/></svg> Secure Pay</span>
        </div>
      </div>
      <form class="search-panel" (ngSubmit)="search()">
        <div class="search-row">
          <div class="field ac-wrap">
            <label>From</label>
            <input [(ngModel)]="origin" name="origin" placeholder="Origin city" required autocomplete="off"
              (input)="filterOrigin()" (focus)="openOrigin()" (blur)="closeOrigin()">
            <ul class="ac-drop" *ngIf="originOpen && originList.length">
              <li *ngFor="let l of originList" (mousedown)="pickOrigin(l)">{{l}}</li>
            </ul>
          </div>
          <button type="button" class="swap-btn" (click)="swap()" title="Swap cities">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 16V4m0 0L3 8m4-4 4 4M17 8v12m0 0 4-4m-4 4-4-4"/></svg>
          </button>
          <div class="field ac-wrap">
            <label>To</label>
            <input [(ngModel)]="destination" name="destination" placeholder="Destination city" required autocomplete="off"
              (input)="filterDest()" (focus)="openDest()" (blur)="closeDest()">
            <ul class="ac-drop" *ngIf="destOpen && destList.length">
              <li *ngFor="let l of destList" (mousedown)="pickDest(l)">{{l}}</li>
            </ul>
          </div>
          <div class="field">
            <label>Travel Date</label>
            <input type="date" [(ngModel)]="date" name="date" [min]="today" required>
          </div>
          <button type="submit" class="search-btn" [disabled]="searching">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            {{searching ? 'Searching...' : 'Search Buses'}}
          </button>
        </div>
      </form>
    </section>

    <p class="err" *ngIf="error">{{error}}</p>

    <div class="loading" *ngIf="searching">
      <div class="spinner"></div>
      <p>Finding available buses...</p>
    </div>

    <div class="empty" *ngIf="searched && !searching && !routes.length && !error">
      <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M8 14h.01M12 14h.01"/></svg>
      <p>No buses found for {{origin}} → {{destination}}</p>
      <span>Pick cities from the dropdown. Try these routes:</span>
      <div class="route-hints">
        <button type="button" *ngFor="let h of hints" (click)="quickSearch(h[0], h[1])">{{h[0]}} → {{h[1]}}</button>
      </div>
    </div>

    <section class="results" *ngIf="routes.length">
      <h2>{{routes.length}} bus{{routes.length > 1 ? 'es' : ''}} found</h2>
      <div class="bus-card" *ngFor="let r of routes">
        <div class="bus-head">
          <div>
            <h3>{{r.bus_name}}</h3>
            <span class="bus-no">{{r.bus_number}}</span>
          </div>
          <span class="type-tag">{{typeLabel(r.bus_type)}}</span>
        </div>
        <div class="route-line">
          <div class="stop">
            <strong>{{fmtTime(r.departure_time)}}</strong>
            <span>{{r.origin}}</span>
          </div>
          <div class="line">
            <div class="dot"></div>
            <div class="track"></div>
            <div class="dot"></div>
          </div>
          <div class="stop end">
            <strong>{{fmtTime(r.arrival_time)}}</strong>
            <span>{{r.destination}}</span>
          </div>
        </div>
        <div class="amenity-row">
          <span class="pill" *ngFor="let a of (r.amenities||[])">{{a}}</span>
        </div>
        <div class="bus-foot">
          <div class="seats-info">
            <div class="avail-bar"><div [style.width.%]="seatPct(r)"></div></div>
            <span [class.low]="r.available_seats < 5">{{r.available_seats}} seats left</span>
          </div>
          <div class="price-block">
            <span class="from">from</span>
            <strong class="price">₹{{r.fare}}</strong>
            <button (click)="openBook(r)">Select Seats</button>
          </div>
        </div>
      </div>
    </section>
  </main>

  <main class="container" *ngIf="tab==='bookings'">
    <h2 class="page-title">My Bookings</h2>
    <div class="booking-cards" *ngIf="bookings.length">
      <div class="booking-card" *ngFor="let b of bookings">
        <div class="bc-top">
          <span class="bc-id">#{{b.id}}</span>
          <span class="badge" [class]="b.status">{{b.status}}</span>
        </div>
        <h3>{{b.bus_name}}</h3>
        <p class="bc-route">{{b.origin}} → {{b.destination}}</p>
        <div class="bc-meta">
          <span>{{b.travel_date}}</span>
          <span>Seats: {{seatStr(b.seats)}}</span>
          <span class="bc-fare">₹{{b.total_fare}}</span>
        </div>
        <div class="bc-actions">
          <button (click)="viewTicket(b.id)">View E-Ticket</button>
          <button class="danger" *ngIf="b.status==='confirmed'" (click)="cancel(b.id)">Cancel</button>
        </div>
      </div>
    </div>
    <div class="empty" *ngIf="!bookings.length">
      <p>No bookings yet.</p>
      <button (click)="tab='search'">Find a Bus</button>
    </div>
  </main>

  <main class="container" *ngIf="tab==='profile'">
    <h2 class="page-title">My Profile</h2>
    <form class="profile-card" (ngSubmit)="saveProfile()">
      <div class="field"><label>Name</label><input [(ngModel)]="profile.name" name="name" required></div>
      <div class="field"><label>Email</label><input [value]="profile.email" disabled></div>
      <div class="field"><label>Gender</label>
        <select [(ngModel)]="profile.gender" name="gender">
          <option value="">Select</option><option>Male</option><option>Female</option><option>Other</option>
        </select>
      </div>
      <div class="field"><label>Phone</label><input [(ngModel)]="profile.phone" name="phone"></div>
      <div class="field full"><label>Address</label><input [(ngModel)]="profile.address" name="address"></div>
      <button type="submit">Save Profile</button>
    </form>
    <p class="ok" *ngIf="profileMsg">{{profileMsg}}</p>
    <p class="err" *ngIf="profileErr">{{profileErr}}</p>
  </main>
  </div>

  <div class="modal" *ngIf="selected" (click)="closeModal($event)">
    <div class="modal-body booking-modal" (click)="$event.stopPropagation()">
      <div class="steps">
        <span [class.done]="step >= 1" [class.active]="step === 1">1. Seats</span>
        <span [class.done]="step >= 2" [class.active]="step === 2">2. Payment</span>
        <span [class.done]="step >= 3" [class.active]="step === 3">3. Done</span>
      </div>

      <div *ngIf="step === 1">
        <h3>{{selected.bus_name}}</h3>
        <p class="sub">{{selected.origin}} → {{selected.destination}} · {{date}}</p>
        <div class="legend">
          <span><i class="avail"></i> Available</span>
          <span><i class="sel"></i> Selected</span>
          <span><i class="booked"></i> Booked</span>
        </div>
        <div class="bus-layout">
          <div class="driver">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 16c0 .55.45 1 1 1h1v1a1 1 0 0 0 2 0v-1h8v1a1 1 0 0 0 2 0v-1h1c.55 0 1-.45 1-1v-4l-1.5-4.5A2 2 0 0 0 15.5 7h-7A2 2 0 0 0 6.5 9.5L5 14v2z"/></svg>
            Front · Driver
          </div>
          <div class="seat-row" *ngFor="let row of seatRows">
            <button *ngFor="let s of row.left" class="seat"
              [class.taken]="booked.includes(s)" [class.picked]="picked.includes(s)"
              [disabled]="booked.includes(s)" (click)="toggleSeat(s)">{{s}}</button>
            <span class="aisle"></span>
            <button *ngFor="let s of row.right" class="seat"
              [class.taken]="booked.includes(s)" [class.picked]="picked.includes(s)"
              [disabled]="booked.includes(s)" (click)="toggleSeat(s)">{{s}}</button>
          </div>
        </div>
        <div class="summary-bar">
          <span>{{picked.length}} seat{{picked.length !== 1 ? 's' : ''}} · ₹{{selected.fare * picked.length}}</span>
          <button (click)="goPay()" [disabled]="!picked.length">Continue to Payment</button>
        </div>
      </div>

      <div *ngIf="step === 2">
        <h3>Secure Payment</h3>
        <p class="sub">Total: <strong>₹{{selected.fare * picked.length}}</strong> · Seats {{picked.join(', ')}}</p>
        <div class="pay-methods">
          <button type="button" [class.active]="payMethod==='card'" (click)="payMethod='card'">Card</button>
          <button type="button" [class.active]="payMethod==='upi'" (click)="payMethod='upi'">UPI</button>
        </div>
        <div *ngIf="payMethod==='card'" class="pay-form">
          <label>Card Number</label>
          <input [(ngModel)]="card" maxlength="19" placeholder="4111 1111 1111 1111" (input)="fmtCard()">
          <div class="pay-row">
            <div><label>Expiry</label><input [(ngModel)]="expiry" placeholder="MM/YY" maxlength="5" (input)="fmtExpiry()"></div>
            <div><label>CVV</label><input [(ngModel)]="cvv" maxlength="3" type="password"></div>
          </div>
          <label>Card Holder</label>
          <input [(ngModel)]="holder" placeholder="Name on card">
        </div>
        <div *ngIf="payMethod==='upi'" class="pay-form">
          <label>UPI ID</label>
          <input [(ngModel)]="upi" placeholder="yourname@upi">
        </div>
        <div class="pay-actions">
          <button class="secondary" (click)="step=1">Back</button>
          <button (click)="confirmBook()" [disabled]="!canPay() || paying">
            {{paying ? 'Processing...' : 'Pay ₹' + (selected.fare * picked.length)}}
          </button>
        </div>
      </div>

      <div *ngIf="step === 3" class="success-pane">
        <div class="check">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h3>Booking Confirmed!</h3>
        <p>Your YatraGo e-ticket is ready.</p>
        <button (click)="finishBooking()">View E-Ticket</button>
        <button class="secondary" (click)="closeAll()">Close</button>
      </div>

      <button class="modal-close" *ngIf="step < 3" (click)="closeAll()">×</button>
      <p class="err" *ngIf="bookError">{{bookError}}</p>
    </div>
  </div>

  <div class="modal" *ngIf="ticket" (click)="ticket=null">
    <div class="modal-body eticket" (click)="$event.stopPropagation()">
      <div class="eticket-head">
        <app-brand-logo [light]="true" [compact]="true"></app-brand-logo>
        <span>E-Ticket</span>
      </div>
      <div class="eticket-id">Booking #{{ticket.id}}</div>
      <div class="ticket-row"><span>Passenger</span><strong>{{ticket.passenger_name}}</strong></div>
      <div class="ticket-row"><span>Bus</span><strong>{{ticket.bus_name}} ({{ticket.bus_number}})</strong></div>
      <div class="ticket-row"><span>Route</span><strong>{{ticket.origin}} → {{ticket.destination}}</strong></div>
      <div class="ticket-row"><span>Date</span><strong>{{ticket.travel_date}}</strong></div>
      <div class="ticket-row"><span>Time</span><strong>{{fmtTime(ticket.departure_time)}} - {{fmtTime(ticket.arrival_time)}}</strong></div>
      <div class="ticket-row"><span>Seats</span><strong>{{seatStr(ticket.seats)}}</strong></div>
      <div class="ticket-row total"><span>Amount Paid</span><strong>₹{{ticket.total_fare}}</strong></div>
      <div class="ticket-row"><span>Status</span><strong class="badge" [class]="ticket.status">{{ticket.status}}</strong></div>
      <button (click)="ticket=null">Close</button>
    </div>
  </div>`,
  styles: [`:host{display:block}`]
})
export class UserComponent implements OnInit {
  name = localStorage.getItem('name') || '';
  tab = 'search';
  origin = '';
  destination = '';
  date = '';
  today = new Date().toLocaleDateString('en-CA');
  hints = [
    ['Mumbai', 'Pune'], ['Mumbai', 'Delhi'], ['Mumbai', 'Bangalore'],
    ['Delhi', 'Mumbai'], ['Delhi', 'Jaipur'], ['Chennai', 'Hyderabad'],
    ['Bangalore', 'Chennai'], ['Pune', 'Goa'], ['Goa', 'Pune']
  ];
  allLocs: string[] = [];
  originList: string[] = [];
  destList: string[] = [];
  originOpen = false;
  destOpen = false;
  routes: any[] = [];
  bookings: any[] = [];
  profile: any = {};
  error = '';
  profileMsg = '';
  profileErr = '';
  selected: any = null;
  step = 1;
  payMethod = 'card';
  card = '';
  expiry = '';
  cvv = '';
  holder = '';
  upi = '';
  paying = false;
  searching = false;
  searched = false;
  seatList: number[] = [];
  seatRows: { left: number[]; right: number[] }[] = [];
  booked: number[] = [];
  picked: number[] = [];
  bookError = '';
  ticket: any = null;
  pendingTicketId: number | null = null;

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    this.api.locations('').subscribe(l => {
      this.allLocs = l;
      this.originList = l;
      this.destList = l;
    });
    this.date = this.today;
  }

  filterList(q: string) {
    const term = q.toLowerCase().trim();
    return this.allLocs.filter(l => !term || l.toLowerCase().includes(term));
  }

  openOrigin() {
    this.destOpen = false;
    this.originOpen = true;
    this.originList = this.filterList(this.origin);
  }

  filterOrigin() {
    this.originOpen = true;
    this.originList = this.filterList(this.origin);
  }

  closeOrigin() {
    setTimeout(() => this.originOpen = false, 150);
  }

  pickOrigin(c: string) {
    this.origin = c;
    this.originOpen = false;
  }

  openDest() {
    this.originOpen = false;
    this.destOpen = true;
    this.destList = this.filterList(this.destination);
  }

  filterDest() {
    this.destOpen = true;
    this.destList = this.filterList(this.destination);
  }

  closeDest() {
    setTimeout(() => this.destOpen = false, 150);
  }

  pickDest(c: string) {
    this.destination = c;
    this.destOpen = false;
  }

  swap() {
    [this.origin, this.destination] = [this.destination, this.origin];
  }

  typeLabel(t: string) {
    return ({ sleeper_ac: 'Sleeper AC', sleeper_non_ac: 'Sleeper Non-AC', seat_ac: 'Seat AC', seat_non_ac: 'Seat Non-AC' } as any)[t] || t;
  }

  fmtTime(t: any) {
    if (!t) return '';
    const s = String(t);
    return s.length >= 5 ? s.slice(0, 5) : s;
  }

  seatStr(seats: any) {
    return Array.isArray(seats) ? seats.join(', ') : seats;
  }

  seatPct(r: any) {
    return r.total_seats ? (r.available_seats / r.total_seats) * 100 : 0;
  }

  buildSeatRows(total: number) {
    const rows: { left: number[]; right: number[] }[] = [];
    for (let i = 1; i <= total; i += 4) {
      rows.push({ left: [i, i + 1].filter(s => s <= total), right: [i + 2, i + 3].filter(s => s <= total) });
    }
    this.seatRows = rows;
  }

  search() {
    this.error = '';
    this.searched = false;
    this.origin = this.origin.trim();
    this.destination = this.destination.trim();
    if (this.date < this.today) { this.error = 'Date must be today or later'; return; }
    if (!this.origin || !this.destination) { this.error = 'Select origin and destination from the list'; return; }
    if (this.origin.toLowerCase() === this.destination.toLowerCase()) {
      this.error = 'Origin and destination must be different'; return;
    }
    this.searching = true;
    this.routes = [];
    this.api.searchRoutes(this.origin, this.destination, this.date).subscribe({
      next: (r) => { this.routes = r || []; this.searching = false; this.searched = true; },
      error: (e) => {
        this.routes = [];
        this.searching = false;
        this.searched = true;
        this.error = e.error?.error || 'Could not reach server. Is the backend running?';
      }
    });
  }

  quickSearch(from: string, to: string) {
    this.origin = from;
    this.destination = to;
    this.search();
  }

  openBook(r: any) {
    this.selected = r;
    this.picked = [];
    this.step = 1;
    this.payMethod = 'card';
    this.bookError = '';
    this.card = this.expiry = this.cvv = this.holder = this.upi = '';
    this.api.routeSeats(r.id, this.date).subscribe(s => {
      this.seatList = Array.from({ length: s.total }, (_, i) => i + 1);
      this.booked = s.booked;
      this.buildSeatRows(s.total);
    });
  }

  toggleSeat(s: number) {
    const i = this.picked.indexOf(s);
    if (i >= 0) this.picked.splice(i, 1);
    else this.picked.push(s);
    this.picked.sort((a, b) => a - b);
  }

  goPay() {
    if (!this.picked.length) return;
    this.step = 2;
    this.bookError = '';
  }

  fmtCard() {
    this.card = this.card.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  }

  fmtExpiry() {
    let v = this.expiry.replace(/\D/g, '').slice(0, 4);
    if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
    this.expiry = v;
  }

  canPay() {
    if (this.payMethod === 'upi') return this.upi.includes('@') && this.upi.length > 5;
    return this.card.replace(/\s/g, '').length >= 16 && this.expiry.length >= 4 && this.cvv.length >= 3 && this.holder.length > 1;
  }

  confirmBook() {
    if (!this.canPay()) return;
    this.bookError = '';
    this.paying = true;
    setTimeout(() => {
      this.api.book({ route_id: this.selected.id, travel_date: this.date, seats: this.picked }).subscribe({
        next: (r: any) => {
          this.paying = false;
          this.pendingTicketId = r.booking_id;
          this.step = 3;
        },
        error: (e) => { this.paying = false; this.bookError = e.error?.error || 'Payment failed'; }
      });
    }, 1200);
  }

  finishBooking() {
    if (this.pendingTicketId) {
      this.api.bookingDetail(this.pendingTicketId).subscribe(t => this.ticket = t);
    }
    this.closeAll();
    this.loadBookings();
  }

  closeAll() {
    this.selected = null;
    this.step = 1;
    this.pendingTicketId = null;
  }

  closeModal(e: Event) {
    if ((e.target as HTMLElement).classList.contains('modal')) this.closeAll();
  }

  loadBookings() {
    this.tab = 'bookings';
    this.api.myBookings().subscribe(b => this.bookings = b);
  }

  loadProfile() {
    this.tab = 'profile';
    this.profileMsg = this.profileErr = '';
    this.api.profile().subscribe(p => this.profile = { ...p });
  }

  saveProfile() {
    this.profileMsg = this.profileErr = '';
    if (!this.profile.name || this.profile.name.length < 2) {
      this.profileErr = 'Name must be at least 2 characters'; return;
    }
    if (this.profile.phone && this.profile.phone.length !== 10) {
      this.profileErr = 'Phone must be 10 digits'; return;
    }
    this.api.updateProfile(this.profile).subscribe({
      next: (r) => {
        this.profileMsg = 'Profile saved successfully';
        this.profile = r.profile;
        localStorage.setItem('name', r.profile.name);
        this.name = r.profile.name;
      },
      error: (e) => this.profileErr = e.error?.error || 'Update failed'
    });
  }

  viewTicket(id: number) {
    this.api.bookingDetail(id).subscribe(t => this.ticket = t);
  }

  cancel(id: number) {
    if (!confirm('Cancel this booking and request refund?')) return;
    this.api.cancelBooking(id).subscribe(() => this.loadBookings());
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
