import stayCategoryCoverImage from '@/images/hero-right-2.png'
import clujnapocaImg from '@/images/cities/Cluj-Napoca.jpg'
import baiamareImg from '@/images/cities/Baia-Mare.webp'
import oradeaImg from '@/images/cities/Oradea.jpg'

export async function getStayCategories() {
  return [
    {
      id: 'stay-cat://1',
      name: 'Cluj-Napoca',
      region: 'Romania',
      handle: 'cluj-napoca',
      href: '/stay-categories/cluj-napoca',
      count: 3,
      thumbnail: clujnapocaImg.src,
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
      count: 3,
      thumbnail: baiamareImg.src,
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
      thumbnail: oradeaImg.src,
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
  // lower case handle
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
      thumbnail:
        'https://images.pexels.com/photos/64271/queen-of-liberty-statue-of-liberty-new-york-liberty-statue-64271.jpeg',
      coverImage: {
        src: stayCategoryCoverImage.src,
        width: stayCategoryCoverImage.width,
        height: stayCategoryCoverImage.height,
      },
    }
  }

  // get all categories
  const categories = await getStayCategories()
  return categories.find((category) => category.handle === handle)
}

// types
export type TStayCategory = Awaited<ReturnType<typeof getStayCategories>>[number]
export type TCategory = TStayCategory
