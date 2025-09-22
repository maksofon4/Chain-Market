import { useState } from "react";
import ImageUploader from "Functions/media/cropImage";
import "./profile.css";
import { useAppDispatch, useAppSelector } from "hooks/redux";
import { fetchUser } from "store/reducers/userReducer/ActionCreator";

interface croppedData {
  croppedDataUrl: string;
  croppedImgFile: File;
}

const ProfileSettings = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.userReducer);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<number[]>([]);
  const [email, setEmail] = useState<string | undefined>(undefined);
  const [accountPassword, setAccountPassword] = useState<string | undefined>(
    undefined
  );
  const [username, setUsername] = useState<string | undefined>(undefined);
  const [newPassword, setNewPassword] = useState<string | undefined>(undefined);
  const [profileImage, setProfileImage] = useState<croppedData | null>(null);

  const toggleDropdown = (id: number | null) => {
    setOpenDropdown(openDropdown === id ? null : id);
    setEmail(undefined);
    setAccountPassword(undefined);
    setUsername(undefined);
    setNewPassword(undefined);
  };

  const toggleShowPassword = (inputId) => {
    setVisiblePasswords((prev) =>
      prev.includes(inputId)
        ? prev.filter((id) => id !== inputId)
        : [...prev, inputId]
    );
  };

  const upadateProfileInfo = async (infoType: string) => {
    let data = {
      email: email,
      username: username,
      currentpassword: accountPassword,
      password: newPassword,
    };

    if (infoType !== "profile-photo" && accountPassword) {
      try {
        const response = await fetch("/api/update-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          const result = await response.json();
          alert(result.message);
          dispatch(fetchUser());
        } else {
          const error = await response.json();
          alert(error.message || "An error occurred.");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    } else {
      if (!user || !profileImage?.croppedImgFile || !accountPassword) return;

      const formData = new FormData();
      console.log(profileImage.croppedImgFile);
      formData.append("type", "profilePhoto");
      formData.append("profilePhoto", profileImage.croppedImgFile);
      formData.append("currentPassword", accountPassword);
      try {
        const response = await fetch("/api/update-profile-photo", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          alert(result.message);
          dispatch(fetchUser());
        } else {
          const error = await response.json();
          alert(error.message || "An error occurred.");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  return (
    <div className="profileSettingsContainer">
      <div
        className={
          openDropdown === 1
            ? "profileItemContainer Active"
            : "profileItemContainer"
        }
        onClick={() => toggleDropdown(1)}
      >
        <div className="profileItem">
          <p className="profileItemText">Change email</p>
          <svg viewBox="0 0 35 32" className="icon-arrow-down">
            <use xlinkHref="symbol-defs.svg#icon-arrow-down-new"></use>
          </svg>
        </div>

        <div
          className="profileOptionDropDown"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="borderLine"></span>
          <p className="profileItemTextSecondary">New email</p>
          <div className="inputWrapper">
            <input
              type="text"
              value={email ? email : ""}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <span className="borderLine"></span>
          <p className="profileItemTextSecondary">Account password</p>
          <div className="inputWrapper">
            <input
              type={visiblePasswords.includes(1) ? "text" : "password"}
              value={accountPassword ? accountPassword : ""}
              onChange={(e) => setAccountPassword(e.target.value)}
            />
            <button
              className="showPasswordButton"
              type="button"
              onClick={() => toggleShowPassword(1)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              {visiblePasswords.includes(1) ? (
                <svg className="icon icon-eye">
                  <use xlinkHref="symbol-defs.svg#icon-eye"></use>
                </svg>
              ) : (
                <svg className="icon icon-eye-blocked">
                  <use xlinkHref="symbol-defs.svg#icon-eye-blocked"></use>
                </svg>
              )}
            </button>
          </div>
          <button
            className="confirmChangesButton"
            onClick={() => upadateProfileInfo("email")}
          >
            Confirm
          </button>
        </div>
      </div>

      <div
        className={
          openDropdown === 2
            ? "profileItemContainer Active"
            : "profileItemContainer"
        }
        onClick={() => toggleDropdown(2)}
      >
        <div className="profileItem" onClick={() => toggleDropdown(2)}>
          <p className="profileItemText">Change password</p>
          <svg viewBox="0 0 35 32" className="icon-arrow-down">
            <use xlinkHref="symbol-defs.svg#icon-arrow-down-new"></use>
          </svg>
        </div>

        <div
          className="profileOptionDropDown"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="borderLine"></span>
          <p className="profileItemTextSecondary">Old password</p>
          <div className="inputWrapper">
            <input
              type={visiblePasswords.includes(2) ? "text" : "password"}
              onChange={(e) => setAccountPassword(e.target.value)}
            />
            <button
              className="showPasswordButton"
              type="button"
              onClick={() => toggleShowPassword(2)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              {visiblePasswords.includes(2) ? (
                <svg className="icon icon-eye">
                  <use xlinkHref="symbol-defs.svg#icon-eye"></use>
                </svg>
              ) : (
                <svg className="icon icon-eye-blocked">
                  <use xlinkHref="symbol-defs.svg#icon-eye-blocked"></use>
                </svg>
              )}
            </button>
          </div>
          <span className="borderLine"></span>
          <p className="profileItemTextSecondary">New password</p>
          <div className="inputWrapper">
            <input
              type={visiblePasswords.includes(3) ? "text" : "password"}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button
              className="showPasswordButton"
              type="button"
              onClick={() => toggleShowPassword(3)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              {visiblePasswords.includes(3) ? (
                <svg className="icon icon-eye">
                  <use xlinkHref="symbol-defs.svg#icon-eye"></use>
                </svg>
              ) : (
                <svg className="icon icon-eye-blocked">
                  <use xlinkHref="symbol-defs.svg#icon-eye-blocked"></use>
                </svg>
              )}
            </button>
          </div>
          <button
            className="confirmChangesButton"
            onClick={() => upadateProfileInfo("password")}
          >
            Confirm
          </button>
        </div>
      </div>
      <div
        className={
          openDropdown === 3
            ? "profileItemContainer Active"
            : "profileItemContainer"
        }
        onClick={() => toggleDropdown(3)}
      >
        <div className="profileItem" onClick={() => toggleDropdown(3)}>
          <p className="profileItemText">Change name</p>
          <svg viewBox="0 0 35 32" className="icon-arrow-down">
            <use xlinkHref="symbol-defs.svg#icon-arrow-down-new"></use>
          </svg>
        </div>

        <div
          className="profileOptionDropDown"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="borderLine"></span>
          <p className="profileItemTextSecondary">New name</p>
          <div className="inputWrapper">
            <input type="text" onChange={(e) => setUsername(e.target.value)} />
          </div>
          <span className="borderLine"></span>
          <p className="profileItemTextSecondary">Account password</p>
          <div className="inputWrapper">
            <input
              type={visiblePasswords.includes(4) ? "text" : "password"}
              onChange={(e) => setAccountPassword(e.target.value)}
            />
            <button
              className="showPasswordButton"
              type="button"
              onClick={() => toggleShowPassword(4)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              {visiblePasswords.includes(4) ? (
                <svg className="icon icon-eye">
                  <use xlinkHref="symbol-defs.svg#icon-eye"></use>
                </svg>
              ) : (
                <svg className="icon icon-eye-blocked">
                  <use xlinkHref="symbol-defs.svg#icon-eye-blocked"></use>
                </svg>
              )}
            </button>
          </div>
          <button
            className="confirmChangesButton"
            onClick={() => upadateProfileInfo("name")}
          >
            Confirm
          </button>
        </div>
      </div>
      <div
        className={
          openDropdown === 4
            ? "profileItemContainer Active"
            : "profileItemContainer"
        }
        onClick={() => toggleDropdown(4)}
      >
        <div className="profileItem" onClick={() => toggleDropdown(4)}>
          <p className="profileItemText">Change profile photo</p>
          <svg viewBox="0 0 35 32" className="icon-arrow-down">
            <use xlinkHref="symbol-defs.svg#icon-arrow-down-new"></use>
          </svg>
        </div>

        <div
          className="profileOptionDropDown"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="borderLine"></span>
          <div className="image-text-container">
            <div className="image-uploader-container">
              {!profileImage && (
                <div className="prevImage">
                  <h2>Current photo</h2>
                  <label htmlFor="new-photo-input">
                    <div className="imgWrapper">
                      <p id="change-photo-word">Change</p>
                      <img src={user?.profilePhoto} alt="currentImg" />
                    </div>
                  </label>
                  <ImageUploader
                    inputElement={
                      <input
                        type="file"
                        style={{ display: "none" }}
                        id="new-photo-input"
                      />
                    }
                    onImageCropped={(data) => {
                      setProfileImage(data);
                    }}
                  />
                </div>
              )}
              {profileImage?.croppedDataUrl && (
                <div className="prevImage">
                  <h2>New photo</h2>
                  <div className="imgWrapper">
                    <img src={profileImage.croppedDataUrl} alt="Cropped" />
                    <button
                      onClick={() => setProfileImage(null)}
                      id="remove-img-button"
                    >
                      <svg className="icon icon-envelop" viewBox="0 0 35 32">
                        <use xlinkHref="symbol-defs.svg#icon-cross"></use>
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="sideText">
              <p>
                Your profile photo is visible for <span>everyone!</span>
              </p>
              <ul>
                <li>all customers</li>
                <li>people who aren't logged in</li>
                <li>admins</li>
              </ul>
              <p>
                So make sure your photo is neutral and doesn't violate the
                &nbsp;
                <a href="">rules of community</a>
              </p>
            </div>
          </div>

          <span className="borderLine"></span>
          <p className="profileItemTextSecondary">Account password</p>
          <div className="inputWrapper">
            <input
              type={visiblePasswords.includes(5) ? "text" : "password"}
              onChange={(e) => setAccountPassword(e.target.value)}
            />
            <button
              className="showPasswordButton"
              type="button"
              onClick={() => toggleShowPassword(5)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              {visiblePasswords.includes(5) ? (
                <svg className="icon icon-eye">
                  <use xlinkHref="symbol-defs.svg#icon-eye"></use>
                </svg>
              ) : (
                <svg className="icon icon-eye-blocked">
                  <use xlinkHref="symbol-defs.svg#icon-eye-blocked"></use>
                </svg>
              )}
            </button>
          </div>
          <button
            className="confirmChangesButton"
            onClick={() => upadateProfileInfo("profile-photo")}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
