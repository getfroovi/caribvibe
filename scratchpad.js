require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function run() {
  const { data } = await supabase.from('videos').select('*').eq('id', '92fecbda-f64d-479d-9840-3ea8b9110bb0').single();
  console.log(JSON.stringify(data, null, 2));
}
run();
