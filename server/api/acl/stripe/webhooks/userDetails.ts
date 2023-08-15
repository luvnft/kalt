import { ok } from '~/composables/ok';
import { sub, pub } from '~/composables/messaging';
import { serverSupabaseServiceRole } from '#supabase/server';
import Stripe from 'stripe';
export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole(event);
  const topic = 'userDetails';
  const service = 'aclStripe';
  const body = await readBody(event);
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // your stripe key here
  if (body.record.message_read) return 'message already read';

  const message = await sub(supabase, topic).entity(body.record.message_entity);
  await sub(supabase, topic).read(service, body.record.message_id);  
  return message
  if(!message.firstName) return "no first name"
  if(!message.lastName) return "no last name"

  const checkIfUserExists = async () => {
    const { data, error } = await supabase
      .from('acl_stripeUserIds')
      .select()
      .eq('userId', message.userId)
      .limit(1)
      .single()
    if(data) return data
    else return false
  }
  const userExists = await checkIfUserExists();

  ok.log('','user id: '+message.userId);

  const createUser = async () => {
    const user = await stripe.customers.create({
      email: message.email,
      name: message.firstName+' '+message.lastName,
      metadata: { 
        userId: message.userId
      }
    });
    ok.log('succes', 'created user:', user)
    if (user) return user;
  };

  const assignStripeId = async (userId, stripeUserId) => {
    const { data, error } = await supabase
      .from('acl_stripeUserIds')
      .insert({
        "userId": userId,
        "stripeUserId": stripeUserId
      })
      .select()
    ok.log('success', 'assigned stripe id: '+data)
    return data
  }
  const updateStripeUserDetails = async (stripeId) => {
    const updatedUser = await stripe.customers.update(
      stripeId, {
        name: message.firstName+' '+message.lastName,
      }
    );
  }
  if(userExists) {
    const updatedUser = await updateStripeUserDetails(userExists.stripeUserId);
    return "user already exists"
  }
  if(!userExists) {
    const createdUser = await createUser();
    if (createdUser) await assignStripeId(message.userId, createdUser.id);
    return "successfully assigned internal userId with stripe userId"
  }
});