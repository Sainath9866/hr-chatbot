import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface SessionUser {
  id: string
  email?: string | null
  name?: string | null
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ chatId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    const userId = (session?.user as SessionUser | undefined)?.id
    if (!session?.user || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await context.params
    const { chatId } = params

    await prisma.chat.delete({
      where: {
        id: chatId,
        userId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting chat:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
