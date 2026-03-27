const { Client } = require('pg');
async function createDb() {
  const client = new Client({
    connectionString: "postgresql://alagappan:861135@72.62.39.82:5432/alagappan_db", // connect to default DB
  });
  await client.connect();
  try {
    const res = await client.query("SELECT 1 FROM pg_database WHERE datname='vidpipe_db'");
    if (res.rowCount === 0) {
      console.log('Creating database vidpipe_db...');
      await client.query('CREATE DATABASE vidpipe_db');
      console.log('Database created successfully.');
    } else {
      console.log('Database vidpipe_db already exists.');
    }
  } catch (err) {
    console.error('Error creating database:', err);
  } finally {
    await client.end();
  }
}
createDb();
