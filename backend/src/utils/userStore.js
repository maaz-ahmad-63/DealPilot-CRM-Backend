const fs = require('fs/promises');
const path = require('path');

const dataDir = path.join(__dirname, '..', '..', 'data');
const usersFile = path.join(dataDir, 'users.json');

async function ensureUsersFile() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(usersFile);
  } catch (error) {
    await fs.writeFile(usersFile, '[]\n', 'utf8');
  }
}

async function readUsers() {
  await ensureUsersFile();
  const raw = await fs.readFile(usersFile, 'utf8');
  try {
    const users = JSON.parse(raw);
    return Array.isArray(users) ? users : [];
  } catch (error) {
    return [];
  }
}

async function writeUsers(users) {
  await ensureUsersFile();
  await fs.writeFile(usersFile, `${JSON.stringify(users, null, 2)}\n`, 'utf8');
}

async function findUserByEmail(email) {
  const users = await readUsers();
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase()) || null;
}

async function createUser(user) {
  const users = await readUsers();
  users.push(user);
  await writeUsers(users);
  return user;
}

module.exports = {
  readUsers,
  findUserByEmail,
  createUser,
};
