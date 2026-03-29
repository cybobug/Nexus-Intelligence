import os
import uvicorn
from dotenv import load_dotenv

# Load environment variables from .env file explicitly at startup
load_dotenv()

# CrewAI and LiteLLM often have internal checks for OPENAI_API_KEY
# By setting it to the Perplexity key, we satisfy the requirement for an "OpenAI-like" key
# while our actual agents use the proper base_url.
os.environ["OPENAI_API_KEY"] = os.getenv("PERPLEXITY_API_KEY", "pplx-placeholder")
os.environ["OPENAI_API_BASE"] = "https://api.perplexity.ai"

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.blog import router as blog_router
from app.core.logging import setup_logging
from app.core.config import settings
from app.utils.errors import global_exception_handler

# Initialize logging
setup_logging()

app = FastAPI(
    title=settings.APP_NAME,
    description="Production-ready AI Blog Generator Backend",
    version="1.0.0"
)

# Global Exception Handler
app.add_exception_handler(Exception, global_exception_handler)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(blog_router, prefix="/api", tags=["Blog Generation"])

@app.get("/health")
async def health_check():
    return {"status": "healthy", "environment": settings.ENVIRONMENT}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
