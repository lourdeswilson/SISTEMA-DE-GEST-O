const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const connectDatabase = async () => {
  try {
    const { error } = await supabase.from('users').select('count').limit(1);
    if (error && error.code !== 'PGRST116') throw error;
    console.log('✅ Supabase conectado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao conectar Supabase:', error.message);
  }
};

module.exports = { supabase, connectDatabase };