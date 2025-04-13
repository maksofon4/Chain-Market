const fs = require("fs");
const path = require("path");
const multer = require("multer");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const bodyParser = require("body-parser");
const session = require("express-session");

const usersFilePath = path.join(__dirname, "dataFolder", "userData.json");
const chatDirectory = path.join(__dirname, "chats");

function checkLogin(req, res, next) {
  console.log("Session:", req.session);
  if (!req.session.userId) {
    req.session.returnTo = req.originalUrl;
    return res.redirect("/login");
  }
  next();
}

module.exports = (app) => {
  const sessionMiddleware = session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "strict",
    },
  });

  app.use(sessionMiddleware);

  app.use(bodyParser.json());
  app.post("/join", (req, res) => {
    const userId = req.body.userId;
    if (!userId) {
      return res.status(400).send("User ID is required");
    }
    req.session.userId = userId;
    req.session.username = userName;
    req.session.save(() => {
      res.send(`User ${userId} joined!`);
    });
  });

  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "client", "public", "index.html"));
  });

  app.get("/Start", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "Start.html"));
  });

  app.get("/search-Ads", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "searchAds.html"));
  });
  app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "register.html"));
  });
  app.get("/api/server-ip", (req, res) => {
    res.json({ ip: localIp + ":" + port });
  });
  app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
  });
  app.get("/add-product", checkLogin, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "AddProduct.html"));
  });
  app.get("/profile", checkLogin, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "profile.html"));
  });
  // The Express route to serve the messages page
  app.get("/messages", checkLogin, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "messages.html"));
  });

  // Serve the chat page for a specific chat ID
  app.get("/messages/chat/:chatId", checkLogin, (req, res) => {
    const chatId = req.params.chatId;
    res.sendFile(path.join(__dirname, "public", "messages.html"));
  });

  app.get("/session-info", (req, res) => {
    if (req.session.userId) {
      req.session.save();
      const users = JSON.parse(fs.readFileSync(usersFilePath, "utf8"));
      const user = users.find((u) => u.userId === req.session.userId);

      if (user) {
        res.json({
          userId: user.userId,
          username: user.username,
          email: user.email,
          profilePhoto: user.profilePhoto ?? "/images/UserIcon.png",
          pinnedChats: user.pinnedChats,
          selectedProducts: user.selectedProducts,
        });
      } else {
        res.json({ userId: null });
      }
    } else {
      res.json({ userId: null });
    }
  });

  app.get("/user-posted-products", (req, res) => {
    const filePath = path.join(__dirname, "dataFolder", "data.json");
    if (req.session.userId) {
      // Read user and product data
      try {
        const users = JSON.parse(fs.readFileSync(usersFilePath, "utf8"));
        const products = JSON.parse(fs.readFileSync(filePath, "utf8"));
        const imageBaseUrl = "/uploads/";

        // Find the logged-in user
        const user = users.find((u) => u.userId === req.session.userId);

        if (user) {
          let userProducts = products.filter(
            (product) => product.userId === user.userId
          );

          // Add imageBaseUrl to each image in each product
          userProducts = userProducts.map((product) => ({
            ...product,
            images: product.images.map((img) => imageBaseUrl + img),
          }));
          res.json({
            products: userProducts,
          });
        } else {
          res.status(404).json({ error: "User not found." });
        }
      } catch (err) {
        console.error("Error reading files:", err);
        res.status(500).json({ error: "Internal server error." });
      }
    } else {
      res.status(401).json({ error: "Unauthorized. Please log in." });
    }
  });

  app.get("/New-ads", (req, res) => {
    const dataPath = path.join(__dirname, "dataFolder", "data.json");
    const usersPath = path.join(__dirname, "dataFolder", "userData.json");
    const imageBaseUrl = "/uploads/";

    try {
      // Read and parse product data
      const productsData = JSON.parse(fs.readFileSync(dataPath, "utf8"));
      // Read and parse user data
      const usersData = JSON.parse(fs.readFileSync(usersPath, "utf8"));

      // Get the first 16 products
      const products = productsData.slice(0, 16);

      // Map each product with user data
      const enrichedProducts = products.map((product) => {
        const user =
          usersData.find((user) => user.userId === product.userId) || {};
        return {
          ...product,
          user: {
            username: user.username || "Unknown User",
            userId: user.userId,
            profilePhoto: user.profilePhoto || "/images/UserIcon.png",
          },
        };
      });

      // Send enriched products and image base URL
      res.json({
        products: enrichedProducts,
        imageBaseUrl,
      });
    } catch (error) {
      console.error("Error processing request:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/logout", function (req, res, next) {
    req.session.userId = null;
    req.session.save(function (err) {
      if (err) next(err);

      req.session.regenerate(function (err) {
        if (err) next(err);
        res.redirect("/");
      });
    });
  });

  app.get("/chat-history", (req, res) => {
    const userId = req.session.userId;
    const chatFilePath = path.join(__dirname, "chats", `${userId}.json`);
    if (fs.existsSync(chatFilePath)) {
      const chatData = JSON.parse(fs.readFileSync(chatFilePath, "utf-8"));

      // Group messages by other userId (either the sender or receiver)
      const chats = {};

      chatData.forEach((message) => {
        const otherUserId = message.from === userId ? message.to : message.from;

        // Initialize the chat for this user if it doesn't exist
        if (!chats[otherUserId]) {
          chats[otherUserId] = [];
        }

        // Push the message into the corresponding chat
        chats[otherUserId].push(message);
      });

      // Return the grouped chats for the user
      res.json(chats);
    } else {
      res.status(404).json({ error: "No chat history found for this user." });
    }
  });

  app.get("/get-pinned-chats", (req, res) => {
    const userId = req.session.userId;
    try {
      // Read the user data file
      const usersData = JSON.parse(fs.readFileSync(usersFilePath, "utf8"));

      // Find the user by userId
      const user = usersData.find((u) => u.userId === userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Return the pinnedChats array or an empty array if none exist
      const pinnedChats = user.pinnedChats || [];
      res.status(200).json({ pinnedChats });
    } catch (error) {
      console.error("Error retrieving pinned chats:", error);
      res.status(500).json({ error: "Failed to retrieve pinned chats" });
    }
  });

  app.get("/user-selected-products", (req, res) => {
    const dataPath = path.join(__dirname, "dataFolder", "data.json");
    const usersPath = path.join(__dirname, "dataFolder", "userData.json");
    const imageBaseUrl = "/uploads/";
    const userId = req.session.userId;

    try {
      const productsData = JSON.parse(fs.readFileSync(dataPath, "utf8"));
      const userData = JSON.parse(fs.readFileSync(usersPath, "utf8"));

      specificUserData = userData.find((user) => user.userId === userId);

      const selectedProductIds = specificUserData.selectedProducts || [];

      const selectedProducts = productsData.filter((product) =>
        selectedProductIds.includes(product.productId)
      );

      const enrichedProducts = selectedProducts.map((product) => {
        const user =
          userData.find((user) => user.userId === product.userId) || {};
        return {
          ...product,
          user: {
            username: user.username || "Unknown User",
            userId: user.userId,
            profilePhoto: user.profilePhoto || "/images/UserIcon.png",
          },
        };
      });
      res.json({
        products: enrichedProducts,
        imageBaseUrl,
      });
    } catch (error) {
      console.error("Error processing request:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/search-ads", (req, res) => {
    const dataPath = path.join(__dirname, "dataFolder", "data.json");
    const usersPath = path.join(__dirname, "dataFolder", "userData.json");
    let {
      searchText,
      location,
      category,
      priceFrom,
      priceTo,
      condition,
      tradePossible,
      page = 1, // Default to page 1 if no page is specified
    } = req.body;

    const itemsPerPage = 10;

    //Convert tradePossible into boolean, because it isn't from the client req
    if (tradePossible == "Trade is allowed") tradePossible = "true";
    if (tradePossible == "Trade isn't allowed") tradePossible = "false";

    try {
      // Read and parse product data
      const productsData = JSON.parse(fs.readFileSync(dataPath, "utf8"));
      const usersData = JSON.parse(fs.readFileSync(usersPath, "utf8"));

      // Filtering logic
      let filteredProducts = productsData.filter((product) => {
        return (
          (searchText === "" ||
            product.name.toLowerCase().includes(searchText.toLowerCase()) ||
            product.description
              .toLowerCase()
              .includes(searchText.toLowerCase())) &&
          (location === "" ||
            product.location.toLowerCase() === location.toLowerCase()) &&
          (category === "Any" ||
            product.category.toLowerCase() === category.toLowerCase()) &&
          (condition === "Any" ||
            product.condition.toLowerCase() === condition.toLowerCase()) &&
          (tradePossible === "Any" ||
            product.tradePossible.toString().toLowerCase() ===
              tradePossible.toLowerCase()) &&
          (priceFrom === "empty" ||
            parseFloat(product.priceUSD) >= parseFloat(priceFrom)) &&
          (priceTo === "empty" ||
            parseFloat(product.priceUSD) <= parseFloat(priceTo))
        );
      });

      // Get the total number of filtered products
      const totalFilteredProducts = filteredProducts.length;

      // Calculate total pages
      const totalPages = Math.ceil(totalFilteredProducts / itemsPerPage);

      // Pagination: Get the products for the current page
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = page * itemsPerPage;
      const productsForPage = filteredProducts.slice(startIndex, endIndex);

      // Enrich products with user data
      const enrichedProducts = productsForPage.map((product) => {
        const user =
          usersData.find((user) => user.userId === product.userId) || {};
        return {
          ...product,
          user: {
            username: user.username || "Unknown User",
            userId: user.userId,
            profilePhoto: user.profilePhoto || "/images/UserIcon.png",
          },
        };
      });

      // Send response with paginated products and metadata
      res.json({
        products: enrichedProducts,
        imageBaseUrl: "/uploads/",
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalProducts: totalFilteredProducts,
        },
      });
    } catch (error) {
      console.error("Error processing request:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/update-message-status", (req, res) => {
    const { forUserId, newStatus } = req.body; // Extract the recipient (forUserId) and new status
    const userId = req.session.userId;
    const chatFilePath = path.join(__dirname, "chats", `${userId}.json`);

    if (fs.existsSync(chatFilePath)) {
      let chatData = JSON.parse(fs.readFileSync(chatFilePath, "utf-8"));

      // Find messages for the given user (forUserId) with status 'new' and update their status
      let updated = false;

      // Loop through all messages and update those that match forUserId and have status 'new'
      chatData.forEach((message) => {
        if (
          (message.from === forUserId || message.to === forUserId) &&
          message.status === "new"
        ) {
          message.status = newStatus; // Update status to "checked"
          updated = true;
        }
      });

      if (updated) {
        // Save the updated chat data back to the file
        fs.writeFileSync(chatFilePath, JSON.stringify(chatData, null, 2));
        res.json({ success: true });
      } else {
        res
          .status(404)
          .json({ error: "No 'new' messages found for the specified user." });
      }
    } else {
      res.status(404).json({ error: "Chat history file not found." });
    }
  });

  app.get("/users", (req, res) => {
    try {
      const users = JSON.parse(fs.readFileSync(usersFilePath, "utf8"));

      const userData = users.map((user) => ({
        userId: user.userId,
        username: user.username,
        profilePhoto: user.profilePhoto ?? "/images/UserIcon.png",
      }));

      // Send the user data to the client
      res.json(userData);
    } catch (error) {
      console.error("Error reading users:", error);
      res.status(500).send("Error reading users");
    }
  });

  app.get("/selected-products", checkLogin, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "selectedProducts.html"));
  });

  app.get("/profile-options", checkLogin, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "profileOptions.html"));
  });

  app.get("/get-product-info", (req, res) => {
    const productInfo = req.session.productInfo;

    if (!productInfo) {
      return res.status(200).json({});
    }
    res.json(productInfo);
  });

  app.get("/clear-product-info", (req, res) => {
    delete req.session.productInfo;
    req.session.save((err) => {
      if (err) {
        console.error("Error saving session:", err);
        return res
          .status(500)
          .json({ message: "Failed to clear session data." });
      }
      res.json({ message: "Product information cleared." });
    });
  });

  app.post("/register", async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const chatFolderPath = path.join(__dirname, "chats"); // Folder for chat files
    const users = JSON.parse(fs.readFileSync(usersFilePath, "utf8"));

    const newUser = {
      userId: uuidv4(),
      username,
      email,
      password: hashedPassword,
    };

    users.push(newUser);

    // Save updated users list
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));

    // Ensure "chats" folder exists
    if (!fs.existsSync(chatFolderPath)) {
      fs.mkdirSync(chatFolderPath, { recursive: true });
    }
    const userChatFilePath = path.join(
      chatFolderPath,
      `${newUser.userId}.json`
    );

    fs.writeFileSync(userChatFilePath, JSON.stringify([], null, 2));

    res.status(200).json({ message: "Register successful" });
  });

  app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const users = JSON.parse(fs.readFileSync(usersFilePath, "utf8"));
    const user = users.find((u) => u.email === email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send("Invalid credentials.");
    }

    req.session.userId = user.userId;

    res.status(200).json({ message: "Login successful" });
  });

  const upload = multer({
    dest: "public/uploads/", // Uploads folder
    filename: (req, file, cb) => {
      // Generate a unique filename using UUID
      const uniqueName = uuidv4() + path.extname(file.originalname); // Add file extension
      cb(null, uniqueName); // Provide the generated filename to multer
    },
  });

  app.post("/upload-file-for-chat", upload.array("images"), (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).send({ message: "No files uploaded" });
      }

      // Collect file paths for all uploaded files
      const filePaths = req.files.map((file) => file.filename);

      // Respond with all file paths
      res.status(200).json({ filePaths });
    } catch (error) {
      console.error("Error uploading files:", error);
      res.status(500).send({ message: "Error uploading files" });
    }
  });

  app.post("/add-product", checkLogin, upload.array("images"), (req, res) => {
    try {
      const {
        name,
        category,
        description,
        location,
        priceUSD,
        condition,
        tradePossible,
        userContactDetails,
        formattedDateTime,
      } = req.body;
      let contactDetails;
      try {
        contactDetails = JSON.parse(userContactDetails);
      } catch (err) {
        return res
          .status(400)
          .send("Invalid contactDetails format. Expected a JSON string.");
      }

      const images = req.files.map((file) => file.filename);

      const filePath = path.join(__dirname, "dataFolder", "data.json");
      let products = [];
      if (fs.existsSync(filePath)) {
        const fileData = fs.readFileSync(filePath, "utf-8");
        if (fileData.trim()) {
          products = JSON.parse(fileData);
        }
      }

      const product = {
        productId: uuidv4(), // Now 'products' is defined
        userId: req.session.userId,
        name,
        category,
        description,
        location,
        priceUSD,
        condition,
        tradePossible,
        contactDetails,
        images,
        formattedDateTime,
      };

      products.push(product);

      fs.writeFileSync(filePath, JSON.stringify(products, null, 2)); // Pretty print for readability

      res.status(200).send("Product uploaded successfully!");
    } catch (error) {
      console.error("Error processing request:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  //This endpoint delete the specified product from server data
  app.post("/delete-product", (req, res) => {
    const dataFilePath = path.join(__dirname, "dataFolder", "data.json");
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        error: "Failed to delete product, valid product id is required",
      });
    }

    // Read the existing data
    fs.readFile(dataFilePath, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading file:", err);
        return res.status(500).json({ error: "Internal server error" });
      }

      let products;
      try {
        products = JSON.parse(data);
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError);
        return res.status(500).json({ error: "Internal server error" });
      }

      // Filter out the product with the given ID
      const updatedProducts = products.filter(
        (product) => product.productId !== productId
      );

      if (updatedProducts.length === products.length) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Write the updated data back to the file
      fs.writeFile(
        dataFilePath,
        JSON.stringify(updatedProducts, null, 2),
        "utf8",
        (writeError) => {
          if (writeError) {
            console.error("Error writing file:", writeError);
            return res.status(500).json({ error: "Internal server error" });
          }

          res.json({ success: true, message: "Product deleted successfully" });
        }
      );
    });
  });

  const readUsers = () => JSON.parse(fs.readFileSync(usersFilePath, "utf-8"));
  // Update profile data
  app.post("/update-profile", async (req, res) => {
    const { email, username, currentpassword, password } = req.body;
    const userId = req.session.userId;

    try {
      let users = readUsers();
      const user = users.find((u) => u.userId === userId);

      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      let updated = false; // Flag to track if any update was made

      // Update email or username if provided
      if (email && currentpassword) {
        const isMatch = await bcrypt.compare(currentpassword, user.password);
        if (isMatch) {
          user.email = email;
          updated = true;
        } else {
          return res
            .status(400)
            .json({ message: "Account password is incorrect." });
        }
      }
      if (username && currentpassword) {
        const isMatch = await bcrypt.compare(currentpassword, user.password);
        if (isMatch) {
          user.username = username;
          updated = true;
        } else {
          return res
            .status(400)
            .json({ message: "Account password is incorrect." });
        }
      }

      // If there was any update, save to the file
      if (updated) {
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
      }

      // Handle password change if current password is provided
      if (password && currentpassword) {
        const isMatch = await bcrypt.compare(currentpassword, user.password);

        if (isMatch) {
          const hashedPassword = await bcrypt.hash(password, 10);
          user.password = hashedPassword;
          updated = true; // Mark as updated

          // Save to the file if password is changed
          fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
        } else {
          return res
            .status(400)
            .json({ message: "Account password is incorrect." });
        }
      }

      if (updated) {
        return res.json({ message: "Profile updated successfully." });
      } else {
        return res.status(400).json({ message: "No changes detected." });
      }
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  });

  // Update profile photo
  app.post(
    "/update-profile-photo",
    upload.single("profileImg"),
    async (req, res) => {
      const { userId, currentpassword, profileImg } = req.body;
      const users = readUsers();
      const user = users.find((u) => u.userId === userId);

      if (!user) return res.status(404).json({ message: "User not found." });

      if (currentpassword) {
        const isMatch = await bcrypt.compare(currentpassword, user.password);

        if (!isMatch) {
          return res
            .status(400)
            .json({ message: "Account password is incorrect." });
        }
      }

      // Move file to permanent location
      const newPath = path.join(
        __dirname,
        "public",
        "uploads",
        req.file.filename
      );
      fs.renameSync(req.file.path, newPath);
      user.profilePhoto = `/uploads/${req.file.filename}`;

      fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
      res.json({ message: "Profile photo updated successfully." });
    }
  );

  app.post("/redirect-user-to-chat", (req, res) => {
    const userId = req.session.userId;
    const productInfo = req.body;

    if (!productInfo || Object.keys(productInfo).length === 0) {
      return res.status(400).json({ error: "No product data received" });
    }

    productInfo.imageBaseUrl = "/uploads/";
    productInfo.newchat = true;

    if (userId) {
      // Пользователь авторизован, обрабатываем чат
      const chatFilePath = path.join(__dirname, "chats", `${userId}.json`);

      if (fs.existsSync(chatFilePath)) {
        const chatFileContent = fs.readFileSync(chatFilePath, "utf-8");

        try {
          const chatData = JSON.parse(chatFileContent);

          if (Array.isArray(chatData)) {
            const hasMessages = chatData.some(
              (message) =>
                message.from === productInfo.user.userId ||
                message.to === productInfo.user.userId
            );

            if (hasMessages) {
              productInfo.newchat = false;
            }
          }
        } catch (error) {
          console.error("Error parsing chat file:", error);
        }
      }

      req.session.productInfo = productInfo;

      return res.json({ redirectUrl: "/messages" });
    } else {
      // Пользователь не авторизован → отправляем productInfo клиенту
      return res.json({ redirectUrl: "/messages", productInfo });
    }
  });

  app.post("/search-ads-redirect", (req, res) => {
    const { searchQuery, location } = req.body;
    // Construct the URL with query parameters
    const redirectUrl = `/search-Ads?query=${encodeURIComponent(
      searchQuery
    )}&location=${encodeURIComponent(location)}`;

    res.json({ redirectUrl });
  });

  app.post("/search-ads-categories-redirect", (req, res) => {
    const category = req.body.category;

    // Construct the URL with query parameters
    const redirectUrl = `/search-Ads?category=${encodeURIComponent(category)}`;
    res.json({ redirectUrl });
  });

  app.post("/delete-chats", (req, res) => {
    const { userId, chatIds } = req.body;

    // Validate the request
    if (!userId || !Array.isArray(chatIds)) {
      return res.status(400).json({ error: "Invalid data" });
    }

    // Path to the chat file for the userId (e.g., 3.json for userId 3)
    const chatFilePath = path.join(chatDirectory, `${userId}.json`);
    if (!fs.existsSync(chatFilePath)) {
      return res.status(404).json({ error: "Chat file not found" });
    }

    try {
      // Read the chat file for the user
      const chatData = JSON.parse(fs.readFileSync(chatFilePath, "utf8"));

      // Filter out messages where the 'from' or 'to' matches any id in chatIds
      const updatedChatData = chatData.filter((message) => {
        return !chatIds.includes(message.from) && !chatIds.includes(message.to);
      });

      // Write the updated chat data back to the file
      fs.writeFileSync(chatFilePath, JSON.stringify(updatedChatData, null, 2));

      res.status(200).json({ message: "Chats deleted successfully" });
    } catch (error) {
      console.error("Error deleting chats:", error);
      res.status(500).json({ error: "Failed to delete chats" });
    }
  });

  app.post("/pin-chats", (req, res) => {
    const { userId, chatIds } = req.body;

    // Validate the request
    if (!userId || !Array.isArray(chatIds)) {
      return res.status(400).json({ error: "Invalid data" });
    }

    try {
      // Read the user data file
      const usersData = JSON.parse(fs.readFileSync(usersFilePath, "utf8"));

      // Find the user by userId
      const user = usersData.find((u) => u.userId === userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      user.pinnedChats = chatIds;

      // Save the updated user data back to the file
      fs.writeFileSync(usersFilePath, JSON.stringify(usersData, null, 2));

      res.status(200).json({
        message: "Pinned chats updated successfully",
        pinnedChats: chatIds,
      });
    } catch (error) {
      console.error("Error updating pinned chats:", error);
      res.status(500).json({ error: "Failed to update pinned chats" });
    }
  });

  app.post("/select-product", (req, res) => {
    const { userId, productIds } = req.body;

    // Validate the request
    if (!userId || !Array.isArray(productIds)) {
      return res.status(400).json({ error: "Invalid data" });
    }
    try {
      // Read the user data file
      const usersData = JSON.parse(fs.readFileSync(usersFilePath, "utf8"));

      // Find the user by userId
      const user = usersData.find((u) => u.userId === userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (!Array.isArray(user.selectedProducts)) {
        user.selectedProducts = [];
      }

      user.selectedProducts = [
        ...new Set([...user.selectedProducts, ...productIds]),
      ];
      // Save the updated user data back to the file
      fs.writeFileSync(usersFilePath, JSON.stringify(usersData, null, 2));

      res.status(200).json({
        message: "Selected products updated successfully",
        selectedProducts: user.selectedProducts,
      });
    } catch (error) {
      console.error("Error updating selected products:", error);
      res.status(500).json({ error: "Failed to update selected products" });
    }
  });

  app.post("/remove-product", (req, res) => {
    //this code only removes other users products from Favorites/Selected
    const { userId, productIds } = req.body;

    // Validate the request
    if (!userId || !Array.isArray(productIds)) {
      return res.status(400).json({ error: "Invalid data" });
    }

    try {
      // Read the user data file
      const usersData = JSON.parse(fs.readFileSync(usersFilePath, "utf8"));

      // Find the user by userId
      const user = usersData.find((u) => u.userId === userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Remove the products from the selectedProducts array
      user.selectedProducts = user.selectedProducts.filter(
        (productId) => !productIds.includes(productId)
      );

      // Save the updated user data back to the file
      fs.writeFileSync(usersFilePath, JSON.stringify(usersData, null, 2));

      res.status(200).json({
        message: "Selected products removed successfully",
        selectedProducts: user.selectedProducts,
      });
    } catch (error) {
      console.error("Error removing selected products:", error);
      res.status(500).json({ error: "Failed to remove selected products" });
    }
  });

  return app;
};
