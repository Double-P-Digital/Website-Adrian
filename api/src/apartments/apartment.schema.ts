import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Apartment {
  @Prop({ required: true })
  name: string;

  @Prop()
  address: string;

  @Prop()
  price: number;

  @Prop()
  description: string;

  @Prop([String])
  amenities: string[];

  @Prop([String])
  images: string[];

  @Prop()
  status: string;
}

export const ApartmentSchema = SchemaFactory.createForClass(Apartment);
