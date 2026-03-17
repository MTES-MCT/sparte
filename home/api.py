import logging

from rest_framework import serializers
from rest_framework.mixins import CreateModelMixin
from rest_framework.permissions import AllowAny
from rest_framework.throttling import AnonRateThrottle
from rest_framework.viewsets import GenericViewSet

from crisp.services import send_feedback_to_crisp
from home.models import PageFeedback
from public_data.models.administration import AdminRef, LandModel
from utils.mattermost import Mattermost

logger = logging.getLogger(__name__)


class FeedbackThrottle(AnonRateThrottle):
    rate = "5/minute"


class PageFeedbackSerializer(serializers.ModelSerializer):
    crisp_session_id = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = PageFeedback
        fields = [
            "rating",
            "comment",
            "page_url",
            "land_type",
            "land_id",
            "land_name",
            "page_name",
            "crisp_session_id",
        ]

    def validate_land_type(self, value):
        valid_types = [code for code, _ in AdminRef.CHOICES]
        if value not in valid_types:
            raise serializers.ValidationError("Type de territoire invalide.")
        return value

    def validate_page_url(self, value):
        if not value.startswith("/"):
            raise serializers.ValidationError("URL invalide.")
        return value

    def validate(self, data):
        land_type = data.get("land_type")
        land_id = data.get("land_id")

        if not land_id or not land_type:
            raise serializers.ValidationError("Un territoire est requis.")

        if not LandModel.objects.filter(land_id=land_id, land_type=land_type).exists():
            raise serializers.ValidationError("Territoire introuvable.")

        return data

    def create(self, validated_data):
        validated_data.pop("crisp_session_id", None)
        return super().create(validated_data)


def notify_mattermost(instance: PageFeedback):
    stars = "⭐" * instance.rating + "☆" * (5 - instance.rating)
    user_label = instance.user.email if instance.user else "Anonyme"
    comment = instance.comment or "—"
    territory = f"{instance.land_name} ({instance.land_type})" if instance.land_name else "—"
    msg = (
        f"📋 **Nouveau feedback** {stars}\n"
        f"**Territoire :** {territory}\n"
        f"**Page :** {instance.page_name or '—'}\n"
        f"**URL :** {instance.page_url}\n"
        f"**Utilisateur :** {user_label}\n"
        f"**Commentaire :** {comment}"
    )
    try:
        Mattermost(msg=msg, channel="sparte-crisp").send()
    except Exception:
        logger.exception("Échec de l'envoi de la notification Mattermost pour le feedback %s", instance.pk)


class PageFeedbackViewSet(GenericViewSet, CreateModelMixin):
    queryset = PageFeedback.objects.all()
    serializer_class = PageFeedbackSerializer
    permission_classes = [AllowAny]
    throttle_classes = [FeedbackThrottle]

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        crisp_session_id = serializer.validated_data.get("crisp_session_id") or None
        instance = serializer.save(user=user)
        notify_mattermost(instance)
        send_feedback_to_crisp(
            rating=instance.rating,
            comment=instance.comment,
            page_name=instance.page_name,
            land_name=instance.land_name,
            land_type=instance.land_type,
            page_url=instance.page_url,
            user_email=user.email if user else None,
            crisp_session_id=crisp_session_id,
        )
