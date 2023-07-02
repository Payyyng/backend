import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Expo } from "expo-server-sdk";


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


  async sendNotification({expoPushToken, title, body}: NotificationDTO) {
    const expo = new Expo({ accessToken: "IJ1sPtEFwGCkVz4F5fu60s758FgVSd7NXulW_BJb" });

    const data = {
        title: `${title}`,
        body: `${body}`,
        sound: "default",
        // data: { withSome: `${data}` },
    }
    const chunks = expo.chunkPushNotifications([{ to: expoPushToken, data }]);
    const tickets = [];

    for (const chunk of chunks) {
        try {
            const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            tickets.push(...ticketChunk);
        } catch (error) {
            console.error(error);
        }
    }

    let response = "";

    for (const ticket of tickets) {
        if (ticket.status === "error") {
            if (ticket.details && ticket.details.error === "DeviceNotRegistered") {
                response = "DeviceNotRegistered";
            }
        }

        if (ticket.status === "ok") {
            response = ticket.id;
        }
    }
    return response;
  }


 async sendSingleNotification (receiptId: string){
    const expo = new Expo({ accessToken: process.env.ACCESS_TOKEN });
    const receiptIdChunks = expo.chunkPushNotificationReceiptIds([receiptId]);

    let receipt;

    for (const chunk of receiptIdChunks) {
        try {
            receipt = await expo.getPushNotificationReceiptsAsync(chunk);
        } catch (error) {
            console.error(error);
        }
    }

    return receipt ? receipt[receiptId] : null;
}
}
