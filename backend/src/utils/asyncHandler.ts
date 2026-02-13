const asyncHandler = (fn: Function) => async (req: any, res: any, next: any) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message, success: false });
  }
};

export default asyncHandler;