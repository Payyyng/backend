import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Expo } from "expo-server-sdk";
import axios from 'axios';


export interface NotificationDTO{
  title: string;
  expoPushToken: string
  body: string;
  sound?: string;
  data?: any;
}
@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}


  async create({id, notificationKey}: CreateNotificationDto) {
    if (!id || !notificationKey){
      throw new HttpException(
        'Id & Notification key is Required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.prisma.user.update({
      where: {
        id
      },
      data: {
        notificationKey: notificationKey
      }
    })
    return {
      status: "success",
      message: 'Notification key updated successfully'
    }  }

  findAll() {
    return `This action returns all notifications`;
  }

  findOne(id: number) {
    return `This action returns a #${id} notification`;
  }

  update(id: number, updateNotificationDto: UpdateNotificationDto) {
    return `This action updates a #${id} notification`;
  }

  remove(id: number) {
    return `This action removes a #${id} notification`;
  }


  // async sendNotification({expoPushToken, title, body}: NotificationDTO) {
  //   const expo = new Expo({ accessToken: "IJ1sPtEFwGCkVz4F5fu60s758FgVSd7NXulW_BJb" });

  //   const data = {
  //       title: `${title}`,
  //       body: `${body}`,
  //       sound: "default",
  //       // data: { withSome: `${data}` },
  //   }
  //   const chunks = expo.chunkPushNotifications([{ to: expoPushToken, data }]);
  //   const tickets = [];

  //   for (const chunk of chunks) {
  //       try {
  //           const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
  //           tickets.push(...ticketChunk);
  //       } catch (error) {
  //           console.error(error);
  //       }
  //   }

  //   let response = "";

  //   for (const ticket of tickets) {
  //       if (ticket.status === "error") {
  //           if (ticket.details && ticket.details.error === "DeviceNotRegistered") {
  //               response = "DeviceNotRegistered";
  //           }
  //       }

  //       if (ticket.status === "ok") {
  //           response = ticket.id;
  //       }
  //   }
  //   return response;
  // }

  async sendNotification ({expoPushToken, title, body}: NotificationDTO) {

    try {
      const res = await axios.post('https://exp.host/--/api/v2/push/send', {
        to: expoPushToken,
        title: title,
        body: body,
      })
      return res.data

    } catch (err){
      throw err;
      return err
    }
  }


  
  async sendNotificationToAll({ title, body }: any) {
    if (!title || !body) {
      throw new HttpException('Title & Body are required', HttpStatus.BAD_REQUEST);
    }
  
    const users = await this.prisma.user.findMany({
      select: {
        notificationKey: true,
      },
    });
  
    // const validNotificationKeys = users
    //   .filter((user) => user.notificationKey) // Filter out users without a notificationKey
    //   .map((user) => user.notificationKey);
  
    // if (validNotificationKeys.length === 0) {
    //   throw new HttpException(
    //     'No users with valid notification keys found',
    //     HttpStatus.BAD_REQUEST,
    //   );
    // }
    try {
      const requests = users.map(async (user) => {
        const { notificationKey } = user;
        if (notificationKey){
          return axios.post('https://exp.host/--/api/v2/push/send', {
            to: notificationKey,
            title: title,
            body: body,
          });
        }
      });
  
      const responses = await Promise.all(requests);
      console.log(responses)
      return {
        status: 'success',
        message: 'Notifications sent successfully',
      }
    } catch (err) {
      throw err;
    }

  }
   

  


}
