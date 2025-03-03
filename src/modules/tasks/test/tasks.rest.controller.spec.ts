import { HttpStatus} from '@nestjs/common';
import CustomResponse from '../../../../src/common/providers/custom-response.service';
import { CompleteTaskBody, CompleteTaskParams, GetTasksQueryDto, ReAssignTaskBody } from '../dtos';
import { CommonHeadersDto } from '../../../../src/shared/dtos';
import { TasksController} from '../tasks.rest.controller';
import { GetProcessInstanceStatsQueryDto } from '../../process-instances/dtos';
import { TasksService } from '../tasks.service';
import { Test, TestingModule } from '@nestjs/testing';
import { CustomMessages } from 'src/common/const/custom-messages';


const headers:CommonHeadersDto={
    'x-tenant-id':'iauro',
    'authorization':'x',
    'user-id':''
}
const getTasks:GetTasksQueryDto={
    'filters':'',
    'page':4,
    'search':'',
    'size':41,
    'sort':'',
    'customFilters':'',
}
const params:CompleteTaskParams={
    'processInstanceId':''
}
const instantQuery:GetProcessInstanceStatsQueryDto={
    'filters':'',
    'customFilters':'',
    'search':''
}

const completeTaskPayload:CompleteTaskBody={
    'taskId':'',
    'taskKey':'',
    'parameters':[{key:''}]
}
const reassignTaskBody=new ReAssignTaskBody;

let mockTaskService={
    findAllUserAssignedTasks:jest.fn(),
    findTasks:jest.fn(),
    completeTask:jest.fn(),
    reassignTask:jest.fn(),
    getTasksStats: jest.fn(),
    updateTimer: jest.fn()
}

describe('TasksController',()=>{
    let tasksController:TasksController;
    let tasksService:TasksService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
          controllers: [TasksController],
          providers: [
            {
              provide: TasksService,
              useValue: mockTaskService
            }
          ],
        }).compile();
        tasksController = module.get<TasksController>(TasksController);
        tasksService = module.get<TasksService>(TasksService);
      });
    

      it("should be defined", () => {
        expect(tasksController).toBeDefined();
      });

      describe('findAllUserAssignedTasks', ()=>{
        it('should find all user assigned tasks',async()=>{
            const response = new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS);
            jest.spyOn(tasksService,'findAllUserAssignedTasks').mockImplementation(() => Promise.resolve(response));
            expect(await tasksController.findAllUserAssignedTasks(headers,getTasks)).toBe(response);
          })
      })

      describe('findTasks', ()=>{
        it('should find tasks',async()=>{
            const response = new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS);
            jest.spyOn(tasksService,'findTasks').mockImplementation(() => Promise.resolve(response));
            expect(await tasksController.findTasks(headers,getTasks)).toBe(response);
          })
      })

      describe('completeTask', ()=>{
        it('should complete task',async()=>{
            const response = new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS);
            jest.spyOn(tasksService,'completeTask').mockImplementation(() => Promise.resolve(response));
            expect(await tasksController.completeTask(headers, params, completeTaskPayload)).toBe(response);
          })
      })

      describe('reassignTask', ()=>{
        it('should reassign task',async()=>{
            const reassignTaskMock=jest.fn();
            jest.spyOn(tasksService,'reassignTask').mockImplementation(reassignTaskMock);
            await tasksController.reassignTask(headers,params,reassignTaskBody);
            expect(reassignTaskMock).toHaveBeenCalledWith(headers,params,reassignTaskBody);
        })
      })

      describe('getStatsByDefinitionId', ()=>{
        it('should give stats of provided process definition id',async()=>{
            const response = new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS);
            jest.spyOn(tasksService,'getTasksStats').mockImplementation(() => Promise.resolve(response));
            expect(await tasksController.getStatsByDefinitionId(headers, instantQuery )).toBe(response);
          })
      })

      describe('getMyStatsByDefinitionId', ()=>{
        it('should give stats of specific user of provided process definition id',async()=>{
            //here userid id picked from headers
            const response = new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS);
            jest.spyOn(tasksService,'getTasksStats').mockImplementation(() => Promise.resolve(response));
            expect(await tasksController.getMyStatsByDefinitionId(headers, instantQuery )).toBe(response);
          })
      })

      describe('updateTimer', ()=>{
        it('should update timer',async()=>{
            const response = new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS);
            jest.spyOn(tasksService,'updateTimer').mockImplementation(() => Promise.resolve(response));
            expect(await tasksController.updateTimer(headers)).toBe(response);
          })
      })
    
})