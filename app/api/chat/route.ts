import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAnswer } from '@/lib/model'
import { prisma } from '@/lib/prisma'

interface SessionUser {
  id: string
  email?: string | null
  name?: string | null
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    const userId = (session?.user as SessionUser | undefined)?.id
    if (!session?.user || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { question, chatId } = await req.json()

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 })
    }

    // Get answer from Gemini AI (it will handle validation and responding)
    const answer = await getAnswer(question)

    let chat

    // If no chatId, create a new chat
    if (!chatId) {
      // Generate a title from the first few words of the question
      const title = question.split(' ').slice(0, 5).join(' ')
      chat = await prisma.chat.create({
        data: {
          userId,
          title,
          messages: {
            create: [
              { content: question, role: 'user' },
              { content: answer, role: 'assistant' },
            ],
          },
        },
        include: {
          messages: true,
        },
      })
    } else {
      // Add messages to existing chat
      chat = await prisma.chat.update({
        where: { id: chatId, userId },
        data: {
          messages: {
            create: [
              { content: question, role: 'user' },
              { content: answer, role: 'assistant' },
            ],
          },
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      })
    }

    return NextResponse.json({ 
      answer,
      chatId: chat.id,
      messages: chat.messages,
    })
  } catch (error) {
    console.error('Error in /api/chat:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    const userId = (session?.user as SessionUser | undefined)?.id
    if (!session?.user || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const chatId = searchParams.get('chatId')

    // If chatId is provided, get messages for that chat
    if (chatId) {
      const messages = await prisma.message.findMany({
        where: { 
          chatId,
          chat: {
            userId,
          },
        },
        orderBy: { createdAt: 'asc' },
      })

      return NextResponse.json({ messages })
    }

    // Otherwise, get all chats for the user
    const chats = await prisma.chat.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 1,
        },
      },
    })

    return NextResponse.json({ chats })
  } catch (error) {
    console.error('Error fetching chat history:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
