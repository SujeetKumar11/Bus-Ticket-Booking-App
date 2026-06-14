import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { ApiService } from '../../services/api.service';

import { BrandLogoComponent } from '../../shared/brand-logo.component';

@Component({
  standalone: true,
  imports: [NgFor, NgIf, BrandLogoComponent],
  template: `
  <header class="topbar">
    <app-brand-logo badge="Admin"></app-brand-logo>
    <nav>
      <button [class.active]="tab==='users'" (click)="tab='users';loadUsers()">Users</button>
      <button [class.active]="tab==='operators'" (click)="tab='operators';loadOperators()">Operators</button>
      <button [class.active]="tab==='bookings'" (click)="tab='bookings';loadBookings()">Bookings</button>
      <button [class.active]="tab==='routes'" (click)="tab='routes';loadRoutes()">Routes</button>
      <button (click)="logout()">Logout</button>
    </nav>
  </header>
  <div class="page-bg">
  <main class="container">
    <section *ngIf="tab==='users'">
      <h2>Passenger Accounts</h2>
      <table *ngIf="users.length"><thead><tr><th>Name</th><th>Email</th><th>Gender</th><th>Phone</th><th></th></tr></thead>
        <tbody><tr *ngFor="let u of users"><td>{{u.name}}</td><td>{{u.email}}</td><td>{{u.gender}}</td><td>{{u.phone}}</td>
          <td><button class="danger" (click)="delUser(u.id)">Delete</button></td></tr></tbody></table>
      <p *ngIf="!users.length">No users.</p>
    </section>
    <section *ngIf="tab==='operators'">
      <h2>Bus Operator Accounts</h2>
      <table *ngIf="operators.length"><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th></th></tr></thead>
        <tbody><tr *ngFor="let o of operators"><td>{{o.name}}</td><td>{{o.email}}</td><td>{{o.phone}}</td>
          <td><button class="danger" (click)="delOp(o.id)">Delete</button></td></tr></tbody></table>
      <p *ngIf="!operators.length">No operators.</p>
    </section>
    <section *ngIf="tab==='bookings'">
      <h2>All Bookings</h2>
      <table *ngIf="bookings.length"><thead><tr><th>ID</th><th>User</th><th>Bus</th><th>Date</th><th>Seats</th><th>Fare</th><th>Status</th><th></th></tr></thead>
        <tbody><tr *ngFor="let b of bookings"><td>{{b.id}}</td><td>{{b.user_name}}</td><td>{{b.bus_name}}</td>
          <td>{{b.travel_date}}</td><td>{{seatStr(b.seats)}}</td><td>₹{{b.total_fare}}</td>
          <td><span class="badge" [class]="b.status">{{b.status}}</span></td>
          <td><button class="danger" (click)="delBook(b.id)">Delete</button></td></tr></tbody></table>
      <p *ngIf="!bookings.length">No bookings.</p>
    </section>
    <section *ngIf="tab==='routes'">
      <h2>All Bus Routes</h2>
      <table *ngIf="routes.length"><thead><tr><th>Bus</th><th>Number</th><th>Route</th><th>Type</th><th>Operator</th><th>Fare</th><th></th></tr></thead>
        <tbody><tr *ngFor="let r of routes"><td>{{r.bus_name}}</td><td>{{r.bus_number}}</td>
          <td>{{r.origin}} → {{r.destination}}</td><td>{{r.bus_type}}</td>
          <td>{{r.operator_name}}</td><td>₹{{r.fare}}</td>
          <td><button class="danger" (click)="delRoute(r.id)">Delete</button></td></tr></tbody></table>
      <p *ngIf="!routes.length">No routes.</p>
    </section>
  </main>
  </div>`,
  styles: [`:host{display:block}`]
})
export class AdminComponent implements OnInit {
  tab = 'users';
  users: any[] = [];
  operators: any[] = [];
  bookings: any[] = [];
  routes: any[] = [];

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() { this.loadUsers(); }

  seatStr(seats: any) { return Array.isArray(seats) ? seats.join(', ') : seats; }

  loadUsers() { this.api.adminUsers().subscribe(u => this.users = u); }
  loadOperators() { this.api.adminOperators().subscribe(o => this.operators = o); }
  loadBookings() { this.api.adminBookings().subscribe(b => this.bookings = b); }
  loadRoutes() { this.api.adminRoutes().subscribe(r => this.routes = r); }

  delUser(id: number) {
    if (!confirm('Delete this user?')) return;
    this.api.delUser(id).subscribe(() => this.loadUsers());
  }
  delOp(id: number) {
    if (!confirm('Delete this operator?')) return;
    this.api.delOperator(id).subscribe(() => this.loadOperators());
  }
  delBook(id: number) {
    if (!confirm('Delete this booking?')) return;
    this.api.delBooking(id).subscribe(() => this.loadBookings());
  }
  delRoute(id: number) {
    if (!confirm('Delete this route?')) return;
    this.api.delAdminRoute(id).subscribe(() => this.loadRoutes());
  }

  logout() { localStorage.clear(); this.router.navigate(['/login']); }
}
