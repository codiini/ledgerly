import { serverSupabaseClient } from '#supabase/server'

import twilio from 'twilio'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  // Create Supabase client for server-side
  const supabase = serverSupabaseClient(event)

  // Initialize Twilio client
  const client = twilio(
    config.twilioAccountSid,
    config.twilioAuthToken
  )

  // Get store currency settings
  const { data: storeSettings } = await (await supabase).from('store_settings')
    .select('currency_symbol')
    .single()

  const currencySymbol = storeSettings?.currency_symbol || '$'

  // Get overdue credit sales
  const { data: overdueSales } = await (await supabase).from('credit_sales')
    .select(`
      id,
      total_amount,
      paid_amount,
      due_date,
      customers (
        name,
        phone
      )
    `)
    .eq('status', 'overdue')
    .gt('due_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  if (!overdueSales?.length) {
    return { sent: 0 }
  }

  let sentCount = 0

  for (const sale of overdueSales) {
    const amountDue = sale.total_amount - sale.paid_amount
    const formattedAmount = `${currencySymbol}${amountDue.toFixed(2)}`
    const formattedDate = new Date(sale.due_date).toLocaleDateString()
    
    const message = `Dear ${sale.customers.name}, your payment of ${formattedAmount} was due on ${formattedDate}. Please make the payment as soon as possible.`

    try {
      await client.messages.create({
        body: message,
        to: sale.customers.phone,
        from: config.twilioPhoneNumber
      })

      // Log the reminder
      await (await supabase).from('reminders')
        .insert({
          credit_sale_id: sale.id,
          message,
          status: 'sent'
        })

      sentCount++
    } catch (error) {
      console.error('Failed to send SMS:', error)

      await (await supabase).from('reminders')
        .insert({
          credit_sale_id: sale.id,
          message,
          status: 'failed'
        })
    }
  }

  return { sent: sentCount }
})