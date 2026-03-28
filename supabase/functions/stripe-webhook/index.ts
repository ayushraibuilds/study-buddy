import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@12.1.1'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
})
const cryptoProvider = Stripe.createSubtleCryptoProvider()

const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string

serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature')

  // Prevent generic request attacks
  if (!signature) {
    return new Response('No signature provided', { status: 400 })
  }

  const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') as string
  const body = await req.text()

  let event
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, endpointSecret, undefined, cryptoProvider)
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as any
      const checkoutSessionId = session.id
      const customerId = session.customer as string
      // customer_email or client_reference_id could uniquely ID the user
      const clientReferenceId = session.client_reference_id

      if (clientReferenceId) {
          // Grant "Pro" tier or Add Credits
          await supabase
            .from('users')
            .update({ tier: 'pro', credits: 1000 })
            .eq('id', clientReferenceId)
            
          console.log(`Payment successful for user ${clientReferenceId}`)
      }
      break
    }
    
    case 'customer.subscription.deleted': {
        const subscription = event.data.object as any
        const customerId = subscription.customer as string
        
        // Let's assume we map stripe_customer_id in our DB
        await supabase
            .from('users')
            .update({ tier: 'free' })
            .eq('stripe_customer_id', customerId)
            
        console.log(`Subscription deleted for customer ${customerId}`)
        break
    }
    
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  return new Response(JSON.stringify({ received: true }), { headers: { 'Content-Type': 'application/json' } })
})
