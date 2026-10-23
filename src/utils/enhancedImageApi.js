
const API_URL = "http://localhost:3000/api/enhance";

export const enhanceImageAPI = async (imageFile) => {
  if (!(imageFile instanceof File)) {
    throw new Error("Please select a valid image file.");
  }

  if (!imageFile.type.startsWith("image/")) {
    throw new Error("The selected file is not an image.");
  }

  const formData = new FormData();
  formData.append("image", imageFile);

  let response;

  try {
    response = await fetch(API_URL, {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new Error(
      "Cannot connect to the enhancement server. Make sure the backend is running on port 3000."
    );
  }

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error(
      `The server returned an invalid response (HTTP ${response.status}).`
    );
  }

  if (!response.ok) {
    throw new Error(
      result.message || `Enhancement failed (HTTP ${response.status}).`
    );
  }

  if (!result.image) {
    throw new Error(
      result.message || "The API did not return an enhanced image."
    );
  }

  return result.image;
};
