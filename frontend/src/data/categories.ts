import stayCategoryCoverImage from '@/images/hero-right-2.png'
import { Cloudinary } from '@cloudinary/url-gen';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = process.env.CLOUD_NAME || 'dcbzjspdt'

// Initialize Cloudinary instance
const cld = new Cloudinary({ 
  cloud: { 
    cloudName: CLOUDINARY_CLOUD_NAME 
  } 
});

// Helper function to generate Cloudinary URL strings
function getCloudinaryUrl(publicId: string, width = 500, height = 500): string {
  const img = cld
    .image(publicId)
    .format('auto')
    .quality('auto')
    .resize(fill().width(width).height(height).gravity(autoGravity()));
  
  // Return URL as string
  return img.toURL();
}

export async function getStayCategories() {
  return [
    {
      id: 'stay-cat://1',
      name: 'Cluj-Napoca',
      region: 'Romania',
      handle: 'cluj-napoca',
      href: '/stay-categories/cluj-napoca',
      count: 9,
      thumbnail: 'https://res.cloudinary.com/dcbzjspdt/image/upload/Cluj-Napoca.jpg',
      coverImage: {
        src: stayCategoryCoverImage.src,
        width: stayCategoryCoverImage.width,
        height: stayCategoryCoverImage.height,
      },
      description: 'lorem ipsum dolor sit amet',
    },
    {
      id: 'stay-cat://2',
      name: 'Baia Mare',
      region: 'Romania',
      handle: 'baia-mare',
      href: '/stay-categories/baia-mare',
      count: 13,
      thumbnail: 'https://res.cloudinary.com/dcbzjspdt/image/upload/baia-mare.webp',
      coverImage: {
        src: stayCategoryCoverImage.src,
        width: stayCategoryCoverImage.width,
        height: stayCategoryCoverImage.height,
      },
      description: 'lorem ipsum dolor sit amet',
    },
    {
      id: 'stay-cat://3',
      name: 'Oradea',
      region: 'Romania',
      handle: 'oradea',
      href: '/stay-categories/oradea',
      count: 2,
      thumbnail: 'https://res.cloudinary.com/dcbzjspdt/image/upload/Oradea.jpg',
      coverImage: {
        src: stayCategoryCoverImage.src,
        width: stayCategoryCoverImage.width,
        height: stayCategoryCoverImage.height,
      },
      description: 'lorem ipsum dolor sit amet',
    }
  ]
}

export async function getStayCategoryByHandle(handle?: string) {
  handle = handle?.toLowerCase()

  if (!handle || handle === 'all') {
    return {
      id: 'stay://all',
      name: 'Explore stays',
      handle: 'all',
      href: '/stay-categories/all',
      region: 'Worldwide',
      count: 144000,
      description: 'Explore all stays around the world',
      thumbnail: getCloudinaryUrl('cld-sample-5', 800, 600),
      coverImage: {
        src: stayCategoryCoverImage.src,
        width: stayCategoryCoverImage.width,
        height: stayCategoryCoverImage.height,
      },
    }
  }

  const categories = await getStayCategories()
  return categories.find((category) => category.handle === handle)
}

// types
export type TStayCategory = Awaited<ReturnType<typeof getStayCategories>>[number]
export type TCategory = TStayCategory