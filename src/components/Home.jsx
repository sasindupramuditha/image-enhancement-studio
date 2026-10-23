import React from 'react'
import ImageUpload from './ImageUpload';
import ImagePreview from './ImagePreview';
import { enhanceImageAPI } from '../utils/enhancedImageApi';

const Home = () => {
    const [selectedImage, setSelectedImage] = React.useState(null);
    const [enhancedImage, setEnhancedImage] = React.useState(null);
    const [loading, setLoading] = React.useState(false);

    const handleImageUpload = async (image) => {
        console.log('Image uploaded:', image);
        setSelectedImage(URL.createObjectURL(image));
        setLoading(true);

        try{
          const enhancedURL = await enhanceImageAPI(image);
          setEnhancedImage(enhancedURL);
        } catch (error) {
          console.error('Error enhancing image:', error);
          const message = error instanceof Error
            ? error.message
            : 'Failed to enhance image. Please try again.';
          alert(message);
        } finally {
          setLoading(false);
        }
    };
  return (
    <main className="home">
      <ImageUpload onImageUpload={handleImageUpload} />
      <ImagePreview 
        selectedImage={selectedImage}
        enhancedImage={enhancedImage}
        loading={loading}
      />

    </main>
  )
}

export default Home
