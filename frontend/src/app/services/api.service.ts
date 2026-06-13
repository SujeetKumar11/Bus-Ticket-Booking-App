import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = '/api';

  constructor(private http: HttpClient) {}

  private hdr() {
    const t = localStorage.getItem('token');
    return t ? new HttpHeaders({ Authorization: `Bearer ${t}` }) : undefined;
  }

  register(d: object) { return this.http.post(`${this.base}/register`, d); }
  login(d: object) { return this.http.post<any>(`${this.base}/login`, d); }
  forgotPassword(d: object) { return this.http.post(`${this.base}/forgot-password`, d); }
  profile() { return this.http.get<any>(`${this.base}/profile`, { headers: this.hdr() }); }
  updateProfile(d: object) { return this.http.put<any>(`${this.base}/profile`, d, { headers: this.hdr() }); }
  bookingDetail(id: number) { return this.http.get<any>(`${this.base}/bookings/${id}`, { headers: this.hdr() }); }
  locations(q: string) { return this.http.get<string[]>(`${this.base}/locations`, { params: { q } }); }
  searchRoutes(origin: string, destination: string, date: string) {
    return this.http.get<any[]>(`${this.base}/routes/search`, { params: { origin, destination, date } });
  }
  routeSeats(id: number, date: string) {
    return this.http.get<any>(`${this.base}/routes/${id}/seats`, { params: { date } });
  }
  book(d: object) { return this.http.post(`${this.base}/bookings`, d, { headers: this.hdr() }); }
  myBookings() { return this.http.get<any[]>(`${this.base}/bookings`, { headers: this.hdr() }); }
  cancelBooking(id: number) { return this.http.delete(`${this.base}/bookings/${id}`, { headers: this.hdr() }); }
  operatorRoutes() { return this.http.get<any[]>(`${this.base}/operator/routes`, { headers: this.hdr() }); }
  addRoute(d: object) { return this.http.post(`${this.base}/operator/routes`, d, { headers: this.hdr() }); }
  updateRoute(id: number, d: object) { return this.http.put(`${this.base}/operator/routes/${id}`, d, { headers: this.hdr() }); }
  deleteRoute(id: number) { return this.http.delete(`${this.base}/operator/routes/${id}`, { headers: this.hdr() }); }
  operatorRouteSeats(id: number, date: string) {
    return this.http.get<any>(`${this.base}/operator/routes/${id}/seats`, { params: { date }, headers: this.hdr() });
  }
  operatorBookings() { return this.http.get<any[]>(`${this.base}/operator/bookings`, { headers: this.hdr() }); }
  refund(id: number) { return this.http.post(`${this.base}/operator/refund/${id}`, {}, { headers: this.hdr() }); }
  adminUsers() { return this.http.get<any[]>(`${this.base}/admin/users`, { headers: this.hdr() }); }
  delUser(id: number) { return this.http.delete(`${this.base}/admin/users/${id}`, { headers: this.hdr() }); }
  adminOperators() { return this.http.get<any[]>(`${this.base}/admin/operators`, { headers: this.hdr() }); }
  delOperator(id: number) { return this.http.delete(`${this.base}/admin/operators/${id}`, { headers: this.hdr() }); }
  adminBookings() { return this.http.get<any[]>(`${this.base}/admin/bookings`, { headers: this.hdr() }); }
  delBooking(id: number) { return this.http.delete(`${this.base}/admin/bookings/${id}`, { headers: this.hdr() }); }
  adminRoutes() { return this.http.get<any[]>(`${this.base}/admin/routes`, { headers: this.hdr() }); }
  delAdminRoute(id: number) { return this.http.delete(`${this.base}/admin/routes/${id}`, { headers: this.hdr() }); }
}
