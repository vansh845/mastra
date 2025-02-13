import { createOpenAI } from '@ai-sdk/openai';
import { DefaultVectorDB } from '@mastra/core/storage';
import { Memory } from '@mastra/memory';
import { UpstashStore } from '@mastra/upstash';
import dotenv from 'dotenv';
import { describe } from 'vitest';

import { getResuableTests } from './reusable-tests';

dotenv.config({ path: '.env.test' });

// Ensure environment variables are set
if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
  throw new Error('Required Vercel KV environment variables are not set');
}

const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });

describe('Memory with UpstashStore Integration', () => {
  const vector = new DefaultVectorDB({
    connectionUrl: 'file:test.db',
  });

  const memory = new Memory({
    storage: new UpstashStore({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    }),
    vector,
    options: {
      lastMessages: 10,
      semanticRecall: {
        topK: 3,
        messageRange: 2,
      },
    },
    embedder: openai.embedding('text-embedding-3-small'),
  });

  getResuableTests(memory);
});
