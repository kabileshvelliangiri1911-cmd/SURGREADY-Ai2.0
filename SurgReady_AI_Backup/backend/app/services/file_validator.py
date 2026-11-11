import os
import re
import uuid
from typing import Tuple
from fastapi import UploadFile, HTTPException, status
from app.config import settings

class FileValidator:
    """Provides secure validation and sanitization for uploaded surgical documents."""

    @staticmethod
    def sanitize_filename(filename: str) -> str:
        """Removes dangerous characters and path traversal sequences from filenames."""
        # Strip directory path
        clean_name = os.path.basename(filename)
        # Remove any characters other than alphanumeric, dots, underscores, dashes
        clean_name = re.sub(r'[^a-zA-Z0-9._-]', '_', clean_name)
        # Prevent hidden files
        clean_name = clean_name.lstrip('.')
        if not clean_name:
            clean_name = f"document_{uuid.uuid4().hex[:8]}"
        return clean_name

    @classmethod
    async def validate_and_save(cls, file: UploadFile) -> Tuple[str, str, int]:
        """
        Validates file extension, size limit, and safely writes to uploads directory.
        Returns: (safe_filename, stored_filepath, file_size_bytes)
        """
        if not file.filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file must have a valid filename."
            )

        sanitized_name = cls.sanitize_filename(file.filename)
        ext = os.path.splitext(sanitized_name)[1].lower()

        if ext not in settings.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file format '{ext}'. Allowed extensions: {', '.join(settings.ALLOWED_EXTENSIONS)}"
            )

        # Ensure upload directory exists
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

        # Unique storage name preventing collision or overwriting
        unique_storage_name = f"{uuid.uuid4().hex}_{sanitized_name}"
        destination_path = os.path.join(settings.UPLOAD_DIR, unique_storage_name)

        # Read and enforce file size in chunks
        max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
        total_size = 0

        try:
            with open(destination_path, "wb") as buffer:
                while chunk := await file.read(1024 * 64): # 64 KB chunks
                    total_size += len(chunk)
                    if total_size > max_bytes:
                        # Clean up partial file
                        buffer.close()
                        if os.path.exists(destination_path):
                            os.remove(destination_path)
                        raise HTTPException(
                            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                            detail=f"File exceeds maximum allowed upload size of {settings.MAX_UPLOAD_SIZE_MB} MB."
                        )
                    buffer.write(chunk)
        except HTTPException:
            raise
        except Exception as e:
            if os.path.exists(destination_path):
                os.remove(destination_path)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"An error occurred while saving the uploaded document: {str(e)}"
            )

        return sanitized_name, destination_path, total_size

file_validator = FileValidator()

