import { useState }  from "react"
import type { InvoiceAuditResponse } from "../types"
import type { ChangeEvent, DragEvent } from 'react'

interface UploadAreaProps {
  onUploadSuccess: (audit: InvoiceAuditResponse) => void
}

function UploadArea({ onUploadSuccess }: UploadAreaProps) {
      const [selectedFile, setSelectedFile] = useState<File | null>(null)
      const [isAuditing, setIsAuditing] = useState(false)
      const [isDragging, setIsDragging] = useState(false)

function handleDragOver(event: DragEvent<HTMLDivElement>) {
  event.preventDefault()
  setIsDragging(true)
}

function handleDragLeave() {
  setIsDragging(false)
}

function handleDrop(event: DragEvent<HTMLDivElement>) {
  event.preventDefault()
  setIsDragging(false)

  const file = event.dataTransfer.files[0] ?? null
  setSelectedFile(file)
}

function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file= event.target.files?.[0] ?? null
    setSelectedFile(file)
}
async function handleAudit() {
  if (!selectedFile) return

  setIsAuditing(true)
  const formData = new FormData()
  formData.append('file',selectedFile)

  fetch('http://127.0.0.1:8000/api/upload/',{
    method: 'POST',
    body: formData,
  })
   .then((response) =>{
    if(!response.ok){
      throw new Error(`Upload Failed: ${response.status}`)
    }

    return response.json()
   })
   .then((audit: InvoiceAuditResponse) =>{
     onUploadSuccess(audit)
   })
   .catch((error: unknown) =>{
      console.error('Upload error:', error)
   })
   .finally(() =>{
     setIsAuditing(false)
   })
  }
return(
  <section className="upload-area">
   <input 
       type="file"
       accept=".pdf,image/*"
       onChange={handleFileChange}
    />
    <div
     className={`drop-zone ${isDragging ? 'drop-zone--active' : ''}`}
     onDragOver={handleDragOver}
     onDragLeave={handleDragLeave}
     onDrop={handleDrop}
    >
     <p>Drag and drop a PDF or image here</p>
     <p>or choose a file</p>
     <input type="file" accept=".pdf,application/pdf,image/*" onChange={handleFileChange} />
    </div>
    <button type="button" onClick={handleAudit} disabled={!selectedFile || isAuditing}>
     {isAuditing && <span className="spinner" aria-hidden="true" />}
      {isAuditing ? 'Scanning Document...' : 'Audit Invoice'}
     </button>
    {selectedFile && <p>Selected: {selectedFile.name}</p>}
    </section>
    
)
}

export default UploadArea