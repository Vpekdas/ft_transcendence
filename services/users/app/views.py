from django.http import JsonResponse

def testing(request):
    return JsonResponse({
        "username": "ledelbec",
        "nickname": "FirePh0enix"
    })
