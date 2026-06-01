import datetime

class SessionContext:
    _SESSION_CACHE = {}

    def __init__(self, fastf1_module, season, round_num, session_name):
        self.fastf1 = fastf1_module
        self.season = season
        self.round_num = round_num
        self.session_name = session_name

        self._session = None
        self._laps = None
        self._drivers = None
        self._t0 = None

        self._load_session()

    def _load_session(self):
        key = (self.season, self.round_num, self.session_name)

        if key in SessionContext._SESSION_CACHE:
            cached = SessionContext._SESSION_CACHE[key]
            self._session = cached['_session']
            self._laps = cached['_laps']
            self._drivers = cached['_drivers']
            self._t0 = cached['_t0']
            return
        
        session = self.fastf1.get_session(self.season, self.round_num, self.session_name)

        session.load(laps=True, telemetry=False, weather=False, messages=False)

        laps = session.laps

        t0 = session.session_start_time

        if isinstance(t0, datetime.timedelta):
            t0 = datetime.datetime.now(datetime.timezone.utc)

        elif t0 is None:
            t0 = datetime.datetime.now(datetime.timezone.utc)

        elif t0.tzinfo is None:
            t0 = t0.replace(tzinfo=datetime.timezone.utc)

        drivers = sorted(laps["Driver"].dropna().unique())

        self._session = session
        self._laps = laps
        self._drivers = drivers
        self._t0 = t0

        SessionContext._SESSION_CACHE[key] = {"_session": session, "_laps": laps, "_drivers": drivers, "_t0": t0}

    @property
    def session(self):
        return self._session

    @property
    def laps(self):
        return self._laps

    @property
    def drivers(self):
        return self._drivers

    @property
    def t0(self):
        return self._t0

    def to_seconds(self, timestamp):

        if isinstance(timestamp, datetime.timedelta):
            return timestamp.total_seconds()

        if timestamp.tzinfo is None:
            timestamp = timestamp.replace(tzinfo=datetime.timezone.utc)

        delta = timestamp - self._t0
        return delta.total_seconds()
