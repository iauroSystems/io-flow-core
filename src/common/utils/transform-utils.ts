
export class Transform {
    getProjection(arr) {
        const proj = {};
        for (const key of arr) {
            proj[key] = 1;
        }
        return proj;
    }
}
