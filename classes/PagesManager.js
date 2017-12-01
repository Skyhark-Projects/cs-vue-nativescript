class PagesManager extends SuperClass {

}

/*function copyBundle() {
    const fs = require('fs');
    const Path = require('path');
    
    const content = fs.readFileSync(Path.join(process.cwd(), 'dist', 'bundle-mobile.js'));
    fs.writeFileSync('/Users/sachavandamme/Documents/projects/dav2trade/hello-ns-vue/platforms/ios/hellonsvue/app/bundle-mobile.js', content);
}*/

PagesManager.compile = function(mode, done) {

    if(mode !== 'mobile')
        return SuperClass.compile(mode, done);

    const Path              = require('path');
    const fs                = require('fs');
    const browserify        = require('browserify');
    const babelify          = require('babelify');
    const watchify          = require('watchify');
    const envify            = require('envify/custom');
    const BrowserifyCache   = require(Path.join(process.pwd(), 'src', 'plugins', 'vue', 'additionals', 'watchify-cache.js'));
    const bulkify           = require(Path.join(process.pwd(), 'src', 'plugins', 'vue', 'additionals', 'bulkify.js'));
    const blukifyWatch      = require(Path.join(process.pwd(), 'src', 'plugins', 'vue', 'additionals', 'bulkify-watch.js'));
    const vueify            = require('vueify');
    //const extractCss        = require('../vueify/plugins/extract-css.js');
    //const browhmr           = plugins.require('vue/hmr/index');

    //--------------------------------------------------------

    const isProduction = (process.env.NODE_ENV === 'production');
    const cacheFile = Path.join(process.cwd(), 'dist', 'cache-' + mode + '.json');

    const vuePath = fs.existsSync(Path.join(__dirname, '..', 'node_modules', 'nativescript-vue/dist/index')) ? 
            Path.join(__dirname, '..', 'node_modules', 'nativescript-vue/dist/index') : 
            Path.join(process.pwd(), 'node_modules', 'nativescript-vue/dist/index');

    const cache = BrowserifyCache.getCache(cacheFile);
    const config = {
        entries: Path.join(__dirname, '..', 'modules-www', mode, 'entry.js'),
        basedir: process.cwd(),
        cache: cache.cache,
        packageCache: cache.package,
        stylesCache: cache.styles,
        cacheFile: cacheFile,
        fullPaths: !isProduction,
        paths: [
            Path.join(process.cwd(), 'node_modules'), 
            process.cwd(), 
            Path.join(process.pwd(), 'node_modules'),
            //Path.join(process.pwd(), 'node_modules', 'tns-core-modules'),
            Path.join(__dirname, '..', 'node_modules')
        ],

        process: {
            env: {
                NODE_ENV: process.env.NODE_ENV,
                NODE_PATH: Path.join(process.cwd(), 'node_modules'),
                READABLE_STREAM: 'disable'
            }
        },

        insertGlobalVars: {
            InitReq: function(file, dir)
            {
                const fdir = Path.join(process.cwd(), 'resources', 'lib', 'init.js');
                return 'require("'+fdir+'")';
            },

            Vue: function(file, dir)
            {
                return 'require("'+vuePath+'")';
            }
        },

        isServer: true,
        standalone: 'server'
    };

    var b = browserify(config)
                .transform(vueify)
                .transform(babelify, {presets: ['env']})
                .transform(bulkify)
                .transform({ global: isProduction }, envify({
                    _: 'purge',
                    NODE_ENV: process.env.NODE_ENV,
                    VUE_ENV: mode,
                    COMPILE_ENV: 'browserify',
                    DEBUG: true
                }))
                .external('ui/layouts/flexbox-layout')
                .external('ui/layouts/wrap-layout')
                .external('ui/layouts/stack-layout')
                .external('ui/layouts/absolute-layout')
                .external('ui/activity-indicator')
                .external('ui/border')
                .external('ui/button')
                .external('ui/content-view')
                .external('ui/date-picker')
                .external('ui/layouts/dock-layout')
                .external('ui/layouts/grid-layout')
                .external('ui/html-view')
                .external('ui/image')
                .external('ui/label')
                .external('ui/list-picker')
                .external('ui/action-bar')
                .external('ui/action-bar')
                .external('ui/list-view')
                .external('ui/action-bar')
                .external('ui/page')
                .external('ui/placeholder')
                .external('ui/progress')
                .external('ui/proxy-view-container')
                .external('ui/repeater')
                .external('ui/scroll-view')
                .external('ui/search-bar')
                .external('ui/segmented-bar')
                .external('ui/segmented-bar')
                .external('ui/slider')
                .external('ui/layouts/stack-layout')
                .external('ui/layouts/flexbox-layout')
                .external('ui/switch')
                .external('ui/tab-view')
                .external('ui/tab-view')
                .external('ui/text-field')
                .external('ui/text-view')
                .external('ui/time-picker')
                .external('ui/web-view')
                .external('ui/layouts/wrap-layout')
                .external('text/formatted-string')
                .external('text/span')
                .external('ui/proxy-view-container')
                .external('ui/placeholder')
                .external('ui/placeholder')
                .external('ui/proxy-view-container')
                .external('ui/core/view')
                .external('ui/layouts/layout-base')
                .external('ui/page')
                .external('ui/frame')
                .external('ui/dialogs')
                .external('application')
                .external('http');
                //.external('nativescript-websockets');

    const distFolder = Path.join(process.cwd(), 'dist');
    /*if (!isServer)
    {
        b.plugin(extractCss, {
            out: Path.join(distFolder, 'bundle.css'),
            minify: isProduction
        });
    }*/
    
    const distPath = '/Users/sachavandamme/Documents/projects/dav2trade/hello-ns-vue/platforms/ios/hellonsvue/app/bundle-mobile.js'; //Path.join(distFolder, 'bundle-' + mode + '.js')

    if (!isProduction && process.options.hot !== undefined)
    {
        b.plugin(BrowserifyCache)
            .plugin(watchify)
            .plugin(blukifyWatch);

        b.on('update', function()
        {
            b.bundle(function()
            {
                done.apply(this, arguments);
            })
            .pipe(fs.createWriteStream(distPath));
        });

        //b.plugin(browhmr);
    }

    SuperClass.ensureExists(distFolder, 0o744, function(err)
    {
        if (err)
        {
            console.error(err);
        }
        else
        {
            const stream = fs.createWriteStream(distPath);

            stream.on('close', function()
            {
                done.apply(b, arguments);
            });

            stream.on('error', function(err)
            {
                console.error('browserify-stream:', err);
            });

            b.bundle().on('error', function(err)
            {
                console.error('Browserify-bundle:', err);
            })
            .pipe(stream);
        }
    });

    return b;
}

module.exports = PagesManager;