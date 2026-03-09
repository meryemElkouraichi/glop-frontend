const axios = require('axios');

async function test() {
    try {
        const r = await axios.get("http://localhost:8080/api/events");
        console.log("STATUS:", r.status);
        console.log("DATA TYPE:", typeof r.data, Array.isArray(r.data) ? 'Array' : '');
        console.log("DATA:", r.data);
    } catch (e) {
        console.error("AXIOS ERROR:", e.message, e.response?.status, e.response?.data);
    }
}
test();
