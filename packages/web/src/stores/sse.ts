import { defineStore } from 'pinia';
import { SERVER_PORT } from '@/api';
import { useCountStore } from '@/stores/count';

let source: null | EventSource = null;

interface ISseState {
    sseIsConnect: boolean;
}

export const useSseStore = defineStore('sse', {
    state: (): ISseState => {
        return {
            sseIsConnect: false,
        };
    },
    actions: {
        setSseIsConnect(state: boolean) {
            this.sseIsConnect = state;
        },

        async startSse() {
            console.log('start SSE');
            if (source) source.close();
            const timestamp = new Date().getTime();
            source = new EventSource(`//${location.hostname}:${SERVER_PORT}/events?id=${timestamp}`);
            source.addEventListener('open', () => {
                // const etcStore = useEtcStore();
                console.log('SSE connect success');
                this.sseIsConnect = true;
            });

            /** 开始获取凭证 */
            source.addEventListener('get_token_start', async (event: any) => {
                const countStore = useCountStore();
                // 如果当前页面没在倒计时，则开始尝试倒计时
                if (!countStore.counting) {
                    countStore.testCount();
                }
            });

            /** 获取凭证结束 */
            source.addEventListener('get_token_end', async (event: any) => {
                const countStore = useCountStore();
                countStore.stopCount();
            });

            /** SSE失败 */
            source.addEventListener('error', (event: any) => {
                console.log('SSE connect error, reboot');
                setTimeout(() => {
                    this.startSse();
                }, 10000);
            });
        },
    }
});
