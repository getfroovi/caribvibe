const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gbnirzmddcvfmochwxpj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdibmlyem1kZGN2Zm1vY2h3eHBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMTQxMTksImV4cCI6MjA5NTU5MDExOX0.EWrGIk237VyJJUqpANfYTp_cAOQDwleko9K3KT_uZ4I';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('Testing profiles...');
  const { data, error } = await supabase.from('profiles').select('*');
  console.log('Profiles:', data);
  console.log('Error:', error);
}

test();
