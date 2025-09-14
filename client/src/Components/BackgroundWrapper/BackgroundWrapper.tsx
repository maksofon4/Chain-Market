import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const BackgroundWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const location = useLocation();
  const customBackground = "images/mainbackgroundGrey2.png";
  const customBackgroundMiddle = "images/customBackgroundMiddle.png";
  const customBackgroundSmall = "images/customBackgroundSmall.png";

  const [backgroundImage, setBackgroundImage] = useState(customBackground);

  // Define the background images inside the component
  const backgroundMap: { [key: string]: string } = {
    "/": backgroundImage,
    "/login": backgroundImage,
    "/register": backgroundImage,
  };

  // Function to update background based on screen width
  const updateBackgroundImage = () => {
    const width = window.innerWidth;
    if (width < 500) {
      setBackgroundImage(customBackgroundSmall);
    } else if (width < 1000) {
      setBackgroundImage(customBackgroundMiddle);
    } else {
      setBackgroundImage(customBackground);
    }
  };

  useEffect(() => {
    // Set the initial background image based on the screen width
    updateBackgroundImage();

    window.addEventListener("resize", updateBackgroundImage);

    return () => {
      window.removeEventListener("resize", updateBackgroundImage);
    };
  }, []);

  useEffect(() => {
    const background = backgroundMap[location.pathname] || "none";
    document.body.style.backgroundImage =
      background !== "none" ? `url(${background})` : `none`;

    if (background !== "none") {
      document.body.style.backgroundPosition = "center";
      document.body.style.backgroundRepeat = "repeat";
      document.body.style.width = "100%";
    }
  }, [location, backgroundImage]);

  return <>{children}</>;
};

export default BackgroundWrapper;
