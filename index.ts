import express, { Express, Request, Response } from 'express';
import { sendMessage } from './helpers/telegramHelper.js';
import { getUserId, sendUserMedia } from './helpers/instagramHelper.js';
import { ErrorMessages } from './helpers/constants.js';
require('dotenv').config();

const app: Express = express();
app.use(express.json());
const port = process.env.PORT;

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to Instarat backend');
});

app.post('/send-user-id/', async (req: Request, res: Response) => {
  const { chatId, text } = req.body;
  try {
    console.log(`Getting user id for ${text}`);
    await sendMessage(chatId, `Getting user id for ${text}`);
    const userId = await getUserId(text);
    await sendMessage(chatId, `User id of @${text}: ${userId}`);
    res.send(userId.toString());
  } catch (ex: any) {
    res.status(500).send(`Error occured while trying to get user ID: ${ex}`);
  }
});

app.post('/send-stories', async (req: Request, res: Response) => {
  console.log('req.body', req.body);

  const { chatId, text } = req.body;
  const userId = text;
  await sendMessage(chatId, `Getting stories for ${userId}`);
  try {
    if (parseInt(userId)) {
      await sendUserMedia(userId, chatId);
    } else if (text[0] === '@') {
      await sendMessage(chatId, ErrorMessages.NOT_IMPLEMENTED);
      console.log(`${ErrorMessages.NOT_IMPLEMENTED}. Searching ${text}`);
      return res.status(500).send(ErrorMessages.NOT_IMPLEMENTED);
    } else {
      await sendMessage(chatId, ErrorMessages.INVALID_USERNAME);
      console.log(`${ErrorMessages.INVALID_USERNAME}. Searching ${text}`);
      return res.status(500).send(ErrorMessages.INVALID_USERNAME);
    }
  } catch (ex) {
    return res.status(500).send(`${ErrorMessages.FAILED_CALL_ERROR_MESSAGE} ${ex}`);
  }
  return res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
