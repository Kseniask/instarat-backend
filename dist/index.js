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
const dotenv_1 = __importDefault(require("dotenv"));
const puppeteer_1 = __importDefault(require("puppeteer"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT;
const getUserId = (username) => __awaiter(void 0, void 0, void 0, function* () {
    const browser = yield puppeteer_1.default.launch({ args: ['--no-sandbox'] });
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
        let currentIndex = 32;
        const getIdText = (scriptIndex) => document.scripts[scriptIndex].text.split('"id":"')[1];
        while (foundId === false && currentIndex < 45) {
            foundId = getIdText(currentIndex) !== undefined;
            currentIndex++;
        }
        if (foundId) {
            const userId = getIdText(currentIndex - 1).split('","')[0];
            return userId;
        }
        return 0;
    });
    yield browser.close();
    return userId;
});
app.get('/', (req, res) => {
    res.send('Welcome to Instarat backend');
});
app.get('/get-user-id/:username', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = yield getUserId(req.params.username);
        res.send(userId.toString());
    }
    catch (ex) {
        res.sendStatus(500).send('Error occured while trying to get user ID');
    }
}));
app.get('/send-stories/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    if (!Number(userId)) {
        res.send('invalid');
        // userId = await getUserId(instausername, context)
        // if (userId === 0) {
        //   return context.reply('Або акаунт приватний aбо такого юзера не існує..')
        // }
        //398693120
    }
    try {
        const userStories = yield fetch(`https://storiesig.info/api/ig/stories/${userId}`).then((response) => __awaiter(void 0, void 0, void 0, function* () { return (yield response.json()).result || undefined; }));
        if (userStories && userStories.length !== 0) {
            const mediaGroups = [];
            userStories.forEach((story, index) => {
                const isVideo = story.video_versions;
                const storyUrl = isVideo ? story.video_versions[0].url : story.image_versions2.candidates[1].url;
                const mediaValue = {
                    type: isVideo ? 'video' : 'photo',
                    media: storyUrl
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
                return;
            });
            return res.send(mediaGroups);
        }
    }
    catch (ex) {
        return res.sendStatus(500).send('call failed');
    }
    ;
    return res.send('No data');
}));
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
