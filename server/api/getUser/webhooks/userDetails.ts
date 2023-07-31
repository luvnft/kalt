import { ok } from '~/composables/ok'
import { messaging } from '~/composables/messaging'
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler( async (event) => {
  const supabase = serverSupabaseServiceRole(event)
  const topic = 'userDetails'
  const topicKebab = ok.camelToKebab(topic)
  const service = 'getUser'
  const serviceKebab = ok.camelToKebab(service)
  const query = getQuery(event)
  const body = await readBody(event)
  if(body.record.message_read) return 'message already read'
  
  const message = await messaging.getEntity(supabase, topic, body.record.message_entity_id)
  ok.log('success', 'got combined message: ', message)
  const readMessage = await messaging.read(supabase, topic, service, body.record.message_id)
  ok.log('success', 'message marked as read: ', body.record.message_id)
  const json = await messaging.cleanMessage(message)
  ok.log('success', 'removed null values: ', json)

  const { data, error } = await supabase
    .from(serviceKebab)
    .upsert(json)
    .eq('userId', message.userId)
    .select()

  if(data) return data
  if(error) return error
});