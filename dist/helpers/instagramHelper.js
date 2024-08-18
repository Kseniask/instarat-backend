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
exports.getUserId = exports.sendUserMedia = exports.getMediaGroups = void 0;
const constants_1 = require("./constants");
const telegramHelper_1 = require("./telegramHelper");
const puppeteer_1 = __importDefault(require("puppeteer"));
const axios_1 = __importDefault(require("axios"));
const axiosInstance = axios_1.default.create({
    headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
    },
});
const getMediaGroups = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    var hasError = false;
    if (!Number(userId)) {
        throw Error(constants_1.ErrorMessages.INVALID_USER_ID_ERROR_MESSAGE);
        // userId = await getUserId(instausername, context)
        // if (userId === 0) {
        //   return context.reply('Або акаунт приватний aбо такого юзера не існує..')
        // }
        //398693120
    }
    const userStories = yield axiosInstance
        .get(`https://storiesig.info/api/ig/stories/${userId}`)
        .then((response) => {
        console.log('response: ', response);
        return response.data.result || undefined;
    })
        .catch((e) => {
        console.log('Error occured while trying to get stories: ', e);
        hasError = true;
    });
    console.log('userStories: ', userStories);
    if (hasError) {
        return undefined;
    }
    if (userStories && userStories.length !== 0) {
        const mediaGroups = [];
        userStories.forEach((story, index) => {
            const isVideo = story.video_versions;
            const storyUrl = isVideo ? story.video_versions[0].url : story.image_versions2.candidates[1].url;
            const mediaValue = {
                type: (isVideo === null || isVideo === void 0 ? void 0 : isVideo.length) > 0 ? 'video' : 'photo',
                media: storyUrl,
            };
            if (index < 9) {
                if (mediaGroups[0]) {
                    mediaGroups[0].push(mediaValue);
                }
                else {
                    mediaGroups.push([mediaValue]);
                }
            }
            else if (index < 19) {
                if (mediaGroups[1]) {
                    mediaGroups[1].push(mediaValue);
                }
                else {
                    mediaGroups.push([mediaValue]);
                }
            }
            else if (index < 29) {
                if (mediaGroups[2]) {
                    mediaGroups[2].push(mediaValue);
                }
                else {
                    mediaGroups.push([mediaValue]);
                }
            }
            else {
                if (mediaGroups[3]) {
                    mediaGroups[3].push(mediaValue);
                }
                else {
                    mediaGroups.push([mediaValue]);
                }
            }
            return [];
        });
        return mediaGroups;
    }
});
exports.getMediaGroups = getMediaGroups;
const sendUserMedia = (userId, chatId) => __awaiter(void 0, void 0, void 0, function* () {
    const mediaGroups = yield (0, exports.getMediaGroups)(userId);
    if (mediaGroups === undefined) {
        return yield (0, telegramHelper_1.sendMessage)(chatId, 'Упс.. Сталася помилка');
    }
    if (mediaGroups.length === 0) {
        return yield (0, telegramHelper_1.sendMessage)(chatId, 'Пусто');
    }
    yield Promise.all(mediaGroups.map((mediaGroup) => __awaiter(void 0, void 0, void 0, function* () {
        if (mediaGroup.length > 0) {
            if (mediaGroup.length === 1) {
                switch (mediaGroup[0].type) {
                    case 'photo':
                        yield (0, telegramHelper_1.sendPhoto)(chatId, mediaGroup[0].media);
                        break;
                    case 'video':
                        yield (0, telegramHelper_1.sendVideo)(chatId, mediaGroup[0].media);
                }
            }
            else {
                yield (0, telegramHelper_1.sendMediaGroup)(chatId, mediaGroup.filter((media) => media.type == 'photo'));
                yield (0, telegramHelper_1.sendMediaGroup)(chatId, mediaGroup.filter((media) => media.type == 'video'));
            }
        }
    })));
});
exports.sendUserMedia = sendUserMedia;
const getUserId = (username) => __awaiter(void 0, void 0, void 0, function* () {
    const browser = yield puppeteer_1.default.launch({ args: ['--no-sandbox'] });
    try {
        const page = yield browser.newPage();
        yield page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36');
        yield page.setRequestInterception(true);
        let stopRequests = false;
        page.on('request', (request) => __awaiter(void 0, void 0, void 0, function* () {
            if (request.url().includes(`https://www.instagram.com/api/v1/lox/account_recommendations`)) {
                stopRequests = true;
                return yield request.continue();
            }
            if (stopRequests) {
                return yield request.abort();
            }
            yield request.continue();
        }));
        yield page.goto(`https://instagram.com/${username}`, { waitUntil: 'load' });
        // await page.screenshot({ path: 'userId.jpg' });
        const userId = yield page.evaluate(() => {
            let foundId = false;
            let currentIndex = 20;
            const getIdText = (scriptIndex) => {
                var _a;
                return (_a = document.scripts[scriptIndex]) === null || _a === void 0 ? void 0 : _a.text.split('"id":"')[1];
            };
            while (foundId === false && currentIndex < 50) {
                foundId = getIdText(currentIndex) !== undefined;
                currentIndex++;
            }
            if (foundId) {
                const userId = getIdText(currentIndex - 1).split('","')[0];
                return userId;
            }
            return 0;
        });
        return userId;
    }
    catch (ex) {
        throw new Error(`Failed: ${ex}`);
    }
    finally {
        yield browser.close();
    }
});
exports.getUserId = getUserId;
