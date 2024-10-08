import { MediaGroup } from './interfaces';
import { ErrorMessages } from './constants';
import { sendMediaGroup, sendMessage, sendPhoto, sendVideo } from './telegramHelper';
import Puppeteer from 'puppeteer';
import axios from 'axios';

const getCookies = async () => {
  const browser = await Puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('https://storiesig.info', { waitUntil: 'load' });
  const cookies = await page.cookies();
  await browser.close();
  return cookies;
};

export const getMediaGroups = async (userId: string) => {
  const cookies = await getCookies();
  console.log('cookies: ', cookies);

  var hasError = false;
  if (!Number(userId)) {
    throw Error(ErrorMessages.INVALID_USER_ID_ERROR_MESSAGE);
    // userId = await getUserId(instausername, context)
    // if (userId === 0) {
    //   return context.reply('Або акаунт приватний aбо такого юзера не існує..')
    // }
    //398693120
  }
  const axiosInstance = axios.create({
    headers: {
      'Content-Type': 'application/json',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
      Cookie: cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join('; '),
    },
  });

  const userStories: any = await axiosInstance
    .get(`https://storiesig.info/api/ig/stories/${userId}`)
    .then((response: any) => {
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
    const mediaGroups: MediaGroup[] = [];
    userStories.forEach((story: any, index: number) => {
      const isVideo = story.video_versions;
      const storyUrl = isVideo ? story.video_versions[0].url : story.image_versions2.candidates[1].url;

      const mediaValue = {
        type: isVideo?.length > 0 ? 'video' : 'photo',
        media: storyUrl,
      };
      if (index < 9) {
        if (mediaGroups[0]) {
          mediaGroups[0].push(mediaValue);
        } else {
          mediaGroups.push([mediaValue]);
        }
      } else if (index < 19) {
        if (mediaGroups[1]) {
          mediaGroups[1].push(mediaValue);
        } else {
          mediaGroups.push([mediaValue]);
        }
      } else if (index < 29) {
        if (mediaGroups[2]) {
          mediaGroups[2].push(mediaValue);
        } else {
          mediaGroups.push([mediaValue]);
        }
      } else {
        if (mediaGroups[3]) {
          mediaGroups[3].push(mediaValue);
        } else {
          mediaGroups.push([mediaValue]);
        }
      }
      return [];
    });
    return mediaGroups;
  }
};

export const sendUserMedia = async (userId: string, chatId: string) => {
  const mediaGroups = await getMediaGroups(userId);

  if (mediaGroups === undefined) {
    return await sendMessage(chatId, 'Упс.. Сталася помилка');
  }

  if (mediaGroups.length === 0) {
    return await sendMessage(chatId, 'Пусто');
  }

  await Promise.all(
    mediaGroups.map(async (mediaGroup) => {
      if (mediaGroup.length > 0) {
        if (mediaGroup.length === 1) {
          switch (mediaGroup[0].type) {
            case 'photo':
              await sendPhoto(chatId, mediaGroup[0].media);
              break;
            case 'video':
              await sendVideo(chatId, mediaGroup[0].media);
          }
        } else {
          await sendMediaGroup(
            chatId,
            mediaGroup.filter((media) => media.type == 'photo'),
          );
          await sendMediaGroup(
            chatId,
            mediaGroup.filter((media) => media.type == 'video'),
          );
        }
      }
    }),
  );
};

export const getUserId = async (username: string) => {
  const browser = await Puppeteer.launch({ args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
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
    const userId = await page.evaluate(() => {
      let foundId = false;
      let currentIndex = 20;
      const getIdText = (scriptIndex: number) => {
        return document.scripts[scriptIndex]?.text.split('"id":"')[1];
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
  } catch (ex: any) {
    throw new Error(`Failed: ${ex}`);
  } finally {
    await browser.close();
  }
};
