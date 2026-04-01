# ⚽ Yalla Kora API

Base URL: `http://localhost:3000/api`

All protected routes require:
```
Authorization: Bearer <token>
```

---

## 🔐 AUTH

### POST /auth/register — Player
```json
{
  "name": "Ahmed",
  "phone": "01012345678",
  "password": "123456",
  "role": "player",
  "age": 22
}
```

### POST /auth/register — Owner
```json
{
  "name": "Ahmed",
  "phone": "01012345678",
  "password": "123456",
  "role": "owner",
  "field_name": "ملعب الهدف"
}
```

### POST /auth/login
```json
{ "phone": "01012345678", "password": "123456" }
```
**Returns:** `{ token, user: { id, name, phone, role } }`

---

## 👤 USER — Protected

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /user/profile | Get my profile |
| PUT | /user/profile | Update profile |

---

## 🏟️ FIELDS

| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| GET | /fields | No | - |
| GET | /fields/:field_id | No | - |
| POST | /fields | Yes | owner |
| PUT | /fields/:field_id | Yes | owner |
| POST | /fields/:field_id/images | Yes | owner |

### GET /fields — Query Params
- `?location=مدينة نصر`
- `?type=5x5` (5x5 / 7x7 / 11x11)
- `?min_price=200&max_price=500`
- `?search=ملعب الهدف`

### POST /fields (owner only)
```json
{
  "name": "ملعب الكابيتانو",
  "location": "القاهرة - ألف مسكن",
  "price_per_hour": 300,
  "type": "5x5",
  "open_time": "09:00",
  "close_time": "23:00",
  "features": ["نجيل صناعي", "كافيتريا", "غرف تبديل"]
}
```

### POST /fields/:field_id/images (owner only)
- Form-data, key: `images` (multiple files allowed)

---

## 📅 AVAILABILITY

| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| GET | /fields/:field_id/schedule?date=YYYY-MM-DD | No | - |
| POST | /fields/:field_id/schedule | Yes | owner |

### GET /fields/:field_id/schedule?date=2026-02-03
**Returns:**
```json
{
  "date": "2026-02-03",
  "slots": [
    { "time": "09:00", "status": "available" },
    { "time": "17:00", "status": "booked" }
  ]
}
```
> Auto-generates slots from field open/close time if not set yet

### POST /fields/:field_id/schedule (owner)
```json
{
  "date": "2026-02-03",
  "slots": [
    { "time": "17:00", "status": "available" },
    { "time": "18:00", "status": "booked" }
  ]
}
```

---

## 📖 BOOKINGS — Protected (player only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /bookings | Create booking |
| GET | /bookings?type=upcoming | My upcoming bookings |
| GET | /bookings?type=past | My past bookings |
| GET | /bookings/:booking_id | Booking details |
| DELETE | /bookings/:booking_id | Cancel booking |

### POST /bookings
```json
{
  "field_id": "64abc123...",
  "date": "2025-12-03",
  "time_from": "17:00",
  "time_to": "18:00",
  "players_count": 10,
  "type": "5x5",
  "payment_method": "cash"
}
```
payment_method: `cash` | `vodafone_cash` | `wallet`

**Returns booking with:**
- `booking_code` (e.g. BO-2547)
- `total_price` = price_per_hour × hours + service_fee (10 ج)
- Slots auto-marked as booked

**Cancel:** refunds wallet balance if paid by wallet

---

## 🏟️ OWNER DASHBOARD — Protected (owner only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /owner/fields/:field_id/bookings | All bookings for field |
| GET | /owner/fields/:field_id/dashboard?date=YYYY-MM-DD | Daily schedule view |

### GET /owner/fields/:field_id/dashboard?date=2026-02-03
**Returns:**
```json
{
  "date": "2026-02-03",
  "summary": {
    "total_slots": 14,
    "booked_slots": 4,
    "available_slots": 10,
    "revenue_today": 1240
  },
  "slots": [
    {
      "time": "17:00",
      "status": "booked",
      "booking": { "booking_code": "BO-2547", "player": {...} }
    }
  ]
}
```

---

## 💰 WALLET — Protected

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /wallet | Get balance |
| POST | /wallet/charge | Charge wallet |

### POST /wallet/charge
```json
{ "amount": 100, "method": "vodafone_cash" }
```

---

## 👥 MATCHES (التقسيمات) — Protected (player)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /matches | All open matches |
| GET | /matches/:match_id | Match details |
| POST | /matches | Create match |
| POST | /matches/:match_id/join | Join match |
| POST | /matches/:match_id/leave | Leave match |

### POST /matches
```json
{
  "field_id": "64abc123...",
  "date": "2025-12-03",
  "time": "21:00",
  "players_needed": 10,
  "price_per_player": 30
}
```
> Creator joins automatically. Status: `open` → `full` when spots filled.

---

## ⭐ RATINGS — Protected (player)

### POST /fields/:field_id/rate
```json
{ "rating": 5, "comment": "ملعب ممتاز" }
```
> Must have a booking at the field. Updates field `rating_avg` automatically.

---

## 🔁 Response Format

### Success
```json
{
  "status": "success",
  "message": "تم تأكيد الحجز بنجاح",
  "data": { ... }
}
```

### Error
```json
{
  "status": "error",
  "message": "الوقت 17:00 محجوز بالفعل"
}
```

---

## ⚙️ Setup

```bash
cp .env.example .env
# fill in MONGODB_URI, JWT_SECRET, CLOUDINARY_*

npm install
npm run dev
```

## 🔒 Business Rules

1. **Double booking prevention** — slots checked before confirming
2. **Booking code** — auto-generated `BO-XXXX`
3. **Wallet deducted on booking**, refunded on cancel
4. **Schedule auto-generated** from field open/close times on first request
5. **Rating** — only players who booked the field can rate it
6. **Match** — creator can't leave their own match
