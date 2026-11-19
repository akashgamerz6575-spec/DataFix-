from __future__ import annotations

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.core import get_settings
from app.services.profiling import DatasetProfileError, profile_csv

router = APIRouter()


@router.post("/datasets/profile")
async def create_dataset_profile(file: UploadFile = File(...)):
    filename = file.filename or "uploaded-file"
    if not filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=415,
            detail="The starter currently accepts CSV files only. XLSX and JSON support will be added in a later milestone.",
        )

    settings = get_settings()
    content = await file.read(settings.max_upload_bytes + 1)
    if len(content) > settings.max_upload_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"File is too large. The current upload limit is {settings.max_upload_bytes // 1_000_000} MB.",
        )

    try:
        result = profile_csv(content, filename)
    except DatasetProfileError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    return {"status": "profiled", "profile": result}
