import { createPinia } from 'pinia';
import { createPersistedState } from 'pinia-plugin-persistedstate';

const pinia = createPinia();

pinia.use(createPersistedState({
    storage: {
        getItem: (key) => localStorage.getItem(key),
        setItem: (key, value) => localStorage.setItem(key, value)
    },
    serializer: {
        serialize: JSON.stringify,
        deserialize: JSON.parse
    }
}));

export default pinia;
