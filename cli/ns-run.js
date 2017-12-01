const { spawn } = require("child_process");

module.exports = function(value) {
    
    const ps = spawn('tns', [ 'run', value, '--bundle', '--disable-npm-install', '--path', '/Users/sachavandamme/Documents/projects/dav2trade/hello-ns-vue'], {
        pwd:    process.cwd(),
        stdio:  "inherit",
        shell:  true,
    });

    ps.once("close", code => {
        console.log(`NativeScript app stoped with code ${code}`);
    });
    
    return false;
}