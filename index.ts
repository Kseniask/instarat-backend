import express, { Express, Request, Response } from 'express'
import dotenv from 'dotenv'
import axios from 'axios'
import { MediaGroup } from './interfaces';
import fetch from "node-fetch";

dotenv.config()

const app: Express = express()
const port = process.env.PORT


app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to Instarat backend')
})

app.get('/send-stories/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params
  console.log('userId ', userId);
  
  if (!Number(userId)) {
    res.send('invalid')
    // userId = await getUserId(instaUsername, context)
    // if (userId === 0) {
    //   return context.reply('Або акаунт приватний aбо такого юзера не існує..')
    // }
    //398693120
  }
const userStories: any = await fetch(`https://storiesig.info/api/ig/stories/${userId}`).then(async(response) => (await response.json()).result || undefined);

    if (userStories && userStories.length !== 0) {
      const mediaGroups: MediaGroup[] = [];
      userStories.forEach((story: any, index: number) => {
        const isVideo = story.video_versions;
        const storyUrl = isVideo ? story.video_versions[0].url : story.image_versions2.candidates[1].url;

        const mediaValue = {
          type: isVideo ? 'video' : 'photo',
          media: storyUrl
        };
        if (index < 9) {
          if(mediaGroups[0]){
            mediaGroups[0].push(mediaValue);
          } else {
            mediaGroups.push([mediaValue]);
          }
        } else if (index < 19) {
           if(mediaGroups[1]){
            mediaGroups[1].push(mediaValue);
          } else {
            mediaGroups.push([mediaValue]);
          }
        } else if (index < 29) {
            if(mediaGroups[2]){
            mediaGroups[2].push(mediaValue);
          } else {
            mediaGroups.push([mediaValue]);
          }
        } else {
           if(mediaGroups[3]){
            mediaGroups[3].push(mediaValue);
          } else {
            mediaGroups.push([mediaValue]);
          }
        }
        return;
      });
    return res.send(mediaGroups);
    }
  return res.send('No data');
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`)
})
