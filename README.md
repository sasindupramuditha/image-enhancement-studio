# Image Enhancement Studio

A React and Vite app for enhancing uploaded images with the PicWish API. The app uses a small Express backend to keep the API key out of the browser.

## Requirements

- Node.js
- A PicWish API key

## Setup

Install dependencies:

```sh
npm install
```

Copy `src/utils/.env.example` to `src/utils/.env` and add your API key:

```env
PICWISH_API_KEY=your_api_key_here
```

Start the backend in one terminal:

```sh
npm run server
```

Start the frontend in another terminal:

```sh
npm run dev
```

Open the local URL printed by Vite. The backend accepts image uploads up to 20 MB on port 3000.
