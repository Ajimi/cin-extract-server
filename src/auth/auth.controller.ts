import { Body, Controller, Get, HttpException, Logger, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, resolve } from 'path';
import { createWorker } from 'tesseract.js';

export const imageFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return callback(new Error('Only image files are allowed!'), false);
  }
  callback(null, true);
};

export const editFileName = (req, file, callback) => {
  const name = file.originalname.split('.')[0];
  const fileExtName = extname(file.originalname);
  const randomName = Array(4)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');
  callback(null, `${name}-${randomName}${fileExtName}`);
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {
  }

  @Get()
  async login(@Body() data) {
    const user = await this.authService.login(data);

    if (!user) {
      throw  new HttpException({ message: 'CIN Don\'t exist', cin: data.cin }, 401);
    }

    return user;
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './files',
      filename: editFileName,
    }),
    fileFilter: imageFileFilter,
  }))
  async uploadFile(@UploadedFile() file) {
    const { filename } = file;

    const cinData = await this.getData(filename);
    if (cinData.length === 0) {
      throw  new HttpException({ message: 'Cannot extract Identifier from Cin' }, 402);
    }
    const data = { cin: cinData[0], name: cinData[0] };
    return this.login(data);
  }

  @Post()
  async register(@Body() data) {
    const user = await this.authService.register(data);
    if (!user) {
      throw  new HttpException({ message: 'Customer already exist' }, 401);
    }
    const { cin, name } = user;
    return { cin, name };
  }

  private async getData(filename) {
    const worker = createWorker({
      logger: m => Logger.log(m),
    });

    const image = resolve(__dirname, (`../../files/${filename}`));
    await worker.load();
    await worker.loadLanguage('ara');
    await worker.initialize('ara');
    const { data } = await worker.recognize(image);
    await worker.terminate();
    return data.text.split('\n').filter(str => !isNaN(+str) && str.length > 5);
  }
}
