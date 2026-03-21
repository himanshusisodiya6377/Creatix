import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { colorSchemes, type AspectRatio, type IThumbnail, type ThumbnailStyle } from "../assets/assets_thumb";
import AspectRationSelector from "@/components/Thumbnail/AspectRationSelector";
import StyleSelector from "@/components/Thumbnail/StyleSelector";
import ColorSchemeSelector from "@/components/Thumbnail/ColorSchemeSelector";
import PreviewPanel from "@/components/Thumbnail/PreviewPanel";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import api from "@/configs/axios";

const Generate = () => {

    const {id} = useParams();
    const navigate = useNavigate();
    const {pathname} =useLocation();

    const {data:session, isPending} = authClient.useSession();
    const [title, setTitle] = useState('')
    const [additionalDetails, setAdditionalDetails] = useState('')

    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9')
    const [colorSchemeId, setColorSchemeId] = useState<string>(colorSchemes[0].id)
    const [style, setStyle] = useState<ThumbnailStyle>('Bold & Graphic')

    const [styleDropdownOpen, setStyleDropdownOpen] = useState(false)
    const [loading,setLoading]=useState(false);

    const [thumbnail, setThumbnail] = useState<IThumbnail | null>(null)

   const handleGenerate = async () => {
  if(!session?.user) {
    navigate('/auth/login');
    return;
  }
  if(!title.trim()) return toast.error('Title is required')
  setLoading(true)

  const api_payload = {
    title,
    prompt: additionalDetails,
    style,
    aspect_ratio: aspectRatio,
   color_scheme: colorSchemeId,
    text_overlay: true,
  }

  try {
    const {data} = await api.post('/api/thumbnail/generate', api_payload);
    if(data.thumbnail){
      // Set thumbnail directly without navigating
      setThumbnail(data.thumbnail);
      toast.success(data.message)
      // Start polling for updates
      const pollInterval = setInterval(async () => {
        try {
          const { data: updatedData } = await api.get(`/api/user/thumbnail/${data.thumbnail.id}`);
          setThumbnail(updatedData?.thumbnail as IThumbnail);
          if(updatedData?.thumbnail?.image_url) {
            setLoading(false);
            clearInterval(pollInterval);
          }
        } catch (error) {
          console.log('Poll error:', error);
        }
      }, 3000);
    }
  } catch (error: any) {
    console.log(error);
    setLoading(false);
    toast.error(error?.response?.data?.message || error.message)
  }
}

const fetchThumbnail = async () => {
  try {
    const { data } = await api.get(`/api/user/thumbnail/${id}`);
    setThumbnail(data?.thumbnail as IThumbnail);
    setLoading(!data?.thumbnail?.image_url);
    setAdditionalDetails(data?.thumbnail?.user_prompt)
    setTitle(data?.thumbnail?.title)
    setColorSchemeId(data?.thumbnail?.color_scheme)
    setAspectRatio(data?.thumbnail?.aspect_ratio)
    setStyle(data?.thumbnail?.style)
  } catch (error: any) {
    console.log(error);
    toast.error(error?.response?.data?.message || error.message)
  }
}

useEffect(()=>{
  if(session?.user && !isPending && id){
    fetchThumbnail()
  }
  if(id && loading && session?.user && !isPending){
    const interval = setInterval(()=>{
      fetchThumbnail()
    },5000);
    return ()=> clearInterval(interval)
  }
},[id, loading, session?.user, isPending])

useEffect(()=>{
  if(!id && thumbnail){
    setThumbnail(null)
  }
},[pathname])

// Redirect to login if not authenticated
useEffect(() => {
  if (!isPending && !session?.user) {
    navigate('/auth/login', { replace: true });
  }
}, [session?.user, isPending, navigate])
    
  // Show loading state while session is being checked
  if(isPending) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Show nothing while redirecting
  if(!session?.user) {
    return null;
  }
  return (
    <div>
     <div className=" min-h-screen">
     <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 lg:pb-8">
      {/* Header with My Thumbnails Button */}
      <div className="flex justify-end mb-6">
        <button onClick={() => navigate('/my-thumbnail')} className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors text-white font-medium text-sm">
          My Thumbnails
        </button>
      </div>

      <div className="grid lg:grid-cols-[400px_1fr] gap-8">

      {/* LEFT PANEL */}
      <div className={`space-y-6 ${id && 'pointer-events-none'}`}>
        <div className="p-6 rounded-2xl bg-white/8 border border-white/12 shadow-xl space-y-6">
       <div>
       <h2 className="text-xl font-bold text-zinc-100 mb-1">Create Your Thumbnail</h2>
       <p className="text-sm text-zinc-400">Describe your vision and let AI bring it to life</p>
       </div>

       <div className="space-y-5">
  {/* TITLE INPUT */}
  <div className="space-y-2">
    <label className="block text-sm font-medium">Title or Topic</label>
    <input
      type="text"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      maxLength={100}
      placeholder="e.g., 10 Tips for Better Sleep"
      className="w-full px-4 py-3 rounded-lg border border-white/12 bg-black/20 text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
    />
  </div>
  <div className="flex justify-end">
  <span className="text-xs text-zinc-400">{title.length}/100</span>
</div>

<AspectRationSelector value={aspectRatio} onChange={setAspectRatio}/>

<StyleSelector value={style} onChange={setStyle} isOpen={styleDropdownOpen} setIsOpen={setStyleDropdownOpen} />

<ColorSchemeSelector value={colorSchemeId} onChange={setColorSchemeId}/>
<div className="space-y-2">
  <label className="block text-sm font-medium">
    Additional Prompts <span className="text-zinc-400 text-xs">(optional)</span>
  </label>

  <textarea
    value={additionalDetails}
    onChange={(e) => setAdditionalDetails(e.target.value)}
    rows={3}
    placeholder="Add any specific elements, mood, or style preferences..."
    className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/6 text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
  />
</div>

</div>
{/* BUTTON */}
{!id && (
  <button onClick={handleGenerate} className="text-[15px] w-full py-3.5 rounded-xl font-medium bg-linear-to-b from-pink-500 to-pink-600 hover:from-pink-700 disabled:cursor-not-allowed transition-colors">
    {loading ? 'Generating...' : 'Generate Thumbnail'}
  </button>
)}
      </div>
      </div>

      {/* RIGHT PANEL */}
      <div>
        <div className="p-6 rounded-2xl bg-white/8 border border-white/10 shadow-xl">
  <h2 className="text-lg font-semibold text-zinc-100 mb-4">Preview</h2>
  <PreviewPanel thumbnail={thumbnail} isLoading={loading} aspectRatio={aspectRatio}/>
</div>
      </div>

      </div>
     </main>
    </div>
    </div>
  )
}

export default Generate
