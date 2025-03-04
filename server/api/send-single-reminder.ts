import { serverSupabaseClient } from '#supabase/server'
import twilio from 'twilio'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)
  
  if (!body.creditSaleId) {
    throw createError({
      statusCode: 400,
      message: 'Credit sale ID is required'
    })
  }
  
  // Create Supabase client for server-side
  const supabase = serverSupabaseClient(event)

  // Initialize Twilio client
  const client = twilio(
    config.twilioAccountSid,
    config.twilioAuthToken
  )

  // Get credit sale details
  const { data: sale } = await (await supabase).from('credit_sales')
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
    .eq('id', body.creditSaleId)
    .single()

  if (!sale) {
    throw createError({
      statusCode: 404,
      message: 'Credit sale not found'
    })
  }

  const message = `Dear ${sale.customers.name}, your payment of $${
    (sale.total_amount - sale.paid_amount).toFixed(2)
  } was due on ${new Date(sale.due_date).toLocaleDateString()}. Please make the payment as soon as possible.`

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

    return { success: true }
  } catch (error) {
    console.error('Failed to send SMS:', error)

    // Log the failed reminder
    await (await supabase).from('reminders')
      .insert({
        credit_sale_id: sale.id,
        message,
        status: 'failed'
      })

    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to send reminder'
    })
  }
})