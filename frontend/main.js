import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import components from './components/index.js';
import 'element-plus/dist/index.css';
import 'tailwindcss/tailwind.css';
import './css/style.scss';

if (components && components.length > 0) {
    components.forEach((c) => {
        if (c.component && c.el) {
            if (document.querySelector(c.el)) {
                createApp(c.component).use(ElementPlus).mount(c.el);
            }
        }
    });
}