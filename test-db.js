const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gbnirzmddcvfmochwxpj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdibmlyem1kZGN2Zm1vY2h3eHBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMTQxMTksImV4cCI6MjA5NTU5MDExOX0.EWrGIk237VyJJUqpANfYTp_cAOQDwleko9K3KT_uZ4I';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('--- Testing videos ---');
  const { data: videos, error: videoError } = await supabase.from('videos').select('*').limit(50);
  if (videoError) console.error('Video Error:', videoError);
  else console.log('Videos:', JSON.stringify(videos, null, 2));

  console.log('--- Testing ad_settings ---');
  const { data: ads, error: adError } = await supabase.from('ad_settings').select('*').limit(1);
  if (adError) console.error('Ad Error:', adError);
  else console.log('Ads:', JSON.stringify(ads, null, 2));
}

test();
