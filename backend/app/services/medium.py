from loguru import logger
from app.core.config import settings

class MediumService:
    def __init__(self):
        self.token = settings.MEDIUM_ACCESS_TOKEN

    async def publish_post(self, title: str, content: str, tags: list):
        """
        TODO: Implement Medium API integration.
        Requires:
        - Getting User ID via GET https://api.medium.com/v1/me
        - Posting via POST https://api.medium.com/v1/users/{{userId}}/posts
        """
        if not self.token:
            logger.warning("Medium token not configured. Skipping auto-publish.")
            return None
            
        logger.info(f"Publishing to Medium: {title}")
        # Placeholder for actual API call
        return {"status": "success", "url": "https://medium.com/@example/post-slug"}

    async def get_user_metadata(self):
        """
        TODO: Fetch user details for usage metering.
        """
        pass

medium_service = MediumService()
