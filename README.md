# Restaurant Manager Pro - API Backend

API backend for all Restaurant Manager Pro widgets and integrations.

## Domain
- **Production:** api.restaurantmanagerpro.fr
- **Purpose:** Handle all widget API calls for multi-tenant restaurant system

## Architecture

This API serves as the central backend for:
- Reservation widgets (widget.restaurantmanagerpro.fr)
- Restaurant websites using the widget
- Mobile app integrations

## API Endpoints

### Public Endpoints (Used by Widgets)
- `POST /api/save-reservation` - Create new reservation
- `GET /api/check-restaurant-status` - Get restaurant settings and availability
- `POST /api/check-availability` - Check slot availability
- `GET /api/get-reservations` - Get reservations (authenticated)
- `PUT /api/update-reservation-status` - Update reservation status
- `DELETE /api/delete-reservation` - Delete reservation

## Security Features

- ✅ Rate limiting (5 requests per 15 min for reservations)
- ✅ Email format validation
- ✅ Phone number validation (international)
- ✅ Input sanitization (XSS prevention)
- ✅ Sentry error monitoring

## Environment Variables

```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (Server-side)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Sentry
NEXT_PUBLIC_SENTRY_DSN=

# API Configuration
FUNCTIONS_BASE_URL=https://us-central1-casanova-dissy-reservations.cloudfunctions.net
RESERVATION_API_KEY=casanova-reserve-app-key
DEFAULT_RESTAURANT_CODE=DEMO2024
```

## Development

```bash
npm install
npm run dev
```

Server runs on http://localhost:3001

## Deployment

Deploy to Vercel:
- Domain: api.restaurantmanagerpro.fr
- Auto-deploy from main branch
- Environment variables configured in Vercel dashboard

## CORS Configuration

Allows requests from:
- *.restaurantmanagerpro.fr
- Restaurant client domains (configured per restaurant)
