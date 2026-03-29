import traceback
from loguru import logger
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from app.core.config import settings

async def global_exception_handler(request: Request, exc: Exception):
    error_details = {
        "error": str(exc),
        "path": request.url.path,
        "traceback": traceback.format_exc() if settings.ENVIRONMENT == "development" else None
    }
    logger.error(f"Unhandled exception: {error_details}")
    
    if isinstance(exc, HTTPException):
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})
        
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Our team has been notified."}
    )
