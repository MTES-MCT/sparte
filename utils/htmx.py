"""
Contains mixins and other miscallenous tools for HTMX
"""

from typing import Any, Dict, List


class StandAloneMixin:
    """Enable a fragment view to be open on standalone mode using base template."""

    htmx_template_name = "utils/base_htmx.html"

    def dispatch(self, request, *args, **kwargs):
        """Make HTMX headers available through self.htmx

        self.htmx is a dict if called from htmx, otherwise is None.
        self.htmx contains all header pushed from htmx.
        """
        self.htmx: Dict[str, str] | None = None  # type: ignore
        if request.headers.get("HX-Request"):
            self.htmx = {
                "HX-Request": True,
                "HX-Trigger": request.headers.get("HX-Trigger"),
                "HX-Trigger-Name": request.headers.get("HX-Trigger-Name"),
                "HX-Target": request.headers.get("HX-Target"),
                "HX-Prompt": request.headers.get("HX-Prompt"),
            }
        return super().dispatch(request, *args, **kwargs)

    def get_template_names(self) -> List[str]:
        if self.htmx is None:
            return [self.htmx_template_name]
        return super().get_template_names()  # type: ignore

    def get_context_data(self, **kwargs) -> Dict[str, Any]:
        """inject fragment template name into context if not called from htmx."""
        if self.htmx is None:
            kwargs |= {"fragment_template_name": self.template_name}  # type: ignore
        return super().get_context_data(**kwargs)  # type: ignore
