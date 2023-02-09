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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMediaGroup = exports.sendVideo = exports.sendPhoto = exports.sendMessage = void 0;
const sendMessage = (chatId, message) => __awaiter(void 0, void 0, void 0, function* () {
    yield fetch(`${process.env.BASE_URL}/bot${process.env.API_KEY}/sendMessage?chat_id=${chatId}&text=${message}`).then(resp => resp.json());
});
exports.sendMessage = sendMessage;
function sendPhoto(chatId, photoUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        yield fetch(`${process.env.BASE_URL}/bot${process.env.API_KEY}/sendPhoto`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: Number(chatId),
                photo: photoUrl
            })
        }).then(resp => resp.json()).catch((error) => (0, exports.sendMessage)(chatId, error));
    });
}
exports.sendPhoto = sendPhoto;
function sendVideo(chatId, videoUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        yield fetch(`${process.env.BASE_URL}/bot${process.env.API_KEY}/sendVideo`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: Number(chatId),
                video: videoUrl
            })
        }).then(resp => resp.json()).catch((error) => (0, exports.sendMessage)(chatId, error));
    });
}
exports.sendVideo = sendVideo;
function sendMediaGroup(chatId, arrayOfMedia) {
    return __awaiter(this, void 0, void 0, function* () {
        yield fetch(`${process.env.BASE_URL}/bot${process.env.API_KEY}/sendMediaGroup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: Number(chatId),
                media: arrayOfMedia
            })
        }).catch((error) => (0, exports.sendMessage)(chatId, error));
    });
}
exports.sendMediaGroup = sendMediaGroup;
