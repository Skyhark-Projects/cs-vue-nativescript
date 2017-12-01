const readline = require('readline');
const Path     = require('path');
const fs       = require('fs');
const childP   = require('child_process')

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function preparePackage() {
    const packagePath   = Path.join(process.cwd(), 'package.json');
    const input         = JSON.parse(fs.readFileSync( packagePath ).toString());
    const nameTransform = input.name.split('-').join(' ').replace(/\b\w/g, l => l.toUpperCase()).split(' ').join('');
    var defaultValue    = 'com.coreserver.' + nameTransform;

    return new Promise(function(resolve, reject) {
        rl.question('package id: (' + defaultValue + ') ', (answer) => {
            if(answer === '')
                answer = defaultValue;

            input.nativescript = {
                id: answer
                //tns-io: { version: "3.3.0" }
            };
            fs.writeFileSync(packagePath, JSON.stringify(input, null, 2));
            resolve(input);
        });
    });
}

function addPlatform(platform) {
    childP.spawnSync('tns', ['platform', 'add', platform], {
        cwd: process.cwd(),
        stdio:  "inherit",
        shell:  true
    })
}

async function setup(platform) {
    await preparePackage();
    
    if(platform === 'ios' || platform === null)
        addPlatform('ios');
    if(platform === 'android' || platform === null)
        addPlatform('android');

    console.log('Preparation Done');
}

module.exports = function(platform) {
    console.log('Preparing environment for', (platform === null ? 'android and ios' : platform));
    
    setup(platform).catch(function(err) {
        console.error(err);
    }).then(function() {
        rl.close();
    })
    
    return false;
}