'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Stage, Layer, Image, Text } from 'react-konva';
import useImage from 'use-image';
import { removeBackground } from '../utils/backgroundRemoval';

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [textPosition, setTextPosition] = useState({ x: 50, y: 50 });
  const [processedImage, setProcessedImage] = useState<HTMLCanvasElement | null>(null);
  const [backgroundImage] = useImage(image ? URL.createObjectURL(image) : '');
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setImage(file);
      setIsProcessing(true);

      // Create an image element
      const img = new Image();
      img.src = URL.createObjectURL(file);
      
      img.onload = async () => {
        try {
          const processedCanvas = await removeBackground(img);
          setProcessedImage(processedCanvas);
        } catch (error) {
          console.error('Error processing image:', error);
        } finally {
          setIsProcessing(false);
        }
      };
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    }
  });

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Textify</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                ${isDragActive ? 'border-primary bg-blue-50' : 'border-gray-300'}`}
            >
              <input {...getInputProps()} />
              {image ? (
                <p>Image uploaded: {image.name}</p>
              ) : (
                <p>Drag and drop an image here, or click to select</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Text</label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter text to appear behind the image"
              />
            </div>

            {isProcessing && (
              <div className="text-center text-gray-600">
                Processing image...
              </div>
            )}
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Stage width={500} height={500}>
              <Layer>
                {/* Background layer */}
                {backgroundImage && (
                  <Image
                    image={backgroundImage}
                    width={500}
                    height={500}
                    fit="contain"
                  />
                )}
                
                {/* Text layer */}
                {text && (
                  <Text
                    text={text}
                    x={textPosition.x}
                    y={textPosition.y}
                    fontSize={32}
                    fill="black"
                    draggable
                    onDragEnd={(e) => {
                      setTextPosition({
                        x: e.target.x(),
                        y: e.target.y(),
                      });
                    }}
                  />
                )}

                {/* Foreground layer (processed image) */}
                {processedImage && (
                  <Image
                    image={processedImage}
                    width={500}
                    height={500}
                    fit="contain"
                  />
                )}
              </Layer>
            </Stage>
          </div>
        </div>
      </div>
    </main>
  );
} 