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
    <app-brand-logo badge="Operator"></app-brand-logo>
    <nav>
      <button [class.active]="tab==='routes'" (click)="tab='routes'">Routes</button>
      <button [class.active]="tab==='seats'" (click)="tab='seats'">Seat Availability</button>
      <button [class.active]="tab==='bookings'" (click)="loadBookings()">Bookings</button>
      <button [class.active]="tab==='profile'" (click)="loadProfile()">Profile</button>
      <button (click)="logout()">Logout</button>
    </nav>
  </header>
  <div class="page-bg">
  <main class="container">
    <section *ngIf="tab==='routes'">
      <h2>{{editId ? 'Edit' : 'Add'}} Bus Route</h2>
      <form class="grid-form" (ngSubmit)="saveRoute()">
        <input placeholder="Bus Name" [(ngModel)]="r.bus_name" name="bus_name" required>
        <input placeholder="Bus Number" [(ngModel)]="r.bus_number" name="bus_number" required>
        <select [(ngModel)]="r.bus_type" name="bus_type" required>
          <option value="sleeper_ac">Sleeper AC</option>
          <option value="sleeper_non_ac">Sleeper Non-AC</option>
          <option value="seat_ac">Seat AC</option>
          <option value="seat_non_ac">Seat Non-AC</option>
        </select>
        <input type="number" placeholder="Total Seats" [(ngModel)]="r.total_seats" name="total_seats" required>
        <div class="ac-wrap">
          <input placeholder="Origin" [(ngModel)]="r.origin" name="origin" required autocomplete="off"
            (input)="filterOrigin()" (focus)="openOrigin()" (blur)="closeOrigin()">
          <ul class="ac-drop" *ngIf="originOpen && originList.length">
            <li *ngFor="let l of originList" (mousedown)="pickOrigin(l)">{{l}}</li>
          </ul>
        </div>
        <div class="ac-wrap">
          <input placeholder="Destination" [(ngModel)]="r.destination" name="destination" required autocomplete="off"
            (input)="filterDest()" (focus)="openDest()" (blur)="closeDest()">
          <ul class="ac-drop" *ngIf="destOpen && destList.length">
            <li *ngFor="let l of destList" (mousedown)="pickDest(l)">{{l}}</li>
          </ul>
        </div>
        <input type="time" [(ngModel)]="r.departure_time" name="departure_time" required>
        <input type="time" [(ngModel)]="r.arrival_time" name="arrival_time" required>
        <input type="number" placeholder="Fare" [(ngModel)]="r.fare" name="fare" required>
        <div class="checks">
          <label *ngFor="let a of amenityOpts"><input type="checkbox" [checked]="r.amenities.includes(a)" (change)="toggleAmenity(a)"> {{a}}</label>
        </div>
        <button type="submit">{{editId ? 'Update' : 'Add'}} Route</button>
        <button type="button" class="secondary" *ngIf="editId" (click)="resetForm()">Cancel Edit</button>
      </form>
      <p class="err" *ngIf="routeErr">{{routeErr}}</p>
      <h3>My Routes</h3>
      <table *ngIf="routes.length">
        <thead><tr><th>Bus</th><th>Route</th><th>Type</th><th>Seats</th><th>Time</th><th>Fare</th><th></th></tr></thead>
        <tbody>
          <tr *ngFor="let x of routes">
            <td>{{x.bus_name}} ({{x.bus_number}})</td>
            <td>{{x.origin}} → {{x.destination}}</td>
            <td>{{typeLabel(x.bus_type)}}</td>
            <td>{{x.total_seats}}</td>
            <td>{{fmtTime(x.departure_time)}}-{{fmtTime(x.arrival_time)}}</td>
            <td>₹{{x.fare}}</td>
            <td>
              <button (click)="edit(x)">Edit</button>
              <button class="danger" (click)="remove(x.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
    <section *ngIf="tab==='seats'">
      <h2>Seat Availability</h2>
      <form class="search-form" (ngSubmit)="loadSeats()">
        <div class="field">
          <label>Route</label>
          <select [(ngModel)]="seatRouteId" name="seatRouteId" required>
            <option [ngValue]="null">Select route</option>
            <option *ngFor="let x of routes" [ngValue]="x.id">{{x.bus_name}}: {{x.origin}} → {{x.destination}}</option>
          </select>
        </div>
        <div class="field">
          <label>Date</label>
          <input type="date" [(ngModel)]="seatDate" name="seatDate" [min]="today" required>
        </div>
        <button type="submit">View Seats</button>
      </form>
      <div *ngIf="seatInfo">
        <p>{{seatInfo.available.length}} available / {{seatInfo.total}} total</p>
        <div class="seats">
          <button *ngFor="let s of seatList" [class.taken]="seatInfo.booked.includes(s)" disabled>{{s}}</button>
        </div>
      </div>
    </section>
    <section *ngIf="tab==='bookings'">
      <h2>Booked Tickets</h2>
      <table *ngIf="bookings.length">
        <thead><tr><th>ID</th><th>User</th><th>Bus</th><th>Date</th><th>Seats</th><th>Fare</th><th>Status</th><th></th></tr></thead>
        <tbody>
          <tr *ngFor="let b of bookings">
            <td>{{b.id}}</td>
            <td>{{b.user_name}} ({{b.user_email}})</td>
            <td>{{b.bus_name}}</td>
            <td>{{b.travel_date}}</td>
            <td>{{seatStr(b.seats)}}</td>
            <td>₹{{b.total_fare}}</td>
            <td><span class="badge" [class]="b.status">{{b.status}}</span></td>
            <td><button *ngIf="b.status==='cancelled'" (click)="doRefund(b.id)">Process Refund</button></td>
          </tr>
        </tbody>
      </table>
      <p *ngIf="!bookings.length">No bookings yet.</p>
    </section>
    <section *ngIf="tab==='profile'">
      <h2 class="page-title">Operator Profile</h2>
      <form class="profile-card" (ngSubmit)="saveProfile()">
        <div class="field"><label>Name</label><input [(ngModel)]="profile.name" name="name" required></div>
        <div class="field"><label>Email</label><input [value]="profile.email" disabled></div>
        <div class="field"><label>Gender</label>
          <select [(ngModel)]="profile.gender" name="gender">
            <option value="">Select</option><option>Male</option><option>Female</option><option>Other</option>
          </select>
        </div>
        <div class="field"><label>Phone</label><input [(ngModel)]="profile.phone" name="phone" maxlength="10"></div>
        <div class="field full"><label>Address</label><input [(ngModel)]="profile.address" name="address"></div>
        <button type="submit">Save Profile</button>
      </form>
      <p class="ok" *ngIf="profileMsg">{{profileMsg}}</p>
      <p class="err" *ngIf="profileErr">{{profileErr}}</p>
    </section>
  </main>
  </div>`,
  styles: [`:host{display:block}`]
})
export class OperatorComponent implements OnInit {
  tab = 'routes';
  routes: any[] = [];
  bookings: any[] = [];
  allLocs: string[] = [];
  originList: string[] = [];
  destList: string[] = [];
  originOpen = false;
  destOpen = false;
  editId: number | null = null;
  routeErr = '';
  seatRouteId: number | null = null;
  seatDate = '';
  today = new Date().toISOString().split('T')[0];
  seatInfo: any = null;
  seatList: number[] = [];
  profile: any = {};
  profileMsg = '';
  profileErr = '';
  amenityOpts = ['water bottle', 'blanket', 'charging point', 'tv'];
  r: any = { bus_name: '', bus_number: '', bus_type: 'sleeper_ac', total_seats: 40, origin: '', destination: '', departure_time: '', arrival_time: '', fare: 0, amenities: [] as string[] };

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    this.api.locations('').subscribe(l => {
      this.allLocs = l;
      this.originList = l;
      this.destList = l;
    });
    this.loadRoutes();
  }

  filterList(q: string) {
    const term = q.toLowerCase().trim();
    return this.allLocs.filter(l => !term || l.toLowerCase().includes(term));
  }

  openOrigin() { this.destOpen = false; this.originOpen = true; this.originList = this.filterList(this.r.origin); }
  filterOrigin() { this.originOpen = true; this.originList = this.filterList(this.r.origin); }
  closeOrigin() { setTimeout(() => this.originOpen = false, 150); }
  pickOrigin(c: string) { this.r.origin = c; this.originOpen = false; }

  openDest() { this.originOpen = false; this.destOpen = true; this.destList = this.filterList(this.r.destination); }
  filterDest() { this.destOpen = true; this.destList = this.filterList(this.r.destination); }
  closeDest() { setTimeout(() => this.destOpen = false, 150); }
  pickDest(c: string) { this.r.destination = c; this.destOpen = false; }

  typeLabel(t: string) {
    return ({ sleeper_ac: 'Sleeper AC', sleeper_non_ac: 'Sleeper Non-AC', seat_ac: 'Seat AC', seat_non_ac: 'Seat Non-AC' } as any)[t] || t;
  }

  fmtTime(t: any) { return t ? String(t).slice(0, 5) : ''; }

  seatStr(seats: any) { return Array.isArray(seats) ? seats.join(', ') : seats; }

  loadRoutes() { this.api.operatorRoutes().subscribe(r => this.routes = r); }

  toggleAmenity(a: string) {
    const i = this.r.amenities.indexOf(a);
    if (i >= 0) this.r.amenities.splice(i, 1);
    else this.r.amenities.push(a);
  }

  saveRoute() {
    this.routeErr = '';
    const call = this.editId ? this.api.updateRoute(this.editId, this.r) : this.api.addRoute(this.r);
    call.subscribe({
      next: () => { this.resetForm(); this.loadRoutes(); },
      error: (e) => this.routeErr = e.error?.error || 'Save failed'
    });
  }

  edit(x: any) {
    this.editId = x.id;
    this.r = { ...x, amenities: [...(x.amenities || [])],
      departure_time: this.fmtTime(x.departure_time), arrival_time: this.fmtTime(x.arrival_time) };
  }

  resetForm() {
    this.editId = null;
    this.r = { bus_name: '', bus_number: '', bus_type: 'sleeper_ac', total_seats: 40, origin: '', destination: '', departure_time: '', arrival_time: '', fare: 0, amenities: [] };
  }

  remove(id: number) {
    if (!confirm('Delete this route?')) return;
    this.api.deleteRoute(id).subscribe(() => this.loadRoutes());
  }

  loadSeats() {
    if (!this.seatRouteId || !this.seatDate) return;
    this.api.operatorRouteSeats(this.seatRouteId, this.seatDate).subscribe(s => {
      this.seatInfo = s;
      this.seatList = Array.from({ length: s.total }, (_, i) => i + 1);
    });
  }

  loadBookings() {
    this.tab = 'bookings';
    this.api.operatorBookings().subscribe(b => this.bookings = b);
  }

  doRefund(id: number) {
    if (!confirm('Process refund for this booking?')) return;
    this.api.refund(id).subscribe(() => this.loadBookings());
  }

  loadProfile() {
    this.tab = 'profile';
    this.profileMsg = this.profileErr = '';
    this.api.profile().subscribe(p => this.profile = { ...p });
  }

  saveProfile() {
    this.profileMsg = this.profileErr = '';
    this.api.updateProfile(this.profile).subscribe({
      next: (r) => { this.profileMsg = 'Profile saved successfully'; this.profile = r.profile; },
      error: (e) => this.profileErr = e.error?.error || 'Update failed'
    });
  }

  logout() { localStorage.clear(); this.router.navigate(['/login']); }
}
