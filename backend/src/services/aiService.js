const aiProvider = require('../utils/aiProvider');
const EmailTemplate = require('../models/EmailTemplate');

/**
 * AI Email Service
 * High-level business logic for AI-powered email generation
 */

/**
 * Generate email from topic/description
 * Uses AI to create both subject and body
 */
async function generateEmailFromTopic(workspace, topic, tone = 'professional', options = {}) {
  try {
    if (!topic || topic.trim().length === 0) {
      throw new Error('Topic is required');
    }

    const context = options.context || '';
    const targetAudience = options.targetAudience || 'business professionals';
    const maxLength = options.maxLength || 'medium';

    // Generate subject line
    const subjectPrompt = `Generate a compelling email subject line for the following:
Topic: ${topic}
Context: ${context}
Target Audience: ${targetAudience}
Tone: ${tone}

Requirements:
- Keep it under 60 characters
- Make it click-worthy but not spammy
- Include relevant emoji if appropriate
- Only output the subject line, nothing else`;

    const subject = await aiProvider.generate(subjectPrompt, tone, 100);

    // Generate email body
    const bodyPrompt = `Generate a professional email body for:
Topic: ${topic}
Context: ${context}
Target Audience: ${targetAudience}
Tone: ${tone}

Requirements:
- Use personalization placeholders like {{firstName}}, {{company}}, {{lastName}}
- ${
      maxLength === 'short'
        ? '2-3 sentences only'
        : maxLength === 'long'
          ? '4-5 paragraphs'
          : '3-4 paragraphs'
    }
- Include clear call-to-action
- Professional ${tone} tone
- HTML-friendly formatting
- Signature: "Best regards,\\n{{senderName}}"
- Only output the email body, nothing else`;

    const body = await aiProvider.generate(bodyPrompt, tone, 500);

    return {
      subject: subject.trim(),
      body: body.trim(),
      htmlBody: convertToHtml(body.trim()),
      variables: extractVariables(subject + ' ' + body),
    };
  } catch (error) {
    console.error('Error generating email from topic:', error);
    throw error;
  }
}

/**
 * Rewrite email in different tone
 */
async function rewriteEmail(workspace, emailText, targetTone = 'professional') {
  try {
    if (!emailText || emailText.trim().length === 0) {
      throw new Error('Email text is required');
    }

    const tones = ['professional', 'casual', 'energetic', 'formal', 'friendly'];
    if (!tones.includes(targetTone)) {
      throw new Error(`Invalid tone. Allowed: ${tones.join(', ')}`);
    }

    const prompt = `Rewrite the following email in a ${targetTone} tone.
Keep the same message and call-to-action but adjust the writing style.
Preserve all personalization placeholders like {{firstName}}, {{company}}, etc.

Original Email:
${emailText}

Requirements:
- Tone: ${targetTone}
- Keep same length approximately
- Preserve placeholders
- Only output the rewritten email, nothing else`;

    const rewritten = await aiProvider.generate(prompt, targetTone, 500);
    return rewritten.trim();
  } catch (error) {
    console.error('Error rewriting email:', error);
    throw error;
  }
}

/**
 * Generate AI followup email
 */
async function generateFollowupEmail(workspace, originalEmail, days = 3, tone = 'professional') {
  try {
    if (!originalEmail || originalEmail.trim().length === 0) {
      throw new Error('Original email is required');
    }

    const prompt = `Generate a professional follow-up email for the following original email.
This is a ${days}-day follow-up.
Tone: ${tone}

Original Email:
${originalEmail}

Requirements:
- Acknowledge the original email
- Add new value/information
- Gentle call-to-action
- Reference the time passed naturally
- Preserve all personalization placeholders
- Include signature: "Best regards,\\n{{senderName}}"
- Only output the follow-up email, nothing else`;

    const followup = await aiProvider.generate(prompt, tone, 400);
    return followup.trim();
  } catch (error) {
    console.error('Error generating followup email:', error);
    throw error;
  }
}

/**
 * Optimize email for better engagement
 */
async function optimizeEmail(workspace, emailText, options = {}) {
  try {
    if (!emailText || emailText.trim().length === 0) {
      throw new Error('Email text is required');
    }

    const focusArea = options.focusArea || 'engagement'; // engagement|clarity|brevity|conversion
    const industry = options.industry || 'general';

    const focusAreas = {
      engagement: 'Make it more engaging and click-worthy. Add power words and emotions.',
      clarity: 'Make it clearer and easier to understand. Use simpler language.',
      brevity: 'Make it shorter and more concise. Remove unnecessary words.',
      conversion: 'Optimize for conversion. Strengthen the CTA and add urgency.',
    };

    const prompt = `Optimize the following email for ${focusArea}.
Industry: ${industry}

Focus: ${focusAreas[focusArea] || focusAreas.engagement}

Email:
${emailText}

Requirements:
- Keep same message
- Preserve placeholders like {{firstName}}, {{company}}, etc.
- Improve ${focusArea}
- Professional tone
- Only output the optimized email, nothing else`;

    const optimized = await aiProvider.generate(prompt, 'professional', 500);
    return optimized.trim();
  } catch (error) {
    console.error('Error optimizing email:', error);
    throw error;
  }
}

/**
 * Generate subject line variations
 */
async function generateSubjectLineVariations(workspace, topic, count = 5) {
  try {
    if (!topic || topic.trim().length === 0) {
      throw new Error('Topic is required');
    }

    const prompt = `Generate ${count} different email subject lines for:
Topic: ${topic}

Requirements:
- Each under 60 characters
- Mix of styles (curiosity, urgency, benefit, question, statement)
- Include relevant emojis where appropriate
- Numbered list format (1. subject1, 2. subject2, etc.)
- Only output the numbered list, nothing else`;

    const response = await aiProvider.generate(prompt, 'professional', 300);

    // Parse the numbered list
    const lines = response
      .trim()
      .split('\n')
      .filter((line) => line.trim());
    const variations = lines.map((line) => line.replace(/^\d+\.\s*/, '').trim());

    return variations;
  } catch (error) {
    console.error('Error generating subject line variations:', error);
    throw error;
  }
}

/**
 * Helper: Extract personalization variables from text
 */
function extractVariables(text) {
  const regex = /\{\{(\w+)\}\}/g;
  const variables = [];
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1]);
    }
  }

  return variables;
}

/**
 * Helper: Convert plain text email to simple HTML
 */
function convertToHtml(text) {
  return (
    '<html><body><p>' +
    text
      .split('\n\n')
      .map((paragraph) => paragraph.replace(/\n/g, '<br>'))
      .join('</p><p>') +
    '</p></body></html>'
  );
}

module.exports = {
  generateEmailFromTopic,
  rewriteEmail,
  generateFollowupEmail,
  optimizeEmail,
  generateSubjectLineVariations,
};
