import matplotlib.pyplot
import matplotlib.animation
import matplotlib.colors
import fastf1.plotting
import time
import numpy

class TelemetryAnimator:
    def __init__(self, engine, session, speed=1.0, dsq_mode="show"):
        self.engine = engine
        self.session = session
        self.interval = 1000 / 60
        self.speed = speed
        self.current_time = 0
        self.fig, self.ax = matplotlib.pyplot.subplots()
        self.scatter = None
        self.driver_list = []
        self.colors = []
        self.normal_colors = []
        self.faded_colors = []
        self.dsq_mode = dsq_mode
        self.dsq_drivers = engine.dsq_drivers
        self.start_wall_time = None
        self._setup_plot()

    def _setup_plot(self):
        self.ax.set_aspect("equal", adjustable="box")
        self.fig.patch.set_facecolor("black")
        self.ax.set_facecolor("black")
        self.ax.axis("off")

        try:
            ref_lap = self.session.laps.pick_fastest()
            pos_data = ref_lap.get_pos_data()
            self.ax.plot(
                pos_data["X"],
                pos_data["Y"],
                color="white",
                linewidth=1,
                alpha=0.3
            )
            
        except Exception:
            pass

        all_x = []
        all_y = []

        for track in self.engine.tracks.values():
            all_x.extend(track["x"]) 
            all_y.extend(track["y"])  

        if all_x and all_y:
            min_x, max_x = min(all_x), max(all_x)
            min_y, max_y = min(all_y), max(all_y)

            width = max_x - min_x
            height = max_y - min_y

            padding_x = width * 0.05
            padding_y = height * 0.05

            self.ax.set_xlim(min_x - padding_x, max_x + padding_x)
            self.ax.set_ylim(min_y - padding_y, max_y + padding_y)

        self.driver_list = list(self.engine.tracks.keys())
        self.driver_index = {drv: i for i, drv in enumerate(self.driver_list)}

        for drv in self.driver_list:
            try:
                team = self.session.laps.pick_drivers(drv)["Team"].iloc[0]
                color = fastf1.plotting.get_team_color(team, self.session)
                self.colors.append(color)
            except Exception:
                self.colors.append("white")

        for color in self.colors:
                rgba = matplotlib.colors.to_rgba(color)
                self.normal_colors.append(rgba)
                self.faded_colors.append((rgba[0], rgba[1], rgba[2], 0.25))

        xs = [0] * len(self.driver_list)
        ys = [0] * len(self.driver_list)

        self.scatter = self.ax.scatter(xs, ys, s=60, c=self.colors)

    def _update(self, _):
        dt = 1/60
        self.current_time += dt * self.speed

        if self.current_time > self.engine.session_duration:
            self.current_time = self.engine.session_duration

        state = self.engine.get_state_at(self.current_time)

        xs = []
        ys = []
        colors = []

        for drv in self.driver_list:

            if drv in state:
                x = state[drv]["x"]
                y = state[drv]["y"]

                xs.append(x)
                ys.append(y)

                if self.dsq_mode == "faded" and drv in self.dsq_drivers:
                    colors.append(self.faded_colors[self.driver_index[drv]])
                else:
                    colors.append(self.normal_colors[self.driver_index[drv]])

            else:
                xs.append(float("nan"))
                ys.append(float("nan"))
                colors.append((0, 0, 0, 0))

        offsets = numpy.empty((len(xs), 2))
        offsets[:, 0] = xs
        offsets[:, 1] = ys
        self.scatter.set_offsets(offsets)
        self.scatter.set_color(colors)

        return (self.scatter,)
    
    def run(self):

        self.start_wall_time = time.time()
        self.anim = matplotlib.animation.FuncAnimation(self.fig, self._update, interval=self.interval, blit=True, cache_frame_data=False)

        matplotlib.pyplot.show()