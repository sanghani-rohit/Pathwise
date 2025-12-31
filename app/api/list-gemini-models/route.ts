import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function GET(request: NextRequest) {
  try {
    console.log('Listing available Gemini models...')

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)

    // List all available models
    const models = await genAI.listModels()

    console.log('Available models:', models)

    return NextResponse.json({
      success: true,
      models: models.map(model => ({
        name: model.name,
        displayName: model.displayName,
        description: model.description,
        supportedGenerationMethods: model.supportedGenerationMethods,
      }))
    })
  } catch (error: any) {
    console.error('Error listing models:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    )
  }
}
