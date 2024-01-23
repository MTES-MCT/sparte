from rest_framework.throttling import UserRateThrottle


class SearchLandApiThrottle(UserRateThrottle):
    # Note: this will not work locally, as the throttling is managed with the cache
    rate = "10/second"
