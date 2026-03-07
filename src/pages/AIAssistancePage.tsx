import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Sparkles, Send, Bot } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Avatar } from '../components/ui/Avatar';
import { Card } from '../components/ui/Card';
import { useDraftEmailMutation, useSendChatMutation } from '../redux/api/aiAssistantApi';
import type { AiAssistantMessage } from '../redux/api/aiAssistantApi';
import { useGetClientsQuery } from '../redux/api/clientsApi';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';
import { useLocation } from 'react-router-dom';

type ChatMessage = {
  id: number;
  role: 'ai' | 'user';
  text: string;
};

type ClientOption = {
  id: string;
  name: string;
  email?: string | null;
};

type ClientDoc = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
};

const defaultAssistantPrompts = [
  'Write a psychological report outlining presenting difficulties, psychological formulation, and plan for therapy using EMDR and ACT.',
  'Give me some exposure ideas for my client who is afraid of heights.',
  'Write a psychological report outlining how the patient meets criteria for PTSD using DSM-5 and ICD-10 criteria.',
  'Write a letter to the GP about...',
  'Give me some ERP ideas for my OCD client who washes their hands in fear of contaminating others.',
  'Check over my clinic website www.….com and make a feedback questionnaire for my clients based on this.',
  'Produce a handout with different ideas for emotional regulation, including things to do with others and things when alone.',
  'Please make a handout on sleep hygiene.',
  'Can you make a handout for my patient outlining different cognitive diffusion techniques?',
];

const ASSISTANT_PROMPT_ROTATION_KEY = 'ai-assistant-prompt-index';

const getNextAssistantPrompt = () => {
  if (typeof window === 'undefined') {
    return defaultAssistantPrompts[0];
  }

  const storedIndex = Number.parseInt(
    window.localStorage.getItem(ASSISTANT_PROMPT_ROTATION_KEY) || '0',
    10
  );
  const safeIndex = Number.isFinite(storedIndex)
    ? Math.abs(storedIndex) % defaultAssistantPrompts.length
    : 0;
  const nextIndex = (safeIndex + 1) % defaultAssistantPrompts.length;

  window.localStorage.setItem(ASSISTANT_PROMPT_ROTATION_KEY, String(nextIndex));

  return defaultAssistantPrompts[safeIndex];
};

const toConversationHistory = (messages: ChatMessage[]): AiAssistantMessage[] =>
  messages.map((message) => ({
    role: message.role === 'ai' ? 'assistant' : 'user',
    content: message.text,
  }));

const getMentionState = (value: string) => {
  const lastAt = value.lastIndexOf('@');
  if (lastAt === -1) return null;
  const after = value.slice(lastAt + 1);
  if (/\s/.test(after)) return null;
  return { query: after, index: lastAt };
};

const findMentionedClient = (value: string, clients: ClientOption[]) => {
  const lastAt = value.lastIndexOf('@');
  if (lastAt === -1) return null;
  const after = value.slice(lastAt + 1).trimStart();
  if (!after) return null;
  const lower = after.toLowerCase();
  return (
    clients.find((client) => lower.startsWith(client.name.toLowerCase())) ||
    clients.find((client) => client.email && lower.startsWith(client.email.toLowerCase())) ||
    null
  );
};

const getErrorMessage = (error?: FetchBaseQueryError | SerializedError) => {
  if (!error) return null;
  if ('data' in error && error.data) {
    const data = error.data as { message?: string };
    if (data.message) return data.message;
  }
  if ('message' in error && error.message) return error.message;
  return null;
};

export function AIAssistancePage() {
  const location = useLocation();
  const [messages, setMessages] = useState<ChatMessage[]>(() => [{
    id: 1,
    role: 'ai',
    text: getNextAssistantPrompt(),
  }]);
  const [input, setInput] = useState('');
  const [selectedClient, setSelectedClient] = useState<ClientOption | null>(null);
  const [sendChat, { isLoading: isChatting, error: chatError }] = useSendChatMutation();
  const [draftEmail, { isLoading: isDrafting, error: draftError }] = useDraftEmailMutation();
  const { data: clientsData, isLoading: clientsLoading } = useGetClientsQuery({
    page: 1,
    limit: 100,
  });
  const isTyping = isChatting || isDrafting;
  const hasUserMessages = useMemo(() => messages.some((message) => message.role === 'user'), [messages]);
  const canSendWithoutTyping = !hasUserMessages && messages.length === 1 && messages[0]?.role === 'ai';
  const requestError = draftError || chatError;
  const requestErrorMessage = getErrorMessage(requestError);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasHandledInitialRoute = useRef(false);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  const mentionState = useMemo(() => getMentionState(input), [input]);
  const mentionQuery = mentionState?.query ?? '';
  const clients = useMemo<ClientOption[]>(() => {
    const rawDocs = clientsData?.response?.data?.docs;
    const docs: ClientDoc[] = Array.isArray(rawDocs) ? rawDocs : [];
    return docs.map((client) => ({
      id: client.id,
      name: `${client.firstName || ''} ${client.lastName || ''}`.trim() || client.email || 'Unnamed Client',
      email: client.email,
    }));
  }, [clientsData]);
  const filteredClients = useMemo(() => {
    if (!mentionState) return [];
    const query = mentionQuery.trim().toLowerCase();
    if (!query) return clients;
    return clients.filter((client) => {
      const name = client.name.toLowerCase();
      const email = client.email?.toLowerCase() || '';
      return name.includes(query) || email.includes(query);
    });
  }, [clients, mentionQuery, mentionState]);
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);
  useEffect(() => {
    if (location.pathname !== '/ai-assistance') return;
    if (!hasHandledInitialRoute.current) {
      hasHandledInitialRoute.current = true;
      return;
    }

    setMessages((prev) => {
      const isIntroOnly =
        prev.length === 1 &&
        prev[0]?.role === 'ai' &&
        !prev.some((message) => message.role === 'user');

      if (!isIntroOnly) return prev;

      return [
        {
          ...prev[0],
          text: getNextAssistantPrompt(),
        },
      ];
    });
  }, [location.pathname]);
  useEffect(() => {
    if (selectedClient && !input.includes(`@${selectedClient.name}`)) {
      setSelectedClient(null);
    }
  }, [input, selectedClient]);
  const handleMentionSelect = (client: ClientOption) => {
    if (!mentionState) return;
    const before = input.slice(0, mentionState.index);
    const nextValue = `${before}@${client.name} `;
    setInput(nextValue);
    setSelectedClient(client);
  };
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim() || (canSendWithoutTyping ? messages[0]?.text || '' : '');
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
      let aiText = 'I can certainly help with that. Let me look into it.';
      const mentionedClient = selectedClient || findMentionedClient(trimmedInput, clients);
      if (mentionedClient) {
        const response = await draftEmail({
          clientId: mentionedClient.id,
          purpose: 'followup',
          tone: 'professional',
        }).unwrap();
        aiText =
          response?.response?.data?.message ||
          response?.response?.data?.draft ||
          response?.response?.data?.email ||
          response?.response?.data?.body ||
          aiText;
      } else {
        const response = await sendChat({
          message: trimmedInput,
          conversationHistory: toConversationHistory(nextMessages),
        }).unwrap();
        aiText = response?.response?.data?.message || aiText;
      }

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
            <div className="relative flex-1">
              <Input
                placeholder="Ask me anything..."
                value={input}
                onChange={e => setInput(e.target.value)}
                className="flex-1 text-sm h-10"
              />
              {mentionState && (
                <div className="absolute bottom-11 left-0 right-0 z-40 max-h-56 overflow-auto rounded-xl border border-border/60 bg-white shadow-lg">
                  {clientsLoading ? (
                    <div className="px-3 py-2 text-xs text-muted-foreground">Loading clients...</div>
                  ) : filteredClients.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-muted-foreground">No clients found.</div>
                  ) : (
                    filteredClients.slice(0, 8).map((client) => (
                      <button
                        key={client.id}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted/20"
                        onClick={() => handleMentionSelect(client)}
                      >
                        <div className="font-medium text-foreground">{client.name}</div>
                        {client.email && (
                          <div className="text-xs text-muted-foreground">{client.email}</div>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            <Button type="submit" size="icon" disabled={isTyping || (!input.trim() && !canSendWithoutTyping)} className="h-10 w-10">
              <Send className="h-4 w-4" />
            </Button>
          </form>
          {/* <div className="mt-2 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <Button variant="outline" size="sm" className="whitespace-nowrap text-xs h-8 px-3" onClick={() => setInput('Enhance this letter with a more professional and empathetic tone.')}>
              Enhance letter tone
            </Button>
            <Button variant="outline" size="sm" className="whitespace-nowrap text-xs h-8 px-3" onClick={() => setInput('Summarize this client case into key points and action items.')}>
              Summarize client case
            </Button>
            <Button variant="outline" size="sm" className="whitespace-nowrap text-xs h-8 px-3" onClick={() => setInput('Generate a concise follow-up plan for next session.')}>
              Create follow-up plan
            </Button>
          </div> */}
          {requestErrorMessage && (
            <div className="mt-2 text-xs text-red-600">
              {requestErrorMessage || 'Unable to reach the AI assistant right now.'}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
