import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing Gemini API...')
    console.log('API Key exists:', !!process.env.GOOGLE_API_KEY)
    console.log('API Key length:', process.env.GOOGLE_API_KEY?.length || 0)

    console.log('Creating Gemini AI instance...')
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)
    const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' })
    console.log('Model created successfully')

    console.log('Generating content...')
    const result = await model.generateContent('Say hello in one word')
    const response = await result.response
    const responseText = response.text()

    console.log('Gemini response:', responseText)

    return NextResponse.json({
      success: true,
      message: 'Gemini API is working',
      response: responseText,
      apiKeyConfigured: !!process.env.GOOGLE_API_KEY,
    })
  } catch (error: any) {
    console.error('Error testing Gemini:', error)
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        errorStack: error.stack,
        apiKeyConfigured: !!process.env.GOOGLE_API_KEY,
      },
      { status: 500 }
    )
  }
}
