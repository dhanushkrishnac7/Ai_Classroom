from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse

router = FastAPI()


@router.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail}
    )