from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.schemas import MatchRequest, MatchResponse, EnhanceRequest, EnhanceResponse
from models.matcher import match_candidate
from models.enhancer import enhance_resume

app = FastAPI(title="FIRA AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/match", response_model=MatchResponse)
async def match(request: MatchRequest) -> MatchResponse:
    """Analyse a candidate's suitability for a job posting."""
    return match_candidate(request)


@app.post("/enhance-resume", response_model=EnhanceResponse)
async def enhance(request: EnhanceRequest) -> EnhanceResponse:
    """Enhance and optimise an existing resume against a job description."""
    return enhance_resume(request)


@app.get("/health")
async def health() -> dict:
    """Health-check endpoint for orchestrators and load balancers."""
    return {"status": "healthy", "service": "fira-ai"}
