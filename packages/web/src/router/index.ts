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
    if (to.name === 'home') {
        sessionStorage.clear();
        try {
            // 如果 eWeLink Cube 凭证有效，则继续前往 home 页；
            // 否则前往 auth 页
            const res = await getServerInfo();
            if (res.data.error === 0 && res.data.data.cubeTokenValid) {
                // 在 session 中暂存凭证的有效性
                sessionStorage.setItem('cube_token_valid', '1');
                return true;
            } else {
                console.warn(res.data);
                return { name: 'auth' };
            }
        } catch (err) {
            console.error(err);
            return { name: 'auth' };
        }
    }

    if (to.name === 'auth') {
        const res = sessionStorage.getItem('cube_token_valid');
        if (res === '1') {
            return { name: 'home' }
        }
    }

    return true;
});

export default router;
