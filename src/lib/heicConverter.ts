import heic2any from "heic2any";

/**
 * Checks if a file is a HEIC/HEIF image
 */
export function isHeicFile(file: File): boolean {
  const fileName = file.name.toLowerCase();
  return fileName.endsWith(".heic") || fileName.endsWith(".heif");
}

/**
 * Converts HEIC file to JPEG blob for browser display
 * Returns the original file if it's not a HEIC file
 */
export async function convertHeicToJpeg(file: File): Promise<Blob> {
  if (!isHeicFile(file)) {
    // Not a HEIC file, return as-is
    return file;
  }

  try {
    // Convert HEIC to JPEG
    const convertedBlobs = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.9,
    });

    // heic2any returns an array, get the first blob
    const blob = Array.isArray(convertedBlobs) ? convertedBlobs[0] : convertedBlobs;
    
    if (blob instanceof Blob) {
      return blob;
    }
    
    // Fallback: return original file if conversion fails
    return file;
  } catch (error) {
    console.error("Error converting HEIC file:", error);
    // Return original file if conversion fails
    return file;
  }
}

/**
 * Creates a preview URL for an image file, converting HEIC if necessary
 * Returns a promise that resolves to the preview URL
 */
export async function createImagePreviewUrl(file: File): Promise<string> {
  const convertedBlob = await convertHeicToJpeg(file);
  return URL.createObjectURL(convertedBlob);
}

