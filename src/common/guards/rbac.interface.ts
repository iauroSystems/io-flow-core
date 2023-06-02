import { Observable } from "rxjs";


export interface RbacGrpcInterface {
    checkAccess(data: { data: any }): Observable<any>
}