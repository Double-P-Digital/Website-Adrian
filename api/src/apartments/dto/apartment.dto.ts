type ApartmentDto = {
  id?: string;
  name: string;
  address: string;
  price: number;
  description: string;
  amenities: string[];
  images: string[];
};

export default ApartmentDto;
