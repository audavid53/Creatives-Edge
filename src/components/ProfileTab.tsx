import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { UserProgress } from '../types';
import {
  Phone, Clock, Calendar, LogOut, Sparkles, Check, Pencil, Award,
} from 'lucide-react';

interface ProfileTabProps {
  user: User | null;
  progress: UserProgress;
  displayName: string;
  userProfilePic?: string;
  userPhoneNumber: string;
  isAdmin: boolean;
  onUpdatePhoneNumber: (phone: string) => void;
  onUpdatePledgeTime: (time: string) => void;
  onViewHistory: () => void;
  onOpenAdmin: () => void;
  onLogout: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  user,
  progress,
  displayName,
  userProfilePic,
  userPhoneNumber,
  isAdmin,
  onUpdatePhoneNumber,
  onUpdatePledgeTime,
  onViewHistory,
  onOpenAdmin,
  onLogout,
}) => {
  const [editingTime, setEditingTime] = useState(false);
  const [timeDraft, setTimeDraft] = useState(progress.pledgeTime || '08:00');

  const pct = Math.round((progress.completedDays.length / 30) * 100);

  return (
    <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-8" id="profile-tab">
      <h1 className="text-3xl sm:text-4xl font-serif font-extrabold text-[#0B1F3A] tracking-tight mb-7">
        Your profile
      </h1>

      {/* Account card */}
      <div className="bg-white border border-[#D6E4FA] rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          {userProfilePic ? (
            <div className="w-14 h-14 rounded-full overflow-hidden border border-[#2563EB]/30 bg-slate-50 flex items-center justify-center p-0.5 shrink-0">
              <img src={userProfilePic} alt="Profile" className="max-w-full max-h-full object-contain rounded-full" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-full bg-[#EFF5FE] border border-[#D6E4FA] flex items-center justify-center font-serif font-extrabold text-[#2563EB] text-xl shrink-0">
              {displayName.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <h2 className="text-lg font-serif font-bold text-[#0B1F3A] truncate leading-tight">{displayName}</h2>
            <p className="text-xs text-slate-500 truncate">{user?.email || 'Guest session'}</p>
          </div>
        </div>

        <div className="mt-5 pt-5 border-t border-[#D6E4FA]/60 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Phone size={15} className="text-[#2563EB] shrink-0" />
            <span className="text-sm text-slate-700 font-semibold truncate">
              {userPhoneNumber || 'No phone registered'}
            </span>
          </div>
          <button
            onClick={() => {
              const phone = prompt('Enter your phone number to coordinate updates:', userPhoneNumber || '');
              if (phone !== null) onUpdatePhoneNumber(phone.trim());
            }}
            className="text-xs text-[#2563EB] hover:text-[#1D4ED8] font-bold cursor-pointer shrink-0 ml-2"
          >
            {userPhoneNumber ? 'Change' : 'Add'}
          </button>
        </div>
      </div>

      {/* Pledge card */}
      <div className="bg-white border border-[#D6E4FA] rounded-3xl p-6 shadow-sm mt-5">
        <span className="text-[9px] font-mono font-bold text-[#EAB308] uppercase tracking-[0.18em] inline-flex items-center gap-1.5">
          <Clock size={12} /> Daily commitment pledge
        </span>
        {!editingTime ? (
          <div className="flex items-center justify-between mt-3">
            <p className="text-3xl font-serif font-extrabold text-[#0B1F3A]">
              {progress.pledgeTime || 'Not set'}
            </p>
            <button
              onClick={() => { setTimeDraft(progress.pledgeTime || '08:00'); setEditingTime(true); }}
              className="text-xs text-[#2563EB] hover:text-[#1D4ED8] font-bold cursor-pointer inline-flex items-center gap-1"
            >
              <Pencil size={12} /> {progress.pledgeTime ? 'Change' : 'Set time'}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 mt-3">
            <input
              type="time"
              value={timeDraft}
              onChange={(e) => setTimeDraft(e.target.value)}
              className="text-2xl font-serif font-extrabold text-[#0B1F3A] bg-[#EFF5FE] border border-[#D6E4FA] rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 cursor-pointer"
            />
            <button
              onClick={() => { onUpdatePledgeTime(timeDraft); setEditingTime(false); }}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white p-2.5 rounded-xl cursor-pointer transition-colors"
              title="Save"
            >
              <Check size={16} />
            </button>
          </div>
        )}
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          The time you pledged to show up daily for the journey.
        </p>
      </div>

      {/* Progress card */}
      <div className="bg-white border border-[#D6E4FA] rounded-3xl p-6 shadow-sm mt-5">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold inline-flex items-center gap-1.5">
            <Award size={12} className="text-[#2563EB]" /> Course progress
          </span>
          <span className="text-xs font-mono text-[#2563EB] font-extrabold">
            {progress.completedDays.length} / 30 Days
          </span>
        </div>
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div className="bg-gradient-to-r from-[#2563EB] to-[#FACC15] h-full transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
        <button
          onClick={onViewHistory}
          className="w-full mt-4 text-center text-xs font-bold text-[#2563EB] hover:text-white hover:bg-[#2563EB] border border-[#D6E4FA] flex items-center justify-center gap-1.5 py-2.5 rounded-xl cursor-pointer transition-colors uppercase tracking-wider"
        >
          <Calendar size={13} /> Curriculum archive
        </button>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        {isAdmin && (
          <button
            onClick={onOpenAdmin}
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#0B1F3A] hover:bg-[#2563EB] text-white text-xs font-mono font-bold px-4 py-3 rounded-2xl transition-all cursor-pointer uppercase tracking-wider"
          >
            <Sparkles size={13} className="text-[#FACC15]" /> Boardroom Console
          </button>
        )}
        <button
          onClick={onLogout}
          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-slate-600 hover:text-[#2563EB] border border-[#D6E4FA] text-xs font-bold px-4 py-3 rounded-2xl transition-all cursor-pointer uppercase tracking-wider"
        >
          <LogOut size={14} /> Log out
        </button>
      </div>
    </div>
  );
};
