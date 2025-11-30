# How to Add PNG Images to Login Page

## Step 1: Create Assets Folder
Create a folder for your images:
```
f:\Devine\devine-water\Devine\public\assets\
```

## Step 2: Add Your PNG Images
Place your PNG files in the assets folder, for example:
- `icon-1.png` (snowflake icon)
- `icon-2.png` (water drop icon)
- `icon-3.png` (sparkle icon)
- etc.

## Step 3: Update Login.jsx
Open `src/pages/Login.jsx` and find the `decorative-bg` section (around line 80).

Replace the commented example with your actual images:

```jsx
<div className="decorative-bg">
  <img src="/assets/icon-1.png" className="floating-icon icon-1" alt="" />
  <img src="/assets/icon-2.png" className="floating-icon icon-2" alt="" />
  <img src="/assets/icon-3.png" className="floating-icon icon-3" alt="" />
  <img src="/assets/icon-4.png" className="floating-icon icon-4" alt="" />
  <img src="/assets/icon-5.png" className="floating-icon icon-5" alt="" />
  <img src="/assets/icon-6.png" className="floating-icon icon-6" alt="" />
</div>
```

## Step 4: Adjust Icon Size (Optional)
In `src/pages/Login.css`, find `.floating-icon` and adjust the size:

```css
.floating-icon {
  position: absolute;
  width: 40px;  /* Adjust this */
  height: 40px; /* Adjust this */
  opacity: 0.4; /* Adjust transparency */
  animation: float 6s ease-in-out infinite;
}
```

## File Structure
```
Devine/
├── public/
│   └── assets/
│       ├── icon-1.png
│       ├── icon-2.png
│       ├── icon-3.png
│       └── ...
├── src/
│   └── pages/
│       ├── Login.jsx
│       └── Login.css
```

That's it! The images will automatically animate with the floating effect.
