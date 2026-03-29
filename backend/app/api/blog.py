import json
import asyncio
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from app.models.blog import BlogRequest, TitleRequest, OutlineRequest, GenerateRequest
from app.services.perplexity import perplexity_service
from app.services.cache import cache_service
from app.agents.crew import BlogCrew
from app.core.config import settings
from loguru import logger

router = APIRouter()

# Step 1: Research Ideas
@router.post("/research")
async def research_ideas(request: BlogRequest):
    try:
        trends = await perplexity_service.get_trends(request.category)
        crew = BlogCrew(trends)
        ideas = await crew.get_ideas(request.category)
        return {"ideas": ideas}
    except Exception as e:
        logger.error(f"Research failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Step 2: Generate 5 Titles
@router.post("/titles")
async def generate_titles(request: TitleRequest):
    try:
        # We use a placeholder for trends since we already have the idea
        crew = BlogCrew("Direct Idea Input")
        titles = await crew.get_titles(request.selected_idea)
        return {"titles": titles}
    except Exception as e:
        logger.error(f"Title generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Step 3: Generate Outline (Streaming)
async def outline_stream(title: str):
    try:
        yield f"data: {json.dumps({'status': 'Architecting content...', 'progress': 50})}\n\n"
        crew = BlogCrew("General Context")
        outline = crew.get_outline(title)
        yield f"data: {json.dumps({'outline': outline})}\n\n"
    except Exception as e:
        yield f"data: {json.dumps({'error': str(e)})}\n\n"

@router.post("/outline")
async def generate_outline(request: OutlineRequest):
    return StreamingResponse(outline_stream(request.selected_title), media_type="text/event-stream")

# Step 4: Final Blog Generation (Streaming)
async def write_blog_stream(title: str, outline: str):
    try:
        yield f"data: {json.dumps({'status': 'Ghostwriting in progress...', 'progress': 50})}\n\n"
        crew = BlogCrew("Final Generation")
        blog_content = crew.generate_blog(title, outline)
        yield f"data: {json.dumps({'blog': blog_content})}\n\n"
    except Exception as e:
        yield f"data: {json.dumps({'error': str(e)})}\n\n"

@router.post("/write")
async def write_blog(request: GenerateRequest):
    return StreamingResponse(write_blog_stream(request.title, request.outline), media_type="text/event-stream")

# Legacy endpoint for backward compatibility (optional)
@router.post("/generate-blog")
async def legacy_generate(request: BlogRequest):
    # This can redirect or call the modular flow internally
    pass
