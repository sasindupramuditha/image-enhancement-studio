import './ImagePreview.css'
import Loading from './Loading'

const ImagePreview = (props) => {
  return (
    <div className="image-preview">
      <div className="preview-card">
        <h2>Original Image</h2>
        <div className="preview-box" aria-live="polite">
          {props.selectedImage ? (
            <img src={props.selectedImage} alt="Preview" className="image-preview-image" />
          ) : (
            <div className="image-preview-text">No Image Selected</div>
          )}
        </div>
      </div>

      <div className="preview-card">
        <h2>Enhanced Image</h2>
        <div className="preview-box" aria-live="polite">
          {props.loading ? (
            <Loading />
          ) : props.enhancedImage ? (
            <img src={props.enhancedImage} alt="Preview" className="image-preview-image" />
          ) : (
            <div className="image-preview-text">No Enhanced Image</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ImagePreview