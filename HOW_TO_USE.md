# User Manual & Admin Guide

## 1. Accessing the Admin Panel
1.  Go to your website URL (e.g., `https://akuzie.in/admin`).
2.  If you are not logged in, you will be redirected to the login page.
    *   **Email**: Use the email you put in `NEXT_PUBLIC_ADMIN_EMAILS` (e.g., `akuzie27@gmail.com`).
    *   **Password**: This is the password you set when you created this user in **Firebase Authentication**.
    *   *Note: If you haven't created the user yet, go to Firebase Console > Authentication > Users > Add user.*

## 2. Adding a Painting (CRITICAL Step)
Since we don't upload images directly, follow this strictly:

1.  **Take a Photo**: Take a clear photo of your painting.
2.  **Upload to Google Drive**:
    *   Open Google Drive App or Website.
    *   Upload the photo.
3.  **Get the Link**:
    *   Right-click the requested file (or tap 3 dots on mobile).
    *   Select **Share** > **Manage Access**.
    *   Change "Restricted" to **"Anyone with the link"**.
    *   Click **Copy Link**.
4.  **Add to Website**:
    *   Go to `/admin/add` on your website.
    *   Fill in Title, Price, Size, etc.
    *   **In the "Google Drive Image Link" box**: Paste the link you just copied.
    *   Click **Add Painting**.
    *   *The system will automatically convert it so appearance is instant.*

## 3. How Customers Buy (Manual Payment)
1.  Customer adds painting to Cart.
2.  Customer enters Name/Address.
3.  At Checkout, they see the **QR Code** or **UPI ID** (which is static in the code or environment).
4.  They open PhonePe/GPay and pay you manually.
5.  They click **"I Have Paid"** on the website.
6.  Customer sees "Order Placed".

## 4. Verifying Orders
1.  You (Admin) go to `/admin/orders`.
2.  You will see a new order with status **PAYMENT_PENDING**.
3.  Check your Bank/UPI App (PhonePe/GPay) to see if you received that amount from that name.
4.  **If money received**:
    *   Change status to **PAID**.
    *   (Optional) Change to **SHIPPED** later when you courier it.
5.  **If money NOT received**:
    *   Contact the customer (Phone number is in the order details).

## 5. Editing / Deleting
*   Go to `/admin/dashboard`.
*   Click the **Pencil icon** to edit details (or update image link).
*   Click the **Trash icon** to delete a painting.
*   Click the **Status button** (Available/Sold) to toggle it manually if you sold it offline.
