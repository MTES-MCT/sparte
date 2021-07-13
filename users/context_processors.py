def add_connected_user_to_context(request):
    if request.user:
        return {
            "user": request.user,
        }
    else:
        return dict()
