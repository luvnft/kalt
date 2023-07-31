import { ok } from '~/composables/ok'
import { messaging } from '~/composables/messaging'
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler( async (event) => {
  const supabase = serverSupabaseServiceRole(event);
  const query = getQuery(event);
  const topic = 'exchangeOrders';
  const service = 'getUserPortfolio';
  const body = await readBody(event);
  if(body.record.message_read) return 'message already read';
  
  const message = await messaging.getEntity(supabase, topic, body.record.message_entity_id);

  const readMessage = await messaging.read(supabase, topic, service, body.record.message_id);
  if (message.orderStatus !== 'fulfilled') return 'order not fulfilled';
  
  const getPortfolio = async () => {
    const { data, error } = await supabase
      .from('topic_exchangeOrders')
      .select()
      .eq('userId', message.userId)
      .eq('orderStatus', 'fulfilled')
    if(data){
      ok.log('success', 'got fulfilled orders: ', data)
      return data
    }
    if(error){
      ok.log('error', 'error getting fulfilled orders: ', error)
      return error
    }
  }
  const sumShares = async (portfolio) => {
    let totalShares = 0;
    for (let i = 0; i < portfolio.length; i++) {
      const order = portfolio[i];
      totalShares += order.quantity;
    };
    ok.log('success', 'summed shares: ', totalShares)
    return totalShares
  }

  const updateShares = async (shares) => {
    if(shares<0) {
      shares = null
    }
    const { data, error } = await supabase
      .from('pay_revenue')
      .upsert({
        userId: message.userId,
        quantity: shares,
      })
      .select()
    if(data){
      ok.log('success', 'updated shares for user: ', data)
      return data
    }
    if(error){
      ok.log('error', 'could not update shares for user: '+message.userId)
      return error
    }
  }
  const portfolio = await getPortfolio();
  const totalShares = await sumShares(portfolio);
  const updatedShares = await updateShares(totalShares);
  
  return updatedShares;
});