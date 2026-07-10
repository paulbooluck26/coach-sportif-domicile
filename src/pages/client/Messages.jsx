import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Send } from "lucide-react";

export default function Messages() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const load = async () => {
    if (!user) return;
    try {
      const data = await base44.entities.Message.filter({ client_id: user.id }, "created_date", 200);
      setMessages(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || !user) return;
    setSending(true);
    try {
      await base44.entities.Message.create({
        client_id: user.id,
        sender: "client",
        content: input.trim(),
        lu: false,
      });
      setInput("");
      load();
    } catch {}
    setSending(false);
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="flex flex-col" style={{ height: "calc(100dvh - 180px)" }}>
      <div className="mb-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-1">Messages</p>
        <h1 className="font-heading text-3xl font-bold text-foreground">Votre coach</h1>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 bg-card border border-border rounded-2xl p-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <p className="text-muted-foreground text-sm">Aucun message pour le moment.</p>
            <p className="text-muted-foreground text-xs mt-1">Posez votre question à votre coach !</p>
          </div>
        ) : (
          messages.map(m => (
            <div key={m.id} className={`flex ${m.sender === "client" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm ${m.sender === "client" ? "bg-primary text-primary-foreground rounded-br-md" : "bg-secondary/15 text-foreground rounded-bl-md"}`}>
                <p className="whitespace-pre-wrap">{m.content}</p>
                <p className={`text-[10px] mt-1 ${m.sender === "client" ? "text-primary-foreground/50" : "text-muted-foreground"}`}>
                  {new Date(m.created_date).toLocaleString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !sending && send()}
          placeholder="Écrivez votre message..."
          className="flex-1 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent bg-card"
        />
        <button
          onClick={send}
          disabled={!input.trim() || sending}
          className="bg-primary text-primary-foreground px-4 rounded-xl disabled:opacity-50 flex items-center justify-center"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}