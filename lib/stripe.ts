export const STRIPE_PAYMENT_BASE_URL = 'https://buy.stripe.com/9B6eV69Tg85p3WAbiPdnW00';

/**
 * Returns the Stripe Payment Link with the user's Clerk ID and email pre-filled
 * so Stripe can attach them to checkout.session.completed for webhook fulfillment.
 */
export function getStripeCheckoutUrl(userId?: string | null, email?: string | null): string {
  const params = new URLSearchParams();
  if (userId) {
    params.set('client_reference_id', userId);
  }
  if (email) {
    params.set('prefilled_email', email);
  }
  const queryString = params.toString();
  return queryString ? `${STRIPE_PAYMENT_BASE_URL}?${queryString}` : STRIPE_PAYMENT_BASE_URL;
}
