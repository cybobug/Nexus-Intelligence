import redis.asyncio as redis
import json
import hashlib
from datetime import datetime
from loguru import logger
from app.core.config import settings

class CacheService:
    def __init__(self):
        try:
            self.redis = redis.from_url(settings.REDIS_URL, decode_responses=True)
            self.enabled = True
        except Exception as e:
            logger.warning(f"Failed to connect to Redis: {e}. Caching disabled.")
            self.enabled = False

    def _generate_key(self, category: str) -> str:
        date_str = datetime.now().strftime("%Y-%m-%d")
        hash_val = hashlib.sha256(f"{category}:{date_str}".encode()).hexdigest()
        return f"blog_cache:{hash_val}"

    async def get_cached_blog(self, category: str):
        if not self.enabled: return None
        try:
            key = self._generate_key(category)
            cached = await self.redis.get(key)
            if cached:
                logger.info(f"Cache hit for category: {category}")
                return json.loads(cached)
        except Exception as e:
            logger.error(f"Redis GET failed: {e}")
        return None

    async def set_cached_blog(self, category: str, data: dict):
        if not self.enabled: return
        try:
            key = self._generate_key(category)
            await self.redis.set(key, json.dumps(data), ex=86400) # 24 hours
            logger.info(f"Cached blog results for category: {category}")
        except Exception as e:
            logger.error(f"Redis SET failed: {e}")

    async def is_rate_limited(self, ip_address: str) -> bool:
        if not self.enabled: return False
        try:
            key = f"rate_limit:{ip_address}"
            current = await self.redis.get(key)
            
            if current and int(current) >= settings.RATE_LIMIT_PER_HOUR:
                return True
                
            async with self.redis.pipeline(transaction=True) as pipe:
                await pipe.incr(key)
                if not current:
                    await pipe.expire(key, 3600) # 1 hour
                await pipe.execute()
        except Exception as e:
            logger.error(f"Redis rate limiting failed: {e}")
            
        return False

cache_service = CacheService()
