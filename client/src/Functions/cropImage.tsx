import { useState, useCallback, ReactElement } from "react";
import Cropper, { Area } from "react-easy-crop";
import React from "react";

interface croppedData {
  croppedDataUrl: string;
  croppedImgFile: File;
}

interface ImageUploaderProps {
  inputElement: ReactElement<{ onChange }>;
  onImageCropped?: (croppedImg: croppedData | null) => void;
}

const InputWrapper = ({
  children,
  onChange,
}: {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  children: ReactElement<{ onChange }>;
}) => {
  return React.cloneElement(children, { onChange });
};

export default function ImageUploader({
  inputElement,
  onImageCropped,
}: ImageUploaderProps) {
  const [image, setImage] = useState<string | undefined>(undefined);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isCropping, setIsCropping] = useState(false); // Controls the crop UI
  const [fileName, setFileName] = useState<string | null>(null);

  const onCropComplete = useCallback(
    (_croppedArea: Area, croppedPixels: Area) => {
      setCroppedAreaPixels(croppedPixels);
    },
    []
  );

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
        setFileName(file.name);
        setIsCropping(true); // Show crop UI
        event.target.value = "";
      };
      reader.readAsDataURL(file);
    }
  };

  function dataURLtoFile(dataUrl: string, filename: string): File {
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || "";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  }

  const handleSaveCrop = async () => {
    if (!image || !croppedAreaPixels || !fileName) return;
    const img = await createImage(image);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    ctx.drawImage(
      img,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );

    const croppedDataUrl = canvas.toDataURL("image/jpeg");
    const croppedImgFile = dataURLtoFile(croppedDataUrl, fileName);
    setIsCropping(false);

    if (onImageCropped) {
      onImageCropped({ croppedDataUrl, croppedImgFile }); // Send the image to the parent
    }
  };

  const handleCancelCrop = () => {
    setIsCropping(false);
    setImage(undefined);
    if (onImageCropped) {
      onImageCropped(null);
    }
  };

  return (
    <div className="image-input-container">
      <InputWrapper onChange={handleImageUpload}>{inputElement}</InputWrapper>

      {isCropping && (
        <div className="cropper-wrapper">
          <div className="react-crop-div">
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              aspect={1}
              minZoom={1}
              maxZoom={5}
              zoomSpeed={0.1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <div className="cropping-buttons">
            <button onClick={handleCancelCrop} className="cancel-crop-button">
              Cancel
            </button>
            <button onClick={handleSaveCrop} className="save-crop-button">
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to create an Image object
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
