from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from project.models import ReportDraft, RequestedDocumentChoices
from project.serializers import ReportDraftListSerializer, ReportDraftSerializer


class ReportDraftViewSet(viewsets.ModelViewSet):
    serializer_class = ReportDraftSerializer

    def get_permissions(self):
        if self.action == "retrieve":
            return []
        return [IsAuthenticated()]

    def get_queryset(self):
        if self.action == "retrieve":
            return ReportDraft.objects.all()
        if self.request.user.is_authenticated:
            return ReportDraft.objects.filter(user=self.request.user)
        return ReportDraft.objects.none()

    def get_serializer_class(self):
        if self.action == "list":
            return ReportDraftListSerializer
        return ReportDraftSerializer

    def perform_create(self, serializer):
        project = serializer.validated_data.get("project")
        serializer.save(
            user=self.request.user,
            land_type=project.land_type,
            land_id=project.land_id,
        )

    def list(self, request, *args, **kwargs):
        project_id = request.query_params.get("project_id")
        report_type = request.query_params.get("report_type")

        queryset = self.get_queryset()

        if project_id:
            queryset = queryset.filter(project_id=project_id)
        if report_type:
            queryset = queryset.filter(report_type=report_type)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def report_types(self, request):
        return Response([{"value": choice[0], "label": choice[1]} for choice in RequestedDocumentChoices.choices])
