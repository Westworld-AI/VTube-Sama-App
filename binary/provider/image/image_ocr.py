from http import HTTPStatus

import dashscope

from config import Config
from log import Logger
from memory import LocalMemory

config = Config()
logger = Logger()
memory = LocalMemory()

PROMPT = """
假设你是一个在PC上集成了“你画我猜”的有用的AI助手，可以处理游戏中的各种任务。您的高级功能使您能够处理和解释游戏截图和其他相关信息。
您应该只以下面描述的格式回复，不要输出评论或其他信息。
```
描述: 请以分析和描述截图图像，然后提供整体图像描述，
可能物品或者生物: 当前画作中的物品和生物，如“桌子上有一只猫”，否则只输出“null”。
对话框: 如果截图中有一些对话框，提取对话文本，如“店主:你想买什么?”，否则只输出“null”。
游戏人物意图：描述当前人物的意图
其他:不属于上述类别的其他信息。如果它们都不适用，则只输出“null”。
```
"""


class ImageOcrProvider:

    def __call__(self,
                 *args,
                 init=False,
                 **kwargs):

        screen_shot_paths = memory.get_recent_history("screen_shot_path")
        image_file_path = "file://" + screen_shot_paths[0]
        print("image_file_path", image_file_path)

        dashscope.api_key = config.dashscope_api_key
        messages = [
            {
                "role": "user",
                "content": [
                    {"image": image_file_path},
                    {"text": PROMPT}
                ]
            }
        ]
        response = dashscope.MultiModalConversation.call(model='qwen-vl-plus',
                                                         messages=messages)

        if response.status_code == HTTPStatus.OK:  # 如果调用成功，则打印response
            ocr_result = response.output.choices[0].message.content[0]['text']
            res_params = {
                "ocr_result": ocr_result,
            }
            memory.update_info_history(res_params)
        else:  # 如果调用失败
            print("MultiModalConversation call failed", response.code)  # 错误码
            print(response.message)  # 错误信息
