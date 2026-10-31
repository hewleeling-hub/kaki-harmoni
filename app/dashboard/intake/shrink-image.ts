/**
 * A copy of the photo small enough to send for reading.
 *
 * A phone photo is routinely 4–8 MB. Vercel refuses a request body over about
 * 4.5 MB before the route ever runs, and the reader has its own image size
 * limit, so the full-size file would fail with an error that says nothing
 * useful. The model downsamples to roughly 1,500px on the long edge anyway,
 * so 2,000px loses nothing it could have read. ONLY the copy sent for reading
 * is shrunk — the signed form that gets filed is the original, untouched.
 * Anything that goes wrong here falls back to the original rather than
 * blocking the read.
 */
export async function shrinkForReading(file: File): Promise<File> {
  const SMALL_ENOUGH = 3 * 1024 * 1024;
  if (file.size <= SMALL_ENOUGH || !file.type.startsWith("image/")) return file;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
    return blob ? new File([blob], "form-for-reading.jpg", { type: "image/jpeg" }) : file;
  } catch {
    return file;
  }
}
