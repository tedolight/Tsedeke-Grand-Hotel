import readline from 'readline';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { runAgentChat } from '../services/ai/aiProvider.js';

dotenv.config();

// Connect to MongoDB
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/tsedeke_grand_hotel';
await mongoose.connect(mongoUri);

console.log('\n🏨 =======================================================');
console.log('   TSEDEKE GRAND HOTEL (HOSSANA, ETHIOPIA) — AI CONCIERGE CLI');
console.log('=======================================================');
console.log('Modes available: guest | admin');
console.log('Type "exit" to quit, or "mode <guest|admin>" to switch roles.\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let currentMode = 'guest';
let history = [];

const promptUser = () => {
  const roleLabel = currentMode === 'admin' ? '👮 Admin Copilot' : '🛎️ Guest Concierge';
  rl.question(`\n[${roleLabel}] You: `, async (input) => {
    const trimmed = input.trim();

    if (trimmed.toLowerCase() === 'exit') {
      console.log('\nThank you for visiting Tsedeke Grand Hotel! 👋\n');
      rl.close();
      await mongoose.disconnect();
      process.exit(0);
    }

    if (trimmed.toLowerCase().startsWith('mode ')) {
      const newMode = trimmed.split(' ')[1]?.toLowerCase();
      if (['guest', 'admin'].includes(newMode)) {
        currentMode = newMode;
        history = [];
        console.log(`\nSwitched mode to: ${currentMode.toUpperCase()}`);
      } else {
        console.log('\nInvalid mode. Choose "guest" or "admin".');
      }
      promptUser();
      return;
    }

    if (!trimmed) {
      promptUser();
      return;
    }

    history.push({ role: 'user', content: trimmed });
    process.stdout.write('\n⏳ Thinking...');

    try {
      const res = await runAgentChat({
        messages: history,
        mode: currentMode,
      });

      // Clear the thinking line
      readline.clearLine(process.stdout, 0);
      readline.cursorTo(process.stdout, 0);

      console.log(`\n✨ Agent (${res.modelUsed}):\n${res.reply}\n`);
      history.push({ role: 'assistant', content: res.reply });
    } catch (err) {
      console.log(`\n❌ Error: ${err.message}`);
    }

    promptUser();
  });
};

promptUser();
