
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import App from './App.vue';
import router from './router';
import './styles/theme.scss';
import { useAppStore } from './store/appStore';
import zh from './locales/zh';
import en from './locales/en';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    zh,
    en
  }
});

app.use(i18n);

const appStore = useAppStore(pinia);
appStore.hydrateFromStorage();

app.use(router);

app.mount('#app');
