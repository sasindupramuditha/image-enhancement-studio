
import express from "express";
import cors from "cors";
import multer from "multer";
import axios from "axios";
import FormData from "form-data";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

dotenv.config({ path: fileURLToPath(new URL("./.env", import.meta.url)) });

const app = express();
const PORT = 3000;

const API_KEY = process.env.PICWISH_API_KEY;
const BASE_URL = "https://techhk.aoscdn.com/api/tasks/visual/scale";

app.use(cors({
  origin: "http://localhost:5173",
}));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      return callback(new Error("Please upload an image file."));
    }

    callback(null, true);
  },
});

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

function getApiError(error) {
  const data = error.response?.data;

  return (
    data?.message ||
    data?.error ||
    error.message ||
    "Unknown API error."
  );
}

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Image enhancement server is running.",
    apiKeyConfigured: Boolean(process.env.PICWISH_API_KEY),
  });
});

app.post("/api/enhance", upload.single("image"), async (req, res) => {
  if (!API_KEY) {
    return res.status(500).json({
      message: "API key is missing. Configure PICWISH_API_KEY in .env.",
    });
  }

  if (!req.file) {
    return res.status(400).json({
      message: "Please upload an image.",
    });
  }

  try {
    // Step 1: Create an enhancement task.
    const formData = new FormData();

    formData.append("image_file", req.file.buffer, {
      filename: req.file.originalname || "image.jpg",
      contentType: req.file.mimetype,
    });

    formData.append("sync", "0");

    const createResponse = await axios.post(
      BASE_URL,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          "X-API-KEY": API_KEY,
        },
        timeout: 30000,
        maxBodyLength: Infinity,
        validateStatus: () => true,
      }
    );

    const createResult = createResponse.data;

    if (
      createResponse.status < 200 ||
      createResponse.status >= 300 ||
      createResult?.status !== 200
    ) {
      return res.status(502).json({
        message:
          `Could not create enhancement task: ${
            getApiError({ response: { data: createResult } })
          }`,
      });
    }

    const taskId = createResult?.data?.task_id;

    if (!taskId) {
      return res.status(502).json({
        message: "The enhancement API did not return a task ID.",
      });
    }

    // Step 2: Poll for the task result for up to 60 seconds.
    const deadline = Date.now() + 60000;

    while (Date.now() < deadline) {
      await sleep(1000);

      let pollResponse;

      try {
        pollResponse = await axios.get(
          `${BASE_URL}/${encodeURIComponent(taskId)}`,
          {
            headers: {
              "X-API-KEY": API_KEY,
            },
            timeout: 15000,
            validateStatus: () => true,
          }
        );
      } catch (error) {
        console.error("Polling request failed:", error.message);

        continue;
      }

      const result = pollResponse.data;
      const task = result?.data;

      if (
        pollResponse.status < 200 ||
        pollResponse.status >= 300 ||
        result?.status !== 200
      ) {
        return res.status(502).json({
          message:
            `Could not check enhancement status: ${
              getApiError({ response: { data: result } })
            }`,
        });
      }

      if (!task) {
        return res.status(502).json({
          message: "The enhancement API returned an invalid task response.",
        });
      }

      const state = Number(task.state);

      // Success: state 1 and an image result.
      if (state === 1) {
        if (!task.image) {
          return res.status(502).json({
            message: "The task succeeded but returned no image.",
          });
        }

        return res.json({
          image: task.image,
          message: "Image enhanced successfully.",
        });
      }

      // Negative state means the task failed.
      if (state < 0) {
        console.error("Enhancement task failed:", task);

        return res.status(502).json({
          message:
            task.message ||
            task.state_detail ||
            result.message ||
            "The image enhancement task failed.",
        });
      }

      // States greater than 1 mean processing continues.
    }

    return res.status(504).json({
      message:
        "Image enhancement timed out after 60 seconds. Please try again.",
    });
  } catch (error) {
    console.error(
      "Image enhancement error:",
      error.response?.data || error.message
    );

    return res.status(502).json({
      message: getApiError(error),
    });
  }
});

// Handle invalid file uploads and other middleware errors.
app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      message:
        error.code === "LIMIT_FILE_SIZE"
          ? "Image is too large. Maximum size is 20 MB."
          : error.message,
    });
  }

  return res.status(400).json({
    message: error.message || "Invalid upload.",
  });
});

app.listen(PORT, () => {
  console.log(`Enhancement server running at http://localhost:${PORT}`);
});
