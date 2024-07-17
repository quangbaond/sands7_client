import { createLogger, createStore } from "vuex";

const store = createStore({
    state() {
        return {
            count: 0,
        };
    },
    mutations: {
        increment(state) {
            state.count++;
        },
    },
    actions: {
        increment(context) {
            context.commit("increment");
        },
    },
    plugins: import.meta.env.MODE !== "production" ? [createLogger()] : [],
});

export default store;