import './ImageUpload.css'

const ImageUpload = (props) => {
    const ShowImageHandler = (e) => {
        e.target.files[0] && console.log(e.target.files[0]);
        if (e.target.files[0]) {
            props.onImageUpload(e.target.files[0]);
        }
    };

  return (
    <div className="image-upload">
      <label htmlFor="file-upload" className="custom-file-upload">
      <input id="file-upload" type="file" onChange={ShowImageHandler} />
      <span className="file-name">Select or drag an image here</span>
      </label>
    </div>
  )
}

export default ImageUpload
