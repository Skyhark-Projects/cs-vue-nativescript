import init     from '../common/init.js';
import api      from './apiManager.js';
import form     from '../components/form.vue';

Vue.component('form', form);

const app = init({
    apiManager: api
});

if(app.$router)
    app.$router.replace('/');

app.$start();