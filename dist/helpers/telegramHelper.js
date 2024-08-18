"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMediaGroup = exports.sendVideo = exports.sendPhoto = exports.sendMessage = void 0;
const axios_1 = __importDefault(require("axios"));
const axiosInstance = axios_1.default.create({
    headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
    },
});
const sendMessage = (chatId, message) => __awaiter(void 0, void 0, void 0, function* () {
    yield axiosInstance
        .get(`${process.env.BASE_URL}/bot${process.env.API_KEY}/sendMessage?chat_id=${chatId}&text=${message}`)
        .then((resp) => resp.data);
});
exports.sendMessage = sendMessage;
function sendPhoto(chatId, photoUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        yield axiosInstance
            .post(`${process.env.BASE_URL}/bot${process.env.API_KEY}/sendPhoto`, {
            chat_id: Number(chatId),
            photo: photoUrl,
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((response) => {
            console.log(response.data);
        })
            .catch((error) => {
            (0, exports.sendMessage)(chatId, error);
        });
    });
}
exports.sendPhoto = sendPhoto;
function sendVideo(chatId, videoUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        yield axiosInstance
            .post(`${process.env.BASE_URL}/bot${process.env.API_KEY}/sendVideo`, {
            chat_id: Number(chatId),
            video: videoUrl,
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((resp) => resp.data)
            .catch((error) => (0, exports.sendMessage)(chatId, error));
    });
}
exports.sendVideo = sendVideo;
function sendMediaGroup(chatId, arrayOfMedia) {
    return __awaiter(this, void 0, void 0, function* () {
        yield axiosInstance
            .post(`${process.env.BASE_URL}/bot${process.env.API_KEY}/sendMediaGroup`, {
            chat_id: Number(chatId),
            media: arrayOfMedia,
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .catch((error) => (0, exports.sendMessage)(chatId, error));
    });
}
exports.sendMediaGroup = sendMediaGroup;
