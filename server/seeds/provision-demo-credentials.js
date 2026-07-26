const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');
const { sequelize, User } = require('../models');

async function main() {
  const email = String(process.env.DEMO_EMAIL || process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = String(process.env.DEMO_PASSWORD || process.env.ADMIN_PASSWORD || '');
  const tenantId = String(process.env.GOVERNANCE_TENANT_ID || process.env.TENANT_ID || crypto.randomUUID());
  if (!email || password.length < 12) throw new Error('Local demo credentials are incomplete');
  const hash = await bcrypt.hash(password, 10);
  const [user] = await User.findOrCreate({ where: { email }, defaults: { email, password: hash, name: 'Runtime Administrator', role: 'admin', tenantId } });
  await user.update({ password: hash, name: 'Runtime Administrator', role: 'admin', tenantId });
  await sequelize.close();
  console.log('Provisioned local demo administrator.');
}
main().catch((error) => { console.error(error.message); process.exit(1); });
