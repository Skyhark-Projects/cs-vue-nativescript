import init     from '../common/init.js';
import api      from './apiManager.js';

Vue.component('form', 'form');

//const http = require("http")
//Vue.prototype.$http = http

const app = init({
    apiManager: api
});

if(app.$router)
    app.$router.replace('/');

app.$start();