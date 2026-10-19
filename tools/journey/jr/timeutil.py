"""現地時刻（計画書 K5）。現地日と撮影年月はここだけで出す。"""
import datetime as dt
from functools import lru_cache
from zoneinfo import ZoneInfo

TOKYO = ZoneInfo("Asia/Tokyo")


@lru_cache(maxsize=1)
def _finder():
    from timezonefinder import TimezoneFinder

    return TimezoneFinder()


@lru_cache(maxsize=4096)
def _zone_at(lat_r, lng_r):
    name = _finder().timezone_at(lat=lat_r, lng=lng_r)
    return ZoneInfo(name) if name else None


def local(taken_utc, lat, lng):
    """UTC 秒 → (現地の datetime, tz の由来: geo / assumed_tokyo)。"""
    utc = dt.datetime.fromtimestamp(int(taken_utc), dt.timezone.utc)
    if lat is not None and lng is not None:
        zone = _zone_at(round(lat, 2), round(lng, 2))
        if zone is not None:
            return utc.astimezone(zone), "geo"
    return utc.astimezone(TOKYO), "assumed_tokyo"


def zone_name(taken_utc, lat, lng):
    d, src = local(taken_utc, lat, lng)
    return str(d.tzinfo), src
