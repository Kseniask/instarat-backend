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
const express_1 = __importDefault(require("express"));
const telegramHelper_js_1 = require("./helpers/telegramHelper.js");
const instagramHelper_js_1 = require("./helpers/instagramHelper.js");
const constants_js_1 = require("./helpers/constants.js");
require('dotenv').config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
const port = process.env.PORT;
app.get('/', (req, res) => {
    res.send('Welcome to Instarat backend');
});
app.get('/get-user-id/:username', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = yield (0, instagramHelper_js_1.getUserId)(req.params.username);
        return res.send(userId.toString());
    }
    catch (ex) {
        return res.status(500).send(`Error occured while trying to get user ID: ${ex}`);
    }
}));
app.post('/send-stories', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { chatId, text } = req.body;
    const userId = text;
    yield (0, telegramHelper_js_1.sendMessage)(chatId, `Getting stories for ${userId}`);
    try {
        if (parseInt(userId)) {
            yield (0, instagramHelper_js_1.sendUserMedia)(userId, chatId);
        }
        else if (text[0] === '@') {
            yield (0, telegramHelper_js_1.sendMessage)(chatId, constants_js_1.ErrorMessages.NOT_IMPLEMENTED);
            return res.status(500).send(constants_js_1.ErrorMessages.NOT_IMPLEMENTED);
        }
        else {
            yield (0, telegramHelper_js_1.sendMessage)(chatId, constants_js_1.ErrorMessages.INVALID_USERNAME);
            return res.status(500).send(constants_js_1.ErrorMessages.INVALID_USERNAME);
        }
    }
    catch (ex) {
        return res.status(500).send(`${constants_js_1.ErrorMessages.FAILED_CALL_ERROR_MESSAGE} ${ex}`);
    }
    return res.sendStatus(200);
}));
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
