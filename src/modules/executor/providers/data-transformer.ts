import { Injectable } from "@nestjs/common";

@Injectable()
export class DataTransformer {
    transformData(transformFunc: string, data: any): any {
        let transformedData = null;
        switch (transformFunc) {
            case 'toRoundBracketArray':
                transformedData = this.toRoundBracketArray(data);
                break;
            case 'escapeSlashes':
                transformedData = this.escapeSlashes(data);
                break;
            default:
                transformedData = data;
                break;
        }
        return transformedData;

    }

    private toRoundBracketArray(data) {
        if (Array.isArray(data)) {
            let arr = JSON.stringify(data);
            arr = arr.replace('[', '(').replace(']', ')');
            return arr.replace(/"/g, '\\"');
        }
        return data;
    }

    private escapeSlashes(data) {
        if (typeof data === "string") {
            data = data.replace(/\\(?![nrtbf"'\\])/g, '\\\\');
            data = data.replace(/"/g,'\\"')
            data = data.replace(/'/g, "\\'");
        }
        return data;
    }
}