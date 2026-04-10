import api from '@/configs/axios';
import { authClient } from '@/lib/auth-client';
import { Loader2Icon, Globe, ImageIcon, SparklesIcon, ArrowRightIcon, CodeIcon, ZapIcon, Figma, Square, Camera, ShoppingCart, MessageSquare, Zap, Eye, Smartphone, Lock, Cpu, GitBranch, Users, Palette, ChevronDown } from 'lucide-react';
import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const MODELS = [
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', icon: '🧠', badge: 'Reasoning', description: 'Best for logic & code.' },
  { id: 'openai/gpt-oss-120b', name: 'GPT-OSS 120B', icon: '⚡', badge: 'Power', description: 'Highest parameter count.' },
  { id: 'qwen/qwen3-32b', name: 'Qwen 3 32B', icon: '🎨', badge: 'Frontend', description: 'Great for CSS & UI.' },
  { id: 'moonshotai/kimi-k2-instruct-0905', name: 'Kimi K2', icon: '📥', badge: '262k Ctx', description: 'Massive context window.' },
  { id: 'meta-llama/llama-4-scout-17b-16e-instruct', name: 'Llama 4 Scout', icon: '🎯', badge: 'Precision', description: 'Accurate instructions.' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', icon: '🚀', badge: 'Fastest', description: 'Speed & Reliability.' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', icon: '🤖', badge: 'Backup', description: 'Stable performance.' },
];

const Home = () => {
  const { data: session } = authClient.useSession();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeCard, setActiveCard] = useState<'website' | 'thumbnail' | null>(null);
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentProjectIdRef = useRef<string | null>(null);
  const navigate = useNavigate();

  const onSubmitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!session?.user) {
        return toast.error('Please sign in to create a Project');
      }
      else if (!input.trim()) {
        return toast.error('Please describe your website');
      }
      
      setLoading(true);
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const { data } = await api.post('/api/user/project', 
        { 
          initial_prompt: input,
          model: selectedModel 
        },
        { signal: controller.signal }
      );
      
      currentProjectIdRef.current = data.projectId;
      
      setLoading(false);
      abortControllerRef.current = null;
      toast.success('Project created! Generating website...');
      navigate(`/project/${data.projectId}`);
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.name === 'AbortError') {
        console.log('Generation cancelled by user');
        return;
      }
      setLoading(false);
      abortControllerRef.current = null;
      toast.error(error?.response?.data?.message || error.message);
      console.log(error);
    }
  };

  const cancelGeneration = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    if (currentProjectIdRef.current) {
      try {
        await api.post(`/api/user/project/cancel/${currentProjectIdRef.current}`);
      } catch (err) {
        console.error('Failed to cancel on server:', err);
      }
    }

    setLoading(false);
    abortControllerRef.current = null;
    currentProjectIdRef.current = null;
    toast.info('Generation cancelled');
  };

  const handleThumbnailClick = () => {
    if (!session?.user) {
      return toast.error('Please sign in to generate thumbnails');
    }
    navigate('/thumbnail');
  };

  return (
    <section className="flex flex-col items-center min-h-screen pb-24 px-4 text-white">

      {/* Hero Text */}
      <div className="text-center mt-20 mb-14">
        <div className="inline-flex items-center gap-2 bg-white/8 border border-white/12 rounded-full px-4 py-1.5 text-sm text-emerald-300 mb-6">
          <SparklesIcon className="size-3.5" />
          <span>Powered by AI — Build anything instantly</span>
        </div>
        <h1 className="text-[40px] leading-[48px] md:text-6xl md:leading-[72px] font-bold max-w-3xl mx-auto">
          Create with{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
            AI magic
          </span>
          , in seconds
        </h1>
        <p className="text-gray-400 text-base max-w-lg mx-auto mt-4 leading-relaxed">
          Choose what you want to build — full websites from a prompt, or stunning YouTube thumbnails.
        </p>
      </div>

      {/* Cards Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">

        {/* ─── Website Card ─── */}
        <div
          className={`group relative rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden
            ${activeCard === 'website'
              ? 'shadow-[0_0_40px_rgba(16,185,129,0.25)] border border-emerald-500/60'
              : 'border border-white/10 hover:border-emerald-500/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]'
            } glass-card`}
          onClick={() => setActiveCard(activeCard === 'website' ? null : 'website')}
        >
          {/* Top shimmer line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />

          <div className="relative p-7">
            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center mb-5 shadow-lg shadow-emerald-900/40 group-hover:scale-110 transition-transform duration-300">
              <Globe className="size-6 text-white" />
            </div>

            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-xl font-bold text-white">Create Website</h2>
                <p className="text-gray-400 text-sm mt-1 leading-relaxed">
                  Describe your vision and get a fully functional website generated in seconds.
                </p>
              </div>
              <ArrowRightIcon
                className={`size-5 text-emerald-400 mt-1 transition-transform duration-300 flex-shrink-0 ml-3
                  ${activeCard === 'website' ? 'rotate-90 text-emerald-300' : 'group-hover:translate-x-1'}`}
              />
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 mb-5">
              {['HTML + CSS + JS', 'Responsive', 'Instant Preview'].map(tag => (
                <span key={tag} className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>

            {/* Expanded Form */}
            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${activeCard === 'website' ? 'max-h-72 opacity-100' : 'max-h-0 opacity-0'}`}
              onClick={e => e.stopPropagation()}
            >
              <form onSubmit={onSubmitHandler} className="mt-2 space-y-3">
                <div className="relative">
                  <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    rows={4}
                    placeholder="e.g., A landing page for a coffee shop with a menu section, hero image, and contact form..."
                    className="w-full bg-black/30 border border-white/10 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder:text-gray-500 outline-none resize-none transition-all"
                  />
                </div>
                {/* Model Selection Dropdown */}
                <div className="space-y-2 mb-4">
                  <label className="text-[10px] font-bold text-emerald-400/70 uppercase tracking-[0.2em] ml-1">AI Engine</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-black/40 border border-white/10 hover:border-emerald-500/40 transition-all duration-300 group selection-none"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{MODELS.find(m => m.id === selectedModel)?.icon}</span>
                        <div className="text-left">
                          <div className="text-sm font-semibold text-white flex items-center gap-2">
                             {MODELS.find(m => m.id === selectedModel)?.name}
                             <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 uppercase tracking-tighter">
                               {MODELS.find(m => m.id === selectedModel)?.badge}
                             </span>
                          </div>
                          <p className="text-[10px] text-gray-500 line-clamp-1">{MODELS.find(m => m.id === selectedModel)?.description}</p>
                        </div>
                      </div>
                      <ChevronDown className={`size-4 text-gray-500 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isDropdownOpen && (
                      <>
                        {/* Backdrop to close */}
                        <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                        
                        <div className="absolute bottom-full mb-2 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
                          <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-1">
                            {MODELS.map((model) => (
                              <button
                                key={model.id}
                                type="button"
                                onClick={() => {
                                  setSelectedModel(model.id);
                                  setIsDropdownOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left ${
                                  selectedModel === model.id
                                    ? 'bg-emerald-500/10 border border-emerald-500/20'
                                    : 'hover:bg-white/5 border border-transparent'
                                }`}
                              >
                                <span className="text-xl">{model.icon}</span>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <span className={`text-sm font-medium ${selectedModel === model.id ? 'text-emerald-400' : 'text-gray-200'}`}>
                                      {model.name}
                                    </span>
                                    <span className="text-[9px] bg-white/5 text-gray-400 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                      {model.badge}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-gray-500 mt-0.5">{model.description}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-all active:scale-95"
                  >
                    {loading ? (
                      <>Generating <Loader2Icon className="size-4 animate-spin" /></>
                    ) : (
                      <><CodeIcon className="size-4" /> Generate Website</>
                    )}
                  </button>
                  
                  {loading && (
                    <button
                      type="button"
                      onClick={cancelGeneration}
                      className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all flex items-center justify-center"
                      title="Cancel Generation"
                    >
                      <ZapIcon className="size-4 rotate-180" />
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Click to expand hint */}
            {activeCard !== 'website' && (
              <div className="flex items-center gap-1.5 text-emerald-400/70 text-xs mt-1">
                <ZapIcon className="size-3" />
                <span>Click to start building</span>
              </div>
            )}
          </div>
        </div>

        {/* ─── Thumbnail Card ─── */}
        <div
          className="group glass-card relative rounded-2xl border border-white/10 hover:border-pink-500/40 hover:shadow-[0_0_30px_rgba(236,72,153,0.15)] transition-all duration-300 cursor-pointer overflow-hidden"
          onClick={handleThumbnailClick}
        >
          {/* Top shimmer line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-400/40 to-transparent" />

          <div className="relative p-7">
            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center mb-5 shadow-lg shadow-pink-900/40 group-hover:scale-110 transition-transform duration-300">
              <ImageIcon className="size-6 text-white" />
            </div>

            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-xl font-bold text-white">Generate Thumbnail</h2>
                <p className="text-gray-400 text-sm mt-1 leading-relaxed">
                  Create eye-catching YouTube thumbnails with custom styles, colors, and layouts.
                </p>
              </div>
              <ArrowRightIcon className="size-5 text-pink-400 mt-1 flex-shrink-0 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 mb-5">
              {['Multiple Styles', 'Custom Colors', 'HD Export'].map(tag => (
                <span key={tag} className="text-xs bg-pink-500/10 border border-pink-500/20 text-pink-300 px-2.5 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>

            {/* CTA */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-px bg-gradient-to-r from-pink-500/30 to-transparent" />
              <span className="text-xs text-pink-400/80 flex items-center gap-1.5">
                <ZapIcon className="size-3" /> Click to open generator
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="mt-24 w-full max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-gray-400 text-base max-w-2xl mx-auto">
            Transform your ideas into reality in just 3 simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="relative group">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-900/40 group-hover:scale-110 transition-transform duration-300 relative z-10">
                <MessageSquare className="size-8 text-white" />
              </div>
              <div className="absolute left-1/2 top-8 w-1/2 h-1 bg-gradient-to-r from-transparent to-blue-500/30 -ml-1/4 hidden md:block" />
              <h3 className="text-lg font-semibold text-white mb-2">1. Describe</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Tell us what you want to build. Be specific about your vision and requirements.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative group">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-4 shadow-lg shadow-purple-900/40 group-hover:scale-110 transition-transform duration-300 relative z-10">
                <Zap className="size-8 text-white" />
              </div>
              <div className="absolute left-1/2 top-8 w-1/2 h-1 bg-gradient-to-r from-purple-500/30 to-transparent -ml-1/2 hidden md:block" />
              <h3 className="text-lg font-semibold text-white mb-2">2. AI Magic</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Our AI analyzes your request and generates custom code instantly.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative group">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4 shadow-lg shadow-emerald-900/40 group-hover:scale-110 transition-transform duration-300 relative z-10">
                <Eye className="size-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">3. Preview & Edit</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                See your creation instantly. Make edits and refine until it's perfect.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid Section */}
      <div className="mt-24 w-full max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Powerful Features</h2>
          <p className="text-gray-400 text-base max-w-2xl mx-auto">
            Everything you need to create stunning websites and thumbnails
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 - AI-Powered */}
          <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/40 hover:bg-white/8 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-900/40 group-hover:scale-110 transition-transform duration-300">
              <Cpu className="size-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">AI-Powered</h3>
            <p className="text-gray-400 text-sm">Advanced AI generates complete websites from simple text descriptions.</p>
          </div>

          {/* Feature 2 - Responsive Design */}
          <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/40 hover:bg-white/8 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-4 shadow-lg shadow-purple-900/40 group-hover:scale-110 transition-transform duration-300">
              <Smartphone className="size-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Responsive Design</h3>
            <p className="text-gray-400 text-sm">Works seamlessly on all devices - desktop, tablet, and mobile.</p>
          </div>

          {/* Feature 3 - SEO Optimized */}
          <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/40 hover:bg-white/8 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mb-4 shadow-lg shadow-orange-900/40 group-hover:scale-110 transition-transform duration-300">
              <Globe className="size-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">SEO Optimized</h3>
            <p className="text-gray-400 text-sm">Built-in SEO best practices to help your site rank higher.</p>
          </div>

          {/* Feature 4 - Custom Styling */}
          <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/40 hover:bg-white/8 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4 shadow-lg shadow-emerald-900/40 group-hover:scale-110 transition-transform duration-300">
              <Palette className="size-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Custom Styling</h3>
            <p className="text-gray-400 text-sm">Full control over colors, fonts, layouts, and design elements.</p>
          </div>

          {/* Feature 5 - Version Control */}
          <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/40 hover:bg-white/8 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-900/40 group-hover:scale-110 transition-transform duration-300">
              <GitBranch className="size-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Version Control</h3>
            <p className="text-gray-400 text-sm">Track changes, rollback to previous versions, and manage iterations.</p>
          </div>

          {/* Feature 6 - Real-time Collaboration */}
          <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/40 hover:bg-white/8 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center mb-4 shadow-lg shadow-rose-900/40 group-hover:scale-110 transition-transform duration-300">
              <Users className="size-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Easy Export</h3>
            <p className="text-gray-400 text-sm">Download your code or share your creation with others instantly.</p>
          </div>
        </div>
      </div>

      {/* Trusted By Section */}
      <div className="mt-20 w-full max-w-3xl text-center">
        <p className="text-xs text-gray-600 uppercase tracking-widest mb-6">Trusted by teams at</p>
        <div className="flex flex-wrap items-center justify-center gap-10 opacity-40 hover:opacity-60 transition-opacity duration-500">
          <div className="flex flex-col items-center gap-2" title="Framer">
            <Figma className="w-8 h-8 text-gray-400" />
            <span className="text-xs text-gray-500">Framer</span>
          </div>
          <div className="flex flex-col items-center gap-2" title="Microsoft">
            <Square className="w-8 h-8 text-gray-400" />
            <span className="text-xs text-gray-500">Microsoft</span>
          </div>
          <div className="flex flex-col items-center gap-2" title="Instagram">
            <Camera className="w-8 h-8 text-gray-400" />
            <span className="text-xs text-gray-500">Instagram</span>
          </div>
          <div className="flex flex-col items-center gap-2" title="Walmart">
            <ShoppingCart className="w-8 h-8 text-gray-400" />
            <span className="text-xs text-gray-500">Walmart</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Home;