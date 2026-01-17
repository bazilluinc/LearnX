
import React, { useEffect, useState } from 'react';
import { Course, Module, GeneratedCourseOutline, User } from '../types';
import { generateCourseSyllabus, generateCourseSummary } from '../services/geminiService';
import { getCourseSyllabus, saveCourseSyllabus } from '../services/storageService';
import { ArrowLeft, CheckCircle, Sparkles, Lock, Award, Download, PartyPopper } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface CourseDetailProps {
  course: Course;
  currentUser?: User;
  onBack: () => void;
  onModuleSelect: (module: Module, courseTitle: string) => void;
}

const CourseDetail: React.FC<CourseDetailProps> = ({ course, currentUser, onBack, onModuleSelect }) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string>('');
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      const cachedSyllabus = await getCourseSyllabus(course.id);
      
      if (cachedSyllabus) {
        setModules(cachedSyllabus);
      } else {
        try {
          const outline: GeneratedCourseOutline = await generateCourseSyllabus(course.title);
          const newModules: Module[] = outline.modules.map((m, index) => ({
            id: `m-${index}`,
            title: m.title,
            description: m.description,
            isCompleted: false,
            steps: (m as any).steps?.map((s: any, sIdx: number) => ({
                id: `s-${index}-${sIdx}`,
                title: s.title,
                order: sIdx + 1,
                isCompleted: false
            })) || []
          }));
          await saveCourseSyllabus(course.id, newModules);
          setModules(newModules);
        } catch (error) {
          console.error("Failed to load modules", error);
        }
      }
      setLoading(false);

      setSummaryLoading(true);
      try {
        const generatedSummary = await generateCourseSummary(course.title, course.description);
        setSummary(generatedSummary);
      } catch (error) {
        setSummary(course.description);
      } finally {
        setSummaryLoading(false);
      }
    };
    initData();
  }, [course]);

  const progress = modules.length > 0 ? Math.round((modules.filter(m => m.isCompleted).length / modules.length) * 100) : 0;
  const isFinished = progress === 100;

  const downloadCertificate = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Outer Border
    doc.setDrawColor(37, 99, 235); // LearnX Blue
    doc.setLineWidth(2);
    doc.rect(10, 10, 277, 190);
    
    // Inner Border
    doc.setDrawColor(30, 58, 138); // Darker Blue
    doc.setLineWidth(0.5);
    doc.rect(13, 13, 271, 184);

    // Branding
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(40);
    doc.setTextColor(30, 58, 138);
    doc.text('LearnX', 148.5, 45, { align: 'center' });

    // Decorative Line
    doc.setDrawColor(226, 232, 240);
    doc.line(100, 55, 197, 55);

    // Header
    doc.setFontSize(28);
    doc.setTextColor(37, 99, 235);
    doc.text('CERTIFICATE OF COMPLETION', 148.5, 75, { align: 'center' });

    // Body
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(16);
    doc.setTextColor(71, 85, 105);
    doc.text('This is to certify that', 148.5, 95, { align: 'center' });

    // User Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(36);
    doc.setTextColor(15, 23, 42);
    doc.text(currentUser?.name || 'Mastery Student', 148.5, 115, { align: 'center' });

    // Course Context
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(16);
    doc.setTextColor(71, 85, 105);
    doc.text('has successfully mastered the professional curriculum for', 148.5, 135, { align: 'center' });

    // Course Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(37, 99, 235);
    doc.text(course.title.toUpperCase(), 148.5, 150, { align: 'center' });

    // Footer Info
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(148, 163, 184);
    const completionDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    doc.text(`Completion Date: ${completionDate}`, 148.5, 175, { align: 'center' });
    doc.text(`Certificate ID: LX-${course.id}-${Date.now().toString().slice(-6)}`, 148.5, 182, { align: 'center' });

    // Digital Signature Representation
    doc.setDrawColor(203, 213, 225);
    doc.line(110, 165, 187, 165);

    doc.save(`LearnX_${course.title.replace(/\s+/g, '_')}_Certificate.pdf`);
  };

  return (
    <div className="pb-24 bg-white dark:bg-gray-950 min-h-screen relative">
      <div className="relative h-64 w-full">
        <img src={course.imageUrl} className="w-full h-full object-cover" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 to-transparent" />
        <button onClick={onBack} className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <span className="px-2 py-1 bg-blue-600/90 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider rounded mb-2 inline-block">
            {course.category}
          </span>
          <h1 className="text-2xl font-bold leading-tight mb-2">{course.title}</h1>
          <div className="flex items-center gap-4 text-sm font-medium text-gray-300">
             <span>{modules.length} Modules</span>
             <span>•</span>
             <span>{course.duration}</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-950 px-6 pt-6 pb-2">
         <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-bold text-gray-900 dark:text-white">Mastery Progress</span>
            <span className="text-xs font-semibold text-blue-600">{progress}%</span>
         </div>
         <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${progress}%` }} />
         </div>
      </div>

      <div className="p-6">
        {/* Certificate Card */}
        {isFinished && (
          <div className="mb-8 p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl text-white shadow-xl shadow-blue-500/20 animate-in zoom-in-95 duration-500">
             <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-