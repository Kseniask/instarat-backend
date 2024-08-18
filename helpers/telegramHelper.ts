import axios from 'axios';
import { MediaGroup } from './interfaces';

const axiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

export const sendMessage = async (chatId: string, message: string) => {
  await axiosInstance
    .get(`${process.env.BASE_URL}/bot${process.env.API_KEY}/sendMessage?chat_id=${chatId}&text=${message}`)
    .then((resp) => resp.data);
};

export async function sendPhoto(chatId: string, photoUrl: string) {
  await axiosInstance
    .post(
      `${process.env.BASE_URL}/bot${process.env.API_KEY}/sendPhoto`,
      {
        chat_id: Number(chatId),
        photo: photoUrl,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
    .then((response) => {
      console.log(response.data);
    })
    .catch((error) => {
      sendMessage(chatId, error);
    });
}

export async function sendVideo(chatId: string, videoUrl: string) {
  await axiosInstance
    .post(
      `${process.env.BASE_URL}/bot${process.env.API_KEY}/sendVideo`,
      {
        chat_id: Number(chatId),
        video: videoUrl,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
    .then((resp) => resp.data)
    .catch((error) => sendMessage(chatId, error));
}

export async function sendMediaGroup(chatId: string, arrayOfMedia: MediaGroup) {
  await axiosInstance
    .post(
      `${process.env.BASE_URL}/bot${process.env.API_KEY}/sendMediaGroup`,
      {
        chat_id: Number(chatId),
        media: arrayOfMedia,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
    .catch((error) => sendMessage(chatId, error));
}
