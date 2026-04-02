import heic2any from "heic2any";
export function isHeicFile(file: File): boolean {
    const fileName = file.name.toLowerCase();
    return fileName.endsWith(".heic") || fileName.endsWith(".heif");
}
export async function convertHeicToJpeg(file: File): Promise<Blob> {
    if (!isHeicFile(file)) {
        return file;
    }
    try {
        const convertedBlobs = await heic2any({
            blob: file,
            toType: "image/jpeg",
            quality: 0.9,
        });
        const blob = Array.isArray(convertedBlobs) ? convertedBlobs[0] : convertedBlobs;
        if (blob instanceof Blob) {
            return blob;
        }
        return file;
    }
    catch (error) {
        console.error("Error converting HEIC file:", error);
        return file;
    }
}
export async function createImagePreviewUrl(file: File): Promise<string> {
    const convertedBlob = await convertHeicToJpeg(file);
    return URL.createObjectURL(convertedBlob);
}
