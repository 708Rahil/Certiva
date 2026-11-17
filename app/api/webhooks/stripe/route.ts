import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { clerkClient } from '@clerk/nextjs/server';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: Stripe.Event;

    if (stripe && webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
      } catch (err: any) {
        console.error('⚠️ Stripe Webhook signature verification failed:', err.message);
        return NextResponse.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 400 });
      }
    } else {
      // Parse payload if secret not yet configured
      event = JSON.parse(rawBody);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const clientReferenceId = session.client_reference_id;
      const customerEmail = session.customer_details?.email || session.customer_email;

      const client = await clerkClient();
      let targetUserId = clientReferenceId;

      // If clientReferenceId was not passed, search for user by email in Clerk
      if (!targetUserId && customerEmail) {
        try {
          const userList = await client.users.getUserList({
            emailAddress: [customerEmail],
            limit: 1,
          });
          if (userList.data && userList.data.length > 0) {
            targetUserId = userList.data[0].id;
          }
        } catch (lookupErr) {
          console.error('Error finding user by email:', lookupErr);
        }
      }

      if (targetUserId) {
        // Unlock Pro Pass in Clerk publicMetadata
        await client.users.updateUserMetadata(targetUserId, {
          publicMetadata: {
            hasLifetimePass: true,
            lifetimePassGrantedAt: new Date().toISOString(),
            stripeSessionId: session.id,
          },
        });
        console.log(`✓ Granted Lifetime Pass to user ${targetUserId}`);
      } else {
        console.warn('⚠️ Stripe payment received but user could not be resolved:', {
          clientReferenceId,
          customerEmail,
          sessionId: session.id,
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json({ error: error.message || 'Webhook handler error' }, { status: 500 });
  }
}

