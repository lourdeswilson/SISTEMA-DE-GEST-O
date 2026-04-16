const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const seedDatabase = async () => {
  try {
    console.log('🌱 A popular a base de dados...');

    await supabase.from('cleaning_requests').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('maintenance_requests').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('guests').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('rooms').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('🗑️  Dados antigos apagados');

    const users = [
      { name: 'Administrador',     email: 'admin@sovictoria.com',      password: await bcrypt.hash('admin123', 12), role: 'admin' },
      { name: 'Gestor RH',         email: 'rh@sovictoria.com',         password: await bcrypt.hash('rh123456', 12), role: 'rh' },
      { name: 'Rececionista',      email: 'recepcao@sovictoria.com',   password: await bcrypt.hash('rec12345', 12), role: 'recepcao' },
      { name: 'Equipa Limpeza',    email: 'limpeza@sovictoria.com',    password: await bcrypt.hash('limp1234', 12), role: 'limpeza' },
      { name: 'Equipa Manutencao', email: 'manutencao@sovictoria.com', password: await bcrypt.hash('manu1234', 12), role: 'manutencao' },
    ];

    const { error: usersError } = await supabase.from('users').insert(users);
    if (usersError) throw usersError;
    console.log('👥 Utilizadores criados');

    const rooms = [
      { number: '101', type: 'single', floor: 1, price_per_night: 50,  status: 'disponivel' },
      { number: '102', type: 'single', floor: 1, price_per_night: 50,  status: 'disponivel' },
      { number: '103', type: 'double', floor: 1, price_per_night: 80,  status: 'disponivel' },
      { number: '104', type: 'double', floor: 1, price_per_night: 80,  status: 'disponivel' },
      { number: '201', type: 'single', floor: 2, price_per_night: 55,  status: 'disponivel' },
      { number: '202', type: 'single', floor: 2, price_per_night: 55,  status: 'disponivel' },
      { number: '203', type: 'double', floor: 2, price_per_night: 85,  status: 'disponivel' },
      { number: '204', type: 'suite',  floor: 2, price_per_night: 150, status: 'disponivel' },
      { number: '301', type: 'suite',  floor: 3, price_per_night: 160, status: 'disponivel' },
      { number: '302', type: 'suite',  floor: 3, price_per_night: 160, status: 'disponivel' },
    ];

    const { error: roomsError } = await supabase.from('rooms').insert(rooms);
    if (roomsError) throw roomsError;
    console.log('🏨 Quartos criados');

    console.log('');
    console.log('✅ Base de dados populada com sucesso!');
    console.log('');
    console.log('📋 CREDENCIAIS DE ACESSO:');
    console.log('------------------------------------------');
    console.log('Admin:      admin@sovictoria.com      / admin123');
    console.log('RH:         rh@sovictoria.com         / rh123456');
    console.log('Receção:    recepcao@sovictoria.com   / rec12345');
    console.log('Limpeza:    limpeza@sovictoria.com    / limp1234');
    console.log('Manutenção: manutencao@sovictoria.com / manu1234');
    console.log('------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
};

seedDatabase();