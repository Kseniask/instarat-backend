import express, { Express, Request, Response } from 'express'
import { sendMessage } from './helpers/telegramHelper.js';
import { getUserId, sendUserMedia } from './helpers/instagramHelper.js';
import { ErrorMessages } from './helpers/constants.js';
require('dotenv').config();

const app: Express = express();
app.use(express.json());
const port = process.env.PORT;

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to Instarat backend')
})

app.get('/get-user-id/:username', async (req: Request, res: Response)=>{
  try {
    const userId = await getUserId(req.params.username);
    return res.send(userId.toString());
  } catch(ex: any){
    return res.status(500).send(`Error occured while trying to get user ID: ${ex}`);
  }
})

app.post('/send-stories', async (req: Request, res: Response) => {
  const { chatId, text } = req.body
  const userId = text;
  await sendMessage( chatId, `Getting stories for ${userId}`)
  try{
    if (parseInt(userId)) {
      await sendUserMedia(userId, chatId);
    } 
    else if (text[0] === '@') {
      await sendMessage( chatId, ErrorMessages.NOT_IMPLEMENTED);
      return res.status(500).send(ErrorMessages.NOT_IMPLEMENTED);
    } 
    else {
      await sendMessage(
        chatId,
        ErrorMessages.INVALID_USERNAME
      )
      return res.status(500).send(ErrorMessages.INVALID_USERNAME);
    }
  } catch (ex) {
    return res.status(500).send(`${ErrorMessages.FAILED_CALL_ERROR_MESSAGE} ${ex}`);
  }
  return res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`)
})
