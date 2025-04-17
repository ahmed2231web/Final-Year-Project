# AgroConnect Stripe Payment & Feedback System Implementation Plan

This document outlines the plan for implementing a Stripe payment gateway and a feedback/dispute system within the AgroConnect application, based on the provided logic and project structure.

**Core Requirements:**

1.  **Delayed Payment Capture:** Funds are authorized on order placement but only captured after customer confirmation of receipt.
2.  **Conditional Feedback:** Customers can only submit feedback after confirming order receipt.
3.  **Dispute Resolution:** A system for customers to report issues (wrong product, scam) before payment capture, managed by admins.
4.  **Admin Moderation:** Feedback and disputes require admin review/approval.
5.  **Integration:** Seamless integration with existing Django backend, React frontend, chat, notifications, and admin interface.

**Recommended Approach:**

*   **Backend:** Create a new Django app (`reviews`) for `Feedback` and `Dispute` models. Update the existing `orders` app for status and Stripe integration. Implement a Stripe webhook handler.
*   **Frontend:** Integrate Stripe Elements for checkout, add necessary UI components/buttons to customer and farmer views, update API services.
*   **Admin:** Utilize the existing Django admin for moderation and dispute management.

## Phase 1: Backend Setup (Django - `backend/`)

1.  **Create New App (`reviews`):**
    *   Run: `python manage.py startapp reviews`
    *   Add `'reviews'` to `INSTALLED_APPS` in `AgroConnect/settings.py`.
2.  **Define Models:**
    *   **`reviews/models.py`:**
        *   `Feedback` model:
            *   ForeignKey to `User` (customer)
            *   ForeignKey to `Order`
            *   `rating` (IntegerField, e.g., 1-5)
            *   `comment` (TextField, optional)
            *   `is_approved` (BooleanField, default=False)
            *   `created_at`, `updated_at` (DateTimeField)
        *   `Dispute` model:
            *   ForeignKey to `User` (customer)
            *   ForeignKey to `Order`
            *   `reason` (TextField)
            *   `evidence_url` (URLField/CharField, optional, for Cloudinary links)
            *   `status` (CharField, choices: `OPEN`, `UNDER_REVIEW`, `RESOLVED_REFUND`, `RESOLVED_COMPLETED`, `CLOSED`)
            *   `admin_notes` (TextField, optional)
            *   `created_at`, `updated_at` (DateTimeField)
    *   **`orders/models.py`:**
        *   Add `status` field: `CharField` with choices (e.g., `PENDING`, `SHIPPED`, `DELIVERED`, `COMPLETED`, `DISPUTED`, `REFUNDED`). Default `PENDING`.
        *   Add `stripe_payment_intent_id`: `CharField(max_length=255, null=True, blank=True, db_index=True)`
        *   Add `stripe_charge_id`: `CharField(max_length=255, null=True, blank=True)` (Useful if capturing results in a Charge ID needed for refunds).
3.  **Stripe Integration:**
    *   Add `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` to `backend/.env`.
    *   Install Stripe library: `pip install stripe` (add to `requirements.txt`).
    *   Configure Stripe API key in `AgroConnect/settings.py` (e.g., `stripe.api_key = os.getenv('STRIPE_SECRET_KEY')`).
4.  **Serializers:**
    *   `reviews/serializers.py`: Create `FeedbackSerializer` and `DisputeSerializer`.
    *   `orders/serializers.py`: Update `OrderSerializer` to include `status` and potentially nested/related feedback/dispute info.
5.  **API Views & Endpoints:**
    *   **Orders App (`orders/views.py`, `orders/urls.py`):**
        *   `POST /api/orders/create-payment-intent/`: Creates Stripe Payment Intent (`capture_method='manual'`), saves Order (status=`PENDING`, `payment_intent_id`). Returns `client_secret`. (Requires authentication)
        *   `POST /api/orders/<order_id>/ship/`: (Farmer action) Updates Order status to `SHIPPED`. Sends notification. (Requires farmer authentication & ownership check)
        *   `POST /api/orders/<order_id>/confirm-receipt/`: (Customer action) Updates Order status to `DELIVERED`. Sends notification. (Requires customer authentication & ownership check)
        *   `POST /api/orders/<order_id>/confirm-payment/`: (Customer action) Captures Stripe Payment Intent. Updates Order status to `COMPLETED`. Sends notification. (Requires customer authentication & ownership check, status must be `DELIVERED`)
    *   **Reviews App (`reviews/views.py`, `reviews/urls.py`):**
        *   `POST /api/feedback/`: Creates `Feedback` (requires Order status `DELIVERED` or `COMPLETED`). Sets `is_approved=False`. Sends notifications. (Requires customer authentication & ownership check)
        *   `POST /api/disputes/`: Creates `Dispute`. Updates Order status to `DISPUTED`. Sends notifications. (Requires customer authentication & ownership check, status must be `DELIVERED`)
    *   **Webhook View (e.g., `stripe_webhooks/views.py`, `stripe_webhooks/urls.py`):**
        *   `POST /api/stripe/webhook/`: Handles Stripe events. Verify signature. Update Order/Dispute status based on events like `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`, `charge.dispute.created`, `charge.refunded`.
6.  **Admin Integration (`reviews/admin.py`, `orders/admin.py`):**
    *   Register `Feedback`, `Dispute` models in `reviews/admin.py`.
    *   Configure `list_display`, `list_filter`, `actions` for moderation and dispute management.
    *   Update `OrderAdmin` in `orders/admin.py` to show the new `status` field.
7.  **Notifications:**
    *   Implement email/chat notifications triggered by status changes, feedback/dispute creation, and resolution.
8.  **Database Migrations:**
    *   Run `python manage.py makemigrations reviews orders`
    *   Run `python manage.py migrate`

## Phase 2: Frontend Setup (React - `fronted/`)

1.  **Stripe Setup:**
    *   Add `VITE_STRIPE_PUBLISHABLE_KEY` to `fronted/.env`.
    *   Install Stripe: `npm install @stripe/react-stripe-js @stripe/stripe-js`.
    *   Wrap app (or checkout section) with `<Elements stripe={stripePromise}>` in `main.jsx` or `App.jsx`.
2.  **API Services (`Services/`)**
    *   Create `Services/apiReviews.js` for feedback/dispute endpoints (`createFeedback`, `createDispute`).
    *   Update `Services/orderService.js`: Add functions for `createPaymentIntent`, `shipOrder`, `confirmOrderReceipt`, `confirmOrderPayment`.
3.  **UI Integration (`Features/`, `Components/`, `Pages/`)**
    *   **Checkout Flow (Identify relevant component, e.g., `Features/Customer/Dashboard/Cart.jsx`):**
        *   Fetch `client_secret` from `createPaymentIntent` endpoint.
        *   Use Stripe's `<PaymentElement>` and `useStripe`/`useElements` hooks.
        *   Handle payment submission using `stripe.confirmPayment()` (or appropriate method for manual capture).
    *   **Farmer Order Management (Identify relevant component, e.g., `Features/Farmer/Dashboard/RecentOrders.jsx`):**
        *   Add "Mark as Shipped" button (conditionally based on status). Call `shipOrder` on click.
    *   **Customer Order View (Identify/Create relevant component, e.g., `Features/Customer/Dashboard/OrderDetail.jsx`):**
        *   Display order status.
        *   Show buttons conditionally:
            *   `SHIPPED`: "Confirm Receipt" -> calls `confirmOrderReceipt`.
            *   `DELIVERED`: "Confirm Payment" -> calls `confirmOrderPayment`; "Report Issue" -> opens dispute form.
            *   `DELIVERED` or `COMPLETED`: "Submit Feedback" -> opens feedback form.
        *   Implement Feedback Form (Rating + Comment) -> calls `createFeedback`.
        *   Implement Dispute Form (Reason + Evidence Upload) -> calls `createDispute`.
    *   **Feedback Display:** Update product/farmer profile components to show approved feedback.
4.  **State Management:** Utilize `react-query` for managing server state, caching, and UI updates based on API calls.

## Phase 3: Stripe Configuration & Testing

1.  **Stripe Dashboard:**
    *   Configure webhook endpoint (`/api/stripe/webhook/`).
    *   Subscribe to necessary events (e.g., `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.dispute.created`, `charge.refunded`).
2.  **Testing:**
    *   Use Stripe test keys/cards.
    *   End-to-end flow testing (happy path, dispute path).
    *   Edge case testing (payment failures, webhook delays/failures).
    *   Admin interface testing.