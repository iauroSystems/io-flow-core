import { existsSync, mkdirSync } from 'fs';
import { diskStorage, memoryStorage } from 'multer';
import { Paths } from 'src/common/const/constants';

export const multerConfig = {
    proto: Paths.WORKFLOW_PROTO_DIR,
    bpmn: Paths.BPMN_XML
};

export const assignStorageProperty = {
    storageProperty: ''
}
const kebabCase = string => string
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, '-')
    .toLowerCase();

const storageOption =
{
    memorystorage: memoryStorage(),
    diskstorage: diskStorage({
        // Destination storage path details
        destination: (req: any, file: any, cb: any) => {

            let uploadPath = Paths.PUBLIC;
            const ext = file.originalname.split('.').pop();
            switch (ext) {
                case 'bpmn':
                    uploadPath = Paths.BPMN_XML;
                    break;
                case 'proto':
                    uploadPath = Paths.WORKFLOW_PROTO_DIR;
                    break;
                default:

                    break;
            }
            // Create folder if doesn't exist
            if (!existsSync(uploadPath)) {
                mkdirSync(uploadPath);
            }
            cb(null, uploadPath);
        },
        // File modification details
        filename: (req: any, file: any, cb: any) => {
            // Calling the callback passing the random name generated with the original extension name

            let fileName = kebabCase(file.originalname);

            cb(null, fileName);

        },
    }),
}


export const multerOptions = {

    // Storage properties
    storage: storageOption['diskstorage']

};
//


