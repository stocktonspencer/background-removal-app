function ProgressBar({ progress }) {
  return (
    <>
      <p>Processing...</p>
      <div className="progressContainer">
        <div
          className="progressBar"
          style={{ width: `${progress}%` }}
        />
      </div>
    </>
  )
}

export default ProgressBar