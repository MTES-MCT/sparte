from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from project.models import Project
from project.serializers import ProjectDownloadLinkSerializer


class ProjectDownloadLinkView(generics.RetrieveAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectDownloadLinkSerializer
    permission_classes = [IsAuthenticated]

    def get(self, _request, *_args, **_kwargs):
        serializer = self.get_serializer(self.get_object())
        return Response(data=serializer.data)
