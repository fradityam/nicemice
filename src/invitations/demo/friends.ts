import coverPhoto from '../../assets/images/friends/peephole-view.webp';
import groom from '../../assets/images/friends/groom.webp';
import bride from '../../assets/images/friends/bride.webp';
import polaroid1 from '../../assets/images/friends/polaroid-1.webp';
import polaroid1Large from '../../assets/images/friends/polaroid-1-lg.webp';
import polaroid2 from '../../assets/images/friends/polaroid-2.webp';
import polaroid2Large from '../../assets/images/friends/polaroid-2-lg.webp';
import polaroid3 from '../../assets/images/friends/polaroid-3.webp';
import polaroid3Large from '../../assets/images/friends/polaroid-3-lg.webp';
import couplePhoto from '../../assets/images/friends/couple.webp';
import { isoDateFromToday } from '../dates';
import type { FriendsInvitation } from '../types';

/** nicemice.id/template/friends: the Friends design with its Figma sample content. */
export const friendsDemo: FriendsInvitation = {
  template: 'friends',
  coupleNames: 'Ratu & Radit',
  greeting: 'Dear',
  guestFallback: 'Bapak/Ibu/Saudara/i',
  music: `${import.meta.env.BASE_URL}friends-music.mp3`,
  demo: {
    sampleGuest: 'Phoebe & Mike',
    sampleWishes: [
      { name: 'Joey (best friend)', message: 'How you doin’? Congrats, you two! So happy for you. Save me a seat near the cake 🍰', minutesAgo: 2 },
      { name: 'Monica from the office', message: 'Congratulations, Ratu & Radit! Wishing you a lifetime of love, laughter and a very tidy home.', minutesAgo: 120 },
      { name: 'Aunt Gladys', message: 'So proud of you both, sweethearts. May your home always be full of love. Big hugs from far away 🤍', minutesAgo: 26 * 60 },
    ],
  },

  date: isoDateFromToday(30),
  coverPhoto,
  doodle: { lines: ['we can have', 'any future', 'you want!'], signature: '-Mike' },
  groom: { name: 'Raditya m Fadil', parentsLabel: 'Beloved son of', parents: 'Chandra Bong & Monica Ganjar', photo: groom },
  bride: { name: 'Ratu Regina', parentsLabel: 'Beloved daughter of', parents: 'Joseph Tribuana & Rachel Hijau', photo: bride },
  polaroids: [
    { photo: polaroid3, large: polaroid3Large },
    { photo: polaroid2, large: polaroid2Large },
    { photo: polaroid1, large: polaroid1Large },
  ],
  story: [
    {
      title: 'The One Where They Met',
      text: 'It was a rainy Tuesday at a tiny coffee shop that smelled of cinnamon and bad decisions. Ratu knocked over Radit’s americano, and he said it was the best thing that ever happened to him.',
    },
    {
      title: 'The One With the First Date',
      text: 'He took her to a rooftop cinema, forgot the blanket, and she wore his jacket the whole night. She still has it.',
    },
    {
      title: 'The One With the Proposal',
      text: 'Central Perk. Their usual table. He got down on one knee and the barista started slow-clapping. Everyone joined in. It was embarrassingly perfect.',
    },
  ],
  venue: { name: 'Grant House, Jawa Barat' },
  ceremony: { time: '10.00 - 11.00 WIB' },
  reception: { time: '13.00 - 16.00 WIB' },
  couplePhoto,
  bank: { bank: 'Bank BCA', number: '123456789', holder: 'a.n. Raditya M Fadil' },
  giftDelivery: {
    name: 'Ratu R',
    addressLines: ['Jl. Anggrek Loka No. 24,', 'RT 005 / RW 002 Kel. Meruya Utara,', 'Kec. Kembangan Jakarta Barat,', 'DKI Jakarta, 11620', 'Phone: 0812-3456-7890'],
  },
  closing: {
    text: 'Thank you for being part of our story and for celebrating this special moment with us. Having our favorite people by our side makes this day even more meaningful. We can’t wait to laugh, dance, and make more memories together.',
    signature: 'Ratu & Radit',
  },
};
