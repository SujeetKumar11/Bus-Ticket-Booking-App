#!/usr/bin/env python3
"""Generate FastX Online Bus Ticket Booking System documentation PDF."""

from pathlib import Path

from fpdf import FPDF
from fpdf.enums import XPos, YPos

OUTPUT = Path(__file__).resolve().parent / "FastX_Documentation.pdf"


class DocPDF(FPDF):
    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.cell(0, 10, f"Page {self.page_no()}", align="C")


def section(pdf: DocPDF, title: str):
    pdf.ln(4)
    pdf.set_font("Helvetica", "B", 14)
    pdf.set_fill_color(230, 240, 255)
    pdf.cell(0, 10, title, new_x=XPos.LMARGIN, new_y=YPos.NEXT, fill=True)
    pdf.ln(2)


def body(pdf: DocPDF, text: str):
    pdf.set_font("Helvetica", "", 10)
    pdf.multi_cell(0, 5, text)
    pdf.ln(1)


def bullet(pdf: DocPDF, text: str, indent: int = 8):
    pdf.set_font("Helvetica", "", 10)
    x = pdf.get_x()
    pdf.cell(indent)
    pdf.multi_cell(0, 5, f"- {text}")
    pdf.set_x(x)


def code_block(pdf: DocPDF, text: str):
    pdf.set_font("Courier", "", 9)
    pdf.set_fill_color(245, 245, 245)
    for line in text.strip().splitlines():
        pdf.cell(0, 5, line, new_x=XPos.LMARGIN, new_y=YPos.NEXT, fill=True)
    pdf.ln(2)


def table_row(pdf: DocPDF, cols, widths, bold=False):
    style = "B" if bold else ""
    pdf.set_font("Helvetica", style, 9)
    for col, w in zip(cols, widths):
        pdf.cell(w, 6, str(col), border=1)
    pdf.ln()


def build_pdf() -> DocPDF:
    pdf = DocPDF()
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.add_page()

    # Title page
    pdf.set_font("Helvetica", "B", 24)
    pdf.ln(30)
    pdf.cell(0, 12, "FastX", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")
    pdf.set_font("Helvetica", "", 16)
    pdf.cell(0, 10, "Online Bus Ticket Booking System", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")
    pdf.ln(8)
    pdf.set_font("Helvetica", "I", 11)
    pdf.cell(0, 8, "Technical Documentation", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")
    pdf.ln(20)
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 6, "Version 1.0  |  Milestone Project", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")

    # 1. Introduction
    pdf.add_page()
    section(pdf, "1. Introduction")
    body(
        pdf,
        "FastX is a full-stack online bus ticket booking system that connects passengers, "
        "bus operators, and platform administrators. Passengers can search routes across "
        "Indian cities, view seat availability, book tickets, and manage their bookings. "
        "Operators manage bus routes, monitor seat occupancy, and process refunds. "
        "Administrators oversee users, operators, bookings, and routes across the platform.",
    )
    body(
        pdf,
        "The application follows a modern three-tier architecture: an Angular 19 single-page "
        "frontend, a Flask REST API backend, and a MySQL database running in Docker. "
        "Authentication uses JWT tokens with role-based access control for user, operator, "
        "and admin roles.",
    )

    # 2. Tech Stack
    section(pdf, "2. Tech Stack")
    bullet(pdf, "Frontend: Angular 19 (standalone components, lazy-loaded routes, HttpClient)")
    bullet(pdf, "Backend: Python Flask 3.1 REST API with Flask-CORS")
    bullet(pdf, "Database: MySQL 8 (Docker container, schema auto-initialized)")
    bullet(pdf, "Authentication: PyJWT (HS256) with Bearer tokens")
    bullet(pdf, "Password hashing: Werkzeug generate_password_hash / check_password_hash")
    bullet(pdf, "Database driver: PyMySQL with DictCursor (requires cryptography for MySQL 8)")
    bullet(pdf, "Containerization: Docker Compose for MySQL")
    bullet(pdf, "Dev proxy: Angular dev server proxies /api to Flask on port 5000")

    # 3. Architecture
    section(pdf, "3. Architecture")
    body(
        pdf,
        "The system uses a client-server architecture. The Angular frontend runs on "
        "http://localhost:4200 and communicates with the Flask API on port 5000 via "
        "REST endpoints prefixed with /api. During development, proxy.conf.json forwards "
        "API requests from the Angular dev server to the backend.",
    )
    code_block(
        pdf,
        """
  Browser (Angular SPA :4200)
         |
         |  HTTP /api/*
         v
  Flask REST API (:5000)
         |
         |  PyMySQL
         v
  MySQL 8 (Docker :3307 -> container :3306)
        """,
    )
    body(
        pdf,
        "On startup, the Flask app calls init_db() which creates tables if missing, seeds "
        "default admin/operator accounts, and populates sample bus routes. JWT tokens are "
        "issued on login/register and stored in localStorage by the frontend.",
    )

    # 4. Project Structure
    section(pdf, "4. Project Structure")
    code_block(
        pdf,
        """
Milestone-pro/
  backend/
    app.py              Flask REST API (all endpoints)
    schema.sql          MySQL DDL and foreign keys
    docker-compose.yml  MySQL 8 container config
    requirements.txt    Python dependencies (includes cryptography)
  frontend/
    src/app/
      pages/
        login/          Login page
        register/       User/operator registration
        forgot/         Password reset
        user/           Passenger dashboard
        operator/       Operator dashboard
        admin/          Admin dashboard
      services/
        api.service.ts  HTTP client for all API calls
      guards/
        auth.guard.ts   Route protection by role
      app.routes.ts   Angular routing config
    proxy.conf.json     Dev API proxy to :5000
    package.json        Angular 19 dependencies
  docs/
    generate_pdf.py     This documentation generator
    FastX_Documentation.pdf
  README.md             Quick start guide
  package.sh            Zip script (excludes docs/)
        """,
    )

    # 5. Installation
    section(pdf, "5. Installation Steps")
    body(pdf, "Prerequisites: Python 3.10+, Node.js 18+, npm, Docker and Docker Compose.")
    body(pdf, "Step 1 - Create a Python virtual environment and install backend dependencies:")
    code_block(
        pdf,
        """
cd backend
python3 -m venv venv
source venv/bin/activate    # Windows: venv\\Scripts\\activate
pip install -r requirements.txt
        """,
    )
    body(pdf, "Step 2 - Start MySQL and the Flask API:")
    code_block(
        pdf,
        """
cd backend
source venv/bin/activate
docker compose up -d
python3 app.py
        """,
    )
    body(pdf, "Step 3 - Start the frontend (new terminal):")
    code_block(
        pdf,
        """
cd frontend
npm install
npm start
        """,
    )
    body(pdf, "Step 4 - Open http://localhost:4200 in your browser.")
    body(
        pdf,
        "MySQL is exposed on host port 3307 (mapped to 3306 inside the container) to avoid "
        "conflicts with a local MySQL installation. Default DB password is root; no extra "
        "environment variables are required for local development.",
    )
    body(
        pdf,
        "Optional environment variables: DB_HOST (localhost), DB_PORT (3307), DB_USER (root), "
        "DB_PASS (root), DB_NAME (fastx), JWT_SECRET (fastx-secret-key).",
    )

    # 6. Default Logins
    section(pdf, "6. Default Logins")
    table_row(pdf, ["Role", "Email", "Password"], [30, 80, 50], bold=True)
    table_row(pdf, ["Admin", "admin@fastx.com", "admin123"], [30, 80, 50])
    table_row(pdf, ["Operator", "operator@fastx.com", "operator123"], [30, 80, 50])
    pdf.ln(3)
    body(
        pdf,
        "Passengers must register at /register. Login accepts email or username. "
        "After login, users are redirected to /user, /operator, or /admin based on role.",
    )

    # 7. Features
    section(pdf, "7. User / Operator / Admin Features")

    pdf.set_font("Helvetica", "B", 11)
    pdf.cell(0, 7, "Passenger (User) Features", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    bullet(pdf, "Search buses by origin, destination, and travel date with city autocomplete")
    bullet(pdf, "View route details: bus type, fare, amenities, departure/arrival times")
    bullet(pdf, "Interactive seat map with real-time availability")
    bullet(pdf, "Book one or more seats; total fare calculated automatically")
    bullet(pdf, "Payment step with Card or UPI (client-side validation; simulated checkout)")
    bullet(pdf, "E-ticket view with booking details after successful payment")
    bullet(pdf, "View and cancel confirmed bookings")
    bullet(pdf, "View and update profile (name, gender, phone, address)")
    bullet(pdf, "Download/print ticket for confirmed bookings")

    pdf.set_font("Helvetica", "B", 11)
    pdf.ln(2)
    pdf.cell(0, 7, "Operator Features", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    bullet(pdf, "Add, edit, and delete bus routes (name, number, type, seats, times, fare)")
    bullet(pdf, "Configure amenities: water bottle, blanket, charging point, TV")
    bullet(pdf, "Check seat availability by route and date")
    bullet(pdf, "View all bookings on operator routes with passenger details")
    bullet(pdf, "Process refunds for cancelled bookings")
    bullet(pdf, "Update operator profile")

    pdf.set_font("Helvetica", "B", 11)
    pdf.ln(2)
    pdf.cell(0, 7, "Admin Features", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    bullet(pdf, "View and delete passenger accounts")
    bullet(pdf, "View and delete operator accounts")
    bullet(pdf, "View all bookings system-wide with status badges")
    bullet(pdf, "View and delete any bus route across all operators")

    # 8. How to Use
    section(pdf, "8. How to Use Guide")

    pdf.set_font("Helvetica", "B", 11)
    pdf.cell(0, 7, "For Passengers", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    bullet(pdf, "Register at /register or login at /login")
    bullet(pdf, "On the Find Bus tab, pick origin and destination from the city dropdown, enter date, and click Search Buses")
    bullet(pdf, "Select a bus from results; choose seats on the seat map; proceed to payment")
    bullet(pdf, "Complete payment with Card or UPI details; view the e-ticket on confirmation")
    bullet(pdf, "View tickets under My Bookings; cancel if needed before travel")
    bullet(pdf, "Update personal details under Profile")

    pdf.set_font("Helvetica", "B", 11)
    pdf.ln(2)
    pdf.cell(0, 7, "For Operators", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    bullet(pdf, "Login with operator@fastx.com / operator123")
    bullet(pdf, "Routes tab: add new routes or edit/delete existing ones")
    bullet(pdf, "Seat Availability tab: pick route and date to see booked vs available seats")
    bullet(pdf, "Bookings tab: review passenger bookings; process refunds for cancelled ones")

    pdf.set_font("Helvetica", "B", 11)
    pdf.ln(2)
    pdf.cell(0, 7, "For Admins", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    bullet(pdf, "Login with admin@fastx.com / admin123")
    bullet(pdf, "Use tabs to manage Users, Operators, Bookings, and Routes")
    bullet(pdf, "Delete records as needed to maintain the platform")

    # 9. REST API Reference
    pdf.add_page()
    section(pdf, "9. REST API Reference")
    body(pdf, "Base URL: http://localhost:5000/api  |  Auth: Authorization: Bearer <token>")

    api_rows = [
        ("POST", "/api/register", "Public", "Register user/operator"),
        ("POST", "/api/login", "Public", "Login, returns JWT token"),
        ("POST", "/api/forgot-password", "Public", "Reset password by email"),
        ("GET", "/api/locations?q=", "Public", "City autocomplete list"),
        ("GET", "/api/profile", "Auth", "Get current user profile"),
        ("PUT", "/api/profile", "Auth", "Update profile"),
        ("GET", "/api/routes/search", "Public", "Search routes (origin, destination, date)"),
        ("GET", "/api/routes/<id>", "Public", "Route details"),
        ("GET", "/api/routes/<id>/seats?date=", "Public", "Seat availability"),
        ("POST", "/api/bookings", "User", "Create booking"),
        ("GET", "/api/bookings", "User", "List my bookings"),
        ("GET", "/api/bookings/<id>", "User", "Booking detail / ticket"),
        ("DELETE", "/api/bookings/<id>", "User", "Cancel booking"),
        ("GET/POST", "/api/operator/routes", "Operator", "List / add routes"),
        ("PUT/DELETE", "/api/operator/routes/<id>", "Operator", "Update / delete route"),
        ("GET", "/api/operator/bookings", "Operator", "Operator bookings"),
        ("GET", "/api/operator/routes/<id>/seats", "Operator", "Seat map for route"),
        ("POST", "/api/operator/refund/<id>", "Operator", "Process refund"),
        ("GET", "/api/admin/users", "Admin", "List passengers"),
        ("DELETE", "/api/admin/users/<id>", "Admin", "Delete passenger"),
        ("GET", "/api/admin/operators", "Admin", "List operators"),
        ("DELETE", "/api/admin/operators/<id>", "Admin", "Delete operator"),
        ("GET", "/api/admin/bookings", "Admin", "All bookings"),
        ("DELETE", "/api/admin/bookings/<id>", "Admin", "Delete booking"),
        ("GET", "/api/admin/routes", "Admin", "All routes"),
        ("DELETE", "/api/admin/routes/<id>", "Admin", "Delete route"),
    ]
    table_row(pdf, ["Method", "Endpoint", "Role", "Description"], [22, 58, 22, 58], bold=True)
    for row in api_rows:
        table_row(pdf, row, [22, 58, 22, 58])

    # 10. Database Schema
    section(pdf, "10. Database Schema")
    body(pdf, "Database name: fastx")

    pdf.set_font("Helvetica", "B", 11)
    pdf.cell(0, 7, "users", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    bullet(pdf, "id INT PK AUTO_INCREMENT")
    bullet(pdf, "name VARCHAR(100), email VARCHAR(120) UNIQUE, password VARCHAR(255)")
    bullet(pdf, "gender VARCHAR(20), phone VARCHAR(20), address TEXT")
    bullet(pdf, "role ENUM('user','operator','admin') DEFAULT 'user'")
    bullet(pdf, "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP")

    pdf.set_font("Helvetica", "B", 11)
    pdf.ln(2)
    pdf.cell(0, 7, "routes", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    bullet(pdf, "id INT PK, operator_id INT FK -> users(id) ON DELETE CASCADE")
    bullet(pdf, "bus_name, bus_number, origin, destination VARCHAR")
    bullet(pdf, "bus_type ENUM('sleeper_ac','sleeper_non_ac','seat_ac','seat_non_ac')")
    bullet(pdf, "total_seats INT, departure_time TIME, arrival_time TIME")
    bullet(pdf, "fare DECIMAL(10,2), amenities JSON")

    pdf.set_font("Helvetica", "B", 11)
    pdf.ln(2)
    pdf.cell(0, 7, "bookings", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    bullet(pdf, "id INT PK, user_id INT FK -> users(id), route_id INT FK -> routes(id)")
    bullet(pdf, "travel_date DATE, seats JSON, total_fare DECIMAL(10,2)")
    bullet(pdf, "status ENUM('confirmed','cancelled','refunded') DEFAULT 'confirmed'")
    bullet(pdf, "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP")

    # 11. Security
    section(pdf, "11. Security")
    bullet(pdf, "Passwords hashed with Werkzeug before storage; never returned in API responses")
    bullet(pdf, "JWT tokens expire after 24 hours (HS256 signed with JWT_SECRET)")
    bullet(pdf, "Role-based access via @auth_required decorator on protected endpoints")
    bullet(pdf, "Operators can only modify their own routes and bookings")
    bullet(pdf, "Users can only view/cancel their own bookings")
    bullet(pdf, "Admin endpoints restricted to role='admin'")
    bullet(pdf, "Input validation on registration, profile updates, and booking creation")
    bullet(pdf, "CORS enabled for frontend cross-origin requests during development")
    bullet(
        pdf,
        "Note: Change JWT_SECRET and DB credentials in production; debug mode is enabled "
        "in app.py for development only.",
    )

    # 12. Available Routes (seed data)
    section(pdf, "12. Available Routes (Seed Data)")
    body(
        pdf,
        "On first startup, 48 sample routes are seeded: 24 outbound legs plus 24 return legs "
        "(3 buses per direction for each city pair). Supported cities: Mumbai, Delhi, Bangalore, "
        "Chennai, Hyderabad, Kolkata, Pune, Ahmedabad, Jaipur, Lucknow, Kochi, Goa, Surat, "
        "Nagpur, Indore, Bhopal, Patna, Chandigarh. Example search: Mumbai to Pune shows 3 buses.",
    )
    route_pairs = [
        "Mumbai -> Pune (Volvo Express, Neeta Travels, Purple Line)",
        "Mumbai -> Bangalore (Shivneri, VRL Travels, SRS Express)",
        "Mumbai -> Delhi (Rajdhani Deluxe, National Express, Maharashtra Travels)",
        "Chennai -> Hyderabad (Orange Travels, KPN Travels, Jabbar Express)",
        "Delhi -> Jaipur (Royal Cruiser, Pink City Express, Rajasthan Roadways)",
        "Bangalore -> Chennai (KPN Travels, Orange Tours, Green Express)",
        "Pune -> Goa (Paulo Travels, Konkan Kanya, Goa Express)",
        "Bangalore -> Kochi (KSRTC Swift, Kallada Travels, Kerala Express)",
    ]
    for pair in route_pairs:
        bullet(pdf, pair)
    body(pdf, "Return routes are auto-generated for each outbound route.")

    # 13. Troubleshooting
    section(pdf, "13. Troubleshooting")
    bullet(
        pdf,
        "Cannot connect to database: Ensure Docker is running and 'docker compose up -d' "
        "succeeded. The app connects on port 3307 with password root by default.",
    )
    bullet(
        pdf,
        "pip install fails on Linux: Use a virtual environment (python3 -m venv venv) instead "
        "of system pip to avoid externally-managed-environment errors.",
    )
    bullet(
        pdf,
        "MySQL authentication error: Install the cryptography package (listed in requirements.txt) "
        "for PyMySQL with MySQL 8.",
    )
    bullet(
        pdf,
        "API calls fail from frontend: Verify Flask is running on port 5000 and Angular "
        "dev server uses proxy.conf.json (npm start includes proxy by default).",
    )
    bullet(
        pdf,
        "Login returns 401: Check credentials. Default admin/operator accounts are seeded "
        "on first app startup via init_db().",
    )
    bullet(
        pdf,
        "Session expired: JWT tokens last 24 hours. Log in again to get a fresh token.",
    )
    bullet(
        pdf,
        "No buses found: Use seeded city pairs listed in Section 12. Date must be today "
        "or later.",
    )
    bullet(
        pdf,
        "Seat booking fails: Seat may already be taken. Refresh seat map and pick "
        "available seats.",
    )
    bullet(
        pdf,
        "Port 3306 already in use: The project defaults to host port 3307. If that port is "
        "busy, change the mapping in docker-compose.yml and set DB_PORT accordingly.",
    )
    bullet(
        pdf,
        "TypeScript config warning (outDir): Set rootDir to ./src in frontend/tsconfig.json "
        "when using TypeScript 6 or newer.",
    )
    bullet(
        pdf,
        "Regenerate this PDF: python3 docs/generate_pdf.py",
    )

    return pdf


def main():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    pdf = build_pdf()
    pdf.output(str(OUTPUT))
    print(f"Generated: {OUTPUT}")


if __name__ == "__main__":
    main()
