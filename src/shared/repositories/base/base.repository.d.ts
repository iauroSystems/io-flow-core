
import { FilterQuery, ProjectionType, SortValues } from 'mongoose';
@Injectable()
  export interface BaseRepositry<T> {
  find(where?: FilterQuery<T>, projection?: ProjectionType<T>,
    page?: number, limit?: number, sort?: string | { [key: string]: SortValues }): Promise<T[]>;
  findOne(where: FilterQuery<T>, projection?: ProjectionType<T>): Promise<T>;

  count(where: FilterQuery<T>): Promise<T>;

  aggregate(pipeline: any[]): Promise<T>;

}