import { createOrGoToGooglePhotos } from '../core';


/** ------- Photos management commands ------- */
const commands = [
{
    action: 'GO_TO_GOOGLE_PHOTOS',
    callback: () => {
        createOrGoToGooglePhotos();
    }
}
];

export default commands;
