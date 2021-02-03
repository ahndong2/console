import Vue from 'vue';
import VueCompositionApi from '@vue/composition-api';
import router from '@/routes/index';
import { store } from '@/store';
import directive from '@/directives';
import { i18n } from '@/translations';
import webFontLoader from 'webfontloader';
import { webFonts, fontUrls } from '@/styles/web-fonts';
import Fragment from 'vue-fragment';
import VTooltip from 'v-tooltip';
import '@/styles/style.pcss';
import SpaceDesignSystem from '@spaceone/design-system';
import PortalVue from 'portal-vue';
import App from './App.vue';


/** ********** SET VUE PLUGINS ************** */
Vue.use(VueCompositionApi);
// @ts-ignore
Vue.use(Fragment.Plugin);
Vue.use(VTooltip, { defaultClass: 'p-tooltip', defaultBoundariesElement: document.body });
Vue.use(PortalVue);

directive(Vue);

Vue.use(SpaceDesignSystem);


webFontLoader.load({
    google: {
        families: webFonts,
        urls: fontUrls,
    },
});

console.debug('main');

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
