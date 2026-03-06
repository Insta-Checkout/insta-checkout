# Security Notes (To Implement)

This document tracks security items to implement before or during production deployment.

---

## Firebase Storage — Bucket Structure

**Bucket:** `gs://instacheckout-a4141.firebasestorage.app`

### Path Structure

```
products/
  {firebaseUid}/                    # One folder per user (Firebase Auth UID)
    {productId}_{timestamp}_{id}.ext   # When editing: productId known
    new_{timestamp}_{id}.ext           # When creating: no productId yet
```

**Examples:**
- `products/abc123xyz/507f1f77bcf86cd799439011_1710000000000_a1b2c3.jpg` — edit flow
- `products/abc123xyz/new_1710000000000_x9y8z7.png` — create flow

**Product–image link:** Stored in MongoDB (`Product.imageUrl`). The path is for organization and security.

### Why This Structure

| Benefit | Description |
|---------|-------------|
| User isolation | Each user has their own folder; rules enforce `userId == auth.uid` |
| Product correlation | When editing, `productId` in filename helps identify orphaned files for cleanup |
| Unique filenames | `timestamp` + `shortId` avoid collisions |
| 5 MB limit | Applied in app and Storage rules |

---

## Firebase Storage Rules

**File:** `storage.rules` (deploy with `firebase deploy --only storage`)

- **5 MB max** per file
- **image/* only** allowed
- **Write:** only authenticated user to their own folder
- **Read:** public (for checkout display)

### Detecting Overuse

Storage rules cannot enforce per-user quotas. Options:

| Approach | Use | Effort |
|----------|-----|--------|
| **GCP Console metrics** | See total bucket usage; not per-user | None |
| **Cloud Function on upload** | Increment Firestore counter per user; check before upload | Medium |
| **Backend pre-upload check** | Call backend to verify quota; backend tracks usage in DB | Medium |
| **Admin script** | List all objects under `products/{uid}/` and sum sizes | Low (manual) |

**Recommended:** Cloud Function (or backend) that:
1. On upload: increments `users/{uid}/storageUsed` in Firestore
2. Before upload: frontend checks `storageUsed < MAX_QUOTA` (e.g. 100 MB per user)
3. On product delete: decrement when image URL is removed

---

## Implemented

- [x] 5 MB limit (client + server rules)
- [x] Image type only (server rules)
- [x] User folder per Firebase UID
- [x] Product ID in path when editing

---

*Last updated: 2025-03*
