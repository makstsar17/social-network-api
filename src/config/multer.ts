import multer from "multer";
import { env } from "./env";
import { randomUUID } from "crypto";

const fileTypes = ["jpeg", "jpg", "png"].map(el => "image/" + el);

const storage = multer.diskStorage({
    destination: env.AVATAR_PATH,
    filename: function (req, file, cb) {
        cb(null, `${randomUUID()}.${file.mimetype.split("/")[1]}`);
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 },
    fileFilter: (req, file, cb) => {
        if(fileTypes.includes(file.mimetype)){
            cb(null, true);
        }
        else{
            cb(new Error("Invalid file type"));
        }
    }
});

export default upload;