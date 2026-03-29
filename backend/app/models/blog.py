from pydantic import BaseModel, Field
from typing import List, Optional

class BlogRequest(BaseModel):
    category: str = Field(..., example="Artificial Intelligence in Healthcare")

class TitleRequest(BaseModel):
    selected_idea: str

class OutlineRequest(BaseModel):
    selected_title: str

class GenerateRequest(BaseModel):
    title: str
    outline: str

class SEOData(BaseModel):
    title: str
    meta: str
    keywords: List[str]

class MediumData(BaseModel):
    tags: List[str]
    slug: str
    read_time: str

class BlogResponse(BaseModel):
    topic: str
    seo: SEOData
    blog_markdown: str
    visuals: List[str] = []
    medium: MediumData

class ProgressUpdate(BaseModel):
    stage: str
    message: str
    data: Optional[dict] = None
