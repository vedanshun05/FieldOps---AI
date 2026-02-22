"""FieldOps AI — Local Transcription Service using Voxtype."""

import logging
import subprocess
import tempfile
import os
import asyncio

logger = logging.getLogger(__name__)


async def transcribe_audio(audio_file) -> str:
    """
    Transcribe an audio file using local Voxtype CLI.
    Voxtype requires WAV, 16kHz, mono. We use ffmpeg to convert it first.

    Args:
        audio_file: File-like object (from FastAPI UploadFile)

    Returns:
        Transcript text string
    """
    logger.info("Starting local audio transcription via Voxtype...")

    try:
        # Read file content
        content = await audio_file.read()
        logger.info(f"Received audio file, size: {len(content)} bytes")

        # Create temporary files for input and output
        with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as tmp_in:
            tmp_in.write(content)
            tmp_in_path = tmp_in.name

        tmp_out_path = tmp_in_path.replace(".webm", ".wav")

        try:
            # 1. Convert to 16kHz Mono WAV using ffmpeg
            logger.info("Converting audio to 16kHz WAV...")
            process = await asyncio.create_subprocess_exec(
                "ffmpeg", "-y", "-i", tmp_in_path, "-ar", "16000", "-ac", "1", tmp_out_path,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            stdout, stderr = await process.communicate()
            
            if process.returncode != 0:
                logger.error(f"FFmpeg conversion failed: {stderr.decode()}")
                raise Exception("Failed to convert audio formats")

            # 2. Transcribe using Voxtype
            logger.info("Running Voxtype transcription...")
            process = await asyncio.create_subprocess_exec(
                "voxtype", "transcribe", tmp_out_path,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            stdout, stderr = await process.communicate()
            stderr_text = stderr.decode().strip()
            if stderr_text:
                logger.info(f"Voxtype stderr: {stderr_text}")

            if process.returncode != 0:
                logger.error(f"Voxtype failed: {stderr_text}")
                raise Exception("Voxtype transcription failed")

            raw_output = stdout.decode().strip()
            
            # Extract just the transcript from Voxtype's verbose logs
            transcript = raw_output
            marker = "Transcription completed in "
            if marker in raw_output:
                after_marker = raw_output.split(marker)[-1]
                if ': "' in after_marker:
                    _, text_part = after_marker.split(': "', 1)
                    if '..." ' in text_part:
                        transcript = text_part.split('..." ', 1)[-1]
                    else:
                        end_quote_idx = text_part.find('"')
                        if end_quote_idx != -1:
                            transcript = text_part[end_quote_idx+1:].strip()
                            if not transcript:
                                transcript = text_part[:end_quote_idx]
                        else:
                            transcript = text_part
            
            transcript = transcript.strip('"\' ')
            logger.info(f"Cleaned Transcript: {transcript}")
            return transcript

        finally:
            # Cleanup temp files
            if os.path.exists(tmp_in_path):
                os.remove(tmp_in_path)
            if os.path.exists(tmp_out_path):
                os.remove(tmp_out_path)

    except Exception as e:
        logger.error(f"Transcription failed: {str(e)}")
        raise
