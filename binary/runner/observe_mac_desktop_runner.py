import atexit
import json
import time

import requests

from config import Config
from log import Logger
from log.logger import process_log_messages
from memory import LocalMemory
from provider.image.image_ocr import ImageOcrProvider
from provider.video.video_clip import VideoClipProvider
from provider.video.video_record import VideoRecordProvider
from utils.string_utils import replace_unsupported_chars

config = Config()
logger = Logger()
memory = LocalMemory()


class PipelineRunner:

    def __init__(self, task_description: str,
                 use_self_reflection: bool = False,
                 use_task_inference: bool = False):
        self.task_description = task_description
        self.use_self_reflection = use_self_reflection
        self.use_task_inference = use_task_inference

        # Init internal params
        self.video_record = VideoRecordProvider()
        self.video_clip = VideoClipProvider(self.video_record)
        self.set_internal_params()
        self.image_ocr_provider = ImageOcrProvider()

    def set_internal_params(self, *args, **kwargs):
        # Init video provider

        print(">>> set_internal_params")

    def pipeline_shutdown(self):
        self.video_record.finish_capture()
        log = process_log_messages(config.work_dir)
        with open(config.work_dir + '/logs/log.md', 'w') as f:
            log = replace_unsupported_chars(log)
            f.write(log)
        logger.write('>>> Markdown generated.')
        logger.write('>>> Bye.')

    import time  # 导入time模块

    def run(self):
        # 1. Initiate the parameters
        success = False
        init_params = {
            "task_description": self.task_description,
        }
        memory.update_info_history(init_params)

        # 3. Start video recording
        self.video_record.start_capture()

        # 4. Initiate screen shot path and video clip path
        self.video_clip(init=True)

        # 6. Start the pipeline
        step = 0
        while not success:
            try:

                # 1. Information gathering
                self.run_information_gathering()
                # 2. upload ocr result
                self.upload_ocr_result()
                # 3. active chat every 5 steps
                if step % 5 == 0:
                    self.active_chat()
                time.sleep(10)

                step += 1

                if step > config.max_steps:
                    logger.write('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>  达到最大步数, 退出.')
                    break

            except KeyboardInterrupt:
                logger.write('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>  检测到键盘中断 Ctrl+C，退出。.')
                self.pipeline_shutdown()
                break

        self.pipeline_shutdown()

    def run_information_gathering(self):

        # 1. Get the video clip to information gathering
        self.video_clip(init=True)
        logger.write('>>> run video_clip')
        self.image_ocr_provider()
        logger.write('>>> run image_ocr')

    def upload_ocr_result(self):
        ocr_result = memory.get_recent_history("ocr_result")[0]
        logger.write(f'>>> run upload_ocr_result:{ocr_result}')
        headers = {'Content-Type': 'application/json; charset=utf-8'}
        message = {"ocr_result": ocr_result}
        body = json.dumps(message, ensure_ascii=False).encode('utf8')
        response = requests.post('http://localhost:8889/vision/push', data=body, headers=headers)
        if response.status_code == 200:
            logger.write('>>> upload ocr result success')
        else:
            logger.write('>>> upload ocr result failed')

    def active_chat(self):
        ocr_result = memory.get_recent_history("ocr_result")[0]
        message = f"""
          你正在陪yamaki一起玩《你画我猜》游戏，下面是你看到yamaki的游戏内容，请按照你的人设，使用傲娇的口吻进行简短回复不超过15个字
          ```
          {ocr_result}
          ```
        """
        headers = {'Content-Type': 'application/json; charset=utf-8'}
        message = {"msg": message}
        print("message:", message)
        body = json.dumps(message, ensure_ascii=False).encode('utf8')
        response = requests.post('http://localhost:8889/game/message', data=body, headers=headers)
        return response.json()


def exit_cleanup(runner):
    logger.write("Exiting pipeline.")
    runner.pipeline_shutdown()


def entry(args):
    task_description = config.task_description
    pipelineRunner = PipelineRunner(task_description=task_description,
                                    use_self_reflection=True,
                                    use_task_inference=True)
    atexit.register(exit_cleanup, pipelineRunner)
    pipelineRunner.run()
