import { MediaGroup } from "./interfaces";

export const sendMessage = async (chatId: string, message: string) => {
  await fetch(
    `${process.env.BASE_URL}/bot${process.env.API_KEY}/sendMessage?chat_id=${chatId}&text=${message}`
  ).then(resp => resp.json())
}

export async function sendPhoto (chatId: string, photoUrl: string) {
  await fetch(`/bot${process.env.API_KEY}/sendPhoto`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      chat_id: Number(chatId),
      photo: photoUrl
    })
  }).then(resp => resp.json())
}

export async function sendVideo (chatId: string, videoUrl: string) {
  await fetch(`${process.env.BASE_URL}/bot${process.env.API_KEY}/sendVideo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      chat_id: Number(chatId),
      video: videoUrl
    })
  }).then(resp => resp.json())
}

export async function sendMediaGroup (chatId: string, arrayOfMedia: MediaGroup) {
  await fetch(`${process.env.BASE_URL}/bot${process.env.API_KEY}/sendMediaGroup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      chat_id: Number(chatId),
      media: arrayOfMedia
    })
  })
}