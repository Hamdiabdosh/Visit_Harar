import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { getChatEnabled, sendChatMessage } from "@/lib/chat-fns";
import { derivePageContext } from "@/lib/chat/page-context";
import type { ChatMessageInput } from "@/lib/validators/chat";
import { cn } from "@/lib/utils";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessageInput[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  });

  const hideChat =
    pathname === "/book" ||
    pathname.startsWith("/book/") ||
    pathname === "/contact";

  const { data: chatStatus } = useQuery({
    queryKey: ["chat", "enabled"],
    queryFn: () => getChatEnabled(),
    staleTime: 60_000,
  });

  const pageContext = derivePageContext(pathname);

  const send = useMutation({
    mutationFn: (nextMessages: ChatMessageInput[]) =>
      sendChatMessage({
        data: { messages: nextMessages, pageContext },
      }),
    onSuccess: (data, sentMessages) => {
      setMessages([
        ...sentMessages,
        { role: "assistant", content: data.reply },
      ]);
      setInput("");
    },
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, send.isPending]);

  if (!chatStatus?.enabled || hideChat) return null;

  function handleSend() {
    const text = input.trim();
    if (!text || send.isPending) return;
    const nextMessages: ChatMessageInput[] = [
      ...messages,
      { role: "user", content: text },
    ];
    setMessages(nextMessages);
    setInput("");
    send.mutate(nextMessages);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-40 h-14 w-14 rounded-full shadow-lg md:bottom-20 md:right-6"
        size="icon"
        aria-label="Open chat assistant"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
        >
          <SheetHeader className="border-b border-border px-6 py-4 text-left">
            <SheetTitle className="font-serif">
              Visit Harar Assistant
            </SheetTitle>
            <SheetDescription>
              Ask about attractions, guides, planning your trip, and more.
            </SheetDescription>
          </SheetHeader>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
          >
            {messages.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Hello! I can help you explore Harar using information from this
                website. What would you like to know?
              </p>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                  msg.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "mr-auto bg-muted text-foreground",
                )}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            ))}
            {send.isPending && (
              <div className="mr-auto flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Thinking…
              </div>
            )}
            {send.isError && (
              <p className="text-sm text-destructive">
                {send.error instanceof Error
                  ? send.error.message
                  : "Something went wrong. Please try again."}
              </p>
            )}
          </div>

          <div className="border-t border-border p-4">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question…"
                rows={2}
                disabled={send.isPending}
                className="min-h-[60px] resize-none"
              />
              <Button
                type="button"
                size="icon"
                onClick={handleSend}
                disabled={!input.trim() || send.isPending}
                aria-label="Send message"
                className="shrink-0 self-end"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
