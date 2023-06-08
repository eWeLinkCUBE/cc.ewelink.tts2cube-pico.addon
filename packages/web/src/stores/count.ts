import _ from 'lodash';
import { defineStore } from 'pinia';
import { getServerInfo } from '@/api';

/** 倒计时时长 - 5 分钟 */
export const COUNT_TIME = 300;

export const getTimeStr = (n: number) => {
    const min = Math.floor(n / 60);
    const sec = n - (min * 60);
    let str = '';
    if (min) {
        str += `${min}min`;
    }
    if (sec) {
        str += `${sec}s`;
    }
    return str;
};

export const useCountStore = defineStore('count', {
    state: () => {
        return {
            counting: false,
            countText: '',
            timerId: null,
            timeCount: COUNT_TIME
        };
    },
    actions: {
        startCount(count?: number) {
            this.stopCount();

            if (count) {
                this.timeCount = count;
            }

            this.counting = true;
            this.countText = getTimeStr(--this.timeCount);
            this.timerId = setInterval(() => {
                if (--this.timeCount > 0) {
                    this.countText = getTimeStr(this.timeCount);
                } else {
                    this.stopCount();
                }
            }, 1000) as any;
        },

        async stopCount() {
            this.counting = false;
            if (this.timerId) {
                clearInterval(this.timerId);
            }

            this.timerId = null;
            this.timeCount = COUNT_TIME;
        },

        async testCount() {
            if (!this.counting) {
                const res = await getServerInfo();
                if (res.data.error === 0) {
                    const tokenUpdateTime = _.get(res, 'data.data.tokenUpdateTime');
                    if (tokenUpdateTime !== 0) {
                        const now = Date.now();
                        const past = now - tokenUpdateTime;
                        const limit = COUNT_TIME * 1000
                        const remain = limit - past;
                        if (remain > 0) {
                            // 开始倒计时
                            this.startCount(Math.floor(remain / 1000));
                        }
                    }
                } else {
                    console.warn('store.count.testCount getServerInfo error: res:', res);
                }
            }
        }
    }
});
