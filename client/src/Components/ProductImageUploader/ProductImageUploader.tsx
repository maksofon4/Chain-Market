import { useState } from "react";
import ImageUploader from "../../Functions/media/cropImage";
import "./ProductImageUploader.css";

interface ProductImageUploaderProps {
  inputId: number;
  onImageCropped: (croppedImg: croppedData | null) => void;
}

interface croppedData {
  croppedDataUrl: string;
  croppedImgFile: File;
}

export default function ProductImageUploader({
  inputId,
  onImageCropped,
}: ProductImageUploaderProps) {
  const [croppedImage, setCroppedImage] = useState<string | null>(null);

  const handleCancelCrop = () => {
    onImageCropped(null);
    setCroppedImage(null);
  };

  return (
    <div className="product-image-uploader-container">
      {!croppedImage && (
        <label htmlFor={`new-photo-input${inputId}`}>
          <div className="img-input-container">
            <div className="input-icons-wrapper">
              <svg className="icon icon-envelop" viewBox="0 0 35 32">
                <use xlinkHref="symbol-defs.svg#icon-image"></use>
              </svg>
              <p>Upload image</p>
            </div>
          </div>
        </label>
      )}
      <ImageUploader
        inputElement={
          <input
            type="file"
            style={{ display: "none" }}
            id={`new-photo-input${inputId}`}
          />
        }
        onImageCropped={(data) => {
          console.log(data);
          onImageCropped(data);
          if (data?.croppedDataUrl) setCroppedImage(data.croppedDataUrl);
        }}
      />
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
