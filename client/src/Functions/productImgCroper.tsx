import { useState, useCallback } from "react";
import Cropper, { Area } from "react-easy-crop";
import "./productImgCroper.css";

interface ProductImageUploaderProps {
  onImageCropped: (croppedImg: string | null) => void;
}

export default function ProductImageUploader({
  onImageCropped,
}: ProductImageUploaderProps) {
  const [image, setImage] = useState<string | undefined>(undefined);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isCropping, setIsCropping] = useState(false); // Controls the crop UI

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
        setIsCropping(true); // Show crop UI
        event.target.value = "";
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCrop = async () => {
    if (!image || !croppedAreaPixels) return;
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
    setCroppedImage(croppedDataUrl);
    setIsCropping(false);

    if (onImageCropped) {
      onImageCropped(croppedDataUrl); // Send the image to the parent
    }
  };

  const handleCancelCrop = () => {
    setIsCropping(false);
    setImage(undefined);
    setCroppedImage(null);
    if (onImageCropped) {
      onImageCropped(null);
    }
  };

  return (
    <div className="product-image-uploader-container">
      {!croppedImage && (
        <label htmlFor="new-product-img-input">
          <div className="img-input-container">
            <div className="input-icons-wrapper">
              <svg className="icon icon-envelop" viewBox="0 0 35 32">
                <use xlinkHref="symbol-defs.svg#icon-image"></use>
              </svg>
              <p>Upload image</p>
            </div>
            <input
              id="new-product-img-input"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>
        </label>
      )}
      {isCropping && (
        <div className="product-img-cropper-wrapper">
          <div className="product-img-react-crop-div">
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <div className="product-img-cropping-buttons">
            <button
              onClick={handleCancelCrop}
              className="product-img-cancel-crop-button"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveCrop}
              className="product-img-save-crop-button"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {croppedImage && (
        <div className="product-img-prev">
          <div className="product-img-wrapper">
            <img src={croppedImage} alt="Cropped" />
            <button
              onClick={() => {
                handleCancelCrop();
              }}
              id="remove-product-img-button"
            >
              <svg className="icon icon-envelop" viewBox="0 0 35 32">
                <use xlinkHref="symbol-defs.svg#icon-cross"></use>
              </svg>
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
