import numpy
import numba
import pandas
import json
import struct

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

    F = numpy.array((
        (1.0, 0.0, dt, 0.0, half_dt2, 0.0),
        (0.0, 1.0, 0.0, dt, 0.0, half_dt2),
        (0.0, 0.0, 1.0, 0.0, dt, 0.0),
        (0.0, 0.0, 0.0, 1.0, 0.0, dt),
        (0.0, 0.0, 0.0, 0.0, 1.0, 0.0),
        (0.0, 0.0, 0.0, 0.0, 0.0, 1.0)
    ))

    F_T = F.T

    Q = numpy.eye(6) * 0.065
    Q[2, 2] = 0.01
    Q[3, 3] = 0.01

    R00 = 4.0
    R11 = 4.0

    I = numpy.eye(6)

    temp = numpy.zeros((6, 6))
    KH = numpy.zeros((6, 6))
    I_minus_KH = numpy.zeros((6, 6))
    outer_buf = numpy.zeros((6, 6))

    for i in range(n):

        x0 = x[0] + dt * x[2] + half_dt2 * x[4]
        x1 = x[1] + dt * x[3] + half_dt2 * x[5]
        x2 = x[2] + dt * x[4]
        x3 = x[3] + dt * x[5]

        x[0] = x0
        x[1] = x1
        x[2] = x2
        x[3] = x3

        temp[:] = F @ P
        P[:] = temp @ F_T
        P += Q

        y0 = x_meas[i] - x[0]
        y1 = y_meas[i] - x[1]

        S00 = P[0, 0] + R00
        S01 = P[0, 1]
        S10 = P[1, 0]
        S11 = P[1, 1] + R11

        det = S00 * S11 - S01 * S10
        if det < 1e-12:
            det = 1e-12

        invS00 = S11 / det
        invS01 = -S01 / det
        invS10 = -S10 / det
        invS11 = S00 / det

        K0 = P[:, 0] * invS00 + P[:, 1] * invS10
        K1 = P[:, 0] * invS01 + P[:, 1] * invS11

        x += K0 * y0 + K1 * y1

        KH[:] = 0.0
        KH[:, 0] = K0
        KH[:, 1] = K1

        I_minus_KH[:] = I - KH
        temp[:] = I_minus_KH @ P
        P[:] = temp @ I_minus_KH.T

        for r in range(6):
            for c in range(6):
                outer_buf[r, c] = K0[r] * K0[c] * R00 + K1[r] * K1[c] * R11

        P += outer_buf

        xs[i] = x[0]
        ys[i] = x[1]

    return xs, ys

@numba.njit(cache=True)
def generate_smooth_track(track_x, track_y, steps=20):

    n = len(track_x)
    out_x = numpy.zeros(n * steps)
    out_y = numpy.zeros(n * steps)

    idx = 0

    for i in range(n):

        p0_x = track_x[(i - 1) % n]
        p0_y = track_y[(i - 1) % n]

        p1_x = track_x[i]
        p1_y = track_y[i]

        p2_x = track_x[(i + 1) % n]
        p2_y = track_y[(i + 1) % n]

        p3_x = track_x[(i + 2) % n]
        p3_y = track_y[(i + 2) % n]

        for t_step in range(steps):

            t = t_step / steps
            t2 = t * t
            t3 = t2 * t

            out_x[idx] = 0.5 * (
                (2 * p1_x)
                + (-p0_x + p2_x) * t
                + (2 * p0_x - 5 * p1_x + 4 * p2_x - p3_x) * t2
                + (-p0_x + 3 * p1_x - 3 * p2_x + p3_x) * t3
            )

            out_y[idx] = 0.5 * (
                (2 * p1_y)
                + (-p0_y + p2_y) * t
                + (2 * p0_y - 5 * p1_y + 4 * p2_y - p3_y) * t2
                + (-p0_y + 3 * p1_y - 3 * p2_y + p3_y) * t3
            )

            idx += 1

    return out_x, out_y

@numba.njit(cache=True)
def snap_to_track(x_meas, y_meas, track_x, track_y):

    n = len(x_meas)
    m = len(track_x)

    snapped_x = numpy.zeros(n)
    snapped_y = numpy.zeros(n)

    last_best_j = 0

    for i in range(n):

        px = x_meas[i]
        py = y_meas[i]

        min_dist_sq = 1e99
        best_x = px
        best_y = py
        best_j = last_best_j

        do_global = (i == 0)

        if not do_global:

            for step in range(-5, 40):

                j = (last_best_j + step) % (m - 1)

                x1 = track_x[j]
                y1 = track_y[j]

                x2 = track_x[j + 1]
                y2 = track_y[j + 1]

                dx = x2 - x1
                dy = y2 - y1

                length_sq = dx * dx + dy * dy

                if length_sq == 0.0:
                    t = 0.0
                else:
                    t = ((px - x1) * dx + (py - y1) * dy) / length_sq
                    if t < 0:
                        t = 0
                    if t > 1:
                        t = 1

                proj_x = x1 + t * dx
                proj_y = y1 + t * dy

                dist_sq = (px - proj_x) ** 2 + (py - proj_y) ** 2

                if dist_sq < min_dist_sq:
                    min_dist_sq = dist_sq
                    best_x = proj_x
                    best_y = proj_y
                    best_j = j

            if min_dist_sq > 10000.0:
                do_global = True

        if do_global:

            min_dist_sq = 1e99

            for j in range(m - 1):

                x1 = track_x[j]
                y1 = track_y[j]

                x2 = track_x[j + 1]
                y2 = track_y[j + 1]

                dx = x2 - x1
                dy = y2 - y1

                length_sq = dx * dx + dy * dy

                if length_sq == 0.0:
                    t = 0.0
                else:
                    t = ((px - x1) * dx + (py - y1) * dy) / length_sq
                    if t < 0:
                        t = 0
                    if t > 1:
                        t = 1

                proj_x = x1 + t * dx
                proj_y = y1 + t * dy

                dist_sq = (px - proj_x) ** 2 + (py - proj_y) ** 2

                if dist_sq < min_dist_sq:
                    min_dist_sq = dist_sq
                    best_x = proj_x
                    best_y = proj_y
                    best_j = j

        snapped_x[i] = best_x
        snapped_y[i] = best_y
        last_best_j = best_j

    return snapped_x, snapped_y

def extract_pit_windows(session,drv):
    laps=session.laps.pick_drivers(drv)
    pit_windows=[]
    race_zero=session.session_start_time
    pending_pit_ins=[]

    for _, lap in laps.iterlaps():
        lap_num = int(lap["LapNumber"])
        pit_in = lap["PitInTime"]
        pit_out = lap["PitOutTime"]

        if pandas.notna(pit_out):
            end = (pit_out - race_zero).total_seconds()

            if lap_num == 1 and not pending_pit_ins:
                pit_windows.append((0.0, max(0.0, end)))
            else:
                matched_idx=None

                for idx in range(len(pending_pit_ins)-1,-1,-1):
                    start = pending_pit_ins[idx]
                    duration = end - start
                    if 0.0 <= duration:
                        matched_idx=idx
                        break

                if matched_idx is not None:
                    start = pending_pit_ins[matched_idx]
                    pit_windows.append((start, end))
                    pending_pit_ins = pending_pit_ins[matched_idx+1:]

        if pandas.notna(pit_in):
            start = (pit_in - race_zero).total_seconds()
            pending_pit_ins.append(start)

    pit_windows.sort()
    return pit_windows

class TelemetryReplayEngine:

    def __init__(self,session,vanish_on_dnf=True,hide_dsq=False):
        self.session=session
        self.vanish_on_dnf=vanish_on_dnf
        self.hide_dsq=hide_dsq
        self.tracks={}
        self.session_duration=0
        self.dt=1/10
        self._prepare_data()

    def _prepare_data(self):
        results=self.session.results

        self.dns_drivers=set(
            results[results["Status"].str.contains("Did not start",na=False)]["DriverNumber"].astype(str)
        )

        self.dsq_drivers=set(
            results[results["Status"].str.contains("Disqualified",na=False)]["DriverNumber"].astype(str)
        )

        raw_tracks={}
        race_start=float("inf")

        for drv in self.session.drivers:

            if drv in self.dns_drivers:
                continue

            pit_windows=extract_pit_windows(self.session,drv)

            laps=self.session.laps.pick_drivers(drv)
            pos_data=laps.get_pos_data()

            if pos_data.empty:
                continue

            times_raw=pos_data["Time"].dt.total_seconds().values
            x_raw=pos_data["X"].values
            y_raw=pos_data["Y"].values

            if len(times_raw)<4:
                continue

            sort_idx=numpy.argsort(times_raw)

            times_raw=times_raw[sort_idx]
            x_raw=x_raw[sort_idx]
            y_raw=y_raw[sort_idx]

            keep_mask=numpy.concatenate(([True],numpy.diff(times_raw)>0))

            times=times_raw[keep_mask]
            x_vals=x_raw[keep_mask]
            y_vals=y_raw[keep_mask]

            uniform_times=numpy.arange(times[0],times[-1],self.dt)

            if uniform_times[0]<race_start:
                race_start=uniform_times[0]

            interp_x=numpy.interp(uniform_times,times,x_vals).astype(numpy.float64)
            interp_y=numpy.interp(uniform_times,times,y_vals).astype(numpy.float64)

            x_smo,y_smo=kalman_core(interp_x,interp_y,self.dt)

            raw_tracks[drv]={
                "t":uniform_times,
                "x":x_smo,
                "y":y_smo,
                "pit_windows":pit_windows
            }

            if uniform_times[-1]>self.session_duration:
                self.session_duration=uniform_times[-1]

        self.race_start_time=race_start

        for drv,track in raw_tracks.items():
            t_shifted=track["t"]-self.race_start_time

            shifted_pits=[]
            for start,end in track["pit_windows"]:
                start_rel=max(0.0,start-self.race_start_time)
                end_rel=max(0.0,end-self.race_start_time)
                shifted_pits.append((start_rel,end_rel))

            self.tracks[drv]={
                "t":t_shifted,
                "x":track["x"],
                "y":track["y"],
                "t_start":t_shifted[0],
                "t_end":t_shifted[-1],
                "pit_windows":shifted_pits
            }


    def export_binary_replay(self,filepath):
        
        try:
            ref_pos=self.session.laps.pick_fastest().get_pos_data()
            track_x=ref_pos["X"].to_numpy().astype(numpy.float64)
            track_y=ref_pos["Y"].to_numpy().astype(numpy.float64)
        except:
            track_x=numpy.array([])
            track_y=numpy.array([])

        circuit_info=self.session.get_circuit_info()
        rotation=float(circuit_info.rotation) if circuit_info else 0.0

        if len(track_x)>1:
            smooth_tx,smooth_ty=generate_smooth_track(track_x[::3],track_y[::3],steps=20)
        else:
            smooth_tx=track_x
            smooth_ty=track_y

        metadata={
            "duration":float(self.session_duration-self.race_start_time),
            "rotation":rotation,
            "track_len":len(track_x),
            "drivers":{},
            "driver_order":list(self.tracks.keys())
        }

        binary_arrays=[]
        binary_arrays.append(track_x.astype(numpy.float32).tobytes())
        binary_arrays.append(track_y.astype(numpy.float32).tobytes())

        results=self.session.results.set_index("DriverNumber")

        for drv,track in self.tracks.items():

            if drv in results.index:
                row=results.loc[drv]
                team_name=row.get("TeamName")
                try:
                    import fastf1.plotting
                    team_color=fastf1.plotting.get_team_color(team_name,self.session)
                except:
                    team_color="#FFFFFF"
            else:
                team_name=None
                team_color="#FFFFFF"
                row={}

            if len(smooth_tx)>1:
                exp_x,exp_y=snap_to_track(track["x"],track["y"],smooth_tx,smooth_ty)
            else:
                exp_x=track["x"]
                exp_y=track["y"]

            metadata["drivers"][drv]={
                "meta":{
                    "teamName":team_name,
                    "teamColor":team_color,
                    "status":row.get("Status")
                },
                "duration":float(self.session_duration-self.race_start_time),
                "length":len(track["t"]),
                "pit_windows":track["pit_windows"]
            }

            binary_arrays.append(track["t"].astype(numpy.float32).tobytes())
            binary_arrays.append(exp_x.astype(numpy.float32).tobytes())
            binary_arrays.append(exp_y.astype(numpy.float32).tobytes())
            binary_arrays.append(track["x"].astype(numpy.float32).tobytes())
            binary_arrays.append(track["y"].astype(numpy.float32).tobytes())

        json_bytes=json.dumps(metadata).encode("utf-8")

        remainder=len(json_bytes)%4
        if remainder!=0:
            json_bytes+=b" "*(4-remainder)

        header_len=len(json_bytes)

        with open(filepath,"wb") as f:
            f.write(struct.pack("<I",header_len))
            f.write(json_bytes)
            payload = b"".join(binary_arrays)
            f.write(payload)
