export default function bcrypt(key: string, hash: string): boolean {
  const bcrypt = require('bcryptjs');
  return bcrypt.compareSync(key, hash);
}
