import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles, Loader2, ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import ScreenHeader from "@/components/layout/ScreenHeader";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type TestRecommendation = {
  name: string;
  price: number;
  id: string;
};

const suggestedQuestions = [
  "What does a CBC test measure?",
  "Why is Vitamin D important?",
  "How often should I get a health checkup?",
  "What tests should I take for diabetes?",
];

// Parse test recommendations from AI response
const parseTestRecommendations = (content: string): TestRecommendation[] => {
  const testPattern = /\[TEST:([^:]+):(\d+)\]/g;
  const tests: TestRecommendation[] = [];
  const seenNames = new Set<string>();
  
  let match;
  while ((match = testPattern.exec(content)) !== null) {
    const name = match[1].trim();
    const price = parseInt(match[2], 10);
    if (!seenNames.has(name)) {
      seenNames.add(name);
      tests.push({
        name,
        price,
        id: `ai-rec-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      });
    }
  }
  return tests;
};

// Format content by removing test tags and making text cleaner
const formatContent = (content: string): string => {
  return content.replace(/\[TEST:([^:]+):(\d+)\]/g, '$1');
};

const HealthAssistantScreen = () => {
  const navigate = useNavigate();
  const { addToCart, items } = useCart();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [addedTests, setAddedTests] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleAddToCart = (test: TestRecommendation) => {
    addToCart({
      id: test.id,
      name: test.name,
      price: test.price,
    });
    setAddedTests(prev => new Set(prev).add(test.name));
    toast.success(`${test.name} added to cart!`);
  };

  const isTestInCart = (testName: string): boolean => {
    return addedTests.has(testName) || items.some(item => 
      item.name.toLowerCase() === testName.toLowerCase()
    );
  };

  const streamChat = async (userMessage: string) => {
    const newMessages: Message[] = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    let assistantContent = "";

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/health-assistant`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ messages: newMessages }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to get response");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      // Add empty assistant message
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: assistantContent,
                };
                return updated;
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: assistantContent,
                };
                return updated;
              });
            }
          } catch {
            /* ignore */
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to get response");
      // Remove the empty assistant message if error
      setMessages((prev) => prev.filter((m) => m.content !== ""));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    const message = input.trim();
    setInput("");
    streamChat(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    if (isLoading) return;
    streamChat(question);
  };

  const renderMessageContent = (message: Message) => {
    if (message.role === "user") {
      return <p className="text-sm whitespace-pre-wrap">{message.content}</p>;
    }

    const tests = parseTestRecommendations(message.content);
    const formattedContent = formatContent(message.content);

    return (
      <div>
        <p className="text-sm whitespace-pre-wrap">{formattedContent}</p>
        {tests.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Recommended Tests:</p>
            <div className="flex flex-wrap gap-2">
              {tests.map((test) => {
                const inCart = isTestInCart(test.name);
                return (
                  <Button
                    key={test.id}
                    variant={inCart ? "outline" : "default"}
                    size="sm"
                    className="h-auto py-2 px-3 text-xs"
                    onClick={() => !inCart && handleAddToCart(test)}
                    disabled={inCart}
                  >
                    {inCart ? (
                      <Check className="w-3 h-3 mr-1" />
                    ) : (
                      <ShoppingCart className="w-3 h-3 mr-1" />
                    )}
                    {test.name} - ₹{test.price}
                    {inCart && <span className="ml-1 text-muted-foreground">(Added)</span>}
                  </Button>
                );
              })}
            </div>
          </div>
        )}
        {message.content === "" && isLoading && (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs text-muted-foreground">Thinking...</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <ScreenHeader 
        title="Health Assistant" 
        rightAction={
          items.length > 0 ? (
            <button 
              onClick={() => navigate("/cart")}
              className="relative p-2"
            >
              <ShoppingCart className="w-5 h-5 text-foreground" />
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-primary rounded-full flex items-center justify-center text-[10px] font-bold text-primary-foreground">
                {items.length}
              </span>
            </button>
          ) : undefined
        }
      />

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center px-4"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              Hi! I'm your Health Assistant
            </h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs">
              Ask me anything about health tests, wellness tips, or understanding your results. I can help you book tests too!
            </p>

            <div className="w-full space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Try asking:</p>
              {suggestedQuestions.map((question, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="w-full text-left p-3 rounded-xl bg-card border border-border hover:bg-muted/50 transition-colors text-sm text-foreground"
                >
                  {question}
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4 py-4">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-card border border-border text-foreground rounded-bl-md"
                    }`}
                  >
                    {renderMessageContent(message)}
                  </div>
                  {message.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-background p-4 pb-safe">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about health tests, symptoms..."
            className="flex-1 h-12 px-4 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            disabled={isLoading}
          />
          <Button
            size="icon"
            className="h-12 w-12 rounded-xl"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          AI responses are for informational purposes only. Consult a healthcare professional for medical advice.
        </p>
      </div>
    </div>
  );
};

export default HealthAssistantScreen;
