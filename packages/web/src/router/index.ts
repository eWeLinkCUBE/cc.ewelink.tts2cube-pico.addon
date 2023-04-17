import { createRouter, createWebHistory } from 'vue-router';
import AuthView from '../views/AuthView.vue';
import HomeView from '../views/HomeView.vue';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView
        },
        {
            path: '/auth',
            name: 'auth',
            component: AuthView
        }
    ]
});

export default router;
