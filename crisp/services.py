import logging
import threading

import requests
from django.conf import settings

logger = logging.getLogger(__name__)

CRISP_API_BASE = "https://api.crisp.chat/v1"


def _get_auth():
    if not settings.CRISP_API_IDENTIFIER or not settings.CRISP_API_KEY:
        return None
    return (settings.CRISP_API_IDENTIFIER, settings.CRISP_API_KEY)


def _send_feedback_sync(
    rating: int,
    comment: str,
    page_name: str,
    land_name: str,
    land_type: str,
    page_url: str,
    user_email: str | None,
    crisp_session_id: str | None,
):
    auth = _get_auth()
    if not auth:
        logger.debug("Crisp API credentials not configured, skipping feedback sync")
        return

    website_id = settings.CRISP_WEBSITE_ID
    headers = {"X-Crisp-Tier": "plugin"}

    try:
        session_id = crisp_session_id
        if not session_id:
            create_resp = requests.post(
                f"{CRISP_API_BASE}/website/{website_id}/conversation",
                auth=auth,
                headers=headers,
                timeout=10,
            )
            create_resp.raise_for_status()
            session_id = create_resp.json().get("data", {}).get("session_id")

        if not session_id:
            logger.warning("Crisp conversation unavailable for feedback")
            return

        if user_email:
            patch_resp = requests.patch(
                f"{CRISP_API_BASE}/website/{website_id}/conversation/{session_id}/meta",
                auth=auth,
                headers=headers,
                json={"email": user_email},
                timeout=10,
            )
            patch_resp.raise_for_status()

        stars = "⭐" * rating + "☆" * (5 - rating)
        territory = f"{land_name} ({land_type})" if land_name else "—"
        lines = [
            f"📋 **Nouveau feedback** {stars}",
            f"**Territoire :** {territory}",
            f"**Page :** {page_name or '—'}",
            f"**URL :** {page_url}",
        ]
        if comment:
            lines.append(f"**Commentaire :** {comment}")

        message_resp = requests.post(
            f"{CRISP_API_BASE}/website/{website_id}/conversation/{session_id}/message",
            auth=auth,
            headers=headers,
            json={
                "type": "text",
                "from": "operator",
                "origin": "chat",
                "content": "\n".join(lines),
            },
            timeout=10,
        )
        message_resp.raise_for_status()

        logger.info("Feedback sent to Crisp conversation %s", session_id)

    except requests.RequestException:
        logger.exception("Failed to send feedback to Crisp")


def send_feedback_to_crisp(
    rating: int,
    comment: str,
    page_name: str,
    land_name: str,
    land_type: str,
    page_url: str,
    user_email: str | None,
    crisp_session_id: str | None = None,
):
    """Send feedback to Crisp in a background thread (fire and forget)."""
    threading.Thread(
        target=_send_feedback_sync,
        args=(rating, comment, page_name, land_name, land_type, page_url, user_email, crisp_session_id),
        daemon=True,
    ).start()
