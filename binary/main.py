# main.py
from uvicorn import run

from config import Config
from runner import observe_mac_desktop_runner

config = Config()

if __name__ == "__main__":
    config.load_env_config()
    config.set_fixed_seed()
    observe_mac_desktop_runner.entry(None)
    run("main:app", host="127.0.0.1", port=8881, reload=True)
