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
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT;
app.get('/', (req, res) => {
    res.send('Welcome to Instarat backend');
});
app.get('/send-stories/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    console.log('userId ', userId);
    if (!Number(userId)) {
        res.send('invalid');
        // userId = await getUserId(instaUsername, context)
        // if (userId === 0) {
        //   return context.reply('Або акаунт приватний aбо такого юзера не існує..')
        // }
        //398693120
    }
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
    return res.send('No data');
}));
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
