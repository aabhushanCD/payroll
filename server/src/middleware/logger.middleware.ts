import type { NextFunction, Request, Response } from "express";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const startTime = Date.now();

  const { method, originalUrl } = req;
  const ip = req.ip;

  res.on("finish", () => {
    const duration = Date.now() - startTime;

    console.log(
      `[${new Date().toISOString()}] ` +
        `${method} ${originalUrl} ` +
        `${res.statusCode} ` +
        `${duration}ms ` +
        `IP:${ip}`,
    );
  });

  next();
};
