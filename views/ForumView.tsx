import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Bot, User, Heart, MessageSquare, Share2, Sparkles, Loader2 } from 'lucide-react';
import { getChirpfyChatResponse } from '../services/geminiService';

const MOCK_POSTS = [
  {
    id: 1,
    author: "Jessica M.",
    role: "Student",
    time: "2h ago",
    content: "Just finished the UX Design wireframing module. Does anyone else feel like low-fidelity sketches are actually harder than high-fi ones?",
    likes: 12,
    comments: 4,
    tags: ["Design", "UX"]
  },
  {
    id: 2,
    author: "David Chen",
    role: "Instructor",
    time: "4h ago",
    content: "Tip for the Python Data Science course: Don't just copy the code! Try to break it and fix it again. That's where the real learning happens. 🐍",
    likes: 45,
    comments: 8,
    tags: ["Python", "Tips"]
  },
  {
    id: 3,
    author: "Alex Learner",
    role: "Student",
    time: "6h ago",
    content: "Can anyone recommend a good supplementary book for the React 18 course? I want to dive deeper into hooks.",
    likes: 8,
    comments: 12,
    tags: ["React", "Resources"]
  }
];

interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    content: string;
}

const ForumView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'community' | 'ai'>('community');
  
  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
      { id: '1', role: 'model', content: "Hello! I'm Chirpfy AI, running on the Lynx 3.2 model. I'm here to explain lessons, answer course questions, or just chat about what you're learning. How can I help?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
  }, [chatHistory, isTyping, activeTab]);

  const handleSendMessage = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!chatInput.trim()) return;

      const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: chatInput };
      setChatHistory(prev => [...prev, userMsg]);
      setChatInput('');
      setIsTyping(true);

      const historyForApi = chatHistory.map(h => ({ role: h.role, content: h.content }));
      
      const responseText = await getChirpfyChatResponse(userMsg.content, historyForApi);
      
      setIsTyping(false);
      const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', content: responseText };
      setChatHistory(prev => [...prev, botMsg]);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 pb-20 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 px-4 py-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Forum</h1>
        <div className="flex p-1 bg-gray-100 dark:bg-gray-700 rounded-xl">
          <button
            onClick={() => setActiveTab('community')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'community'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            Community
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'ai'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <Sparkles size={14} />
            Chirpfy AI
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'community' ? (
          <div className="p-4 space-y-4">
            {MOCK_POSTS.map((post) => (
              <div key={post.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold">
                      {post.author.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm">{post.author}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">{post.role}</span>
                        <span className="text-[10px] text-gray-400">• {post.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-3">
                  {post.content}
                </p>

                <div className="flex gap-2 mb-4">
                   {post.tags.map(tag => (
                       <span key={tag} className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">#{tag}</span>
                   ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                  <button className="flex items-center gap-1.5 text-xs hover:text-red-500 transition-colors">
                    <Heart size={16} />
                    <span>{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-xs hover:text-blue-500 transition-colors">
                    <MessageSquare size={16} />
                    <span>{post.comments}</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-xs hover:text-green-500 transition-colors">
                    <Share2 size={16} />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            ))}
            
            <div className="text-center py-6">
                <p className="text-gray-400 text-sm">That's all for now!</p>
            </div>
          </div>
        ) : (
          /* AI CHAT INTERFACE */
          <div className="flex flex-col h-full bg-white dark:bg-gray-900">
             <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={chatContainerRef}>
                <div className="flex justify-center mb-4">
                    <span className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-600 font-bold bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-100 dark:border-gray-700">
                        Running on Lynx 3.2 Model
                    </span>
                </div>
                
                {chatHistory.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                            msg.role === 'user' 
                                ? 'bg-blue-600 text-white rounded-tr-none' 
                                : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none'
                        }`}>
                            <div className="flex items-center gap-2 mb-1 opacity-70">
                                {msg.role === 'model' ? <Bot size={12} /> : <User size={12} />}
                                <span className="text-[10px] font-bold uppercase">{msg.role === 'model' ? 'Chirpfy AI' : 'You'}</span>
                            </div>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        </div>
                    </div>
                ))}
                
                {isTyping && (
                    <div className="flex justify-start">
                         <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-2">
                             <Bot size={14} className="text-blue-500" />
                             <div className="flex gap-1">
                                 <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                                 <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-75"></div>
                                 <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-150"></div>
                             </div>
                         </div>
                    </div>
                )}
             </div>
             
             {/* Chat Input */}
             <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 sticky bottom-0">
                 <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
                     <div className="relative flex-1">
                         <input 
                             type="text" 
                             value={chatInput}
                             onChange={(e) => setChatInput(e.target.value)}
                             placeholder="Ask about a lesson..." 
                             className="w-full pl-4 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-gray-600 dark:text-white transition-all text-sm"
                         />
                     </div>
                     <button 
                         type="submit" 
                         disabled={!chatInput.trim() || isTyping}
                         className="p-3 bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-xl shadow-lg shadow-blue-600/20 transition-transform active:scale-95 hover:bg-blue-700"
                     >
                         {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                     </button>
                 </form>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForumView;