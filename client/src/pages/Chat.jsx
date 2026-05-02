import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import Protected from "../components/Protected.jsx";
import { api } from "../services/api.js";
import { createSocket } from "../services/socket.js";
import { selectAuth } from "../store/authSlice.js";

export default function Chat() {
  return (
    <Protected>
      <ChatContent />
    </Protected>
  );
}

function ChatContent() {
  const { sellerId } = useParams();
  const { token, user } = useSelector(selectAuth);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [status, setStatus] = useState("Connecting...");
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    let active = true;

    async function loadHistory() {
      const { data } = await api.get(`/chat/${sellerId}`);
      if (active) setMessages(data.messages);
    }

    loadHistory().catch(() => setStatus("Unable to load chat"));

    const socket = createSocket(token);
    socketRef.current = socket;
    socket.on("connect", () => {
      setStatus("Online");
      socket.emit("chat:join", { receiverId: sellerId });
    });
    socket.on("connect_error", () => setStatus("Connection failed"));
    socket.on("chat:message", (message) => {
      if (message.roomId?.includes(sellerId)) {
        setMessages((current) => [...current, message]);
      }
    });

    return () => {
      active = false;
      socket.disconnect();
    };
  }, [sellerId, token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function send(event) {
    event.preventDefault();
    if (!text.trim()) return;

    socketRef.current?.emit("chat:send", { receiverId: sellerId, text }, (ack) => {
      if (!ack?.ok) setStatus(ack?.message || "Message failed");
    });
    setText("");
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <h1 className="text-xl font-black text-ink">Real-time chat</h1>
            <p className="text-sm text-slate-500">Buyer and seller conversation using Socket.io</p>
          </div>
          <span className="rounded-md bg-mint/10 px-3 py-1 text-sm font-bold text-teal-800">{status}</span>
        </div>

        <div className="h-[58vh] space-y-3 overflow-y-auto bg-slate-50 p-4">
          {messages.map((message) => {
            const mine = String(message.sender?._id || message.sender) === String(user?.id);
            return (
              <div key={message._id || `${message.createdAt}-${message.text}`} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[78%] rounded-lg px-4 py-2 ${mine ? "bg-ink text-white" : "border border-slate-200 bg-white text-slate-800"}`}>
                  <p className="text-sm">{message.text}</p>
                  <p className={`mt-1 text-[11px] ${mine ? "text-white/70" : "text-slate-400"}`}>
                    {new Date(message.createdAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={send} className="flex gap-2 border-t border-slate-200 p-3">
          <input
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Type a message"
            className="focus-ring min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2"
          />
          <button className="focus-ring inline-flex items-center gap-2 rounded-md bg-mint px-4 py-2 font-bold text-white hover:bg-teal-700">
            <Send size={18} /> Send
          </button>
        </form>
      </div>
    </section>
  );
}

