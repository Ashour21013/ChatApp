var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const BASE_URL = 'http://webp-ilv-backend.cs.technikum-wien.at/messenger';
export class ApiService {
    // Provide a getter if you want to retrieve it elsewhere
    static getToken() {
        return this.token;
    }
    static getRegisteredUserId() {
        return this.registeredUserId;
    }
    // ---------------------------------------------
    // 1) Register a new user
    // ---------------------------------------------
    static registerUser(name, email, password, groupId) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `${BASE_URL}/registrieren.php`;
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            formData.append('password', password);
            formData.append('group_id', groupId);
            const resp = yield fetch(url, {
                method: 'POST',
                body: formData,
            });
            const data = yield resp.json();
            //Api aufruf mit axios
            //const {data} = await axios.post(url,formData);
            // Wenn data id enthält, dann absepichern
            if (data.id) {
                this.registeredUserId = data.id;
                console.log('Registered user ID stored:', this.registeredUserId);
            }
            return data;
        });
    }
    // ---------------------------------------------
    // 2) Login
    // ---------------------------------------------
    static loginUser(usernameOrEmail, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `${BASE_URL}/login.php`;
            const formData = new FormData();
            formData.append('username_or_email', usernameOrEmail);
            formData.append('password', password);
            const resp = yield fetch(url, {
                method: 'POST',
                body: formData,
            });
            const data = yield resp.json();
            console.log('Login/Registration response:', data);
            // If the backend returns a token
            if (data.token) {
                this.token = data.token;
                console.log('Token stored:', this.token);
            }
            if (data.id) {
                this.registeredUserId = data.id;
                console.log('Userid stored:', this.registeredUserId);
            }
            return data;
        });
    }
    // ---------------------------------------------
    // 3) Get Users
    // ---------------------------------------------
    // Inside ApiService class
    static getUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            // Build the query params conditionally
            const params = [];
            // If we have a token, add it
            if (this.token) {
                params.push(`token=${this.token}`);
            }
            // If we have the registered user ID
            if (this.registeredUserId) {
                params.push(`id=${this.registeredUserId}`);
            }
            // Construct the final query string
            // e.g. "?token=abc123&id=42" or "" if neither is set
            const queryString = params.length > 0 ? '?' + params.join('&') : '';
            const url = `${BASE_URL}/get_users.php${queryString}`;
            //api aufruf mit axios
            //const { data } = await axios.get(url);
            // return data;
            const resp = yield fetch(url);
            console.log(resp);
            return resp.json();
        });
    }
    // ---------------------------------------------
    // 4) Send Message
    // ---------------------------------------------
    static sendMessage(receiverId, message) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `${BASE_URL}/send_message.php`;
            const formData = new FormData();
            formData.append('sender_id', this.registeredUserId); //this.senderid umtauschen irwann
            formData.append('receiver_id', receiverId);
            formData.append('message', message);
            if (this.token) {
                formData.append('token', this.token);
            }
            const resp = yield fetch(url, {
                method: 'POST',
                body: formData,
            });
            return resp.json();
        });
    }
    static getConversation(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = [];
            // If we have a token, add it
            if (this.token) {
                params.push(`token=${this.token}`);
            }
            // If we have the registered user ID
            if (this.registeredUserId) {
                params.push(`user1_id=${this.registeredUserId}`);
            }
            params.push(`user2_id=${userId}`);
            // Construct the final query string
            // e.g. "?token=abc123&id=42" or "" if neither is set
            const queryString = params.length > 0 ? '?' + params.join('&') : '';
            const url = `${BASE_URL}/get_conversation.php${queryString}`;
            //token, user1_id, user2_id (as query params)
            const resp = yield fetch(url);
            return resp.json();
        });
    }
}
// We store the token here after login
ApiService.token = null;
