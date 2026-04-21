# Frontend Integration Changes

## Scope
This document summarizes backend API changes that require frontend updates for subscription/billing and support contact flows.

## 1) New Support Endpoint

### Endpoint
- `POST /api/v1/issue/contact-provider`
- Auth: required (`auth()`)

### Request Body
```json
{
  "subject": "Unable to update subscription",
  "message": "I am seeing a card error on checkout.",
  "clinicId": "optional-uuid",
  "type": "optional IssueType",
  "priority": "optional IssuePriority"
}
```

### Validation Rules
- `subject`: required, string, min `5`, max `200`
- `message`: required, string, min `10`, max `2000`
- `clinicId`: optional UUID
- `type`: optional enum (`IssueType`)
- `priority`: optional enum (`IssuePriority`)

### Success Response
- Status: `201`
- Message: `Message sent to platform provider successfully`
- `data`: created `userIssue` record

### Frontend Notes
- Add a new "Contact Provider" / "Contact Support" form.
- Show backend validation errors as field-level errors.
- `message` is user-authored content; do not treat it as a translation key.

## 2) New Subscription Billing Endpoints

### 2.1 Get Default Card
- `GET /api/v1/subscription/payment-method`
- Auth: required (`auth("clinician_subscription")`)

Success data shape:
```json
{
  "paymentMethod": {
    "id": "pm_...",
    "brand": "visa",
    "last4": "4242",
    "expMonth": 12,
    "expYear": 2028,
    "funding": "credit",
    "country": "US",
    "displayLabel": "VISA ending in 4242",
    "expiresLabel": "12/28"
  }
}
```

`paymentMethod` can be `null` if no default card exists.

### 2.2 Create Billing Portal Session
- `POST /api/v1/subscription/billing-portal`
- Auth: required (`auth("clinician_subscription")`)

Request body:
```json
{
  "returnUrl": "https://your-frontend/internal/settings/subscription"
}
```

- `returnUrl` is optional.
- If omitted, backend uses: `${FRONTEND_URL}/internal/settings/subscription`.
- Backend only accepts valid `http/https` URLs.

Success data shape:
```json
{
  "url": "https://billing.stripe.com/session/..."
}
```

### Frontend Notes
- Add an "Update payment method" button that calls `/api/v1/subscription/billing-portal` then redirects to returned `url`.
- Handle `400` errors for invalid `returnUrl` or missing Stripe customer.

## 3) Response Shape Changes (Plans + Usage)

## 3.1 `GET /api/v1/subscription/current`
Now includes `paymentMethod` in response data:
```json
{
  "subscription": { "...": "..." },
  "usage": { "...": "..." },
  "paymentMethod": { "...": "..." }
}
```

## 3.2 `GET /api/v1/subscription/plans`
Plans now include `seatPolicy`:
```json
{
  "seatPolicy": {
    "includedClinicians": 5,
    "includedAdminUsers": 1,
    "extraCliniciansAllowed": true
  }
}
```

## 3.3 `GET /api/v1/subscription/usage`
Usage now includes:
- `adminUsers` block
- richer values for each block (`included`, `remaining`, `overage`)
- plan-level `seatPolicy`

Representative shape:
```json
{
  "clients": {
    "canAddClient": true,
    "currentCount": 20,
    "limit": 100,
    "included": 100,
    "remaining": 80,
    "overage": 0,
    "isUnlimited": false
  },
  "clinicians": {
    "canAddClinician": true,
    "currentCount": 6,
    "limit": 5,
    "included": 5,
    "remaining": 0,
    "overage": 1,
    "isUnlimited": false
  },
  "adminUsers": {
    "canAddAdminUser": true,
    "currentCount": 2,
    "billableCount": 1,
    "limit": 1,
    "included": 1,
    "remaining": 0,
    "overage": 0,
    "ownerExempted": true
  },
  "plan": {
    "name": "Professional",
    "price": 99,
    "seatPolicy": {
      "includedClinicians": 5,
      "includedAdminUsers": 1,
      "extraCliniciansAllowed": true
    }
  },
  "subscription": {
    "status": "active",
    "currentPeriodEnd": "...",
    "trialEnd": null
  }
}
```

### Frontend Notes
- Update TS/API types for `plans`, `usage`, and `current` subscription responses.
- Use `seatPolicy` for UI labels (included seats, add-on eligibility).
- Display `adminUsers` usage in subscription/limits UI.

## 4) Plan Management Payload Update (Admin/Backoffice)
When creating plans via plans module, `adminUserLimit` is now supported.

### New Field
- `adminUserLimit`: integer, optional, min `0`

### Frontend Note
- If you have an internal plan-create/edit form, add this field.

## 5) Suggested Frontend Task Checklist
1. Add `POST /api/v1/issue/contact-provider` form integration.
2. Add payment method section using `GET /api/v1/subscription/payment-method`.
3. Add "Manage billing" redirect flow via `POST /api/v1/subscription/billing-portal`.
4. Update plan and usage types to include `seatPolicy` and `adminUsers`.
5. Update subscription current endpoint type to include `paymentMethod`.
6. Update internal plan-admin form to send `adminUserLimit`.
