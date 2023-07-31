//@ts-nocheck
import { messaging } from '~/composables/messaging'
import { ok } from '~/composables/ok';
import { serverSupabaseServiceRole } from '#supabase/server'
export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole(event);
  const body = await readBody(event);

  const getUsers = async () => {
    const { data, error } = await supabase
      .from('get_user')
      .select('userId')
    if(data) ok.log('success', 'got all users: ', data)
    if(error) ok.log('error', 'could not get all users: ', error)
    return data
  };
  const getUserCurrency = async (user) => {
    const { data, error } = await supabase
      .from('get_user')
      .select('currency')
      .eq('userId', user)
      .limit(1)
      .single();
    return data.currency;
  };
  const getUserPortfolio = async (user) => {
    const { data, error } = await supabase
      .from('get_user_portfolio')
      .select()
      .eq('userId', user)
      .eq('ticker', 'gi.ddf')
    return data;
  }
  const calculateAndAdd = async (user) => {
    
    const currency = await getUserCurrency(user);
    const portfolio = await getUserPortfolio(user);
    const assetPrice = await messaging.getAssetPrice(supabase, currency, 'gi.ddf');
    const array = []
    let value = 0;
    for (let i = 0; i < portfolio.length; i++) {
      value = portfolio[i].quantity_today/assetPrice;
      array.push({
        'userId': user,
        'date': portfolio[i].date,
        'ticker': portfolio[i].ticker,
        'value_currency': currency,
        'value': value
      })
    }
    for (let i = 0; i < array.length; i++) {
      const { data, error } = await supabase
        .from('get_user_portfolio')
        .update(array[i])
        .eq('ticker', array[i].ticker)
        .eq('date', array[i].date)
        .eq('userId', array[i].userId)
        .select()
    }
  }
  if(body){
    const calculated = await calculateAndAdd(body.record.userId);
    return array
  }
  if(!body){
    const users = await getUsers();
    for (let i = 0; i < users.length; i++) {
      const calculated = await calculateAndAdd(users[i].userId);
    }
    return 'updated for all'
  }
});