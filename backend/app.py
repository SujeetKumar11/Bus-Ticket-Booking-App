import os, json, jwt
from datetime import datetime, date, timedelta
from functools import wraps
from flask import Flask, request, jsonify, g
from flask_cors import CORS
import pymysql
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
_frontend = os.getenv('FRONTEND_URL', 'http://localhost:4200')
CORS(app, supports_credentials=True, origins=[_frontend, 'http://localhost:4200'])
app.config['SECRET'] = os.getenv('JWT_SECRET', 'fastx-secret-key')

def _db_ssl():
    ca = os.getenv('DB_SSL_CA', '')
    if not ca:
        return None
    path = '/tmp/mysql-ca.pem' if ca.strip().startswith('-----BEGIN') else ca
    if ca.strip().startswith('-----BEGIN'):
        with open(path, 'w') as f:
            f.write(ca)
    return {'ca': path}

_db_ssl_cfg = _db_ssl()
DB = dict(
    host=os.getenv('DB_HOST', 'localhost'),
    port=int(os.getenv('DB_PORT', 3307)),
    user=os.getenv('DB_USER', 'root'),
    password=os.getenv('DB_PASS', 'root'),
    database=os.getenv('DB_NAME', 'fastx'),
    cursorclass=pymysql.cursors.DictCursor,
    autocommit=True,
    **({'ssl': _db_ssl_cfg} if _db_ssl_cfg else {})
)

LOCATIONS = [
    'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata',
    'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Kochi', 'Goa',
    'Surat', 'Nagpur', 'Indore', 'Bhopal', 'Patna', 'Chandigarh'
]

SEED_ROUTES = [
    ('Volvo Express', 'KA01AB1234', 'sleeper_ac', 40, 'Mumbai', 'Pune', '06:00:00', '10:00:00', 450, ['water bottle', 'blanket', 'charging point']),
    ('Neeta Travels', 'MH14XY5678', 'seat_ac', 35, 'Mumbai', 'Pune', '09:00:00', '13:00:00', 420, ['water bottle', 'charging point', 'tv']),
    ('Purple Line', 'MH20PQ9012', 'sleeper_non_ac', 32, 'Mumbai', 'Pune', '22:00:00', '02:00:00', 380, ['water bottle', 'blanket']),
    ('Shivneri', 'MH12CD5678', 'seat_ac', 35, 'Mumbai', 'Bangalore', '20:00:00', '08:00:00', 850, ['water bottle', 'tv', 'charging point']),
    ('VRL Travels', 'MH15RT3456', 'sleeper_ac', 40, 'Mumbai', 'Bangalore', '21:30:00', '09:30:00', 920, ['water bottle', 'blanket', 'charging point', 'tv']),
    ('SRS Express', 'MH18LM7890', 'sleeper_non_ac', 36, 'Mumbai', 'Bangalore', '19:00:00', '07:00:00', 780, ['water bottle', 'blanket']),
    ('Rajdhani Deluxe', 'DL01RD1001', 'sleeper_ac', 42, 'Mumbai', 'Delhi', '17:00:00', '09:00:00', 1400, ['water bottle', 'blanket', 'charging point', 'tv']),
    ('National Express', 'DL02NE2002', 'seat_ac', 38, 'Mumbai', 'Delhi', '18:30:00', '10:30:00', 1200, ['water bottle', 'charging point']),
    ('Maharashtra Travels', 'MH22MT3003', 'sleeper_non_ac', 34, 'Mumbai', 'Delhi', '16:00:00', '08:00:00', 1100, ['water bottle', 'blanket']),
    ('Orange Travels', 'TN09EF9012', 'sleeper_non_ac', 30, 'Chennai', 'Hyderabad', '22:00:00', '06:00:00', 600, ['water bottle', 'blanket']),
    ('KPN Travels', 'TN11KP4567', 'sleeper_ac', 40, 'Chennai', 'Hyderabad', '21:00:00', '05:00:00', 680, ['water bottle', 'blanket', 'charging point']),
    ('Jabbar Express', 'TN14JB8901', 'seat_ac', 36, 'Chennai', 'Hyderabad', '23:30:00', '07:30:00', 550, ['water bottle', 'tv']),
    ('Royal Cruiser', 'DL05RC1100', 'sleeper_ac', 40, 'Delhi', 'Jaipur', '07:00:00', '12:00:00', 500, ['water bottle', 'blanket', 'charging point']),
    ('Pink City Express', 'RJ01PC2200', 'seat_ac', 35, 'Delhi', 'Jaipur', '14:00:00', '19:00:00', 480, ['water bottle', 'charging point']),
    ('Rajasthan Roadways', 'RJ02RR3300', 'sleeper_non_ac', 32, 'Delhi', 'Jaipur', '23:00:00', '04:00:00', 450, ['water bottle', 'blanket']),
    ('KPN Travels', 'KA03KT4400', 'sleeper_ac', 40, 'Bangalore', 'Chennai', '22:00:00', '06:00:00', 700, ['water bottle', 'blanket', 'charging point', 'tv']),
    ('Orange Tours', 'KA07OT5500', 'seat_ac', 38, 'Bangalore', 'Chennai', '21:00:00', '05:00:00', 650, ['water bottle', 'tv']),
    ('Green Express', 'KA09GE6600', 'sleeper_non_ac', 34, 'Bangalore', 'Chennai', '23:00:00', '07:00:00', 620, ['water bottle', 'blanket']),
    ('Paulo Travels', 'MH08PT7700', 'sleeper_ac', 36, 'Pune', 'Goa', '20:00:00', '04:00:00', 750, ['water bottle', 'blanket', 'charging point']),
    ('Konkan Kanya', 'MH09KK8800', 'seat_ac', 32, 'Pune', 'Goa', '21:30:00', '05:30:00', 680, ['water bottle', 'tv']),
    ('Goa Express', 'GA01GX9900', 'sleeper_non_ac', 30, 'Pune', 'Goa', '19:00:00', '03:00:00', 640, ['water bottle', 'blanket']),
    ('KSRTC Swift', 'KL02KS1010', 'sleeper_ac', 40, 'Bangalore', 'Kochi', '20:00:00', '06:00:00', 900, ['water bottle', 'blanket', 'charging point']),
    ('Kallada Travels', 'KL03KT2020', 'seat_ac', 35, 'Bangalore', 'Kochi', '21:00:00', '07:00:00', 820, ['water bottle', 'charging point']),
    ('Kerala Express', 'KL04KE3030', 'sleeper_non_ac', 32, 'Bangalore', 'Kochi', '22:30:00', '08:30:00', 780, ['water bottle', 'blanket']),
]

def db():
    return pymysql.connect(**DB)

def seed_routes(oid):
    conn = db()
    extra = []
    for name, num, btype, seats, orig, dest, dep, arr, fare, am in SEED_ROUTES:
        extra.append((name + ' Return', 'R-' + num, btype, seats, dest, orig, dep, arr, fare, am))
    all_routes = SEED_ROUTES + extra
    with conn.cursor() as c:
        for name, num, btype, seats, orig, dest, dep, arr, fare, am in all_routes:
            c.execute("SELECT id FROM routes WHERE bus_number=%s", (num,))
            if c.fetchone():
                continue
            c.execute("""INSERT INTO routes (operator_id,bus_name,bus_number,bus_type,total_seats,
                       origin,destination,departure_time,arrival_time,fare,amenities)
                       VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
                      (oid, name, num, btype, seats, orig, dest, dep, arr, fare, json.dumps(am)))
    conn.close()

def init_db():
    conn = db()
    with conn.cursor() as c:
        c.execute("""CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL,
            email VARCHAR(120) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL,
            gender VARCHAR(20), phone VARCHAR(20), address TEXT,
            role ENUM('user','operator','admin') DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)""")
        c.execute("""CREATE TABLE IF NOT EXISTS routes (
            id INT AUTO_INCREMENT PRIMARY KEY, operator_id INT NOT NULL,
            bus_name VARCHAR(100) NOT NULL, bus_number VARCHAR(50) NOT NULL,
            bus_type ENUM('sleeper_ac','sleeper_non_ac','seat_ac','seat_non_ac') NOT NULL,
            total_seats INT NOT NULL, origin VARCHAR(100) NOT NULL,
            destination VARCHAR(100) NOT NULL, departure_time TIME NOT NULL,
            arrival_time TIME NOT NULL, fare DECIMAL(10,2) NOT NULL,
            amenities JSON)""")
        c.execute("""CREATE TABLE IF NOT EXISTS bookings (
            id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, route_id INT NOT NULL,
            travel_date DATE NOT NULL, seats JSON NOT NULL, total_fare DECIMAL(10,2) NOT NULL,
            status ENUM('confirmed','cancelled','refunded') DEFAULT 'confirmed',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)""")
        c.execute("SELECT id FROM users WHERE role='admin' LIMIT 1")
        if not c.fetchone():
            c.execute("INSERT INTO users (name,email,password,role) VALUES (%s,%s,%s,'admin')",
                      ('Admin', 'admin@fastx.com', generate_password_hash('admin123')))
        c.execute("SELECT id FROM users WHERE role='operator' LIMIT 1")
        op = c.fetchone()
        if not op:
            c.execute("INSERT INTO users (name,email,password,gender,phone,role) VALUES (%s,%s,%s,%s,%s,'operator')",
                      ('Operator', 'operator@fastx.com', generate_password_hash('operator123'), 'Male', '9876543210'))
            oid = c.lastrowid
        else:
            oid = op['id']
    conn.close()
    seed_routes(oid)

def token_for(user):
    return jwt.encode({'id': user['id'], 'role': user['role'], 'exp': datetime.utcnow() + timedelta(days=1)},
                      app.config['SECRET'], algorithm='HS256')

def auth_required(*roles):
    def deco(fn):
        @wraps(fn)
        def wrap(*a, **kw):
            h = request.headers.get('Authorization', '')
            if not h.startswith('Bearer '):
                return jsonify({'error': 'Login required'}), 401
            try:
                g.user = jwt.decode(h[7:], app.config['SECRET'], algorithms=['HS256'])
            except jwt.PyJWTError:
                return jsonify({'error': 'Session expired, please login again'}), 401
            if roles and g.user['role'] not in roles:
                return jsonify({'error': 'Access denied'}), 403
            return fn(*a, **kw)
        return wrap
    return deco

def q(sql, args=(), one=False):
    conn = db()
    with conn.cursor() as c:
        c.execute(sql, args)
        r = c.fetchone() if one else c.fetchall()
    conn.close()
    return r

def run(sql, args=()):
    conn = db()
    with conn.cursor() as c:
        c.execute(sql, args)
        lid = c.lastrowid
    conn.close()
    return lid

def parse_json(row, *keys):
    if not row:
        return row
    for k, v in row.items():
        if hasattr(v, 'total_seconds'):
            row[k] = str(v).split('.')[0][:8] if v.days == 0 else str(v)
        elif isinstance(v, (date, datetime)):
            row[k] = v.isoformat() if hasattr(v, 'isoformat') else str(v)
    for k in keys:
        if k in row and isinstance(row[k], str):
            row[k] = json.loads(row[k])
    return row

def booked_seats(route_id, travel_date):
    rows = q("SELECT seats FROM bookings WHERE route_id=%s AND travel_date=%s AND status='confirmed'",
             (route_id, travel_date))
    taken = []
    for r in rows:
        taken.extend(json.loads(r['seats']) if isinstance(r['seats'], str) else r['seats'])
    return taken

@app.route('/')
def index():
    return jsonify({'app': 'FastX API', 'status': 'ok', 'ui': _frontend})

@app.route('/health')
def health():
    try:
        q("SELECT 1", one=True)
        return jsonify({'status': 'healthy'})
    except Exception as e:
        return jsonify({'status': 'error', 'detail': str(e)}), 503

@app.route('/api/register', methods=['POST'])
def register():
    d = request.json or {}
    for f in ('name', 'email', 'password'):
        if not d.get(f):
            return jsonify({'error': f'{f} is required'}), 400
    if len(d.get('password', '')) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400
    if d.get('confirm_password') and d['password'] != d['confirm_password']:
        return jsonify({'error': 'Passwords do not match'}), 400
    email = d.get('email', '').strip()
    if '@' not in email or '.' not in email.split('@')[-1]:
        return jsonify({'error': 'Invalid email format'}), 400
    role = d.get('role', 'user')
    if role not in ('user', 'operator'):
        role = 'user'
    if q("SELECT id FROM users WHERE email=%s", (email,), one=True):
        return jsonify({'error': 'Email already registered'}), 400
    if q("SELECT id FROM users WHERE name=%s", (d['name'].strip(),), one=True):
        return jsonify({'error': 'Username already taken'}), 400
    uid = run("INSERT INTO users (name,email,password,gender,phone,address,role) VALUES (%s,%s,%s,%s,%s,%s,%s)",
              (d['name'].strip(), email, generate_password_hash(d['password']),
               d.get('gender'), d.get('phone'), d.get('address'), role))
    user = q("SELECT id,role FROM users WHERE id=%s", (uid,), one=True)
    return jsonify({'message': 'Registration successful', 'token': token_for(user)}), 201

@app.route('/api/login', methods=['POST'])
def login():
    d = request.json or {}
    login_id, pwd = d.get('email') or d.get('username'), d.get('password')
    if not login_id or not pwd:
        return jsonify({'error': 'Email/username and password required'}), 400
    user = q("SELECT * FROM users WHERE email=%s OR name=%s", (login_id, login_id), one=True)
    if not user or not check_password_hash(user['password'], pwd):
        return jsonify({'error': 'Invalid credentials'}), 401
    return jsonify({'token': token_for(user), 'role': user['role'],
                    'name': user['name'], 'id': user['id']})

@app.route('/api/forgot-password', methods=['POST'])
def forgot_password():
    d = request.json or {}
    email, pwd = d.get('email'), d.get('password')
    if not email or not pwd:
        return jsonify({'error': 'Email and new password required'}), 400
    if len(pwd) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400
    user = q("SELECT id FROM users WHERE email=%s", (email,), one=True)
    if not user:
        return jsonify({'error': 'Email not found'}), 404
    run("UPDATE users SET password=%s WHERE id=%s", (generate_password_hash(pwd), user['id']))
    return jsonify({'message': 'Password reset successful'})

@app.route('/api/locations')
def locations():
    qterm = (request.args.get('q') or '').lower()
    return jsonify([l for l in LOCATIONS if qterm in l.lower()])

@app.route('/api/profile', methods=['GET', 'PUT'])
@auth_required()
def profile():
    if request.method == 'GET':
        u = q("SELECT id,name,email,gender,phone,address,role FROM users WHERE id=%s",
              (g.user['id'],), one=True)
        return jsonify(u)
    d = request.json or {}
    name = (d.get('name') or '').strip()
    if not name or len(name) < 2:
        return jsonify({'error': 'Name must be at least 2 characters'}), 400
    phone = d.get('phone') or ''
    if phone and len(phone) != 10:
        return jsonify({'error': 'Phone must be 10 digits'}), 400
    run("UPDATE users SET name=%s,gender=%s,phone=%s,address=%s WHERE id=%s",
        (name, d.get('gender'), phone or None, d.get('address'), g.user['id']))
    u = q("SELECT id,name,email,gender,phone,address,role FROM users WHERE id=%s",
          (g.user['id'],), one=True)
    return jsonify({'message': 'Profile updated', 'profile': u})

@app.route('/api/routes/search')
def search_routes():
    origin = (request.args.get('origin') or '').strip()
    dest = (request.args.get('destination') or '').strip()
    travel = (request.args.get('date') or '').strip()
    if not origin or not dest or not travel:
        return jsonify({'error': 'Origin, destination and date required'}), 400
    try:
        td = datetime.strptime(travel, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid date format'}), 400
    if td < date.today():
        return jsonify({'error': 'Date must be today or later'}), 400
    rows = q("""SELECT r.*, u.name operator_name FROM routes r
                JOIN users u ON r.operator_id=u.id
                WHERE LOWER(r.origin)=LOWER(%s) AND LOWER(r.destination)=LOWER(%s)""",
             (origin, dest))
    out = []
    for r in rows:
        r = parse_json(r, 'amenities')
        taken = booked_seats(r['id'], travel)
        r['available_seats'] = r['total_seats'] - len(taken)
        r['booked_seats'] = taken
        r['travel_date'] = travel
        out.append(r)
    return jsonify(out)

@app.route('/api/routes/<int:rid>')
def route_detail(rid):
    r = q("SELECT r.*, u.name operator_name FROM routes r JOIN users u ON r.operator_id=u.id WHERE r.id=%s",
          (rid,), one=True)
    if not r:
        return jsonify({'error': 'Route not found'}), 404
    return jsonify(parse_json(r, 'amenities'))

@app.route('/api/routes/<int:rid>/seats')
def route_seats(rid):
    travel = request.args.get('date', '')
    if not travel:
        return jsonify({'error': 'Date required'}), 400
    r = q("SELECT total_seats FROM routes WHERE id=%s", (rid,), one=True)
    if not r:
        return jsonify({'error': 'Route not found'}), 404
    taken = booked_seats(rid, travel)
    return jsonify({'total': r['total_seats'], 'booked': taken,
                    'available': [i for i in range(1, r['total_seats'] + 1) if i not in taken]})

@app.route('/api/bookings', methods=['POST'])
@auth_required('user')
def create_booking():
    d = request.json or {}
    rid, travel, seats = d.get('route_id'), d.get('travel_date'), d.get('seats', [])
    if not rid or not travel or not seats:
        return jsonify({'error': 'Route, date and seats required'}), 400
    r = q("SELECT fare,total_seats FROM routes WHERE id=%s", (rid,), one=True)
    if not r:
        return jsonify({'error': 'Route not found'}), 404
    taken = booked_seats(rid, travel)
    for s in seats:
        if s in taken or s < 1 or s > r['total_seats']:
            return jsonify({'error': f'Seat {s} is not available'}), 400
    fare = float(r['fare']) * len(seats)
    bid = run("INSERT INTO bookings (user_id,route_id,travel_date,seats,total_fare) VALUES (%s,%s,%s,%s,%s)",
              (g.user['id'], rid, travel, json.dumps(seats), fare))
    return jsonify({'message': 'Ticket booked successfully', 'booking_id': bid,
                    'total_fare': fare, 'seats': seats}), 201

@app.route('/api/bookings')
@auth_required('user')
def my_bookings():
    rows = q("""SELECT b.*, r.bus_name, r.bus_number, r.origin, r.destination,
                r.departure_time, r.arrival_time, r.bus_type, r.amenities,
                u.name passenger_name, u.email passenger_email, u.phone passenger_phone
                FROM bookings b JOIN routes r ON b.route_id=r.id
                JOIN users u ON b.user_id=u.id
                WHERE b.user_id=%s ORDER BY b.created_at DESC""", (g.user['id'],))
    return jsonify([parse_json(x, 'seats', 'amenities') for x in rows])

@app.route('/api/bookings/<int:bid>')
@auth_required('user')
def booking_detail(bid):
    b = q("""SELECT b.*, r.bus_name, r.bus_number, r.origin, r.destination,
             r.departure_time, r.arrival_time, r.bus_type, r.amenities,
             u.name passenger_name, u.email passenger_email, u.phone passenger_phone
             FROM bookings b JOIN routes r ON b.route_id=r.id
             JOIN users u ON b.user_id=u.id
             WHERE b.id=%s AND b.user_id=%s""", (bid, g.user['id']), one=True)
    if not b:
        return jsonify({'error': 'Booking not found'}), 404
    return jsonify(parse_json(b, 'seats', 'amenities'))

@app.route('/api/bookings/<int:bid>', methods=['DELETE'])
@auth_required('user')
def cancel_booking(bid):
    b = q("SELECT * FROM bookings WHERE id=%s AND user_id=%s", (bid, g.user['id']), one=True)
    if not b:
        return jsonify({'error': 'Booking not found'}), 404
    if b['status'] != 'confirmed':
        return jsonify({'error': 'Booking already cancelled or refunded'}), 400
    run("UPDATE bookings SET status='cancelled' WHERE id=%s", (bid,))
    return jsonify({'message': 'Booking cancelled. Refund will be processed by operator.'})

@app.route('/api/operator/routes', methods=['GET', 'POST'])
@auth_required('operator')
def operator_routes():
    if request.method == 'GET':
        rows = q("SELECT * FROM routes WHERE operator_id=%s", (g.user['id'],))
        return jsonify([parse_json(x, 'amenities') for x in rows])
    d = request.json or {}
    req = ('bus_name', 'bus_number', 'bus_type', 'total_seats', 'origin', 'destination',
           'departure_time', 'arrival_time', 'fare')
    if any(not d.get(k) for k in req):
        return jsonify({'error': 'All route fields required'}), 400
    rid = run("""INSERT INTO routes (operator_id,bus_name,bus_number,bus_type,total_seats,
               origin,destination,departure_time,arrival_time,fare,amenities)
               VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
              (g.user['id'], d['bus_name'], d['bus_number'], d['bus_type'], d['total_seats'],
               d['origin'], d['destination'], d['departure_time'], d['arrival_time'],
               d['fare'], json.dumps(d.get('amenities', []))))
    return jsonify({'message': 'Route added', 'id': rid}), 201

@app.route('/api/operator/routes/<int:rid>', methods=['PUT', 'DELETE'])
@auth_required('operator')
def operator_route(rid):
    r = q("SELECT id FROM routes WHERE id=%s AND operator_id=%s", (rid, g.user['id']), one=True)
    if not r:
        return jsonify({'error': 'Route not found'}), 404
    if request.method == 'DELETE':
        run("DELETE FROM routes WHERE id=%s", (rid,))
        return jsonify({'message': 'Route removed'})
    d = request.json or {}
    run("""UPDATE routes SET bus_name=%s,bus_number=%s,bus_type=%s,total_seats=%s,
           origin=%s,destination=%s,departure_time=%s,arrival_time=%s,fare=%s,amenities=%s
           WHERE id=%s""",
        (d.get('bus_name'), d.get('bus_number'), d.get('bus_type'), d.get('total_seats'),
         d.get('origin'), d.get('destination'), d.get('departure_time'), d.get('arrival_time'),
         d.get('fare'), json.dumps(d.get('amenities', [])), rid))
    return jsonify({'message': 'Route updated'})

@app.route('/api/operator/bookings')
@auth_required('operator')
def operator_bookings():
    rows = q("""SELECT b.*, r.bus_name, r.bus_number, u.name user_name, u.email user_email
                FROM bookings b JOIN routes r ON b.route_id=r.id
                JOIN users u ON b.user_id=u.id
                WHERE r.operator_id=%s ORDER BY b.created_at DESC""", (g.user['id'],))
    return jsonify([parse_json(x, 'seats') for x in rows])

@app.route('/api/operator/routes/<int:rid>/seats')
@auth_required('operator')
def operator_route_seats(rid):
    travel = request.args.get('date', '')
    if not travel:
        return jsonify({'error': 'Date required'}), 400
    r = q("SELECT total_seats FROM routes WHERE id=%s AND operator_id=%s",
          (rid, g.user['id']), one=True)
    if not r:
        return jsonify({'error': 'Route not found'}), 404
    taken = booked_seats(rid, travel)
    return jsonify({'total': r['total_seats'], 'booked': taken,
                    'available': [i for i in range(1, r['total_seats'] + 1) if i not in taken]})

@app.route('/api/operator/refund/<int:bid>', methods=['POST'])
@auth_required('operator')
def operator_refund(bid):
    b = q("""SELECT b.id FROM bookings b JOIN routes r ON b.route_id=r.id
             WHERE b.id=%s AND r.operator_id=%s AND b.status='cancelled'""",
          (bid, g.user['id']), one=True)
    if not b:
        return jsonify({'error': 'Cancelled booking not found'}), 404
    run("UPDATE bookings SET status='refunded' WHERE id=%s", (bid,))
    return jsonify({'message': 'Refund processed'})

@app.route('/api/admin/users')
@auth_required('admin')
def admin_users():
    return jsonify(q("SELECT id,name,email,gender,phone,role,created_at FROM users WHERE role='user'"))

@app.route('/api/admin/users/<int:uid>', methods=['DELETE'])
@auth_required('admin')
def admin_del_user(uid):
    run("DELETE FROM users WHERE id=%s AND role='user'", (uid,))
    return jsonify({'message': 'User deleted'})

@app.route('/api/admin/operators')
@auth_required('admin')
def admin_operators():
    return jsonify(q("SELECT id,name,email,phone,created_at FROM users WHERE role='operator'"))

@app.route('/api/admin/operators/<int:oid>', methods=['DELETE'])
@auth_required('admin')
def admin_del_operator(oid):
    run("DELETE FROM users WHERE id=%s AND role='operator'", (oid,))
    return jsonify({'message': 'Operator deleted'})

@app.route('/api/admin/bookings')
@auth_required('admin')
def admin_bookings():
    rows = q("""SELECT b.*, r.bus_name, u.name user_name FROM bookings b
                JOIN routes r ON b.route_id=r.id JOIN users u ON b.user_id=u.id
                ORDER BY b.created_at DESC""")
    return jsonify([parse_json(x, 'seats') for x in rows])

@app.route('/api/admin/bookings/<int:bid>', methods=['DELETE'])
@auth_required('admin')
def admin_del_booking(bid):
    run("DELETE FROM bookings WHERE id=%s", (bid,))
    return jsonify({'message': 'Booking deleted'})

@app.route('/api/admin/routes')
@auth_required('admin')
def admin_routes():
    rows = q("""SELECT r.*, u.name operator_name FROM routes r
                JOIN users u ON r.operator_id=u.id""")
    return jsonify([parse_json(x, 'amenities') for x in rows])

@app.route('/api/admin/routes/<int:rid>', methods=['DELETE'])
@auth_required('admin')
def admin_del_route(rid):
    run("DELETE FROM routes WHERE id=%s", (rid,))
    return jsonify({'message': 'Route deleted'})

if __name__ == '__main__':
    init_db()
    port = int(os.getenv('PORT', 5000))
    app.run(debug=os.getenv('FLASK_DEBUG', '0') == '1', host='0.0.0.0', port=port)
else:
    init_db()
