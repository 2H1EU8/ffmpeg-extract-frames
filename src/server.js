import express from 'express';
import multer from 'multer';
import path from 'path';
import cors from 'cors';
import ffmpeg from 'fluent-ffmpeg';
import { getVideoDurationInSeconds } from 'get-video-duration';


const app = express();
const port = 3001;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public'); // Save the file in the 'public' directory
  },
  filename: function (req, file, cb) {
    const originalname = file.originalname;
    cb(null, originalname);
  },
});

const upload = multer({ storage });

// Enable CORS for all routes
app.use(cors());

app.post('/api/upload', upload.single('video'), async (req, res) => {
  try {
    const fileName = req.file.filename;
    const fileSize = req.file.size;
    const videoPath = path.join('./public', fileName); // Video path in the 'public' directory

    console.log('File uploaded successfully!');
    console.log('File Name:', fileName);
    console.log('File Size:', fileSize, 'bytes');

    // Extract a frame from the video using FFmpeg
    const outputFramePath = path.join('./public', `${fileName.split('.').shift()}-frames`); // Frame path in the 'public' directory
    
    const getDuration = async () => {
        const duration = await getVideoDurationInSeconds(videoPath);
        return duration;
    }

    const duration = await getDuration()
    const nFrames = Math.ceil(duration / 3);
    const tm = Array.from({length: nFrames}, (_, index) => (index + 1) * 3 );


    ffmpeg(videoPath)
    .on('end', () => {
        console.log('Frame extracted successfully!');
        
        res.json({
          message: 'File uploaded and frame extracted successfully',
          fileName: fileName,
          fileSize: fileSize,
          frameUrl: `/frame_${Date.now()}.png`, // Provide a URL to access the extracted frame
        });
      })
      .on('error', (err) => {
        console.error('Error extracting frame:', err);
        res.status(500).json({ error: 'Internal server error' });
      })
      .screenshots({
        count: nFrames, // Calculate the number of frames based on the video duration and 4-second intervals
        folder: outputFramePath, // Specify the folder for the screenshots
        filename: 'frame_%d.png',
        timemarks: tm.map((mark) => mark.toString()),
      });
  } catch (error) {
    console.error('Error handling file upload:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
 