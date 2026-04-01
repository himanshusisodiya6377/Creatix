import React, { useEffect, useState } from 'react'
import type { Project } from '../types';
import type { IThumbnail } from '../assets/assets_thumb'
import { Loader2Icon, PlusIcon, TrashIcon, DownloadIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/configs/axios';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';

type FilterType = 'all' | 'website' | 'thumbnail'

const MyProjects = () => {
  const {data:session,isPending} = authClient.useSession()
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([])
  const [thumbnails, setThumbnails] = useState<IThumbnail[]>([])
  const [filter, setFilter] = useState<FilterType>('all')
  const navigate = useNavigate()

  const fetchProjects = async () => {
    try {
      const [projectsRes, thumbnailsRes] = await Promise.all([
        api.get('/api/user/projects'),
        api.get('/api/user/thumbnails')
      ])
      setProjects(projectsRes.data.projects || [])
      setThumbnails(thumbnailsRes.data.thumbnails || [])
      setLoading(false)
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.message || error.message)
      setLoading(false)
    }
  }

  const deleteProject = async (projectId:string) => {
    try {
      const confirm = window.confirm('Are you sure want to delete this?')
      if(!confirm) return;
      const {data} = await api.delete(`/api/project/${projectId}`)
      toast.success(data.message)
      fetchProjects()
    } catch (error:any) {
      console.log(error);
      toast.error(error?.response?.data?.message || error.message)
    }
  }

  const deleteThumbnail = async (thumbnailId: string) => {
    try {
      const confirm = window.confirm('Are you sure you want to delete this thumbnail?')
      if(!confirm) return;
      const {data} = await api.delete(`/api/thumbnail/delete/${thumbnailId}`)
      toast.success(data.message)
      setThumbnails(thumbnails.filter(t => t.id !== thumbnailId))
    } catch (error:any) {
      console.log(error);
      toast.error(error?.response?.data?.message || error.message)
    }
  }

  const handleDownload = (image_url: string) => {
    const link = document.createElement('a');
    link.href = image_url.replace('/upload', '/upload/fl_attachment')
    document.body.appendChild(link);
    link.click()
    link.remove()
  }

  useEffect(()=>{
    if(session?.user && !isPending)
      fetchProjects()
    else if(!isPending && !session?.user){
      navigate('/')
      toast('Please Login to view Projects')
    }
  },[session?.user])

  // Filter items based on selected filter
  const filteredProjects = filter === 'website' ? projects : filter === 'thumbnail' ? thumbnails : [...projects, ...thumbnails]
  const hasItems = projects.length > 0 || thumbnails.length > 0

  return (
    <>
      <div className='px-4 md:px-16 lg:px-24 xl:px-32'>
        {loading ? (
          <div className='flex items-center justify-center h-[80vh]'>
            <Loader2Icon className='size-7 animate-spin text-emerald-300' />
          </div>
        ) : hasItems ? (
          <div className='py-10 min-h-[80vh]'>
            {/* Header */}
            <div className='flex items-center justify-between mb-8'>
              <h1 className='text-3xl font-bold text-white'>My Projects</h1>
              <button onClick={()=> navigate('/')} className='flex items-center gap-2 text-white px-3 sm:px-6 py-2 rounded bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 active:scale-95 transition-all'>
                <PlusIcon size={18}/> Create New
              </button>
            </div>

            {/* Filter Tabs */}
            <div className='flex gap-4 mb-8 border-b border-white/10'>
              <button
                onClick={() => setFilter('all')}
                className={`px-6 py-3 font-medium transition-all ${
                  filter === 'all'
                    ? 'text-emerald-400 border-b-2 border-emerald-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                All ({projects.length + thumbnails.length})
              </button>
              <button
                onClick={() => setFilter('website')}
                className={`px-6 py-3 font-medium transition-all ${
                  filter === 'website'
                    ? 'text-emerald-400 border-b-2 border-emerald-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Websites ({projects.length})
              </button>
              <button
                onClick={() => setFilter('thumbnail')}
                className={`px-6 py-3 font-medium transition-all ${
                  filter === 'thumbnail'
                    ? 'text-emerald-400 border-b-2 border-emerald-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Thumbnails ({thumbnails.length})
              </button>
            </div>

            {/* Projects Grid */}
            {filteredProjects.length > 0 ? (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {/* Website Projects */}
                {(filter === 'all' || filter === 'website') && projects.map((project) => (
                  <div 
                    onClick={()=> navigate(`/projects/${project.id}`)} 
                    key={`proj-${project.id}`} 
                    className='relative group w-full cursor-pointer glass-card rounded-lg overflow-hidden shadow-md hover:shadow-emerald-700/30 hover:border-emerald-500/40 transition-all duration-300'
                  >
                    {/* Desktop-like Mini Preview */}
                    <div className='relative w-full h-40 bg-gray-900 overflow-hidden border-b border-gray-800'>
                      {project.current_code ? (
                        <iframe 
                          srcDoc={project.current_code}
                          className='absolute top-0 left-0 w-[1200px] h-[800px] origin-top-left pointer-events-none'
                          sandbox='allow-script allow-same-origin'
                          style={{transform: 'scale(0.25)'}}
                        />
                      ) : (
                        <div className='flex items-center justify-center h-full text-gray-500'>
                          <p>No Preview</p>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className='p-4 text-white bg-linear-180 from-transparent group-hover:from-emerald-950 to-transparent transition-colors'>
                      <div className='flex items-start justify-between mb-2'>
                        <h2 className='text-lg font-medium line-clamp-2 flex-1'>{project.name}</h2>
                        <span className='px-2.5 py-0.5 ml-2 text-xs bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-full whitespace-nowrap'>
                          Website
                        </span>
                      </div>
                      <p className='text-gray-400 text-sm line-clamp-2 mb-4'>{project.initial_prompt}</p>
                      
                      <div onClick={(e)=> e.stopPropagation()} className='flex justify-between items-center'>
                        <span className='text-xs text-gray-500'>{new Date(project.createdAt).toLocaleDateString()}</span>
                        <div className='flex gap 2 text-white text-sm'>
                          <button onClick={()=>navigate(`/preview/${project.id}`)} className='px-3 py-1.5 bg-white/10 hover:bg-white/15 rounded-md transition-all'>Preview</button>
                          <button onClick={()=>navigate(`/projects/${project.id}`)} className='px-3 py-1.5 bg-white/10 hover:bg-white/15 rounded-md transition-all'>Open</button>
                        </div>
                      </div>
                    </div>

                    <div onClick={e => e.stopPropagation()}>
                      <TrashIcon className='absolute top-3 right-3 scale-0 group-hover:scale-100 bg-white p-1.5 size-7 rounded text-red-500 cursor-pointer transition-all hover:bg-red-500 hover:text-white' onClick={()=>deleteProject(project.id)} />
                    </div>
                  </div>
                ))}

                {/* Thumbnail Projects */}
                {(filter === 'all' || filter === 'thumbnail') && thumbnails.map((thumbnail) => (
                  <div 
                    key={`thumb-${thumbnail.id}`}
                    className='relative group w-full glass-card rounded-lg overflow-hidden shadow-md hover:shadow-pink-700/30 hover:border-pink-500/40 transition-all duration-300'
                  >
                    {/* Thumbnail Image */}
                    <div className='relative w-full bg-gray-900 overflow-hidden border-b border-gray-800'>
                      <img 
                        src={thumbnail.image_url} 
                        alt={thumbnail.title || 'Thumbnail'}
                        className='w-full h-40 object-cover'
                      />
                    </div>

                    {/* Content */}
                    <div className='p-4 text-white bg-linear-180 from-transparent group-hover:from-pink-950 to-transparent transition-colors'>
                      <div className='flex items-start justify-between mb-2'>
                        <h2 className='text-lg font-medium line-clamp-2 flex-1'>{thumbnail.title || 'Untitled Thumbnail'}</h2>
                        <span className='px-2.5 py-0.5 ml-2 text-xs bg-pink-500/20 border border-pink-500/30 text-pink-300 rounded-full whitespace-nowrap'>
                          Thumbnail
                        </span>
                      </div>

                      <div onClick={(e)=> e.stopPropagation()} className='flex justify-between items-center'>
                        <span className='text-xs text-gray-500'>{new Date(thumbnail.createdAt).toLocaleDateString()}</span>
                        <div className='flex gap-2 text-white text-sm'>
                          <button 
                            onClick={() => handleDownload(thumbnail.image_url)} 
                            className='px-3 py-1.5 bg-white/10 hover:bg-white/15 rounded-md transition-all flex items-center gap-1'
                          >
                            <DownloadIcon size={14} /> Download
                          </button>
                        </div>
                      </div>
                    </div>

                    <div onClick={e => e.stopPropagation()}>
                      <TrashIcon 
                        className='absolute top-3 right-3 scale-0 group-hover:scale-100 bg-white p-1.5 size-7 rounded text-red-500 cursor-pointer transition-all hover:bg-red-500 hover:text-white' 
                        onClick={()=>deleteThumbnail(thumbnail.id)} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-center py-12'>
                <p className='text-gray-400 text-lg'>
                  {filter === 'website' ? 'No websites yet' : filter === 'thumbnail' ? 'No thumbnails yet' : 'No projects yet'}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center h-[80vh]'>
            <h1 className='text-3xl font-semibold text-gray-300'>You have no projects yet!</h1>
            <button onClick={()=> navigate('/')} className='text-white px-5 py-2 mt-5 rounded-md bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all'>
              Create New
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default MyProjects