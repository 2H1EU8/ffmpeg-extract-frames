// VideoUploader.jsx

import { useState } from 'react';
import axios from 'axios';

const VideoUploader = () => {
  const [videoFile, setVideoFile] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setVideoFile(file);
  };

  const uploadVideo = async () => {
    if (!videoFile) {
      console.error('Please select a video file');
      return;
    }

    const formData = new FormData();
    formData.append('video', videoFile);

    try {
      const response = await axios.post('http://localhost:3001/api/upload', formData);
      console.log('Video uploaded successfully', response.data);
      // Handle response as needed
    } catch (error) {
      console.error('Error uploading video', error);
      // Handle error
    }
  };

  return (
    <div>
      <input type="file" accept="video/*" onChange={handleFileChange} name="video" />
      <button onClick={uploadVideo}>Upload Video</button>
      {/* Add additional UI or controls as needed */}
    </div>
  );
};

export default VideoUploader;