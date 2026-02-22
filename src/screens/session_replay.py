def run_replay(fastf1, engine, animator, season, round_num, session_name, dnf_mode="vanish", dsq_mode="show", speed=1.0):

    if round_num is None:
        raise ValueError("--round is required for replay")

    if session_name is None:
        raise ValueError("--session is required for replay")

    fastf1.plotting.setup_mpl()

    session = fastf1.get_session(season, round_num, session_name)
    session.load(laps=True, telemetry=True)

    engine = engine(session, vanish_on_dnf=(dnf_mode == "vanish"), hide_dsq=(dsq_mode == "hide"))
    animator = animator(engine, session, speed=speed, dsq_mode=dsq_mode)

    animator.run()