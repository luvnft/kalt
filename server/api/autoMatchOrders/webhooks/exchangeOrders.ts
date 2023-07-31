import { ok } from '~/composables/ok';
import { messaging } from '~/composables/messaging';
import { serverSupabaseServiceRole } from '#supabase/server';

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole(event);
  const service = 'autoMatchOrders';
  const serviceKebab = ok.camelToKebab(service);
  const topic = 'exchangeOrders';
  const query = getQuery(event);
  const body = await readBody(event);
  
  if (body.record.message_read) return 'message already read';

  const message = await messaging.getEntity(
    supabase,
    topic,
    body.record.message_entity_id
  );

  const readMessage = await messaging.read(
    supabase,
    topic,
    service,
    body.record.message_id
  );

  if (message.orderStatus !== 'open') {
    const { error } = await supabase
      .from(serviceKebab)
      .delete()
      .eq('message_entity_id', message.message_entity_id);
    return 'removed';
  }

  let json = {
    'message_entity_id': message.message_entity_id,
    'userId': message.userId,
    'ticker': message.ticker,
    'order_type': message.order_type,
    'quantity': message.quantity,
    'quantity_absolute': message.quantity_absolute
  };

  const { data, error } = await supabase
    .from(serviceKebab)
    .upsert(json)
    .select();

  if (data) return data;
  if (error) return error;
});