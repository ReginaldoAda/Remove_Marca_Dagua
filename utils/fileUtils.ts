
export const fileToBase64 = (file: File): Promise<{ base64: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const parts = dataUrlToParts(result);
      if (parts) {
        resolve(parts);
      } else {
        reject(new Error("Falha ao converter arquivo para Base64."));
      }
    };
    reader.onerror = error => reject(error);
  });
};

export const dataUrlToParts = (dataUrl: string): { base64: string; mimeType: string } => {
    const [header, data] = dataUrl.split(',');
    const mimeTypeMatch = header.match(/:(.*?);/);
  
    if (!data || !mimeTypeMatch || !mimeTypeMatch[1]) {
      throw new Error("Data URL inválido.");
    }
  
    return { base64: data, mimeType: mimeTypeMatch[1] };
};
