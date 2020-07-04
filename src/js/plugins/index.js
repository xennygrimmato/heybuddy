import bookmark from './bookmark';
import extension from './extension';
import media from './media';
import navigation from './navigation';
import page from './page';
import query from './query';
import tab from './tab';
import docs from './docs';
import photos from './photos';

const allPlugins = [
  ...tab,
  ...media,
  ...bookmark,
  ...navigation,
  ...page,
  ...extension,
  ...query,
  ...docs,
  ...photos
];

export {
  allPlugins,
};
