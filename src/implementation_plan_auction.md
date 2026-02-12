# Implementation Plan - Art Auction System

## 1. Database Schema (Firebase Firestore)

### Collections
1.  `auctions`
    *   `id`: Auto-generated
    *   `title`: String
    *   `description`: String
    *   `images`: Array<String>
    *   `startingPrice`: Number
    *   `minBidIncrement`: Number
    *   `currentHighestBid`: Number (initially 0 or startingPrice)
    *   `highestBidderId`: String (null initially)
    *   `startTime`: Timestamp
    *   `endTime`: Timestamp
    *   `status`: 'active' | 'ended' | 'sold' | 'awaiting_payment'
    *   `createdAt`: Timestamp

2.  `bids`
    *   `id`: Auto-generated
    *   `auctionId`: String (Reference)
    *   `userId`: String (Reference)
    *   `amount`: Number
    *   `timestamp`: Timestamp

3.  `users` (Existing, but need to ensure profile completeness for bidding)

## 2. Admin Dashboard (Auction Management)
*   **Route**: `/akshath/auctions` (Protected Admin Route)
*   **Features**:
    *   **List Auctions**: View all auctions with status.
    *   **Create Auction**: Form to add title, description, images, starting price, increment, end time.
    *   **Manage Auction**:
        *   Manually end auction (if needed).
        *   View bid history.
        *   See highest bidder.

## 3. Frontend Auction Page
*   **Route**: `/auction/[id]`
*   **Components**:
    *   `AuctionHero`: Display image, title, description.
    *   `BidControls`:
        *   Current Bid Display.
        *   Countdown Timer (Live).
        *   Bid Input & "Place Bid" Button (Authenticated only).
        *   "Login to Bid" CTA.
    *   `BidHistory`: List of recent bids (Usernames masked e.g., "User ***").
*   **Logic**:
    *   Real-time updates using Firestore listeners (`onSnapshot`).
    *   "Pop/Toast" notification when a new bid is placed.

## 4. Backend Logic & Security (API Routes)
*   **API**: `/api/auction/bid`
    *   **Method**: `POST`
    *   **Validation**:
        *   User authenticated?
        *   Auction active?
        *   Auction not ended?
        *   Bid amount >= Highest + Increment?
    *   **Race Condition Handling**: Use Firestore Transactions to ensure atomic updates of `currentHighestBid` and `highestBidderId`.
    *   **Extension**: If bid is within last 2 mins, extend `endTime` by 2 mins (Anti-sniping).

*   **API**: `/api/auction/checkout/[auctionId]` (or check logic in existing checkout)
    *   Only allow if `status === 'awaiting_payment'` AND `userId === highestBidderId`.

## 5. Payment & Fulfillment
*   **Winner Flow**:
    *   When auction ends (time expires), first visitor/admin triggers "End Auction" logic (or lazily computed).
    *   Status becomes `awaiting_payment`.
    *   Winner gets an email/notification (simulated or real).
    *   Winner sees "Pay Now" button on Auction Page.
    *   Checkout flow (reusing Cashfree integration) restricted to this user/item.

## 6. Development Steps
1.  **Backend & DB**: Create `data/auction.js` for Firestore helpers.
2.  **Admin UI**: Build `/akshath/auctions/add` and `/akshath/auctions`.
3.  **API**: Implement `/api/bid` with transaction logic.
4.  **Frontend**: Build `/auction/[id]` with real-time updates.
5.  **Testing**: Verify bidding rules, extensions, and winner flow.
