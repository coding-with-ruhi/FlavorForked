import { GoogleGenerativeAI } from '@google/generative-ai'

let client: GoogleGenerativeAI | null = null

export function getGeminiClient(): GoogleGenerativeAI {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined')
    }
    client = new GoogleGenerativeAI(apiKey)
  }
  return client
}

export async function generateText(
  prompt: string,
  modelId: string = 'gemini-1.5-flash'
): Promise<string> {
  const client = getGeminiClient()
  const model = client.getGenerativeModel({ model: modelId })
  const result = await model.generateContent(prompt)
  return result.response.text()
}

export async function analyzeImage(
  imageUrl: string,
  prompt: string,
  modelId: string = 'gemini-1.5-flash'
): Promise<string> {
  const client = getGeminiClient()
  const model = client.getGenerativeModel({ model: modelId })
  const result = await model.generateContent([
    {
      text: prompt,
    },
    {
      inlineData: {
        mimeType: 'image/jpeg',
        data: Buffer.from(
          await (await fetch(imageUrl)).arrayBuffer()
        ).toString('base64'),
      },
    },
  ])
  return result.response.text()
}
