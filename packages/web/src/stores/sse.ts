import { defineStore } from 'pinia';

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
            source = new EventSource(`//localhost:8323/events?id=${timestamp}`);
            source.addEventListener('open', () => {
                // const etcStore = useEtcStore();
                console.log('SSE connect success');
                this.sseIsConnect = true;
            });

            /** 开始获取token */
            source.addEventListener('begin_obtain_token_report', async (event: any) => {
                console.log('begin_obtain_token_report------------->', event.data);
            });

            /** SSE失败 */
            source.addEventListener('error', async (event: any) => {
                console.log('SSE connect error, reboot');
                await this.startSse();
            });
        },
    }
});
