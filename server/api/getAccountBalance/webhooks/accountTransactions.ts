import { ok } from '~/composables/ok'
import { pub, sub } from '~/composables/messagingNext';
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler( async (event) => {
  const supabase = serverSupabaseServiceRole(event);
  const service = 'getAccountBalance';
  const topic = 'accountTransactions';
  const query = getQuery(event);
  const body = await readBody(event);
  if(body.record.message_read) return 'message already read';

  const message = await sub(supabase, topic).entity(body.record.message_entity);
  await sub(supabase, topic).read(service, body.record.message_id);

  const getPreferredCurrency = async () => {
    const {data, error} = await supabase
      .from('getUser')
      .select('userId, currency')
      .eq('userId', message.userId)
      .limit(1)
      .single()
    return data.currency
  }
  const preferredCurrency = await getPreferredCurrency();
  
  let json = {
    "userId": message.userId,
    "amount": null,
    "currency": preferredCurrency
  }

  const getTransactions = async () => {
      const { data, error } = await supabase
      .from(topic)
      .select()
      .eq('status', 'complete')
      .eq('userId', message.userId);
    return data
  }
  const transactions = await getTransactions();

  for (let i = 0; i < transactions.length; i++) {
    const transaction = transactions[i];
    const amountConverted = await messaging.convertCurrency(
      supabase,
      transaction.amount, 
      transaction.currency,
      preferredCurrency
    );
    json.amount += parseFloat(amountConverted);
  }

  const { data, error } = await supabase
    .from('getAccountBalance')
    .upsert(json)
    .select()
  if(data) return data
  if(error) return error
});