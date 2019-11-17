import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class AuthEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cin: string;

  @Column()
  name: string;
}
