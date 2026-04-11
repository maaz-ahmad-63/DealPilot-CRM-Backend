const axios = require('axios');

/**
 * AI Provider Wrapper
 * Supports: Gemini, OpenAI, Anthropic Claude
 * Configurable via environment variables
 */

const AI_PROVIDER = process.env.AI_PROVIDER || 'gemini'; // gemini | openai | claude
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

/**
 * Gemini API Integration (Free tier available)
 */
async function generateWithGemini(prompt, tone = 'professional', maxTokens = 500) {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: tone === 'creative' ? 0.9 : tone === 'neutral' ? 0.5 : 0.7,
          maxOutputTokens: maxTokens,
        },
      }
    );

    const content = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) {
      throw new Error('No content in Gemini response');
    }

    return content;
  } catch (error) {
    console.error('Gemini API error:', error.message);
    throw error;
  }
}

/**
 * OpenAI API Integration
 */
async function generateWithOpenAI(prompt, tone = 'professional', maxTokens = 500) {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an expert email marketing copywriter. Write concise, engaging, professional emails. Tone: ${tone}`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: tone === 'creative' ? 0.9 : tone === 'neutral' ? 0.5 : 0.7,
        max_tokens: maxTokens,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    return content;
  } catch (error) {
    console.error('OpenAI API error:', error.message);
    throw error;
  }
}

/**
 * Claude API Integration (Anthropic)
 */
async function generateWithClaude(prompt, tone = 'professional', maxTokens = 500) {
  try {
    if (!CLAUDE_API_KEY) {
      throw new Error('CLAUDE_API_KEY not configured');
    }

    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-haiku-20240307', // Using Haiku for cost efficiency
        max_tokens: maxTokens,
        system: `You are an expert email marketing copywriter. Write concise, engaging, professional emails. Tone: ${tone}`,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      },
      {
        headers: {
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
      }
    );

    const content = response.data?.content?.[0]?.text;
    if (!content) {
      throw new Error('No content in Claude response');
    }

    return content;
  } catch (error) {
    console.error('Claude API error:', error.message);
    throw error;
  }
}

/**
 * Mock AI Provider (for testing without API keys)
 */
function generateWithMock(prompt, tone = 'professional') {
  const mockResponses = {
    subject: [
      '🎉 You won\'t believe what we just launched',
      '✨ New feature alert: Save 10 hours every week',
      '💡 Quick question about your workflow',
      '🚀 Game-changing update inside',
      '📊 See how others are saving time',
    ],
    body: [
      'Hi {{firstName}},\n\nWe\'re excited to share something special. Based on your interest in {{topic}}, we think you\'ll love this.\n\nBest regards,\n{{company}}',
      'Hello {{firstName}},\n\nJust wanted to reach out about {{topic}}. We\'ve seen great success with similar companies.\n\nWould love to chat more.\n\nCheers,\n{{company}}',
      'Hi {{firstName}},\n\nQuick update: {{topic}} is now live and available for all users.\n\nTry it today!\n\n{{company}}',
    ],
  };

  const type = prompt.includes('subject') ? 'subject' : 'body';
  const responses = mockResponses[type];
  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Main Generate Function - Routes to appropriate provider
 */
async function generate(prompt, tone = 'professional', maxTokens = 500) {
  try {
    console.log(`Using AI provider: ${AI_PROVIDER}`);

    switch (AI_PROVIDER) {
      case 'gemini':
        return await generateWithGemini(prompt, tone, maxTokens);
      case 'openai':
        return await generateWithOpenAI(prompt, tone, maxTokens);
      case 'claude':
        return await generateWithClaude(prompt, tone, maxTokens);
      case 'mock':
        return generateWithMock(prompt, tone);
      default:
        return generateWithMock(prompt, tone);
    }
  } catch (error) {
    console.error('AI generation error:', error);
    throw new Error(`AI generation failed: ${error.message}`);
  }
}

module.exports = {
  generate,
  generateWithGemini,
  generateWithOpenAI,
  generateWithClaude,
  generateWithMock,
};
