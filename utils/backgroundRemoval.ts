import * as bodyPix from '@tensorflow-models/body-pix';
import * as tf from '@tensorflow/tfjs';

export async function removeBackground(imageElement: HTMLImageElement): Promise<HTMLCanvasElement> {
  // Load the BodyPix model
  const net = await bodyPix.load({
    architecture: 'MobileNetV1',
    outputStride: 16,
    multiplier: 0.75,
    quantBytes: 2
  });

  // Perform segmentation
  const segmentation = await net.segmentPerson(imageElement, {
    flipHorizontal: false,
    internalResolution: 'medium',
    segmentationThreshold: 0.7
  });

  // Create a canvas to draw the result
  const canvas = document.createElement('canvas');
  canvas.width = imageElement.width;
  canvas.height = imageElement.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Draw the original image
  ctx.drawImage(imageElement, 0, 0);

  // Get the image data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;

  // Apply the segmentation mask
  for (let i = 0; i < segmentation.data.length; i++) {
    const pixelIndex = i * 4;
    if (!segmentation.data[i]) {
      // Set background pixels to transparent
      pixels[pixelIndex + 3] = 0;
    }
  }

  // Put the modified image data back
  ctx.putImageData(imageData, 0, 0);

  // Clean up
  tf.dispose(segmentation);
  net.dispose();

  return canvas;
} 