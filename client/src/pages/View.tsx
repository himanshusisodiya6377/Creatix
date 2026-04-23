import { useEffect,useState } from 'react'
import { useParams } from 'react-router-dom'
import { Loader2Icon } from 'lucide-react';
import ProjectPreview from '../components/ProjectPreview';
import type { Project } from '../types';
import api from '../configs/axios';
import { toast } from 'react-hot-toast';

const View = () => {
  const {projectId} = useParams();
  const [code,setCode] = useState('')
  const [loading , setLoading] = useState(true);

  const fetchCode = async ()=>{
    try {
      if(!projectId) {
        toast.error('Project ID not found');
        return;
      }
      
      const {data} = await api.get(`/api/project/published/${projectId}`);
      
      if(data?.code) {
        setCode(data.code);
      } else {
        toast.error('Project code not found');
      }
    } catch (error: any) {
      console.error('Error fetching project:', error);
      toast.error(error?.response?.data?.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  }

  useEffect(()=>{
    fetchCode()
  },[projectId])

  if(loading){
    return (
      <div className='flex items-center justify-center h-screen'><Loader2Icon className='size-7 animate-spin text-indigo-200' /></div>
    )
  }
  return (
    <div className='h-screen'>
        {code && <ProjectPreview project={{current_code:code} as Project} isGenerating={false} showEditorPanel={false}/>}
    </div>
  )
}

export default View