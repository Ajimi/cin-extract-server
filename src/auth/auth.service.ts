import { Injectable } from '@nestjs/common';
import { AuthEntity } from './cin.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(AuthEntity)
    private readonly authEntityRepository: Repository<AuthEntity>,
  ) {
  }

  async login(data) {
    const findOneOptions = {
      cin: data.cin,
    };
    return await this.authEntityRepository.findOne(findOneOptions);
  }

  async register(data) {
    const { cin } = data;
    const userExist = await this.authEntityRepository.findOne({ cin });
    if (userExist) {
      return undefined;
    }

    const user = new AuthEntity();

    user.cin = cin;
    user.name = cin;

    return await this.authEntityRepository.save(user);
  }
}
