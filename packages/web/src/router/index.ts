import { createRouter, createWebHistory } from 'vue-router';
import AuthView from '../views/AuthView.vue';
import HomeView from '../views/HomeView.vue';
import { getServerInfo } from '../api';

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

router.beforeEach(async (to, from) => {
    const tokenIsValid = async () => {
        try {
            const res = await getServerInfo();
            if (res.data.error === 0 && res.data.data.cubeTokenValid) {
                return true;
            } else {
                return false;
            }
        } catch (err: any) {
            console.error(`Get server info errror: ${err.name}: ${err.message}`);
            return false;
        }
    };

    if (to.name === 'home') {
        const res = await tokenIsValid();
        if (res) {
            return true;
        } else {
            return { name: 'auth' };
        }
    }

    if (to.name === 'auth') {
        const res = await tokenIsValid();
        if (res) {
            return { name: 'home' };
        } else {
            return true;
        }
    }
});

export default router;
