const fs = require('fs');

class FileManager {
    constructor(){
        this.files = [];
    }

    init = () =>{
        try{
            fs.promises.readdir('.', {encoding: 'utf-8', withFileTypes: true}, (err, data) => {
                console.log(data);
                return data;
            });
        }catch(err){
            console.log(err);
        }
    }
}


async function readFolder(){
    try{
        return fs.promises.readdir('.', {encoding: 'utf-8', withFileTypes: true});
    }catch(err){
        console.log(err);
    }
}

const temp = readFolder();
temp.then(data => console.log(data))

// const filesArray = readFolder((files) => {
//     //console.log(files);
//     return files;
// });


function readFolderPromise (folder, enconding) {
    return new Promise(function(resolve, reject) {
        fs.readdir(folder,enconding, function(err, filenames){
            if (err) 
                reject(err); 
            else 
                resolve(filenames);
        });
    });
};


// callback
function readFolder1(callback){
    try{
        fs.readdir('./', {encoding: 'utf-8', withFileTypes: true}, (err, data) =>{
            callback(err, data)
        });
    }catch(err){
        console.log(err);
    }
}

const custom = (err, data) => {
    if (err) {
        console.error(err);
    } else {
        console.log(Array.isArray(data));
        const filesArray = data.filter(item => {
            return item.name.split('.')[1] === 'csv'
        })
        console.log(filesArray);
    }
}

//readFolder1(custom);


// playaround with folders and files -> callbacks vs promises