import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  MapPin,
  Camera,
  Mic,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Upload,
  Globe
} from 'lucide-react';
import { api } from '../services/api';
import { Ward, Department } from '../types';

export const SubmitComplaintPage: React.FC = () => {
  const navigate = useNavigate();

  // Language state
  const [lang, setLang] = useState<'en' | 'kn' | 'hi'>('en');

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Water Supply');
  const [locality, setLocality] = useState('Koramangala 4th Block');
  const [wardId, setWardId] = useState<number>(1);
  const [latitude, setLatitude] = useState<number>(12.9352);
  const [longitude, setLongitude] = useState<number>(77.6245);
  const [citizenName, setCitizenName] = useState('Demo Citizen');
  const [citizenPhone, setCitizenPhone] = useState('9876543210');
  const [imageUrl, setImageUrl] = useState('');

  // Audio / Voice submission state
  const [isRecording, setIsRecording] = useState(false);
  const [audioTranscript, setAudioTranscript] = useState('');
  const [showVoiceBanner, setShowVoiceBanner] = useState(false);

  // Catalogs
  const [wards, setWards] = useState<Ward[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState<any>(null);

  // Live script detection
  const [detectedScript, setDetectedScript] = useState('en');

  useEffect(() => {
    // Load wards and departments
    api.getWards().then(setWards).catch(console.error);
    api.getDepartments().then(setDepartments).catch(console.error);
  }, []);

  // Detect script as user types
  useEffect(() => {
    if (!description) return;
    const knCount = (description.match(/[\u0C80-\u0CFF]/g) || []).length;
    const hiCount = (description.match(/[\u0900-\u097F]/g) || []).length;
    if (knCount > hiCount && knCount > 3) {
      setDetectedScript('kn');
    } else if (hiCount > knCount && hiCount > 3) {
      setDetectedScript('hi');
    } else {
      setDetectedScript('en');
    }
  }, [description]);

  // Multilingual translations for form UI
  const i18n = {
    en: {
      heading: 'Submit Citizen Complaint',
      subheading: 'Register your civic grievance for prompt municipal investigation and routing.',
      langLabel: 'Select Submission Language',
      titleLabel: 'Complaint Title',
      titlePlaceholder: 'Brief summary of the issue (e.g., No water supply on 2nd cross)',
      descLabel: 'Detailed Description',
      descPlaceholder: 'Explain the issue, exact street landmarks, and duration of the problem...',
      categoryLabel: 'Issue Category',
      localityLabel: 'Locality / Area',
      wardLabel: 'Municipal Ward',
      voiceLabel: 'Optional Voice Complaint (Speech-to-Text)',
      startVoice: 'Record Voice Grievance',
      stopVoice: 'Stop Recording & Transcribe',
      photoLabel: 'Supporting Evidence Photo (Optional)',
      photoPlaceholder: 'https://example.com/photo.jpg or upload below',
      submitBtn: 'Submit Grievance'
    },
    kn: {
      heading: 'ನಾಗರಿಕ ದೂರು ಸಲ್ಲಿಕೆ',
      subheading: 'ತ್ವರಿತ ಪಾಲಿಕೆ ತನಿಖೆ ಮತ್ತು ಪರಿಹಾರಕ್ಕಾಗಿ ನಿಮ್ಮ ದೂರನ್ನು ದಾಖಲಿಸಿ.',
      langLabel: 'ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
      titleLabel: 'ದೂರಿನ ಶೀರ್ಷಿಕೆ',
      titlePlaceholder: 'ಸಮಸ್ಯೆಯ ಸಂಕ್ಷಿಪ್ತ ವಿವರಣೆ (ಉದಾ: ೨ನೇ ಕ್ರಾಸ್‌ನಲ್ಲಿ ನೀರು ಬರುತ್ತಿಲ್ಲ)',
      descLabel: 'ವಿವರವಾದ ದೂರು',
      descPlaceholder: 'ಸಮಸ್ಯೆ, ರಸ್ತೆಯ ಹೆಗ್ಗುರುತುಗಳು ಮತ್ತು ಸಮಸ್ಯೆಯ ದಿನಗಳನ್ನು ವಿವರಿಸಿ...',
      categoryLabel: 'ಸಮಸ್ಯೆಯ ವರ್ಗ',
      localityLabel: 'ಪ್ರದೇಶ / ಬಡಾವಣೆ',
      wardLabel: 'ಪಾಲಿಕೆ ವಾರ್ಡ್',
      voiceLabel: 'ಧ್ವನಿ ದೂರು (ಸ್ಪೀಚ್-ಟು-ಟೆಕ್ಸ್ಟ್)',
      startVoice: 'ಧ್ವನಿ ರೆಕಾರ್ಡ್ ಮಾಡಿ',
      stopVoice: 'ರೆಕಾರ್ಡಿಂಗ್ ನಿಲ್ಲಿಸಿ ಮತ್ತು ಪಠ್ಯಕ್ಕೆ ಪರಿವರ್ತಿಸಿ',
      photoLabel: 'ದಾಖಲೆಯ ಫೋಟೋ (ಐಚ್ಛಿಕ)',
      photoPlaceholder: 'ಫೋಟೋ ಲಿಂಕ್ ಅಥವಾ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
      submitBtn: 'ದೂರು ಸಲ್ಲಿಸಿ'
    },
    hi: {
      heading: 'नागरिक शिकायत दर्ज करें',
      subheading: 'शीघ्र नगरपालिका जांच और समाधान के लिए अपनी समस्या दर्ज करें।',
      langLabel: 'भाषा चुनें',
      titleLabel: 'शिकायत का शीर्षक',
      titlePlaceholder: 'समस्या का संक्षिप्त विवरण (उदा: पानी की सप्लाई बंद है)',
      descLabel: 'विस्तृत विवरण',
      descPlaceholder: 'समस्या, सही पता और कितने दिनों से समस्या है यह बताएं...',
      categoryLabel: 'समस्या की श्रेणी',
      localityLabel: 'इलाका / मोहल्ला',
      wardLabel: 'नगरपालिका वार्ड',
      voiceLabel: 'वॉयस शिकायत (स्पीच-टू-टेक्स्ट)',
      startVoice: 'वॉयस रिकॉर्ड करें',
      stopVoice: 'रिकॉर्डिंग रोकें और ट्रांसक्राइब करें',
      photoLabel: 'साक्ष्य फोटो (वैकल्पिक)',
      photoPlaceholder: 'फोटो यूआरएल या अपलोड करें',
      submitBtn: 'शिकायत दर्ज करें'
    }
  };

  const currentI18n = i18n[lang];

  // Quick Demo Buttons for Hackathon Live Demo
  const loadDemoCase = (caseType: 'en_water' | 'kn_water' | 'hi_water' | 'pothole' | 'garbage') => {
    if (caseType === 'en_water') {
      setLang('en');
      setTitle('There is no proper water supply in our locality');
      setDescription('There is no proper water supply in our locality. Water is barely trickling for 15 minutes each morning.');
      setCategory('Water Supply');
      setLocality('Koramangala 4th Block');
    } else if (caseType === 'kn_water') {
      setLang('kn');
      setTitle('ನೀರು ಸರಿಯಾಗಿ ಬರುತ್ತಿಲ್ಲ');
      setDescription('ನಮ್ಮ ಪ್ರದೇಶದಲ್ಲಿ ನೀರು ಸರಿಯಾಗಿ ಬರುತ್ತಿಲ್ಲ. ಮೂರು ದಿನಗಳಿಂದ ನಲ್ಲಿಗಳಲ್ಲಿ ನೀರು ಬರುತ್ತಿಲ್ಲ, ದಯವಿಟ್ಟು ಗಮನಿಸಿ.');
      setCategory('Water Supply');
      setLocality('Koramangala 4th Block');
    } else if (caseType === 'hi_water') {
      setLang('hi');
      setTitle('पानी की सप्लाई नहीं हो रही है');
      setDescription('हमारे इलाके में पानी की सप्लाई नहीं हो रही है। सुबह केवल 10 मिनट पानी आता है, प्रेशर बिल्कुल नहीं है।');
      setCategory('Water Supply');
      setLocality('Koramangala 4th Block');
    } else if (caseType === 'pothole') {
      setLang('en');
      setTitle('There is a large pothole near the main road');
      setDescription('There is a large pothole near the main road junction causing heavy traffic risk and accidents.');
      setCategory('Roads');
      setLocality('100 Feet Road, Indiranagar');
    } else if (caseType === 'garbage') {
      setLang('en');
      setTitle('Garbage has not been collected for several days');
      setDescription('Garbage has not been collected for several days near the market. Stench is unbearable.');
      setCategory('Waste Management');
      setLocality('Jayanagar 4th Block Market');
    }
  };

  // Web Speech API for Real Speech-to-Text
  const [speechSupported, setSpeechSupported] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string>('');
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
    } else {
      setSpeechSupported(false);
    }
  }, []);

  const handleVoiceRecord = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setSpeechError("Browser speech recognition is not supported in this browser. Please use text entry.");
      return;
    }

    if (isRecording) {
      if (recognitionInstance) {
        recognitionInstance.stop();
      }
      setIsRecording(false);
      return;
    }

    try {
      setSpeechError('');
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      // Set language according to citizen's chosen language
      if (lang === 'kn') {
        recognition.lang = 'kn-IN';
      } else if (lang === 'hi') {
        recognition.lang = 'hi-IN';
      } else {
        recognition.lang = 'en-IN';
      }

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setAudioTranscript(transcript);
          setDescription(transcript);
          if (!title) {
            setTitle(transcript.slice(0, 50));
          }
        }
        setIsRecording(false);
      };

      recognition.onerror = (event: any) => {
        setIsRecording(false);
        if (event.error === 'not-allowed') {
          setSpeechError("Microphone permission was denied. Please allow microphone access or enter grievance as text.");
        } else if (event.error === 'no-speech') {
          setSpeechError("No speech detected. Please speak clearly into your microphone.");
        } else {
          setSpeechError(`Voice transcription unavailable (${event.error}). Please submit as text.`);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      setRecognitionInstance(recognition);
      recognition.start();
    } catch (err: any) {
      setIsRecording(false);
      setSpeechError("Speech-to-text service is unavailable. Please enter grievance as text.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert("Please provide a complaint description");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.createComplaint({
        title: title || description.slice(0, 60),
        description,
        original_language: lang,
        category,
        locality,
        ward_id: wardId || undefined,
        latitude,
        longitude,
        citizen_name: citizenName,
        citizen_phone: citizenPhone,
        audio_transcript: audioTranscript || undefined,
        image_url: imageUrl || undefined
      });
      setSubmittedComplaint(res);
    } catch (err: any) {
      alert("Submission error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] py-10 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Breadcrumb */}
        <div>
          <span className="text-xs font-bold uppercase text-govblue tracking-wider bg-[#EAF2FA] px-2.5 py-1 rounded">
            Citizen Grievance Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            {currentI18n.heading}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            {currentI18n.subheading}
          </p>
        </div>

        {/* Quick Demo Pre-fill Toolbar (Essential for Hackathon Workflow Demo) */}
        <div className="bg-white p-3.5 rounded-lg border border-[#CBD5E1] shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Sparkles className="w-3.5 h-3.5 text-govblue" />
            <span>Hackathon Live Demo — One-Click Multilingual Test Prompts:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => loadDemoCase('en_water')}
              className="text-xs font-medium px-2.5 py-1 bg-[#EAF2FA] hover:bg-[#D7E8F7] text-govblue rounded border border-[#C2DBF2] transition-colors"
            >
              Step 1: English Water ("There is no proper water supply...")
            </button>
            <button
              type="button"
              onClick={() => loadDemoCase('kn_water')}
              className="text-xs font-medium px-2.5 py-1 bg-[#EEF8F6] hover:bg-[#DDF3EF] text-govteal rounded border border-[#AEE4DB] transition-colors"
            >
              Step 2: ಕನ್ನಡ Water ("ನಮ್ಮ ಪ್ರದೇಶದಲ್ಲಿ ನೀರು...")
            </button>
            <button
              type="button"
              onClick={() => loadDemoCase('hi_water')}
              className="text-xs font-medium px-2.5 py-1 bg-[#FFF4D6] hover:bg-[#FFE8A3] text-amber-800 rounded border border-[#FFE299] transition-colors"
            >
              Step 3: हिन्दी Water ("हमारे इलाके में पानी...")
            </button>
            <button
              type="button"
              onClick={() => loadDemoCase('pothole')}
              className="text-xs font-medium px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-300 transition-colors"
            >
              Road Pothole
            </button>
          </div>
        </div>

        {/* Main Complaint Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#CBD5E1] shadow-gov p-6 sm:p-8 space-y-6">
          
          {/* Language Selection */}
          <div className="pb-5 border-b border-[#F1F5F9]">
            <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center gap-2">
              <Globe className="w-4 h-4 text-govblue" />
              <span>{currentI18n.langLabel}</span>
            </label>
            <div className="grid grid-cols-3 gap-3 max-w-md">
              {[
                { code: 'en', label: 'English', sub: 'English' },
                { code: 'kn', label: 'ಕನ್ನಡ', sub: 'Kannada' },
                { code: 'hi', label: 'हिन्दी', sub: 'Hindi' }
              ].map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setLang(item.code as any)}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    lang === item.code
                      ? 'border-govblue bg-[#EAF2FA] text-govblue font-bold shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <p className="text-sm font-bold leading-tight">{item.label}</p>
                  <p className="text-[10px] text-slate-500">{item.sub}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              {currentI18n.titleLabel} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={currentI18n.titlePlaceholder}
              className="w-full text-xs sm:text-sm p-3 bg-white border border-[#CBD5E1] rounded-md focus:ring-1 focus:ring-govblue focus:border-govblue focus:outline-none"
              required
            />
          </div>

          {/* Description & Live Script Indicator */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800">
                {currentI18n.descLabel} <span className="text-rose-500">*</span>
              </label>
              {description && (
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-[#F1F5F9] text-slate-600 border border-slate-200">
                  Detected Script: {detectedScript.toUpperCase()}
                </span>
              )}
            </div>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={currentI18n.descPlaceholder}
              className="w-full text-xs sm:text-sm p-3 bg-white border border-[#CBD5E1] rounded-md focus:ring-1 focus:ring-govblue focus:border-govblue focus:outline-none leading-relaxed"
              required
            />
          </div>

          {/* Voice Input Section */}
          <div className="p-4 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-govblue" />
                <span className="text-xs font-bold text-slate-800">{currentI18n.voiceLabel}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                Multilingual Speech Engine
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleVoiceRecord}
                className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-semibold transition-colors ${
                  isRecording
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-white text-slate-700 border border-[#CBD5E1] hover:bg-slate-50'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>{isRecording ? currentI18n.stopVoice : currentI18n.startVoice}</span>
              </button>

              {audioTranscript && (
                <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                  ✓ Speech Transcribed Successfully
                </span>
              )}
            </div>

            {audioTranscript && (
              <div className="text-xs bg-white p-2.5 rounded border border-slate-200 text-slate-700">
                <strong>Transcript Preview:</strong> "{audioTranscript}"
              </div>
            )}
          </div>

          {/* Category & Locality */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                {currentI18n.categoryLabel} <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs sm:text-sm p-2.5 bg-white border border-[#CBD5E1] rounded-md focus:ring-1 focus:ring-govblue focus:outline-none"
              >
                <option value="Water Supply">Water Supply & Sewerage</option>
                <option value="Roads">Roads & Footpaths</option>
                <option value="Electricity">Electricity & Street Lighting</option>
                <option value="Waste Management">Solid Waste Management</option>
                <option value="Drainage">Stormwater Drainage</option>
                <option value="Public Safety">Public Pedestrian Safety</option>
                <option value="Other">Other Civic Grievance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                {currentI18n.localityLabel} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                placeholder="e.g. Koramangala 4th Block"
                className="w-full text-xs sm:text-sm p-2.5 bg-white border border-[#CBD5E1] rounded-md focus:ring-1 focus:ring-govblue focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Ward Selection & Map Coordinates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                {currentI18n.wardLabel}
              </label>
              <select
                value={wardId}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  setWardId(id);
                  const w = wards.find((item) => item.id === id);
                  if (w) {
                    setLatitude(w.center_lat);
                    setLongitude(w.center_lng);
                  }
                }}
                className="w-full text-xs sm:text-sm p-2.5 bg-white border border-[#CBD5E1] rounded-md focus:ring-1 focus:ring-govblue focus:outline-none"
              >
                {wards.map((w) => (
                  <option key={w.id} value={w.id}>
                    Ward {w.ward_number}: {w.name} ({w.zone})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                GPS Coordinates (Demo Tagged)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`}
                  className="w-full text-xs p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded text-slate-600 font-mono"
                />
                <button
                  type="button"
                  onClick={() => alert("Pin set to current municipal center: " + latitude + ", " + longitude)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-semibold rounded border border-slate-300 shrink-0"
                >
                  <MapPin className="w-3.5 h-3.5 text-govblue" />
                </button>
              </div>
            </div>
          </div>

          {/* Citizen Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#F1F5F9]">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Citizen Name (Optional)
              </label>
              <input
                type="text"
                value={citizenName}
                onChange={(e) => setCitizenName(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-[#CBD5E1] rounded"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mobile Number for SMS Tracking Updates
              </label>
              <input
                type="tel"
                value={citizenPhone}
                onChange={(e) => setCitizenPhone(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-[#CBD5E1] rounded font-mono"
              />
            </div>
          </div>

          {/* Photo URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-slate-500" />
              <span>{currentI18n.photoLabel}</span>
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-... (sample photo link)"
              className="w-full text-xs p-2.5 bg-white border border-[#CBD5E1] rounded"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-4 flex items-center justify-between border-t border-[#E2E8F0]">
            <p className="text-[11px] text-slate-500">
              * Grievance records are stored securely in municipal PostgreSQL database.
            </p>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-[#315B8A] hover:bg-[#25476D] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-md transition-all shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Processing AI...' : currentI18n.submitBtn}</span>
            </button>
          </div>
        </form>

        {/* Successful Submission Modal Receipt */}
        {submittedComplaint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <div className="bg-white rounded-xl shadow-2xl border-2 border-govblue w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="bg-[#315B8A] text-white p-5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-6 h-6 text-emerald-300" />
                  <div>
                    <h3 className="font-bold text-base leading-tight">Complaint Successfully Submitted</h3>
                    <p className="text-xs text-blue-100 mt-0.5">Jan Setu Official Grievance Acknowledgement</p>
                  </div>
                </div>
              </div>

              {/* Receipt Body */}
              <div className="p-6 space-y-4">
                <div className="p-4 bg-[#EAF2FA] rounded-lg border border-[#C2DBF2] text-center space-y-1">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Your Grievance Tracking ID</p>
                  <p className="text-2xl font-black text-govblue font-mono tracking-tight">
                    {submittedComplaint.complaint_code}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Keep this ID to monitor field inspection and resolution status.
                  </p>
                </div>

                <div className="space-y-2 text-xs border-y border-[#F1F5F9] py-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Registered Category:</span>
                    <strong className="text-slate-800">{submittedComplaint.category}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Locality & Ward:</span>
                    <strong className="text-slate-800">{submittedComplaint.locality}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Recommended Department:</span>
                    <strong className="text-govblue">{submittedComplaint.recommended_department_name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">AI Routing Engine:</span>
                    <span className="text-emerald-700 font-mono font-medium">{submittedComplaint.ai_processing_mode}</span>
                  </div>
                </div>

                {submittedComplaint.related_complaints && submittedComplaint.related_complaints.length > 0 && (
                  <div className="p-3 bg-[#EEF8F6] rounded border border-[#AEE4DB] text-xs text-govteal space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Cross-Lingual Incident Fusion:</span>
                    </p>
                    <p className="text-[11px] text-slate-700">
                      Identified {submittedComplaint.related_complaints.length} semantically matching complaints in your area. Connected to incident <strong>{submittedComplaint.incident_code || 'INC-2026'}</strong>.
                    </p>
                  </div>
                )}

                {/* Buttons */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    onClick={() => {
                      setSubmittedComplaint(null);
                      navigate(`/track?id=${submittedComplaint.complaint_code}`);
                    }}
                    className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-govblue hover:bg-govblue-hover text-white rounded transition-colors"
                  >
                    <span>Track Status Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setSubmittedComplaint(null);
                      setTitle('');
                      setDescription('');
                    }}
                    className="text-xs font-medium px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

