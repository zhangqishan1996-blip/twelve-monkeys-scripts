import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import router from './router'
import './style.css'

import en from './locales/en.json'
import es from './locales/es.json'
import zhTW from './locales/zh-TW.json'

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('locale') || 'en',
  fallbackLocale: 'en',
  messages: { en, es, 'zh-TW': zhTW },
})

createApp(App).use(router).use(i18n).mount('#app')
