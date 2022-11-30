import { MediaGroup } from "./interfaces";
import { ErrorMessages } from "./constants"
import { sendMediaGroup, sendMessage, sendPhoto, sendVideo } from "./telegramHelper";
import  Puppeteer  from "puppeteer";

export const getMediaGroups = async (userId: string) => {
    if (!Number(userId)) {
    throw Error(ErrorMessages.INVALID_USER_ID_ERROR_MESSAGE);
    // userId = await getUserId(instausername, context)
    // if (userId === 0) {
    //   return context.reply('Або акаунт приватний aбо такого юзера не існує..')
    // }
    //398693120
  }
  try {
    const userStories: any = await fetch(`https://storiesig.info/api/ig/stories/${userId}`).then(async(response:any ) => (await response.json()).result || undefined);

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
    return mediaGroups;
    }
  } catch (ex) {
     throw Error(`Getting media failed: ${ex}`)
  };
} 

export const sendUserMedia = async(userId: string, chatId: string ) => {
    const mediaGroups = await getMediaGroups(userId);
    
    if(mediaGroups === undefined) {
        return await sendMessage( chatId, 'Пусто');
    }
    mediaGroups.forEach(async mediaGroup => {
        if (mediaGroup.length > 0) {
            if (mediaGroup.length === 1) {
            switch (mediaGroup[0].type) {
                case 'photo':
                    await sendPhoto( chatId, mediaGroup[0].media);
                    break;
                case 'video':
                    await sendVideo(chatId, mediaGroup[0].media);
            }
            } else {
                await sendMediaGroup(chatId, mediaGroup);
            }
        }
    })
}

export const getUserId = async (username: string) => {
  const browser = await Puppeteer.launch({ args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36'
    );
    await page.setRequestInterception(true);
    let stopRequests = false;
    page.on('request', async (request: any) => {    
      if (request.url().includes(`https://www.instagram.com/api/v1/lox/account_recommendations`)) {
        stopRequests = true;
        return await request.continue();
      }
      if (stopRequests) {
        return await request.abort();
      }
      await request.continue();
    });
    await page.goto(`https://instagram.com/${username}`, { waitUntil: 'load' });
    // await page.screenshot({ path: 'userId.jpg' });
    const userId = await page.evaluate(
      () => {
        let foundId = false;
        let currentIndex = 20;
        const getIdText = (scriptIndex: number) => {          
          return document.scripts[scriptIndex]?.text.split('"id":"')[1];}
        while (foundId === false && currentIndex < 50) {
          foundId = getIdText(currentIndex) !== undefined;
          currentIndex++;
        }

        if (foundId) {
          const userId = getIdText(currentIndex - 1).split('","')[0];
          return userId;
        }
        return 0;
      }
    );
    return userId;
  } catch(ex: any) {
      throw new Error(`Failed: ${ex}`)
  } finally{
      await browser.close();
  }
};
