const fs = require('fs');

function myReadFile(filePath, callback){
    try{
        fs.readFile(filePath, 'utf8',(err, data)=>{
            console.log(data);
        });
    }catch(err){
        console.log(err);
    }
}
//myReadFile('index.html');

async function promiseReadFile(){
    try{
        const data = await fs.promises.readFile('index.html', 'utf8');
        console.log(data);
    }catch(err){
        console.log(err);
    }
}

//const data = promiseReadFile();
//console.log(data);
// data
//     .then(data => console.log(data))
//     .catch(err => console.log(err))

async function example(){
    const data = 'null';
    return data;
}

const data = example();
console.log(data);