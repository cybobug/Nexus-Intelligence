import httpx
import backoff
from loguru import logger
from app.core.config import settings

class PerplexityService:
    def __init__(self):
        self.api_key = settings.PERPLEXITY_API_KEY
        self.url = "https://api.perplexity.ai/chat/completions"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    @backoff.on_exception(backoff.expo, httpx.HTTPError, max_tries=3)
    async def get_trends(self, category: str) -> str:
        logger.info(f"Fetching trends for category: {category}")
        
        payload = {
            "model": "sonar",
            "messages": [
                {
                    "role": "system",
                    "content": "You are a trend intelligence expert. Identify current trending topics, keywords, and viral potential for a given category."
                },
                {
                    "role": "user",
                    "content": f"Analyze current trends in {category} for a high-traffic blog post."
                }
            ]
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(self.url, json=payload, headers=self.headers)
                response.raise_for_status()
                data = response.json()
                content = data['choices'][0]['message']['content']
                logger.info(f"Trends fetched. Output size: {len(content)} characters.")
                return content
        except Exception as e:
            logger.error(f"Perplexity API failed: {str(e)}. Falling back to LLM inference.")
            return self._fallback_trend_inference(category)

    @backoff.on_exception(backoff.expo, httpx.HTTPError, max_tries=3)
    async def complete(self, messages: list, model: str = "sonar") -> str:
        """Generic completion method for direct LLM calls to save costs."""
        payload = {
            "model": model,
            "messages": messages,
            "temperature": 0.5
        }
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(self.url, json=payload, headers=self.headers)
                response.raise_for_status()
                data = response.json()
                content = data['choices'][0]['message']['content']
                # Log estimated token usage (approx characters / 4)
                est_tokens = len(content) // 4 + sum(len(m['content']) for m in messages) // 4
                logger.debug(f"Direct LLM call completed. Est. tokens: {est_tokens}")
                return content
        except Exception as e:
            logger.error(f"Direct LLM call failed: {str(e)}")
            raise e

    def _fallback_trend_inference(self, category: str) -> str:
        return f"Trending topics in {category} (Fallback): focus on innovation, sustainability, and technological integration."

perplexity_service = PerplexityService()
