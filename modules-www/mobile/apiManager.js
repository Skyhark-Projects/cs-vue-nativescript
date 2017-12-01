import BaseManager from '../common/apiManager.js';
import formPoster  from './formPoster';
import { mergePost } from '../common/init.js';
import ApiMerger     from '../common/merger.js';

//require('nativescript-websockets');
const SockJS = require('sockjs-client');

console.log('ws', global.WebSocket);

class ApiManager extends BaseManager
{
    constructor()
    {
        super();
        this.isClient        = true;
        this.formPoster      = formPoster;
        this.socketConnected = false;
        this.saltApiForcers  = {};
        
        this.mobileStorage = {}; //Caching

        if (!this.token)
            this.generateToken();
        else if (this.token.length < 10 || this.token.length > 20)
            this.generateToken();

        this.socketConnect();

        const _this = this;

        Vue.mixin({
            created()
            {
                try
                {
                    if(this.api)
                        _this.bindVue(this, this.api, this.api_data);
                }
                catch(e)
                {
                    console.error(e);
                }
            }

        });
    }

    socketConnect()
    {
        console.log('Connect to socket');
        if (this.socket) {
            try {
                this.socket.close();
            } catch (e) {
                console.error(e);
            }
        }

        var _this = this;
        this.socket = new SockJS(this.base() + 'socketapi?token=' + this.token);

        this.socket.onopen = function () {
            _this.socketConnected = true;
            _this.emitSocketOpen();
        };
        this.socket.onmessage = function (e) {
            _this.socketConnected = true;
            _this.emitSocketMessage(e);
        };
        this.socket.onclose = function () {
            _this.socketConnected = false;
            _this.emitSocketClose();
        };
    }

    base()
    {
        return 'http://192.168.0.104:8080/' //ToDo
    }

    //---------------------------------------------------------

    getCookie(name) {
        /*var dc = document.cookie;
        var prefix = name + "=";

        var begin = dc.indexOf("; " + prefix);
        var beginLength = 2 + prefix.length;

        if (begin == -1) {
            begin = dc.indexOf(";" + prefix);
            beginLength--;

            if (begin == -1 && dc.indexOf(prefix) == 0) {
                begin = 0;
                beginLength--;
            } else {
                return '';
            }
        }

        begin += beginLength;
        const end = dc.indexOf(';', begin);

        if (end == -1)
            return dc.substr(begin);

        return unescape(dc.substr(begin, end - begin));*/
        return ''; //ToDo
    }

    setCookies(cookies, expiration) {
        /*var expires = '';
        if (expiration) {
            var d = new Date();
            d.setTime(expiration);
            expires = "expires=" + d.toUTCString() + ';';
        }

        for (var key in cookies) {
            document.cookie = key + "=" + cookies[key] + ";" + expires + "path=/";

            if (key === 'token') {
                this.token = cookies[key];
                this.socketConnect();
            }
        }*/
        
        //ToDo
    }

    deleteOldCache() {
        if(!this.mobileStorage)
            return;

        for(var key in this.mobileStorage) {
            var index = key.indexOf('_');
            
            if (key.substr(0,  key.indexOf('_')) !== this.token) {
                delete this.mobileStorage[key];
            }
        }
    }

    deleteAllCache() {
        if(!this.mobileStorage)
            return;

        this.mobileStorage = {};
    }

    deleteLocalCache(api_salt, data) {
        if(!this.mobileStorage)
            return;

        const key = this.token + '_' + api_salt;

        if(this.mobileStorage[key])
            delete this.mobileStorage[key];
    }

    saveLocalCache(api_salt, data) {
        if(!this.mobileStorage)
            this.mobileStorage = {};

        const key = this.token + '_' + api_salt;
        this.mobileStorage[key] = data;
    }

    getLocalCache(api_salt) {
        if(!this.mobileStorage)
            this.mobileStorage = {};

        return this.mobileStorage[this.token + '_' + api_salt] || null;
    }

    //---------------------------------------------------------

    emitSocketOpen() {
        const callbacks      = this.onOpenCallbacks;
        this.onOpenCallbacks = [];

        for (var key in callbacks) {
            try {
                callbacks[key].call(this, this);
            } catch (e) {
                console.error(e);
            }
        }

        var count = 0;
        for(var key in this.saltApiForcers) {
            count ++;
            this.saltApiForcers[key]();
        }
    }

    emitSocketClose() {
        if (this.isDev)
            console.warn('Socket closed');

        this.socket = false;
        this.fetchingApis = [];
        this.socketConnect();
    }

    emitSocketMessage(msg) {
        try {
            if (msg.type === 'message') {
                var data = msg.data;

                try {
                    data = JSON.parse(data);

                    if (data.api) {
                        this.emitApi(data.api, data.data, data.salt);
                    } else if (data.apiError) {
                        this.handleApiError(data.apiError, data.error, data.salt);
                    } else if (data.cookies) {
                        this.setCookies(data.cookies, data.expiration);
                    }
                } catch (e) {
                    console.error(e);
                }

                for (var key in this.socketHooks) {
                    try {
                        this.socketHooks[key](data);
                    } catch (e) {
                        console.error(e);
                    }
                }
            }
        } catch (e) {
            console.error(e);
        }
    }

    emitApi(api, data, salt) {
        this.saveLocalCache(salt, data);
        var found = false;

        if (salt === undefined) {
            salt = this.getSalt(api, mergePost({}));
        }

        if(this.saltApiForcers[salt])
            delete this.saltApiForcers[salt];

        for (var key in this.onApiCallbacks) {
            try {

                const post = mergePost(JSON.parse(JSON.stringify(this.onApiCallbacks[key].post)));

                if (this.getSalt(this.onApiCallbacks[key].api, post) === salt)
                {
                    found = true;
                    this.onApiCallbacks[key].callback.call(this, data, api, this.onApiCallbacks[key].id);
                }
            } catch (e)
            {
                console.error(e);
            }
        }

        if (!found && this.isDev)
            console.warn('Api handler not found for', api, salt);
    }

    sendSocketMessage(msg) {
        if (!this.isClient || !this.socket)
            return null;

        if (typeof (msg) === 'object' || typeof (msg) === 'array') {
            try {
                msg = JSON.stringify(msg);
            } catch (e) {
                console.error(e);
            }
        }

        if (this.socketConnected === false) {
            return this.onSocketOpen(function () {
                this.socket.send(msg);
            });
        }

        this.socket.send(msg);
        return this;
    }

    onSocketOpen(cb) {
        if (this.socketConnected) {
            try {
                cb();
            } catch (e) {
                console.error(e);
            }
        } else {
            this.onOpenCallbacks.push(cb);
        }

        return this;
    }

    //---------------------------------------------------------

    sendApiAndForceResponse(api, data, salt) {
        const _this = this;

        this.saltApiForcers[salt] = function() {
            _this.sendSocketMessage({
                api:  api,
                data: data,
                salt: salt
            });
        }

        if(!this.socketConnected)
            return;

        this.saltApiForcers[salt]();
    }

    require(api, data, cb)
    {
        const res = super.require(api, data, cb);

        if(!res)
            return;

        this.sendApiAndForceResponse(api, res.data, res.salt);

        return res.id;
    }

    refresh(api, data)
    {
        const res = super.refresh(api, data);

        if(!res)
            return;

        this.sendApiAndForceResponse(api, res.data, res.salt);
    }

    post(api, data)
    {
        const _this = this;
        const res   = super.post(api, data);

        if(!res)
            return;

        return new Promise(function (resolve, reject) {

            _this.onApiCallbacks.push({
                id: res.id,
                api: api,
                post: res.data,
                //salt: salt,
                callback: function (res) {
                    _this.unbindListener(res.id);
                    resolve(res);
                }
            });

            _this.sendSocketMessage({
                api: api,
                data: res.data,
                salt: res.salt
            });
        });
    }
}

if (ApiManager.shared === undefined)
    ApiManager.shared = new ApiManager();

export default ApiManager.shared;