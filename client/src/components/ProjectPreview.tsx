import { forwardRef,useEffect,useImperativeHandle,useRef, useState } from 'react'
import type {Project} from  '../types'
import { iframeScript } from '../assets/assets';
import EditorPanel from './EditorPanel';
import LoaderSteps from './LoaderSteps';

interface ProjectPreviewProps {
  project:Project;
  isGenerating:boolean;
  device?:'phone' | 'tablet' | 'desktop';
  showEditorPanel?:boolean;
  onCancel?: () => void;
}
 
export interface ProjectPreviewRef{
  getCode: () => string | undefined
}



// forwardRef is used to pass the arguments from this component to parent component
const ProjectPreview = forwardRef<ProjectPreviewRef, ProjectPreviewProps>(({ project, isGenerating, device = 'desktop', showEditorPanel = true, onCancel }, ref) => {

  const iframeRef=useRef<HTMLIFrameElement>(null)
  const lastHashRef = useRef<string>('')
  const [selectedElement,setSelectedElement] = useState<any>(null)

  const resolutions = {
    phone:'w-[412px]',
    tablet:'w-[768px]',
    desktop:'w-full'
  }

  useImperativeHandle(ref,()=>({
    getCode: ()=>{
      const doc = iframeRef.current?.contentDocument;
      if(!doc) return undefined

      // Remove the selected border from the code
      doc.querySelectorAll('.ai-selected-element,[data-ai-selected]').forEach((el)=>{
        el.classList.remove('ai-selected-element');
        el.removeAttribute('data-ai-selected');
        (el as HTMLElement).style.outline='';
      })

      // Remove the injected style + script from the document
      const previewStyle = doc.getElementById('ai-preview-style');
      if(previewStyle) previewStyle.remove();
      const previewScript = doc.getElementById('ai-preview-script');
      if(previewScript) previewScript.remove()
      
        // Serialize HTML
      const html = doc.documentElement.outerHTML;
      return html;
    }
  }))

  useEffect(()=>{
    const handleMessage = (event:MessageEvent)=>{
      if(event.data.type === 'ELEMENT_SELECTED'){
        setSelectedElement(event.data.payload);
      }
      else if(event.data.type == "CLEAR_SELECTION"){
        setSelectedElement(null);
      }
    }
    window.addEventListener('message',handleMessage);
    return ()=> window.removeEventListener('message',handleMessage);
  },[])

  const handleUpdate = (updates:any)=>{
    if(iframeRef.current?.contentWindow){
      iframeRef.current?.contentWindow.postMessage({
        type:'UPDATE_ELEMENT',
        payload:updates
      },'*')
    }
  }

  const injectPreview = (html: string)=>{
    if(!html) return '';
    
    // Save current hash before update
    if (iframeRef.current?.contentWindow) {
      const hash = iframeRef.current.contentWindow.location.hash;
      if (hash && hash !== '#/') {
        lastHashRef.current = hash;
      }
    }

    if(!showEditorPanel) return html;
    if(html.includes('</body>')){
      return html.replace('</body>',iframeScript + '</body>')
    }else{
      return html + iframeScript
    }
  }

  // Effect to restore hash after iframe reloads and monitor navigation
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleHashChange = () => {
      if (iframe.contentWindow) {
        const currentHash = iframe.contentWindow.location.hash;
        if (currentHash && currentHash !== '#/') {
          lastHashRef.current = currentHash;
        }
      }
    };

    const onLoad = () => {
      if (iframe.contentWindow) {
        iframe.contentWindow.addEventListener('hashchange', handleHashChange);
        
        // Restore hash if needed
        if (!isGenerating && lastHashRef.current) {
          const hashToApply = lastHashRef.current;
          setTimeout(() => {
            if (iframe.contentWindow) {
              iframe.contentWindow.location.hash = hashToApply;
              lastHashRef.current = ''; 
            }
          }, 50);
        }
      }
    };

    iframe.addEventListener('load', onLoad);
    return () => {
      iframe.removeEventListener('load', onLoad);
      if (iframe.contentWindow) {
        iframe.contentWindow.removeEventListener('hashchange', handleHashChange);
      }
    };
  }, [project.current_code, isGenerating]);
  return (
      <div className="relative h-full w-full">
        {project.current_code ? (
          <>
            <iframe 
              ref={iframeRef} 
              srcDoc={injectPreview(project.current_code)} 
              className={`h-full max-sm:w-full ${resolutions[device]} mx-auto transition-all ${isGenerating ? 'opacity-50 grayscale-[0.5]' : ''}`} 
            /> 
            {showEditorPanel && selectedElement && (
              <EditorPanel selectedElement={selectedElement} onUpdate={handleUpdate} onClose={()=>{
                setSelectedElement(null)
                if(iframeRef.current?.contentWindow){
                  iframeRef.current?.contentWindow.postMessage({type:'CLEAR_SELECTION_REQUEST'},'*')
                }
              }}/>
            )}
          </> 
        ) : isGenerating ? (
          <div className="h-full flex flex-col items-center justify-center gap-6">
            <LoaderSteps />
          </div>
        ) : (
          <div className='flex items-center justify-center h-full'>
            <p className='text-gray-400 text-center'>No content to display</p>
          </div>
        )}

        {/* Overlay for revisions */}
        {isGenerating && project.current_code && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gray-900/60 backdrop-blur-[2px] gap-6">
            <div className="bg-gray-800/90 p-8 rounded-2xl shadow-2xl border border-white/5 flex flex-col items-center gap-6 min-w-80">
              <LoaderSteps />
              {onCancel && (
                <button 
                  onClick={onCancel}
                  className="px-6 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-full transition-all text-sm font-medium flex items-center gap-2 group"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  Cancel Generation
                </button>
              )}
            </div>
          </div>
        )}
      </div>
  )
})

export default ProjectPreview
