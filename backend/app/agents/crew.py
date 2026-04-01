import os
from crewai import Agent, Task, Crew, Process, LLM
from app.core.config import settings
from loguru import logger
from app.services.perplexity import perplexity_service

# Opt-out of telemetry to prevent external pings that might use OpenAI keys
os.environ["CREW_TELEMETRY_OPTOUT"] = "true"

class BlogCrew:
    def __init__(self, trends_info: str):
        self.trends_info = trends_info
        
        logger.info("Initializing BlogCrew with Perplexity LLM...")
        # Use CrewAI's native LLM class which handles LiteLLM providers
        self.llm = LLM(
            model="perplexity/sonar",
            api_key=settings.PERPLEXITY_API_KEY,
            temperature=0.7
        )

    def _run_crew(self, agent: Agent, task: Task, step_name: str) -> str:
        """Helper method to execute a single-agent crew, reducing boilerplate."""
        logger.info(f"Starting BlogCrew Step: {step_name}")
        try:
            crew = Crew(
                agents=[agent], 
                tasks=[task], 
                verbose=False # Set verbose to False to reduce logging and inner 'thought' loops
            )
            result = crew.kickoff()
            output = getattr(result, "raw", str(result))
            logger.success(f"Successfully completed: {step_name}")
            return output
        except Exception as e:
            logger.error(f"Failed during {step_name}: {str(e)}")
            raise RuntimeError(f"{step_name} failed: {str(e)}")

    # Step 1: Find Top Ideas (Async Direct Call for Cost Savings)
    async def get_ideas(self, category: str) -> str:
        messages = [
            {
                "role": "system",
                "content": "You are a senior content strategist for a modern blog platform. Your goal is to generate HIGH-ENGAGEMENT, READER-FACING content ideas that people would actually click on in 2026. Focus on SPECIFICITY and PRACTICAL VALUE.\n\nSTRICT RULES:\n- Prioritize REAL, CONCRETE content (books, lists, rankings, comparisons)\n- Avoid abstract analysis, theory, or meta-discussion\n- Avoid generic trends unless tied to specific examples\n- Each idea must feel like a blog/article title ready to publish\n- Keep ideas DISTINCT and varied\n- No citations or research references\n"
            },
            {
                "role": "user",
                "content": f"Domain: {category}\n\nGenerate EXACTLY 5 HIGH-CLICK content ideas.\n\nFORMAT:\n1. **[Title]**: [1–2 line description explaining what the reader gets]\n\nREQUIREMENTS:\n- At least 3 ideas MUST include specific books/authors\n- Include a mix of: listicles, comparisons, and curated recommendations\n- NO abstract themes like 'analysis', 'deep dive', 'psychology', or 'trends'\n- Make it feel like content for readers, not researchers\n\nNo preamble."
            }
        ]
        return await perplexity_service.complete(messages)

    # Step 2: Generate 5 Titles (Async Direct Call for Cost Savings)
    async def get_titles(self, selected_idea: str) -> str:
        messages = [
            {
                "role": "system",
                "content": "You are a senior editorial headline strategist for top-tier blogs (Medium, Substack, NYT Style, BookTok). Your goal is to create HIGH-CLICK, SPECIFIC, and PUBLICATION-READY headlines.\n\nSTRICT RULES:\n- Each headline must feel like something a real reader would click\n- Avoid vague or generic phrases\n- Use specificity (book names, outcomes, emotions, comparisons when relevant)\n- Make the value to the reader immediately clear\n- Avoid repetitive wording or structure\n- Keep them concise, sharp, and modern\n\nFORMAT VARIETY (MANDATORY):\n1. A provocative question\n2. A list-style headline (numbered)\n3. A bold/contrarian statement\n4. A reader-focused 'How' or 'Why' headline\n5. A short, punchy SEO-style title\n"
            },
            {
                "role": "user",
                "content": f"Concept: {selected_idea}\n\nGenerate EXACTLY 5 DISTINCT headlines.\n\nOUTPUT FORMAT:\n1. Headline\n2. Headline\n3. Headline\n4. Headline\n5. Headline\n\nNo explanations. No meta text."
            }
        ]
        return await perplexity_service.complete(messages)

    # Step 3: Detailed Outline
    def get_outline(self, selected_title: str) -> str:
        agent = Agent(
            role="Principal Content Architect & Subject Matter Expert",
            goal=f"Design a comprehensive, high-authority outline for: {selected_title}",
            backstory=(
                "You are an elite content architect known for structuring information "
                "into logical, engaging frameworks. You adapt your structure to the topic: "
                "if it's a review, you focus on character/plot analysis; if it's technical, "
                "you focus on architecture; if it's a guide, you focus on steps. You ensure "
                "the outline provides a deep foundation for a 1500+ word article."
            ),
            llm=self.llm,
            verbose=True
        )
        task = Task(
            description=(
                f"Create a comprehensive content outline for: '{selected_title}'.\n"
                "Objective: Provide a complete structural walkthrough. ADAPT the section headers to the subject matter.\n"
                "Suggested Structure (Adapt as needed):\n"
                "1. OVERVIEW/INTRODUCTION: Context and significance.\n"
                "2. CORE ANALYSIS (e.g., 'THE FIVE BOOKS', 'TECHNICAL ARCHITECTURE', or 'KEY TRENDS'): The main body of the research.\n"
                "3. DEEP DIVE/CASE STUDIES: Specific examples, character analysis, or procedural walkthroughs.\n"
                "4. CRITICAL PERSPECTIVE: Unique insights, comparative analysis, or future outlook.\n"
                "5. CONCLUSION & TAKEAWAYS: Final thoughts and actionable advice.\n"
                "6. VISUAL STRATEGY: Placements for diagrams, screenshots, or illustrative graphics.\n"
                "Output ONLY the Markdown outline."
            ),
            agent=agent,
            expected_output="A subject-appropriate content outline with deep structural detail."
        )
        return self._run_crew(agent, task, "Outline Generation")

    # Step 4: Full Blog Generation
    def generate_blog(self, title: str, outline: str) -> str:
        agent = Agent(
            role="Master Long-form Writer & Specialist Journalist",
            goal=f"Produce a comprehensive, 1500+ word high-authority article on '{title}' for a top-tier publication.",
            backstory=(
                "You are a world-class long-form writer with deep domain expertise. "
                "You excel at crafting narratives that are both incredibly detailed and "
                "compelling to read. You adapt your tone to the subject matter—being "
                "clinically precise for technical topics, engagingly descriptive for lifestyle, "
                "and authoritative for industry analysis. You provide full depth and nuance "
                "without sanitizing data or oversimplifying complex ideas."
            ),
            llm=self.llm,
            verbose=True
        )
        task = Task(
            description=(
                f"Generate the complete high-authority article titled '{title}' based on this outline: \n{outline}\n\n"
                "CRITICAL: Maintain a heavy, narrative flow appropriate for the topic. Deliver deep value.\n"
                "REPORT GUIDELINES:\n"
                "1. WORD COUNT: Target 1500-2500 words. Provide expansive, high-density analysis.\n"
                "2. DETAIL LEVEL: Include all key points, comparative data, and descriptive nuances as per the outline.\n"
                "3. STYLE: Use a professional yet engaging voice. Short paragraphs, punchy headers.\n"
                "4. TONE: Adapt to the topic (e.g., informative for reviews, analytical for tech, narrative for creative).\n"
                "5. VISUALS: Include 3 [VISUAL PROMPT] blocks for diagrams, illustrations, or context-specific screenshots (>).\n\n"
                "Output ONLY the final Markdown article."
            ),
            agent=agent,
            expected_output="A high-authority, deeply researched 1500+ word article in Markdown."
        )
        return self._run_crew(agent, task, "Final Blog Generation")
