from rest_framework import pagination, serializers, viewsets

from .models import Project
from .views.mixins import UserQuerysetOrPublicMixin


class StandardResultsSetPagination(pagination.PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 10
    default_limit = 10


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = "__all__"


class ProjectNewViewset(UserQuerysetOrPublicMixin, viewsets.ReadOnlyModelViewSet):
    serializer_class = ProjectSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        queryset = Project.objects.all()
        is_public_param = self.request.query_params.get("is_public")

        if is_public_param is not None:
            queryset = queryset.filter(is_public=is_public_param == "true")

        return queryset
