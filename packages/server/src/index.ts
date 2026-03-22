import 'dotenv/config';
import { startServer } from './server';

const PORT = parseInt(process.env.PORT || '3000', 10);

async function main() {
  try {
    await startServer(PORT);
    console.log(`✓ PAX SIM Server running on port ${PORT}`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();
