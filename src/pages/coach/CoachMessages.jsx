import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Send, Search, ArrowLeft, MessageCircle } from "lucide-react";

export default function CoachMessages() {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const bottomRef = useRef(null);

  const load = async () => {
    try {
      const [msgs, usrs] = await Promise.all([
        base44.entities.Message.list("created_date", 500),
        base44.entities.User.list(),
      ]);
      setMessages(msgs);
      setUsers(usrs);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  const clientsMap = {};
  messages.forEach((m) => {
    const prev = clientsMap[m.client_id];
    if (!prev || new Date(m.created_date) > new Date(prev.lastDate)) {
      clientsMap[m.client_id] = { client_id: m.client_id, lastDate: m.created_date, lastMessage: m };
    }
  });
  const unreadByClient = {};
  messages.forEach((m) => {
    if (m.sender === "client" && !m.lu) unreadByClient[m.client_id] = (unreadByClient[m.client_id] || 0) + 1;
  });
  const userMap = {};
  users.forEach((u) => {
    userMap[u.id] = u;
  });

  let clients = Object.values(clientsMap).map((c) => ({
    ...c,
    user: userMap[c.client_id],
    unread: unreadByClient[c.client_id] || 0,
    name: userMap[c.client_id]?.full_name || userMap[c.client_id]?.email || c.client_id,
  }));
  clients.sort((a, b) => new Date(b.lastDate) - new Date(a.lastDate));

  if (search.trim()) {
    const q = search.toLowerCase();
    clients = clients.filter((c) => c.name.toLowerCase().includes(q));
  }

  const conversation = selectedClient
    ? messages
        .filter((m) => m.client_id === selectedClient)
        .sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
    : [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation.length]);

  const openClient = async (cid) => {
    setSelectedClient(cid);
    const unread = messages.filter((m) => m.client_id === cid && m.sender === "client" && !m.lu);
    if (unread.length > 0) {
      await Promise.all(unread.map((m) => base44.entities.Message.update(m.id, { lu: true })));
      load();
    }
  };

  const send = async () => {
    if (!input.trim() || !selectedClient) return;
    setSending(true);
    try {
      await base44.entities.Message.create({
        client_id: selectedClient,
        sender: "coach",
        content: input.trim(),
        lu: false,
      });
      setInput("");
      load();
    } catch {}
    setSending(false);
  };

  const selectedName = clients.find((c) => c.client_id === selectedClient)?.name || "";

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-1">Messages</p>
        <h1 className="font-heading text-3xl font-bold text-foreground">Conversations clients</h1>
      </div>

      <div className="flex border border-border rounded-2xl overflow-hidden bg-card" style={{ height: "calc(100vh - 220px)" }}>
        <div className={`w-full md:w-80 border-r border-border flex flex-col ${selectedClient ? "hidden md:flex" : "flex"}`}>
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un client..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:border-accent"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {clients.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <MessageCircle className="w-8 h-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">Aucune conversation pour le moment.</p>
              </div>
            ) : (
              clients.map((c) => (
                <button
                  key={c.client_id}
                  onClick={() => openClient(c.client_id)}
                  className={`w-full text-left px-4 py-3 border-b border-border hover:bg-muted/40 transition-colors ${selectedClient === c.client_id ? "bg-accent/10" : ""}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-sm text-foreground truncate">{c.name}</p>
                    {c.unread > 0 && (
                      <span className="bg-secondary text-secondary-foreground text-[10px] font-bold rounded-full px-2 py-0.5 flex-shrink-0">{c.unread}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{c.lastMessage.content}</p>
                </button>
              ))
            )}
          </div>
        </div>

        <div className={`flex-1 flex flex-col ${selectedClient ? "flex" : "hidden md:flex"}`}>
          {selectedClient ? (
            <>
              <div className="px-4 py-3 border-b border-border flex items-center gap-3">
                <button onClick={() => setSelectedClient(null)} className="md:hidden text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <p className="font-semibold text-sm text-foreground">{selectedName}</p>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 p-4">
                {conversation.map((m) => (
                  <div key={m.id} className={`flex ${m.sender === "coach" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${m.sender === "coach" ? "bg-primary text-primary-foreground rounded-br-md" : "bg-secondary/15 text-foreground rounded-bl-md"}`}>
                      <p className="whitespace-pre-wrap">{m.content}</p>
                      <p className={`text-[10px] mt-1 ${m.sender === "coach" ? "text-primary-foreground/50" : "text-muted-foreground"}`}>
                        {new Date(m.created_date).toLocaleString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <div className="p-3 border-t border-border flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !sending && send()}
                  placeholder="Écrivez votre message..."
                  className="flex-1 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent bg-background"
                />
                <button
                  onClick={send}
                  disabled={!input.trim() || sending}
                  className="bg-primary text-primary-foreground px-4 rounded-xl disabled:opacity-50 flex items-center justify-center"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 hidden md:flex flex-col items-center justify-center text-center p-6">
              <MessageCircle className="w-10 h-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">Sélectionnez un client pour afficher la conversation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}