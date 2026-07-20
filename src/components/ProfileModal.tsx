import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Camera, Phone, User, Check, RefreshCw, Upload } from 'lucide-react';

interface ProfileModalProps {
  initialName: string;
  initialPhone: string;
  onSave: (name: string, phone: string, profilePic: string) => Promise<void>;
}

const compressProfileImage = (base64Str: string, maxWidth = 250, maxHeight = 250): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions while preserving aspect ratio
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
        resolve(base64Str);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.85)); // compress as JPEG with 85% quality
    };
    img.onerror = () => {
      resolve(base64Str);
    };
  });
};

export const ProfileModal: React.FC<ProfileModalProps> = ({
  initialName,
  initialPhone,
  onSave
}) => {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [profilePic, setProfilePic] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select or drop an image file (PNG, JPG, JPEG).');
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = async (e) => {
      if (e.target?.result && typeof e.target.result === 'string') {
        try {
          const compressed = await compressProfileImage(e.target.result);
          setProfilePic(compressed);
        } catch (err) {
          setProfilePic(e.target.result); // Fallback
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!phone.trim()) {
      setError('Please enter your phone number.');
      return;
    }
    // Simple phone verification/cleaning
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 7) {
      setError('Please enter a valid phone number (at least 7 digits).');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSave(name.trim(), phone.trim(), profilePic);
    } catch (err: any) {
      setError(err?.message || 'Failed to update profile. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#1C1917]/85 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#FAF6F0] w-full max-w-md rounded-3xl p-6 border border-[#EBE3D5] shadow-2xl relative"
      >
        <div className="text-center mb-6">
          <span className="text-[10px] font-mono tracking-widest text-[#C85A32] uppercase font-bold">REGISTRATION REQUIRED</span>
          <h2 className="text-2xl font-serif font-bold text-stone-900 mt-1">Complete Your Profile</h2>
          <p className="text-xs text-stone-500 mt-2 max-w-xs mx-auto">
            Welcome to the Creative Edge. Please finalize your details before initiating your customized curriculum.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-150 text-red-700 text-xs rounded-xl p-3 mb-5 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Profile Picture Upload (Optional) */}
          <div className="flex flex-col items-center gap-3">
            <label className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider">
              Profile Picture (Optional)
            </label>
            <div className="relative group">
              {profilePic ? (
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#C85A32] bg-stone-50 relative flex items-center justify-center p-1">
                  <img src={profilePic} alt="Profile Preview" className="max-w-full max-h-full object-contain rounded-full" />
                  <button
                    type="button"
                    onClick={() => setProfilePic('')}
                    className="absolute inset-0 bg-stone-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] font-mono font-bold"
                  >
                    REMOVE
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`w-24 h-24 rounded-full border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                    dragOver
                      ? 'border-[#C85A32] bg-[#C85A32]/5 scale-102'
                      : 'border-stone-300 hover:border-[#C85A32]/50 hover:bg-stone-100/50'
                  }`}
                  onClick={() => document.getElementById('profile-file-input')?.click()}
                >
                  <Camera size={20} className="text-stone-400 group-hover:text-[#C85A32] transition-colors" />
                  <span className="text-[9px] font-mono font-bold text-stone-400 mt-1 uppercase">UPLOAD</span>
                </div>
              )}
            </div>

            <input
              id="profile-file-input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Custom Drag & Drop Prompt under picture if empty */}
            {!profilePic && (
              <p className="text-[10px] font-mono text-stone-400">
                Drag & drop or click to upload
              </p>
            )}
          </div>

          {/* Full Name Input */}
          <div className="space-y-1.5">
            <label htmlFor="pname" className="text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
              <User size={12} className="text-[#C85A32]" />
              <span>Full Name</span>
            </label>
            <input
              id="pname"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Clara Oswald"
              className="w-full bg-white border border-stone-200 rounded-xl p-3 text-sm focus:border-[#C85A32] focus:ring-1 focus:ring-[#C85A32]/20 focus:outline-hidden text-stone-800"
            />
          </div>

          {/* Phone Number Input */}
          <div className="space-y-1.5">
            <label htmlFor="pphone" className="text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
              <Phone size={12} className="text-[#C85A32]" />
              <span>Phone Number</span>
            </label>
            <input
              id="pphone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. (555) 019-2834"
              className="w-full bg-white border border-stone-200 rounded-xl p-3 text-sm focus:border-[#C85A32] focus:ring-1 focus:ring-[#C85A32]/20 focus:outline-hidden text-stone-800 font-mono"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-6 bg-[#C85A32] hover:bg-[#b04a25] disabled:bg-stone-300 text-white font-sans font-semibold py-3.5 rounded-2xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="animate-spin" size={16} />
                <span>Initializing Portal...</span>
              </>
            ) : (
              <>
                <Check size={16} />
                <span>Authorize & Enter Academy</span>
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
