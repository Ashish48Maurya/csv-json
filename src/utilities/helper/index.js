import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = "uploads/";
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
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

const ageGroups = [
    { label: "< 20", min: 0, max: 19 },
    { label: "20 to 40", min: 20, max: 40 },
    { label: "40 to 60", min: 41, max: 60 },
    { label: "> 60", min: 61, max: Infinity }
];


export const calculateAgeGroupDistribution = (users) => {
    const total = users.length;
    const distribution = {};


    ageGroups.forEach(group => {
        distribution[group.label] = 0;
    });

    users.forEach(user => {
        const age = Number(user.age);
        const group = ageGroups.find(g => age >= g.min && age <= g.max);
        if (group) distribution[group.label] += 1;
    });

    Object.keys(distribution).forEach(key => {
        distribution[key] = ((distribution[key] / total) * 100).toFixed(2);
    });

    return distribution;
}


export const printAgeGroupReport = (distribution) => {
    console.log("Age-Group % Distribution");
    console.log("------------------------");
    Object.keys(distribution).forEach(key => {
        console.log(`${key} ${distribution[key]}`);
    });
}