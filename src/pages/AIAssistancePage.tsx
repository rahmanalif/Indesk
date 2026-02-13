import React, { useEffect, useState, useRef } from 'react';
import { Sparkles, Send, Bot } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Avatar } from '../components/ui/Avatar';
import { Card } from '../components/ui/Card';
import { useSendChatMutation } from '../redux/api/aiAssistantApi';
import type { AiAssistantMessage } from '../redux/api/aiAssistantApi';

type ChatMessage = {
  id: number;
  role: 'ai' | 'user';
  text: string;
};

const toConversationHistory = (messages: ChatMessage[]): AiAssistantMessage[] =>
  messages.map((message) => ({
    role: message.role === 'ai' ? 'assistant' : 'user',
    content: message.text,
  }));

export function AIAssistancePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: 1,
    role: 'ai',
    text: "Hello Dr. Smith! I'm your Inkind Assistant. How can I help you today? I can summarize client notes, draft emails, or help optimize your schedule."
  }]);
  const [input, setInput] = useState('');
  const [sendChat, { isLoading: isTyping, error: chatError }] = useSendChatMutation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || isTyping) return;
    const userMsg = {
      id: Date.now(),
      role: 'user',
      text: trimmedInput
    };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');

    try {
      const response = await sendChat({
        message: trimmedInput,
        conversationHistory: toConversationHistory(nextMessages),
      }).unwrap();

      const aiText =
        response?.response?.data?.message ||
        'I can certainly help with that. Let me look into it.';

      const aiMsg = {
        id: Date.now() + 1,
        role: 'ai',
        text: aiText
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const fallbackMsg = {
        id: Date.now() + 1,
        role: 'ai' as const,
        text: 'Sorry, I ran into an error while contacting the assistant. Please try again.',
      };
      setMessages(prev => [...prev, fallbackMsg]);
    }
  };

  return (
    // Mobile: Fixed position to fill screen below header (top-20 = 5rem)
    // Desktop: Relative position within the layout
    <div className="fixed inset-x-0 bottom-0 top-20 z-30 bg-background p-4 flex flex-col md:relative md:inset-auto md:top-auto md:bottom-auto md:h-[calc(100vh-10rem)] md:bg-transparent md:p-0">
      <div className="mb-2 md:mb-4 flex-shrink-0">
        <h1 className="text-xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Sparkles className="h-5 w-5 md:h-8 md:w-8 text-primary" />
          AI Assistant
        </h1>
        <p className="text-xs md:text-base text-muted-foreground mt-1">
          Your intelligent partner for clinic management.
        </p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border border-border/50 shadow-sm bg-white md:bg-white/50">
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4 bg-muted/5 scroll-smooth">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <Avatar
                fallback={msg.role === 'ai' ? <Bot className="h-4 w-4 md:h-5 md:w-5" /> : 'SS'}
                className={msg.role === 'ai' ? 'bg-primary text-white h-8 w-8' : 'bg-muted h-8 w-8'}
              />
              <div
                className={`p-3 rounded-2xl max-w-[85%] text-sm ${msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-tr-none'
                  : 'bg-white border border-border/50 rounded-tl-none shadow-sm'
                  } whitespace-pre-wrap`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-3">
              <Avatar fallback={<Bot className="h-4 w-4" />} className="bg-primary text-white h-8 w-8" />
              <div className="bg-white border border-border/50 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce delay-75" />
                <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce delay-150" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-white border-t border-border/50">
          <form onSubmit={handleSend} className="flex gap-2">
            <Input
              placeholder="Ask me anything..."
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-1 text-sm h-10"
            />
            <Button type="submit" size="icon" disabled={!input.trim() || isTyping} className="h-10 w-10">
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <Button variant="outline" size="sm" className="whitespace-nowrap text-xs h-8 px-3" onClick={() => setInput('Draft a follow-up email for James Wilson')}>
              Draft follow-up email
            </Button>
            <Button variant="outline" size="sm" className="whitespace-nowrap text-xs h-8 px-3" onClick={() => setInput('Summarize my schedule for today')}>
              Summarize today's schedule
            </Button>
            <Button variant="outline" size="sm" className="whitespace-nowrap text-xs h-8 px-3" onClick={() => setInput('Create an invoice for Emma Thompson')}>
              Create invoice
            </Button>
          </div>
          {chatError && (
            <div className="mt-2 text-xs text-red-600">
              {(chatError as any)?.data?.message || 'Unable to reach the AI assistant right now.'}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
