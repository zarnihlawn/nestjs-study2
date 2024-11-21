import { Injectable, NestMiddleware } from '@nestjs/common';
import { differenceInMilliseconds, format } from 'date-fns';
import { Request, Response } from 'express';
import { MongodbService } from 'src/services/individual/mongodb/mongodb.service';
import { Collection } from 'mongodb';
import { v7 as idv7 } from 'uuid';

// const url = 'mongo'
// const password

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logCollection!: Collection;

  constructor(private mongodbService: MongodbService) {
    this.connectToLogCollection();
  }

  async connectToLogCollection() {
    const client = await this.mongodbService.connect();
    const db = client.db('dev-zn');
    this.logCollection = db.collection('dev-zn-log');
  }
  use(req: Request, res: Response, next: () => void) {
    const startTime = new Date();
    const id = idv7();

    this.logCollection.insertOne({
      operation: 'REQUEST',
      method: req.method,
      id: id,
      ip: req.ip,
      startTime: startTime,
      url: req.url,
      headers: req.headers,
      origin: req.headers.origin,
    });

    // Log incoming request
    console.log(`========================`);
    console.log(
      `${req.ip} | ${req.method} | id: ${id} | Path: ${req.path} | Time: ${format(startTime, 'yyyy-MM-dd HH:mm:ss')}`,
    );

    // Method wrapper to log response details
    const wrapMethod = (method: any) => {
      const logCollection = this.logCollection;
      return function (this: Response, ...args: any[]) {
        const newResponse = method.bind(this)(...args);
        const responseTime = Date.now();

        console.log(
          `${req.ip} | ${req.method} | id: ${id} | Method: ${method.name} | Path: ${req.path} | Start: ${format(startTime, 'yyyy-MM-dd HH:mm:ss')} | End: ${format(responseTime, 'yyyy-MM-dd HH:mm:ss')} | Duration: ${differenceInMilliseconds(responseTime, startTime)} ms`,
        );

        logCollection.insertOne({
          operation: 'RESPONSE',
          method: method.name,
          id: id,
          ip: req.ip,
          reqTime: startTime,
          resTime: responseTime,
          resStatusCode: this.statusCode,
          resMessage: this.statusMessage,
          resDuration: differenceInMilliseconds(responseTime, startTime),
          url: req.url,
          user: req.user,
          headers: req.headers,
          origin: req.headers.origin,
        });

        return newResponse;
      };
    };

    // Wrap response methods to log
    res.json = wrapMethod(res.json);
    res.send = wrapMethod(res.send);
    res.sendFile = wrapMethod(res.sendFile);
    res.download = wrapMethod(res.download);
    res.end = wrapMethod(res.end);

    next();
  }
}
