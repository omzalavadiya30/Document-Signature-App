const multer=require('multer');
const path= require('path');

const storage= multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'src/uploads/original');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const fileFilter= (req, file, cb) => {
    const ext= path.extname(file.originalname);

    if(ext !== '.pdf') {
        return cb(new Error('Only PDF files are allowed'), false);
    }
    cb(null, true);
};

const upload= multer({ storage, fileFilter });
module.exports = upload;