const UploadButton = ({ onImageUpload, filename }) => {
  return (
    <div className="uploadContainer">
      <label className="uploadButton">
        Upload Image
        <input 
          type="file" 
          accept="image/*" 
          onChange={onImageUpload}
          style={{ display: 'none' }}
        />
      </label>
      {filename && (
        <span>{filename}</span>
      )}
    </div>
  )
}

export default UploadButton
