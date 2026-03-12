const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

let upload;

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'mini-linkedin',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [{ width: 800, height: 800, crop: 'limit' }],
    },
  });

  upload = multer({ storage: storage });
} else {
  // If no cloudinary keys, mock upload (in a real app you'd use local disk storage, but for a preview this is fine as it avoids crashing)
  console.warn("⚠️ Cloudinary credentials missing. Image uploads will simply be ignored.");
  upload = multer({ storage: multer.memoryStorage() }); 
  
  // Create a middleware that mocks the req.file.path that Cloudinary would normally set
  const mockUpload = upload;
  upload = {
    single: (fieldname) => {
      const singleUpload = mockUpload.single(fieldname);
      return (req, res, next) => {
        singleUpload(req, res, (err) => {
          if (err) return next(err);
          // If a file was uploaded but we have no cloudinary, mock a fake URL so the frontend doesn't break
          if (req.file) {
            req.file.path = "https://placehold.co/600x400?text=Mock+Image+(Cloudinary+Keys+Missing)";
          }
          next();
        });
      };
    }
  };
}

module.exports = { cloudinary, upload };
