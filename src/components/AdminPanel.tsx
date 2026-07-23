import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, doc, getDocs, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Lesson, CarouselCard, Quiz } from '../types';
import { getLessonByDay, lessonsList } from '../data/lessons';
import { Illustration } from './Illustration';
import { uploadLessonImage } from '../lib/storageHelper';
import { 
  BookOpen, Users, Play, Trash2, ArrowLeft, Save, 
  Search, Phone, ShieldAlert, CheckCircle, Download, 
  FileEdit, Calendar, RefreshCw, Film, HelpCircle, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Resizes an uploaded image client-side, then hands back a Blob ready for Storage upload
// (instead of a base64 string destined for a Firestore document field).
const compressImageToBlob = (base64Str: string, maxWidth = 400, maxHeight = 400): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context unavailable'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Image compression failed'));
      }, 'image/png');
    };
    img.onerror = () => {
      reject(new Error('Failed to load image for compression'));
    };
  });
};

interface AdminPanelProps {
  onBack: () => void;
  customLessons: Record<number, Lesson>;
  onRefreshLessons: () => Promise<void>;
  onPreviewLesson: (dayNum: number) => void;
}

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber: string;
  lastActive?: string;
  currentDay?: number;
  completedDays?: number[];
  streakCount?: number;
}

interface SubmissionRecord {
  id: string;
  userId: string;
  userEmail: string;
  userPhone: string;
  userName: string;
  dayNumber: number;
  round: number;
  videoUrl: string; // Firebase Storage download URL
  videoText: string;
  submittedAt: string;
  isSimulated?: boolean;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  onBack, 
  customLessons,
  onRefreshLessons,
  onPreviewLesson
}) => {
  const [activeTab, setActiveTab] = useState<'lessons' | 'users' | 'challenges'>('lessons');
  
  // Lesson state
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [isSavingLesson, setIsSavingLesson] = useState(false);
  const [lessonSuccessMessage, setLessonSuccessMessage] = useState<string | null>(null);

  // Users state
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [editingUserUid, setEditingUserUid] = useState<string | null>(null);
  const [newPhoneNumber, setNewPhoneNumber] = useState('');

  // Submissions state
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

  // Initialize Lesson Form
  useEffect(() => {
    const lessonBase = customLessons[selectedDay] || getLessonByDay(selectedDay);
    // Deep copy to prevent mutating props/state directly
    setEditingLesson(JSON.parse(JSON.stringify(lessonBase)));
  }, [selectedDay, customLessons]);

  // Load Users from Firestore
  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const fetchedUsers: UserProfile[] = [];
      
      for (const userDoc of querySnapshot.docs) {
        const uid = userDoc.id;
        
        // Fetch nested settings/progress
        const progressSnap = await getDocs(collection(db, 'users', uid, 'settings'));
        let currentDay = 1;
        let completedDays: number[] = [];
        let streakCount = 0;
        
        progressSnap.forEach((doc) => {
          if (doc.id === 'progress') {
            const data = doc.data();
            currentDay = data.currentDay || 1;
            completedDays = data.completedDays || [];
            streakCount = data.streakCount || 0;
          }
        });

        // Use direct profile data if it exists or use document root
        const userData = userDoc.data();
        fetchedUsers.push({
          uid,
          email: userData.email || 'Anonymous Guest',
          displayName: userData.displayName || 'Creative Practitioner',
          phoneNumber: userData.phoneNumber || '',
          lastActive: userData.lastActive || '',
          currentDay,
          completedDays,
          streakCount
        });
      }
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Error loading users in admin panel:", error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Load Submissions from Firestore
  const loadSubmissions = async () => {
    setIsLoadingSubmissions(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'submissions'));
      const fetchedSubmissions: SubmissionRecord[] = [];
      querySnapshot.forEach((doc) => {
        fetchedSubmissions.push({
          id: doc.id,
          ...doc.data()
        } as SubmissionRecord);
      });
      // Sort newest first
      fetchedSubmissions.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      setSubmissions(fetchedSubmissions);
    } catch (error) {
      console.error("Error loading submissions in admin panel:", error);
    } finally {
      setIsLoadingSubmissions(false);
    }
  };

  // Run on tab switch
  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'challenges') {
      loadSubmissions();
    }
  }, [activeTab]);

  // Save Lesson Changes
  const handleSaveLesson = async () => {
    if (!editingLesson) return;
    setIsSavingLesson(true);
    setLessonSuccessMessage(null);
    try {
      const lessonRef = doc(db, 'lessons', selectedDay.toString());
      await setDoc(lessonRef, editingLesson);
      await onRefreshLessons();
      setLessonSuccessMessage(`Day ${selectedDay} curriculum published successfully!`);
      setTimeout(() => setLessonSuccessMessage(null), 4000);
    } catch (error: any) {
      console.error("Error saving lesson:", error);
      alert("Failed to save lesson. Check your database permissions: " + error?.message);
    } finally {
      setIsSavingLesson(false);
    }
  };

  // Edit User Phone Number
  const handleUpdatePhone = async (uid: string) => {
    try {
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, { phoneNumber: newPhoneNumber }, { merge: true });
      
      // Update local state
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, phoneNumber: newPhoneNumber } : u));
      setEditingUserUid(null);
      setNewPhoneNumber('');
    } catch (error) {
      console.error("Error updating user phone number:", error);
      alert("Failed to update user profile.");
    }
  };

  // Download Submission Video (fetched as a blob so cross-origin Storage URLs still force a download)
  const handleDownloadVideo = async (sub: SubmissionRecord) => {
    try {
      const response = await fetch(sub.videoUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `practice_day${sub.dayNumber}_round${sub.round}_${sub.userName.replace(/\s+/g, '_')}.webm`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Failed to trigger video download:", error);
      alert("Download failed. The clip data is not ready.");
    }
  };

  // Delete Submission (Review Done)
  const handleDeleteSubmission = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this recording submission? This action is irreversible.")) return;
    
    try {
      await deleteDoc(doc(db, 'submissions', id));
      setSubmissions(prev => prev.filter(s => s.id !== id));
      if (activeVideoUrl) {
        setActiveVideoUrl(null);
      }
    } catch (error) {
      console.error("Failed to delete video submission:", error);
      alert("Failed to delete submission.");
    }
  };

  // Filtered users for search query
  const filteredUsers = users.filter(u => 
    u.displayName.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    u.phoneNumber.includes(userSearchQuery)
  );

  return (
    <div className="flex flex-col min-h-full justify-between pb-8 px-5 py-6 bg-[#EFF5FE]" id="admin-panel-container">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6" id="admin-header">
          <div className="flex items-center gap-2">
            <button 
              onClick={onBack}
              className="p-1.5 rounded-full hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              title="Back to App"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <span className="text-[10px] font-mono tracking-wider text-[#2563EB] uppercase font-bold">BOARDROOM</span>
              <h1 className="text-2xl font-serif font-bold text-slate-900 leading-tight">Academy Console</h1>
            </div>
          </div>
          <div className="bg-red-50 text-red-700 text-[10px] font-mono font-bold px-2 py-1 rounded-md border border-red-200">
            ADMIN LEVEL
          </div>
        </div>

        {/* Console Tab Navigation */}
        <div className="flex bg-slate-200/60 p-1 rounded-xl mb-6 border border-slate-200" id="admin-tabs">
          <button
            onClick={() => setActiveTab('lessons')}
            className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'lessons' ? 'bg-[#0B1F3A] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen size={13} />
            <span>Lessons</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'users' ? 'bg-[#0B1F3A] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users size={13} />
            <span>Practitioners</span>
          </button>
          <button
            onClick={() => setActiveTab('challenges')}
            className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'challenges' ? 'bg-[#0B1F3A] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Film size={13} />
            <span>Videos</span>
          </button>
        </div>

        {/* Tab 1: LESSONS EDITOR */}
        {activeTab === 'lessons' && editingLesson && (
          <div className="space-y-4" id="admin-tab-lessons">
            {/* Day Selector */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">Select Curriculum Day</label>
              <div className="flex items-center gap-3">
                <select 
                  value={selectedDay} 
                  onChange={(e) => setSelectedDay(Number(e.target.value))}
                  className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm font-semibold text-slate-800 flex-1 focus:ring-1 focus:ring-[#2563EB] focus:outline-hidden"
                >
                  {Array.from({ length: 30 }, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>Day {day} {customLessons[day] ? '• (Edited)' : ''}</option>
                  ))}
                </select>
                <div className="text-xs font-mono text-slate-400">
                  {customLessons[selectedDay] ? 'Custom override active' : 'Default course active'}
                </div>
              </div>
            </div>

            {/* Success Notification */}
            <AnimatePresence>
              {lessonSuccessMessage && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 text-xs flex items-center gap-2"
                >
                  <CheckCircle size={14} className="text-emerald-600" />
                  <span>{lessonSuccessMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Fields Form */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                <FileEdit size={13} /> Focus Content
              </h3>

              <div>
                <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Lesson Title</label>
                <input 
                  type="text" 
                  value={editingLesson.title}
                  onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-sans focus:border-[#2563EB] focus:outline-hidden"
                  placeholder="e.g. The Artisan's Illusion"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Tagline</label>
                <input 
                  type="text" 
                  value={editingLesson.tagline}
                  onChange={(e) => setEditingLesson({ ...editingLesson, tagline: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:border-[#2563EB] focus:outline-hidden"
                  placeholder="e.g. Your craft is the engine..."
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">About Summary Text</label>
                <textarea 
                  value={editingLesson.aboutText}
                  onChange={(e) => setEditingLesson({ ...editingLesson, aboutText: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs h-20 focus:border-[#2563EB] focus:outline-hidden resize-none"
                  placeholder="Summarize the core focus of today's study..."
                />
              </div>

              {/* Carousel Slides Editing */}
              <div className="border-t border-slate-100 pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileEdit size={12} /> Carousel Slides ({editingLesson.carouselCards?.length || 0})
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      const newCard: CarouselCard = {
                        id: `card_${Date.now()}`,
                        illustrationType: 'seed',
                        title: 'New Slide Title',
                        text: 'Detailed description of this curriculum slide.'
                      };
                      setEditingLesson({
                        ...editingLesson,
                        carouselCards: [...(editingLesson.carouselCards || []), newCard]
                      });
                    }}
                    className="inline-flex items-center gap-1 bg-[#0B1F3A] hover:bg-[#2563EB] text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer shadow-sm"
                  >
                    <Plus size={10} /> Add Slide
                  </button>
                </div>

                <div className="space-y-3">
                  {(editingLesson.carouselCards || []).map((card, index) => (
                    <div key={card.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 relative space-y-3 hover:border-slate-300 transition-all">
                      <div className="flex items-center justify-between border-b border-slate-200/50 pb-2">
                        <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Slide #{index + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (editingLesson.carouselCards || []).filter(c => c.id !== card.id);
                            setEditingLesson({
                              ...editingLesson,
                              carouselCards: updated
                            });
                          }}
                          className="p-1 rounded-md text-red-500 hover:bg-red-50 transition-colors"
                          title="Delete Slide"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Left side: Image selection, upload and thumbnail */}
                        <div className="md:col-span-1 flex flex-col justify-between bg-white p-3 rounded-2xl border border-slate-200/80 space-y-3">
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-mono text-slate-400 uppercase block font-bold">Visual Asset</label>
                            
                            {/* Visual Asset Preview */}
                            <div className="w-20 h-20 flex items-center justify-center bg-slate-50 rounded-xl overflow-hidden shadow-sm p-1.5">
                              {card.customImageUrl ? (
                                <img 
                                  src={card.customImageUrl} 
                                  alt="Preview" 
                                  className="max-w-full max-h-full object-contain rounded-xl" 
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <Illustration type={card.illustrationType as any} size={70} />
                              )}
                            </div>

                            {/* Options depending on whether customized or default */}
                            <div className="space-y-1.5 pt-1">
                              {card.customImageUrl ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = (editingLesson.carouselCards || []).map(c => {
                                      if (c.id === card.id) {
                                        return { ...c, customImageUrl: undefined };
                                      }
                                      return c;
                                    });
                                    setEditingLesson({ ...editingLesson, carouselCards: updated });
                                  }}
                                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[9px] font-mono font-bold py-1.5 rounded-lg border border-slate-300 text-center transition-all cursor-pointer"
                                >
                                  Clear Uploaded Image
                                </button>
                              ) : (
                                <div className="space-y-2">
                                  <select
                                    value={card.illustrationType}
                                    onChange={(e) => {
                                      const updated = (editingLesson.carouselCards || []).map(c => {
                                        if (c.id === card.id) {
                                          return { ...c, illustrationType: e.target.value as any };
                                        }
                                        return c;
                                      });
                                      setEditingLesson({
                                        ...editingLesson,
                                        carouselCards: updated
                                      });
                                    }}
                                    className="bg-slate-50 border border-slate-200 rounded-lg p-1 text-[9px] font-mono text-slate-700 w-full focus:outline-hidden cursor-pointer"
                                  >
                                    <option value="baker">Baker</option>
                                    <option value="tailor">Tailor</option>
                                    <option value="seed">Seed</option>
                                    <option value="compass">Compass</option>
                                    <option value="hourglass">Hourglass</option>
                                    <option value="bridge">Bridge</option>
                                    <option value="mirror">Mirror</option>
                                    <option value="scale">Scale</option>
                                  </select>

                                  {/* Custom PNG Upload field */}
                                  <div className="relative">
                                    <input
                                      type="file"
                                      accept="image/*"
                                      id={`file-upload-${card.id}`}
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          const reader = new FileReader();
                                          reader.onloadend = async () => {
                                            try {
                                              const originalBase64 = reader.result as string;
                                              const compressedBlob = await compressImageToBlob(originalBase64, 400, 400);
                                              const imageUrl = await uploadLessonImage(selectedDay, card.id, compressedBlob);
                                              const updated = (editingLesson.carouselCards || []).map(c => {
                                                if (c.id === card.id) {
                                                  return { ...c, customImageUrl: imageUrl };
                                                }
                                                return c;
                                              });
                                              setEditingLesson({ ...editingLesson, carouselCards: updated });
                                            } catch (err) {
                                              console.error("Failed to upload slide image:", err);
                                              alert("Failed to upload image.");
                                            }
                                          };
                                          reader.readAsDataURL(file);
                                        }
                                      }}
                                    />
                                    <label
                                      htmlFor={`file-upload-${card.id}`}
                                      className="w-full bg-[#2563EB]/10 hover:bg-[#2563EB]/20 text-[#2563EB] text-[9px] font-mono font-bold py-1.5 rounded-lg border border-[#2563EB]/20 text-center block cursor-pointer transition-all"
                                    >
                                      Upload Own PNG
                                    </label>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Mid-right: Formatting, layout configuration, and toggles */}
                        <div className="md:col-span-1 bg-slate-100 p-3 rounded-2xl border border-slate-200 space-y-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-slate-500 uppercase block font-bold">Slide Layout</label>
                            <select
                              value={card.layoutFormat || 'top'}
                              onChange={(e) => {
                                const updated = (editingLesson.carouselCards || []).map(c => {
                                  if (c.id === card.id) {
                                    return { ...c, layoutFormat: e.target.value as any };
                                  }
                                  return c;
                                });
                                setEditingLesson({ ...editingLesson, carouselCards: updated });
                              }}
                              className="bg-white border border-slate-200 rounded-lg p-1.5 text-[10px] font-mono text-slate-700 w-full focus:outline-hidden cursor-pointer"
                            >
                              <option value="top">Picture on Top</option>
                              <option value="left-bottom">Left Bottom Layout</option>
                              <option value="right-bottom">Right Bottom Layout</option>
                            </select>
                          </div>

                          <div className="space-y-1.5 pt-1.5 border-t border-slate-200/60">
                            <label className="text-[9px] font-mono text-slate-400 uppercase block font-bold">Toggle Elements</label>
                            <div className="flex flex-col gap-1.5">
                              <label className="flex items-center gap-1.5 text-[10px] text-slate-600 font-semibold cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={card.showHeading !== false}
                                  onChange={(e) => {
                                    const updated = (editingLesson.carouselCards || []).map(c => {
                                      if (c.id === card.id) {
                                        return { ...c, showHeading: e.target.checked };
                                      }
                                      return c;
                                    });
                                    setEditingLesson({ ...editingLesson, carouselCards: updated });
                                  }}
                                  className="rounded text-[#2563EB] focus:ring-[#2563EB] h-3 w-3 border-slate-300"
                                />
                                <span>Show Heading</span>
                              </label>

                              <label className="flex items-center gap-1.5 text-[10px] text-slate-600 font-semibold cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={card.showPicture !== false}
                                  onChange={(e) => {
                                    const updated = (editingLesson.carouselCards || []).map(c => {
                                      if (c.id === card.id) {
                                        return { ...c, showPicture: e.target.checked };
                                      }
                                      return c;
                                    });
                                    setEditingLesson({ ...editingLesson, carouselCards: updated });
                                  }}
                                  className="rounded text-[#2563EB] focus:ring-[#2563EB] h-3 w-3 border-slate-300"
                                />
                                <span>Show Picture</span>
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Right side: Inputs */}
                        <div className="md:col-span-2 space-y-2.5">
                          <div>
                            <label className="text-[9px] font-mono text-slate-400 uppercase block mb-0.5 font-bold">Slide Title</label>
                            <input
                              type="text"
                              value={card.title}
                              onChange={(e) => {
                                const updated = (editingLesson.carouselCards || []).map(c => {
                                  if (c.id === card.id) {
                                    return { ...c, title: e.target.value };
                                  }
                                  return c;
                                });
                                setEditingLesson({
                                  ...editingLesson,
                                  carouselCards: updated
                                });
                              }}
                              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:border-[#2563EB] focus:outline-hidden text-slate-800 font-semibold"
                              placeholder="Slide Title"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-0.5">
                              <label className="text-[9px] font-mono text-slate-400 uppercase block font-bold">Slide Description</label>
                              <span className="text-[8px] font-mono text-slate-400 font-bold bg-slate-100 px-1 py-0.5 rounded">
                                Formatting: **bold** • *italic*
                              </span>
                            </div>
                            <textarea
                              value={card.text}
                              onChange={(e) => {
                                const updated = (editingLesson.carouselCards || []).map(c => {
                                  if (c.id === card.id) {
                                    return { ...c, text: e.target.value };
                                  }
                                  return c;
                                });
                                setEditingLesson({
                                  ...editingLesson,
                                  carouselCards: updated
                                });
                              }}
                              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs h-20 focus:border-[#2563EB] focus:outline-hidden text-slate-700 resize-none font-sans"
                              placeholder="Slide description/curriculum text... Use **your bold text** or *your italic text* to format formatting."
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {(editingLesson.carouselCards || []).length === 0 && (
                    <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                      No slides in this lesson. Click "Add Slide" above to build your presentation.
                    </div>
                  )}
                </div>
              </div>

              {/* Quiz Editing */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <h4 className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle size={12} /> Daily Active Recall Quiz
                </h4>
                <div>
                  <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Question</label>
                  <input 
                    type="text" 
                    value={editingLesson.quiz.question}
                    onChange={(e) => setEditingLesson({ 
                      ...editingLesson, 
                      quiz: { ...editingLesson.quiz, question: e.target.value } 
                    })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:border-[#2563EB] focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-500 uppercase block">Options</label>
                  {editingLesson.quiz.options.map((option, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input 
                        type="radio" 
                        name="correctIndex" 
                        checked={editingLesson.quiz.correctIndex === idx}
                        onChange={() => setEditingLesson({
                          ...editingLesson,
                          quiz: { ...editingLesson.quiz, correctIndex: idx }
                        })}
                      />
                      <input 
                        type="text" 
                        value={option}
                        onChange={(e) => {
                          const newOpts = [...editingLesson.quiz.options];
                          newOpts[idx] = e.target.value;
                          setEditingLesson({
                            ...editingLesson,
                            quiz: { ...editingLesson.quiz, options: newOpts }
                          });
                        }}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:border-[#2563EB] focus:outline-hidden"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Key Insight Explanation</label>
                  <textarea 
                    value={editingLesson.quiz.keyInsightText}
                    onChange={(e) => setEditingLesson({ 
                      ...editingLesson, 
                      quiz: { ...editingLesson.quiz, keyInsightText: e.target.value } 
                    })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs h-16 focus:border-[#2563EB] focus:outline-hidden resize-none"
                  />
                </div>
              </div>

              {/* Reflection Questions */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <h4 className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Journal Inquiries
                </h4>
                {editingLesson.reflectionQuestions.map((q, idx) => (
                  <div key={idx} className="space-y-1">
                    <label className="text-[9px] font-mono text-slate-500 block">Inquiry {idx + 1}</label>
                    <input 
                      type="text" 
                      value={q}
                      onChange={(e) => {
                        const newQs = [...editingLesson.reflectionQuestions];
                        newQs[idx] = e.target.value;
                        setEditingLesson({
                          ...editingLesson,
                          reflectionQuestions: newQs
                        });
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:border-[#2563EB] focus:outline-hidden"
                    />
                  </div>
                ))}
              </div>

              {/* Dual Action Triggers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onPreviewLesson(selectedDay)}
                  className="w-full bg-[#0B1F3A] hover:bg-slate-800 text-white font-mono font-bold text-xs py-3.5 rounded-2xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play size={13} className="fill-white" />
                  <span>Preview Lesson {selectedDay}</span>
                </button>

                <button
                  onClick={handleSaveLesson}
                  disabled={isSavingLesson}
                  className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-slate-300 text-white font-sans font-bold text-xs py-3.5 rounded-2xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                  id="publish-curriculum-btn"
                >
                  {isSavingLesson ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="animate-spin" size={13} /> Saving...
                    </span>
                  ) : (
                    <>
                      <Save size={13} />
                      <span>Publish Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: USERS DIRECTORY */}
        {activeTab === 'users' && (
          <div className="space-y-4" id="admin-tab-users">
            {/* Search Controls */}
            <div className="relative" id="user-search-wrapper">
              <Search className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Search by name, email or phone..."
                className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-sm focus:border-[#2563EB] focus:outline-hidden shadow-2xs"
              />
            </div>

            {isLoadingUsers ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <RefreshCw className="animate-spin mx-auto text-[#2563EB]" size={24} />
                <p className="text-xs font-mono">Syncing registered practitioners...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500">
                <Users className="mx-auto text-slate-300 mb-2" size={32} />
                <p className="text-sm font-semibold">No practitioners matched</p>
                <p className="text-xs mt-1 text-slate-400">Try modifying your search query.</p>
              </div>
            ) : (
              <div className="space-y-3" id="admin-users-list">
                {filteredUsers.map((p) => (
                  <div key={p.uid} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:border-[#2563EB]/30 transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-serif font-bold text-slate-900 text-sm leading-snug">
                          {p.displayName}
                        </h4>
                        <p className="text-[11px] font-mono text-slate-500 leading-normal">{p.email}</p>
                      </div>
                      
                      {/* Milestones badge */}
                      <div className="text-right">
                        <span className="text-[10px] font-mono bg-amber-50 text-amber-700 font-bold border border-amber-200 px-2 py-0.5 rounded-full">
                          Day {p.currentDay} • {p.streakCount}d Streak
                        </span>
                      </div>
                    </div>

                    {/* Progress details */}
                    <div className="mt-3 flex gap-4 text-[10px] font-mono text-slate-500 border-t border-slate-100 pt-2.5">
                      <div>Completed: <span className="text-slate-800 font-bold">{p.completedDays?.length || 0}/30</span></div>
                      {p.lastActive && (
                        <div>Active: <span className="text-slate-800">{new Date(p.lastActive).toLocaleDateString()}</span></div>
                      )}
                    </div>

                    {/* Phone Number row */}
                    <div className="mt-3 flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Phone size={12} className="text-slate-400" />
                        <span className="text-xs font-mono font-medium">
                          {p.phoneNumber ? p.phoneNumber : "No Phone registered"}
                        </span>
                      </div>

                      {editingUserUid === p.uid ? (
                        <div className="flex items-center gap-2 w-full max-w-[200px]" id="edit-phone-input-row">
                          <input
                            type="text"
                            value={newPhoneNumber}
                            onChange={(e) => setNewPhoneNumber(e.target.value)}
                            placeholder="Type Phone..."
                            className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-mono flex-1 focus:outline-hidden"
                            autoFocus
                          />
                          <button
                            onClick={() => handleUpdatePhone(p.uid)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2 py-1.5 rounded-md cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingUserUid(null)}
                            className="text-slate-400 hover:text-slate-600 text-xs px-1"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingUserUid(p.uid);
                            setNewPhoneNumber(p.phoneNumber);
                          }}
                          className="text-[#2563EB] hover:text-[#1D4ED8] text-[10px] font-semibold cursor-pointer py-1 px-2.5 hover:bg-slate-200/50 rounded-lg transition-all"
                        >
                          {p.phoneNumber ? 'Edit Phone' : '+ Add Phone'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: VIDEO CHALLENGE REVIEW */}
        {activeTab === 'challenges' && (
          <div className="space-y-4" id="admin-tab-challenges">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 text-xs text-slate-600 leading-relaxed flex items-start gap-2 shadow-sm">
              <ShieldAlert size={16} className="text-[#2563EB] shrink-0 mt-0.5" />
              <p>
                <strong>Challenge Compliance:</strong> Review daily speaking pitches submitted by practitioners. Play, evaluate, download, or delete documents when regulatory or academy feedback loops are finalized.
              </p>
            </div>

            {isLoadingSubmissions ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <RefreshCw className="animate-spin mx-auto text-[#2563EB]" size={24} />
                <p className="text-xs font-mono">Loading recordings repository...</p>
              </div>
            ) : submissions.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-slate-500">
                <Film className="mx-auto text-slate-300 mb-2" size={32} />
                <p className="text-sm font-semibold">No speaking challenges submitted</p>
                <p className="text-xs text-slate-400 mt-1 max-w-[240px] mx-auto">Practitioners must complete the spontaneity drill to broadcast their video challenges here.</p>
              </div>
            ) : (
              <div className="space-y-4" id="admin-submissions-list">
                {submissions.map((sub) => (
                  <div key={sub.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
                    {/* Submission Metadata Header */}
                    <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-[9px] font-mono text-[#2563EB] uppercase tracking-widest font-bold">Day {sub.dayNumber} Pitch Submission</span>
                        <h4 className="font-serif font-bold text-slate-900 text-base leading-tight mt-0.5">
                          {sub.userName}
                        </h4>
                        <div className="flex flex-col gap-0.5 mt-1 text-[10px] font-mono text-slate-400">
                          <div>Email: <span className="text-slate-600 font-medium">{sub.userEmail}</span></div>
                          {sub.userPhone && (
                            <div>Phone: <span className="text-slate-600 font-medium">{sub.userPhone}</span></div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-slate-400 block">
                          {new Date(sub.submittedAt).toLocaleDateString()}
                        </span>
                        <span className="text-[9px] font-mono bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full mt-1.5 inline-block font-semibold">
                          Round {sub.round} Speak
                        </span>
                      </div>
                    </div>

                    {/* Challenge content text */}
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs italic text-slate-600">
                      "{sub.videoText}"
                    </div>

                    {/* Inline Player or Trigger */}
                    {activeVideoUrl === sub.id ? (
                      <div className="bg-black rounded-2xl overflow-hidden aspect-video relative flex flex-col items-center justify-center border border-slate-800" id={`player-wrapper-${sub.id}`}>
                        <video
                          src={sub.videoUrl}
                          controls
                          autoPlay 
                          className="w-full h-full object-contain"
                        />
                        <button 
                          onClick={() => setActiveVideoUrl(null)}
                          className="absolute top-2 right-2 bg-slate-900/80 hover:bg-slate-950 text-white p-1 rounded-full text-xs"
                        >
                          ✕ Close
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setActiveVideoUrl(sub.id)}
                        className="w-full py-3 bg-slate-100 hover:bg-[#EFF5FE] rounded-2xl border border-slate-200 hover:border-[#2563EB] text-slate-800 font-sans font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                      >
                        <Play size={14} className="fill-[#2563EB] text-[#2563EB]" />
                        <span>Play Video Practice Recording</span>
                      </button>
                    )}

                    {/* Review Loop Controls */}
                    <div className="flex gap-3 justify-end pt-2 border-t border-slate-50">
                      <button
                        onClick={() => handleDownloadVideo(sub)}
                        className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-semibold py-2 px-3.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Download pitch file"
                      >
                        <Download size={14} />
                        <span>Download</span>
                      </button>

                      <button
                        onClick={() => handleDeleteSubmission(sub.id)}
                        className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold py-2 px-3.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Delete and complete review"
                      >
                        <Trash2 size={14} />
                        <span>Delete & Done</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="text-center mt-8 pt-4 border-t border-slate-200/50">
        <p className="text-[10px] font-mono text-slate-400">
          The Creative Academy Boardroom Console • High Integrity Control Panel
        </p>
      </div>
    </div>
  );
};
