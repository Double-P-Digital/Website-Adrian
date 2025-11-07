export async function getListingReviews(handle: string) {
  return [
    {
      id: '1',
      title: "Can't say enough good things",
      rating: 5,
      content: 'Lovely hostess, very friendly! I would definitely stay here again. ',
      author: 'S. Walkinshaw',
      date: 'May 16, 2025',
      datetime: '2025-01-06',
    },
    {
      id: '2',
      title: 'Perfect for going out when you want to stay comfy',
      rating: 4,
      content: 'Excellent place. The host is super friendly, the room is clean and quiet.',
      author: 'Risako M',
      date: 'May 11, 2021',
      datetime: '2025-01-06',
    },
    {
      id: '3',
      title: 'Very nice feeling sweater!',
      rating: 5,
      content:
        'Very nice and friendly lady. Be pleasant to talk with her. The room looks better than in the pictures. ',
      author: 'Eden Birch',
      date: 'Aug 22, 2022',
      datetime: '2025-01-06',
    },
    {
      id: '4',
      title: 'Very nice feeling sweater!',
      rating: 5,
      content:
        'Lots of nice restaurants nearby and I tried two of them. I had so limited time in Paris this time and look forward to living here again.',
      author: 'Jonathan Edwards',
      date: 'May 16, 2025',
      datetime: '2025-01-06',
    },
  ]
}



export type TListingReivew = Awaited<ReturnType<typeof getListingReviews>>[number]

