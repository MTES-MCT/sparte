import time
from typing import Any

import requests


class CrispException(Exception):
    pass


class Crisp:
    """Retrieve data from Crisp.
    API References: https://docs.crisp.chat/api/v1/"""

    BASE_URL = "https://api.crisp.chat/v1"
    MAX_RETRIES = 10
    MAX_WAIT_SECONDS = 300  # 5 minutes

    def __init__(self, identifier: str, key: str, website_id: str):
        self.website_id = website_id
        self.default_headers = {
            "accept": "application/json",
            "content-type": "application/json",
            "X-Crisp-Tier": "plugin",
        }
        self.auth = (identifier, key)

    def __get(self, endpoint: str, params: dict | None = None) -> Any:
        """Get data from Crisp API with retry and exponential backoff."""
        last_exception = None
        for attempt in range(self.MAX_RETRIES):
            try:
                response = requests.get(
                    f"{self.BASE_URL}/{endpoint}",
                    headers=self.default_headers,
                    auth=self.auth,
                    params=params,
                )
                if response.ok:
                    return response.json().get("data", response.json())
                if response.status_code not in (429,) and response.status_code < 500:
                    raise CrispException(f"Error while fetching data from Crisp: {response.text}")
                last_exception = CrispException(f"Error while fetching data from Crisp: {response.text}")
            except requests.RequestException as e:
                last_exception = e

            wait_time = min(2**attempt, self.MAX_WAIT_SECONDS)
            print(f"Retry {attempt + 1}/{self.MAX_RETRIES} for {endpoint}, waiting {wait_time}s...")
            time.sleep(wait_time)

        raise last_exception or CrispException(f"Max retries exceeded for {endpoint}")

    def __paginate(self, method, *args) -> list[dict]:
        """Helper pour paginer les appels API."""
        all_results = []
        page_number = 1
        while True:
            results = method(*args, page_number) if args else method(page_number)
            if not results:
                break
            all_results.extend(results)
            page_number += 1
        return all_results

    # Conversations (private)
    def __get_conversations(self, page_number: int = 1) -> list[dict]:
        return self.__get(f"website/{self.website_id}/conversations/{page_number}", params={"include_empty": 1})

    def __get_conversation_messages(self, session_id: str) -> list[dict]:
        return self.__get(f"website/{self.website_id}/conversation/{session_id}/messages")

    def __get_conversation_pages(self, session_id: str, page_number: int = 1) -> list[dict]:
        return self.__get(f"website/{self.website_id}/conversation/{session_id}/pages/{page_number}")

    def __get_conversation_events(self, session_id: str, page_number: int = 1) -> list[dict]:
        return self.__get(f"website/{self.website_id}/conversation/{session_id}/events/{page_number}")

    # People (private)
    def __get_people_profiles(self, page_number: int = 1) -> list[dict]:
        return self.__get(f"website/{self.website_id}/people/profiles/{page_number}")

    # Public methods
    def get_all_conversations(self) -> list[dict]:
        """Get all conversations (paginated)."""
        return self.__paginate(self.__get_conversations)

    def get_all_conversation_messages(self) -> list[dict]:
        """Get all messages for all conversations."""
        all_messages = []
        conversations = self.get_all_conversations()
        for conv in conversations:
            session_id = conv.get("session_id")
            if not session_id:
                continue
            messages = self.__get_conversation_messages(session_id)
            for m in messages or []:
                m["session_id"] = session_id
                all_messages.append(m)
        return all_messages

    def get_all_conversation_pages(self) -> list[dict]:
        """Get all pages for all conversations."""
        all_pages = []
        conversations = self.get_all_conversations()
        for conv in conversations:
            session_id = conv.get("session_id")
            if not session_id:
                continue
            pages = self.__paginate(self.__get_conversation_pages, session_id)
            for p in pages or []:
                p["session_id"] = session_id
                all_pages.append(p)
        return all_pages

    def get_all_conversation_events(self) -> list[dict]:
        """Get all events for all conversations."""
        all_events = []
        conversations = self.get_all_conversations()
        for conv in conversations:
            session_id = conv.get("session_id")
            if not session_id:
                continue
            events = self.__paginate(self.__get_conversation_events, session_id)
            for e in events or []:
                e["session_id"] = session_id
                all_events.append(e)
        return all_events

    def get_all_people_profiles(self) -> list[dict]:
        """Get all people profiles (paginated)."""
        return self.__paginate(self.__get_people_profiles)

    def get_people_stats(self) -> dict:
        """GET /website/{website_id}/people/stats"""
        return self.__get(f"website/{self.website_id}/people/stats")
