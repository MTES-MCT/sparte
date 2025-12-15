from rest_framework import generics
from rest_framework.response import Response

from project.models import Project
from project.serializers import ProjectDetailSerializer


class ProjectDetailView(generics.RetrieveAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectDetailSerializer

    def get(self, request, *_args, **_kwargs):
        serializer = self.get_serializer(self.get_object(), context={"request": request})
        return Response(data=serializer.data)
