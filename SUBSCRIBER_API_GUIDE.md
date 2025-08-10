# Subscriber API Guide

## Overview
Complete newsletter subscription system with public and admin endpoints.

## Public Endpoints

### Subscribe
**POST** `/api/subscribers/subscribe`
```json
{
  "email": "user@example.com",
  "subscribingTo": "FOOTER",
  "item": { "name": "Book", "id": "123" } // Required for BOOK_PUBLISH
}
```

### Unsubscribe
**POST** `/api/subscribers/unsubscribe`
```json
{
  "email": "user@example.com",
  "subscribingTo": "FOOTER" // Optional
}
```

### Check Status
**GET** `/api/subscribers/check/:email`

## Admin Endpoints

### List Subscribers
**GET** `/api/subscribers?page=1&limit=10&search=email&subscribingTo=FOOTER`

### Get Stats
**GET** `/api/subscribers/stats`

### Update Subscriber
**PUT** `/api/subscribers/:id`

### Delete Subscriber
**DELETE** `/api/subscribers/:id`

### Bulk Operations
**POST** `/api/subscribers/bulk`
```json
{
  "subscriberIds": ["id1", "id2"],
  "operation": "activate|deactivate|delete"
}
```

### Export
**GET** `/api/subscribers/export?subscribingTo=FOOTER`

## Subscription Types
- `FOOTER`: Newsletter signup from footer
- `MODAL`: Newsletter signup from modal
- `BOOK_PUBLISH`: Book launch notifications

## Authentication
Admin endpoints require JWT token with ADMIN/SUPER_ADMIN role. 