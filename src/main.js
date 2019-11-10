import Vue from 'vue';
import VueCookies from 'vue-cookies';
import BootstrapVue from 'bootstrap-vue';
import VueInputAutowidth from 'vue-input-autowidth';
import VueAlertify from 'vue-alertify';
import velocity from 'velocity-animate';
import VueLodash from 'vue-lodash';
import SvgIcon from 'vue-svgicon';
import App from './App';
import router from '@/routes/index';
import store from './store';
import directive from '@/directives';
import { i18n } from '@/translations';
import { Mixin } from '@/mixins/global-util';
import VueCompositionApi from '@vue/composition-api';

import config from '@/lib/config';
import api from '@/lib/api';

Vue.mixin(Mixin);
Vue.use(VueCookies);
Vue.use(BootstrapVue);
Vue.use(VueAlertify);
Vue.use(VueInputAutowidth);
Vue.use(VueCompositionApi);
Vue.use(VueLodash, { name: 'lodash' });
Vue.use(SvgIcon, {
    tagName: 'svgicon',
    classPrefix: 'p-i',
});

Vue.prototype.$velocity = velocity;

/** ***************************************************************
 * This is a Global Bus Event;
 * Please, name your '$emit' event name as action + Event such as
 * nodeSelectedEvent, closeModalEvent
 **************************************************************** */
Vue.prototype.$bus = new Vue({});
directive(Vue);

new Vue({
    el: '#app',
    router,
    i18n,
    store,
    components: {
        App,
    },
    template: '<App/>',
});
export default Vue;