import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === ".csv" && file.mimetype === "text/csv") {
        cb(null, true);
    } else {
        cb(new Error("Only CSV files are allowed!"), false);
    }
};

export const upload = multer({
    storage,
    fileFilter
});



function setNestedProperty(obj, keyPath, value) {
    const keys = keyPath.split(".");
    let current = obj;
    keys.forEach((key, index) => {
        if (index === keys.length - 1) {
            current[key] = value;
        } else {
            if (!current[key]) current[key] = {};
            current = current[key];
        }
    });
}

export const parseCSV = (content) => {
    const lines = content.trim().split("\n");
    const headers = lines[0].split(",").map(h => h.trim());
    const data = lines.slice(1).map(line => {
        const values = line.split(",").map(v => v.trim());
        const obj = {};
        headers.forEach((header, i) => {
            setNestedProperty(obj, header, values[i]);
        });
        return obj;
    });
    return data;
}