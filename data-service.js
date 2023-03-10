const fs = require("fs");

let students = [];
let programs = [];
let images = [];


module.exports.initialize = function () {
    return new Promise( (resolve, reject) => {
        fs.readFile('./data/programs.json', (err, data) => {
            if (err) {
                reject(err); return;
            }

            programs = JSON.parse(data);

            fs.readFile('./data/students.json', (err, data) => {
                if (err) {
                    reject(err); return;
                }

                students = JSON.parse(data);
                resolve();
            });
        });
    });
}

module.exports.getAllStudents = function(){
    return new Promise((resolve,reject)=>{
        if (students.length == 0) {
            reject("query returned 0 results"); return;
        }
        resolve(students);
    })
}

module.exports.addStudent = function (studentData) {
    return new Promise(function (resolve, reject) {

        studentData.isInternationalStudent = (studentData.isInternationalStudent) ? true : false;

        var maxIdValue = 0;
        students.forEach(s => {
            if (maxIdValue < parseInt(s.studentID)) {
                maxIdValue = parseInt(s.studentID);
            }
        })
        console.log("maxIdValue:", maxIdValue);
        // studentData.studentID = students.length + 1;
        studentData.studentID = String(maxIdValue + 1);
        students.push(studentData);

        resolve();
    });

};

module.exports.getStudentById = function (sid) {
    return new Promise(function (resolve, reject) {
        var foundStudent = null;

        for (let i = 0; i < students.length; i++) {
            if (students[i].studentID == sid) {
                foundStudent = students[i];
            }
        }

        if (!foundStudent) {
            reject("query returned 0 results"); return;
        }

        resolve(foundStudent);
    });
};

module.exports.getStudentsByStatus = function (status) {
    return new Promise(function (resolve, reject) {

        var filteredStudents = [];

        for (let i = 0; i < students.length; i++) {
            if (students[i].status == status) {
                filteredStudents.push(students[i]);
            }
        }

        if (filteredStudents.length == 0) {
            reject("query returned 0 results"); return;
        }

        resolve(filteredStudents);
    });
};


module.exports.getStudentsByProgramCode = function (programCode) {
    return new Promise(function (resolve, reject) {
        var filteredStudents = [];

        for (let i = 0; i < students.length; i++) {
            if (students[i].program == programCode) {
                filteredStudents.push(students[i]);
            }
        }

        if (filteredStudents.length == 0) {
            reject("query returned 0 results"); return;
        }

        resolve(filteredStudents);
    });
};

module.exports.getStudentsByExpectedCredential = function (credential) {
    var filteredStudents = [];
    return new Promise(function (resolve, reject) {
        // var filteredStudents = [];

        for (let i = 0; i < students.length; i++) {
            if (students[i].expectedCredential == credential) {
                filteredStudents.push(students[i]);
            }
        }

        if (filteredStudents.length == 0) {
            reject("query returned 0 results"); return;
        }

        resolve(filteredStudents);
    });
};

module.exports.getInternationalStudents = function () {
    return new Promise(function (resolve, reject) {
        (students.length > 0) ? resolve(students.filter(s => s.isInternationalStudent)) : reject("no results returned");
    });
};

module.exports.getPrograms = function(){
   return new Promise((resolve,reject)=>{
    if (programs.length == 0) {
        reject("query returned 0 results"); return;
    }
    resolve(programs);
   });
}


module.exports.addImage = function (imageUrl) {
    return new Promise(function (resolve, reject) {

        images.push(imageUrl);

        resolve(images[images.length-1]);
    });
};

module.exports.getImages = function(){
    return new Promise((resolve,reject)=>{
     if (images.length == 0) {
         reject("query returned 0 results"); return;
     }
     resolve(images);
    });
}