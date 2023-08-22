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

  async sendNotification ({expoPushToken, title, body}: NotificationDTO) {
  
    try {
      const {data} = await axios.post('https://exp.host/--/api/v2/push/send', {
        to: expoPushToken,
        title: title,
        body: body,
      })
      return data

    } catch (err){
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
      return {
        status: 'success',
        message: 'Notifications sent successfully',
      }
    } catch (err) {
      throw err;
    }

  }
  
}
