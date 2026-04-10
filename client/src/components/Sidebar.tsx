import { useEffect, useRef, useState } from 'react'
import type { Message, Project, Version } from '../types'
import { BotIcon, EyeIcon, UserIcon, Loader2Icon, SendIcon, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '@/configs/axios';
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

interface SidebarProps {
    isMenuOpen: boolean;
    project: Project,
    setProject: (project: Project) => void;
    isGenerating: boolean;
    setIsGenerating: (isGenerating: boolean) => void;
}
const Sidebar = ({ isMenuOpen, project, setProject, isGenerating, setIsGenerating }: SidebarProps) => {

    const messageRef = useRef<HTMLDivElement>(null)
    const [input, setInput] = useState('')
    const [selectedModel, setSelectedModel] = useState(MODELS[0].id)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    const fetchProject = async () => {
        try {
            const { data } = await api.get(`/api/user/project/${project.id}`)
            setProject(data.project)
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error.message)
            console.log(error);
        }
    }

    const handleRollback = async (versionId: string) => {
        try {
            const confirm = window.confirm('Are you sure you want to rollback')
            if (!confirm) return;
            setIsGenerating(true)
            const { data } = await api.get(`/api/project/rollback/${project.id}/${versionId}`)
            const { data: data2 } = await api.get(`/api/user/project/${project.id}`)
            toast.success(data.message)
            setProject(data2.project)
            setIsGenerating(false);

        } catch (error: any) {
            setIsGenerating(false);
            toast.error(error?.response?.data?.message || error.message)
            console.log(error);
        }

    }
    const handleRevision = async (e: React.FormEvent) => {
        e.preventDefault();
        let interval: number | undefined
        try {
            setIsGenerating(true);
            interval = setInterval(() => {
                fetchProject()
            }, 10000)
            const { data } = await api.post(`/api/project/revision/${project.id}`, {
                message: input,
                model: selectedModel
            })
            fetchProject()
            toast.success(data.message)
            setInput('')
            if (interval) clearInterval(interval)
            setIsGenerating(false)
        } catch (error: any) {
            setIsGenerating(false)
            if (interval) clearInterval(interval)
            toast.error(error?.response?.data?.message || error.message)
            console.log(error);
        }
    }

    const handleCancel = async () => {
        try {
            await api.post(`/api/user/project/cancel/${project.id}`);
            toast.info('Generation cancelled');
            setIsGenerating(false);
            setTimeout(fetchProject, 1000);
        } catch (error: any) {
            toast.error('Failed to cancel generation');
        }
    };

    useEffect(() => {
        if (messageRef.current) {
            messageRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [project.conversation.length, isGenerating])
    return (
        <div className={`h-full sm:max-w-sm rounded-xl glass-card border-white/10 transition-all ${isMenuOpen ? 'max-sm:w-0 overflow-hidden' : 'w-full'}`}>
            <div className='flex flex-col h-full'>
                {/* Messages container */}
                <div className='flex-1 overflow-y-auto no-scrollbar px-3 flex flex-col gap-4'>
                    {[...project.conversation, ...project.versions]
                        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).map((message) => {
                            const isMessage = 'content' in message;

                            if (isMessage) {
                                const msg = message as Message;
                                const isUser = msg.role === 'user';
                                return (
                                    <div key={msg.id} className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                                        {!isUser && (
                                            <div className='w-8 h-8 rounded-full bg-linear-to-br from-emerald-600 to-teal-700 flex items-center justify-center'>
                                                <BotIcon className='size-5 text-white' />
                                            </div>
                                        )}
                                        <div className={`max-w-[80%] p-2 px-4 rounded-2xl shadow-sm text-sm mt-5 leading-relaxed ${isUser ? "bg-linear-to-br from-emerald-500 to-teal-600 text-white rounded-tr-none" : " rounded-tl-none bg-gray-800 text-gray-100"}`}>
                                            {msg.content}
                                        </div>
                                        {isUser && (
                                            <div className='w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center'>
                                                <UserIcon className='size-5 text-gray-200' />
                                            </div>
                                        )}

                                    </div>
                                )
                            } else {
                                const ver = message as Version;
                                return (
                                    <div key={ver.id} className='w-4/5 mx-auto my-2 p-3 rounded-xl bg-gray-800 text-gray-100 shadow flex flex-col gap-2'>
                                        <div className='text-xs font-medium'>
                                            code updated <br />
                                            <span className='text-gray-500 text-xs font-normal'>
                                                {new Date(ver.timestamp).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className='flex items-center justify-between'>
                                            {project.current_version_index === ver.id ? (
                                                <button className='px-3 py-1 rounded-md text-xs bg-gray-700'>Current version</button>
                                            ) : (
                                                <button onClick={() => handleRollback(ver.id)} className='px-3 py-1 rounded-md text-xs bg-emerald-500 hover:bg-emerald-600 text-white'>Roll back to this version</button>
                                            )}
                                            <Link target='_blank' to={`/preview/${project.id}/${ver.id}`}>
                                                <EyeIcon className='size-6 p-1 bg-gray-700 hover:bg-indigo-500 transition-colors rounded' />
                                            </Link>

                                        </div>

                                    </div>
                                )
                            }

                        })}
                    {
                        isGenerating && (
                            <div className='flex items-start gap-3 justify-start'>
                                <div className='w-8 h-8 rounded-full bg-linear-to-br from-emerald-600 to-teal-700 flex items-center justify-center'>
                                    <BotIcon className='size-5 text-white' />
                                </div>
                                <div className='flex flex-col gap-2'>
                                    <div className='flex gap-1.5 h-6 items-center'>
                                        <span className='size-2 rounded-full animate-bounce bg-emerald-500' style={{ animationDelay: '0s' }} />
                                        <span className='size-2 rounded-full animate-bounce bg-emerald-500' style={{ animationDelay: '0.2s' }} />
                                        <span className='size-2 rounded-full animate-bounce bg-emerald-500' style={{ animationDelay: '0.4s' }} />
                                    </div>
                                    <button 
                                        onClick={handleCancel}
                                        className='text-[10px] text-red-400 hover:text-red-300 transition-colors uppercase font-bold tracking-wider flex items-center gap-1 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20'
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )
                    }
                    <div ref={messageRef} />

                    {/* Model Selection Dropdown */}
                    {!isGenerating && (
                        <div className="px-3 mb-2">
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-gray-800/50 border border-white/5 hover:border-emerald-500/30 transition-all duration-300 group"
                                >
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <span className="text-base flex-shrink-0">{MODELS.find(m => m.id === selectedModel)?.icon}</span>
                                        <div className="text-left overflow-hidden">
                                            <div className="text-xs font-semibold text-gray-200 flex items-center gap-1.5">
                                                <span className="truncate">{MODELS.find(m => m.id === selectedModel)?.name}</span>
                                                <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1 py-0.5 rounded border border-emerald-500/20 uppercase tracking-tighter flex-shrink-0">
                                                    {MODELS.find(m => m.id === selectedModel)?.badge}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronDown className={`size-3 text-gray-500 transition-transform duration-300 flex-shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isDropdownOpen && (
                                    <>
                                        {/* Backdrop */}
                                        <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                                        
                                        <div className="absolute bottom-full mb-2 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl p-1.5 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
                                            <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-0.5">
                                                {MODELS.map((model) => (
                                                    <button
                                                        key={model.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedModel(model.id);
                                                            setIsDropdownOpen(false);
                                                        }}
                                                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-200 text-left ${
                                                            selectedModel === model.id
                                                                ? 'bg-emerald-500/10 border border-emerald-500/20'
                                                                : 'hover:bg-white/5 border border-transparent'
                                                        }`}
                                                    >
                                                        <span className="text-base flex-shrink-0">{model.icon}</span>
                                                        <div className="flex-1 overflow-hidden">
                                                            <div className="flex items-center justify-between gap-2 overflow-hidden">
                                                                <span className={`text-xs font-medium truncate ${selectedModel === model.id ? 'text-emerald-400' : 'text-gray-200'}`}>
                                                                    {model.name}
                                                                </span>
                                                                <span className="text-[7px] bg-white/5 text-gray-400 px-1 py-0.5 rounded uppercase tracking-tighter flex-shrink-0">
                                                                    {model.badge}
                                                                </span>
                                                            </div>
                                                            <p className="text-[9px] text-gray-500 mt-0.5 truncate">{model.description}</p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                {/* Input area */}
                <form onSubmit={handleRevision} className='m-3 relative'>
                    <div className='flex items-center gap-2'>
                        <textarea onChange={(e) => setInput(e.target.value)}
                            value={input} rows={4} placeholder='Type a Message' className='flex-1 p-3 rounded-xl resize-none text-sm outline-none ring ring-gray-700 focus:ring-emerald-500 bg-gray-800 text-gray-100 placeholder-gray-400 transition-all' disabled={isGenerating} />
                        <button disabled={isGenerating || !input.trim()} className='absolute bottom-2.5 right-2.5 rounded-full bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white transition-colors disabled:opacity-60'>
                            {isGenerating ? <Loader2Icon className='size-7 p-1.5 animate-spin text-white' /> : <SendIcon className='size-7 p-1.5 text-white' />}
                        </button>
                    </div>
                </form>
            </div>

        </div>
    )
}

export default Sidebar