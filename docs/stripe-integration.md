# Tích hợp Stripe Payment cho Mini E-commerce

## Tổng quan

Tài liệu này mô tả việc tích hợp Stripe Payment Gateway vào hệ thống mini e-commerce, bao gồm Stripe Checkout Session và webhook handling để xử lý thanh toán tự động.

## Kiến trúc

### 1. Components chính

- **Database Schema**: Mở rộng bảng `payments` hỗ trợ Stripe
- **Server Actions**: Tạo và verify Stripe checkout sessions
- **React Hooks**: React Query hooks cho Stripe operations
- **UI Components**: Payment method selector và success page
- **Edge Functions**: Stripe webhook handler

### 2. Flow thanh toán

```
User → Checkout Form → Create Order → Stripe Checkout → Payment → Webhook → Order Confirmation
```

## Database Changes

### Bảng `payments` được mở rộng:

```sql
-- Thêm 'stripe' vào payment_method enum
payment_method text not null check (payment_method in ('vnpay', 'momo', 'cod', 'bank_transfer', 'stripe'))

-- Thêm columns cho Stripe
stripe_session_id text,
stripe_payment_intent_id text,

-- Thêm index
create index idx_payments_stripe_session_id on public.payments (stripe_session_id);
```

## Server Actions

### 1. Create Stripe Checkout (`create-stripe-checkout.ts`)

```typescript
export async function createStripeCheckout(
  checkoutData: StripeCheckoutData
): Promise<StripeSessionResponse>;
```

**Tính năng:**

- Tạo Stripe checkout session
- Convert VND amount để tương thích với Stripe
- Tạo line items từ order
- Lưu payment record vào database
- Return session URL để redirect

**Input:**

```typescript
type StripeCheckoutData = {
  orderId: number;
  amount: number;
  currency: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
};
```

**Output:**

```typescript
type StripeSessionResponse = {
  sessionId: string;
  url: string;
};
```

### 2. Verify Stripe Payment (`verify-stripe-payment.ts`)

```typescript
export async function verifyStripePayment(sessionId: string);
export async function getStripePaymentStatus(sessionId: string);
```

**Tính năng:**

- Verify payment status từ Stripe
- Update payment và order status
- Handle different payment statuses

## React Hooks

### 1. useCreateStripeCheckout

```typescript
const createStripeCheckout = useCreateStripeCheckout();

createStripeCheckout.mutate({
  orderId: 123,
  amount: 1000000,
  currency: "VND",
  successUrl: "https://example.com/success",
  cancelUrl: "https://example.com/cancel",
});
```

**Tính năng:**

- Tự động redirect đến Stripe checkout
- Error handling với toast notifications

### 2. useVerifyStripePayment

```typescript
const verifyPayment = useVerifyStripePayment();

verifyPayment.mutate(sessionId);
```

**Tính năng:**

- Verify payment sau khi user quay về từ Stripe
- Update UI dựa trên payment status

### 3. useStripePaymentStatus

```typescript
const { data, isLoading } = useStripePaymentStatus(sessionId, enabled);
```

**Tính năng:**

- Real-time polling payment status
- Tự động stop polling khi payment completed/failed

## Edge Functions

### Stripe Webhook Handler (`stripe-webhook/index.ts`)

**Endpoint:** `/functions/v1/stripe-webhook`

**Supported Events:**

- `checkout.session.completed`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `invoice.payment_succeeded`

**Tính năng:**

- Xác thực webhook signature
- Update payment và order status tự động
- Comprehensive error handling

**Security:**

- Webhook signature verification
- Environment-based configuration

## UI Components

### 1. PaymentMethodSelector

```typescript
<PaymentMethodSelector
  selectedMethod={paymentMethod}
  onMethodChange={setPaymentMethod}
/>
```

**Features:**

- Visual payment method selection
- Stripe hiển thị "Khuyến nghị"
- Contextual information cho từng phương thức
- Responsive design

### 2. CheckoutForm (Updated)

**Stripe Integration:**

- Tự động tạo Stripe checkout session khi chọn Stripe
- Handle success/cancel URLs
- Loading states cho Stripe redirection

### 3. SuccessContent

```typescript
<SuccessContent order={order} sessionId={sessionId} />
```

**Features:**

- Tự động verify Stripe payment
- Real-time status updates
- Comprehensive order information display
- Action buttons cho different scenarios

## Configuration

### Environment Variables

```bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# URLs
NEXT_PUBLIC_SITE_URL=https://yoursite.com
```

### Stripe Dashboard Setup

1. **Webhook Endpoint:**

   ```
   https://your-project.supabase.co/functions/v1/stripe-webhook
   ```

2. **Events to Listen:**

   - checkout.session.completed
   - payment_intent.succeeded
   - payment_intent.payment_failed

3. **Webhook Signing Secret:**
   Copy từ Stripe Dashboard vào `STRIPE_WEBHOOK_SECRET`

## Testing

### Test Cards (Stripe Test Mode)

```
Success: 4242424242424242
Decline: 4000000000000002
3D Secure: 4000000000003220
```

### Test Scenarios

1. **Successful Payment:**

   - Tạo order → Chọn Stripe → Complete payment → Verify success page

2. **Failed Payment:**

   - Tạo order → Chọn Stripe → Use decline card → Verify error handling

3. **Webhook Testing:**
   - Use Stripe CLI để test webhooks locally:
   ```bash
   stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook
   ```

## Security Considerations

### 1. Webhook Security

- Always verify webhook signatures
- Use environment variables cho sensitive data
- Rate limiting on webhook endpoints

### 2. Payment Data

- Không store credit card information
- Use Stripe's secure vault
- PCI compliance through Stripe

### 3. Order Security

- Verify user ownership of orders
- Validate payment amounts
- Prevent duplicate payments

## Error Handling

### Common Errors

1. **Invalid Session ID:**

   ```typescript
   if (!session.id || !session.url) {
     throw new Error("Failed to create Stripe session");
   }
   ```

2. **Payment Verification Failed:**

   ```typescript
   if (paymentError || !payment) {
     throw new Error("Payment record not found");
   }
   ```

3. **Webhook Signature Invalid:**
   ```typescript
   if (!signature) {
     return new Response("No signature found", { status: 400 });
   }
   ```

### Error Recovery

- Retry payment options
- Support contact information
- Clear error messages cho users

## Monitoring & Analytics

### Payment Metrics

- Success rate
- Average processing time
- Failed payment reasons
- Revenue tracking

### Stripe Dashboard

- Transaction history
- Dispute management
- Refund processing
- Financial reporting

## Future Enhancements

### 1. Subscription Support

- Recurring payments
- Plan management
- Usage-based billing

### 2. Multi-currency

- Dynamic currency conversion
- Local payment methods
- Regional pricing

### 3. Advanced Features

- Saved payment methods
- Express checkout
- Apple Pay / Google Pay
- Split payments

## Troubleshooting

### Common Issues

1. **Webhook không receive:**

   - Kiểm tra URL endpoint
   - Verify webhook secret
   - Check network connectivity

2. **Payment stuck pending:**

   - Manual verification qua Stripe Dashboard
   - Re-trigger webhook events
   - Check logs for errors

3. **Currency conversion issues:**
   - Ensure proper amount formatting
   - Verify currency codes
   - Check Stripe account settings

### Debug Tools

1. **Stripe Dashboard Logs**
2. **Supabase Edge Function Logs**
3. **Browser Developer Tools**
4. **Stripe CLI for local testing**

## Support

### Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions)

### Contact

- Technical issues: Check logs và Stripe Dashboard
- Integration questions: Refer to this documentation
- Business inquiries: Contact support team
