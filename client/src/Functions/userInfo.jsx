import React, { useState, useEffect } from "react";

// Function to fetch user profile data
export function UserProfile({ data, userId, dataType }) {
  // Function to find user profile photo by userId
  const userProfilePhoto = (data, userId) => {
    const user = data.find((user) => user.userId === userId);
    return user ? user.profilePhoto : null;
  };

  // Function to find user username by userId
  const userUsername = (data, userId) => {
    const user = data.find((user) => user.userId === userId);
    return user ? user.username : null;
  };

  // State for profile photo and username
  const [dataValue, setDataValue] = useState(null);

  useEffect(() => {
    if (dataType === "photo") {
      setDataValue(userProfilePhoto(data, userId));
    } else if (dataType === "name") {
      setDataValue(userUsername(data, userId));
    }
  }, [data, userId, dataType]);

  if (dataType === "photo") {
    return <img src={dataValue || "default-profile-photo.png"} alt="Profile" />;
  } else if (dataType === "name") {
    return <p className="username">{dataValue || "Anonymous"}</p>;
  }
}
