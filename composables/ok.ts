export const ok = {
  toInt(input){
    const pattern = /[^0-9]/g;
    return input.replace(pattern, '');
  },
  toChar(input){
    const pattern = /[^0-9]/g;
    return input.replace(pattern, '');
  },
  log(type, text){
    // const supabase = serverSupabaseServiceRole()

    // https://talyian.github.io/ansicolors/
    let label = '\x1b[34m● \x1b[0m';
    if (type==='success') label = '\x1b[32m● \x1b[0m'
    if (type==='warn')    label = '\x1b[33m● \x1b[0m'
    if (type==='error')   label = '\x1b[31m● \x1b[0m'
    console.log(label + text)
    let json={
      "type": type,
      "text": text
    }
    return json
  },

  addZero(i) {
    if (i < 10) {i = "0" + i}
    return i;
  },

  prettyCurrency(amount, currency) {
    let amountRounded = (Math.ceil(amount * 10) / 10).toFixed(1);
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    });
    return formatter.format(amountRounded)
  },
  prettyDate(dateTime) {
    const day = new Date(dateTime).getDate()
    const month = new Date(dateTime).getMonth()+1
    const year = new Date(dateTime).getFullYear()
    return day+"/"+month+"/"+year
  },
  prettyTime(dateTime){
    const hour = ok.addZero(new Date(dateTime).getHours())
    const minute = ok.addZero(new Date(dateTime).getMinutes())
    return hour+":"+minute
  }
};
import { v4 as uuidv4 } from 'uuid';
export const okuuid = () => {
  return uuidv4()
};

export const okclock = (input) => {
  if (input="now") return Date.now()
  if (input="today") return Date.now()
  if (input="tomorrow") return "not supported yet"
}