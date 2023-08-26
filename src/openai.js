require('dotenv').config();
const OpenAI = require('openai');

const openai = new OpenAI({
  organization: process.env.OPENAI_ORGANIZATION,
  apiKey: process.env.OPENAI_API_KEY,
});

async function createChatCompletion() {
  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: 'system', content: 'hello, world' }],
      model: 'gpt-4',
    });
  
    console.log(completion.choices[0].message, completion.usage.total_tokens)
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      console.error(error.status);  // e.g., 401
      console.error(error.message); // e.g., The authentication token you passed was invalid...
      console.error(error.code);    // e.g., 'invalid_api_key'
      console.error(error.type);    // e.g., 'invalid_request_error'
    } else {
      // Non-API error
      console.error(error);
    }
  }
}

createChatCompletion();
