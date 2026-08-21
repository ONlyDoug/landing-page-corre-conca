const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
let supabaseUrl = '';
let supabaseKey = '';
envFile.split('\n').forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) supabaseUrl = line.split('=')[1];
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) supabaseKey = line.split('=')[1];
});
const supabase = createClient(supabaseUrl.trim().replace(/['"]/g, ''), supabaseKey.trim().replace(/['"]/g, ''));
async function run() {
  const { count } = await supabase.from('inscricoes').select('*', { count: 'exact', head: true }).eq('status_pagamento', 'confirmado');
  console.log('Confirmed:', count);
}
run();
