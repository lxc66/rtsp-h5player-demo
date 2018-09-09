import Cookies from 'js-cookie';

const user = {
    state: {},
    mutations: {
        logout (state, vm) {
            console.log("logout....");
            Cookies.remove('account');
            Cookies.remove('token');
            localStorage.clear();
        }
    }
};

export default user;
