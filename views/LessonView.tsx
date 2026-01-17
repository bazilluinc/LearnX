
import React, { useEffect, useState, useRef } from 'react';
import { Module, Step, Quiz } from '../types';
import { generateStepContent, findStepVideo, getYouTubeEmbedUrl, generateLessonAudio, generateCheckpointQuiz, getLessonInsights, getChirpfyChatResponse } from '../services/geminiService';
import { setOfflineItem, getOfflineItem, saveModuleProgress, getModuleProgress } from '../services/storageService';
import { ArrowLeft, ChevronRight, Volume2, Pause, Loader2, Headphones, WifiOff, AlertTriangle, BrainCircuit, RefreshCw, Sparkles, Menu, X, Play, Tv, Lightbulb, MessageCircle, Send } from 'lucide-react';

interface LessonViewProps {
  module: Module;
  courseId: string;
  courseTitle: string;
  userId: string;
  onBack: (updatedModule: Module) => void;
}

const LessonView: React.FC<LessonViewProps> = ({ module, courseId, courseTitle, userId, onBack }) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [content, setContent] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoError, setVideoError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'text' | 'video'>('text');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  
  // AI Insights State
  const [insights, setInsights] = useState<{nuggets: string[], socraticQuestion: string} | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'model', content: string}[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  // Mastery Quiz & Remedial States
  const [showQuiz, setShowQuiz] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [selectedAns, setSelectedAns] = useState<number[]>([]);
  const [remedialContent, setRemedialContent] = useState<string | null>(null);
  
  // Audio State
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [generatingAudio, setGeneratingAudio] = useState(false);

  const [localModule, setLocalModule] = useState<Module>(module);
  const currentStep = localModule.steps[currentStepIdx];

  useEffect(() => {
    const restoreProgress = async () => {
      const saved = await getModuleProgress(userId, courseId, module.id);
      if (saved) {
        setCurrentStepIdx(saved.currentStepIdx);
        setLocalModule(prev => ({
          ...prev,
          steps: prev.steps.map((s, i) => ({ ...s, isCompleted: saved.completedSteps.includes(s.id) }))
        }));
      }
    };
    restoreProgress();
  }, [userId, courseId, module.id]);

  useEffect(() => {
    const loadStep = async () => {
      const storageKey = `lesson_v3_${courseId}_${currentStep.id}`;
      const cached = await getOfflineItem<{text: string, video: string}>(storageKey);

      if (cached) {
        setContent(cached.text);
        setVideoUrl(cached.video);
        setIsOfflineMode(true);
        setLoading(false);
      } else {
        setLoading(true);
        try {
          const [text, video] = await Promise.all([
            generateStepContent(courseTitle, localModule.title, currentStep.title),
            findStepVideo(`${courseTitle} ${currentStep.title}`)
          ]);
          setContent(text);
          setVideoUrl(video);
          setIsOfflineMode(false);
          await setOfflineItem(storageKey, { text, video });
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      }

      // Reset states
      setIsPlaying(false);
      setAudioBlob(null);
      setVideoError(false);
      setShowQuiz(false);
      setRemedialContent(null);
      setViewMode('text');
      setInsights(null);
      setShowAIChat(false);
      setChatHistory([{ role: 'model', content: `Hey! I'm Chirpfy. I've read this lesson on "${currentStep.title}". Ask me anything!` }]);
    };
    loadStep();
  }, [currentStepIdx, currentStep.id]);

  const fetchInsights = async () => {
    if (insights) return;
    setLoadingInsights(true);
    const data = await getLessonInsights(content);
    setInsights(data);
    setLoadingInsights(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = { role: 'user' as const, content: chatInput };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);
    const response = await getChirpfyChatResponse(userMsg.content, chatHistory, content);
    setIsTyping(false);
    setChatHistory(prev => [...prev, { role: 'model', content: response }]);
  };

  const toggleAudio = async () => {
    if (isPlaying) { audioRef.current?.pause(); setIsPlaying(false); return; }
    if (audioBlob) { audioRef.current?.play(); setIsPlaying(true); return; }
    setGeneratingAudio(true);
    const audioData = await generateLessonAudio(content);
    if (audioData) { setAudioBlob(`data:audio/mp3;base64,${audioData}`); setIsPlaying(true); }
    setGeneratingAudio(false);
  };

  const handleNext = async () => {
    const isMasteryCheckpoint = (currentStepIdx + 1) % 3 === 0;
    if (isMasteryCheckpoint && !localModule.steps[currentStepIdx].isCompleted) {
      setLoading(true);
      const quizData = await generateCheckpointQuiz(courseTitle, localModule.steps.slice(currentStepIdx - 2, currentStepIdx + 1).map(s => s.title));
      setQuiz(quizData);
      setSelectedAns(new Array(quizData.questions.length).fill(-1));
      setShowQuiz(true);
      setLoading(false);
      return;
    }
    const updatedSteps = [...localModule.steps];
    updatedSteps[currentStepIdx] = { ...updatedSteps[currentStepIdx], isCompleted: true };
    const completedIds = updatedSteps.filter(s => s.isCompleted).map(s => s.id);
    if (currentStepIdx === localModule.steps.length - 1) {
      onBack({ ...localModule, steps: updatedSteps, isCompleted: true });
    } else {
      const nextIdx = currentStepIdx + 1;
      setCurrentStepIdx(nextIdx);
      setLocalModule(prev => ({ ...prev, steps: updatedSteps }));
      await saveModuleProgress(userId, courseId, module.id, { currentStepIdx: nextIdx, completedSteps: completedIds });
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center justify-center p-8 text-center">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
      <h2 className="text-xl font-bold dark:text-white">Analyzing Content...</h2>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col relative overflow-hidden">
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 p-4 flex items-center justify-between">
        <button onClick={() => onBack(localModule)} className="p-2 text-gray-500"><ArrowLeft size={20} /></button>
        <div className="flex-1 px-4 text-center">
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{localModule.title}</p>
          <h1 className="font-bold dark:text-white text-xs truncate">Step {currentStepIdx + 1}: {currentStep.title}</h1>
        </div>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2">{isMenuOpen ? <X size={22} /> : <Menu size={22} />}</button>
      </header>

      {isMenuOpen && (
        <div className="absolute top-[64px] left-0 right-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 p-4 space-y-2 animate-in slide-in-from-top-4 duration-300">
             <button onClick={() => { setViewMode('text'); setIsMenuOpen(false); }} className={`w-full p-4 rounded-xl flex items-center gap-3 font-bold text-sm ${viewMode === 'text' ? 'bg-blue-50 text-blue-600' : ''}`}><Headphones size={18} /> Interactive Conversation</button>
             <button onClick={() => { setViewMode('video'); setIsMenuOpen(false); }} className={`w-full p-4 rounded-xl flex items-center gap-3 font-bold text-sm ${viewMode === 'video' ? 'bg-blue-50 text-blue-600' : ''}`}><Tv size={18} /> Watch Video Lesson</button>
        </div>
      )}

      <main className="flex-1 overflow-y-auto pb-32 no-scrollbar p-6 max-w-xl mx-auto space-y-8">
        {!showQuiz && !remedialContent && viewMode === 'text' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest"><Sparkles size={16} /> Conversation</div>
              <button onClick={toggleAudio} className="text-blue-600 font-bold text-xs flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full">
                {generatingAudio ? <Loader2 size={12} className="animate-spin" /> : isPlaying ? <Pause size={12} /> : <Volume2 size={12} />}
                {isPlaying ? 'Pause' : 'Listen'}
              </button>
            </div>

            <div className="space-y-6">
               {content.split('\n').map((para, i) => (
                 <p key={i} className="text-gray-800 dark:text-gray-200 text-xl leading-relaxed font-medium">{para}</p>
               ))}
            </div>

            {/* AI Insight Trigger */}
            {!insights && (
              <button 
                onClick={fetchInsights}
                disabled={loadingInsights}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
              >
                {loadingInsights ? <Loader2 className="animate-spin" size={20} /> : <Lightbulb size={20} />}
                {loadingInsights ? 'Extracting Nuggets...' : 'Get AI Mastery Insights'}
              </button>
            )}

            {insights && (
              <div className="p-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-3xl space-y-4 animate-in zoom-in-95">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-widest"><Lightbulb size={16} /> Key Takeaways</div>
                <ul className="space-y-3">
                   {insights.nuggets.map((n, i) => <li key={i} className="flex gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                     <span className="text-blue-600">•</span> {n}
                   </li>)}
                </ul>
                <div className="pt-4 border-t border-blue-200 dark:border-blue-800/50">
                   <p className="text-xs font-bold text-indigo-600 mb-2 uppercase tracking-widest">Socratic Challenge</p>
                   <p className="text-sm italic text-gray-800 dark:text-gray-100">"{insights.socraticQuestion}"</p>
                </div>
              </div>
            )}
          </div>
        )}

        {viewMode === 'video' && (
          <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl">
            <iframe src={`${getYouTubeEmbedUrl(videoUrl)}?modestbranding=1&rel=0&autoplay=1`} className="w-full h-full" allowFullScreen />
          </div>
        )}

        {showQuiz && (
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 animate-in zoom-in-95">
             <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><BrainCircuit className="text-blue-600" /> Mastery Check</h2>
             <div className="space-y-8">
               {quiz?.questions.map((q, i) => (
                 <div key={i} className="space-y-4">
                   <p className="font-bold text-lg">{i+1}. {q.text}</p>
                   <div className="grid gap-2">
                     {q.options.map((opt, optIdx) => (
                       <button key={optIdx} onClick={() => { const n = [...selectedAns]; n[i] = optIdx; setSelectedAns(n); }} className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedAns[i] === optIdx ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold' : 'border-gray-100 text-gray-500'}`}>{opt}</button>
                     ))}
                   </div>
                 </div>
               ))}
               <button onClick={handleNext} disabled={selectedAns.includes(-1)} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-600/30 disabled:opacity-50">Confirm Mastery</button>
             </div>
          </div>
        )}
      </main>

      {/* Floating AI Chat Trigger */}
      <button 
        onClick={() => setShowAIChat(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-white dark:bg-gray-800 rounded-full shadow-2xl flex items-center justify-center text-blue-600 border border-gray-100 dark:border-gray-700 z-50 animate-bounce"
      >
        <MessageCircle size={24} />
      </button>

      {/* Mini AI Chat Overlay */}
      {showAIChat && (
        <div className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
           <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl flex flex-col h-[70vh] animate-in slide-in-from-bottom-10">
              <header className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white"><Sparkles size={14} /></div>
                    <span className="font-bold text-sm">Chirpfy Tutor</span>
                 </div>
                 <button onClick={() => setShowAIChat(false)} className="p-2"><X size={20} /></button>
              </header>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                 {chatHistory.map((m, i) => (
                   <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-100 dark:bg-gray-800 dark:text-gray-200 rounded-tl-none'}`}>
                        {m.content}
                      </div>
                   </div>
                 ))}
                 {isTyping && <div className="text-xs text-gray-400 animate-pulse">Chirpfy is typing...</div>}
              </div>
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 dark:border-gray-800 flex gap-2">
                 <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Ask anything..." className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm border-none focus:ring-0" />
                 <button type="submit" className="p-3 bg-blue-600 text-white rounded-xl shadow-lg"><Send size={18} /></button>
              </form>
           </div>
        </div>
      )}

      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 z-50">
        <div className="max-w-xl mx-auto flex items-center gap-4">
          <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${((currentStepIdx + 1) / localModule.steps.length) * 100}%` }} />
          </div>
          {!showQuiz && (
            <button onClick={handleNext} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-600/20 flex items-center gap-2 active:scale-95 transition-all">
              <span>Next</span>
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      </footer>

      {audioBlob && <audio ref={audioRef} src={audioBlob} onEnded={() => setIsPlaying(false)} className="hidden" />}
    </div>
  );
};

export default LessonView;
