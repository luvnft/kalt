import { ok } from '~/composables/ok'
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler( async (event) => {
  const supabase = serverSupabaseServiceRole(event)
  const query = getQuery(event)
  const body = await readBody(event)
  if(body.record.message_read) return 'message already read'
  
  const { data: subscription, error: subscriptionError } = await supabase
    .from('account_transactions_auto_invest')
    .update({ message_read: true })
    .eq('message_id', body.record.message_id)

  if(subscriptionError) return ok.log('error', subscriptionError.message)

  let json = {
    'message_created': ok.timestamptz(),
    'message_sender': 'autoInvest',
    'user_id': null,
    'quantity': null,
    'ticker': null,
    'order_type': 'buy',
    'order_status': 'complete'
  }

  const { data: message, error: messageError } = await supabase
    .from('account_transactions')
    .select()
    .eq('message_entity_id', body.record.message_entity_id)
    .neq('transaction_type', 'withdrawal')
    .eq('transaction_status', 'payment_complete')
    .gte('auto_invest',0.1)
    .order('message_created', { ascending: true })
    .limit(1)
    .single()
    
  if(messageError) return messageError.message

  const { data: exchangeRate, error: exchangeRateError } = await supabase
    .from('exchange_rates')
    .select(message.ticker)
    .eq('iso', message.currency)
    .eq('enabled', true)
    .limit(1)
    .single()

  if(messageError) return exchangeRateError.message

  json.user_id = message.user_id
  json.quantity = message.amount * message.auto_invest * exchangeRate
  json.ticker = message.ticker

  const { data, error } = await supabase
    .from('exchange_order')
    .insert(json)
    .select()
  
  if(data) return data
  if(error) return error
});