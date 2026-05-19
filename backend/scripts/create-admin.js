require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const { sequelize, User } = require('../src/models');

const EMAIL    = process.env.ADMIN_EMAIL    || 'admin@navigate.it';
const PASSWORD = process.env.ADMIN_PASSWORD || 'Admin1234!';
const NAME     = process.env.ADMIN_NAME     || 'Amministratore';

async function main() {
  await sequelize.sync();

  const existing = await User.findOne({ where: { email: EMAIL } });
  if (existing) {
    await existing.update({ role: 'admin' });
    console.log(`Utente esistente promosso ad admin: ${EMAIL}`);
  } else {
    const password_hash = await bcrypt.hash(PASSWORD, 10);
    await User.create({ email: EMAIL, password_hash, full_name: NAME, role: 'admin', provider: 'local' });
    console.log(`Admin creato con successo!`);
    console.log(`  Email:    ${EMAIL}`);
    console.log(`  Password: ${PASSWORD}`);
  }

  await sequelize.close();
}

main().catch((err) => { console.error(err); process.exit(1); });
