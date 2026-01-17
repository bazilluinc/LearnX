
import React, { useEffect, useState, useRef } from 'react';
import { Module, Step, Quiz } from '../types';
import { generateStepContent, findStepVideo, getYouTubeEmbedUrl, generateLessonAudio, generateCheckpointQuiz } from '../services/geminiService';
import { setOfflineItem, getOfflineItem, saveModuleProgress, getModuleProgress } from '../services/storageService';
import { ArrowLeft, ChevronRight, Volume2, Pause, Loader2, Headphones, WifiOff, AlertTriangle, BrainCircuit, RefreshCw, Sparkles, Menu, X, Play, Tv } from 'lucide-react';

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
      // RESET ON STEP CHANGE
      setIsPlaying(false);
      setAudioBlob(null);
      setVideoError(false);
      setShowQuiz(false);
      setRemedialContent(null);
      // Keep view mode or reset to text? requested text on top, so reset to text
      setViewMode('text');

      const storageKey = `lesson_v3_${courseId}_${currentStep.id}`;
      const cached = await getOfflineItem<{text: string, video: string}>(storageKey);

      if (cached) {
        setContent(cached.text);
        setVideoUrl(cached.video);
        setIsOfflineMode(true);
        setVideoError(false);
        setLoading(false); // Immediate transition if cached
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
    };
    loadStep();
  }, [currentStepIdx]);

  const toggleAudio = async () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }
    if (audioBlob) {
      audioRef.current?.play();
      setIsPlaying(true);
      return;
    }
    setGeneratingAudio(true);
    const audioData = await generateLessonAudio(content);
    if (audioData) {
      setAudioBlob(`data:audio/mp3;base64,${audioData}`);
      setIsPlaying(true);
    }
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
      const finishedModule = { ...localModule, steps: updatedSteps, isCompleted: true };
      await saveModuleProgress(userId, courseId, module.id, { currentStepIdx, completedSteps: completedIds });
      onBack(finishedModule);
    } else {
      const nextIdx = currentStepIdx + 1;
      setCurrentStepIdx(nextIdx);
      setLocalModule(prev => ({ ...prev, steps: updatedSteps }));
      await saveModuleProgress(userId, courseId, module.id, { currentStepIdx: nextIdx, completedSteps: completedIds });
    }
  };

  const submitQuiz = async () => {
    if (!quiz) return;
    const score = selectedAns.reduce((acc, ans, idx) => acc + (ans === quiz.questions[idx].correctAnswerIndex ? 1 : 0), 0);
    const passed = score === quiz.questions.length;

    if (passed) {
      setShowQuiz(false);
      const updatedSteps = [...localModule.steps];
      updatedSteps[currentStepIdx] = { ...updatedSteps[currentStepIdx], isCompleted: true };
      setLocalModule(prev => ({ ...prev, steps: updatedSteps }));
      handleNext();
    } else {
      setLoading(true);
      const refresh = await generateStepContent(courseTitle, "Mastery Refresh", "Closing the gaps from the previous quiz");
      setRemedialContent(refresh);
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center justify-center p-8 text-center">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
      <h2 className="text-xl font-bold dark:text-white tracking-tight">Refining Progress...</h2>
      <p className="text-gray-500 text-sm mt-2">Checking your personalized mastery path.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 p-4 flex items-center justify-between">
        <button onClick={() => onBack(localModule)} className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 px-4 text-center">
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{localModule.title}</p>
          <h1 className="font-bold text-gray-900 dark:text-white text-xs truncate">Step {currentStepIdx + 1}: {currentStep.title}</h1>
        </div>
        <div className="flex items-center gap-1">
          {isOfflineMode && <WifiOff size={14} className="text-amber-500" />}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Hamburger Menu Overlay */}
      {isMenuOpen && (
        <div className="absolute top-[64px] left-0 right-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <div className="p-4 space-y-2">
             <button 
               onClick={() => { setViewMode('text'); setIsMenuOpen(false); }}
               className={`w-full p-4 rounded-xl flex items-center justify-between font-bold text-sm ${viewMode === 'text' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
             >
               <div className="flex items-center gap-3"><Headphones size={18} /> Interactive Conversation</div>
               {viewMode === 'text' && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
             </button>
             <button 
               onClick={() => { setViewMode('video'); setIsMenuOpen(false); }}
               className={`w-full p-4 rounded-xl flex items-center justify-between font-bold text-sm ${viewMode === 'video' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
             >
               <div className="flex items-center gap-3"><Tv size={18} /> Watch Video Lesson</div>
               {viewMode === 'video' && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
             </button>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto pb-32">
        {/* TEXT MODE: Leading with Conversation - ALWAYS ON TOP of logic */}
        {viewMode === 'text' && !showQuiz && !remedialContent && (
          <div className="p-6 max-w-xl mx-auto space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
             <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-blue-600">
                  <Sparkles size={18} />
                  <span className="text-xs font-bold uppercase tracking-widest">Mastery Conversation</span>
                </div>
                <button 
                  onClick={toggleAudio}
                  disabled={generatingAudio}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs transition-all ${
                    isPlaying ? 'bg-red-50 text-red-600' : 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 active:scale-95'
                  } disabled:opacity-50`}
                >
                  {generatingAudio ? <Loader2 size={14} className="animate-spin" /> : isPlaying ? <Pause size={14} /> : <Volume2 size={14} />}
                  {isPlaying ? 'Pause' : 'Listen to this lesson'}
                </button>
              </div>

              <div className="space-y-4">
                {content.split('\n').map((para, i) => (
                  <p key={i} className="text-gray-800 dark:text-gray-200 text-xl leading-relaxed font-medium">
                    {para}
                  </p>
                ))}
              </div>
          </div>
        )}

        {/* VIDEO MODE: Strictly separated as requested */}
        {viewMode === 'video' && !showQuiz && !remedialContent && (
          <div className="flex flex-col animate-in fade-in zoom-in-95 duration-300">
             <div className="aspect-video bg-black relative">
                {videoError ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white p-8 text-center">
                     <AlertTriangle size={56} className="text-amber-500 mb-4" />
                     <h3 className="text-2xl font-bold">Aww... snap!</h3>
                     <p className="text-gray-400 mt-2">This video lesson is not playable right now. Our AI is hunting for a backup.</p>
                  </div>
                ) : (
                  <iframe 
                    src={`${getYouTubeEmbedUrl(videoUrl)}?modestbranding=1&rel=0&autoplay=1`} 
                    className="w-full h-full"
                    allowFullScreen 
                    onError={() => setVideoError(true)}
                  />
                )}
             </div>
             <div className="p-6">
                <div className="flex items-center gap-2 text-indigo-600 mb-4">
                  <Tv size={18} />
                  <span className="text-xs font-bold uppercase tracking-widest">Visual Reinforcement</span>
                </div>
                <h2 className="text-2xl font-bold dark:text-white mb-2">{currentStep.title}</h2>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">This video supplement focuses on the visual application of what we just discussed in the conversation.</p>
             </div>
          </div>
        )}

        {/* MASTERY QUIZ / REMEDIAL OVERLAYS */}
        <div className="p-6 max-w-xl mx-auto space-y-6">
           {remedialContent && (
             <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/50 p-6 rounded-3xl animate-in slide-in-from-bottom-4">
                <div className="flex items-center gap-2 text-amber-600 mb-4">
                   <Sparkles size={20} />
                   <span className="text-xs font-bold uppercase tracking-widest text-amber-600">Mastery Refresh</span>
                </div>
                <h2 className="text-2xl font-bold text-amber-900 dark:text-amber-100 mb-4">Let's refine this concept</h2>
                <div className="space-y-4">
                   {remedialContent.split('\n').map((p, i) => <p key={i} className="mb-4 text-xl text-amber-900 dark:text-amber-100 font-medium">{p}</p>)}
                </div>
                <button 
                  onClick={() => { setRemedialContent(null); setShowQuiz(true); }}
                  className="w-full py-5 bg-amber-600 text-white rounded-2xl font-bold shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 mt-4 active:scale-95 transition-all"
                >
                  <RefreshCw size={20} /> Retake Mastery Check
                </button>
             </div>
           )}

           {showQuiz && !remedialContent && (
             <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-xl border border-blue-100 dark:border-blue-900/30 animate-in zoom-in-95 duration-300">
               <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg">
                    <BrainCircuit size={24} />
                  </div>
                  <h2 className="text-xl font-bold dark:text-white">Verify Your Mastery</h2>
               </div>
               <div className="space-y-8">
                 {quiz?.questions.map((q, i) => (
                   <div key={i} className="space-y-4">
                     <p className="font-bold text-lg text-gray-800 dark:text-gray-100">{i+1}. {q.text}</p>
                     <div className="grid gap-2">
                       {q.options.map((opt, optIdx) => (
                         <button 
                           key={optIdx}
                           onClick={() => { const n = [...selectedAns]; n[i] = optIdx; setSelectedAns(n); }}
                           className={`w-full text-left p-4 rounded-xl border-2 transition-all text-sm ${selectedAns[i] === optIdx ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 font-bold' : 'border-gray-100 dark:border-gray-800 text-gray-500'}`}
                         >
                           {opt}
                         </button>
                       ))}
                     </div>
                   </div>
                 ))}
                 <button 
                   onClick={submitQuiz}
                   disabled={selectedAns.includes(-1)}
                   className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-600/30 disabled:opacity-50 active:scale-95 transition-all"
                 >
                   Confirm Mastery
                 </button>
               </div>
             </div>
           )}
        </div>
      </main>

      {/* Progress Footer */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 z-50">
        <div className="max-w-xl mx-auto flex items-center gap-4">
          <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-500"
              style={{ width: `${((currentStepIdx + 1) / localModule.steps.length) * 100}%` }}
            />
          </div>
          {!showQuiz && !remedialContent && (
            <button 
              onClick={handleNext}
              className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-600/20 flex items-center gap-2 active:scale-95 transition-all"
            >
              <span>{currentStepIdx === localModule.steps.length - 1 ? 'Finish Module' : (currentStepIdx + 1) % 3 === 0 && !currentStep.isCompleted ? 'Verify Mastery' : 'Next Step'}</span>
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
