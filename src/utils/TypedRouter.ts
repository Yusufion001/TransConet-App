import { Router, RequestHandler, Request, Response, NextFunction } from 'express';
import { ZodSchema, z } from 'zod';
import { validate } from '../middleware/validate';

export class TypedRouter {
  public router: Router;

  constructor() {
    this.router = Router();
  }

  public post<T extends ZodSchema>(
    path: string,
    schema: T,
    handler: (
      req: Request & { body: z.infer<T> extends { body: infer B } ? B : any },
      res: Response,
      next: NextFunction
    ) => void | Promise<void>
  ) {
    this.router.post(path, validate(schema), handler as unknown as RequestHandler);
  }

  public get<T extends ZodSchema>(
    path: string,
    schema: T,
    handler: (
      req: Request & { query: z.infer<T> extends { query: infer Q } ? Q : any },
      res: Response,
      next: NextFunction
    ) => void | Promise<void>
  ) {
    this.router.get(path, validate(schema), handler as unknown as RequestHandler);
  }

  public put<T extends ZodSchema>(
    path: string,
    schema: T,
    handler: (
      req: Request & { body: z.infer<T> extends { body: infer B } ? B : any },
      res: Response,
      next: NextFunction
    ) => void | Promise<void>
  ) {
    this.router.put(path, validate(schema), handler as unknown as RequestHandler);
  }

  public patch<T extends ZodSchema>(
    path: string,
    schema: T,
    handler: (
      req: Request & { body: z.infer<T> extends { body: infer B } ? B : any },
      res: Response,
      next: NextFunction
    ) => void | Promise<void>
  ) {
    this.router.patch(path, validate(schema), handler as unknown as RequestHandler);
  }

  public delete<T extends ZodSchema>(
    path: string,
    schema: T,
    handler: (
      req: Request & { params: z.infer<T> extends { params: infer P } ? P : any },
      res: Response,
      next: NextFunction
    ) => void | Promise<void>
  ) {
    this.router.delete(path, validate(schema), handler as unknown as RequestHandler);
  }
}
