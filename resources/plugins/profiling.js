import Vue from 'vue'
const isDev = process.env.NODE_ENV !== 'production'
Vue.config.performance = isDev
