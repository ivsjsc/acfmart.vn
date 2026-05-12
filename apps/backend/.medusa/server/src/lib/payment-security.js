"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hmacHex = hmacHex;
exports.sortedQuery = sortedQuery;
exports.vnpayDate = vnpayDate;
const crypto_1 = __importDefault(require("crypto"));
function hmacHex(algorithm, secret, value) {
    return crypto_1.default.createHmac(algorithm, secret).update(value, "utf8").digest("hex");
}
function sortedQuery(params) {
    const search = new URLSearchParams();
    Object.keys(params)
        .sort()
        .forEach((key) => {
        const value = params[key];
        if (value !== undefined && value !== "") {
            search.set(key, String(value));
        }
    });
    return search.toString();
}
function vnpayDate(date = new Date()) {
    const pad = (n) => String(n).padStart(2, "0");
    return [
        date.getFullYear(),
        pad(date.getMonth() + 1),
        pad(date.getDate()),
        pad(date.getHours()),
        pad(date.getMinutes()),
        pad(date.getSeconds()),
    ].join("");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF5bWVudC1zZWN1cml0eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9saWIvcGF5bWVudC1zZWN1cml0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUVBLDBCQU1DO0FBRUQsa0NBWUM7QUFFRCw4QkFVQztBQWxDRCxvREFBMkI7QUFFM0IsU0FBZ0IsT0FBTyxDQUNyQixTQUE4QixFQUM5QixNQUFjLEVBQ2QsS0FBYTtJQUViLE9BQU8sZ0JBQU0sQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFBO0FBQ2pGLENBQUM7QUFFRCxTQUFnQixXQUFXLENBQUMsTUFBbUQ7SUFDN0UsTUFBTSxNQUFNLEdBQUcsSUFBSSxlQUFlLEVBQUUsQ0FBQTtJQUNwQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztTQUNoQixJQUFJLEVBQUU7U0FDTixPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtRQUNmLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUN6QixJQUFJLEtBQUssS0FBSyxTQUFTLElBQUksS0FBSyxLQUFLLEVBQUUsRUFBRSxDQUFDO1lBQ3hDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO1FBQ2hDLENBQUM7SUFDSCxDQUFDLENBQUMsQ0FBQTtJQUVKLE9BQU8sTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFBO0FBQzFCLENBQUM7QUFFRCxTQUFnQixTQUFTLENBQUMsSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFO0lBQ3pDLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBUyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQTtJQUNyRCxPQUFPO1FBQ0wsSUFBSSxDQUFDLFdBQVcsRUFBRTtRQUNsQixHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN4QixHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ25CLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDcEIsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUN0QixHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0tBQ3ZCLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFBO0FBQ1osQ0FBQyJ9