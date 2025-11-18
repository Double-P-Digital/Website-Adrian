import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ApartmentModule } from './apartments/apartment.module';
import { PaymentsModule } from './payments/payments.module';
import { ReservationModule } from './reservation/reservation.module';
import { AuthModule } from './auth/auth.module';
import { DiscountCodeModule } from './discountCodes/discountCode.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot('mongodb://localhost:27017/dailyguest'),
    PaymentsModule.forRootAsync(),
    ApartmentModule,
    PaymentsModule,
    ReservationModule,
    AuthModule,
    DiscountCodeModule,
  ],
  providers: [],
  controllers: [],
})
export class AppModule {}
