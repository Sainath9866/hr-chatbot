import ChatWrapper from '@/components/ChatWrapper'

interface PageProps {
  params: Promise<{
    chatId: string
  }>
}

export default async function ChatPage({ params }: PageProps) {
  const { chatId } = await params
  
  return <ChatWrapper initialChatId={chatId} />
}

