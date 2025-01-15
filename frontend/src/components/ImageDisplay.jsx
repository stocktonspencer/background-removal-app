const ImageDisplay = ({ title, src, loading, children }) => {
  return (
    <div className="imageDisplay">
      <h3>{title}</h3>
      {loading ? (
        children
      ) : (
        src && (
          <div>
            <img src={src} alt={title} />
            {children}
          </div>
        )
      )}
    </div>
  )
}

export default ImageDisplay
