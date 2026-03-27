import api from '@/configs/axios';
import { authClient } from '@/lib/auth-client';
import { Loader2Icon, Globe, ImageIcon, SparklesIcon, ArrowRightIcon, CodeIcon, ZapIcon } from 'lucide-react';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Home = () => {
  const { data: session } = authClient.useSession();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeCard, setActiveCard] = useState<'website' | 'thumbnail' | null>(null);
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
      const { data } = await api.post('/api/user/project', { initial_prompt: input });
      setLoading(false);
      toast.success('Project created! Generating website...');
      navigate(`/project/${data.projectId}`);
    } catch (error: any) {
      setLoading(false);
      toast.error(error?.response?.data?.message || error.message);
      console.log(error);
    }
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
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-all active:scale-95"
                >
                  {loading ? (
                    <>Generating <Loader2Icon className="size-4 animate-spin" /></>
                  ) : (
                    <><CodeIcon className="size-4" /> Generate Website</>
                  )}
                </button>
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

      {/* Trusted By Section */}
      <div className="mt-20 w-full max-w-3xl text-center">
        <p className="text-xs text-gray-600 uppercase tracking-widest mb-6">Trusted by teams at</p>
        <div className="flex flex-wrap items-center justify-center gap-10 opacity-40 grayscale hover:opacity-60 transition-opacity duration-500">
          <img className="max-w-24" src="https://saasly.prebuiltui.com/assets/companies-logo/framer.svg" alt="Framer" />
          <img className="max-w-24" src="https://saasly.prebuiltui.com/assets/companies-logo/microsoft.svg" alt="Microsoft" />
          <img className="max-w-24" src="https://saasly.prebuiltui.com/assets/companies-logo/instagram.svg" alt="Instagram" />
          <img className="max-w-24" src="https://saasly.prebuiltui.com/assets/companies-logo/walmart.svg" alt="Walmart" />
        </div>
      </div>
    </section>
  );
};

export default Home;