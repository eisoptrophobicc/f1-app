import numpy
import numba

@numba.njit(cache=True)
def kalman_core(x_meas, y_meas, dt):

    n = len(x_meas)

    xs = numpy.zeros(n)
    ys = numpy.zeros(n)

    x = numpy.zeros(6)
    x[0] = x_meas[0]
    x[1] = y_meas[0]

    P = numpy.eye(6) * 100.0

    dt2 = dt * dt
    half_dt2 = 0.5 * dt2

    Q = numpy.eye(6) * 0.065
    Q[2, 2] = 0.01
    Q[3, 3] = 0.01

    R00 = 4.0
    R11 = 4.0

    for i in range(n):
        x0 = x[0] + dt * x[2] + half_dt2 * x[4]
        x1 = x[1] + dt * x[3] + half_dt2 * x[5]
        x2 = x[2] + dt * x[4]
        x3 = x[3] + dt * x[5]

        x[0] = x0
        x[1] = x1
        x[2] = x2
        x[3] = x3
        
        F = numpy.array((
            (1.0, 0.0, dt, 0.0, half_dt2, 0.0),
            (0.0, 1.0, 0.0, dt, 0.0, half_dt2),
            (0.0, 0.0, 1.0, 0.0, dt, 0.0),
            (0.0, 0.0, 0.0, 1.0, 0.0, dt),
            (0.0, 0.0, 0.0, 0.0, 1.0, 0.0),
            (0.0, 0.0, 0.0, 0.0, 0.0, 1.0)
        ))

        P = F @ P @ F.T + Q

        y0 = x_meas[i] - x[0]
        y1 = y_meas[i] - x[1]

        S00 = P[0, 0] + R00
        S01 = P[0, 1]
        S10 = P[1, 0]
        S11 = P[1, 1] + R11

        det = S00 * S11 - S01 * S10

        invS00 =  S11 / det
        invS01 = -S01 / det
        invS10 = -S10 / det
        invS11 =  S00 / det

        K0 = P[:, 0] * invS00 + P[:, 1] * invS10
        K1 = P[:, 0] * invS01 + P[:, 1] * invS11

        x += K0 * y0 + K1 * y1

        for r in range(6):
            for c in range(6):
                P[r, c] = P[r, c] - (K0[r] * P[0, c] + K1[r] * P[1, c])

        xs[i] = x[0]
        ys[i] = x[1]

    return xs, ys

class TelemetryReplayEngine:
    def __init__(self, session, vanish_on_dnf=True, hide_dsq=False):
        self.session = session
        self.vanish_on_dnf = vanish_on_dnf
        self.hide_dsq = hide_dsq
        self.tracks = {}
        self.session_duration = 0
        
        self.dt = 1 / 10

        self.F = numpy.array([
            [1, 0, self.dt, 0, 0.5*self.dt*self.dt, 0],
            [0, 1, 0, self.dt, 0, 0.5*self.dt*self.dt],
            [0, 0, 1, 0, self.dt, 0],
            [0, 0, 0, 1, 0, self.dt],
            [0, 0, 0, 0, 1, 0],
            [0, 0, 0, 0, 0, 1]
        ], dtype=numpy.float64)

        self.H = numpy.array([
            [1, 0, 0, 0, 0, 0],
            [0, 1, 0, 0, 0, 0]
        ], dtype=numpy.float64)

        self.Q = numpy.eye(6, dtype=numpy.float64) * 0.065
        self.Q[2, 2] = 0.01
        self.Q[3, 3] = 0.01

        self.R = numpy.eye(2, dtype=numpy.float64) * 4.0

        self.I6 = numpy.eye(6, dtype=numpy.float64)
        self.I2 = numpy.eye(2, dtype=numpy.float64)

        self._prepare_data()

    def _prepare_data(self):
        results = self.session.results

        self.dns_drivers = set(results[results["Status"].str.contains("Did not start", na=False)]["DriverNumber"].astype(str))
        self.dsq_drivers = set(results[results["Status"].str.contains("Disqualified", na=False)]["DriverNumber"].astype(str))

        for drv in self.session.drivers:
            if drv in self.dns_drivers:
                continue

            laps = self.session.laps.pick_drivers(drv)
            pos_data = laps.get_pos_data()

            if pos_data.empty:
                continue

            pos_data = pos_data.copy()
            pos_data["TimeSec"] = pos_data["Time"].dt.total_seconds()
            pos_data = pos_data.sort_values("TimeSec")

            times = pos_data["TimeSec"].values
            x_vals = pos_data["X"].values
            y_vals = pos_data["Y"].values

            if len(times) < 4:
                continue

            unique_idx = numpy.unique(times, return_index=True)[1]
            unique_idx.sort()

            times = times[unique_idx]
            x_vals = x_vals[unique_idx]
            y_vals = y_vals[unique_idx]

            uniform_times = numpy.arange(times[0], times[-1], self.dt)

            interp_x = numpy.interp(uniform_times, times, x_vals).astype(numpy.float64)
            interp_y = numpy.interp(uniform_times, times, y_vals).astype(numpy.float64)

            x_smo, y_smo = kalman_core(interp_x, interp_y, self.dt)

            self.tracks[drv] = {"t": uniform_times, "x": x_smo, "y": y_smo, "t_start": uniform_times[0], "t_end": uniform_times[-1],}

            if uniform_times[-1] > self.session_duration:
                self.session_duration = uniform_times[-1]

        if self.tracks:
            self.global_start_time = min(track["t_start"] for track in self.tracks.values())

        else:
            self.global_start_time = 0

    def get_state_at(self, t):
        state = {}

        t_adjusted = t + self.global_start_time

        for drv, track in self.tracks.items():
            if drv in self.dsq_drivers and self.hide_dsq:
                continue

            t_start = track["t_start"]
            t_end = track["t_end"]

            if t_adjusted < t_start:
                continue

            if t_adjusted > t_end:
                if self.vanish_on_dnf:
                    continue
                x = track["x"][-1]
                y = track["y"][-1]
            else:
                x = numpy.interp(t_adjusted, track["t"], track["x"])
                y = numpy.interp(t_adjusted, track["t"], track["y"])

            state[drv] = {"x": float(x), "y": float(y), "speed": None}

        return state