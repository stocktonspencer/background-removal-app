import { useState, useEffect } from 'react'
import ProgressBar from './components/ProgressBar'
import ImageDisplay from './components/ImageDisplay'
import UploadButton from './components/UploadButton'
import './styles/App.css'

function App() {
  const [originalImage, setOriginalImage] = useState(null)
  const [processedImage, setProcessedImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filename, setFilename] = useState('')
  const [modelName, setModelName] = useState('')
  const [modelUrl, setModelUrl] = useState('')
  const [modelProcessingTime, setModelProcessingTime] = useState(10)
  const [progress, setProgress] = useState(0)
  const [modelLoading, setModelLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const modelInfo = async () => {
      try {
        setModelLoading(true)
        const response = await fetch('http://localhost:8000/api/model-info')
        const data = await response.json()
        setModelName(data.model)
        setModelUrl(data.url)
        setModelProcessingTime(data.model_processing_time)
      } catch (err) {
        setError('Failed to load model information')
      } finally {
        setModelLoading(false)
      }
    }
    modelInfo()
  }, [])

  const handleImageUpload = async (e) => {
    setError(null)
    
    const file = e.target.files[0]
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }
    
    // Validate file size (e.g., 5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB')
      return
    }

    setFilename(file.name)
    setOriginalImage(URL.createObjectURL(file))
    setProcessedImage(null)
    setLoading(true)
    setProgress(0)

    const expectedDuration = modelProcessingTime * 1000
    const interval = 100
    const incrementPerStep = (99 / (expectedDuration / interval)) // Go up to 98%
    
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev < 99) return prev + incrementPerStep
        return prev
      })
    }, interval)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('http://localhost:8000/api/remove-background', {
        method: 'POST',
        body: formData,
      })
      const blob = await response.blob()
      setProcessedImage(URL.createObjectURL(blob))
      setProgress(100)
    } catch (error) {
      setError('Failed to process image. Please try again.')
      console.error('Error processing image:', error)
    } finally {
      clearInterval(progressInterval)
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <h1 className="title">Background Removal</h1>
      {modelName && (
        <p className="subtitle">
          Powered by <a href={modelUrl} target="_blank" rel="noopener noreferrer">{modelName}</a>
        </p>
      )}
      
      <UploadButton onImageUpload={handleImageUpload} filename={filename} />

      {error && <p className="error-message">{error}</p>}
      
      {originalImage && (
        <div className="imageContainer">
          <ImageDisplay title="Original Image" src={originalImage} />
          <ImageDisplay 
            title="Processed Image" 
            src={processedImage}
            loading={loading}
          >
            {loading && <ProgressBar progress={progress} />}
          </ImageDisplay>
        </div>
      )}
    </div>
  )
}

export default App
